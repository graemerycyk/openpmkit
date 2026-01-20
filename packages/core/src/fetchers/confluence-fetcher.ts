import { decryptTokens } from '../connectors';
import type {
  EncryptedCredentials,
  FetchedItem,
  FetchResult,
  FetchOptions,
  IFetcher,
} from './types';

// ============================================================================
// Confluence-specific types
// ============================================================================

/**
 * Metadata specific to Confluence pages.
 */
export interface ConfluencePageMetadata {
  spaceKey: string;
  spaceName: string;
  parentId?: string;
  parentTitle?: string;
  version: number;
  status: 'current' | 'draft' | 'historical';
  labels?: string[];
  ancestors?: Array<{ id: string; title: string }>;
}

/**
 * Confluence-specific fetch options.
 */
export interface ConfluenceFetchOptions extends FetchOptions {
  /** Space keys to filter by (e.g., ['TEAM', 'DOCS']) */
  spaceKeys?: string[];
  /** CQL query to filter pages */
  cql?: string;
  /** Include only pages with specific labels */
  labels?: string[];
  /** Include blog posts */
  includeBlogPosts?: boolean;
  /** Include page content (default: true) */
  includeContent?: boolean;
  /** Maximum content length to include per page */
  maxContentLength?: number;
}

// ============================================================================
// Internal Types for Confluence API Responses
// ============================================================================

interface ConfluenceApiPage {
  id: string;
  type: 'page' | 'blogpost';
  status: 'current' | 'draft' | 'historical';
  title: string;
  space: {
    key: string;
    name: string;
  };
  history: {
    createdBy: {
      accountId: string;
      displayName: string;
      email?: string;
    };
    createdDate: string;
    lastUpdated: {
      by: {
        accountId: string;
        displayName: string;
        email?: string;
      };
      when: string;
    };
  };
  version: {
    number: number;
    when: string;
    by: {
      accountId: string;
      displayName: string;
    };
  };
  ancestors?: Array<{
    id: string;
    title: string;
  }>;
  body?: {
    storage?: {
      value: string;
    };
    view?: {
      value: string;
    };
  };
  metadata?: {
    labels?: {
      results: Array<{ name: string }>;
    };
  };
  _links: {
    webui: string;
    self: string;
  };
}

interface ConfluenceSearchResponse {
  results: ConfluenceApiPage[];
  start: number;
  limit: number;
  size: number;
  _links: {
    next?: string;
  };
}

interface AtlassianTokens {
  accessToken: string;
  refreshToken?: string;
  cloudId: string;
  siteUrl: string;
  siteName: string;
}

// ============================================================================
// Confluence Fetcher Implementation
// ============================================================================

/**
 * Fetcher for Confluence pages.
 * Implements the IFetcher interface for use by any agent.
 *
 * @example
 * ```typescript
 * // Create from encrypted credentials
 * const fetcher = ConfluenceFetcher.fromEncrypted({
 *   encryptedBlob: '...',
 *   encryptionKey: '...',
 * });
 *
 * // Fetch recently updated pages
 * const result = await fetcher.fetch({
 *   spaceKeys: ['TEAM'],
 *   sinceHoursAgo: 168, // Last week
 * });
 *
 * // Process fetched items
 * for (const item of result.items) {
 *   console.log(`[${item.metadata.spaceName}] ${item.title}`);
 * }
 * ```
 */
export class ConfluenceFetcher implements IFetcher<ConfluencePageMetadata, ConfluenceFetchOptions> {
  readonly connector = 'confluence';
  readonly sourceTypes = ['confluence_page'] as const;

  private accessToken: string;
  private cloudId: string;
  private siteUrl: string;

  constructor(tokens: AtlassianTokens) {
    this.accessToken = tokens.accessToken;
    this.cloudId = tokens.cloudId;
    this.siteUrl = tokens.siteUrl;
  }

  /**
   * Create fetcher from encrypted credential blob.
   */
  static fromEncrypted(credentials: EncryptedCredentials): ConfluenceFetcher {
    const tokens = decryptTokens(credentials.encryptedBlob, credentials.encryptionKey) as AtlassianTokens;
    return new ConfluenceFetcher(tokens);
  }

