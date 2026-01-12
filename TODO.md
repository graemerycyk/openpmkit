# pmkit TODO List

> **For AI Agents**: This file tracks incomplete features, "coming soon" claims, and future improvements. When building, bug fixing, or reviewing code:
> 1. Check this file for related incomplete work
> 2. Update status when completing items
> 3. Add new items when you discover incomplete features or make claims that aren't fully implemented
> 4. Keep this file as the single source of truth for what's done, half-done, and still to do

Last updated: 2026-01-12

---

## 🔴 Critical / Blocking

Items that block security reviews or make false claims.

| Item | Status | Notes |
|------|--------|-------|
| ~~Infrastructure statement (Vercel/Neon → DigitalOcean)~~ | ✅ Done | Fixed in `/security` page |

---

## 🟠 High Priority

Items that back up marketing claims or are needed for credibility.

### Audit & Telemetry

| Item | Status | Notes |
|------|--------|-------|
| ~~Wire up AuditLog in demo console~~ | ✅ Done | Added Audit Log tab to demo console |
| ~~SIEM export schema~~ | ✅ Done | `packages/core/src/telemetry/index.ts` |
| ~~Extended telemetry schema~~ | ✅ Done | Added runId, stepId, token usage, etc. |
| ~~Analysis type definitions~~ | ✅ Done | Failure clustering, drift detection, anomaly baselines |
| ~~Guardrail/refusal audit events~~ | ✅ Done | Added to AuditActionSchema and AuditLogger |
| ~~SIEM export demo (Demo Console)~~ | ✅ Done | Added SIEMExportPreview to Audit tab |
| ~~SIEM export demo (Workbench)~~ | ✅ Done | Added SIEMExportPreview to Output tab |
| Implement actual SIEM webhook export | 🔜 Planned | Schema exists, need API endpoint |
| Implement failure-mode clustering logic | 🔜 Planned | Types exist, need implementation |
| Implement drift detection logic | 🔜 Planned | Types exist, need implementation |
| Implement anomaly baseline calculation | 🔜 Planned | Types exist, need implementation |
| Add audit log tab to Workbench | 🔜 Planned | Currently only in demo console |

### Status Page

| Item | Status | Notes |
|------|--------|-------|
| ~~Basic /status page~~ | ✅ Done | Static page at `getpmkit.com/status` |
| Move status page to subdomain | 🔜 Planned | `status.getpmkit.com` for resilience |
| Real-time status monitoring | 🔜 Planned | Currently hardcoded "operational" |
| Incident history from database | 🔜 Planned | Currently shows "no incidents" |
| Status webhook notifications | 🔜 Planned | For enterprise customers |

---

## 🟡 Medium Priority

Features that are claimed as "coming soon" or partially implemented.

### Enterprise Features (Pricing Page Claims)

| Item | Status | Notes |
|------|--------|-------|
| Data residency options | 🔜 Coming Soon | Claimed on pricing page |
| Customer-managed keys (KMS) | 🔜 Coming Soon | Claimed on pricing page |
| Private networking / on-prem | 🔜 Coming Soon | Claimed on pricing page |
| SAML SSO | 🔜 Planned | Enterprise plan feature |
| SCIM directory sync | 🔜 Planned | Enterprise plan feature |
| Audit export API | 🔜 Planned | Enterprise feature, schema exists |

### Authentication

| Item | Status | Notes |
|------|--------|-------|
| Microsoft login | 🔜 Coming Soon | Shown on login page |
| Apple login | ❓ Consider | Not currently planned |

### Compliance

| Item | Status | Notes |
|------|--------|-------|
| SOC 2 Type II | 🔄 In Progress | Claimed on trust/security pages |
| ISO 27001 | 🔜 Planned | Post-SOC 2 |

---

## 🟢 Lower Priority

Nice-to-have improvements and optimizations.

### Demo & Workbench

| Item | Status | Notes |
|------|--------|-------|
| Real connector OAuth flows | 🔜 Planned | Currently all mock data |
| Workbench audit log tab | 🔜 Planned | Show audit trail for admin users |
| Demo rate limit UI improvements | 💡 Idea | Better feedback when rate limited |
| Persist Workbench data to database | 🔜 Planned | Currently uses localStorage; should persist PM Jobs and Crawler Results to database for logged-in users |

### Telemetry & Observability

| Item | Status | Notes |
|------|--------|-------|
| OpenTelemetry integration | 💡 Idea | For distributed tracing |
| Prometheus metrics endpoint | 💡 Idea | For monitoring |
| Grafana dashboard templates | 💡 Idea | For customers |

### Performance

| Item | Status | Notes |
|------|--------|-------|
| LLM response caching | 💡 Idea | Cache identical prompts |
| Connector response caching | 💡 Idea | Cache MCP tool responses |

---

## 📝 Documentation Gaps

Items where documentation claims features that aren't fully implemented.

| Claim | Location | Status | Notes |
|-------|----------|--------|-------|
| "SIEM integration via webhook" | Trust page, Resources FAQ | 🔜 Schema only | Need actual webhook endpoint |
| "Export audit logs to CSV or JSON" | Resources FAQ | 🔜 Planned | Need export API |
| "Audit export API" | Pricing page | 🔜 Planned | Enterprise feature |

---

## 🐛 Known Issues

| Issue | Status | Notes |
|-------|--------|-------|
| None currently tracked | - | - |

---

## 💡 Ideas & Future Considerations

Items that have been discussed but not committed to.

| Idea | Category | Notes |
|------|----------|-------|
| AI-powered anomaly detection | Telemetry | Use LLM to analyze patterns |
| Slack/Teams bot for status alerts | Status | Push notifications for incidents |
| Self-service connector OAuth | Connectors | Let users connect without sales |
| Prompt version tracking | Telemetry | Track which prompt versions perform best |
| A/B testing for prompts | Prompts | Compare prompt performance |
| Cost allocation by team | Billing | Break down LLM costs by team/user |

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ Done | Fully implemented and tested |
| 🔄 In Progress | Currently being worked on |
| 🔜 Planned | Committed to roadmap |
| 🔜 Coming Soon | Claimed on marketing pages |
| 💡 Idea | Discussed but not committed |
| ❓ Consider | Needs evaluation |
| ❌ Won't Do | Decided against |

---

## Changelog

### 2026-01-12
- Created TODO.md
- Completed: Infrastructure fix, AuditLog wiring, /status page, SIEM schema, telemetry schema, analysis types, guardrail events
- Added tracking for all "coming soon" claims from marketing pages
- Added SIEM export demo to Demo Console (Audit tab) and Workbench (Output tab)
- Created reusable `SIEMExportPreview` component with JSON/CEF format toggle, copy, and download
- Fixed horizontal overflow in Workbench Crawler Results (CSS min-w-0, max-w-full)
- Added localStorage persistence for Crawler Jobs (similar to PM Jobs history)
- Added TODO item for database persistence of Workbench data
- Added Deck Content workbench data to `MOCK-DATA.md` (was missing, now consistent with FINTECH and HEALTHTECH variations)