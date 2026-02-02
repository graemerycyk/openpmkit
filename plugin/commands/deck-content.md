---
description: Generate slide content tailored to any audience (exec, customer, team, stakeholder)
argument-hint: "<topic> --audience [exec|customer|team|stakeholder]"
---

# Deck Content

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../CONNECTORS.md).

Generate structured slide content for presentations.

## Workflow

### 1. Understand the Request

Get from the user:
- **Topic:** What's the presentation about?
- **Audience:** exec, customer, team, or stakeholder (default: exec)
- **Duration:** How long? (default: 30 min)
- **Goal:** What do you want the audience to do/think/feel after?

### 2. Pull Data from Connected Tools

**Do this first — gather relevant data to populate the deck.**

If **~~project tracker** (Jira, Linear) is connected:
- Get sprint metrics and velocity (for team/exec updates)
- Get roadmap status (for customer/stakeholder decks)
- Get completed work and accomplishments

If **~~knowledge base** (Confluence, Notion) is connected:
- Find strategy docs and OKRs (for exec decks)
- Get PRDs and specs (for technical content)
- Find previous decks on similar topics

If **~~support** (Zendesk, Intercom) is connected:
- Get customer satisfaction metrics
- Find relevant customer quotes
- Get support volume trends

If **~~calls** (Gong, Fireflies) is connected:
- Get customer quotes and testimonials
- Find competitive intel for positioning

**If a tool isn't connected, skip that source and proceed. Do NOT ask the user to connect tools.**

### 3. Tailor to Audience

**Executive Audience:**
- Lead with business impact and metrics
- Apply "so what?" test to every point
- 5-7 slides max
- Include clear asks/decisions needed
- No technical jargon
- Tone: Strategic, concise, confident

**Customer Audience:**
- Focus on value and outcomes, not features
- Use their language, not internal jargon
- Include ROI and business impact
- Reference success stories
- Tone: Confident, helpful, outcome-focused

**Team Audience:**
- Include technical details
- Show sprint metrics and velocity
- Call out blockers and dependencies
- Include demo talking points
- Tone: Direct, detailed, collaborative

**Stakeholder Audience:**
- Highlight cross-functional dependencies
- Show timeline and milestones
- Be clear about what you need from them
- Flag risks that affect their teams
- Tone: Collaborative, transparent, respectful

### 4. Generate the Deck Content

Produce slide content in this format:

---

# Slide Deck: [Topic]

| | |
|---|---|
| **Audience** | [Type] |
| **Duration** | [X] minutes |
| **Goal** | [What you want from the audience] |
| **Generated** | [Date] |

---

## Slide 1: Title

**Headline:** [Compelling headline — max 10 words]

**Subheadline:** [Supporting context]

---

## Slide 2: Agenda

**Headline:** What We'll Cover

**Bullets:**
- [Topic 1]
- [Topic 2]
- [Topic 3]
- Q&A

**Speaker Notes:**
- Set expectations for timing
- Note if slides will be shared after

---

## Slide 3: Context / Why Now

**Headline:** [Why This Matters Now]

**Bullets:**
- [Point 1 — max 7 words]
- [Point 2 — max 7 words]
- [Point 3 — max 7 words]

**Key Metric:** [One number that anchors the point]

**Visual:** [Suggested chart/image]

**Speaker Notes:**
- [What to emphasize]
- [Potential question to anticipate]

---

## Slide 4: [Content Slide]

**Headline:** [Key message — what do you want them to remember?]

**Bullets:**
- [Point 1]
- [Point 2]
- [Point 3]

**Data/Visual:** [Chart, graph, or image suggestion]

**Speaker Notes:**
- [Key talking point]
- [What NOT to say]
- [Potential question]

---

## Slide 5: [Content Slide]

[Continue pattern...]

---

## Slide N-1: The Ask

**Headline:** What We Need

**Bullets:**
- [Ask 1 — specific and actionable]
- [Ask 2 — specific and actionable]
- [Ask 3 — specific and actionable]

**Speaker Notes:**
- Be direct
- Pause for questions
- Have backup data ready

---

## Slide N: Summary / Next Steps

**Headline:** Key Takeaways

**Bullets:**
- [Takeaway 1]
- [Takeaway 2]
- [Takeaway 3]

**Next Steps:**
| Action | Owner | Due |
|--------|-------|-----|
| [Action] | [Name] | [Date] |

---

## Appendix: Q&A Prep

### Likely Questions

| Question | Answer Approach |
|----------|-----------------|
| [Anticipated question] | [How to answer] |
| [Anticipated question] | [How to answer] |
| [Anticipated question] | [How to answer] |

### Data to Have Ready
- [Supporting data point]
- [Backup slide reference]

### If You Don't Know
- "Great question — let me follow up with specifics after this meeting"
- Don't guess or make up numbers

---

## Notes

- Pull relevant data FIRST to populate with real numbers
- One key message per slide — if you have two, make two slides
- "1-3-5" rule: 1 idea, 3 supporting points, 5 words max per bullet
- Narrative arc: Context → Problem → Solution → Impact → Ask
- Speaker notes: include what to say, what NOT to say, potential questions
- Exec decks: ruthlessly cut — if it doesn't support the ask, remove it
- Customer decks: everything should connect to their business outcomes
