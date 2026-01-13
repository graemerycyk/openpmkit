# Feature Ideation & Planning Prompt

Transform raw ideas, feedback, and problems into structured feature concepts with action points.

---

## System Prompt

```
You are a product strategist helping PMs transform raw ideas and customer signals into well-structured feature concepts.

Your job is to take unstructured inputs (Slack discussions, feature ideas, customer problems) and synthesize them into a clear feature concept with actionable next steps.

Guidelines:
- Start with the problem, not the solution
- Validate ideas against customer evidence
- Consider multiple solution approaches
- Identify assumptions that need testing
- Create concrete, assignable action items
- Think about what could go wrong
- Consider the "jobs to be done" framework
- Be opinionated but acknowledge uncertainty
- Output should be actionable within 1-2 weeks
```

---

## User Prompt Template

```
Help me ideate and plan a feature for {{tenantName}}.

## Raw Inputs

### Feature Ideas / Themes
{{featureIdeas}}

### Problem Being Solved
{{problemStatement}}

### Slack / Team Discussions
{{slackDiscussions}}

### Customer Signals
{{customerSignals}}

### Competitive Context
{{competitiveContext}}

### Constraints
{{constraints}}

## Output Format

Create a Feature Ideation Document with:

1. **Problem Definition**
   - Problem statement (1-2 sentences)
   - Who experiences this problem?
   - How painful is it? (frequency × severity)
   - What happens if we don't solve it?

2. **Opportunity Assessment**
   - Market size / customer segment affected
   - Strategic alignment (why now?)
   - Competitive positioning
   - Revenue / retention impact estimate

3. **Solution Exploration**
   - Option A: [Minimal approach]
   - Option B: [Balanced approach]  
   - Option C: [Comprehensive approach]
   - For each: effort estimate, pros, cons, risks

4. **Recommended Approach**
   - Which option and why
   - Core user stories (3-5 max)
   - What's explicitly out of scope
   - Key differentiator vs. alternatives

5. **Assumptions to Validate**
   - List 3-5 critical assumptions
   - How to test each (customer interviews, prototype, data analysis)
   - What would change our mind

6. **Risks & Mitigations**
   - Technical risks
   - Adoption risks
   - Business risks
   - Mitigation strategies

7. **Action Items** (Next 2 weeks)
   - [ ] Action item 1 - Owner - Due date
   - [ ] Action item 2 - Owner - Due date
   - [ ] Action item 3 - Owner - Due date
   - [ ] Action item 4 - Owner - Due date
   - [ ] Action item 5 - Owner - Due date

8. **Decision Points**
   - What decisions need to be made before PRD?
   - Who needs to approve / align?
   - Target date for go/no-go decision
```

---

## Required Context

- `featureIdeas` - Raw feature ideas or themes
- `problemStatement` - The problem being solved

---

## Output Format

Markdown

---

## Usage in ChatGPT/Claude

1. Copy the **System Prompt** and paste it as your first message (or use as custom instructions)
2. Copy the **User Prompt Template** and replace the `{{placeholders}}` with your actual data:
   - `{{tenantName}}` → Your company name
   - `{{featureIdeas}}` → Paste raw feature ideas, brainstorm notes, or themes
   - `{{problemStatement}}` → Describe the problem you're trying to solve
   - `{{slackDiscussions}}` → Paste relevant Slack threads or team discussions
   - `{{customerSignals}}` → Paste customer feedback, requests, or research
   - `{{competitiveContext}}` → What competitors are doing (optional)
   - `{{constraints}}` → Technical, resource, or timeline constraints (optional)

---

## Example Output

