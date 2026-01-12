# pmkit Mock Data - HealthTech Variation (MedSync)

> Mock data variation for demos featuring a B2B HealthTech patient engagement platform.

---

## Demo Tenant & Users

### Tenant

| Field | Value |
|-------|-------|
| ID | `demo-tenant-healthtech` |
| Name | MedSync |
| Slug | `medsync` |
| Timezone | America/Chicago |
| Week Starts | Monday |
| Sprint Duration | 14 days |
| Product Name | MedSync Platform |

### Users

| ID | Name | Email | Role |
|----|------|-------|------|
| `user-health-pm` | Dr. Amanda Foster | amanda.foster@medsync.health | pm |
| `user-health-admin` | Chris Martinez | chris.martinez@medsync.health | admin |
| `user-health-viewer` | Taylor Brooks | taylor.brooks@medsync.health | viewer |
| `user-health-guest` | Demo Guest | guest@demo.medsync.health | guest |

---

## Design System Guidelines

Use these guidelines when generating prototypes or designing new features for HealthTech/patient engagement applications.

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#0d9488` (teal-600) | Primary buttons, healthcare trust theme |
| `--primary-hover` | `#0f766e` (teal-700) | Hover states |
| `--background` | `#ffffff` | Page backgrounds |
| `--foreground` | `#1e293b` | Primary text |
| `--muted` | `#f8fafc` | Secondary backgrounds, cards |
| `--muted-foreground` | `#64748b` | Secondary text, placeholders |
| `--border` | `#e2e8f0` | Borders, dividers |
| `--urgent` | `#ef4444` (red-500) | Urgent alerts, critical status |
| `--scheduled` | `#3b82f6` (blue-500) | Scheduled appointments |
| `--success` | `#10b981` (emerald-500) | Completed, confirmed |
| `--pending` | `#f59e0b` (amber-500) | Pending actions |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Headings (h1-h6) | Space Grotesk | 24-36px | 600-700 |
| Body text | Geist Sans | 16px min | 400 |
| Code/mono | Geist Mono | 14px | 400 |
| Patient names | Geist Sans | 18px | 600 |
| Appointment times | Geist Sans | 16px | 500 |
| Helper text | Geist Sans | 14px | 400 |

**Accessibility Note:** Minimum font size of 16px for all body text to ensure readability.

### Component Library

Use shadcn/ui components:

| Component | Usage |
|-----------|-------|
| `Card` | Patient cards, appointment cards |
| `Badge` | Status indicators, appointment types |
| `Button` | Primary actions, minimum 44px touch target |
| `Avatar` | Patient/provider photos |
| `Tabs` | Content organization |
| `Calendar` | Appointment scheduling |
| `ScrollArea` | Message threads, records lists |

### Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `gap-2` | 8px | Compact spacing |
| `gap-3` | 12px | Standard spacing |
| `gap-4` | 16px | Section spacing |
| `gap-6` | 24px | Large section spacing |
| `gap-8` | 32px | Page section spacing |
| Touch target | 44px min | All interactive elements |

### Icons

Use Lucide React icons:

| Icon | Usage |
|------|-------|
| `Calendar` | Appointments, scheduling |
| `MessageSquare` | Secure messaging |
| `FileText` | Health records |
| `User` | Patient profile |
| `Bell` | Notifications |
| `Heart` | Health metrics |
| `Video` | Telehealth |
| `Phone` | Contact/call |

### Accessibility Requirements

```css
/* Focus indicators - high visibility */
outline: 2px solid var(--primary);
outline-offset: 2px;

/* Color contrast - WCAG AA minimum */
/* Text on background: 4.5:1 ratio */
/* Large text: 3:1 ratio */

/* Touch targets */
min-height: 44px;
min-width: 44px;

/* Skip navigation */
.skip-link:focus {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
}
```

### Interactive States

```css
/* Hover */
background: var(--muted);
border-color: var(--primary);

/* Focus */
outline: 2px solid var(--primary);
outline-offset: 2px;

/* Active/Selected */
background: var(--primary);
color: white;

/* Error */
border-color: var(--urgent);
color: var(--urgent);

/* Disabled */
opacity: 0.5;
cursor: not-allowed;
```

---

## Focus Areas for Prototypes

Use these focus areas when generating UI prototypes for HealthTech/patient engagement applications.

### Patient Portal Dashboard Prototype

```
**Focus Areas for Prototype**
1. Welcome message with patient name
2. Upcoming appointments (next 7 days)
3. Unread messages count with badge
4. Quick actions: Schedule, Message, Records
5. Health reminders and alerts
6. Accessibility: skip links, keyboard nav
```

### Appointment Scheduling Prototype

