---
name: pm-competitor
description: Track competitor mentions across X, Reddit, LinkedIn, and news with strategic implications
metadata: {"pmkit":{"emoji":"🔍","category":"competitive-intelligence","schedule":"0 10 * * 1"}}
---

# Competitor Research

Track competitor mentions across X, Reddit, LinkedIn, and news; pricing, features, messaging; with strategic implications.

## Overview

Synthesize competitor product updates into strategic insights with feature gap analysis and recommended responses.

## Tools

### generate_competitor_research

Generate a comprehensive competitor research report.

**Input:**
```json
{
  "competitors": ["Notion", "Coda", "Monday.com", "Asana"],
  "lookbackDays": 14
}
```

**Output:** Markdown report with:
- Key changes summary (most significant updates)
- By competitor (detailed changes per competitor):
  - What changed
  - Why it matters
  - Our position
- Feature gap analysis (where we lead/lag)
- Strategic implications (what this means for our roadmap)
- Recommended actions (suggested responses)

### get_competitor_changes

Fetch recent product changes from competitors.

**Input:**
```json
{
  "competitors": ["Notion", "Coda"],
  "sinceDate": "2026-01-16"
}
```

### get_social_mentions

Fetch competitor mentions from social media.

**Input:**
```json
{
  "competitors": ["Notion", "Coda"],
  "platforms": ["twitter", "reddit", "linkedin"],
  "sinceDate": "2026-01-16"
}
```

### get_news_mentions

Fetch competitor mentions from news sources.

**Input:**
```json
{
  "competitors": ["Notion", "Coda"],
  "sinceDate": "2026-01-16"
}
```

### get_feature_comparison

Fetch feature comparison matrix.

**Input:**
```json
{
  "competitors": ["Notion", "Coda", "Monday.com"],
  "featureAreas": ["search", "ai", "integrations", "sso"]
}
```

## Schedule

Default: Weekly on Monday at 10:00 AM (`0 10 * * 1`)

## Output

Markdown file saved to: `pmkit/competitor/{timestamp}/report.md`

SIEM telemetry saved to: `pmkit/competitor/{timestamp}/telemetry.json`
