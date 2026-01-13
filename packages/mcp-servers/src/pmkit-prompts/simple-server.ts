#!/usr/bin/env node

/**
 * Simple pmkit MCP Server for Claude Desktop
 *
 * This server exposes pmkit's 10 PM workflows as MCP tools that work with
 * copy/paste data. Unlike the full server.ts, this doesn't call an external LLM -
 * Claude itself processes the prompts.
 *
 * Usage:
 *   node simple-server.js
 *
 * No environment variables required!
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  PROMPT_TEMPLATES,
  renderPrompt,
  type PromptContext,
} from '@pmkit/prompts';
import type { JobType } from '@pmkit/core';

// ============================================================================
// Workflow Definitions
// ============================================================================

interface WorkflowInfo {
  name: string;
  command: string;
  description: string;
  shortDescription: string;
  requiredFields: string[];
  optionalFields: string[];
  example: string;
}

const WORKFLOWS: Record<JobType, WorkflowInfo> = {
  daily_brief: {
    name: 'Daily Brief',
    command: '/brief',
    description: 'Generate a morning brief synthesizing overnight activity from Slack, Jira, support tickets, and community',
    shortDescription: 'Morning brief from overnight activity',
    requiredFields: ['slackMessages', 'jiraUpdates', 'supportTickets', 'communityActivity'],
    optionalFields: ['userName', 'tenantName'],
    example: `/brief
Slack: Team discussing new search feature, 3 customer questions about API
Jira: 5 tickets completed, 2 bugs opened (search crash, timeout)
Support: 2 enterprise escalations about performance
Community: Dark mode request got 50+ upvotes`,
  },
  meeting_prep: {
    name: 'Meeting Prep',
    command: '/meeting',
    description: 'Prepare for customer meetings with context, talking points, and insights from Gong calls and support history',
    shortDescription: 'Customer meeting prep pack',
    requiredFields: ['accountName', 'gongCalls', 'supportTickets'],
    optionalFields: ['meetingType', 'attendees', 'meetingDate', 'accountHealth', 'userName', 'tenantName'],
    example: `/meeting
Account: Globex Corp
Gong: Last call discussed search frustrations, expansion blocked
Support: 2 open tickets - dashboard loading, search relevance
Health: 72/100, at risk due to search issues`,
  },
  voc_clustering: {
    name: 'VoC Clustering',
    command: '/voc',
    description: 'Cluster customer feedback into actionable themes from support tickets, Gong insights, community posts, and NPS',
    shortDescription: 'Customer feedback theme analysis',
    requiredFields: ['supportTickets', 'gongInsights', 'communityFeedback'],
    optionalFields: ['npsVerbatims', 'tenantName'],
    example: `/voc
Support: 47 tickets about search, 15 about onboarding
Gong: "Search is slow" in 8 calls, "missing filters" in 12
Community: Top requests - dark mode (89 votes), API docs (45), Slack integration (38)`,
  },
  competitor_research: {
    name: 'Competitor Research',
    command: '/competitor',
    description: 'Track competitor product changes and releases, analyze strategic implications',
    shortDescription: 'Competitor intel report',
    requiredFields: ['competitorChanges', 'featureComparison'],
    optionalFields: ['fromDate', 'toDate', 'tenantName'],
    example: `/competitor
Changes: Notion launched AI search, Coda cut enterprise pricing 20%
Comparison: We lack AI search, SSO, and audit logs vs competitors`,
  },
  roadmap_alignment: {
    name: 'Roadmap Alignment',
    command: '/roadmap',
    description: 'Create an alignment memo for roadmap decisions with options, trade-offs, and recommendations',
    shortDescription: 'Decision memo with options',
    requiredFields: ['decisionContext', 'vocThemes'],
    optionalFields: ['analyticsInsights', 'competitorContext', 'resourceConstraints', 'userName', 'tenantName'],
    example: `/roadmap
Decision: Q1 priority - AI search vs Enterprise SSO?
VoC: Search is #1 pain point (35% of mentions), SSO blocking $450K deals
Resources: 3 pods available, each initiative needs 1.5-2 pods`,
  },
  prd_draft: {
    name: 'PRD Draft',
    command: '/prd',
    description: 'Draft a PRD from customer evidence and context with requirements, success criteria, and timelines',
    shortDescription: 'Evidence-based PRD',
    requiredFields: ['featureName', 'customerEvidence'],
    optionalFields: ['epicKey', 'analyticsSignals', 'existingDocs', 'technicalContext', 'userName', 'tenantName'],
    example: `/prd
Feature: Search Filters
Evidence: 89 community votes, 47 support tickets, mentioned in 12 Gong calls
Analytics: Users average 4.2 searches before finding content`,
  },
  sprint_review: {
    name: 'Sprint Review',
    command: '/sprint',
    description: 'Generate a sprint review pack with accomplishments, metrics, demo talking points, and customer impact',
    shortDescription: 'Sprint review presentation',
    requiredFields: ['sprintName', 'completedStories', 'sprintMetrics'],
    optionalFields: ['sprintStart', 'sprintEnd', 'teamName', 'blockers', 'customerFeedback', 'userName', 'tenantName'],
    example: `/sprint
Sprint: Sprint 42
Completed: Search filters (ACME-342), ranking improvements (ACME-343), critical bug fix (ACME-350)
Metrics: 16/19 points completed (84%), 5 bugs resolved, 1 P1 fixed`,
  },
  prototype_generation: {
    name: 'Prototype Generation',
    command: '/prototype',
    description: 'Generate an interactive HTML prototype from a PRD with embedded CSS and JavaScript',
    shortDescription: 'Interactive HTML prototype',
    requiredFields: ['prdContent'],
    optionalFields: ['designSystem', 'focusAreas'],
    example: `/prototype
PRD: Search filters feature with date range (7d, 30d, 90d), content type filter (docs, projects, comments), real-time updates
Focus: Filter bar UI and result list`,
  },
  release_notes: {
    name: 'Release Notes',
    command: '/release',
    description: 'Generate customer-facing release notes from completed work in Jira with benefits and highlights',
    shortDescription: 'Customer-facing release notes',
    requiredFields: ['productName', 'releaseVersion', 'completedIssues'],
    optionalFields: ['releaseDate', 'epicSummaries', 'relatedPrds', 'releaseNotesTemplate'],
    example: `/release
Product: Acme Platform
Version: v2.4.0
Completed: Search filters, improved ranking, dashboard performance, 4 bug fixes`,
  },
  deck_content: {
    name: 'Deck Content',
    command: '/deck',
    description: 'Generate presentation slide content tailored to your audience (customer, team, exec, stakeholder)',
    shortDescription: 'Presentation slides',
    requiredFields: ['topic', 'audienceType', 'keyDataPoints'],
    optionalFields: ['purpose', 'duration', 'supportingEvidence', 'relatedArtifacts', 'requirements', 'userName', 'tenantName'],
    example: `/deck
Topic: Q4 Product Update
Audience: exec
Data: Search satisfaction up 25%, 3 enterprise deals unblocked ($450K), shipped 2 weeks early`,
  },
};

// ============================================================================
// Main Server
// ============================================================================

async function main() {
  // Create MCP server
  const server = new Server(
    {
      name: 'pmkit',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // ========================================================================
  // Tool: List Workflows
  // ========================================================================
  const listWorkflowsTool = {
    name: 'list_pmkit_workflows',
    description: 'List all available pmkit PM workflows with their commands and descriptions',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  };

  // ========================================================================
  // Tool: Get Workflow Details
  // ========================================================================
  const getWorkflowTool = {
    name: 'get_pmkit_workflow',
    description: 'Get detailed information about a specific pmkit workflow including required inputs and example usage',
    inputSchema: {
      type: 'object',
      properties: {
        workflow: {
          type: 'string',
          description: 'Workflow name or command (e.g., "daily_brief", "/brief", "prd")',
        },
      },
      required: ['workflow'],
    },
  };

  // ========================================================================
  // Tool: Run Workflow
  // ========================================================================
  const runWorkflowTool = {
    name: 'run_pmkit_workflow',
    description: `Run a pmkit PM workflow. This returns the system prompt and user prompt for Claude to process.

Available workflows:
- /brief - Daily brief from Slack, Jira, support, community
- /meeting - Customer meeting prep pack
- /voc - Voice of customer theme analysis
- /competitor - Competitor intel report
- /roadmap - Roadmap decision memo
- /prd - Product requirements document
- /sprint - Sprint review pack
- /prototype - Interactive HTML prototype
- /release - Customer-facing release notes
- /deck - Presentation slide content

Use this when the user invokes a workflow command or asks for PM artifacts.`,
    inputSchema: {
      type: 'object',
      properties: {
        workflow: {
          type: 'string',
          description: 'Workflow to run (e.g., "daily_brief", "/brief", "prd")',
        },
        data: {
          type: 'object',
          description: 'Input data for the workflow (varies by workflow type)',
          additionalProperties: true,
        },
      },
      required: ['workflow', 'data'],
    },
  };

  // Handler for listing tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [listWorkflowsTool, getWorkflowTool, runWorkflowTool],
  }));

  // Handler for calling tools
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const args = request.params.arguments || {};

    // ======================================================================
    // List Workflows
    // ======================================================================
    if (toolName === 'list_pmkit_workflows') {
      const lines = [
        '# pmkit PM Workflows\n',
        'Available workflows for product management tasks:\n',
        '| Command | Name | Description |',
        '|---------|------|-------------|',
      ];

      for (const [jobType, info] of Object.entries(WORKFLOWS)) {
        lines.push(`| \`${info.command}\` | ${info.name} | ${info.shortDescription} |`);
      }

      lines.push('');
      lines.push('💡 **Usage**: Just say "run /brief with my data" or "create a PRD for [feature]"');
      lines.push('');
      lines.push('To see details for a specific workflow, ask: "How do I use /brief?"');

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    }

    // ======================================================================
    // Get Workflow Details
    // ======================================================================
    if (toolName === 'get_pmkit_workflow') {
      const workflowInput = (args.workflow as string || '').toLowerCase().replace('/', '').replace('_', '');
      
      // Find matching workflow
      let matchedJobType: JobType | null = null;
      for (const [jobType, info] of Object.entries(WORKFLOWS)) {
        const normalizedJobType = jobType.replace('_', '');
        const normalizedCommand = info.command.replace('/', '');
        if (
          normalizedJobType === workflowInput ||
          normalizedCommand === workflowInput ||
          info.name.toLowerCase().replace(' ', '') === workflowInput
        ) {
          matchedJobType = jobType as JobType;
          break;
        }
      }

      if (!matchedJobType) {
        return {
          content: [{
            type: 'text',
            text: `Workflow "${args.workflow}" not found. Use \`list_pmkit_workflows\` to see available workflows.`,
          }],
        };
      }

      const info = WORKFLOWS[matchedJobType];
      const template = PROMPT_TEMPLATES[matchedJobType];

      const lines = [
        `# ${info.name}`,
        '',
        `**Command**: \`${info.command}\``,
        '',
        `**Description**: ${info.description}`,
        '',
        '## Required Inputs',
        '',
        ...info.requiredFields.map(f => `- \`${f}\``),
        '',
        '## Optional Inputs',
        '',
        ...info.optionalFields.map(f => `- \`${f}\``),
        '',
        '## Example Usage',
        '',
        '```',
        info.example,
        '```',
        '',
        '## Output Format',
        '',
        `This workflow outputs: **${template.outputFormat}**`,
      ];

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    }

    // ======================================================================
    // Run Workflow
    // ======================================================================
    if (toolName === 'run_pmkit_workflow') {
      const workflowInput = (args.workflow as string || '').toLowerCase().replace('/', '').replace('_', '');
      const data = args.data as Record<string, unknown> || {};

      // Find matching workflow
      let matchedJobType: JobType | null = null;
      for (const [jobType, info] of Object.entries(WORKFLOWS)) {
        const normalizedJobType = jobType.replace('_', '');
        const normalizedCommand = info.command.replace('/', '');
        if (
          normalizedJobType === workflowInput ||
          normalizedCommand === workflowInput ||
          info.name.toLowerCase().replace(' ', '') === workflowInput
        ) {
          matchedJobType = jobType as JobType;
          break;
        }
      }

      if (!matchedJobType) {
        return {
          content: [{
            type: 'text',
            text: `Workflow "${args.workflow}" not found.\n\nAvailable workflows:\n${Object.values(WORKFLOWS).map(w => `- ${w.command} - ${w.shortDescription}`).join('\n')}`,
          }],
        };
      }

      const info = WORKFLOWS[matchedJobType];
      const template = PROMPT_TEMPLATES[matchedJobType];

      // Build prompt context
      const promptContext: PromptContext = {
        tenantName: (data.tenantName as string) || 'Your Company',
        productName: (data.productName as string) || 'Your Product',
        currentDate: new Date().toISOString().split('T')[0],
        userName: (data.userName as string) || 'PM',
        ...data,
      };

      // Render the prompt
      const { system, user } = renderPrompt(template, promptContext);

      // Return the prompts for Claude to process
      const output = [
        `# Running: ${info.name}`,
        '',
        '---',
        '',
        '## System Instructions',
        '',
        system,
        '',
        '---',
        '',
        '## Task',
        '',
        user,
        '',
        '---',
        '',
        `**Output Format**: ${template.outputFormat}`,
        '',
        'Please generate the output based on the above instructions and data.',
      ];

      return {
        content: [{ type: 'text', text: output.join('\n') }],
      };
    }

    return {
      content: [{ type: 'text', text: `Unknown tool: ${toolName}` }],
    };
  });

  // Create stdio transport
  const transport = new StdioServerTransport();

  // Connect server to transport
  await server.connect(transport);

  // Log startup message to stderr (stdout is used for MCP protocol)
  console.error('pmkit MCP server started');
  console.error('Available workflows: /brief, /meeting, /voc, /competitor, /roadmap, /prd, /sprint, /prototype, /release, /deck');
  console.error('Ready to accept tool calls from Claude app');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
