# openpmkit

Open-source PM-focused AI assistant - 10 autonomous workflows for Product Managers.

## Quick Start

```bash
# Install globally
npm install -g openpmkit@latest

# Run setup wizard
openpmkit setup

# Run your first workflow
openpmkit run daily-brief
```

## Overview

openpmkit provides 10 PM workflows that can run ad-hoc or on autonomous schedules. All outputs are saved as markdown files with SIEM telemetry for audit and analysis.

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

### Global Install (recommended)

```bash
npm install -g openpmkit@latest
# or
pnpm add -g openpmkit@latest
```

### From Source

```bash
git clone https://github.com/openpmkit/openpmkit.git
cd openpmkit/pmkit-desktop
npm install
npm run build
npm link  # Makes 'openpmkit' command available globally
```

## Usage

### Run a workflow ad-hoc

```bash
# List available workflows
openpmkit list

# Run a workflow
openpmkit run daily-brief

# Run with parameters
openpmkit run meeting-prep --params '{"accountName": "Acme Corp"}'

# Run and open output
openpmkit run daily-brief --open
```

### View history and stats

```bash
# Show run history for a workflow
openpmkit history daily-brief

# Show statistics
openpmkit stats
openpmkit stats daily-brief

# Open latest output
openpmkit open daily-brief
```

### Autonomous scheduler

```bash
# Show scheduler status
openpmkit scheduler status

# Enable/disable workflow schedules
openpmkit scheduler enable daily-brief
openpmkit scheduler disable competitor

# Set custom schedule (cron format)
openpmkit scheduler set-schedule daily-brief "0 8 * * 1-5"

# Start the scheduler daemon
openpmkit scheduler start
```

### First-Time Setup

```bash
# Run the interactive setup wizard
openpmkit setup
```

The wizard will guide you through:
1. Your profile (name, company, product)
2. OpenAI API Key (required for AI-powered content)
3. Optional credentials for crawlers, integrations, and data connectors

### Managing Settings (BYOK)

openpmkit uses a **BYOK (Bring Your Own Key)** model - you manage your own credentials for all services. No `.env` files needed - everything is stored in `~/.openpmkit/config.json`.

```bash
# Show all settings
openpmkit settings

# List all credentials with status
openpmkit settings list

# Set a credential (AI, crawler, integration, or connector)
openpmkit settings set openai sk-...
openpmkit settings set linear lin_api_...
openpmkit settings set slack xoxb-...

# Update your profile
openpmkit settings profile --name "Sarah Chen" --company "Acme Inc"

# Reset all settings
openpmkit settings reset
```

## Output Structure

All outputs are saved to `~/openpmkit/{workflow-id}/{timestamp}/`:

```
openpmkit/
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
  "outputPath": "/Users/you/openpmkit/daily-brief/2026-01-30T07-00-00-000Z/output.md",
  "environment": {
    "platform": "darwin",
    "nodeVersion": "v20.12.0",
    "openpmkitVersion": "1.0.0"
  }
}
```

## Configuration File

Config is stored at `~/.openpmkit/config.json`:

```json
{
  "outputDir": "/Users/you/openpmkit",
  "llmProvider": "openai",
  "useStubs": false,
  "tenantId": "acme",
  "tenantName": "Acme Inc",
  "productName": "Acme Platform",
  "userName": "Sarah Chen",
  "credentials": {
    "openai": "sk-...",
    "serper": "...",
    "linear": "lin_api_...",
    "slack": "xoxb-...",
    "jira": "...",
    "jiraEmail": "you@company.com",
    "jiraUrl": "https://company.atlassian.net"
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

## Credentials Reference (BYOK)

All credentials are managed through the CLI - no `.env` files needed! This is a **BYOK (Bring Your Own Key)** platform where each user manages their own keys.

### AI Providers

| Key | Purpose | Get it at |
|-----|---------|-----------|
| **openai** | AI content generation (required) | https://platform.openai.com/api-keys |
| **anthropic** | Alternative AI (Claude) | https://console.anthropic.com/settings/keys |

### Research Crawlers

| Key | Purpose | Get it at |
|-----|---------|-----------|
| **serper** | Web search (2,500 free/month) | https://serper.dev |
| **newsapi** | News search (100 free/day) | https://newsapi.org/register |
| **gnews** | Alternative news (600 free/day) | https://gnews.io |

### Integrations (PM Tools)

| Key | Purpose | Get it at |
|-----|---------|-----------|
| **linear** | Issue tracking | https://linear.app/settings/api |
| **notion** | Pages and databases | https://notion.so/my-integrations |
| **figma** | Design files | https://figma.com/developers/api |
| **coda** | Docs and tables | https://coda.io/developers/apis/v1 |
| **discourse** | Community forums | Your Discourse admin settings |
| **loom** | Video recordings | https://dev.loom.com |
| **amplitude** | Product analytics | https://amplitude.com |
| **zoom** | Meetings | https://marketplace.zoom.us |

### Data Connectors

| Key | Purpose | Get it at |
|-----|---------|-----------|
| **slack** | Team messages | https://api.slack.com/apps |
| **jira** + **jiraEmail** + **jiraUrl** | Issues and sprints | https://id.atlassian.com/manage-profile/security/api-tokens |
| **confluence** + **confluenceEmail** + **confluenceUrl** | Wiki pages | Same as Jira |
| **gmail** | Email threads | https://console.cloud.google.com |
| **googleCalendar** | Meeting schedules | Same as Gmail |
| **googleDrive** | Documents | Same as Gmail |
| **zendesk** + **zendeskEmail** + **zendeskSubdomain** | Support tickets | https://support.zendesk.com |

```bash
# Set any credential with:
openpmkit settings set <name> <value>

# Examples:
openpmkit settings set openai sk-proj-abc123...
openpmkit settings set slack xoxb-your-bot-token
openpmkit settings set jira your-api-token
openpmkit settings set jiraUrl https://yourcompany.atlassian.net
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

openpmkit includes 3 AI-powered crawlers for gathering competitive intelligence and market research.

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
openpmkit crawl social --keywords "product management" --platforms reddit,hackernews
openpmkit crawl web --keywords "competitor features"
openpmkit crawl news --keywords "industry trends"
```

### Credentials Required for Crawlers

| Crawler | Credential | Free Tier | Notes |
|---------|-----------|-----------|-------|
| Web Search | `serper` | 2,500/month | Falls back to DuckDuckGo |
| News | `newsapi` | 100/day | Falls back to Google News RSS |
| News (alt) | `gnews` | 600/day | Alternative to NewsAPI |
| Social | None required | ✅ | Uses public APIs and RSS feeds |

```bash
# Set crawler credentials
openpmkit settings set serper your-serper-key
openpmkit settings set newsapi your-newsapi-key
```

## MVP Integrations

openpmkit includes 8 integration clients for connecting to external tools.

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

Integrations use credentials from your settings:

```bash
# Set integration credentials
openpmkit settings set figma your-figma-token
openpmkit settings set linear your-linear-key
openpmkit settings set notion your-notion-token
```

```typescript
import { createIntegrationClient } from './integrations';

// Create client - reads credentials from ~/.openpmkit/config.json
const figma = createIntegrationClient('figma');

// Connect with credentials from config
await figma.connect({ accessToken: configManager.getCredential('figma') });

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

openpmkit uses the same prompts and fetcher infrastructure as pmkit web:

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
