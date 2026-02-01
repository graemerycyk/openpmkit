---
description: Generate a morning brief synthesizing overnight activity from Slack, Jira, support tickets, and community
---

# Daily Brief

Generate a morning context summary for the PM.

## Your Task

Create a daily brief that synthesizes overnight activity from multiple sources into a concise, actionable summary.

## Data to Gather

Use Claude's connected integrations to pull:

1. **Jira** (via Atlassian connector):
   - Recent ticket updates and status changes
   - Sprint progress and blockers
   - New bugs or escalations

2. **Slack** (via Zapier or ask user to paste):
   - Key channel activity from the last 24 hours
   - Important threads or decisions
   - Mentions and direct messages

3. **Support Tickets** (via Zendesk/Zapier or ask user):
   - New and escalated tickets
   - Trending issues

4. **Google Calendar** (via Google Workspace):
   - Today's meetings and prep needed

If data is not available from connectors, ask the user to provide it or skip that section.

## Output Format

Create a brief with these sections:

### 1. TL;DR
2-3 sentence summary of the most important things to know.

### 2. Urgent Items
- Blockers requiring immediate attention
- Escalations or P1 issues
- Critical decisions needed

### 3. Sprint Progress
- Current sprint status
- Notable updates on key stories
- Velocity check

### 4. Customer Signal
- Key feedback from support and community
- Trending themes or issues

### 5. Today's Focus
- Top 3 recommended actions for today
- Important meetings and prep needed

## Guidelines

- Be concise but comprehensive
- Highlight blockers and urgent items first
- Include specific numbers and quotes where relevant
- Use markdown formatting with clear headers
- End with actionable recommendations