```
**Focus Areas for Prototype**
1. Provider selection with photos and specialties
2. Calendar view with available time slots
3. Appointment type selector (in-person, telehealth)
4. Confirmation screen with add-to-calendar
5. Large touch targets for mobile
6. Screen reader announcements for selections
```

### Secure Messaging Prototype

```
**Focus Areas for Prototype**
1. Inbox with message threads
2. Compose new message to provider
3. Attachment support (images, documents)
4. Read receipts and timestamps
5. Search messages functionality
6. High contrast mode support
```

### Health Records Viewer Prototype

```
**Focus Areas for Prototype**
1. Lab results with trend charts
2. Medication list with refill status
3. Visit summaries with provider notes
4. Immunization records
5. Download/share/print options
6. Data visualization accessibility
```

### Telehealth Waiting Room Prototype

```
**Focus Areas for Prototype**
1. Connection status indicator
2. Audio/video test controls
3. Waiting time estimate
4. Provider information display
5. Technical support access
6. Bandwidth quality indicator
```

---

## Workbench Copy/Paste Data

Ready-to-use data samples for the Workbench admin demo mode. Copy and paste these into the appropriate fields.

### Daily Brief Data

#### Slack Messages
```
#product-updates: "Patient portal v3 launching Thursday! 🏥" - Dr. Amanda Foster (👀 24, 🎉 18)
#product-updates: "Sprint 15 crushing it - 28/30 points complete" - Chris Martinez
#customer-success: "Cleveland Clinic escalation resolved - appointment sync fixed" - Maria Santos (✅ 12)
#engineering: "MS-456 hotfix deployed - HIPAA audit logging gap closed" - Dev Team (🔒 15)
#customer-feedback: "NPS from Kaiser: Score 9 - 'Best patient engagement platform we've evaluated'" - Support Bot
DM from CEO: "HIMSS presentation prep looking great. Let's review demo flow"
#support-escalations: "🔴 P1 resolved: Cleveland Clinic appointment sync - root cause was EHR API timeout" - Dev Team
#compliance: "HIPAA audit prep complete - 98% controls documented, 2 minor gaps identified" - Compliance Team
```

#### Jira Updates
```
**Sprint 15 Status (Jan 6-19)**

| Issue | Title | Status | Points |
|-------|-------|--------|--------|
| MS-423 | Patient portal redesign | In Progress (90%) | 13 |
| MS-425 | Telehealth integration | In Review | 8 |
| MS-428 | Appointment reminder AI | Done | 5 |
| MS-456 | P1: HIPAA audit logging | Done | - |

**Sprint Velocity**: 28/30 points (93%)

**Blockers:**
- MS-423 waiting on accessibility audit
- MS-430 deprioritized for compliance work

**Recent Activity:**
- MS-456 resolved (P1 compliance) - Jan 7
- MS-425 ready for security review
- HIPAA gap assessment completed
- 4 new feature requests from HIMSS feedback
```

#### Support Tickets
```
**Open Tickets (Last 7 Days)**

| Ticket | Customer | Priority | Subject | Age |
|--------|----------|----------|---------|-----|
| ZD-3421 | Cleveland Clinic | Urgent | Appointment sync delays | 2d |
| ZD-3418 | Kaiser Permanente | High | Telehealth integration questions | 3d |
| ZD-3415 | Mayo Clinic | Normal | Patient portal customization | 5d |
| ZD-3412 | Johns Hopkins | High | FHIR API compatibility | 6d |

**Resolved This Week:**
- ZD-3420: HIPAA audit logging gap (P1) - Resolved
- ZD-3419: Patient data export format - Resolved

**Themes:**
- EHR Integration: 42 tickets (32%)
- Patient Portal: 35 tickets (27%)
- Telehealth: 28 tickets (21%)
- Compliance/HIPAA: 18 tickets (14%)
- Other: 8 tickets (6%)
```

#### Community Activity
```
**Top Discussions:**
1. "FHIR R4 support timeline?" - 78 replies, 156 upvotes
   > "This is critical for our Epic integration" - health_it_director
2. "Patient portal accessibility improvements" - 56 replies, 112 upvotes
   > Staff reply: "WCAG 2.1 AA compliance shipping next sprint!"
3. "Telehealth platform comparison" - 45 replies, 89 upvotes

**Feature Requests:**
| Request | Votes | Status |
|---------|-------|--------|
| FHIR R4 full support | 156 | In Progress |
| WCAG 2.1 AA compliance | 112 | In Progress |
| AI appointment scheduling | 89 | Planned |
| Patient outcome tracking | 67 | Planned |

**New Posts Today:** 23
**Active Users This Week:** 567
```

