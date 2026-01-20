import type { FetchedItem } from '../../fetchers/types';
import { SlackFetcher } from '../../fetchers/slack-fetcher';
import { GmailFetcher } from '../../fetchers/gmail-fetcher';
import { CalendarFetcher } from '../../fetchers/calendar-fetcher';
import { DriveFetcher } from '../../fetchers/drive-fetcher';
import { JiraFetcher } from '../../fetchers/jira-fetcher';
import { ConfluenceFetcher } from '../../fetchers/confluence-fetcher';
import { ZendeskFetcher } from '../../fetchers/zendesk-fetcher';
import type {
  ConnectorCredentialsMap,
  CredentialsMapKey,
  FetcherConfig,
  CommonFetchOptions,
  MultiSourceContext,
} from './types';

// ============================================================================
// Multi-Source Context Builder
// ============================================================================

/**
 * Build a multi-source context by fetching data from all available connectors.
 *
 * This function:
 * 1. Checks which connectors have credentials
 * 2. Creates fetchers for each available connector
 * 3. Fetches data in parallel (or sequentially if preferred)
 * 4. Returns combined context with items grouped by connector
 *
 * @example
 * ```typescript
 * const credentials: ConnectorCredentialsMap = {
 *   slack: { encryptedBlob: '...', encryptionKey: '...' },
 *   gmail: { encryptedBlob: '...', encryptionKey: '...' },
 * };
 *
 * const config: FetcherConfig = {
 *   slack: { channelIds: ['C1234567890'] },
 *   gmail: { labels: ['INBOX', 'IMPORTANT'] },
 * };
 *
 * const context = await buildMultiSourceContext(credentials, config, {
 *   sinceHoursAgo: 24,
 *   onProgress: (msg) => console.log(msg),
 * });
 *
 * console.log(`Fetched ${context.stats.totalItems} items`);
 * ```
 */
