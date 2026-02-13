# OpenPMKit

An AI-powered product management plugin primarily designed for [Cowork](https://claude.com/product/cowork), Anthropic's agentic desktop application — though it also works in Claude Code. 13 structured PM workflows covering daily operations, strategic planning, stakeholder communication, and sprint execution.

## Installation

### Cowork / knowledge-work-plugins

```
claude plugins add knowledge-work-plugins/openpmkit
```

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

## What It Does

This plugin gives you an AI-powered PM toolkit with structured, evidence-grounded workflows:

- **Daily Briefs** — Synthesize overnight Slack messages, Jira updates, support tickets, and community activity into a morning brief with urgent items, sprint progress, and recommended actions.
- **Meeting Prep** — Compile account history, open issues, health metrics, and call insights into a prep pack with talking points, questions to ask, and risks.
- **Sprint Reviews** — Generate stakeholder-ready sprint summaries with key accomplishments, velocity metrics, demo highlights, and next sprint preview.
- **VoC Clustering** — Cluster customer feedback from support, calls, community, and NPS into themes with mention counts, representative quotes, and prioritized recommendations.
- **Competitor Research** — Track competitor product changes with feature gap analysis, strategic implications, and recommended responses.
- **Roadmap Alignment** — Create decision memos with 2-3 options, evidence for each, trade-offs, a recommendation, and next steps.
- **PRD Drafts** — Draft full PRDs grounded in customer evidence: problem statement, goals, user stories, requirements, success criteria, and timeline.
- **Prototype Generation** — Output standalone interactive HTML prototypes with embedded CSS and JavaScript from a PRD or feature description.
- **Release Notes** — Translate completed Jira tickets into customer-friendly release notes with highlights, new features, improvements, and bug fixes.
- **Deck Content** — Generate slide-by-slide content with headlines, key metrics, visual suggestions, and speaker notes. Adapts to exec, team, customer, or stakeholder audiences.
- **Feature Ideation** — Transform raw ideas, Slack threads, and customer signals into structured feature concepts with problem definition, solution options, and action plans.
- **One-Pagers** — Distill multiple documents into a 400-500 word executive summary with key findings, recommendations, and next steps.
- **TL;DR** — Create 3-5 bullet summaries under 100 words, optimized for Slack and mobile with a clear call-to-action.

## Commands

| Command | What It Does |
|---------|--------------|
| `/daily-brief` | Synthesize overnight activity into a morning brief |
| `/meeting-prep` | Generate a meeting prep pack with context and talking points |
| `/sprint-review` | Create a sprint summary with metrics and demo highlights |
| `/feature-intel` | Cluster customer feedback into actionable themes |
| `/competitor` | Track competitor changes and feature gaps |
| `/roadmap` | Create a decision memo for roadmap prioritization |
| `/prd-draft` | Draft a PRD from customer evidence |
| `/prototype` | Generate an interactive HTML prototype from a PRD |
| `/release-notes` | Write customer-facing release notes |
| `/deck-content` | Generate slide content for any audience |
| `/feature-ideation` | Transform ideas into structured feature concepts |
| `/one-pager` | Create a one-page executive summary |
| `/tldr` | Quick 3-5 bullet summary for Slack/email |
| `/pmkit-setup` | Configure your company name and details |
| `/pmkit-help` | List all available workflows with usage guide |

## Skills

| Skill | What It Covers |
|-------|----------------|
| `daily-brief` | Morning synthesis, overnight triage, sprint status, action items |
| `meeting-prep` | Account context, talking points, risk assessment, Gong insights |
| `sprint-review` | Sprint metrics, velocity tracking, demo highlights, retrospective |
| `feature-intel` | VoC analysis, theme clustering, impact scoring, prioritization |
| `competitor` | Competitive intel, feature gaps, strategic positioning, response plans |
| `roadmap` | Decision frameworks, trade-off analysis, stakeholder alignment |
| `prd-draft` | Requirements writing, user stories, success criteria, evidence grounding |
| `prototype` | HTML/CSS/JS prototyping, responsive design, interactive components |
| `release-notes` | Customer communication, feature highlights, changelog formatting |
| `deck-content` | Presentation structure, audience adaptation, speaker notes, data visualization |
| `feature-ideation` | Idea structuring, problem framing, solution options, validation plans |
| `one-pager` | Executive synthesis, key findings, recommendations, next steps |
| `tldr` | Bullet summaries, Slack formatting, call-to-action, mobile readability |

## Example Workflows

### Morning Brief

```
You: /daily-brief
Claude: What's your name and company?
You: Jane at Acme Corp
Claude: Paste any overnight Slack messages, Jira updates, or support tickets
You: [Pastes Slack and Jira activity]
Claude: [Generates morning brief with urgent items, sprint progress, customer signals, and recommended actions]
```

### Drafting a PRD

```
You: /prd-draft
Claude: What feature are you speccing?
You: Search filters — we've had 47 support tickets about search
Claude: [Asks about company name, technical context, analytics signals]
Claude: [Generates full PRD with problem statement, goals, user stories, requirements, success criteria, and timeline]
```

### Preparing for a Customer Meeting

```
You: /meeting-prep
Claude: What meeting are you preparing for?
You: QBR with Globex Corp tomorrow — I'm Jane from Acme Corp
Claude: [Asks about attendees, account health, recent support tickets]
Claude: [Generates prep pack with talking points, questions to ask, risks to address, and opportunities]
```

### Quick Summary for Slack

```
You: /tldr
Claude: What content do you want summarized?
You: [Pastes sprint review document]
Claude: [Generates 3-5 bullet summary with emoji, optimized for Slack posting]
```

## Data Sources

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](CONNECTORS.md).

Connect your PM and communication tools for the best experience. Without them, provide context manually by pasting data when prompted.

**Included MCP connections:**

- Chat (Slack, Microsoft 365) for team context, overnight activity, and stakeholder threads
- Project tracker (Atlassian/Jira, Linear) for sprint progress, ticket status, and roadmap integration
- Knowledge base (Notion, Confluence) for existing specs, research, and meeting notes
- Design (Figma) for design context and prototype reference
- Product analytics (Amplitude) for usage data, metrics, and feature adoption
- Customer support (Intercom) for support tickets, feature requests, and customer conversations
- Meeting transcription (Fireflies) for call notes, meeting context, and discussion highlights
- Microsoft 365 for email, calendar, and document context

**Additional options:**

- See [CONNECTORS.md](CONNECTORS.md) for alternative tools in each category

For an even richer integration, OpenPMKit also ships as an [MCP server](https://github.com/graemerycyk/openpmkit) that connects directly to Claude Desktop, Cursor, and Claude Code.
