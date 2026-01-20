import type { DailyBriefConfig } from '../../types';
import type { AuditLogger } from '../../audit';
import type { ConnectorSourceType, FetchedItem } from '../../fetchers/types';
import {
  buildMultiSourceContext,
  type ConnectorCredentialsMap,
  type FetcherConfig,
} from '../shared';
import { CitationTracker } from '../../citations/citation-tracker';
import { SlackFormatter } from '../../citations/formatters/slack-formatter';
import { GmailFormatter } from '../../citations/formatters/gmail-formatter';
import { CalendarFormatter } from '../../citations/formatters/calendar-formatter';

// ============================================================================
// Context Types
// ============================================================================

export interface DailyBriefContext {
  tenantId: string;
  userId: string;
  jobId: string;
  config: DailyBriefConfig;
  credentials: ConnectorCredentialsMap;
  auditLogger?: AuditLogger;
}

export interface DailyBriefResult {
  content: string;
  sources: Array<{
    tenantId: string;
    type: ConnectorSourceType;
    externalId: string;
    title: string;
    url: string | null;
    content: string;
    metadata: Record<string, unknown>;
    fetchedAt: Date;
  }>;
  stats: {
    channelsProcessed: number;
    messagesProcessed: number;
    emailsProcessed: number;
    eventsProcessed: number;
    driveFilesProcessed: number;
    jiraIssuesProcessed: number;
    confluencePagesProcessed: number;
    zendeskTicketsProcessed: number;
    tokensUsed?: number;
    latencyMs: number;
  };
}

export interface OrchestratorCallbacks {
  onProgress?: (step: string, details?: string) => void;
  onToolCall?: (toolName: string, input: Record<string, unknown>) => void;
  onToolComplete?: (toolName: string, durationMs: number, output?: unknown) => void;
  onLLMCall?: (model: string, promptTokens: number) => void;
  onLLMComplete?: (model: string, outputTokens: number, durationMs: number) => void;
}

// ============================================================================
// LLM Service Interface
// ============================================================================

interface LLMService {
  complete: (params: {
    tenantId: string;
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    maxTokens?: number;
    temperature?: number;
  }) => Promise<{
    content: string;
    model: string;
    usage: { promptTokens: number; completionTokens: number };
    latencyMs: number;
  }>;
}

// ============================================================================
// Daily Brief Orchestrator
// ============================================================================

/**
 * Orchestrator for the Daily Brief agent
 *
 * Execution flow:
 * 1. Build multi-source context from all available connectors
 * 2. Set up citation tracker with formatters for each source type
 * 3. Register all fetched items as citable sources
 * 4. Build formatted prompt context
 * 5. Call LLM with daily_brief prompt template
 * 6. Parse and format output
 * 7. Return structured result with citations
 */