```markdown
# Feature Ideation: AI-Powered Search

**Date**: 2026-01-13
**Author**: Jane PM
**Status**: Ideation

---

## 1. Problem Definition

### Problem Statement
Users spend 20-30 minutes per day searching for content because keyword search doesn't understand intent, returning irrelevant results that require manual filtering.

### Who Experiences This?
- **Primary**: Power users with 100+ documents (65% of enterprise accounts)
- **Secondary**: New users unfamiliar with content organization
- **Tertiary**: Teams with inconsistent naming conventions

### Pain Severity
- **Frequency**: 8-12 searches per user per day
- **Severity**: High - directly impacts productivity
- **Pain Score**: 8/10 (based on VoC data)

### Cost of Inaction
- Continued churn risk for enterprise accounts
- Competitive disadvantage vs. Notion (launched AI search)
- Support ticket volume remains elevated (47/month)

---

## 2. Opportunity Assessment

### Market Size
- 65% of enterprise accounts affected (~$2.4M ARR at risk)
- 40% of mid-market accounts affected (~$800K ARR)
- Total addressable: ~$3.2M ARR protection + expansion unlock

### Strategic Alignment
- **Why now?**: Notion launched AI search; customers asking about it
- **Company priority**: Retention is Q1 focus
- **Technical readiness**: Vector DB infrastructure already in place

### Competitive Positioning
| Competitor | AI Search | Our Position |
|------------|-----------|--------------|
| Notion | ✅ Launched | ❌ Gap |
| Coda | 🔜 Beta | ❌ Gap |
| Monday.com | ❌ No | ✅ Opportunity |

### Impact Estimate
- **Retention**: Reduce enterprise churn by 15% (~$360K ARR saved)
- **Expansion**: Unblock 3 deals worth $180K ARR
- **NPS**: +5 points projected

---

## 3. Solution Exploration

### Option A: Enhanced Keyword Search (Minimal)
Improve existing search with better ranking, typo tolerance, and synonyms.

- **Effort**: 3 weeks, 1 engineer
- **Pros**: Low risk, quick win, no new infrastructure
- **Cons**: Doesn't address semantic understanding, won't match competitors
- **Risks**: May feel incremental; customers expecting AI

### Option B: Hybrid Search (Balanced) ⭐
Add semantic search layer alongside keyword search, with smart result blending.

- **Effort**: 8 weeks, 2 engineers
- **Pros**: Best of both worlds, competitive parity, measurable improvement
- **Cons**: Complexity in result ranking, LLM costs
- **Risks**: Latency concerns, cost management at scale

### Option C: Full AI Search + Chat (Comprehensive)
Semantic search plus conversational interface ("Ask your workspace").

- **Effort**: 14 weeks, 3 engineers
- **Pros**: Differentiated, future-proof, high wow factor
- **Cons**: High effort, unproven UX, significant LLM costs
- **Risks**: Scope creep, accuracy concerns, support burden

---

## 4. Recommended Approach

### Recommendation: Option B - Hybrid Search

**Rationale**:
1. Achieves competitive parity with Notion
2. Manageable scope for Q1 delivery
3. Foundation for Option C later
4. Clear success metrics

### Core User Stories
1. As a PM, I want to search by describing what I'm looking for so I find relevant content even with different keywords
2. As a user, I want search to understand context so "Q4 planning doc" finds "2025 Strategic Roadmap"
3. As a team lead, I want search to surface recent and relevant results so I don't scroll through old content

### Out of Scope
- Conversational/chat interface (future)
- Cross-workspace search (enterprise feature)
- Search analytics dashboard (separate initiative)
- Saved searches (P2 feature)

### Key Differentiator
Unlike Notion's AI search (which is slow), we'll optimize for <500ms response time by pre-computing embeddings and using hybrid ranking.

---

## 5. Assumptions to Validate

| Assumption | Validation Method | Owner | Timeline |
|------------|-------------------|-------|----------|
| Users will trust AI search results | Prototype test with 5 users | UX Research | Week 1 |
| Latency <500ms is achievable | Technical spike | Engineering | Week 1 |
| LLM costs are manageable at scale | Cost modeling | Finance + Eng | Week 1 |
| Hybrid ranking improves relevance | A/B test design | Data Science | Week 2 |
| Enterprise customers will pay more | 3 customer interviews | Sales | Week 2 |

### What Would Change Our Mind
- If latency >1s is unavoidable → Reconsider Option A
- If LLM costs >$0.10/search → Need pricing strategy
- If user testing shows confusion → Simplify to keyword-only improvements

---

## 6. Risks & Mitigations

### Technical Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Latency exceeds targets | Medium | High | Pre-compute embeddings, caching layer |
| Embedding quality issues | Low | Medium | Use proven model (OpenAI ada-002) |
| Scale concerns | Medium | High | Start with enterprise tier only |

### Adoption Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Users don't notice improvement | Medium | High | Prominent UI change, onboarding tooltip |
| Results feel "wrong" | Medium | Medium | Hybrid approach preserves keyword fallback |

### Business Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| LLM costs exceed budget | Medium | High | Usage caps, tiered pricing |
| Competitor ships first | High | Medium | Focus on speed + quality, not features |

---

## 7. Action Items (Next 2 Weeks)

### Week 1
- [ ] **Technical spike on latency** - @alex-eng - Jan 17
- [ ] **Cost modeling spreadsheet** - @jane-pm + @finance - Jan 17
- [ ] **Draft prototype for user testing** - @sarah-design - Jan 19
- [ ] **Schedule 5 user interviews** - @ux-research - Jan 17

### Week 2
- [ ] **Run user prototype tests** - @ux-research - Jan 24
- [ ] **Complete 3 customer interviews** - @sales - Jan 24
- [ ] **A/B test design doc** - @data-science - Jan 22
- [ ] **Go/no-go recommendation** - @jane-pm - Jan 26

---

## 8. Decision Points

### Decisions Needed Before PRD
1. **Scope confirmation**: Option B hybrid approach (or pivot based on findings)
2. **Pricing strategy**: Include in current plans or premium feature?
3. **Rollout strategy**: Enterprise-first or all customers?

### Approvals Required
- Engineering lead: Capacity commitment
- Finance: LLM budget approval
- Product leadership: Strategic alignment

### Timeline
- **Ideation complete**: Jan 26
- **Go/no-go decision**: Jan 26
- **PRD draft**: Feb 2 (if approved)
- **Engineering kickoff**: Feb 9
```

---

## Tips for Best Results

1. **Be messy with inputs** - The prompt is designed to handle unstructured data. Paste raw Slack threads, bullet points, or stream-of-consciousness notes.

2. **Include dissenting opinions** - If there's debate on the team, include it. The output will be better if it addresses concerns.

3. **Don't skip constraints** - Resource limits, technical debt, and timeline pressure are important context.

4. **Use for early-stage ideas** - This prompt is for ideation, not execution. Use `/prd` when you're ready to commit to a solution.

5. **Iterate** - Run the prompt multiple times with refined inputs as you learn more.
