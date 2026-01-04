# AGENTS.md

> Documentation for AI programming agents working in this codebase.

## Quick Reference

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Build all packages | `npm run build` |
| Start dev server | `npm run dev` |
| Run tests | `npm run test` |
| Type check | `npm run typecheck` |
| Lint | `npm run lint` |
| Generate Prisma client | `npm run db:generate` |
| Push schema to DB | `npm run db:push` |

### Critical Files at a Glance

| What | Where |
|------|-------|
| Domain types | `packages/core/src/types/index.ts` |
| MCP framework | `packages/mcp/src/index.ts` |
| Job runner | `packages/core/src/jobs/index.ts` |
| Prompt templates | `packages/prompts/src/index.ts` |
| Database schema | `prisma/schema.prisma` |
| Demo data | `packages/mock-tenant/src/data/` |
| Web app | `apps/web/src/app/` |
| UI components | `apps/web/src/components/ui/` |

---

## Agent Behavior Guidelines

This section provides guidance for AI agents (Claude 4.x models) working in this codebase, based on [Claude 4 best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices).

### Code Exploration

**Always read before editing.** Never speculate about code you haven't inspected:

- If a file/path is referenced, open and inspect it before explaining or proposing fixes
- Be rigorous and persistent in searching code for key facts
- Thoroughly review the style, conventions, and abstractions before implementing new features
- Give grounded, hallucination-free answers based on actual code

### Avoid Over-Engineering

Keep solutions minimal and focused:

- Only make changes that are directly requested or clearly necessary
- Don't add features, refactor code, or make "improvements" beyond what was asked
- Don't add error handling or validation for scenarios that can't happen
- Don't create helpers, utilities, or abstractions for one-time operations
- Don't design for hypothetical future requirements
- Reuse existing abstractions where possible (follow DRY principle)

### Tool Usage

Be explicit about taking action:

- When asked to make changes, implement them rather than just suggesting
- Use parallel tool calls when operations are independent
- Read multiple files at once to build context faster
- Execute independent searches/reads simultaneously

### State Tracking for Long Tasks

For complex multi-step work:

- Use structured formats (JSON) for tracking test results and task status
- Use git for state tracking across sessions
- Focus on incremental progress—complete components before moving on
- Track progress in structured files when working across context windows

### Communication Style

Be direct and efficient:

- Provide fact-based progress reports rather than self-celebratory updates
- Skip unnecessary elaboration unless more detail is requested
- Jump directly to the next action after tool calls (unless summaries are helpful)

## Project Overview

pmkit is an AI-powered product management agent platform using a **draft-only governance pattern**. Agents propose changes but never write directly to external systems. All tool calls, sources, and artifacts are logged for full traceability.

### Core Concept

```
Agent runs job → Gathers data (read-only) → Generates artifact → Creates proposal → Human reviews → Approved writes execute
```

## Architecture Principles

### Draft-Only Pattern

All external writes use `propose_*` tools that create proposals for human review. **Never implement direct write tools** - always use `createProposalTool()` from `@pmkit/mcp`.

```typescript
// ✅ Correct: Proposal tool
this.registerTool(
  createProposalTool('jira_epic', 'Propose a new epic', schema, 'jira', ...)
);

// ❌ Wrong: Direct write tool
this.registerTool({ name: 'create_jira_epic', ... });
```

### MCP (Model Context Protocol)

- Each integration is an MCP server in `packages/mcp-servers/src/{connector}/`
- Tools are registered with Zod schemas for input/output validation
- Mock servers return data from `packages/mock-tenant/src/data/`
- Real connectors extend `RealConnectorServer` and implement OAuth

### Multi-Tenancy

- All data is scoped by `tenantId`
- Users belong to tenants with role-based permissions
- Jobs, artifacts, proposals all reference their tenant

## Package Responsibilities

