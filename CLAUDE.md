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
| Prompt Templates | `packages/prompts/src/index.ts` |
| Crawler Analysis | `packages/prompts/src/crawler-analysis.ts` |
| Real Crawlers | `packages/core/src/crawlers/` |
| Database Schema | `prisma/schema.prisma` |
| Web App | `apps/web/src/` |
| Demo Data | `packages/mock-tenant/src/data/` |
| Admin Check | `apps/web/src/lib/admin.ts` |

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
├── web/           # Next.js 15 app
└── worker/        # BullMQ job worker
```

## Connectors

### MVP Connectors (Available)
- Slack, Jira, Confluence, Gong, Zendesk

### Google Connectors (Mock Data Ready)
- Gmail (`packages/mcp-servers/src/gmail/`)
- Google Drive (`packages/mcp-servers/src/google-drive/`)
- Google Calendar (`packages/mcp-servers/src/google-calendar/`)
- Mock data: `packages/mock-tenant/src/data/google.ts`

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

The Daily Brief agent is the first autonomous agent, running on a schedule.

Key files:
- `apps/web/src/app/(authenticated)/agents/daily-brief/` - Setup UI
- `packages/core/src/agents/daily-brief/` - Orchestrator, fetcher
- `apps/worker/src/agent-scheduler.ts` - BullMQ scheduler
- `apps/web/src/app/api/agents/daily-brief/` - API routes

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
