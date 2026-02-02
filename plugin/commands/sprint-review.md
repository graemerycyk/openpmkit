---
description: Generate a sprint review summary with accomplishments, metrics, and demo highlights
argument-hint: "[sprint name or leave blank for current]"
---

# Sprint Review

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../CONNECTORS.md).

Generate a comprehensive sprint review pack with metrics, accomplishments, and demo highlights.

## Workflow

### 1. Identify the Sprint

If user specified a sprint, use that. Otherwise, get the current/most recent sprint.

### 2. Pull Data from Connected Tools

**Do this first — gather all available data before generating output.**

If **~~project tracker** (Jira, Linear, etc.) is connected:
- Get the sprint details (name, dates, goals)
- Get all tickets in the sprint with their status
- Calculate: completed vs committed points/tickets
- Get velocity data (this sprint vs previous sprints)
- Identify carryover items and reasons
- Get bugs resolved during the sprint
- Categorize work: feature vs bug vs tech debt

If **~~knowledge base** (Confluence, Notion) is connected:
- Get sprint goals/commitments if documented
- Find any related retro notes or planning docs

If **~~support** (Zendesk, Intercom) is connected:
- Get feedback on features shipped this sprint
- Note any customer-reported issues with new releases

If **~~chat** (Slack) is connected:
- Find sprint-related discussions
- Get any team feedback or blockers mentioned

**If a tool isn't connected, skip that data source and proceed. Do NOT ask the user to connect tools.**

### 3. Analyze Sprint Performance

From the gathered data:
- Calculate completion rate (points and tickets)
- Compare velocity to 3-sprint average
- Identify what went well vs what slipped
- Note patterns in blockers or carryover reasons
- Find demo-worthy accomplishments

### 4. Generate the Sprint Review

Produce the sprint review pack in this format:

---

# Sprint Review: [Sprint Name]

**Team:** [Team name]
**Period:** [Start date] → [End date]
**Generated:** [Today's date]

---

## Sprint Summary

[2-3 sentences: What was the sprint goal? Did we hit it? What's the headline?]

---

## 📊 Metrics Dashboard

### Delivery
| Metric | Committed | Completed | Rate |
|--------|-----------|-----------|------|
| Story Points | [X] | [Y] | [Z]% |
| Stories | [X] | [Y] | [Z]% |
| Bugs Fixed | — | [X] | — |

### Velocity Trend
| Sprint | Points |
|--------|--------|
| [N-2] | [X] |
| [N-1] | [Y] |
| **This Sprint** | **[Z]** |
| **3-Sprint Avg** | **[Avg]** |

**Trend:** [📈 Improving / 📉 Declining / ➡️ Stable]

### Work Breakdown
- 🚀 **Features:** [X]% ([Y] points)
- 🐛 **Bug Fixes:** [X]% ([Y] points)
- 🔧 **Tech Debt:** [X]% ([Y] points)

---

## ✅ Key Accomplishments

### 1. [Feature/Story Name] — [TICKET-123]
- **What:** [Brief description of what was built]
- **Impact:** [Business or customer value delivered]
- **Demo Ready:** ✅ Yes / ❌ No

### 2. [Feature/Story Name] — [TICKET-456]
- **What:** [Brief description]
- **Impact:** [Value delivered]
- **Demo Ready:** ✅ Yes / ❌ No

### 3. [Feature/Story Name] — [TICKET-789]
- **What:** [Brief description]
- **Impact:** [Value delivered]
- **Demo Ready:** ✅ Yes / ❌ No

---

## 🎬 Demo Highlights

### Demo 1: [Feature Name]
**Presenter:** [Suggested presenter]
**Duration:** ~[X] min

**Talking Points:**
1. [What problem this solves]
2. [How it works - key user flow]
3. [Impact or metrics to highlight]

**Show:** [Specific screens or flows to demo]

---

## ⏸️ Carryover

| Ticket | Points | Reason |
|--------|--------|--------|
| [TICKET-XXX] | [X] | [Why it didn't complete] |

**Carryover Impact:** [X] points ([Y]% of commitment)

---

## 🚧 Blockers & Learnings

### What Slowed Us Down
1. **[Blocker]** — [Description and impact]
   - *Learning:* [What we'll do differently]

### What Went Well
1. **[Win]** — [What worked and why]

---

## 👥 Customer Impact

### Shipped to Customers
- [Feature] — [Who benefits, how]

### Customer Feedback
> "[Quote from customer or support ticket]"

---

## 🔮 Next Sprint Preview

### [Sprint N+1]: [Theme/Focus]

**Top Priorities:**
| Priority | Ticket | Points | Owner |
|----------|--------|--------|-------|
| P0 | [TICKET] [Title] | [X] | [Name] |
| P0 | [TICKET] [Title] | [X] | [Name] |
| P1 | [TICKET] [Title] | [X] | [Name] |

**Planned Capacity:** [X] points

---

## Notes

- Pull data FIRST from project tracker, then synthesize
- Include specific ticket numbers for all items
- Be honest about misses — transparency builds trust
- Demo highlights should be rehearsable from this doc
- Velocity trends matter more than single-sprint numbers