export async function executeDailyBrief(
  context: DailyBriefContext,
  llmService: LLMService,
  callbacks?: OrchestratorCallbacks
): Promise<DailyBriefResult> {
  const startTime = Date.now();
  const { config, credentials, tenantId, jobId, auditLogger } = context;

  try {
    callbacks?.onProgress?.('Starting Daily Brief generation');

    // Audit: Job started
    await auditLogger?.logJobStarted(tenantId, jobId);

    // Build fetcher config from DailyBriefConfig
    const fetcherConfig: FetcherConfig = {};

    if (config.includeSlack && (config.slackChannels?.length > 0 || config.includeSlackMentions)) {
      fetcherConfig.slack = {
        channelIds: config.slackChannels || [],
        includeMentions: config.includeSlackMentions,
      };
    }

    if (config.includeGmail) {
      fetcherConfig.gmail = {
        labels: ['INBOX', 'IMPORTANT'],
        unreadOnly: false,
      };
    }

    if (config.includeGoogleCalendar) {
      fetcherConfig.calendar = {
        calendarIds: ['primary'],
        daysAhead: 1,
        includePast: false,
      };
    }

    if (config.includeGoogleDrive) {
      fetcherConfig.drive = {
        starredOnly: false,
        sharedOnly: false,
      };
    }

    if (config.includeJira) {
      fetcherConfig.jira = {
        assignedToMe: true,
        recentlyUpdated: true,
      };
    }

    if (config.includeConfluence) {
      fetcherConfig.confluence = {
        recentlyEdited: true,
      };
    }

    if (config.includeZendesk) {
      fetcherConfig.zendesk = {
        status: ['open', 'pending', 'new'],
        assignedToMe: true,
        recentlyUpdated: true,
      };
    }

    // Fetch from all available connectors
    callbacks?.onProgress?.('Fetching data from connected sources...');
    const multiSource = await buildMultiSourceContext(credentials, fetcherConfig, {
      sinceHoursAgo: config.dataTimeframeHours,
      onProgress: (msg) => callbacks?.onProgress?.(msg),
    });

    callbacks?.onProgress?.(
      `Fetched ${multiSource.stats.totalItems} items from ${multiSource.availableConnectors.join(', ')}`
    );

    if (multiSource.items.length === 0) {
      return {
        content: '# Daily Brief\n\nNo new activity to report in the configured time window.',
        sources: [],
        stats: {
          channelsProcessed: config.slackChannels?.length || 0,
          messagesProcessed: 0,
          emailsProcessed: 0,
          eventsProcessed: 0,
          driveFilesProcessed: 0,
          jiraIssuesProcessed: 0,
          confluencePagesProcessed: 0,
          zendeskTicketsProcessed: 0,
          latencyMs: Date.now() - startTime,
        },
      };
    }

    // Set up citation tracker with formatters
    callbacks?.onProgress?.('Processing sources and tracking citations');
    const citationTracker = new CitationTracker();
    citationTracker.registerFormatter(new SlackFormatter());
    citationTracker.registerFormatter(new GmailFormatter());
    citationTracker.registerFormatter(new CalendarFormatter());

    // Register all items as citations
    for (const item of multiSource.items) {
      citationTracker.register(item, item.url);
    }

    // Build formatted prompt context
    const promptContext = buildPromptContext(multiSource, citationTracker);

    // Build LLM prompt
    const systemPrompt = buildSystemPrompt(multiSource.availableConnectors as string[]);
    const userPrompt = buildUserPrompt(config, promptContext);

    // Call LLM
    callbacks?.onProgress?.('Generating brief with AI');
    callbacks?.onLLMCall?.('gpt-5-mini', userPrompt.length);

    const llmStart = Date.now();
    const llmResponse = await llmService.complete({
      tenantId,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      maxTokens: 4096,
      temperature: 0.7,
    });

    callbacks?.onLLMComplete?.(
      llmResponse.model,
      llmResponse.usage.completionTokens,
      Date.now() - llmStart
    );

    // Append sources section to the brief
    const sourcesMarkdown = citationTracker.generateSourcesMarkdown();
    const fullContent = `${llmResponse.content}\n\n${sourcesMarkdown}`;

    // Generate source records for database
    const sourceRecords = citationTracker.generateSourceRecords(tenantId);

    callbacks?.onProgress?.('Daily Brief generation complete');

    const totalLatency = Date.now() - startTime;

    // Audit: Job completed
    await auditLogger?.logJobCompleted(tenantId, jobId, totalLatency);

    return {
      content: fullContent,
      sources: sourceRecords,
      stats: {
        channelsProcessed: config.slackChannels?.length || 0,
        messagesProcessed: multiSource.byConnector.slack?.length || 0,
        emailsProcessed: multiSource.byConnector.gmail?.length || 0,
        eventsProcessed: multiSource.byConnector.calendar?.length || 0,
        driveFilesProcessed: multiSource.byConnector.drive?.length || 0,
        jiraIssuesProcessed: multiSource.byConnector.jira?.length || 0,
        confluencePagesProcessed: multiSource.byConnector.confluence?.length || 0,
        zendeskTicketsProcessed: multiSource.byConnector.zendesk?.length || 0,
        tokensUsed: llmResponse.usage.promptTokens + llmResponse.usage.completionTokens,
        latencyMs: totalLatency,
      },
    };
  } catch (error) {
    // Audit: Job failed
    const errorMessage = error instanceof Error ? error.message : String(error);
    await auditLogger?.logJobFailed(tenantId, jobId, errorMessage);
    throw error;
  }
}

