/**
 * Workflow runner for openpmkit-desktop
 *
 * Executes PM workflows using openpmkit prompts and fetchers
 */

import type { JobType } from '@openpmkit/core';
import {
  type PromptContext,
  PROMPT_TEMPLATES,
  renderPrompt,
  generateStubResponse,
} from '@openpmkit/prompts';
import type {
  WorkflowId,
  WorkflowRunInput,
  WorkflowRunResult,
  PMKitConfig,
} from './types.js';
import { WORKFLOWS } from './types.js';
import { PMKitStorage } from './storage.js';

export interface RunnerOptions {
  config: PMKitConfig;
  storage: PMKitStorage;
}

export class WorkflowRunner {
  private config: PMKitConfig;
  private storage: PMKitStorage;

  constructor(options: RunnerOptions) {
    this.config = options.config;
    this.storage = options.storage;
  }

  /**
   * Run a workflow
   */
  async run(input: WorkflowRunInput): Promise<WorkflowRunResult> {
    const { workflowId, params, triggerType } = input;
    const workflow = WORKFLOWS[workflowId];
    const startedAt = new Date();

    // Generate run path
    const runPath = this.storage.generateRunPath(workflowId);

    try {
      // Build context from config and params
      const context = this.buildContext(workflowId, params);

      // Get the content (using stubs for now, real LLM integration later)
      const jobType = workflow.jobType as JobType;
      const content = await this.generateContent(jobType, context);

      const completedAt = new Date();
      const durationMs = completedAt.getTime() - startedAt.getTime();

      // Determine output filename
      const outputFilename = this.getOutputFilename(workflowId, params);

      // Save output
      const outputPath = this.storage.saveOutput(
        runPath,
        workflowId,
        content,
        outputFilename
      );

      // Create result
      const result: WorkflowRunResult = {
        success: true,
        workflowId,
        outputPath,
        telemetryPath: '', // Will be set after saving telemetry
        content,
        startedAt,
        completedAt,
        durationMs,
        model: this.config.useStubs ? 'stub' : (this.config.llmModel || 'gpt-4o'),
        usage: {
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
        },
        estimatedCostUsd: 0,
        isStub: this.config.useStubs,
      };

      // Save telemetry
      const telemetry = this.storage.createTelemetryRecord(result, triggerType, params);
      result.telemetryPath = this.storage.saveTelemetry(runPath, telemetry);

      return result;
    } catch (error) {
      const completedAt = new Date();
      const durationMs = completedAt.getTime() - startedAt.getTime();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      const result: WorkflowRunResult = {
        success: false,
        workflowId,
        outputPath: '',
        telemetryPath: '',
        content: '',
        startedAt,
        completedAt,
        durationMs,
        model: 'none',
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        estimatedCostUsd: 0,
        isStub: false,
        error: errorMessage,
      };

      // Still save telemetry for failed runs
      const telemetry = this.storage.createTelemetryRecord(result, triggerType, params);
      result.telemetryPath = this.storage.saveTelemetry(runPath, telemetry);

      return result;
    }
  }