---

### Meeting Prep Data

#### Recent Calls / Meeting Notes
```
**Cleveland Clinic QBR** (Jan 4, 75 min)
- Attendees: Dr. Sarah Chen (CMIO), Mike Thompson (IT Director), Dr. Amanda Foster (CSM)
- Topics: EHR integration issues, patient engagement metrics, expansion plans
- Key Quotes:
  > "Appointment sync delays are affecting patient satisfaction scores"
  > "We need FHIR R4 support for our Epic Hyperdrive migration"
  > "Patient portal adoption is at 67% - we want to hit 85% by Q3"
- Sentiment: Concerned but committed
- Next Steps: Follow up on sync fix, FHIR R4 timeline

**Cleveland Clinic Technical Review** (Dec 28, 60 min)
- Attendees: Mike Thompson, Engineering Team
- Issue: EHR API timeout causing appointment sync failures
- Resolution: Identified connection pooling issue, fix in progress
- Customer satisfaction: Frustrated - waiting for resolution

**Cleveland Clinic Expansion Discussion** (Dec 15, 45 min)
- Request: Add 12 regional hospitals to contract
- Priority: High (blocking $1.2M expansion)
- Dependency: FHIR R4 support and sync reliability
```

#### Support Tickets
```
**Open Tickets for Cleveland Clinic**

| Ticket | Priority | Subject | Age | Status |
|--------|----------|---------|-----|--------|
| ZD-3421 | Urgent | Appointment sync delays | 2d | In Progress |
| ZD-3415 | High | FHIR R4 timeline | 5d | Pending |
| ZD-3408 | Normal | Custom branding request | 12d | Planned |

**Resolved (Last 30 Days):**
- ZD-3395: Patient data migration - Resolved
- ZD-3388: SSO configuration - Resolved
- ZD-3375: Compliance report format - Resolved

**Ticket Trend:** 15 tickets in last 30 days (up from 10 previous month)
```

#### Account Health
```
**Account Health: Cleveland Clinic**

| Metric | Value | Trend |
|--------|-------|-------|
| Health Score | 71/100 | ⚠️ At Risk (was 78) |
| Contract Value | $420,000 ARR | - |
| Patient Volume | 2.1M patients | +8% |
| Renewal Date | June 1, 2026 | 143 days |
| NPS Score | 6 (Detractor) | Down from 8 |

**Expansion Potential:**
- Requested: 12 regional hospitals
- Blocker: FHIR R4, sync reliability
- Potential ARR: $1,620,000

**Key Contacts:**
- Dr. Sarah Chen (CMIO) - Executive sponsor, clinical champion
- Mike Thompson (IT Director) - Technical decision maker
- Lisa Park (Patient Experience) - Day-to-day contact

**Risk Factors:**
- Sync issues affecting patient satisfaction
- Competitor (Phreesia) mentioned in last QBR
- Epic Hyperdrive migration requires FHIR R4

**Opportunities:**
- 3.8x expansion if issues resolved
- Case study potential for health system segment
- Reference customer for HIMSS
```

---

### VoC Clustering Data

#### Support Tickets
```
**Support Ticket Themes (Last 30 Days)**

| Theme | Count | % of Total | Trend |
|-------|-------|------------|-------|
| EHR Integration | 42 | 32% | ↑ 25% |
| Patient Portal | 35 | 27% | ↑ 15% |
| Telehealth | 28 | 21% | ↑ 40% |
| Compliance/HIPAA | 18 | 14% | → Stable |
| Other | 8 | 6% | - |

**Sample Tickets by Theme:**

EHR Integration:
- "Appointment sync failing with Epic" - Cleveland Clinic
- "FHIR R4 support needed for Cerner migration" - Kaiser
- "HL7 message parsing errors" - Mayo Clinic

Patient Portal:
- "Accessibility issues for screen readers" - Multiple customers
- "Mobile app performance on older devices" - Johns Hopkins
- "Custom branding options limited" - Cleveland Clinic

Telehealth:
- "Video quality issues in rural areas" - Kaiser
- "Integration with Zoom for Healthcare" - Multiple customers
- "Waiting room customization needed" - Mayo Clinic
```

