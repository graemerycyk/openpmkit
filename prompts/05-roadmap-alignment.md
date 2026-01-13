# Roadmap Alignment Memo Prompt

Create an alignment memo for roadmap decisions.

---

## System Prompt

```
You are a strategic product advisor helping PMs make roadmap decisions.
Your job is to synthesize context and present options with clear trade-offs.

Guidelines:
- Present 2-3 clear options
- Be explicit about trade-offs
- Include evidence for each option
- Make a recommendation with reasoning
- Format for executive review
```

---

## User Prompt Template

```
Generate a roadmap alignment memo for {{tenantName}}.

## Decision Context
{{decisionContext}}

## Evidence

### Customer Demand (VoC)
{{vocThemes}}

### Analytics Insights
{{analyticsInsights}}

### Competitive Landscape
{{competitorContext}}

### Resource Constraints
{{resourceConstraints}}

## Output Format

Create an alignment memo with:
1. **Decision Required** - Clear statement of what needs to be decided
2. **Context** - Background and why this matters now
3. **Options** (2-3 options, each with):
   - Description
   - Pros
   - Cons
   - Evidence supporting this option
   - Resource requirements
   - Timeline
4. **Recommendation** - Which option and why
5. **Open Questions** - What we still need to learn
6. **Next Steps** - If approved, what happens next
```

---

## Required Context

- `decisionContext` - What decision needs to be made
- `vocThemes` - Customer demand data

---

## Output Format

Markdown

---

## Usage in ChatGPT/Claude

1. Copy the **System Prompt** and paste it as your first message (or use as custom instructions)
2. Copy the **User Prompt Template** and replace the `{{placeholders}}` with your actual data:
   - `{{tenantName}}` → Your company name
   - `{{decisionContext}}` → Describe the decision that needs to be made
   - `{{vocThemes}}` → Paste VoC themes and customer demand data
   - `{{analyticsInsights}}` → Paste relevant analytics data
   - `{{competitorContext}}` → Paste competitive landscape info
   - `{{resourceConstraints}}` → Describe team capacity and constraints

---

## Example Output

```markdown
# Roadmap Alignment Memo

**Decision Required**: Q1 2026 Priority - Search AI vs. Enterprise SSO
**Date**: 2026-01-13
**Author**: Jane PM

## Decision Required

We need to decide the primary focus for Q1 2026 engineering capacity. 
Both Search AI and Enterprise SSO have strong cases. This memo presents 
options and a recommendation.

## Context

**Why Now**: 
- Q1 planning deadline is Jan 15
- Engineering capacity: 3 pods (12 engineers)
- Both initiatives require 1.5-2 pods

**Background**:
- Search is our #1 customer pain point (35% of VoC)
- SSO is blocking 3 enterprise deals worth $450K ARR
- Competitor (Notion) just launched AI search

## Options

### Option A: Search AI First

**Description**: Build AI-powered semantic search, launching Q1

**Pros**:
- Addresses #1 customer pain point
- Competitive response to Notion
- Benefits all customers

**Cons**:
- Enterprise deals remain blocked
- SSO is a compliance requirement for some
- Longer time to revenue impact

**Evidence**:
- 52 VoC mentions for search
- 89-vote community request
- 3 expansion deals blocked by search

**Resources**: 2 pods, 10 weeks
**Revenue Impact**: Retention improvement (~$200K protected ARR)

---

### Option B: Enterprise SSO First

**Description**: Ship SAML/OIDC SSO, launching mid-Q1

**Pros**:
- Unblocks $450K in enterprise deals
- Compliance requirement for regulated industries
- Shorter time to revenue

**Cons**:
- Search pain continues
- Competitive gap widens
- Benefits only enterprise segment

**Evidence**:
- 3 deals worth $450K blocked
- 95-vote feature request
- All competitors have SSO

**Resources**: 1.5 pods, 8 weeks
**Revenue Impact**: $450K new ARR

---

## Recommendation

**Option B: Enterprise SSO First**, with Search AI immediately following.

**Reasoning**:
1. SSO has clear, immediate revenue impact ($450K)
2. SSO is faster (8 weeks vs 10)
3. Search improvements (filters) shipping now address acute pain
4. AI search can begin discovery in parallel

## Open Questions

1. Can we get a verbal commitment from blocked deals if we commit to Q1 SSO?
2. What's the minimum viable AI search scope?
3. Can we staff a discovery pod for AI search during SSO build?

## Next Steps

If approved:
1. Confirm with Sales on deal commitments
2. Kick off SSO technical design (Week 1)
3. Begin AI search discovery (Week 2)
4. Update public roadmap
```
