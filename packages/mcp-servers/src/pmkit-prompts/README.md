# pmkit Prompts MCP Server

MCP server that exposes pmkit's 10 PM workflows as tools for the Claude app.

## Features

Run pmkit workflows directly from Claude with natural language:

- 📋 **Daily Brief** - Morning briefs from Slack, Jira, support, community
- 🤝 **Meeting Prep** - Customer meeting prep with Gong insights
- 💬 **VoC Clustering** - Customer feedback analysis and themes
- 🔍 **Competitor Research** - Track competitor changes and strategy
- 🗺️ **Roadmap Alignment** - Decision memos with options and trade-offs
- 📝 **PRD Draft** - Evidence-based PRDs with requirements
- 🎯 **Sprint Review** - Sprint accomplishments and metrics
- 🎨 **Prototype Generation** - Interactive HTML prototypes
- 📢 **Release Notes** - Customer-facing release notes
- 📊 **Deck Content** - Presentation slides for any audience

## Installation

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))
- Claude Desktop app ([download here](https://claude.ai/download))

### Step 1: Build the MCP Server

From the pmkit repository root:

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Navigate to the MCP server
cd packages/mcp-servers/src/pmkit-prompts
```

### Step 2: Configure Claude App

Add the MCP server to your Claude Desktop configuration:

**macOS**: Edit `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: Edit `%APPDATA%\Claude\claude_desktop_config.json`

**Linux**: Edit `~/.config/Claude/claude_desktop_config.json`

Add this configuration:

```json
{
  "mcpServers": {
    "pmkit-prompts": {
      "command": "node",
      "args": [
        "/absolute/path/to/pmkit/packages/mcp-servers/src/pmkit-prompts/server.js"
      ],
      "env": {
        "OPENAI_API_KEY": "sk-your-openai-api-key-here"
      }
    }
  }
}
```

**Important**: Replace `/absolute/path/to/pmkit` with the actual absolute path to your pmkit repository.

### Step 3: Restart Claude App

Restart the Claude Desktop app to load the MCP server.

### Step 4: Verify Installation

In Claude, try asking:

> "What pmkit tools are available?"

You should see all 10 workflow tools listed.

## Usage Examples

### Example 1: Generate a Daily Brief

> "Run a daily brief for me. Here are today's updates:
>
> Slack: Team discussing the new search feature, 3 customer questions about API rate limits
>
> Jira: 5 tickets completed, 2 bugs opened (search crashes, dashboard timeout)
>
> Support: 2 escalations from enterprise customers about performance
>
> Community: Feature request for dark mode got 50+ upvotes"

Claude will call `run_daily_brief` with your data and return a formatted brief.

### Example 2: Create a PRD

> "Draft a PRD for a dark mode feature. Customer evidence: 50+ community votes, 12 support tickets, mentioned in 8 Gong calls. Analytics show 30% of users enable dark mode in other tools."

Claude will call `run_prd_draft` and generate a complete PRD with requirements, success criteria, and timeline.

### Example 3: Generate a Prototype

> "Create a prototype for a search filters UI. The PRD says we need:
> - Date range filter (7d, 30d, 90d, custom)
> - Content type filter (docs, projects, comments)
> - Real-time result updates
> - Mobile responsive design"

Claude will call `run_prototype_generation` and return a complete, interactive HTML prototype.

### Example 4: VoC Clustering

> "Analyze this customer feedback and identify themes:
>
> Support tickets: [paste 10-20 ticket summaries]
>
> Gong insights: Customers mention 'search is slow' in 8 calls, 'missing filters' in 12 calls
>
> Community: Top requests are dark mode, API docs, and Slack integration"

Claude will call `run_voc_clustering` and generate a themed analysis with recommendations.

## Available Tools

### 1. run_daily_brief

Generate morning brief from overnight activity.

**Inputs:**
- `slackMessages` (required) - Recent Slack activity
- `jiraUpdates` (required) - Jira ticket updates
- `supportTickets` (required) - Support ticket activity
- `communityActivity` (required) - Community posts/feedback
- `userName` (optional) - Your name (default: "PM")
- `tenantName` (optional) - Company name (default: "Your Company")

**Output:** Markdown brief with TL;DR, urgent items, sprint progress, customer signal, and recommended actions.

### 2. run_meeting_prep

Prepare for customer meetings.

**Inputs:**
- `accountName` (required) - Customer account name
- `gongCalls` (required) - Recent call transcripts/summaries
- `supportTickets` (required) - Open tickets for account
- `meetingType` (optional) - Meeting type (default: "Check-in")
- `attendees` (optional) - Meeting attendees
- `meetingDate` (optional) - Meeting date
- `accountHealth` (optional) - Health metrics
- `userName`, `tenantName` (optional)

**Output:** Markdown prep pack with account summary, history, insights, talking points, and risks/opportunities.

### 3. run_voc_clustering

Cluster customer feedback into themes.

**Inputs:**
- `supportTickets` (required) - Support feedback
- `gongInsights` (required) - Call insights
- `communityFeedback` (required) - Community posts
- `npsVerbatims` (optional) - NPS responses
- `tenantName` (optional)

**Output:** Markdown VoC report with themes, quotes, segments, and recommendations.

### 4. run_competitor_research

Track competitor changes.

**Inputs:**
- `competitorChanges` (required) - Product updates, launches
- `featureComparison` (required) - Feature comparison
- `fromDate`, `toDate` (optional) - Tracking period
- `tenantName` (optional)

**Output:** Markdown intel report with key changes, competitor analysis, gaps, and strategic implications.

### 5. run_roadmap_alignment

Create decision memos.

**Inputs:**
- `decisionContext` (required) - What needs to be decided
- `vocThemes` (required) - Customer demand
- `analyticsInsights` (optional) - Product analytics
- `competitorContext` (optional) - Competitive landscape
- `resourceConstraints` (optional) - Team capacity
- `userName`, `tenantName` (optional)

**Output:** Markdown alignment memo with options, trade-offs, recommendation, and next steps.

### 6. run_prd_draft

Draft PRDs from evidence.

**Inputs:**
- `featureName` (required) - Feature/epic name
- `customerEvidence` (required) - Customer demand evidence
- `epicKey` (optional) - Jira epic key
- `analyticsSignals` (optional) - Analytics data
- `existingDocs` (optional) - Related docs
- `technicalContext` (optional) - Technical constraints
- `userName`, `tenantName` (optional)

**Output:** Markdown PRD with overview, background, solution, requirements, success criteria, risks, and timeline.

### 7. run_sprint_review

Generate sprint review packs.

**Inputs:**
- `sprintName` (required) - Sprint name/number
- `completedStories` (required) - Completed work
- `sprintMetrics` (required) - Velocity, points, bugs
- `sprintStart`, `sprintEnd` (optional) - Sprint dates
- `teamName` (optional) - Team name
- `blockers` (optional) - Issues encountered
- `customerFeedback` (optional) - Feedback on work
- `userName`, `tenantName` (optional)

**Output:** Markdown sprint review with accomplishments, metrics, demo highlights, and customer impact.

### 8. run_prototype_generation

Generate HTML prototypes.

**Inputs:**
- `prdContent` (required) - PRD describing feature
- `designSystem` (optional) - Design guidelines
- `focusAreas` (optional) - UI areas to emphasize

**Output:** Complete, standalone HTML file with embedded CSS/JavaScript.

### 9. run_release_notes

Generate customer-facing release notes.

**Inputs:**
- `productName` (required) - Product name
- `releaseVersion` (required) - Version (e.g., v2.4.0)
- `completedIssues` (required) - Completed Jira work
- `releaseDate` (optional) - Release date
- `epicSummaries` (optional) - Epic context
- `relatedPrds` (optional) - Related PRDs
- `releaseNotesTemplate` (optional) - Previous format

**Output:** Markdown release notes with highlights, features, improvements, and bug fixes.

### 10. run_deck_content

Generate presentation slides.

**Inputs:**
- `topic` (required) - Presentation topic
- `audienceType` (required) - `customer`, `team`, `exec`, or `stakeholder`
- `keyDataPoints` (required) - Metrics and data to include
- `purpose` (optional) - Presentation purpose
- `duration` (optional) - Duration in minutes
- `supportingEvidence` (optional) - Evidence/context
- `relatedArtifacts` (optional) - Related docs
- `requirements` (optional) - Specific requirements
- `userName`, `tenantName` (optional)

**Output:** Markdown slide deck content with headlines, bullets, speaker notes, and visual suggestions.

## Configuration

### Environment Variables

Set in the Claude config file (`env` section):

- `OPENAI_API_KEY` (required) - Your OpenAI API key
- `PMKIT_DEFAULT_MODEL` (optional) - Default model (default: `gpt-5-mini`)
  - Options: `gpt-5-nano`, `gpt-5-mini`, `gpt-5.2`
- `PMKIT_TENANT_ID` (optional) - Tenant ID for isolation (default: `claude-app-tenant`)

### Model Selection

Choose your model based on use case:

| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| `gpt-5-nano` | Fastest | Good | Lowest | Quick drafts, testing |
| `gpt-5-mini` | Fast | Great | Low | Most workflows (default) |
| `gpt-5.2` | Slower | Excellent | Higher | Important docs, presentations |

Example with model override:

```json
{
  "mcpServers": {
    "pmkit-prompts": {
      "command": "node",
      "args": ["..."],
      "env": {
        "OPENAI_API_KEY": "sk-...",
        "PMKIT_DEFAULT_MODEL": "gpt-5.2"
      }
    }
  }
}
```

## Troubleshooting

### "Error: OPENAI_API_KEY environment variable is required"

Make sure you've set `OPENAI_API_KEY` in the `env` section of your Claude config.

### "MCP server not found" or tools not showing up

1. Check that the `args` path is absolute and correct
2. Verify the server.js file exists at that path
3. Restart the Claude Desktop app completely
4. Check Claude's MCP connection status in settings

### "Module not found" errors

Make sure you've built the packages:

```bash
cd /path/to/pmkit
npm install
npm run build
```

### Performance issues

- Use `gpt-5-nano` for faster responses
- For prototypes, expect 30-60 seconds (generates 48K tokens of HTML)
- For standard workflows, expect 5-15 seconds

### Debugging

Check server logs by running manually:

```bash
cd packages/mcp-servers/src/pmkit-prompts
export OPENAI_API_KEY=sk-...
node server.js
```

The server should print:
```
pmkit-prompts MCP server started
Using model: gpt-5-mini
Tenant ID: claude-app-tenant
Ready to accept tool calls from Claude app
```

## Cost Estimates

With GPT-5 Mini (default model):

| Workflow | Tokens | Cost per Run |
|----------|--------|--------------|
| Daily Brief | ~10K | ~$0.02 |
| Meeting Prep | ~10K | ~$0.02 |
| VoC Clustering | ~12K | ~$0.025 |
| Competitor Research | ~12K | ~$0.025 |
| Roadmap Alignment | ~12K | ~$0.025 |
| PRD Draft | ~12K | ~$0.025 |
| Sprint Review | ~12K | ~$0.025 |
| Release Notes | ~12K | ~$0.025 |
| Prototype Generation | ~48K | ~$0.10 |
| Deck Content | ~12K | ~$0.025 |

**Note**: Costs are estimates based on default token limits. Actual costs depend on input size and output length.

## Examples in Practice

### Workflow: PRD → Prototype → Deck

1. **Create PRD**:
   > "Draft a PRD for search filters. Evidence: 50+ community votes, 12 support tickets, top request from enterprise customers."

2. **Generate Prototype**:
   > "Create a prototype based on that PRD. Focus on the filter UI with date range and content type filters."

3. **Create Deck for Execs**:
   > "Generate an executive deck about this search feature. Audience is C-suite. Include customer demand, competitive context, and expected impact."

### Workflow: VoC → Roadmap Alignment

1. **Analyze Feedback**:
   > "Cluster this customer feedback: [paste support tickets, Gong insights, community posts]"

2. **Create Alignment Memo**:
   > "Create a roadmap alignment memo. Decision: should we build dark mode or advanced search next? Use the VoC themes from above as evidence."

## Architecture

This MCP server:

1. **Exposes tools** - Each workflow is an MCP tool with Zod schema validation
2. **Calls prompt templates** - Uses existing `@pmkit/prompts` templates
3. **Executes LLM** - Routes through `@pmkit/core` LLM service
4. **Returns artifacts** - Returns formatted markdown or HTML

The server is **read-only** and follows pmkit's draft-only pattern - it generates artifacts but never writes to external systems.

## Development

### Running Locally

```bash
cd packages/mcp-servers/src/pmkit-prompts

# Set API key
export OPENAI_API_KEY=sk-...

# Run server
node server.js
```

### Testing with MCP Inspector

Install the MCP Inspector:

```bash
npm install -g @modelcontextprotocol/inspector
```

Run the server with inspector:

```bash
mcp-inspector node server.js
```

## Support

- **Issues**: [github.com/getpmkit/pmkit/issues](https://github.com/getpmkit/pmkit/issues)
- **Documentation**: [getpmkit.com](https://getpmkit.com)
- **Email**: support@getpmkit.com

## License

MIT - See LICENSE file in repository root.
