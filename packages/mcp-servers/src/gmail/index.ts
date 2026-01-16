import { z } from 'zod';
import { BaseMCPServer } from '@pmkit/mcp';

// ============================================================================
// Gmail Data Types
// ============================================================================

export const GmailMessageSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  from: z.object({
    name: z.string(),
    email: z.string(),
  }),
  to: z.array(
    z.object({
      name: z.string(),
      email: z.string(),
    })
  ),
  cc: z
    .array(
      z.object({
        name: z.string(),
        email: z.string(),
      })
    )
    .optional(),
  subject: z.string(),
  snippet: z.string(),
  body: z.string(),
  labels: z.array(z.string()),
  isRead: z.boolean(),
  isStarred: z.boolean(),
  hasAttachments: z.boolean(),
  receivedAt: z.string(),
});

export type GmailMessage = z.infer<typeof GmailMessageSchema>;

export const GmailThreadSchema = z.object({
  id: z.string(),
  subject: z.string(),
  snippet: z.string(),
  messageCount: z.number(),
  participants: z.array(
    z.object({
      name: z.string(),
      email: z.string(),
    })
  ),
  labels: z.array(z.string()),
  lastMessageAt: z.string(),
});

export type GmailThread = z.infer<typeof GmailThreadSchema>;

// ============================================================================
// Mock Gmail MCP Server
// ============================================================================

export class MockGmailMCPServer extends BaseMCPServer {
  private mockMessages: Map<string, GmailMessage> = new Map();
  private mockThreads: Map<string, GmailThread> = new Map();

  constructor() {
    super({
      name: 'gmail',
      description: 'Gmail integration for email messages and threads',
      version: '1.0.0',
    });

    this.registerTools();
  }

  loadMockData(messages: GmailMessage[], threads: GmailThread[]): void {
    this.mockMessages.clear();
    this.mockThreads.clear();

    for (const message of messages) {
      this.mockMessages.set(message.id, message);
    }

    for (const thread of threads) {
      this.mockThreads.set(thread.id, thread);
    }
  }

