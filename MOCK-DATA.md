# pmkit Mock / Demo Data Reference

> Complete reference of all test, mock, and demo data used in pmkit for development, testing, and demos.

---

## Table of Contents

- [Demo Tenant & Users](#demo-tenant--users)
- [Demo Arcs (Guided Scenarios)](#demo-arcs-guided-scenarios)
- [AI Crawlers](#ai-crawlers)
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

### 7. Sprint Review Pack
**Description**: Generate sprint review pack with completed work, metrics, demos, and stakeholder updates.

| Step | Title | Description |
|------|-------|-------------|
| 1 | Pull sprint data | Get completed stories, bugs, and velocity from Jira |
| 2 | Gather metrics | Pull feature usage and analytics data |
| 3 | Generate review pack | Create the sprint review document |

### 8. Prototype Generation
**Description**: Turn PRDs into interactive HTML prototypes for rapid user validation.

| Step | Title | Description |
|------|-------|-------------|
| 1 | Extract requirements | Parse user stories and acceptance criteria from PRD |
| 2 | Identify UI components | Determine key interface elements needed |
| 3 | Generate prototype | Create interactive HTML/CSS/JS prototype |

### 9. Release Notes
**Description**: Generate customer-facing release notes from completed Jira tickets.

| Step | Title | Description |
|------|-------|-------------|
| 1 | Pull completed issues | Get all tickets in the release version |
| 2 | Categorize changes | Group into features, improvements, fixes |
| 3 | Generate release notes | Create customer-friendly release notes |

### 10. Deck Content
**Description**: Generate slide content tailored for exec, customer, team, or stakeholder audiences.

| Step | Title | Description |
|------|-------|-------------|
| 1 | Gather context | Pull VoC reports, competitor research, sprint metrics from pmkit |
| 2 | Identify key data | Extract metrics, quotes, and supporting evidence |
| 3 | Generate deck content | Create structured slide content with speaker notes |

---

## AI Crawlers

### Social Crawler
**Description**: Monitor social platforms (Reddit, Hacker News, X, LinkedIn) for product mentions, competitor discussions, and sentiment.

| Platform | Keywords | Sample Results |
|----------|----------|----------------|
| Reddit | "acme platform", "search filters" | 12 posts, 45 comments, sentiment: 72% positive |
| Hacker News | "acme", "productivity tools" | 3 posts, 28 comments, sentiment: 65% positive |
| X/Twitter | "@acme", "#acmeplatform" | 89 mentions, sentiment: 68% positive |
| LinkedIn | "Acme SaaS", "Acme Platform" | 15 posts, sentiment: 81% positive |

### Web Search Crawler
**Description**: Search Google/Bing for competitor intelligence, industry news, and market research.

| Query Type | Sample Query | Results |
|------------|--------------|---------|
| Competitor pricing | "Notion pricing 2026" | Pricing page changes detected |
| Feature launches | "Coda AI features" | New AI search feature announced |
| Industry trends | "productivity software trends" | 15 relevant articles |

### News Crawler
**Description**: Monitor news sources for industry updates, competitor announcements, and press releases.

| Source Type | Sample Sources | Recent Items |
|-------------|----------------|--------------|
| Tech publications | TechCrunch, The Verge, Wired | 8 relevant articles |
| Press releases | PR Newswire, Business Wire | 3 competitor announcements |
| Industry blogs | Product Hunt, Hacker Noon | 12 product mentions |

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

## Design System Guidelines

Use these guidelines when generating prototypes or designing new features.

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#6366f1` (cobalt-600) | Primary buttons, links, focus states |
| `--primary-hover` | `#4f46e5` (cobalt-700) | Hover states |
| `--background` | `#ffffff` | Page backgrounds |
| `--foreground` | `#1e293b` | Primary text |
| `--muted` | `#f8fafc` | Secondary backgrounds, cards |
| `--muted-foreground` | `#64748b` | Secondary text, placeholders |
| `--border` | `#e2e8f0` | Borders, dividers |
| `--destructive` | `#ef4444` | Error states, delete actions |
| `--success` | `#22c55e` | Success states, confirmations |
| `--warning` | `#f59e0b` | Warning states, cautions |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Headings (h1-h6) | Space Grotesk | 24-36px | 600-700 |
| Body text | Geist Sans | 14-16px | 400 |
| Code/mono | Geist Mono | 13-14px | 400 |
| Labels | Geist Sans | 12-14px | 500 |
| Captions | Geist Sans | 12px | 400 |

### Component Library

Use shadcn/ui components:

| Component | Usage |
|-----------|-------|
| `Button` | Primary actions (`default`), secondary (`outline`), danger (`destructive`) |
| `Select` | Dropdowns, filter selectors |
| `Input` | Text inputs, search fields |
| `Textarea` | Multi-line text input |
| `Card` | Content containers |
| `Badge` | Status indicators, tags |
| `Tabs` | Content organization |
| `Popover` | Contextual menus, date pickers |
| `Calendar` | Date selection |
| `ScrollArea` | Scrollable containers |

### Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `gap-1` | 4px | Tight spacing (icons, badges) |
| `gap-2` | 8px | Compact spacing (form elements) |
| `gap-3` | 12px | Standard spacing (filter controls) |
| `gap-4` | 16px | Section spacing |
| `gap-6` | 24px | Large section spacing |
| `gap-8` | 32px | Page section spacing |

### Icons

Use Lucide React icons:

| Icon | Usage |
|------|-------|
| `CalendarIcon` | Date pickers, date filters |
| `X` | Close buttons, clear filters |
| `Search` | Search inputs |
| `Filter` | Filter toggles |
| `ChevronDown` | Dropdown indicators |
| `Check` | Selected states |
| `FileText` | Documents |
| `Folder` | Projects |
| `MessageSquare` | Comments |

### Interactive States

```css
/* Hover */
background: var(--muted);
border-color: var(--border);

/* Focus */
border-color: var(--primary);
box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);

/* Active/Selected */
background: var(--primary);
color: white;

/* Disabled */
opacity: 0.5;
cursor: not-allowed;
```

---

## Focus Areas for Prototypes

Use these focus areas when generating UI prototypes from PRDs.

### Search Filters Prototype

```
**Focus Areas for Prototype**
1. Filter bar layout and interaction
2. Date range selection (presets + custom picker)
3. Content type multi-select dropdown
4. Clear filters functionality
5. Results count with active filter state
6. Real-time filter application
7. Filter persistence across searches
```

### Dashboard Prototype

```
**Focus Areas for Prototype**
1. Widget grid layout (responsive)
2. Widget types: metrics, charts, lists
3. Widget configuration/settings
4. Drag-and-drop reordering
5. Add/remove widgets
6. Loading states for async data
7. Empty states for new users
```

### Onboarding Flow Prototype

```
**Focus Areas for Prototype**
1. Step indicator/progress bar
2. Form validation and error states
3. Skip/back navigation
4. Contextual help tooltips
5. Success celebration on completion
6. Smooth transitions between steps
```

### Settings Page Prototype

```
**Focus Areas for Prototype**
1. Navigation sidebar with sections
2. Form layouts for different setting types
3. Toggle switches for boolean settings
4. Save/cancel actions
5. Unsaved changes warning
6. Success/error feedback
```

---

## Workbench Copy/Paste Data

Ready-to-use data samples for the Workbench admin demo mode. Copy and paste these into the appropriate fields.

### Daily Brief Data

#### Slack Messages
```
#product-updates: "Search filters shipping next week! 🎉" - Sarah Chen (👀 12, 🚀 8)
#product-updates: "Sprint 42 velocity looking good - 16/19 points complete" - Marcus Johnson
#customer-success: "Globex Corp escalation resolved - dashboard widgets fixed" - Mike Johnson (✅ 5)
#engineering: "ACME-350 fix deployed - search special characters bug resolved" - Alex Kim (🎉 15)
#customer-feedback: "NPS response from Initech: Score 8 - 'Love the product, search needs work'" - Support Bot
DM from CEO: "Great progress on search. Let's discuss AI roadmap in our 1:1"
#support-escalations: "🔴 P1 resolved: Globex Corp dashboard issue - root cause was Redis connection pool" - Dev Team
```

#### Jira Updates
```
**Sprint 42 Status (Dec 16-29)**

| Issue | Title | Status | Points |
|-------|-------|--------|--------|
| ACME-342 | Search date filters | In Progress (70%) | 5 |
| ACME-343 | Search ranking improvements | In Review | 8 |
| ACME-344 | No results UX | To Do | 3 |
| ACME-350 | P1: Search crash on special chars | Done | - |

**Sprint Velocity**: 16/19 points (84%)

**Blockers:**
- ACME-343 waiting on performance review from platform team
- ACME-344 deprioritized for escalation work

**Recent Activity:**
- ACME-350 resolved (P1 bug) - Dec 23
- ACME-342 70% complete - filters UI done, backend in progress
- 3 new bugs triaged, 2 added to backlog
```

#### Support Tickets
```
**Open Tickets (Last 7 Days)**

| Ticket | Customer | Priority | Subject | Age |
|--------|----------|----------|---------|-----|
| ZD-4521 | Globex Corp | Urgent | Dashboard widgets not loading | 3d |
| ZD-4518 | Initech | High | Search relevance issues | 5d |
| ZD-4515 | Umbrella Corp | Normal | Need date filters in search | 7d |
| ZD-4512 | Weyland Ind | High | Slack integration not syncing | 8d |

**Resolved This Week:**
- ZD-4520: Search crashes with special characters (P1) - Resolved
- ZD-4519: Dashboard performance for large accounts - Resolved

**Themes:**
- Search-related: 47 tickets (35%)
- Performance: 22 tickets (16%)
- Integration: 18 tickets (13%)
```

#### Community Activity
```
**Top Discussions:**
1. "Search improvements coming soon?" - 45 replies, 89 upvotes
   > "Finally! Date filters will save us hours" - power_user_jane
2. "Workaround for finding old content" - 23 replies, 67 upvotes
   > Staff reply: "Search improvements shipping next week!"
3. "Slack integration reliability issues" - 18 replies, 34 upvotes

**Feature Requests:**
| Request | Votes | Status |
|---------|-------|--------|
| Date filters for search | 89 | In Progress |
| Saved searches | 56 | Planned |
| Better Jira integration | 72 | Planned |
| Dark mode | 145 | In Progress |

**New Posts Today:** 12
**Active Users This Week:** 234
```

---

### Meeting Prep Data

#### Recent Calls / Meeting Notes
```
**Globex Corp QBR** (Dec 20, 45 min)
- Attendees: John Smith (VP Product), Emily Davis (PM), Sarah Chen (CSM)
- Topics: Search frustrations, expansion plans, roadmap review
- Key Quotes:
  > "Search is our biggest pain point - team spends 20-30 min/day searching"
  > "We're ready to expand from 50 to 200 seats once search is fixed"
  > "Date filters would be huge for us"
- Sentiment: Mixed (frustrated but optimistic)
- Next Steps: Follow up on search improvements timeline

**Globex Corp Support Call** (Dec 15, 20 min)
- Attendees: John Smith, Support Team
- Issue: Dashboard widgets not loading
- Resolution: Escalated to engineering, temporary workaround provided
- Customer satisfaction: Neutral

**Globex Corp Feature Request** (Nov 28, email)
- Request: Date filters for search
- Priority: High (blocking expansion)
- Added to Q4 roadmap
```

#### Support Tickets
```
**Open Tickets for Globex Corp**

| Ticket | Priority | Subject | Age | Status |
|--------|----------|---------|-----|--------|
| ZD-4521 | Urgent | Dashboard widgets not loading | 3d | In Progress |
| ZD-4518 | High | Search relevance issues | 5d | Pending |
| ZD-4502 | Normal | Feature request: date filters | 12d | Planned |

**Resolved (Last 30 Days):**
- ZD-4495: Export timeout for large datasets - Resolved
- ZD-4488: SSO configuration help - Resolved
- ZD-4475: API rate limiting questions - Resolved

**Ticket Trend:** 8 tickets in last 30 days (up from 5 previous month)
```

#### Account Health
```
**Account Health: Globex Corp**

| Metric | Value | Trend |
|--------|-------|-------|
| Health Score | 72/100 | ⚠️ At Risk (was 78) |
| Contract Value | $48,000 ARR | - |
| Seats | 50 (of 50 licensed) | At capacity |
| Renewal Date | March 15, 2026 | 75 days |
| NPS Score | 7 (Passive) | Down from 8 |

**Expansion Potential:**
- Requested: 200 seats (4x expansion)
- Blocker: Search improvements
- Potential ARR: $192,000

**Key Contacts:**
- John Smith (VP Product) - Executive sponsor, decision maker
- Emily Davis (PM) - Day-to-day contact, power user
- IT Admin (unknown) - Technical contact for SSO

**Risk Factors:**
- Search frustration mentioned in 3 recent calls
- Competitor (Notion) mentioned in last QBR
- Dashboard issues affecting 12 users

**Opportunities:**
- 4x expansion if search ships
- API integration interest for internal tools
- Potential case study candidate
```

---

### VoC Clustering Data

#### Support Tickets
```
**Support Ticket Themes (Last 30 Days)**

| Theme | Count | % of Total | Trend |
|-------|-------|------------|-------|
| Search issues | 47 | 35% | ↑ 15% |
| Performance | 22 | 16% | ↑ 25% |
| Onboarding | 15 | 11% | → Stable |
| Integrations | 18 | 13% | ↓ 8% |
| Feature requests | 12 | 9% | → Stable |
| Billing/account | 8 | 6% | → Stable |
| Other | 13 | 10% | - |

**Sample Tickets by Theme:**

Search Issues:
- "Search not finding recently created documents" - Globex Corp
- "Search returns too many irrelevant results" - Initech
- "Need date filters in search" - Umbrella Corp
- "Search crashes with special characters" - Multiple customers

Performance:
- "Dashboard widgets not loading" - Globex Corp (P1)
- "Slow page loads during peak hours" - Weyland Industries
- "API timeouts on large exports" - Umbrella Corp

Integrations:
- "Slack integration stopped syncing" - Weyland Industries
- "Jira two-way sync not working" - Initech
- "Calendar integration missing events" - Multiple customers
```

#### Call Insights
```
**Pain Points (from 32 calls)**

1. Search frustration (mentioned in 12 calls, 38%)
   > "I spend more time searching than working" - Globex Corp
   > "Search never finds what I'm looking for" - Initech
   > "We've created workarounds using tags" - Umbrella Corp

2. Onboarding complexity (8 calls, 25%)
   > "It took our team 3 weeks to get productive" - Weyland Industries
   > "The learning curve is steep" - New customer
   > "New hires keep getting stuck on project creation" - Globex Corp

3. Integration reliability (6 calls, 19%)
   > "Slack sync is unreliable" - Multiple customers
   > "We need better Jira integration" - Initech
   > "Calendar events don't always sync" - Umbrella Corp

**Feature Requests from Calls:**
1. Date filters for search (89 votes equivalent)
2. Saved searches (45 votes equivalent)
3. Better Slack integration (38 votes equivalent)
4. AI-powered search (34 votes equivalent)

**Competitive Mentions:**
- Notion: 8 mentions (positive sentiment toward their search)
- Coda: 3 mentions (pricing comparison)
- Monday.com: 2 mentions (Slack integration)
```

#### Community Feedback
```
**Feature Requests (Community Forum)**

1. **Date filters for search** (89 votes) - Status: In Progress
   > "I need to find content from last week, not 2 years ago"
   > "This is table stakes - every competitor has this"

2. **Better Jira integration** (72 votes) - Status: Planned
   > "Two-way sync would be a game changer"
   > "Currently using Zapier as a workaround"

3. **Saved searches** (56 votes) - Status: Under Review
   > "Let me save my common searches"
   > "I search for the same things every day"

4. **AI-powered search** (34 votes) - Status: Open
   > "Notion has this, why don't you?"
   > "Semantic search would be amazing"

**Discussion Themes:**
- Search workarounds: 23 posts, 1,450 views
- Integration tips: 18 posts, 890 views
- Feature request discussions: 45 posts, 2,100 views
```

#### NPS Verbatims
```
**NPS Verbatims (Last 30 Days)**

Score 9-10 (Promoters):
- "Love the product, just need better search" - Enterprise customer
- "Best tool for our PM workflow" - Mid-market customer
- "Great support team, always helpful" - SMB customer

Score 7-8 (Passives):
- "Good but Notion's search is better" - Enterprise customer
- "Great for our team, onboarding was rough" - Mid-market customer
- "Would recommend once search improves" - Enterprise customer

Score 0-6 (Detractors):
- "Can't find anything, considering alternatives" - Enterprise customer
- "Slack integration keeps breaking" - Mid-market customer
- "Too expensive for what we get" - SMB customer

**NPS Summary:**
- Overall NPS: 32 (down from 38 last quarter)
- Enterprise NPS: 28 (search is main detractor)
- Mid-market NPS: 35
- SMB NPS: 42
```

---

### Competitor Research Data

#### Competitor Updates
```
**Competitor Updates (Last 14 Days)**

### Notion
- **AI-powered search launched** (Dec 22) 🔴 HIGH IMPACT
  - Semantic search using embeddings
  - Available to all paid plans
  - Early reviews: "Game changer for finding content"
  - Source: Product Hunt, TechCrunch

- **Repositioned as "AI-first workspace"** (Dec 15)
  - New homepage messaging emphasizes AI
  - Tagline: "The AI-powered workspace for modern teams"

### Coda
- **20% enterprise price reduction** (Dec 18) 🔴 HIGH IMPACT
  - Enterprise now $20/user/month (was $25)
  - Targeting enterprise market share
  - Source: Company blog, pricing page

### Monday.com
- **Native Slack integration** (Dec 15) 🟡 MEDIUM IMPACT
  - Two-way sync with channels
  - Slash commands for task creation
  - Interactive messages for updates
  - Source: Press release

### Asana
- **AI Goals feature launched** (Dec 12) 🟡 MEDIUM IMPACT
  - AI-powered goal setting and tracking
  - Progress predictions and risk alerts
  - Source: TechCrunch

### ClickUp
- **$400M Series D at $4B valuation** (Dec 10) 🔴 HIGH IMPACT
  - Plans to double engineering team in 2026
  - Focus on AI and enterprise features
  - Source: Crunchbase, company announcement
```

#### Feature Comparison
```
**Feature Comparison Matrix**

| Feature | Us | Notion | Coda | Monday | Asana |
|---------|-----|--------|------|--------|-------|
| AI Search | ❌ | ✅ | ❌ | ❌ | ❌ |
| Search Filters | 🔜 | ✅ | ✅ | ✅ | ✅ |
| Saved Searches | ❌ | ✅ | ✅ | ✅ | ✅ |
| SAML SSO | 🔜 | ✅ | ✅ | ✅ | ✅ |
| SCIM Provisioning | ❌ | ✅ | ✅ | ✅ | ✅ |
| Audit Logs | 🔜 | ✅ | ❌ | ✅ | ✅ |
| Slack Integration | ⚠️ | ✅ | ✅ | ✅ | ✅ |
| Jira Integration | ✅ | ✅ | ✅ | ✅ | ✅ |
| API Webhooks | ✅ | ✅ | ✅ | ✅ | ✅ |
| Custom Fields | ✅ | ✅ | ✅ | ✅ | ✅ |
| Templates | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mobile App | ✅ | ✅ | ✅ | ✅ | ✅ |

Legend: ✅ Available | 🔜 Coming Soon | ⚠️ Partial/Issues | ❌ Not Available

**Pricing Comparison (per user/month, annual):**
| Tier | Us | Notion | Coda | Monday | Asana |
|------|-----|--------|------|--------|-------|
| Free | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pro | $12 | $10 | $10 | $12 | $11 |
| Business | $18 | $18 | $15 | $19 | $25 |
| Enterprise | $22 | $25 | $20 | $24 | Custom |
```

---

### PRD Draft Data

#### Customer Evidence
```
**Customer Evidence for Search Filters**

| Source | Count | Key Quote |
|--------|-------|-----------|
| Support tickets | 47 | "I spend more time searching than working" |
| Gong calls | 12 | "Date filters would be huge" |
| Community | 89 votes | "Filter by content type please" |
| NPS verbatims | 8 | "Search is my biggest frustration" |

**Enterprise Expansion Blocked:**
- Globex Corp: 50 → 200 seats ($144K ARR increase)
- Initech: 30 → 100 seats ($84K ARR increase)
- Umbrella Corp: New deal, 150 seats ($180K ARR)
- **Total blocked ARR: $408K**

**Competitive Pressure:**
- Notion launched AI search (Dec 22)
- All competitors have search filters
- 3 lost deals cited search as factor

**Customer Quotes:**
> "We're ready to expand once search is fixed" - Globex Corp VP
> "I've created a tagging workaround but it's not sustainable" - Power user
> "Our team spends 20-30 minutes per day just searching" - Enterprise PM
> "Date filters are table stakes - every competitor has this" - Community
```

#### Analytics Signals
```
**Search Analytics (Last 30 Days)**

| Metric | Value | Change | Target |
|--------|-------|--------|--------|
| Search queries/day | 45,000 | +12% | - |
| Avg. search-to-click | 8.2s | -5% | <5s |
| No-results rate | 23% | -2% | <10% |
| Search abandonment | 18% | +3% | <10% |
| Filter usage (current) | 0% | - | >40% |

**Top Search Queries (No Results):**
1. "meeting notes" - 980 queries, 22% no results
2. "Q4 report" - 750 queries, 8% no results
3. "onboarding guide" - 540 queries, 35% no results
4. "export data" - 420 queries, 42% no results

**User Behavior:**
- 89% of users use search at least once per session
- Average 3.2 searches per session
- 45% refine their search query at least once
- Power users search 8+ times per session

**Funnel: Search → Result Click**
1. Search initiated: 100%
2. Results viewed: 92%
3. Result clicked: 68%
4. Correct result found: 52%
```

#### Technical Context
```
**Technical Context**

**Current Search Infrastructure:**
- Elasticsearch 7.x cluster (3 nodes)
- Index size: 2.3M documents
- Avg query time: 120ms (p50), 450ms (p95)
- Current filter support: Project only

**Proposed Changes:**
- Add date range filter (created_at, updated_at)
- Add content type filter (documents, projects, comments)
- Add combined filter support (AND logic)
- Implement filter state in URL for sharing

**Performance Considerations:**
- Filter queries add ~20ms latency
- Date range filters require index optimization
- Content type filters use existing type field
- Combined filters may need query restructuring

**Dependencies:**
- Elasticsearch upgrade to 8.x (recommended)
- Redis cache for filter presets
- Frontend filter component library

**Estimated Effort:**
- Backend: 2 weeks (filter API, index optimization)
- Frontend: 2 weeks (filter UI, state management)
- Testing: 1 week (performance, edge cases)
- Total: 5-6 weeks
```

---

### Sprint Review Data

#### Completed Stories
```
**Sprint 42 Completed Work (Dec 16-29)**

| Issue | Type | Title | Points | Status |
|-------|------|-------|--------|--------|
| ACME-342 | Story | Search date filters | 5 | ✅ Done |
| ACME-343 | Story | Search ranking improvements | 8 | ✅ Done |
| ACME-350 | Bug | P1: Search crash on special chars | - | ✅ Done |
| ACME-348 | Bug | Dashboard widget loading fix | - | ✅ Done |
| ACME-346 | Story | Filter UI components | 3 | ✅ Done |
| ACME-345 | Bug | Export button Safari fix | - | ✅ Done |

**Carried Over:**
| Issue | Type | Title | Points | Reason |
|-------|------|-------|--------|--------|
| ACME-344 | Story | No results UX | 3 | Deprioritized for P1 |

**Unplanned Work:**
- ACME-350: P1 bug discovered mid-sprint (2 days)
- Globex Corp escalation support (1 day)
```

#### Sprint Metrics
```
**Sprint 42 Metrics**

| Metric | Committed | Completed | % |
|--------|-----------|-----------|---|
| Story Points | 19 | 16 | 84% |
| Stories | 8 | 7 | 87% |
| Bugs Resolved | 4 | 5 | 125% |
| P1 Issues | 1 | 1 | 100% |

**Velocity Trend:**
- Sprint 40: 14 pts
- Sprint 41: 17 pts
- Sprint 42: 16 pts
- 3-Sprint Average: 15.7 pts

**Work Distribution:**
- Customer-facing features: 75%
- Bug fixes: 15%
- Tech debt: 10%

**Quality Metrics:**
- Bugs found in sprint: 2
- Bugs escaped to production: 0
- Code review turnaround: 4 hours avg
- Test coverage: 78% (up from 75%)

**Team Capacity:**
- Available: 40 person-days
- Used: 38 person-days
- PTO/Sick: 2 person-days
```

#### Blockers & Issues
```
**Blockers & Issues Encountered**

1. **P1 Bug: Search Crash (ACME-350)**
   - Discovered: Dec 22
   - Resolved: Dec 23
   - Impact: 2 days of unplanned work
   - Root cause: Missing input sanitization
   - Learning: Add fuzz testing to search

2. **Globex Corp Escalation**
   - Issue: Dashboard widgets not loading
   - Duration: 1 day investigation
   - Root cause: Redis connection pool exhaustion
   - Resolution: Increased pool size, added monitoring

3. **Search Ranking Complexity**
   - Original estimate: 5 points
   - Actual effort: 8 points
   - Reason: Algorithm complexity underestimated
   - Learning: Add spike stories for algorithm work

**Process Improvements Identified:**
- Add connection pool monitoring to all services
- Include fuzz testing in QA checklist
- Better estimation for algorithm work
```

#### Customer Feedback
```
**Customer Feedback This Sprint**

**On Search Filters (Preview Users):**
> "The search filters are exactly what we needed. This changes everything for our team." - Globex Corp

> "Finally! Date filters will save us hours every week." - Community power user

> "Can we also get a 'custom date range' option?" - Beta tester

**On Bug Fixes:**
> "Thanks for the quick fix on the special characters bug!" - Umbrella Corp

> "Dashboard is working great now. Appreciate the fast response." - Globex Corp

**Feature Requests from Feedback:**
1. Custom date range picker (5 mentions)
2. Save filter preferences (3 mentions)
3. Keyboard shortcuts for filters (2 mentions)

**NPS Impact:**
- Pre-sprint NPS: 32
- Post-sprint NPS (preview): 38 (projected)
- Search satisfaction: 3.2 → 3.8 (preview users)
```

---

### Release Notes Data

#### Completed Issues
```
**Completed Issues for v2.4.0**

| Issue | Type | Title | Description |
|-------|------|-------|-------------|
| ACME-342 | Feature | Search date filters | Filter search results by date range (7d, 30d, 90d, custom) |
| ACME-343 | Feature | Search ranking improvements | Improved relevance with recency and engagement signals |
| ACME-346 | Feature | Content type filters | Filter by documents, projects, or comments |
| ACME-350 | Bug | Search crash fix | Fixed crash when using special characters in search |
| ACME-348 | Bug | Dashboard widget fix | Fixed widgets not loading for some users |
| ACME-345 | Bug | Safari export fix | Fixed export button not working on Safari |
| ACME-341 | Bug | Notification preferences | Fixed preferences not saving correctly |

**Performance Improvements:**
- Search latency reduced by 23% (p95: 450ms → 350ms)
- Dashboard load time improved by 40% for large accounts
- Memory usage reduced by 15% for complex dashboards
```

#### Epic Summaries
```
**Epic: Search Improvements (ACME-100)**

This release completes Phase 1 of our search improvements initiative, adding filtering capabilities that customers have requested for months.

**Key Outcomes:**
- 89 customer votes addressed (date/content type filters)
- 3 enterprise expansion blockers removed
- Foundation laid for future AI search features

**What's Included:**
- Date range filters (presets + custom)
- Content type filters (documents, projects, comments)
- Combined filter support
- Improved relevance ranking

**Customer Impact:**
- Expected 30% reduction in search-to-click time
- Filter adoption target: >40% of searches
- Search satisfaction target: 3.2 → 4.0+

**What's Next:**
- Phase 2: Saved searches (Q1 2026)
- Phase 3: AI-powered semantic search (Q2 2026)
```

#### Related PRDs
```
**Related PRD: Search Filters**

**Goals:**
| Goal | Metric | Target |
|------|--------|--------|
| Reduce time to find content | Avg. search-to-click | -30% |
| Improve satisfaction | Survey score | 3.2 → 4.0+ |
| Drive filter adoption | Filter usage rate | >40% |

**User Stories Delivered:**
1. As a PM, I can filter search by date range
2. As a PM, I can filter by content type
3. As a PM, I can combine multiple filters
4. As a PM, I can clear all filters with one click

**Success Criteria:**
- [x] All P0 requirements complete
- [x] <1% error rate in filter queries
- [x] Performance within targets (<200ms)
- [x] Documentation updated

**Evidence Base:**
- 47 support tickets about search
- 89-vote community feature request
- 3 enterprise deals blocked by search
- 12 Gong call mentions
```

---

### Prototype Generation Data

#### PRD Content (Sample)
```
# PRD: Search Filters

## 1. Overview

### Problem Statement
Users cannot efficiently find content because search results lack filtering capabilities.

### Goals
| Goal | Metric | Target |
|------|--------|--------|
| Reduce time to find content | Avg. search-to-click time | -30% |
| Improve search satisfaction | User survey score | 3.2 → 4.0+ |

## 2. User Stories

1. **As a PM**, I want to filter search results by date range
   - Acceptance: Date presets (7d, 30d, 90d) and custom range picker
   
2. **As a PM**, I want to filter by content type
   - Acceptance: Multi-select for documents, projects, comments

3. **As a PM**, I want to combine multiple filters
   - Acceptance: Filters work together with AND logic

4. **As a PM**, I want to clear all filters
   - Acceptance: Single "Clear filters" button resets all

## 3. Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| F1 | Date range filter with presets | P0 |
| F2 | Custom date range picker | P1 |
| F3 | Content type filter | P0 |
| F4 | Clear all filters button | P0 |
| F5 | Filter state in URL | P2 |
| F6 | Results count with active filters | P0 |

## 4. Key Flows

1. User enters search query
2. Results display with filter bar above
3. User selects date filter (e.g., "Last 7 days")
4. Results update in real-time
5. User adds content type filter
6. Results narrow further
7. Active filters shown as tags
8. User clicks "Clear filters" to reset
```

#### Design System Guidelines (for Prototype)
```
**Design System Guidelines**

**Components:**
- Use shadcn/ui components (Select, Button, Popover, Calendar)
- Filter bar: horizontal layout with gap-3 spacing
- Dropdowns: 200px min-width, 8px border-radius

**Colors:**
- Primary actions: cobalt-600 (#6366f1)
- Filter tags: cobalt-100 bg, cobalt-700 text
- Borders: slate-200 (#e2e8f0)
- Muted text: slate-500 (#64748b)

**Typography:**
- Filter labels: text-sm (14px), font-medium
- Results count: text-sm, text-muted-foreground
- Result titles: text-base (16px), font-medium

**Icons:**
- Use Lucide React icons
- CalendarIcon for date picker
- X for clear/close
- ChevronDown for dropdowns
- Filter for filter toggle

**Spacing:**
- Filter bar padding: 12px 16px
- Gap between filters: 12px
- Results list item padding: 16px

**States:**
- Hover: bg-muted, border-slate-300
- Focus: ring-2 ring-cobalt-500/20, border-cobalt-500
- Active filter: bg-cobalt-100, text-cobalt-700
```

#### Focus Areas (for Prototype)
```
**Focus Areas for Prototype**

1. **Filter Bar Layout**
   - Horizontal bar below search input
   - Filters: Date range, Content type
   - Clear button appears when filters active
   - Results count updates in real-time

2. **Date Range Selection**
   - Dropdown with presets: All time, Last 7 days, Last 30 days, Last 90 days
   - Custom range option opens date picker
   - Selected value shown in dropdown trigger

3. **Content Type Filter**
   - Dropdown with options: All types, Documents, Projects, Comments
   - Single select (not multi-select for MVP)
   - Icon + label for each option

4. **Active Filter State**
   - Show filter tags when active
   - "2 filters active" indicator
   - Clear all button visible

5. **Results Display**
   - Show result count: "8 results"
   - List with icon, title, excerpt, metadata
   - Content type badge on each result
   - Date shown in relative format

6. **Interactions**
   - Filters apply immediately (no "Apply" button)
   - Smooth transitions on filter change
   - Loading state while filtering
   - Empty state for no results
```

---

### Deck Content Data

#### Topic
```
Q4 Product Update: Search Improvements Launch
```

#### Audience Type
```
exec
```

#### Purpose
```
Quarterly business review with leadership - celebrating search improvements launch and requesting AI search investment for Q1
```

#### Duration
```
30
```

#### Key Data Points
```
**Key Metrics:**
- Search filters shipped 2 weeks ahead of schedule
- 40% reduction in search-to-click time (8.2s → 4.9s)
- 45% filter adoption rate in first week (target was 40%)
- Search satisfaction improved from 3.2 to 4.1
- No-results rate dropped from 23% to 12%

**Sprint Performance:**
- Sprint 42 velocity: 16/19 points completed (84%)
- P1 bug (ACME-350) resolved in 24 hours
- Zero bugs escaped to production
- Test coverage increased to 78%

**Business Impact:**
- Globex Corp expansion unblocked: 50 → 200 seats ($144K ARR)
- Initech expansion confirmed: 30 → 100 seats ($84K ARR)
- 3 enterprise deals now moving forward
- Total pipeline unblocked: $408K ARR

**Customer Adoption:**
- 89 community votes addressed
- 47 support tickets resolved
- Enterprise NPS improved: 28 → 35 (projected)
```

#### Supporting Evidence
```
**Customer Evidence:**
- "This changes everything for our team" - Globex Corp VP
- "Finally, search that actually works" - Initech PM
- "Date filters will save us hours every week" - Community power user
- 89 community feature request votes addressed

**Competitive Context:**
- Notion launched AI search Dec 22 - we're now at feature parity on filters
- Coda reduced enterprise pricing 20% - our value prop strengthened
- Monday.com added Slack integration - we already have this

**Market Position:**
- Search was #1 customer pain point (35% of VoC mentions)
- All major competitors have search filters - we've closed the gap
- AI search is the next battleground - Notion leading
```

#### Related Artifacts
```
**Related pmkit Artifacts:**
- VoC Report (Dec 15): Search was #1 pain point with 52 mentions
- Competitor Report (Dec 20): Notion AI search analysis, Coda pricing changes
- PRD: Search Filters (Approved Nov 15): All P0 requirements delivered
- Sprint Review (Dec 29): 84% velocity, zero escaped bugs
- Daily Brief (Jan 9): Search filters at 45% adoption

**Jira References:**
- Epic ACME-100: Search Experience Improvements - Phase 1 complete
- ACME-342: Date filters - Done
- ACME-343: Ranking improvements - Done
- ACME-350: P1 bug fix - Done in 24 hours
```

#### Specific Requirements
```
**Presentation Requirements:**
- Focus on business impact, not technical details
- Include clear ask: AI search resourcing for Q1 (2 engineers, 12 weeks)
- Prepare for questions about Notion competition
- Highlight customer quotes and expansion wins
- Show roadmap: Phase 2 (Saved Searches) → Phase 3 (AI Search)

**Key Messages:**
1. We delivered ahead of schedule with quality
2. Customer impact is immediate and measurable
3. Competitive gap closed, but AI search is next priority
4. Investment ask: $180K for AI search in Q1

**Anticipated Questions:**
- "How do we compare to Notion's AI search?" → We're planning Phase 3
- "What's the ROI on the AI search investment?" → $408K pipeline already unblocked
- "When will customers see AI search?" → Q2 2026 target
```

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
