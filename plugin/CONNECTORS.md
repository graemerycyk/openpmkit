# Connectors

## How tool references work

Plugin files use `~~category` as a placeholder for whatever tool the user connects in that category. For example, `~~project tracker` might mean Jira, Linear, Asana, or any other tracker.

Plugins are **tool-agnostic** — they describe workflows in terms of categories rather than specific products.

## Connectors for this plugin

| Category | Placeholder | Common options |
|----------|-------------|----------------|
| Project tracker | `~~project tracker` | Jira, Linear, Asana, monday.com, ClickUp |
| Knowledge base | `~~knowledge base` | Confluence, Notion, Guru, Coda |
| Chat | `~~chat` | Slack, Microsoft Teams |
| Email & Calendar | `~~email`, `~~calendar` | Gmail, Google Calendar, Outlook |
| Support | `~~support` | Zendesk, Intercom, Freshdesk |
| Call transcription | `~~calls` | Gong, Fireflies, Otter.ai |
| CRM | `~~crm` | Salesforce, HubSpot, Close |

## If a connector isn't available

If a tool isn't connected, Claude will:
1. Skip that data source
2. Work with available data
3. NOT ask you to connect tools — just proceed

You can always paste data manually if needed.
