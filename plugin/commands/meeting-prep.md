---
description: Generate a meeting prep pack with account context, talking points, and risks
argument-hint: "<account or meeting name>"
---

# Meeting Prep

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../CONNECTORS.md).

Generate a comprehensive meeting prep pack for a customer or stakeholder meeting.

## Workflow

### 1. Identify the Meeting

If the user provided an account name, use that. Otherwise:

If **~~calendar** is connected:
- Get today's upcoming meetings
- Ask user which meeting to prep for (or prep for the next one)

### 2. Pull Data from Connected Tools

**Do this first — gather all available data before generating output.**

If **~~project tracker** (Jira, Linear, etc.) is connected:
- Search for tickets mentioning this account/customer
- Find open issues, recent bugs, pending feature requests
- Check for any escalations or P1s related to this account

If **~~support** (Zendesk, Intercom) is connected:
- Get open tickets for this account
- Get recent ticket history (last 30 days)
- Note any patterns in support requests
- Check escalation history

If **~~crm** (Salesforce, HubSpot) is connected:
- Get account details: contract value, renewal date, plan tier
- Get health score, NPS, engagement metrics
- Get recent activity and touchpoints

If **~~calls** (Gong, Fireflies) is connected:
- Get transcripts from recent calls with this account
- Extract key discussion points and sentiment
- Note any promises made or concerns raised

If **~~chat** (Slack) is connected:
- Search for recent discussions mentioning this account
- Find any internal context or heads-ups

If **~~email** is connected:
- Get recent email threads with this account
- Note any outstanding requests or follow-ups

**If a tool isn't connected, skip that data source and proceed. Do NOT ask the user to connect tools.**

### 3. Analyze and Synthesize

From the gathered data:
- Identify relationship health (positive/neutral/at-risk)
- Find open issues that might come up
- Note opportunities to discuss
- Flag risks or landmines to avoid
- Generate talking points based on their recent activity

### 4. Generate the Prep Pack

Produce the meeting prep pack in this format:

---

# Meeting Prep: [Account/Meeting Name]

**Date:** [Meeting date/time]
**Attendees:** [List from calendar if available]
**Last Contact:** [Date and type of last interaction]

---

## Account Snapshot

| Metric | Value |
|--------|-------|
| Contract Value | $[X] |
| Plan/Tier | [Plan] |
| Renewal Date | [Date] |
| Health Score | [Score or Red/Yellow/Green] |
| Account Age | [X months/years] |

## Relationship Status: [🟢 Healthy / 🟡 Monitor / 🔴 At Risk]

[1-2 sentence summary of current relationship state]

---

## Recent History

### Last 3 Interactions
| Date | Type | Summary | Outcome |
|------|------|---------|---------|
| [Date] | [Call/Email/Ticket] | [Summary] | [Outcome] |

### Recent Support Activity
- **Open tickets:** [X]
- **Resolved (30 days):** [Y]
- **Trending issues:** [Pattern if any]

---

## Open Issues

| Issue | Type | Age | Priority |
|-------|------|-----|----------|
| [Issue] | [Bug/Request/Question] | [X days] | [P0/P1/P2] |

---

## Key Insights

### What They Care About
- [Insight from calls/tickets/emails]
- [Insight from calls/tickets/emails]

### Recent Wins
- [Positive outcome or success]

### Pain Points
- [Known frustration or blocker]

---

## Talking Points

### Recommended Topics
1. **[Topic]** — [Why discuss, what to say]
2. **[Topic]** — [Why discuss, what to say]
3. **[Topic]** — [Why discuss, what to say]

### Questions to Ask
1. [Strategic question to understand their needs]
2. [Tactical question about current issues]
3. [Relationship question to build rapport]

---

## Risks & Landmines

⚠️ **Avoid/Handle Carefully:**
- [Topic to avoid or handle delicately, with context]

---

## Opportunities

💡 **Potential Upsell/Expansion:**
- [Opportunity based on their usage or requests]

---

## Notes

- Pull data FIRST from all connected tools, then synthesize
- Be specific: include ticket numbers, dates, names
- If data is limited, note "Limited data available" rather than guessing
- Focus on actionable insights, not just data dumps
