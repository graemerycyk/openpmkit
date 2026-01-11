# pmkit Mock / Demo Data Reference

> Complete reference of all test, mock, and demo data used in pmkit for development, testing, and demos.

---

## Table of Contents

- [Demo Tenant & Users](#demo-tenant--users)
- [Demo Arcs (Guided Scenarios)](#demo-arcs-guided-scenarios)
- [Jira Data](#jira-data)
- [Confluence Data](#confluence-data)
- [Slack Data](#slack-data)
- [Gong Data](#gong-data)
- [Zendesk Data](#zendesk-data)
- [Analytics Data](#analytics-data)
- [Competitor Data](#competitor-data)
- [Community Data](#community-data)
- [pmkit Artifacts](#pmkit-artifacts)

---

## Demo Tenant & Users

### Tenant

| Field | Value |
|-------|-------|
| ID | `demo-tenant-001` |
| Name | Acme SaaS |
| Slug | `acme-saas` |
| Timezone | America/Los_Angeles |
| Week Starts | Monday |
| Sprint Duration | 14 days |
| Product Name | Acme Platform |

### Users

| ID | Name | Email | Role |
|----|------|-------|------|
| `user-demo-pm` | Sarah Chen | sarah.chen@acme.io | pm |
| `user-demo-admin` | Marcus Johnson | marcus.johnson@acme.io | admin |
| `user-demo-viewer` | Alex Rivera | alex.rivera@acme.io | viewer |
| `user-demo-guest` | Demo Guest | guest@demo.pmkit.io | guest |

---

## Demo Arcs (Guided Scenarios)

### 1. Daily Brief
**Description**: Generate a morning brief that synthesizes overnight activity from Slack, Jira, support tickets, and community.

| Step | Title | Description |
|------|-------|-------------|
| 1 | Gather Slack signals | Pull messages from product channels with high engagement |
| 2 | Check Jira updates | Review sprint progress and blockers |
| 3 | Synthesize brief | Generate the daily brief artifact |

### 2. Meeting Prep Pack
**Description**: Prepare for an upcoming customer meeting with context from CRM, recent calls, and support history.

| Step | Title | Description |
|------|-------|-------------|
| 1 | Pull Gong call history | Get recent call transcripts and insights |
| 2 | Check support tickets | Review open and recent tickets for the account |
| 3 | Generate prep pack | Create the meeting preparation document |

### 3. Voice of Customer Clustering
**Description**: Cluster customer feedback from support, community, and calls into actionable themes.

| Step | Title | Description |
|------|-------|-------------|
| 1 | Collect feedback sources | Gather data from Zendesk, Gong, and Community |
| 2 | Extract themes | Identify recurring patterns and pain points |
| 3 | Generate VoC report | Create the themed VoC report with evidence |

### 4. Competitor Research Report
**Description**: Track competitor product changes and releases with strategic implications.

| Step | Title | Description |
|------|-------|-------------|
| 1 | Fetch competitor updates | Get recent changes from competitor tracking |
| 2 | Analyze implications | Assess strategic impact of changes |
| 3 | Generate research report | Create the competitor research document |

### 5. Roadmap Alignment Memo
**Description**: Create an alignment memo for a roadmap decision with options, trade-offs, and recommendations.

| Step | Title | Description |
|------|-------|-------------|
| 1 | Gather context | Pull relevant Jira epics, VoC themes, and analytics |
| 2 | Generate options | Create 2-3 strategic options with trade-offs |
| 3 | Create alignment memo | Generate the executive-ready memo |

### 6. PRD Draft
**Description**: Draft a PRD from customer evidence, existing specs, and roadmap context.

| Step | Title | Description |
|------|-------|-------------|
| 1 | Collect evidence | Gather VoC themes, feature requests, and analytics |
| 2 | Review existing specs | Check Confluence for related documentation |
| 3 | Generate PRD draft | Create the PRD with evidence and open questions |

---

## Jira Data

### Sprints

| ID | Name | State | Start Date | End Date | Goal |
|----|------|-------|------------|----------|------|
| `sprint-42` | Sprint 42 | active | 2025-12-16 | 2025-12-30 | Complete search improvements and fix critical escalations |
| `sprint-41` | Sprint 41 | closed | 2025-12-02 | 2025-12-15 | Launch dashboard v2 and onboarding flow improvements |
| `sprint-43` | Sprint 43 | future | 2025-12-30 | 2026-01-13 | API v3 beta and performance optimizations |

### Epics

| Key | Summary | Status | Priority | Labels |
|-----|---------|--------|----------|--------|
| ACME-100 | Search Experience Improvements | In Progress | High | search, ux, q4-priority |
| ACME-150 | Enterprise SSO & Governance | To Do | High | enterprise, security, q1-2026 |
| ACME-200 | API v3 Redesign | In Progress | Medium | api, developer-experience |

### Stories (Current Sprint)

| Key | Summary | Status | Priority | Points | Sprint |
|-----|---------|--------|----------|--------|--------|
| ACME-342 | Add search filters for date range and content type | In Progress | High | 5 | Sprint 42 |
| ACME-343 | Improve search result ranking algorithm | In Review | High | 8 | Sprint 42 |
| ACME-344 | Add "no results" helpful suggestions | To Do | Medium | 3 | Sprint 42 |

### Bugs

| Key | Summary | Status | Priority | Sprint |
|-----|---------|--------|----------|--------|
| ACME-350 | Search crashes on special characters in query | In Progress | Highest | Sprint 42 |
| ACME-351 | Dashboard widgets not loading for some users | To Do | High | Sprint 42 |

### Tasks

| Key | Summary | Status | Priority | Sprint |
|-----|---------|--------|----------|--------|
| ACME-360 | Update search documentation for new filters | To Do | Low | Sprint 42 |

### Backlog

| Key | Summary | Status | Priority | Points |
|-----|---------|--------|----------|--------|
| ACME-400 | Implement saved searches | Backlog | Medium | 5 |
| ACME-401 | Add search analytics dashboard | Backlog | Low | 8 |

---

## Confluence Data

### Spaces

| Key | Name | Description |
|-----|------|-------------|
| PROD | Product | Product documentation, PRDs, and roadmap |
| ENG | Engineering | Technical documentation and architecture |
| SUPPORT | Support | Support playbooks and escalation procedures |

### Pages

#### Search Improvements PRD (`page-001`)
- **Space**: PROD
- **Labels**: prd, search, q4-2025
- **Author**: sarah.chen@acme.io

**Content Summary**:
- Problem: Poor relevance ranking, no filtering, unhelpful "no results"
- Goals: Improve satisfaction from 3.2 to 4.0+, reduce no-results rate from 15% to 8%
- Evidence: 47 support tickets, 3 enterprise blockers, 89-vote feature request

#### Q4 2025 Roadmap (`page-002`)
- **Space**: PROD
- **Labels**: roadmap, q4-2025, planning

**Content Summary**:
- Now: Search improvements, Dashboard v2
- Next: API v3 Beta, Enterprise SSO prep
- Later: Full SSO, Audit logging, Mobile app v2

#### Search Architecture (`page-003`)
- **Space**: ENG
- **Labels**: architecture, search, technical

**Content Summary**:
- Current: Elasticsearch 7.x, BM25 relevance
- Proposed: Field boosting, recency decay, Redis caching

#### Enterprise Customer Escalation Playbook (`page-004`)
- **Space**: SUPPORT
- **Labels**: playbook, support, escalation

**Content Summary**:
- When to escalate criteria
- Escalation process steps
- Communication templates

#### Voice of Customer - Q4 2025 Themes (`page-005`)
- **Space**: PROD
- **Labels**: voc, research, q4-2025

**Content Summary**:
- Top themes: Search (35%), Onboarding (22%), Integrations (18%), Performance (15%)
- Data sources: 150+ data points from support, Gong, community, NPS

---

## Slack Data

### Channels

| ID | Name | Description | Members | Private |
|----|------|-------------|---------|---------|
| C001 | product | Product team discussions | 45 | No |
| C002 | eng-backend | Backend engineering team | 28 | No |
| C003 | customer-feedback | Customer feedback and insights | 62 | No |
| C004 | support-escalations | Escalated support issues | 15 | Yes |
| C005 | general | General company discussions | 150 | No |

### Key Messages

#### #product Channel

| From | Message | Reactions |
|------|---------|-----------|
| Sarah Chen | Just got off a call with Globex Corp - they're really pushing for better search. Said it's blocking their expansion from 50 to 200 seats. | 👀 5, +1 3 |
| Marcus Johnson | Agreed. I've been tracking this - we have 47 support tickets about search in Q4 alone. | ✅ 2 |
| Alex Rivera | The community feature request for search filters has 89 votes now. | 📈 2 |
| Sarah Chen | Quick update on Sprint 42: Search ranking improvements (ACME-343) is in review, filters (ACME-342) is 70% done. | 🚀 4 |

#### #eng-backend Channel

| From | Message | Reactions |
|------|---------|-----------|
| Dev Team | 🚨 Found a critical bug in search - special characters in queries cause 500 errors. Created ACME-350 as P1. | 👀 8, 🙏 3 |
| Dev Team | Update on ACME-350: Root cause identified - missing input sanitization. Fix is ready for review. | 🎉 5 |

#### #customer-feedback Channel

| From | Message | Reactions |
|------|---------|-----------|
| Support Team | NPS response from Initech: "Love the product but search is painful..." Score: 7 | 📝 2 |
| Support Team | Gong insight from Umbrella Corp call: Customer mentioned they evaluated 3 competitors and chose us, but search was the main concern. | ⚠️ 3, 👀 4 |

#### #support-escalations Channel

| From | Message | Reactions |
|------|---------|-----------|
| Support Team | 🔴 ESCALATION: Globex Corp (Enterprise) - Dashboard widgets not loading for 12 users. | 🚨 2 |
| Dev Team | Found it - Redis connection pool exhaustion during peak load. Temporary fix deployed. | ✅ 3 |

---

## Gong Data

### Calls

| ID | Title | Account | Duration | Sentiment | Topics |
|----|-------|---------|----------|-----------|--------|
| call-001 | Globex Corp - Quarterly Business Review | Globex Corp | 45 min | Mixed | search, expansion, roadmap |
| call-002 | Initech - Product Demo | Initech | 60 min | Positive | demo, pricing, integrations |
| call-003 | Umbrella Corp - Technical Deep Dive | Umbrella Corp | 90 min | Positive | api, security, architecture, search |
| call-004 | Weyland Industries - Escalation Follow-up | Weyland Industries | 30 min | Negative | escalation, performance, sla |

### Key Transcript Segments

#### Globex Corp QBR
> **John Smith (External)**: "Let me be direct - search is our biggest pain point right now. Our team spends 20-30 minutes a day just trying to find documents."

> **Emily Davis (External)**: "We were planning to expand from 50 to 200 seats in Q1, but honestly, we've been hesitant because of the search issues."

> **John Smith (External)**: "Specifically, we need date filters - being able to search within the last week or month would be huge."

#### Umbrella Corp Technical Deep Dive
> **Alice Wong (External)**: "We evaluated three competitors before coming to you. Your API is the cleanest, but we're concerned about search."

#### Weyland Industries Escalation
> **David Weyland (External)**: "I'm going to be honest - we're frustrated. This is the third performance issue in two months. We're paying enterprise rates and expecting enterprise reliability."

### Insights

| Call | Type | Insight | Speaker |
|------|------|---------|---------|
| Globex | Pain Point | Search causing 20-30 min lost productivity/day/user | John Smith |
| Globex | Feature Request | Date range and content type filters | John Smith |
| Globex | Objection | Expansion blocked by search issues | Emily Davis |
| Initech | Positive Feedback | Slack integration is key differentiator | Bill Lumbergh |
| Umbrella | Competitor Mention | Evaluated 3 competitors, chose us for API | Alice Wong |
| Weyland | Pain Point | Third performance issue in two months | David Weyland |

---

## Zendesk Data

### Tickets

| ID | Subject | Status | Priority | Requester | Tags |
|----|---------|--------|----------|-----------|------|
| ticket-001 | Search not finding recently created documents | Open | High | john.smith@globex.com | search, indexing, enterprise |
| ticket-002 | Search returns too many irrelevant results | Pending | Normal | emily.davis@globex.com | search, relevance |
| ticket-003 | Need date filters in search | Open | Normal | bill.lumbergh@initech.com | search, feature-request, filters |
| ticket-004 | Dashboard widgets not loading | Open | Urgent | john.smith@globex.com | dashboard, performance, escalated |
| ticket-005 | Search crashes with special characters | Solved | High | alice.wong@umbrella.com | search, bug, critical |
| ticket-006 | API rate limiting too aggressive | Solved | High | bob.chen@umbrella.com | api, rate-limiting |
| ticket-007 | Onboarding flow confusing for new users | Open | Normal | emily.davis@globex.com | onboarding, ux |
| ticket-008 | Slack integration not syncing | Pending | High | david@weyland.com | slack, integration, sync |
| ticket-009 | How to export search results? | Solved | Low | bill.lumbergh@initech.com | search, export, how-to |
| ticket-010 | Performance issues during peak hours | Open | High | david@weyland.com | performance, peak-hours, enterprise |

### Sample Comments

**Ticket 001** (Search indexing):
- Support: "Can you tell me when exactly you created the document?"
- Customer: "I created it yesterday at around 2pm. Title is 'Q4 2025 Planning Document'."
- Internal: "Checking with engineering - there may be an indexing delay issue."

**Ticket 004** (Dashboard widgets):
- Support: "We're aware of this issue and our engineering team is actively investigating."
- Dev Team: "We've identified the root cause - a Redis connection pool issue during peak load."

---

## Analytics Data

### Search Queries (Weekly)

| Query | Count | CTR | Avg Position | No Results Rate |
|-------|-------|-----|--------------|-----------------|
| project status | 1,250 | 72% | 2.3 | 5% |
| meeting notes | 980 | 45% | 4.1 | 22% |
| Q4 report | 750 | 68% | 3.2 | 8% |
| api documentation | 620 | 82% | 1.5 | 3% |
| onboarding guide | 540 | 55% | 5.2 | 35% |
| integrations setup | 480 | 62% | 2.8 | 12% |
| export data | 420 | 38% | 6.5 | 42% |
| team permissions | 380 | 71% | 2.1 | 6% |
| billing invoice | 320 | 88% | 1.2 | 2% |
| slack integration | 290 | 75% | 1.8 | 4% |

### High No-Results Queries

| Query | Count | No Results Rate |
|-------|-------|-----------------|
| kanban board | 180 | 95% |
| time tracking | 150 | 92% |
| gantt chart | 120 | 88% |

### Feature Usage (Weekly)

| Feature | Unique Users | Total Events | Adoption | Trend |
|---------|--------------|--------------|----------|-------|
| Dashboard | 8,500 | 45,000 | 85% | Stable |
| Search | 7,200 | 28,000 | 72% | ↓ Down |
| Projects | 6,800 | 35,000 | 68% | ↑ Up |
| Integrations | 3,200 | 8,500 | 32% | ↑ Up |
| API | 1,800 | 125,000 | 18% | ↑ Up |
| Reports | 2,400 | 4,800 | 24% | Stable |
| Notifications | 5,600 | 22,000 | 56% | Stable |
| Comments | 4,200 | 15,000 | 42% | ↑ Up |
| Custom Fields | 800 | 1,200 | 8% | Stable |
| Webhooks | 450 | 2,800 | 4.5% | ↑ Up |
| Templates | 1,200 | 1,800 | 12% | ↓ Down |

### User Journeys

**Journey 1: Globex Corp User**
- Login → Dashboard view → Search "Q4 planning" (23 results) → Search "Q4 planning document" (8 results) → Document view
- Total sessions: 145
- First seen: 2024-03-15

**Journey 2: Initech New User (Abandoned)**
- Signup → Onboarding started → Step 1 ✓ → Step 2 ✓ → Step 3 ✗ → Session end (abandoned)
- Total sessions: 3
- First seen: 2025-12-20

---

## Competitor Data

### Competitors

| ID | Name | Website | Category |
|----|------|---------|----------|
| comp-001 | Notion | notion.so | Productivity |
| comp-002 | Coda | coda.io | Productivity |
| comp-003 | Monday.com | monday.com | Project Management |
| comp-004 | Asana | asana.com | Project Management |
| comp-005 | ClickUp | clickup.com | Productivity |

### Recent Changes

| Competitor | Type | Title | Significance | Date |
|------------|------|-------|--------------|------|
| Notion | Feature | AI-powered search launch | 🔴 High | 2025-12-27 |
| Coda | Pricing | 20% enterprise price reduction | 🔴 High | 2025-12-25 |
| Monday.com | Integration | Native Slack integration | 🟡 Medium | 2025-12-22 |
| Asana | Product Launch | AI Goals feature | 🟡 Medium | 2025-12-20 |
| ClickUp | Funding | $400M Series D at $4B valuation | 🔴 High | 2025-12-18 |
| Notion | Messaging | Repositioned as "AI-first workspace" | 🟡 Medium | 2025-12-15 |
| Monday.com | Leadership | New CPO from Figma | 🟢 Low | 2025-12-10 |

### Feature Comparison

| Feature | Notion | Coda | Monday.com |
|---------|--------|------|------------|
| AI-powered search | ✅ | ❌ | ❌ |
| Search filters | ✅ | ✅ | ✅ |
| Slack integration | ✅ | ✅ | ✅ (New) |
| SAML SSO | ✅ | ✅ | ✅ |
| Audit logs | ✅ | ❌ (Q1 2026) | ✅ |

---

## Community Data

### Posts

| ID | Title | Category | Votes | Replies | Views | Resolved |
|----|-------|----------|-------|---------|-------|----------|
| post-001 | Search is really frustrating - any tips? | Help | 34 | 12 | 890 | No |
| post-002 | Workaround for search using tags | Tips & Tricks | 67 | 23 | 1,450 | Featured |
| post-003 | Slack integration stopped working after update | Bug Reports | 23 | 8 | 340 | Yes |
| post-004 | Best practices for onboarding new team members? | Best Practices | 45 | 18 | 780 | No |
| post-005 | API rate limits are too restrictive | API & Developers | 28 | 6 | 420 | Yes |

### Feature Requests

| ID | Title | Category | Votes | Status |
|----|-------|----------|-------|--------|
| fr-001 | Add date and content type filters to search | Search | 89 | Planned |
| fr-002 | Saved searches / search bookmarks | Search | 56 | Under Review |
| fr-003 | Better Jira integration - two-way sync | Integrations | 72 | Planned |
| fr-004 | Dark mode | UI/UX | 145 | In Progress |
| fr-005 | API webhook support | API & Developers | 48 | Completed |
| fr-006 | Gantt chart view for projects | Features | 67 | Open |
| fr-007 | Time tracking integration | Integrations | 38 | Open |
| fr-008 | SAML SSO for enterprise | Enterprise | 95 | Planned |

### Staff Replies

> **acme_product** (on search frustration): "Thanks for the feedback. We're actively working on search improvements - expect a major update in the next few weeks with better relevance and filtering."

> **acme_engineering** (on Slack bug): "We identified the issue and deployed a fix. Please try reconnecting your Slack integration."

---

## pmkit Artifacts

### PRD: Search Filters (`artifact-prd-001`)
- **Created**: January 8, 2026
- **Status**: Approved
- **Epic**: ACME-100

**Summary**:
- Problem: Users cannot efficiently find content due to lack of filters
- Goals: -30% search-to-click time, 4.0+ satisfaction score, >40% filter usage
- Requirements: Date range filter (P0), Content type filter (P0), Project filter (P1)

### PRD: Enterprise SSO (`artifact-prd-002`)
- **Created**: January 6, 2026
- **Status**: Draft
- **Epic**: ACME-200

**Summary**:
- Problem: Enterprise customers blocked without corporate IdP support
- Goals: Close 3 deals ($450K), <1 day onboarding, >80% SSO adoption
- Requirements: SAML 2.0 (P0), OIDC (P0), JIT provisioning (P1)

### VoC Report - Q4 2025 (`artifact-voc-001`)
- **Created**: January 5, 2026
- **Period**: October - December 2025
- **Sources**: 156 tickets, 89 calls, 234 posts

**Top Themes**:
| Theme | Mentions | Trend |
|-------|----------|-------|
| Search Frustration | 52 | ↑ 15% |
| Onboarding Complexity | 33 | Stable |
| Integration Gaps | 27 | ↓ 8% |
| Performance Issues | 22 | ↑ 25% |

### Daily Brief - January 9, 2026 (`artifact-brief-001`)
- **Created**: January 9, 2026

**TL;DR**: Search filters shipped with 34% adoption in 48 hours. P1 bug resolved. Globex expansion discussion scheduled.

### Competitor Research - January 2026 (`artifact-competitor-001`)
- **Created**: January 7, 2026

**Key Changes**:
- Notion: AI-powered search (High impact)
- Coda: 20% price cut (High impact)
- Monday.com: Native Slack integration (Medium impact)

---

## Data Files Location

All mock data is located in `packages/mock-tenant/src/data/`:

| File | Contents |
|------|----------|
| `jira.ts` | Sprints, issues (epics, stories, bugs, tasks) |
| `confluence.ts` | Spaces, pages |
| `slack.ts` | Channels, messages |
| `gong.ts` | Calls, transcripts, insights |
| `zendesk.ts` | Tickets, comments |
| `analytics.ts` | Events, search queries, feature usage, user journeys |
| `competitor.ts` | Competitors, changes, feature comparisons |
| `community.ts` | Posts, replies, feature requests |
| `pmkit.ts` | Generated artifacts (PRDs, briefs, reports) |

## Usage

```typescript
import { 
  initializeMockData, 
  createMockMCPClient,
  DEMO_TENANT,
  DEMO_USERS,
  DEMO_ARCS,
  jiraData,
  slackData,
  // ... other data exports
} from '@pmkit/mock-tenant';

// Initialize all mock data
initializeMockData();

// Create a mock MCP client for testing
const client = createMockMCPClient();

// Call tools
const result = await client.callTool('jira', 'search_issues', { 
  jql: 'project = ACME' 
});
```

---

*Generated from pmkit mock-tenant package • Last updated: January 2026*
