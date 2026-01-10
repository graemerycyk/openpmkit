// MCP Server exports
export * from './jira';
export * from './confluence';
export * from './slack';
export * from './gong';
export * from './zendesk';
export * from './analytics';
export * from './competitor';
export * from './community';
export * from './pmkit';

// Import all mock servers
import { mockJiraServer } from './jira';
import { mockConfluenceServer } from './confluence';
import { mockSlackServer } from './slack';
import { mockGongServer } from './gong';
import { mockZendeskServer } from './zendesk';
import { mockAnalyticsServer } from './analytics';
import { mockCompetitorServer } from './competitor';
import { mockCommunityServer } from './community';
import { pmkitServer } from './pmkit';
import { MCPClient, ConnectorFactory, type ConnectorKey } from '@pmkit/mcp';

// ============================================================================
// Create Mock MCP Client (for demo/development)
// ============================================================================

export function createMockMCPClient(): MCPClient {
  const client = new MCPClient();

  client.registerServer(mockJiraServer);
  client.registerServer(mockConfluenceServer);
  client.registerServer(mockSlackServer);
  client.registerServer(mockGongServer);
  client.registerServer(mockZendeskServer);
  client.registerServer(mockAnalyticsServer);
  client.registerServer(mockCompetitorServer);
  client.registerServer(mockCommunityServer);
  client.registerServer(pmkitServer);

  return client;
}

// ============================================================================
// Register Mock Servers with Factory
// ============================================================================

/**
 * Register all mock servers with a connector factory.
 * This enables the factory to return mock servers when USE_MOCK_CONNECTORS=true
 */
export function registerMockServers(factory: ConnectorFactory): void {
  factory.registerMockServer('jira', mockJiraServer);
  factory.registerMockServer('confluence', mockConfluenceServer);
  factory.registerMockServer('slack', mockSlackServer);
  factory.registerMockServer('gong', mockGongServer);
  factory.registerMockServer('zendesk', mockZendeskServer);
}

// ============================================================================
// MVP Connector Keys
// ============================================================================

export const MVP_CONNECTORS: ConnectorKey[] = [
  'jira',
  'confluence',
  'slack',
  'gong',
  'zendesk',
];

// ============================================================================
// Export individual servers for direct access
// ============================================================================

export {
  mockJiraServer,
  mockConfluenceServer,
  mockSlackServer,
  mockGongServer,
  mockZendeskServer,
  mockAnalyticsServer,
  mockCompetitorServer,
  mockCommunityServer,
  pmkitServer,
};