  /**
   * Build prompt context from config and params
   */
  private buildContext(
    workflowId: WorkflowId,
    params?: Record<string, unknown>
  ): PromptContext {
    const baseContext: PromptContext = {
      tenantName: this.config.tenantName,
      productName: this.config.productName,
      currentDate: new Date().toISOString().split('T')[0],
      userName: this.config.userName,
    };

    // Add workflow-specific context
    switch (workflowId) {
      case 'daily-brief':
        return {
          ...baseContext,
          slackMessages: params?.slackMessages || this.getStubSlackMessages(),
          jiraUpdates: params?.jiraUpdates || this.getStubJiraUpdates(),
          supportTickets: params?.supportTickets || this.getStubSupportTickets(),
          communityActivity: params?.communityActivity || this.getStubCommunityActivity(),
        };

      case 'meeting-prep':
        return {
          ...baseContext,
          accountName: params?.accountName || 'Globex Corp',
          meetingType: params?.meetingType || 'QBR',
          meetingDate: params?.meetingDate || baseContext.currentDate,
          attendees: params?.attendees || 'John Smith (VP Product), Emily Davis (PM)',
          gongCalls: params?.gongCalls || this.getStubGongCalls(),
          supportTickets: params?.supportTickets || this.getStubSupportTickets(),
          accountHealth: params?.accountHealth || this.getStubAccountHealth(),
        };

      case 'feature-intel':
        return {
          ...baseContext,
          supportTickets: params?.supportTickets || this.getStubSupportTickets(),
          gongInsights: params?.gongInsights || this.getStubGongInsights(),
          communityFeedback: params?.communityFeedback || this.getStubCommunityFeedback(),
          npsVerbatims: params?.npsVerbatims || this.getStubNpsVerbatims(),
        };

      case 'prd-draft':
        return {
          ...baseContext,
          featureName: params?.featureName || 'Search Filters',
          epicKey: params?.epicKey || 'ACME-100',
          customerEvidence: params?.customerEvidence || this.getStubCustomerEvidence(),
          analyticsSignals: params?.analyticsSignals || this.getStubAnalyticsSignals(),
          existingDocs: params?.existingDocs || '',
          technicalContext: params?.technicalContext || '',
        };

      case 'sprint-review':
        return {
          ...baseContext,
          sprintName: params?.sprintName || 'Sprint 42',
          sprintStart: params?.sprintStart || '2026-01-13',
          sprintEnd: params?.sprintEnd || '2026-01-27',
          teamName: params?.teamName || 'Product Team',
          completedStories: params?.completedStories || this.getStubCompletedStories(),
          sprintMetrics: params?.sprintMetrics || this.getStubSprintMetrics(),
          blockers: params?.blockers || this.getStubBlockers(),
          customerFeedback: params?.customerFeedback || this.getStubCustomerFeedback(),
        };

      case 'competitor':
        return {
          ...baseContext,
          fromDate: params?.fromDate || this.getDateDaysAgo(14),
          toDate: params?.toDate || baseContext.currentDate,
          competitorChanges: params?.competitorChanges || this.getStubCompetitorChanges(),
          featureComparison: params?.featureComparison || this.getStubFeatureComparison(),
        };

      case 'roadmap':
        return {
          ...baseContext,
          decisionContext: params?.decisionContext || this.getStubDecisionContext(),
          vocThemes: params?.vocThemes || this.getStubVocThemes(),
          analyticsInsights: params?.analyticsInsights || '',
          competitorContext: params?.competitorContext || '',
          resourceConstraints: params?.resourceConstraints || this.getStubResourceConstraints(),
        };

      case 'release-notes':
        return {
          ...baseContext,
          releaseVersion: params?.releaseVersion || 'v2.4.0',
          releaseDate: params?.releaseDate || baseContext.currentDate,
          completedIssues: params?.completedIssues || this.getStubCompletedIssues(),
          epicSummaries: params?.epicSummaries || '',
          relatedPrds: params?.relatedPrds || '',
          releaseNotesTemplate: params?.releaseNotesTemplate || '',
        };

      case 'deck-content':
        return {
          ...baseContext,
          topic: params?.topic || 'Q4 Product Update',
          audienceType: params?.audienceType || 'exec',
          purpose: params?.purpose || 'Quarterly business review',
          duration: params?.duration || 30,
          keyDataPoints: params?.keyDataPoints || this.getStubKeyDataPoints(),
          supportingEvidence: params?.supportingEvidence || '',
          relatedArtifacts: params?.relatedArtifacts || '',
          requirements: params?.requirements || '',
        };

      case 'prototype':
        return {
          ...baseContext,
          prdContent: params?.prdContent || this.getStubPrdContent(),
          designSystem: params?.designSystem || this.getStubDesignSystem(),
          focusAreas: params?.focusAreas || 'filter_bar, results_list, date_picker',
        };

      default:
        return baseContext;
    }
  }

  /**
   * Generate content using LLM or stubs
   */
  private async generateContent(
    jobType: JobType,
    context: PromptContext
  ): Promise<string> {
    // For now, always use stub responses
    // In production, this would call the LLM service
    if (this.config.useStubs) {
      return generateStubResponse(jobType, context);
    }

    // TODO: Integrate with LLM service
    // const { system, user } = renderPrompt(PROMPT_TEMPLATES[jobType], context);
    // return await llmService.complete({ system, user });

    return generateStubResponse(jobType, context);
  }

