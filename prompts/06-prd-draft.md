# PRD Draft Prompt

Draft a PRD from customer evidence and context.

---

## System Prompt

```
You are a product management assistant helping PMs write PRDs.
Your job is to draft a comprehensive PRD based on evidence and context.

Guidelines:
- Ground everything in evidence
- Be specific about success criteria
- Call out assumptions explicitly
- Include open questions
- Follow standard PRD structure
```

---

## User Prompt Template

```
Draft a PRD for {{tenantName}}.

## Feature Context
Feature Name: {{featureName}}
Epic: {{epicKey}}

## Evidence

### Customer Demand
{{customerEvidence}}

### Analytics Signals
{{analyticsSignals}}

### Existing Documentation
{{existingDocs}}

### Technical Context
{{technicalContext}}

## Output Format

Create a PRD with:
1. **Overview**
   - Problem statement
   - Goals and success metrics
   - Non-goals
2. **Background**
   - Customer evidence (with sources)
   - Market context
   - Related work
3. **Solution**
   - Proposed approach
   - User stories
   - Key flows
4. **Requirements**
   - Functional requirements
   - Non-functional requirements
   - Edge cases
5. **Success Criteria**
   - Launch criteria
   - Success metrics
   - Rollback criteria
6. **Assumptions & Risks**
   - Key assumptions
   - Risks and mitigations
7. **Open Questions**
   - Unresolved items
   - Dependencies
8. **Timeline**
   - Phases
   - Milestones
```

---

## Required Context

- `featureName` - Name of the feature
- `customerEvidence` - Customer demand data

---

## Output Format

Markdown

---

## Usage in ChatGPT/Claude

1. Copy the **System Prompt** and paste it as your first message (or use as custom instructions)
2. Copy the **User Prompt Template** and replace the `{{placeholders}}` with your actual data:
   - `{{tenantName}}` → Your company name
   - `{{featureName}}` → Name of the feature
   - `{{epicKey}}` → Jira epic key (e.g., ACME-100)
   - `{{customerEvidence}}` → Paste customer feedback, requests, quotes
   - `{{analyticsSignals}}` → Paste relevant analytics data
   - `{{existingDocs}}` → Paste related documentation
   - `{{technicalContext}}` → Paste technical constraints or context

---

## Example Output

```markdown
# PRD: Search Filters

**Author**: Jane PM
**Date**: 2026-01-13
**Status**: Draft
**Epic**: ACME-100

---

## 1. Overview

### Problem Statement

Users cannot efficiently find content because search results lack filtering 
capabilities. This leads to:
- Wasted time scrolling through irrelevant results
- Workarounds using manual tagging systems
- Frustration and reduced product satisfaction

### Goals

| Goal | Metric | Target |
|------|--------|--------|
| Reduce time to find content | Avg. search-to-click time | -30% |
| Improve search satisfaction | User survey score | 3.2 → 4.0+ |
| Reduce no-results frustration | Filter usage rate | >40% of searches |

### Non-Goals

- AI-powered semantic search (future initiative)
- Saved searches (separate feature)
- Search analytics dashboard (admin feature)

---

## 2. Background

### Customer Evidence

| Source | Count | Key Quote |
|--------|-------|-----------|
| Support tickets | 47 | "I spend more time searching than working" |
| Gong calls | 12 | "Date filters would be huge" |
| Community | 89 votes | "Filter by content type please" |

### Market Context

All major competitors (Notion, Coda, Monday.com) offer search filters. 
This is table-stakes functionality.

---

## 3. Solution

### Proposed Approach

Add filter controls to search results with:
- Date range filter (Last 7d, 30d, 90d, custom)
- Content type filter (Documents, Projects, Comments)
- Project/Space filter

### User Stories

1. **As a PM**, I want to filter search by date range so I can find recent content quickly
2. **As a PM**, I want to filter by content type so I can focus on documents vs comments
3. **As a PM**, I want to combine multiple filters so I can narrow results precisely

---

## 4. Requirements

### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| F1 | Date range filter with presets | P0 |
| F2 | Custom date range picker | P1 |
| F3 | Content type filter | P0 |
| F4 | Project/space filter | P1 |
| F5 | Filter combination (AND logic) | P0 |
| F6 | Clear all filters action | P0 |

### Non-Functional Requirements

- Filter application < 200ms
- Support 100k+ documents
- Mobile-responsive design

---

## 5. Success Criteria

### Launch Criteria
- [ ] All P0 requirements complete
- [ ] <1% error rate in filter queries
- [ ] Performance within targets
- [ ] Documentation updated

### Success Metrics (30 days post-launch)
- Filter usage rate > 40%
- Search satisfaction +0.5 points
- No increase in support tickets

---

## 6. Assumptions & Risks

### Assumptions
- Users understand filter UI patterns
- Backend can support filter queries at scale
- Date filtering uses document update date

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Performance degradation | Medium | High | Index optimization, caching |
| Low adoption | Low | Medium | Onboarding tooltip, defaults |

---

## 7. Open Questions

1. Should we index comments? (performance vs completeness)
2. How to handle permission-filtered results in counts?
3. What's the default date range?

---

## 8. Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Design | 1 week | Figma specs |
| Backend | 2 weeks | Filter API |
| Frontend | 2 weeks | UI implementation |
| Testing | 1 week | QA + beta |
| Launch | 1 week | Rollout + docs |

**Total**: 7 weeks
```
