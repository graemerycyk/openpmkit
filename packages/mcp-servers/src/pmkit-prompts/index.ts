import { z } from 'zod';
import { BaseMCPServer, type MCPContext } from '@pmkit/mcp';
import {
  PROMPT_TEMPLATES,
  executeJob,
  type PromptContext,
  type JobExecutorOptions,
} from '@pmkit/prompts';
import { JobTypeSchema, type JobType, type LLMService } from '@pmkit/core';

// ============================================================================
// pmkit Prompts MCP Server
// ============================================================================
// Exposes pmkit's 10 PM workflows as MCP tools for use in Claude app.
// Each workflow can be invoked with natural language like:
// "Create a Prototype based on this PRD draft"
// ============================================================================

export interface PmkitPromptsServerOptions {
  llmService: LLMService;
  tenantId?: string;
  defaultModel?: string;
}

export class PmkitPromptsMCPServer extends BaseMCPServer {
  private llmService: LLMService;
  private defaultTenantId: string;
  private defaultModel?: string;

  constructor(options: PmkitPromptsServerOptions) {
    super({
      name: 'pmkit-prompts',
      description: 'Run pmkit PM workflows: briefs, PRDs, VoC analysis, prototypes, and more',
      version: '1.0.0',
    });

    this.llmService = options.llmService;
    this.defaultTenantId = options.tenantId || 'claude-app-tenant';
    this.defaultModel = options.defaultModel;
    this.registerTools();
  }

