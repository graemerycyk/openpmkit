import type { ConnectorSourceType, FetchedItem, SlackMessageMetadata } from '../../fetchers/types';
import type { ISourceFormatter } from '../types';

/**
 * Formatter for Slack message sources.
 */
export class SlackFormatter implements ISourceFormatter<SlackMessageMetadata> {
  readonly sourceType: ConnectorSourceType = 'slack_message';

  formatForCitation(item: FetchedItem<SlackMessageMetadata>): {
    title: string;
    contextLabel: string;
    contentPreview: string;
  } {
    const channelName = item.metadata.channelName || 'unknown channel';
    const replyInfo = item.metadata.replyCount
      ? ` (${item.metadata.replyCount} replies)`
      : '';

    return {
      title: `Message in #${channelName}${replyInfo}`,
      contextLabel: `#${channelName}`,
      contentPreview: this.truncateContent(item.content),
    };
  }

  formatForPrompt(
    items: FetchedItem<SlackMessageMetadata>[],
    getCitationNumber: (item: FetchedItem<SlackMessageMetadata>) => number
  ): string {
    if (items.length === 0) {
      return '';
    }

    // Group by channel
    const byChannel = new Map<string, FetchedItem<SlackMessageMetadata>[]>();
    for (const item of items) {
      const channelName = item.metadata.channelName || 'unknown';
      const group = byChannel.get(channelName) ?? [];
      group.push(item);
      byChannel.set(channelName, group);
    }

    const sections: string[] = ['## Slack Messages', ''];

    for (const [channelName, channelItems] of byChannel) {
      sections.push(`### #${channelName}`, '');

      // Sort by timestamp
      const sorted = [...channelItems].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );

      for (const item of sorted) {
        const citationNum = getCitationNumber(item);
        const time = item.timestamp.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        });
        const replyInfo = item.metadata.replyCount
          ? ` (${item.metadata.replyCount} replies)`
          : '';

        sections.push(
          `[${citationNum}] ${time} @${item.author.name}${replyInfo}: ${item.content}`
        );
      }

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
