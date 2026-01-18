import { decryptTokens, type OAuthTokens } from '../connectors';
import type {
  EncryptedCredentials,
  FetchedItem,
  FetchResult,
  IFetcher,
  SlackFetchOptions,
  SlackMessageMetadata,
} from './types';

// ============================================================================
// Internal Types for Slack API Responses
// ============================================================================

interface SlackApiMessage {
  ts: string;
  user?: string;
  text: string;
  thread_ts?: string;
  reply_count?: number;
  reactions?: Array<{ name: string; count: number }>;
}

interface SlackMessagesResponse {
  ok: boolean;
  error?: string;
  messages?: SlackApiMessage[];
  has_more?: boolean;
  response_metadata?: {
    next_cursor?: string;
  };
}

interface SlackPermalinkResponse {
  ok: boolean;
  permalink?: string;
  error?: string;
}

interface SlackUserInfo {
  id: string;
  name: string;
  realName?: string;
  isBot: boolean;
}

// ============================================================================
// Slack Fetcher Implementation
// ============================================================================

/**
 * Fetcher for Slack messages.
 * Implements the IFetcher interface for use by any agent.
 *
 * @example
 * ```typescript
 * // Create from encrypted credentials
 * const fetcher = SlackFetcher.fromEncrypted({
 *   encryptedBlob: '...',
 *   encryptionKey: '...',
 * });
 *
 * // Fetch messages from channels
 * const result = await fetcher.fetch({
 *   channelIds: ['C1234567890'],
 *   sinceHoursAgo: 24,
 * });
 *
 * // Process fetched items
 * for (const item of result.items) {
 *   console.log(`[${item.author.name}] ${item.content}`);
 * }
 * ```
 */
export class SlackFetcher implements IFetcher<SlackMessageMetadata, SlackFetchOptions> {
  readonly connector = 'slack';
  readonly sourceTypes = ['slack_message'] as const;

  private accessToken: string;
  private userCache: Map<string, SlackUserInfo> = new Map();

  constructor(tokens: OAuthTokens) {
    this.accessToken = tokens.accessToken;
  }

  /**
   * Create fetcher from encrypted credential blob.
   */
  static fromEncrypted(credentials: EncryptedCredentials): SlackFetcher {
    const tokens = decryptTokens(credentials.encryptedBlob, credentials.encryptionKey);
    return new SlackFetcher(tokens);
  }

  /**
   * Fetch messages from specified Slack channels.
   */
  async fetch(options: SlackFetchOptions): Promise<FetchResult<SlackMessageMetadata>> {
    const startTime = Date.now();
    const { channelIds, sinceHoursAgo = 24, onProgress } = options;

    const items: FetchedItem<SlackMessageMetadata>[] = [];

    // Fetch channel names first
    const channelNames = await this.fetchChannelNames(channelIds);

    for (const channelId of channelIds) {
      const channelName = channelNames.get(channelId) || channelId;
      onProgress?.(`Fetching messages from #${channelName}...`);

      const channelMessages = await this.fetchChannelMessages(
        channelId,
        channelName,
        sinceHoursAgo
      );

      // Fetch permalinks for messages (batched to avoid rate limits)
      for (const item of channelMessages) {
        const permalink = await this.getMessagePermalink(channelId, item.externalId);
        if (permalink) {
          item.url = permalink;
          item.metadata.permalink = permalink;
        }
      }

      items.push(...channelMessages);
      onProgress?.(`Found ${channelMessages.length} messages in #${channelName}`);
    }

    return {
      connector: this.connector,
      items,
      stats: {
        itemsProcessed: items.length,
        durationMs: Date.now() - startTime,
      },
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Fetch channel names from channel IDs.
   */
  private async fetchChannelNames(channelIds: string[]): Promise<Map<string, string>> {
    const names = new Map<string, string>();

    for (const channelId of channelIds) {
      try {
        const url = new URL('https://slack.com/api/conversations.info');
        url.searchParams.set('channel', channelId);

        const response = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        });

        const data = await response.json();
        if (data.ok && data.channel?.name) {
          names.set(channelId, data.channel.name);
        }
      } catch {
        // If we can't get the name, use the ID
        names.set(channelId, channelId);
      }
    }

    return names;
  }

  /**
   * Fetch messages from a channel within a time window.
   */
  private async fetchChannelMessages(
    channelId: string,
    channelName: string,
    sinceHoursAgo: number
  ): Promise<FetchedItem<SlackMessageMetadata>[]> {
    const oldestTimestamp = Math.floor(
      (Date.now() - sinceHoursAgo * 60 * 60 * 1000) / 1000
    ).toString();

    const items: FetchedItem<SlackMessageMetadata>[] = [];
    let cursor: string | undefined;

    do {
      const url = new URL('https://slack.com/api/conversations.history');
      url.searchParams.set('channel', channelId);
      url.searchParams.set('oldest', oldestTimestamp);
      url.searchParams.set('limit', '200');
      if (cursor) {
        url.searchParams.set('cursor', cursor);
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      const data: SlackMessagesResponse = await response.json();

      if (!data.ok) {
        throw new Error(`Slack API error: ${data.error}`);
      }

      if (data.messages) {
        for (const msg of data.messages) {
          // Skip bot messages and system messages
          if (!msg.user) continue;

          const user = await this.getUser(msg.user);

          const item: FetchedItem<SlackMessageMetadata> = {
            externalId: msg.ts,
            sourceType: 'slack_message',
            title: this.generateMessageTitle(msg.text, channelName),
            url: null, // Will be filled in by permalink fetch
            content: msg.text,
            timestamp: new Date(parseFloat(msg.ts) * 1000),
            author: {
              id: msg.user,
              name: user?.realName || user?.name || 'Unknown',
            },
            metadata: {
              channelId,
              channelName,
              threadTs: msg.thread_ts,
              replyCount: msg.reply_count,
              reactions: msg.reactions,
            },
          };

          items.push(item);
        }
      }

      cursor = data.response_metadata?.next_cursor;
    } while (cursor);

    return items;
  }

  /**
   * Get permalink for a message.
   */
  private async getMessagePermalink(channelId: string, messageTs: string): Promise<string | null> {
    const url = new URL('https://slack.com/api/chat.getPermalink');
    url.searchParams.set('channel', channelId);
    url.searchParams.set('message_ts', messageTs);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const data: SlackPermalinkResponse = await response.json();

    if (!data.ok) {
      return null;
    }

    return data.permalink || null;
  }

  /**
   * Get user info (cached).
   */
  private async getUser(userId: string): Promise<SlackUserInfo | null> {
    if (this.userCache.has(userId)) {
      return this.userCache.get(userId)!;
    }

    const url = new URL('https://slack.com/api/users.info');
    url.searchParams.set('user', userId);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const data = await response.json();

    if (!data.ok || !data.user) {
      return null;
    }

    const user: SlackUserInfo = {
      id: data.user.id,
      name: data.user.name,
      realName: data.user.real_name,
      isBot: data.user.is_bot,
    };

    this.userCache.set(userId, user);
    return user;
  }

  /**
   * Generate a title for a message based on content preview.
   */
  private generateMessageTitle(text: string, channelName: string): string {
    const preview = text.slice(0, 50);
    const truncated = preview.length < text.length ? preview + '...' : preview;
    return `Message in #${channelName}: ${truncated}`;
  }
}
