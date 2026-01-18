import { z } from 'zod';

// ============================================================================
// Connector Source Types (extended from existing SourceType)
// ============================================================================

/**
 * All possible source types that can be cited in artifacts.
 * Extends the base SourceType from types/index.ts with Google connectors.
 */
export const ConnectorSourceTypeSchema = z.enum([
  // Existing source types
  'slack_message',
  'jira_issue',
  'confluence_page',
  'gong_call',
  'zendesk_ticket',
  'community_post',
  'analytics_event',
  'competitor_page',
  'internal_doc',
  // Google connector source types
  'gmail_email',
  'gmail_thread',
  'calendar_event',
  'drive_file',
]);
export type ConnectorSourceType = z.infer<typeof ConnectorSourceTypeSchema>;

// ============================================================================
// Encrypted Credentials (passed to fetchers)
// ============================================================================

/**
 * Encrypted credentials for a connector.
 * Fetchers use these to decrypt and authenticate with external APIs.
 */
export interface EncryptedCredentials {
  encryptedBlob: string;
  encryptionKey: string;
}

// ============================================================================
// Fetch Options (common parameters for all fetchers)
// ============================================================================

/**
 * Common fetch options that apply to all fetchers.
 */
export interface FetchOptions {
  /** How many hours back to fetch data (default: 24) */
  sinceHoursAgo?: number;

  /** Maximum number of items to return */
  limit?: number;

  /** Progress callback for long-running fetches */
  onProgress?: (message: string) => void;
}

// ============================================================================
// Fetched Item (common structure returned by all fetchers)
// ============================================================================

/**
 * A single item fetched from a connector.
 * All fetchers return items conforming to this interface.
 *
 * @template TMetadata - Connector-specific metadata (e.g., SlackMessageMetadata)
 */
export interface FetchedItem<TMetadata = unknown> {
  /** Unique ID within the connector (e.g., Slack ts, Gmail message ID) */
  externalId: string;

  /** Source type for citations */
  sourceType: ConnectorSourceType;

  /** Display title for the item */
  title: string;

  /** URL to access this item in the external system (if available) */
  url: string | null;

  /** Text content for LLM consumption */
  content: string;

  /** Timestamp of the item */
  timestamp: Date;

  /** Author/sender information */
  author: {
    id: string;
    name: string;
    email?: string;
  };

  /** Connector-specific metadata */
  metadata: TMetadata;
}

// ============================================================================
// Fetch Result (return type of fetcher.fetch())
// ============================================================================

/**
 * Result of a fetch operation from a connector.
 */
export interface FetchResult<TMetadata = unknown> {
  /** Connector key (e.g., 'slack', 'gmail', 'google-calendar') */
  connector: string;

  /** Fetched items */
  items: FetchedItem<TMetadata>[];

  /** Statistics about the fetch operation */
  stats: {
    itemsProcessed: number;
    durationMs: number;
  };
}

// ============================================================================
// IFetcher Interface (implemented by all connector fetchers)
// ============================================================================

/**
 * Common interface for all connector fetchers.
 * Each fetcher handles its own credential decryption and API calls.
 *
 * @template TMetadata - Connector-specific metadata type
 * @template TOptions - Connector-specific options (extends FetchOptions)
 *
 * @example
 * ```typescript
 * // Create a fetcher from encrypted credentials
 * const slackFetcher = SlackFetcher.fromEncrypted(credentials);
 *
 * // Fetch data
 * const result = await slackFetcher.fetch({
 *   sinceHoursAgo: 24,
 *   channelIds: ['C1234567890'],
 * });
 *
 * // Use fetched items
 * for (const item of result.items) {
 *   console.log(item.title, item.content);
 * }
 * ```
 */
export interface IFetcher<TMetadata = unknown, TOptions extends FetchOptions = FetchOptions> {
  /** Connector key for this fetcher (e.g., 'slack', 'gmail') */
  readonly connector: string;

  /** Source type(s) this fetcher produces */
  readonly sourceTypes: readonly ConnectorSourceType[];

  /**
   * Fetch data from the connector within the configured time window.
   *
   * @param options - Fetch options (includes common and connector-specific options)
   * @returns Promise resolving to fetch result with items and stats
   */
  fetch(options: TOptions): Promise<FetchResult<TMetadata>>;
}

// ============================================================================
// Slack-specific types
// ============================================================================

/**
 * Metadata specific to Slack messages.
 */
export interface SlackMessageMetadata {
  channelId: string;
  channelName: string;
  threadTs?: string;
  replyCount?: number;
  reactions?: Array<{ name: string; count: number }>;
  permalink?: string;
}

/**
 * Slack-specific fetch options.
 */
export interface SlackFetchOptions extends FetchOptions {
  /** Channel IDs to fetch messages from */
  channelIds: string[];
  /** Include DMs/mentions to the user */
  includeMentions?: boolean;
}

// ============================================================================
// Gmail-specific types
// ============================================================================

/**
 * Metadata specific to Gmail messages.
 */
export interface GmailMessageMetadata {
  threadId: string;
  labels: string[];
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  to: Array<{ name: string; email: string }>;
  cc?: Array<{ name: string; email: string }>;
  snippet?: string;
}

/**
 * Gmail-specific fetch options.
 */
export interface GmailFetchOptions extends FetchOptions {
  /** Gmail labels to filter by (e.g., 'INBOX', 'IMPORTANT') */
  labels?: string[];
  /** Only fetch starred emails */
  starredOnly?: boolean;
  /** Only fetch unread emails */
  unreadOnly?: boolean;
  /** Internal domain to identify external senders */
  internalDomain?: string;
}

// ============================================================================
// Google Calendar-specific types
// ============================================================================

/**
 * Metadata specific to Google Calendar events.
 */
export interface CalendarEventMetadata {
  calendarId: string;
  calendarName: string;
  location?: string;
  attendees: Array<{
    name: string;
    email: string;
    responseStatus: 'needsAction' | 'declined' | 'tentative' | 'accepted';
    isOrganizer?: boolean;
  }>;
  meetingLink?: string;
  isAllDay: boolean;
  recurrence?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
}

/**
 * Calendar-specific fetch options.
 */
export interface CalendarFetchOptions extends FetchOptions {
  /** Calendar IDs to include (default: primary) */
  calendarIds?: string[];
  /** Include past events (default: false) */
  includePast?: boolean;
  /** Number of days ahead to fetch events (default: 1) */
  daysAhead?: number;
  /** Internal domain for filtering external meetings */
  internalDomain?: string;
}

// ============================================================================
// Google Drive-specific types
// ============================================================================

/**
 * Metadata specific to Google Drive files.
 */
export interface DriveFileMetadata {
  mimeType: string;
  description?: string;
  modifiedBy: {
    name: string;
    email: string;
  };
  webViewLink: string;
  size?: number;
  starred: boolean;
  shared: boolean;
  parents?: string[];
}

/**
 * Drive-specific fetch options.
 */
export interface DriveFetchOptions extends FetchOptions {
  /** Folder IDs to search in */
  folderIds?: string[];
  /** MIME types to filter by */
  mimeTypes?: string[];
  /** Only fetch starred files */
  starredOnly?: boolean;
  /** Only fetch shared files */
  sharedOnly?: boolean;
  /** Search query */
  query?: string;
}
