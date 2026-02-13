# OpenPMKit — Claude Plugin

AI-powered PM workflows for Product Managers. Daily briefs, PRDs, meeting prep, competitor intel, sprint reviews, and more.

## Installation

### Claude Code Desktop

1. Start a session, then type `/plugin` to open the plugin manager
2. Go to the **Marketplaces** tab → click **Add** → enter `graemerycyk/openpmkit`
3. Go to the **Discover** tab → find **OpenPMKit** → click **Install**

### Claude Code CLI

```bash
/plugin marketplace add graemerycyk/openpmkit
/plugin install openpmkit
```

Optionally specify a scope:
- `--scope user` (default) — available across all your projects
- `--scope project` — shared with collaborators via git
- `--scope local` — this repo only, gitignored

Or from a local clone:

```bash
/plugin marketplace add /path/to/openpmkit
/plugin install openpmkit
```

### Claude Cowork

In the Cowork plugins sidebar, click **Add marketplace from GitHub** and enter:

```
graemerycyk/openpmkit
```

Or click **Add marketplace by URL** and enter:

```
https://github.com/graemerycyk/openpmkit.git
```

Then click **Sync**, find OpenPMKit in the marketplace list, and click **Install**.

> **Note:** Cowork plugin marketplace support is still in preview. If the above methods don't work, OpenPMKit is also pending submission to the official [knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) marketplace. Once accepted, it will appear in the Cowork sidebar automatically.

### Standalone Skills (any Claude environment)

You can also use individual workflows as standalone skills without installing the full plugin. Copy any skill directory into your personal skills folder:

```bash
# Copy a single skill
cp -r plugin/skills/prd-draft ~/.claude/skills/prd-draft

# Or copy all 13 skills
cp -r plugin/skills/* ~/.claude/skills/
```

Skills auto-activate when Claude detects a relevant task, or invoke them directly with `/skill-name`.

## Commands

| Command | Description |
|---|---|
| `/daily-brief` | Morning synthesis of overnight activity |
| `/meeting-prep` | Meeting prep pack with context and talking points |
| `/sprint-review` | Sprint summary with metrics and demo highlights |
| `/feature-intel` | Cluster customer feedback into actionable themes |
| `/competitor` | Track competitor changes and feature gaps |
| `/roadmap` | Decision memo for roadmap prioritization |
| `/prd-draft` | Draft a PRD from customer evidence |
| `/prototype` | Interactive HTML prototype from a PRD |
| `/release-notes` | Customer-facing release notes |
| `/deck-content` | Slide content for any audience |
| `/feature-ideation` | Transform ideas into structured feature concepts |
| `/one-pager` | One-page executive summary |
| `/tldr` | Quick 3-5 bullet summary for Slack/email |
| `/pmkit-setup` | Configure company context |
| `/pmkit-help` | List all available workflows |

## Quick Start

1. Run `/pmkit-setup` to configure your company name and details
2. Try `/daily-brief` or `/prd-draft` to see a workflow in action
3. Run `/pmkit-help` for the full guide

## How It Works

Each command guides you through collecting required inputs conversationally, then generates structured output using embedded PM workflow templates. No external dependencies or MCP server required.
