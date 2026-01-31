# CLAUDE.md

> Configuration file for Claude Code when working on this codebase.

## Quick Start

```bash
# Install dependencies
npm install

# Build
npm run build

# Run a workflow
openpmkit run daily-brief

# Or during development
npx tsx src/cli/index.ts run daily-brief
```

## Project Structure

```
openpmkit/
├── src/
│   ├── cli/              # CLI commands (Commander.js)
│   ├── lib/              # Core: types, config, runner, storage
│   ├── crawlers/         # AI Crawlers (Social, Web, News)
│   ├── integrations/     # Integration clients
│   └── workflows/        # 10 PM workflow definitions
├── packages/
│   ├── core/             # Shared types, crawlers
│   └── prompts/          # LLM prompt templates
├── prompts/              # Workflow prompt definitions
└── skills/               # Skill definitions
```

## Key Principles

1. **BYOK Model**: Users bring their own API keys - stored locally in `~/.openpmkit/config.json`
2. **Local-First**: All workflows run locally, output to `~/openpmkit/`
3. **Read Before Edit**: Always inspect files before modifying
4. **Minimal Changes**: Only make changes directly requested

## CLI Commands

```bash
openpmkit setup              # Interactive setup wizard
openpmkit list               # List available workflows
openpmkit run <workflow>     # Run a workflow
openpmkit settings list      # View configured credentials
openpmkit settings set <k> <v>  # Set a credential
```

## 10 Workflows

| Workflow | Description |
|----------|-------------|
| daily-brief | Morning context summary |
| meeting-prep | Pre-meeting research |
| feature-intel | Feature request analysis |
| prd-draft | PRD generation |
| sprint-review | Sprint summary |
| competitor | Competitor research |
| roadmap | Roadmap alignment |
| release-notes | Release notes generation |
| deck-content | Presentation content |
| prototype | Prototype suggestions |

## Environment Variables

```bash
# Required for CLI
OPENAI_API_KEY=sk-...

# Optional integrations
SLACK_BOT_TOKEN=xoxb-...
JIRA_API_TOKEN=...
```

## Critical Files

| Purpose | Location |
|---------|----------|
| CLI Entry | `src/cli/index.ts` |
| Config Manager | `src/lib/config.ts` |
| Workflow Runner | `src/lib/runner.ts` |
| Type Definitions | `src/lib/types.ts` |
| Prompt Templates | `packages/prompts/src/index.ts` |
| AI Crawlers | `packages/core/src/crawlers/` |

## Adding a New Workflow

1. Create workflow definition in `src/workflows/`
2. Add prompt template in `prompts/`
3. Register in `src/lib/runner.ts`
4. Add CLI command in `src/cli/index.ts`
