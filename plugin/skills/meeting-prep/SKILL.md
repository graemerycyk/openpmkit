---
name: meeting-prep
description: Generate a meeting prep pack with account context, talking points, and risks. Use before customer calls, QBRs, check-ins, or stakeholder meetings.
argument-hint: "[account name] [--type QBR|check-in|escalation]"
---

# Meeting Prep Pack

Generate comprehensive meeting preparation materials.

## Arguments

- `$ARGUMENTS[0]` - Account or meeting name (e.g., "Acme Corp")
- `--type` - Meeting type: QBR, check-in, escalation (optional, default: check-in)

## Your Task

Create a meeting prep pack for: **$ARGUMENTS**

## Data to Gather

Use Claude's connected integrations to pull:

1. **Google Calendar** (via Google Workspace):
   - Meeting details, attendees, agenda
   - Previous meetings with this account

2. **Jira** (via Atlassian connector):
   - Open issues related to this account
   - Recent feature requests or bugs

3. **Support Tickets** (via Zendesk/Zapier):
   - Open and recent tickets for this account
   - Escalation history

4. **Gong/Call History** (via Zapier or ask user):
   - Recent call summaries
   - Key discussion points and sentiment

5. **CRM/Account Data** (ask user if not available):
   - Contract value, renewal date
   - Health score, NPS

If data is not available from connectors, ask the user to provide context or skip that section.

## Output Format

Create a prep pack with these sections:

### 1. Account Summary
| Metric | Value |
|--------|-------|
| Contract Value | $ |
| Seats/Users | |
| Health Score | |
| NPS | |
| Renewal Date | |

### 2. Recent History
Last 3 interactions with outcomes:
- Date, type, key points, outcome

### 3. Open Issues
- Unresolved support tickets
- Pending feature requests
- Known concerns or blockers

### 4. Key Insights
- Pain points identified from calls
- Feature requests and priorities
- Overall sentiment and relationship health

### 5. Talking Points
Suggested topics to cover:
1. [Topic with context]
2. [Topic with context]
3. [Topic with context]

### 6. Questions to Ask
1. [Strategic question]
2. [Tactical question]
3. [Relationship question]

### 7. Risks & Opportunities
**Risks:**
- [Risk with mitigation]

**Opportunities:**
- [Opportunity to explore]

## Guidelines

- Focus on the specific customer/account
- Include recent interactions and open issues
- Suggest questions to ask
- Highlight opportunities and risks
- Be actionable and specific
