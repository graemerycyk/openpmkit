# Connectors

## How tool references work

Plugin files use `~~category` as a placeholder for whatever tool the user connects in that category. For example, `~~project tracker` might mean Jira, Linear, Asana, or any other tracker with an MCP server.

Plugins are **tool-agnostic** — they describe workflows in terms of categories (project tracker, chat, analytics, etc.) rather than specific products. The `.mcp.json` pre-configures specific MCP servers, but any MCP server in that category works.

## Connection types

OpenPMKit supports three ways to connect data:

- **MCP server** — Pre-configured HTTP endpoints in `.mcp.json`. These connect automatically when authenticated.
- **Claude built-in** — Gmail, Google Calendar, and Google Drive are available via Claude's native OAuth integrations (not MCP). If you've connected them in Claude's settings, they work automatically.
- **Paste data** — Tools without MCP endpoints or Claude integrations. Paste data directly when prompted (e.g., copy from Gong, Zendesk, Loom).

## Connectors for this plugin

| Category | Placeholder | MCP servers (included) | Claude built-in | Paste data / community MCP |
|----------|-------------|------------------------|-----------------|---------------------------|
| Chat | `~~chat` | Slack, Microsoft 365 | | Discord |
| Email | `~~email` | Microsoft 365 | Gmail | |
| Project tracker | `~~project tracker` | Atlassian (Jira), Linear, Asana, Monday.com | | ClickUp |
| Knowledge base | `~~knowledge base` | Notion, Atlassian (Confluence) | Google Drive | Guru, Coda |
| Design | `~~design` | Figma | | Sketch, Adobe XD |
| Product analytics | `~~product analytics` | Amplitude | | Pendo, Mixpanel, Heap, FullStory |
| Customer support | `~~customer support` | Intercom | | Zendesk, Freshdesk |
| Meeting transcription | `~~meeting transcription` | Fireflies | | Gong, Loom, Zoom, Otter.ai |
| Community | `~~community` | | | Discourse, Reddit, Discord |
| Calendar | `~~calendar` | Microsoft 365 | Google Calendar | |
| Research | `~~research` | | | Web search, social monitoring, news tracking (via built-in skills) |

> **Note:** MCP servers connect automatically when you authenticate. Claude built-in integrations (Gmail, Google Calendar, Google Drive) work if you've connected them in Claude's settings. For tools in the "Paste data" column, copy data from those tools and paste when prompted — or configure a community MCP server yourself.

## Data sources by workflow

Each workflow can pull context from connected tools, or you can paste data directly when prompted:

| Data source | Used by |
|-------------|---------|
| Chat messages (Slack, Teams) | Daily Brief, Meeting Prep, Feature Ideation |
| Email (Gmail, Outlook) | Daily Brief, Meeting Prep |
| Project tracker updates (Jira, Linear, Asana, Monday.com) | Daily Brief, Sprint Review, Release Notes |
| Support tickets (Intercom, Zendesk) | Daily Brief, Meeting Prep, VoC Clustering |
| Community posts / feature requests | Daily Brief, VoC Clustering |
| NPS verbatims and survey data | VoC Clustering |
| Call transcripts (Gong, Fireflies, Loom, Zoom) | Meeting Prep, VoC Clustering |
| Account health / NPS scores | Meeting Prep |
| Competitor product updates | Competitor Research |
| Feature comparison data | Competitor Research |
| Analytics data (Amplitude) | Roadmap Alignment, PRD Draft |
| Completed issues (Jira, Linear, Asana) | Sprint Review, Release Notes |
| PRD or feature description | Prototype Generation |
| Knowledge base docs (Notion, Confluence, Google Drive) | One-Pager, TL;DR, PRD Draft |
| Design files (Figma) | Prototype Generation, PRD Draft |
| Calendar (Google Calendar, Outlook) | Daily Brief, Meeting Prep |
| Web search, social feeds, news | Competitor Research, Feature Ideation (via research skills) |
