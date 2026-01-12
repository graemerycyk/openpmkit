# pmkit Mock Data - FinTech Variation (PayFlow)

> Mock data variation for demos featuring a B2B FinTech payments company.

---

## Demo Tenant & Users

### Tenant

| Field | Value |
|-------|-------|
| ID | `demo-tenant-fintech` |
| Name | PayFlow |
| Slug | `payflow` |
| Timezone | America/New_York |
| Week Starts | Monday |
| Sprint Duration | 14 days |
| Product Name | PayFlow Platform |

### Users

| ID | Name | Email | Role |
|----|------|-------|------|
| `user-fintech-pm` | Rachel Torres | rachel.torres@payflow.io | pm |
| `user-fintech-admin` | David Kim | david.kim@payflow.io | admin |
| `user-fintech-viewer` | Jordan Lee | jordan.lee@payflow.io | viewer |
| `user-fintech-guest` | Demo Guest | guest@demo.payflow.io | guest |

---

## Design System Guidelines

Use these guidelines when generating prototypes or designing new features for FinTech/payments applications.

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#059669` (emerald-600) | Primary buttons, success states |
| `--primary-hover` | `#047857` (emerald-700) | Hover states |
| `--background` | `#ffffff` | Page backgrounds |
| `--foreground` | `#1e293b` | Primary text |
| `--muted` | `#f8fafc` | Secondary backgrounds, cards |
| `--muted-foreground` | `#64748b` | Secondary text, placeholders |
| `--border` | `#e2e8f0` | Borders, dividers |
| `--pending` | `#f59e0b` (amber-500) | Pending transactions |
| `--processing` | `#3b82f6` (blue-500) | Processing states |
| `--completed` | `#10b981` (emerald-500) | Completed transactions |
| `--failed` | `#ef4444` (red-500) | Failed transactions, errors |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Headings (h1-h6) | Space Grotesk | 24-36px | 600-700 |
| Body text | Geist Sans | 14-16px | 400 |
| Code/mono | Geist Mono | 13-14px | 400 |
| Amounts | Geist Sans | 18-24px | 700, tabular-nums |
| Currency codes | Geist Mono | 12-14px | 500 |
| Timestamps | Geist Sans | 12px | 400 |

### Component Library

Use shadcn/ui components:

| Component | Usage |
|-----------|-------|
| `Card` | Settlement cards, transaction summaries |
| `Badge` | Status indicators (pending, completed, failed) |
| `Button` | Primary actions (`default`), secondary (`outline`) |
| `Tabs` | Transaction type filters |
| `ScrollArea` | Transaction lists |
| `Popover` | Settlement details, notifications |
| `Select` | Currency selectors, date filters |

### Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `gap-1` | 4px | Tight spacing (status dots, currency codes) |
| `gap-2` | 8px | Compact spacing (card elements) |
| `gap-3` | 12px | Standard spacing (list items) |
| `gap-4` | 16px | Section spacing |
| `gap-6` | 24px | Large section spacing |
| `gap-8` | 32px | Page section spacing |

### Icons

Use Lucide React icons:

| Icon | Usage |
|------|-------|
| `ArrowUpRight` | Outgoing settlements |
| `ArrowDownLeft` | Incoming settlements |
| `Clock` | Pending/processing states |
| `CheckCircle` | Completed transactions |
| `AlertCircle` | Failed transactions, warnings |
| `Bell` | Notifications |
| `DollarSign` | Amount displays |
| `RefreshCw` | Refresh/sync actions |

### Interactive States

```css
/* Hover */
background: var(--muted);
border-color: var(--border);

/* Focus */
border-color: var(--primary);
box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);

/* Active/Selected */
background: var(--primary);
color: white;

/* Processing */
animation: pulse 2s infinite;

/* Disabled */
opacity: 0.5;
cursor: not-allowed;
```

---

## Focus Areas for Prototypes

Use these focus areas when generating UI prototypes for FinTech/payments applications.

### Settlement Dashboard Prototype

```
**Focus Areas for Prototype**
1. Real-time settlement feed with live updates
2. Status cards (Pending, Processing, Completed, Failed)
3. Amount totals by status with currency breakdown
4. Time-based filtering (Today, This Week, Custom)
5. Settlement card design with status indicators
6. WebSocket connection status indicator
```

### Notification Center Prototype

```
**Focus Areas for Prototype**
1. Bell icon with unread count badge
2. Slide-out notification panel
3. Notification grouping (Today, Yesterday, Earlier)
4. Mark as read / Mark all as read
5. Click-to-navigate to settlement
6. Notification preferences modal
```

