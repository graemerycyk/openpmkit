---
description: Show all available openpmkit PM workflows and how to use them
---

# openpmkit — AI-Powered PM Workflows

openpmkit provides 11 workflows that **automatically pull data** from your connected tools and generate actionable outputs.

## Getting Started

**First time?** Run `/pmkit-setup` to connect your tools.

**How It Works:**
1. **Run a command** (e.g., `/daily-brief`)
2. **Data is pulled automatically** from Jira, Slack, Calendar, etc.
3. **Output is generated** — ready to use or share

No manual data gathering. No copy-pasting. Just run the command.

---

## Available Commands

### ⚙️ Setup

| Command | What It Does |
|---------|--------------|
| `/pmkit-setup` | Guided setup to connect your PM tools |
| `/pmkit-help` | Show this help |

### 📅 Daily Operations

| Command | What It Does |
|---------|--------------|
| `/daily-brief` | Pulls overnight Jira updates, Slack threads, calendar, support tickets → Morning summary with priorities |
| `/meeting-prep [account]` | Pulls account history, open tickets, call notes → Prep pack with talking points and risks |
| `/sprint-review` | Pulls sprint data, completed tickets, velocity → Review doc with metrics and demo highlights |

### 🔍 Research & Intelligence

| Command | What It Does |
|---------|--------------|
| `/feature-intel` | Pulls support tickets, call transcripts, feedback → VoC report with themes and demand signals |
| `/competitor [name]` | Pulls internal intel + web research → Competitive analysis with strategic implications |

### 📝 Documentation & Planning

| Command | What It Does |
|---------|--------------|
| `/prd-draft [feature]` | Pulls related tickets, docs, customer quotes → PRD grounded in evidence |
| `/roadmap [decision]` | Pulls backlog, OKRs, demand data → Decision memo with options and trade-offs |
| `/release-notes` | Pulls completed tickets since last release → Customer-facing release notes |

### 🎨 Communication & Design

| Command | What It Does |
|---------|--------------|
| `/deck-content [topic]` | Pulls relevant data for topic → Slide content tailored to audience |
| `/prototype [feature]` | Pulls PRD/requirements → Interactive HTML prototype |

---

## Quick Start

```
/pmkit-setup                              # First time setup
/daily-brief                              # Morning catchup
/meeting-prep Acme Corp                   # Prep for customer call
/sprint-review                            # End of sprint summary
/feature-intel --days 30                  # Last 30 days of feedback
/competitor --competitor Notion           # Deep dive on one competitor
/prd-draft Search Filters                 # Start a new PRD
/roadmap "SSO vs Search for Q1"           # Decision memo
/release-notes --version 2.4.0            # Release notes
/deck-content Q4 Update --audience exec   # Exec presentation
/prototype user settings page             # Quick prototype
```

---

## Connected Tools

Commands automatically pull from:

| Category | Tools |
|----------|-------|
| **Calendar & Email** | Google Workspace, Outlook |
| **Project Tracker** | Jira, Linear, Asana |
| **Knowledge Base** | Confluence, Notion, Coda |
| **Chat** | Slack, Teams |
| **Design** | Figma |
| **Support** | Zendesk, Intercom |
| **Calls** | Gong, Fireflies |
| **CRM** | Salesforce, HubSpot |

**Not all tools connected?** No problem — commands skip unavailable sources and work with what's there. Run `/pmkit-setup` for workarounds.

---

## Learn More

- **GitHub:** https://github.com/graemerycyk/openpmkit
- **Issues/Feedback:** https://github.com/graemerycyk/openpmkit/issues
