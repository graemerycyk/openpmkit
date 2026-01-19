import { decryptTokens, type OAuthTokens } from '../connectors';
import type {
  EncryptedCredentials,
  FetchedItem,
  FetchResult,
  IFetcher,
  GmailFetchOptions,
  GmailMessageMetadata,
} from './types';

// ============================================================================
// Internal Types for Gmail API Responses
// ============================================================================

interface GmailMessagePart {
  mimeType?: string;
  body?: { data?: string; size?: number };
  parts?: GmailMessagePart[];
}

interface GmailApiMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet: string;
  payload?: {
    headers?: Array<{ name: string; value: string }>;
    mimeType?: string;
    body?: { data?: string; size?: number };
    parts?: GmailMessagePart[];
  };
  internalDate?: string;
}

// ============================================================================
// Gmail Fetcher Implementation
// ============================================================================

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1';

/**
 * Fetcher for Gmail emails.
 * Implements the IFetcher interface for use by any agent.
 *
 * @example
 * ```typescript
 * // Create from encrypted credentials
 * const fetcher = GmailFetcher.fromEncrypted({
 *   encryptedBlob: '...',
 *   encryptionKey: '...',
 * });
 *
 * // Fetch recent emails
 * const result = await fetcher.fetch({
 *   labels: ['INBOX', 'IMPORTANT'],
 *   sinceHoursAgo: 24,
 * });
 *
 * // Process fetched items
 * for (const item of result.items) {
 *   console.log(`[${item.author.name}] ${item.title}`);
 * }
 * ```
 */
export class GmailFetcher implements IFetcher<GmailMessageMetadata, GmailFetchOptions> {
  readonly connector = 'gmail';
  readonly sourceTypes = ['gmail_email'] as const;

  private tokens: OAuthTokens;

  constructor(tokens: OAuthTokens) {
    this.tokens = tokens;
  }

  /**
   * Create fetcher from encrypted credential blob.
   */
  static fromEncrypted(credentials: EncryptedCredentials): GmailFetcher {
    const tokens = decryptTokens(credentials.encryptedBlob, credentials.encryptionKey);
    return new GmailFetcher(tokens);
  }