export async function buildMultiSourceContext(
  credentials: ConnectorCredentialsMap,
  config: FetcherConfig,
  options: CommonFetchOptions = {}
): Promise<MultiSourceContext> {
  const startTime = Date.now();
  const { sinceHoursAgo = 24, limit, onProgress } = options;

  const items: FetchedItem[] = [];
  const byConnector: MultiSourceContext['byConnector'] = {};
  const statsByConnector: Record<string, number> = {};
  const availableConnectors: CredentialsMapKey[] = [];

  // ============================================================================
  // Fetch from Slack
  // ============================================================================

  if (credentials.slack && config.slack?.channelIds?.length) {
    availableConnectors.push('slack');
    onProgress?.('Starting Slack fetch...');

    try {
      const fetcher = SlackFetcher.fromEncrypted(credentials.slack);
      const result = await fetcher.fetch({
        channelIds: config.slack.channelIds,
        sinceHoursAgo,
        limit,
        onProgress,
      });

      byConnector.slack = result.items;
      items.push(...result.items);
      statsByConnector.slack = result.items.length;

      onProgress?.(`Slack: fetched ${result.items.length} messages`);
    } catch (error) {
      onProgress?.(`Slack fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // Fetch from Gmail
  // ============================================================================

  if (credentials.gmail && config.gmail) {
    availableConnectors.push('gmail');
    onProgress?.('Starting Gmail fetch...');

    try {
      const fetcher = GmailFetcher.fromEncrypted(credentials.gmail);
      const result = await fetcher.fetch({
        ...config.gmail,
        sinceHoursAgo,
        limit,
        onProgress,
      });

      byConnector.gmail = result.items;
      items.push(...result.items);
      statsByConnector.gmail = result.items.length;

      onProgress?.(`Gmail: fetched ${result.items.length} emails`);
    } catch (error) {
      onProgress?.(`Gmail fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // Fetch from Google Calendar
  // ============================================================================

  if (credentials['google-calendar'] && config.calendar) {
    availableConnectors.push('google-calendar');
    onProgress?.('Starting Calendar fetch...');

    try {
      const fetcher = CalendarFetcher.fromEncrypted(credentials['google-calendar']);
      const result = await fetcher.fetch({
        ...config.calendar,
        sinceHoursAgo,
        limit,
        onProgress,
      });

      byConnector.calendar = result.items;
      items.push(...result.items);
      statsByConnector.calendar = result.items.length;

      onProgress?.(`Calendar: fetched ${result.items.length} events`);
    } catch (error) {
      onProgress?.(`Calendar fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // Fetch from Google Drive
  // ============================================================================

  if (credentials['google-drive'] && config.drive) {
    availableConnectors.push('google-drive');
    onProgress?.('Starting Google Drive fetch...');

    try {
      const fetcher = DriveFetcher.fromEncrypted(credentials['google-drive']);
      const result = await fetcher.fetch({
        ...config.drive,
        sinceHoursAgo,
        limit,
        onProgress,
      });

      byConnector.drive = result.items;
      items.push(...result.items);
      statsByConnector.drive = result.items.length;

      onProgress?.(`Drive: fetched ${result.items.length} files`);
    } catch (error) {
      onProgress?.(`Drive fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // Fetch from Jira
  // ============================================================================

  if (credentials.jira && config.jira) {
    availableConnectors.push('jira');
    onProgress?.('Starting Jira fetch...');

    try {
      const fetcher = JiraFetcher.fromEncrypted(credentials.jira);
      const result = await fetcher.fetch({
        projectKeys: config.jira.projectKeys,
        assignedToMe: config.jira.assignedToMe,
        recentlyUpdated: config.jira.recentlyUpdated ?? true,
        sinceHoursAgo,
        limit,
        onProgress,
      });

      byConnector.jira = result.items;
      items.push(...result.items);
      statsByConnector.jira = result.items.length;

      onProgress?.(`Jira: fetched ${result.items.length} issues`);
    } catch (error) {
      onProgress?.(`Jira fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // Fetch from Confluence
  // ============================================================================

  if (credentials.confluence && config.confluence) {
    availableConnectors.push('confluence');
    onProgress?.('Starting Confluence fetch...');

    try {
      const fetcher = ConfluenceFetcher.fromEncrypted(credentials.confluence);
      const result = await fetcher.fetch({
        spaceKeys: config.confluence.spaceKeys,
        sinceHoursAgo,
        limit,
        onProgress,
      });

      byConnector.confluence = result.items;
      items.push(...result.items);
      statsByConnector.confluence = result.items.length;

      onProgress?.(`Confluence: fetched ${result.items.length} pages`);
    } catch (error) {
      onProgress?.(`Confluence fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // Fetch from Zendesk
  // ============================================================================

  if (credentials.zendesk && config.zendesk) {
    availableConnectors.push('zendesk');
    onProgress?.('Starting Zendesk fetch...');

    try {
      const fetcher = ZendeskFetcher.fromEncrypted(credentials.zendesk);
      const result = await fetcher.fetch({
        status: config.zendesk.status,
        priority: config.zendesk.priority,
        assignedToMe: config.zendesk.assignedToMe,
        recentlyUpdated: config.zendesk.recentlyUpdated ?? true,
        sinceHoursAgo,
        limit,
        onProgress,
      });

      byConnector.zendesk = result.items;
      items.push(...result.items);
      statsByConnector.zendesk = result.items.length;

      onProgress?.(`Zendesk: fetched ${result.items.length} tickets`);
    } catch (error) {
      onProgress?.(`Zendesk fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // Return Combined Context
  // ============================================================================

  return {
    items,
    byConnector,
    stats: {
      totalItems: items.length,
      byConnector: statsByConnector,
      totalDurationMs: Date.now() - startTime,
    },
    availableConnectors,
  };
}

/**
 * Check which connectors have credentials available.
 */
export function getAvailableConnectors(credentials: ConnectorCredentialsMap): CredentialsMapKey[] {
  const available: CredentialsMapKey[] = [];

  if (credentials.slack) available.push('slack');
  if (credentials.gmail) available.push('gmail');
  if (credentials['google-calendar']) available.push('google-calendar');
  if (credentials['google-drive']) available.push('google-drive');
  if (credentials.jira) available.push('jira');
  if (credentials.confluence) available.push('confluence');
  if (credentials.gong) available.push('gong');
  if (credentials.zendesk) available.push('zendesk');

  return available;
}

/**
 * Check if at least one primary data source is available.
 * Primary sources are connectors that provide the main content for agents.
 */
export function hasPrimaryDataSource(credentials: ConnectorCredentialsMap): boolean {
  return !!(credentials.slack || credentials.gmail);
}

/**
 * Get a human-readable list of available connectors.
 */
export function describeAvailableConnectors(credentials: ConnectorCredentialsMap): string {
  const available = getAvailableConnectors(credentials);

  if (available.length === 0) {
    return 'No connectors available';
  }

  const names: Record<CredentialsMapKey, string> = {
    slack: 'Slack',
    gmail: 'Gmail',
    'google-calendar': 'Google Calendar',
    'google-drive': 'Google Drive',
    jira: 'Jira',
    confluence: 'Confluence',
    gong: 'Gong',
    zendesk: 'Zendesk',
  };

  return available.map((key) => names[key]).join(', ');
}