  private registerTools(): void {
    // ========================================================================
    // Daily Brief Tool
    // ========================================================================
    this.registerTool({
      name: 'run_daily_brief',
      description: 'Generate a morning brief synthesizing overnight activity from Slack, Jira, support tickets, and community',
      inputSchema: z.object({
        userName: z.string().optional().default('PM').describe('Your name'),
        tenantName: z.string().optional().default('Your Company').describe('Company name'),
        slackMessages: z.string().describe('Recent Slack messages (paste or summarize)'),
        jiraUpdates: z.string().describe('Recent Jira updates (paste or summarize)'),
        supportTickets: z.string().describe('Support ticket updates (paste or summarize)'),
        communityActivity: z.string().describe('Community posts/feedback (paste or summarize)'),
      }),
      outputSchema: z.object({
        content: z.string().describe('Generated daily brief in markdown'),
        usage: z.object({
          inputTokens: z.number(),
          outputTokens: z.number(),
          totalTokens: z.number(),
        }),
      }),
      execute: async (input, context) => {
        return this.executeWorkflow('daily_brief', input, context);
      },
    });

    // ========================================================================
    // Meeting Prep Tool
    // ========================================================================
    this.registerTool({
      name: 'run_meeting_prep',
      description: 'Prepare for customer meetings with context, talking points, and insights from Gong calls and support history',
      inputSchema: z.object({
        userName: z.string().optional().default('PM').describe('Your name'),
        tenantName: z.string().optional().default('Your Company').describe('Company name'),
        accountName: z.string().describe('Customer account name'),
        meetingType: z.string().optional().default('Check-in').describe('Type of meeting'),
        attendees: z.string().optional().default('Customer team').describe('Meeting attendees'),
        meetingDate: z.string().optional().describe('Meeting date'),
        gongCalls: z.string().describe('Recent Gong call transcripts or summaries'),
        supportTickets: z.string().describe('Open support tickets for this account'),
        accountHealth: z.string().optional().describe('Account health metrics and notes'),
      }),
      outputSchema: z.object({
        content: z.string().describe('Generated meeting prep pack in markdown'),
        usage: z.object({
          inputTokens: z.number(),
          outputTokens: z.number(),
          totalTokens: z.number(),
        }),
      }),
      execute: async (input, context) => {
        return this.executeWorkflow('meeting_prep', input, context);
      },
    });

    // ========================================================================
    // Feature Intelligence Tool
    // ========================================================================
    this.registerTool({
      name: 'run_feature_intelligence',
      description: 'Cluster customer feedback into actionable themes from support tickets, Gong insights, community posts, and NPS',
      inputSchema: z.object({
        tenantName: z.string().optional().default('Your Company').describe('Company name'),
        supportTickets: z.string().describe('Support ticket feedback (paste or summarize)'),
        gongInsights: z.string().describe('Customer call insights from Gong'),
        communityFeedback: z.string().describe('Community posts and feature requests'),
        npsVerbatims: z.string().optional().describe('NPS survey responses'),
      }),
      outputSchema: z.object({
        content: z.string().describe('Generated Feature Intelligence report in markdown'),
        usage: z.object({
          inputTokens: z.number(),
          outputTokens: z.number(),
          totalTokens: z.number(),
        }),
      }),
      execute: async (input, context) => {
        return this.executeWorkflow('feature_intelligence', input, context);
      },
    });

    // ========================================================================
    // Competitor Research Tool
    // ========================================================================
    this.registerTool({
      name: 'run_competitor_research',
      description: 'Track competitor product changes and releases, analyze strategic implications',
      inputSchema: z.object({
        tenantName: z.string().optional().default('Your Company').describe('Company name'),
        fromDate: z.string().optional().describe('Start date for tracking period'),
        toDate: z.string().optional().describe('End date for tracking period'),
        competitorChanges: z.string().describe('Competitor product updates, launches, announcements'),
        featureComparison: z.string().describe('Feature comparison vs competitors'),
      }),
      outputSchema: z.object({
        content: z.string().describe('Generated competitor research report in markdown'),
        usage: z.object({
          inputTokens: z.number(),
          outputTokens: z.number(),
          totalTokens: z.number(),
        }),
      }),
      execute: async (input, context) => {
        return this.executeWorkflow('competitor_research', input, context);
      },
    });

    // ========================================================================
    // Roadmap Alignment Tool
    // ========================================================================
    this.registerTool({
      name: 'run_roadmap_alignment',
      description: 'Create an alignment memo for roadmap decisions with options, trade-offs, and recommendations',
      inputSchema: z.object({
        userName: z.string().optional().default('PM').describe('Your name'),
        tenantName: z.string().optional().default('Your Company').describe('Company name'),
        decisionContext: z.string().describe('What decision needs to be made and why'),
        vocThemes: z.string().describe('Customer demand themes from VoC analysis'),
        analyticsInsights: z.string().optional().describe('Product analytics insights'),
        competitorContext: z.string().optional().describe('Competitive landscape context'),
        resourceConstraints: z.string().optional().describe('Team capacity and constraints'),
      }),
      outputSchema: z.object({
        content: z.string().describe('Generated roadmap alignment memo in markdown'),
        usage: z.object({
          inputTokens: z.number(),
          outputTokens: z.number(),
          totalTokens: z.number(),
        }),
      }),
      execute: async (input, context) => {
        return this.executeWorkflow('roadmap_alignment', input, context);
      },
    });

    // ========================================================================
    // PRD Draft Tool
    // ========================================================================
    this.registerTool({
      name: 'run_prd_draft',
      description: 'Draft a PRD from customer evidence and context with requirements, success criteria, and timelines',
      inputSchema: z.object({
        userName: z.string().optional().default('PM').describe('Your name'),
        tenantName: z.string().optional().default('Your Company').describe('Company name'),
        featureName: z.string().describe('Feature or epic name'),
        epicKey: z.string().optional().describe('Jira epic key (e.g., ACME-100)'),
        customerEvidence: z.string().describe('Customer feedback and demand evidence'),
        analyticsSignals: z.string().optional().describe('Product analytics data'),
        existingDocs: z.string().optional().describe('Related documentation or specs'),
        technicalContext: z.string().optional().describe('Technical considerations or constraints'),
      }),
      outputSchema: z.object({
        content: z.string().describe('Generated PRD in markdown'),
        usage: z.object({
          inputTokens: z.number(),
          outputTokens: z.number(),
          totalTokens: z.number(),
        }),
      }),
      execute: async (input, context) => {
        return this.executeWorkflow('prd_draft', input, context);
      },
    });

    // ========================================================================
    // Sprint Review Tool
    // ========================================================================
    this.registerTool({
      name: 'run_sprint_review',
      description: 'Generate a sprint review pack with accomplishments, metrics, demo talking points, and customer impact',
      inputSchema: z.object({
        userName: z.string().optional().default('PM').describe('Your name'),
        tenantName: z.string().optional().default('Your Company').describe('Company name'),
        sprintName: z.string().describe('Sprint name or number (e.g., Sprint 42)'),
        sprintStart: z.string().optional().describe('Sprint start date'),
        sprintEnd: z.string().optional().describe('Sprint end date'),
        teamName: z.string().optional().default('Product Team').describe('Team name'),
        completedStories: z.string().describe('Completed stories and features'),
        sprintMetrics: z.string().describe('Sprint velocity, points, bug count'),
        blockers: z.string().optional().describe('Blockers and issues encountered'),
        customerFeedback: z.string().optional().describe('Customer feedback on shipped work'),
      }),
      outputSchema: z.object({
        content: z.string().describe('Generated sprint review pack in markdown'),
        usage: z.object({
          inputTokens: z.number(),
          outputTokens: z.number(),
          totalTokens: z.number(),
        }),
      }),
      execute: async (input, context) => {
        return this.executeWorkflow('sprint_review', input, context);
      },
    });

    // ========================================================================
    // Prototype Generation Tool
    // ========================================================================
    this.registerTool({
      name: 'run_prototype_generation',
      description: 'Generate an interactive HTML prototype from a PRD with embedded CSS and JavaScript',
      inputSchema: z.object({
        prdContent: z.string().describe('PRD content describing the feature to prototype'),
        designSystem: z.string().optional().describe('Design system guidelines or constraints'),
        focusAreas: z.string().optional().describe('Specific UI areas to focus on'),
      }),
      outputSchema: z.object({
        content: z.string().describe('Generated HTML prototype (complete, standalone HTML file)'),
        usage: z.object({
          inputTokens: z.number(),
          outputTokens: z.number(),
          totalTokens: z.number(),
        }),
      }),
      execute: async (input, context) => {
        // Prototype generation needs higher token limit
        return this.executeWorkflow('prototype_generation', input, context, {
          maxTokens: 48000,
        });
      },
    });

    // ========================================================================
    // Release Notes Tool
    // ========================================================================
    this.registerTool({
      name: 'run_release_notes',
      description: 'Generate customer-facing release notes from completed work in Jira with benefits and highlights',
      inputSchema: z.object({
        productName: z.string().describe('Product name'),
        releaseVersion: z.string().describe('Release version (e.g., v2.4.0)'),
        releaseDate: z.string().optional().describe('Release date'),
        completedIssues: z.string().describe('Completed Jira issues/stories for this release'),
        epicSummaries: z.string().optional().describe('Epic summaries for context'),
        relatedPrds: z.string().optional().describe('Related PRD content'),
        releaseNotesTemplate: z.string().optional().describe('Previous release notes format'),
      }),
      outputSchema: z.object({
        content: z.string().describe('Generated release notes in markdown'),
        usage: z.object({
          inputTokens: z.number(),
          outputTokens: z.number(),
          totalTokens: z.number(),
        }),
      }),
      execute: async (input, context) => {
        return this.executeWorkflow('release_notes', input, context);
      },
    });

    // ========================================================================
    // Deck Content Tool
    // ========================================================================
    this.registerTool({
      name: 'run_deck_content',
      description: 'Generate presentation slide content tailored to your audience (customer, team, exec, stakeholder)',
      inputSchema: z.object({
        userName: z.string().optional().default('PM').describe('Your name'),
        tenantName: z.string().optional().default('Your Company').describe('Company name'),
        topic: z.string().describe('Presentation topic or title'),
        audienceType: z
          .enum(['customer', 'team', 'exec', 'stakeholder'])
          .describe('Target audience type'),
        purpose: z.string().optional().describe('Purpose of the presentation'),
        duration: z.number().optional().describe('Presentation duration in minutes'),
        keyDataPoints: z.string().describe('Key metrics, numbers, or data to include'),
        supportingEvidence: z.string().optional().describe('Supporting evidence or context'),
        relatedArtifacts: z.string().optional().describe('Related PRDs, reports, or docs'),
        requirements: z.string().optional().describe('Specific requirements or constraints'),
      }),
      outputSchema: z.object({
        content: z.string().describe('Generated slide deck content in markdown'),
        usage: z.object({
          inputTokens: z.number(),
          outputTokens: z.number(),
          totalTokens: z.number(),
        }),
      }),
      execute: async (input, context) => {
        return this.executeWorkflow('deck_content', input, context);
      },
    });
  }

  /**
   * Execute a workflow using the prompt templates
   */
  private async executeWorkflow(
    jobType: JobType,
    input: Record<string, unknown>,
    _context: MCPContext,
    options?: JobExecutorOptions
  ): Promise<{ content: string; usage: { inputTokens: number; outputTokens: number; totalTokens: number } }> {
    // Build prompt context from input
    const promptContext: PromptContext = {
      tenantName: (input.tenantName as string) || 'Your Company',
      productName: (input.productName as string) || 'Your Product',
      currentDate: new Date().toISOString().split('T')[0],
      userName: (input.userName as string) || 'PM',
      ...input,
    };

    // Execute the job using the LLM service
    const result = await executeJob(
      this.llmService,
      this.defaultTenantId,
      jobType,
      promptContext,
      {
        model: this.defaultModel,
        ...options,
      }
    );

    return {
      content: result.content,
      usage: result.usage,
    };
  }
}
