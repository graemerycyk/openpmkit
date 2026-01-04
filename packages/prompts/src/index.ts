import type { JobType } from '@pmkit/core';

// ============================================================================
// Prompt Template Types
// ============================================================================

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  jobType: JobType;
  systemPrompt: string;
  userPromptTemplate: string;
  outputFormat: 'markdown' | 'json' | 'structured';
  requiredContext: string[];
}

export interface PromptContext {
  tenantName: string;
  productName: string;
  currentDate: string;
  userName: string;
  [key: string]: unknown;
}

// ============================================================================
// Prompt Templates
// ============================================================================

export const PROMPT_TEMPLATES: Record<JobType, PromptTemplate> = {
  daily_brief: {
    id: 'daily-brief-v1',
    name: 'Daily Brief',
    description: 'Generate a morning brief synthesizing overnight activity',
    jobType: 'daily_brief',
    systemPrompt: `You are a product management assistant helping PMs stay on top of their product. 
Your job is to synthesize information from multiple sources into a concise, actionable daily brief.

Guidelines:
- Be concise but comprehensive
- Highlight blockers and urgent items first
- Include specific numbers and quotes where relevant
- End with recommended actions
- Use markdown formatting`,
    userPromptTemplate: `Generate a daily brief for {{userName}} at {{tenantName}} for {{currentDate}}.

## Context

### Slack Activity
{{slackMessages}}

### Jira Updates
{{jiraUpdates}}

### Support Tickets
{{supportTickets}}

### Community Activity
{{communityActivity}}

## Output Format

Create a brief with these sections:
1. **TL;DR** - 2-3 sentence summary
2. **Urgent Items** - Blockers, escalations, critical bugs
3. **Sprint Progress** - Current sprint status and notable updates
4. **Customer Signal** - Key feedback from support and community
5. **Recommended Actions** - Top 3 things to focus on today`,
    outputFormat: 'markdown',
    requiredContext: ['slackMessages', 'jiraUpdates', 'supportTickets', 'communityActivity'],
  },

  meeting_prep: {
    id: 'meeting-prep-v1',
    name: 'Meeting Prep Pack',
    description: 'Prepare for customer meetings with context and talking points',
    jobType: 'meeting_prep',
    systemPrompt: `You are a product management assistant helping PMs prepare for customer meetings.
Your job is to compile relevant context and suggest talking points.

Guidelines:
- Focus on the specific customer/account
- Include recent interactions and open issues
- Suggest questions to ask
- Highlight opportunities and risks
- Be actionable and specific`,
    userPromptTemplate: `Generate a meeting prep pack for {{userName}} at {{tenantName}}.

## Meeting Details
- Account: {{accountName}}
- Meeting Type: {{meetingType}}
- Attendees: {{attendees}}
- Date: {{meetingDate}}

## Context

### Recent Calls (Gong)
{{gongCalls}}

### Open Support Tickets
{{supportTickets}}

### Account Health
{{accountHealth}}

## Output Format

Create a prep pack with:
1. **Account Summary** - Key facts, contract details, health score
2. **Recent History** - Last 3 interactions and outcomes
3. **Open Issues** - Unresolved tickets or concerns
4. **Key Insights** - Pain points, feature requests, sentiment from calls
5. **Talking Points** - Suggested topics and questions
6. **Risks & Opportunities** - What to watch for`,
    outputFormat: 'markdown',
    requiredContext: ['accountName', 'gongCalls', 'supportTickets'],
  },

  voc_clustering: {
    id: 'voc-clustering-v1',
    name: 'Voice of Customer Clustering',
    description: 'Cluster customer feedback into actionable themes',
    jobType: 'voc_clustering',
    systemPrompt: `You are a product management assistant specializing in voice of customer analysis.
Your job is to identify patterns in customer feedback and cluster them into actionable themes.

Guidelines:
- Group similar feedback together
- Quantify each theme (# of mentions, sources)
- Include representative quotes
- Assess impact and urgency
- Connect to product implications`,
    userPromptTemplate: `Analyze customer feedback for {{tenantName}} and identify key themes.

## Feedback Sources

### Support Tickets
{{supportTickets}}

### Gong Call Insights
{{gongInsights}}

### Community Posts & Feature Requests
{{communityFeedback}}

### NPS Verbatims
{{npsVerbatims}}

## Output Format

Create a VoC report with:
1. **Executive Summary** - Top 3-5 themes with impact assessment
2. **Theme Analysis** - For each theme:
   - Theme name and description
   - Number of mentions and sources
   - Representative quotes (3-5)
   - Affected customer segments
   - Product implications
3. **Trend Analysis** - What's changing vs. last period
4. **Recommendations** - Prioritized actions based on themes`,
    outputFormat: 'markdown',
    requiredContext: ['supportTickets', 'gongInsights', 'communityFeedback'],
  },

  competitor_research: {
    id: 'competitor-research-v1',
    name: 'Competitor Research Report',
    description: 'Track competitor product changes and releases',
    jobType: 'competitor_research',
    systemPrompt: `You are a product research analyst helping PMs track competitor product developments.
Your job is to synthesize competitor product updates into strategic insights.

Guidelines:
- Focus on actionable product changes (not noise)
- Assess strategic implications for your product
- Compare to your capabilities
- Suggest responses where appropriate
- Be objective and fact-based`,
    userPromptTemplate: `Generate a competitor research report for {{tenantName}}.

## Time Period
From: {{fromDate}}
To: {{toDate}}

## Competitor Updates
{{competitorChanges}}

## Feature Comparison
{{featureComparison}}

## Output Format

Create an intel report with:
1. **Key Changes Summary** - Most significant updates
2. **By Competitor** - Detailed changes per competitor
   - What changed
   - Why it matters
   - Our position
3. **Feature Gap Analysis** - Where we lead/lag
4. **Strategic Implications** - What this means for our roadmap
5. **Recommended Actions** - Suggested responses`,
    outputFormat: 'markdown',
    requiredContext: ['competitorChanges', 'featureComparison'],
  },

  roadmap_alignment: {
    id: 'roadmap-alignment-v1',
    name: 'Roadmap Alignment Memo',
    description: 'Create an alignment memo for roadmap decisions',
    jobType: 'roadmap_alignment',
    systemPrompt: `You are a strategic product advisor helping PMs make roadmap decisions.
Your job is to synthesize context and present options with clear trade-offs.

Guidelines:
- Present 2-3 clear options
- Be explicit about trade-offs
- Include evidence for each option
- Make a recommendation with reasoning
- Format for executive review`,
    userPromptTemplate: `Generate a roadmap alignment memo for {{tenantName}}.

## Decision Context
{{decisionContext}}

## Evidence

### Customer Demand (VoC)
{{vocThemes}}

### Analytics Insights
{{analyticsInsights}}

### Competitive Landscape
{{competitorContext}}

### Resource Constraints
{{resourceConstraints}}

## Output Format

Create an alignment memo with:
1. **Decision Required** - Clear statement of what needs to be decided
2. **Context** - Background and why this matters now
3. **Options** (2-3 options, each with):
   - Description
   - Pros
   - Cons
   - Evidence supporting this option
   - Resource requirements
   - Timeline
4. **Recommendation** - Which option and why
5. **Open Questions** - What we still need to learn
6. **Next Steps** - If approved, what happens next`,
    outputFormat: 'markdown',
    requiredContext: ['decisionContext', 'vocThemes'],
  },

  prd_draft: {
    id: 'prd-draft-v1',
    name: 'PRD Draft',
    description: 'Draft a PRD from customer evidence and context',
    jobType: 'prd_draft',
    systemPrompt: `You are a product management assistant helping PMs write PRDs.
Your job is to draft a comprehensive PRD based on evidence and context.

Guidelines:
- Ground everything in evidence
- Be specific about success criteria
- Call out assumptions explicitly
- Include open questions
- Follow standard PRD structure`,
    userPromptTemplate: `Draft a PRD for {{tenantName}}.

## Feature Context
Feature Name: {{featureName}}
Epic: {{epicKey}}

## Evidence

### Customer Demand
{{customerEvidence}}

### Analytics Signals
{{analyticsSignals}}

### Existing Documentation
{{existingDocs}}

### Technical Context
{{technicalContext}}

## Output Format

Create a PRD with:
1. **Overview**
   - Problem statement
   - Goals and success metrics
   - Non-goals
2. **Background**
   - Customer evidence (with sources)
   - Market context
   - Related work
3. **Solution**
   - Proposed approach
   - User stories
   - Key flows
4. **Requirements**
   - Functional requirements
   - Non-functional requirements
   - Edge cases
5. **Success Criteria**
   - Launch criteria
   - Success metrics
   - Rollback criteria
6. **Assumptions & Risks**
   - Key assumptions
   - Risks and mitigations
7. **Open Questions**
   - Unresolved items
   - Dependencies
8. **Timeline**
   - Phases
   - Milestones`,
    outputFormat: 'markdown',
    requiredContext: ['featureName', 'customerEvidence'],
  },

  sprint_review: {
    id: 'sprint-review-v1',
    name: 'Sprint Review Pack',
    description: 'Generate a sprint review summary with accomplishments, metrics, and demos',
    jobType: 'sprint_review',
    systemPrompt: `You are a product management assistant helping PMs prepare sprint review presentations.
Your job is to synthesize sprint data into a clear, stakeholder-friendly summary.

Guidelines:
- Focus on outcomes and value delivered, not just tasks completed
- Highlight metrics and measurable progress
- Include demo-ready features with key talking points
- Note blockers and learnings for transparency
- Keep it concise but comprehensive`,
    userPromptTemplate: `Generate a sprint review pack for {{tenantName}}.

## Sprint Details
Sprint: {{sprintName}}
Period: {{sprintStart}} to {{sprintEnd}}
Team: {{teamName}}

## Sprint Data

### Completed Stories
{{completedStories}}

### Sprint Metrics
{{sprintMetrics}}

### Blockers & Issues
{{blockers}}

### Customer Feedback
{{customerFeedback}}

## Output Format

Create a sprint review pack with:
1. **Sprint Summary** - 2-3 sentence overview of what was accomplished
2. **Key Accomplishments** - Top 3-5 deliverables with business impact
3. **Metrics Dashboard**
   - Velocity (points completed vs committed)
   - Bug count and resolution rate
   - Customer-facing vs internal work ratio
4. **Demo Highlights** - Features ready to demo with talking points
5. **Blockers & Learnings** - What slowed us down and what we learned
6. **Customer Impact** - Feedback received and how it influenced work
7. **Next Sprint Preview** - What's coming up`,
    outputFormat: 'markdown',
    requiredContext: ['sprintName', 'completedStories', 'sprintMetrics'],
  },
};

