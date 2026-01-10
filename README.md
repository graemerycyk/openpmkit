# pmkit

> Your daily PM toolkit - briefs, meetings, and PRDs made simple.

pmkit is an AI-powered product management agent that runs daily briefs, meeting prep, VoC clustering, competitor research, roadmap alignment, PRD drafts, sprint reviews, and prototype generation; all with draft-only governance and full traceability.

## Features

- **8 Workflow Jobs**: Daily brief, meeting prep, VoC clustering, competitor research, roadmap alignment, PRD draft, sprint review, prototype generation
- **Draft-Only**: Agents propose changes but never write directly to external systems
- **Full Traceability**: Every tool call, source, and artifact is logged
- **Enterprise Governance**: RBAC, permission simulation, audit logging
- **MCP Connectors**: Standardized integration with Jira, Confluence, Slack, Gong, Zendesk, and more

## Tech Stack

- **Frontend**: Next.js 15, React 18, Tailwind CSS, shadcn/ui
- **Backend**: Node.js 20+, BullMQ, Redis
- **Database**: PostgreSQL, Prisma
- **Storage**: S3-compatible (DigitalOcean Spaces) with local fallback
- **Monorepo**: Turborepo with npm workspaces

## Project Structure

```
pmkit/
├── apps/
│   ├── web/              # Next.js marketing + demo app
│   └── worker/           # BullMQ job worker
├── packages/
│   ├── core/             # Domain models, RBAC, audit, job runner
│   ├── mcp/              # MCP framework
│   ├── mcp-servers/      # Mocked MCP servers (Jira, Slack, etc.)
│   ├── mock-tenant/      # Demo dataset
│   ├── prompts/          # Prompt templates + stub generators
│   └── content/          # Keywords, resources, blog content
├── prisma/               # Database schema
├── docker/               # Docker configuration
└── tests/                # Test suites
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 15+ (optional for dev)
- Redis 7+ (optional for dev)

### Installation

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

### Development

The development server runs at `http://localhost:3000`.

```bash
# Run all apps in development mode
npm run dev

# Run only the web app
cd apps/web && npm run dev

# Run only the worker
cd apps/worker && npm run dev
```

### Building

```bash
# Build all packages and apps
npm run build

# Build specific app
cd apps/web && npm run build
```

### Docker Deployment

```bash
# Build Docker images
npm run docker:build

# Start all services
npm run docker:up

# Stop all services
npm run docker:down
```

## Environment Variables

### Required

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth.js sessions

### Optional

- `REDIS_URL`: Redis connection string (uses inline fallback if not set)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Google OAuth
- `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`: Microsoft OAuth
- `S3_ENDPOINT`, `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`: S3 storage
- `OPENAI_API_KEY`: For LLM-powered responses (uses stubs if not set)
- `NEXT_PUBLIC_SIMPLE_ANALYTICS_DOMAIN`: Simple Analytics domain
- `NEXT_PUBLIC_GSC_VERIFICATION`: Google Search Console verification
- `NEXT_PUBLIC_BING_VERIFICATION`: Bing Webmaster Tools verification

## Demo Mode

The demo runs with a complete mock enterprise dataset and doesn't require any external services. All tool calls use mocked MCP servers, and artifact generation uses stub responses.

Visit `/demo/console` to try the Agent Console.

## Architecture

### Draft-Only Pattern

All external writes are proposals, not direct actions:

1. Agent runs a job (e.g., PRD draft)
2. Agent calls read-only tools to gather data
3. Agent generates an artifact
4. For any external writes, agent creates a **proposal**
5. Human reviews and approves the proposal
6. Only then is the write executed

### MCP (Model Context Protocol)

pmkit uses MCP for tool integration:

- **MCP Servers**: Each integration (Jira, Slack, etc.) is an MCP server
- **MCP Client**: The job runner calls tools via the MCP client
- **Swappable**: Mock servers can be replaced with real ones without changing job logic

### Job Runner

Jobs are executed by the BullMQ worker:

