'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Users,
  BarChart3,
  Target,
  GitBranch,
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  ArrowLeft,
  User,
  Activity,
  Loader2,
  MessageSquare,
  Phone,
  HelpCircle,
  Database,
  Plug,
  Info,
  Globe,
  Newspaper,
  Hash,
  Wand2,
  Layers,
  Megaphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type JobType =
  | 'daily_brief'
  | 'meeting_prep'
  | 'voc_clustering'
  | 'competitor_research'
  | 'roadmap_alignment'
  | 'prd_draft'
  | 'sprint_review'
  | 'prototype_generation'
  | 'release_notes';

type JobStatus = 'idle' | 'running' | 'completed' | 'error';

type ConnectorStatus = 'not_connected' | 'connected_demo' | 'connected_real';

interface Connector {
  id: string;
  name: string;
  icon: typeof FileText;
  status: ConnectorStatus;
  type: 'mcp' | 'crawler';
  description?: string;
}

const connectors: Connector[] = [
  // Tool Integrations (MCP Connectors)
  { id: 'jira', name: 'Jira', icon: FileText, status: 'connected_demo', type: 'mcp' },
  { id: 'confluence', name: 'Confluence', icon: Database, status: 'connected_demo', type: 'mcp' },
  { id: 'slack', name: 'Slack', icon: MessageSquare, status: 'connected_demo', type: 'mcp' },
  { id: 'gong', name: 'Gong', icon: Phone, status: 'connected_demo', type: 'mcp' },
  { id: 'zendesk', name: 'Zendesk', icon: HelpCircle, status: 'connected_demo', type: 'mcp' },
  { id: 'amplitude', name: 'Amplitude', icon: BarChart3, status: 'connected_demo', type: 'mcp' },
  { id: 'discourse', name: 'Discourse', icon: Users, status: 'connected_demo', type: 'mcp' },
  { id: 'pmkit', name: 'pmkit Artifacts', icon: Layers, status: 'connected_demo', type: 'mcp', description: 'PRDs, briefs, reports from previous jobs' },
  // AI Crawlers
  { id: 'social_crawler', name: 'Social Crawler', icon: Hash, status: 'connected_demo', type: 'crawler', description: 'X, Reddit, LinkedIn, Discord, Bluesky, Threads' },
  { id: 'web_search', name: 'Web Search', icon: Globe, status: 'connected_demo', type: 'crawler', description: 'Google & Bing' },
  { id: 'news_crawler', name: 'News Crawler', icon: Newspaper, status: 'connected_demo', type: 'crawler', description: 'Industry news & press releases' },
];

function ConnectorStatusBadge({ status }: { status: ConnectorStatus }) {
  if (status === 'connected_demo') {
    return (
      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
        Demo
      </Badge>
    );
  }
  if (status === 'connected_real') {
    return (
      <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
        Connected
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      Not Connected
    </Badge>
  );
}

interface ToolCall {
  id: string;
  name: string;
  server: string;
  status: 'pending' | 'success' | 'error';
  durationMs?: number;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
}

interface JobRun {
  id: string;
  type: JobType;
  status: JobStatus;
  startedAt?: Date;
  completedAt?: Date;
  toolCalls: ToolCall[];
  artifact?: {
    title: string;
    content: string;
    format: string;
  };
  error?: string;
  // LLM metadata
  llmMetadata?: {
    model: string;
    usage: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
    };
    latencyMs: number;
    estimatedCostUsd: number;
    isStub: boolean;
  };
}

const jobConfigs: Record<
  JobType,
  {
    name: string;
    description: string;
    icon: typeof FileText;
    toolCalls: Omit<ToolCall, 'id' | 'status' | 'durationMs'>[];
    sources: string[];
  }