### Multi-Currency Dashboard Prototype

```
**Focus Areas for Prototype**
1. Currency selector dropdown
2. Exchange rate display with timestamp
3. Multi-currency totals with conversions
4. Currency-specific transaction lists
5. FX rate trend indicators
6. Currency conversion calculator
```

### Compliance Reporting Prototype

```
**Focus Areas for Prototype**
1. Report type selector
2. Date range picker
3. Export format options (PDF, CSV, Excel)
4. Preview pane with sample data
5. Scheduled report configuration
6. Audit trail viewer
```

---

## Workbench Copy/Paste Data

Ready-to-use data samples for the Workbench admin demo mode. Copy and paste these into the appropriate fields.

### Daily Brief Data

#### Slack Messages
```
#product-updates: "Payment reconciliation v2 launching Tuesday! 🎉" - Rachel Torres (👀 18, 🚀 12)
#product-updates: "Sprint 28 on track - 21/24 points complete" - David Kim
#customer-success: "First Republic escalation resolved - batch processing fixed" - Lisa Chen (✅ 8)
#engineering: "PF-892 hotfix deployed - currency conversion rounding issue resolved" - Mike Patel (🎉 22)
#customer-feedback: "NPS from StripeConnect: Score 9 - 'Best payment reconciliation we've used'" - Support Bot
DM from CFO: "Great progress on real-time settlements. Board presentation next week"
#support-escalations: "🔴 P1 resolved: First Republic batch processing - root cause was timezone handling" - Dev Team
#compliance: "SOC 2 Type II audit prep on track - 94% controls documented" - Compliance Team
```

#### Jira Updates
```
**Sprint 28 Status (Jan 6-19)**

| Issue | Title | Status | Points |
|-------|-------|--------|--------|
| PF-845 | Real-time settlement notifications | In Progress (80%) | 8 |
| PF-847 | Multi-currency reconciliation | In Review | 5 |
| PF-850 | Batch processing optimization | Done | 8 |
| PF-892 | P1: Currency rounding fix | Done | - |

**Sprint Velocity**: 21/24 points (87%)

**Blockers:**
- PF-845 waiting on webhook infrastructure review
- PF-853 deprioritized for compliance work

**Recent Activity:**
- PF-892 resolved (P1 bug) - Jan 8
- PF-847 ready for QA - multi-currency support
- 2 new compliance tickets added to backlog
```

#### Support Tickets
```
**Open Tickets (Last 7 Days)**

| Ticket | Customer | Priority | Subject | Age |
|--------|----------|----------|---------|-----|
| ZD-8921 | First Republic | Urgent | Batch processing delays | 2d |
| ZD-8918 | Stripe Connect | High | Settlement timing questions | 4d |
| ZD-8915 | Square Capital | Normal | Multi-currency setup help | 6d |
| ZD-8912 | Plaid Partners | High | API rate limiting concerns | 7d |

**Resolved This Week:**
- ZD-8920: Currency conversion rounding (P1) - Resolved
- ZD-8919: Webhook delivery delays - Resolved

**Themes:**
- Settlement timing: 34 tickets (28%)
- Multi-currency: 28 tickets (23%)
- API/Integration: 22 tickets (18%)
- Compliance/Reporting: 18 tickets (15%)
```

#### Community Activity
```
**Top Discussions:**
1. "Real-time settlement notifications - when?" - 67 replies, 134 upvotes
   > "This would transform our treasury operations" - fintech_ops_lead
2. "Multi-currency reconciliation best practices" - 45 replies, 89 upvotes
   > Staff reply: "Multi-currency launching next sprint!"
3. "SOC 2 compliance documentation" - 32 replies, 56 upvotes

**Feature Requests:**
| Request | Votes | Status |
|---------|-------|--------|
| Real-time settlement notifications | 134 | In Progress |
| Multi-currency reconciliation | 89 | In Progress |
| Custom reconciliation rules | 67 | Planned |
| Audit trail export | 45 | Planned |

**New Posts Today:** 18
**Active Users This Week:** 412
```

---

### Meeting Prep Data

