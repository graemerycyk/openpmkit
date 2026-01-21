import { Resend } from 'resend';
import { z } from 'zod';
import type { JobType, ArtifactType } from '../types';
import { formatCEF, telemetryToSIEM, type TelemetryEvent } from '../telemetry';

// ============================================================================
// Configuration
// ============================================================================

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'PMKit <briefs@getpmkit.com>';
const APP_URL = process.env.NEXTAUTH_URL || 'https://getpmkit.com';

// ============================================================================
// Types
// ============================================================================

export const AgentEmailTypeSchema = z.enum([
  'daily_brief',
  'meeting_prep',
  'sprint_review',
  'feature_intelligence',
  'competitor_research',
  'roadmap_alignment',
  'prd_draft',
  'release_notes',
  'deck_content',
  'prototype_generation',
]);
export type AgentEmailType = z.infer<typeof AgentEmailTypeSchema>;

export interface EmailAttachment {
  filename: string;
  content: string; // Base64 encoded or plain text
  contentType?: string;
}

export interface AgentJobCompletionEmailParams {
  to: string;
  userName: string;
  agentType: AgentEmailType;
  jobId: string;
  artifactTitle: string;
  artifactContent: string;
  stats: Record<string, unknown>;
  siemEvents?: TelemetryEvent[];
  includeAttachments?: boolean;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ============================================================================
// Email Service
// ============================================================================

class EmailService {
  private resend: Resend | null = null;

  constructor() {
    if (RESEND_API_KEY) {
      this.resend = new Resend(RESEND_API_KEY);
    }
  }

  /**
   * Check if email service is configured
   */
  isConfigured(): boolean {
    return this.resend !== null;
  }