// ============================================================================
// Prompt Building Helpers
// ============================================================================

function buildSystemPrompt(connectors: string[]): string {
  const sources: string[] = [];
  if (connectors.includes('slack')) sources.push('Slack messages');
  if (connectors.includes('gmail')) sources.push('Gmail emails');
  if (connectors.includes('google-calendar')) sources.push('Calendar events');
  if (connectors.includes('google-drive')) sources.push('Google Drive files');
  if (connectors.includes('jira')) sources.push('Jira issues');
  if (connectors.includes('confluence')) sources.push('Confluence pages');
  if (connectors.includes('zendesk')) sources.push('Zendesk tickets');

  const sourceList = sources.length > 0 ? sources.join(', ') : 'various sources';

  return `You are an AI assistant helping a product manager stay informed about their team's activities.
You will be given data from ${sourceList}. Your job is to:
1. Synthesize the key information into a concise daily brief
2. Highlight important decisions, announcements, and discussions
3. Note any action items or follow-ups needed
4. Use citation numbers [1], [2], etc. to reference specific items

Format your response as markdown with clear sections.`;
}

function buildUserPrompt(config: DailyBriefConfig, context: string): string {
  return `Generate a Daily Brief from the following activity from the last ${config.dataTimeframeHours} hours.

${context}

Create a well-organized brief with:
- Executive summary (2-3 sentences)
- Key highlights by topic/theme
- Action items and follow-ups (if any)
- Notable discussions
- Upcoming meetings (if calendar events are included)

Use [N] citation format to reference specific items. Be concise but comprehensive.`;
}

interface MultiSourceContextType {
  items: FetchedItem[];
  byConnector: {
    slack?: FetchedItem[];
    gmail?: FetchedItem[];
    calendar?: FetchedItem[];
    drive?: FetchedItem[];
    jira?: FetchedItem[];
    confluence?: FetchedItem[];
    zendesk?: FetchedItem[];
  };
}

function buildPromptContext(
  multiSource: MultiSourceContextType,
  citationTracker: CitationTracker
): string {
  const sections: string[] = [];

  // Format Slack messages
  if (multiSource.byConnector.slack?.length) {
    const slackSection = formatSlackSection(multiSource.byConnector.slack, citationTracker);
    sections.push(slackSection);
  }

  // Format Gmail emails
  if (multiSource.byConnector.gmail?.length) {
    const gmailSection = formatGmailSection(multiSource.byConnector.gmail, citationTracker);
    sections.push(gmailSection);
  }

  // Format Calendar events
  if (multiSource.byConnector.calendar?.length) {
    const calendarSection = formatCalendarSection(multiSource.byConnector.calendar, citationTracker);
    sections.push(calendarSection);
  }

  // Format Google Drive files
  if (multiSource.byConnector.drive?.length) {
    const driveSection = formatDriveSection(multiSource.byConnector.drive, citationTracker);
    sections.push(driveSection);
  }

  // Format Jira issues
  if (multiSource.byConnector.jira?.length) {
    const jiraSection = formatJiraSection(multiSource.byConnector.jira, citationTracker);
    sections.push(jiraSection);
  }

  // Format Confluence pages
  if (multiSource.byConnector.confluence?.length) {
    const confluenceSection = formatConfluenceSection(multiSource.byConnector.confluence, citationTracker);
    sections.push(confluenceSection);
  }

  // Format Zendesk tickets
  if (multiSource.byConnector.zendesk?.length) {
    const zendeskSection = formatZendeskSection(multiSource.byConnector.zendesk, citationTracker);
    sections.push(zendeskSection);
  }

  return sections.join('\n\n');
}