#### Recent Calls / Meeting Notes
```
**First Republic QBR** (Jan 5, 60 min)
- Attendees: Sarah Mitchell (VP Treasury), Tom Chen (Controller), Rachel Torres (CSM)
- Topics: Batch processing issues, expansion to international, compliance needs
- Key Quotes:
  > "Batch processing delays are costing us $50K/month in float"
  > "We need multi-currency by Q2 for our EU expansion"
  > "Real-time notifications would eliminate 3 FTEs of manual work"
- Sentiment: Frustrated but committed
- Next Steps: Follow up on batch processing fix, multi-currency timeline

**First Republic Technical Review** (Dec 28, 45 min)
- Attendees: Tom Chen, Engineering Team
- Issue: Batch processing performance degradation
- Resolution: Identified timezone handling bug, fix in progress
- Customer satisfaction: Neutral - waiting for resolution

**First Republic Contract Discussion** (Dec 15, 30 min)
- Request: Enterprise tier upgrade with SLA guarantees
- Priority: High (blocking $2M expansion)
- Added to Q1 roadmap
```

#### Support Tickets
```
**Open Tickets for First Republic**

| Ticket | Priority | Subject | Age | Status |
|--------|----------|---------|-----|--------|
| ZD-8921 | Urgent | Batch processing delays | 2d | In Progress |
| ZD-8915 | High | Multi-currency timeline | 6d | Pending |
| ZD-8908 | Normal | Custom report request | 10d | Planned |

**Resolved (Last 30 Days):**
- ZD-8895: Settlement timing discrepancy - Resolved
- ZD-8888: API authentication issues - Resolved
- ZD-8875: Compliance report format - Resolved

**Ticket Trend:** 12 tickets in last 30 days (up from 8 previous month)
```

#### Account Health
```
**Account Health: First Republic**

| Metric | Value | Trend |
|--------|-------|-------|
| Health Score | 68/100 | ⚠️ At Risk (was 75) |
| Contract Value | $180,000 ARR | - |
| Transaction Volume | $2.4B/month | +15% |
| Renewal Date | April 1, 2026 | 82 days |
| NPS Score | 6 (Detractor) | Down from 7 |

**Expansion Potential:**
- Requested: Enterprise tier + EU expansion
- Blocker: Batch processing, multi-currency
- Potential ARR: $450,000

**Key Contacts:**
- Sarah Mitchell (VP Treasury) - Executive sponsor, decision maker
- Tom Chen (Controller) - Day-to-day contact, power user
- James Wu (IT Director) - Technical contact for integrations

**Risk Factors:**
- Batch processing issues mentioned in 4 recent calls
- Competitor (Modern Treasury) mentioned in last QBR
- $50K/month float cost from delays

**Opportunities:**
- 2.5x expansion if issues resolved
- EU expansion requires multi-currency
- Potential case study for enterprise segment
```

---

### VoC Clustering Data

#### Support Tickets
```
**Support Ticket Themes (Last 30 Days)**

| Theme | Count | % of Total | Trend |
|-------|-------|------------|-------|
| Settlement timing | 34 | 28% | ↑ 20% |
| Multi-currency | 28 | 23% | ↑ 35% |
| API/Integration | 22 | 18% | → Stable |
| Compliance/Reporting | 18 | 15% | ↑ 10% |
| Performance | 12 | 10% | ↓ 15% |
| Other | 8 | 6% | - |

**Sample Tickets by Theme:**

Settlement Timing:
- "Batch settlements arriving 4 hours late" - First Republic
- "Need real-time notification when settlements complete" - Stripe Connect
- "Settlement timing unpredictable for treasury planning" - Square Capital

Multi-Currency:
- "When will EUR/GBP reconciliation be available?" - First Republic
- "Currency conversion rates not matching market" - Plaid Partners
- "Need multi-currency reporting for audit" - Multiple customers

Compliance/Reporting:
- "SOC 2 attestation letter needed for our audit" - Enterprise customers
- "Custom audit trail export for regulators" - First Republic
- "PCI compliance documentation request" - Multiple customers
```

#### Call Insights
```
**Pain Points (from 28 calls)**

1. Settlement timing unpredictability (mentioned in 14 calls, 50%)
   > "We can't do treasury planning without knowing when settlements arrive" - First Republic
   > "Real-time notifications would eliminate manual checking" - Stripe Connect
   > "Our team checks the dashboard 20 times a day" - Square Capital

2. Multi-currency gaps (10 calls, 36%)
   > "EU expansion blocked until you support EUR" - First Republic
   > "Currency conversion timing is killing our margins" - Plaid Partners
   > "Need consolidated multi-currency reporting" - Enterprise customers

3. Compliance documentation (8 calls, 29%)
   > "Auditors need more detailed transaction logs" - First Republic
   > "SOC 2 Type II is a requirement for our enterprise clients" - Stripe Connect
   > "Custom audit exports would save us 20 hours/month" - Multiple customers

**Feature Requests from Calls:**
1. Real-time settlement notifications (134 votes equivalent)
2. Multi-currency reconciliation (89 votes equivalent)
3. Custom audit trail exports (67 votes equivalent)
4. Predictive settlement timing (45 votes equivalent)

**Competitive Mentions:**
- Modern Treasury: 6 mentions (real-time features)
- Ramp: 4 mentions (multi-currency)
- Mercury: 3 mentions (developer experience)
```

