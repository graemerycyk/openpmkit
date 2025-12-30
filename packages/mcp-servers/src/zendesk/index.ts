import { z } from 'zod';
import { BaseMCPServer, createProposalTool } from '@pmkit/mcp';

// ============================================================================
// Zendesk Data Types
// ============================================================================

export const ZendeskTicketSchema = z.object({
  id: z.string(),
  subject: z.string(),
  description: z.string(),
  status: z.enum(['new', 'open', 'pending', 'hold', 'solved', 'closed']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  type: z.enum(['question', 'incident', 'problem', 'task']).optional(),
  tags: z.array(z.string()),
  requesterName: z.string(),
  requesterEmail: z.string(),
  assigneeName: z.string().optional(),
  groupName: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  solvedAt: z.string().optional(),
});

export type ZendeskTicket = z.infer<typeof ZendeskTicketSchema>;

export const ZendeskCommentSchema = z.object({
  id: z.string(),
  ticketId: z.string(),
  authorName: z.string(),
  authorRole: z.enum(['end-user', 'agent', 'admin']),
  body: z.string(),
  isPublic: z.boolean(),
  createdAt: z.string(),
});

export type ZendeskComment = z.infer<typeof ZendeskCommentSchema>;

// ============================================================================
// Mock Zendesk MCP Server
// ============================================================================

export class MockZendeskMCPServer extends BaseMCPServer {
  private mockTickets: Map<string, ZendeskTicket> = new Map();
  private mockComments: Map<string, ZendeskComment[]> = new Map();

  constructor() {
    super({
      name: 'zendesk',
      description: 'Zendesk integration for support tickets and customer feedback',
      version: '1.0.0',
    });

    this.registerTools();
  }

  loadMockData(tickets: ZendeskTicket[], comments: ZendeskComment[]): void {
    this.mockTickets.clear();
    this.mockComments.clear();

    for (const ticket of tickets) {
      this.mockTickets.set(ticket.id, ticket);
    }

    for (const comment of comments) {
      const existing = this.mockComments.get(comment.ticketId) || [];
      existing.push(comment);
      this.mockComments.set(comment.ticketId, existing);
    }
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
        let tickets = Array.from(this.mockTickets.values());

        if (input.status) {
          tickets = tickets.filter((t) => t.status === input.status);
        }
        if (input.priority) {
          tickets = tickets.filter((t) => t.priority === input.priority);
        }
        if (input.tags?.length) {
          tickets = tickets.filter((t) =>
            input.tags!.some((tag) => t.tags.includes(tag))
          );
        }

        // Sort by updated date descending
        tickets.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        return {
          tickets: tickets.slice(0, input.limit),
          total: tickets.length,
        };
      },
    });

    this.registerTool({
      name: 'get_ticket',
      description: 'Get a specific Zendesk ticket by ID',
      inputSchema: z.object({ ticketId: z.string() }),
      outputSchema: ZendeskTicketSchema.nullable(),
      execute: async (input) => {
        return this.mockTickets.get(input.ticketId) || null;
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
        let comments = this.mockComments.get(input.ticketId) || [];

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
      description: 'Search Zendesk tickets by text',
      inputSchema: z.object({
        query: z.string(),
        limit: z.number().optional().default(50),
      }),
      outputSchema: z.object({
        tickets: z.array(ZendeskTicketSchema),
        total: z.number(),
      }),
      execute: async (input) => {
        const query = input.query.toLowerCase();
        let tickets = Array.from(this.mockTickets.values()).filter(
          (t) =>
            t.subject.toLowerCase().includes(query) ||
            t.description.toLowerCase().includes(query)
        );

        return {
          tickets: tickets.slice(0, input.limit),
          total: tickets.length,
        };
      },
    });

    this.registerTool({
      name: 'get_escalated_tickets',
      description: 'Get high-priority or escalated tickets',
      inputSchema: z.object({
        limit: z.number().optional().default(25),
      }),
      outputSchema: z.array(ZendeskTicketSchema),
      execute: async (input) => {
        return Array.from(this.mockTickets.values())
          .filter(
            (t) =>
              t.priority === 'urgent' ||
              t.priority === 'high' ||
              t.tags.includes('escalated')
          )
          .slice(0, input.limit);
      },
    });

    this.registerTool({
      name: 'get_ticket_trends',
      description: 'Get ticket volume and trends by tag',
      inputSchema: z.object({
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
      }),
      outputSchema: z.object({
        totalTickets: z.number(),
        byStatus: z.record(z.number()),
        byPriority: z.record(z.number()),
        topTags: z.array(z.object({ tag: z.string(), count: z.number() })),
      }),
      execute: async () => {
        const tickets = Array.from(this.mockTickets.values());

        const byStatus: Record<string, number> = {};
        const byPriority: Record<string, number> = {};
        const tagCounts: Record<string, number> = {};

        for (const ticket of tickets) {
          byStatus[ticket.status] = (byStatus[ticket.status] || 0) + 1;
          byPriority[ticket.priority] = (byPriority[ticket.priority] || 0) + 1;

          for (const tag of ticket.tags) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        }

        const topTags = Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([tag, count]) => ({ tag, count }));

        return {
          totalTickets: tickets.length,
          byStatus,
          byPriority,
          topTags,
        };
      },
    });

    // Proposal tools (draft-only)
    this.registerTool(
      createProposalTool(
        'zendesk_internal_note',
        'Propose an internal note on a Zendesk ticket',
        z.object({
          ticketId: z.string(),
          body: z.string(),
        }),
        'zendesk',
        async (input) => {
          const ticket = this.mockTickets.get(input.ticketId);
          return {
            title: `Internal note on ticket #${input.ticketId}`,
            preview: input.body,
            bundle: {
              ticketId: input.ticketId,
              ticketSubject: ticket?.subject,
              body: input.body,
              isPublic: false,
            },
            targetId: input.ticketId,
          };
        }
      )
    );
  }
}

export const mockZendeskServer = new MockZendeskMCPServer();

