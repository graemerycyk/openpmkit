import { z } from 'zod';
import { nanoid } from 'nanoid';
import type {
  MCPServer,
  MCPServerConfig,
  MCPToolDefinition,
  MCPTool,
  MCPContext,
  MCPToolResult,
  ConnectorKey,
  OAuthTokens,
} from './index';

// ============================================================================
// Remote MCP Server Configuration
// ============================================================================

export interface RemoteMCPServerConfig {
  /** Connector key for this server */
  connectorKey: ConnectorKey;
  
  /** Display name */
  name: string;
  
  /** Description */
  description: string;
  
  /** MCP Server URL (e.g., https://mcp.atlassian.com) */
  serverUrl: string;
  
  /** OAuth configuration for this connector */
  oauth: {
    authorizationUrl: string;
    tokenUrl: string;
    scopes: string[];
    /** Additional params for authorization request */
    additionalAuthParams?: Record<string, string>;
  };
}

// ============================================================================
// Official MCP Server Configurations
// ============================================================================

export const MCP_SERVER_CONFIGS: Record<ConnectorKey, RemoteMCPServerConfig> = {
  jira: {
    connectorKey: 'jira',
    name: 'Atlassian Jira',
    description: 'Jira issue tracking via Atlassian Rovo MCP Server',
    serverUrl: 'https://mcp.atlassian.com',
    oauth: {
      authorizationUrl: 'https://auth.atlassian.com/authorize',
      tokenUrl: 'https://auth.atlassian.com/oauth/token',
      scopes: [
        'read:jira-work',
        'write:jira-work',
        'read:jira-user',
        'offline_access',
      ],
      additionalAuthParams: {
        audience: 'api.atlassian.com',
        prompt: 'consent',
      },
    },
  },
  confluence: {
    connectorKey: 'confluence',
    name: 'Atlassian Confluence',
    description: 'Confluence documentation via Atlassian Rovo MCP Server',
    serverUrl: 'https://mcp.atlassian.com',
    oauth: {
      authorizationUrl: 'https://auth.atlassian.com/authorize',
      tokenUrl: 'https://auth.atlassian.com/oauth/token',
      scopes: [
        'read:confluence-content.all',
        'write:confluence-content',
        'read:confluence-space.summary',
        'offline_access',
      ],
      additionalAuthParams: {
        audience: 'api.atlassian.com',
        prompt: 'consent',
      },
    },
  },
  slack: {
    connectorKey: 'slack',
    name: 'Slack',
    description: 'Slack messaging via Slack MCP Server',
    serverUrl: 'https://mcp.slack.com', // Partner access required
    oauth: {
      authorizationUrl: 'https://slack.com/oauth/v2/authorize',
      tokenUrl: 'https://slack.com/api/oauth.v2.access',
      scopes: [
        'channels:history',
        'channels:read',
        'chat:write',
        'users:read',
        'search:read',
      ],
    },
  },
  gong: {
    connectorKey: 'gong',
    name: 'Gong',
    description: 'Gong call intelligence via Gong MCP Server',
    serverUrl: 'https://mcp.gong.io', // TBD - check Gong docs
    oauth: {
      authorizationUrl: 'https://app.gong.io/oauth2/authorize',
      tokenUrl: 'https://app.gong.io/oauth2/token',
      scopes: [
        'api:calls:read',
        'api:users:read',
        'api:stats:read',
      ],
    },
  },
  zendesk: {
    connectorKey: 'zendesk',
    name: 'Zendesk',
    description: 'Zendesk support via Zendesk MCP Server',
    serverUrl: 'https://mcp.zendesk.com', // TBD - check Zendesk docs
    oauth: {
      authorizationUrl: 'https://{subdomain}.zendesk.com/oauth/authorizations/new',
      tokenUrl: 'https://{subdomain}.zendesk.com/oauth/tokens',
      scopes: [
        'tickets:read',
        'tickets:write',
        'users:read',
      ],
    },
  },
};

// ============================================================================
// Remote MCP Client
// ============================================================================

export interface RemoteMCPClientConfig {
  /** The connector configuration */
  connector: RemoteMCPServerConfig;
  
  /** OAuth tokens for authentication */
  tokens: OAuthTokens;
  
  /** Callback when tokens are refreshed */
  onTokenRefresh?: (tokens: OAuthTokens) => Promise<void>;
  
  /** Request timeout in ms */
  timeout?: number;
}

/**
 * Client for connecting to remote MCP servers (Atlassian, Slack, Gong, Zendesk)
 */
export class RemoteMCPClient implements MCPServer {
  config: MCPServerConfig;
  tools: Map<string, MCPTool> = new Map();
  
  private connector: RemoteMCPServerConfig;
  private tokens: OAuthTokens;
  private onTokenRefresh?: (tokens: OAuthTokens) => Promise<void>;
  private timeout: number;
  private toolsDiscovered = false;

