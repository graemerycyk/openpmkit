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

### Configuration

```bash
# Show config
pmkit config

# Set output directory
pmkit config --output-dir ~/Documents/pmkit

# Set user/tenant info
pmkit config --user-name "Sarah Chen"
pmkit config --tenant-name "Acme Inc"

# Enable/disable stubs
pmkit config --use-stubs false
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

## Environment Variables

```bash
# LLM API keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...

# Use stub responses (for development)
USE_STUB_LLM=true
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

## Integration with pmkit Web

pmkit-desktop uses the same prompts and fetcher infrastructure as pmkit web:

- **Prompts**: `@pmkit/prompts` - All 10 workflow prompt templates
- **Fetchers**: `@pmkit/core/fetchers` - Slack, Jira, Calendar, Gmail, Drive, Confluence, Zendesk

## License

MIT
