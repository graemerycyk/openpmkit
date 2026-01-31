---
name: pm-roadmap
description: Generate alignment memos with options, trade-offs, and recommendations for stakeholder decisions
metadata: {"pmkit":{"emoji":"🗺️","category":"strategy","schedule":"manual"}}
---

# Roadmap Alignment

Generate alignment memos with options, trade-offs, and recommendations for stakeholder decisions.

## Overview

Synthesize context and present options with clear trade-offs for roadmap decisions.

## Tools

### generate_roadmap_alignment

Generate a roadmap alignment memo for a specific decision.

**Input:**
```json
{
  "decisionTitle": "Q1 2026 Priority: Search AI vs Enterprise SSO",
  "decisionContext": "We need to decide the primary focus for Q1 engineering capacity",
  "options": ["Search AI First", "Enterprise SSO First", "Parallel (Reduced Scope)"]
}
```

**Output:** Markdown memo with:
- Decision required (clear statement of what needs to be decided)
- Context (background and why this matters now)
- Options (2-3 options, each with):
  - Description
  - Pros
  - Cons
  - Evidence supporting this option
  - Resource requirements
  - Timeline
- Recommendation (which option and why)
- Open questions (what we still need to learn)
- Next steps (if approved, what happens next)

### get_voc_themes

Fetch voice of customer themes for evidence.

**Input:**
```json
{
  "relevantTo": ["search", "sso"],
  "lookbackDays": 90
}
```

### get_analytics_insights

Fetch product analytics for decision support.

**Input:**
```json
{
  "featureAreas": ["search", "enterprise"],
  "metrics": ["usage", "retention", "conversion"]
}
```

### get_competitor_context

Fetch competitive landscape for the decision.

**Input:**
```json
{
  "featureAreas": ["search", "sso"]
}
```

### get_resource_constraints

Fetch current engineering capacity and constraints.

**Input:**
```json
{
  "quarter": "Q1 2026",
  "includeAllocations": true
}
```

## Schedule

Default: Manual trigger only

## Output

Markdown file saved to: `pmkit/roadmap/{timestamp}/{decision-title}.md`

SIEM telemetry saved to: `pmkit/roadmap/{timestamp}/telemetry.json`