  constructor(clientConfig: RemoteMCPClientConfig) {
    this.connector = clientConfig.connector;
    this.tokens = clientConfig.tokens;
    this.onTokenRefresh = clientConfig.onTokenRefresh;
    this.timeout = clientConfig.timeout ?? 30000;
    
    this.config = {
      name: this.connector.connectorKey,
      description: this.connector.description,
      version: '1.0.0',
    };
  }

  /**
   * Discover available tools from the remote MCP server
   */
  async discoverTools(): Promise<MCPToolDefinition[]> {
    const response = await this.mcpRequest('tools/list', {});
    
    if (!response.tools) {
      return [];
    }

    // Register discovered tools
    for (const tool of response.tools) {
      this.tools.set(tool.name, {
        name: tool.name,
        description: tool.description,
        inputSchema: z.any(), // Remote tools use JSON Schema
        outputSchema: z.any(),
        execute: async (input, context) => {
          return this.callRemoteTool(tool.name, input, context);
        },
      });
    }

    this.toolsDiscovered = true;
    return response.tools;
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

    // Auto-discover tools if not yet done
    if (!this.toolsDiscovered) {
      await this.discoverTools();
    }

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
      const result = await this.callRemoteTool(toolName, input, context);
      
      return {
        success: true,
        data: result as TOutput,
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

  /**
   * Make a request to the remote MCP server
   */
  private async mcpRequest(method: string, params: Record<string, unknown>): Promise<any> {
    // Check if token needs refresh
    if (this.tokens.expiresAt && new Date() >= this.tokens.expiresAt) {
      await this.refreshAccessToken();
    }

    const response = await fetch(`${this.connector.serverUrl}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${this.tokens.tokenType} ${this.tokens.accessToken}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: nanoid(),
        method,
        params,
      }),
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh token and retry
        await this.refreshAccessToken();
        return this.mcpRequest(method, params);
      }
      throw new Error(`MCP request failed: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    
    if (json.error) {
      throw new Error(`MCP error: ${json.error.message}`);
    }

    return json.result;
  }

  /**
   * Call a specific tool on the remote server
   */
  private async callRemoteTool(
    toolName: string,
    input: unknown,
    _context: MCPContext
  ): Promise<unknown> {
    const result = await this.mcpRequest('tools/call', {
      name: toolName,
      arguments: input,
    });

    return result.content;
  }

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.tokens.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(this.connector.oauth.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.tokens.refreshToken,
        client_id: process.env[`${this.connector.connectorKey.toUpperCase()}_CLIENT_ID`] ?? '',
        client_secret: process.env[`${this.connector.connectorKey.toUpperCase()}_CLIENT_SECRET`] ?? '',
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    
    this.tokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? this.tokens.refreshToken,
      expiresAt: data.expires_in 
        ? new Date(Date.now() + data.expires_in * 1000)
        : undefined,
      tokenType: data.token_type ?? 'Bearer',
      scopes: data.scope?.split(' ') ?? this.tokens.scopes,
    };

    // Notify callback about token refresh
    if (this.onTokenRefresh) {
      await this.onTokenRefresh(this.tokens);
    }
  }
}

// ============================================================================
// OAuth Helper Functions
// ============================================================================

/**
 * Generate OAuth authorization URL for a connector
 */
export function getOAuthAuthorizationUrl(
  connectorKey: ConnectorKey,
  redirectUri: string,
  state: string,
  clientId: string
): string {
  const config = MCP_SERVER_CONFIGS[connectorKey];
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.oauth.scopes.join(' '),
    state,
    ...config.oauth.additionalAuthParams,
  });

  return `${config.oauth.authorizationUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  connectorKey: ConnectorKey,
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string
): Promise<OAuthTokens> {
  const config = MCP_SERVER_CONFIGS[connectorKey];

  const response = await fetch(config.oauth.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000)
      : undefined,
    tokenType: data.token_type ?? 'Bearer',
    scopes: data.scope?.split(' ') ?? config.oauth.scopes,
  };
}

// ============================================================================
// Credential Encryption Helpers
// ============================================================================

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt OAuth tokens for storage
 */
export function encryptTokens(tokens: OAuthTokens, encryptionKey: string): string {
  const key = scryptSync(encryptionKey, 'salt', 32);
  const iv = randomBytes(16);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(tokens), 'utf8'),
    cipher.final(),
  ]);
  
  const authTag = cipher.getAuthTag();
  
  // Combine iv + authTag + encrypted data
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString('base64');
}

/**
 * Decrypt OAuth tokens from storage
 */
export function decryptTokens(encryptedBlob: string, encryptionKey: string): OAuthTokens {
  const key = scryptSync(encryptionKey, 'salt', 32);
  const combined = Buffer.from(encryptedBlob, 'base64');
  
  const iv = combined.subarray(0, 16);
  const authTag = combined.subarray(16, 32);
  const encrypted = combined.subarray(32);
  
  const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  
  return JSON.parse(decrypted.toString('utf8'));
}

