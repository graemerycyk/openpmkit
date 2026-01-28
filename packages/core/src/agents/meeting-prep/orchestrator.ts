import type { MeetingPrepConfig } from '../../types';
import type { AuditLogger } from '../../audit';
import type { ConnectorSourceType, FetchedItem, CalendarEventMetadata } from '../../fetchers/types';
import {
  buildMultiSourceContext,
  type ConnectorCredentialsMap,
  type FetcherConfig,
} from '../shared';
import { CitationTracker } from '../../citations/citation-tracker';
import { SlackFormatter } from '../../citations/formatters/slack-formatter';
import { GmailFormatter } from '../../citations/formatters/gmail-formatter';
import { CalendarFormatter } from '../../citations/formatters/calendar-formatter';
import { CalendarFetcher } from '../../fetchers/calendar-fetcher';

// ============================================================================
// Context Types
// ============================================================================

export interface MeetingPrepContext {
  tenantId: string;
  userId: string;
  jobId: string;
  config: MeetingPrepConfig;
  credentials: ConnectorCredentialsMap;
  auditLogger?: AuditLogger;
  /** Optional pre-selected meeting (if not provided, will find the next meeting) */
  meetingEvent?: {
    id: string;
    title: string;
    startTime: Date;
    attendees: Array<{ name: string; email: string; responseStatus?: string }>;
    description?: string;
    location?: string;
    meetingLink?: string;
  };
}

