---
name: pm-meeting-prep
description: Prepare for customer meetings with context, recent calls, open tickets, and talking points
metadata: {"pmkit":{"emoji":"🤝","category":"stakeholder-intelligence","schedule":"0 8 * * 1-5"}}
---

# Meeting Prep Pack

Walk into every customer meeting with context: recent calls, open tickets, and talking points.

## Overview

Compile relevant customer context and suggest talking points for upcoming meetings.

## Tools

### generate_meeting_prep

Generate a complete meeting prep pack for a specific account/meeting.

**Input:**
```json
{
  "accountName": "Globex Corp",
  "meetingType": "QBR",
  "meetingDate": "2026-01-30",
  "attendees": ["John Smith (VP Product)", "Emily Davis (PM)"]
}
```

**Output:** Markdown pack with:
- Account summary (key facts, contract details, health score)
- Recent history (last 3 interactions and outcomes)
- Open issues (unresolved tickets or concerns)
- Key insights (pain points, feature requests, sentiment from calls)
- Talking points (suggested topics and questions)
- Risks & opportunities (what to watch for)

### get_gong_calls

Fetch recent call recordings and insights from Gong.

**Input:**
```json
{
  "accountName": "Globex Corp",
  "limit": 5
}
```

### get_account_tickets

Fetch open support tickets for a specific account.

**Input:**
```json
{
  "accountName": "Globex Corp",
  "status": ["open", "pending"]
}
```

### get_calendar_context

Fetch meeting details and related calendar events.

**Input:**
```json
{
  "meetingDate": "2026-01-30",
  "accountName": "Globex Corp"
}
```

## Schedule

Default: Weekdays at 8:00 AM local time (`0 8 * * 1-5`) - runs for all meetings today

## Output

Markdown file saved to: `pmkit/meeting-prep/{timestamp}/{account-name}.md`

SIEM telemetry saved to: `pmkit/meeting-prep/{timestamp}/telemetry.json`