| Package | Purpose | Key Exports |
|---------|---------|-------------|
| `@pmkit/core` | Domain types, RBAC, audit logging, job runner | `JobRunner`, `AuditLogger`, `RBACService`, all type schemas |
| `@pmkit/mcp` | MCP framework, tool definitions, policy enforcement | `BaseMCPServer`, `MCPClient`, `createProposalTool` |
| `@pmkit/mcp-servers` | Mock MCP servers for each connector | `mockJiraServer`, `mockSlackServer`, etc. |
| `@pmkit/mock-tenant` | Demo dataset for all connectors | `mockTenant`, `mockUsers`, connector data |
| `@pmkit/prompts` | Prompt templates and stub generators | `PROMPT_TEMPLATES`, `renderPrompt`, `generateStubResponse` |
| `@pmkit/content` | Marketing content, blog posts, keywords | `blogPosts`, `resources`, `keywords` |

### Apps

| App | Purpose |
|-----|---------|
| `apps/web` | Next.js 15 marketing site + demo console |
| `apps/worker` | BullMQ job worker (processes queued jobs) |

## Code Conventions

### Types

- All domain types use Zod schemas with inferred TypeScript types
- Schema naming: `{Entity}Schema` → Type: `{Entity}`
- Use `z.enum()` not TypeScript enums
- Export both schema and type

```typescript
// ✅ Correct pattern
export const JobStatusSchema = z.enum(['pending', 'running', 'completed', 'failed']);
export type JobStatus = z.infer<typeof JobStatusSchema>;

// ❌ Avoid TypeScript enums
enum JobStatus { Pending, Running, ... }
```

### MCP Tools

- **Read tools**: `get_*`, `search_*`, `list_*`, `find_*`
- **Write tools**: `propose_*` (never direct writes)
- All tools must have `inputSchema` and `outputSchema` (Zod)
- Tool names are snake_case

### Jobs

- 7 job types: `daily_brief`, `meeting_prep`, `voc_clustering`, `competitor_research`, `roadmap_alignment`, `prd_draft`, `sprint_review`
- Job handlers implement `JobHandler` interface
- All jobs produce artifacts in markdown format
- Jobs run via `JobRunner.runJob()` which creates a `JobContext`

### Artifacts

- Generated documents from job runs
- Types: `brief`, `meeting_pack`, `voc_report`, `competitor_report`, `alignment_memo`, `prd`
- Format is typically markdown
- Stored with `storageKey` for S3/local retrieval

### Proposals

- Represent pending writes to external systems
- Types: `jira_epic`, `jira_story`, `confluence_page`, `slack_message`, `prd_document`
- Status flow: `draft` → `pending_review` → `approved`/`rejected`
- `bundle` field contains the full payload for execution

## Key Files

### Domain & Types
- `packages/core/src/types/index.ts` - All domain type schemas
- `packages/core/src/jobs/index.ts` - JobRunner, JobHandler, JobContext
- `packages/core/src/rbac/index.ts` - Permission system
- `packages/core/src/audit/index.ts` - Audit logging

### MCP Framework
- `packages/mcp/src/index.ts` - MCP server/client, tool helpers, policy enforcement
- `packages/mcp/src/factory.ts` - Server factory for creating configured clients
- `packages/mcp/src/remote.ts` - Remote MCP server connections

### Connectors
- `packages/mcp-servers/src/{connector}/index.ts` - Each connector's MCP server
- `packages/mock-tenant/src/data/{connector}.ts` - Mock data for each connector

### Prompts
- `packages/prompts/src/index.ts` - All prompt templates and stub generators

### Database
- `prisma/schema.prisma` - Database schema (source of truth for data model)

### Web App
- `apps/web/src/app/(marketing)/` - Marketing pages (uses shared layout with header/footer)
- `apps/web/src/app/demo/console/` - Demo console UI
- `apps/web/src/app/demo/launcher/` - Slack/Teams/Email launcher demo
- `apps/web/src/components/layout/` - Header and Footer components
- `apps/web/src/components/ui/` - Shared UI components (shadcn/ui)
- `apps/web/src/lib/utils.ts` - Utilities including `cn()` and `siteConfig`
- `apps/web/src/styles/globals.css` - CSS variables and base styles

