import { z } from 'zod';
import { nanoid } from 'nanoid';
import type { ToolCall, ToolCallStatus } from '@pmkit/core';

// ============================================================================
// MCP Tool Definition
// ============================================================================

export interface MCPToolDefinition<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  inputSchema: z.ZodSchema<TInput>;
  outputSchema: z.ZodSchema<TOutput>;
}

export interface MCPTool<TInput = unknown, TOutput = unknown>
  extends MCPToolDefinition<TInput, TOutput> {
  execute: (input: TInput, context: MCPContext) => Promise<TOutput>;
}

// ============================================================================
// MCP Server Definition
// ============================================================================

export interface MCPServerConfig {
  name: string;
  description: string;
  version: string;
}

export interface MCPServer {
  config: MCPServerConfig;
  tools: Map<string, MCPTool>;
  getToolList(): MCPToolDefinition[];
  callTool<TInput, TOutput>(
    toolName: string,
    input: TInput,
    context: MCPContext
  ): Promise<MCPToolResult<TOutput>>;
}

// ============================================================================
// MCP Context (passed to tool execution)
// ============================================================================

export interface MCPContext {
  tenantId: string;
  userId: string;
  jobId: string;
  permissions: string[];
  simulatePermissions?: boolean;
}

// ============================================================================
// MCP Tool Result
// ============================================================================

export interface MCPToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  durationMs: number;
  toolCallId: string;
}

// ============================================================================
// Base MCP Server Implementation
// ============================================================================

export abstract class BaseMCPServer implements MCPServer {
  config: MCPServerConfig;
  tools: Map<string, MCPTool> = new Map();

  constructor(config: MCPServerConfig) {
    this.config = config;
  }

  protected registerTool<TInput, TOutput>(tool: MCPTool<TInput, TOutput>): void {
    this.tools.set(tool.name, tool as MCPTool);
  }

  getToolList(): MCPToolDefinition[] {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      outputSchema: tool.outputSchema,
    }));
  }

  async callTool<TInput, TOutput>(
    toolName: string,
    input: TInput,
    context: MCPContext
  ): Promise<MCPToolResult<TOutput>> {
    const toolCallId = nanoid();
    const startTime = Date.now();

    const tool = this.tools.get(toolName);
    if (!tool) {
      return {
        success: false,
        error: `Tool not found: ${toolName}`,
        durationMs: Date.now() - startTime,
        toolCallId,
      };
    }

    try {
      // Validate input
      const validatedInput = tool.inputSchema.parse(input);

      // Execute tool
      const result = await tool.execute(validatedInput, context);

      // Validate output
      const validatedOutput = tool.outputSchema.parse(result);

      return {
        success: true,
        data: validatedOutput as TOutput,
        durationMs: Date.now() - startTime,
        toolCallId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        durationMs: Date.now() - startTime,
        toolCallId,
      };
    }
  }
}

// ============================================================================
// MCP Client (for calling multiple servers)
// ============================================================================

export class MCPClient {
  private servers: Map<string, MCPServer> = new Map();

  registerServer(server: MCPServer): void {
    this.servers.set(server.config.name, server);
  }

  getServer(name: string): MCPServer | undefined {
    return this.servers.get(name);
  }

  getServerList(): MCPServerConfig[] {
    return Array.from(this.servers.values()).map((s) => s.config);
  }

  getAllTools(): Array<{ server: string; tool: MCPToolDefinition }> {
    const tools: Array<{ server: string; tool: MCPToolDefinition }> = [];

    for (const [serverName, server] of this.servers) {
      for (const tool of server.getToolList()) {
        tools.push({ server: serverName, tool });
      }
    }

    return tools;
  }

  async callTool<TInput, TOutput>(
    serverName: string,
    toolName: string,
    input: TInput,
    context: MCPContext
  ): Promise<MCPToolResult<TOutput>> {
    const server = this.servers.get(serverName);
    if (!server) {
      return {
        success: false,
        error: `Server not found: ${serverName}`,
        durationMs: 0,
        toolCallId: nanoid(),
      };
    }

    return server.callTool<TInput, TOutput>(toolName, input, context);
  }
}

// ============================================================================
// Proposal Tools (Draft-Only Pattern)
// ============================================================================

export const ProposalResultSchema = z.object({
  proposalId: z.string(),
  preview: z.string(),
  diff: z.string().optional(),
  bundle: z.record(z.unknown()),
  targetSystem: z.string(),
  targetId: z.string().optional(),
});

export type ProposalResult = z.infer<typeof ProposalResultSchema>;

// Helper to create a proposal tool (propose_* pattern)
export function createProposalTool<TInput extends z.ZodSchema>(
  name: string,
  description: string,
  inputSchema: TInput,
  targetSystem: string,
  generateProposal: (
    input: z.infer<TInput>,
    context: MCPContext
  ) => Promise<{
    title: string;
    preview: string;
    diff?: string;
    bundle: Record<string, unknown>;
    targetId?: string;
  }>
): MCPTool<z.infer<TInput>, ProposalResult> {
  return {
    name: `propose_${name}`,
    description: `[DRAFT-ONLY] ${description}. Returns a proposal for review, does NOT write directly.`,
    inputSchema,
    outputSchema: ProposalResultSchema,
    execute: async (input, context) => {
      const proposal = await generateProposal(input, context);

      return {
        proposalId: nanoid(),
        preview: proposal.preview,
        diff: proposal.diff,
        bundle: proposal.bundle,
        targetSystem,
        targetId: proposal.targetId,
      };
    },
  };
}

// ============================================================================
// Default MCP Client Instance
// ============================================================================

export const mcpClient = new MCPClient();

