---
name: pm-prd-draft
description: Draft PRDs grounded in customer evidence, with explicit assumptions and open questions
metadata: {"pmkit":{"emoji":"📝","category":"documentation","schedule":"manual"}}
---

# PRD Draft

Draft PRDs grounded in customer evidence, with explicit assumptions and open questions.

## Overview

Generate comprehensive Product Requirements Documents from customer evidence and technical context.

## Tools

### generate_prd_draft

Generate a complete PRD draft from provided context.

**Input:**
```json
{
  "featureName": "Search Filters",
  "epicKey": "ACME-100",
  "includeEvidence": true,
  "includeAnalytics": true
}
```

**Output:** Markdown PRD with:
- Overview (problem statement, goals, non-goals)
- Background (customer evidence with sources, market context)
- Solution (proposed approach, user stories, key flows)
- Requirements (functional and non-functional)
- Success criteria (launch criteria, metrics, rollback)
- Assumptions & risks (explicit assumptions, mitigations)
- Open questions (unresolved items, dependencies)
- Timeline (phases, milestones)

### get_customer_evidence

Fetch aggregated customer evidence for a feature.

**Input:**
```json
{
  "featureName": "Search Filters",
  "sources": ["support", "gong", "community"]
}
```

### get_analytics_signals

Fetch relevant product analytics.

**Input:**
```json
{
  "featureArea": "search",
  "metrics": ["usage", "errors", "satisfaction"]
}
```

### get_existing_docs

Fetch related documentation from Confluence.

**Input:**
```json
{
  "searchQuery": "search filters",
  "spaceKey": "PRODUCT"
}
```

### get_technical_context

Fetch technical context from engineering docs.

**Input:**
```json
{
  "epicKey": "ACME-100",
  "includeArchitecture": true
}
```

## Schedule

Default: Manual trigger only

## Output

Markdown file saved to: `pmkit/prd-draft/{timestamp}/{feature-name}.md`

SIEM telemetry saved to: `pmkit/prd-draft/{timestamp}/telemetry.json`
