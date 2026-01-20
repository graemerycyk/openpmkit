import { decryptTokens } from '../connectors';
import type {
  EncryptedCredentials,
  FetchedItem,
  FetchResult,
  FetchOptions,
  IFetcher,
} from './types';

// ============================================================================
// Zendesk-specific types
// ============================================================================

/**
 * Metadata specific to Zendesk tickets.
 */
export interface ZendeskTicketMetadata {
  ticketId: number;
  status: string;
  priority?: string;
  type?: string;
  tags?: string[];
  assignee?: {
    id: number;
    name: string;
    email?: string;
  };
  requester?: {
    id: number;
    name: string;
    email?: string;
  };
  organization?: {
    id: number;
    name: string;
  };
  group?: {
    id: number;
    name: string;
  };
  satisfactionRating?: {
    score: string;
    comment?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Zendesk-specific fetch options.
 */
export interface ZendeskFetchOptions extends FetchOptions {
  /** Status to filter by (e.g., 'open', 'pending', 'solved') */
  status?: string[];
  /** Priority to filter by (e.g., 'urgent', 'high', 'normal', 'low') */
  priority?: string[];
  /** Tags to filter by */
  tags?: string[];
  /** Include only tickets assigned to current user */
  assignedToMe?: boolean;
  /** Include only recently updated tickets (default: true) */
  recentlyUpdated?: boolean;
  /** Group IDs to filter by */
  groupIds?: number[];
  /** Organization IDs to filter by */
  organizationIds?: number[];
}

// ============================================================================
// Internal Types for Zendesk API Responses
// ============================================================================

interface ZendeskApiTicket {
  id: number;
  url: string;
  subject: string;
  description: string;
  status: string;
  priority?: string;
  type?: string;
  tags?: string[];
  assignee_id?: number;
  requester_id?: number;
  organization_id?: number;
  group_id?: number;
  created_at: string;
  updated_at: string;
  satisfaction_rating?: {
    score: string;
    comment?: string;
  };
}

interface ZendeskSearchResponse {
  results: ZendeskApiTicket[];
  count: number;
  next_page?: string;
  previous_page?: string;
}

interface ZendeskUser {
  id: number;
  name: string;
  email: string;
}

interface ZendeskOrganization {
  id: number;
  name: string;
}

interface ZendeskGroup {
  id: number;
  name: string;
}

interface ZendeskTokens {
  accessToken: string;
  refreshToken?: string;
  subdomain: string;
}

// ============================================================================
// Zendesk Fetcher Implementation
// ============================================================================

/**
 * Fetcher for Zendesk tickets.
 * Implements the IFetcher interface for use by any agent.
 *
 * @example
 * ```typescript
 * // Create from encrypted credentials
 * const fetcher = ZendeskFetcher.fromEncrypted({
 *   encryptedBlob: '...',
 *   encryptionKey: '...',
 * });
 *
 * // Fetch recently updated tickets
 * const result = await fetcher.fetch({
 *   status: ['open', 'pending'],
 *   sinceHoursAgo: 24,
 * });
 *
 * // Process fetched items
 * for (const item of result.items) {
 *   console.log(`[${item.metadata.status}] ${item.title}`);
 * }
 * ```
 */
export class ZendeskFetcher implements IFetcher<ZendeskTicketMetadata, ZendeskFetchOptions> {
  readonly connector = 'zendesk';
  readonly sourceTypes = ['zendesk_ticket'] as const;

  private accessToken: string;
  private subdomain: string;
  private userCache = new Map<number, ZendeskUser>();
  private orgCache = new Map<number, ZendeskOrganization>();
  private groupCache = new Map<number, ZendeskGroup>();

  constructor(tokens: ZendeskTokens) {
    this.accessToken = tokens.accessToken;
    this.subdomain = tokens.subdomain;
  }

  /**
   * Create fetcher from encrypted credential blob.
   */
  static fromEncrypted(credentials: EncryptedCredentials): ZendeskFetcher {
    const tokens = decryptTokens(credentials.encryptedBlob, credentials.encryptionKey) as ZendeskTokens;
    return new ZendeskFetcher(tokens);
  }

  /**
   * Fetch tickets from Zendesk.
   */
  async fetch(options: ZendeskFetchOptions): Promise<FetchResult<ZendeskTicketMetadata>> {
    const startTime = Date.now();
    const {
      status,
      priority,
      tags,
      assignedToMe,
      sinceHoursAgo = 24,
      recentlyUpdated = true,
      groupIds,
      organizationIds,
      limit = 100,
      onProgress,
    } = options;

    const items: FetchedItem<ZendeskTicketMetadata>[] = [];

    // Build search query
    const queryParts: string[] = ['type:ticket'];

    if (status && status.length > 0) {
      queryParts.push(`status:${status.join(',')}`);
    }

    if (priority && priority.length > 0) {
      queryParts.push(`priority:${priority.join(',')}`);
    }

    if (tags && tags.length > 0) {
      queryParts.push(`tags:${tags.join(',')}`);
    }

    if (assignedToMe) {
      queryParts.push('assignee:me');
    }

    if (groupIds && groupIds.length > 0) {
      queryParts.push(`group_id:${groupIds.join(',')}`);
    }

    if (organizationIds && organizationIds.length > 0) {
      queryParts.push(`organization_id:${organizationIds.join(',')}`);
    }

    if (recentlyUpdated && sinceHoursAgo) {
      const sinceDate = new Date(Date.now() - sinceHoursAgo * 60 * 60 * 1000);
      queryParts.push(`updated>${sinceDate.toISOString().split('T')[0]}`);
    }

    const query = queryParts.join(' ');

    onProgress?.('Fetching Zendesk tickets...');

    let page = 1;
    const perPage = 100;

    do {
      const searchUrl = `https://${this.subdomain}.zendesk.com/api/v2/search.json`;
      const params = new URLSearchParams({
        query,
        sort_by: 'updated_at',
        sort_order: 'desc',
        page: page.toString(),
        per_page: perPage.toString(),
      });

      const response = await fetch(`${searchUrl}?${params}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Zendesk API error (${response.status}): ${errorText}`);
      }

      const data: ZendeskSearchResponse = await response.json();

      for (const ticket of data.results) {
        const item = await this.transformTicket(ticket);
        items.push(item);
      }

      onProgress?.(`Fetched ${items.length} of ${data.count} tickets...`);

      page++;

      // Stop if we've reached the limit or there are no more results
      if (items.length >= limit || !data.next_page) {
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
   * Transform a Zendesk API ticket to a FetchedItem.
   */
  private async transformTicket(ticket: ZendeskApiTicket): Promise<FetchedItem<ZendeskTicketMetadata>> {
    // Fetch related entities
    const assignee = ticket.assignee_id ? await this.getUser(ticket.assignee_id) : undefined;
    const requester = ticket.requester_id ? await this.getUser(ticket.requester_id) : undefined;
    const organization = ticket.organization_id ? await this.getOrganization(ticket.organization_id) : undefined;
    const group = ticket.group_id ? await this.getGroup(ticket.group_id) : undefined;

    return {
      externalId: ticket.id.toString(),
      sourceType: 'zendesk_ticket',
      title: `#${ticket.id}: ${ticket.subject}`,
      url: `https://${this.subdomain}.zendesk.com/agent/tickets/${ticket.id}`,
      content: this.buildContent(ticket, requester),
      timestamp: new Date(ticket.updated_at),
      author: requester
        ? {
            id: requester.id.toString(),
            name: requester.name,
            email: requester.email,
          }
        : {
            id: 'unknown',
            name: 'Unknown',
          },
      metadata: {
        ticketId: ticket.id,
        status: ticket.status,
        priority: ticket.priority,
        type: ticket.type,
        tags: ticket.tags,
        assignee: assignee
          ? {
              id: assignee.id,
              name: assignee.name,
              email: assignee.email,
            }
          : undefined,
        requester: requester
          ? {
              id: requester.id,
              name: requester.name,
              email: requester.email,
            }
          : undefined,
        organization: organization
          ? {
              id: organization.id,
              name: organization.name,
            }
          : undefined,
        group: group
          ? {
              id: group.id,
              name: group.name,
            }
          : undefined,
        satisfactionRating: ticket.satisfaction_rating,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
      },
    };
  }

  /**
   * Get user by ID (with caching).
   */
  private async getUser(userId: number): Promise<ZendeskUser | undefined> {
    if (this.userCache.has(userId)) {
      return this.userCache.get(userId);
    }

    try {
      const response = await fetch(
        `https://${this.subdomain}.zendesk.com/api/v2/users/${userId}.json`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        return undefined;
      }

      const data = await response.json();
      const user: ZendeskUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
      };

      this.userCache.set(userId, user);
      return user;
    } catch {
      return undefined;
    }
  }

  /**
   * Get organization by ID (with caching).
   */
  private async getOrganization(orgId: number): Promise<ZendeskOrganization | undefined> {
    if (this.orgCache.has(orgId)) {
      return this.orgCache.get(orgId);
    }

    try {
      const response = await fetch(
        `https://${this.subdomain}.zendesk.com/api/v2/organizations/${orgId}.json`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        return undefined;
      }

      const data = await response.json();
      const org: ZendeskOrganization = {
        id: data.organization.id,
        name: data.organization.name,
      };

      this.orgCache.set(orgId, org);
      return org;
    } catch {
      return undefined;
    }
  }

  /**
   * Get group by ID (with caching).
   */
  private async getGroup(groupId: number): Promise<ZendeskGroup | undefined> {
    if (this.groupCache.has(groupId)) {
      return this.groupCache.get(groupId);
    }

    try {
      const response = await fetch(
        `https://${this.subdomain}.zendesk.com/api/v2/groups/${groupId}.json`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        return undefined;
      }

      const data = await response.json();
      const group: ZendeskGroup = {
        id: data.group.id,
        name: data.group.name,
      };

      this.groupCache.set(groupId, group);
      return group;
    } catch {
      return undefined;
    }
  }

  /**
   * Build content string for LLM consumption.
   */
  private buildContent(ticket: ZendeskApiTicket, requester?: ZendeskUser): string {
    const parts = [
      `Ticket #${ticket.id}`,
      `Subject: ${ticket.subject}`,
      `Status: ${ticket.status}`,
    ];

    if (ticket.priority) {
      parts.push(`Priority: ${ticket.priority}`);
    }

    if (ticket.type) {
      parts.push(`Type: ${ticket.type}`);
    }

    if (requester) {
      parts.push(`Requester: ${requester.name} (${requester.email})`);
    }

    if (ticket.tags && ticket.tags.length > 0) {
      parts.push(`Tags: ${ticket.tags.join(', ')}`);
    }

    if (ticket.description) {
      parts.push(`\nDescription:\n${ticket.description}`);
    }

    return parts.join('\n');
  }
}
