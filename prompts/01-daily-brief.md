# Daily Brief Prompt

Generate a morning brief synthesizing overnight activity from multiple sources.

---

## System Prompt

```
You are a product management assistant helping PMs stay on top of their product. 
Your job is to synthesize information from multiple sources into a concise, actionable daily brief.

Guidelines:
- Be concise but comprehensive
- Highlight blockers and urgent items first
- Include specific numbers and quotes where relevant
- End with recommended actions
- Use markdown formatting
```

---

## User Prompt Template

```
Generate a daily brief for {{userName}} at {{tenantName}} for {{currentDate}}.

## Context

### Slack Activity
{{slackMessages}}

### Jira Updates
{{jiraUpdates}}

### Support Tickets
{{supportTickets}}

### Community Activity
{{communityActivity}}

## Output Format

Create a brief with these sections:
1. **TL;DR** - 2-3 sentence summary
2. **Urgent Items** - Blockers, escalations, critical bugs
3. **Sprint Progress** - Current sprint status and notable updates
4. **Customer Signal** - Key feedback from support and community
5. **Recommended Actions** - Top 3 things to focus on today
```

---

## Required Context

- `slackMessages` - Recent Slack channel activity
- `jiraUpdates` - Jira ticket updates and sprint progress
- `supportTickets` - Open and recent support tickets
- `communityActivity` - Community posts and feature requests

---

## Output Format

Markdown

---

## Usage in ChatGPT/Claude

1. Copy the **System Prompt** and paste it as your first message (or use as custom instructions)
2. Copy the **User Prompt Template** and replace the `{{placeholders}}` with your actual data:
   - `{{userName}}` → Your name
   - `{{tenantName}}` → Your company name
   - `{{currentDate}}` → Today's date
   - `{{slackMessages}}` → Paste relevant Slack messages
   - `{{jiraUpdates}}` → Paste Jira ticket updates
   - `{{supportTickets}}` → Paste support ticket summaries
   - `{{communityActivity}}` → Paste community posts/requests

---

## Example Output

```markdown
# Daily Brief - 2026-01-13

## TL;DR
Search improvements are progressing well (70% complete), but we have a critical bug 
affecting special characters in search. One enterprise escalation from Globex Corp 
regarding dashboard loading.

## 🚨 Urgent Items

### Critical Bug: Search Crashes on Special Characters
- **Ticket**: ACME-350 (P1)
- **Status**: Fix in review
- **Impact**: All users attempting searches with special characters
- **ETA**: Fix deploying today

## 📊 Sprint Progress (Sprint 42)

| Story | Status | Points |
|-------|--------|--------|
| ACME-342: Search filters | In Progress (70%) | 5 |
| ACME-343: Search ranking | In Review | 8 |

## 📣 Customer Signal

### Top Themes This Week
1. **Search frustration** (35% of mentions)
2. **Onboarding complexity** (22%)

## ✅ Recommended Actions

1. **Review ACME-350 fix** - Critical bug affecting search
2. **Follow up with Globex Corp** - Confirm dashboard issue resolved
3. **Prep for search filters launch** - Comms and docs ready for next week
```