export interface MeetingPrepResult {
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
    /** Title of the first/primary meeting (for backward compatibility) */
    meetingTitle: string;
    /** Time of the first/primary meeting */
    meetingTime: Date | null;
    /** Total attendees across all meetings */
    attendeesCount: number;
    /** Number of meetings found within the lead time window */
    meetingsFound: number;
    /** Titles of all meetings found */
    meetingTitles: string[];
    slackMessagesProcessed: number;
    emailsProcessed: number;
    jiraIssuesProcessed: number;
    confluencePagesProcessed: number;
    calendarEventsProcessed: number;
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
// Meeting Prep Orchestrator
// ============================================================================

/**
 * Orchestrator for the Meeting Prep agent
 *
 * Execution flow:
 * 1. Find the target meeting from calendar (or use provided meeting)
 * 2. Extract attendees and build context-specific fetcher config
 * 3. Fetch relevant data from connected sources
 * 4. Set up citation tracker with formatters
 * 5. Build meeting-focused prompt context
 * 6. Call LLM with meeting_prep prompt template
 * 7. Return structured result with citations
 */
export async function executeMeetingPrep(
  context: MeetingPrepContext,
  llmService: LLMService,
  callbacks?: OrchestratorCallbacks
): Promise<MeetingPrepResult> {
  const startTime = Date.now();
  const { config, credentials, tenantId, jobId, auditLogger } = context;

  try {
    callbacks?.onProgress?.('Starting Meeting Prep generation');

    // Audit: Job started
    await auditLogger?.logJobStarted(tenantId, jobId);

    // Step 1: Find all upcoming meetings within the lead time window
    callbacks?.onProgress?.('Finding upcoming meetings...');
    let meetings: MeetingEvent[];

    if (context.meetingEvent) {
      // If a specific meeting was provided, use only that one
      meetings = [context.meetingEvent];
    } else {
      // Otherwise, find ALL meetings within the lead time window
      meetings = await findUpcomingMeetings(
        credentials,
        config.leadTimeMinutes,
        callbacks
      );
    }

    // Apply default if leadTimeMinutes is undefined/NaN
    const effectiveLeadTime = Number.isFinite(config.leadTimeMinutes) ? config.leadTimeMinutes : 240;
    const hoursDisplay = Math.round(effectiveLeadTime / 60);

    if (meetings.length === 0) {
      const noMeetingResult: MeetingPrepResult = {
        content: `# Meeting Prep Pack

No upcoming meetings found within the next ${hoursDisplay} hours.`,
        sources: [],
        stats: {
          meetingTitle: 'No meeting found',
          meetingTime: null,
          attendeesCount: 0,
          meetingsFound: 0,
          meetingTitles: [],
          slackMessagesProcessed: 0,
          emailsProcessed: 0,
          jiraIssuesProcessed: 0,
          confluencePagesProcessed: 0,
          calendarEventsProcessed: 0,
          latencyMs: Date.now() - startTime,
        },
      };
      await auditLogger?.logJobCompleted(tenantId, jobId, Date.now() - startTime);
      return noMeetingResult;
    }

    callbacks?.onProgress?.(
      `Found ${meetings.length} meeting(s) within ${hoursDisplay} hours`
    );

    // Step 2: Build fetcher config based on what's connected and configured
    // This fetches CONTEXT data by looking BACKWARD in time
    const fetcherConfig = buildMeetingPrepFetcherConfig(config, credentials);

    // Calculate lookback period - use config value or default to 30 days
    const lookbackDays = Number.isFinite(config.lookbackDays) ? config.lookbackDays : 30;
    const sinceHoursAgo = lookbackDays * 24;

    // Step 3: Fetch context from available connectors (looking BACKWARD)
    callbacks?.onProgress?.(`Fetching context from last ${lookbackDays} days...`);
    const multiSource = await buildMultiSourceContext(credentials, fetcherConfig, {
      sinceHoursAgo,
      onProgress: (msg) => callbacks?.onProgress?.(msg),
    });

    callbacks?.onProgress?.(
      `Fetched ${multiSource.stats.totalItems} items from ${multiSource.availableConnectors.join(', ') || 'no sources'}`
    );

    // Step 4: Set up citation tracker with formatters
    callbacks?.onProgress?.('Processing sources and tracking citations');
    const citationTracker = new CitationTracker();
    citationTracker.registerFormatter(new SlackFormatter());
    citationTracker.registerFormatter(new GmailFormatter());
    citationTracker.registerFormatter(new CalendarFormatter());

    // Register all items as citations
    for (const item of multiSource.items) {
      citationTracker.register(item, item.url);
    }

    // Step 5: Generate prep for EACH meeting
    callbacks?.onProgress?.(`Generating prep for ${meetings.length} meeting(s)`);
    const meetingSections: string[] = [];
    let totalTokensUsed = 0;

    for (let i = 0; i < meetings.length; i++) {
      const meeting = meetings[i];
      callbacks?.onProgress?.(
        `Generating prep for meeting ${i + 1}/${meetings.length}: ${meeting.title}`
      );

      // Build formatted prompt context for this meeting
      const promptContext = buildPromptContext(meeting, multiSource, citationTracker);

      // Build LLM prompts
      const systemPrompt = buildSystemPrompt(meeting, multiSource.availableConnectors as string[]);
      const userPrompt = buildUserPrompt(meeting, promptContext);

      // Call LLM for this meeting
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

      totalTokensUsed += llmResponse.usage.promptTokens + llmResponse.usage.completionTokens;

      // Add meeting section with header
      const meetingHeader = `---\n\n# Meeting ${i + 1}: ${meeting.title}\n\n**Time:** ${meeting.startTime.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })} | **Attendees:** ${meeting.attendees.length}\n`;

      meetingSections.push(meetingHeader + llmResponse.content);
    }

    // Combine all meeting sections
    const combinedContent = meetingSections.join('\n\n');

    // Append sources section
    const sourcesMarkdown = citationTracker.generateSourcesMarkdown();
    const fullContent = `# Meeting Prep Pack\n\n**${meetings.length} upcoming meeting(s)** within the next ${hoursDisplay} hours\n\n${combinedContent}\n\n${sourcesMarkdown}`;

    // Generate source records for database
    const sourceRecords = citationTracker.generateSourceRecords(tenantId);

    callbacks?.onProgress?.('Meeting Prep generation complete');

    const totalLatency = Date.now() - startTime;

    // Audit: Job completed
    await auditLogger?.logJobCompleted(tenantId, jobId, totalLatency);

    // Calculate total attendees across all meetings
    const totalAttendees = meetings.reduce((sum, m) => sum + m.attendees.length, 0);

    return {
      content: fullContent,
      sources: sourceRecords,
      stats: {
        meetingTitle: meetings[0].title,
        meetingTime: meetings[0].startTime,
        attendeesCount: totalAttendees,
        meetingsFound: meetings.length,
        meetingTitles: meetings.map(m => m.title),
        slackMessagesProcessed: multiSource.byConnector.slack?.length || 0,
        emailsProcessed: multiSource.byConnector.gmail?.length || 0,
        jiraIssuesProcessed: multiSource.byConnector.jira?.length || 0,
        confluencePagesProcessed: multiSource.byConnector.confluence?.length || 0,
        calendarEventsProcessed: meetings.length,
        tokensUsed: totalTokensUsed,
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
// Meeting Finding
// ============================================================================

interface MeetingEvent {
  id: string;
  title: string;
  startTime: Date;
  attendees: Array<{ name: string; email: string; responseStatus?: string }>;
  description?: string;
  location?: string;
  meetingLink?: string;
}

/**
 * Find ALL upcoming meetings within the lead time window.
 * Looks FORWARD only (from now to leadTimeMinutes in the future).
 * Also includes meetings that started within the last hour (in case running prep mid-meeting).
 */
async function findUpcomingMeetings(
  credentials: ConnectorCredentialsMap,
  leadTimeMinutes: number,
  callbacks?: OrchestratorCallbacks
): Promise<MeetingEvent[]> {
  if (!credentials['google-calendar']) {
    callbacks?.onProgress?.('Calendar not connected - cannot find meetings');
    return [];
  }

  // Apply default if leadTimeMinutes is undefined/NaN
  const effectiveLeadTime = Number.isFinite(leadTimeMinutes) ? leadTimeMinutes : 240;

  try {
    const fetcher = CalendarFetcher.fromEncrypted(credentials['google-calendar']);

    // Look FORWARD only - find meetings starting soon
    // daysAhead = ceiling of leadTimeMinutes in days (minimum 1)
    const daysAhead = Math.max(1, Math.ceil(effectiveLeadTime / (24 * 60)));

    const result = await fetcher.fetch({
      calendarIds: ['primary'],
      daysAhead,
      includePast: false, // Only look forward for meetings
    });

    const now = new Date();
    const leadTimeWindow = new Date(now.getTime() + effectiveLeadTime * 60 * 1000);
    // Also include meetings that started up to 1 hour ago (in case running prep mid-meeting)
    const recentPastWindow = new Date(now.getTime() - 60 * 60 * 1000);

    callbacks?.onProgress?.(
      `Searching for meetings between now and ${leadTimeWindow.toLocaleTimeString()} (${Math.round(effectiveLeadTime / 60)} hours ahead)`
    );

    // Sort events by start time
    const sortedEvents = [...result.items].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const meetings: MeetingEvent[] = [];

    // Find ALL meetings within the window
    for (const event of sortedEvents) {
      const isUpcoming = event.timestamp > now && event.timestamp <= leadTimeWindow;
      const isRecentlyStarted = event.timestamp >= recentPastWindow && event.timestamp <= now;

      if (isUpcoming || isRecentlyStarted) {
        const metadata = event.metadata as CalendarEventMetadata;
        meetings.push({
          id: event.externalId,
          title: event.title,
          startTime: event.timestamp,
          attendees: (metadata.attendees || []).map(a => ({
            name: a.name || a.email.split('@')[0],
            email: a.email,
            responseStatus: a.responseStatus,
          })),
          description: event.content,
          location: metadata.location,
          meetingLink: metadata.meetingLink,
        });
      }
    }

    if (meetings.length > 0) {
      callbacks?.onProgress?.(
        `Found ${meetings.length} meeting(s): ${meetings.map(m => m.title).join(', ')}`
      );
    } else {
      callbacks?.onProgress?.(
        `No meetings found. Searched ${result.items.length} events in calendar.`
      );
    }

    return meetings;
  } catch (error) {
    callbacks?.onProgress?.(`Error fetching calendar: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

// ============================================================================
// Fetcher Config Builder
// ============================================================================

function buildMeetingPrepFetcherConfig(
  config: MeetingPrepConfig,
  credentials: ConnectorCredentialsMap
): FetcherConfig {
  const fetcherConfig: FetcherConfig = {};

  // Slack - include if configured and connected
  if (config.includeSlack && credentials.slack) {
    fetcherConfig.slack = {
      channelIds: [], // Will fetch from all accessible channels
      includeMentions: true,
    };
  }

  // Jira - include if configured and connected
  if (config.includeJira && credentials.jira) {
    fetcherConfig.jira = {
      assignedToMe: false,
      recentlyUpdated: true,
    };
  }

  // Confluence - include if configured and connected
  if (config.includeConfluence && credentials.confluence) {
    fetcherConfig.confluence = {
      recentlyEdited: true,
    };
  }

  // Gmail - always include if connected (for attendee email history)
  if (credentials.gmail) {
    fetcherConfig.gmail = {
      labels: ['INBOX', 'SENT'],
      unreadOnly: false,
    };
  }

  // Note: Gong is not included yet as GongFetcher doesn't exist
  // When implemented, add: if (config.includeGong && credentials.gong) { ... }

  return fetcherConfig;
}

// ============================================================================
// Prompt Building Helpers
// ============================================================================

function buildSystemPrompt(meeting: MeetingEvent, connectors: string[]): string {
  const sources: string[] = [];
  if (connectors.includes('slack')) sources.push('Slack conversations');
  if (connectors.includes('gmail')) sources.push('email history');
  if (connectors.includes('jira')) sources.push('Jira issues');
  if (connectors.includes('confluence')) sources.push('Confluence documentation');

  const sourceList = sources.length > 0 ? sources.join(', ') : 'available data';

  return `You are an AI assistant helping a product manager prepare for meetings.
You will be given information about an upcoming meeting and relevant context from ${sourceList}.

Your job is to:
1. Summarize who is attending and their roles/relationship if discernible
2. Highlight relevant recent interactions or context
3. Identify any open issues or topics that may come up
4. Suggest talking points and questions to ask
5. Note any risks or opportunities related to this meeting
6. Use citation numbers [1], [2], etc. to reference specific sources

Be concise but comprehensive. Focus on actionable insights that help prepare for the meeting.
Format your response as markdown with clear sections.`;
}

function buildUserPrompt(meeting: MeetingEvent, context: string): string {
  const attendeeList = meeting.attendees
    .map(a => `- ${a.name} (${a.email})${a.responseStatus ? ` - ${a.responseStatus}` : ''}`)
    .join('\n');

  const meetingTime = meeting.startTime.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return `Generate a Meeting Prep Pack for the following meeting:

## Meeting Details

**Title:** ${meeting.title}
**Time:** ${meetingTime}
${meeting.location ? `**Location:** ${meeting.location}` : ''}
${meeting.meetingLink ? `**Meeting Link:** Video call available` : ''}

**Attendees:**
${attendeeList}

${meeting.description ? `**Description:**\n${meeting.description}\n` : ''}

## Available Context

${context || 'No additional context available from connected sources.'}

---

Create a meeting prep pack with the following sections:

1. **Meeting Overview** - Brief summary of what this meeting is about
2. **Attendee Context** - Who's attending and any relevant background
3. **Recent Interactions** - Key points from recent communications (if available)
4. **Open Items** - Any outstanding issues or topics that may arise
5. **Talking Points** - Suggested topics and questions
6. **Preparation Checklist** - What to have ready for the meeting

Use [N] citation format to reference specific items. Be concise but thorough.`;
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
  meeting: MeetingEvent,
  multiSource: MultiSourceContextType,
  citationTracker: CitationTracker
): string {
  const sections: string[] = [];
  const attendeeEmails = new Set(meeting.attendees.map(a => a.email.toLowerCase()));

  // Format Gmail emails (prioritize emails with attendees)
  if (multiSource.byConnector.gmail?.length) {
    const gmailSection = formatGmailSection(multiSource.byConnector.gmail, citationTracker, attendeeEmails);
    if (gmailSection) sections.push(gmailSection);
  }

  // Format Slack messages
  if (multiSource.byConnector.slack?.length) {
    const slackSection = formatSlackSection(multiSource.byConnector.slack, citationTracker);
    if (slackSection) sections.push(slackSection);
  }

  // Format Jira issues
  if (multiSource.byConnector.jira?.length) {
    const jiraSection = formatJiraSection(multiSource.byConnector.jira, citationTracker);
    if (jiraSection) sections.push(jiraSection);
  }

  // Format Confluence pages
  if (multiSource.byConnector.confluence?.length) {
    const confluenceSection = formatConfluenceSection(multiSource.byConnector.confluence, citationTracker);
    if (confluenceSection) sections.push(confluenceSection);
  }

  return sections.join('\n\n');
}

// ============================================================================
// Section Formatters
// ============================================================================

function formatGmailSection(
  items: FetchedItem[],
  citationTracker: CitationTracker,
  attendeeEmails: Set<string>
): string {
  // Prioritize emails involving attendees
  const relevantEmails = items.filter(item => {
    const authorEmail = item.author.email?.toLowerCase();
    return authorEmail && attendeeEmails.has(authorEmail);
  });

  const otherEmails = items.filter(item => {
    const authorEmail = item.author.email?.toLowerCase();
    return !authorEmail || !attendeeEmails.has(authorEmail);
  });

  // Take relevant emails first, then fill with others (max 10)
  const emailsToShow = [...relevantEmails.slice(0, 5), ...otherEmails.slice(0, 5)].slice(0, 10);

  if (emailsToShow.length === 0) return '';

  // Sort by timestamp (newest first)
  emailsToShow.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const lines: string[] = ['### Recent Emails'];

  for (const item of emailsToShow) {
    const citationNum = citationTracker.getCitationNumber('gmail_email', item.externalId);
    const date = item.timestamp.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const isRelevant = item.author.email && attendeeEmails.has(item.author.email.toLowerCase());
    const relevantMarker = isRelevant ? ' (attendee)' : '';

    lines.push(`[${citationNum}] **${item.title}** from ${item.author.name}${relevantMarker} (${date})`);

    // Add snippet preview
    const snippet = item.content.slice(0, 120);
    lines.push(`    ${snippet}${item.content.length > 120 ? '...' : ''}`);
  }

  return lines.join('\n');
}

function formatSlackSection(items: FetchedItem[], citationTracker: CitationTracker): string {
  if (items.length === 0) return '';

  // Group messages by channel
  const byChannel = new Map<string, FetchedItem[]>();

  for (const item of items) {
    const channelName = (item.metadata as { channelName?: string })?.channelName || 'unknown';
    if (!byChannel.has(channelName)) {
      byChannel.set(channelName, []);
    }
    byChannel.get(channelName)!.push(item);
  }

  const lines: string[] = ['### Recent Slack Activity'];

  for (const [channelName, channelItems] of byChannel) {
    // Take top 5 per channel
    const recentItems = channelItems
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);

    lines.push(`\n#### #${channelName}`);

    for (const item of recentItems) {
      const citationNum = citationTracker.getCitationNumber('slack_message', item.externalId);
      const time = item.timestamp.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });

      const content = item.content.slice(0, 150);
      lines.push(`[${citationNum}] ${time} @${item.author.name}: ${content}${item.content.length > 150 ? '...' : ''}`);
    }
  }

  return lines.join('\n');
}

function formatJiraSection(items: FetchedItem[], citationTracker: CitationTracker): string {
  if (items.length === 0) return '';

  // Sort by timestamp (newest first) and limit
  const sorted = [...items]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);

  const lines: string[] = ['### Related Jira Issues'];

  for (const item of sorted) {
    const citationNum = citationTracker.getCitationNumber('jira_issue', item.externalId);
    const metadata = item.metadata as {
      issueKey?: string;
      status?: string;
      priority?: string;
    };

    const statusBadge = metadata.status ? `[${metadata.status}]` : '';
    const priorityIcon = metadata.priority === 'High' ? '!' : metadata.priority === 'Medium' ? '-' : '';
    const issueKey = metadata.issueKey || item.externalId;

    lines.push(`[${citationNum}] ${priorityIcon}**${issueKey}**: ${item.title} ${statusBadge}`);
  }

  return lines.join('\n');
}

function formatConfluenceSection(items: FetchedItem[], citationTracker: CitationTracker): string {
  if (items.length === 0) return '';

  // Sort by timestamp (newest first) and limit
  const sorted = [...items]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);

  const lines: string[] = ['### Related Documentation'];

  for (const item of sorted) {
    const citationNum = citationTracker.getCitationNumber('confluence_page', item.externalId);
    const date = item.timestamp.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const metadata = item.metadata as { spaceName?: string };
    const space = metadata.spaceName ? `[${metadata.spaceName}] ` : '';

    lines.push(`[${citationNum}] ${space}**${item.title}** - ${date}`);
  }

  return lines.join('\n');
}
