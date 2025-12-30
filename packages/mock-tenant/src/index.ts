import type { Tenant, User, DemoArc } from '@pmkit/core';
import {
  mockJiraServer,
  mockConfluenceServer,
  mockSlackServer,
  mockGongServer,
  mockZendeskServer,
  mockAnalyticsServer,
  mockCompetitorServer,
  mockCommunityServer,
} from '@pmkit/mcp-servers';

import { jiraData } from './data/jira';
import { confluenceData } from './data/confluence';
import { slackData } from './data/slack';
import { gongData } from './data/gong';
import { zendeskData } from './data/zendesk';
import { analyticsData } from './data/analytics';
import { competitorData } from './data/competitor';
import { communityData } from './data/community';

// ============================================================================
// Demo Tenant Configuration
// ============================================================================

export const DEMO_TENANT: Tenant = {
  id: 'demo-tenant-001',
  name: 'Acme SaaS',
  slug: 'acme-saas',
  settings: {
    timezone: 'America/Los_Angeles',
    weekStartsOn: 'monday',
    sprintDuration: 14,
    productName: 'Acme Platform',
  },
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2025-12-29'),
};

// ============================================================================
// Demo Users
// ============================================================================

export const DEMO_USERS: User[] = [
  {
    id: 'user-demo-pm',
    tenantId: DEMO_TENANT.id,
    email: 'sarah.chen@acme.io',
    name: 'Sarah Chen',
    avatarUrl: '/avatars/sarah.jpg',
    role: 'pm',
    permissions: [],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2025-12-29'),
  },
  {
    id: 'user-demo-admin',
    tenantId: DEMO_TENANT.id,
    email: 'marcus.johnson@acme.io',
    name: 'Marcus Johnson',
    avatarUrl: '/avatars/marcus.jpg',
    role: 'admin',
    permissions: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2025-12-29'),
  },
  {
    id: 'user-demo-viewer',
    tenantId: DEMO_TENANT.id,
    email: 'alex.rivera@acme.io',
    name: 'Alex Rivera',
    avatarUrl: '/avatars/alex.jpg',
    role: 'viewer',
    permissions: [],
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2025-12-29'),
  },
  {
    id: 'user-demo-guest',
    tenantId: DEMO_TENANT.id,
    email: 'guest@demo.pmkit.io',
    name: 'Demo Guest',
    role: 'guest',
    permissions: [],
    createdAt: new Date('2025-12-29'),
    updatedAt: new Date('2025-12-29'),
  },
];

// ============================================================================
// Demo Arcs (Guided Demo Scenarios)
// ============================================================================

export const DEMO_ARCS: DemoArc[] = [
  {
    id: 'arc-daily-brief',
    name: 'Daily Brief',
    description:
      'Generate a morning brief that synthesizes overnight activity from Slack, Jira, support tickets, and community.',
    steps: [
      {
        id: 'step-1',
        title: 'Gather Slack signals',
        description: 'Pull messages from product channels with high engagement',
        jobType: 'daily_brief',
        config: { sources: ['slack'] },
      },
      {
        id: 'step-2',
        title: 'Check Jira updates',
        description: 'Review sprint progress and blockers',
        jobType: 'daily_brief',
        config: { sources: ['jira'] },
      },
      {
        id: 'step-3',
        title: 'Synthesize brief',
        description: 'Generate the daily brief artifact',
        jobType: 'daily_brief',
        config: { sources: ['all'] },
      },
    ],
  },
  {
    id: 'arc-meeting-prep',
    name: 'Meeting Prep Pack',
    description:
      'Prepare for an upcoming customer meeting with context from CRM, recent calls, and support history.',
    steps: [
      {
        id: 'step-1',
        title: 'Pull Gong call history',
        description: 'Get recent call transcripts and insights',
        jobType: 'meeting_prep',
        config: { sources: ['gong'] },
      },
      {
        id: 'step-2',
        title: 'Check support tickets',
        description: 'Review open and recent tickets for the account',
        jobType: 'meeting_prep',
        config: { sources: ['zendesk'] },
      },
      {
        id: 'step-3',
        title: 'Generate prep pack',
        description: 'Create the meeting preparation document',
        jobType: 'meeting_prep',
        config: { sources: ['all'] },
      },
    ],
  },
  {
    id: 'arc-voc-clustering',
    name: 'Voice of Customer Clustering',
    description:
      'Cluster customer feedback from support, community, and calls into actionable themes.',
    steps: [
      {
        id: 'step-1',
        title: 'Collect feedback sources',
        description: 'Gather data from Zendesk, Gong, and Community',
        jobType: 'voc_clustering',
        config: { sources: ['zendesk', 'gong', 'community'] },
      },
      {
        id: 'step-2',
        title: 'Extract themes',
        description: 'Identify recurring patterns and pain points',
        jobType: 'voc_clustering',
        config: { step: 'extract' },
      },
      {
        id: 'step-3',
        title: 'Generate VoC report',
        description: 'Create the themed VoC report with evidence',
        jobType: 'voc_clustering',
        config: { step: 'report' },
      },
    ],
  },
  {
    id: 'arc-competitor-intel',
    name: 'Competitor Intel Diff',
    description: 'Generate a diff of recent competitor changes with strategic implications.',
    steps: [
      {
        id: 'step-1',
        title: 'Fetch competitor updates',
        description: 'Get recent changes from competitor tracking',
        jobType: 'competitor_intel',
        config: { sources: ['competitor'] },
      },
      {
        id: 'step-2',
        title: 'Analyze implications',
        description: 'Assess strategic impact of changes',
        jobType: 'competitor_intel',
        config: { step: 'analyze' },
      },
      {
        id: 'step-3',
        title: 'Generate intel report',
        description: 'Create the competitor diff document',
        jobType: 'competitor_intel',
        config: { step: 'report' },
      },
    ],
  },
  {
    id: 'arc-roadmap-alignment',
    name: 'Roadmap Alignment Memo',
    description:
      'Create an alignment memo for a roadmap decision with options, trade-offs, and recommendations.',
    steps: [
      {
        id: 'step-1',
        title: 'Gather context',
        description: 'Pull relevant Jira epics, VoC themes, and analytics',
        jobType: 'roadmap_alignment',
        config: { sources: ['jira', 'analytics', 'community'] },
      },
      {
        id: 'step-2',
        title: 'Generate options',
        description: 'Create 2-3 strategic options with trade-offs',
        jobType: 'roadmap_alignment',
        config: { step: 'options' },
      },
      {
        id: 'step-3',
        title: 'Create alignment memo',
        description: 'Generate the executive-ready memo',
        jobType: 'roadmap_alignment',
        config: { step: 'memo' },
      },
    ],
  },
  {
    id: 'arc-prd-draft',
    name: 'PRD Draft',
    description:
      'Draft a PRD from customer evidence, existing specs, and roadmap context.',
    steps: [
      {
        id: 'step-1',
        title: 'Collect evidence',
        description: 'Gather VoC themes, feature requests, and analytics',
        jobType: 'prd_draft',
        config: { sources: ['community', 'gong', 'analytics'] },
      },
      {
        id: 'step-2',
        title: 'Review existing specs',
        description: 'Check Confluence for related documentation',
        jobType: 'prd_draft',
        config: { sources: ['confluence'] },
      },
      {
        id: 'step-3',
        title: 'Generate PRD draft',
        description: 'Create the PRD with evidence and open questions',
        jobType: 'prd_draft',
        config: { step: 'draft' },
      },
    ],
  },
];

