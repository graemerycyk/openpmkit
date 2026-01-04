# AGENTS.md

> Documentation for AI programming agents working in this codebase.

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

- 6 job types: `daily_brief`, `meeting_prep`, `voc_clustering`, `competitor_intel`, `roadmap_alignment`, `prd_draft`
- Job handlers implement `JobHandler` interface
- All jobs produce artifacts in markdown format
- Jobs run via `JobRunner.runJob()` which creates a `JobContext`

### Artifacts

- Generated documents from job runs
- Types: `brief`, `meeting_pack`, `voc_report`, `competitor_diff`, `alignment_memo`, `prd`
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
- `apps/web/src/app/demo/console/` - Demo console UI
- `apps/web/src/components/ui/` - Shared UI components (shadcn/ui)

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

