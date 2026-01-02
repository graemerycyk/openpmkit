import type { MCPServer, MCPClient, ConnectorKey, OAuthTokens } from './index';
import { RemoteMCPClient, MCP_SERVER_CONFIGS, decryptTokens } from './remote';

// ============================================================================
// Connector Mode
// ============================================================================

export type ConnectorMode = 'mock' | 'real';

export interface StoredCredentials {
  encryptedBlob: string;
  expiresAt?: Date;
}

export interface ConnectorInstallInfo {
  status: ConnectorMode;
  connectorKey: ConnectorKey;
}

export interface ConnectorFactoryConfig {
  /** Encryption key for decrypting stored credentials */
  encryptionKey: string;
  
  /** Function to get connector install status for a tenant */
  getConnectorStatus: (tenantId: string, connectorKey: ConnectorKey) => Promise<ConnectorInstallInfo | null>;
  
  /** Function to get stored credentials for a tenant/connector */
  getCredentials: (tenantId: string, connectorKey: ConnectorKey) => Promise<StoredCredentials | null>;
  
  /** Function to save refreshed credentials */
  saveCredentials: (tenantId: string, connectorKey: ConnectorKey, tokens: OAuthTokens) => Promise<void>;
}

// ============================================================================
// Special Demo Tenant
// ============================================================================

/** 
 * Demo tenant ID - always uses mock connectors.
 * Real tenants use their actual connector installs (mock until OAuth connected, then real).
 */
export const DEMO_TENANT_ID = 'demo';

// ============================================================================
// Connector Factory
// ============================================================================

/**
 * Factory for creating MCP connectors based on tenant context.
 * 
 * - Demo tenant (DEMO_TENANT_ID): Always returns mock servers
 * - Real tenants: Returns mock or real based on their connector install status
 *   - status='mock': Returns mock server (connector installed but OAuth not connected)
 *   - status='real': Returns real MCP client (OAuth connected)
 */
export class ConnectorFactory {
  private config: ConnectorFactoryConfig;
  private mockServers: Map<ConnectorKey, MCPServer> = new Map();

  constructor(config: ConnectorFactoryConfig) {
    this.config = config;
  }

  /**
   * Register mock servers (loaded from @pmkit/mcp-servers)
   */
  registerMockServer(connectorKey: ConnectorKey, server: MCPServer): void {
    this.mockServers.set(connectorKey, server);
  }

  /**
   * Check if this is the demo tenant
   */
  isDemoTenant(tenantId: string): boolean {
    return tenantId === DEMO_TENANT_ID;
  }

  /**
   * Get a connector for a specific tenant.
   * Demo tenant always gets mock. Real tenants get based on their install status.
   */
  async getConnector(
    tenantId: string,
    connectorKey: ConnectorKey
  ): Promise<MCPServer | null> {
    // Demo tenant always uses mock
    if (this.isDemoTenant(tenantId)) {
      return this.getMockConnector(connectorKey);
    }

    // Real tenant - check their connector install status
    const installInfo = await this.config.getConnectorStatus(tenantId, connectorKey);
    
    if (!installInfo) {
      // Connector not installed for this tenant
      return null;
    }

    if (installInfo.status === 'mock') {
      // Installed but OAuth not connected yet - use mock
      return this.getMockConnector(connectorKey);
    }

    // Real mode - use actual MCP connection
    return this.getRealConnector(tenantId, connectorKey);
  }

  /**
   * Get mock connector
   */
  getMockConnector(connectorKey: ConnectorKey): MCPServer | null {
    return this.mockServers.get(connectorKey) ?? null;
  }

  /**
   * Get real MCP connector with stored credentials
   */
  private async getRealConnector(
    tenantId: string,
    connectorKey: ConnectorKey
  ): Promise<MCPServer | null> {
    // Get stored credentials
    const stored = await this.config.getCredentials(tenantId, connectorKey);
    if (!stored) {
      // No credentials - fall back to mock
      console.warn(`No credentials for ${connectorKey} on tenant ${tenantId}, falling back to mock`);
      return this.getMockConnector(connectorKey);
    }

    // Decrypt tokens
    const tokens = decryptTokens(stored.encryptedBlob, this.config.encryptionKey);

    // Get connector config
    const connectorConfig = MCP_SERVER_CONFIGS[connectorKey];

    // Create remote MCP client
    const client = new RemoteMCPClient({
      connector: connectorConfig,
      tokens,
      onTokenRefresh: async (newTokens) => {
        // Save refreshed tokens
        await this.config.saveCredentials(tenantId, connectorKey, newTokens);
      },
    });

    // Discover tools
    await client.discoverTools();

    return client;
  }

  /**
   * Check if a connector is available for a tenant
   */
  async isConnectorAvailable(
    tenantId: string,
    connectorKey: ConnectorKey
  ): Promise<boolean> {
    // Demo tenant - all mock connectors available
    if (this.isDemoTenant(tenantId)) {
      return this.mockServers.has(connectorKey);
    }

    // Real tenant - check install status
    const installInfo = await this.config.getConnectorStatus(tenantId, connectorKey);
    return installInfo !== null;
  }

  /**
   * Get connector mode for a tenant (for UI display)
   */
  async getConnectorMode(
    tenantId: string,
    connectorKey: ConnectorKey
  ): Promise<ConnectorMode | null> {
    if (this.isDemoTenant(tenantId)) {
      return 'mock';
    }

    const installInfo = await this.config.getConnectorStatus(tenantId, connectorKey);
    return installInfo?.status ?? null;
  }

