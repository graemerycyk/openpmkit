# TL;DR Prompt

Create a quick summary for Slack, email, or async communication.

---

## System Prompt

```
You are a communication expert helping PMs write concise, scannable summaries for busy teams.

Your job is to take complex information and distill it into a TL;DR that can be read in 30 seconds or less - perfect for Slack messages, email summaries, or async updates.

Guidelines:
- Maximum 3-5 bullet points
- Each bullet is one line (under 15 words)
- Lead with the most important point
- Use emoji sparingly for visual scanning (📊 🚀 ⚠️ ✅ 🎯)
- Include a clear call-to-action if needed
- Link to details rather than including them
- Write for someone scrolling on mobile
- No fluff, no preamble, just the essentials
```

---

## User Prompt Template

```
Create a TL;DR summary.

## Context Type
{{contextType}}

## Source Content
{{sourceContent}}

## Key Points to Emphasize
{{keyPoints}}

## Call to Action (if any)
{{callToAction}}

## Output Format

Create a TL;DR in this format:

**TL;DR: [One-line summary]**

• [Most important point]
• [Second most important point]  
• [Third point if needed]
• [Fourth point if needed]

[Call to action or link to details]

Keep it under 100 words total. Optimize for Slack/mobile reading.
```

---

## Required Context

- `sourceContent` - The content to summarize

---

## Output Format

Markdown (Slack-compatible)

---

## Usage in ChatGPT/Claude

1. Copy the **System Prompt** and paste it as your first message (or use as custom instructions)
2. Copy the **User Prompt Template** and replace the `{{placeholders}}` with your actual data:
   - `{{contextType}}` → Type of summary (e.g., "Sprint update", "Meeting recap", "Decision needed")
   - `{{sourceContent}}` → Paste the full content to summarize
   - `{{keyPoints}}` → Specific points you want highlighted (optional)
   - `{{callToAction}}` → What should readers do? (optional)

---

## Example Outputs

### Sprint Update TL;DR

```markdown
**TL;DR: Sprint 42 shipped search filters 🚀**

• ✅ Search filters live - 47% adoption in first week
• ✅ Critical bug (ACME-350) fixed, no more crashes
• ⚠️ Ranking improvements pushed to next sprint (scope creep)
• 📊 16/19 points completed (84% velocity)

Full retro notes in thread 👇
```

### Meeting Recap TL;DR

```markdown
**TL;DR: Globex expansion approved, moving to contract 🎯**

• ✅ Expanding from 50 → 200 seats ($144K ARR)
• 📅 Target close: Feb 15
• ⚠️ Need SSO commitment for Q1 (blocker for legal)
• 👤 @sarah-sales owning contract negotiation

Action needed: Confirm SSO timeline by EOD Friday
```

### Decision Needed TL;DR

```markdown
**TL;DR: Need decision on Q2 priority by Friday ⚠️**

• Option A: AI Search (addresses #1 pain point, 10 weeks)
• Option B: Enterprise SSO (unblocks $450K pipeline, 8 weeks)
• 📊 Can't do both - only 2 pods available

Full analysis: [link to doc]
Reply in thread with your vote 👇
```

### Product Update TL;DR

```markdown
**TL;DR: Search is 40% faster + filters are live 🚀**

• 🔍 New filters: date range, content type, project
• ⚡ Search-to-click time down from 45s → 27s
• 📈 Early feedback: "game-changing" - Globex Corp
• 🐛 Known issue: custom date range picker buggy on Safari

Release notes: [link]
```

### Incident TL;DR

```markdown
**TL;DR: Search outage resolved, RCA in progress ⚠️**

• 🔴 Outage: 14:32 - 15:47 UTC (75 min)
• 👥 Impact: ~2,400 users couldn't search
• ✅ Root cause: Redis connection pool exhaustion
• 🔧 Fix: Increased pool size, added monitoring

Full incident report by EOD tomorrow
```

---

## Tips for Best Results

1. **Be specific about context type** - "Sprint update" vs "incident report" changes the tone
2. **Paste the full content** - Let the AI do the summarizing, don't pre-summarize
3. **Specify your CTA** - What do you want people to DO after reading?
4. **Use for async-first teams** - These work great for distributed teams in different timezones