function formatSlackSection(items: FetchedItem[], citationTracker: CitationTracker): string {
  // Group messages by channel
  const byChannel = new Map<string, FetchedItem[]>();

  for (const item of items) {
    const channelName = (item.metadata as { channelName?: string })?.channelName || 'unknown';
    if (!byChannel.has(channelName)) {
      byChannel.set(channelName, []);
    }
    byChannel.get(channelName)!.push(item);
  }

  const channelSections: string[] = [];

  for (const [channelName, channelItems] of byChannel) {
    // Sort by timestamp
    channelItems.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const lines: string[] = [];
    for (const item of channelItems) {
      const citationNum = citationTracker.getCitationNumber('slack_message', item.externalId);
      const timestamp = item.timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      lines.push(`[${citationNum}] ${timestamp} ${item.author.name}: ${item.content}`);

      // Include thread context if it's a thread parent with replies
      const replyCount = (item.metadata as { replyCount?: number })?.replyCount;
      if (replyCount && replyCount > 0) {
        lines.push(`  └ ${replyCount} replies in thread`);
      }
    }

    channelSections.push(`### #${channelName}\n\n${lines.join('\n')}`);
  }

  return `## Slack Messages\n\n${channelSections.join('\n\n')}`;
}

function formatGmailSection(items: FetchedItem[], citationTracker: CitationTracker): string {
  // Sort by timestamp (newest first)
  const sorted = [...items].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const lines: string[] = [];
  for (const item of sorted) {
    const citationNum = citationTracker.getCitationNumber('gmail_email', item.externalId);
    const date = item.timestamp.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const metadata = item.metadata as { isStarred?: boolean; hasAttachments?: boolean };

    let prefix = '';
    if (metadata.isStarred) prefix += '⭐ ';
    if (metadata.hasAttachments) prefix += '📎 ';

    lines.push(`[${citationNum}] ${prefix}**${item.title}** from ${item.author.name} (${date})`);

    // Add snippet preview
    const snippet = item.content.slice(0, 150);
    lines.push(`    ${snippet}${item.content.length > 150 ? '...' : ''}`);
  }

  return `## Gmail Emails\n\n${lines.join('\n')}`;
}

function formatCalendarSection(items: FetchedItem[], citationTracker: CitationTracker): string {
  // Sort by timestamp (chronological)
  const sorted = [...items].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const lines: string[] = [];
  for (const item of sorted) {
    const citationNum = citationTracker.getCitationNumber('calendar_event', item.externalId);
    const startTime = item.timestamp.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    const metadata = item.metadata as {
      location?: string;
      meetingLink?: string;
      attendees?: Array<{ name: string; responseStatus: string }>;
    };

    lines.push(`[${citationNum}] **${item.title}** - ${startTime}`);

    if (metadata.location) {
      lines.push(`    📍 ${metadata.location}`);
    }
    if (metadata.meetingLink) {
      lines.push(`    🔗 Video meeting available`);
    }
    if (metadata.attendees?.length) {
      const attendeeNames = metadata.attendees.slice(0, 5).map((a) => a.name).join(', ');
      lines.push(`    👥 ${attendeeNames}${metadata.attendees.length > 5 ? ` +${metadata.attendees.length - 5} more` : ''}`);
    }
  }

  return `## Upcoming Meetings\n\n${lines.join('\n')}`;
}

