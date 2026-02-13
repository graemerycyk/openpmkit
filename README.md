# OpenPMKit

Your PM workflows, inside your AI assistant. 13 product management workflows — daily briefs, PRDs, sprint reviews, competitor reports, and more — available as both an **MCP server** (for Claude Desktop, Cursor, Claude Code) and a **Claude Cowork/Code plugin** (slash commands, no server setup).

You provide context (Slack messages, Jira tickets, customer feedback), and OpenPMKit generates structured, evidence-grounded PM artifacts through your AI assistant.

## Who This Is For

Product managers who use AI assistants (Claude Desktop, Cursor, Claude Cowork, Claude Code) and want structured, repeatable workflows instead of writing prompts from scratch every time.

## What You Get

### 13 PM Workflows as Tools

| # | Tool | What It Produces | Category |
|---|------|------------------|----------|
| 1 | `daily_brief` | Morning synthesis of Slack, Jira, support, community | Autonomous |
| 2 | `meeting_prep` | Account context, talking points, risks for customer meetings | Autonomous |
| 3 | `voc_clustering` | Customer feedback clustered into themes with impact scores | On-Demand |
| 4 | `competitor_research` | Competitor changes, feature gaps, strategic implications | On-Demand |
| 5 | `roadmap_alignment` | Decision memo with options, trade-offs, recommendation | On-Demand |
| 6 | `prd_draft` | Evidence-backed PRD with goals, requirements, timeline | On-Demand |
| 7 | `sprint_review` | Sprint summary, metrics dashboard, demo highlights | Autonomous |
| 8 | `prototype_generation` | Standalone interactive HTML prototype from a PRD | On-Demand |
| 9 | `release_notes` | Customer-facing release notes from completed work | On-Demand |
| 10 | `deck_content` | Slide content tailored for exec, team, customer, or stakeholder | On-Demand |
| 11 | `feature_ideation` | Raw ideas transformed into structured feature concepts | Beta |
| 12 | `one_pager` | 500-word executive summary from multiple inputs | Beta |
| 13 | `tldr` | 30-second Slack/email-ready bullet summary | Beta |

### 2 Utility Tools

- **`pmkit_help`** — Lists every available tool with its required and optional fields
- **`pmkit_workflow_details`** — Shows full field descriptions and examples for any workflow

## How It Works

Each tool is **self-documenting and conversational**:

1. Your AI assistant calls a tool (e.g. `prd_draft`)
2. The MCP server checks if all required data is provided
3. If anything is missing, it tells the assistant exactly what it needs — with descriptions and examples
4. Once all data is there, it renders a complete structured prompt
5. Your AI assistant uses that prompt to generate the artifact

You don't need to remember prompt formats. Just tell your assistant what you need in plain English.

### Example Conversation

> **You:** "I need a PRD for our new search filters feature. We've had 47 support tickets about search."
>
> **Claude:** *Calls `prd_draft` — sees it needs `tenant_name`, `feature_name`, and `customer_evidence`*
>
> **Claude:** "What's your company name?"
>
> **You:** "Acme Corp"
>
> **Claude:** *Calls `prd_draft` with all fields, gets back a structured prompt, generates a full PRD*

---

## Installation

### Option A: Plugin (Claude Code / Claude Cowork)

No Python or server setup required. Install directly as a plugin:

#### Claude Code Desktop

1. Start a session, then type `/plugin` to open the plugin manager
2. Go to the **Marketplaces** tab → click **Add** → enter `graemerycyk/openpmkit`
3. Go to the **Discover** tab → find **OpenPMKit** → click **Install**

#### Claude Code CLI

```bash
/plugin marketplace add graemerycyk/openpmkit
/plugin install openpmkit
```

Optionally specify a scope:

| Scope | Flag | Effect |
|-------|------|--------|
| User (default) | `--scope user` | Available across all your projects |
| Project | `--scope project` | Shared with collaborators via git |
| Local | `--scope local` | This repo only, gitignored |

#### Claude Cowork

In the Cowork plugins sidebar, click **Add marketplace from GitHub** and enter:
```
graemerycyk/openpmkit
```
Or click **Add marketplace by URL** and enter:
```
https://github.com/graemerycyk/openpmkit.git
```
Then click **Sync** and install OpenPMKit from the marketplace list.

> **Note:** Cowork plugin marketplace support is still in preview. If the above methods don't work, OpenPMKit is also pending submission to the official [knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) marketplace. Once accepted, it will appear in the Cowork sidebar automatically.

All 15 slash commands will be available immediately. See [plugin/README.md](plugin/README.md) for the full command list.

### Option B: Standalone Skills (any Claude environment)

Copy individual workflow skills into your personal skills folder — no plugin install or server needed:

```bash
git clone https://github.com/graemerycyk/openpmkit.git
cp -r openpmkit/plugin/skills/* ~/.claude/skills/
```

Skills auto-activate when Claude detects a relevant task, or invoke directly with `/skill-name`.

