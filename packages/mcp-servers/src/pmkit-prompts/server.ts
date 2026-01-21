#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { OpenAIClient, type LLMMessage } from '@pmkit/core';
import {
  PROMPT_TEMPLATES,
  renderPrompt,
  type PromptContext,
} from '@pmkit/prompts';
import type { JobType } from '@pmkit/core';

/**
 * Standalone MCP server for pmkit prompts
 *
 * This server exposes pmkit's 10 PM workflows as MCP tools for use in the Claude app.
 *
 * Usage:
 *   node server.js
 *
 * Environment Variables:
 *   OPENAI_API_KEY - Required: OpenAI API key for LLM execution
 *   PMKIT_DEFAULT_MODEL - Optional: Default model to use (default: gpt-5-mini)
 */

async function main() {
  // Check for required API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('Error: OPENAI_API_KEY environment variable is required');
    console.error('Please set your OpenAI API key:');
    console.error('  export OPENAI_API_KEY=sk-...');
    process.exit(1);
  }

  // Get optional configuration
  const defaultModel = process.env.PMKIT_DEFAULT_MODEL || 'gpt-5-mini';

  // Create OpenAI client
  const llmClient = new OpenAIClient({
    apiKey,
    model: defaultModel as any,
  });

  // Create MCP server
  const server = new Server(
    {
      name: 'pmkit-prompts',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Define tool schemas
  const toolSchemas = {
    run_daily_brief: {
      name: 'run_daily_brief',
      description: 'Generate a morning brief synthesizing overnight activity from Slack, Jira, support tickets, and community',
      inputSchema: {
        type: 'object',
        properties: {
          userName: { type: 'string', description: 'Your name', default: 'PM' },
          tenantName: { type: 'string', description: 'Company name', default: 'Your Company' },
          slackMessages: { type: 'string', description: 'Recent Slack messages (paste or summarize)' },
          jiraUpdates: { type: 'string', description: 'Recent Jira updates (paste or summarize)' },
          supportTickets: { type: 'string', description: 'Support ticket updates (paste or summarize)' },
          communityActivity: { type: 'string', description: 'Community posts/feedback (paste or summarize)' },
        },
        required: ['slackMessages', 'jiraUpdates', 'supportTickets', 'communityActivity'],
      },
    },
    run_meeting_prep: {
      name: 'run_meeting_prep',
      description: 'Prepare for customer meetings with context, talking points, and insights from Gong calls and support history',
      inputSchema: {
        type: 'object',
        properties: {
          userName: { type: 'string', description: 'Your name', default: 'PM' },
          tenantName: { type: 'string', description: 'Company name', default: 'Your Company' },
          accountName: { type: 'string', description: 'Customer account name' },
          meetingType: { type: 'string', description: 'Type of meeting', default: 'Check-in' },
          attendees: { type: 'string', description: 'Meeting attendees', default: 'Customer team' },
          meetingDate: { type: 'string', description: 'Meeting date' },
          gongCalls: { type: 'string', description: 'Recent Gong call transcripts or summaries' },
          supportTickets: { type: 'string', description: 'Open support tickets for this account' },
          accountHealth: { type: 'string', description: 'Account health metrics and notes' },
        },
        required: ['accountName', 'gongCalls', 'supportTickets'],
      },
    },
    run_feature_intelligence: {
      name: 'run_feature_intelligence',
      description: 'Cluster customer feedback into actionable themes from support tickets, Gong insights, community posts, and NPS',
      inputSchema: {
        type: 'object',
        properties: {
          tenantName: { type: 'string', description: 'Company name', default: 'Your Company' },
          supportTickets: { type: 'string', description: 'Support ticket feedback (paste or summarize)' },
          gongInsights: { type: 'string', description: 'Customer call insights from Gong' },
          communityFeedback: { type: 'string', description: 'Community posts and feature requests' },
          npsVerbatims: { type: 'string', description: 'NPS survey responses' },
        },
        required: ['supportTickets', 'gongInsights', 'communityFeedback'],
      },
    },
    run_competitor_research: {
      name: 'run_competitor_research',
      description: 'Track competitor product changes and releases, analyze strategic implications',
      inputSchema: {
        type: 'object',
        properties: {
          tenantName: { type: 'string', description: 'Company name', default: 'Your Company' },
          fromDate: { type: 'string', description: 'Start date for tracking period' },
          toDate: { type: 'string', description: 'End date for tracking period' },
          competitorChanges: { type: 'string', description: 'Competitor product updates, launches, announcements' },
          featureComparison: { type: 'string', description: 'Feature comparison vs competitors' },
        },
        required: ['competitorChanges', 'featureComparison'],
      },
    },
    run_roadmap_alignment: {
      name: 'run_roadmap_alignment',
      description: 'Create an alignment memo for roadmap decisions with options, trade-offs, and recommendations',
      inputSchema: {
        type: 'object',
        properties: {
          userName: { type: 'string', description: 'Your name', default: 'PM' },
          tenantName: { type: 'string', description: 'Company name', default: 'Your Company' },
          decisionContext: { type: 'string', description: 'What decision needs to be made and why' },
          vocThemes: { type: 'string', description: 'Customer demand themes from VoC analysis' },
          analyticsInsights: { type: 'string', description: 'Product analytics insights' },
          competitorContext: { type: 'string', description: 'Competitive landscape context' },
          resourceConstraints: { type: 'string', description: 'Team capacity and constraints' },
        },
        required: ['decisionContext', 'vocThemes'],
      },
    },
    run_prd_draft: {
      name: 'run_prd_draft',
      description: 'Draft a PRD from customer evidence and context with requirements, success criteria, and timelines',
      inputSchema: {
        type: 'object',
        properties: {
          userName: { type: 'string', description: 'Your name', default: 'PM' },
          tenantName: { type: 'string', description: 'Company name', default: 'Your Company' },
          featureName: { type: 'string', description: 'Feature or epic name' },
          epicKey: { type: 'string', description: 'Jira epic key (e.g., ACME-100)' },
          customerEvidence: { type: 'string', description: 'Customer feedback and demand evidence' },
          analyticsSignals: { type: 'string', description: 'Product analytics data' },
          existingDocs: { type: 'string', description: 'Related documentation or specs' },
          technicalContext: { type: 'string', description: 'Technical considerations or constraints' },
        },
        required: ['featureName', 'customerEvidence'],
      },
    },
    run_sprint_review: {
      name: 'run_sprint_review',
      description: 'Generate a sprint review pack with accomplishments, metrics, demo talking points, and customer impact',
      inputSchema: {
        type: 'object',
        properties: {
          userName: { type: 'string', description: 'Your name', default: 'PM' },
          tenantName: { type: 'string', description: 'Company name', default: 'Your Company' },
          sprintName: { type: 'string', description: 'Sprint name or number (e.g., Sprint 42)' },
          sprintStart: { type: 'string', description: 'Sprint start date' },
          sprintEnd: { type: 'string', description: 'Sprint end date' },
          teamName: { type: 'string', description: 'Team name', default: 'Product Team' },
          completedStories: { type: 'string', description: 'Completed stories and features' },
          sprintMetrics: { type: 'string', description: 'Sprint velocity, points, bug count' },
          blockers: { type: 'string', description: 'Blockers and issues encountered' },
          customerFeedback: { type: 'string', description: 'Customer feedback on shipped work' },
        },
        required: ['sprintName', 'completedStories', 'sprintMetrics'],
      },
    },
    run_prototype_generation: {
      name: 'run_prototype_generation',
      description: 'Generate an interactive HTML prototype from a PRD with embedded CSS and JavaScript',
      inputSchema: {
        type: 'object',
        properties: {
          prdContent: { type: 'string', description: 'PRD content describing the feature to prototype' },
          designSystem: { type: 'string', description: 'Design system guidelines or constraints' },
          focusAreas: { type: 'string', description: 'Specific UI areas to focus on' },
        },
        required: ['prdContent'],
      },
    },
    run_release_notes: {
      name: 'run_release_notes',
      description: 'Generate customer-facing release notes from completed work in Jira with benefits and highlights',
      inputSchema: {
        type: 'object',
        properties: {
          productName: { type: 'string', description: 'Product name' },
          releaseVersion: { type: 'string', description: 'Release version (e.g., v2.4.0)' },
          releaseDate: { type: 'string', description: 'Release date' },
          completedIssues: { type: 'string', description: 'Completed Jira issues/stories for this release' },
          epicSummaries: { type: 'string', description: 'Epic summaries for context' },
          relatedPrds: { type: 'string', description: 'Related PRD content' },
          releaseNotesTemplate: { type: 'string', description: 'Previous release notes format' },
        },
        required: ['productName', 'releaseVersion', 'completedIssues'],
      },
    },
    run_deck_content: {
      name: 'run_deck_content',
      description: 'Generate presentation slide content tailored to your audience (customer, team, exec, stakeholder)',
      inputSchema: {
        type: 'object',
        properties: {
          userName: { type: 'string', description: 'Your name', default: 'PM' },
          tenantName: { type: 'string', description: 'Company name', default: 'Your Company' },
          topic: { type: 'string', description: 'Presentation topic or title' },
          audienceType: {
            type: 'string',
            description: 'Target audience type',
            enum: ['customer', 'team', 'exec', 'stakeholder'],
          },
          purpose: { type: 'string', description: 'Purpose of the presentation' },
          duration: { type: 'number', description: 'Presentation duration in minutes' },
          keyDataPoints: { type: 'string', description: 'Key metrics, numbers, or data to include' },
          supportingEvidence: { type: 'string', description: 'Supporting evidence or context' },
          relatedArtifacts: { type: 'string', description: 'Related PRDs, reports, or docs' },
          requirements: { type: 'string', description: 'Specific requirements or constraints' },
        },
        required: ['topic', 'audienceType', 'keyDataPoints'],
      },
    },
  };

  // Handler for listing tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: Object.values(toolSchemas),
  }));

  // Handler for calling tools
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const input = request.params.arguments || {};

    // Map tool name to job type
    const jobTypeMap: Record<string, JobType> = {
      run_daily_brief: 'daily_brief',
      run_meeting_prep: 'meeting_prep',
      run_feature_intelligence: 'feature_intelligence',
      run_competitor_research: 'competitor_research',
      run_roadmap_alignment: 'roadmap_alignment',
      run_prd_draft: 'prd_draft',
      run_sprint_review: 'sprint_review',
      run_prototype_generation: 'prototype_generation',
      run_release_notes: 'release_notes',
      run_deck_content: 'deck_content',
    };

    const jobType = jobTypeMap[toolName];
    if (!jobType) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    // Build prompt context from input
    const promptContext: PromptContext = {
      tenantName: (input.tenantName as string) || 'Your Company',
      productName: (input.productName as string) || 'Your Product',
      currentDate: new Date().toISOString().split('T')[0],
      userName: (input.userName as string) || 'PM',
      ...input,
    };

    // Get the prompt template
    const template = PROMPT_TEMPLATES[jobType];
    const { system, user } = renderPrompt(template, promptContext);

    // Build messages
    const messages: LLMMessage[] = [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ];

    // Execute LLM request
    const maxTokens = jobType === 'prototype_generation' ? 48000 : 12288;
    const response = await llmClient.complete({
      messages,
      maxTokens,
    });

    // Post-process HTML output
    let content = response.content;
    if (template.outputFormat === 'html' && content) {
      // Strip markdown code fences like ```html ... ``` or ``` ... ```
      content = content
        .replace(/^```(?:html)?\s*\n?/i, '')
        .replace(/\n?```\s*$/i, '')
        .trim();
    }

    return {
      content: [
        {
          type: 'text',
          text: content,
        },
      ],
    };
  });

  // Create stdio transport
  const transport = new StdioServerTransport();

  // Connect server to transport
  await server.connect(transport);

  // Log startup message to stderr (stdout is used for MCP protocol)
  console.error('pmkit-prompts MCP server started');
  console.error(`Using model: ${defaultModel}`);
  console.error('Ready to accept tool calls from Claude app');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
