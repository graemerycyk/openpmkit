import { z } from 'zod';
import { BaseMCPServer, createProposalTool } from '@pmkit/mcp';

// ============================================================================
// Slack Data Types
// ============================================================================

export const SlackMessageSchema = z.object({
  id: z.string(),
  channelId: z.string(),
  channelName: z.string(),
  userId: z.string(),
  userName: z.string(),
  text: z.string(),
  threadTs: z.string().optional(),
  reactions: z.array(
    z.object({
      name: z.string(),
      count: z.number(),
    })
  ),
  timestamp: z.string(),
});

export type SlackMessage = z.infer<typeof SlackMessageSchema>;

export const SlackChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  isPrivate: z.boolean(),
  memberCount: z.number(),
});

export type SlackChannel = z.infer<typeof SlackChannelSchema>;

// ============================================================================
// Mock Slack MCP Server
// ============================================================================

export class MockSlackMCPServer extends BaseMCPServer {
  private mockMessages: Map<string, SlackMessage> = new Map();
  private mockChannels: Map<string, SlackChannel> = new Map();

  constructor() {
    super({
      name: 'slack',
      description: 'Slack integration for team communication and signal capture',
      version: '1.0.0',
    });

    this.registerTools();
  }

  loadMockData(messages: SlackMessage[], channels: SlackChannel[]): void {
    this.mockMessages.clear();
    this.mockChannels.clear();

    for (const message of messages) {
      this.mockMessages.set(message.id, message);
    }
    for (const channel of channels) {
      this.mockChannels.set(channel.id, channel);
    }
  }

  private registerTools(): void {
    // Read tools
    this.registerTool({
      name: 'get_channel_messages',
      description: 'Get messages from a Slack channel',
      inputSchema: z.object({
        channelId: z.string(),
        limit: z.number().optional().default(100),
        oldest: z.string().optional(),
        latest: z.string().optional(),
      }),
      outputSchema: z.object({
        messages: z.array(SlackMessageSchema),
        hasMore: z.boolean(),
      }),
      execute: async (input) => {
        const limit = input.limit ?? 100;
        let messages = Array.from(this.mockMessages.values()).filter(
          (m) => m.channelId === input.channelId
        );

        // Sort by timestamp descending
        messages.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

        return {
          messages: messages.slice(0, limit),
          hasMore: messages.length > limit,
        };
      },
    });

    this.registerTool({
      name: 'search_messages',
      description: 'Search Slack messages',
      inputSchema: z.object({
        query: z.string(),
        channelIds: z.array(z.string()).optional(),
        limit: z.number().optional().default(50),
      }),
      outputSchema: z.object({
        messages: z.array(SlackMessageSchema),
        total: z.number(),
      }),
      execute: async (input) => {
        let messages = Array.from(this.mockMessages.values());

        if (input.channelIds?.length) {
          messages = messages.filter((m) =>
            input.channelIds!.includes(m.channelId)
          );
        }

        const query = input.query.toLowerCase();
        messages = messages.filter((m) =>
          m.text.toLowerCase().includes(query)
        );

        return {
          messages: messages.slice(0, input.limit),
          total: messages.length,
        };
      },
    });

    this.registerTool({
      name: 'get_thread',
      description: 'Get all messages in a Slack thread',
      inputSchema: z.object({
        channelId: z.string(),
        threadTs: z.string(),
      }),
      outputSchema: z.array(SlackMessageSchema),
      execute: async (input) => {
        return Array.from(this.mockMessages.values()).filter(
          (m) =>
            m.channelId === input.channelId && m.threadTs === input.threadTs
        );
      },
    });

    this.registerTool({
      name: 'get_channels',
      description: 'Get list of Slack channels',
      inputSchema: z.object({
        includePrivate: z.boolean().optional().default(false),
      }),
      outputSchema: z.array(SlackChannelSchema),
      execute: async (input) => {
        let channels = Array.from(this.mockChannels.values());

        if (!input.includePrivate) {
          channels = channels.filter((c) => !c.isPrivate);
        }

        return channels;
      },
    });

    this.registerTool({
      name: 'get_reactions',
      description: 'Get messages with specific reactions (e.g., :eyes:, :+1:)',
      inputSchema: z.object({
        channelId: z.string(),
        reaction: z.string(),
        limit: z.number().optional().default(50),
      }),
      outputSchema: z.array(SlackMessageSchema),
      execute: async (input) => {
        return Array.from(this.mockMessages.values())
          .filter(
            (m) =>
              m.channelId === input.channelId &&
              m.reactions.some((r) => r.name === input.reaction)
          )
          .slice(0, input.limit);
      },
    });

    // Proposal tools (draft-only)
    this.registerTool(
      createProposalTool(
        'slack_message',
        'Propose a Slack message to be sent',
        z.object({
          channelId: z.string(),
          text: z.string(),
          threadTs: z.string().optional(),
        }),
        'slack',
        async (input) => {
          const channel = this.mockChannels.get(input.channelId);
          const channelName = channel?.name || input.channelId;

          return {
            title: `Message to #${channelName}`,
            preview: input.text,
            bundle: {
              channelId: input.channelId,
              channelName,
              text: input.text,
              threadTs: input.threadTs,
            },
          };
        }
      )
    );
  }
}

export const mockSlackServer = new MockSlackMCPServer();