1. Job is enqueued with type and config
2. Worker picks up the job
3. Worker executes tool calls via MCP
4. Worker generates artifact using prompts
5. Results are saved to database

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`
5. Run linting: `npm run lint`
6. Submit a pull request

## Cursor Rules

# Cursor Rules for pmkit

## Primary Documentation

Read `AGENTS.md` for complete project documentation before making changes.

## Core Principles

### Draft-Only Pattern
All external writes MUST use proposal tools. Never create direct write tools.

```typescript
// ✅ Correct
this.registerTool(createProposalTool('jira_epic', ...));

// ❌ Wrong
this.registerTool({ name: 'create_jira_epic', ... });
```

### Type Definitions
Use Zod schemas with inferred types. Never use TypeScript enums.

```typescript
// ✅ Correct
export const StatusSchema = z.enum(['pending', 'active', 'done']);
export type Status = z.infer<typeof StatusSchema>;

// ❌ Wrong
enum Status { Pending, Active, Done }
```

### Tool Naming
- Read tools: `get_*`, `search_*`, `list_*`, `find_*`
- Write tools: `propose_*` (never direct writes)
- All tool names are snake_case

## File Locations

| What | Where |
|------|-------|
| Domain types | `packages/core/src/types/index.ts` |
| MCP tools | `packages/mcp-servers/src/{connector}/index.ts` |
| Prompt templates | `packages/prompts/src/index.ts` |
| Demo data | `packages/mock-tenant/src/data/` |
| Database schema | `prisma/schema.prisma` |
| Web pages | `apps/web/src/app/` |
| UI components | `apps/web/src/components/ui/` |

## Frontend Conventions

### Typography
- Headings: Space Grotesk (`font-heading`)
- Body: Geist Sans (`font-sans`)
- Code: Geist Mono (`font-mono`)

### Colors
Primary brand color is cobalt/indigo:
- `text-cobalt-600` for links and primary text
- `bg-cobalt-100` for icon backgrounds
- `bg-cobalt-600` for primary buttons

### Components
Use shadcn/ui components from `apps/web/src/components/ui/`.
Badge variants: `default`, `secondary`, `destructive`, `outline`, `cobalt`

### Animations
Use Tailwind animations: `animate-fade-in`, `animate-fade-up`
Stagger with: `animate-delay-100`, `animate-delay-200`, etc.

## Common Tasks

### Adding a Connector
1. Create MCP server in `packages/mcp-servers/src/{connector}/`
2. Add mock data in `packages/mock-tenant/src/data/{connector}.ts`
3. Export from `packages/mcp-servers/src/index.ts`
4. Add to ConnectorKeySchema if needed

### Adding a Job Type
1. Add to `JobTypeSchema` in `packages/core/src/types/index.ts`
2. Add prompt template in `packages/prompts/src/index.ts`
3. Add stub generator function
4. Update Prisma enum in `prisma/schema.prisma`
5. Create job handler

### Adding a Page
1. Create in `apps/web/src/app/(marketing)/` for marketing pages
2. Use the established layout patterns (Hero → Features → CTA)
3. Export metadata for SEO
4. Follow the cobalt accent color scheme

## Testing

```bash
npm run test        # Run all tests
npm run test:watch  # Watch mode
npm run typecheck   # TypeScript checks
npm run lint        # ESLint
```

## Database

```bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to dev database
npm run db:migrate   # Create and run migrations
```

## Build

```bash
npm run build        # Build all packages (Turborepo)
npm run dev          # Start dev servers
```

## Avoid

- Over-engineering or adding features not requested
- Direct write tools (use proposals)
- TypeScript enums (use Zod)
- Speculating about code without reading it first
- Adding error handling for impossible scenarios
- Creating abstractions for one-time operations


## License

MIT License - see [LICENSE](LICENSE) for details.

---

**pmkit** - Draft smarter. Decide faster.

[Website](https://getpmkit.com) · [Demo](https://getpmkit.com/demo) · [Blog](https://getpmkit.com/blog)

