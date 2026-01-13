# pmkit MCP Server - Quick Start

Run pmkit PM workflows directly in Claude Desktop with copy/paste data.

## 🚀 One-Time Setup (2 minutes)

### Step 1: Build the Server

```bash
cd /path/to/pmkit
npm install
npm run build
```

### Step 2: Configure Claude Desktop

Edit your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

Add the pmkit server:

```json
{
  "mcpServers": {
    "pmkit": {
      "command": "node",
      "args": [
        "/absolute/path/to/pmkit/packages/mcp-servers/dist/pmkit-prompts/standalone-server.js"
      ]
    }
  }
}
```

**Important**: Replace `/absolute/path/to/pmkit` with your actual path.

### Step 3: Restart Claude Desktop

Quit and reopen Claude Desktop to load the server.

## ✅ Verify Installation

In any Claude chat, ask:

> "What pmkit workflows are available?"

You should see a table of all 10 PM workflows.

## 📋 Available Workflows

| Command | Name | What It Does |
|---------|------|--------------|
| `/brief` | Daily Brief | Morning brief from Slack, Jira, support, community |
| `/meeting` | Meeting Prep | Customer meeting prep pack |
| `/voc` | VoC Clustering | Customer feedback theme analysis |
| `/competitor` | Competitor Research | Competitor intel report |
| `/roadmap` | Roadmap Alignment | Decision memo with options |
| `/prd` | PRD Draft | Evidence-based PRD |
| `/sprint` | Sprint Review | Sprint review presentation |
| `/prototype` | Prototype | Interactive HTML prototype |
| `/release` | Release Notes | Customer-facing release notes |
| `/deck` | Deck Content | Presentation slides |
| `/ideate` | Feature Ideation | Feature ideation with action items |

## 📊 Workflow Input Reference

### `/brief` - Daily Brief
| Input | Required | Description |
|-------|----------|-------------|
| `slackMessages` | ✅ | Recent Slack messages and discussions |
| `jiraUpdates` | ✅ | Jira ticket updates, status changes |
| `supportTickets` | ✅ | Support ticket activity and escalations |
| `communityActivity` | ✅ | Community posts, feature requests, feedback |
| `userName` | | Your name (default: "PM") |
| `tenantName` | | Company name (default: "Your Company") |

### `/meeting` - Meeting Prep
| Input | Required | Description |
|-------|----------|-------------|
| `accountName` | ✅ | Customer account name |
| `gongCalls` | ✅ | Recent Gong call transcripts or summaries |
| `supportTickets` | ✅ | Open support tickets for this account |
| `meetingType` | | Type of meeting (default: "Check-in") |
| `attendees` | | Meeting attendees |
| `meetingDate` | | Meeting date |
| `accountHealth` | | Account health metrics and notes |

### `/voc` - VoC Clustering
| Input | Required | Description |
|-------|----------|-------------|
| `supportTickets` | ✅ | Support ticket feedback |
| `gongInsights` | ✅ | Customer call insights from Gong |
| `communityFeedback` | ✅ | Community posts and feature requests |
| `npsVerbatims` | | NPS survey responses |
| `tenantName` | | Company name |

### `/competitor` - Competitor Research
| Input | Required | Description |
|-------|----------|-------------|
| `competitorChanges` | ✅ | Competitor product updates, launches, announcements |
| `featureComparison` | ✅ | Feature comparison vs competitors |
| `fromDate` | | Start date for tracking period |
| `toDate` | | End date for tracking period |

### `/roadmap` - Roadmap Alignment
| Input | Required | Description |
|-------|----------|-------------|
| `decisionContext` | ✅ | What decision needs to be made and why |
| `vocThemes` | ✅ | Customer demand themes from VoC analysis |
| `analyticsInsights` | | Product analytics insights |
| `competitorContext` | | Competitive landscape context |
| `resourceConstraints` | | Team capacity and constraints |

### `/prd` - PRD Draft
| Input | Required | Description |
|-------|----------|-------------|
| `featureName` | ✅ | Feature or epic name |
| `customerEvidence` | ✅ | Customer feedback and demand evidence |
| `epicKey` | | Jira epic key (e.g., ACME-100) |
| `analyticsSignals` | | Product analytics data |
| `existingDocs` | | Related documentation or specs |
| `technicalContext` | | Technical considerations or constraints |

