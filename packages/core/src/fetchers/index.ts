/**
 * @module fetchers
 *
 * Independent connector fetchers for retrieving data from external systems.
 * Each fetcher implements the IFetcher interface and can be used by any agent.
 *
 * @example
 * ```typescript
 * import { SlackFetcher, GmailFetcher, type FetchedItem } from '@pmkit/core/fetchers';
 *
 * // Create fetchers from encrypted credentials
 * const slackFetcher = SlackFetcher.fromEncrypted(slackCredentials);
 * const gmailFetcher = GmailFetcher.fromEncrypted(gmailCredentials);
 *
 * // Fetch data in parallel
 * const [slackResult, gmailResult] = await Promise.all([
 *   slackFetcher.fetch({ channelIds: ['C1234'], sinceHoursAgo: 24 }),
 *   gmailFetcher.fetch({ labels: ['INBOX'], sinceHoursAgo: 24 }),
 * ]);
 *
 * // Combine items from all sources
 * const allItems: FetchedItem[] = [
 *   ...slackResult.items,
 *   ...gmailResult.items,
 * ];
 * ```
 */

// Types
export type {
  ConnectorSourceType,
  EncryptedCredentials,
  FetchOptions,
  FetchedItem,
  FetchResult,
  IFetcher,
  // Slack-specific
  SlackMessageMetadata,
  SlackFetchOptions,
  // Gmail-specific
  GmailMessageMetadata,
  GmailFetchOptions,
  // Calendar-specific
  CalendarEventMetadata,
  CalendarFetchOptions,
  // Drive-specific
  DriveFileMetadata,
  DriveFetchOptions,
  // Jira-specific
  JiraIssueMetadata,
  JiraFetchOptions,
  // Confluence-specific
  ConfluencePageMetadata,
  ConfluenceFetchOptions,
} from './types';

// Zendesk-specific types (from fetcher)
export type {
  ZendeskTicketMetadata,
  ZendeskFetchOptions,
} from './zendesk-fetcher';

export { ConnectorSourceTypeSchema } from './types';

// Fetchers
export { SlackFetcher } from './slack-fetcher';
export { GmailFetcher } from './gmail-fetcher';
export { CalendarFetcher } from './calendar-fetcher';
export { DriveFetcher } from './drive-fetcher';
export { JiraFetcher } from './jira-fetcher';
export { ConfluenceFetcher } from './confluence-fetcher';
export { ZendeskFetcher } from './zendesk-fetcher';