## Website & Brand Information

### Site Configuration
- **Name**: pmkit
- **Tagline**: "Your daily PM toolkit - briefs, meetings, and PRDs made simple."
- **URL**: https://getpmkit.com
- **Twitter**: @getpmkit
- **GitHub**: github.com/getpmkit

### Navigation Structure
Main nav: How It Works → Demo → Resources → Blog → Pricing

Footer sections:
- Product: How It Works, Demo, Pricing, Trust Center
- Agents: Product Management Agent, AI PM Assistant, Agentic PM, Draft-Only Agents
- PM Workflows: PRD Automation, Meeting Prep Packs, Roadmap Alignment, Product Ops Automation, Sprint Review Packs
- Integrations: Slack to Jira, Gong Insights, Community to Roadmap, Jira & Confluence, MCP Connectors
- VoC & Intel: VoC Clustering, Competitor Research, Customer Escalations, Search Analytics

## Frontend Design System

### Current Typography

The site uses a deliberate font pairing:

| Purpose | Font | CSS Variable | Usage |
|---------|------|--------------|-------|
| Body/Sans | Geist Sans | `--font-geist-sans` | All body text, paragraphs, lists |
| Headings | Space Grotesk | `--font-space-grotesk` | h1-h6, section titles, card titles |
| Monospace | Geist Mono | `--font-geist-mono` | Code blocks, audit logs, technical content |

```typescript
// Font configuration in layout.tsx
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Space_Grotesk } from 'next/font/google';
```

### Current Color Palette

**Brand Color: Cobalt/Indigo** - The primary accent throughout the site.

```css
/* Cobalt scale (tailwind.config.ts) */
cobalt-50:  #eef2ff   /* Backgrounds, badges */
cobalt-100: #e0e7ff   /* Icon backgrounds, hover states */
cobalt-200: #c7d2fe   /* Borders, subtle accents */
cobalt-500: #6366f1   /* Primary buttons, links */
cobalt-600: #4f46e5   /* Primary brand color, CTAs */
cobalt-700: #4338ca   /* Hover states, emphasis */
cobalt-950: #1e1b4b   /* Dark mode primary */
```

**CSS Variables (globals.css)**:
```css
/* Light mode */
--primary: 238 84% 60%;        /* Cobalt/Indigo */
--background: 0 0% 100%;       /* White */
--foreground: 222.2 84% 4.9%;  /* Near-black */
--muted: 210 40% 96.1%;        /* Light gray backgrounds */
--muted-foreground: 215.4 16.3% 46.9%;  /* Gray text */

/* Dark mode */
--primary: 238 84% 67%;
--background: 222.2 84% 4.9%;
--foreground: 210 40% 98%;
```

### UI Components

Located in `apps/web/src/components/ui/` (shadcn/ui based):

| Component | File | Key Variants |
|-----------|------|--------------|
| Button | `button.tsx` | `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` |
| Badge | `badge.tsx` | `default`, `secondary`, `destructive`, `outline`, `cobalt` |
| Card | `card.tsx` | Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| Tabs | `tabs.tsx` | Tabs, TabsList, TabsTrigger, TabsContent |
| Accordion | `accordion.tsx` | For collapsible content |
| Separator | `separator.tsx` | Horizontal/vertical dividers |
| ScrollArea | `scroll-area.tsx` | Custom scrollbars |
| Textarea | `textarea.tsx` | Multi-line input |

### Animation System

Defined in `tailwind.config.ts`:

```typescript
// Keyframes
'fade-in':  { from: { opacity: '0' }, to: { opacity: '1' } }
'fade-up':  { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } }
'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } }
'accordion-down/up': Radix accordion animations

// Animation classes
animate-fade-in, animate-fade-up, animate-slide-in-right
```