function formatDriveSection(items: FetchedItem[], citationTracker: CitationTracker): string {
  // Sort by timestamp (newest first)
  const sorted = [...items].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const lines: string[] = [];
  for (const item of sorted) {
    const citationNum = citationTracker.getCitationNumber('drive_file', item.externalId);
    const date = item.timestamp.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const metadata = item.metadata as { mimeType?: string; isShared?: boolean };

    let typeIcon = '📄';
    if (metadata.mimeType?.includes('spreadsheet')) typeIcon = '📊';
    else if (metadata.mimeType?.includes('presentation')) typeIcon = '📽️';
    else if (metadata.mimeType?.includes('document')) typeIcon = '📝';
    else if (metadata.mimeType?.includes('folder')) typeIcon = '📁';

    const sharedIndicator = metadata.isShared ? ' (shared)' : '';
    lines.push(`[${citationNum}] ${typeIcon} **${item.title}**${sharedIndicator} - ${date}`);
  }

  return `## Google Drive Files\n\n${lines.join('\n')}`;
}

function formatJiraSection(items: FetchedItem[], citationTracker: CitationTracker): string {
  // Sort by timestamp (newest first)
  const sorted = [...items].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const lines: string[] = [];
  for (const item of sorted) {
    const citationNum = citationTracker.getCitationNumber('jira_issue', item.externalId);
    const metadata = item.metadata as {
      issueKey?: string;
      status?: string;
      priority?: string;
      issueType?: string;
    };

    const statusBadge = metadata.status ? `[${metadata.status}]` : '';
    const priorityIcon = metadata.priority === 'High' ? '🔴' : metadata.priority === 'Medium' ? '🟡' : '🟢';
    const issueKey = metadata.issueKey || item.externalId;

    lines.push(`[${citationNum}] ${priorityIcon} **${issueKey}**: ${item.title} ${statusBadge}`);

    // Add snippet if available
    if (item.content && item.content.length > 0) {
      const snippet = item.content.slice(0, 100);
      lines.push(`    ${snippet}${item.content.length > 100 ? '...' : ''}`);
    }
  }

  return `## Jira Issues\n\n${lines.join('\n')}`;
}

function formatConfluenceSection(items: FetchedItem[], citationTracker: CitationTracker): string {
  // Sort by timestamp (newest first)
  const sorted = [...items].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const lines: string[] = [];
  for (const item of sorted) {
    const citationNum = citationTracker.getCitationNumber('confluence_page', item.externalId);
    const date = item.timestamp.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const metadata = item.metadata as { spaceKey?: string; spaceName?: string };

    const space = metadata.spaceName || metadata.spaceKey || '';
    const spacePrefix = space ? `[${space}] ` : '';

    lines.push(`[${citationNum}] 📖 ${spacePrefix}**${item.title}** - ${date}`);

    // Add content snippet
    if (item.content && item.content.length > 0) {
      const snippet = item.content.slice(0, 120);
      lines.push(`    ${snippet}${item.content.length > 120 ? '...' : ''}`);
    }
  }

  return `## Confluence Pages\n\n${lines.join('\n')}`;
}

function formatZendeskSection(items: FetchedItem[], citationTracker: CitationTracker): string {
  // Sort by timestamp (newest first)
  const sorted = [...items].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const lines: string[] = [];
  for (const item of sorted) {
    const citationNum = citationTracker.getCitationNumber('zendesk_ticket', item.externalId);
    const metadata = item.metadata as {
      status?: string;
      priority?: string;
      organization?: { name: string };
    };

    const statusBadge = metadata.status ? `[${metadata.status}]` : '';
    const priorityIcon =
      metadata.priority === 'urgent'
        ? '🔴'
        : metadata.priority === 'high'
          ? '🟠'
          : metadata.priority === 'normal'
            ? '🟡'
            : '🟢';

    lines.push(`[${citationNum}] ${priorityIcon} **${item.title}** ${statusBadge}`);

    // Add organization if available
    if (metadata.organization?.name) {
      lines.push(`    🏢 ${metadata.organization.name}`);
    }

    // Add content snippet
    if (item.content && item.content.length > 0) {
      const snippet = item.content.slice(0, 100);
      lines.push(`    ${snippet}${item.content.length > 100 ? '...' : ''}`);
    }
  }

  return `## Zendesk Tickets\n\n${lines.join('\n')}`;
}