  private registerTools(): void {
    this.registerTool({
      name: 'get_messages',
      description: 'Get recent email messages from Gmail',
      inputSchema: z.object({
        labels: z.array(z.string()).optional(),
        fromEmail: z.string().optional(),
        subject: z.string().optional(),
        isStarred: z.boolean().optional(),
        isRead: z.boolean().optional(),
        limit: z.number().optional().default(50),
      }),
      outputSchema: z.object({
        messages: z.array(GmailMessageSchema),
        total: z.number(),
      }),
      execute: async (input) => {
        let messages = Array.from(this.mockMessages.values());

        if (input.labels?.length) {
          messages = messages.filter((m) =>
            input.labels!.some((label) => m.labels.includes(label))
          );
        }

        if (input.fromEmail) {
          messages = messages.filter((m) =>
            m.from.email.toLowerCase().includes(input.fromEmail!.toLowerCase())
          );
        }

        if (input.subject) {
          messages = messages.filter((m) =>
            m.subject.toLowerCase().includes(input.subject!.toLowerCase())
          );
        }

        if (input.isStarred !== undefined) {
          messages = messages.filter((m) => m.isStarred === input.isStarred);
        }

        if (input.isRead !== undefined) {
          messages = messages.filter((m) => m.isRead === input.isRead);
        }

        // Sort by date descending
        messages.sort(
          (a, b) =>
            new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
        );

        return {
          messages: messages.slice(0, input.limit),
          total: messages.length,
        };
      },
    });

    this.registerTool({
      name: 'get_message',
      description: 'Get a specific email message by ID',
      inputSchema: z.object({ messageId: z.string() }),
      outputSchema: GmailMessageSchema.nullable(),
      execute: async (input) => {
        return this.mockMessages.get(input.messageId) || null;
      },
    });

    this.registerTool({
      name: 'get_threads',
      description: 'Get email threads',
      inputSchema: z.object({
        labels: z.array(z.string()).optional(),
        limit: z.number().optional().default(50),
      }),
      outputSchema: z.object({
        threads: z.array(GmailThreadSchema),
        total: z.number(),
      }),
      execute: async (input) => {
        let threads = Array.from(this.mockThreads.values());

        if (input.labels?.length) {
          threads = threads.filter((t) =>
            input.labels!.some((label) => t.labels.includes(label))
          );
        }

        // Sort by last message date descending
        threads.sort(
          (a, b) =>
            new Date(b.lastMessageAt).getTime() -
            new Date(a.lastMessageAt).getTime()
        );

        return {
          threads: threads.slice(0, input.limit),
          total: threads.length,
        };
      },
    });

    this.registerTool({
      name: 'get_thread_messages',
      description: 'Get all messages in a thread',
      inputSchema: z.object({ threadId: z.string() }),
      outputSchema: z.array(GmailMessageSchema),
      execute: async (input) => {
        const messages = Array.from(this.mockMessages.values()).filter(
          (m) => m.threadId === input.threadId
        );

        // Sort by date ascending (oldest first in thread)
        return messages.sort(
          (a, b) =>
            new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
        );
      },
    });

    this.registerTool({
      name: 'search_messages',
      description: 'Search across all email messages',
      inputSchema: z.object({
        query: z.string(),
        limit: z.number().optional().default(50),
      }),
      outputSchema: z.array(GmailMessageSchema),
      execute: async (input) => {
        const query = input.query.toLowerCase();

        const results = Array.from(this.mockMessages.values()).filter(
          (m) =>
            m.subject.toLowerCase().includes(query) ||
            m.body.toLowerCase().includes(query) ||
            m.from.name.toLowerCase().includes(query) ||
            m.from.email.toLowerCase().includes(query)
        );

        // Sort by relevance (subject match first, then body match)
        results.sort((a, b) => {
          const aSubjectMatch = a.subject.toLowerCase().includes(query) ? 1 : 0;
          const bSubjectMatch = b.subject.toLowerCase().includes(query) ? 1 : 0;
          if (aSubjectMatch !== bSubjectMatch) return bSubjectMatch - aSubjectMatch;
          return (
            new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
          );
        });

        return results.slice(0, input.limit);
      },
    });

    this.registerTool({
      name: 'get_customer_emails',
      description: 'Get emails from customer domains (external emails)',
      inputSchema: z.object({
        internalDomain: z.string().optional().default('acme.io'),
        limit: z.number().optional().default(50),
      }),
      outputSchema: z.array(GmailMessageSchema),
      execute: async (input) => {
        const messages = Array.from(this.mockMessages.values()).filter(
          (m) => !m.from.email.endsWith(`@${input.internalDomain}`)
        );

        messages.sort(
          (a, b) =>
            new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
        );

        return messages.slice(0, input.limit);
      },
    });

    this.registerTool({
      name: 'propose_draft',
      description: 'Propose a draft email response (read-only - creates proposal)',
      inputSchema: z.object({
        inReplyTo: z.string().optional(),
        to: z.array(z.string()),
        cc: z.array(z.string()).optional(),
        subject: z.string(),
        body: z.string(),
      }),
      outputSchema: z.object({
        proposalId: z.string(),
        status: z.literal('draft_proposed'),
        preview: z.object({
          to: z.array(z.string()),
          cc: z.array(z.string()).optional(),
          subject: z.string(),
          body: z.string(),
        }),
      }),
      execute: async (input) => {
        // This is a draft-only tool - it proposes but doesn't send
        return {
          proposalId: `draft-${Date.now()}`,
          status: 'draft_proposed' as const,
          preview: {
            to: input.to,
            cc: input.cc,
            subject: input.subject,
            body: input.body,
          },
        };
      },
    });
  }
}

export const mockGmailServer = new MockGmailMCPServer();