**Staggered delays** (globals.css):
```css
.animate-delay-100 { animation-delay: 100ms; }
.animate-delay-200 { animation-delay: 200ms; }
/* ... up to 500ms */
```

### Layout Patterns

**Container**: Centered, max-width 1400px, 2rem padding
```typescript
container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } }
```

**Section spacing**: `py-20 md:py-32` for major sections

**Hero pattern**:
- Gradient background: `bg-gradient-to-b from-cobalt-50/50 to-background`
- Blurred decorative circle: `bg-cobalt-100/30 blur-3xl`
- Badge → h1 → description → CTA buttons

**Card grid**: `grid gap-8 md:grid-cols-2 lg:grid-cols-3`

**Feature cards**: Icon in cobalt-100 circle → Title → Description

### Prose Styling

For blog/resources content (`.prose` class):
- Headings use `font-heading` (Space Grotesk)
- Body uses `font-sans` (Geist Sans)
- Links: `text-cobalt-600 hover:text-cobalt-700`
- Blockquotes: `border-l-4 border-cobalt-500`
- Code: `bg-muted` with rounded corners

### Icon System

Uses Lucide React icons throughout:
```typescript
import { FileText, Users, BarChart3, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
```

Common icons:
- `ArrowRight` - CTAs and links
- `CheckCircle2` - Benefits/features lists
- `Shield` - Security/governance
- `FileText` - Documents/PRDs
- `Users` - Teams/meetings
- `BarChart3` - Analytics/metrics

### Design Principles for New Work

When adding new pages or components:

1. **Maintain cobalt as the accent** - Use `text-cobalt-600`, `bg-cobalt-100`, `border-cobalt-*`
2. **Use the established font pairing** - Space Grotesk for headings, Geist Sans for body
3. **Follow section rhythm** - Alternate between white and `bg-muted/30` backgrounds
4. **Add motion thoughtfully** - Use `animate-fade-up` with staggered delays for card grids
5. **Keep CTAs consistent** - Primary button for main action, outline for secondary
6. **Use the Badge component** - `variant="cobalt"` for status indicators

## Adding a New Connector

1. **Create the MCP server**
   ```typescript
   // packages/mcp-servers/src/{connector}/index.ts
   import { BaseMCPServer, createProposalTool } from '@pmkit/mcp';
   
   export class Mock{Connector}MCPServer extends BaseMCPServer {
     constructor() {
       super({
         name: '{connector}',
         description: '{Connector} integration',
         version: '1.0.0',
       });
       this.registerTools();
     }
     
     private registerTools(): void {
       // Read tools
       this.registerTool({ name: 'get_item', ... });
       
       // Write tools (proposals only)
       this.registerTool(createProposalTool(...));
     }
   }
   ```

2. **Add mock data**
   ```typescript
   // packages/mock-tenant/src/data/{connector}.ts
   export const mock{Connector}Data = { ... };
   ```

3. **Export from index**
   ```typescript
   // packages/mcp-servers/src/index.ts
   export * from './{connector}';
   ```

4. **Add connector key** (if needed)
   ```typescript
   // packages/mcp/src/index.ts
   export const ConnectorKeySchema = z.enum([
     'jira', 'confluence', 'slack', 'gong', 'zendesk', '{connector}'
   ]);
   ```

5. **Update Prisma schema** (if persisting connector state)
   ```prisma
   // prisma/schema.prisma - add to ConnectorStatus enum if needed
   ```

## Adding a New Job Type

1. **Add to JobTypeSchema**
   ```typescript
   // packages/core/src/types/index.ts
   export const JobTypeSchema = z.enum([
     'daily_brief', 'meeting_prep', ..., 'new_job_type'
   ]);
   ```

