---
description: Generate a morning brief synthesizing overnight activity from Slack, Jira, support tickets, and calendar
---

# Daily Brief

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../CONNECTORS.md).

Generate a morning context summary synthesizing overnight activity.

## Workflow

### 1. Pull Data from Connected Tools

**Do this first — gather all available data before generating output.**

If **~~project tracker** (Jira, Linear, etc.) is connected:
- Get tickets updated in the last 24 hours
- Get current sprint status and progress
- Identify blockers, P1/P0 issues, and escalations
- Check for new bugs filed overnight

If **~~chat** (Slack, Teams) is connected:
- Get messages from key channels in the last 24 hours
- Find threads with high activity or @mentions
- Identify decisions made or questions pending

If **~~calendar** (Google Calendar, Outlook) is connected:
- Get today's meetings
- Note meeting prep needed
- Flag any conflicts or back-to-backs

If **~~support** (Zendesk, Intercom) is connected:
- Get new tickets from last 24 hours
- Identify escalations or trending issues
- Note any VIP customer activity

**If a tool isn't connected, skip that section and proceed with available data. Do NOT ask the user to connect tools.**

### 2. Analyze and Prioritize

From the gathered data:
- Identify the 3-5 most important items requiring attention
- Flag anything blocking team progress
- Note patterns or trends (e.g., spike in bug reports, recurring customer complaint)
- Connect related items across sources (e.g., Slack discussion about a Jira ticket)

### 3. Generate the Brief

Produce the daily brief in this format:

---

# Daily Brief — [Today's Date]

## TL;DR
[2-3 sentences: What's the one thing to know? Any fires? What's the day's focus?]

## 🚨 Urgent / Blockers
| Item | Source | Action Needed |
|------|--------|---------------|
| [Issue] | [Jira/Slack/etc] | [What to do] |

*If nothing urgent, say "No blockers identified."*

## 📊 Sprint Progress
- **Sprint:** [Name] — [X]% complete, [Y] days remaining
- **Velocity:** [On track / Behind / Ahead]
- **Completed yesterday:** [List key items]
- **At risk:** [Items that may slip]

## 💬 Key Discussions
[Summarize 2-3 important Slack/Teams threads with links if available]

## 🎫 Customer Signal
- **New tickets:** [X] ([Y] high priority)
- **Trending:** [Pattern or recurring issue]
- **Notable:** [Any VIP or escalated items]

## 📅 Today's Schedule
| Time | Meeting | Prep Needed |
|------|---------|-------------|
| [Time] | [Meeting] | [Yes/No - what] |

## ✅ Recommended Focus
1. **[Action]** — [Why it's priority]
2. **[Action]** — [Why it's priority]
3. **[Action]** — [Why it's priority]

---

## Notes

- Pull data FIRST, then synthesize — do not ask the user for data if tools are connected
- Be specific: include ticket numbers, channel names, people's names
- Quantify where possible (X tickets, Y% complete)
- If a section has no data, say "No data available" rather than omitting it
- Keep it scannable — busy PMs should get the gist in 30 seconds
