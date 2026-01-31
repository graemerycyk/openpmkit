---
name: pm-deck-content
description: Generate slide content tailored for exec, customer, team, or stakeholder audiences
metadata: {"pmkit":{"emoji":"📊","category":"communication","schedule":"manual"}}
---

# Deck Content

Generate slide content tailored for exec, customer, team, or stakeholder audiences - ready to paste into your templates.

## Overview

Generate structured slide content that can be copy-pasted into any existing presentation template. PMs work with company-mandated templates, so this provides TEXT CONTENT only - not design.

## Tools

### generate_deck_content

Generate slide deck content for a specific topic and audience.

**Input:**
```json
{
  "topic": "Q4 Product Update",
  "audienceType": "exec",
  "purpose": "Quarterly business review",
  "duration": 30
}
```

**Audience Types:**
- `customer` - Value and outcomes focus, ROI, success stories
- `team` - Technical details, sprint metrics, demos
- `exec` - Business impact, strategic decisions, concise
- `stakeholder` - Cross-functional dependencies, timelines

**Output:** Markdown with structured slides:
- Title slide (headline, subtitle, presenter info)
- Agenda/overview (optional for short decks)
- Context/problem (why this matters now)
- Main content (3-5 slides with key points and data)
- Impact/results (metrics, outcomes, benefits)
- Next steps/ask (clear action items or decisions)
- Appendix suggestions (Q&A prep material)

Each slide includes:
- **[SLIDE N: Type]** - Slide number and purpose
- **Headline**: One compelling sentence (max 10 words)
- **Bullets**: Max 3 points, 5-7 words each
- **Key Metric**: (if applicable) One number that matters
- **Visual Suggestion**: What chart/image would help
- **Speaker Notes**: What to say, what to avoid, likely questions

### get_key_data_points

Fetch relevant data points for the presentation.

**Input:**
```json
{
  "topic": "Q4 Product Update",
  "metrics": ["velocity", "nps", "revenue_impact"]
}
```

### get_supporting_evidence

Fetch supporting evidence (quotes, testimonials).

**Input:**
```json
{
  "topic": "Q4 Product Update",
  "evidenceTypes": ["customer_quotes", "metrics", "comparisons"]
}
```

### get_related_artifacts

Fetch related documents for reference.

**Input:**
```json
{
  "topic": "Q4 Product Update",
  "artifactTypes": ["prds", "reviews", "roadmaps"]
}
```

## Schedule

Default: Manual trigger only

## Output

Markdown file saved to: `pmkit/deck-content/{timestamp}/{topic}.md`

SIEM telemetry saved to: `pmkit/deck-content/{timestamp}/telemetry.json`