// ============================================================================
// Template Rendering
// ============================================================================

export function renderPrompt(
  template: PromptTemplate,
  context: PromptContext
): { system: string; user: string } {
  let userPrompt = template.userPromptTemplate;

  // Replace all {{variable}} placeholders
  for (const [key, value] of Object.entries(context)) {
    const placeholder = `{{${key}}}`;
    const stringValue =
      typeof value === 'string'
        ? value
        : Array.isArray(value)
          ? value.join('\n')
          : JSON.stringify(value, null, 2);
    userPrompt = userPrompt.replace(new RegExp(placeholder, 'g'), stringValue);
  }

  return {
    system: template.systemPrompt,
    user: userPrompt,
  };
}

// ============================================================================
// Stub Response Generator (for demo mode without LLM)
// ============================================================================

export interface StubGeneratorOptions {
  includeToolCalls?: boolean;
  artifactFormat?: 'markdown' | 'json';
}

export function generateStubResponse(
  jobType: JobType,
  context: PromptContext,
  _options: StubGeneratorOptions = {}
): string {
  const template = PROMPT_TEMPLATES[jobType];
  const date = context.currentDate || new Date().toISOString().split('T')[0];

  switch (jobType) {
    case 'daily_brief':
      return generateDailyBriefStub(context, date);
    case 'meeting_prep':
      return generateMeetingPrepStub(context, date);
    case 'voc_clustering':
      return generateVocClusteringStub(context, date);
    case 'competitor_research':
      return generateCompetitorResearchStub(context, date);
    case 'roadmap_alignment':
      return generateRoadmapAlignmentStub(context, date);
    case 'prd_draft':
      return generatePrdDraftStub(context, date);
    case 'sprint_review':
      return generateSprintReviewStub(context, date);
    default:
      return `# ${template.name}\n\nGenerated on ${date}\n\nStub response for ${jobType}`;
  }
}