// ============================================================================
// Initialize Mock Data
// ============================================================================

export function initializeMockData(): void {
  // Load Jira data
  mockJiraServer.loadMockData(jiraData.issues, jiraData.sprints);

  // Load Confluence data
  mockConfluenceServer.loadMockData(confluenceData.pages, confluenceData.spaces);

  // Load Slack data
  mockSlackServer.loadMockData(slackData.messages, slackData.channels);

  // Load Gong data
  mockGongServer.loadMockData(
    gongData.calls,
    gongData.transcripts,
    gongData.insights
  );

  // Load Zendesk data
  mockZendeskServer.loadMockData(zendeskData.tickets, zendeskData.comments);

  // Load Analytics data
  mockAnalyticsServer.loadMockData(
    analyticsData.events,
    analyticsData.searchQueries,
    analyticsData.featureUsage,
    analyticsData.userJourneys
  );

  // Load Competitor data
  mockCompetitorServer.loadMockData(
    competitorData.competitors,
    competitorData.changes,
    competitorData.features
  );

  // Load Community data
  mockCommunityServer.loadMockData(
    communityData.posts,
    communityData.replies,
    communityData.featureRequests
  );
}

// ============================================================================
// Create Mock MCP Client
// ============================================================================

export function createMockMCPClient() {
  // Initialize mock data
  initializeMockData();

  // Return an object with all mock servers
  return {
    jira: mockJiraServer,
    confluence: mockConfluenceServer,
    slack: mockSlackServer,
    gong: mockGongServer,
    zendesk: mockZendeskServer,
    analytics: mockAnalyticsServer,
    competitor: mockCompetitorServer,
    community: mockCommunityServer,

    // Convenience method to call any tool
    async callTool(server: string, tool: string, input: Record<string, unknown>) {
      // Default context for demo mode
      const context = {
        tenantId: DEMO_TENANT.id,
        userId: DEMO_USERS[0].id,
        jobId: 'demo-job',
        traceId: `trace-${Date.now()}`,
        permissions: ['read:all', 'write:drafts'],
      };

      switch (server) {
        case 'jira':
          return mockJiraServer.callTool(tool, input, context);
        case 'confluence':
          return mockConfluenceServer.callTool(tool, input, context);
        case 'slack':
          return mockSlackServer.callTool(tool, input, context);
        case 'gong':
          return mockGongServer.callTool(tool, input, context);
        case 'zendesk':
          return mockZendeskServer.callTool(tool, input, context);
        case 'analytics':
          return mockAnalyticsServer.callTool(tool, input, context);
        case 'competitor':
          return mockCompetitorServer.callTool(tool, input, context);
        case 'community':
          return mockCommunityServer.callTool(tool, input, context);
        default:
          throw new Error(`Unknown server: ${server}`);
      }
    },
  };
}

// Export data modules for direct access if needed
export { jiraData } from './data/jira';
export { confluenceData } from './data/confluence';
export { slackData } from './data/slack';
export { gongData } from './data/gong';
export { zendeskData } from './data/zendesk';
export { analyticsData } from './data/analytics';
export { competitorData } from './data/competitor';
export { communityData } from './data/community';