#### Community Feedback
```
**Feature Requests (Community Forum)**

1. **Real-time settlement notifications** (134 votes) - Status: In Progress
   > "This is table stakes for treasury operations"
   > "We've built our own polling system as a workaround"

2. **Multi-currency reconciliation** (89 votes) - Status: In Progress
   > "EU expansion is blocked without this"
   > "Currency conversion timing is unpredictable"

3. **Custom audit trail exports** (67 votes) - Status: Planned
   > "Auditors need specific formats we can't generate"
   > "Manual export process takes 4 hours per audit"

4. **Predictive settlement timing** (45 votes) - Status: Open
   > "ML-based prediction would transform treasury planning"
   > "Even 80% accuracy would be game-changing"

**Discussion Themes:**
- Treasury automation: 34 posts, 2,100 views
- Compliance best practices: 28 posts, 1,450 views
- API integration patterns: 45 posts, 3,200 views
```

#### NPS Verbatims
```
**NPS Verbatims (Last 30 Days)**

Score 9-10 (Promoters):
- "Best reconciliation platform we've used" - Mid-market customer
- "API is incredibly well-designed" - Developer at Stripe Connect
- "Support team is responsive and knowledgeable" - SMB customer

Score 7-8 (Passives):
- "Great product, but need real-time notifications" - Enterprise customer
- "Would be perfect with multi-currency support" - First Republic
- "Solid but Modern Treasury has better real-time features" - Enterprise customer

Score 0-6 (Detractors):
- "Settlement timing issues costing us real money" - First Republic
- "Can't recommend until multi-currency ships" - EU-expanding customer
- "Compliance reporting is too manual" - Enterprise customer

**NPS Summary:**
- Overall NPS: 28 (down from 35 last quarter)
- Enterprise NPS: 22 (settlement timing is main detractor)
- Mid-market NPS: 32
- SMB NPS: 45
```

---

### Competitor Research Data

#### Competitor Updates
```
**Competitor Updates (Last 14 Days)**

### Modern Treasury
- **Real-time payment tracking launched** (Jan 4) 🔴 HIGH IMPACT
  - Sub-second payment status updates
  - Webhook-first architecture
  - Early reviews: "Finally, real-time visibility"
  - Source: Product Hunt, FinTech Today

- **Series C: $200M at $2B valuation** (Dec 28)
  - Plans to expand enterprise sales team
  - Focus on Fortune 500 treasury departments

### Ramp
- **Multi-currency expense management** (Jan 2) 🔴 HIGH IMPACT
  - 50+ currencies supported
  - Real-time FX rates
  - Automatic reconciliation
  - Source: Company blog, TechCrunch

### Mercury
- **Treasury management features** (Dec 20) 🟡 MEDIUM IMPACT
  - Yield optimization for idle cash
  - Automated sweep accounts
  - Source: Press release

### Stripe Treasury
- **Embedded finance expansion** (Dec 15) 🟡 MEDIUM IMPACT
  - New banking-as-a-service features
  - Deeper platform integrations
  - Source: Stripe blog
```

#### Feature Comparison
```
**Feature Comparison Matrix**

| Feature | Us | Modern Treasury | Ramp | Mercury |
|---------|-----|-----------------|------|---------|
| Real-time tracking | 🔜 | ✅ | ✅ | ⚠️ |
| Multi-currency | 🔜 | ✅ | ✅ | ✅ |
| Batch processing | ✅ | ✅ | ✅ | ✅ |
| SOC 2 Type II | ✅ | ✅ | ✅ | ✅ |
| Custom audit exports | 🔜 | ✅ | ⚠️ | ❌ |
| API webhooks | ✅ | ✅ | ✅ | ✅ |
| Bank integrations | ✅ | ✅ | ✅ | ✅ |
| Predictive analytics | ❌ | 🔜 | ❌ | ❌ |

Legend: ✅ Available | 🔜 Coming Soon | ⚠️ Partial | ❌ Not Available

**Pricing Comparison (monthly, based on volume):**
| Tier | Us | Modern Treasury | Ramp | Mercury |
|------|-----|-----------------|------|---------|
| Startup | $500 | $750 | Free* | Free* |
| Growth | $2,000 | $3,000 | $1,500 | $1,000 |
| Enterprise | $8,000 | $12,000 | Custom | Custom |

*Free tiers have transaction limits
```

