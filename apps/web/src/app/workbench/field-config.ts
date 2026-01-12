import type { JobType } from '@pmkit/core';

export interface ContextField {
  key: string;
  label: string;
  placeholder: string;
  required: boolean;
  multiline: boolean;
  hint?: string;
}

export const JOB_CONTEXT_FIELDS: Record<JobType, ContextField[]> = {
  daily_brief: [
    {
      key: 'slackMessages',
      label: 'Slack Messages',
      placeholder: `Paste relevant Slack messages...

#product-updates: "Search filters shipping next week! 🎉" - Sarah Chen
#customer-success: "Globex Corp escalation resolved" - Mike Johnson
#engineering: "ACME-350 fix deployed" - Alex Kim
DM from CEO: "Great progress on search. Let's discuss AI roadmap"`,
      required: true,
      multiline: true,
      hint: 'Copy messages from Slack channels like #product, #engineering, #customer-success',
    },
    {
      key: 'jiraUpdates',
      label: 'Jira Updates',
      placeholder: `Paste sprint status, recent issues, blockers...

**Sprint 42 Status (Dec 16-29)**

| Issue | Title | Status | Points |
|-------|-------|--------|--------|
| ACME-342 | Search date filters | In Progress (70%) | 5 |
| ACME-343 | Search ranking improvements | In Review | 8 |

**Blockers:**
- ACME-343 waiting on performance review`,
      required: true,
      multiline: true,
      hint: 'Export from Jira sprint board or copy issue summaries',
    },
    {
      key: 'supportTickets',
      label: 'Support Tickets',
      placeholder: `Paste recent support tickets or themes...

**Open Tickets (Last 7 Days)**

| Ticket | Customer | Priority | Subject |
|--------|----------|----------|---------|
| ZD-1234 | Globex Corp | High | Dashboard widgets not loading |
| ZD-1235 | Initech | Normal | Search relevance issues |

**Themes:**
- Search-related: 47 tickets (35%)
- Performance: 22 tickets (16%)`,
      required: true,
      multiline: true,
      hint: 'Export from Zendesk, Intercom, or your support tool',
    },
    {
      key: 'communityActivity',
      label: 'Community Activity',
      placeholder: `Paste community posts, feature requests, discussions...

**Top Discussions:**
1. "Search improvements coming soon?" - 45 replies, 89 upvotes
2. "Workaround for finding old content" - 23 replies

**Feature Requests:**
| Request | Votes | Status |
|---------|-------|--------|
| Date filters for search | 89 | In Progress |
| Saved searches | 45 | Planned |`,
      required: true,
      multiline: true,
      hint: 'From Discourse, Discord, or community forums',
    },
  ],

  meeting_prep: [
    {
      key: 'accountName',
      label: 'Account Name',
      placeholder: 'Globex Corp',
      required: true,
      multiline: false,
    },
    {
      key: 'meetingType',
      label: 'Meeting Type',
      placeholder: 'QBR, Demo, Support Call, Renewal Discussion, etc.',
      required: false,
      multiline: false,
    },
    {
      key: 'attendees',
      label: 'Attendees',
      placeholder: 'John Smith (VP Product), Emily Davis (PM), Sarah Chen (CSM)',
      required: false,
      multiline: false,
    },
    {
      key: 'gongCalls',
      label: 'Recent Calls / Meeting Notes',
      placeholder: `Paste call summaries, transcripts, or notes from previous meetings...

**Globex Corp QBR** (Dec 20, 45 min)
- Attendees: John Smith (VP Product), Emily Davis (PM)
- Topics: Search frustrations, expansion plans, roadmap review
- Key Quote: "Search is our biggest pain point - team spends 20-30 min/day searching"
- Next Steps: Follow up on search improvements

**Initech Demo** (Dec 18, 30 min)
- Attendees: Bob Wilson (Director)
- Topics: Initial demo, pricing discussion
- Sentiment: Positive, comparing to Notion`,
      required: true,
      multiline: true,
      hint: 'From Gong, Chorus, Fireflies, or manual meeting notes',
    },
    {
      key: 'supportTickets',
      label: 'Support Tickets',
      placeholder: `Paste open tickets for this account...

| Ticket | Priority | Subject | Age |
|--------|----------|---------|-----|
| ZD-1234 | High | Dashboard widgets not loading | 3d |
| ZD-1235 | Normal | Search relevance issues | 5d |`,
      required: true,
      multiline: true,
    },
    {
      key: 'accountHealth',
      label: 'Account Health',
      placeholder: `Health score, contract details, NPS, expansion potential...

**Account Health: Globex Corp**
- Health Score: 72/100 (⚠️ At Risk)
- Contract: $48,000 ARR, 50 seats
- Renewal: March 2026
- NPS: 7 (Passive)
- Expansion Potential: 4x (200 seats)`,
      required: false,
      multiline: true,
      hint: 'From your CRM or customer success tool (Gainsight, ChurnZero, etc.)',
    },
  ],

  voc_clustering: [
    {
      key: 'supportTickets',
      label: 'Support Tickets',
      placeholder: `Paste support tickets with themes...

**Open Tickets (Last 7 Days)**

| Ticket | Customer | Priority | Subject |
|--------|----------|----------|---------|
| ZD-1234 | Globex Corp | High | Dashboard widgets not loading |
| ZD-1235 | Initech | Normal | Search relevance issues |

**Themes:**
- Search-related: 47 tickets (35%)
- Performance: 22 tickets (16%)
- Integration: 18 tickets (13%)`,
      required: true,
      multiline: true,
    },
    {
      key: 'gongInsights',
      label: 'Call Insights',
      placeholder: `Pain points, feature requests from calls...

**Pain Points (from 32 calls)**
1. Search frustration (mentioned in 12 calls, 38%)
2. Onboarding complexity (8 calls, 25%)
3. Integration reliability (6 calls, 19%)

**Feature Requests**
1. Date filters for search (89 votes)
2. Saved searches (45 votes)
3. Better Slack integration (38 votes)

**Competitive Mentions**
- Notion: 8 mentions (positive sentiment toward their search)
- Coda: 3 mentions (pricing comparison)`,
      required: true,
      multiline: true,
    },
    {
      key: 'communityFeedback',
      label: 'Community Feedback',
      placeholder: `Feature requests, forum posts...

1. **Date filters for search** (89 votes) - "I need to find content from last week, not 2 years ago"
2. **Saved searches** (45 votes) - "Let me save my common searches"
3. **Better Slack integration** (38 votes) - "Sync is unreliable"
4. **AI-powered search** (34 votes) - "Notion has this, why don't you?"`,
      required: true,
      multiline: true,
    },
    {
      key: 'npsVerbatims',
      label: 'NPS Verbatims',
      placeholder: `NPS survey responses...

**NPS Verbatims (Last 30 Days)**
- Score 9: "Love the product, just need better search"
- Score 8: "Great for our team, onboarding was rough"
- Score 7: "Good but Notion's search is better"
- Score 6: "Slack integration keeps breaking"
- Score 4: "Can't find anything, considering alternatives"`,
      required: false,
      multiline: true,
    },
  ],

  competitor_research: [
    {
      key: 'competitorChanges',
      label: 'Competitor Updates',
      placeholder: `Recent competitor announcements, features, pricing changes...

**Competitor Updates (Last 14 Days)**

### Notion
- **AI-powered search launched** (Dec 22)
  - Semantic search using embeddings
  - Available to all paid plans
  - Early reviews: "Game changer for finding content"

### Coda
- **20% enterprise price reduction** (Dec 18)
  - Enterprise now $20/user/month (was $25)
  - Targeting enterprise market share

### Monday.com
- **Native Slack integration** (Dec 15)
  - Two-way sync with channels
  - Slash commands for task creation`,
      required: true,
      multiline: true,
    },
    {
      key: 'featureComparison',
      label: 'Feature Comparison',
      placeholder: `Feature comparison table or notes...

| Feature | Us | Notion | Coda | Monday |
|---------|-----|--------|------|--------|
| AI Search | ❌ | ✅ | ❌ | ❌ |
| Search Filters | 🔜 | ✅ | ✅ | ✅ |
| SAML SSO | 🔜 | ✅ | ✅ | ✅ |
| Audit Logs | 🔜 | ✅ | ❌ | ✅ |
| Slack Integration | ⚠️ | ✅ | ✅ | ✅ |`,
      required: true,
      multiline: true,
    },
  ],

  roadmap_alignment: [
    {
      key: 'decisionContext',
      label: 'Decision Context',
      placeholder: `What decision needs to be made? Why now? What are the stakes?

**Decision Required**: Q1 2026 Priority - Search AI vs. Enterprise SSO

**Why Now**: 
- Q1 planning deadline is Jan 15
- Engineering capacity: 3 pods (12 engineers)
- Both initiatives require 1.5-2 pods

**Stakes**:
- Search AI: Addresses #1 pain point, competitive response to Notion
- Enterprise SSO: Unblocks $450K in enterprise deals`,
      required: true,
      multiline: true,
    },
    {
      key: 'vocThemes',
      label: 'Customer Demand (VoC)',
      placeholder: `Customer feedback themes, pain points, feature requests...

**Pain Points (from 32 calls)**
1. Search frustration (mentioned in 12 calls, 38%)
2. Onboarding complexity (8 calls, 25%)
3. Integration reliability (6 calls, 19%)

**Feature Requests**
1. Date filters for search (89 votes)
2. Saved searches (45 votes)
3. Enterprise SSO (blocked deals: $450K)`,
      required: true,
      multiline: true,
    },
    {
      key: 'analyticsInsights',
      label: 'Analytics Insights',
      placeholder: `Usage metrics, funnel data, feature adoption...

**Product Metrics (Last 30 Days)**

| Metric | Value | Change |
|--------|-------|--------|
| DAU | 12,450 | +8% |
| Search queries/day | 45,000 | +12% |
| No-results rate | 23% | -2% |

**Feature Usage:**
- Search: 89% of users
- Projects: 76% of users`,
      required: false,
      multiline: true,
    },
    {
      key: 'competitorContext',
      label: 'Competitive Context',
      placeholder: `Relevant competitor moves or market context...

- Notion launched AI search (Dec 22)
- Coda reduced enterprise pricing 20%
- Monday.com raised $400M Series D`,
      required: false,
      multiline: true,
    },
    {
      key: 'resourceConstraints',
      label: 'Resource Constraints',
      placeholder: `Engineering capacity, timeline constraints...

**Engineering Capacity Q1 2026**
- Total: 3 pods (12 engineers)
- Available: 2.5 pods (1 pod on maintenance)
- Search AI estimate: 2 pods, 10 weeks
- SSO estimate: 1.5 pods, 8 weeks`,
      required: false,
      multiline: true,
    },
  ],

  prd_draft: [
    {
      key: 'featureName',
      label: 'Feature Name',
      placeholder: 'Search Filters',
      required: true,
      multiline: false,
    },
    {
      key: 'epicKey',
      label: 'Epic Key',
      placeholder: 'ACME-100',
      required: false,
      multiline: false,
    },
    {
      key: 'customerEvidence',
      label: 'Customer Evidence',
      placeholder: `Support tickets, call quotes, feature request votes...

**Customer Evidence for Search Filters**

| Source | Count | Key Quote |
|--------|-------|-----------|
| Support tickets | 47 | "I spend more time searching than working" |
| Gong calls | 12 | "Date filters would be huge" |
| Community | 89 votes | "Filter by content type please" |
| NPS verbatims | 8 | "Search is my biggest frustration" |

**Expansion Blocked**: 3 enterprise accounts ($450K ARR) cite search as blocker`,
      required: true,
      multiline: true,
      hint: 'The more evidence, the better grounded the PRD',
    },
    {
      key: 'analyticsSignals',
      label: 'Analytics Signals',
      placeholder: `Usage data, funnel metrics, no-results queries...

**Product Metrics (Last 30 Days)**

| Metric | Value | Change |
|--------|-------|--------|
| Search queries/day | 45,000 | +12% |
| Avg. search-to-click | 8.2s | -5% |
| No-results rate | 23% | -2% |

**Funnel: Search → Result Click**
1. Search initiated: 100%
2. Results viewed: 92%
3. Result clicked: 68%`,
      required: false,
      multiline: true,
    },
    {
      key: 'existingDocs',
      label: 'Existing Documentation',
      placeholder: `Links or content from related docs, previous PRDs...

**Related Documentation**
- Search Architecture Doc (Confluence)
- Search Relevance Algorithm Spec
- Previous Search Improvements PRD (Q2 2025)`,
      required: false,
      multiline: true,
    },
    {
      key: 'technicalContext',
      label: 'Technical Context',
      placeholder: `Architecture notes, constraints, dependencies...

**Technical Context**
- Current search: Elasticsearch 7.x
- Index size: 2.3M documents
- Avg query time: 120ms (p50), 450ms (p95)
- Filter support: Basic (project only)`,
      required: false,
      multiline: true,
    },
  ],

  sprint_review: [
    {
      key: 'sprintName',
      label: 'Sprint Name',
      placeholder: 'Sprint 42',
      required: true,
      multiline: false,
    },
    {
      key: 'sprintStart',
      label: 'Sprint Start Date',
      placeholder: '2025-12-16',
      required: false,
      multiline: false,
    },
    {
      key: 'sprintEnd',
      label: 'Sprint End Date',
      placeholder: '2025-12-29',
      required: false,
      multiline: false,
    },
    {
      key: 'teamName',
      label: 'Team Name',
      placeholder: 'Search Team',
      required: false,
      multiline: false,
    },
    {
      key: 'completedStories',
      label: 'Completed Stories',
      placeholder: `Paste completed issues from the sprint...

**Sprint 42 Status (Dec 16-29)**

| Issue | Title | Status | Points |
|-------|-------|--------|--------|
| ACME-342 | Search date filters | Done | 5 |
| ACME-343 | Search ranking improvements | Done | 8 |
| ACME-350 | P1: Search crash on special chars | Done | - |

**Recent Activity:**
- ACME-350 resolved (P1 bug)
- ACME-342 completed
- 3 new bugs triaged`,
      required: true,
      multiline: true,
    },
    {
      key: 'sprintMetrics',
      label: 'Sprint Metrics',
      placeholder: `Committed vs completed points, velocity...

**Sprint 42 Metrics**
- Committed: 19 points
- Completed: 16 points (84%)
- Stories: 7/8 completed
- Bugs resolved: 5 (including 1 P1)
- Carryover: 3 points (ACME-344)`,
      required: true,
      multiline: true,
    },
    {
      key: 'blockers',
      label: 'Blockers & Issues',
      placeholder: `Any blockers or issues encountered...

**Blockers & Issues**
1. P1 Bug ACME-350 (search crash) - Resolved Dec 23
2. Globex Corp escalation - Resolved Dec 22
3. Search ranking complexity - Caused 2-day delay`,
      required: false,
      multiline: true,
    },
    {
      key: 'customerFeedback',
      label: 'Customer Feedback',
      placeholder: `Feedback on shipped features...

**Customer Feedback This Sprint**
> "The search filters are exactly what we needed" - Globex Corp (preview)
> "Finally! Date filters will save us hours" - Community member`,
      required: false,
      multiline: true,
    },
  ],

  prototype_generation: [
    {
      key: 'prdContent',
      label: 'PRD Content',
      placeholder: `Paste the full PRD or relevant sections...

# PRD: Search Filters

## 1. Overview

### Problem Statement
Users cannot efficiently find content because search results lack filtering capabilities.

### Goals
| Goal | Metric | Target |
|------|--------|--------|
| Reduce time to find content | Avg. search-to-click time | -30% |

## 2. User Stories

1. **As a PM**, I want to filter search results by date range
   - Acceptance: Date presets (7d, 30d, 90d) and custom range picker
   
2. **As a PM**, I want to filter by content type
   - Acceptance: Multi-select content type filter

## 3. Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| F1 | Date range filter with presets | P0 |
| F2 | Content type filter | P0 |
| F3 | Clear all filters button | P0 |`,
      required: true,
      multiline: true,
      hint: 'Include user stories and requirements for best results',
    },
    {
      key: 'designSystem',
      label: 'Design System Guidelines',
      placeholder: `Colors, fonts, component library notes...

**Design System Guidelines**
- Use shadcn/ui components (Select, Button, Popover, Calendar)
- Colors: cobalt-600 for primary actions, muted for secondary
- Spacing: gap-3 between filter controls
- Typography: text-sm for filter labels
- Icons: Lucide React (CalendarIcon, X for clear)`,
      required: false,
      multiline: true,
    },
    {
      key: 'focusAreas',
      label: 'Focus Areas',
      placeholder: `What aspects of the UI to focus on...

**Focus Areas for Prototype**
1. Filter bar layout and interaction
2. Date range selection (presets + custom)
3. Content type multi-select
4. Clear filters functionality
5. Results count with active filter state`,
      required: false,
      multiline: true,
    },
  ],

  release_notes: [
    {
      key: 'releaseVersion',
      label: 'Release Version',
      placeholder: 'v2.4.0',
      required: true,
      multiline: false,
    },
    {
      key: 'releaseDate',
      label: 'Release Date',
      placeholder: '2026-01-10',
      required: false,
      multiline: false,
    },
    {
      key: 'completedIssues',
      label: 'Completed Issues',
      placeholder: `Paste completed issues for this release...

**Completed Issues for v2.4.0**

| Issue | Type | Title | Description |
|-------|------|-------|-------------|
| ACME-342 | Feature | Search date filters | Filter results by date range |
| ACME-343 | Feature | Search content type filter | Filter by documents, projects |
| ACME-350 | Bug | Search crash on special characters | Fixed crash |
| ACME-348 | Bug | Dashboard widget loading | Fixed widgets not loading |`,
      required: true,
      multiline: true,
    },
    {
      key: 'epicSummaries',
      label: 'Epic Summaries',
      placeholder: `High-level summaries of epics included...

**Epic: Search Improvements (ACME-100)**
This release completes the first phase of search improvements, adding filtering capabilities that customers have requested for months.

Key outcomes:
- 89 customer votes addressed
- 3 enterprise expansion blockers removed
- Foundation for future AI search features`,
      required: false,
      multiline: true,
    },
    {
      key: 'relatedPrds',
      label: 'Related PRDs',
      placeholder: `Links or summaries of related PRDs...

**Related PRD: Search Filters**
- Goal: Reduce search-to-click time by 30%
- User stories: Date filter, content type filter, combined filters
- Success metrics: Filter adoption rate, search satisfaction score`,
      required: false,
      multiline: true,
    },
    {
      key: 'releaseNotesTemplate',
      label: 'Release Notes Template',
      placeholder: `Custom template or format requirements...

**Standard Release Notes Format**
1. Highlights (2-3 key items)
2. New Features (with benefit statements)
3. Improvements (grouped by area)
4. Bug Fixes (customer-facing only)
5. Coming Soon (optional preview)`,
      required: false,
      multiline: true,
    },
  ],

  deck_content: [
    {
      key: 'topic',
      label: 'Presentation Topic',
      placeholder: 'Q4 Product Update: Search Improvements',
      required: true,
      multiline: false,
      hint: 'What is this presentation about?',
    },
    {
      key: 'audienceType',
      label: 'Audience Type',
      placeholder: 'exec, customer, team, or stakeholder',
      required: true,
      multiline: false,
      hint: 'Who will you be presenting to? (exec, customer, team, stakeholder)',
    },
    {
      key: 'purpose',
      label: 'Purpose',
      placeholder: 'Quarterly business review with leadership',
      required: false,
      multiline: false,
      hint: 'What is the goal of this presentation?',
    },
    {
      key: 'duration',
      label: 'Duration (minutes)',
      placeholder: '15',
      required: false,
      multiline: false,
      hint: 'Approximate presentation length in minutes',
    },
    {
      key: 'keyDataPoints',
      label: 'Key Data Points',
      placeholder: `Paste key metrics and data...

**Key Metrics**
- Search filters shipped 2 weeks ahead of schedule
- 40% reduction in search-to-click time
- 45% filter adoption rate in first week
- NPS for search improved from 3.2 to 4.1

**Sprint Performance**
- Velocity: 16/19 points completed (84%)
- P1 bug resolved in 24 hours`,
      required: true,
      multiline: true,
      hint: 'Include metrics, KPIs, and quantitative data',
    },
    {
      key: 'supportingEvidence',
      label: 'Supporting Evidence',
      placeholder: `Paste customer quotes, competitive context...

**Customer Evidence**
- "This changes everything for our team" - Globex Corp
- "Finally, search that works" - Initech
- 89 community votes addressed

**Competitive Context**
- Notion launched AI search Dec 22
- We're now at feature parity on filters`,
      required: false,
      multiline: true,
      hint: 'Customer quotes, competitive research, market context',
    },
    {
      key: 'relatedArtifacts',
      label: 'Related Artifacts',
      placeholder: `Reference previous pmkit outputs...

**Related pmkit Artifacts**
- VoC Report (Dec 15): Search was #1 pain point
- Competitor Report (Dec 20): Notion AI search analysis
- PRD: Search Filters (Approved Nov 15)`,
      required: false,
      multiline: true,
      hint: 'Reference VoC reports, PRDs, competitor research',
    },
    {
      key: 'requirements',
      label: 'Specific Requirements',
      placeholder: `Any specific requirements for this deck...

**Presentation Requirements**
- Focus on business impact, not technical details
- Include clear ask: AI search resourcing for Q1
- Prepare for questions about Notion competition`,
      required: false,
      multiline: true,
      hint: 'Special requirements, asks, or constraints',
    },
  ],
};

