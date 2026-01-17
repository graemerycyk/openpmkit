import { z } from 'zod';
import {
  RealRestMCPServer,
  RestOAuthTokens,
  TokenRefreshCallback,
  buildQueryString,
} from '@pmkit/mcp';
import {
  ZendeskTicketSchema,
  ZendeskCommentSchema,
  ZendeskTicket,
  ZendeskComment,
} from './index';

// ============================================================================
// Zendesk API Response Types
// ============================================================================

interface ZendeskApiTicket {
  id: number;
  subject?: string;
  description?: string;
  status?: string;
  priority?: string;
  type?: string;
  tags?: string[];
  requester_id?: number;
  assignee_id?: number;
  group_id?: number;
  created_at?: string;
  updated_at?: string;
  solved_at?: string;
}

interface ZendeskApiComment {
  id: number;
  body?: string;
  author_id?: number;
  public?: boolean;
  created_at?: string;
}

interface ZendeskApiUser {
  id: number;
  name?: string;
  email?: string;
  role?: string;
}

interface ZendeskApiGroup {
  id: number;
  name?: string;
}

// ============================================================================
// Real Zendesk MCP Server
// ============================================================================

export class RealZendeskMCPServer extends RealRestMCPServer {
  private subdomain: string;
  private apiBase: string;
  private userCache: Map<number, ZendeskApiUser> = new Map();
  private groupCache: Map<number, ZendeskApiGroup> = new Map();

  constructor(
    tokens: RestOAuthTokens,
    options?: {
      onTokenRefresh?: TokenRefreshCallback;
      timeout?: number;
      subdomain?: string;
    }
  ) {
    const subdomain = options?.subdomain ?? process.env.ZENDESK_SUBDOMAIN ?? 'example';
    const clientId = process.env.ZENDESK_CLIENT_ID ?? '';
    const clientSecret = process.env.ZENDESK_CLIENT_SECRET ?? '';

    super(
      {
        name: 'zendesk',
        description: 'Zendesk integration via Zendesk REST API',
        version: '1.0.0',
      },
      tokens,
      {
        ...options,
        tokenRefreshConfig: {
          tokenUrl: `https://${subdomain}.zendesk.com/oauth/tokens`,
          clientId,
          clientSecret,
        },
      }
    );

    this.subdomain = subdomain;
    this.apiBase = `https://${subdomain}.zendesk.com/api/v2`;

    this.registerTools();
  }

  private registerTools(): void {
    this.registerTool({
      name: 'get_tickets',
      description: 'Get Zendesk tickets with optional filters',
      inputSchema: z.object({
        status: z
          .enum(['new', 'open', 'pending', 'hold', 'solved', 'closed'])
          .optional(),
        priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
        tags: z.array(z.string()).optional(),
        fromDate: z.string().optional(),
        limit: z.number().optional().default(50),
      }),
      outputSchema: z.object({
        tickets: z.array(ZendeskTicketSchema),
        total: z.number(),
      }),
      execute: async (input) => {
        // Build search query
        const queryParts: string[] = ['type:ticket'];

        if (input.status) {
          queryParts.push(`status:${input.status}`);
        }
        if (input.priority) {
          queryParts.push(`priority:${input.priority}`);
        }
        if (input.tags?.length) {
          for (const tag of input.tags) {
            queryParts.push(`tags:${tag}`);
          }
        }
        if (input.fromDate) {
          queryParts.push(`updated>${input.fromDate}`);
        }

        const query = queryParts.join(' ');
        const url = `${this.apiBase}/search.json${buildQueryString({
          query,
          per_page: input.limit,
          sort_by: 'updated_at',
          sort_order: 'desc',
        })}`;

        const response = await this.get<{
          results?: ZendeskApiTicket[];
          count?: number;
        }>(url);

        const tickets = await Promise.all(
          (response.results ?? []).map((t) => this.transformTicket(t))
        );

        return {
          tickets,
          total: response.count ?? tickets.length,
        };
      },
    });

    this.registerTool({
      name: 'get_ticket',
      description: 'Get a specific Zendesk ticket by ID',
      inputSchema: z.object({ ticketId: z.string() }),
      outputSchema: ZendeskTicketSchema.nullable(),
      execute: async (input) => {
        try {
          const response = await this.get<{ ticket?: ZendeskApiTicket }>(
            `${this.apiBase}/tickets/${input.ticketId}.json`
          );

          if (!response.ticket) return null;

          return this.transformTicket(response.ticket);
        } catch {
          return null;
        }
      },
    });

    this.registerTool({
      name: 'get_ticket_comments',
      description: 'Get all comments on a Zendesk ticket',
      inputSchema: z.object({
        ticketId: z.string(),
        includePrivate: z.boolean().optional().default(false),
      }),
      outputSchema: z.array(ZendeskCommentSchema),
      execute: async (input) => {
        const response = await this.get<{ comments?: ZendeskApiComment[] }>(
          `${this.apiBase}/tickets/${input.ticketId}/comments.json`
        );

        let comments = await Promise.all(
          (response.comments ?? []).map((c) => this.transformComment(c, input.ticketId))
        );

        if (!input.includePrivate) {
          comments = comments.filter((c) => c.isPublic);
        }

        return comments.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      },
    });

    this.registerTool({
      name: 'search_tickets',
      description: 'Search Zendesk tickets by keyword',
      inputSchema: z.object({
        query: z.string(),
        limit: z.number().optional().default(50),
      }),
      outputSchema: z.array(ZendeskTicketSchema),
      execute: async (input) => {
        const url = `${this.apiBase}/search.json${buildQueryString({
          query: `type:ticket ${input.query}`,
          per_page: input.limit,
        })}`;

        const response = await this.get<{ results?: ZendeskApiTicket[] }>(url);

        return Promise.all(
          (response.results ?? []).map((t) => this.transformTicket(t))
        );
      },
    });

    this.registerTool({
      name: 'get_urgent_tickets',
      description: 'Get urgent and high priority open tickets',
      inputSchema: z.object({
        limit: z.number().optional().default(20),
      }),
      outputSchema: z.array(ZendeskTicketSchema),
      execute: async (input) => {
        const url = `${this.apiBase}/search.json${buildQueryString({
          query: 'type:ticket status<solved priority:urgent OR priority:high',
          per_page: input.limit,
          sort_by: 'priority',
          sort_order: 'desc',
        })}`;

        const response = await this.get<{ results?: ZendeskApiTicket[] }>(url);

        return Promise.all(
          (response.results ?? []).map((t) => this.transformTicket(t))
        );
      },
    });

    this.registerTool({
      name: 'get_customer_feedback',
      description: 'Get tickets tagged as feedback or feature requests',
      inputSchema: z.object({
        tags: z.array(z.string()).optional().default(['feedback', 'feature-request']),
        limit: z.number().optional().default(50),
      }),
      outputSchema: z.array(ZendeskTicketSchema),
      execute: async (input) => {
        const tags = input.tags ?? ['feedback', 'feature-request'];
        const tagQuery = tags.map((t) => `tags:${t}`).join(' OR ');
        const url = `${this.apiBase}/search.json${buildQueryString({
          query: `type:ticket (${tagQuery})`,
          per_page: input.limit,
          sort_by: 'created_at',
          sort_order: 'desc',
        })}`;

        const response = await this.get<{ results?: ZendeskApiTicket[] }>(url);

        return Promise.all(
          (response.results ?? []).map((t) => this.transformTicket(t))
        );
      },
    });
  }

