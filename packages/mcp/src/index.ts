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
// Connector Types
// ============================================================================

export const ConnectorKeySchema = z.enum([
  'jira',
  'confluence',
  'slack',
  'gong',
  'zendesk',
  'gmail',
  'google-drive',
  'google-calendar',
  'figma',
]);
export type ConnectorKey = z.infer<typeof ConnectorKeySchema>;

export const ConnectorStatusSchema = z.enum(['mock', 'real', 'disabled']);
export type ConnectorStatus = z.infer<typeof ConnectorStatusSchema>;

export const ConnectorInstallSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  connectorKey: ConnectorKeySchema,
  status: ConnectorStatusSchema,
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type ConnectorInstall = z.infer<typeof ConnectorInstallSchema>;

export const ConnectorCredentialSchema = z.object({
  id: z.string(),
  installId: z.string(),
  encryptedBlob: z.string(),
  scopesJson: z.record(z.unknown()).optional(),
  expiresAt: z.date().optional(),
  refreshable: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type ConnectorCredential = z.infer<typeof ConnectorCredentialSchema>;

export const ConnectorPolicySchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  connectorKey: ConnectorKeySchema,
  allowedToolsJson: z.array(z.string()).optional(),
  allowedResourcesJson: z.record(z.unknown()).optional(),
  proposalOnly: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type ConnectorPolicy = z.infer<typeof ConnectorPolicySchema>;

// ============================================================================
// Policy Decision Types
// ============================================================================

export const PolicyDecisionSchema = z.enum(['ALLOW', 'DENY']);
export type PolicyDecision = z.infer<typeof PolicyDecisionSchema>;

export const PolicyDecisionLogSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  jobRunId: z.string().optional(),
  toolCallId: z.string().optional(),
  decision: PolicyDecisionSchema,
  reason: z.string(),
  ruleMatched: z.string().optional(),
  createdAt: z.date(),
});
export type PolicyDecisionLog = z.infer<typeof PolicyDecisionLogSchema>;

// ============================================================================
// Connector Policy Enforcer
// ============================================================================

export interface ConnectorPolicyStore {
  findByConnector(tenantId: string, connectorKey: ConnectorKey): Promise<ConnectorPolicy | null>;
  findInstall(tenantId: string, connectorKey: ConnectorKey): Promise<ConnectorInstall | null>;
}

export interface PolicyDecisionLogger {
  log(entry: Omit<PolicyDecisionLog, 'id' | 'createdAt'>): Promise<PolicyDecisionLog>;
}

export class ConnectorPolicyEnforcer {
  constructor(
    private policyStore: ConnectorPolicyStore,
    private logger?: PolicyDecisionLogger
  ) {}

  /**
   * Check if a tool call is allowed by policy
   */
  async checkToolCall(
    tenantId: string,
    connectorKey: ConnectorKey,
    toolName: string,
    jobRunId?: string
  ): Promise<PolicyCheckResult> {
    // Check if connector is installed and active
    const install = await this.policyStore.findInstall(tenantId, connectorKey);
    if (!install) {
      return this.deny('Connector not installed', 'install_check', jobRunId);
    }

    if (install.status === 'disabled') {
      return this.deny('Connector is disabled', 'status_check', jobRunId);
    }

    // Get policy for this connector
    const policy = await this.policyStore.findByConnector(tenantId, connectorKey);

    // If no policy, allow by default (but log)
    if (!policy) {
      return this.allow('No policy defined, allowing by default', 'no_policy', jobRunId);
    }

    // Check if tool is in allowed list (if specified)
    if (policy.allowedToolsJson && policy.allowedToolsJson.length > 0) {
      if (!policy.allowedToolsJson.includes(toolName)) {
        return this.deny(
          `Tool '${toolName}' not in allowed list`,
          'tool_allowlist',
          jobRunId
        );
      }
    }

    // Check proposal-only enforcement for write tools
    if (policy.proposalOnly && !toolName.startsWith('propose_') && this.isWriteTool(toolName)) {
      return this.deny(
        `Direct writes not allowed; use propose_* tools`,
        'proposal_only',
        jobRunId
      );
    }

    return this.allow('Policy check passed', 'policy_passed', jobRunId);
  }

  /**
   * Check if connector can be used (at install level)
   */
  async checkConnectorAccess(
    tenantId: string,
    connectorKey: ConnectorKey,
    jobRunId?: string
  ): Promise<PolicyCheckResult> {
    const install = await this.policyStore.findInstall(tenantId, connectorKey);

    if (!install) {
      return this.deny('Connector not installed', 'install_check', jobRunId);
    }

    if (install.status === 'disabled') {
      return this.deny('Connector is disabled', 'status_check', jobRunId);
    }

    return this.allow('Connector access allowed', 'connector_access', jobRunId);
  }

  private isWriteTool(toolName: string): boolean {
    // Tools that would write to external systems
    const writePatterns = [
      'create_',
      'update_',
      'delete_',
      'post_',
      'send_',
      'publish_',
      'add_',
      'remove_',
    ];
    return writePatterns.some((pattern) => toolName.startsWith(pattern));
  }

  private async allow(
    reason: string,
    ruleMatched: string,
    jobRunId?: string
  ): Promise<PolicyCheckResult> {
    if (this.logger) {
      await this.logger.log({
        tenantId: '',
        jobRunId,
        decision: 'ALLOW',
        reason,
        ruleMatched,
      });
    }
    return { allowed: true, reason };
  }

  private async deny(
    reason: string,
    ruleMatched: string,
    jobRunId?: string
  ): Promise<PolicyCheckResult> {
    if (this.logger) {
      await this.logger.log({
        tenantId: '',
        jobRunId,
        decision: 'DENY',
        reason,
        ruleMatched,
      });
    }
    return { allowed: false, reason };
  }
}

export interface PolicyCheckResult {
  allowed: boolean;
  reason: string;
}

// ============================================================================
// Connector Context (extended MCP context with connector info)
// ============================================================================

export interface ConnectorContext extends MCPContext {
  connectorKey: ConnectorKey;
  connectorStatus: ConnectorStatus;
  credentials?: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    scopes?: string[];
  };
}

// ============================================================================
// Real Connector Base Class
// ============================================================================

export abstract class RealConnectorServer extends BaseMCPServer {
  abstract connectorKey: ConnectorKey;

  /**
   * Initialize OAuth flow for this connector
   */
  abstract getOAuthConfig(): OAuthConfig;

  /**
   * Exchange authorization code for tokens
   */
  abstract exchangeCode(code: string, redirectUri: string): Promise<OAuthTokens>;

  /**
   * Refresh expired tokens
   */
  abstract refreshTokens(refreshToken: string): Promise<OAuthTokens>;

  /**
   * Validate that credentials are still valid
   */
  abstract validateCredentials(tokens: OAuthTokens): Promise<boolean>;
}

export interface OAuthConfig {
  authorizationUrl: string;
  tokenUrl: string;
  clientId: string;
  scopes: string[];
  additionalParams?: Record<string, string>;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  tokenType: string;
  scopes: string[];
}

// ============================================================================
// Remote MCP & Factory
// ============================================================================

export * from './remote';
export * from './factory';
export * from './real-rest-server';

// ============================================================================
// Default MCP Client Instance
// ============================================================================

export const mcpClient = new MCPClient();