---

### PRD Draft Data

#### Customer Evidence
```
**Customer Evidence for Real-Time Settlement Notifications**

| Source | Count | Key Quote |
|--------|-------|-----------|
| Support tickets | 34 | "We check the dashboard 20 times a day" |
| Gong calls | 14 | "Real-time notifications would eliminate 3 FTEs" |
| Community | 134 votes | "Table stakes for treasury operations" |
| NPS verbatims | 12 | "Settlement timing is our biggest pain point" |

**Enterprise Expansion Blocked:**
- First Republic: $180K → $450K ARR (2.5x expansion)
- Stripe Connect: $120K → $300K ARR (new modules)
- Square Capital: New deal, $200K ARR
- **Total blocked ARR: $770K**

**Competitive Pressure:**
- Modern Treasury launched real-time tracking (Jan 4)
- All competitors have real-time features
- 4 lost deals cited real-time as factor

**Customer Quotes:**
> "Settlement timing unpredictability costs us $50K/month in float" - First Republic VP
> "We've built our own polling system as a workaround" - Power user
> "Our treasury team spends 2 hours daily on manual checks" - Enterprise Controller
> "Real-time is table stakes - every competitor has this" - Community
```

#### Analytics Signals
```
**Settlement Analytics (Last 30 Days)**

| Metric | Value | Change | Target |
|--------|-------|--------|--------|
| Settlements/day | 45,000 | +18% | - |
| Avg. settlement time | 4.2 hours | -8% | <1 hour |
| Dashboard refresh rate | 12x/user/day | +25% | <3x |
| API polling calls | 2.1M/day | +40% | - |
| Webhook delivery rate | 99.2% | +0.3% | >99.9% |

**User Behavior:**
- 78% of users check settlement status manually
- Average 12 dashboard refreshes per user per day
- 45% have built custom polling integrations
- Power users poll API every 30 seconds

**Funnel: Settlement → Confirmation**
1. Settlement initiated: 100%
2. Processing started: 100%
3. User notified: 23% (only failures)
4. Manual check required: 77%
```

#### Technical Context
```
**Technical Context**

**Current Settlement Infrastructure:**
- Batch processing every 15 minutes
- PostgreSQL for transaction records
- Redis for status caching
- Webhook system for failures only

**Proposed Changes:**
- Event-driven architecture with Kafka
- Real-time status updates via WebSocket
- Push notifications (email, SMS, webhook)
- Predictive ETA based on historical data

**Performance Considerations:**
- WebSocket connections: ~10K concurrent expected
- Event throughput: 500 events/second peak
- Notification latency target: <5 seconds
- Storage: 30-day event retention

**Dependencies:**
- Kafka cluster setup (Ops team)
- WebSocket infrastructure (Platform team)
- Notification service upgrade
- Mobile app updates for push

**Estimated Effort:**
- Backend: 4 weeks (event system, notifications)
- Frontend: 2 weeks (real-time UI, preferences)
- Mobile: 2 weeks (push notifications)
- Testing: 2 weeks (load testing, reliability)
- Total: 10 weeks
```

---

### Sprint Review Data

#### Completed Stories
```
**Sprint 28 Completed Work (Jan 6-19)**

| Issue | Type | Title | Points | Status |
|-------|------|-------|--------|--------|
| PF-845 | Story | Real-time settlement notifications | 8 | ✅ Done |
| PF-847 | Story | Multi-currency reconciliation | 5 | ✅ Done |
| PF-850 | Story | Batch processing optimization | 8 | ✅ Done |
| PF-892 | Bug | P1: Currency rounding fix | - | ✅ Done |
| PF-848 | Story | Webhook reliability improvements | 3 | ✅ Done |
| PF-889 | Bug | Timezone handling in batches | - | ✅ Done |

**Carried Over:**
| Issue | Type | Title | Points | Reason |
|-------|------|-------|--------|--------|
| PF-853 | Story | Custom audit exports | 5 | Deprioritized for P1 |

**Unplanned Work:**
- PF-892: P1 currency bug discovered mid-sprint (2 days)
- First Republic escalation support (1.5 days)
- SOC 2 audit prep support (1 day)
```