> = {
  daily_brief: {
    name: 'Daily Brief',
    description: 'Synthesize overnight activity',
    icon: FileText,
    sources: ['slack', 'jira', 'zendesk', 'discourse'],
    toolCalls: [
      { name: 'get_channel_messages', server: 'slack', input: { channelId: 'C001', limit: 50 } },
      { name: 'get_sprint_issues', server: 'jira', input: { sprintId: 'sprint-42' } },
      { name: 'get_tickets', server: 'zendesk', input: { status: 'open', limit: 25 } },
      { name: 'get_posts', server: 'discourse', input: { limit: 20 } },
    ],
  },
  meeting_prep: {
    name: 'Meeting Prep',
    description: 'Prepare for customer meeting',
    icon: Users,
    sources: ['gong', 'zendesk'],
    toolCalls: [
      { name: 'get_calls', server: 'gong', input: { accountName: 'Globex Corp', limit: 5 } },
      { name: 'get_insights', server: 'gong', input: { type: 'pain_point' } },
      { name: 'get_tickets', server: 'zendesk', input: { tags: ['enterprise'], limit: 10 } },
    ],
  },
  voc_clustering: {
    name: 'VoC Clustering',
    description: 'Cluster customer feedback into themes',
    icon: BarChart3,
    sources: ['zendesk', 'gong', 'discourse', 'social_crawler'],
    toolCalls: [
      { name: 'get_tickets', server: 'zendesk', input: { limit: 50 } },
      { name: 'get_insights', server: 'gong', input: { limit: 50 } },
      { name: 'get_feature_requests', server: 'discourse', input: { status: 'open', limit: 25 } },
      { name: 'get_posts', server: 'discourse', input: { limit: 30 } },
      { name: 'search_mentions', server: 'social_crawler', input: { channels: ['x', 'reddit', 'linkedin'], limit: 50 } },
    ],
  },
  competitor_research: {
    name: 'Competitor Research',
    description: 'Track competitor product changes',
    icon: Target,
    sources: ['social_crawler', 'web_search', 'news_crawler'],
    toolCalls: [
      { name: 'search_mentions', server: 'social_crawler', input: { query: 'competitor:notion OR competitor:coda', channels: ['x', 'reddit', 'linkedin', 'discord'], limit: 50 } },
      { name: 'search_web', server: 'web_search', input: { query: 'notion pricing OR coda features', engines: ['google', 'bing'], limit: 20 } },
      { name: 'search_news', server: 'news_crawler', input: { query: 'notion coda monday.com', limit: 25 } },
    ],
  },
  roadmap_alignment: {
    name: 'Roadmap Alignment',
    description: 'Generate alignment memo',
    icon: GitBranch,
    sources: ['jira', 'amplitude', 'discourse', 'news_crawler'],
    toolCalls: [
      { name: 'get_epics', server: 'jira', input: { projectKey: 'ACME' } },
      { name: 'get_feature_usage', server: 'amplitude', input: { period: 'week' } },
      { name: 'get_top_feature_requests', server: 'discourse', input: { limit: 10 } },
      { name: 'search_news', server: 'news_crawler', input: { query: 'competitor announcements', limit: 10 } },
    ],
  },
  prd_draft: {
    name: 'PRD Draft',
    description: 'Draft PRD with evidence',
    icon: FileText,
    sources: ['discourse', 'gong', 'amplitude', 'confluence'],
    toolCalls: [
      { name: 'get_top_feature_requests', server: 'discourse', input: { limit: 10 } },
      { name: 'get_pain_points', server: 'gong', input: { limit: 20 } },
      { name: 'get_no_results_queries', server: 'amplitude', input: { minCount: 10 } },
      { name: 'search_pages', server: 'confluence', input: { query: 'search', spaceKey: 'PROD' } },
    ],
  },
  sprint_review: {
    name: 'Sprint Review',
    description: 'Generate sprint review pack',
    icon: CheckCircle2,
    sources: ['jira', 'confluence', 'slack', 'amplitude'],
    toolCalls: [
      { name: 'get_sprint_issues', server: 'jira', input: { sprintId: 'sprint-42', includeChangelog: true } },
      { name: 'get_sprint_goal', server: 'jira', input: { sprintId: 'sprint-42' } },
      { name: 'search_pages', server: 'confluence', input: { query: 'sprint-42 release notes', spaceKey: 'PROD' } },
      { name: 'get_channel_messages', server: 'slack', input: { channelId: 'C-product-updates', limit: 50 } },
      { name: 'get_feature_usage', server: 'amplitude', input: { features: ['search_filters', 'bulk_export'], period: 'sprint' } },
    ],
  },
  prototype_generation: {
    name: 'Prototype Generation',
    description: 'Generate UI prototype from PRD',
    icon: Wand2,
    sources: ['pmkit', 'confluence', 'jira'],
    toolCalls: [
      { name: 'get_prd_artifact', server: 'pmkit', input: { artifactId: 'artifact-prd-001' } },
      { name: 'extract_user_stories', server: 'pmkit', input: { prdId: 'artifact-prd-001' } },
      { name: 'get_design_system', server: 'confluence', input: { spaceKey: 'DESIGN' } },
      { name: 'generate_ui_code', server: 'openai', input: { framework: 'react', styling: 'tailwind' } },
    ],
  },
  release_notes: {
    name: 'Release Notes',
    description: 'Generate customer-facing release notes',
    icon: Megaphone,
    sources: ['jira', 'confluence', 'pmkit'],
    toolCalls: [
      { name: 'get_release_issues', server: 'jira', input: { fixVersion: 'v2.4.0', status: 'Done' } },
      { name: 'get_epic_summaries', server: 'jira', input: { fixVersion: 'v2.4.0' } },
      { name: 'get_release_template', server: 'confluence', input: { spaceKey: 'PROD', title: 'Release Notes Template' } },
      { name: 'get_recent_artifacts', server: 'pmkit', input: { type: 'prd', limit: 5 } },
    ],
  },
};