  /**
   * Get output filename based on workflow and params
   */
  private getOutputFilename(
    workflowId: WorkflowId,
    params?: Record<string, unknown>
  ): string {
    switch (workflowId) {
      case 'meeting-prep':
        const accountName = (params?.accountName as string) || 'account';
        return `${this.slugify(accountName)}.md`;

      case 'prd-draft':
        const featureName = (params?.featureName as string) || 'feature';
        return `${this.slugify(featureName)}.md`;

      case 'sprint-review':
        const sprintName = (params?.sprintName as string) || 'sprint';
        return `${this.slugify(sprintName)}.md`;

      case 'release-notes':
        const version = (params?.releaseVersion as string) || 'release';
        return `${this.slugify(version)}.md`;

      case 'deck-content':
        const topic = (params?.topic as string) || 'deck';
        return `${this.slugify(topic)}.md`;

      case 'prototype':
        const protoFeature = (params?.featureName as string) || 'prototype';
        return `${this.slugify(protoFeature)}.html`;

      default:
        return 'output.md';
    }
  }

  private slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private getDateDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  // Stub data generators
  private getStubSlackMessages(): string {
    return `
**#product** (12 messages):
- Sarah Chen: "Search filters PR is ready for review"
- Mike Johnson: "Globex Corp escalation resolved"
- Emily Davis: "QBR prep done for tomorrow"

**#engineering** (8 messages):
- Alex Kim: "Deployed search ranking improvements"
- Dev Bot: "Build passed for main branch"

**#support** (15 messages):
- Support Bot: "3 new tickets, 2 resolved"
- Jane Doe: "Enterprise customer asking about SSO timeline"
`;
  }

  private getStubJiraUpdates(): string {
    return `
**Sprint 42 Progress**:
- ACME-342: Search filters - In Review (5 pts)
- ACME-343: Search ranking - Done (8 pts)
- ACME-350: Critical bug fix - Done (3 pts)

**Blockers**:
- None currently

**Velocity**: 16/19 points completed (84%)
`;
  }

  private getStubSupportTickets(): string {
    return `
**Open Tickets**: 12
**P1 Issues**: 0
**P2 Issues**: 2

**Recent Tickets**:
1. #4521 - Search not returning expected results (P2, 2 days)
2. #4519 - Dashboard slow for large accounts (P2, 3 days)
3. #4515 - Feature request: date filters (P3, resolved)
`;
  }

  private getStubCommunityActivity(): string {
    return `
**Feature Requests** (top 3 by votes):
1. AI-powered search (89 votes)
2. Saved searches (45 votes)
3. Custom date ranges (38 votes)

**Positive Feedback**:
- "Love the new search improvements!" (+12)
`;
  }

  private getStubGongCalls(): string {
    return `
**Recent Calls**:
1. Dec 20 - QBR with John Smith (45 min)
   - Discussed search frustrations
   - Expansion blocked by search issues
2. Dec 15 - Support follow-up with Emily Davis
   - Dashboard loading resolved
`;
  }

  private getStubAccountHealth(): string {
    return `
| Metric | Value |
|--------|-------|
| Health Score | 72/100 |
| NPS | 7 (Passive) |
| Contract Value | $48,000 ARR |
| Seats | 50 |
| Renewal Date | March 2026 |
`;
  }

  private getStubGongInsights(): string {
    return `
**Top Pain Points**:
1. Search relevance (mentioned in 35% of calls)
2. Onboarding complexity (22%)
3. Integration gaps (18%)

**Feature Requests**:
- Date filters for search
- Saved search preferences
- AI-powered suggestions
`;
  }

  private getStubCommunityFeedback(): string {
    return `
**Feature Requests**:
- Search filters (89 votes)
- AI search (67 votes)
- Mobile app (45 votes)

**Bug Reports**:
- Special character crash (fixed)
- Slow dashboard (investigating)
`;
  }

