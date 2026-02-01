---
name: roadmap
description: Create an alignment memo with options and trade-offs for roadmap decisions. Use when prioritizing features, making build vs buy decisions, or aligning stakeholders.
argument-hint: "[decision topic or question]"
---

# Roadmap Alignment Memo

Generate a decision memo with options, trade-offs, and recommendations.

## Arguments

- `$ARGUMENTS` - The decision or question to address (e.g., "Should we prioritize AI search or SSO for Q1?")

## Your Task

Create a roadmap alignment memo for: **$ARGUMENTS**

## Data to Gather

Use Claude's connected integrations to pull:

1. **Jira** (via Atlassian connector):
   - Related epics and their status
   - Resource allocation and capacity

2. **Confluence** (via Atlassian connector):
   - Strategy docs and OKRs
   - Previous decision memos

3. **Feature Intelligence** (from /feature-intel or ask user):
   - Customer demand data
   - VoC themes and quantification

4. **Competitor Intel** (from /competitor or ask user):
   - Competitive landscape
   - Feature gaps

If data is not available, ask the user to provide context on customer demand, resources, and constraints.

## Output Format

Create an alignment memo with these sections:

---

# Roadmap Alignment Memo

**Decision Required:** [Clear statement of what needs to be decided]
**Date:** [Today's date]
**Author:** [User name]

---

## Decision Required

[Clear description of what needs to be decided and by when]

---

## Context

### Why Now
- [Reason for urgency]
- [Deadline or trigger]

### Background
- [Relevant history]
- [Key constraints]

---

## Options

### Option A: [Name]

**Description:** [What this option entails]

**Pros:**
- [Pro 1]
- [Pro 2]
- [Pro 3]

**Cons:**
- [Con 1]
- [Con 2]

**Evidence:**
- [Data point supporting this option]
- [Customer quote or demand signal]

**Resources:** [X pods/engineers, Y weeks]

**Timeline:** [When it would ship]

**Revenue/Impact:** [Expected outcome]

---

### Option B: [Name]

**Description:** [What this option entails]

**Pros:**
- [Pro 1]
- [Pro 2]

**Cons:**
- [Con 1]
- [Con 2]
- [Con 3]

**Evidence:**
- [Data point supporting this option]
- [Customer quote or demand signal]

**Resources:** [X pods/engineers, Y weeks]

**Timeline:** [When it would ship]

**Revenue/Impact:** [Expected outcome]

---

### Option C: [Name] (if applicable)

[Same structure]

---

## Comparison Matrix

| Criteria | Option A | Option B | Option C |
|----------|----------|----------|----------|
| Customer Impact | [H/M/L] | [H/M/L] | [H/M/L] |
| Revenue Impact | [H/M/L] | [H/M/L] | [H/M/L] |
| Effort | [H/M/L] | [H/M/L] | [H/M/L] |
| Risk | [H/M/L] | [H/M/L] | [H/M/L] |
| Time to Value | [X weeks] | [X weeks] | [X weeks] |

---

## Recommendation

**Recommended Option:** [Option X]

**Reasoning:**
1. [Key reason 1]
2. [Key reason 2]
3. [Key reason 3]

---

## Open Questions

1. [Question that needs resolution]
2. [Question that needs resolution]

---

## Next Steps

If approved:
1. [Action item with owner]
2. [Action item with owner]
3. [Action item with owner]

---

## Guidelines

- Present 2-3 clear options
- Be explicit about trade-offs
- Include evidence for each option
- Make a recommendation with reasoning
- Format for executive review