2. **Add prompt template**
   ```typescript
   // packages/prompts/src/index.ts
   export const PROMPT_TEMPLATES: Record<JobType, PromptTemplate> = {
     // ... existing templates
     new_job_type: {
       id: 'new-job-type-v1',
       name: 'New Job Type',
       description: '...',
       jobType: 'new_job_type',
       systemPrompt: `...`,
       userPromptTemplate: `...`,
       outputFormat: 'markdown',
       requiredContext: ['...'],
     },
   };
   ```

3. **Add stub generator**
   ```typescript
   // packages/prompts/src/index.ts
   function generateNewJobTypeStub(context: PromptContext, date: string): string {
     return `# New Job Type\n\n...`;
   }
   
   // Update generateStubResponse switch statement
   case 'new_job_type':
     return generateNewJobTypeStub(context, date);
   ```

4. **Update Prisma enum**
   ```prisma
   // prisma/schema.prisma
   enum JobType {
     daily_brief
     meeting_prep
     // ...
     new_job_type
   }
   ```

5. **Create job handler**
   ```typescript
   const newJobHandler: JobHandler = {
     type: 'new_job_type',
     name: 'New Job Type',
     description: '...',
     execute: async (ctx: JobContext) => {
       // 1. Call MCP tools to gather data
       // 2. Generate artifact using prompts
       // 3. Create proposals if needed
     },
   };
   
   jobRunner.registerHandler(newJobHandler);
   ```

## Adding a New Artifact Type

1. **Add to ArtifactTypeSchema**
   ```typescript
   // packages/core/src/types/index.ts
   export const ArtifactTypeSchema = z.enum([
     'brief', 'meeting_pack', ..., 'new_artifact_type'
   ]);
   ```

2. **Update Prisma enum**
   ```prisma
   // prisma/schema.prisma
   enum ArtifactType {
     brief
     meeting_pack
     // ...
     new_artifact_type
   }
   ```

## Common Patterns

### Creating a Proposal Tool

```typescript
import { createProposalTool } from '@pmkit/mcp';
import { z } from 'zod';

this.registerTool(
  createProposalTool(
    'tool_name',           // Becomes propose_tool_name
    'Description of what this proposes',
    z.object({             // Input schema
      field: z.string(),
    }),
    'target_system',       // e.g., 'jira', 'confluence', 'slack'
    async (input, context) => ({
      title: 'Proposal title',
      preview: '**Markdown** preview for review',
      diff: 'Optional diff string',
      bundle: {            // Full payload for execution
        ...input,
        additionalData: '...',
      },
      targetId: 'optional-target-id',
    })
  )
);
```

### Rendering Prompts

```typescript
import { renderPrompt, PROMPT_TEMPLATES } from '@pmkit/prompts';

const { system, user } = renderPrompt(
  PROMPT_TEMPLATES.daily_brief,
  {
    tenantName: 'Acme Corp',
    userName: 'Jane PM',
    currentDate: '2026-01-04',
    slackMessages: '...',
    jiraUpdates: '...',
    // ... other context
  }
);
```

### Creating a Job Context

```typescript
// JobContext is created by JobRunner, but for testing:
const ctx: JobContext = {
  job,
  user,
  tenantId: job.tenantId,
  auditLogger,
  toolCalls: [],
  artifacts: [],
  proposals: [],
  addToolCall: (tc) => { /* ... */ },
  addArtifact: (a) => { /* ... */ },
  addProposal: (p) => { /* ... */ },
};
```

### Calling MCP Tools

```typescript
import { mcpClient } from '@pmkit/mcp';

const result = await mcpClient.callTool(
  'jira',           // Server name
  'search_issues',  // Tool name
  { jql: 'project = ACME' },  // Input
  {                 // Context
    tenantId: 'tenant-1',
    userId: 'user-1',
    jobId: 'job-1',
    permissions: ['jira.read'],
  }
);

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

### Permission Checks

