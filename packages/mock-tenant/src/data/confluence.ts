import type { ConfluencePage, ConfluenceSpace } from '@pmkit/mcp-servers';

export const confluenceData = {
  spaces: [
    {
      key: 'PROD',
      name: 'Product',
      description: 'Product documentation, PRDs, and roadmap',
      type: 'global' as const,
    },
    {
      key: 'ENG',
      name: 'Engineering',
      description: 'Technical documentation and architecture',
      type: 'global' as const,
    },
    {
      key: 'SUPPORT',
      name: 'Support',
      description: 'Support playbooks and escalation procedures',
      type: 'global' as const,
    },
  ] satisfies ConfluenceSpace[],

  pages: [
    {
      id: 'page-001',
      title: 'Search Improvements PRD',
      spaceKey: 'PROD',
      body: `# Search Improvements PRD

## Problem Statement
Users consistently report that search is one of the most frustrating parts of the product. Key issues include:
- Poor relevance ranking
- No filtering options
- Unhelpful "no results" experience

## Goals
1. Improve search relevance score from 3.2 to 4.0+ (user survey)
2. Reduce "no results" rate from 15% to under 8%
3. Add filtering capabilities requested by 40+ customers

## Success Metrics
- Search satisfaction score (quarterly survey)
- No-results rate (analytics)
- Filter usage rate
- Time to find content (user research)

## Proposed Solution
### Phase 1: Relevance Improvements
- Implement TF-IDF with recency boosting
- Add typo tolerance and stemming
- Improve content indexing coverage

### Phase 2: Filtering
- Date range filters
- Content type filters
- Project/space filters

### Phase 3: No Results Experience
- Spell correction suggestions
- Related content recommendations
- Search tips

## Open Questions
1. Should we index comments? (performance vs. completeness trade-off)
2. How do we handle permission-filtered results in counts?
3. What's the migration path for existing saved searches?

## Evidence
- 47 support tickets about search in Q4
- 3 enterprise customers cited search as blocker for expansion
- Community feature request with 89 votes`,
      version: 3,
      ancestors: [],
      labels: ['prd', 'search', 'q4-2025'],
      createdBy: 'sarah.chen@acme.io',
      createdAt: '2025-10-20',
      updatedBy: 'sarah.chen@acme.io',
      updatedAt: '2025-12-15',
    },
    {
      id: 'page-002',
      title: 'Q4 2025 Roadmap',
      spaceKey: 'PROD',
      body: `# Q4 2025 Roadmap

## Theme: Foundation & Scale

### Now (Sprint 41-42)
- **Search Improvements** - Relevance, filters, no-results UX
- **Dashboard v2** - New widget system, customization
- **Critical bug fixes** - Performance and stability

### Next (Sprint 43-44)
- **API v3 Beta** - New endpoints, better pagination
- **Enterprise SSO prep** - SAML groundwork

### Later (Q1 2026)
- **Enterprise SSO** - Full SAML/OIDC support
- **Audit logging** - Compliance requirements
- **Mobile app v2** - React Native rewrite

## Key Decisions Needed
1. API v3: Breaking changes or backwards compatible?
2. SSO: Build vs. buy (Auth0/Okta integration)?
3. Mobile: Native vs. React Native?

## Dependencies
- Search improvements blocked on Elasticsearch upgrade (Ops)
- SSO requires legal review of enterprise contracts`,
      version: 5,
      ancestors: [],
      labels: ['roadmap', 'q4-2025', 'planning'],
      createdBy: 'sarah.chen@acme.io',
      createdAt: '2025-09-15',
      updatedBy: 'marcus.johnson@acme.io',
      updatedAt: '2025-12-20',
    },
    {
      id: 'page-003',
      title: 'Search Architecture',
      spaceKey: 'ENG',
      body: `# Search Architecture

## Current State
- Elasticsearch 7.x cluster (3 nodes)
- Full-text indexing of documents, projects, comments
- Basic relevance with BM25

## Proposed Changes
### Relevance Improvements
- Add field boosting (title > body > comments)
- Implement recency decay function
- Add user-specific personalization signals

### Performance
- Implement query result caching (Redis)
- Add search suggestion pre-computation
- Optimize index mappings for filter queries

### Monitoring
- Add search latency metrics
- Track no-results queries for analysis
- A/B testing infrastructure for ranking changes`,
      version: 2,
      ancestors: [],
      labels: ['architecture', 'search', 'technical'],
      createdBy: 'dev.team@acme.io',
      createdAt: '2025-11-01',
      updatedBy: 'dev.team@acme.io',
      updatedAt: '2025-12-10',
    },
    {
      id: 'page-004',
      title: 'Enterprise Customer Escalation Playbook',
      spaceKey: 'SUPPORT',
      body: `# Enterprise Customer Escalation Playbook

## When to Escalate
- Customer is on Enterprise tier
- Issue affects >10 users at customer
- Customer explicitly requests escalation
- Issue persists >48 hours without resolution

## Escalation Process
1. Create Jira ticket with "escalation" label
2. Notify #support-escalations Slack channel
3. Page on-call engineer if P1
4. Update customer within 2 hours

## Communication Templates
### Initial Response
"Thank you for bringing this to our attention. I've escalated this to our engineering team and you can expect an update within [X hours]."

### Status Update
"Our team is actively investigating. Current status: [status]. Next update: [time]."

## Recent Escalations
- Dec 26: Search crashes (ACME-350) - Resolved
- Dec 20: Dashboard loading (ACME-351) - In Progress
- Dec 15: API rate limiting (ACME-320) - Resolved`,
      version: 4,
      ancestors: [],
      labels: ['playbook', 'support', 'escalation'],
      createdBy: 'support@acme.io',
      createdAt: '2025-06-01',
      updatedBy: 'support@acme.io',
      updatedAt: '2025-12-27',
    },
    {
      id: 'page-005',
      title: 'Voice of Customer - Q4 2025 Themes',
      spaceKey: 'PROD',
      body: `# Voice of Customer - Q4 2025 Themes

## Methodology
Analyzed 150+ data points from:
- Support tickets (47)
- Gong call transcripts (32 calls)
- Community posts (45)
- NPS verbatims (28)

## Top Themes

### 1. Search Frustration (35% of mentions)
> "I spend more time searching than working"
> "Search never finds what I'm looking for"

**Evidence**: 47 support tickets, 12 Gong mentions, 89-vote feature request

### 2. Onboarding Complexity (22% of mentions)
> "It took our team 3 weeks to get productive"
> "The learning curve is steep"

**Evidence**: 15 support tickets, 8 Gong mentions, drop-off analytics

### 3. Integration Gaps (18% of mentions)
> "We need better Slack integration"
> "Jira sync is unreliable"

**Evidence**: 20 support tickets, 6 Gong mentions, 3 enterprise blockers

### 4. Performance Issues (15% of mentions)
> "Dashboard is slow to load"
> "API timeouts during peak hours"

**Evidence**: 12 support tickets, performance monitoring data

## Recommendations
1. Prioritize search improvements (in progress)
2. Invest in guided onboarding flow
3. Rebuild Slack integration with new API
4. Performance optimization sprint in Q1`,
      version: 2,
      ancestors: [],
      labels: ['voc', 'research', 'q4-2025'],
      createdBy: 'sarah.chen@acme.io',
      createdAt: '2025-12-01',
      updatedBy: 'sarah.chen@acme.io',
      updatedAt: '2025-12-28',
    },
  ] satisfies ConfluencePage[],
};

