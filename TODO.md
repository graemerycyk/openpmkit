# pmkit TODO List

> **For AI Agents**: This file tracks incomplete features, "coming soon" claims, and future improvements. When building, bug fixing, or reviewing code:
> 1. Check this file for related incomplete work
> 2. Update status when completing items
> 3. Add new items when you discover incomplete features or make claims that aren't fully implemented
> 4. Keep this file as the single source of truth for what's done, half-done, and still to do

Last updated: 2026-01-14

---

## 🔴 Critical / Blocking

Items that block security reviews or make false claims.

| Item | Status | Notes |
|------|--------|-------|
| ~~Infrastructure statement (Vercel/Neon → DigitalOcean)~~ | ✅ Done | Fixed in `/security` page |

---

## 🚀 Deployment Checklist

Track production deployment progress. See `DEPLOYMENT.md` for full details.

### Phase 1: Infrastructure ✅ COMPLETE

| Item | Status | Notes |
|------|--------|-------|
| DigitalOcean PostgreSQL | ✅ Done | Managed PostgreSQL 17 cluster |
| DATABASE_URL configured | ✅ Done | Added to .env.local and DO App Platform |
| DigitalOcean Valkey (Redis) | ✅ Done | Managed Redis/Valkey cluster |
| REDIS_URL configured | ✅ Done | rediss:// format |
| DigitalOcean Spaces (S3) | ✅ Done | pmkit-artifacts bucket |
| S3 credentials configured | ✅ Done | S3_BUCKET, S3_REGION, S3_ENDPOINT, keys |

### Phase 2: LLM Configuration ✅ COMPLETE

| Item | Status | Notes |
|------|--------|-------|
| OpenAI Demo API key | ✅ Done | OPENAI_API_KEY_DEMO for demo console |
| OpenAI Production API key | ✅ Done | OPENAI_API_KEY_PROD for tenant jobs |
| Demo rate limits | ✅ Done | 10/hour, 50/day |

### Phase 3: Authentication ✅ COMPLETE

| Item | Status | Notes |
|------|--------|-------|
| NextAuth secret | ✅ Done | NEXTAUTH_SECRET generated |
| NEXTAUTH_URL | ✅ Done | https://getpmkit.com |
| Google OAuth app | ✅ Done | Client ID + secret configured |
| Google redirect URIs | ✅ Done | localhost + production callbacks |

### Phase 4: Microsoft OAuth 🔲 OPTIONAL

| Item | Status | Notes |
|------|--------|-------|
| Azure Portal app registration | 🔲 Pending | Microsoft Entra ID |
| Multitenant configuration | 🔲 Pending | "Accounts in any organizational directory" |
| Redirect URI | 🔲 Pending | `/api/auth/callback/azure-ad` |
| Client secret | 🔲 Pending | 24-month expiry recommended |
| API permissions | 🔲 Pending | openid, profile, email, User.Read |
| MICROSOFT_CLIENT_ID env var | 🔲 Pending | Add to .env.local + DO |
| MICROSOFT_CLIENT_SECRET env var | 🔲 Pending | Add to .env.local + DO |

### Phase 5: Stripe Billing 🔲 REQUIRED FOR PAID

| Item | Status | Notes |
|------|--------|-------|
| Stripe account setup | 🔲 Pending | Complete verification |
| API keys (live) | 🔲 Pending | pk_live_..., sk_live_... |
| Webhook endpoint | 🔲 Pending | `/api/webhooks/stripe` |
| Webhook events configured | 🔲 Pending | checkout.session.completed, subscription.*, invoice.* |
| Webhook signing secret | 🔲 Pending | whsec_... |
| Teams Plan product | 🔲 Pending | $900/seat/year |
| Price ID | 🔲 Pending | STRIPE_TEAMS_PRICE_ID |
| Env vars in DO | 🔲 Pending | All Stripe vars |

### Phase 6: Connector OAuth Apps 🔲 WHEN READY

Only needed for real customer data. Demo works with mock data.

**6.1 Atlassian (Jira + Confluence)**

