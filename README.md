# openpmkit

> Open-source AI Product Management toolkit - 10 autonomous workflows for PMs

**openpmkit** provides AI-powered PM workflows that generate daily briefs, PRDs, meeting prep, competitor research, and more.

**Current:** Claude Plugin (POC) with manual slash commands
**Coming:** Autonomous agents that run on schedule + CLI with full OAuth integrations

## Quick Start: Claude Plugin (POC)

The fastest way to try openpmkit. Uses Claude's native connectors for Jira, Google Workspace, and more.

```bash
# One-line install
curl -fsSL https://raw.githubusercontent.com/graemerycyk/openpmkit/main/install.sh | bash
```

Then in Claude Code:
```
/pmkit-help
/daily-brief
/meeting-prep Acme Corp
```

See [Plugin README](plugin/README.md) for full documentation.

---

## Workflows

| Workflow | Description | Plugin | CLI |
|----------|-------------|--------|-----|
| **daily-brief** | Morning brief from Slack, Jira, support | ✅ | ✅ |
| **meeting-prep** | Customer meeting context and talking points | ✅ | ✅ |
| **feature-intel** | VoC clustering with quantified demand | ✅ | ✅ |
| **prd-draft** | PRDs grounded in customer evidence | ✅ | ✅ |
| **sprint-review** | Sprint summaries with metrics | ✅ | ✅ |
| **competitor** | Competitor tracking with implications | ✅ | ✅ |
| **roadmap** | Alignment memos with trade-offs | ✅ | ✅ |
| **release-notes** | Customer-facing release notes | ✅ | ✅ |
| **deck-content** | Slide content for any audience | ✅ | ✅ |
| **prototype** | Interactive HTML prototypes from PRDs | ✅ | ✅ |

---

## Installation Options

### Option 1: Claude Plugin (POC)

Try openpmkit now with manual slash commands. Leverages Claude's native integrations.

```bash
curl -fsSL https://raw.githubusercontent.com/graemerycyk/openpmkit/main/install.sh | bash
```

**Supported Integrations:**
- ✅ Jira & Confluence (native)
- ✅ Google Workspace - Gmail, Calendar, Drive (native)
- ✅ Linear (native)
- ✅ Slack, Gong, Zendesk, Zoom (via Zapier)

### Option 2: CLI (Work in Progress)

> ⚠️ **Status: OAuth integrations in progress**
>
> The CLI currently works with API keys (OpenAI, Serper, NewsAPI). OAuth integrations for priority data sources (Google, Slack, Jira, Zoom, Gong, Zendesk) are under development.

For users who want local execution, scheduled workflows, or full control:

```bash
# Install globally
npm install -g openpmkit

# Run setup wizard
openpmkit setup

# Run a workflow
openpmkit run daily-brief
```

**CLI Integration Status:**

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

---

## Project Structure

```
openpmkit/
├── plugin/               # Claude Plugin (recommended)
│   ├── README.md
│   └── skills/           # 11 slash commands
├── src/                  # CLI (work in progress)
│   ├── cli/              # CLI commands
│   ├── lib/              # Core: types, config, runner
│   ├── integrations/     # Integration clients
│   └── workflows/        # Workflow definitions
├── prompts/              # Shared prompt templates
└── install.sh            # Plugin installer
```

---

## Development

```bash
# Clone the repo
git clone https://github.com/graemerycyk/openpmkit.git
cd openpmkit

# Install dependencies
npm install

# Build CLI
npm run build

# Run CLI in development
npx tsx src/cli/index.ts list
npx tsx src/cli/index.ts run daily-brief
```

---

## Roadmap

### POC (Current)
- [x] Claude Plugin with 10 workflows (manual slash commands)
- [x] CLI foundation with local execution

### MVP (In Progress)
- [ ] OAuth service for priority integrations (Google, Slack, Jira, Zoom, Gong, Zendesk)
- [ ] Autonomous agents - scheduled workflows that run without user action
- [ ] Autonomous Claude Plugin - background agents within Cowork
- [ ] Submit to Anthropic Plugin Directory

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT - see [LICENSE](LICENSE) for details.

---

**Website**: [getpmkit.com](https://getpmkit.com)
**GitHub**: [graemerycyk/openpmkit](https://github.com/graemerycyk/openpmkit)