  /**
   * Send an agent job completion email
   */
  async sendAgentJobCompletion(params: AgentJobCompletionEmailParams): Promise<EmailResult> {
    if (!this.resend) {
      console.warn('[EmailService] Resend not configured - RESEND_API_KEY missing');
      return { success: false, error: 'Email service not configured' };
    }

    const {
      to,
      userName,
      agentType,
      jobId,
      artifactTitle,
      artifactContent,
      stats,
      siemEvents,
      includeAttachments = true,
    } = params;

    try {
      const subject = getEmailSubject(agentType, artifactTitle);
      const html = generateEmailHtml({
        userName,
        agentType,
        jobId,
        artifactTitle,
        artifactContent,
        stats,
      });

      const attachments: EmailAttachment[] = [];

      if (includeAttachments) {
        // Add markdown attachment
        attachments.push({
          filename: `${sanitizeFilename(artifactTitle)}.md`,
          content: Buffer.from(artifactContent).toString('base64'),
          contentType: 'text/markdown',
        });

        // Add SIEM export if events provided
        if (siemEvents && siemEvents.length > 0) {
          const siemJson = generateSiemJsonExport(siemEvents);
          attachments.push({
            filename: `${sanitizeFilename(artifactTitle)}-siem.json`,
            content: Buffer.from(siemJson).toString('base64'),
            contentType: 'application/json',
          });

          const siemCef = generateSiemCefExport(siemEvents);
          attachments.push({
            filename: `${sanitizeFilename(artifactTitle)}-siem.cef`,
            content: Buffer.from(siemCef).toString('base64'),
            contentType: 'text/plain',
          });
        }
      }

      const response = await this.resend.emails.send({
        from: EMAIL_FROM,
        to: [to],
        subject,
        html,
        attachments: attachments.map((a) => ({
          filename: a.filename,
          content: a.content,
        })),
      });

      if (response.error) {
        console.error('[EmailService] Failed to send email:', response.error);
        return { success: false, error: response.error.message };
      }

      console.log(`[EmailService] Sent ${agentType} email to ${to}, messageId: ${response.data?.id}`);
      return { success: true, messageId: response.data?.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[EmailService] Error sending email:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send a simple text email (for contact form, etc.)
   */
  async sendSimpleEmail(params: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }): Promise<EmailResult> {
    if (!this.resend) {
      console.warn('[EmailService] Resend not configured - RESEND_API_KEY missing');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const response = await this.resend.emails.send({
        from: EMAIL_FROM,
        to: [params.to],
        subject: params.subject,
        text: params.text,
        html: params.html,
      });

      if (response.error) {
        console.error('[EmailService] Failed to send email:', response.error);
        return { success: false, error: response.error.message };
      }

      return { success: true, messageId: response.data?.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[EmailService] Error sending email:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }
}

// Singleton instance
let emailServiceInstance: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
}

// ============================================================================
// Email Templates
// ============================================================================

const AGENT_DISPLAY_NAMES: Record<AgentEmailType, string> = {
  daily_brief: 'Daily Brief',
  meeting_prep: 'Meeting Prep',
  sprint_review: 'Sprint Review',
  feature_intelligence: 'Feature Intelligence',
  competitor_research: 'Competitor Research',
  roadmap_alignment: 'Roadmap Alignment',
  prd_draft: 'PRD Draft',
  release_notes: 'Release Notes',
  deck_content: 'Deck Content',
  prototype_generation: 'Prototype',
};

const AGENT_ICONS: Record<AgentEmailType, string> = {
  daily_brief: '\u2600\uFE0F', // sun
  meeting_prep: '\uD83D\uDCC5', // calendar
  sprint_review: '\uD83C\uDFC3', // runner
  feature_intelligence: '\uD83D\uDCA1', // lightbulb
  competitor_research: '\uD83D\uDD0D', // magnifying glass
  roadmap_alignment: '\uD83D\uDDFA\uFE0F', // map
  prd_draft: '\uD83D\uDCDD', // memo
  release_notes: '\uD83D\uDE80', // rocket
  deck_content: '\uD83D\uDCCA', // chart
  prototype_generation: '\uD83D\uDDA5\uFE0F', // desktop
};

function getEmailSubject(agentType: AgentEmailType, artifactTitle: string): string {
  const icon = AGENT_ICONS[agentType];
  const displayName = AGENT_DISPLAY_NAMES[agentType];
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return `${icon} Your ${displayName} - ${date}`;
}

interface EmailTemplateParams {
  userName: string;
  agentType: AgentEmailType;
  jobId: string;
  artifactTitle: string;
  artifactContent: string;
  stats: Record<string, unknown>;
}

function generateEmailHtml(params: EmailTemplateParams): string {
  const { userName, agentType, jobId, artifactTitle, artifactContent, stats } = params;
  const displayName = AGENT_DISPLAY_NAMES[agentType];
  const icon = AGENT_ICONS[agentType];

  // Convert markdown to basic HTML (simple conversion)
  const htmlContent = markdownToHtml(artifactContent);

  // Generate stats summary
  const statsSummary = generateStatsSummary(stats);

  const viewUrl = `${APP_URL}/agents/${agentType.replace(/_/g, '-')}/${jobId}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${artifactTitle}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #1a1a2e;
      max-width: 700px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f7;
    }
    .email-container {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
    .header {
      text-align: center;
      padding-bottom: 24px;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 24px;
    }
    .header-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }
    .header-title {
      font-family: 'Space Grotesk', system-ui, sans-serif;
      font-size: 24px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 0;
    }
    .header-subtitle {
      color: #6b7280;
      font-size: 14px;
      margin-top: 8px;
    }
    .greeting {
      font-size: 16px;
      color: #374151;
      margin-bottom: 20px;
    }
    .stats-bar {
      display: flex;
      gap: 16px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .stat-item {
      font-size: 13px;
      color: #6b7280;
    }
    .stat-value {
      font-weight: 600;
      color: #1a1a2e;
    }
    .content {
      font-size: 15px;
      color: #374151;
    }
    .content h1, .content h2, .content h3 {
      font-family: 'Space Grotesk', system-ui, sans-serif;
      color: #1a1a2e;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    .content h1 { font-size: 22px; }
    .content h2 { font-size: 18px; }
    .content h3 { font-size: 16px; }
    .content p { margin: 12px 0; }
    .content ul, .content ol {
      padding-left: 20px;
      margin: 12px 0;
    }
    .content li { margin: 6px 0; }
    .content blockquote {
      border-left: 3px solid #3b82f6;
      padding-left: 16px;
      margin: 16px 0;
      color: #6b7280;
      font-style: italic;
    }
    .content code {
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Fira Code', monospace;
      font-size: 13px;
    }
    .content pre {
      background: #1a1a2e;
      color: #e5e7eb;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
    }
    .content pre code {
      background: transparent;
      padding: 0;
      color: inherit;
    }
    .citation {
      font-size: 11px;
      color: #3b82f6;
      vertical-align: super;
    }
    .cta-section {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
    }
    .cta-button {
      display: inline-block;
      background: #3b82f6;
      color: white !important;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 500;
      font-size: 14px;
    }
    .cta-button:hover {
      background: #2563eb;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
    }
    .footer a {
      color: #6b7280;
      text-decoration: none;
    }
    .attachment-note {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 13px;
      color: #0369a1;
      margin-top: 24px;
    }
    .attachment-note strong {
      display: block;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="header-icon">${icon}</div>
      <h1 class="header-title">${artifactTitle}</h1>
      <div class="header-subtitle">Generated ${new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })}</div>
    </div>

    <p class="greeting">Hi ${userName},</p>
    <p class="greeting">Your ${displayName} is ready. Here's what we found:</p>

    ${statsSummary ? `<div class="stats-bar">${statsSummary}</div>` : ''}

    <div class="content">
      ${htmlContent}
    </div>

    <div class="cta-section">
      <a href="${viewUrl}" class="cta-button">View Full Report in Dashboard</a>
    </div>

    <div class="attachment-note">
      <strong>Attachments included:</strong>
      Full markdown report (.md) and SIEM audit logs (.json, .cef) are attached to this email for your records.
    </div>

    <div class="footer">
      <p>
        <a href="${APP_URL}/settings/notifications">Manage email preferences</a> &bull;
        <a href="${APP_URL}/agents/${agentType.replace(/_/g, '-')}">Configure this agent</a>
      </p>
      <p style="margin-top: 12px;">
        &copy; ${new Date().getFullYear()} PMKit &bull; AI-Powered Product Management
      </p>
    </div>
  </div>
</body>
</html>
`;
}

function generateStatsSummary(stats: Record<string, unknown>): string {
  const items: string[] = [];

  // Common stats across agents
  if (typeof stats.messagesProcessed === 'number') {
    items.push(`<span class="stat-item"><span class="stat-value">${stats.messagesProcessed}</span> messages</span>`);
  }
  if (typeof stats.emailsProcessed === 'number') {
    items.push(`<span class="stat-item"><span class="stat-value">${stats.emailsProcessed}</span> emails</span>`);
  }
  if (typeof stats.channelsProcessed === 'number') {
    items.push(`<span class="stat-item"><span class="stat-value">${stats.channelsProcessed}</span> channels</span>`);
  }
  if (typeof stats.meetingsFound === 'number') {
    items.push(`<span class="stat-item"><span class="stat-value">${stats.meetingsFound}</span> meetings</span>`);
  }
  if (typeof stats.issuesProcessed === 'number') {
    items.push(`<span class="stat-item"><span class="stat-value">${stats.issuesProcessed}</span> issues</span>`);
  }
  if (typeof stats.ticketsProcessed === 'number') {
    items.push(`<span class="stat-item"><span class="stat-value">${stats.ticketsProcessed}</span> tickets</span>`);
  }
  if (typeof stats.sourcesUsed === 'number') {
    items.push(`<span class="stat-item"><span class="stat-value">${stats.sourcesUsed}</span> sources</span>`);
  }
  if (typeof stats.citationsGenerated === 'number') {
    items.push(`<span class="stat-item"><span class="stat-value">${stats.citationsGenerated}</span> citations</span>`);
  }

  return items.join('');
}

/**
 * Simple markdown to HTML conversion
 * (For more complex needs, use a proper library like marked)
 */
function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Escape HTML
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

  // Lists (unordered)
  html = html.replace(/^[-*] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Lists (ordered)
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Citations (numbered references like [1], [2])
  html = html.replace(/\[(\d+)\]/g, '<span class="citation">[$1]</span>');

  // Paragraphs (double newlines)
  html = html.replace(/\n\n/g, '</p><p>');
  html = `<p>${html}</p>`;

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p>(<h[123]>)/g, '$1');
  html = html.replace(/(<\/h[123]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<blockquote>)/g, '$1');
  html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)<\/p>/g, '$1');

