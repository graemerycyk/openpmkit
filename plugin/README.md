# OpenPMKit — Claude Cowork Plugin

AI-powered PM workflows for Product Managers. Daily briefs, PRDs, meeting prep, competitor intel, sprint reviews, and more.

## Installation

**From GitHub:**
```
/plugin marketplace add openpmkit/openpmkit
/plugin install openpmkit
```

**From a direct URL:**
```
/plugin marketplace add https://raw.githubusercontent.com/openpmkit/openpmkit/main/.claude-plugin/marketplace.json
/plugin install openpmkit
```

**From a local clone:**
```
/plugin marketplace add /path/to/openpmkit
/plugin install openpmkit
```

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