function generateDailyBriefStub(context: PromptContext, date: string): string {
  return `# Daily Brief - ${date}

## TL;DR
Search improvements are progressing well (70% complete), but we have a critical bug (ACME-350) affecting special characters in search. One enterprise escalation from Globex Corp regarding dashboard loading. Community sentiment around search is improving with the announcement of upcoming filters.

## 🚨 Urgent Items

### Critical Bug: Search Crashes on Special Characters
- **Ticket**: ACME-350 (P1)
- **Status**: Fix in review
- **Impact**: All users attempting searches with special characters
- **ETA**: Fix deploying today

### Enterprise Escalation: Globex Corp
- **Issue**: Dashboard widgets not loading for 12 users
- **Status**: Root cause identified (Redis connection pool)
- **Action**: Temporary fix deployed, permanent fix in progress

## 📊 Sprint Progress (Sprint 42)

| Story | Status | Points |
|-------|--------|--------|
| ACME-342: Search filters | In Progress (70%) | 5 |
| ACME-343: Search ranking | In Review | 8 |
| ACME-344: No results UX | To Do | 3 |

**Velocity**: On track to complete 16/19 points

## 📣 Customer Signal

### Top Themes This Week
1. **Search frustration** (35% of mentions) - "I spend more time searching than working"
2. **Onboarding complexity** (22%) - 2-week ramp time reported
3. **Integration gaps** (18%) - Slack sync issues

### Notable Feedback
> "We're ready to expand from 50 to 200 seats once search is fixed" - Globex Corp

## ✅ Recommended Actions

1. **Review ACME-350 fix** - Critical bug affecting search
2. **Follow up with Globex Corp** - Confirm dashboard issue resolved
3. **Prep for search filters launch** - Comms and docs ready for next week`;
}

