# pmkit-desktop

PM-focused AI assistant - 10 autonomous workflows for Product Managers.

## Overview

pmkit-desktop provides 10 PM workflows that can run ad-hoc or on autonomous schedules. All outputs are saved as markdown files with SIEM telemetry for audit and analysis.

## Workflows

| Workflow | Description | Schedule |
|----------|-------------|----------|
| ☀️ **daily-brief** | Morning brief from Slack, Jira, support | Weekdays 7am |
| 🤝 **meeting-prep** | Customer meeting context and talking points | Weekdays 8am |
| 🔬 **feature-intel** | VoC clustering with quantified demand | Mondays 9am |
| 📝 **prd-draft** | PRDs grounded in customer evidence | Manual |
| 🏃 **sprint-review** | Sprint summaries with metrics | Fridays 2pm |
| 🔍 **competitor** | Competitor tracking with implications | Mondays 10am |
| 🗺️ **roadmap** | Alignment memos with trade-offs | Manual |
| 📢 **release-notes** | Customer-facing release notes | Manual |
| 📊 **deck-content** | Slide content for any audience | Manual |
| 🎨 **prototype** | Interactive HTML prototypes from PRDs | Manual |

## Installation

```bash
cd pmkit-desktop
npm install
npm run build
```

## Usage

### Run a workflow ad-hoc

```bash
# List available workflows
pmkit list

# Run a workflow
pmkit run daily-brief

# Run with parameters
pmkit run meeting-prep --params '{"accountName": "Acme Corp"}'

# Run and open output
pmkit run daily-brief --open
```

### View history and stats

```bash
# Show run history for a workflow
pmkit history daily-brief

# Show statistics
pmkit stats
pmkit stats daily-brief

# Open latest output
pmkit open daily-brief
```

### Autonomous scheduler

```bash
# Show scheduler status
pmkit scheduler status

# Enable/disable workflow schedules
pmkit scheduler enable daily-brief
pmkit scheduler disable competitor

# Set custom schedule (cron format)
pmkit scheduler set-schedule daily-brief "0 8 * * 1-5"

# Start the scheduler daemon
pmkit scheduler start
```

### First-Time Setup

```bash
# Run the interactive setup wizard
pmkit setup
```

The wizard will guide you through:
1. Your profile (name, company, product)
2. OpenAI API Key (required for AI-powered content)
3. Optional crawler and integration API keys

### Managing Settings

```bash
# Show all settings
pmkit config

# View API key status
pmkit config keys

# Set an API key
pmkit config set-key openai sk-...
pmkit config set-key linear your-linear-key

# Update your profile
pmkit config set-profile --name "Sarah Chen" --company "Acme Inc"

# Reset all settings
pmkit config reset
```

## Output Structure

All outputs are saved to `~/pmkit/{workflow-id}/{timestamp}/`:

```
pmkit/
├── daily-brief/
│   └── 2026-01-30T07-00-00-000Z/
│       ├── output.md          # Workflow output
│       └── telemetry.json     # SIEM telemetry
├── meeting-prep/
│   └── 2026-01-30T08-00-00-000Z/
│       ├── globex-corp.md
│       └── telemetry.json
├── prototype/
│   └── 2026-01-30T10-00-00-000Z/
│       ├── search-filters.html
│       └── telemetry.json
...
```

## Telemetry Format

Each run generates a `telemetry.json` file for SIEM ingestion:

```json
{
  "timestamp": "2026-01-30T07:00:00.000Z",
  "workflowId": "daily-brief",
  "workflowName": "Daily Brief",
  "triggerType": "scheduled",
  "success": true,
  "durationMs": 1234,
  "model": "gpt-4o",
  "usage": {
    "inputTokens": 1500,
    "outputTokens": 800,
    "totalTokens": 2300
  },
  "estimatedCostUsd": 0.045,
  "isStub": false,
  "outputPath": "/Users/you/pmkit/daily-brief/2026-01-30T07-00-00-000Z/output.md",
  "environment": {
    "platform": "darwin",
    "nodeVersion": "v20.12.0",
    "pmkitVersion": "1.0.0"
  }
}
```

## Configuration File

Config is stored at `~/.pmkit/config.json`:

```json
{
  "outputDir": "/Users/you/pmkit",
  "llmProvider": "openai",
  "useStubs": false,
  "tenantId": "acme",
  "tenantName": "Acme Inc",
  "productName": "Acme Platform",
  "userName": "Sarah Chen",
  "apiKeys": {
    "openai": "sk-...",
    "serper": "...",
    "linear": "lin_api_..."
  },
  "scheduler": {
    "enabled": true,
    "timezone": "America/Los_Angeles",
    "workflows": {
      "daily-brief": { "enabled": true },
      "meeting-prep": { "enabled": true },
      "sprint-review": { "enabled": true, "schedule": "0 15 * * 5" }
    }
  }
}
```

## API Keys Reference

All API keys are managed through the CLI - no `.env` files needed!

| Key | Purpose | Get it at |
|-----|---------|-----------|
| **openai** | AI content generation (required) | https://platform.openai.com/api-keys |
| **serper** | Web search crawler | https://serper.dev |
| **newsapi** | News crawler | https://newsapi.org/register |
| **linear** | Issue tracking | https://linear.app/settings/api |
| **notion** | Pages and databases | https://notion.so/my-integrations |
| **figma** | Design files | https://figma.com/developers/api |
| **coda** | Docs and tables | https://coda.io/developers/apis/v1 |
| **discourse** | Community forums | Your Discourse admin settings |

