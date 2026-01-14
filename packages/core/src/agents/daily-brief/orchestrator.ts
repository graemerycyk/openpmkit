import { SlackFetcher, type SlackMessage } from './slack-fetcher';
import { CitationTracker, formatMessagesForPrompt } from './citation-tracker';
import type { DailyBriefConfig } from '../../types';

export interface DailyBriefContext {
  tenantId: string;
  userId: string;
  jobId: string;
  config: DailyBriefConfig;
  slackCredentials: {
    encryptedBlob: string;
    encryptionKey: string;
  };
}

export interface DailyBriefResult {
  content: string;
  sources: Array<{
    tenantId: string;
    type: 'slack_message';
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

/**
 * Orchestrator for the Daily Brief agent
 *
 * Execution flow:
 * 1. Validate Slack connection
 * 2. Fetch messages from configured channels
 * 3. Track citations for each message
 * 4. Build prompt context
 * 5. Call LLM with daily_brief prompt template
 * 6. Parse and format output
 * 7. Return structured result
 */
export async function executeDailyBrief(
  context: DailyBriefContext,
  llmService: {
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
  },
  callbacks?: OrchestratorCallbacks
): Promise<DailyBriefResult> {
  const startTime = Date.now();
  const { config, slackCredentials, tenantId } = context;

  callbacks?.onProgress?.('Starting Daily Brief generation');

  // Initialize fetcher
  callbacks?.onProgress?.('Initializing Slack connection');
  const fetcher = SlackFetcher.fromEncrypted(
    slackCredentials.encryptedBlob,
    slackCredentials.encryptionKey
  );

  // Fetch messages from all configured channels
  const allMessages: SlackMessage[] = [];
  const permalinks = new Map<string, string>();

  for (const channelId of config.slackChannels) {
    const channelName = channelId; // Would need channel name lookup

    callbacks?.onToolCall?.('slack.conversations.history', { channelId });
    const toolStart = Date.now();

    try {
      const messages = await fetcher.fetchChannelMessages(
        channelId,
        channelName,
        config.dataTimeframeHours,
        (msg) => callbacks?.onProgress?.(msg)
      );

      callbacks?.onToolComplete?.('slack.conversations.history', Date.now() - toolStart, {
        messageCount: messages.length,
      });

      // Get permalinks for citation URLs
      for (const msg of messages) {
        const permalink = await fetcher.getMessagePermalink(channelId, msg.id);
        if (permalink) {
          permalinks.set(`${channelId}:${msg.id}`, permalink);
        }
      }

      allMessages.push(...messages);
    } catch (error) {
      callbacks?.onProgress?.(`Failed to fetch from channel ${channelId}: ${error}`);
      // Continue with other channels
    }
  }

  callbacks?.onProgress?.(`Fetched ${allMessages.length} messages from ${config.slackChannels.length} channels`);

  if (allMessages.length === 0) {
    return {
      content: '# Daily Brief\n\nNo new messages to report in the configured time window.',
      sources: [],
      stats: {
        channelsProcessed: config.slackChannels.length,
        messagesProcessed: 0,
        latencyMs: Date.now() - startTime,
      },
    };
  }

  // Build citation context
  callbacks?.onProgress?.('Processing messages and tracking citations');
  const citationTracker = new CitationTracker();
  const messagesContext = formatMessagesForPrompt(allMessages, citationTracker, permalinks);

  // Build LLM prompt
  const systemPrompt = `You are an AI assistant helping a product manager stay informed about their team's activities.
You will be given messages from Slack channels. Your job is to:
1. Synthesize the key information into a concise daily brief
2. Highlight important decisions, announcements, and discussions
3. Note any action items or follow-ups needed
4. Use citation numbers [1], [2], etc. to reference specific messages

Format your response as markdown with clear sections.`;

  const userPrompt = `Generate a Daily Brief from the following Slack activity from the last ${config.dataTimeframeHours} hours.

${messagesContext}

Create a well-organized brief with:
- Executive summary (2-3 sentences)
- Key highlights by topic/theme
- Action items and follow-ups (if any)
- Notable discussions

Use [N] citation format to reference specific messages. Be concise but comprehensive.`;

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

  return {
    content: fullContent,
    sources: sourceRecords,
    stats: {
      channelsProcessed: config.slackChannels.length,
      messagesProcessed: allMessages.length,
      tokensUsed: llmResponse.usage.promptTokens + llmResponse.usage.completionTokens,
      latencyMs: Date.now() - startTime,
    },
  };
}