  return html;
}

// ============================================================================
// SIEM Export Helpers
// ============================================================================

/**
 * Generate JSON export of SIEM events
 */
export function generateSiemJsonExport(events: TelemetryEvent[]): string {
  const siemEvents = events.map((event) => telemetryToSIEM(event));
  return JSON.stringify(
    {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      source: 'pmkit',
      eventCount: siemEvents.length,
      events: siemEvents,
    },
    null,
    2
  );
}

/**
 * Generate CEF (Common Event Format) export of SIEM events
 */
export function generateSiemCefExport(events: TelemetryEvent[]): string {
  const siemEvents = events.map((event) => telemetryToSIEM(event));
  const cefLines = siemEvents.map((event) => formatCEF(event));
  return cefLines.join('\n');
}

/**
 * Create a basic telemetry event for job completion (for SIEM export)
 */
export function createJobCompletionTelemetryEvent(params: {
  jobId: string;
  jobType: string;
  tenantId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  stats: Record<string, unknown>;
}): TelemetryEvent {
  const { jobId, jobType, tenantId, userId, startTime, endTime, stats } = params;

  return {
    id: `tel-${jobId}`,
    runId: jobId,
    eventType: 'job.complete',
    tenantId,
    userId,
    jobType,
    startTime,
    endTime,
    latencyMs: endTime.getTime() - startTime.getTime(),
    createdAt: new Date(),
    metadata: { stats },
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

// ============================================================================
// Exports
// ============================================================================

export { EmailService };
