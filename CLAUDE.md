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
```

## Key Principles

1. **Draft-Only Pattern**: Never implement direct write tools. All external writes use `propose_*` tools.
2. **Read Before Edit**: Always inspect files before modifying them.
3. **Minimal Changes**: Only make changes that are directly requested.
4. **Zod Over Enums**: Use `z.enum()` not TypeScript enums.

## Critical Files

| Purpose | Location |
|---------|----------|
| Domain Types | `packages/core/src/types/index.ts` |
| MCP Framework | `packages/mcp/src/index.ts` |
| Job Runner | `packages/core/src/jobs/index.ts` |
| Prompt Templates | `packages/prompts/src/index.ts` |
| Database Schema | `prisma/schema.prisma` |
| Web App | `apps/web/src/` |

## Monorepo Structure

```
packages/
├── core/          # Domain types, RBAC, audit, jobs
├── mcp/           # MCP framework, tool helpers
├── mcp-servers/   # Demo MCP servers per connector
├── mock-tenant/   # Demo dataset
├── prompts/       # Prompt templates
└── content/       # Marketing content

apps/
├── web/           # Next.js 15 app
└── worker/        # BullMQ job worker
```

## When Making Changes

- **Adding a connector**: See "Adding a New Connector" in AGENTS.md
- **Adding a job type**: See "Adding a New Job Type" in AGENTS.md
- **Frontend work**: Follow the design system in AGENTS.md (cobalt accent, Space Grotesk headings)
- **Database changes**: Update both Prisma schema and Zod types

## Testing

Demo mode uses mock servers - no external services needed. Run `npm run test` to execute tests.