#### Call Insights
```
**Pain Points (from 35 calls)**

1. EHR integration reliability (mentioned in 18 calls, 51%)
   > "Appointment sync failures are affecting patient satisfaction" - Cleveland Clinic
   > "We need FHIR R4 for our Epic migration" - Kaiser
   > "HL7 parsing errors causing data discrepancies" - Mayo Clinic

2. Patient portal accessibility (12 calls, 34%)
   > "We're getting ADA complaints from patients" - Johns Hopkins
   > "Screen reader support is inadequate" - Cleveland Clinic
   > "Mobile experience needs improvement" - Multiple customers

3. Telehealth scalability (10 calls, 29%)
   > "Video quality degrades with more than 50 concurrent sessions" - Kaiser
   > "Need better integration with existing telehealth platforms" - Mayo Clinic
   > "Rural patients struggling with bandwidth requirements" - Cleveland Clinic

**Feature Requests from Calls:**
1. FHIR R4 full support (156 votes equivalent)
2. WCAG 2.1 AA compliance (112 votes equivalent)
3. AI appointment scheduling (89 votes equivalent)
4. Patient outcome tracking (67 votes equivalent)

**Competitive Mentions:**
- Phreesia: 8 mentions (patient intake)
- Luma Health: 5 mentions (scheduling)
- Klara: 4 mentions (patient communication)
```

#### Community Feedback
```
**Feature Requests (Community Forum)**

1. **FHIR R4 full support** (156 votes) - Status: In Progress
   > "Critical for Epic Hyperdrive migration"
   > "Interoperability requirements mandate this"

2. **WCAG 2.1 AA compliance** (112 votes) - Status: In Progress
   > "ADA compliance is non-negotiable for healthcare"
   > "Patients with disabilities are being excluded"

3. **AI appointment scheduling** (89 votes) - Status: Planned
   > "Reduce no-shows with intelligent reminders"
   > "Predictive scheduling would transform operations"

4. **Patient outcome tracking** (67 votes) - Status: Planned
   > "Need to demonstrate value-based care metrics"
   > "Outcome data is required for payer contracts"

**Discussion Themes:**
- EHR integration patterns: 45 posts, 3,400 views
- HIPAA compliance tips: 38 posts, 2,100 views
- Patient engagement strategies: 52 posts, 4,200 views
```

#### NPS Verbatims
```
**NPS Verbatims (Last 30 Days)**

Score 9-10 (Promoters):
- "Best patient engagement platform we've evaluated" - Kaiser PM
- "Clinical staff love the intuitive interface" - Mayo Clinic
- "Support team understands healthcare workflows" - Community hospital

Score 7-8 (Passives):
- "Great product, but FHIR R4 is critical for us" - Cleveland Clinic
- "Would be perfect with better accessibility" - Johns Hopkins
- "Solid but Phreesia has better Epic integration" - Enterprise customer

Score 0-6 (Detractors):
- "Sync issues affecting patient satisfaction scores" - Cleveland Clinic
- "Can't recommend until accessibility improves" - ADA-focused hospital
- "Telehealth quality not meeting expectations" - Rural health system

**NPS Summary:**
- Overall NPS: 34 (down from 42 last quarter)
- Enterprise NPS: 28 (EHR integration is main detractor)
- Mid-market NPS: 38
- Community hospitals NPS: 45
```

---

### Competitor Research Data

#### Competitor Updates
```
**Competitor Updates (Last 14 Days)**

### Phreesia
- **AI-powered patient intake launched** (Jan 5) 🔴 HIGH IMPACT
  - Natural language processing for intake forms
  - 40% reduction in intake time reported
  - Early reviews: "Game changer for patient experience"
  - Source: Healthcare IT News, HIMSS blog

- **Epic App Orchard certification** (Dec 30)
  - Deeper Epic integration
  - Streamlined implementation for Epic customers

### Luma Health
- **Predictive scheduling AI** (Jan 3) 🔴 HIGH IMPACT
  - ML-based no-show prediction
  - Automatic overbooking optimization
  - 25% reduction in no-shows claimed
  - Source: Company blog, Becker's Health IT

### Klara
- **Unified patient communication** (Dec 22) 🟡 MEDIUM IMPACT
  - SMS, email, and portal messaging unified
  - AI-suggested responses for staff
  - Source: Press release

### Relatient
- **Series C: $100M funding** (Dec 18) 🟡 MEDIUM IMPACT
  - Plans to expand enterprise sales
  - Focus on health system consolidation
  - Source: Crunchbase, Modern Healthcare
```