function generateMeetingPrepStub(context: PromptContext, date: string): string {
  const accountName = (context.accountName as string) || 'Globex Corp';
  return `# Meeting Prep Pack

**Account**: ${accountName}
**Date**: ${date}
**Prepared for**: ${context.userName}

## Account Summary

| Metric | Value |
|--------|-------|
| Contract Value | $48,000 ARR |
| Seats | 50 (planning expansion to 200) |
| Health Score | 72/100 (⚠️ At Risk) |
| NPS | 7 (Passive) |
| Renewal Date | March 2026 |

## Recent History

### Last 3 Interactions

1. **Dec 20 - QBR Call** (45 min)
   - Discussed search frustrations
   - Expansion blocked by search issues
   - Shared roadmap for improvements

2. **Dec 15 - Support Escalation**
   - Dashboard loading issues
   - Resolved within 4 hours

3. **Nov 28 - Feature Request**
   - Date filters for search
   - Added to Q4 roadmap

## Open Issues

| Ticket | Priority | Status | Age |
|--------|----------|--------|-----|
| Search relevance | High | In Progress | 8 days |
| Dashboard performance | Normal | Monitoring | 3 days |

## Key Insights from Calls

### Pain Points
- "Search is our biggest pain point" - John Smith
- "Team spends 20-30 min/day searching" - Emily Davis

### Opportunities
- Ready to 4x seat count if search improves
- Interested in API for internal tools

## Talking Points

1. **Search Update**: Share progress on filters (shipping next week)
2. **Dashboard Follow-up**: Confirm issues resolved
3. **Expansion Discussion**: Timeline for 200 seats?
4. **API Interest**: Explore integration needs

## Questions to Ask

1. What's the timeline for your expansion decision?
2. Beyond search, what else would unlock more value?
3. Who else should we include in future conversations?

## Risks & Opportunities

### Risks
- ⚠️ Expansion blocked until search ships
- ⚠️ Competitor (Notion) mentioned in last call

### Opportunities
- 🎯 4x expansion potential ($192K ARR)
- 🎯 API integration could drive stickiness`;
}

