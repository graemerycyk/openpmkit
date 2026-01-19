import { decryptTokens, encryptTokens, type OAuthTokens } from '../connectors';
import type {
  EncryptedCredentials,
  FetchedItem,
  FetchResult,
  IFetcher,
  GmailFetchOptions,
  GmailMessageMetadata,
} from './types';

// Google OAuth token refresh endpoint
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

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
  private encryptionKey?: string;
  private googleClientId?: string;
  private googleClientSecret?: string;

  constructor(tokens: OAuthTokens, encryptionKey?: string) {
    this.tokens = tokens;
    this.encryptionKey = encryptionKey;
    this.googleClientId = process.env.GOOGLE_CLIENT_ID;
    this.googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  }

  /**
   * Create fetcher from encrypted credential blob.
   */
  static fromEncrypted(credentials: EncryptedCredentials): GmailFetcher {
    const tokens = decryptTokens(credentials.encryptedBlob, credentials.encryptionKey);
    return new GmailFetcher(tokens, credentials.encryptionKey);
  }

  /**
   * Get the current (possibly refreshed) encrypted blob for credential updates.
   */
  getUpdatedEncryptedBlob(): string | null {
    if (!this.encryptionKey) return null;
    return encryptTokens(this.tokens, this.encryptionKey);
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
      console.log(`[GmailFetcher] Search query: ${query}`);

      // List messages
      const listUrl = `${GMAIL_API_BASE}/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${limit}`;
      console.log(`[GmailFetcher] Fetching from: ${listUrl}`);

      const listResponse = await this.makeRequest<{ messages?: Array<{ id: string }>; resultSizeEstimate?: number }>(
        listUrl
      );

      console.log(`[GmailFetcher] API response: ${JSON.stringify({ messageCount: listResponse.messages?.length, resultSizeEstimate: listResponse.resultSizeEstimate })}`);

      if (!listResponse.messages?.length) {
        onProgress?.(`No messages found matching query: ${query}`);
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
   * Handles token refresh on 401 errors.
   */
  private async makeRequest<T>(url: string, retryAfterRefresh = true): Promise<T> {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.tokens.accessToken}`,
      },
    });

    // Handle token expiration - try to refresh
    if (response.status === 401 && retryAfterRefresh && this.tokens.refreshToken) {
      console.log('[GmailFetcher] Access token expired, attempting refresh...');
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry the request with the new token
        return this.makeRequest<T>(url, false);
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gmail API error: ${response.status} ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Refresh the access token using the refresh token.
   */
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.tokens.refreshToken) {
      console.warn('[GmailFetcher] No refresh token available');
      return false;
    }

    if (!this.googleClientId || !this.googleClientSecret) {
      console.warn('[GmailFetcher] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET for token refresh');
      return false;
    }

    try {
      const response = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.googleClientId,
          client_secret: this.googleClientSecret,
          refresh_token: this.tokens.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GmailFetcher] Token refresh failed:', errorText);
        return false;
      }

      const data = await response.json();

      // Update tokens (refresh token stays the same, access token is new)
      this.tokens = {
        ...this.tokens,
        accessToken: data.access_token,
        expiresIn: data.expires_in,
        expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      };

      console.log('[GmailFetcher] Access token refreshed successfully');
      return true;
    } catch (error) {
      console.error('[GmailFetcher] Token refresh error:', error);
      return false;
    }
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