  /**
   * Get all available connectors for a tenant
   */
  async getAvailableConnectors(tenantId: string): Promise<ConnectorKey[]> {
    const available: ConnectorKey[] = [];
    const allConnectors: ConnectorKey[] = ['jira', 'confluence', 'slack', 'gong', 'zendesk'];

    for (const key of allConnectors) {
      if (await this.isConnectorAvailable(tenantId, key)) {
        available.push(key);
      }
    }

    return available;
  }

  /**
   * Get connector status summary for a tenant (for settings UI)
   */
  async getConnectorsSummary(tenantId: string): Promise<Array<{
    connectorKey: ConnectorKey;
    available: boolean;
    mode: ConnectorMode | null;
    isDemo: boolean;
  }>> {
    const allConnectors: ConnectorKey[] = ['jira', 'confluence', 'slack', 'gong', 'zendesk'];
    const isDemo = this.isDemoTenant(tenantId);

    return Promise.all(
      allConnectors.map(async (connectorKey) => ({
        connectorKey,
        available: await this.isConnectorAvailable(tenantId, connectorKey),
        mode: await this.getConnectorMode(tenantId, connectorKey),
        isDemo,
      }))
    );
  }
}

// ============================================================================
// Create Pre-configured Factory
// ============================================================================

/**
 * Create a connector factory with credential store integration
 */
export function createConnectorFactory(options: {
  getConnectorStatus: ConnectorFactoryConfig['getConnectorStatus'];
  getCredentials: ConnectorFactoryConfig['getCredentials'];
  saveCredentials: ConnectorFactoryConfig['saveCredentials'];
}): ConnectorFactory {
  const encryptionKey = process.env.CONNECTOR_ENCRYPTION_KEY ?? 'default-dev-key';

  return new ConnectorFactory({
    encryptionKey,
    getConnectorStatus: options.getConnectorStatus,
    getCredentials: options.getCredentials,
    saveCredentials: options.saveCredentials,
  });
}

// ============================================================================
// MCP Client with Factory
// ============================================================================

/**
 * Extended MCP Client that uses the factory to get connectors.
 * Handles both demo tenant (always mock) and real tenants (based on install status).
 */
export class TenantMCPClient {
  private factory: ConnectorFactory;
  private tenantId: string;
  private connectorCache: Map<ConnectorKey, MCPServer> = new Map();

  constructor(factory: ConnectorFactory, tenantId: string) {
    this.factory = factory;
    this.tenantId = tenantId;
  }

  /**
   * Check if this client is for the demo tenant
   */
  get isDemo(): boolean {
    return this.factory.isDemoTenant(this.tenantId);
  }

  /**
   * Get a connector, loading it if necessary
   */
  async getConnector(connectorKey: ConnectorKey): Promise<MCPServer | null> {
    // Check cache first
    if (this.connectorCache.has(connectorKey)) {
      return this.connectorCache.get(connectorKey)!;
    }

    // Load connector
    const connector = await this.factory.getConnector(this.tenantId, connectorKey);
    if (connector) {
      this.connectorCache.set(connectorKey, connector);
    }

    return connector;
  }

  /**
   * Call a tool on a specific connector
   */
  async callTool<TInput, TOutput>(
    connectorKey: ConnectorKey,
    toolName: string,
    input: TInput,
    context: { userId: string; jobId: string; permissions: string[] }
  ) {
    const connector = await this.getConnector(connectorKey);
    if (!connector) {
      return {
        success: false,
        error: `Connector not available: ${connectorKey}`,
        durationMs: 0,
        toolCallId: '',
      };
    }

    return connector.callTool<TInput, TOutput>(toolName, input, {
      tenantId: this.tenantId,
      ...context,
    });
  }

  /**
   * Get all available tools across all connectors
   */
  async getAllTools(): Promise<Array<{ connector: ConnectorKey; tool: { name: string; description: string } }>> {
    const tools: Array<{ connector: ConnectorKey; tool: { name: string; description: string } }> = [];
    const available = await this.factory.getAvailableConnectors(this.tenantId);

    for (const connectorKey of available) {
      const connector = await this.getConnector(connectorKey);
      if (connector) {
        for (const tool of connector.getToolList()) {
          tools.push({
            connector: connectorKey,
            tool: { name: tool.name, description: tool.description },
          });
        }
      }
    }

    return tools;
  }

  /**
   * Get connector status for UI display
   */
  async getConnectorsSummary() {
    return this.factory.getConnectorsSummary(this.tenantId);
  }

  /**
   * Clear connector cache (e.g., after OAuth connection or credentials refresh)
   */
  clearCache(): void {
    this.connectorCache.clear();
  }

  /**
   * Clear cache for a specific connector (after OAuth connection)
   */
  clearConnectorCache(connectorKey: ConnectorKey): void {
    this.connectorCache.delete(connectorKey);
  }
}

// ============================================================================
// Demo Client Helper
// ============================================================================

/**
 * Create an MCP client for the demo tenant.
 * Always uses mock connectors with mock data.
 */
export function createDemoMCPClient(factory: ConnectorFactory): TenantMCPClient {
  return new TenantMCPClient(factory, DEMO_TENANT_ID);
}

