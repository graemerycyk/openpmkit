# openpmkit

> Open-source AI Product Management toolkit - 10 autonomous workflows for PMs

**openpmkit** is a CLI tool that runs AI-powered PM workflows locally. Daily briefs, PRDs, prototypes, competitor research - all powered by your own API keys. No SaaS, no subscriptions, no data leaving your machine.

## Quick Start

```bash
# Install globally
npm install -g openpmkit

# Run setup wizard
openpmkit setup

# Run your first workflow
openpmkit run daily-brief
```

## Features

- **10 PM Workflows**: Daily brief, meeting prep, feature intel, PRD draft, sprint review, competitor research, roadmap alignment, release notes, deck content, prototype generation
- **3 AI Crawlers**: Social (Reddit, HN, X), Web Search (Serper), News (NewsAPI)
- **BYOK (Bring Your Own Key)**: Use your own OpenAI API key - full control over costs
- **Local Output**: All results saved to `~/openpmkit/` as markdown with SIEM telemetry
- **Autonomous Scheduling**: Run workflows manually or on cron schedules
- **No Account Required**: Install and run immediately

## Workflows

| Workflow | Description | Default Schedule |
|----------|-------------|------------------|
| **daily-brief** | Morning brief from Slack, Jira, support | Weekdays 7am |
| **meeting-prep** | Customer meeting context and talking points | Weekdays 8am |
| **feature-intel** | VoC clustering with quantified demand | Mondays 9am |
| **prd-draft** | PRDs grounded in customer evidence | Manual |
| **sprint-review** | Sprint summaries with metrics | Fridays 2pm |
| **competitor** | Competitor tracking with implications | Mondays 10am |
| **roadmap** | Alignment memos with trade-offs | Manual |
| **release-notes** | Customer-facing release notes | Manual |
| **deck-content** | Slide content for any audience | Manual |
| **prototype** | Interactive HTML prototypes from PRDs | Manual |

## Usage

```bash
# List all workflows
openpmkit list

# Run a workflow
openpmkit run daily-brief

# Run with parameters
openpmkit run meeting-prep --params '{"accountName": "Acme Corp"}'

# View settings
openpmkit settings

# Set credentials
openpmkit settings set openai sk-...
openpmkit settings set serper your-serper-key

# Start autonomous scheduler
openpmkit scheduler start
```

## Output

All outputs are saved to `~/openpmkit/{workflow-id}/{timestamp}/`:

```
~/openpmkit/
├── daily-brief/
│   └── 2026-01-30T07-00-00-000Z/
│       ├── output.md          # Workflow output
│       └── telemetry.json     # SIEM telemetry
├── competitor/
│   └── 2026-01-30T10-00-00-000Z/
│       ├── output.md
│       └── telemetry.json
...
```

## Configuration

Config is stored at `~/.openpmkit/config.json`:

```json
{
  "credentials": {
    "openai": "sk-...",
    "serper": "..."
  },
  "userName": "Sarah Chen",
  "tenantName": "Acme Inc",
  "productName": "Acme Platform"
}
```

## Credentials

| Key | Purpose | Get it at |
|-----|---------|-----------|
| **openai** | AI generation (required) | https://platform.openai.com/api-keys |
| **serper** | Web search | https://serper.dev |
| **newsapi** | News search | https://newsapi.org |

## Project Structure

```
openpmkit/
├── pmkit-desktop/        # CLI tool (npm package)
│   ├── src/cli/          # CLI commands
│   ├── src/lib/          # Core library
│   ├── src/crawlers/     # AI crawlers
│   └── src/integrations/ # PM tool integrations
├── packages/
│   ├── core/             # Domain models, fetchers, crawlers
│   ├── mcp/              # MCP framework helpers
│   ├── mock-tenant/      # Demo dataset
│   └── prompts/          # Prompt templates
└── apps/web/             # Landing page (getpmkit.com)
```

## Development

```bash
# Clone the repo
git clone https://github.com/openpmkit/openpmkit.git
cd openpmkit

# Install dependencies
npm install

# Build all packages
npm run build

# Run CLI in development
cd pmkit-desktop
npx tsx src/cli/index.ts list
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Acknowledgments

openpmkit is inspired by and built on patterns from:
- [Anthropic's cookbook](https://github.com/anthropics/anthropic-cookbook) - AI application patterns
- [openclaw](https://github.com/openclaw/openclaw) - CLI architecture inspiration

We believe AI tools for PMs should be open, extensible, and privacy-first.

## License

MIT - see [LICENSE](LICENSE) for details.

---

**Website**: [getpmkit.com](https://getpmkit.com)
**npm**: [openpmkit](https://www.npmjs.com/package/openpmkit)
**GitHub**: [openpmkit/openpmkit](https://github.com/openpmkit/openpmkit)