#### Sprint Metrics
```
**Sprint 28 Metrics**

| Metric | Committed | Completed | % |
|--------|-----------|-----------|---|
| Story Points | 24 | 21 | 87% |
| Stories | 6 | 5 | 83% |
| Bugs Resolved | 3 | 4 | 133% |
| P1 Issues | 1 | 1 | 100% |

**Velocity Trend:**
- Sprint 26: 18 pts
- Sprint 27: 22 pts
- Sprint 28: 21 pts
- 3-Sprint Average: 20.3 pts

**Work Distribution:**
- Customer-facing features: 70%
- Bug fixes: 15%
- Compliance/Security: 15%

**Quality Metrics:**
- Bugs found in sprint: 3
- Bugs escaped to production: 0
- Code review turnaround: 6 hours avg
- Test coverage: 82% (up from 79%)
```

---

### Release Notes Data

#### Completed Issues
```
**Completed Issues for v3.2.0**

| Issue | Type | Title | Description |
|-------|------|-------|-------------|
| PF-845 | Feature | Real-time settlement notifications | Get instant updates when settlements complete |
| PF-847 | Feature | Multi-currency reconciliation | Reconcile transactions in EUR, GBP, CAD, and more |
| PF-850 | Feature | Batch processing optimization | 3x faster batch settlement processing |
| PF-892 | Bug | Currency rounding fix | Fixed rounding errors in currency conversions |
| PF-889 | Bug | Timezone handling | Fixed timezone issues in batch scheduling |
| PF-848 | Improvement | Webhook reliability | Improved webhook delivery rate to 99.9% |

**Performance Improvements:**
- Batch processing 3x faster (avg 45 min → 15 min)
- Webhook delivery rate improved to 99.9%
- Dashboard load time reduced by 35%
```

#### Epic Summaries
```
**Epic: Real-Time Treasury (PF-800)**

This release delivers real-time settlement visibility that treasury teams have been requesting for months.

**Key Outcomes:**
- 134 customer votes addressed (real-time notifications)
- 3 enterprise expansion blockers removed
- Competitive parity with Modern Treasury

**What's Included:**
- Real-time settlement status updates
- Push notifications (email, SMS, webhook)
- Customizable notification preferences
- Settlement ETA predictions

**Customer Impact:**
- Expected 80% reduction in manual status checks
- Notification delivery target: <5 seconds
- Treasury team time savings: 2+ hours/day

**What's Next:**
- Phase 2: Predictive settlement timing (Q2 2026)
- Phase 3: AI-powered treasury insights (Q3 2026)
```

---

### Prototype Generation Data

#### PRD Content (Sample)
```
# PRD: Real-Time Settlement Notifications

## 1. Overview

### Problem Statement
Treasury teams cannot efficiently manage cash flow because settlement status updates are delayed and require manual checking.

### Goals
| Goal | Metric | Target |
|------|--------|--------|
| Reduce manual status checks | Dashboard refreshes/user/day | 12 → 2 |
| Improve treasury planning | Settlement prediction accuracy | 0% → 80% |

## 2. User Stories

1. **As a Treasury Manager**, I want real-time settlement notifications
   - Acceptance: Push notifications within 5 seconds of settlement completion
   
2. **As a Controller**, I want to customize notification preferences
   - Acceptance: Choose channels (email, SMS, webhook) and thresholds

3. **As an Operations Lead**, I want settlement ETA predictions
   - Acceptance: ML-based predictions with 80%+ accuracy

4. **As a Finance Admin**, I want notification audit trails
   - Acceptance: Complete log of all notifications sent

## 3. Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| F1 | Real-time settlement status updates | P0 |
| F2 | Push notifications (email, SMS, webhook) | P0 |
| F3 | Notification preferences per user | P1 |
| F4 | Settlement ETA predictions | P1 |
| F5 | Notification audit trail | P0 |
| F6 | Batch settlement summaries | P2 |

## 4. Key Flows

1. Settlement initiated in banking system
2. Event captured by Kafka consumer
3. Status update pushed via WebSocket
4. User receives notification (based on preferences)
5. Dashboard updates in real-time
6. Audit log entry created
7. ETA prediction updated for pending settlements
```

