import { NextRequest, NextResponse } from 'next/server';
import { getLLMService, type JobType } from '@pmkit/core';
import { executeJob, PROMPT_TEMPLATES, type PromptContext } from '@pmkit/prompts';

// Mock data for demo - simulates what real connectors would return
const MOCK_CONNECTOR_DATA = {
  slack: {
    messages: `
- #product-updates: "Search filters shipping next week! 🎉" - Sarah Chen
- #customer-success: "Globex Corp escalation resolved - dashboard loading fixed" - Mike Johnson  
- #engineering: "ACME-350 fix deployed - special character crash resolved" - Alex Kim
- #product-feedback: "3 new feature requests for search improvements this week"
- DM from CEO: "Great progress on search. Let's discuss AI roadmap in our 1:1"
    `.trim(),
  },
  jira: {
    updates: `
**Sprint 42 Status (Dec 16-29)**

| Issue | Title | Status | Points |
|-------|-------|--------|--------|
| ACME-342 | Search date filters | In Progress (70%) | 5 |
| ACME-343 | Search ranking improvements | In Review | 8 |
| ACME-344 | No results UX redesign | To Do | 3 |
| ACME-350 | P1: Search crash on special chars | Done | - |

**Blockers:**
- ACME-343 waiting on performance review
- ACME-344 deprioritized for P1 bug fix

**Recent Activity:**
- ACME-350 resolved (P1 bug)
- ACME-342 at 70% completion
- 3 new bugs triaged
    `.trim(),
    epics: `
| Epic | Title | Progress | Target |
|------|-------|----------|--------|
| ACME-100 | Search Improvements | 65% | Q4 2025 |
| ACME-200 | Enterprise SSO | 0% | Q1 2026 |
| ACME-300 | AI Features | Planning | Q2 2026 |
    `.trim(),
  },
  zendesk: {
    tickets: `
**Open Tickets (Last 7 Days)**

| Ticket | Customer | Priority | Subject | Age |
|--------|----------|----------|---------|-----|
| ZD-1234 | Globex Corp | High | Dashboard widgets not loading | 3d |
| ZD-1235 | Initech | Normal | Search relevance issues | 5d |
| ZD-1236 | Acme Inc | Low | Feature request: date filters | 7d |

**Themes:**
- Search-related: 47 tickets (35%)
- Performance: 22 tickets (16%)
- Integration: 18 tickets (13%)

**Notable:**
> "We're ready to expand from 50 to 200 seats once search is fixed" - Globex Corp
    `.trim(),
  },
  gong: {
    calls: `
**Recent Calls (Last 14 Days)**

1. **Globex Corp QBR** (Dec 20, 45 min)
   - Attendees: John Smith (VP Product), Emily Davis (PM)
   - Topics: Search frustrations, expansion plans, roadmap review
   - Key Quote: "Search is our biggest pain point - team spends 20-30 min/day searching"
   - Next Steps: Follow up on search improvements, schedule expansion discussion

2. **Initech Demo** (Dec 18, 30 min)
   - Attendees: Bob Wilson (Director)
   - Topics: Initial demo, pricing discussion
   - Sentiment: Positive, comparing to Notion
   - Next Steps: Send proposal, schedule technical review

3. **Acme Inc Support Call** (Dec 15, 20 min)
   - Attendees: Jane Doe (Admin)
   - Topics: Integration setup, Slack sync issues
   - Resolution: Provided workaround, escalated to engineering
    `.trim(),
    insights: `
**Pain Points (from 32 calls)**
1. Search frustration (mentioned in 12 calls, 38%)
2. Onboarding complexity (8 calls, 25%)
3. Integration reliability (6 calls, 19%)
4. Performance issues (4 calls, 13%)

**Feature Requests**
1. Date filters for search (89 votes)
2. Saved searches (45 votes)
3. Better Slack integration (38 votes)

**Competitive Mentions**
- Notion: 8 mentions (positive sentiment toward their search)
- Coda: 3 mentions (pricing comparison)
- Monday.com: 2 mentions (integration comparison)
    `.trim(),
  },
  discourse: {
    posts: `
**Community Activity (Last 7 Days)**

**Top Discussions:**
1. "Search improvements coming soon?" - 45 replies, 89 upvotes
2. "Workaround for finding old content" - 23 replies
3. "Integration with Slack - best practices" - 18 replies

**Feature Requests:**
| Request | Votes | Status |
|---------|-------|--------|
| Date filters for search | 89 | In Progress |
| Saved searches | 45 | Planned |
| Better Slack sync | 38 | Under Review |
| AI-powered search | 34 | Considering |

**Sentiment:** Improving - positive response to search roadmap announcement
    `.trim(),
    featureRequests: `
1. **Date filters for search** (89 votes) - "I need to find content from last week, not 2 years ago"
2. **Saved searches** (45 votes) - "Let me save my common searches"
3. **Better Slack integration** (38 votes) - "Sync is unreliable"
4. **AI-powered search** (34 votes) - "Notion has this, why don't you?"
5. **Bulk actions** (28 votes) - "Need to update multiple items at once"
    `.trim(),
  },
  amplitude: {
    metrics: `
**Product Metrics (Last 30 Days)**

| Metric | Value | Change |
|--------|-------|--------|
| DAU | 12,450 | +8% |
| WAU | 34,200 | +5% |
| Search queries/day | 45,000 | +12% |
| Avg. search-to-click | 8.2s | -5% |
| No-results rate | 23% | -2% |

**Feature Usage:**
- Search: 89% of users
- Projects: 76% of users
- Integrations: 45% of users
- API: 12% of users

**Funnel: Search → Result Click**
1. Search initiated: 100%
2. Results viewed: 92%
3. Result clicked: 68%
4. Content engaged: 54%
    `.trim(),
    featureUsage: `
**Feature Adoption (Last 7 Days)**

| Feature | Users | Sessions | Trend |
|---------|-------|----------|-------|
| Search | 11,200 | 89,000 | ↑ 12% |
| Projects | 9,500 | 45,000 | → 0% |
| Comments | 7,800 | 23,000 | ↑ 5% |
| Integrations | 5,600 | 12,000 | ↓ 3% |
    `.trim(),
  },
  competitor: {
    changes: `
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
  - Slash commands for task creation

### ClickUp
- **$400M Series D announced** (Dec 20)
  - Valuation: $4B
  - Focus: AI and enterprise features
    `.trim(),
    featureComparison: `
| Feature | Us | Notion | Coda | Monday |
|---------|-----|--------|------|--------|
| AI Search | ❌ | ✅ | ❌ | ❌ |
| Search Filters | 🔜 | ✅ | ✅ | ✅ |
| SAML SSO | 🔜 | ✅ | ✅ | ✅ |
| Audit Logs | 🔜 | ✅ | ❌ | ✅ |
| Slack Integration | ⚠️ | ✅ | ✅ | ✅ |
| API | ✅ | ✅ | ✅ | ✅ |
| Mobile App | ✅ | ✅ | ✅ | ✅ |
    `.trim(),
  },
};

