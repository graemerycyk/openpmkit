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
} from 'lucide-react';
import { cn } from '@/lib/utils';

type JobType =
  | 'daily_brief'
  | 'meeting_prep'
  | 'voc_clustering'
  | 'competitor_intel'
  | 'roadmap_alignment'
  | 'prd_draft';

type JobStatus = 'idle' | 'running' | 'completed' | 'error';

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
}

const jobConfigs: Record<
  JobType,
  {
    name: string;
    description: string;
    icon: typeof FileText;
    toolCalls: Omit<ToolCall, 'id' | 'status' | 'durationMs'>[];
  }
> = {
  daily_brief: {
    name: 'Daily Brief',
    description: 'Synthesize overnight activity',
    icon: FileText,
    toolCalls: [
      { name: 'get_channel_messages', server: 'slack', input: { channelId: 'C001', limit: 50 } },
      { name: 'get_sprint_issues', server: 'jira', input: { sprintId: 'sprint-42' } },
      { name: 'get_tickets', server: 'zendesk', input: { status: 'open', limit: 25 } },
      { name: 'get_posts', server: 'community', input: { limit: 20 } },
    ],
  },
  meeting_prep: {
    name: 'Meeting Prep',
    description: 'Prepare for customer meeting',
    icon: Users,
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
    toolCalls: [
      { name: 'get_tickets', server: 'zendesk', input: { limit: 50 } },
      { name: 'get_insights', server: 'gong', input: { limit: 50 } },
      { name: 'get_feature_requests', server: 'community', input: { status: 'open', limit: 25 } },
      { name: 'get_posts', server: 'community', input: { limit: 30 } },
    ],
  },
  competitor_intel: {
    name: 'Competitor Intel',
    description: 'Track competitor changes',
    icon: Target,
    toolCalls: [
      { name: 'get_competitors', server: 'competitor', input: {} },
      { name: 'get_recent_changes', server: 'competitor', input: { limit: 25 } },
      { name: 'get_feature_comparison', server: 'competitor', input: {} },
    ],
  },
  roadmap_alignment: {
    name: 'Roadmap Alignment',
    description: 'Generate alignment memo',
    icon: GitBranch,
    toolCalls: [
      { name: 'get_epics', server: 'jira', input: { projectKey: 'ACME' } },
      { name: 'get_feature_usage', server: 'analytics', input: { period: 'week' } },
      { name: 'get_top_feature_requests', server: 'community', input: { limit: 10 } },
      { name: 'get_significant_changes', server: 'competitor', input: { minSignificance: 'high' } },
    ],
  },
  prd_draft: {
    name: 'PRD Draft',
    description: 'Draft PRD with evidence',
    icon: FileText,
    toolCalls: [
      { name: 'get_top_feature_requests', server: 'community', input: { limit: 10 } },
      { name: 'get_pain_points', server: 'gong', input: { limit: 20 } },
      { name: 'get_no_results_queries', server: 'analytics', input: { minCount: 10 } },
      { name: 'search_pages', server: 'confluence', input: { query: 'search', spaceKey: 'PROD' } },
    ],
  },
};

// Simulated artifact content
const artifactContent: Record<JobType, { title: string; content: string }> = {
  daily_brief: {
    title: 'Daily Brief - Dec 29, 2025',
    content: `# Daily Brief - December 29, 2025

## TL;DR
Search improvements are progressing well (70% complete), but we have a critical bug (ACME-350) affecting special characters in search. One enterprise escalation from Globex Corp regarding dashboard loading. Community sentiment around search is improving with the announcement of upcoming filters.

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
*Generated by pmkit • 4 tool calls • 3 sources*`,
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
**Data Sources**: Support (47), Gong (32 calls), Community (45), NPS (28)

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
> "Search never finds what I'm looking for" - Community
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
*Generated by pmkit • 4 tool calls • 4 sources*`,
  },
  competitor_intel: {
    title: 'Competitor Intel Diff',
    content: `# Competitor Intel Diff

**Period**: Last 14 days
**Generated**: December 29, 2025

## Key Changes Summary

| Competitor | Change | Significance |
|------------|--------|--------------|
| Notion | AI-powered search launch | 🔴 High |
| Coda | 20% enterprise price cut | 🔴 High |
| Monday.com | Native Slack integration | 🟡 Medium |

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
3. **Fix Slack integration** - Address reliability issues

---
*Generated by pmkit • 3 tool calls • 1 source*`,
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

**Evidence**: 52 VoC mentions, 89-vote community request

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
| Community | 89 votes | "Filter by content type please" |

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
};

export default function ConsolePage() {
  const [selectedJob, setSelectedJob] = useState<JobType | null>(null);
  const [jobRuns, setJobRuns] = useState<Record<JobType, JobRun | null>>({
    daily_brief: null,
    meeting_prep: null,
    voc_clustering: null,
    competitor_intel: null,
    roadmap_alignment: null,
    prd_draft: null,
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'artifact'>('overview');
  
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

    // Simulate tool calls
    for (let i = 0; i < run.toolCalls.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));

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

    // Complete with artifact
    await new Promise((resolve) => setTimeout(resolve, 500));

    const artifact = artifactContent[jobType];
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
            ...artifact,
            format: 'markdown',
          },
        },
      };
    });

    setActiveTab('artifact');
  };

  const downloadArtifact = () => {
    if (!currentRun?.artifact) return;

    const blob = new Blob([currentRun.artifact.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentRun.artifact.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-4">
          <Link href="/demo" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Demo</span>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <span className="font-heading font-semibold text-cobalt-600">pmkit</span>
          <Badge variant="outline">Demo Mode</Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Demo Guest</span>
            <Badge variant="secondary">PM</Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Job Selection */}
        <aside className="w-64 border-r bg-muted/30">
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
        </aside>

        {/* Main Panel */}
        <main className="flex-1 overflow-hidden">
          {!selectedJob ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 font-heading text-lg font-semibold">Select a Job</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Choose a cadence job from the sidebar to run it.
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
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
                  </TabsList>
                </div>

                <TabsContent value="overview" className="h-full flex-1 overflow-auto p-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Data Sources</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {jobConfigs[selectedJob].toolCalls.map((tc) => (
                            <Badge key={tc.name} variant="outline">
                              {tc.server}
                            </Badge>
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
                                <div className="font-mono text-sm">
                                  <span className="text-muted-foreground">{tc.server}.</span>
                                  {tc.name}
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
                      <div className="flex items-center justify-between border-b p-4">
                        <div>
                          <h3 className="font-heading font-semibold">
                            {currentRun.artifact.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Format: {currentRun.artifact.format}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={downloadArtifact}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                      <div className="flex-1 overflow-auto p-4">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <pre className="whitespace-pre-wrap rounded-lg border bg-card p-4 text-sm font-sans text-foreground">
                            {currentRun.artifact.content}
                          </pre>
                        </div>
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
              </Tabs>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

