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

### Shareable Results (Workbench)

Share Crawler Results and PM Job artifacts via secure links or document export.

**MVP (Basic Sharing)**

| Item | Status | Notes |
|------|--------|-------|
| Export as Markdown file | ✅ Done | Download formatted .md file with full results |
| Export as HTML file | ✅ Done | For PRD to Prototype workflow; styled, self-contained HTML |
| Copy as formatted text | ✅ Done | One-click copy for Slack/email/Notion (Markdown and plain text) |
| Share dialog UI | ✅ Done | Modal with export options for PM Jobs and Crawler Results |

**Phase 2 (Shareable Links)**

| Item | Status | Notes |
|------|--------|-------|
| `SharedArtifact` database model | 🔜 Planned | Store shared content with secure token |
| `POST /api/share/create` endpoint | 🔜 Planned | Generate shareable link |
| `/share/[token]` public page | 🔜 Planned | View-only page, no auth required |
| Expiration options (24h, 7d, 30d, never) | 🔜 Planned | Auto-expire old shares |
| Copy link button | 🔜 Planned | Easy sharing UX |
| List/revoke shares | 🔜 Planned | Manage active shares |

**Phase 3 (Advanced Features)**

| Item | Status | Notes |
|------|--------|-------|
| Password-protected shares | 💡 Idea | Optional security layer |
| View count tracking | 💡 Idea | Analytics on share engagement |
| QR code generation | 💡 Idea | For presentations/meetings |
| Export to PDF | 💡 Idea | Formatted PDF with branding |
| Export to Confluence (proposal) | 💡 Idea | Uses draft-only pattern |
| Embed snippet for websites | 💡 Idea | `<iframe>` embed code |
| Share audit logging | 💡 Idea | Track who shared what, who viewed |

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
| **File Upload Crawler (5th AI Crawler)** | Crawlers | Upload PDF, DOCX, PPTX for AI analysis. Extract key data, synthesize insights, compare documents. Use cases: competitor whitepapers, analyst reports, sales decks, RFPs, contracts. Would need: file upload UI, document parsing (pdf-parse, mammoth), chunking for large docs, specialized analysis prompts. |
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
- **Added 4th AI Crawler: URL Scraper** - Fetch and analyze specific URLs for deep competitive research (pricing pages, feature pages, blog posts)
- Added File Upload Crawler idea to future considerations (5th AI Crawler for PDF/DOCX/PPTX analysis)
- Added Shareable Results feature plan (MVP: export as Markdown/copy, Phase 2: shareable links, Phase 3: advanced features)
- **Implemented MVP Sharing for Workbench** - Share dialog with export as Markdown/HTML, copy as formatted text for both PM Jobs and Crawler Results
- **Increased prototype_generation token limit** - Doubled from 24K to 48K tokens for complex HTML prototypes (FHIR dashboards, etc.)