#### Feature Comparison
```
**Feature Comparison Matrix**

| Feature | Us | Phreesia | Luma Health | Klara |
|---------|-----|----------|-------------|-------|
| FHIR R4 Support | 🔜 | ✅ | ✅ | ⚠️ |
| WCAG 2.1 AA | 🔜 | ✅ | ⚠️ | ⚠️ |
| AI Scheduling | 🔜 | ✅ | ✅ | ❌ |
| Telehealth | ✅ | ✅ | ⚠️ | ✅ |
| Patient Portal | ✅ | ✅ | ✅ | ✅ |
| Epic Integration | ⚠️ | ✅ | ✅ | ⚠️ |
| Cerner Integration | ✅ | ✅ | ✅ | ✅ |
| HIPAA Compliant | ✅ | ✅ | ✅ | ✅ |
| Outcome Tracking | 🔜 | ⚠️ | ❌ | ❌ |

Legend: ✅ Available | 🔜 Coming Soon | ⚠️ Partial | ❌ Not Available

**Pricing Comparison (per provider/month):**
| Tier | Us | Phreesia | Luma Health | Klara |
|------|-----|----------|-------------|-------|
| Small Practice | $150 | $200 | $175 | $125 |
| Multi-location | $120 | $175 | $150 | $100 |
| Enterprise | $80 | $150 | $125 | Custom |
```

---

### PRD Draft Data

#### Customer Evidence
```
**Customer Evidence for FHIR R4 Support**

| Source | Count | Key Quote |
|--------|-------|-----------|
| Support tickets | 42 | "FHIR R4 is required for our Epic migration" |
| Gong calls | 18 | "Interoperability is non-negotiable" |
| Community | 156 votes | "Critical for Epic Hyperdrive" |
| NPS verbatims | 15 | "Can't expand without FHIR R4" |

**Enterprise Expansion Blocked:**
- Cleveland Clinic: $420K → $1.62M ARR (12 hospitals)
- Kaiser Permanente: $380K → $950K ARR (new regions)
- Johns Hopkins: New deal, $520K ARR
- **Total blocked ARR: $2.67M**

**Regulatory Pressure:**
- CMS Interoperability Rule requires FHIR support
- ONC certification depends on FHIR R4
- Payer contracts increasingly mandate interoperability

**Customer Quotes:**
> "Epic Hyperdrive migration requires FHIR R4 - no exceptions" - Cleveland Clinic CMIO
> "We can't recommend you to other health systems without this" - Kaiser IT Director
> "Interoperability is the future of healthcare IT" - Industry analyst
> "FHIR R4 is table stakes for 2026" - HIMSS attendee
```

#### Analytics Signals
```
**Integration Analytics (Last 30 Days)**

| Metric | Value | Change | Target |
|--------|-------|--------|--------|
| API calls/day | 2.4M | +22% | - |
| Integration errors | 0.8% | -0.2% | <0.5% |
| FHIR requests (R2) | 45% | -5% | 0% (migrate to R4) |
| HL7 v2 requests | 35% | -8% | <20% |
| Sync success rate | 98.2% | +0.5% | >99.5% |

**Customer Behavior:**
- 78% of enterprise customers requesting FHIR R4
- 45% have Epic Hyperdrive migration planned
- 32% blocked on expansion due to interoperability
- Average integration setup time: 6 weeks

**Funnel: Integration → Go-Live**
1. Contract signed: 100%
2. Integration started: 95%
3. Testing complete: 82%
4. Go-live: 78%
5. Full adoption: 65%
```

#### Technical Context
```
**Technical Context**

**Current Integration Infrastructure:**
- FHIR R2 (DSTU2) support
- HL7 v2.x message processing
- Custom Epic/Cerner adapters
- REST API with OAuth 2.0

**Proposed Changes:**
- Full FHIR R4 implementation
- SMART on FHIR authorization
- Bulk data export (FHIR Bulk Data)
- CDS Hooks integration
- US Core profile compliance

**Performance Considerations:**
- FHIR R4 queries: ~50ms target
- Bulk export: 1M records/hour
- Concurrent connections: 10K
- Data transformation overhead: <10ms

**Dependencies:**
- HAPI FHIR server upgrade
- OAuth 2.0 + SMART authorization
- US Core profile validation
- Epic App Orchard certification

**Estimated Effort:**
- Backend: 8 weeks (FHIR server, profiles)
- Integration: 4 weeks (Epic, Cerner adapters)
- Security: 2 weeks (SMART authorization)
- Testing: 3 weeks (certification prep)
- Total: 17 weeks
```

---

### Sprint Review Data

#### Completed Stories
```
**Sprint 15 Completed Work (Jan 6-19)**

| Issue | Type | Title | Points | Status |
|-------|------|-------|--------|--------|
| MS-423 | Story | Patient portal redesign | 13 | ✅ Done |
| MS-425 | Story | Telehealth integration | 8 | ✅ Done |
| MS-428 | Story | Appointment reminder AI | 5 | ✅ Done |
| MS-456 | Bug | P1: HIPAA audit logging | - | ✅ Done |
| MS-427 | Story | WCAG 2.1 AA compliance | 5 | ✅ Done |
| MS-455 | Bug | EHR sync timeout fix | - | ✅ Done |

**Carried Over:**
| Issue | Type | Title | Points | Reason |
|-------|------|-------|--------|--------|
| MS-430 | Story | FHIR R4 foundation | 8 | Deprioritized for P1 |

**Unplanned Work:**
- MS-456: P1 HIPAA compliance gap (2 days)
- Cleveland Clinic escalation support (1.5 days)
- HIMSS demo prep (1 day)
```