// Simulated artifact content - kept for reference but not used (errors are surfaced instead of fallback)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const artifactContent: Record<JobType, { title: string; content: string }> = {
  daily_brief: {
    title: 'Daily Brief - Dec 29, 2025',
    content: `# Daily Brief - December 29, 2025

## TL;DR
Search improvements are progressing well (70% complete), but we have a critical bug (ACME-350) affecting special characters in search. One enterprise escalation from Globex Corp regarding dashboard loading. Discourse community sentiment around search is improving with the announcement of upcoming filters.

## 🚨 Urgent Items

### Critical Bug: Search Crashes on Special Characters
- **Ticket**: ACME-350 (P1)
- **Status**: Fix in review
- **Impact**: All users attempting searches with special characters
- **ETA**: Fix deploying today

### Enterprise Escalation: Globex Corp
- **Issue**: Dashboard widgets not loading for 12 users
- **Status**: Root cause identified (Redis connection pool)
- **Action**: Temporary fix deployed, permanent fix in progress

## 📊 Sprint Progress (Sprint 42)

| Story | Status | Points |
|-------|--------|--------|
| ACME-342: Search filters | In Progress (70%) | 5 |
| ACME-343: Search ranking | In Review | 8 |
| ACME-344: No results UX | To Do | 3 |

**Velocity**: On track to complete 16/19 points

## 📣 Customer Signal

### Top Themes This Week
1. **Search frustration** (35% of mentions) - "I spend more time searching than working"
2. **Onboarding complexity** (22%) - 2-week ramp time reported
3. **Integration gaps** (18%) - Slack sync issues

### Notable Feedback
> "We're ready to expand from 50 to 200 seats once search is fixed" - Globex Corp

## ✅ Recommended Actions

1. **Review ACME-350 fix** - Critical bug affecting search
2. **Follow up with Globex Corp** - Confirm dashboard issue resolved
3. **Prep for search filters launch** - Comms and docs ready for next week

---
*Generated by pmkit • 4 tool calls • 4 sources*`,
  },
  meeting_prep: {
    title: 'Meeting Prep - Globex Corp',
    content: `# Meeting Prep Pack

**Account**: Globex Corp
**Date**: December 29, 2025
**Prepared for**: Demo User

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
   - Shared roadmap for improvements

2. **Dec 15 - Support Escalation**
   - Dashboard loading issues
   - Resolved within 4 hours

3. **Nov 28 - Feature Request**
   - Date filters for search
   - Added to Q4 roadmap

## Key Insights from Calls

### Pain Points
- "Search is our biggest pain point" - John Smith
- "Team spends 20-30 min/day searching" - Emily Davis

### Opportunities
- Ready to 4x seat count if search improves
- Interested in API for internal tools

## Talking Points

1. **Search Update**: Share progress on filters (shipping next week)
2. **Dashboard Follow-up**: Confirm issues resolved
3. **Expansion Discussion**: Timeline for 200 seats?
4. **API Interest**: Explore integration needs

## Risks & Opportunities

### Risks
- ⚠️ Expansion blocked until search ships
- ⚠️ Competitor (Notion) mentioned in last call

### Opportunities
- 🎯 4x expansion potential ($192K ARR)
- 🎯 API integration could drive stickiness

---
*Generated by pmkit • 3 tool calls • 2 sources*`,
  },
  voc_clustering: {
    title: 'VoC Report - Q4 2025',
    content: `# Voice of Customer Report

**Period**: Last 30 days
**Generated**: December 29, 2025
**Data Sources**: Zendesk (47), Gong (32 calls), Discourse (45), Social Crawler (128 mentions)

## Executive Summary

| Theme | Mentions | Trend | Impact |
|-------|----------|-------|--------|
| Search Frustration | 52 | ↑ 15% | Critical |
| Onboarding Complexity | 33 | → Stable | High |
| Integration Gaps | 27 | ↓ 8% | Medium |
| Performance Issues | 22 | ↑ 25% | High |

## Theme Analysis

### 1. Search Frustration (35% of mentions)

**Description**: Users struggle to find content, report poor relevance, and lack filtering options.

**Representative Quotes**:
> "I spend more time searching than working" - Globex Corp
> "Search never finds what I'm looking for" - Discourse
> "We've created workarounds using tags but it's not sustainable" - Initech

**Product Implications**:
- Search improvements are critical for retention
- Filters are table-stakes expectation
- Enterprise expansion blocked

### 2. Onboarding Complexity (22% of mentions)

**Description**: New users take 2-3 weeks to become productive.

**Representative Quotes**:
> "It took our team 3 weeks to get productive" - Gong call
> "The learning curve is steep" - NPS verbatim

## Recommendations

1. **Ship search improvements** (In Progress)
2. **Redesign onboarding flow** - High impact, medium effort
3. **Rebuild Slack integration** - Address reliability concerns

---
*Generated by pmkit • 5 tool calls • 4 sources (Zendesk, Gong, Discourse, Social Crawler)*`,
  },
  competitor_research: {
    title: 'Competitor Research Report',
    content: `# Competitor Research Report

**Period**: Last 14 days
**Generated**: December 29, 2025
**Data Sources**: Social Crawler (X, Reddit, LinkedIn, Discord), Web Search (Google, Bing), News Crawler

## Key Changes Summary

| Competitor | Change | Source | Significance |
|------------|--------|--------|--------------|
| Notion | AI-powered search launch | News, X | 🔴 High |
| Coda | 20% enterprise price cut | Web Search | 🔴 High |
| Monday.com | Native Slack integration | LinkedIn | 🟡 Medium |

## Social Signal Analysis

### X/Twitter Mentions (Last 14 days)
- **Notion**: 847 mentions (+23% vs prior period)
- **Coda**: 312 mentions (-5%)
- **Monday.com**: 523 mentions (+8%)

### Reddit Discussions
- r/ProductManagement: 12 threads mentioning Notion AI search
- r/SaaS: 8 threads on Coda pricing changes

### LinkedIn Activity
- Notion CEO post on AI search: 2.4K reactions
- Monday.com Slack announcement: 890 reactions

## Detailed Analysis

### Notion - AI-Powered Search

**What Changed**: Launched semantic search using AI embeddings.

**Why It Matters**: 
- Directly addresses our top customer pain point
- Sets new bar for search expectations
- First-mover advantage in AI search

**Our Position**:
- ❌ We don't have AI search
- ✅ We're shipping filters (addresses different need)
- ⚠️ Gap will be visible to customers

### Coda - 20% Enterprise Price Reduction

**What Changed**: Enterprise plans now $20/user/month (down from $25)

**Why It Matters**:
- Makes them more competitive for enterprise deals
- Could pressure our pricing in negotiations

## Feature Gap Analysis

| Feature | Us | Notion | Coda | Monday |
|---------|-----|--------|------|--------|
| AI Search | ❌ | ✅ | ❌ | ❌ |
| Search Filters | 🔜 | ✅ | ✅ | ✅ |
| SAML SSO | 🔜 | ✅ | ✅ | ✅ |

## Recommended Actions

1. **Prioritize search improvements** - Close the gap
2. **Evaluate AI search** - Begin discovery for Q1
3. **Monitor Coda pricing impact** - Track win/loss against Coda

---
*Generated by pmkit • 3 tool calls • 3 sources (Social Crawler, Web Search, News Crawler)*`,
  },
  roadmap_alignment: {
    title: 'Roadmap Alignment Memo',
    content: `# Roadmap Alignment Memo

**Decision Required**: Q1 2026 Priority - Search AI vs. Enterprise SSO
**Date**: December 29, 2025

## Decision Required

We need to decide the primary focus for Q1 2026 engineering capacity. Both Search AI and Enterprise SSO have strong cases.

## Options

### Option A: Search AI First

**Pros**:
- Addresses #1 customer pain point
- Competitive response to Notion
- Benefits all customers

**Cons**:
- Enterprise deals remain blocked
- Longer time to revenue impact

**Evidence**: 52 VoC mentions, 89-vote Discourse request, 34 X/Reddit mentions

### Option B: Enterprise SSO First

**Pros**:
- Unblocks $450K in enterprise deals
- Shorter time to revenue

**Cons**:
- Search pain continues
- Competitive gap widens

**Evidence**: 3 deals worth $450K blocked

## Recommendation

**Option B: Enterprise SSO First**, with Search AI immediately following.

**Reasoning**:
1. SSO has clear, immediate revenue impact ($450K)
2. SSO is faster (8 weeks vs 10)
3. Search improvements (filters) shipping now address acute pain

## Open Questions

1. Can we get verbal commitment from blocked deals?
2. What's the minimum viable AI search scope?

---
*Generated by pmkit • 4 tool calls • 4 sources*`,
  },
  prd_draft: {
    title: 'PRD Draft - Search Filters',
    content: `# PRD: Search Filters

**Author**: Demo User
**Date**: December 29, 2025
**Status**: Draft
**Epic**: ACME-100

## 1. Overview

### Problem Statement

Users cannot efficiently find content because search results lack filtering capabilities.

### Goals

| Goal | Metric | Target |
|------|--------|--------|
| Reduce time to find content | Avg. search-to-click time | -30% |
| Improve search satisfaction | User survey score | 3.2 → 4.0+ |

## 2. Customer Evidence

| Source | Count | Key Quote |
|--------|-------|-----------|
| Support tickets | 47 | "I spend more time searching than working" |
| Gong calls | 12 | "Date filters would be huge" |
| Discourse | 89 votes | "Filter by content type please" |

## 3. Solution

### User Stories

1. **As a PM**, I want to filter search by date range
2. **As a PM**, I want to filter by content type
3. **As a PM**, I want to combine multiple filters

## 4. Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| F1 | Date range filter with presets | P0 |
| F2 | Content type filter | P0 |
| F3 | Filter combination (AND logic) | P0 |

## 5. Open Questions

1. Should we index comments?
2. How to handle permission-filtered results in counts?

---
*Generated by pmkit • 4 tool calls • 4 sources*`,
  },
  sprint_review: {
    title: 'Sprint Review Pack - Sprint 42',
    content: `# Sprint Review Pack

**Sprint**: Sprint 42 (Dec 16 - Dec 29, 2025)
**Goal**: Ship search filters and improve performance
**Generated**: December 29, 2025
**Data Sources**: Jira (23 issues), Confluence (4 pages), Slack (127 messages), Amplitude (usage data)

## Executive Summary

Sprint 42 achieved **84% completion** (16/19 story points). Search filters shipped successfully with positive early adoption. One P1 bug (ACME-350) required hotfix mid-sprint.

## What Shipped ✅

| Issue | Title | Points | Status |
|-------|-------|--------|--------|
| ACME-342 | Search date filters | 5 | ✅ Shipped |
| ACME-343 | Search ranking improvements | 8 | ✅ Shipped |
| ACME-346 | Filter UI polish | 2 | ✅ Shipped |
| ACME-347 | Filter analytics events | 1 | ✅ Shipped |

### Highlights
- **Search filters live**: Date range, content type, and combined filters now available
- **Performance**: Search latency reduced by 23% (p95: 450ms → 347ms)
- **Adoption**: 34% of searches now use filters (first 48 hours)

## What Didn't Ship ❌

| Issue | Title | Points | Reason |
|-------|-------|--------|--------|
| ACME-344 | No results UX redesign | 3 | Deprioritized for P1 bug |

### Why It Slipped
- ACME-350 (P1 search crash) required emergency fix
- 2 days of sprint capacity redirected to hotfix + testing

## Surprises & Escalations

### 🔴 P1 Bug: Search Crashes on Special Characters (ACME-350)
- **Discovered**: Dec 22
- **Root cause**: Regex injection in search parser
- **Resolution**: Hotfix deployed Dec 23, full fix in ACME-351
- **Impact**: ~200 users affected over 4 hours

### 🟡 Enterprise Escalation: Globex Corp
- **Issue**: Dashboard loading slow for 12 users
- **Status**: Temporary fix deployed, permanent fix scheduled for Sprint 43
- **Risk**: Expansion decision pending resolution

## Early Metrics

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Search filter usage | 0% | 34% | +34% |
| Search-to-click time | 8.2s | 5.1s | -38% |
| Search satisfaction (survey) | 3.2 | - | Pending |

## Demos

1. **Search Filters** - [Loom recording](https://loom.com/share/demo)
2. **Performance Dashboard** - [Amplitude dashboard](https://amplitude.com/demo)

## Follow-ups for Sprint 43

1. **ACME-344**: No results UX (carried over)
2. **ACME-351**: Complete search parser hardening
3. **ACME-352**: Globex dashboard performance fix
4. **ACME-353**: Search filter presets (new)

---

## 📤 Proposed Actions

### Draft Confluence Page Update
**Page**: Sprint 42 Release Notes
**Status**: Ready for review

### Draft Slack Post
**Channel**: #product-updates

🚀 Sprint 42 shipped!

✅ Search filters are live - filter by date, content type, or combine them
✅ Search is 23% faster (p95 latency down to 347ms)
✅ 34% of searches already using filters

📖 Full release notes: [link]
🎥 Demo: [link]

Thanks to @eng-team for the great sprint! 🙌

**Status**: Draft - awaiting approval

---
*Generated by pmkit • 5 tool calls • 4 sources (Jira, Confluence, Slack, Amplitude)*`,
  },
  prototype_generation: {
    title: 'UI Prototype - Search Filters',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Search Filters Prototype</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #1e293b; line-height: 1.5; }
    .container { max-width: 900px; margin: 0 auto; padding: 24px; }
    .header { background: white; border-bottom: 1px solid #e2e8f0; padding: 16px 24px; margin-bottom: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header h1 { font-size: 24px; font-weight: 600; color: #1e293b; }
    .header p { color: #64748b; font-size: 14px; margin-top: 4px; }
    .search-box { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
    .search-input-container { padding: 16px; border-bottom: 1px solid #e2e8f0; }
    .search-input { width: 100%; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 16px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
    .search-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
    .filters-bar { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; flex-wrap: wrap; }
    .filter-label { font-size: 14px; color: #64748b; font-weight: 500; }
    .filter-select { padding: 8px 32px 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; background: white; cursor: pointer; outline: none; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 8px center; transition: border-color 0.2s; }
    .filter-select:hover { border-color: #cbd5e1; }
    .filter-select:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
    .clear-btn { padding: 8px 12px; border: none; background: transparent; color: #64748b; font-size: 14px; cursor: pointer; border-radius: 6px; display: flex; align-items: center; gap: 4px; transition: background 0.2s, color 0.2s; }
    .clear-btn:hover { background: #f1f5f9; color: #475569; }
    .clear-btn.hidden { display: none; }
    .results-header { padding: 12px 16px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0; }
    .active-filters { display: inline-flex; gap: 8px; margin-left: 8px; }
    .filter-tag { background: #eef2ff; color: #4f46e5; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
    .results-list { list-style: none; }
    .result-item { display: flex; gap: 12px; padding: 16px; border-bottom: 1px solid #e2e8f0; cursor: pointer; transition: background 0.2s; }
    .result-item:hover { background: #f8fafc; }
    .result-item:last-child { border-bottom: none; }
    .result-icon { width: 40px; height: 40px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .result-icon svg { width: 20px; height: 20px; color: #64748b; }
    .result-content { flex: 1; min-width: 0; }
    .result-title { font-weight: 500; color: #1e293b; margin-bottom: 4px; }
    .result-excerpt { font-size: 14px; color: #64748b; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .result-meta { display: flex; gap: 12px; margin-top: 8px; font-size: 12px; color: #94a3b8; }
    .no-results { padding: 48px 16px; text-align: center; color: #64748b; }
    .badge { display: inline-block; padding: 2px 8px; background: #dbeafe; color: #1d4ed8; border-radius: 4px; font-size: 11px; font-weight: 500; text-transform: uppercase; }
    .badge.documents { background: #dbeafe; color: #1d4ed8; }
    .badge.projects { background: #dcfce7; color: #15803d; }
    .badge.comments { background: #fef3c7; color: #b45309; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Search Filters Prototype</h1>
      <p>Interactive prototype generated from PRD • Filter by date and content type</p>
    </div>
    <div class="search-box">
      <div class="search-input-container">
        <input type="text" class="search-input" placeholder="Search documents, projects, comments..." id="searchInput">
      </div>
      <div class="filters-bar">
        <span class="filter-label">Filters:</span>
        <select class="filter-select" id="dateFilter">
          <option value="all">All time</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
        <select class="filter-select" id="typeFilter">
          <option value="all">All types</option>
          <option value="documents">Documents</option>
          <option value="projects">Projects</option>
          <option value="comments">Comments</option>
        </select>
        <button class="clear-btn hidden" id="clearBtn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          Clear filters
        </button>
      </div>
      <div class="results-header" id="resultsHeader">
        <span id="resultsCount">8 results</span>
        <span class="active-filters" id="activeFilters"></span>
      </div>
      <ul class="results-list" id="resultsList"></ul>
    </div>
  </div>
  <script>
    const mockData = [
      { id: 1, type: 'documents', title: 'Q4 Product Roadmap', excerpt: 'Strategic roadmap for Q4 2025 including search improvements, enterprise features, and AI initiatives.', date: '2 days ago', author: 'Sarah Chen' },
      { id: 2, type: 'projects', title: 'Search Improvements Epic', excerpt: 'Epic tracking all search-related improvements including filters, ranking, and performance.', date: '3 days ago', author: 'Alex Kim' },
      { id: 3, type: 'comments', title: 'Comment on PRD: Search Filters', excerpt: 'Great progress on the filters! One suggestion: can we add a custom date range option?', date: '5 days ago', author: 'Mike Johnson' },
      { id: 4, type: 'documents', title: 'Search Architecture Doc', excerpt: 'Technical documentation for the search infrastructure including Elasticsearch configuration.', date: '1 week ago', author: 'Dev Team' },
      { id: 5, type: 'documents', title: 'Customer Feedback Summary', excerpt: 'Summary of customer feedback from Q3 including top feature requests and pain points.', date: '2 weeks ago', author: 'CS Team' },
      { id: 6, type: 'projects', title: 'Enterprise SSO Implementation', excerpt: 'Project tracking SAML SSO implementation for enterprise customers.', date: '3 weeks ago', author: 'Security Team' },
      { id: 7, type: 'comments', title: 'Comment on Sprint Review', excerpt: 'Sprint 42 was our best sprint yet! Great work on shipping the search filters.', date: '1 month ago', author: 'Emily Davis' },
      { id: 8, type: 'documents', title: 'Competitor Analysis Report', excerpt: 'Analysis of competitor features, pricing, and recent product announcements.', date: '2 months ago', author: 'Product Team' },
    ];
    const dateFilter = document.getElementById('dateFilter');
    const typeFilter = document.getElementById('typeFilter');
    const clearBtn = document.getElementById('clearBtn');
    const resultsList = document.getElementById('resultsList');
    const resultsCount = document.getElementById('resultsCount');
    const activeFilters = document.getElementById('activeFilters');
    const searchInput = document.getElementById('searchInput');
    function getIcon(type) {
      const icons = {
        documents: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>',
        projects: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
        comments: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
      };
      return icons[type] || icons.documents;
    }
    function filterResults() {
      const dateValue = dateFilter.value;
      const typeValue = typeFilter.value;
      const searchValue = searchInput.value.toLowerCase();
      let filtered = mockData;
      if (typeValue !== 'all') filtered = filtered.filter(item => item.type === typeValue);
      if (searchValue) filtered = filtered.filter(item => item.title.toLowerCase().includes(searchValue) || item.excerpt.toLowerCase().includes(searchValue));
      clearBtn.classList.toggle('hidden', dateValue === 'all' && typeValue === 'all');
      let filterTags = '';
      if (dateValue !== 'all') filterTags += '<span class="filter-tag">' + dateFilter.options[dateFilter.selectedIndex].text + '</span>';
      if (typeValue !== 'all') filterTags += '<span class="filter-tag">' + typeValue + '</span>';
      activeFilters.innerHTML = filterTags;
      resultsCount.textContent = filtered.length + ' result' + (filtered.length !== 1 ? 's' : '');
      if (filtered.length === 0) {
        resultsList.innerHTML = '<li class="no-results">No results found. Try adjusting your filters.</li>';
      } else {
        resultsList.innerHTML = filtered.map(item => '<li class="result-item"><div class="result-icon">' + getIcon(item.type) + '</div><div class="result-content"><div class="result-title">' + item.title + '</div><div class="result-excerpt">' + item.excerpt + '</div><div class="result-meta"><span class="badge ' + item.type + '">' + item.type + '</span><span>' + item.date + '</span><span>' + item.author + '</span></div></div></li>').join('');
      }
    }
    function clearFilters() { dateFilter.value = 'all'; typeFilter.value = 'all'; filterResults(); }
    dateFilter.addEventListener('change', filterResults);
    typeFilter.addEventListener('change', filterResults);
    clearBtn.addEventListener('click', clearFilters);
    searchInput.addEventListener('input', filterResults);
    filterResults();
  </script>
</body>
</html>`,
  },
  release_notes: {
    title: 'Release Notes - v2.4.0',
    content: `# Acme Platform Release Notes - v2.4.0

**Release Date**: January 10, 2026
**Version**: v2.4.0

---

## 🎉 Highlights

This release brings powerful new search capabilities, performance improvements, and important bug fixes to make your experience smoother and more productive.

### Search Filters Are Here!
You can now filter search results by date range and content type, making it faster than ever to find exactly what you're looking for. No more scrolling through pages of results.

### 23% Faster Search
We've optimized our search infrastructure to deliver results faster. P95 latency is now under 350ms.

---

## ✨ New Features

### Search Filters
Filter your search results to find content faster:
- **Date range filters**: All time, Last 7 days, Last 30 days, Last 90 days, or custom range
- **Content type filters**: Documents, Projects, Comments
- **Combined filters**: Use multiple filters together for precise results

*This addresses feedback from 89 customers who requested better search capabilities.*

### Bulk Export
Export multiple items at once in CSV or JSON format. Perfect for reporting and data analysis.

---

## 🔧 Improvements

### Dashboard Performance
- Dashboard widgets now load 40% faster for large accounts
- Reduced memory usage when viewing complex dashboards

### Search Ranking
- Improved relevance scoring for search results
- Recent content now ranks higher by default
- Better handling of partial matches

### Accessibility
- Improved keyboard navigation throughout the app
- Better screen reader support for search results

---

## 🐛 Bug Fixes

- **Fixed**: Search no longer crashes when using special characters (ACME-350)
- **Fixed**: Dashboard widgets now load correctly for all users (ACME-348)
- **Fixed**: Export button now works on Safari (ACME-345)
- **Fixed**: Notification preferences now save correctly (ACME-341)

---

## ⚠️ Breaking Changes

None in this release.

---

## 🔮 Coming Soon

- **AI-powered search**: Semantic search that understands what you mean, not just what you type
- **Saved searches**: Save your favorite filter combinations for quick access
- **Search analytics**: See what your team is searching for

---

## Questions?

- 📖 [Full documentation](https://docs.example.com)
- 💬 [Contact support](mailto:support@example.com)
- 🐦 [Follow us for updates](https://twitter.com/example)

---
*Generated by pmkit • 4 tool calls • 3 sources (Jira, Confluence, pmkit)*`,
  },
};

export default function ConsolePage() {
  const [selectedJob, setSelectedJob] = useState<JobType | null>(null);
  const [jobRuns, setJobRuns] = useState<Record<JobType, JobRun | null>>({
    daily_brief: null,
    meeting_prep: null,
    voc_clustering: null,
    competitor_research: null,
    roadmap_alignment: null,
    prd_draft: null,
    sprint_review: null,
    prototype_generation: null,
    release_notes: null,
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'artifact' | 'connectors'>(
    'overview'
  );

  // Get the current run for the selected job
  const currentRun = selectedJob ? jobRuns[selectedJob] : null;

  const runJob = async (jobType: JobType) => {
    const config = jobConfigs[jobType];
    const runId = `run-${Date.now()}`;

    // Initialize run
    const run: JobRun = {
      id: runId,
      type: jobType,
      status: 'running',
      startedAt: new Date(),
      toolCalls: config.toolCalls.map((tc, i) => ({
        ...tc,
        id: `tc-${i}`,
        status: 'pending' as const,
      })),
    };

    setJobRuns((prev) => ({ ...prev, [jobType]: run }));
    setActiveTab('timeline');

    // Simulate tool calls (gathering data from mock connectors)
    for (let i = 0; i < run.toolCalls.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 300));

      setJobRuns((prev) => {
        const currentJobRun = prev[jobType];
        if (!currentJobRun) return prev;
        const toolCalls = [...currentJobRun.toolCalls];
        toolCalls[i] = {
          ...toolCalls[i],
          status: 'success',
          durationMs: Math.floor(100 + Math.random() * 200),
          output: { success: true, count: Math.floor(Math.random() * 50) },
        };
        return { ...prev, [jobType]: { ...currentJobRun, toolCalls } };
      });
    }

    // Call the real LLM API to generate the artifact
    try {
      const response = await fetch('/api/demo/run-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobType }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limit or other errors
        const errorMessage = data.isRateLimited 
          ? data.message 
          : data.message || 'Failed to generate artifact';
        
        setJobRuns((prev) => {
          const currentJobRun = prev[jobType];
          if (!currentJobRun) return prev;
          return {
            ...prev,
            [jobType]: {
              ...currentJobRun,
              status: 'error',
              completedAt: new Date(),
              error: errorMessage,
            },
          };
        });
        return;
      }

      // Check if content is empty - show error in UI
      const generatedContent = data.content?.trim();
      
      // Debug logging for LLM response
      console.log('[LLM Response]', {
        jobType,
        hasContent: !!generatedContent,
        contentLength: generatedContent?.length || 0,
        contentPreview: generatedContent?.substring(0, 200) || '(empty)',
        metadata: data.metadata,
      });
      
      if (!generatedContent) {
        // Surface error in UI instead of silently falling back
        const errorMessage = `LLM returned empty content for ${jobType}. This may be due to content filtering, token limits, or model issues. Check console for details.`;
        console.error('[LLM Error] Empty content returned:', {
          jobType,
          metadata: data.metadata,
          rawContent: data.content,
        });
        
        setJobRuns((prev) => {
          const currentJobRun = prev[jobType];
          if (!currentJobRun) return prev;
          return {
            ...prev,
            [jobType]: {
              ...currentJobRun,
              status: 'error',
              completedAt: new Date(),
              error: errorMessage,
              llmMetadata: data.metadata,
            },
          };
        });
        return;
      }

      // Success - update with real LLM-generated content
      setJobRuns((prev) => {
        const currentJobRun = prev[jobType];
        if (!currentJobRun) return prev;
        return {
          ...prev,
          [jobType]: {
            ...currentJobRun,
            status: 'completed',
            completedAt: new Date(),
            artifact: {
              title: config.name,
              content: generatedContent,
              format: jobType === 'prototype_generation' ? 'html' : 'markdown',
            },
            llmMetadata: data.metadata,
          },
        };
      });

      setActiveTab('artifact');
    } catch (error) {
      // Network or other error - show error in UI
      const errorMessage = error instanceof Error 
        ? `LLM API error: ${error.message}` 
        : 'LLM API error: Unknown error occurred';
      
      console.error('[LLM API Error]', {
        jobType,
        error,
        errorMessage,
      });
      
      setJobRuns((prev) => {
        const currentJobRun = prev[jobType];
        if (!currentJobRun) return prev;
        return {
          ...prev,
          [jobType]: {
            ...currentJobRun,
            status: 'error',
            completedAt: new Date(),
            error: errorMessage,
          },
        };
      });
    }
  };

  const downloadArtifact = () => {
    if (!currentRun?.artifact) return;

    // Determine file type based on job type
    const isHtml = selectedJob === 'prototype_generation';
    const mimeType = isHtml ? 'text/html' : 'text/markdown';
    const extension = isHtml ? '.html' : '.md';

    const blob = new Blob([currentRun.artifact.content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentRun.artifact.title.toLowerCase().replace(/\s+/g, '-')}${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get sources for the selected job with their connector status
  const getJobSources = (jobType: JobType) => {
    const config = jobConfigs[jobType];
    return config.sources.map((sourceId) => {
      const connector = connectors.find((c) => c.id === sourceId);
      return connector || { id: sourceId, name: sourceId, icon: Database, status: 'connected_demo' as ConnectorStatus };
    });
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/demo"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Demo</span>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <span className="font-heading font-semibold text-cobalt-600">pmkit</span>
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
            Demo Mode
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Demo Guest</span>
            <Badge variant="secondary">PM</Badge>
          </div>
        </div>
      </header>

      {/* Demo Mode Banner */}
      <div className="flex items-center gap-2 border-b bg-gradient-to-r from-amber-50 to-cobalt-50 px-4 py-2 text-sm">
        <Info className="h-4 w-4 shrink-0 text-amber-700" />
        <span className="text-amber-800">
          <strong>Demo Mode:</strong> Connectors use simulated data.{' '}
          <span className="text-cobalt-700 font-medium">AI outputs are real</span> (GPT-5 mini).{' '}
          <Link href="/contact" className="font-medium underline hover:no-underline text-cobalt-600">
            Contact Sales
          </Link>{' '}
          to connect your real tools.
        </span>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Job Selection */}
        <aside className="flex w-64 flex-col border-r bg-muted/30">
          <div className="p-4">
            <h2 className="font-heading text-sm font-semibold text-muted-foreground">
              PM WORKFLOWS
            </h2>
          </div>
          <nav className="space-y-1 px-2">
            {(Object.keys(jobConfigs) as JobType[]).map((jobType) => {
              const config = jobConfigs[jobType];
              const isSelected = selectedJob === jobType;
              const jobRun = jobRuns[jobType];
              const isRunning = jobRun?.status === 'running';
              const isCompleted = jobRun?.status === 'completed';

              return (
                <button
                  key={jobType}
                  onClick={() => setSelectedJob(jobType)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
                    isSelected
                      ? 'bg-cobalt-100 text-cobalt-700'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <config.icon className="h-4 w-4" />
                  <span className="flex-1">{config.name}</span>
                  {isRunning && <Loader2 className="h-4 w-4 animate-spin text-cobalt-600" />}
                  {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                </button>
              );
            })}
          </nav>

          {/* Connectors Status */}
          <div className="mt-6 flex-1 overflow-y-auto border-t p-4">
            <div className="flex items-center gap-2">
              <Plug className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-heading text-sm font-semibold text-muted-foreground">
                CONNECTORS
              </h2>
            </div>
            
            {/* Tool Integrations */}
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground/70">Tool Integrations</p>
              {connectors.filter(c => c.type === 'mcp').map((connector) => (
                <div key={connector.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <connector.icon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{connector.name}</span>
                  </div>
                  <ConnectorStatusBadge status={connector.status} />
                </div>
              ))}
            </div>

            {/* AI Crawlers */}
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground/70">AI Crawlers</p>
              {connectors.filter(c => c.type === 'crawler').map((connector) => (
                <div key={connector.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <connector.icon className="h-3 w-3 text-cobalt-600" />
                    <span className="text-muted-foreground">{connector.name}</span>
                  </div>
                  <ConnectorStatusBadge status={connector.status} />
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Panel */}
        <main className="flex-1 overflow-hidden">
          {!selectedJob ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 font-heading text-lg font-semibold">Select a Workflow</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Choose a PM workflow from the sidebar to run it.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              {/* Job Header */}
              <div className="flex items-center justify-between border-b p-4">
                <div>
                  <h1 className="font-heading text-xl font-bold">
                    {jobConfigs[selectedJob].name}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {jobConfigs[selectedJob].description}
                  </p>
                </div>
                <Button
                  onClick={() => runJob(selectedJob)}
                  disabled={jobRuns[selectedJob]?.status === 'running'}
                >
                  {jobRuns[selectedJob]?.status === 'running' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : currentRun?.status === 'completed' ? (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Again
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Job
                    </>
                  )}
                </Button>
              </div>

              {/* Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as typeof activeTab)}
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
              >
                <div className="border-b px-4">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="timeline">
                      Timeline
                      {currentRun && (
                        <Badge variant="secondary" className="ml-2">
                          {currentRun.toolCalls.filter((tc) => tc.status === 'success').length}/
                          {currentRun.toolCalls.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="artifact" disabled={!currentRun?.artifact}>
                      Artifact
                    </TabsTrigger>
                    <TabsTrigger value="connectors">Connectors</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview" className="h-full flex-1 overflow-auto p-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Data Sources</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {getJobSources(selectedJob).map((source) => (
                            <div
                              key={source.id}
                              className="flex items-center justify-between rounded-md border p-2"
                            >
                              <div className="flex items-center gap-2">
                                <source.icon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{source.name}</span>
                              </div>
                              <ConnectorStatusBadge status={source.status} />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Tool Calls</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          {jobConfigs[selectedJob].toolCalls.map((tc) => (
                            <li key={tc.name} className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="border-amber-200 bg-amber-50 text-amber-700"
                              >
                                Demo
                              </Badge>
                              <span className="font-mono text-muted-foreground">{tc.server}.</span>
                              <span className="font-mono">{tc.name}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="h-full flex-1 overflow-auto p-4">
                  {currentRun ? (
                    <div className="space-y-4">
                      {/* Run Status */}
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Job Run</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  currentRun.status === 'completed'
                                    ? 'default'
                                    : currentRun.status === 'running'
                                      ? 'secondary'
                                      : 'destructive'
                                }
                              >
                                {currentRun.status}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>ID: {currentRun.id}</span>
                            {currentRun.startedAt && (
                              <span>Started: {currentRun.startedAt.toLocaleTimeString()}</span>
                            )}
                            {currentRun.completedAt && (
                              <span>
                                Duration:{' '}
                                {(
                                  (currentRun.completedAt.getTime() -
                                    currentRun.startedAt!.getTime()) /
                                  1000
                                ).toFixed(1)}
                                s
                              </span>
                            )}
                          </div>
                          {currentRun.error && (
                            <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">
                              <strong>Error:</strong> {currentRun.error}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Tool Calls */}
                      <div className="space-y-2">
                        {currentRun.toolCalls.map((tc) => (
                          <Card
                            key={tc.id}
                            className={cn(
                              'transition-opacity',
                              tc.status === 'pending' && 'opacity-50'
                            )}
                          >
                            <CardContent className="flex items-center gap-4 py-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                {tc.status === 'pending' && (
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                )}
                                {tc.status === 'success' && (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                )}
                                {tc.status === 'error' && (
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 font-mono text-sm">
                                  <span className="text-muted-foreground">{tc.server}.</span>
                                  {tc.name}
                                  <Badge
                                    variant="outline"
                                    className="border-amber-200 bg-amber-50 text-xs text-amber-700"
                                  >
                                    Demo
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {JSON.stringify(tc.input)}
                                </div>
                              </div>
                              {tc.durationMs && (
                                <span className="text-sm text-muted-foreground">
                                  {tc.durationMs}ms
                                </span>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-sm text-muted-foreground">
                          Run the job to see the tool call timeline.
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="artifact" className="h-full flex-1 overflow-hidden">
                  {currentRun?.artifact ? (
                    <div className="flex h-full flex-col">
                      {/* Artifact Header with Demo Warning */}
                      <div className="border-b">
                        <div className="flex items-center justify-between p-4">
                          <div>
                            <h3 className="font-heading font-semibold">
                              {currentRun.artifact.title}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>Format: {currentRun.artifact.format}</span>
                              {currentRun.llmMetadata && !currentRun.llmMetadata.isStub && (
                                <>
                                  <span>•</span>
                                  <span className="text-cobalt-600 font-medium">
                                    Generated by pmkit
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {(currentRun.llmMetadata.latencyMs / 1000).toFixed(1)}s
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={downloadArtifact}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                        {/* Provenance Banner */}
                        <div className="border-t bg-amber-50 px-4 py-3">
                          <div className="flex items-start gap-2 text-sm text-amber-800">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <div>
                              <p className="font-medium">
                                {currentRun.llmMetadata?.isStub === false 
                                  ? 'AI-Generated Draft (Real LLM)' 
                                  : 'Draft Proposal (Demo)'}
                              </p>
                              <p className="mt-0.5 text-xs text-amber-700">
                                Data sources:{' '}
                                {getJobSources(selectedJob)
                                  .map((s) => `${s.name} (Demo)`)
                                  .join(', ')}
                              </p>
                              <p className="text-xs text-amber-700">
                                Actions: All outputs are proposals only. Nothing will be written to
                                external systems.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 overflow-auto p-4">
                        {/* Debug logging for artifact rendering */}
                        {(() => {
                          console.log('[Artifact Render]', {
                            jobType: selectedJob,
                            format: currentRun.artifact.format,
                            contentLength: currentRun.artifact.content?.length,
                            startsWithDoctype: currentRun.artifact.content?.trim().startsWith('<!DOCTYPE'),
                            contentPreview: currentRun.artifact.content?.substring(0, 100),
                            isStub: currentRun.llmMetadata?.isStub,
                          });
                          return null;
                        })()}
                        {/* Render HTML prototypes in an iframe, markdown as text */}
                        {selectedJob === 'prototype_generation' && currentRun.artifact.content.trim().startsWith('<!DOCTYPE') ? (
                          <div className="h-full">
                            <iframe
                              srcDoc={currentRun.artifact.content}
                              className="w-full h-full min-h-[600px] rounded-lg border bg-white"
                              title="Prototype Preview"
                              sandbox="allow-scripts"
                            />
                          </div>
                        ) : (
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <pre className="whitespace-pre-wrap rounded-lg border bg-card p-4 font-sans text-sm text-foreground">
                              {currentRun.artifact.content}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-sm text-muted-foreground">
                          No artifact generated yet.
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="connectors" className="h-full flex-1 overflow-auto p-4">
                  <div className="space-y-6">
                    {/* Demo Mode Info */}
                    <Card className="border-amber-200 bg-amber-50">
                      <CardContent className="flex items-start gap-3 pt-6">
                        <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                        <div>
                          <h3 className="font-semibold text-amber-900">Demo Mode - Simulated Data</h3>
                          <p className="mt-1 text-sm text-amber-800">
                            In this demo, all connectors return simulated data. To connect your
                            real Jira, Slack, Gong, and other tools, contact our sales team for
                            enterprise access.
                          </p>
                          <Link
                            href="/contact"
                            className="mt-2 inline-block text-sm font-medium text-amber-900 underline hover:no-underline"
                          >
                            Contact Sales →
                          </Link>
                        </div>
                      </CardContent>
                    </Card>

                    {/* MCP Connectors */}
                    <div className="mb-6">
                      <h4 className="mb-3 text-sm font-medium text-muted-foreground">Tool Integrations</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        {connectors.filter(c => c.type === 'mcp').map((connector) => (
                          <Card key={connector.id}>
                            <CardContent className="flex items-center justify-between pt-6">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                  <connector.icon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="font-medium">{connector.name}</p>
                                  <p className="text-xs text-muted-foreground">MCP Connector</p>
                                </div>
                              </div>
                              <ConnectorStatusBadge status={connector.status} />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* AI Crawlers */}
                    <div>
                      <h4 className="mb-3 text-sm font-medium text-muted-foreground">AI Crawlers</h4>
                      <div className="grid gap-4 md:grid-cols-1">
                        {connectors.filter(c => c.type === 'crawler').map((connector) => (
                          <Card key={connector.id}>
                            <CardContent className="flex items-center justify-between pt-6">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cobalt-100">
                                  <connector.icon className="h-5 w-5 text-cobalt-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{connector.name}</p>
                                  <p className="text-xs text-muted-foreground">{connector.description}</p>
                                </div>
                              </div>
                              <ConnectorStatusBadge status={connector.status} />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