```bash
# Set any key with:
pmkit config set-key <name> <value>

# Example:
pmkit config set-key openai sk-proj-abc123...
```

## Development

```bash
# Run in development mode
npm run dev

# Run specific workflow
npm run run:daily-brief
npm run run:meeting-prep

# Start scheduler in dev mode
npm run scheduler:start

# Type check
npm run typecheck
```

## AI Crawlers

pmkit-desktop includes 3 AI-powered crawlers for gathering competitive intelligence and market research.

### Crawler Types

| Crawler | Description | Platforms |
|---------|-------------|-----------|
| 🌐 **Social Crawler** | Search social platforms for discussions, mentions, sentiment | Reddit, HackerNews, X/Twitter, LinkedIn, Discord, Bluesky, Threads |
| 🔍 **Web Search Crawler** | Search the web for competitor pages and market research | Google (via Serper), Bing, DuckDuckGo |
| 📰 **News Crawler** | Search news sources for industry updates and press releases | NewsAPI, GNews, Google News RSS |

### Crawler Skills

Skills are in `skills/crawler-*/SKILL.md`:

```bash
# Run crawlers via CLI (coming soon)
pmkit crawl social --keywords "product management" --platforms reddit,hackernews
pmkit crawl web --keywords "competitor features"
pmkit crawl news --keywords "industry trends"
```

### API Keys Required for Crawlers

| Crawler | API Key | Free Tier | Notes |
|---------|---------|-----------|-------|
| Web Search | `SERPER_API_KEY` | 2,500/month | Falls back to DuckDuckGo |
| News | `NEWSAPI_KEY` | 100/day | Falls back to Google News RSS |
| News (alt) | `GNEWS_API_KEY` | 600/day | Alternative to NewsAPI |
| Social | None required | ✅ | Uses public APIs and RSS feeds |

## MVP Integrations

pmkit-desktop includes 8 integration clients for connecting to external tools.

### Integration Status

| Integration | Auth Type | Status | Capabilities |
|-------------|-----------|--------|--------------|
| 🎨 **Figma** | OAuth2 | 🔲 Implementation pending | Design files, comments, components |
| 🎬 **Loom** | API Key | 🔲 Transcript pending | Videos, transcripts |
| 📝 **Coda** | API Key | ✅ Fetch works | Docs, tables, rows |
| 📊 **Amplitude** | API Key + Secret | 🔲 All methods pending | Analytics, events, charts |
| 💬 **Discourse** | API Key | ✅ Fetch works | Forums, topics, posts |
| 📋 **Linear** | API Key | ✅ Fetch works | Issues, projects, cycles |
| 📓 **Notion** | OAuth2 | 🔲 Write pending | Pages, databases, blocks |
| 🎥 **Zoom** | OAuth2 | 🔲 Transcript pending | Meetings, recordings |

### Integration Files

All integrations are in `src/integrations/`:

```
src/integrations/
├── index.ts          # Unified interface
├── types.ts          # Shared types
├── figma.ts          # Figma client
├── loom.ts           # Loom client
├── coda.ts           # Coda client
├── amplitude.ts      # Amplitude client
├── discourse.ts      # Discourse client
├── linear.ts         # Linear client
├── notion.ts         # Notion client
└── zoom.ts           # Zoom client
```

### Using Integrations

```typescript
import { createIntegrationClient } from './integrations';

// Create client
const figma = createIntegrationClient('figma');

// Connect with credentials
await figma.connect({ accessToken: 'your-token' });

// Fetch data
const files = await figma.fetchData({ action: 'list_files' });
```

## What's Still TODO

### Medium Priority (Nice to Have)
- [ ] Figma OAuth flow - Full design integration
- [ ] Linear API completion - Mutation methods
- [ ] Notion write support - Export PRDs to Notion

### Lower Priority (Limited Value Currently)
- [ ] Amplitude - All methods unimplemented
- [ ] Loom transcripts - Transcript fetch not working
- [ ] Zoom transcripts - Transcript fetch not working

## Integration with pmkit Web

pmkit-desktop uses the same prompts and fetcher infrastructure as pmkit web:

- **Prompts**: `@pmkit/prompts` - All 10 workflow prompt templates
- **Fetchers**: `@pmkit/core/fetchers` - Slack, Jira, Calendar, Gmail, Drive, Confluence, Zendesk
- **Crawlers**: `@pmkit/core/crawlers` - Social, Web Search, News crawlers

## Project Structure

```
pmkit-desktop/
├── src/
│   ├── cli/              # CLI interface (Commander.js)
│   │   └── index.ts      # Main CLI entry point
│   ├── scheduler/        # Autonomous scheduler (node-cron)
│   │   └── index.ts      # Cron-based workflow runner
│   ├── lib/              # Core library
│   │   ├── types.ts      # Workflow types and configs
│   │   ├── storage.ts    # Markdown and telemetry storage
│   │   ├── config.ts     # User configuration
│   │   └── runner.ts     # Workflow execution engine
│   ├── crawlers/         # AI Crawlers
│   │   ├── index.ts      # Unified crawler interface
│   │   └── social.ts     # Extended social crawler
│   └── integrations/     # MVP Integration clients
│       ├── index.ts      # Client factory
│       └── *.ts          # Individual clients
├── skills/               # Skill definitions (SKILL.md files)
│   ├── pm-daily-brief/
│   ├── pm-meeting-prep/
│   ├── crawler-social/
│   └── ...
└── package.json
```

## License

MIT