function generateVocClusteringStub(context: PromptContext, date: string): string {
  return `# Voice of Customer Report

**Period**: Last 30 days
**Generated**: ${date}
**Data Sources**: Support (47), Gong (32 calls), Community (45), NPS (28)

## Executive Summary

| Theme | Mentions | Trend | Impact |
|-------|----------|-------|--------|
| Search Frustration | 52 | ↑ 15% | Critical |
| Onboarding Complexity | 33 | → Stable | High |
| Integration Gaps | 27 | ↓ 8% | Medium |
| Performance Issues | 22 | ↑ 25% | High |

**Key Insight**: Search remains the #1 pain point, with enterprise customers citing it as an expansion blocker. The upcoming search improvements are eagerly anticipated.

## Theme Analysis

### 1. Search Frustration (35% of mentions)

**Description**: Users struggle to find content, report poor relevance, and lack filtering options.

**Quantification**:
- 47 support tickets
- 12 Gong call mentions
- 89-vote feature request

**Representative Quotes**:
> "I spend more time searching than working" - Globex Corp
> "Search never finds what I'm looking for" - Community
> "We've created workarounds using tags but it's not sustainable" - Initech

**Affected Segments**: Enterprise (highest), Mid-market, All users

**Product Implications**:
- Search improvements are critical for retention
- Filters are table-stakes expectation
- Enterprise expansion blocked

---

### 2. Onboarding Complexity (22% of mentions)

**Description**: New users take 2-3 weeks to become productive, with confusion around initial setup.

**Quantification**:
- 15 support tickets
- 8 Gong call mentions
- 35% onboarding drop-off at step 3

**Representative Quotes**:
> "It took our team 3 weeks to get productive" - Gong call
> "The learning curve is steep" - NPS verbatim
> "New hires keep getting stuck on project creation" - Support

**Product Implications**:
- Guided onboarding needed
- Project creation flow needs simplification
- Consider interactive tutorials

---

### 3. Integration Gaps (18% of mentions)

**Description**: Slack integration reliability issues, requests for Jira two-way sync.

**Representative Quotes**:
> "Slack integration stopped working after update"
> "We need better Slack integration"
> "Jira sync is unreliable"

---

## Recommendations

1. **Ship search improvements** (In Progress) - Addresses top theme
2. **Redesign onboarding flow** - High impact, medium effort
3. **Rebuild Slack integration** - Address reliability concerns
4. **Add performance monitoring** - Proactive issue detection`;
}

function generateCompetitorResearchStub(context: PromptContext, date: string): string {
  return `# Competitor Research Report

**Period**: Last 14 days
**Generated**: ${date}

## Key Changes Summary

| Competitor | Change | Significance |
|------------|--------|--------------|
| Notion | AI-powered search launch | 🔴 High |
| Coda | 20% enterprise price cut | 🔴 High |
| Monday.com | Native Slack integration | 🟡 Medium |
| Asana | AI Goals feature | 🟡 Medium |
| ClickUp | $400M Series D | 🔴 High |

## Detailed Analysis

### Notion - AI-Powered Search

**What Changed**: Launched semantic search using AI embeddings. Available to all paid plans.

**Why It Matters**: 
- Directly addresses our top customer pain point
- Sets new bar for search expectations
- First-mover advantage in AI search

**Our Position**:
- ❌ We don't have AI search
- ✅ We're shipping filters (addresses different need)
- ⚠️ Gap will be visible to customers

**Recommended Response**: Accelerate AI search exploration for Q1

---

### Coda - 20% Enterprise Price Reduction

**What Changed**: Enterprise plans now $20/user/month (down from $25)

**Why It Matters**:
- Makes them more competitive for enterprise deals
- Could pressure our pricing in negotiations

**Our Position**:
- Our enterprise pricing is $22/user
- We have stronger compliance features

---

## Feature Gap Analysis

| Feature | Us | Notion | Coda | Monday |
|---------|-----|--------|------|--------|
| AI Search | ❌ | ✅ | ❌ | ❌ |
| Search Filters | 🔜 | ✅ | ✅ | ✅ |
| SAML SSO | 🔜 | ✅ | ✅ | ✅ |
| Audit Logs | 🔜 | ✅ | ❌ | ✅ |
| Slack Integration | ⚠️ | ✅ | ✅ | ✅ |

## Strategic Implications

1. **AI is table stakes** - Notion's move signals market direction
2. **Pricing pressure** - Coda's cut may affect enterprise deals
3. **Integration parity** - We're behind on Slack reliability

## Recommended Actions

1. **Prioritize search improvements** - Close the gap
2. **Evaluate AI search** - Begin discovery for Q1
3. **Fix Slack integration** - Address reliability issues`;
}

