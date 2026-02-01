---
name: competitor
description: Track competitor product changes with strategic implications. Use for competitive analysis, market research, or roadmap planning.
argument-hint: "[--days 14] [--competitor 'Company Name']"
---

# Competitor Research

Generate a competitor intelligence report with strategic implications.

## Arguments

- `--days` - Time period to analyze (default: 14 days)
- `--competitor` - Focus on specific competitor (optional)

## Your Task

Create a competitor research report for: **$ARGUMENTS**

## Data to Gather

Use Claude's capabilities to research:

1. **Web Search** (via Claude Research):
   - Recent product announcements
   - Press releases and blog posts
   - Changelog and release notes
   - Industry news mentions

2. **Jira/Confluence** (via Atlassian connector):
   - Internal competitive intel docs
   - Feature comparison matrices
   - Win/loss analysis

3. **Gong/Sales** (via Zapier or ask user):
   - Competitor mentions in sales calls
   - Win/loss reasons citing competition

If internal data is not available, focus on publicly available information.

## Output Format

Create an intel report with these sections:

---

# Competitor Research Report

**Period:** Last [X] days
**Generated:** [Today's date]
**Focus:** [All competitors or specific one]

---

## Key Changes Summary

| Competitor | Change | Significance |
|------------|--------|--------------|
| [Company] | [Change] | [High/Medium/Low] |
| [Company] | [Change] | [High/Medium/Low] |

---

## Detailed Analysis

### [Competitor Name]

#### What Changed
[Description of the product change or announcement]

#### Why It Matters
- [Implication 1]
- [Implication 2]

#### Our Position
- [How we compare]
- [Strengths we have]
- [Gaps to address]

#### Source
[Link or reference to source]

---

### [Competitor Name]

[Repeat structure for each competitor]

---

## Feature Gap Analysis

| Feature | Us | [Comp 1] | [Comp 2] | [Comp 3] |
|---------|-----|----------|----------|----------|
| [Feature 1] | [status] | [status] | [status] | [status] |
| [Feature 2] | [status] | [status] | [status] | [status] |

Legend: [checkmark] = Has, [x] = Doesn't have, [soon] = Coming soon

---

## Strategic Implications

1. **[Trend/Theme]** - [What it means for us]
2. **[Trend/Theme]** - [What it means for us]
3. **[Trend/Theme]** - [What it means for us]

---

## Recommended Actions

1. **[Action]** - [Rationale and urgency]
2. **[Action]** - [Rationale and urgency]
3. **[Action]** - [Rationale and urgency]

---

## Guidelines

- Focus on actionable product changes (not noise)
- Assess strategic implications for your product
- Compare to your capabilities
- Suggest responses where appropriate
- Be objective and fact-based
- Include sources for all claims