  /**
   * Fetch pages from Confluence.
   */
  async fetch(options: ConfluenceFetchOptions): Promise<FetchResult<ConfluencePageMetadata>> {
    const startTime = Date.now();
    const {
      spaceKeys,
      cql,
      labels,
      includeBlogPosts = false,
      includeContent = true,
      maxContentLength = 5000,
      sinceHoursAgo = 168, // Default to 1 week for Confluence
      limit = 50,
      onProgress,
    } = options;

    const items: FetchedItem<ConfluencePageMetadata>[] = [];

    // Build CQL query
    const cqlParts: string[] = [];

    if (cql) {
      cqlParts.push(`(${cql})`);
    }

    // Filter by content type
    if (includeBlogPosts) {
      cqlParts.push('type IN (page, blogpost)');
    } else {
      cqlParts.push('type = page');
    }

    if (spaceKeys && spaceKeys.length > 0) {
      cqlParts.push(`space IN (${spaceKeys.join(', ')})`);
    }

    if (labels && labels.length > 0) {
      const labelConditions = labels.map((l) => `label = "${l}"`).join(' OR ');
      cqlParts.push(`(${labelConditions})`);
    }

    if (sinceHoursAgo) {
      // Calculate date for "lastModified" filter
      const sinceDate = new Date(Date.now() - sinceHoursAgo * 60 * 60 * 1000);
      const dateStr = sinceDate.toISOString().split('T')[0];
      cqlParts.push(`lastModified >= "${dateStr}"`);
    }

    const finalCql = cqlParts.join(' AND ') + ' ORDER BY lastModified DESC';

    onProgress?.('Fetching Confluence pages...');

    let start = 0;
    const maxResults = 25;

    do {
      const searchUrl = `https://api.atlassian.com/ex/confluence/${this.cloudId}/wiki/rest/api/content/search`;
      const expand = includeContent
        ? 'space,history,version,ancestors,body.storage,metadata.labels'
        : 'space,history,version,ancestors,metadata.labels';

      const params = new URLSearchParams({
        cql: finalCql,
        start: start.toString(),
        limit: maxResults.toString(),
        expand,
      });

      const response = await fetch(`${searchUrl}?${params}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Confluence API error (${response.status}): ${errorText}`);
      }

      const data: ConfluenceSearchResponse = await response.json();

      for (const page of data.results) {
        const item = this.transformPage(page, maxContentLength);
        items.push(item);
      }

      onProgress?.(`Fetched ${items.length} pages...`);

      start += maxResults;

      // Stop if we've reached the limit or there are no more results
      if (items.length >= limit || data.size < maxResults) {
        break;
      }
    } while (true);

    // Trim to limit if needed
    const trimmedItems = items.slice(0, limit);

    return {
      connector: this.connector,
      items: trimmedItems,
      stats: {
        itemsProcessed: trimmedItems.length,
        durationMs: Date.now() - startTime,
      },
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Transform a Confluence API page to a FetchedItem.
   */
  private transformPage(page: ConfluenceApiPage, maxContentLength: number): FetchedItem<ConfluencePageMetadata> {
    const content = this.extractContent(page, maxContentLength);
    const labels = page.metadata?.labels?.results?.map((l) => l.name);

    return {
      externalId: page.id,
      sourceType: 'confluence_page',
      title: page.title,
      url: `${this.siteUrl}/wiki${page._links.webui}`,
      content: content,
      timestamp: new Date(page.version.when),
      author: {
        id: page.version.by.accountId,
        name: page.version.by.displayName,
      },
      metadata: {
        spaceKey: page.space.key,
        spaceName: page.space.name,
        parentId: page.ancestors?.[page.ancestors.length - 1]?.id,
        parentTitle: page.ancestors?.[page.ancestors.length - 1]?.title,
        version: page.version.number,
        status: page.status,
        labels,
        ancestors: page.ancestors?.map((a) => ({ id: a.id, title: a.title })),
      },
    };
  }

  /**
   * Extract plain text content from Confluence page body.
   */
  private extractContent(page: ConfluenceApiPage, maxLength: number): string {
    const parts = [
      `Page: ${page.title}`,
      `Space: ${page.space.name} (${page.space.key})`,
      `Last updated: ${new Date(page.version.when).toLocaleDateString()}`,
      `Version: ${page.version.number}`,
    ];

    if (page.ancestors && page.ancestors.length > 0) {
      const path = page.ancestors.map((a) => a.title).join(' > ');
      parts.push(`Path: ${path}`);
    }

    const labels = page.metadata?.labels?.results?.map((l) => l.name);
    if (labels && labels.length > 0) {
      parts.push(`Labels: ${labels.join(', ')}`);
    }

    // Extract body content
    const bodyHtml = page.body?.storage?.value || page.body?.view?.value;
    if (bodyHtml) {
      const plainText = this.htmlToPlainText(bodyHtml);
      const truncatedText = plainText.length > maxLength
        ? plainText.slice(0, maxLength) + '...'
        : plainText;
      parts.push(`\nContent:\n${truncatedText}`);
    }

    return parts.join('\n');
  }

  /**
   * Convert HTML to plain text (basic implementation).
   */
  private htmlToPlainText(html: string): string {
    // Remove script and style tags and their content
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // Replace common block elements with newlines
    text = text.replace(/<\/?(div|p|h[1-6]|li|br|tr)[^>]*>/gi, '\n');

    // Remove all remaining HTML tags
    text = text.replace(/<[^>]+>/g, ' ');

    // Decode common HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");

    // Clean up whitespace
    text = text.replace(/\s+/g, ' ');
    text = text.replace(/\n\s*\n/g, '\n\n');
    text = text.trim();

    return text;
  }
}