### Option C: MCP Server (Claude Desktop / Cursor / Claude Code)

#### Prerequisites

- **Python 3.10 or newer** — Check with `python3 --version`
- **pip** (comes with Python) or **uv** (faster alternative)

#### Step 1: Clone the Repo

```bash
git clone https://github.com/graemerycyk/openpmkit.git
cd openpmkit
```

#### Step 2: Set Up Python Environment

```bash
# Create an isolated environment (keeps your system Python clean)
python3 -m venv .venv

# Activate it
source .venv/bin/activate        # macOS / Linux
# .venv\Scripts\activate          # Windows PowerShell
# .venv\Scripts\activate.bat      # Windows CMD
```

#### Step 3: Install

```bash
pip install -e .
```

That's it. The server is now installed and ready.

#### Verify It Works

```bash
pmkit-mcp
```

The server will start and wait for MCP client connections on stdio. Press `Ctrl+C` to stop. If it starts without errors, you're good.

---

## Connect to Your AI Assistant

### Claude Desktop (Recommended)

1. Open Claude Desktop settings
2. Go to **Developer** > **Edit Config**
3. Add the PM Kit server:

**macOS** — edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "pmkit": {
      "command": "/full/path/to/openpmkit/.venv/bin/pmkit-mcp"
    }
  }
}
```

**Windows** — edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "pmkit": {
      "command": "C:\\full\\path\\to\\openpmkit\\.venv\\Scripts\\pmkit-mcp.exe"
    }
  }
}
```

4. Restart Claude Desktop
5. You should see PM Kit tools in the tools list (hammer icon)

**Using `uv` instead of pip?**

```json
{
  "mcpServers": {
    "pmkit": {
      "command": "uv",
      "args": ["run", "--directory", "/full/path/to/openpmkit", "pmkit-mcp"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "pmkit": {
      "command": "/full/path/to/openpmkit/.venv/bin/pmkit-mcp"
    }
  }
}
```

### Claude Code (CLI)

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "pmkit": {
      "command": "/full/path/to/openpmkit/.venv/bin/pmkit-mcp"
    }
  }
}
```

### Other MCP Clients

Any client that supports the MCP stdio transport can connect. Point it at the `pmkit-mcp` binary in your `.venv/bin/` directory.

---

## Usage

Once connected, just talk to your AI assistant naturally. Here are some things you can ask:

### Discover tools
> "What PM tools do I have?"
>
> "Show me what workflows are available"

### Daily work
> "Generate my daily brief — I'm Jane at Acme Corp, here's today's Slack activity: [paste]"
>
> "Prep me for my QBR with Globex Corp tomorrow"

### Strategic work
> "Draft a PRD for our new search filters feature based on this customer feedback: [paste]"
>
> "Create a roadmap alignment memo — we need to decide between AI search and SSO for Q1"
>
> "Analyze this competitor intel and tell me where we have gaps: [paste]"

### Sprint work
> "Generate a sprint review for Sprint 42, here are the completed stories: [paste]"
>
> "Write release notes for v2.4.0 from these Jira tickets: [paste]"

### Communication
> "Create exec deck content for our Q4 product update"
>
> "Give me a TL;DR of this sprint update for Slack"
>
> "Turn this 3-page report into a one-pager for the board"

### Prototyping
> "Generate an HTML prototype from this PRD: [paste]"

---

## Workflow Reference

### Autonomous Workflows

Designed for recurring use — daily standups, meeting prep, sprint ceremonies:

- **Daily Brief** (`daily_brief`) — Synthesizes Slack messages, Jira updates, support tickets, and community activity into a morning brief with urgent items, sprint progress, customer signals, and recommended actions.

- **Meeting Prep** (`meeting_prep`) — Compiles account history, open issues, health metrics, and Gong call insights into a prep pack with talking points, questions to ask, and risks/opportunities.

- **Sprint Review** (`sprint_review`) — Generates a stakeholder-ready sprint summary with key accomplishments, velocity metrics, demo highlights, blockers/learnings, and next sprint preview.

### On-Demand Workflows

Run these when you need a specific artifact:

- **VoC Clustering** (`voc_clustering`) — Clusters feedback from support, calls, community, and NPS into themes with mention counts, representative quotes, trend analysis, and prioritized recommendations.

- **Competitor Research** (`competitor_research`) — Tracks competitor product changes with feature gap analysis, strategic implications, and recommended responses.

- **Roadmap Alignment** (`roadmap_alignment`) — Creates a decision memo with 2-3 options, evidence for each, trade-offs, a recommendation, and next steps. Formatted for executive review.

- **PRD Draft** (`prd_draft`) — Drafts a full PRD: problem statement, goals, user stories, requirements, success criteria, assumptions, risks, and timeline. All grounded in customer evidence.

- **Prototype Generation** (`prototype_generation`) — Outputs a standalone HTML file with embedded CSS and JavaScript. Interactive, responsive, and ready to open in a browser.

- **Release Notes** (`release_notes`) — Translates Jira tickets into customer-friendly release notes with highlights, new features, improvements, bug fixes, and a "coming soon" preview.

- **Deck Content** (`deck_content`) — Generates slide-by-slide content with headlines, bullets, key metrics, visual suggestions, and speaker notes. Adapts tone and depth to the audience (exec, team, customer, stakeholder).

### Beta Workflows

Newer, still being refined:

- **Feature Ideation** (`feature_ideation`) — Takes raw ideas, Slack threads, customer signals, and constraints and produces a structured feature concept with problem definition, solution options, assumptions to validate, and 2-week action plan.

- **One-Pager** (`one_pager`) — Distills multiple documents into a 400-500 word executive summary with TL;DR, context, key findings, recommendations, and next steps.

- **TL;DR** (`tldr`) — Creates a 3-5 bullet summary under 100 words, optimized for Slack and mobile. Includes emoji for scanning and a clear call-to-action.

---

## Project Structure

```
openpmkit/
├── pmkit_mcp/                   # MCP server package
│   ├── __init__.py              # Version metadata
│   ├── __main__.py              # python -m pmkit_mcp entry point
│   ├── server.py                # MCP server — tool registration and handlers
│   ├── renderer.py              # Template rendering and field validation
│   └── workflows/
│       ├── __init__.py          # Public API
│       └── registry.py          # All 13 workflow definitions (source of truth)
├── plugin/                      # Claude Cowork/Code plugin
│   ├── .claude-plugin/
│   │   └── plugin.json          # Plugin manifest
│   ├── commands/                # 15 slash command .md files
│   └── README.md                # Plugin installation and usage
├── .claude-plugin/
│   └── marketplace.json         # Plugin marketplace catalog
├── scripts/
│   └── build_plugin.py          # Generates command .md files from registry.py
├── tests/
│   ├── test_registry.py         # Workflow definition integrity
│   ├── test_renderer.py         # Prompt rendering correctness
│   └── test_server.py           # MCP tool call integration
├── pyproject.toml               # Package config, dependencies, tool settings
├── CLAUDE.md                    # Quick reference for AI coding assistants
├── AGENTS.md                    # Full developer and contributor guide
└── README.md                    # This file
```

## Architecture

```
You (natural language)
 │
 ▼
