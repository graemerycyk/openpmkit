import type { ConnectorSourceType, FetchedItem } from '../fetchers/types';
import type {
  CitableSource,
  CitationContext,
  ICitationTracker,
  ISourceFormatter,
  SourceRecord,
} from './types';

// ============================================================================
// Source Type Display Names
// ============================================================================

const SOURCE_TYPE_HEADERS: Record<ConnectorSourceType, string> = {
  slack_message: 'Slack Messages',
  gmail_email: 'Gmail Emails',
  gmail_thread: 'Gmail Threads',
  calendar_event: 'Calendar Events',
  drive_file: 'Google Drive Files',
  jira_issue: 'Jira Issues',
  confluence_page: 'Confluence Pages',
  gong_call: 'Gong Calls',
  zendesk_ticket: 'Zendesk Tickets',
  community_post: 'Community Posts',
  analytics_event: 'Analytics Events',
  competitor_page: 'Competitor Pages',
  internal_doc: 'Internal Documents',
};

// ============================================================================
// Citation Tracker Implementation
// ============================================================================

/**
 * Unified citation tracker that supports multiple source types.
 *
 * @example
 * ```typescript
 * const tracker = new CitationTracker();
 *
 * // Register formatters for each source type
 * tracker.registerFormatter(new SlackFormatter());
 * tracker.registerFormatter(new GmailFormatter());
 *
 * // Register sources
 * for (const item of fetchedItems) {
 *   const citationNum = tracker.register(item, item.url);
 *   console.log(`Registered [${citationNum}]`);
 * }
 *
 * // Generate sources section for artifact
 * const sourcesMarkdown = tracker.generateSourcesMarkdown();
 * ```
 */
export class CitationTracker implements ICitationTracker {
  private citations: CitableSource[] = [];
  private sourceMap: Map<string, number> = new Map();
  private formatters: Map<ConnectorSourceType, ISourceFormatter> = new Map();
  private nextNumber = 1;

  /**
   * Register a source formatter for a specific source type.
   */
  registerFormatter(formatter: ISourceFormatter): void {
    this.formatters.set(formatter.sourceType, formatter);
  }

  /**
   * Register a fetched item as a citable source.
   * Returns the citation number assigned to this source.
   */
  register(item: FetchedItem, url?: string | null): number {
    const compositeId = `${item.sourceType}:${item.externalId}`;

    // Return existing citation number if already registered
    const existing = this.sourceMap.get(compositeId);
    if (existing !== undefined) {
      return existing;
    }

    // Get formatter for this source type
    const formatter = this.formatters.get(item.sourceType);
    const formatted = formatter?.formatForCitation(item) ?? {
      title: item.title,
      contextLabel: item.sourceType.replace('_', ' '),
      contentPreview: this.truncateContent(item.content),
    };

    const citation: CitableSource = {
      number: this.nextNumber,
      sourceType: item.sourceType,
      compositeId,
      title: formatted.title,
      url: url ?? item.url,
      contentPreview: formatted.contentPreview,
      author: item.author.name,
      timestamp: item.timestamp,
      contextLabel: formatted.contextLabel,
    };

    this.citations.push(citation);
    this.sourceMap.set(compositeId, this.nextNumber);

    return this.nextNumber++;
  }

  /**
   * Get citation number for a previously registered source.
   */
  getCitationNumber(sourceType: ConnectorSourceType, externalId: string): number | undefined {
    const compositeId = `${sourceType}:${externalId}`;
    return this.sourceMap.get(compositeId);
  }

  /**
   * Get all registered citations.
   */
  getCitations(): CitableSource[] {
    return [...this.citations];
  }

  /**
   * Get the full citation context.
   */
  getContext(): CitationContext {
    return {
      citations: this.getCitations(),
      sourceMap: new Map(this.sourceMap),
    };
  }

  /**
   * Generate markdown section listing all sources.
   */
  generateSourcesMarkdown(): string {
    if (this.citations.length === 0) {
      return '';
    }

    // Group citations by source type
    const byType = new Map<ConnectorSourceType, CitableSource[]>();
    for (const citation of this.citations) {
      const group = byType.get(citation.sourceType) ?? [];
      group.push(citation);
      byType.set(citation.sourceType, group);
    }

    const sections: string[] = ['## Sources', ''];

    for (const [sourceType, citations] of byType) {
      const header = SOURCE_TYPE_HEADERS[sourceType] || sourceType.replace('_', ' ');
      sections.push(`### ${header}`, '');

      for (const citation of citations) {
        const timestamp = this.formatTimestamp(citation.timestamp);
        const line = citation.url
          ? `[${citation.number}] [${citation.author} - ${citation.contextLabel}](${citation.url}) - ${timestamp}`
          : `[${citation.number}] ${citation.author} - ${citation.contextLabel} - ${timestamp}`;
        sections.push(line);
      }

      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * Generate source records for database storage.
   */
  generateSourceRecords(tenantId: string): SourceRecord[] {
    return this.citations.map((citation) => ({
      tenantId,
      type: citation.sourceType,
      externalId: citation.compositeId.split(':').slice(1).join(':'),
      title: citation.title,
      url: citation.url,
      content: citation.contentPreview,
      metadata: {
        citationNumber: citation.number,
        contextLabel: citation.contextLabel,
        author: citation.author,
      },
      fetchedAt: citation.timestamp,
    }));
  }

  /**
   * Reset the tracker (clear all citations).
   */
  reset(): void {
    this.citations = [];
    this.sourceMap.clear();
    this.nextNumber = 1;
  }

  /**
   * Get statistics about registered citations.
   */
  getStats(): {
    total: number;
    bySourceType: Record<string, number>;
  } {
    const bySourceType: Record<string, number> = {};
    for (const citation of this.citations) {
      bySourceType[citation.sourceType] = (bySourceType[citation.sourceType] || 0) + 1;
    }
    return {
      total: this.citations.length,
      bySourceType,
    };
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private truncateContent(content: string, maxLength: number = 200): string {
    if (content.length <= maxLength) {
      return content;
    }
    return content.slice(0, maxLength - 3) + '...';
  }

  private formatTimestamp(date: Date): string {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
}