| Item | Status | Notes |
|------|--------|-------|
| Atlassian Developer Console app | 🔲 Pending | OAuth 2.0 integration |
| Callback URL | 🔲 Pending | `/api/connectors/atlassian/callback` |
| Jira scopes | 🔲 Pending | read:jira-work, read:jira-user |
| Confluence scopes | 🔲 Pending | read:confluence-content.all, read:confluence-space.summary |
| ATLASSIAN_CLIENT_ID | 🔲 Pending | Add to env |
| ATLASSIAN_CLIENT_SECRET | 🔲 Pending | Add to env |

**6.2 Slack**

| Item | Status | Notes |
|------|--------|-------|
| Slack API app | 🔲 Pending | Create from scratch |
| Redirect URL | 🔲 Pending | `/api/connectors/slack/callback` |
| Bot scopes | 🔲 Pending | channels:history, channels:read, groups:history, groups:read, users:read, users:read.email |
| SLACK_CLIENT_ID | 🔲 Pending | Add to env |
| SLACK_CLIENT_SECRET | 🔲 Pending | Add to env |
| SLACK_SIGNING_SECRET | 🔲 Pending | Add to env |

**6.3 Gong**

| Item | Status | Notes |
|------|--------|-------|
| Gong API key or OAuth app | 🔲 Pending | Gong Developer Portal |
| Redirect URI | 🔲 Pending | `/api/connectors/gong/callback` |
| Scopes | 🔲 Pending | api:calls:read, api:users:read |
| GONG_CLIENT_ID | 🔲 Pending | Add to env |
| GONG_CLIENT_SECRET | 🔲 Pending | Add to env |

**6.4 Zendesk**

| Item | Status | Notes |
|------|--------|-------|
| Zendesk OAuth client | 🔲 Pending | Admin Center → APIs |
| Redirect URL | 🔲 Pending | `/api/connectors/zendesk/callback` |
| ZENDESK_CLIENT_ID | 🔲 Pending | Add to env |
| ZENDESK_CLIENT_SECRET | 🔲 Pending | Add to env |

**6.5 Connector Encryption**

| Item | Status | Notes |
|------|--------|-------|
| Generate encryption key | 🔲 Pending | `openssl rand -base64 32` |
| CONNECTOR_ENCRYPTION_KEY | 🔲 Pending | For encrypting OAuth tokens at rest |

### Phase 7: Analytics & SEO 🔲 OPTIONAL

| Item | Status | Notes |
|------|--------|-------|
| Simple Analytics | 🔲 Pending | NEXT_PUBLIC_SIMPLE_ANALYTICS_DOMAIN |
| Google Search Console | 🔲 Pending | NEXT_PUBLIC_GSC_VERIFICATION |
| Bing Webmaster Tools | 🔲 Pending | NEXT_PUBLIC_BING_VERIFICATION |

### Phase 8: Database Migration 🔲 REQUIRED

| Item | Status | Notes |
|------|--------|-------|
| Generate Prisma client | 🔲 Pending | `npm run db:generate` |
| Push schema to database | 🔲 Pending | `npm run db:push` |
| Verify tables created | 🔲 Pending | Check DO database console |

### Phase 9: Deployment 🔲 REQUIRED

| Item | Status | Notes |
|------|--------|-------|
| Connect GitHub repo to DO | 🔲 Pending | App Platform |
| Build command configured | 🔲 Pending | `npm run build` |
| Run command configured | 🔲 Pending | `npm run start` |
| Environment variables added | 🔲 Pending | All from .env.local |
| Custom domain configured | 🔲 Pending | getpmkit.com |
| HTTPS enabled | 🔲 Pending | Automatic with DO |
| Homepage loads | 🔲 Pending | Verify https://getpmkit.com |
| Demo console works | 🔲 Pending | Verify /demo/console |
| Google OAuth login works | 🔲 Pending | Test login flow |
| Database connection works | 🔲 Pending | Check logs |
| Redis connection works | 🔲 Pending | Check logs |

### Deployment Summary

| Phase | Status | Priority |
|-------|--------|----------|
| 1. Infrastructure | ✅ Complete | Required |
| 2. LLM Configuration | ✅ Complete | Required |
| 3. Authentication | ✅ Complete | Required |
| 4. Microsoft OAuth | 🔲 Pending | Optional |
| 5. Stripe Billing | 🔲 Pending | Required for paid |
| 6. Connector OAuth | 🔲 Pending | When ready |
| 7. Analytics & SEO | 🔲 Pending | Optional |
| 8. Database Migration | 🔲 Pending | **Required - Next** |
| 9. Deployment | 🔲 Pending | **Required - Next** |

