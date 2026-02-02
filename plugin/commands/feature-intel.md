---
description: Cluster customer feedback into actionable themes with quantified demand
argument-hint: "[--days 30] [--topic 'search']"
---

# Feature Intel (Voice of Customer)

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../CONNECTORS.md).

Analyze customer feedback across all channels and cluster into actionable themes with quantified demand.

## Workflow

### 1. Determine Scope

- **Time period:** Use `--days` argument or default to last 30 days
- **Topic filter:** Use `--topic` argument to focus on specific area, or analyze all feedback

### 2. Pull Data from Connected Tools

**Do this first — gather ALL available feedback data before analyzing.**

If **~~support** (Zendesk, Intercom) is connected:
- Get all tickets from the time period
- Extract feature requests, complaints, and pain points
- Note ticket volume and trends
- Get customer segments (enterprise vs SMB, etc.)

If **~~project tracker** (Jira, Linear) is connected:
- Get feature requests and enhancement tickets
- Get customer-reported bugs
- Check existing backlog for related items
- Note vote counts or watchers on requests

If **~~calls** (Gong, Fireflies) is connected:
- Search call transcripts for feature requests
- Extract pain points mentioned by customers
- Note competitive mentions
- Get sentiment from customer conversations

If **~~chat** (Slack) is connected:
- Search customer-facing channels for feedback
- Find internal discussions about customer requests
- Get context on known issues

If **~~knowledge base** (Confluence, Notion) is connected:
- Find existing research or VoC documents
- Get context on previous analyses

**If a tool isn't connected, skip that data source and proceed. Do NOT ask the user to connect tools.**

### 3. Cluster and Analyze

From the gathered data:
- Group similar feedback into themes
- Quantify each theme (# of mentions, # of customers, segments affected)
- Identify trends (increasing, decreasing, new)
- Assess business impact of each theme
- Find representative quotes for each theme

### 4. Generate the Feature Intel Report

Produce the report in this format:

---

# Feature Intel Report

**Period:** [Start date] → [End date] ([X] days)
**Sources:** [List connected sources that provided data]
**Generated:** [Today's date]

---

## Executive Summary

### Top Themes by Demand

| Rank | Theme | Mentions | Customers | Trend | Impact |
|------|-------|----------|-----------|-------|--------|
| 1 | [Theme] | [X] | [Y] | [📈/📉/➡️] | [Critical/High/Medium/Low] |
| 2 | [Theme] | [X] | [Y] | [📈/📉/➡️] | [Critical/High/Medium/Low] |
| 3 | [Theme] | [X] | [Y] | [📈/📉/➡️] | [Critical/High/Medium/Low] |
| 4 | [Theme] | [X] | [Y] | [📈/📉/➡️] | [Critical/High/Medium/Low] |
| 5 | [Theme] | [X] | [Y] | [📈/📉/➡️] | [Critical/High/Medium/Low] |

**Key Insight:** [One sentence: What are customers telling us?]

---

## Theme Deep Dives

### 1. [Theme Name]

**Demand Signal:**
- **Total mentions:** [X] across [Y] sources
- **Unique customers:** [Z]
- **Segments affected:** [Enterprise / SMB / All]
- **Trend:** [📈 Increasing — up X% from last period]

**Representative Quotes:**
> "[Verbatim quote]" — [Customer type], [Source]

> "[Verbatim quote]" — [Customer type], [Source]

> "[Verbatim quote]" — [Customer type], [Source]

**What They're Asking For:**
- [Specific request or capability]
- [Specific request or capability]

**Root Cause / Pain Point:**
[Why this matters to customers — the underlying job-to-be-done]

**Product Implications:**
- [What this means for the product]
- [Potential approach or solution direction]

**Related Backlog Items:**
- [TICKET-123] [Title] — [Status]

---

### 2. [Theme Name]

[Repeat structure]

---

## Trend Analysis

### Rising 📈
- **[Theme]** — Up [X]% from last period. [Why it's growing]

### Declining 📉
- **[Theme]** — Down [X]% from last period. [Why it's declining]

### Emerging 🆕
- **[Theme]** — New pattern appearing. [X] mentions in last [Y] days.

---

## Competitive Intel

*Extracted from customer conversations*

| Competitor | Mentions | Context |
|------------|----------|---------|
| [Competitor] | [X] | [What customers say about them] |

---

## Recommendations

### Prioritized Actions

1. **[Action]**
   - Addresses: [Theme]
   - Effort: [Low/Medium/High]
   - Impact: [Low/Medium/High]
   - Recommendation: [Ship / Investigate / Deprioritize]

2. **[Action]**
   - Addresses: [Theme]
   - Effort: [Low/Medium/High]
   - Impact: [Low/Medium/High]
   - Recommendation: [Ship / Investigate / Deprioritize]

### Quick Wins
- [Small change that addresses feedback with low effort]

### Needs More Research
- [Theme that needs deeper investigation before action]

---

## Data Quality Notes

- **Sources analyzed:** [List]
- **Sources not available:** [List]
- **Confidence level:** [High/Medium/Low based on data completeness]

---

## Notes

- Pull ALL available data FIRST, then cluster and analyze
- Quantify everything — "customers want X" is useless without numbers
- Include verbatim quotes — they're more compelling than summaries
- Be honest about data gaps and confidence levels
- Connect themes to existing backlog items where possible