```typescript
import { requirePermission, RBACService } from '@pmkit/core';

// Throws if user lacks permission
requirePermission('job.create')(user);

// Returns boolean
const canAccess = RBACService.canAccessTenant(user, tenantId);
```

## Database

### Running Migrations

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database (dev)
npm run db:migrate    # Create and run migrations (prod)
```

### Schema Location

The Prisma schema at `prisma/schema.prisma` is the source of truth for:
- All database models
- Enum definitions (JobType, JobStatus, UserRole, etc.)
- Relationships between entities

When adding new types, update both:
1. Zod schemas in `packages/core/src/types/index.ts`
2. Prisma schema in `prisma/schema.prisma`

## Testing

```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
```

- Demo mode uses mock servers - no external services needed
- Mock data is in `packages/mock-tenant/src/data/`
- Stub responses are in `packages/prompts/src/index.ts`

## Build & Dev

```bash
npm install           # Install all dependencies
npm run build         # Build all packages (Turborepo)
npm run dev           # Start dev servers
npm run lint          # Run ESLint
npm run typecheck     # Run TypeScript checks
```

### Turborepo

This is a Turborepo monorepo. Key commands:
- `turbo run build` - Build all packages in dependency order
- `turbo run dev --filter=web` - Run only the web app
- `turbo run build --filter=@pmkit/core` - Build only core package

### Environment Variables

Copy `apps/web/env.example` to `apps/web/.env.local`:

```bash
# Required
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...

# Optional (demo works without these)
OPENAI_API_KEY=...        # Uses stubs if not set
REDIS_URL=...             # Uses inline fallback if not set
```

## Connectors Reference

| Connector | Server Class | Mock Data | Tools |
|-----------|--------------|-----------|-------|
| Jira | `MockJiraMCPServer` | `jira.ts` | `get_issue`, `search_issues`, `get_sprint`, `propose_jira_epic`, `propose_jira_story` |
| Confluence | `MockConfluenceMCPServer` | `confluence.ts` | `get_page`, `search_pages`, `propose_confluence_page` |
| Slack | `MockSlackMCPServer` | `slack.ts` | `get_messages`, `search_messages`, `propose_slack_message` |
| Gong | `MockGongMCPServer` | `gong.ts` | `get_calls`, `get_call_transcript`, `search_calls` |
| Zendesk | `MockZendeskMCPServer` | `zendesk.ts` | `get_ticket`, `search_tickets`, `get_ticket_comments` |
| Analytics | `MockAnalyticsMCPServer` | `analytics.ts` | `get_metrics`, `get_funnel`, `get_cohort` |
| Community | `MockCommunityMCPServer` | `community.ts` | `get_posts`, `search_posts`, `get_feature_requests` |
| Competitor | `MockCompetitorMCPServer` | `competitor.ts` | `get_competitor`, `get_feature_comparison`, `get_recent_changes` |

## User Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access, manage users, configure connectors |
| `pm` | Create/run jobs, approve proposals, view all data |
| `eng` | View jobs and artifacts, limited proposal access |
| `cs` | View customer-related data, limited job access |
| `sales` | View customer data, meeting prep access |
| `exec` | Read-only access to all data |
| `viewer` | Read-only access to assigned resources |
| `guest` | Minimal read-only access |

## Troubleshooting

### "Tool not found" error
- Check the tool is registered in the MCP server
- Verify server is registered with `mcpClient.registerServer()`
- Check tool name spelling (snake_case)

### "Permission denied" error
- Check user role has required permission
- Verify `tenantId` matches
- Check RBAC configuration in `packages/core/src/rbac/`

### Prisma errors
- Run `npm run db:generate` after schema changes
- Check `DATABASE_URL` is set correctly
- Run `npm run db:push` to sync schema

### Build failures
- Run `npm run build` from root (Turborepo handles order)
- Check for TypeScript errors with `npm run typecheck`
- Ensure all package dependencies are correct in `package.json`

## Common Pitfalls

### ❌ Direct Write Tools

Never create tools that write directly to external systems:

```typescript
// ❌ WRONG - Direct write
this.registerTool({ name: 'create_jira_issue', ... });