  /**
   * Fetch emails from Gmail.
   */
  async fetch(options: GmailFetchOptions): Promise<FetchResult<GmailMessageMetadata>> {
    const startTime = Date.now();
    const {
      labels = ['INBOX'],
      starredOnly,
      unreadOnly,
      sinceHoursAgo = 24,
      limit = 50,
      onProgress,
    } = options;

    const items: FetchedItem<GmailMessageMetadata>[] = [];

    onProgress?.('Fetching Gmail messages...');

    try {
      // Build Gmail search query
      const queryParts: string[] = [];

      // Label filters - use OR logic for multiple labels (not AND)
      // Gmail search uses space as AND, so we need explicit OR syntax
      if (labels.length === 1) {
        queryParts.push(`label:${labels[0]}`);
      } else if (labels.length > 1) {
        // Wrap multiple labels in OR group: {label:INBOX label:IMPORTANT}
        // Gmail's curly braces mean "any of these"
        const labelQuery = labels.map(l => `label:${l}`).join(' ');
        queryParts.push(`{${labelQuery}}`);
      }

      // Optional filters
      if (starredOnly) {
        queryParts.push('is:starred');
      }
      if (unreadOnly) {
        queryParts.push('is:unread');
      }

      // Time filter
      const sinceDate = new Date(Date.now() - sinceHoursAgo * 60 * 60 * 1000);
      queryParts.push(`after:${Math.floor(sinceDate.getTime() / 1000)}`);

      const query = queryParts.join(' ');

      // List messages
      const listUrl = `${GMAIL_API_BASE}/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${limit}`;
      const listResponse = await this.makeRequest<{ messages?: Array<{ id: string }>; resultSizeEstimate?: number }>(
        listUrl
      );

      if (!listResponse.messages?.length) {
        onProgress?.('No messages found');
        return {
          connector: this.connector,
          items: [],
          stats: {
            itemsProcessed: 0,
            durationMs: Date.now() - startTime,
          },
        };
      }

      onProgress?.(`Found ${listResponse.messages.length} messages, fetching details...`);

      // Fetch full message details in parallel (with concurrency limit)
      const BATCH_SIZE = 10;
      const messageIds = listResponse.messages.slice(0, limit).map((m) => m.id);

      for (let i = 0; i < messageIds.length; i += BATCH_SIZE) {
        const batch = messageIds.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
          batch.map(async (id) => {
            try {
              const msg = await this.makeRequest<GmailApiMessage>(
                `${GMAIL_API_BASE}/users/me/messages/${id}?format=full`
              );
              return this.transformMessage(msg);
            } catch (error) {
              console.warn(`Failed to fetch message ${id}:`, error);
              return null;
            }
          })
        );

        for (const item of batchResults) {
          if (item) {
            items.push(item);
          }
        }
      }

      onProgress?.(`Fetched ${items.length} messages from Gmail`);
    } catch (error) {
      onProgress?.(`Gmail fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
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
   * Make an authenticated request to the Gmail API.
   */
  private async makeRequest<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.tokens.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gmail API error: ${response.status} ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Transform Gmail API message to FetchedItem.
   */
  private transformMessage(msg: GmailApiMessage): FetchedItem<GmailMessageMetadata> {
    const headers = msg.payload?.headers ?? [];
    const getHeader = (name: string) =>
      headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? '';

    const from = this.parseEmailAddress(getHeader('From'));
    const to = this.parseEmailAddresses(getHeader('To'));
    const cc = this.parseEmailAddresses(getHeader('Cc'));
    const subject = getHeader('Subject') || '(no subject)';

    // Extract body
    let body = '';
    if (msg.payload?.body?.data) {
      body = this.decodeBase64(msg.payload.body.data);
    } else if (msg.payload?.parts) {
      body = this.extractBodyFromParts(msg.payload.parts);
    }

    // Use snippet if body extraction failed
    if (!body) {
      body = msg.snippet;
    }

    const timestamp = msg.internalDate
      ? new Date(parseInt(msg.internalDate))
      : new Date();

    return {
      externalId: msg.id,
      sourceType: 'gmail_email',
      title: subject,
      url: `https://mail.google.com/mail/u/0/#inbox/${msg.id}`,
      content: body,
      timestamp,
      author: {
        id: from.email,
        name: from.name,
        email: from.email,
      },
      metadata: {
        threadId: msg.threadId,
        labels: msg.labelIds ?? [],
        isRead: !(msg.labelIds?.includes('UNREAD') ?? false),
        isStarred: msg.labelIds?.includes('STARRED') ?? false,
        hasAttachments: this.hasAttachments(msg.payload?.parts),
        to,
        cc: cc.length > 0 ? cc : undefined,
        snippet: msg.snippet,
      },
    };
  }

  /**
   * Parse email address from "Name <email@example.com>" format.
   */
  private parseEmailAddress(str: string): { name: string; email: string } {
    const match = str.match(/^(?:"?([^"<]*)"?\s*)?<?([^>]+)>?$/);
    if (match) {
      return {
        name: match[1]?.trim() || match[2]?.split('@')[0] || '',
        email: match[2]?.trim() || str,
      };
    }
    return { name: str.split('@')[0] || '', email: str };
  }

  /**
   * Parse multiple email addresses.
   */
  private parseEmailAddresses(str: string): Array<{ name: string; email: string }> {
    if (!str) return [];
    return str.split(',').map((s) => this.parseEmailAddress(s.trim()));
  }

  /**
   * Decode Gmail's URL-safe base64.
   */
  private decodeBase64(data: string): string {
    try {
      const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
      return Buffer.from(base64, 'base64').toString('utf8');
    } catch {
      return '';
    }
  }

  /**
   * Extract plain text body from MIME parts.
   */
  private extractBodyFromParts(parts?: GmailMessagePart[]): string {
    if (!parts) return '';

    // First try to find plain text
    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return this.decodeBase64(part.body.data);
      }
      if (part.parts) {
        const body = this.extractBodyFromParts(part.parts);
        if (body) return body;
      }
    }

    // Fall back to HTML (stripped)
    for (const part of parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        const html = this.decodeBase64(part.body.data);
        return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }
    }

    return '';
  }

  /**
   * Check if message has attachments.
   */
  private hasAttachments(parts?: GmailMessagePart[]): boolean {
    if (!parts) return false;
    return parts.some(
      (p) =>
        (p.mimeType &&
          !p.mimeType.startsWith('text/') &&
          !p.mimeType.startsWith('multipart/')) ||
        (p.parts && this.hasAttachments(p.parts))
    );
  }
}