#### Design System Guidelines (for Prototype)
```
**Design System Guidelines**

**Components:**
- Use shadcn/ui components (Card, Badge, Button, Tabs, ScrollArea)
- Settlement cards: vertical layout with status indicator
- Notification center: slide-out panel from right
- Status badges: color-coded by settlement state

**Colors:**
- Primary actions: emerald-600 (#059669) - financial/success theme
- Pending: amber-500 (#f59e0b)
- Processing: blue-500 (#3b82f6)
- Completed: emerald-500 (#10b981)
- Failed: red-500 (#ef4444)
- Borders: slate-200 (#e2e8f0)
- Muted text: slate-500 (#64748b)

**Typography:**
- Settlement amounts: text-2xl (24px), font-bold, tabular-nums
- Status labels: text-sm (14px), font-medium, uppercase
- Timestamps: text-xs (12px), text-muted-foreground
- Currency codes: text-sm, font-mono

**Icons:**
- Use Lucide React icons
- ArrowUpRight for outgoing settlements
- ArrowDownLeft for incoming settlements
- Clock for pending/processing
- CheckCircle for completed
- AlertCircle for failed
- Bell for notifications

**Spacing:**
- Settlement card padding: 16px 20px
- Gap between cards: 12px
- Status indicator: 8px dot with 4px margin-right
- Amount/currency gap: 4px

**States:**
- Hover: bg-muted/50, subtle shadow
- Selected: ring-2 ring-emerald-500/20, border-emerald-500
- Processing: pulse animation on status dot
- New notification: slide-in from right with fade
```

#### Focus Areas (for Prototype)
```
**Focus Areas for Prototype**

1. **Settlement Dashboard**
   - Real-time settlement feed with live updates
   - Status cards: Pending, Processing, Completed, Failed
   - Total amounts by status with currency breakdown
   - Time-based filtering (Today, This Week, Custom)

2. **Settlement Card Design**
   - Status indicator (colored dot + label)
   - Amount with currency code (e.g., $45,000.00 USD)
   - Counterparty name and account
   - Timestamp with relative time
   - ETA for pending settlements

3. **Notification Center**
   - Bell icon with unread count badge
   - Slide-out panel with notification list
   - Group by: Today, Yesterday, Earlier
   - Mark as read / Mark all as read
   - Click to navigate to settlement

4. **Real-Time Updates**
   - WebSocket connection indicator
   - New settlements animate in at top
   - Status changes highlight briefly
   - Sound/vibration option for mobile

5. **Notification Preferences**
   - Channel toggles: Email, SMS, Webhook
   - Threshold settings: Notify above $X
   - Quiet hours configuration
   - Per-currency preferences

6. **Settlement Details Modal**
   - Full settlement information
   - Timeline of status changes
   - Related notifications sent
   - Audit trail with timestamps
```

---

## Jira Data

### Sprints

| ID | Name | State | Start Date | End Date | Goal |
|----|------|-------|------------|----------|------|
| `sprint-28` | Sprint 28 | active | 2026-01-06 | 2026-01-19 | Real-time notifications and multi-currency |
| `sprint-27` | Sprint 27 | closed | 2025-12-23 | 2026-01-05 | Batch optimization and compliance prep |
| `sprint-29` | Sprint 29 | future | 2026-01-20 | 2026-02-02 | Custom audit exports and API v3 |

### Epics

| Key | Summary | Status | Priority | Labels |
|-----|---------|--------|----------|--------|
| PF-800 | Real-Time Treasury | In Progress | High | treasury, real-time, q1-priority |
| PF-810 | Multi-Currency Support | In Progress | High | currency, international, q1-2026 |
| PF-820 | Compliance Automation | To Do | Medium | compliance, audit, soc2 |

---

## Slack Channels

| ID | Name | Description | Members | Private |
|----|------|-------------|---------|---------|
| C101 | product | Product team discussions | 32 | No |
| C102 | eng-platform | Platform engineering team | 24 | No |
| C103 | customer-feedback | Customer feedback and insights | 48 | No |
| C104 | support-escalations | Escalated support issues | 12 | Yes |
| C105 | compliance | Compliance and security | 18 | Yes |

---

## Gong Calls

| ID | Title | Account | Duration | Sentiment | Topics |
|----|-------|---------|----------|-----------|--------|
| call-f01 | First Republic - QBR | First Republic | 60 min | Mixed | settlement, expansion, compliance |
| call-f02 | Stripe Connect - Product Demo | Stripe Connect | 45 min | Positive | demo, real-time, webhooks |
| call-f03 | Square Capital - Technical Review | Square Capital | 90 min | Positive | api, multi-currency, integration |
| call-f04 | Plaid Partners - Escalation | Plaid Partners | 30 min | Negative | performance, api, sla |

---

## Zendesk Tickets