#### Sprint Metrics
```
**Sprint 15 Metrics**

| Metric | Committed | Completed | % |
|--------|-----------|-----------|---|
| Story Points | 30 | 28 | 93% |
| Stories | 6 | 5 | 83% |
| Bugs Resolved | 3 | 4 | 133% |
| P1 Issues | 1 | 1 | 100% |

**Velocity Trend:**
- Sprint 13: 24 pts
- Sprint 14: 26 pts
- Sprint 15: 28 pts
- 3-Sprint Average: 26 pts

**Work Distribution:**
- Customer-facing features: 65%
- Bug fixes: 15%
- Compliance/Security: 20%

**Quality Metrics:**
- Bugs found in sprint: 2
- Bugs escaped to production: 0
- Security review turnaround: 48 hours
- Test coverage: 85% (up from 82%)
```

---

### Release Notes Data

#### Completed Issues
```
**Completed Issues for v4.1.0**

| Issue | Type | Title | Description |
|-------|------|-------|-------------|
| MS-423 | Feature | Patient portal redesign | Modern, accessible patient portal experience |
| MS-425 | Feature | Telehealth integration | Seamless video visits within the platform |
| MS-428 | Feature | AI appointment reminders | Smart reminders that reduce no-shows |
| MS-427 | Feature | WCAG 2.1 AA compliance | Full accessibility for all patients |
| MS-456 | Bug | HIPAA audit logging | Complete audit trail for compliance |
| MS-455 | Bug | EHR sync reliability | Improved sync success rate to 99.5% |

**Performance Improvements:**
- Patient portal load time reduced by 45%
- EHR sync success rate improved to 99.5%
- Telehealth video quality improved for low-bandwidth
```

#### Epic Summaries
```
**Epic: Patient Experience 2.0 (MS-400)**

This release transforms the patient experience with a redesigned portal, improved accessibility, and AI-powered engagement.

**Key Outcomes:**
- 156 customer votes addressed (accessibility)
- WCAG 2.1 AA certification achieved
- 3 enterprise expansion blockers removed

**What's Included:**
- Redesigned patient portal
- Full accessibility compliance
- AI appointment reminders
- Integrated telehealth

**Customer Impact:**
- Expected 25% increase in portal adoption
- 30% reduction in no-shows with AI reminders
- ADA compliance for all patient interactions

**What's Next:**
- Phase 2: FHIR R4 full support (Q1 2026)
- Phase 3: Patient outcome tracking (Q2 2026)
```

---

### Prototype Generation Data

#### PRD Content (Sample)
```
# PRD: Patient Portal Redesign

## 1. Overview

### Problem Statement
Patients struggle to engage with their healthcare providers because the current portal is difficult to navigate and not accessible to users with disabilities.

### Goals
| Goal | Metric | Target |
|------|--------|--------|
| Increase portal adoption | Active patient users | 67% → 85% |
| Improve accessibility | WCAG compliance level | Partial → AA |

## 2. User Stories

1. **As a Patient**, I want an intuitive portal interface
   - Acceptance: Task completion rate >90% for common actions
   
2. **As a Patient with disabilities**, I want full accessibility support
   - Acceptance: WCAG 2.1 AA compliance certified

3. **As a Care Coordinator**, I want to see patient engagement metrics
   - Acceptance: Dashboard with adoption and usage analytics

4. **As a Clinic Admin**, I want to customize portal branding
   - Acceptance: Logo, colors, and messaging customization

## 3. Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| F1 | Responsive mobile-first design | P0 |
| F2 | WCAG 2.1 AA compliance | P0 |
| F3 | Appointment scheduling widget | P0 |
| F4 | Secure messaging center | P0 |
| F5 | Health records viewer | P1 |
| F6 | Custom branding options | P2 |

## 4. Key Flows

1. Patient logs in via SSO or credentials
2. Dashboard shows upcoming appointments and messages
3. Patient schedules new appointment
4. Confirmation sent via email/SMS
5. Patient views health records
6. Patient sends secure message to provider
7. Provider responds within portal
```

