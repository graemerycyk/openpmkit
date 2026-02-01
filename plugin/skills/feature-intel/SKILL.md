---
name: feature-intel
description: Cluster customer feedback into actionable themes with quantified demand. Use for VoC analysis, feature prioritization, or understanding customer pain points.
argument-hint: "[--days 30]"
---

# Feature Intelligence (Voice of Customer)

Analyze customer feedback and identify key themes with quantified demand.

## Arguments

- `--days` - Time period to analyze (default: 30 days)

## Your Task

Cluster customer feedback into actionable themes for: **$ARGUMENTS**

## Data to Gather

Use Claude's connected integrations to pull:

1. **Support Tickets** (via Zendesk/Zapier):
   - Recent tickets and their categories
   - Common complaints and requests

2. **Jira** (via Atlassian connector):
   - Feature requests and enhancements
   - Customer-reported bugs

3. **Gong Call Insights** (via Zapier or ask user):
   - Pain points mentioned in calls
   - Feature requests from sales calls
   - Competitive mentions

4. **Community Feedback** (ask user to provide):
   - Forum posts and feature requests
   - Upvote counts on requests

5. **NPS Verbatims** (ask user to provide):
   - Survey responses and comments
   - Promoter/detractor themes

If data is not available from connectors, ask the user to provide it or work with available data.

## Output Format

Create a VoC report with these sections:

### 1. Executive Summary

| Theme | Mentions | Trend | Impact |
|-------|----------|-------|--------|
| [Theme 1] | X | [up/down/stable] | [Critical/High/Medium/Low] |
| [Theme 2] | X | | |

**Key Insight:** [One sentence summary of what customers are telling us]

### 2. Theme Analysis

For each theme:

#### [Theme Name] (X% of mentions)

**Description:** What this theme represents

**Quantification:**
- Support tickets: X
- Call mentions: X
- Community votes: X

**Representative Quotes:**
> "Quote 1" - Source
> "Quote 2" - Source
> "Quote 3" - Source

**Affected Segments:** [Enterprise, SMB, All users, etc.]

**Product Implications:**
- What this means for the product
- Potential solutions or approaches

### 3. Trend Analysis
- What's increasing vs. last period
- What's decreasing
- New themes emerging

### 4. Recommendations
Prioritized actions based on themes:
1. [Action] - Addresses [theme], [effort], [impact]
2. [Action] - ...
3. [Action] - ...

## Guidelines

- Group similar feedback together
- Quantify each theme (# of mentions, sources)
- Include representative quotes
- Assess impact and urgency
- Connect to product implications
- Be objective and evidence-based