**Recommended next steps:**
1. **Database Migration** (Phase 8) - Run `npm run db:push` to create tables
2. **Deployment** (Phase 9) - Deploy to DO App Platform
3. **Stripe** (Phase 5) - When ready to accept payments
4. **Connectors** (Phase 6) - When ready for real customer data

---

## 🟠 High Priority

Items that back up marketing claims or are needed for credibility.

### Beta Workflows (MCP Server Testing)

3 experimental workflows are being tested via the Claude MCP server app. These are NOT planned for Demo Console/Workbench - they're a POC for running workflows outside the main app.

| Item | Status | Notes |
|------|--------|-------|
| Feature Ideation (`/ideate`) | 🧪 Beta | Testing via MCP server. Transform ideas into structured feature concepts. |
| One-Pager (`/onepager`) | 🧪 Beta | Testing via MCP server. Executive summary (400-500 words). |
| TL;DR (`/tldr`) | 🧪 Beta | Testing via MCP server. Quick Slack-style summary (3-5 bullets). |

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

## 🎯 Autonomous Agent: Daily Brief ✅ MVP COMPLETE

**Goal**: Build an agent that runs automatically on a schedule, pulling real data from connected integrations and delivering a Daily Brief to the PM each morning.

**Status**: MVP implementation complete for Slack integration. Agent can be configured, runs autonomously on schedule, and delivers briefs with citations.

### Phase 1: Real Connector OAuth ✅ COMPLETE (Slack)

| Item | Status | Notes |
|------|--------|-------|
| **Slack OAuth integration** | ✅ Done | `/api/connectors/slack/authorize` + `/callback` |
| Slack scopes: `channels:history`, `channels:read`, `groups:history`, `groups:read`, `users:read` | ✅ Done | Public + private channel access |
| Slack token storage (encrypted) | ✅ Done | AES-256-GCM encryption with `CONNECTOR_ENCRYPTION_KEY` |
| Slack real data fetcher | ✅ Done | `packages/core/src/agents/daily-brief/slack-fetcher.ts` |
| Integrations settings page | ✅ Done | `/settings/integrations` with Connect/Disconnect |
| **Jira OAuth integration** | 🔜 Phase 2 | Not needed for Slack-only MVP |
| **Zendesk OAuth integration** | 🔜 Phase 2 | Not needed for Slack-only MVP |

### Phase 2: Scheduled Job Infrastructure ✅ COMPLETE

| Item | Status | Notes |
|------|--------|-------|
| **AgentConfig database model** | ✅ Done | `prisma/schema.prisma` - stores config, nextRunAt, lastRunAt |
| **Agent setup UI** | ✅ Done | `/agents/daily-brief` with channel selection, delivery time, timezone |
| Time selector | ✅ Done | 6am-10am options |
| Timezone selector | ✅ Done | Auto-detect with manual override, 14 timezones |
| **BullMQ scheduled jobs** | ✅ Done | `apps/worker/src/agent-scheduler.ts` |
| Schedule sync on startup | ✅ Done | Worker loads active configs on boot |
| Agent config CRUD API | ✅ Done | `POST/GET/DELETE /api/agents/daily-brief` |

### Phase 3: Autonomous Execution ✅ COMPLETE

| Item | Status | Notes |
|------|--------|-------|
| **Agent orchestrator** | ✅ Done | `packages/core/src/agents/daily-brief/orchestrator.ts` |
| Data fetching step | ✅ Done | Fetches messages from selected channels |
| Citation tracking | ✅ Done | `citation-tracker.ts` - tracks sources with permalinks |
| Prompt assembly | ✅ Done | Formats messages with citation numbers |
| LLM generation | ✅ Done | Uses existing LLMService |
| Artifact storage | ✅ Done | Stores to `Artifact` model with stats |
| Source storage | ✅ Done | Stores to `Source` model for traceability |
| **Manual trigger** | ✅ Done | "Run Now" button + API |
| Dashboard notification | ✅ Done | Brief appears in history |
| Failure handling & retry | ✅ Done | BullMQ retry with exponential backoff |
| Execution audit logging | ✅ Done | Full audit trail via AuditLog |
| **Delivery: Slack DM** | 🔜 Future | Post brief to user's Slack DM |
| Delivery: Email | 💡 Idea | Send as email digest |

