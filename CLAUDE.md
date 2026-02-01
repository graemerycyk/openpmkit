# CLAUDE.md

> Configuration file for Claude Code when working on this codebase.

## Project Overview

openpmkit provides AI-powered PM workflows for Product Managers.

### POC (Current)
- **Claude Plugin** - Manual slash commands for Claude Code/Cowork

### MVP (In Progress)
- **CLI with OAuth** - Full integrations (Google, Slack, Jira, Zoom, Gong, Zendesk)
- **Autonomous Agents** - Scheduled workflows that run without user action
- **Autonomous Plugin** - Background agents within Claude Cowork

## Quick Start

### Plugin Development
```bash
# Test plugin skills locally
cp -r plugin/skills/* ~/.claude/skills/

# Or symlink for live editing
ln -s $(pwd)/plugin/skills/* ~/.claude/skills/
```

### CLI Development
```bash
npm install
npm run build
npx tsx src/cli/index.ts run daily-brief
```

## Project Structure

```
openpmkit/
├── plugin/               # Claude Plugin (recommended)
│   ├── README.md
│   └── skills/           # 11 slash commands (/pmkit-help, /daily-brief, etc.)
├── src/                  # CLI (work in progress)
│   ├── cli/              # CLI commands (Commander.js)
│   ├── lib/              # Core: types, config, runner, storage
│   ├── crawlers/         # AI Crawlers (Social, Web, News)
│   ├── integrations/     # Integration clients
│   └── workflows/        # 10 PM workflow definitions
├── prompts/              # Workflow prompt templates
├── packages/
│   ├── core/             # Shared types, crawlers
│   └── prompts/          # LLM prompt templates
└── install.sh            # Plugin installer script
```

## 10 Workflows

| Workflow | Plugin Command | CLI Command |
|----------|----------------|-------------|
| Daily Brief | `/daily-brief` | `openpmkit run daily-brief` |
| Meeting Prep | `/meeting-prep` | `openpmkit run meeting-prep` |
| Feature Intel | `/feature-intel` | `openpmkit run feature-intel` |
| PRD Draft | `/prd-draft` | `openpmkit run prd-draft` |
| Sprint Review | `/sprint-review` | `openpmkit run sprint-review` |
| Competitor | `/competitor` | `openpmkit run competitor` |
| Roadmap | `/roadmap` | `openpmkit run roadmap` |
| Release Notes | `/release-notes` | `openpmkit run release-notes` |
| Deck Content | `/deck-content` | `openpmkit run deck-content` |
| Prototype | `/prototype` | `openpmkit run prototype` |

## Key Principles

1. **POC → MVP**: Plugin slash commands validate workflows, then add autonomy
2. **Autonomous is the Goal**: PMs shouldn't have to trigger workflows manually
3. **Shared Prompts**: Both plugin and CLI use same workflow logic
4. **Read Before Edit**: Always inspect files before modifying

## Critical Files

### Plugin
| Purpose | Location |
|---------|----------|
| Plugin README | `plugin/README.md` |
| Help Command | `plugin/skills/pmkit-help/SKILL.md` |
| All Skills | `plugin/skills/*/SKILL.md` |
| Installer | `install.sh` |

### CLI
| Purpose | Location |
|---------|----------|
| CLI Entry | `src/cli/index.ts` |
| Config Manager | `src/lib/config.ts` |
| Workflow Runner | `src/lib/runner.ts` |
| Type Definitions | `src/lib/types.ts` |
| Prompt Templates | `prompts/*.md` |

## Adding a New Workflow

### Plugin
1. Create `plugin/skills/{workflow-name}/SKILL.md`
2. Add frontmatter with name and description
3. Add workflow instructions

### CLI
1. Create workflow definition in `src/workflows/`
2. Add prompt template in `prompts/`
3. Register in `src/lib/runner.ts`
4. Add CLI command in `src/cli/index.ts`

## CLI Integration Status

| Integration | Status |
|-------------|--------|
| OpenAI | ✅ Ready |
| Serper (web search) | ✅ Ready |
| NewsAPI | ✅ Ready |
| Google (Gmail, Calendar, Drive) | 🚧 OAuth in progress |
| Slack | 🚧 OAuth in progress |
| Jira / Confluence | 🚧 OAuth in progress |
| Zoom | 🚧 OAuth in progress |
| Gong | 🚧 OAuth in progress |
| Zendesk | 🚧 OAuth in progress |
