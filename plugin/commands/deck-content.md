---
description: Generate slide content tailored to any audience (exec, customer, team, stakeholder)
argument-hint: "<topic> --audience [exec|customer|team|stakeholder]"
---

# Deck Content

Generate structured slide content for presentations.

## Your Task

Create slide content for the specified topic and audience.

## Data to Gather

Based on the topic, use Claude's connected integrations to pull:

1. **Jira** (via Atlassian connector):
   - Sprint metrics and velocity
   - Completed work and roadmap

2. **Confluence** (via Atlassian connector):
   - Strategy docs and OKRs
   - Related PRDs

3. **Analytics** (ask user to provide):
   - Key metrics and KPIs
   - Performance data

4. **Customer Data** (via Zendesk/Gong or ask user):
   - Customer feedback and quotes
   - NPS and satisfaction data

## Audience Guidelines

**Customer Audience:**
- Focus on value and outcomes, not features
- Use their language, not internal jargon
- Include ROI and business impact
- Reference success stories from similar customers
- Tone: Confident, helpful, outcome-focused

**Team Audience:**
- Include technical details and architecture decisions
- Show sprint metrics and velocity
- Call out blockers and dependencies
- Include demo talking points
- Tone: Direct, detailed, collaborative

**Executive Audience:**
- Lead with business impact and metrics
- Apply the "so what?" test to every point
- Limit to 5-7 slides max
- Include clear asks/decisions needed
- Avoid technical jargon entirely
- Tone: Strategic, concise, confident

**Stakeholder Audience:**
- Highlight cross-functional dependencies
- Show timeline and milestones
- Be clear about what you need from them
- Flag risks that affect their teams
- Tone: Collaborative, transparent, respectful

## Output Format

For each slide, provide:

---

# Slide Deck Content: [Topic]

**Audience:** [Type]
**Duration:** [X] minutes
**Generated:** [Date]

---

## [SLIDE 1: Title]

**Headline:** [Compelling headline, max 10 words]

**Subheadline:** [Supporting context]

**Speaker Notes:** [What to say, what to emphasize]

---

## [SLIDE 2: Agenda]

**Headline:** What We'll Cover

**Bullets:**
- [Topic 1]
- [Topic 2]
- [Topic 3]

**Speaker Notes:** [Set expectations, mention Q&A timing]

---

## [SLIDE 3: Context]

**Headline:** [Why This Matters Now]

**Bullets:**
- [Point 1 - max 7 words]
- [Point 2 - max 7 words]
- [Point 3 - max 7 words]

**Key Metric:** [One number that matters]

**Visual Suggestion:** [Chart type or image idea]

**Speaker Notes:** [What to emphasize, potential questions]

---

## [SLIDE 4-N: Main Content]

[Repeat structure for each slide]

---

## [SLIDE N: The Ask]

**Headline:** What We Need

**Bullets:**
- [Ask 1]
- [Ask 2]
- [Ask 3]

**Speaker Notes:** [Be direct, open for questions]

---

## [APPENDIX: Q&A Prep]

**Likely Questions:**
1. [Question] → [Answer approach]
2. [Question] → [Answer approach]

**Data to Have Ready:**
- [Supporting data point]
- [Supporting data point]

---

## Guidelines

- One key message per slide
- Use the "1-3-5" rule: 1 idea, 3 supporting points, 5 words max per bullet
- Create a narrative arc: context → problem → solution → impact → next steps
- Speaker notes should include: key talking point, potential questions, and what NOT to say
