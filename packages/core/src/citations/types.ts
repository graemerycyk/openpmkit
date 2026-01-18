import type { ConnectorSourceType, FetchedItem } from '../fetchers/types';

// ============================================================================
// Citable Source (a registered citation entry)
// ============================================================================

/**
 * A source that has been registered for citation in an artifact.
 * Each citable source gets a unique citation number [1], [2], etc.
 */
export interface CitableSource {
  /** Citation number (e.g., 1, 2, 3) for reference like [1], [2] */
  number: number;

  /** Source type for categorization */
  sourceType: ConnectorSourceType;

  /** Composite ID: {sourceType}:{externalId} */
  compositeId: string;

  /** Display title for the source */
  title: string;

  /** URL to the original item (if available) */
  url: string | null;

  /** Truncated content preview (first ~200 chars) */
  contentPreview: string;

  /** Author name */
  author: string;

  /** Original timestamp of the source */
  timestamp: Date;

  /** Additional context label (e.g., channel name, calendar name) */
  contextLabel: string;
}

// ============================================================================
// Citation Context (for prompt building)
// ============================================================================

/**
 * Context passed to LLM containing all registered citations.
 */
export interface CitationContext {
  /** All registered citations in order */
  citations: CitableSource[];

  /** Quick lookup: compositeId → citation number */
  sourceMap: Map<string, number>;
}

// ============================================================================
// Source Record (for database storage)
// ============================================================================

/**
 * Record stored in the Source table for traceability.
 */
export interface SourceRecord {
  tenantId: string;
  type: ConnectorSourceType;
  externalId: string;
  title: string;
  url: string | null;
  content: string;
  metadata: Record<string, unknown>;
  fetchedAt: Date;
}

// ============================================================================
// Source Formatter Interface
// ============================================================================

/**
 * Formats fetched items for citation and prompt display.
 * Each connector has its own formatter to handle source-specific formatting.
 *
 * @template TMetadata - Connector-specific metadata type
 */
export interface ISourceFormatter<TMetadata = unknown> {
  /** Source type this formatter handles */
  readonly sourceType: ConnectorSourceType;

  /**
   * Format a fetched item for citation registration.
   *
   * @param item - The fetched item to format
   * @returns Formatted citation info
   */
  formatForCitation(item: FetchedItem<TMetadata>): {
    title: string;
    contextLabel: string;
    contentPreview: string;
  };

  /**
   * Format a group of items for LLM prompt context.
   *
   * @param items - Items to format
   * @param getCitationNumber - Function to get citation number for an item
   * @returns Formatted markdown string for the prompt
   */
  formatForPrompt(
    items: FetchedItem<TMetadata>[],
    getCitationNumber: (item: FetchedItem<TMetadata>) => number
  ): string;
}

// ============================================================================
// Citation Tracker Interface
// ============================================================================

/**
 * Unified citation management across multiple source types.
 * Tracks sources from any connector and generates citations.
 */
export interface ICitationTracker {
  /**
   * Register a source formatter for a specific source type.
   *
   * @param formatter - The formatter to register
   */
  registerFormatter(formatter: ISourceFormatter): void;

  /**
   * Register a fetched item as a citable source.
   *
   * @param item - The fetched item to register
   * @param url - Optional URL override (e.g., permalink)
   * @returns The citation number assigned to this source
   */
  register(item: FetchedItem, url?: string | null): number;

  /**
   * Get citation number for a previously registered source.
   *
   * @param sourceType - The source type
   * @param externalId - The external ID
   * @returns Citation number if registered, undefined otherwise
   */
  getCitationNumber(sourceType: ConnectorSourceType, externalId: string): number | undefined;

  /**
   * Get all registered citations.
   *
   * @returns Array of citable sources
   */
  getCitations(): CitableSource[];

  /**
   * Get the full citation context.
   *
   * @returns Citation context with citations and source map
   */
  getContext(): CitationContext;

  /**
   * Generate markdown section listing all sources.
   *
   * @returns Formatted markdown string with source references
   */
  generateSourcesMarkdown(): string;

  /**
   * Generate source records for database storage.
   *
   * @param tenantId - Tenant ID to associate with records
   * @returns Array of source records ready for database
   */
  generateSourceRecords(tenantId: string): SourceRecord[];
}
