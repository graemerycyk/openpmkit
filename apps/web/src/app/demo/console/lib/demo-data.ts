// Demo data for the Agent Console
// This simulates the data that would come from the mock-tenant package

export const demoUser = {
  id: 'demo-user-1',
  name: 'Demo User',
  email: 'demo_user@getpmkit.com',
  role: 'pm',
  avatar: null,
};

export const demoTenant = {
  id: 'demo-tenant-1',
  name: 'Acme Corp',
  integrations: [
    { name: 'jira', status: 'connected', projectCount: 3 },
    { name: 'confluence', status: 'connected', spaceCount: 2 },
    { name: 'slack', status: 'connected', channelCount: 5 },
    { name: 'gong', status: 'connected', callCount: 47 },
    { name: 'zendesk', status: 'connected', ticketCount: 156 },
    { name: 'analytics', status: 'connected', eventCount: 10000 },
    { name: 'competitor', status: 'connected', competitorCount: 4 },
    { name: 'community', status: 'connected', postCount: 89 },
  ],
};

export const cadenceJobs = [
  {
    id: 'daily-brief',
    name: 'Daily Brief',
    description: 'Aggregates overnight activity from Jira, Slack, and Gong into a morning summary',
    schedule: 'Daily at 8:00 AM',
    sources: ['jira', 'slack', 'gong'],
    estimatedDuration: '2-3 minutes',
    artifactType: 'markdown',
  },
  {
    id: 'weekly-themes',
    name: 'Weekly VoC Themes',
    description: 'Analyzes customer feedback from Zendesk, Gong, and Community to surface top themes',
    schedule: 'Weekly on Monday',
    sources: ['zendesk', 'gong', 'community'],
    estimatedDuration: '3-5 minutes',
    artifactType: 'markdown',
  },
  {
    id: 'sprint-summary',
    name: 'Sprint Summary',
    description: 'Generates end-of-sprint report with completed work, velocity, and blockers',
    schedule: 'End of sprint',
    sources: ['jira', 'confluence'],
    estimatedDuration: '2-4 minutes',
    artifactType: 'markdown',
  },
  {
    id: 'meeting-prep',
    name: 'Meeting Prep',
    description: 'Prepares briefing materials for upcoming meetings with context and talking points',
    schedule: 'Before meetings',
    sources: ['confluence', 'jira', 'slack'],
    estimatedDuration: '1-2 minutes',
    artifactType: 'markdown',
  },
  {
    id: 'competitor-digest',
    name: 'Competitor Digest',
    description: 'Monitors competitor activity and generates weekly competitive intelligence report',
    schedule: 'Weekly on Friday',
    sources: ['competitor', 'community'],
    estimatedDuration: '2-3 minutes',
    artifactType: 'markdown',
  },
  {
    id: 'draft-prd',
    name: 'Draft PRD',
    description: 'Generates initial PRD draft from feature discussions, customer feedback, and specs',
    schedule: 'On demand',
    sources: ['jira', 'confluence', 'slack', 'zendesk'],
    estimatedDuration: '4-6 minutes',
    artifactType: 'markdown',
  },
];

export function generateMockToolCalls(jobId: string) {
  const job = cadenceJobs.find((j) => j.id === jobId);
  if (!job) return [];

  const calls = [];
  let timestamp = new Date();

  for (const source of job.sources) {
    // Add a fetch call for each source
    calls.push({
      id: `${jobId}-${source}-fetch`,
      tool: `fetch_${source}_data`,
      server: source,
      input: { timeRange: 'last_24h', limit: 100 },
      output: { itemCount: Math.floor(Math.random() * 50) + 10, status: 'success' },
      status: 'completed' as const,
      duration: Math.floor(Math.random() * 500) + 200,
      timestamp: new Date(timestamp.getTime()),
    });
    timestamp = new Date(timestamp.getTime() + 1000);
  }

  // Add analysis call
  calls.push({
    id: `${jobId}-analyze`,
    tool: 'analyze_data',
    server: 'core',
    input: { sources: job.sources, analysisType: jobId },
    output: { themes: 5, insights: 12, confidence: 0.87 },
    status: 'completed' as const,
    duration: Math.floor(Math.random() * 1000) + 500,
    timestamp: new Date(timestamp.getTime()),
  });
  timestamp = new Date(timestamp.getTime() + 1000);

  // Add generation call
  calls.push({
    id: `${jobId}-generate`,
    tool: 'generate_artifact',
    server: 'core',
    input: { template: jobId, format: job.artifactType },
    output: { artifactId: `artifact-${jobId}-${Date.now()}`, wordCount: 450 },
    status: 'completed' as const,
    duration: Math.floor(Math.random() * 2000) + 1000,
    timestamp: new Date(timestamp.getTime()),
  });

  return calls;
}