### Phase 4: User Configuration ✅ COMPLETE

| Item | Status | Notes |
|------|--------|-------|
| Channel selection | ✅ Done | Multi-select checkbox list of channels |
| Lookback window | ✅ Done | 24h or 36h (weekend coverage) |
| Delivery time | ✅ Done | 6am-10am in user's timezone |
| Pause/resume schedule | ✅ Done | Active/Paused toggle |
| **Brief history page** | ✅ Done | `/agents/daily-brief/history` |
| **Brief detail page** | ✅ Done | `/agents/daily-brief/[jobId]` with download |
| Skip weekends option | 🔜 Future | Not in MVP |
| Priority keywords | 💡 Idea | Highlight certain terms |

### Future Enhancements

| Item | Status | Notes |
|------|--------|-------|
| Gmail/Drive/Calendar connectors | 🔜 Phase 2 | Expand data sources |
| Cross-workflow orchestration | 💡 Idea | Daily Brief triggers VoC clustering |
| Slack DM delivery | 🔜 Future | Send brief directly to Slack |
| Email delivery | 💡 Idea | Morning email digest |
| Multiple agents per user | 💡 Idea | Different configs for different use cases |

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Scheduler Service                            │
│  (BullMQ with repeat jobs, runs in apps/worker)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Agent Orchestrator                            │
│  1. Load ScheduledJob config                                     │
│  2. Fetch credentials from ConnectorInstall                      │
│  3. Call real connectors (Slack, Jira, Zendesk)                 │
│  4. Assemble prompt context                                      │
│  5. Generate artifact via LLM                                    │
│  6. Store artifact                                               │
│  7. Deliver to user (Slack DM / Email / Dashboard)              │
│  8. Log execution to AuditLog                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │  Slack   │   │   Jira   │   │ Zendesk  │
        │   API    │   │   API    │   │   API    │
        └──────────┘   └──────────┘   └──────────┘
```

### Data Flow for Daily Brief

```
Input Sources:
├── Slack: Messages from last 24h in selected channels
│   └── slackMessages: Channel activity, mentions, threads
├── Jira: Updates from last 24h in selected projects
│   └── jiraUpdates: Status changes, new issues, comments
├── Zendesk: Tickets updated in last 24h
│   └── supportTickets: New/updated tickets, escalations
└── Community: Recent posts (optional, can use crawler)
    └── communityActivity: Feature requests, discussions

