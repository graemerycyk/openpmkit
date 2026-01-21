#!/usr/bin/env node

/**
 * Standalone pmkit MCP Server for Claude Desktop
 *
 * This server exposes pmkit's 10 PM workflows as MCP tools that work with
 * copy/paste data. Claude processes the prompts directly - no external LLM needed.
 *
 * Usage:
 *   npx ts-node standalone-server.ts
 *   # or after building:
 *   node standalone-server.js
 *
 * No environment variables required!
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// ============================================================================
// Embedded Prompt Templates (from @pmkit/prompts)
// ============================================================================

type JobType =
  | 'daily_brief'
  | 'meeting_prep'
  | 'feature_intelligence'
  | 'competitor_research'
  | 'roadmap_alignment'
  | 'prd_draft'
  | 'sprint_review'
  | 'prototype_generation'
  | 'release_notes'
  | 'deck_content'
  | 'feature_ideation'
  | 'one_pager'
  | 'tldr';

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  jobType: JobType;
  systemPrompt: string;
  userPromptTemplate: string;
  outputFormat: 'markdown' | 'json' | 'structured' | 'html';
  requiredContext: string[];
}

interface PromptContext {
  tenantName: string;
  productName: string;
  currentDate: string;
  userName: string;
  [key: string]: unknown;
}

const PROMPT_TEMPLATES: Record<JobType, PromptTemplate> = {
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

  feature_intelligence: {
    id: 'feature-intelligence-v1',
    name: 'Feature Intelligence',
    description: 'Cluster customer feedback into actionable themes',
    jobType: 'feature_intelligence',
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

  prototype_generation: {
    id: 'prototype-generation-v1',
    name: 'Prototype Generation',
    description: 'Generate a UI prototype from a PRD',
    jobType: 'prototype_generation',
    systemPrompt: `You are a UI/UX engineer who creates interactive HTML prototypes from PRDs.

CRITICAL: Output ONLY a complete, standalone HTML file. No markdown, no explanations, no code fences.

Guidelines:
- Create a single HTML file with embedded CSS and JavaScript
- Use modern CSS (flexbox, grid, CSS variables) for styling
- Include interactive elements (dropdowns, buttons, filters) using vanilla JavaScript
- Use a clean, professional design with good typography
- Include realistic placeholder data
- Make all UI elements functional and interactive
- The HTML must be self-contained and work when opened directly in a browser

Design style:
- Use a modern color palette (indigo/blue primary, gray neutrals)
- Clean sans-serif fonts (system fonts)
- Subtle shadows and rounded corners
- Responsive layout that works on different screen sizes

Output: A complete HTML document starting with <!DOCTYPE html> and ending with </html>. Nothing else.`,
    userPromptTemplate: `Generate an interactive HTML prototype based on this PRD:

## PRD Content
{{prdContent}}

## Design Guidelines
{{designSystem}}

## Focus Areas
{{focusAreas}}

Create a complete, standalone HTML file that demonstrates the core user experience. The file must:
1. Start with <!DOCTYPE html> and be valid HTML5
2. Include all CSS in a <style> tag in the <head>
3. Include all JavaScript in a <script> tag before </body>
4. Be fully interactive (dropdowns work, buttons respond, filters apply)
5. Look professional and polished

Output ONLY the HTML file content. No markdown, no explanations, no code blocks.`,
    outputFormat: 'html',
    requiredContext: ['prdContent'],
  },

  release_notes: {
    id: 'release-notes-v1',
    name: 'Release Notes',
    description: 'Generate customer-facing release notes from completed work',
    jobType: 'release_notes',
    systemPrompt: `You are a product marketing writer who creates customer-facing release notes.

Your job is to translate technical work into clear, benefit-focused release notes that customers, sales teams, and CSMs can understand and use.

Guidelines:
- Write for customers, not engineers - focus on benefits, not implementation
- Use clear, jargon-free language
- Categorize changes: New Features, Improvements, Bug Fixes
- Lead with the most impactful changes
- Include brief descriptions of what each change means for users
- Highlight any breaking changes or required actions prominently
- Keep descriptions concise but informative
- Use active voice and present tense

Tone: Professional, helpful, and customer-centric.`,
    userPromptTemplate: `Generate customer-facing release notes for {{productName}} release {{releaseVersion}}.

## Release Information
- Version: {{releaseVersion}}
- Release Date: {{releaseDate}}
- Product: {{productName}}

## Completed Work (from Jira)
{{completedIssues}}

## Epic Summaries
{{epicSummaries}}

## Related PRDs
{{relatedPrds}}

## Previous Release Notes Format
{{releaseNotesTemplate}}

Create release notes with these sections:
1. **Highlights** - Top 2-3 most impactful changes with brief benefit statements
2. **New Features** - New capabilities added in this release
3. **Improvements** - Enhancements to existing features
4. **Bug Fixes** - Issues resolved (grouped if many)
5. **Breaking Changes** - Any changes requiring customer action (if applicable)
6. **Coming Soon** - Brief preview of what's next (optional)

For each item, include:
- Clear title
- 1-2 sentence description of the benefit to users
- Link reference (e.g., "Learn more" placeholder)`,
    outputFormat: 'markdown',
    requiredContext: ['releaseVersion', 'completedIssues'],
  },

  deck_content: {
    id: 'deck-content-v1',
    name: 'Deck Content',
    description: 'Generate slide content tailored to your audience',
    jobType: 'deck_content',
    systemPrompt: `You are a presentation content expert helping PMs create compelling slide content for any audience.

Your job is to generate structured slide content that can be copy-pasted into any existing presentation template. PMs work with company-mandated templates, so you provide the TEXT CONTENT only - not design.

## Output Format
For each slide, provide:
- **[SLIDE N: Type]** - Slide number and purpose
- **Headline**: One compelling sentence (max 10 words)
- **Bullets**: Max 3 points, 5-7 words each
- **Key Metric**: (if applicable) One number that matters
- **Visual Suggestion**: What chart/image would help
- **Speaker Notes**: What to say, what to avoid, likely questions

## Audience-Specific Guidelines

**Customer Audience:**
- Focus on value and outcomes, not features
- Use their language, not internal jargon
- Include ROI and business impact
- Reference success stories from similar customers
- Keep technical details minimal
- Tone: Confident, helpful, outcome-focused

**Team Audience:**
- Include technical details and architecture decisions
- Show sprint metrics and velocity
- Call out blockers and dependencies
- Include demo talking points
- Assign clear action items with owners
- Tone: Direct, detailed, collaborative

**Executive Audience:**
- Lead with business impact and metrics
- Apply the "so what?" test to every point
- Limit to 5-7 slides max
- Include clear asks/decisions needed
- Avoid technical jargon entirely
- Tone: Strategic, concise, confident

**Stakeholder Audience:**
- Highlight cross-functional dependencies
- Show timeline and milestones
- Be clear about what you need from them
- Flag risks that affect their teams
- Tone: Collaborative, transparent, respectful

## General Guidelines
- One key message per slide
- Use the "1-3-5" rule: 1 idea, 3 supporting points, 5 words max per bullet
- Create a narrative arc: context → problem → solution → impact → next steps
- Speaker notes should include: key talking point, potential questions, and what NOT to say`,
    userPromptTemplate: `Generate slide content for {{tenantName}}.

## Presentation Details
- Topic: {{topic}}
- Audience: {{audienceType}}
- Purpose: {{purpose}}
- Duration: {{duration}} minutes (approximate)

## Source Data

### Key Data Points
{{keyDataPoints}}

### Supporting Evidence
{{supportingEvidence}}

### Related Artifacts
{{relatedArtifacts}}

## Specific Requirements
{{requirements}}

Generate structured slide content with:
1. **Title Slide** - Compelling headline, subtitle, presenter info
2. **Agenda/Overview** - What will be covered (optional for short decks)
3. **Context/Problem** - Why this matters now
4. **Main Content** (3-5 slides) - Key points with supporting data
5. **Impact/Results** - Metrics, outcomes, or expected benefits
6. **Next Steps/Ask** - Clear action items or decisions needed
7. **Appendix suggestions** - What to have ready for Q&A

Tailor the tone, depth, and content focus based on the {{audienceType}} audience.`,
    outputFormat: 'markdown',
    requiredContext: ['topic', 'audienceType'],
  },

  one_pager: {
    id: 'one-pager-v1',
    name: 'One-Pager',
    description: 'Synthesize multiple inputs into a concise one-page executive summary or meeting pre-read',
    jobType: 'one_pager',
    systemPrompt: `You are an executive communications expert helping PMs create concise, impactful one-pagers.

Your job is to take multiple inputs (documents, data, context) and distill them into a single-page summary that busy executives or stakeholders can read in 2-3 minutes.

Guidelines:
- Ruthlessly prioritize - only include what matters most
- Lead with the "so what?" - why should they care?
- Use concrete numbers over vague statements
- Structure for skimmability (headers, bullets, bold key points)
- Include a clear ask or decision needed (if applicable)
- Keep it to ONE page when printed (roughly 400-500 words max)
- Assume the reader has 2 minutes and zero context
- End with clear next steps or recommendations`,
    userPromptTemplate: `Create a one-pager for {{tenantName}}.

## Purpose
{{purpose}}

## Target Audience
{{audience}}

## Source Materials

### Documents / Context
{{documents}}

### Key Data Points
{{dataPoints}}

### Background / History
{{background}}

### Current Status
{{currentStatus}}

## Specific Requirements
{{requirements}}

## Output Format

Create a one-pager with:

1. **Title** - Clear, descriptive title

2. **TL;DR** (2-3 sentences max)
   - What is this about?
   - Why does it matter?
   - What's the ask/outcome?

3. **Context** (3-4 bullets)
   - Essential background only
   - Key numbers that frame the situation

4. **Key Findings / Status** (4-6 bullets)
   - Most important points
   - Bold the critical items
   - Include specific metrics

5. **Options / Recommendations** (if applicable)
   - 2-3 options with one-line trade-offs
   - Or clear recommendation with rationale

6. **Ask / Decision Needed** (if applicable)
   - What do you need from the reader?
   - By when?

7. **Next Steps** (3-4 bullets)
   - Concrete actions
   - Owners and dates if known

Keep total length under 500 words. Format for easy skimming.`,
    outputFormat: 'markdown',
    requiredContext: ['purpose', 'documents'],
  },

  tldr: {
    id: 'tldr-v1',
    name: 'TL;DR',
    description: 'Create a quick summary for Slack, email, or async communication',
    jobType: 'tldr',
    systemPrompt: `You are a communication expert helping PMs write concise, scannable summaries for busy teams.

Your job is to take complex information and distill it into a TL;DR that can be read in 30 seconds or less - perfect for Slack messages, email summaries, or async updates.

Guidelines:
- Maximum 3-5 bullet points
- Each bullet is one line (under 15 words)
- Lead with the most important point
- Use emoji sparingly for visual scanning (📊 🚀 ⚠️ ✅ 🎯)
- Include a clear call-to-action if needed
- Link to details rather than including them
- Write for someone scrolling on mobile
- No fluff, no preamble, just the essentials`,
    userPromptTemplate: `Create a TL;DR summary.

## Context Type
{{contextType}}

## Source Content
{{sourceContent}}

## Key Points to Emphasize
{{keyPoints}}

## Call to Action (if any)
{{callToAction}}

## Output Format

Create a TL;DR in this format:

**TL;DR: [One-line summary]**

• [Most important point]
• [Second most important point]  
• [Third point if needed]
• [Fourth point if needed]

[Call to action or link to details]

Keep it under 100 words total. Optimize for Slack/mobile reading.`,
    outputFormat: 'markdown',
    requiredContext: ['sourceContent'],
  },

  feature_ideation: {
    id: 'feature-ideation-v1',
    name: 'Feature Ideation',
    description: 'Transform raw ideas and feedback into structured feature concepts with action points',
    jobType: 'feature_ideation',
    systemPrompt: `You are a product strategist helping PMs transform raw ideas and customer signals into well-structured feature concepts.

Your job is to take unstructured inputs (Slack discussions, feature ideas, customer problems) and synthesize them into a clear feature concept with actionable next steps.

Guidelines:
- Start with the problem, not the solution
- Validate ideas against customer evidence
- Consider multiple solution approaches
- Identify assumptions that need testing
- Create concrete, assignable action items
- Think about what could go wrong
- Consider the "jobs to be done" framework
- Be opinionated but acknowledge uncertainty
- Output should be actionable within 1-2 weeks`,
    userPromptTemplate: `Help me ideate and plan a feature for {{tenantName}}.

## Raw Inputs

### Feature Ideas / Themes
{{featureIdeas}}

### Problem Being Solved
{{problemStatement}}

### Slack / Team Discussions
{{slackDiscussions}}

### Customer Signals
{{customerSignals}}

### Competitive Context
{{competitiveContext}}

### Constraints
{{constraints}}

## Output Format

Create a Feature Ideation Document with:

1. **Problem Definition**
   - Problem statement (1-2 sentences)
   - Who experiences this problem?
   - How painful is it? (frequency × severity)
   - What happens if we don't solve it?

2. **Opportunity Assessment**
   - Market size / customer segment affected
   - Strategic alignment (why now?)
   - Competitive positioning
   - Revenue / retention impact estimate

3. **Solution Exploration**
   - Option A: [Minimal approach]
   - Option B: [Balanced approach]  
   - Option C: [Comprehensive approach]
   - For each: effort estimate, pros, cons, risks

4. **Recommended Approach**
   - Which option and why
   - Core user stories (3-5 max)
   - What's explicitly out of scope
   - Key differentiator vs. alternatives

5. **Assumptions to Validate**
   - List 3-5 critical assumptions
   - How to test each (customer interviews, prototype, data analysis)
   - What would change our mind

6. **Risks & Mitigations**
   - Technical risks
   - Adoption risks
   - Business risks
   - Mitigation strategies

7. **Action Items** (Next 2 weeks)
   - [ ] Action item 1 - Owner - Due date
   - [ ] Action item 2 - Owner - Due date
   - [ ] Action item 3 - Owner - Due date
   - [ ] Action item 4 - Owner - Due date
   - [ ] Action item 5 - Owner - Due date

8. **Decision Points**
   - What decisions need to be made before PRD?
   - Who needs to approve / align?
   - Target date for go/no-go decision`,
    outputFormat: 'markdown',
    requiredContext: ['featureIdeas', 'problemStatement'],
  },
};

function renderPrompt(
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
  feature_intelligence: {
    name: 'Feature Intelligence',
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
  feature_ideation: {
    name: 'Feature Ideation',
    command: '/ideate',
    description: 'Transform raw ideas, feedback, and problems into structured feature concepts with action points',
    shortDescription: 'Feature ideation with action items',
    requiredFields: ['featureIdeas', 'problemStatement'],
    optionalFields: ['slackDiscussions', 'customerSignals', 'competitiveContext', 'constraints', 'userName', 'tenantName'],
    example: `/ideate
Ideas: AI-powered search, semantic understanding, "ask your workspace" chat
Problem: Users spend 20-30 min/day searching, keyword search doesn't understand intent
Slack: Team debating build vs buy, concerns about LLM costs
Customers: 3 enterprise accounts asking about AI search after Notion launch`,
  },
  one_pager: {
    name: 'One-Pager',
    command: '/onepager',
    description: 'Synthesize multiple inputs into a concise one-page executive summary or meeting pre-read',
    shortDescription: 'Executive summary / pre-read',
    requiredFields: ['purpose', 'documents'],
    optionalFields: ['audience', 'dataPoints', 'background', 'currentStatus', 'requirements', 'tenantName'],
    example: `/onepager
Purpose: Board meeting pre-read on Q1 search initiative
Audience: C-suite and board members
Documents: [paste PRD, sprint reviews, metrics]
Data: Search time -40%, NPS +28%, $450K pipeline unblocked`,
  },
  tldr: {
    name: 'TL;DR',
    command: '/tldr',
    description: 'Create a quick summary for Slack, email, or async communication',
    shortDescription: 'Quick Slack-style summary',
    requiredFields: ['sourceContent'],
    optionalFields: ['contextType', 'keyPoints', 'callToAction'],
    example: `/tldr
Type: Sprint update
Content: [paste full sprint review or meeting notes]
CTA: Reply in thread with questions`,
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
- /ideate - Feature ideation with action items
- /onepager - Executive summary / pre-read
- /tldr - Quick Slack-style summary

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
  console.error('Available workflows: /brief, /meeting, /voc, /competitor, /roadmap, /prd, /sprint, /prototype, /release, /deck, /ideate, /onepager, /tldr');
  console.error('Ready to accept tool calls from Claude app');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
