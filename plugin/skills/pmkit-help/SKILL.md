---
name: pmkit-help
description: Show all available openpmkit PM workflows and how to use them
disable-model-invocation: true
---

When the user runs /pmkit-help, display the following help documentation:

# openpmkit - AI-Powered PM Workflows

openpmkit provides 10 workflows to help Product Managers work smarter. Each workflow pulls data from your connected tools (Jira, Slack, Google Calendar, etc.) and generates actionable outputs.

## Available Commands

### Daily Operations
| Command | Description |
|---------|-------------|
| `/daily-brief` | Morning context summary - synthesizes overnight Slack, Jira, support tickets, and community activity |
| `/meeting-prep [account]` | Pre-meeting research pack with talking points, account history, and risks |
| `/sprint-review` | Sprint summary with accomplishments, metrics, blockers, and demo highlights |

### Research & Intelligence
| Command | Description |
|---------|-------------|
| `/feature-intel` | Voice of Customer clustering - identifies top themes from support, calls, and community |
| `/competitor` | Competitor tracking with feature gaps, strategic implications, and recommended actions |

### Documentation & Planning
| Command | Description |
|---------|-------------|
| `/prd-draft [feature]` | Generate a PRD grounded in customer evidence |
| `/roadmap [decision]` | Alignment memo with options, trade-offs, and recommendations |
| `/release-notes` | Customer-facing release notes from completed Jira issues |

### Communication & Design
| Command | Description |
|---------|-------------|
| `/deck-content [topic] --audience [type]` | Slide content for exec, customer, team, or stakeholder audiences |
| `/prototype` | Interactive HTML prototype from a PRD |

## Quick Start Examples

```
/daily-brief
/meeting-prep Acme Corp
/prd-draft Search Filters
/competitor --days 14
/deck-content Q4 Update --audience exec
```

## Data Sources

These workflows pull from your connected integrations:
- **Atlassian** (Jira, Confluence) - tickets, sprints, docs
- **Google Workspace** (Gmail, Calendar, Drive) - emails, meetings, docs
- **Slack** (via Zapier) - channel activity, threads
- **Gong** (via Zapier) - call transcripts, insights
- **Zendesk** (via Zapier) - support tickets

## Learn More

Visit https://github.com/graemerycyk/openpmkit for documentation and updates.
