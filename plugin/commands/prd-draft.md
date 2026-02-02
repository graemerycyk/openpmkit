---
description: Draft a PRD grounded in customer evidence and context
argument-hint: "<feature name or problem statement>"
---

# PRD Draft

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../CONNECTORS.md).

Generate a comprehensive PRD grounded in customer evidence.

## Workflow

### 1. Understand the Feature

Accept any of:
- A feature name ("SSO support")
- A problem statement ("Enterprise customers keep asking for centralized auth")
- A user request ("Users want to export their data as CSV")
- A vague idea ("We should do something about onboarding drop-off")

If the input is vague, ask 1-2 clarifying questions before proceeding.

### 2. Pull Data from Connected Tools

**Do this first — gather all relevant context before writing.**

If **~~project tracker** (Jira, Linear) is connected:
- Search for related tickets, epics, or features
- Pull in any existing requirements or acceptance criteria
- Identify dependencies on other work items
- Check for related bugs or customer requests

If **~~knowledge base** (Confluence, Notion) is connected:
- Search for related research documents, prior specs, or design docs
- Pull in relevant user research findings
- Find related meeting notes or decision records
- Get any existing PRDs for similar features

If **~~support** (Zendesk, Intercom) is connected:
- Find tickets requesting this feature
- Get customer quotes and pain points
- Quantify demand (# of requests)

If **~~calls** (Gong, Fireflies) is connected:
- Find mentions of this problem in customer calls
- Get verbatim customer quotes about the pain point
- Note any competitive context

If **~~chat** (Slack) is connected:
- Find internal discussions about this feature
- Get context on previous decisions or debates

**If a tool isn't connected, skip that source and proceed. Do NOT ask the user to connect tools.**

### 3. Gather Additional Context

After pulling available data, ask the user for anything still missing:
- **User problem**: What problem does this solve? Who experiences it?
- **Success metrics**: How will we know this worked?
- **Constraints**: Technical constraints, timeline, dependencies?

Be conversational — don't dump all questions at once.

### 4. Generate the PRD

Produce the PRD in this format:

---

# PRD: [Feature Name]

| | |
|---|---|
| **Author** | [Name] |
| **Date** | [Today's date] |
| **Status** | Draft |
| **Epic** | [Link if available] |

---

## 1. Problem Statement

### The Problem
[Clear description of the problem in 2-3 sentences. Who experiences it? What's the impact?]

### Customer Evidence

| Source | Count | Representative Quote |
|--------|-------|---------------------|
| Support tickets | [X] | "[Quote]" |
| Sales calls | [X] | "[Quote]" |
| User research | [X] | "[Quote]" |

**Demand Signal:** [X] customers have requested this in the last [Y] days.

---

## 2. Goals & Success Metrics

### Goals
| Goal | Metric | Target |
|------|--------|--------|
| [Primary goal] | [How to measure] | [Specific target] |
| [Secondary goal] | [How to measure] | [Specific target] |

### Non-Goals
- ❌ [What this feature will NOT do — and why]
- ❌ [Explicit scope limitation]
- ❌ [Out of scope for V1]

---

## 3. User Stories

### Primary Persona: [Persona Name]
> [Brief description of this user type]

1. **As a [persona]**, I want to [action] so that [benefit]
   - Acceptance: [How we know this is done]

2. **As a [persona]**, I want to [action] so that [benefit]
   - Acceptance: [How we know this is done]

### Secondary Persona: [Persona Name] (if applicable)
[Additional user stories]

---

## 4. Proposed Solution

### Approach
[High-level description of the solution — what are we building?]

### Key Flows
1. **[Flow name]**: [Description of user journey]
2. **[Flow name]**: [Description of user journey]

### Wireframes / Mockups
[Link to designs or describe key screens]

---

## 5. Requirements

### Functional Requirements (P0 — Must Have)
| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F1 | [Requirement] | [How to verify] |
| F2 | [Requirement] | [How to verify] |

### Functional Requirements (P1 — Should Have)
| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F3 | [Requirement] | [How to verify] |

### Functional Requirements (P2 — Nice to Have)
| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F4 | [Requirement] | [How to verify] |

### Non-Functional Requirements
- **Performance:** [Requirements]
- **Scale:** [Requirements]
- **Security:** [Requirements]
- **Accessibility:** [Requirements]

---

## 6. Edge Cases & Error States

| Scenario | Expected Behavior |
|----------|-------------------|
| [Edge case] | [How to handle] |
| [Error state] | [How to handle] |

---

## 7. Dependencies & Risks

### Dependencies
| Dependency | Owner | Status |
|------------|-------|--------|
| [What we depend on] | [Team/Person] | [Status] |

### Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk] | [H/M/L] | [H/M/L] | [How to mitigate] |

### Assumptions
- [Assumption we're making]
- [Assumption we're making]

---

## 8. Launch Plan

### Launch Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

### Rollout Strategy
[How will we release? Feature flag? Beta? GA?]

### Success Metrics (30 days post-launch)
- [Metric]: [Target]
- [Metric]: [Target]

### Rollback Criteria
- [When/why to rollback]

---

## 9. Open Questions

| Question | Owner | Due Date |
|----------|-------|----------|
| [Question needing resolution] | [Who decides] | [When] |

---

## 10. Appendix

### Related Documents
- [Link to design doc]
- [Link to technical spec]
- [Link to research]

### Changelog
| Date | Author | Change |
|------|--------|--------|
| [Date] | [Name] | Initial draft |

---

## Notes

- Pull data FIRST — the PRD should be grounded in evidence, not assumptions
- Quantify customer demand wherever possible
- Include verbatim customer quotes — they're compelling
- Non-goals are as important as goals — they prevent scope creep
- Success metrics should be specific and measurable
