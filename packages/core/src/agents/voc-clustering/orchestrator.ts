import type { VocClusteringConfig } from '../../types';
import type { AuditLogger } from '../../audit';
import type { ConnectorSourceType, FetchedItem } from '../../fetchers/types';
import {
  buildMultiSourceContext,
  type ConnectorCredentialsMap,
  type FetcherConfig,
} from '../shared';
import { CitationTracker } from '../../citations/citation-tracker';
import { SlackFormatter } from '../../citations/formatters/slack-formatter';

// ============================================================================
// Context Types
// ============================================================================

export interface VocClusteringContext {
  tenantId: string;
  userId: string;
  jobId: string;
  config: VocClusteringConfig;
  credentials: ConnectorCredentialsMap;
  auditLogger?: AuditLogger;
}

export interface VocClusteringResult {
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
    lookbackDays: number;
    zendeskTicketsProcessed: number;
    slackMessagesProcessed: number;
    totalFeedbackItems: number;
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
// VoC Clustering Orchestrator
// ============================================================================

/**
 * Orchestrator for the VoC (Voice of Customer) Clustering agent
 *
 * Execution flow:
 * 1. Build fetcher config based on enabled sources and lookback period
 * 2. Fetch feedback from connected sources (Zendesk, Slack)
 * 3. Set up citation tracker with formatters
 * 4. Build prompt context with all feedback data
 * 5. Call LLM with voc_clustering prompt template
 * 6. Return structured result with citations and theme analysis
 */
export async function executeVocClustering(
  context: VocClusteringContext,
  llmService: LLMService,
  callbacks?: OrchestratorCallbacks
): Promise<VocClusteringResult> {
  const startTime = Date.now();
  const { config, credentials, tenantId, jobId, auditLogger } = context;

  try {
    callbacks?.onProgress?.('Starting VoC Clustering analysis');

    // Audit: Job started
    await auditLogger?.logJobStarted(tenantId, jobId);

    // Step 1: Build fetcher config based on what's connected and configured
    const fetcherConfig = buildVocFetcherConfig(config, credentials);
    const lookbackHours = config.lookbackDays * 24;

    callbacks?.onProgress?.(`Analyzing feedback from the last ${config.lookbackDays} days...`);

    // Step 2: Fetch from available connectors
    const multiSource = await buildMultiSourceContext(credentials, fetcherConfig, {
      sinceHoursAgo: lookbackHours,
      onProgress: (msg) => callbacks?.onProgress?.(msg),
    });

    callbacks?.onProgress?.(
      `Fetched ${multiSource.stats.totalItems} feedback items from ${multiSource.availableConnectors.join(', ') || 'no sources'}`
    );

    if (multiSource.items.length === 0) {
      const noDataResult: VocClusteringResult = {
        content: `# Voice of Customer Report

## No Feedback Data Available

No customer feedback was found in the last ${config.lookbackDays} days from connected sources.

**To generate a VoC report:**
1. Connect at least one feedback source (Zendesk recommended)
2. Ensure there is feedback data within the lookback period
3. Run this agent again

**Currently connected sources:**
${multiSource.availableConnectors.length > 0 ? multiSource.availableConnectors.map(c => `- ${c}`).join('\n') : '- None'}`,
        sources: [],
        stats: {
          lookbackDays: config.lookbackDays,
          zendeskTicketsProcessed: 0,
          slackMessagesProcessed: 0,
          totalFeedbackItems: 0,
          latencyMs: Date.now() - startTime,
        },
      };
      await auditLogger?.logJobCompleted(tenantId, jobId, Date.now() - startTime);
      return noDataResult;
    }

    // Step 3: Set up citation tracker with formatters
    callbacks?.onProgress?.('Processing feedback sources and tracking citations');
    const citationTracker = new CitationTracker();
    citationTracker.registerFormatter(new SlackFormatter());
    // ZendeskFormatter will use default formatting via CitationTracker

    // Register all items as citations
    for (const item of multiSource.items) {
      citationTracker.register(item, item.url);
    }

    // Step 4: Build formatted prompt context
    const promptContext = buildPromptContext(multiSource, citationTracker, config);

    // Step 5: Build LLM prompts
    const systemPrompt = buildSystemPrompt(config, multiSource.availableConnectors as string[]);
    const userPrompt = buildUserPrompt(config, promptContext, multiSource.stats.totalItems);

    // Step 6: Call LLM
    callbacks?.onProgress?.('Analyzing feedback and identifying themes with AI');
    callbacks?.onLLMCall?.('gpt-5-mini', userPrompt.length);

    const llmStart = Date.now();
    const llmResponse = await llmService.complete({
      tenantId,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      maxTokens: 6144, // Larger for detailed theme analysis
      temperature: 0.5, // Lower for more consistent analysis
    });

    callbacks?.onLLMComplete?.(
      llmResponse.model,
      llmResponse.usage.completionTokens,
      Date.now() - llmStart
    );

    // Append sources section
    const sourcesMarkdown = citationTracker.generateSourcesMarkdown();
    const fullContent = `${llmResponse.content}\n\n${sourcesMarkdown}`;

    // Generate source records for database
    const sourceRecords = citationTracker.generateSourceRecords(tenantId);

    callbacks?.onProgress?.('VoC Clustering analysis complete');

    const totalLatency = Date.now() - startTime;

    // Audit: Job completed
    await auditLogger?.logJobCompleted(tenantId, jobId, totalLatency);

    return {
      content: fullContent,
      sources: sourceRecords,
      stats: {
        lookbackDays: config.lookbackDays,
        zendeskTicketsProcessed: multiSource.byConnector.zendesk?.length || 0,
        slackMessagesProcessed: multiSource.byConnector.slack?.length || 0,
        totalFeedbackItems: multiSource.stats.totalItems,
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
// Fetcher Config Builder
// ============================================================================

function buildVocFetcherConfig(
  config: VocClusteringConfig,
  credentials: ConnectorCredentialsMap
): FetcherConfig {
  const fetcherConfig: FetcherConfig = {};

  // Zendesk - primary feedback source
  if (config.includeZendesk && credentials.zendesk) {
    fetcherConfig.zendesk = {
      status: ['open', 'pending', 'solved', 'closed'], // All statuses for VoC
      recentlyUpdated: true,
    };
  }

  // Slack - for customer feedback channels
  if (config.includeSlack && credentials.slack) {
    fetcherConfig.slack = {
      channelIds: [], // Will fetch from all accessible channels
      includeMentions: true,
    };
  }

  // Note: Gong is not included yet as GongFetcher doesn't exist
  // When implemented, add: if (config.includeGong && credentials.gong) { ... }

  // Note: Community is not included yet as CommunityFetcher doesn't exist
  // When implemented, add: if (config.includeCommunity && credentials.community) { ... }

  return fetcherConfig;
}

// ============================================================================
// Prompt Building Helpers
// ============================================================================

function buildSystemPrompt(config: VocClusteringConfig, connectors: string[]): string {
  const sources: string[] = [];
  if (connectors.includes('zendesk')) sources.push('support tickets');
  if (connectors.includes('slack')) sources.push('Slack conversations');

  const sourceList = sources.length > 0 ? sources.join(' and ') : 'available data';

  return `You are an AI assistant specializing in Voice of Customer (VoC) analysis.
You will be given customer feedback from ${sourceList} over the last ${config.lookbackDays} days.

Your job is to:
1. Identify recurring themes and patterns in the feedback
2. Cluster similar feedback items together
3. Quantify each theme (count mentions, identify sources)
4. Include representative quotes with citation numbers [1], [2], etc.
5. Assess the impact and urgency of each theme
6. Provide actionable recommendations

Guidelines:
- Group similar feedback together, even if worded differently
- Focus on actionable insights, not just complaints
- Highlight both pain points AND positive feedback
- Note any trends compared to typical feedback patterns
- Be specific with recommendations - tie them to the evidence

Format your response as a well-structured markdown report.`;
}

function buildUserPrompt(config: VocClusteringConfig, context: string, totalItems: number): string {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `Generate a Voice of Customer Report analyzing ${totalItems} feedback items from the last ${config.lookbackDays} days.

**Report Date:** ${today}
**Analysis Period:** Last ${config.lookbackDays} days

## Customer Feedback Data

${context}

---

Create a comprehensive VoC report with the following sections:

1. **Executive Summary**
   - Top 3-5 themes with brief impact assessment
   - Overall sentiment indication
   - Key actions needed

2. **Theme Analysis**
   For each identified theme:
   - Theme name and description
   - Number of mentions and sources
   - Representative quotes (3-5, with [N] citations)
   - Affected customer segments (if discernible)
   - Product/feature implications
   - Urgency level (Critical / High / Medium / Low)

3. **Positive Feedback**
   - What's working well (with citations)
   - Areas of customer delight

4. **Trend Observations**
   - Any emerging patterns
   - Changes from typical feedback

5. **Recommendations**
   - Prioritized action items tied to evidence
   - Quick wins vs. strategic initiatives

Use [N] citation format throughout. Be data-driven and specific.`;
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
  citationTracker: CitationTracker,
  _config: VocClusteringConfig
): string {
  const sections: string[] = [];

  // Format Zendesk tickets (primary VoC source)
  if (multiSource.byConnector.zendesk?.length) {
    const zendeskSection = formatZendeskSection(multiSource.byConnector.zendesk, citationTracker);
    if (zendeskSection) sections.push(zendeskSection);
  }

  // Format Slack messages
  if (multiSource.byConnector.slack?.length) {
    const slackSection = formatSlackSection(multiSource.byConnector.slack, citationTracker);
    if (slackSection) sections.push(slackSection);
  }

  return sections.join('\n\n');
}

// ============================================================================
// Section Formatters
// ============================================================================

function formatZendeskSection(items: FetchedItem[], citationTracker: CitationTracker): string {
  if (items.length === 0) return '';

  // Sort by timestamp (newest first)
  const sorted = [...items].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const lines: string[] = ['### Support Tickets', ''];

  // Group by priority for better analysis
  const byPriority = new Map<string, FetchedItem[]>();
  for (const item of sorted) {
    const priority = (item.metadata as { priority?: string })?.priority || 'normal';
    if (!byPriority.has(priority)) {
      byPriority.set(priority, []);
    }
    byPriority.get(priority)!.push(item);
  }

  // Order priorities
  const priorityOrder = ['urgent', 'high', 'normal', 'low'];
  for (const priority of priorityOrder) {
    const priorityItems = byPriority.get(priority);
    if (!priorityItems || priorityItems.length === 0) continue;

    lines.push(`#### ${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority (${priorityItems.length})`);
    lines.push('');

    for (const item of priorityItems) {
      const citationNum = citationTracker.getCitationNumber('zendesk_ticket', item.externalId);
      const metadata = item.metadata as {
        status?: string;
        organization?: { name: string };
        tags?: string[];
      };

      const statusBadge = metadata.status ? `[${metadata.status}]` : '';
      const orgName = metadata.organization?.name ? ` (${metadata.organization.name})` : '';
      const tags = metadata.tags?.length ? ` - Tags: ${metadata.tags.slice(0, 3).join(', ')}` : '';

      lines.push(`[${citationNum}] **${item.title}** ${statusBadge}${orgName}`);

      // Add content preview (important for VoC analysis)
      if (item.content) {
        const contentPreview = item.content.slice(0, 300);
        lines.push(`> ${contentPreview}${item.content.length > 300 ? '...' : ''}`);
      }
      lines.push(`*From: ${item.author.name}${tags}*`);
      lines.push('');
    }
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

  const lines: string[] = ['### Slack Feedback', ''];

  for (const [channelName, channelItems] of byChannel) {
    // Sort by timestamp (newest first)
    const sorted = channelItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    lines.push(`#### #${channelName} (${sorted.length} messages)`);
    lines.push('');

    for (const item of sorted.slice(0, 20)) { // Limit per channel
      const citationNum = citationTracker.getCitationNumber('slack_message', item.externalId);
      const date = item.timestamp.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      lines.push(`[${citationNum}] @${item.author.name} (${date}):`);
      lines.push(`> ${item.content.slice(0, 250)}${item.content.length > 250 ? '...' : ''}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}
