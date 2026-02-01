---
name: sprint-review
description: Generate a sprint review summary with accomplishments, metrics, and demo highlights. Use for sprint reviews, stakeholder updates, or team retrospectives.
argument-hint: "[--sprint 'Sprint 42']"
---

# Sprint Review Pack

Generate a comprehensive sprint review summary.

## Arguments

- `--sprint` - Sprint name (optional, defaults to current sprint)

## Your Task

Create a sprint review pack for: **$ARGUMENTS**

## Data to Gather

Use Claude's connected integrations to pull:

1. **Jira** (via Atlassian connector):
   - Completed stories and their points
   - Sprint metrics (velocity, burndown)
   - Bugs resolved
   - Carryover items

2. **Confluence** (via Atlassian connector):
   - Sprint goals and commitments
   - Related documentation

3. **Customer Feedback** (via Zendesk/Zapier or ask user):
   - Feedback on shipped features
   - Beta user responses

If sprint data is not available, ask the user to provide the completed stories and metrics.

## Output Format

Create a sprint review pack with these sections:

---

# Sprint Review Pack - [Sprint Name]

**Date:** [Today's date]
**Team:** [Team name]
**Sprint Period:** [Start] to [End]

---

## Sprint Summary

[2-3 sentence overview of what was accomplished and key highlights]

---

## Key Accomplishments

### 1. [Feature/Story Name] (JIRA-XXX)
- **What:** [Brief description]
- **Impact:** [Business/customer impact]
- **Demo Ready:** Yes/No

### 2. [Feature/Story Name] (JIRA-XXX)
- **What:** [Brief description]
- **Impact:** [Business/customer impact]
- **Demo Ready:** Yes/No

### 3. [Feature/Story Name] (JIRA-XXX)
- **What:** [Brief description]
- **Impact:** [Business/customer impact]
- **Demo Ready:** Yes/No

---

## Metrics Dashboard

| Metric | Committed | Completed | Status |
|--------|-----------|-----------|--------|
| Story Points | X | X | [emoji] X% |
| Stories | X | X | [emoji] X% |
| Bugs Resolved | X | X | [emoji] X% |
| P1 Issues | X | X | [emoji] |

### Velocity Trend
- Sprint N-2: X pts
- Sprint N-1: X pts
- This Sprint: X pts
- **3-Sprint Avg:** X pts

### Work Distribution
- Customer-facing: X%
- Tech debt: X%
- Bug fixes: X%

---

## Demo Highlights

### Demo 1: [Feature Name] (X min)
**Presenter:** [Name]

Key talking points:
1. [Point 1]
2. [Point 2]
3. [Point 3]

---

## Blockers & Learnings

### What Slowed Us Down
1. **[Blocker]** - [Description]
   - *Learning:* [What we learned]

### Carryover to Next Sprint
- [Story] (X pts) - [Reason for carryover]

---

## Customer Impact

### Feedback Received
> "[Quote]" - [Customer/Source]

### Customer-Driven Changes
- [Change made based on feedback]

---

## Next Sprint Preview

### [Sprint N+1] Focus: [Theme]

| Priority | Story | Points |
|----------|-------|--------|
| P0 | [Story] | X |
| P0 | [Story] | X |
| P1 | [Story] | X |

**Committed Capacity:** X points

---

## Guidelines

- Focus on outcomes and value delivered, not just tasks completed
- Highlight metrics and measurable progress
- Include demo-ready features with key talking points
- Note blockers and learnings for transparency
- Keep it concise but comprehensive
