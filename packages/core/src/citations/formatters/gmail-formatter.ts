import type { ConnectorSourceType, FetchedItem, GmailMessageMetadata } from '../../fetchers/types';
import type { ISourceFormatter } from '../types';

/**
 * Formatter for Gmail email sources.
 */
export class GmailFormatter implements ISourceFormatter<GmailMessageMetadata> {
  readonly sourceType: ConnectorSourceType = 'gmail_email';

  formatForCitation(item: FetchedItem<GmailMessageMetadata>): {
    title: string;
    contextLabel: string;
    contentPreview: string;
  } {
    const labels = item.metadata.labels || [];
    const labelStr = labels.length > 0 ? labels.slice(0, 2).join(', ') : 'Email';
    const attachmentInfo = item.metadata.hasAttachments ? ' (with attachments)' : '';

    return {
      title: item.title + attachmentInfo,
      contextLabel: labelStr,
      contentPreview: item.metadata.snippet || this.truncateContent(item.content),
    };
  }

  formatForPrompt(
    items: FetchedItem<GmailMessageMetadata>[],
    getCitationNumber: (item: FetchedItem<GmailMessageMetadata>) => number
  ): string {
    if (items.length === 0) {
      return '';
    }

    // Sort by timestamp (newest first for emails)
    const sorted = [...items].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    const sections: string[] = ['## Gmail Emails', ''];

    for (const item of sorted) {
      const citationNum = getCitationNumber(item);
      const date = item.timestamp.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const time = item.timestamp.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });

      const toList = item.metadata.to?.map(t => t.name || t.email).join(', ') || '';
      const attachmentNote = item.metadata.hasAttachments ? ' 📎' : '';
      const starNote = item.metadata.isStarred ? ' ⭐' : '';
      const unreadNote = !item.metadata.isRead ? ' (unread)' : '';

      sections.push(`### [${citationNum}] ${item.title}${attachmentNote}${starNote}${unreadNote}`);
      sections.push(`**From:** ${item.author.name} <${item.author.email}>`);
      if (toList) {
        sections.push(`**To:** ${toList}`);
      }
      sections.push(`**Date:** ${date} ${time}`);
      sections.push('');
      sections.push(item.content);
      sections.push('');
      sections.push('---');
      sections.push('');
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