| ID | Subject | Status | Priority | Requester | Tags |
|----|---------|--------|----------|-----------|------|
| ZD-8921 | Batch processing delays | Open | Urgent | sarah.mitchell@firstrepublic.com | batch, performance, enterprise |
| ZD-8918 | Settlement timing questions | Pending | High | ops@stripeconnect.com | settlement, timing |
| ZD-8915 | Multi-currency setup help | Open | Normal | treasury@squarecapital.com | currency, setup |
| ZD-8912 | API rate limiting concerns | Open | High | dev@plaidpartners.com | api, rate-limit |

---

## Deck Content Data

### Exec Presentation: Q1 Treasury Roadmap

#### Topic
```
Q1 2026 Treasury Product Roadmap - Board Update
```

#### Meeting Type
```
exec
```

#### Duration
```
30 minutes
```

#### Decision Needed
```
Approval for $2M engineering investment in real-time treasury infrastructure
```

#### Metrics Data
```
**Key Metrics:**
- Settlement volume: $45B/month (+18% QoQ)
- Real-time adoption: 0% → 45% target by Q2
- Customer NPS: 28 (target: 45)
- Enterprise pipeline: $2.1M ARR blocked on real-time

**Financial Impact:**
- $770K ARR blocked by real-time gaps
- $50K/month customer float costs
- 3x expansion potential with First Republic
```

#### Strategic Context
```
**Market Position:**
- Modern Treasury launched real-time (Jan 4) - competitive pressure
- Ramp multi-currency gaining traction
- Enterprise segment demanding real-time as table stakes

**Strategic Priorities:**
1. Close competitive gap on real-time features
2. Unblock $2.1M enterprise pipeline
3. Achieve SOC 2 Type II certification
```

#### Supporting Evidence
```
**Customer Evidence:**
- First Republic: "Real-time notifications would eliminate 3 FTEs" - VP Treasury
- Stripe Connect: "Settlement timing is our biggest pain point" - Ops Lead
- 134 community votes for real-time notifications

**Competitive Research:**
- Modern Treasury: Real-time tracking launched Jan 4
- All major competitors have real-time features
- 4 lost deals cited real-time as deciding factor
```

#### Risks and Mitigations
```
**Risks:**
1. Engineering capacity - 10-week timeline aggressive
   - Mitigation: Hire 2 senior engineers, defer API v3
2. Customer churn during development
   - Mitigation: Early access program for at-risk accounts
3. Integration complexity with banking partners
   - Mitigation: Phased rollout starting with top 5 banks

**Dependencies:**
- Kafka cluster setup (Ops team) - 2 weeks
- WebSocket infrastructure (Platform) - 3 weeks
- Banking partner API updates - External dependency
```

---

## AI Crawlers

### Social Crawler
**Description**: Monitor social platforms for payment/treasury discussions, competitor mentions, and FinTech sentiment.

| Platform | Keywords | Sample Results |
|----------|----------|----------------|
| Reddit | "PayFlow", "treasury automation", "payment reconciliation" | 8 posts, 34 comments, sentiment: 71% positive |
| Hacker News | "treasury software", "B2B payments" | 5 posts, 42 comments, sentiment: 68% positive |
| X/Twitter | "@PayFlow", "#treasurytech" | 67 mentions, sentiment: 74% positive |
| LinkedIn | "PayFlow Platform", "treasury automation" | 23 posts, sentiment: 82% positive |

### Web Search Crawler
**Description**: Search for competitor intelligence, FinTech news, and treasury market research.

| Query Type | Sample Query | Results |
|------------|--------------|---------|
| Competitor pricing | "Modern Treasury pricing 2026" | Enterprise tier increased 15% |
| Feature launches | "Ramp multi-currency launch" | 50+ currencies now supported |
| Industry trends | "real-time payments B2B trends" | 12 relevant articles |
| Regulatory | "payment processing regulations 2026" | New compliance requirements identified |

### News Crawler
**Description**: Monitor news sources for FinTech updates, competitor announcements, and regulatory changes.

| Source Type | Sample Sources | Recent Items |
|-------------|----------------|--------------|
| FinTech publications | FinTech Today, Payments Journal | 6 relevant articles |
| Press releases | PR Newswire, Business Wire | Modern Treasury Series C, Ramp expansion |
| Industry blogs | a]16z FinTech, Stripe blog | 8 treasury/payments posts |
| Regulatory | Federal Reserve, OCC | 2 payment regulation updates |

---

*Generated from pmkit mock-tenant package • FinTech Variation (PayFlow)*
