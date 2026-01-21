# CLAUDE.md

> Configuration file for Claude Code (claude.ai/code) when working on this codebase.

## Primary Documentation

**Read `AGENTS.md` for complete project documentation.** This file contains:

- Project overview and architecture
- Code conventions and patterns
- Package responsibilities
- How to add connectors, jobs, artifacts
- Database and testing information
- Frontend design system
- AI Crawlers and LLM configuration
- **Deployment infrastructure** (DigitalOcean App Platform)

> **Model Reference**: See [OpenAI Models Documentation](https://platform.openai.com/docs/models) for full details on GPT-5 series capabilities.

## TODO.md - Check Before/After Changes

**Always check `TODO.md`** for incomplete features and "coming soon" claims.

When building, bug fixing, or reviewing:
1. Check TODO.md for related incomplete work
2. Update status when completing items
3. Add new items when you discover incomplete features or make claims that aren't fully implemented
4. Keep TODO.md as the single source of truth

## Quick Start for Claude Code

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Start dev server
npm run dev

# Run tests
npm run test

# Type check
npm run typecheck

# Database commands
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
```

## Key Principles

1. **Draft-Only Pattern**: Never implement direct write tools. All external writes use `propose_*` tools.
2. **Read Before Edit**: Always inspect files before modifying them.
3. **Minimal Changes**: Only make changes that are directly requested.
4. **Zod Over Enums**: Use `z.enum()` not TypeScript enums.
5. **Multi-Tenancy**: All data is scoped by `tenantId`.

## Critical Files

| Purpose | Location |
|---------|----------|
| **TODO Tracking** | `TODO.md` |
| Domain Types | `packages/core/src/types/index.ts` |
| Billing Config | `packages/core/src/billing/index.ts` |
| Telemetry & SIEM | `packages/core/src/telemetry/index.ts` |
| Audit Logging | `packages/core/src/audit/index.ts` |
| MCP Framework | `packages/mcp/src/index.ts` |
| Job Runner | `packages/core/src/jobs/index.ts` |
| **Connector Fetchers** | `packages/core/src/fetchers/` |
| Prompt Templates | `packages/prompts/src/index.ts` |
| Crawler Analysis | `packages/prompts/src/crawler-analysis.ts` |
| Real Crawlers | `packages/core/src/crawlers/` |
| Database Schema | `prisma/schema.prisma` |
| Web App | `apps/web/src/` |
| Demo Data | `packages/mock-tenant/src/data/` |
| Admin Check | `apps/web/src/lib/admin.ts` |

## Deployment Infrastructure

**This project is deployed on DigitalOcean App Platform, NOT run locally in production.**

| Component | Type | Purpose |
|-----------|------|---------|
| **pmkit** | Web Service | Next.js frontend |
| **worker** | Worker | BullMQ job processor |
| **pmkit-db-postgresql** | Managed DB | PostgreSQL 17 |
| **pmkit-db-valkey** | Managed DB | Valkey 8 (Redis-compatible) |

Key files:
- `.do/app.yaml` - DigitalOcean App Platform spec
- `docker/Dockerfile.worker` - Worker container
- `docker/Dockerfile.web` - Web container

See "Deployment Infrastructure" section in AGENTS.md for full details.

## Monorepo Structure

```
packages/
├── core/          # Domain types, RBAC, audit, jobs, crawlers, billing
├── mcp/           # MCP framework, tool helpers
├── mcp-servers/   # Demo MCP servers per connector
├── mock-tenant/   # Demo dataset (Slack, Jira, Google, etc.)
├── prompts/       # Prompt templates, crawler analysis
└── content/       # Marketing content

apps/
├── web/           # Next.js 15 app (deployed as web service)
└── worker/        # BullMQ job worker (deployed as worker service)
```

## Connectors

### Production Ready (OAuth + Fetcher)
- Slack (`SlackFetcher`)
- Jira (`JiraFetcher`)
- Confluence (`ConfluenceFetcher`)
- Gmail (`GmailFetcher`)
- Google Drive (`DriveFetcher`)
- Google Calendar (`CalendarFetcher`)

### OAuth Pending (MCP Server Ready)
- Gong, Zendesk

### Coming Soon
- Figma, Amplitude, Linear

### Fetcher Location
- All fetchers: `packages/core/src/fetchers/`
- MCP servers (demo): `packages/mcp-servers/src/{connector}/`
- Mock data: `packages/mock-tenant/src/data/`

### AI Crawlers
- Social Crawler (Reddit, HN)
- Web Search Crawler
- News Crawler
- URL Scraper

## Billing & Plans

Plans are defined in `packages/core/src/billing/index.ts`:

| Plan | Price | Notes |
|------|-------|-------|
| Individual | $79/mo | Unlimited on-demand jobs |
| Teams | Contact Sales | 5+ seats |
| Enterprise | Contact Sales | SSO, data residency |
| Internal | $0 | Admin users (ADMIN_EMAILS) |

## Autonomous Agents

10 agent types with standardized UI. 3 are fully autonomous, 7 are "coming soon".

### Agent Categories

| Category | Agents |
|----------|--------|
| **Fully Autonomous** | Daily Brief, Meeting Prep, Sprint Review |
| **Coming Soon** | PRD Draft, VoC Clustering, Competitor Research, Roadmap Alignment, Deck Content, Release Notes, Prototype Generation |

### Key Files

- `apps/web/src/app/(authenticated)/agents/{agent}/page.tsx` - Agent setup pages
- `apps/web/src/app/(authenticated)/agents/{agent}/history/page.tsx` - History pages
- `apps/web/src/app/api/agents/{agent}/trigger/route.ts` - Manual trigger endpoints
- `packages/core/src/agents/daily-brief/` - Orchestrator, fetcher (reference)
- `apps/worker/src/agent-scheduler.ts` - BullMQ scheduler

### Agent Page UI Pattern

All agent pages have standardized buttons:
- **Run Now** (left, admin-only) - Uses `isAdmin` state
- **Save Agent Settings** (right, primary) - Disabled for "coming soon" agents

Fully autonomous agents have an **Agent Status** card with a toggle switch to enable/disable the agent. The toggle state is saved via "Save Agent Settings".

Admin check pattern:
```typescript
const [isAdmin, setIsAdmin] = useState(false);
useEffect(() => {
  fetch('/api/workbench/run-job')
    .then(res => res.json())
    .then(data => setIsAdmin(data.isAdmin === true));
}, []);
```

## When Making Changes

- **Adding a connector**: See "Adding a New Connector" in AGENTS.md
- **Adding a job type**: See "Adding a New Job Type" in AGENTS.md
- **Frontend work**: Follow the design system in AGENTS.md (cobalt accent, Space Grotesk headings)
- **Database changes**: Update both Prisma schema and Zod types
- **Billing changes**: Update `packages/core/src/billing/index.ts`

## Environment Variables

### Required
```bash
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
```

### OpenAI (use _DEMO or _PROD suffix, not plain OPENAI_API_KEY)
```bash
OPENAI_API_KEY_DEMO=sk-...   # For demo console and workbench
OPENAI_API_KEY_PROD=sk-...   # For production tenant jobs
USE_STUB_LLM=false           # Set to true to use stubs
```

### Admin Access
```bash
ADMIN_EMAILS=admin@example.com,dev@example.com  # Comma-separated
```

### Connector OAuth (when ready)
```bash
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
CONNECTOR_ENCRYPTION_KEY=...  # openssl rand -hex 32
```

## Testing

Demo mode uses mock servers - no external services needed. Run `npm run test` to execute tests.

Mock data locations:
- `packages/mock-tenant/src/data/slack.ts`
- `packages/mock-tenant/src/data/jira.ts`
- `packages/mock-tenant/src/data/google.ts`
- etc.

## Common Patterns

### Creating a Proposal Tool
```typescript
import { createProposalTool } from '@pmkit/mcp';

this.registerTool(
  createProposalTool('jira_epic', 'Propose a new epic', schema, 'jira', ...)
);
```

### Rendering Prompts
```typescript
import { renderPrompt, PROMPT_TEMPLATES } from '@pmkit/prompts';

const { system, user } = renderPrompt(PROMPT_TEMPLATES.daily_brief, context);
```

### Admin Check
```typescript
import { isAdminEmail } from '@/lib/admin';

if (isAdminEmail(session?.user?.email)) {
  // Allow workbench access
}
```
