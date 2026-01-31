# AGENTS.md

> Documentation for AI programming agents working on openpmkit.

## Overview

openpmkit is an open-source CLI tool that provides 10 autonomous PM workflows. Users install via npm and run workflows locally with their own API keys (BYOK model).

## Quick Reference

| Task | Command |
|------|---------|
| Install globally | `npm install -g openpmkit` |
| Run setup | `openpmkit setup` |
| List workflows | `openpmkit list` |
| Run workflow | `openpmkit run daily-brief` |
| Dev mode | `npx tsx src/cli/index.ts run daily-brief` |

## Architecture

```
User runs CLI → Workflow executes → AI processes → Markdown output saved
                     ↓
              Uses configured API keys from ~/.openpmkit/config.json
                     ↓
              Outputs to ~/openpmkit/{workflow}/{date}.md
```

## Code Exploration Guidelines

**Always read before editing.** Never speculate about code you haven't inspected:

- If a file/path is referenced, open and inspect it before explaining or proposing fixes
- Be rigorous and persistent in searching code for key facts
- Thoroughly review the style, conventions, and abstractions before implementing new features
- Give grounded, hallucination-free answers based on actual code

## Avoid Over-Engineering

Keep solutions minimal and focused:

- Only make changes that are directly requested or clearly necessary
- Don't add features, refactor code, or make "improvements" beyond what was asked
- Don't add error handling or validation for scenarios that can't happen
- Don't create helpers, utilities, or abstractions for one-time operations
- Reuse existing abstractions where possible

## Project Structure

### CLI (`pmkit-desktop/`)

The main product - published to npm as `openpmkit`:

```
pmkit-desktop/
├── src/
│   ├── cli/index.ts       # CLI entry point (Commander.js)
│   ├── lib/
│   │   ├── types.ts       # TypeScript types, credential definitions
│   │   ├── config.ts      # Config manager (~/.openpmkit/config.json)
│   │   ├── runner.ts      # Workflow execution engine
│   │   └── storage.ts     # Output file management
│   ├── crawlers/          # Social, Web, News crawlers
│   ├── integrations/      # Slack, Jira, etc. API clients
│   └── workflows/         # 10 workflow definitions
├── package.json           # Published as 'openpmkit'
└── README.md
```

### Shared Packages (`packages/`)

```
packages/
├── core/                  # Shared utilities
│   ├── src/crawlers/      # Crawler implementations
│   ├── src/types/         # Domain types
│   └── src/telemetry/     # SIEM telemetry
├── prompts/               # LLM prompt templates
└── content/               # Blog/marketing content
```

### Marketing Website (`apps/web/`)

Static Next.js site for getpmkit.com - SEO pages, blog, guides.

## The 10 Workflows

| # | Workflow | Command | Description |
|---|----------|---------|-------------|
| 1 | Daily Brief | `run daily-brief` | Morning context summary from connected sources |
| 2 | Meeting Prep | `run meeting-prep` | Pre-meeting research and talking points |
| 3 | Feature Intel | `run feature-intel` | Analyze feature requests and patterns |
| 4 | PRD Draft | `run prd-draft` | Generate product requirements document |
| 5 | Sprint Review | `run sprint-review` | Summarize sprint accomplishments |
| 6 | Competitor | `run competitor` | Research competitor landscape |
| 7 | Roadmap | `run roadmap` | Roadmap alignment analysis |
| 8 | Release Notes | `run release-notes` | Generate release notes |
| 9 | Deck Content | `run deck-content` | Presentation content generation |
| 10 | Prototype | `run prototype` | Prototype suggestions |

## BYOK Credential System

All API keys are stored locally in `~/.openpmkit/config.json`:

```typescript
// Categories of credentials
type CredentialCategory = 'ai' | 'crawler' | 'integration' | 'connector';

// Example credentials
OPENAI_API_KEY      // AI - Required
REDDIT_CLIENT_ID    // Crawler - For social monitoring
SLACK_BOT_TOKEN     // Integration - For Slack data
JIRA_API_TOKEN      // Connector - For Jira data
```

Users manage credentials via:
```bash
openpmkit setup                    # Interactive wizard
openpmkit settings set OPENAI_API_KEY sk-...
openpmkit settings list
```

## Adding a New Workflow

1. **Define the workflow** in `pmkit-desktop/src/workflows/{name}.ts`
2. **Add prompt template** in `prompts/{nn}-{name}.md`
3. **Register in runner** at `pmkit-desktop/src/lib/runner.ts`
4. **Add CLI command** in `pmkit-desktop/src/cli/index.ts`

## Adding a New Integration

1. **Create client** in `pmkit-desktop/src/integrations/{name}.ts`
2. **Define credential** in `pmkit-desktop/src/lib/types.ts` (add to CREDENTIALS array)
3. **Update setup wizard** in `pmkit-desktop/src/cli/index.ts`

## Website Development

The marketing site at `apps/web/` is a static Next.js site:

```bash
cd apps/web
npm run dev      # Development
npm run build    # Production build
```

Key pages:
- `/` - Landing page
- `/blog/*` - Blog posts
- `/compare/*` - Competitor comparisons
- `/guides/*` - How-to guides
- `/integrations/*` - Integration pages

## Environment Variables

For CLI development:
```bash
OPENAI_API_KEY=sk-...           # Required
USE_STUB_LLM=true               # Use stubs (no API key needed)
```

For website:
```bash
# No env vars required - static site
```

## Testing

```bash
# Test with stubs (no API key)
USE_STUB_LLM=true npx tsx src/cli/index.ts run daily-brief

# Test with real API
npx tsx src/cli/index.ts run daily-brief
```

## Common Patterns

### Running a workflow programmatically
```typescript
import { runWorkflow } from './lib/runner';

const result = await runWorkflow('daily-brief', {
  sources: ['slack', 'jira'],
});
```

### Accessing configuration
```typescript
import { getConfig, setCredential } from './lib/config';

const config = getConfig();
const apiKey = config.credentials?.OPENAI_API_KEY;

setCredential('OPENAI_API_KEY', 'sk-...');
```

### Using a crawler
```typescript
import { SocialCrawler } from './crawlers/social';

const crawler = new SocialCrawler();
const results = await crawler.crawl({
  platforms: ['reddit', 'hackernews'],
  query: 'product management AI',
});
```
