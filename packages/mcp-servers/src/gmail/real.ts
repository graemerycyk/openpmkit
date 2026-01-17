import { z } from 'zod';
import {
  GoogleRestMCPServer,
  RestOAuthTokens,
  TokenRefreshCallback,
  buildQueryString,
} from '@pmkit/mcp';
import { GmailMessageSchema, GmailThreadSchema, GmailMessage, GmailThread } from './index';

// ============================================================================
// Gmail API Response Types
// ============================================================================

interface GmailMessagePart {
  mimeType?: string;
  body?: { data?: string; size?: number };
  parts?: GmailMessagePart[];
}

interface GmailApiMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet: string;
  payload?: {
    headers?: Array<{ name: string; value: string }>;
    mimeType?: string;
    body?: { data?: string; size?: number };
    parts?: GmailMessagePart[];
  };
  internalDate?: string;
}

interface GmailApiThread {
  id: string;
  snippet: string;
  historyId?: string;
  messages?: GmailApiMessage[];
}

// ============================================================================
// Real Gmail MCP Server
// ============================================================================

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1';

export class RealGmailMCPServer extends GoogleRestMCPServer {
  constructor(
    tokens: RestOAuthTokens,
    options?: {
      onTokenRefresh?: TokenRefreshCallback;
      timeout?: number;
    }
  ) {
    super(
      {
        name: 'gmail',
        description: 'Gmail integration via Google REST API',
        version: '1.0.0',
      },
      tokens,
      options
    );

    this.registerTools();
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
        // Build Gmail query
        const queryParts: string[] = [];

        if (input.labels?.length) {
          for (const label of input.labels) {
            queryParts.push(`label:${label}`);
          }
        }
        if (input.fromEmail) {
          queryParts.push(`from:${input.fromEmail}`);
        }
        if (input.subject) {
          queryParts.push(`subject:${input.subject}`);
        }
        if (input.isStarred === true) {
          queryParts.push('is:starred');
        }
        if (input.isRead === true) {
          queryParts.push('is:read');
        } else if (input.isRead === false) {
          queryParts.push('is:unread');
        }

        const q = queryParts.join(' ');
        const url = `${GMAIL_API_BASE}/users/me/messages${buildQueryString({
          q: q || undefined,
          maxResults: input.limit,
        })}`;

        const listResponse = await this.get<{ messages?: Array<{ id: string }>; resultSizeEstimate?: number }>(url);

        if (!listResponse.messages?.length) {
          return { messages: [], total: 0 };
        }

        // Fetch full message details
        const messages = await Promise.all(
          listResponse.messages.slice(0, input.limit).map(async (m) => {
            const msg = await this.get<GmailApiMessage>(
              `${GMAIL_API_BASE}/users/me/messages/${m.id}?format=full`
            );
            return this.transformMessage(msg);
          })
        );

        return {
          messages,
          total: listResponse.resultSizeEstimate ?? messages.length,
        };
      },
    });

    this.registerTool({
      name: 'get_message',
      description: 'Get a specific email message by ID',
      inputSchema: z.object({ messageId: z.string() }),
      outputSchema: GmailMessageSchema.nullable(),
      execute: async (input) => {
        try {
          const msg = await this.get<GmailApiMessage>(
            `${GMAIL_API_BASE}/users/me/messages/${input.messageId}?format=full`
          );
          return this.transformMessage(msg);
        } catch {
          return null;
        }
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
        const queryParts: string[] = [];
        if (input.labels?.length) {
          for (const label of input.labels) {
            queryParts.push(`label:${label}`);
          }
        }

        const q = queryParts.join(' ');
        const url = `${GMAIL_API_BASE}/users/me/threads${buildQueryString({
          q: q || undefined,
          maxResults: input.limit,
        })}`;

        const listResponse = await this.get<{ threads?: Array<{ id: string }>; resultSizeEstimate?: number }>(url);

        if (!listResponse.threads?.length) {
          return { threads: [], total: 0 };
        }

        // Fetch thread details
        const threads = await Promise.all(
          listResponse.threads.slice(0, input.limit).map(async (t) => {
            const thread = await this.get<GmailApiThread>(
              `${GMAIL_API_BASE}/users/me/threads/${t.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`
            );
            return this.transformThread(thread);
          })
        );

        return {
          threads,
          total: listResponse.resultSizeEstimate ?? threads.length,
        };
      },
    });

    this.registerTool({
      name: 'get_thread_messages',
      description: 'Get all messages in a thread',
      inputSchema: z.object({ threadId: z.string() }),
      outputSchema: z.array(GmailMessageSchema),
      execute: async (input) => {
        const thread = await this.get<GmailApiThread>(
          `${GMAIL_API_BASE}/users/me/threads/${input.threadId}?format=full`
        );

        if (!thread.messages?.length) {
          return [];
        }

        return thread.messages.map((m) => this.transformMessage(m));
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
        const url = `${GMAIL_API_BASE}/users/me/messages${buildQueryString({
          q: input.query,
          maxResults: input.limit,
        })}`;

        const listResponse = await this.get<{ messages?: Array<{ id: string }> }>(url);

        if (!listResponse.messages?.length) {
          return [];
        }

        const messages = await Promise.all(
          listResponse.messages.slice(0, input.limit).map(async (m) => {
            const msg = await this.get<GmailApiMessage>(
              `${GMAIL_API_BASE}/users/me/messages/${m.id}?format=full`
            );
            return this.transformMessage(msg);
          })
        );

        return messages;
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
        // Search for emails NOT from internal domain
        const url = `${GMAIL_API_BASE}/users/me/messages${buildQueryString({
          q: `-from:@${input.internalDomain}`,
          maxResults: input.limit,
        })}`;

        const listResponse = await this.get<{ messages?: Array<{ id: string }> }>(url);

        if (!listResponse.messages?.length) {
          return [];
        }

        const messages = await Promise.all(
          listResponse.messages.slice(0, input.limit).map(async (m) => {
            const msg = await this.get<GmailApiMessage>(
              `${GMAIL_API_BASE}/users/me/messages/${m.id}?format=full`
            );
            return this.transformMessage(msg);
          })
        );

        return messages;
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

  // ============================================================================
  // Transform Gmail API response to our schema
  // ============================================================================

  private transformMessage(msg: GmailApiMessage): GmailMessage {
    const headers = msg.payload?.headers ?? [];
    const getHeader = (name: string) =>
      headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? '';

    const from = this.parseEmailAddress(getHeader('From'));
    const to = this.parseEmailAddresses(getHeader('To'));
    const cc = this.parseEmailAddresses(getHeader('Cc'));

    // Extract body
    let body = '';
    if (msg.payload?.body?.data) {
      body = this.decodeBase64(msg.payload.body.data);
    } else if (msg.payload?.parts) {
      body = this.extractBodyFromParts(msg.payload.parts);
    }

    return {
      id: msg.id,
      threadId: msg.threadId,
      from,
      to,
      cc: cc.length > 0 ? cc : undefined,
      subject: getHeader('Subject'),
      snippet: msg.snippet,
      body,
      labels: msg.labelIds ?? [],
      isRead: !(msg.labelIds?.includes('UNREAD') ?? false),
      isStarred: msg.labelIds?.includes('STARRED') ?? false,
      hasAttachments: this.hasAttachments(msg.payload?.parts),
      receivedAt: msg.internalDate
        ? new Date(parseInt(msg.internalDate)).toISOString()
        : new Date().toISOString(),
    };
  }

  private transformThread(thread: GmailApiThread): GmailThread {
    const messages = thread.messages ?? [];
    const participants = new Map<string, { name: string; email: string }>();

    let subject = '';
    let lastMessageAt = '';
    const labels = new Set<string>();

    for (const msg of messages) {
      const headers = msg.payload?.headers ?? [];
      const fromHeader = headers.find((h) => h.name.toLowerCase() === 'from')?.value ?? '';
      const subjectHeader = headers.find((h) => h.name.toLowerCase() === 'subject')?.value ?? '';

      const from = this.parseEmailAddress(fromHeader);
      participants.set(from.email, from);

      if (!subject && subjectHeader) {
        subject = subjectHeader;
      }

      if (msg.internalDate) {
        const date = new Date(parseInt(msg.internalDate)).toISOString();
        if (!lastMessageAt || date > lastMessageAt) {
          lastMessageAt = date;
        }
      }

      for (const label of msg.labelIds ?? []) {
        labels.add(label);
      }
    }

    return {
      id: thread.id,
      subject,
      snippet: thread.snippet,
      messageCount: messages.length,
      participants: Array.from(participants.values()),
      labels: Array.from(labels),
      lastMessageAt: lastMessageAt || new Date().toISOString(),
    };
  }

  private parseEmailAddress(str: string): { name: string; email: string } {
    // Parse "Name <email@example.com>" or just "email@example.com"
    const match = str.match(/^(?:"?([^"<]*)"?\s*)?<?([^>]+)>?$/);
    if (match) {
      return {
        name: match[1]?.trim() || match[2]?.split('@')[0] || '',
        email: match[2]?.trim() || str,
      };
    }
    return { name: str.split('@')[0] || '', email: str };
  }

  private parseEmailAddresses(str: string): Array<{ name: string; email: string }> {
    if (!str) return [];
    return str.split(',').map((s) => this.parseEmailAddress(s.trim()));
  }

  private decodeBase64(data: string): string {
    try {
      // Gmail uses URL-safe base64
      const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
      return Buffer.from(base64, 'base64').toString('utf8');
    } catch {
      return '';
    }
  }

  private extractBodyFromParts(parts?: GmailMessagePart[]): string {
    if (!parts) return '';

    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return this.decodeBase64(part.body.data);
      }
      if (part.parts) {
        const body = this.extractBodyFromParts(part.parts);
        if (body) return body;
      }
    }

    // Fall back to HTML if no plain text
    for (const part of parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        // Basic HTML stripping - in production use a proper HTML parser
        return this.decodeBase64(part.body.data).replace(/<[^>]*>/g, '');
      }
    }

    return '';
  }

  private hasAttachments(parts?: GmailMessagePart[]): boolean {
    if (!parts) return false;
    return parts.some(
      (p: GmailMessagePart) =>
        (p.mimeType && !p.mimeType.startsWith('text/') && !p.mimeType.startsWith('multipart/')) ||
        (p.parts && this.hasAttachments(p.parts))
    );
  }
}