// ✅ CORRECT - Proposal tool
this.registerTool(createProposalTool('jira_issue', ...));
```

### ❌ TypeScript Enums

Never use TypeScript enums. Use Zod schemas instead:

```typescript
// ❌ WRONG
enum JobStatus { Pending, Running, Completed }

// ✅ CORRECT
export const JobStatusSchema = z.enum(['pending', 'running', 'completed']);
export type JobStatus = z.infer<typeof JobStatusSchema>;
```

### ❌ Missing Schema Updates

When adding new types, you must update BOTH:
1. Zod schema in `packages/core/src/types/index.ts`
2. Prisma enum in `prisma/schema.prisma`

Forgetting either will cause runtime or build errors.

### ❌ Hardcoded Tenant Data

All data must be scoped by `tenantId`. Never hardcode tenant-specific values:

```typescript
// ❌ WRONG
const issues = await getIssues('ACME-123');

// ✅ CORRECT
const issues = await getIssues(context.tenantId, 'ACME-123');
```

### ❌ Over-Engineering

Keep changes minimal and focused:
- Don't add features not requested
- Don't refactor surrounding code when fixing bugs
- Don't add error handling for impossible scenarios
- Don't create abstractions for one-time operations

## Testing Patterns

### Unit Testing MCP Tools

```typescript
import { MockJiraMCPServer } from '@pmkit/mcp-servers';

describe('Jira MCP Server', () => {
  const server = new MockJiraMCPServer();

  it('should search issues', async () => {
    const result = await server.callTool('search_issues', {
      jql: 'project = ACME',
    });
    expect(result.success).toBe(true);
    expect(result.data.issues).toBeDefined();
  });
});
```

### Testing Job Handlers

```typescript
import { JobRunner, createTestContext } from '@pmkit/core';

describe('Daily Brief Job', () => {
  it('should generate brief artifact', async () => {
    const ctx = createTestContext({
      jobType: 'daily_brief',
      tenantId: 'test-tenant',
    });
    
    await jobRunner.runJob(ctx);
    
    expect(ctx.artifacts).toHaveLength(1);
    expect(ctx.artifacts[0].type).toBe('brief');
  });
});
```

### Testing with Mock Data

Demo mode uses mock servers from `packages/mock-tenant/src/data/`. All tests can run without external services:

```typescript
// Mock data is automatically available
import { mockJiraData } from '@pmkit/mock-tenant';

expect(mockJiraData.issues).toContainEqual(
  expect.objectContaining({ key: 'ACME-101' })
);
```

### Integration Testing

For end-to-end tests, use the demo console at `/demo/console`:

1. All connectors are simulated
2. Jobs run with stub responses
3. Proposals are created but not executed
4. Full audit trail is logged

## Environment Variables Reference

### Required for Production

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Session encryption key |

### Optional (Demo Works Without)

| Variable | Purpose | Fallback |
|----------|---------|----------|
| `OPENAI_API_KEY` | LLM inference | Stub responses |
| `REDIS_URL` | Job queue | Inline processing |
| `S3_*` | Artifact storage | Local filesystem |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth | Demo auth only |
| `MICROSOFT_CLIENT_ID/SECRET` | Microsoft OAuth | Demo auth only |

### Analytics & SEO

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SIMPLE_ANALYTICS_DOMAIN` | Simple Analytics |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Google Search Console |
| `NEXT_PUBLIC_BING_VERIFICATION` | Bing Webmaster Tools |

## Related Files

- `CLAUDE.md` - Quick reference for Claude Code
- `.cursorrules` - Cursor IDE configuration
- `CONTRIBUTING.md` - Human contributor guide
- `README.md` - Project overview