  // ============================================================================
  // Transform Zendesk API response to our schema
  // ============================================================================

  private async transformTicket(t: ZendeskApiTicket): Promise<ZendeskTicket> {
    // Get requester info
    const requester = t.requester_id
      ? await this.getUser(t.requester_id)
      : null;

    // Get assignee info
    const assignee = t.assignee_id
      ? await this.getUser(t.assignee_id)
      : null;

    // Get group info
    const group = t.group_id
      ? await this.getGroup(t.group_id)
      : null;

    return {
      id: String(t.id),
      subject: t.subject ?? 'No subject',
      description: t.description ?? '',
      status: this.mapStatus(t.status),
      priority: this.mapPriority(t.priority),
      type: this.mapType(t.type),
      tags: t.tags ?? [],
      requesterName: requester?.name ?? 'Unknown',
      requesterEmail: requester?.email ?? 'unknown@example.com',
      assigneeName: assignee?.name,
      groupName: group?.name,
      createdAt: t.created_at ?? new Date().toISOString(),
      updatedAt: t.updated_at ?? new Date().toISOString(),
      solvedAt: t.solved_at,
    };
  }

  private async transformComment(
    c: ZendeskApiComment,
    ticketId: string
  ): Promise<ZendeskComment> {
    const author = c.author_id ? await this.getUser(c.author_id) : null;

    return {
      id: String(c.id),
      ticketId,
      authorName: author?.name ?? 'Unknown',
      authorRole: this.mapRole(author?.role),
      body: c.body ?? '',
      isPublic: c.public ?? true,
      createdAt: c.created_at ?? new Date().toISOString(),
    };
  }

  private async getUser(userId: number): Promise<ZendeskApiUser | null> {
    // Check cache
    if (this.userCache.has(userId)) {
      return this.userCache.get(userId)!;
    }

    try {
      const response = await this.get<{ user?: ZendeskApiUser }>(
        `${this.apiBase}/users/${userId}.json`
      );

      if (response.user) {
        this.userCache.set(userId, response.user);
        return response.user;
      }
    } catch {
      // User not found
    }

    return null;
  }

  private async getGroup(groupId: number): Promise<ZendeskApiGroup | null> {
    // Check cache
    if (this.groupCache.has(groupId)) {
      return this.groupCache.get(groupId)!;
    }

    try {
      const response = await this.get<{ group?: ZendeskApiGroup }>(
        `${this.apiBase}/groups/${groupId}.json`
      );

      if (response.group) {
        this.groupCache.set(groupId, response.group);
        return response.group;
      }
    } catch {
      // Group not found
    }

    return null;
  }

  private mapStatus(
    status?: string
  ): 'new' | 'open' | 'pending' | 'hold' | 'solved' | 'closed' {
    const validStatuses = ['new', 'open', 'pending', 'hold', 'solved', 'closed'];
    if (status && validStatuses.includes(status)) {
      return status as 'new' | 'open' | 'pending' | 'hold' | 'solved' | 'closed';
    }
    return 'new';
  }

  private mapPriority(priority?: string): 'low' | 'normal' | 'high' | 'urgent' {
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (priority && validPriorities.includes(priority)) {
      return priority as 'low' | 'normal' | 'high' | 'urgent';
    }
    return 'normal';
  }

  private mapType(type?: string): 'question' | 'incident' | 'problem' | 'task' | undefined {
    const validTypes = ['question', 'incident', 'problem', 'task'];
    if (type && validTypes.includes(type)) {
      return type as 'question' | 'incident' | 'problem' | 'task';
    }
    return undefined;
  }

  private mapRole(role?: string): 'end-user' | 'agent' | 'admin' {
    if (role === 'admin') return 'admin';
    if (role === 'agent') return 'agent';
    return 'end-user';
  }
}
