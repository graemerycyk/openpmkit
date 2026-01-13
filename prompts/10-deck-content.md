# Deck Content Prompt

Generate slide content tailored to your audience.

---

## System Prompt

```
You are a presentation content expert helping PMs create compelling slide content for any audience.

Your job is to generate structured slide content that can be copy-pasted into any existing presentation template. PMs work with company-mandated templates, so you provide the TEXT CONTENT only - not design.

## Output Format
For each slide, provide:
- **[SLIDE N: Type]** - Slide number and purpose
- **Headline**: One compelling sentence (max 10 words)
- **Bullets**: Max 3 points, 5-7 words each
- **Key Metric**: (if applicable) One number that matters
- **Visual Suggestion**: What chart/image would help
- **Speaker Notes**: What to say, what to avoid, likely questions

## Audience-Specific Guidelines

**Customer Audience:**
- Focus on value and outcomes, not features
- Use their language, not internal jargon
- Include ROI and business impact
- Reference success stories from similar customers
- Keep technical details minimal
- Tone: Confident, helpful, outcome-focused

**Team Audience:**
- Include technical details and architecture decisions
- Show sprint metrics and velocity
- Call out blockers and dependencies
- Include demo talking points
- Assign clear action items with owners
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

## General Guidelines
- One key message per slide
- Use the "1-3-5" rule: 1 idea, 3 supporting points, 5 words max per bullet
- Create a narrative arc: context → problem → solution → impact → next steps
- Speaker notes should include: key talking point, potential questions, and what NOT to say
```

---

## User Prompt Template

```
Generate slide content for {{tenantName}}.

## Presentation Details
- Topic: {{topic}}
- Audience: {{audienceType}}
- Purpose: {{purpose}}
- Duration: {{duration}} minutes (approximate)

## Source Data

### Key Data Points
{{keyDataPoints}}

### Supporting Evidence
{{supportingEvidence}}

### Related Artifacts
{{relatedArtifacts}}

## Specific Requirements
{{requirements}}

Generate structured slide content with:
1. **Title Slide** - Compelling headline, subtitle, presenter info
2. **Agenda/Overview** - What will be covered (optional for short decks)
3. **Context/Problem** - Why this matters now
4. **Main Content** (3-5 slides) - Key points with supporting data
5. **Impact/Results** - Metrics, outcomes, or expected benefits
6. **Next Steps/Ask** - Clear action items or decisions needed
7. **Appendix suggestions** - What to have ready for Q&A

Tailor the tone, depth, and content focus based on the {{audienceType}} audience.
```

---

## Required Context

- `topic` - Presentation topic
- `audienceType` - customer, team, exec, or stakeholder

---

## Output Format

Markdown (structured slide content)

---

## Usage in ChatGPT/Claude

1. Copy the **System Prompt** and paste it as your first message (or use as custom instructions)
2. Copy the **User Prompt Template** and replace the `{{placeholders}}` with your actual data:
   - `{{tenantName}}` → Your company name
   - `{{topic}}` → Presentation topic
   - `{{audienceType}}` → One of: customer, team, exec, stakeholder
   - `{{purpose}}` → Goal of the presentation
   - `{{duration}}` → Approximate length in minutes
   - `{{keyDataPoints}}` → Paste key metrics and data
   - `{{supportingEvidence}}` → Paste supporting evidence
   - `{{relatedArtifacts}}` → Paste related docs, PRDs, etc.
   - `{{requirements}}` → Any specific requirements

---

## Example Output

```markdown
# Slide Deck Content: Q4 Product Update

**Audience**: Executive
**Generated**: 2026-01-13
**Prepared for**: Jane PM

---

# [SLIDE 1: Title]

**Headline:** Q4 Product Update

**Subheadline:** Delivering value through focused execution

**Speaker Notes:** Open with energy. This deck covers our progress, impact, 
and what's next. Keep it conversational—this is a discussion, not a lecture.

---

# [SLIDE 2: Agenda]

**Headline:** What We'll Cover

**Bullets:**
- Where we are today
- Key wins and metrics
- What's next and what we need

**Speaker Notes:** Set expectations upfront. Let them know there will be time 
for questions at the end, but they can interrupt for clarifications.

---

# [SLIDE 3: Context]

**Headline:** Why This Matters Now

**Bullets:**
- Search is our #1 customer pain point (35% of VoC)
- Enterprise expansion blocked until resolved
- Competitors shipping AI search features

**Key Metric:** 52 customer mentions in last 30 days

**Visual Suggestion:** Bar chart showing VoC theme distribution

**Speaker Notes:** Pause here to let the numbers sink in. This is the "why now" 
moment. If asked about competitors, mention Notion's recent AI search launch.

---

# [SLIDE 4: What We Built]

**Headline:** Search Filters: Shipped

**Bullets:**
- Date range filters (7d, 30d, 90d, custom)
- Content type filtering (docs, projects, comments)
- Real-time results as you filter

**Key Metric:** Shipped 2 weeks ahead of schedule

**Visual Suggestion:** Screenshot or GIF of the filter UI in action

**Speaker Notes:** Demo opportunity here if time allows. Show the before/after 
experience. Emphasize this was customer-driven, not a pet project.

---

# [SLIDE 5: Impact]

**Headline:** Early Results Exceed Targets

**Bullets:**
- 40% reduction in search-to-click time
- 45% filter adoption (target: 40%)
- NPS for search: 3.2 → 4.1 in beta

**Key Metric:** 40% faster search

**Visual Suggestion:** Line chart showing search satisfaction trend

**Speaker Notes:** These are beta numbers from 200 users. Full rollout metrics 
expected in 2 weeks. Globex Corp specifically called out filters as "game-changing."

---

# [SLIDE 6: Customer Voice]

**Headline:** What Customers Are Saying

**Bullets:**
- "This changes everything for our team" — Globex Corp
- "Finally, search that works" — Initech
- "We're ready to expand now" — Acme Inc

**Visual Suggestion:** Customer quote cards with logos

**Speaker Notes:** These are real quotes from beta users. Globex is now moving 
forward with their 4x expansion. Don't oversell—acknowledge we still have work 
to do on AI search.

---

# [SLIDE 7: What's Next]

**Headline:** Q1 Roadmap

**Bullets:**
- AI-powered semantic search (Q1)
- Saved search preferences (Q1)
- Search analytics dashboard (Q2)

**Key Metric:** $450K pipeline unblocked by SSO (parallel track)

**Visual Suggestion:** Simple roadmap timeline

**Speaker Notes:** AI search is the big bet for Q1. We're starting discovery now. 
SSO is running in parallel—that's a separate update if needed.

---

# [SLIDE 8: The Ask]

**Headline:** What We Need

**Bullets:**
- Sign-off on AI search resourcing (2 pods, 10 weeks)
- Feedback on Q1 priorities
- Introductions to beta customers for AI search

**Visual Suggestion:** Simple checklist or decision matrix

**Speaker Notes:** Be direct about the ask. We need a decision on AI search 
resourcing by end of week to hit Q1 targets. Open for questions.

---

# [APPENDIX: Q&A Prep]

**Likely Questions:**
1. "Why not AI search first?" → Customer evidence showed filters were table-stakes; 
   AI search is differentiation
2. "What about competitors?" → Notion has AI search, but we're 2 months behind at most
3. "What's the risk?" → Main risk is LLM costs; we're exploring hybrid approaches

**Data to Have Ready:**
- Full VoC report with all 52 mentions
- Competitor feature comparison matrix
- Engineering capacity breakdown
- Customer quotes with attribution
```