### `/sprint` - Sprint Review
| Input | Required | Description |
|-------|----------|-------------|
| `sprintName` | ✅ | Sprint name or number (e.g., Sprint 42) |
| `completedStories` | ✅ | Completed stories and features |
| `sprintMetrics` | ✅ | Sprint velocity, points, bug count |
| `sprintStart` | | Sprint start date |
| `sprintEnd` | | Sprint end date |
| `teamName` | | Team name (default: "Product Team") |
| `blockers` | | Blockers and issues encountered |
| `customerFeedback` | | Customer feedback on shipped work |

### `/prototype` - Prototype Generation
| Input | Required | Description |
|-------|----------|-------------|
| `prdContent` | ✅ | PRD content describing the feature to prototype |
| `designSystem` | | Design system guidelines or constraints |
| `focusAreas` | | Specific UI areas to focus on |

### `/release` - Release Notes
| Input | Required | Description |
|-------|----------|-------------|
| `productName` | ✅ | Product name |
| `releaseVersion` | ✅ | Release version (e.g., v2.4.0) |
| `completedIssues` | ✅ | Completed Jira issues/stories for this release |
| `releaseDate` | | Release date |
| `epicSummaries` | | Epic summaries for context |
| `relatedPrds` | | Related PRD content |
| `releaseNotesTemplate` | | Previous release notes format |

### `/deck` - Deck Content
| Input | Required | Description |
|-------|----------|-------------|
| `topic` | ✅ | Presentation topic or title |
| `audienceType` | ✅ | Target audience: `customer`, `team`, `exec`, or `stakeholder` |
| `keyDataPoints` | ✅ | Key metrics, numbers, or data to include |
| `purpose` | | Purpose of the presentation |
| `duration` | | Presentation duration in minutes |
| `supportingEvidence` | | Supporting evidence or context |
| `relatedArtifacts` | | Related PRDs, reports, or docs |
| `requirements` | | Specific requirements or constraints |

### `/ideate` - Feature Ideation
| Input | Required | Description |
|-------|----------|-------------|
| `featureIdeas` | ✅ | Raw feature ideas, themes, or brainstorm notes |
| `problemStatement` | ✅ | The problem you're trying to solve |
| `slackDiscussions` | | Relevant Slack threads or team discussions |
| `customerSignals` | | Customer feedback, requests, or research |
| `competitiveContext` | | What competitors are doing |
| `constraints` | | Technical, resource, or timeline constraints |

## 💡 How to Use

### Method 1: Natural Language

Just describe what you need:

> "Create a daily brief. Here's my data:
> - Slack: Team discussing search feature, 3 customer questions
> - Jira: 5 tickets done, 2 bugs opened
> - Support: 2 escalations about performance
> - Community: Dark mode request got 50 upvotes"

### Method 2: Command Style

Use the command shortcuts:

> "/brief
> Slack: Team discussing search feature
> Jira: 5 tickets completed
> Support: 2 escalations
> Community: Dark mode request"

### Method 3: Ask for Help

> "How do I use /prd?"

Claude will show you the required inputs and an example.

## 📝 Example: Create a PRD

```
/prd
Feature: Search Filters
Evidence: 89 community votes, 47 support tickets, mentioned in 12 Gong calls
Analytics: Users average 4.2 searches before finding content
```

Claude will generate a complete PRD with:
- Problem statement
- Goals and success metrics
- User stories
- Requirements
- Timeline

## 🔧 Troubleshooting

### "MCP server not found"

1. Check the path in your config is correct
2. Make sure you ran `npm run build`
3. Restart Claude Desktop completely

### Server not responding

Run the server manually to check for errors:

```bash
node /path/to/pmkit/packages/mcp-servers/dist/pmkit-prompts/standalone-server.js
```

You should see:
```
pmkit MCP server started
Available workflows: /brief, /meeting, /voc, /competitor, /roadmap, /prd, /sprint, /prototype, /release, /deck, /ideate
Ready to accept tool calls from Claude app
```

## 🆚 Simple vs Full Server

This quick start uses the **standalone server** which:
- ✅ Works with copy/paste data
- ✅ No API keys needed
- ✅ Claude processes the prompts directly
- ✅ Zero configuration

For the **full server** (with external LLM calls), see `README.md`.

## 📚 More Info

- Full documentation: `README.md`
- All prompt templates: `packages/prompts/src/index.ts`
- pmkit website: https://getpmkit.com
