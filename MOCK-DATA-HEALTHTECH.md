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

## Workbench Copy/Paste Data

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

*Generated from pmkit mock-tenant package • HealthTech Variation (MedSync)*