Output:
├── Artifact: Markdown Daily Brief
│   ├── TL;DR (2-3 sentences)
│   ├── Urgent Items (blockers, escalations)
│   ├── Sprint Progress
│   ├── Customer Signal
│   └── Recommended Actions
└── Delivery: Slack DM to user
```

### Success Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| Schedule reliability | 99.5% | Jobs run on time |
| Data freshness | < 5 min old | Data fetched at execution time |
| Generation success rate | > 95% | Briefs generated without error |
| Delivery success rate | > 99% | Briefs delivered to user |
| User engagement | > 50% open rate | Users read their briefs |

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

### Billing & Subscription

| Item | Status | Notes |
|------|--------|-------|
| Stripe integration | 🔜 Planned | Subscription schema exists, need webhook handlers |
| Seat management UI | 🔜 Planned | For Teams plan (5+ seats) |
| Usage billing dashboard | 🔜 Planned | Show token usage, job counts per billing period |
| Upgrade/downgrade flow | 🔜 Planned | Self-service plan changes |
| Invoice history page | 🔜 Planned | View past invoices in dashboard |

### Proposal Execution

| Item | Status | Notes |
|------|--------|-------|
| Proposal approval execution | 🔜 Planned | When proposal approved, execute the write to external system |
| Proposal rejection workflow | 🔜 Planned | Record rejection reason, notify creator |
| Proposal edit-before-approve | 🔜 Planned | Allow reviewers to modify bundle before approval |
| Proposal notifications | 🔜 Planned | Email/Slack notifications for pending proposals |

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

### User Experience Improvements

| Item | Status | Notes |
|------|--------|-------|
| Job templates / presets | 💡 Idea | Save common configurations for quick re-runs |
| Favorite workflows | 💡 Idea | Pin frequently used workflows to top |
| Recent inputs auto-fill | 💡 Idea | Remember last inputs for each workflow type |
| Keyboard shortcuts | 💡 Idea | Ctrl+Enter to run, etc. |
| Dark mode toggle | 💡 Idea | User preference for dark/light theme |
| Mobile-responsive workbench | 💡 Idea | Better mobile experience for viewing results |

### Integrations & Triggers

| Item | Status | Notes |
|------|--------|-------|
| Slack bot integration | 🔜 Planned | Run workflows via Slack commands (claimed on website) |
| Teams bot integration | 🔜 Planned | Run workflows via Teams mentions (claimed on website) |
| Email-triggered workflows | 💡 Idea | Forward emails to trigger jobs (claimed on website) |
| Scheduled/recurring jobs | 💡 Idea | Auto-run daily brief every morning |
| Webhook triggers | 💡 Idea | External systems can trigger jobs via API |
| Zapier/Make integration | 💡 Idea | No-code automation platform support |

### Multi-Language Support

| Item | Status | Notes |
|------|--------|-------|
| i18n framework setup | 💡 Idea | Support for non-English users |
| Prompt localization | 💡 Idea | Generate artifacts in user's preferred language |

---

## 📝 Documentation Gaps

Items where documentation claims features that aren't fully implemented.

| Claim | Location | Status | Notes |
|-------|----------|--------|-------|
| "SIEM integration via webhook" | Trust page, Resources FAQ | 🔜 Schema only | Need actual webhook endpoint |
| "Export audit logs to CSV or JSON" | Resources FAQ | 🔜 Planned | Need export API |
| "Audit export API" | Pricing page | 🔜 Planned | Enterprise feature |
| "Slack commands" | How It Works, Demo Console | 🔜 Demo only | Simulated in demo, not real Slack integration |
| "Teams mentions" | How It Works | 🔜 Demo only | Simulated in demo, not real Teams integration |
| "Email instructions" | How It Works | 🔜 Not implemented | Claimed as trigger method but not built |
| "Custom connectors (built on demand)" | Pricing page | 🔜 Enterprise feature | Need custom connector framework |
| "Bring-your-own LLM endpoint" | Pricing page | 🔜 Enterprise feature | Need LLM endpoint configuration |
| "13 PM workflows" | Standalone MCP server | 🧪 By Design | 10 production workflows + 3 beta workflows in MCP server for testing |

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
| **Artifact comparison/diff view** | Artifacts | Compare two versions of a PRD, VoC report, etc. to see what changed. Useful for iteration tracking. |
| **Artifact versioning** | Artifacts | Store multiple versions of an artifact, track evolution over time |
| **Workflow chaining UI** | Workflows | Visual pipeline builder: VoC → PRD → Prototype with auto-pass of context |
| **Custom workflow builder** | Workflows | Let users create their own prompt templates with custom fields |
| **Team collaboration features** | Collaboration | Comments on artifacts, @mentions, shared workspaces |
| **Artifact search** | Discovery | Full-text search across all generated artifacts |
| **Dashboard analytics** | Analytics | Charts showing job usage, popular workflows, time saved metrics |
| **Customer success metrics** | Analytics | Track "time saved" and "documents generated" per user/team |
| AI-powered anomaly detection | Telemetry | Use LLM to analyze patterns |
| Slack/Teams bot for status alerts | Status | Push notifications for incidents |
| Self-service connector OAuth | Connectors | Let users connect without sales |
| Prompt version tracking | Telemetry | Track which prompt versions perform best |
| A/B testing for prompts | Prompts | Compare prompt performance |
| Cost allocation by team | Billing | Break down LLM costs by team/user |
| **Bring-your-own LLM** | Enterprise | Support custom LLM endpoints (claimed on pricing page as enterprise feature) |
| **Custom connectors API** | Enterprise | Let enterprise customers build their own connectors |
| **Artifact templates** | Workflows | Pre-filled templates for common scenarios (e.g., "Mobile App PRD", "API Feature PRD") |
| **Feedback loop on artifacts** | Quality | Rate generated artifacts, use ratings to improve prompts |
| **Export to Notion** | Integrations | One-click export artifacts to Notion pages |
| **Export to Linear** | Integrations | Create Linear issues from PRDs |
| **Export to Asana** | Integrations | Create Asana tasks from sprint reviews |
| **AI writing assistant** | Editing | In-line AI suggestions when editing artifacts |

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ Done | Fully implemented and tested |
| 🔄 In Progress | Currently being worked on |
| 🔜 Planned | Committed to roadmap |
| 🔜 Coming Soon | Claimed on marketing pages |
| 🧪 Beta | Experimental, being tested via MCP server |
| 💡 Idea | Discussed but not committed |
| ❓ Consider | Needs evaluation |
| ❌ Won't Do | Decided against |

---

## Changelog

### 2026-01-14
- **Added Deployment Checklist** - Full 9-phase deployment tracking:
  - Phase 1-3 ✅ Complete: Infrastructure (DO PostgreSQL, Valkey, Spaces), LLM config, Google OAuth
  - Phase 4 🔲 Optional: Microsoft OAuth (Azure AD)
  - Phase 5 🔲 Required for paid: Stripe billing (webhook, products, pricing)
  - Phase 6 🔲 When ready: Connector OAuth (Atlassian, Slack, Gong, Zendesk, encryption key)
  - Phase 7 🔲 Optional: Analytics & SEO (Simple Analytics, GSC, Bing)
  - Phase 8-9 🔲 Next: Database migration (`npm run db:push`) and DO App Platform deployment

### 2026-01-13
- **Added pmkit-prompts MCP Server** - Standalone MCP server exposing all 13 PM workflows as tools for the Claude app
  - Created `packages/mcp-servers/src/pmkit-prompts/` with server implementation
  - All 13 workflows available: daily_brief, meeting_prep, voc_clustering, competitor_research, roadmap_alignment, prd_draft, sprint_review, prototype_generation, release_notes, deck_content, feature_ideation, one_pager, tldr
  - Comprehensive README.md with setup instructions, usage examples, and troubleshooting
  - QUICKSTART.md for 5-minute setup
  - Standalone server executable with environment configuration
  - Natural language invocation: "Create a Prototype based on this PRD draft"
- **Clarified beta workflows** - feature_ideation, one_pager, tldr are experimental (🧪 Beta) being tested via MCP server, NOT planned for Demo Console/Workbench
- **Added Autonomous Agent plan** - Comprehensive 4-phase plan for scheduled Daily Brief agent:
  - **Phase 1**: Real connector OAuth (Slack, Jira, Zendesk) - required before automation
  - **Phase 2**: Scheduled job infrastructure (ScheduledJob model, BullMQ repeat jobs, timezone support)
  - **Phase 3**: Autonomous execution (Agent orchestrator, data fetching, LLM generation, Slack DM delivery)
  - **Phase 4**: User configuration (channel selection, lookback window, skip weekends)
  - Added architecture diagram and data flow documentation
  - Added success metrics (99.5% schedule reliability, 95% generation success, 50%+ user engagement)
- **Comprehensive TODO.md review** - Added 50+ new feature items across categories:
  - Billing & subscription features (Stripe, seat management, usage billing)
  - Proposal execution workflow (approval, rejection, notifications)
  - User experience improvements (templates, favorites, shortcuts, dark mode)
  - Integration triggers (Slack bot, Teams bot, email, scheduled jobs, webhooks)
  - Documentation gaps (Slack/Teams/email claims, custom connectors, BYOLLM)
  - Future ideas (artifact versioning, workflow chaining, team collaboration, analytics)

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
- **Increased LLM timeout to 10 minutes** - Large requests like prototype generation (48K tokens) need more time to complete
- **Fixed workbench history viewing** - Can now view completed jobs from history while another job is running
- **Added model selector to workbench** - Switch between GPT-5 Nano (cheapest), GPT-5 Mini (default), and GPT-5.2 (high quality) for demos
- **Fixed missing Deck Content workflow** - Added `deck_content` to workbench job types (was missing from the list)