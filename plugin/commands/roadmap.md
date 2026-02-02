---
description: Create an alignment memo with options and trade-offs for roadmap decisions
argument-hint: "<decision or question>"
---

# Roadmap Alignment Memo

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../CONNECTORS.md).

Generate a decision memo with options, trade-offs, and a recommendation.

## Workflow

### 1. Understand the Decision

Accept decision questions like:
- "Should we prioritize AI search or SSO for Q1?"
- "Build vs buy for the analytics dashboard"
- "How should we sequence the mobile roadmap?"

If the question is vague, ask 1-2 clarifying questions.

### 2. Pull Data from Connected Tools

**Do this first — gather context to inform the options analysis.**

If **~~project tracker** (Jira, Linear) is connected:
- Get related epics and their current status
- Check resource allocation and team capacity
- Find dependencies that affect sequencing
- Get estimates if available

If **~~knowledge base** (Confluence, Notion) is connected:
- Find strategy docs and OKRs
- Get previous decision memos on related topics
- Find any existing analysis or research

If **~~support** (Zendesk, Intercom) is connected:
- Get customer demand data for relevant features
- Quantify which option addresses more customer pain

If **~~calls** (Gong, Fireflies) is connected:
- Find customer quotes supporting each option
- Get sales perspective on deal impact

If **~~chat** (Slack) is connected:
- Find relevant discussions or debates
- Get stakeholder perspectives already shared

**If a tool isn't connected, skip that source and proceed. Do NOT ask the user to connect tools.**

### 3. Develop Options

From the gathered data:
- Identify 2-3 viable options (not just "do it" vs "don't")
- Gather evidence for/against each option
- Assess resources, timeline, and impact for each
- Consider hybrid or phased approaches

### 4. Generate the Alignment Memo

Produce the memo in this format:

---

# Roadmap Alignment Memo

| | |
|---|---|
| **Decision** | [Clear statement of what needs to be decided] |
| **Author** | [Name] |
| **Date** | [Today's date] |
| **Decision Needed By** | [Date] |
| **Stakeholders** | [Who needs to align] |

---

## TL;DR

**Recommendation:** [Option X]

[2-3 sentences: Why this option, what's the trade-off we're accepting]

---

## Context

### Why This Decision Now
- [Trigger or urgency]
- [Deadline or dependency]

### Background
- [Relevant history]
- [Current state]
- [Key constraints]

### Strategic Alignment
- **Company OKR:** [Relevant objective]
- **Team OKR:** [Relevant objective]
- **How this decision affects OKRs:** [Connection]

---

## Options

### Option A: [Name]

**What:** [1-2 sentence description]

**✅ Pros:**
- [Pro with evidence/data]
- [Pro with evidence/data]
- [Pro with evidence/data]

**❌ Cons:**
- [Con with evidence/data]
- [Con with evidence/data]

**📊 Evidence:**
- [Data point] — *Source: [where this came from]*
- [Customer quote] — *Source: [Gong/Support/etc.]*

**Resources & Timeline:**
- **Effort:** [X] engineer-weeks
- **Teams involved:** [List]
- **Timeline:** [When it would ship]

**Impact:**
- **Revenue impact:** [Estimate with rationale]
- **Customer impact:** [# affected, how]
- **Strategic impact:** [Positioning, competitive, etc.]

---

### Option B: [Name]

**What:** [1-2 sentence description]

**✅ Pros:**
- [Pro with evidence/data]
- [Pro with evidence/data]

**❌ Cons:**
- [Con with evidence/data]
- [Con with evidence/data]
- [Con with evidence/data]

**📊 Evidence:**
- [Data point] — *Source: [where this came from]*
- [Customer quote] — *Source: [Gong/Support/etc.]*

**Resources & Timeline:**
- **Effort:** [X] engineer-weeks
- **Teams involved:** [List]
- **Timeline:** [When it would ship]

**Impact:**
- **Revenue impact:** [Estimate with rationale]
- **Customer impact:** [# affected, how]
- **Strategic impact:** [Positioning, competitive, etc.]

---

### Option C: [Name] *(if applicable)*

[Same structure]

---

## Comparison Matrix

| Criteria | Option A | Option B | Option C |
|----------|----------|----------|----------|
| Customer Impact | 🟢 High | 🟡 Medium | 🟡 Medium |
| Revenue Impact | 🟡 Medium | 🟢 High | 🔴 Low |
| Effort | 🟡 Medium | 🔴 High | 🟢 Low |
| Risk | 🟢 Low | 🟡 Medium | 🟡 Medium |
| Time to Value | 8 weeks | 12 weeks | 4 weeks |
| Strategic Fit | 🟢 High | 🟢 High | 🟡 Medium |

---

## Recommendation

### Recommended: Option [X]

**Why:**
1. [Primary reason with evidence]
2. [Secondary reason with evidence]
3. [Third reason with evidence]

**Trade-off we're accepting:**
[What we're giving up by choosing this option]

**Mitigations:**
- [How we'll address the downsides]

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk if we choose recommended option] | [H/M/L] | [H/M/L] | [How to mitigate] |

---

## Open Questions

| Question | Owner | Needed By |
|----------|-------|-----------|
| [Question that affects decision] | [Who] | [When] |

---

## Next Steps (if approved)

| Action | Owner | Due |
|--------|-------|-----|
| [First action] | [Name] | [Date] |
| [Second action] | [Name] | [Date] |
| [Third action] | [Name] | [Date] |

---

## Appendix

### Data Sources
- [Where the evidence came from]

### Related Documents
- [Link to relevant docs]

---

## Notes

- Pull data FIRST to ground the options in evidence
- Present real options, not strawmen — each option should be defensible
- Be explicit about trade-offs — every choice has downsides
- Quantify impact where possible — "high impact" is vague, "$500K ARR" is clear
- Make a recommendation — don't just present options, have a point of view
- Format for executive review — busy stakeholders should get the gist from headers
