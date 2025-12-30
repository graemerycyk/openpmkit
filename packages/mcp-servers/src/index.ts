// MCP Server exports
export * from './jira';
export * from './confluence';
export * from './slack';
export * from './gong';
export * from './zendesk';
export * from './analytics';
export * from './competitor';
export * from './community';

// Import all mock servers
import { mockJiraServer } from './jira';
import { mockConfluenceServer } from './confluence';
import { mockSlackServer } from './slack';
import { mockGongServer } from './gong';
import { mockZendeskServer } from './zendesk';
import { mockAnalyticsServer } from './analytics';
import { mockCompetitorServer } from './competitor';
import { mockCommunityServer } from './community';
import { MCPClient } from '@pmkit/mcp';

// Create a pre-configured MCP client with all mock servers
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

  return client;
}

// Export individual servers for direct access
export {
  mockJiraServer,
  mockConfluenceServer,
  mockSlackServer,
  mockGongServer,
  mockZendeskServer,
  mockAnalyticsServer,
  mockCompetitorServer,
  mockCommunityServer,
};