function generateRoadmapAlignmentStub(context: PromptContext, date: string): string {
  return `# Roadmap Alignment Memo

**Decision Required**: Q1 2026 Priority - Search AI vs. Enterprise SSO
**Date**: ${date}
**Author**: ${context.userName}

## Decision Required

We need to decide the primary focus for Q1 2026 engineering capacity. Both Search AI and Enterprise SSO have strong cases. This memo presents options and a recommendation.

## Context

**Why Now**: 
- Q1 planning deadline is Jan 15
- Engineering capacity: 3 pods (12 engineers)
- Both initiatives require 1.5-2 pods

**Background**:
- Search is our #1 customer pain point (35% of VoC)
- SSO is blocking 3 enterprise deals worth $450K ARR
- Competitor (Notion) just launched AI search

## Options

### Option A: Search AI First

**Description**: Build AI-powered semantic search, launching Q1

**Pros**:
- Addresses #1 customer pain point
- Competitive response to Notion
- Benefits all customers

**Cons**:
- Enterprise deals remain blocked
- SSO is a compliance requirement for some
- Longer time to revenue impact

**Evidence**:
- 52 VoC mentions for search
- 89-vote community request
- 3 expansion deals blocked by search

**Resources**: 2 pods, 10 weeks
**Revenue Impact**: Retention improvement (~$200K protected ARR)

---

### Option B: Enterprise SSO First

**Description**: Ship SAML/OIDC SSO, launching mid-Q1

**Pros**:
- Unblocks $450K in enterprise deals
- Compliance requirement for regulated industries
- Shorter time to revenue

**Cons**:
- Search pain continues
- Competitive gap widens
- Benefits only enterprise segment

**Evidence**:
- 3 deals worth $450K blocked
- 95-vote feature request
- All competitors have SSO

**Resources**: 1.5 pods, 8 weeks
**Revenue Impact**: $450K new ARR

---

### Option C: Parallel (Reduced Scope)

**Description**: Do both with reduced scope - basic AI search + SSO

**Pros**:
- Addresses both needs
- No deal blockers
- Competitive positioning

**Cons**:
- Neither done well
- Higher risk of delays
- Team context switching

**Resources**: 3 pods, 12 weeks
**Revenue Impact**: $450K new + $150K protected

---

## Recommendation

**Option B: Enterprise SSO First**, with Search AI immediately following.

**Reasoning**:
1. SSO has clear, immediate revenue impact ($450K)
2. SSO is faster (8 weeks vs 10)
3. Search improvements (filters) shipping now address acute pain
4. AI search can begin discovery in parallel

## Open Questions

1. Can we get a verbal commitment from blocked deals if we commit to Q1 SSO?
2. What's the minimum viable AI search scope?
3. Can we staff a discovery pod for AI search during SSO build?

## Next Steps

If approved:
1. Confirm with Sales on deal commitments
2. Kick off SSO technical design (Week 1)
3. Begin AI search discovery (Week 2)
4. Update public roadmap`;
}

function generatePrdDraftStub(context: PromptContext, date: string): string {
  const featureName = (context.featureName as string) || 'Search Filters';
  return `# PRD: ${featureName}

**Author**: ${context.userName}
**Date**: ${date}
**Status**: Draft
**Epic**: ACME-100

---

## 1. Overview

### Problem Statement

Users cannot efficiently find content because search results lack filtering capabilities. This leads to:
- Wasted time scrolling through irrelevant results
- Workarounds using manual tagging systems
- Frustration and reduced product satisfaction

### Goals

| Goal | Metric | Target |
|------|--------|--------|
| Reduce time to find content | Avg. search-to-click time | -30% |
| Improve search satisfaction | User survey score | 3.2 → 4.0+ |
| Reduce no-results frustration | Filter usage rate | >40% of searches |

### Non-Goals

- AI-powered semantic search (future initiative)
- Saved searches (separate feature)
- Search analytics dashboard (admin feature)

---

## 2. Background

### Customer Evidence

| Source | Count | Key Quote |
|--------|-------|-----------|
| Support tickets | 47 | "I spend more time searching than working" |
| Gong calls | 12 | "Date filters would be huge" |
| Community | 89 votes | "Filter by content type please" |

### Market Context

All major competitors (Notion, Coda, Monday.com) offer search filters. This is table-stakes functionality.

---

## 3. Solution

### Proposed Approach

Add filter controls to search results with:
- Date range filter (Last 7d, 30d, 90d, custom)
- Content type filter (Documents, Projects, Comments)
- Project/Space filter

### User Stories

1. **As a PM**, I want to filter search by date range so I can find recent content quickly
2. **As a PM**, I want to filter by content type so I can focus on documents vs comments
3. **As a PM**, I want to combine multiple filters so I can narrow results precisely

### Key Flows

1. User enters search query
2. Results display with filter bar above
3. User selects filter(s)
4. Results update in real-time
5. Filters persist during session

---

## 4. Requirements

### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| F1 | Date range filter with presets | P0 |
| F2 | Custom date range picker | P1 |
| F3 | Content type filter | P0 |
| F4 | Project/space filter | P1 |
| F5 | Filter combination (AND logic) | P0 |
| F6 | Clear all filters action | P0 |
| F7 | Filter state in URL | P2 |

### Non-Functional Requirements

- Filter application < 200ms
- Support 100k+ documents
- Mobile-responsive design

---

## 5. Success Criteria

### Launch Criteria
- [ ] All P0 requirements complete
- [ ] <1% error rate in filter queries
- [ ] Performance within targets
- [ ] Documentation updated

### Success Metrics (30 days post-launch)
- Filter usage rate > 40%
- Search satisfaction +0.5 points
- No increase in support tickets

---

## 6. Assumptions & Risks

### Assumptions
- Users understand filter UI patterns
- Backend can support filter queries at scale
- Date filtering uses document update date

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Performance degradation | Medium | High | Index optimization, caching |
| Low adoption | Low | Medium | Onboarding tooltip, defaults |
| Edge cases in date logic | Medium | Low | Comprehensive testing |

---

## 7. Open Questions

1. Should we index comments? (performance vs completeness)
2. How to handle permission-filtered results in counts?
3. What's the default date range?

---

## 8. Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Design | 1 week | Figma specs |
| Backend | 2 weeks | Filter API |
| Frontend | 2 weeks | UI implementation |
| Testing | 1 week | QA + beta |
| Launch | 1 week | Rollout + docs |

**Total**: 7 weeks`;
}

