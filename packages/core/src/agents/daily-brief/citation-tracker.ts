import type { SlackMessage } from './slack-fetcher';

export interface Citation {
  number: number;
  sourceId: string; // External ID (e.g., Slack message ts)
  sourceType: 'slack_message';
  title: string;
  url: string | null;
  content: string;
  channelName: string;
  author: string;
  timestamp: Date;
}

export interface CitationContext {
  citations: Citation[];
  sourceMap: Map<string, number>; // sourceId -> citation number
}

/**
 * Tracks and manages citations for Daily Brief output
 */
export class CitationTracker {
  private citations: Citation[] = [];
  private sourceMap: Map<string, number> = new Map();
  private nextNumber: number = 1;

  /**
   * Register a Slack message as a citable source
   * Returns the citation number
   */
  registerSlackMessage(message: SlackMessage, permalink: string | null): number {
    const sourceId = `${message.channelId}:${message.id}`;

    // Return existing citation number if already registered
    if (this.sourceMap.has(sourceId)) {
      return this.sourceMap.get(sourceId)!;
    }

    const citation: Citation = {
      number: this.nextNumber,
      sourceId,
      sourceType: 'slack_message',
      title: `Message in #${message.channelName}`,
      url: permalink,
      content: truncateText(message.text, 200),
      channelName: message.channelName,
      author: message.userName,
      timestamp: message.timestamp,
    };

    this.citations.push(citation);
    this.sourceMap.set(sourceId, this.nextNumber);

    return this.nextNumber++;
  }

  /**
   * Get citation number for a source (returns undefined if not registered)
   */
  getCitationNumber(channelId: string, messageTs: string): number | undefined {
    return this.sourceMap.get(`${channelId}:${messageTs}`);
  }

  /**
   * Get all citations
   */
  getCitations(): Citation[] {
    return [...this.citations];
  }

  /**
   * Get citation context for passing to orchestrator
   */
  getContext(): CitationContext {
    return {
      citations: this.getCitations(),
      sourceMap: new Map(this.sourceMap),
    };
  }

  /**
   * Generate markdown sources section for the brief
   */
  generateSourcesMarkdown(): string {
    if (this.citations.length === 0) {
      return '';
    }

    const lines = ['## Sources', ''];

    for (const citation of this.citations) {
      const timestamp = citation.timestamp.toLocaleString();
      if (citation.url) {
        lines.push(
          `[${citation.number}] [${citation.author} in #${citation.channelName}](${citation.url}) - ${timestamp}`
        );
      } else {
        lines.push(
          `[${citation.number}] ${citation.author} in #${citation.channelName} - ${timestamp}`
        );
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate sources data for storage in Source model
   */
  generateSourceRecords(tenantId: string): Array<{
    tenantId: string;
    type: 'slack_message';
    externalId: string;
    title: string;
    url: string | null;
    content: string;
    metadata: Record<string, unknown>;
    fetchedAt: Date;
  }> {
    return this.citations.map((citation) => ({
      tenantId,
      type: 'slack_message' as const,
      externalId: citation.sourceId,
      title: citation.title,
      url: citation.url,
      content: citation.content,
      metadata: {
        citationNumber: citation.number,
        channelName: citation.channelName,
        author: citation.author,
      },
      fetchedAt: citation.timestamp,
    }));
  }
}

/**
 * Truncate text to a maximum length, adding ellipsis if truncated
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format messages into a structured context for LLM prompt
 */
export function formatMessagesForPrompt(
  messages: SlackMessage[],
  citationTracker: CitationTracker,
  permalinks: Map<string, string>
): string {
  // Group messages by channel
  const byChannel = new Map<string, SlackMessage[]>();

  for (const msg of messages) {
    if (!byChannel.has(msg.channelName)) {
      byChannel.set(msg.channelName, []);
    }
    byChannel.get(msg.channelName)!.push(msg);
  }

  const sections: string[] = [];

  for (const [channelName, channelMessages] of byChannel) {
    // Sort by timestamp
    channelMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const messageLines: string[] = [];
    for (const msg of channelMessages) {
      const permalink = permalinks.get(`${msg.channelId}:${msg.id}`);
      const citationNum = citationTracker.registerSlackMessage(msg, permalink || null);

      const timestamp = msg.timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      messageLines.push(
        `[${citationNum}] ${timestamp} ${msg.userName}: ${msg.text}`
      );

      // Include thread context if it's a thread parent with replies
      if (msg.replyCount && msg.replyCount > 0) {
        messageLines.push(`  └ ${msg.replyCount} replies in thread`);
      }
    }

    sections.push(`### #${channelName}\n\n${messageLines.join('\n')}`);
  }

  return sections.join('\n\n');
}
