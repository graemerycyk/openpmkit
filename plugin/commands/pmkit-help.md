---
description: Show all available OpenPMKit PM workflows and how to use them
argument-hint: [category]
---

If the user provided a category filter with the command, use it here: "$ARGUMENTS"
If a category was provided (e.g., "autonomous", "on-demand", "beta"), show only that section below. Otherwise show all sections.

When the user invokes this command, display the following guide:

# OpenPMKit — Available Workflows

AI-powered PM workflows you can run as slash commands. Each command guides you through collecting the right inputs and generates structured, actionable output.

## Getting Started

1. Run `/pmkit-setup` to configure your company context (name, product, your name)
2. Pick a workflow below and invoke it with its slash command
3. Answer the prompts — the workflow handles the rest

## Autonomous Workflows (run regularly)

| Command | What it does |
|---|---|
| `/daily-brief` | Morning synthesis of Slack, Jira, support, and community activity |
| `/meeting-prep` | Account context, talking points, and risk assessment for customer meetings |
| `/sprint-review` | Sprint summary with accomplishments, metrics, and demo highlights |

## On-Demand Workflows

| Command | What it does |
|---|---|
| `/feature-intel` | Cluster customer feedback into actionable themes with impact assessment |
| `/competitor` | Track competitor product changes, feature gaps, and strategic implications |
| `/roadmap` | Decision memo with options, trade-offs, and recommendations for prioritization |
| `/prd-draft` | Draft a comprehensive PRD from customer evidence, analytics, and technical context |
| `/prototype` | Generate an interactive HTML prototype from a PRD or feature description |
| `/release-notes` | Generate customer-facing release notes from completed work |
| `/deck-content` | Slide content tailored for customer, team, exec, or stakeholder audiences |

## Beta Workflows

| Command | What it does |
|---|---|
| `/feature-ideation` | Transform raw ideas, feedback, and problems into structured feature concepts |
| `/one-pager` | Synthesize multiple inputs into a concise one-page executive summary |
| `/tldr` | Quick 3-5 bullet summary optimized for Slack, email, or async communication |

## Utility Commands

| Command | What it does |
|---|---|
| `/pmkit-setup` | Configure persistent company context (name, product, your name) |
| `/pmkit-help` | This help message |

## Tips

- Every workflow asks for required fields conversationally — just start with the slash command
- Optional fields improve output quality but aren't required
- You can also describe what you need in natural language and the right workflow will be suggested
- All outputs are markdown-formatted and ready to copy into docs, Slack, or presentations
