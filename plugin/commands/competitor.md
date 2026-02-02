---
description: Track competitor product changes with strategic implications
argument-hint: "[--days 14] [--competitor 'Company Name']"
---

# Competitor Intel

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../CONNECTORS.md).

Research competitors and generate an intelligence report with strategic implications.

## Workflow

### 1. Determine Scope

- **Time period:** Use `--days` argument or default to last 14 days
- **Competitor focus:** Use `--competitor` to focus on one, or analyze all known competitors

### 2. Pull Data from Connected Tools

**Do this first — gather all available competitive intelligence before analyzing.**

If **~~knowledge base** (Confluence, Notion) is connected:
- Find existing competitive intel documents
- Get feature comparison matrices
- Find win/loss analysis docs

If **~~calls** (Gong, Fireflies) is connected:
- Search for competitor mentions in sales calls
- Extract what customers say about competitors
- Get win/loss reasons citing competition
- Note competitive objections and how they were handled

If **~~project tracker** (Jira, Linear) is connected:
- Find tickets related to competitive features
- Get "competitive parity" items in backlog

If **~~chat** (Slack) is connected:
- Search for competitor name mentions
- Find competitive discussions in sales/product channels

**Then search the web for public information:**

Use web search to find:
- Recent product announcements and launches
- Press releases and blog posts
- Changelog and release notes
- Pricing changes
- Funding or acquisition news
- Industry analyst coverage
- Social media announcements

**If a tool isn't connected, skip that data source and proceed. Do NOT ask the user to connect tools.**

### 3. Analyze and Assess

From the gathered data:
- Identify significant product changes
- Assess strategic implications for your product
- Compare features to your capabilities
- Note gaps and advantages
- Recommend responses where appropriate

### 4. Generate the Competitor Report

Produce the report in this format:

---

# Competitor Intel Report

**Period:** Last [X] days
**Focus:** [All competitors / Specific competitor]
**Generated:** [Today's date]

---

## Executive Summary

### Key Changes This Period

| Competitor | Change | Significance | Our Response |
|------------|--------|--------------|--------------|
| [Company] | [What changed] | [🔴 High / 🟡 Medium / 🟢 Low] | [Action needed] |
| [Company] | [What changed] | [🔴 High / 🟡 Medium / 🟢 Low] | [Action needed] |

**Bottom Line:** [One sentence: What's the competitive landscape telling us?]

---

## Competitor Deep Dives

### [Competitor Name]

#### What Changed
[Description of the product change, announcement, or news]

#### Source & Date
- **Source:** [URL or document reference]
- **Date:** [When announced]

#### Why It Matters
- [Implication for the market]
- [Implication for our customers]
- [Implication for our product]

#### Our Position

| Aspect | Them | Us | Gap? |
|--------|------|-----|------|
| [Feature/Capability] | [Their status] | [Our status] | [Yes/No] |

**Strengths we have:**
- [Advantage 1]
- [Advantage 2]

**Gaps to address:**
- [Gap 1] — [Urgency: High/Medium/Low]

#### Customer Perception
*From sales calls and support*

> "[What customers say about this competitor]" — [Source]

#### Recommended Response
- **Immediate:** [Action to take now]
- **Near-term:** [Action for next quarter]
- **Watch:** [Things to monitor]

---

### [Competitor Name]

[Repeat structure]

---

## Feature Comparison Matrix

| Feature | Us | [Comp 1] | [Comp 2] | [Comp 3] |
|---------|-----|----------|----------|----------|
| [Feature 1] | ✅ | ✅ | ❌ | 🔜 |
| [Feature 2] | ✅ | ✅ | ✅ | ✅ |
| [Feature 3] | ❌ | ✅ | ✅ | ❌ |
| [Feature 4] | 🔜 | ❌ | ✅ | ✅ |

**Legend:** ✅ = Has | ❌ = Doesn't have | 🔜 = Coming soon | ⭐ = Best-in-class

---

## Win/Loss Insights

*From sales calls and CRM data*

### Recent Wins Against Competitors
| Deal | Competitor | Why We Won |
|------|------------|------------|
| [Deal/Customer] | [Competitor] | [Key differentiator] |

### Recent Losses to Competitors
| Deal | Competitor | Why We Lost |
|------|------------|-------------|
| [Deal/Customer] | [Competitor] | [Gap or issue] |

---

## Market Trends

### Industry Movement
- [Trend 1: What's happening in the market]
- [Trend 2: Where competitors are investing]

### Pricing & Packaging
- [Any pricing changes observed]
- [Packaging or tier changes]

---

## Strategic Implications

### Threats to Address
1. **[Threat]** — [Why it matters, urgency]

### Opportunities to Exploit
1. **[Opportunity]** — [How to capitalize]

### Differentiation to Emphasize
1. **[Differentiator]** — [How to position in sales]

---

## Recommended Actions

| Action | Addresses | Owner | Priority |
|--------|-----------|-------|----------|
| [Specific action] | [Competitive gap/threat] | [Team] | [P0/P1/P2] |
| [Specific action] | [Competitive gap/threat] | [Team] | [P0/P1/P2] |

---

## Notes

- Pull internal data FIRST (calls, win/loss, existing docs), then supplement with web research
- Be specific about sources — link to announcements, cite call transcripts
- Assess significance honestly — not everything is a "major threat"
- Focus on actionable insights, not just news aggregation
- Update the feature matrix if you have one in Confluence/Notion
