/**
 * @module agents/shared
 *
 * Shared types and utilities for all agent orchestrators.
 * This module provides the building blocks for creating composable,
 * multi-source agents that can work with any combination of connectors.
 *
 * @example
 * ```typescript
 * import {
 *   buildMultiSourceContext,
 *   type ConnectorCredentialsMap,
 *   type FetcherConfig,
 * } from '@pmkit/core/agents/shared';
 *
 * // Build credentials map from connected integrations
 * const credentials: ConnectorCredentialsMap = {
 *   slack: slackCredentials,
 *   gmail: gmailCredentials,
 * };
 *
 * // Configure what to fetch from each connector
 * const config: FetcherConfig = {
 *   slack: { channelIds: ['C1234567890'] },
 *   gmail: { labels: ['INBOX'] },
 * };
 *
 * // Fetch from all available sources
 * const context = await buildMultiSourceContext(credentials, config, {
 *   sinceHoursAgo: 24,
 * });
 *
 * // Use the fetched data in your agent
 * console.log(`Got ${context.stats.totalItems} items from ${context.availableConnectors.join(', ')}`);
 * ```
 */

// Types
export type {
  ConnectorCredentialsMap,
  CredentialsMapKey,
  MultiSourceContext,
  FetcherConfig,
  CommonFetchOptions,
  BaseAgentContext,
  BaseAgentResult,
} from './types';

// Multi-source context builder
export {
  buildMultiSourceContext,
  getAvailableConnectors,
  hasPrimaryDataSource,
  describeAvailableConnectors,
} from './multi-source-context';