// Build context for each job type
function buildJobContext(jobType: JobType): PromptContext {
  const baseContext: PromptContext = {
    tenantName: 'Acme Corp',
    productName: 'Acme Platform',
    currentDate: new Date().toISOString().split('T')[0],
    userName: 'Demo PM',
  };

  switch (jobType) {
    case 'daily_brief':
      return {
        ...baseContext,
        slackMessages: MOCK_CONNECTOR_DATA.slack.messages,
        jiraUpdates: MOCK_CONNECTOR_DATA.jira.updates,
        supportTickets: MOCK_CONNECTOR_DATA.zendesk.tickets,
        communityActivity: MOCK_CONNECTOR_DATA.discourse.posts,
      };

    case 'meeting_prep':
      return {
        ...baseContext,
        accountName: 'Globex Corp',
        meetingType: 'QBR Follow-up',
        attendees: 'John Smith (VP Product), Emily Davis (PM)',
        meetingDate: new Date().toISOString().split('T')[0],
        gongCalls: MOCK_CONNECTOR_DATA.gong.calls,
        supportTickets: MOCK_CONNECTOR_DATA.zendesk.tickets,
        accountHealth: `
**Account Health: Globex Corp**
- Health Score: 72/100 (⚠️ At Risk)
- Contract: $48,000 ARR, 50 seats
- Renewal: March 2026
- NPS: 7 (Passive)
- Expansion Potential: 4x (200 seats)
        `.trim(),
      };

    case 'voc_clustering':
      return {
        ...baseContext,
        supportTickets: MOCK_CONNECTOR_DATA.zendesk.tickets,
        gongInsights: MOCK_CONNECTOR_DATA.gong.insights,
        communityFeedback: MOCK_CONNECTOR_DATA.discourse.featureRequests,
        npsVerbatims: `
**NPS Verbatims (Last 30 Days)**
- Score 9: "Love the product, just need better search"
- Score 8: "Great for our team, onboarding was rough"
- Score 7: "Good but Notion's search is better"
- Score 6: "Slack integration keeps breaking"
- Score 4: "Can't find anything, considering alternatives"
        `.trim(),
      };

    case 'competitor_research':
      return {
        ...baseContext,
        fromDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        competitorChanges: MOCK_CONNECTOR_DATA.competitor.changes,
        featureComparison: MOCK_CONNECTOR_DATA.competitor.featureComparison,
      };

    case 'roadmap_alignment':
      return {
        ...baseContext,
        decisionContext: `
**Decision Required**: Q1 2026 Priority - Search AI vs. Enterprise SSO

**Why Now**: 
- Q1 planning deadline is Jan 15
- Engineering capacity: 3 pods (12 engineers)
- Both initiatives require 1.5-2 pods

**Stakes**:
- Search AI: Addresses #1 pain point, competitive response to Notion
- Enterprise SSO: Unblocks $450K in enterprise deals
        `.trim(),
        vocThemes: MOCK_CONNECTOR_DATA.gong.insights,
        analyticsInsights: MOCK_CONNECTOR_DATA.amplitude.metrics,
        competitorContext: MOCK_CONNECTOR_DATA.competitor.changes,
        resourceConstraints: `
**Engineering Capacity Q1 2026**
- Total: 3 pods (12 engineers)
- Available: 2.5 pods (1 pod on maintenance)
- Search AI estimate: 2 pods, 10 weeks
- SSO estimate: 1.5 pods, 8 weeks
        `.trim(),
      };

    case 'prd_draft':
      return {
        ...baseContext,
        featureName: 'Search Filters',
        epicKey: 'ACME-100',
        customerEvidence: `
**Customer Evidence for Search Filters**

| Source | Count | Key Quote |
|--------|-------|-----------|
| Support tickets | 47 | "I spend more time searching than working" |
| Gong calls | 12 | "Date filters would be huge" |
| Community | 89 votes | "Filter by content type please" |
| NPS verbatims | 8 | "Search is my biggest frustration" |

**Expansion Blocked**: 3 enterprise accounts ($450K ARR) cite search as blocker
        `.trim(),
        analyticsSignals: MOCK_CONNECTOR_DATA.amplitude.metrics,
        existingDocs: `
**Related Documentation**
- Search Architecture Doc (Confluence)
- Search Relevance Algorithm Spec
- Previous Search Improvements PRD (Q2 2025)
        `.trim(),
        technicalContext: `
**Technical Context**
- Current search: Elasticsearch 7.x
- Index size: 2.3M documents
- Avg query time: 120ms (p50), 450ms (p95)
- Filter support: Basic (project only)
        `.trim(),
      };

    case 'sprint_review':
      return {
        ...baseContext,
        sprintName: 'Sprint 42',
        sprintStart: '2025-12-16',
        sprintEnd: '2025-12-29',
        teamName: 'Search Team',
        completedStories: MOCK_CONNECTOR_DATA.jira.updates,
        sprintMetrics: `
**Sprint 42 Metrics**
- Committed: 19 points
- Completed: 16 points (84%)
- Stories: 7/8 completed
- Bugs resolved: 5 (including 1 P1)
- Carryover: 3 points (ACME-344)
        `.trim(),
        blockers: `
**Blockers & Issues**
1. P1 Bug ACME-350 (search crash) - Resolved Dec 23
2. Globex Corp escalation - Resolved Dec 22
3. Search ranking complexity - Caused 2-day delay
        `.trim(),
        customerFeedback: `
**Customer Feedback This Sprint**
> "The search filters are exactly what we needed" - Globex Corp (preview)
> "Finally! Date filters will save us hours" - Community member
        `.trim(),
      };

    default:
      return baseContext;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobType } = body as { jobType: JobType };

    // Validate job type
    if (!PROMPT_TEMPLATES[jobType]) {
      return NextResponse.json(
        { error: `Invalid job type: ${jobType}` },
        { status: 400 }
      );
    }

    // Get LLM service (will use demo key for demo tenant)
    const llmService = getLLMService();

    // Build context with mock connector data
    const context = buildJobContext(jobType);

    // Execute the job with real LLM
    const result = await executeJob(
      llmService,
      'demo', // Demo tenant - uses OPENAI_API_KEY_DEMO with rate limiting
      jobType,
      context,
      {
        maxTokens: 4096,
        temperature: 0.7,
      }
    );

    return NextResponse.json({
      success: true,
      content: result.content,
      metadata: {
        model: result.model,
        usage: result.usage,
        latencyMs: result.latencyMs,
        estimatedCostUsd: result.estimatedCostUsd,
        isStub: result.isStub,
      },
    });
  } catch (error) {
    console.error('Demo job execution error:', error);
    
    // Check for rate limit error
    if (error instanceof Error && error.name === 'DemoRateLimitError') {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: error.message,
          isRateLimited: true,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to execute job', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check rate limit status
export async function GET() {
  try {
    const llmService = getLLMService();
    const status = await llmService.getDemoRateLimitStatus();
    const modelInfo = llmService.getModelForTenant('demo');

    return NextResponse.json({
      rateLimit: status,
      model: {
        id: modelInfo.id,
        name: modelInfo.name,
        description: modelInfo.description,
      },
      isUsingStubs: llmService.isUsingStubs(),
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
