---
name: prd-draft
description: Draft a PRD grounded in customer evidence and context. Use when starting a new feature, documenting requirements, or formalizing a product idea.
argument-hint: "[feature name] [--epic JIRA-123]"
---

# PRD Draft

Generate a comprehensive Product Requirements Document.

## Arguments

- `$ARGUMENTS[0]` - Feature name (e.g., "Search Filters")
- `--epic` - Jira epic key (optional)

## Your Task

Draft a PRD for: **$ARGUMENTS**

## Data to Gather

Use Claude's connected integrations to pull:

1. **Jira** (via Atlassian connector):
   - Related epics and stories
   - Existing requirements or specs
   - Customer-reported issues related to this feature

2. **Confluence** (via Atlassian connector):
   - Existing documentation
   - Related PRDs or design docs

3. **Support/Gong** (via Zapier or ask user):
   - Customer quotes and evidence
   - Pain points and use cases

4. **Analytics** (ask user to provide):
   - Usage data relevant to this feature
   - Funnel metrics

If data is not available, ask the user to provide customer evidence or context.

## Output Format

Create a PRD with these sections:

---

# PRD: [Feature Name]

**Author:** [User name]
**Date:** [Today's date]
**Status:** Draft
**Epic:** [Epic key if provided]

---

## 1. Overview

### Problem Statement
[Clear description of the problem being solved]

### Goals and Success Metrics
| Goal | Metric | Target |
|------|--------|--------|
| [Goal 1] | [Metric] | [Target] |
| [Goal 2] | [Metric] | [Target] |

### Non-Goals
- [What this feature will NOT do]
- [Explicit scope limitations]

---

## 2. Background

### Customer Evidence
| Source | Count | Key Quote |
|--------|-------|-----------|
| [Source] | X | "[Quote]" |

### Market Context
[Competitive landscape, industry trends]

### Related Work
[Links to related docs, previous attempts]

---

## 3. Solution

### Proposed Approach
[High-level description of the solution]

### User Stories
1. **As a [persona]**, I want to [action] so that [benefit]
2. **As a [persona]**, I want to [action] so that [benefit]

### Key Flows
[Description or reference to flow diagrams]

---

## 4. Requirements

### Functional Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| F1 | [Requirement] | P0 |
| F2 | [Requirement] | P1 |

### Non-Functional Requirements
- Performance: [Requirements]
- Scale: [Requirements]
- Accessibility: [Requirements]

### Edge Cases
- [Edge case and how to handle]

---

## 5. Success Criteria

### Launch Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]

### Success Metrics (30 days post-launch)
- [Metric and target]

### Rollback Criteria
- [When to rollback]

---

## 6. Assumptions & Risks

### Assumptions
- [Assumption 1]
- [Assumption 2]

### Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk] | [L/M/H] | [L/M/H] | [Mitigation] |

---

## 7. Open Questions
1. [Question needing resolution]
2. [Question needing resolution]

---

## 8. Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Design | X weeks | [Deliverable] |
| Build | X weeks | [Deliverable] |
| Test | X weeks | [Deliverable] |
| Launch | X weeks | [Deliverable] |

---

## Guidelines

- Ground everything in evidence
- Be specific about success criteria
- Call out assumptions explicitly
- Include open questions
- Follow standard PRD structure
