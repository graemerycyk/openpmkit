import type { EncryptedCredentials, FetchedItem } from '../../fetchers/types';
import type { CitableSource } from '../../citations/types';

// ============================================================================
// Connector Credentials Map
// ============================================================================

/**
 * Map of connector keys to their encrypted credentials.
 * Agents receive this map and use only the connectors they have credentials for.
 *
 * @example
 * ```typescript
 * const credentials: ConnectorCredentialsMap = {};
 *
 * if (slackInstall) {
 *   credentials.slack = {
 *     encryptedBlob: slackInstall.credentials,
 *     encryptionKey: decryptionKey,
 *   };
 * }
 *
 * if (gmailInstall) {
 *   credentials.gmail = {
 *     encryptedBlob: gmailInstall.credentials,
 *     encryptionKey: decryptionKey,
 *   };
 * }
 *
 * const context = await buildMultiSourceContext(credentials, config, options);
 * ```
 */
export interface ConnectorCredentialsMap {
  slack?: EncryptedCredentials;
  gmail?: EncryptedCredentials;
  'google-calendar'?: EncryptedCredentials;
  'google-drive'?: EncryptedCredentials;
  jira?: EncryptedCredentials;
  confluence?: EncryptedCredentials;
  gong?: EncryptedCredentials;
  zendesk?: EncryptedCredentials;
}

/**
 * Keys for connectors that support credential-based fetching.
 * This is a subset of all connector keys.
 */
export type CredentialsMapKey = keyof ConnectorCredentialsMap;

// ============================================================================
// Multi-Source Context
// ============================================================================

/**
 * Combined data from multiple connector fetchers.
 * Returned by buildMultiSourceContext().
 */
export interface MultiSourceContext {
  /** All fetched items from all connectors */
  items: FetchedItem[];

  /** Items grouped by connector */
  byConnector: {
    slack?: FetchedItem[];
    gmail?: FetchedItem[];
    calendar?: FetchedItem[];
    drive?: FetchedItem[];
    jira?: FetchedItem[];
    confluence?: FetchedItem[];
    gong?: FetchedItem[];
    zendesk?: FetchedItem[];
  };

  /** Fetch statistics */
  stats: {
    totalItems: number;
    byConnector: Record<string, number>;
    totalDurationMs: number;
  };

  /** Which connectors were available/used */
  availableConnectors: CredentialsMapKey[];
}

// ============================================================================
// Fetch Configuration
// ============================================================================

/**
 * Configuration for each connector's fetch operation.
 */
export interface FetcherConfig {
  slack?: {
    channelIds: string[];
    includeMentions?: boolean;
  };
  gmail?: {
    labels?: string[];
    starredOnly?: boolean;
    unreadOnly?: boolean;
    internalDomain?: string;
  };
  calendar?: {
    calendarIds?: string[];
    includePast?: boolean;
    daysAhead?: number;
    internalDomain?: string;
  };
  drive?: {
    folderIds?: string[];
    mimeTypes?: string[];
    starredOnly?: boolean;
    sharedOnly?: boolean;
    query?: string;
  };
}

/**
 * Common fetch options that apply to all fetchers.
 */
export interface CommonFetchOptions {
  /** How many hours back to fetch data (default: 24) */
  sinceHoursAgo?: number;
  /** Maximum number of items per connector */
  limit?: number;
  /** Progress callback */
  onProgress?: (message: string) => void;
}

// ============================================================================
// Base Agent Context
// ============================================================================

/**
 * Base context available to all agents.
 * Each agent extends this with its own specific context.
 */
export interface BaseAgentContext {
  /** Tenant ID for this execution */
  tenantId: string;

  /** Job run ID for tracking */
  jobRunId: string;

  /** Available connector credentials */
  credentials: ConnectorCredentialsMap;

  /** Fetched data from all sources */
  multiSourceContext?: MultiSourceContext;

  /** Registered citations */
  citations?: CitableSource[];
}

// ============================================================================
// Agent Result
// ============================================================================

/**
 * Base result returned by all agents.
 */
export interface BaseAgentResult {
  /** Whether the agent completed successfully */
  success: boolean;

  /** Generated artifact content (markdown) */
  artifact?: string;

  /** Generated artifact title */
  artifactTitle?: string;

  /** Citations used in the artifact */
  citations?: CitableSource[];

  /** Error message if failed */
  error?: string;

  /** Execution statistics */
  stats?: {
    durationMs: number;
    sourcesProcessed: number;
    tokensUsed?: number;
  };
}