function generateSprintReviewStub(context: PromptContext, date: string): string {
  const sprintName = (context.sprintName as string) || 'Sprint 42';
  return `# Sprint Review Pack - ${sprintName}

**Date**: ${date}
**Team**: ${context.teamName || 'Product Team'}
**Prepared by**: ${context.userName}

## Sprint Summary

${sprintName} delivered key search improvements and addressed critical customer escalations. The team completed 16 of 19 committed points (84% velocity), with the remaining 3 points carrying over due to scope discovery on the search ranking algorithm.

## 🎯 Key Accomplishments

### 1. Search Filters (ACME-342) ✅
- **What**: Added date range, content type, and project filters to search
- **Impact**: Addresses #1 customer pain point (35% of VoC mentions)
- **Demo Ready**: Yes - show filter bar and real-time updates

### 2. Search Ranking Improvements (ACME-343) ✅
- **What**: Improved relevance scoring with recency and engagement signals
- **Impact**: Expected 30% reduction in search-to-click time
- **Demo Ready**: Yes - compare before/after results

### 3. Critical Bug Fix (ACME-350) ✅
- **What**: Fixed crash on special characters in search
- **Impact**: Unblocked all users, resolved P1 escalation
- **Demo Ready**: N/A (bug fix)

### 4. Globex Corp Escalation Resolved ✅
- **What**: Fixed dashboard widget loading issues
- **Impact**: Unblocked expansion discussion (potential $144K ARR)

## 📊 Metrics Dashboard

| Metric | Committed | Completed | Status |
|--------|-----------|-----------|--------|
| Story Points | 19 | 16 | ⚠️ 84% |
| Stories | 8 | 7 | ⚠️ 87% |
| Bugs Resolved | 4 | 5 | ✅ 125% |
| P1 Issues | 1 | 1 | ✅ 100% |

### Velocity Trend
- Sprint 40: 14 pts
- Sprint 41: 17 pts
- Sprint 42: 16 pts
- **3-Sprint Avg**: 15.7 pts

### Work Distribution
- Customer-facing: 75%
- Tech debt: 15%
- Bug fixes: 10%

## 🎬 Demo Highlights

### Demo 1: Search Filters (5 min)
**Presenter**: Sarah Chen

Key talking points:
1. Show filter bar appearing on search results
2. Demonstrate date range presets (7d, 30d, 90d)
3. Show content type filtering (docs vs comments)
4. Highlight real-time result updates
5. Show filter persistence across searches

### Demo 2: Improved Search Ranking (3 min)
**Presenter**: Mike Johnson

Key talking points:
1. Show same query, before vs after results
2. Highlight recency boost for recent content
3. Show engagement signals affecting ranking

## ⚠️ Blockers & Learnings

### What Slowed Us Down
1. **Search ranking scope creep** - Algorithm complexity was underestimated
   - *Learning*: Add spike stories for algorithm work
2. **Redis connection pool issue** - Debugging took 2 days
   - *Learning*: Add connection pool monitoring

### Carryover to Next Sprint
- ACME-344: No results UX (3 pts) - Deprioritized for escalation work

## 💬 Customer Impact

### Feedback Received
> "The search filters are exactly what we needed. This changes everything for our team." - Globex Corp (preview user)

### Customer-Driven Changes
- Added "Last 7 days" as default filter based on beta feedback
- Increased filter result count from 25 to 50 per request

## 🔮 Next Sprint Preview

### Sprint 43 Focus: Search Polish + SSO Kickoff

| Priority | Story | Points |
|----------|-------|--------|
| P0 | No results UX improvements | 3 |
| P0 | Search analytics dashboard | 5 |
| P0 | SSO technical design | 3 |
| P1 | Filter saved preferences | 3 |
| P1 | Search performance optimization | 5 |

**Committed Capacity**: 19 points`;
}

