# Meeting Prep Pack Prompt

Prepare for customer meetings with context and talking points.

---

## System Prompt

```
You are a product management assistant helping PMs prepare for customer meetings.
Your job is to compile relevant context and suggest talking points.

Guidelines:
- Focus on the specific customer/account
- Include recent interactions and open issues
- Suggest questions to ask
- Highlight opportunities and risks
- Be actionable and specific
```

---

## User Prompt Template

```
Generate a meeting prep pack for {{userName}} at {{tenantName}}.

## Meeting Details
- Account: {{accountName}}
- Meeting Type: {{meetingType}}
- Attendees: {{attendees}}
- Date: {{meetingDate}}

## Context

### Recent Calls (Gong)
{{gongCalls}}

### Open Support Tickets
{{supportTickets}}

### Account Health
{{accountHealth}}

## Output Format

Create a prep pack with:
1. **Account Summary** - Key facts, contract details, health score
2. **Recent History** - Last 3 interactions and outcomes
3. **Open Issues** - Unresolved tickets or concerns
4. **Key Insights** - Pain points, feature requests, sentiment from calls
5. **Talking Points** - Suggested topics and questions
6. **Risks & Opportunities** - What to watch for
```

---

## Required Context

- `accountName` - Customer/account name
- `gongCalls` - Recent call transcripts or summaries
- `supportTickets` - Open support tickets for this account

---

## Output Format

Markdown

---

## Usage in ChatGPT/Claude

1. Copy the **System Prompt** and paste it as your first message (or use as custom instructions)
2. Copy the **User Prompt Template** and replace the `{{placeholders}}` with your actual data:
   - `{{userName}}` → Your name
   - `{{tenantName}}` → Your company name
   - `{{accountName}}` → Customer account name
   - `{{meetingType}}` → QBR, check-in, escalation, etc.
   - `{{attendees}}` → List of attendees
   - `{{meetingDate}}` → Meeting date
   - `{{gongCalls}}` → Paste call notes or transcripts
   - `{{supportTickets}}` → Paste relevant support tickets
   - `{{accountHealth}}` → Health score, NPS, contract details

---

## Example Output

```markdown
# Meeting Prep Pack

**Account**: Globex Corp
**Date**: 2026-01-13
**Prepared for**: Jane PM

## Account Summary

| Metric | Value |
|--------|-------|
| Contract Value | $48,000 ARR |
| Seats | 50 (planning expansion to 200) |
| Health Score | 72/100 (⚠️ At Risk) |
| NPS | 7 (Passive) |
| Renewal Date | March 2026 |

## Recent History

### Last 3 Interactions

1. **Dec 20 - QBR Call** (45 min)
   - Discussed search frustrations
   - Expansion blocked by search issues

2. **Dec 15 - Support Escalation**
   - Dashboard loading issues
   - Resolved within 4 hours

## Talking Points

1. **Search Update**: Share progress on filters (shipping next week)
2. **Dashboard Follow-up**: Confirm issues resolved
3. **Expansion Discussion**: Timeline for 200 seats?

## Questions to Ask

1. What's the timeline for your expansion decision?
2. Beyond search, what else would unlock more value?
3. Who else should we include in future conversations?

## Risks & Opportunities

### Risks
- ⚠️ Expansion blocked until search ships
- ⚠️ Competitor (Notion) mentioned in last call

### Opportunities
- 🎯 4x expansion potential ($192K ARR)
- 🎯 API integration could drive stickiness
```