  private getStubNpsVerbatims(): string {
    return `
**Promoters (9-10)**:
- "Great product, love the team"
- "Search is getting better"

**Passives (7-8)**:
- "Good but search needs work"

**Detractors (0-6)**:
- "Can't find anything with search"
`;
  }

  private getStubCustomerEvidence(): string {
    return `
**Support Tickets**: 47 mentions of search issues
**Gong Calls**: 12 calls mentioned search frustrations
**Community**: 89-vote feature request for filters
**Quote**: "I spend more time searching than working" - Globex Corp
`;
  }

  private getStubAnalyticsSignals(): string {
    return `
**Search Usage**:
- 10,000 searches/day
- 15% no-result rate
- 3.2 avg. searches to find content

**Drop-off Points**:
- 35% abandon after 3 searches
`;
  }

  private getStubCompletedStories(): string {
    return `
| Story | Status | Points | Demo Ready |
|-------|--------|--------|------------|
| ACME-342: Search filters | Done | 5 | Yes |
| ACME-343: Search ranking | Done | 8 | Yes |
| ACME-350: Bug fix | Done | 3 | No |
`;
  }

  private getStubSprintMetrics(): string {
    return `
| Metric | Value |
|--------|-------|
| Committed | 19 pts |
| Completed | 16 pts |
| Velocity | 84% |
| Bugs Fixed | 5 |
`;
  }

  private getStubBlockers(): string {
    return `
**Blockers This Sprint**:
1. Redis connection pool issue (resolved, 2 days impact)
2. Search algorithm complexity (scope adjusted)
`;
  }

  private getStubCustomerFeedback(): string {
    return `
**Beta Feedback**:
- "Search filters are exactly what we needed" - Globex Corp
- "Finally can find things quickly" - Initech
`;
  }

  private getStubCompetitorChanges(): string {
    return `
**Notion**: Launched AI-powered semantic search
**Coda**: 20% price cut on enterprise plans
**Monday.com**: New native Slack integration
**Asana**: AI Goals feature released
`;
  }

  private getStubFeatureComparison(): string {
    return `
| Feature | Us | Notion | Coda | Monday |
|---------|-----|--------|------|--------|
| Search Filters | ✅ | ✅ | ✅ | ✅ |
| AI Search | ❌ | ✅ | ❌ | ❌ |
| SSO | 🔜 | ✅ | ✅ | ✅ |
`;
  }

  private getStubDecisionContext(): string {
    return `
We need to decide the primary focus for Q1 2026 engineering capacity. Both Search AI and Enterprise SSO have strong cases.

**Constraints**:
- Engineering capacity: 3 pods (12 engineers)
- Both initiatives require 1.5-2 pods
- Q1 planning deadline: Jan 15
`;
  }

  private getStubVocThemes(): string {
    return `
**Search**: 52 mentions, #1 pain point
**SSO**: 95-vote request, blocking 3 deals worth $450K
`;
  }

  private getStubResourceConstraints(): string {
    return `
**Available Capacity**: 3 pods, 12 engineers
**Search AI**: 2 pods, 10 weeks
**SSO**: 1.5 pods, 8 weeks
`;
  }

  private getStubCompletedIssues(): string {
    return `
**New Features**:
- ACME-342: Search filters
- ACME-340: Bulk export

**Improvements**:
- ACME-343: Search ranking
- ACME-339: Dashboard performance

**Bug Fixes**:
- ACME-350: Search crash on special chars
- ACME-348: Dashboard widget loading
`;
  }

  private getStubKeyDataPoints(): string {
    return `
**Velocity**: 84% (16/19 points)
**NPS**: 3.2 → 4.1 for search
**Search time**: -40%
**Filter adoption**: 45%
`;
  }

  private getStubPrdContent(): string {
    return `
# Search Filters PRD

## Problem
Users cannot efficiently find content.

## Solution
Add date range and content type filters.

## Requirements
- Date filter: 7d, 30d, 90d, custom
- Type filter: documents, projects, comments
- Real-time result updates
`;
  }

  private getStubDesignSystem(): string {
    return `
**Colors**: Indigo primary (#6366f1), gray neutrals
**Typography**: System fonts, 14px base
**Components**: Rounded corners, subtle shadows
`;
  }
}