export function generateMockArtifact(jobId: string) {
  const job = cadenceJobs.find((j) => j.id === jobId);
  if (!job) return null;

  const artifacts: Record<string, { name: string; content: string }> = {
    'daily-brief': {
      name: 'Daily Brief - Dec 29, 2025',
      content: `# Daily Brief - December 29, 2025

## 🎯 Key Updates

### Jira Activity
- **12 tickets** moved to Done yesterday
- **3 blockers** identified in Sprint 47
- **PROJ-1234**: Payment integration delayed (needs API review)

### Slack Highlights
- Engineering discussed performance improvements in #dev-backend
- Customer success flagged 2 urgent escalations in #support-escalations
- Product sync scheduled for 2pm today

### Gong Insights
- 4 customer calls recorded yesterday
- Common theme: **Dashboard customization** requested by 3 customers
- Enterprise prospect "TechCorp" showing strong buying signals

## 📊 Metrics Snapshot
| Metric | Yesterday | Trend |
|--------|-----------|-------|
| Open tickets | 47 | ↓ 5% |
| Sprint velocity | 34 pts | → |
| Customer calls | 4 | ↑ 33% |

## 🚨 Action Items
1. Review PROJ-1234 blocker with engineering
2. Prepare for 2pm product sync
3. Follow up on TechCorp opportunity

---
*Generated by pmkit at ${new Date().toLocaleTimeString()}*`,
    },
    'weekly-themes': {
      name: 'Weekly VoC Themes - Week 52',
      content: `# Weekly Voice of Customer Themes
## Week 52, 2025

## 🔍 Top Themes This Week

### 1. Dashboard Customization (Score: 8.7/10)
- **Frequency**: Mentioned in 23 conversations
- **Sentiment**: Neutral to Positive
- **Sources**: Gong (12), Zendesk (8), Community (3)

> "We love the product but really need to customize our dashboard view" - Enterprise Customer

### 2. API Rate Limits (Score: 7.2/10)
- **Frequency**: Mentioned in 15 conversations
- **Sentiment**: Negative
- **Sources**: Zendesk (10), Community (5)

> "Getting rate limited during peak hours is blocking our automation" - Developer User

### 3. Mobile Experience (Score: 6.8/10)
- **Frequency**: Mentioned in 11 conversations
- **Sentiment**: Mixed
- **Sources**: Gong (5), Zendesk (4), Community (2)

## 📈 Trend Analysis
- Dashboard customization requests up 45% from last week
- API concerns consistent with previous weeks
- Mobile mentions increasing steadily

## 💡 Recommendations
1. Prioritize dashboard customization in Q1 roadmap
2. Review API rate limits for enterprise tier
3. Conduct mobile UX research

---
*Generated by pmkit at ${new Date().toLocaleTimeString()}*`,
    },
    'sprint-summary': {
      name: 'Sprint 47 Summary',
      content: `# Sprint 47 Summary
## December 16-29, 2025

## 🎯 Sprint Goals
- ✅ Complete payment integration v2
- ✅ Launch dashboard redesign
- ⚠️ API performance improvements (partial)

## 📊 Velocity
| Metric | This Sprint | Average |
|--------|-------------|---------|
| Story Points | 34 | 32 |
| Tickets Completed | 18 | 16 |
| Bugs Fixed | 7 | 5 |

## ✅ Completed Work
- PROJ-1200: Payment integration v2
- PROJ-1201: Dashboard redesign rollout
- PROJ-1205: User settings page
- PROJ-1210: Export functionality
- +14 more tickets

## ⚠️ Carried Over
- PROJ-1234: API caching layer (blocked on infra)
- PROJ-1240: Performance monitoring setup

## 🐛 Bugs
- 7 bugs fixed, 2 new bugs discovered
- Critical: None
- High: 1 (PROJ-1238: Export timeout)

## 📝 Retrospective Notes
- Dashboard launch went smoothly
- Need better API documentation for integrations
- Consider reducing sprint scope next cycle

---
*Generated by pmkit at ${new Date().toLocaleTimeString()}*`,
    },
    'meeting-prep': {
      name: 'Meeting Prep - Product Sync',
      content: `# Meeting Prep: Product Sync
## December 29, 2025 - 2:00 PM

## 📋 Agenda Items
1. Sprint 47 review
2. Q1 roadmap priorities
3. Customer escalations update

## 🔍 Context & Background

### Sprint 47 Status
- 34 story points completed (above average)
- Dashboard redesign shipped successfully
- 1 blocker: API caching layer

### Customer Escalations
- **TechCorp**: Waiting on enterprise SSO feature
- **DataFlow Inc**: Rate limit concerns (high priority)
- **Acme Labs**: Dashboard customization request

### Relevant Discussions
- #product-planning: Q1 theme discussion (Dec 27)
- #customer-success: TechCorp escalation thread (Dec 28)

## 💬 Talking Points
1. Recommend prioritizing API improvements based on VoC data
2. Propose dashboard customization as Q1 epic
3. Discuss enterprise SSO timeline

## 📎 Related Documents
- [Q1 Roadmap Draft](confluence://roadmap-q1)
- [Customer Feedback Summary](confluence://voc-dec)
- [Sprint 47 Retro](confluence://retro-47)

---
*Generated by pmkit at ${new Date().toLocaleTimeString()}*`,
    },
    'competitor-digest': {
      name: 'Competitor Research - Week 52',
      content: `# Competitor Research Report
## Week 52, 2025

## 🏢 Competitor Updates

### CompetitorA
- **Product**: Launched AI-powered analytics feature
- **Pricing**: No changes
- **Sentiment**: Community reaction mixed
- **Risk Level**: Medium

### CompetitorB
- **Product**: Announced mobile app beta
- **Pricing**: Introduced new enterprise tier
- **Sentiment**: Positive buzz on social media
- **Risk Level**: High

### CompetitorC
- **Product**: No major updates
- **Pricing**: Reduced starter plan price by 20%
- **Sentiment**: Neutral
- **Risk Level**: Low

## 📊 Feature Comparison Update
| Feature | Us | CompA | CompB | CompC |
|---------|-----|-------|-------|-------|
| AI Analytics | ✅ | ✅ | ❌ | ❌ |
| Mobile App | ❌ | ❌ | 🔜 | ✅ |
| Enterprise SSO | 🔜 | ✅ | ✅ | ❌ |
| API Access | ✅ | ✅ | ✅ | ⚠️ |

## 💡 Strategic Recommendations
1. Accelerate mobile app development
2. Highlight AI capabilities in marketing
3. Monitor CompetitorB enterprise pricing

---
*Generated by pmkit at ${new Date().toLocaleTimeString()}*`,
    },
    'draft-prd': {
      name: 'Draft PRD - Dashboard Customization',
      content: `# Product Requirements Document
## Dashboard Customization

**Status**: Draft  
**Author**: pmkit (auto-generated)  
**Date**: December 29, 2025

---

## 1. Overview

### Problem Statement
Users cannot customize their dashboard layout, leading to inefficient workflows and reduced engagement. This has been the #1 requested feature for 3 consecutive months.

### Objective
Enable users to create personalized dashboard views with customizable widgets, layouts, and data sources.

## 2. User Stories

### As a Product Manager
- I want to see my most important metrics at a glance
- I want to arrange widgets based on my workflow
- I want to save multiple dashboard configurations

### As an Engineering Lead
- I want to focus on sprint metrics and blockers
- I want to hide widgets I don't use

## 3. Requirements

### Must Have (P0)
- [ ] Drag-and-drop widget arrangement
- [ ] Widget resize functionality
- [ ] Save/load dashboard configurations
- [ ] Default dashboard templates

### Should Have (P1)
- [ ] Custom widget creation
- [ ] Dashboard sharing between users
- [ ] Role-based default dashboards

### Nice to Have (P2)
- [ ] Dashboard scheduling
- [ ] Export dashboard as PDF
- [ ] Dashboard analytics

## 4. Technical Considerations
- Use existing grid layout library
- Store configurations in user preferences
- Consider performance with many widgets

## 5. Success Metrics
- Dashboard engagement +30%
- Time to first action -20%
- Feature adoption >60% in 30 days

## 6. Open Questions
1. Should dashboards sync across devices?
2. Maximum number of widgets per dashboard?
3. Widget refresh rate requirements?

---
*This is an AI-generated draft. Please review and refine before sharing.*

*Generated by pmkit at ${new Date().toLocaleTimeString()}*`,
    },
  };

  const artifact = artifacts[jobId];
  if (!artifact) return null;

  return {
    id: `artifact-${jobId}-${Date.now()}`,
    name: artifact.name,
    type: 'markdown' as const,
    content: artifact.content,
    sources: job?.sources || [],
    createdAt: new Date(),
  };
}

