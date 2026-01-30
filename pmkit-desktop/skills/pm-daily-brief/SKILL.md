---
name: pm-daily-brief
description: Generate morning brief synthesizing overnight activity from Slack, Jira, and support
metadata: {"pmkit":{"emoji":"☀️","category":"operational-intelligence","schedule":"0 7 * * 1-5"}}
---

# Daily Brief

Generate a synthesized morning brief for product managers from connected data sources.

## Overview

Start each day with a synthesized brief from Slack, Jira, support, and community - automatically.

## Tools

### generate_daily_brief

Generate a comprehensive daily brief from all connected data sources.

**Input:**
```json
{
  "sinceHoursAgo": 24,
  "includeSlack": true,
  "includeJira": true,
  "includeSupport": true,
  "focusChannels": ["#product", "#engineering", "#support"]
}
```

**Output:** Markdown brief with:
- TL;DR summary (2-3 sentences)
- Urgent items (blockers, escalations, critical bugs)
- Sprint progress (current sprint status and notable updates)
- Customer signal (key feedback from support and community)
- Recommended actions (top 3 things to focus on today)

### get_slack_activity

Fetch recent Slack messages from specified channels.

**Input:**
```json
{
  "channelIds": ["C1234", "C5678"],
  "sinceHoursAgo": 24
}
```

### get_jira_updates

Fetch recent Jira ticket updates and sprint progress.

**Input:**
```json
{
  "projectKey": "ACME",
  "sinceHoursAgo": 24
}
```

### get_support_tickets

Fetch recent Zendesk tickets and escalations.

**Input:**
```json
{
  "sinceHoursAgo": 24,
  "priorityFilter": ["urgent", "high"]
}
```

## Schedule

Default: Weekdays at 7:00 AM local time (`0 7 * * 1-5`)

## Output

Markdown file saved to: `pmkit/daily-brief/{timestamp}/brief.md`

SIEM telemetry saved to: `pmkit/daily-brief/{timestamp}/telemetry.json`