#### Design System Guidelines (for Prototype)
```
**Design System Guidelines**

**Components:**
- Use shadcn/ui components (Card, Badge, Button, Tabs, Avatar)
- Patient cards: clean, accessible design with large touch targets
- Appointment widgets: calendar-style with time slots
- Message threads: chat-style with read receipts

**Colors:**
- Primary actions: teal-600 (#0d9488) - healthcare/trust theme
- Urgent/Alert: red-500 (#ef4444)
- Success: emerald-500 (#10b981)
- Scheduled: blue-500 (#3b82f6)
- Pending: amber-500 (#f59e0b)
- Borders: slate-200 (#e2e8f0)
- Muted text: slate-500 (#64748b)

**Typography:**
- Patient names: text-lg (18px), font-semibold
- Appointment times: text-base (16px), font-medium
- Status labels: text-sm (14px), font-medium
- Helper text: text-sm, text-muted-foreground
- Minimum font size: 16px for accessibility

**Icons:**
- Use Lucide React icons
- Calendar for appointments
- MessageSquare for messages
- FileText for health records
- User for profile
- Bell for notifications
- Heart for health metrics

**Spacing:**
- Card padding: 20px 24px
- Touch target minimum: 44px × 44px
- Gap between sections: 24px
- Form field spacing: 16px

**Accessibility:**
- Focus indicators: ring-2 ring-teal-500, 2px offset
- Color contrast: minimum 4.5:1 for text
- Skip navigation links
- ARIA labels on all interactive elements
- Keyboard navigation support

**States:**
- Hover: bg-teal-50, border-teal-200
- Focus: ring-2 ring-teal-500/20, border-teal-500
- Active: bg-teal-100
- Disabled: opacity-50, cursor-not-allowed
- Error: border-red-500, text-red-600
```

#### Focus Areas (for Prototype)
```
**Focus Areas for Prototype**

1. **Patient Dashboard**
   - Welcome message with patient name
   - Upcoming appointments (next 7 days)
   - Unread messages count
   - Quick actions: Schedule, Message, Records
   - Health reminders and alerts

2. **Appointment Scheduling**
   - Provider selection with photos and specialties
   - Calendar view with available slots
   - Time slot selection with duration
   - Appointment type (in-person, telehealth)
   - Confirmation with add-to-calendar option

3. **Secure Messaging**
   - Inbox with message threads
   - Compose new message to provider
   - Attachment support (images, documents)
   - Read receipts and timestamps
   - Search messages

4. **Health Records Viewer**
   - Lab results with trends
   - Medication list with refill status
   - Visit summaries
   - Immunization records
   - Download/share options

5. **Accessibility Features**
   - High contrast mode toggle
   - Font size adjustment
   - Screen reader optimized
   - Keyboard shortcuts help
   - Skip to main content link

6. **Mobile Experience**
   - Bottom navigation bar
   - Swipe gestures for common actions
   - Pull to refresh
   - Offline appointment viewing
   - Push notification preferences
```

---

## Jira Data

### Sprints

| ID | Name | State | Start Date | End Date | Goal |
|----|------|-------|------------|----------|------|
| `sprint-15` | Sprint 15 | active | 2026-01-06 | 2026-01-19 | Patient portal and accessibility |
| `sprint-14` | Sprint 14 | closed | 2025-12-23 | 2026-01-05 | Telehealth and compliance |
| `sprint-16` | Sprint 16 | future | 2026-01-20 | 2026-02-02 | FHIR R4 foundation |

### Epics

| Key | Summary | Status | Priority | Labels |
|-----|---------|--------|----------|--------|
| MS-400 | Patient Experience 2.0 | In Progress | High | portal, ux, q1-priority |
| MS-410 | FHIR R4 Support | To Do | High | fhir, interoperability, q1-2026 |
| MS-420 | AI Engagement | In Progress | Medium | ai, scheduling, reminders |

---

## Slack Channels

| ID | Name | Description | Members | Private |
|----|------|-------------|---------|---------|
| C201 | product | Product team discussions | 28 | No |
| C202 | eng-platform | Platform engineering team | 22 | No |
| C203 | customer-feedback | Customer feedback and insights | 42 | No |
| C204 | support-escalations | Escalated support issues | 10 | Yes |
| C205 | compliance | HIPAA and security | 15 | Yes |

---

## Gong Calls

| ID | Title | Account | Duration | Sentiment | Topics |
|----|-------|---------|----------|-----------|--------|
| call-h01 | Cleveland Clinic - QBR | Cleveland Clinic | 75 min | Mixed | ehr, expansion, compliance |
| call-h02 | Kaiser - Product Demo | Kaiser Permanente | 60 min | Positive | demo, fhir, telehealth |
| call-h03 | Mayo Clinic - Technical Review | Mayo Clinic | 90 min | Positive | api, integration, security |
| call-h04 | Johns Hopkins - Escalation | Johns Hopkins | 30 min | Negative | accessibility, ada, portal |