AI Assistant (Claude Desktop / Cursor / Claude Code)
 │
 │ MCP protocol (stdio, JSON-RPC)
 │
 ▼
┌──────────────────────────────┐
│     PM Kit MCP Server        │
│                              │
│  pmkit_help ──────────────── │ ──→ Lists all 13 tools
│  pmkit_workflow_details ──── │ ──→ Field docs for one tool
│                              │
│  Tool Router                 │
│    │                         │
│    ├─ Schema validation      │ ──→ Rejects calls missing required fields
│    │                         │
│    ├─ Renderer               │ ──→ Substitutes {{placeholders}} with your data
│    │                         │
│    └─ Workflow Registry      │ ──→ 13 workflow definitions with prompts
│                              │
│  Returns: {system_prompt,    │
│            user_prompt}      │
└──────────────────────────────┘
 │
 ▼
AI Assistant processes the structured prompt → generates your artifact
```

The server is **stateless** (no database, no files, no sessions) and **LLM-agnostic** (it produces prompts — your AI assistant's model processes them). Works with Claude, GPT, Gemini, or any model behind your MCP client.

---

## Troubleshooting

### "Command not found: pmkit-mcp"

Make sure your virtual environment is activated:
```bash
source /path/to/openpmkit/.venv/bin/activate
```

Or use the full path in your MCP config:
```json
{ "command": "/full/path/to/openpmkit/.venv/bin/pmkit-mcp" }
```

### Claude Desktop doesn't show PM Kit tools

1. Check the config file path is correct for your OS
2. Make sure you used the **full absolute path** to `pmkit-mcp` (not a relative path)
3. Restart Claude Desktop completely (quit and reopen)
4. Check Claude Desktop logs for errors

### "ModuleNotFoundError: No module named 'mcp'"

You need to install the package:
```bash
cd /path/to/openpmkit
source .venv/bin/activate
pip install -e .
```

### Tools appear but don't work

Check the server runs standalone:
```bash
pmkit-mcp
```
If it starts without errors and waits for input, the server is fine. The issue is in the MCP client configuration.

---

## Development

For contributors and developers who want to modify workflows or add new ones.

### Setup

```bash
git clone https://github.com/graemerycyk/openpmkit.git
cd openpmkit
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

### Run Tests

```bash
pytest              # all 24 tests
pytest -v           # verbose output
pytest tests/test_server.py  # just server tests
```

### Lint and Type Check

```bash
ruff check pmkit_mcp tests    # linting
mypy pmkit_mcp                # type checking
```

### Adding a New Workflow

See [AGENTS.md](AGENTS.md#adding-a-new-workflow) for the step-by-step guide.

---

## License

MIT
