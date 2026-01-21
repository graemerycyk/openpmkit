import type { ConnectorSourceType, FetchedItem } from '../../fetchers/types';
import type { ZendeskTicketMetadata } from '../../fetchers/zendesk-fetcher';
import type { ISourceFormatter } from '../types';

/**
 * Formatter for Zendesk ticket sources.
 */
export class ZendeskFormatter implements ISourceFormatter<ZendeskTicketMetadata> {
  readonly sourceType: ConnectorSourceType = 'zendesk_ticket';

  formatForCitation(item: FetchedItem<ZendeskTicketMetadata>): {
    title: string;
    contextLabel: string;
    contentPreview: string;
  } {
    const status = item.metadata.status || 'unknown';
    const priority = item.metadata.priority || 'normal';
    const orgName = item.metadata.organization?.name;

    const contextParts: string[] = [status];
    if (priority !== 'normal') {
      contextParts.unshift(priority);
    }
    if (orgName) {
      contextParts.push(orgName);
    }

    return {
      title: item.title,
      contextLabel: contextParts.join(' - '),
      contentPreview: this.truncateContent(item.content),
    };
  }

  formatForPrompt(
    items: FetchedItem<ZendeskTicketMetadata>[],
    getCitationNumber: (item: FetchedItem<ZendeskTicketMetadata>) => number
  ): string {
    if (items.length === 0) {
      return '';
    }

    // Group by priority
    const byPriority = new Map<string, FetchedItem<ZendeskTicketMetadata>[]>();
    for (const item of items) {
      const priority = item.metadata.priority || 'normal';
      const group = byPriority.get(priority) ?? [];
      group.push(item);
      byPriority.set(priority, group);
    }

    const sections: string[] = ['## Zendesk Tickets', ''];
    const priorityOrder = ['urgent', 'high', 'normal', 'low'];

    for (const priority of priorityOrder) {
      const priorityItems = byPriority.get(priority);
      if (!priorityItems || priorityItems.length === 0) continue;

      const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);
      sections.push(`### ${priorityLabel} Priority`, '');

      // Sort by timestamp (newest first)
      const sorted = [...priorityItems].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );

      for (const item of sorted) {
        const citationNum = getCitationNumber(item);
        const status = item.metadata.status || 'unknown';
        const orgName = item.metadata.organization?.name;
        const orgLabel = orgName ? ` (${orgName})` : '';

        sections.push(
          `[${citationNum}] **${item.title}** [${status}]${orgLabel}`
        );

        // Include content preview for context
        if (item.content) {
          const preview = this.truncateContent(item.content, 200);
          sections.push(`> ${preview}`);
        }

        sections.push('');
      }
    }

    return sections.join('\n');
  }

  private truncateContent(content: string, maxLength: number = 200): string {
    if (content.length <= maxLength) {
      return content;
    }
    return content.slice(0, maxLength - 3) + '...';
  }
}