// ============================================================================
// Job Executor (integrates LLM with prompts)
// ============================================================================

import type {
  LLMService,
  LLMCompletionResponse,
  LLMMessage,
} from '@pmkit/core';

export interface JobExecutionResult {
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  estimatedCostUsd: number;
  isStub: boolean;
}

export interface JobExecutorOptions {
  maxTokens?: number;
  temperature?: number;
}

/**
 * Execute a job using the LLM service
 */
export async function executeJob(
  llmService: LLMService,
  tenantId: string,
  jobType: JobType,
  context: PromptContext,
  options: JobExecutorOptions = {}
): Promise<JobExecutionResult> {
  const template = PROMPT_TEMPLATES[jobType];
  
  // Check if using stubs
  if (llmService.isUsingStubs()) {
    const stubContent = generateStubResponse(jobType, context);
    return {
      content: stubContent,
      model: 'stub',
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      latencyMs: 100,
      estimatedCostUsd: 0,
      isStub: true,
    };
  }

  // Render the prompt
  const { system, user } = renderPrompt(template, context);

  // Build messages
  const messages: LLMMessage[] = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];

  // Execute the completion
  const response = await llmService.complete(tenantId, {
    messages,
    maxTokens: options.maxTokens,
    temperature: options.temperature,
  });

  // Calculate cost
  const modelInfo = llmService.getModelForTenant(tenantId);
  const estimatedCostUsd =
    (response.usage.inputTokens / 1_000_000) * modelInfo.inputPricePerMillion +
    (response.usage.outputTokens / 1_000_000) * modelInfo.outputPricePerMillion;

  return {
    content: response.content,
    model: response.model,
    usage: response.usage,
    latencyMs: response.latencyMs,
    estimatedCostUsd,
    isStub: false,
  };
}

/**
 * Create a stub generator function for the LLM service
 * This allows the LLM service to generate contextual stubs
 */
export function createStubGenerator(): (messages: LLMMessage[]) => string {
  return (messages: LLMMessage[]) => {
    // Try to extract job type from the system prompt
    const systemPrompt = messages.find((m) => m.role === 'system')?.content || '';
    
    // Default context
    const context: PromptContext = {
      tenantName: 'Demo Company',
      productName: 'Demo Product',
      currentDate: new Date().toISOString().split('T')[0],
      userName: 'Demo User',
    };

    // Try to identify job type from system prompt
    if (systemPrompt.includes('daily brief')) {
      return generateStubResponse('daily_brief', context);
    } else if (systemPrompt.includes('meeting prep') || systemPrompt.includes('customer meetings')) {
      return generateStubResponse('meeting_prep', context);
    } else if (systemPrompt.includes('voice of customer') || systemPrompt.includes('VoC')) {
      return generateStubResponse('voc_clustering', context);
    } else if (systemPrompt.includes('competitor') || systemPrompt.includes('competitive')) {
      return generateStubResponse('competitor_research', context);
    } else if (systemPrompt.includes('roadmap') || systemPrompt.includes('alignment')) {
      return generateStubResponse('roadmap_alignment', context);
    } else if (systemPrompt.includes('PRD') || systemPrompt.includes('product requirements')) {
      return generateStubResponse('prd_draft', context);
    } else if (systemPrompt.includes('sprint review') || systemPrompt.includes('sprint data')) {
      return generateStubResponse('sprint_review', context);
    }

    // Generic fallback
    return `# Generated Response

This is a stub response generated for development/testing.

To use real LLM responses, set \`USE_STUB_LLM=false\` and provide an \`OPENAI_API_KEY\`.

---
*Generated at ${new Date().toISOString()}*`;
  };
}

