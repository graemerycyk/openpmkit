# Connectors

## How tool references work

Plugin files use `~~category` as a placeholder for whatever tool the user connects in that category. For example, `~~project tracker` might mean Jira, Linear, Asana, or any other tracker with an MCP server.

Plugins are **tool-agnostic** — they describe workflows in terms of categories (project tracker, chat, analytics, etc.) rather than specific products. The `.mcp.json` pre-configures specific MCP servers, but any MCP server in that category works.

## Connectors for this plugin

| Category | Placeholder | Included servers | Other options |
|----------|-------------|------------------|---------------|
| Chat | `~~chat` | Slack, Microsoft 365 | Microsoft Teams, Discord |
| Project tracker | `~~project tracker` | Atlassian (Jira/Confluence), Linear | Asana, monday.com, ClickUp |
| Knowledge base | `~~knowledge base` | Notion, Atlassian (Confluence) | Google Drive, Guru, Coda |
| Design | `~~design` | Figma | Sketch, Adobe XD |
| Product analytics | `~~product analytics` | Amplitude | Pendo, Mixpanel, Heap, FullStory |
| Customer support | `~~customer support` | Intercom | Zendesk, Freshdesk |
| Meeting transcription | `~~meeting transcription` | Fireflies | Gong, Loom, Dovetail, Otter.ai |
| Community | `~~community` | — | Discourse, Reddit, Discord |
| Calendar | `~~calendar` | Microsoft 365 | Google Calendar |

> **Note:** Tools in the **Included servers** column have pre-configured HTTP MCP endpoints in `.mcp.json` and work out of the box. Tools in the **Other options** column (Zendesk, Google Drive, Google Calendar, Gong, Loom, Discourse, etc.) don't have official HTTP MCP server URLs yet — paste data from these tools manually when prompted, or configure a community MCP server yourself.

## Data sources by workflow

Each workflow can pull context from connected tools, or you can paste data directly when prompted:

| Data source | Used by |
|-------------|---------|
| Chat messages (Slack, Teams) | Daily Brief, Meeting Prep, Feature Ideation |
| Project tracker updates (Jira, Linear) | Daily Brief, Sprint Review, Release Notes |
| Support tickets (Intercom, Zendesk) | Daily Brief, Meeting Prep, VoC Clustering |
| Community posts / feature requests | Daily Brief, VoC Clustering |
| NPS verbatims and survey data | VoC Clustering |
| Call transcripts (Gong, Fireflies, Loom) | Meeting Prep, VoC Clustering |
| Account health / NPS scores | Meeting Prep |
| Competitor product updates | Competitor Research |
| Feature comparison data | Competitor Research |
| Analytics data (Amplitude) | Roadmap Alignment, PRD Draft |
| Completed issues (Jira, Linear) | Sprint Review, Release Notes |
| PRD or feature description | Prototype Generation |
| Knowledge base docs (Notion, Confluence) | One-Pager, TL;DR, PRD Draft |
| Design files (Figma) | Prototype Generation, PRD Draft |