// Job type metadata for the UI
export const JOB_TYPE_INFO: Record<
  JobType,
  {
    name: string;
    description: string;
    icon: string;
  }
> = {
  daily_brief: {
    name: 'Daily Brief',
    description: 'Synthesize overnight activity into an actionable morning brief',
    icon: 'FileText',
  },
  meeting_prep: {
    name: 'Meeting Prep',
    description: 'Prepare for customer meetings with context and talking points',
    icon: 'Users',
  },
  voc_clustering: {
    name: 'VoC Clustering',
    description: 'Cluster customer feedback into actionable themes',
    icon: 'BarChart3',
  },
  competitor_research: {
    name: 'Competitor Research',
    description: 'Track competitor product changes and releases',
    icon: 'Target',
  },
  roadmap_alignment: {
    name: 'Roadmap Alignment',
    description: 'Generate alignment memo for roadmap decisions',
    icon: 'GitBranch',
  },
  prd_draft: {
    name: 'PRD Draft',
    description: 'Draft a PRD from customer evidence and context',
    icon: 'FileText',
  },
  sprint_review: {
    name: 'Sprint Review',
    description: 'Generate sprint review pack with metrics and highlights',
    icon: 'CheckCircle2',
  },
  prototype_generation: {
    name: 'PRD to Prototype',
    description: 'Generate interactive UI prototype from PRD',
    icon: 'Wand2',
  },
  release_notes: {
    name: 'Release Notes',
    description: 'Generate customer-facing release notes',
    icon: 'Megaphone',
  },
  deck_content: {
    name: 'Deck Content',
    description: 'Generate slide content tailored to any audience',
    icon: 'Presentation',
  },
};
