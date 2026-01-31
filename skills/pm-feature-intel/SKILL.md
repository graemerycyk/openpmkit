---
name: pm-feature-intel
description: Go beyond sentiment - get specific feature recommendations with quantified demand and competitive context
metadata: {"pmkit":{"emoji":"🔬","category":"feature-intelligence","schedule":"0 9 * * 1"}}
---

# Feature Intelligence

Go beyond sentiment. Get specific feature recommendations with quantified demand, competitive context, and internal alignment signals.

## Overview

Cluster customer feedback into actionable themes with representative quotes, impact assessment, and product implications.

## Tools

### generate_feature_intelligence

Analyze all feedback sources and generate clustered themes.

**Input:**
```json
{
  "lookbackDays": 30,
  "includeSources": ["support", "gong", "community", "nps"]
}
```

**Output:** Markdown report with:
- Executive summary (top 3-5 themes with impact assessment)
- Theme analysis (for each theme):
  - Theme name and description
  - Number of mentions and sources
  - Representative quotes (3-5)
  - Affected customer segments
  - Product implications
- Trend analysis (what's changing vs. last period)
- Recommendations (prioritized actions based on themes)

### get_support_feedback

Fetch support ticket themes and feedback.

**Input:**
```json
{
  "sinceDate": "2026-01-01",
  "groupBy": "theme"
}
```

### get_gong_insights

Fetch aggregated insights from sales calls.

**Input:**
```json
{
  "sinceDate": "2026-01-01",
  "insightTypes": ["pain_points", "feature_requests", "competitors"]
}
```

### get_community_feedback

Fetch community forum posts and feature requests.

**Input:**
```json
{
  "sinceDate": "2026-01-01",
  "minVotes": 5
}
```

### get_nps_verbatims

Fetch NPS survey responses and verbatim feedback.

**Input:**
```json
{
  "sinceDate": "2026-01-01",
  "scoreRange": [0, 10]
}
```

## Schedule

Default: Weekly on Monday at 9:00 AM (`0 9 * * 1`)

## Output

Markdown file saved to: `pmkit/feature-intel/{timestamp}/report.md`

SIEM telemetry saved to: `pmkit/feature-intel/{timestamp}/telemetry.json`
