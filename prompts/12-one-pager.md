# One-Pager Prompt

Synthesize multiple inputs into a concise one-page executive summary or meeting pre-read.

---

## System Prompt

```
You are an executive communications expert helping PMs create concise, impactful one-pagers.

Your job is to take multiple inputs (documents, data, context) and distill them into a single-page summary that busy executives or stakeholders can read in 2-3 minutes.

Guidelines:
- Ruthlessly prioritize - only include what matters most
- Lead with the "so what?" - why should they care?
- Use concrete numbers over vague statements
- Structure for skimmability (headers, bullets, bold key points)
- Include a clear ask or decision needed (if applicable)
- Keep it to ONE page when printed (roughly 400-500 words max)
- Assume the reader has 2 minutes and zero context
- End with clear next steps or recommendations
```

---

## User Prompt Template

```
Create a one-pager for {{tenantName}}.

## Purpose
{{purpose}}

## Target Audience
{{audience}}

## Source Materials

### Documents / Context
{{documents}}

### Key Data Points
{{dataPoints}}

### Background / History
{{background}}

### Current Status
{{currentStatus}}

## Specific Requirements
{{requirements}}

## Output Format

Create a one-pager with:

1. **Title** - Clear, descriptive title

2. **TL;DR** (2-3 sentences max)
   - What is this about?
   - Why does it matter?
   - What's the ask/outcome?

3. **Context** (3-4 bullets)
   - Essential background only
   - Key numbers that frame the situation

4. **Key Findings / Status** (4-6 bullets)
   - Most important points
   - Bold the critical items
   - Include specific metrics

5. **Options / Recommendations** (if applicable)
   - 2-3 options with one-line trade-offs
   - Or clear recommendation with rationale

6. **Ask / Decision Needed** (if applicable)
   - What do you need from the reader?
   - By when?

7. **Next Steps** (3-4 bullets)
   - Concrete actions
   - Owners and dates if known

Keep total length under 500 words. Format for easy skimming.
```

---

## Required Context

- `purpose` - What is this one-pager for?
- `documents` - Source materials to synthesize

---

## Output Format

Markdown

---

## Usage in ChatGPT/Claude

1. Copy the **System Prompt** and paste it as your first message (or use as custom instructions)
2. Copy the **User Prompt Template** and replace the `{{placeholders}}` with your actual data:
   - `{{tenantName}}` → Your company name
   - `{{purpose}}` → What is this one-pager for? (e.g., "Board meeting pre-read", "Exec review")
   - `{{audience}}` → Who will read this? (e.g., "C-suite", "Cross-functional leads")
   - `{{documents}}` → Paste the documents, reports, or context to synthesize
   - `{{dataPoints}}` → Key metrics and numbers to include
   - `{{background}}` → Historical context or background info
   - `{{currentStatus}}` → Current state of the project/initiative
   - `{{requirements}}` → Any specific requirements or constraints

---

## Example Output

```markdown
# Q1 Search Initiative: Executive Summary

## TL;DR
Search improvements shipped 2 weeks early, driving 40% faster content discovery and unblocking $450K in enterprise expansion. Requesting approval to proceed with AI search in Q2.

---

## Context
- Search was our #1 customer pain point (35% of all VoC mentions)
- 3 enterprise deals ($450K ARR) blocked pending improvements
- Competitor (Notion) launched AI search in December
- Q1 goal: Ship filters and improve relevance

## Key Findings

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Search-to-click time | 45s | 27s | **-40%** |
| Filter adoption | N/A | 47% | New |
| Search NPS | 3.2 | 4.1 | **+28%** |
| Support tickets (search) | 47/mo | 18/mo | **-62%** |

- **Shipped 2 weeks ahead of schedule** (7 weeks vs 9 planned)
- Enterprise accounts report "game-changing" improvement
- Globex Corp expansion ($144K) now moving forward

## Recommendation

Proceed with **AI-powered semantic search** for Q2:
- Builds on Q1 foundation
- Addresses remaining gap vs. Notion
- Estimated 8-week effort, 2 engineers

**Alternative**: Pause for other priorities (risk: competitive gap widens)

## Ask

**Approve Q2 AI search initiative** by Jan 20 to begin technical design.

## Next Steps
- [ ] Capacity allocation decision - @eng-lead - Jan 20
- [ ] Customer beta recruitment - @pm - Jan 24
- [ ] Technical design kickoff - @tech-lead - Jan 27
```
