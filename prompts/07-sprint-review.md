# Sprint Review Pack Prompt

Generate a sprint review summary with accomplishments, metrics, and demos.

---

## System Prompt

```
You are a product management assistant helping PMs prepare sprint review presentations.
Your job is to synthesize sprint data into a clear, stakeholder-friendly summary.

Guidelines:
- Focus on outcomes and value delivered, not just tasks completed
- Highlight metrics and measurable progress
- Include demo-ready features with key talking points
- Note blockers and learnings for transparency
- Keep it concise but comprehensive
```

---

## User Prompt Template

```
Generate a sprint review pack for {{tenantName}}.

## Sprint Details
Sprint: {{sprintName}}
Period: {{sprintStart}} to {{sprintEnd}}
Team: {{teamName}}

## Sprint Data

### Completed Stories
{{completedStories}}

### Sprint Metrics
{{sprintMetrics}}

### Blockers & Issues
{{blockers}}

### Customer Feedback
{{customerFeedback}}

## Output Format

Create a sprint review pack with:
1. **Sprint Summary** - 2-3 sentence overview of what was accomplished
2. **Key Accomplishments** - Top 3-5 deliverables with business impact
3. **Metrics Dashboard**
   - Velocity (points completed vs committed)
   - Bug count and resolution rate
   - Customer-facing vs internal work ratio
4. **Demo Highlights** - Features ready to demo with talking points
5. **Blockers & Learnings** - What slowed us down and what we learned
6. **Customer Impact** - Feedback received and how it influenced work
7. **Next Sprint Preview** - What's coming up
```

---

## Required Context

- `sprintName` - Sprint name/number
- `completedStories` - List of completed stories
- `sprintMetrics` - Velocity, bug counts, etc.

---

## Output Format

Markdown

---

## Usage in ChatGPT/Claude

1. Copy the **System Prompt** and paste it as your first message (or use as custom instructions)
2. Copy the **User Prompt Template** and replace the `{{placeholders}}` with your actual data:
   - `{{tenantName}}` → Your company name
   - `{{sprintName}}` → Sprint name (e.g., "Sprint 42")
   - `{{sprintStart}}` → Sprint start date
   - `{{sprintEnd}}` → Sprint end date
   - `{{teamName}}` → Team name
   - `{{completedStories}}` → Paste completed Jira stories
   - `{{sprintMetrics}}` → Paste velocity and metrics data
   - `{{blockers}}` → Paste blockers and issues encountered
   - `{{customerFeedback}}` → Paste relevant customer feedback

---

## Example Output

```markdown
# Sprint Review Pack - Sprint 42

**Date**: 2026-01-13
**Team**: Product Team
**Prepared by**: Jane PM

## Sprint Summary

Sprint 42 delivered key search improvements and addressed critical customer 
escalations. The team completed 16 of 19 committed points (84% velocity), 
with the remaining 3 points carrying over due to scope discovery on the 
search ranking algorithm.

## 🎯 Key Accomplishments

### 1. Search Filters (ACME-342) ✅
- **What**: Added date range, content type, and project filters to search
- **Impact**: Addresses #1 customer pain point (35% of VoC mentions)
- **Demo Ready**: Yes - show filter bar and real-time updates

### 2. Search Ranking Improvements (ACME-343) ✅
- **What**: Improved relevance scoring with recency and engagement signals
- **Impact**: Expected 30% reduction in search-to-click time
- **Demo Ready**: Yes - compare before/after results

### 3. Critical Bug Fix (ACME-350) ✅
- **What**: Fixed crash on special characters in search
- **Impact**: Unblocked all users, resolved P1 escalation
- **Demo Ready**: N/A (bug fix)

## 📊 Metrics Dashboard

| Metric | Committed | Completed | Status |
|--------|-----------|-----------|--------|
| Story Points | 19 | 16 | ⚠️ 84% |
| Stories | 8 | 7 | ⚠️ 87% |
| Bugs Resolved | 4 | 5 | ✅ 125% |
| P1 Issues | 1 | 1 | ✅ 100% |

### Velocity Trend
- Sprint 40: 14 pts
- Sprint 41: 17 pts
- Sprint 42: 16 pts
- **3-Sprint Avg**: 15.7 pts

### Work Distribution
- Customer-facing: 75%
- Tech debt: 15%
- Bug fixes: 10%

## 🎬 Demo Highlights

### Demo 1: Search Filters (5 min)
**Presenter**: Sarah Chen

Key talking points:
1. Show filter bar appearing on search results
2. Demonstrate date range presets (7d, 30d, 90d)
3. Show content type filtering (docs vs comments)
4. Highlight real-time result updates
5. Show filter persistence across searches

## ⚠️ Blockers & Learnings

### What Slowed Us Down
1. **Search ranking scope creep** - Algorithm complexity was underestimated
   - *Learning*: Add spike stories for algorithm work
2. **Redis connection pool issue** - Debugging took 2 days
   - *Learning*: Add connection pool monitoring

### Carryover to Next Sprint
- ACME-344: No results UX (3 pts) - Deprioritized for escalation work

## 💬 Customer Impact

### Feedback Received
> "The search filters are exactly what we needed. This changes everything 
> for our team." - Globex Corp (preview user)

### Customer-Driven Changes
- Added "Last 7 days" as default filter based on beta feedback
- Increased filter result count from 25 to 50 per request

## 🔮 Next Sprint Preview

### Sprint 43 Focus: Search Polish + SSO Kickoff

| Priority | Story | Points |
|----------|-------|--------|
| P0 | No results UX improvements | 3 |
| P0 | Search analytics dashboard | 5 |
| P0 | SSO technical design | 3 |
| P1 | Filter saved preferences | 3 |
| P1 | Search performance optimization | 5 |

**Committed Capacity**: 19 points
```
