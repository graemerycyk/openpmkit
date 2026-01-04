# Contributing to pmkit

Thank you for your interest in contributing to pmkit! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 15+ (optional for dev - demo works without it)
- Redis 7+ (optional for dev - uses inline fallback)

### Setup

```bash
# Clone the repository
git clone https://github.com/getpmkit/pmkit.git
cd pmkit

# Install dependencies
npm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local

# Generate Prisma client
npm run db:generate

# Start development servers
npm run dev
```

The development server runs at `http://localhost:3000`.

## Project Structure

pmkit is a Turborepo monorepo:

```
pmkit/
├── apps/
│   ├── web/              # Next.js 15 marketing + demo app
│   └── worker/           # BullMQ job worker
├── packages/
│   ├── core/             # Domain types, RBAC, audit, job runner
│   ├── mcp/              # MCP framework, tool helpers
│   ├── mcp-servers/      # Demo MCP servers (Jira, Slack, etc.)
│   ├── mock-tenant/      # Demo dataset
│   ├── prompts/          # Prompt templates + stub generators
│   └── content/          # Marketing content, blog posts
├── prisma/               # Database schema
└── docker/               # Docker configuration
```

## Development Workflow

### Running Commands

```bash
# Build all packages
npm run build

# Run development servers
npm run dev

# Run tests
npm run test

# Type check
npm run typecheck

# Lint
npm run lint
```

### Working with Turborepo

```bash
# Build only a specific package
turbo run build --filter=@pmkit/core

# Run dev for only the web app
turbo run dev --filter=web
```

## Code Conventions

### TypeScript

- Use Zod schemas for all domain types
- Infer TypeScript types from Zod schemas
- Use `z.enum()` instead of TypeScript enums

```typescript
// ✅ Correct
export const StatusSchema = z.enum(['pending', 'active', 'done']);
export type Status = z.infer<typeof StatusSchema>;

// ❌ Avoid
enum Status { Pending, Active, Done }
```

### MCP Tools

- Read tools: `get_*`, `search_*`, `list_*`, `find_*`
- Write tools: `propose_*` (never direct writes)
- All tools must have `inputSchema` and `outputSchema`
- Tool names are snake_case

### Draft-Only Pattern

All external writes must use proposal tools:

```typescript
// ✅ Correct: Proposal tool
this.registerTool(
  createProposalTool('jira_epic', 'Propose a new epic', schema, 'jira', ...)
);

// ❌ Wrong: Direct write tool
this.registerTool({ name: 'create_jira_epic', ... });
```

### Frontend

- Use shadcn/ui components from `apps/web/src/components/ui/`
- Follow the cobalt/indigo color scheme
- Headings use Space Grotesk, body uses Geist Sans
- Use Tailwind animations with staggered delays

## Making Changes

### Adding a New Connector

1. Create MCP server in `packages/mcp-servers/src/{connector}/index.ts`
2. Add mock data in `packages/mock-tenant/src/data/{connector}.ts`
3. Export from `packages/mcp-servers/src/index.ts`
4. Add connector key to schema if needed

### Adding a New Job Type

1. Add to `JobTypeSchema` in `packages/core/src/types/index.ts`
2. Add prompt template in `packages/prompts/src/index.ts`
3. Add stub generator function
4. Update Prisma enum in `prisma/schema.prisma`
5. Create job handler

### Adding a New Page

1. Create in `apps/web/src/app/(marketing)/` for marketing pages
2. Follow the established layout patterns
3. Export metadata for SEO
4. Use the design system (see AGENTS.md)

## Pull Request Process

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Run tests: `npm run test`
5. Run linting: `npm run lint`
6. Run type check: `npm run typecheck`
7. Submit a pull request

### PR Guidelines

- Keep PRs focused on a single change
- Write clear commit messages
- Update documentation if needed
- Add tests for new functionality
- Ensure all checks pass

## Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch
```

Demo mode uses mock servers - no external services needed for testing.

## Documentation

- `AGENTS.md` - Complete documentation for AI agents and developers
- `CLAUDE.md` - Quick reference for Claude Code
- `.cursorrules` - Cursor IDE configuration

## Questions?

- Check existing issues for similar questions
- Open a new issue for bugs or feature requests
- Start a discussion for general questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

