---
name: pm-sprint-review
description: Generate sprint review packs with completed work, metrics, demos, and stakeholder updates
metadata: {"pmkit":{"emoji":"🏃","category":"agile","schedule":"0 14 * * 5"}}
---

# Sprint Review Pack

Generate sprint review packs with completed work, metrics, demos, and stakeholder updates.

## Overview

Synthesize sprint data into a clear, stakeholder-friendly summary for sprint review presentations.

## Tools

### generate_sprint_review

Generate a complete sprint review pack.

**Input:**
```json
{
  "sprintName": "Sprint 42",
  "teamName": "Product Team",
  "projectKey": "ACME"
}
```

**Output:** Markdown pack with:
- Sprint summary (2-3 sentence overview)
- Key accomplishments (top 3-5 deliverables with business impact)
- Metrics dashboard:
  - Velocity (points completed vs committed)
  - Bug count and resolution rate
  - Customer-facing vs internal work ratio
- Demo highlights (features ready to demo with talking points)
- Blockers & learnings (what slowed us down, what we learned)
- Customer impact (feedback received, how it influenced work)
- Next sprint preview (what's coming up)

### get_completed_stories

Fetch completed Jira stories for the sprint.

**Input:**
```json
{
  "sprintName": "Sprint 42",
  "projectKey": "ACME"
}
```

### get_sprint_metrics

Fetch sprint velocity and metrics.

**Input:**
```json
{
  "sprintName": "Sprint 42",
  "includeHistory": true
}
```

### get_blockers

Fetch blockers and impediments from the sprint.

**Input:**
```json
{
  "sprintName": "Sprint 42"
}
```

### get_customer_feedback_sprint

Fetch customer feedback received during the sprint.

**Input:**
```json
{
  "sprintStartDate": "2026-01-13",
  "sprintEndDate": "2026-01-27"
}
```

## Schedule

Default: Fridays at 2:00 PM (`0 14 * * 5`)

## Output

Markdown file saved to: `pmkit/sprint-review/{timestamp}/{sprint-name}.md`

SIEM telemetry saved to: `pmkit/sprint-review/{timestamp}/telemetry.json`