---

## Zendesk Tickets

| ID | Subject | Status | Priority | Requester | Tags |
|----|---------|--------|----------|-----------|------|
| ZD-3421 | Appointment sync delays | Open | Urgent | mike.thompson@clevelandclinic.org | sync, ehr, enterprise |
| ZD-3418 | Telehealth integration | Pending | High | it@kaiser.org | telehealth, video |
| ZD-3415 | Portal customization | Open | Normal | lisa.park@mayoclinic.org | portal, branding |
| ZD-3412 | FHIR API compatibility | Open | High | dev@hopkinsmedicine.org | fhir, api |

---

## Deck Content Data

### Exec Presentation: FHIR R4 Investment Case

#### Topic
```
FHIR R4 Implementation - Board Investment Request
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
Approval for $1.5M investment in FHIR R4 infrastructure and Epic certification
```

#### Metrics Data
```
**Key Metrics:**
- Patient volume: 8.2M patients across customers (+12% QoQ)
- FHIR R4 requests: 45% of API calls (up from 30%)
- Integration success rate: 98.2% (target: 99.5%)
- Enterprise NPS: 28 (target: 42)

**Financial Impact:**
- $2.67M ARR blocked by FHIR R4 gaps
- Cleveland Clinic: $420K → $1.62M expansion blocked
- 78% of enterprise customers requesting FHIR R4
```

#### Strategic Context
```
**Market Position:**
- Phreesia achieved Epic App Orchard certification (Dec 30)
- CMS Interoperability Rule mandates FHIR support
- ONC certification depends on FHIR R4 compliance

**Strategic Priorities:**
1. Achieve Epic App Orchard certification by Q2
2. Unblock $2.67M enterprise pipeline
3. Meet regulatory compliance deadlines
```

#### Supporting Evidence
```
**Customer Evidence:**
- Cleveland Clinic: "Epic Hyperdrive migration requires FHIR R4 - no exceptions" - CMIO
- Kaiser: "We can't recommend you without FHIR R4" - IT Director
- 156 community votes for FHIR R4 support

**Regulatory Pressure:**
- CMS Interoperability Rule effective 2026
- ONC certification requires FHIR R4
- Payer contracts increasingly mandate interoperability
```

#### Risks and Mitigations
```
**Risks:**
1. 17-week timeline may slip
   - Mitigation: Dedicated FHIR team, external consultants
2. Epic certification process unpredictable
   - Mitigation: Early engagement with Epic, buffer time
3. Customer migration complexity
   - Mitigation: Parallel support for R2/R4, migration guides

**Dependencies:**
- HAPI FHIR server upgrade - 4 weeks
- Epic App Orchard application - 6 weeks review
- US Core profile validation - External testing
```

---

## AI Crawlers

### Social Crawler
**Description**: Monitor social platforms for healthcare IT discussions, patient engagement trends, and competitor mentions.

| Platform | Keywords | Sample Results |
|----------|----------|----------------|
| Reddit | "MedSync", "patient portal", "EHR integration" | 15 posts, 67 comments, sentiment: 69% positive |
| Hacker News | "healthcare IT", "FHIR", "patient engagement" | 8 posts, 53 comments, sentiment: 72% positive |
| X/Twitter | "@MedSync", "#healthIT", "#patientengagement" | 124 mentions, sentiment: 71% positive |
| LinkedIn | "MedSync Platform", "patient engagement" | 34 posts, sentiment: 78% positive |

### Web Search Crawler
**Description**: Search for competitor intelligence, healthcare IT news, and regulatory updates.

| Query Type | Sample Query | Results |
|------------|--------------|---------|
| Competitor features | "Phreesia AI intake 2026" | AI-powered intake launched Jan 5 |
| FHIR updates | "FHIR R4 implementation guide" | Updated US Core profiles released |
| Industry trends | "patient engagement trends 2026" | 18 relevant articles |
| Regulatory | "CMS interoperability rule 2026" | Compliance deadlines confirmed |

### News Crawler
**Description**: Monitor news sources for healthcare IT updates, competitor announcements, and regulatory changes.

| Source Type | Sample Sources | Recent Items |
|-------------|----------------|--------------|
| Healthcare IT publications | Healthcare IT News, HIMSS, Becker's | 12 relevant articles |
| Press releases | PR Newswire, Business Wire | Phreesia AI launch, Luma Health funding |
| Industry blogs | CHIME, AMIA | 9 interoperability posts |
| Regulatory | CMS, ONC, HHS | 4 compliance updates |

---

*Generated from pmkit mock-tenant package • HealthTech Variation (MedSync)*