export function generateMockAuditEntries(jobId: string) {
  const job = cadenceJobs.find((j) => j.id === jobId);
  if (!job) return [];

  const entries = [];
  let timestamp = new Date();

  // Job start
  entries.push({
    id: `audit-${jobId}-start`,
    timestamp: new Date(timestamp.getTime()),
    action: 'job.start',
    actor: { id: demoUser.id, name: demoUser.name, role: demoUser.role },
    resource: { type: 'job', id: jobId, name: job.name },
    details: { trigger: 'manual', sources: job.sources },
    result: 'allowed' as const,
  });
  timestamp = new Date(timestamp.getTime() + 100);

  // Permission checks
  for (const source of job.sources) {
    entries.push({
      id: `audit-${jobId}-perm-${source}`,
      timestamp: new Date(timestamp.getTime()),
      action: 'permission.check',
      actor: { id: demoUser.id, name: demoUser.name, role: demoUser.role },
      resource: { type: 'integration', id: source, name: source },
      details: { permission: 'read', scope: 'tenant' },
      result: 'allowed' as const,
    });
    timestamp = new Date(timestamp.getTime() + 50);
  }

  // Tool calls
  for (const source of job.sources) {
    entries.push({
      id: `audit-${jobId}-tool-${source}`,
      timestamp: new Date(timestamp.getTime()),
      action: 'tool.call',
      actor: { id: 'system', name: 'pmkit Agent', role: 'agent' },
      resource: { type: 'tool', id: `fetch_${source}_data`, name: `${source}.fetch` },
      details: { server: source, duration: Math.floor(Math.random() * 500) + 200 },
      result: 'allowed' as const,
    });
    timestamp = new Date(timestamp.getTime() + 1000);
  }

  // Artifact creation
  entries.push({
    id: `audit-${jobId}-artifact`,
    timestamp: new Date(timestamp.getTime()),
    action: 'artifact.create',
    actor: { id: 'system', name: 'pmkit Agent', role: 'agent' },
    resource: { type: 'artifact', id: `artifact-${jobId}`, name: job.name },
    details: { format: job.artifactType, sources: job.sources.length },
    result: 'allowed' as const,
  });
  timestamp = new Date(timestamp.getTime() + 100);

  // Job complete
  entries.push({
    id: `audit-${jobId}-complete`,
    timestamp: new Date(timestamp.getTime()),
    action: 'job.complete',
    actor: { id: 'system', name: 'pmkit Agent', role: 'agent' },
    resource: { type: 'job', id: jobId, name: job.name },
    details: { duration: Math.floor(Math.random() * 3000) + 2000, success: true },
    result: 'allowed' as const,
  });

  return entries;
}

