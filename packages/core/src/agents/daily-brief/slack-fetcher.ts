import { decryptTokens, type OAuthTokens } from '../../connectors';

export interface SlackMessage {
  id: string; // ts (timestamp) serves as unique ID
  channelId: string;
  channelName: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
  threadTs?: string;
  replyCount?: number;
  reactions?: Array<{ name: string; count: number }>;
  permalink?: string;
}

export interface SlackUser {
  id: string;
  name: string;
  realName?: string;
  isBot: boolean;
}

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

interface SlackUsersResponse {
  ok: boolean;
  error?: string;
  members?: Array<{
    id: string;
    name: string;
    real_name?: string;
    is_bot: boolean;
  }>;
}

interface SlackPermalinkResponse {
  ok: boolean;
  permalink?: string;
  error?: string;
}

/**
 * Slack data fetcher for Daily Brief agent
 */
export class SlackFetcher {
  private accessToken: string;
  private userCache: Map<string, SlackUser> = new Map();

  constructor(tokens: OAuthTokens) {
    this.accessToken = tokens.accessToken;
  }

  /**
   * Create fetcher from encrypted credential blob
   */
  static fromEncrypted(encryptedBlob: string, encryptionKey: string): SlackFetcher {
    const tokens = decryptTokens(encryptedBlob, encryptionKey);
    return new SlackFetcher(tokens);
  }

  /**
   * Fetch messages from a channel within a time window
   */
  async fetchChannelMessages(
    channelId: string,
    channelName: string,
    sinceHoursAgo: number = 24,
    onProgress?: (message: string) => void
  ): Promise<SlackMessage[]> {
    const oldestTimestamp = Math.floor(
      (Date.now() - sinceHoursAgo * 60 * 60 * 1000) / 1000
    ).toString();

    const messages: SlackMessage[] = [];
    let cursor: string | undefined;

    onProgress?.(`Fetching messages from #${channelName}...`);

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

          messages.push({
            id: msg.ts,
            channelId,
            channelName,
            userId: msg.user,
            userName: user?.realName || user?.name || 'Unknown',
            text: msg.text,
            timestamp: new Date(parseFloat(msg.ts) * 1000),
            threadTs: msg.thread_ts,
            replyCount: msg.reply_count,
            reactions: msg.reactions,
          });
        }
      }

      cursor = data.response_metadata?.next_cursor;
    } while (cursor);

    onProgress?.(`Found ${messages.length} messages in #${channelName}`);

    return messages;
  }

  /**
   * Fetch thread replies for a message
   */
  async fetchThreadReplies(
    channelId: string,
    threadTs: string
  ): Promise<SlackMessage[]> {
    const messages: SlackMessage[] = [];
    let cursor: string | undefined;

    do {
      const url = new URL('https://slack.com/api/conversations.replies');
      url.searchParams.set('channel', channelId);
      url.searchParams.set('ts', threadTs);
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
        // Skip the first message (parent) as we already have it
        const replies = data.messages.slice(1);

        for (const msg of replies) {
          if (!msg.user) continue;

          const user = await this.getUser(msg.user);

          messages.push({
            id: msg.ts,
            channelId,
            channelName: '', // Will be filled in by caller
            userId: msg.user,
            userName: user?.realName || user?.name || 'Unknown',
            text: msg.text,
            timestamp: new Date(parseFloat(msg.ts) * 1000),
            threadTs: msg.thread_ts,
          });
        }
      }

      cursor = data.response_metadata?.next_cursor;
    } while (cursor);

    return messages;
  }

  /**
   * Get permalink for a message
   */
  async getMessagePermalink(channelId: string, messageTs: string): Promise<string | null> {
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
      console.warn(`Failed to get permalink: ${data.error}`);
      return null;
    }

    return data.permalink || null;
  }

  /**
   * Get user info (cached)
   */
  private async getUser(userId: string): Promise<SlackUser | null> {
    if (this.userCache.has(userId)) {
      return this.userCache.get(userId)!;
    }

    // Fetch user info
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

    const user: SlackUser = {
      id: data.user.id,
      name: data.user.name,
      realName: data.user.real_name,
      isBot: data.user.is_bot,
    };

    this.userCache.set(userId, user);
    return user;
  }

  /**
   * Fetch all workspace users (for bulk lookup)
   */
  async fetchAllUsers(): Promise<Map<string, SlackUser>> {
    let cursor: string | undefined;

    do {
      const url = new URL('https://slack.com/api/users.list');
      url.searchParams.set('limit', '200');
      if (cursor) {
        url.searchParams.set('cursor', cursor);
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      const data: SlackUsersResponse = await response.json();

      if (!data.ok) {
        throw new Error(`Slack API error: ${data.error}`);
      }

      if (data.members) {
        for (const member of data.members) {
          this.userCache.set(member.id, {
            id: member.id,
            name: member.name,
            realName: member.real_name,
            isBot: member.is_bot,
          });
        }
      }

      cursor = undefined; // users.list doesn't use cursor pagination the same way
    } while (cursor);

    return this.userCache;
  }
}
