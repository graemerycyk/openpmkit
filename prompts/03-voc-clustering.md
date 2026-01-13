# Voice of Customer (VoC) Clustering Prompt

Cluster customer feedback into actionable themes.

---

## System Prompt

```
You are a product management assistant specializing in voice of customer analysis.
Your job is to identify patterns in customer feedback and cluster them into actionable themes.

Guidelines:
- Group similar feedback together
- Quantify each theme (# of mentions, sources)
- Include representative quotes
- Assess impact and urgency
- Connect to product implications
```

---

## User Prompt Template

```
Analyze customer feedback for {{tenantName}} and identify key themes.

## Feedback Sources

### Support Tickets
{{supportTickets}}

### Gong Call Insights
{{gongInsights}}

### Community Posts & Feature Requests
{{communityFeedback}}

### NPS Verbatims
{{npsVerbatims}}

## Output Format

Create a VoC report with:
1. **Executive Summary** - Top 3-5 themes with impact assessment
2. **Theme Analysis** - For each theme:
   - Theme name and description
   - Number of mentions and sources
   - Representative quotes (3-5)
   - Affected customer segments
   - Product implications
3. **Trend Analysis** - What's changing vs. last period
4. **Recommendations** - Prioritized actions based on themes
```

---

## Required Context

- `supportTickets` - Support ticket data
- `gongInsights` - Call transcript insights
- `communityFeedback` - Community posts and feature requests

---

## Output Format

Markdown

---

## Usage in ChatGPT/Claude

1. Copy the **System Prompt** and paste it as your first message (or use as custom instructions)
2. Copy the **User Prompt Template** and replace the `{{placeholders}}` with your actual data:
   - `{{tenantName}}` → Your company name
   - `{{supportTickets}}` → Paste support ticket summaries
   - `{{gongInsights}}` → Paste call insights/transcripts
   - `{{communityFeedback}}` → Paste community posts and feature requests
   - `{{npsVerbatims}}` → Paste NPS survey responses

---

## Example Output

```markdown
# Voice of Customer Report

**Period**: Last 30 days
**Generated**: 2026-01-13
**Data Sources**: Support (47), Gong (32 calls), Community (45), NPS (28)

## Executive Summary

| Theme | Mentions | Trend | Impact |
|-------|----------|-------|--------|
| Search Frustration | 52 | ↑ 15% | Critical |
| Onboarding Complexity | 33 | → Stable | High |
| Integration Gaps | 27 | ↓ 8% | Medium |
| Performance Issues | 22 | ↑ 25% | High |

**Key Insight**: Search remains the #1 pain point, with enterprise customers 
citing it as an expansion blocker.

## Theme Analysis

### 1. Search Frustration (35% of mentions)

**Description**: Users struggle to find content, report poor relevance, 
and lack filtering options.

**Quantification**:
- 47 support tickets
- 12 Gong call mentions
- 89-vote feature request

**Representative Quotes**:
> "I spend more time searching than working" - Globex Corp
> "Search never finds what I'm looking for" - Community
> "We've created workarounds using tags but it's not sustainable" - Initech

**Affected Segments**: Enterprise (highest), Mid-market, All users

**Product Implications**:
- Search improvements are critical for retention
- Filters are table-stakes expectation
- Enterprise expansion blocked

## Recommendations

1. **Ship search improvements** (In Progress) - Addresses top theme
2. **Redesign onboarding flow** - High impact, medium effort
3. **Rebuild Slack integration** - Address reliability concerns
```
