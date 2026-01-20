'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Users,
  BarChart3,
  Target,
  GitBranch,
  ArrowRight,
  Sparkles,
  Clock,
  Plug,
  Wand2,
  Megaphone,
  Presentation,
  Bot,
  Zap,
  CheckCircle2,
  XCircle,
  Loader2,
  MessageSquare,
  Wrench,
} from 'lucide-react';

const agents = [
  {
    name: 'Daily Brief',
    description: 'Delivered every morning automatically',
    trigger: 'Runs daily at your chosen time',
    icon: FileText,
    job: 'daily_brief',
    href: '/agents/daily-brief',
    enabled: true,
  },
  {
    name: 'Meeting Prep',
    description: 'Ready before every external meeting',
    trigger: 'Triggered by calendar events',
    icon: Users,
    job: 'meeting_prep',
    href: '/agents/meeting-prep',
    enabled: true,
  },
  {
    name: 'VoC Clustering',
    description: 'Customer themes surfaced weekly',
    trigger: 'Runs weekly on your schedule',
    icon: BarChart3,
    job: 'voc_clustering',
    href: '/agents/voc-clustering',
    enabled: true,
  },
  {
    name: 'Sprint Review',
    description: 'Summary when each sprint closes',
    trigger: 'Triggered by sprint end in Jira',
    icon: Clock,
    job: 'sprint_review',
    href: '/agents/sprint-review',
    enabled: true,
  },
  {
    name: 'Competitor Research',
    description: 'Market intel delivered regularly',
    trigger: 'Runs on your schedule',
    icon: Target,
    job: 'competitor_research',
    href: '/agents/competitor-research',
    enabled: true,
  },
  {
    name: 'Roadmap Alignment',
    description: 'Strategic checks before planning',
    trigger: 'Runs monthly or before planning',
    icon: GitBranch,
    job: 'roadmap_alignment',
    href: '/agents/roadmap-alignment',
    enabled: true,
  },
  {
    name: 'PRD Draft',
    description: 'Created when epics are ready',
    trigger: 'Triggered by Jira epic status',
    icon: FileText,
    job: 'prd_draft',
    href: '/agents/prd-draft',
    enabled: true,
  },
  {
    name: 'Prototype',
    description: 'Generated when PRDs are approved',
    trigger: 'Triggered by PRD completion',
    icon: Wand2,
    job: 'prototype_generation',
    href: '/agents/prototype-generation',
    enabled: true,
  },
  {
    name: 'Release Notes',
    description: 'Published when releases ship',
    trigger: 'Triggered by Jira release',
    icon: Megaphone,
    job: 'release_notes',
    href: '/agents/release-notes',
    enabled: true,
  },
  {
    name: 'Deck Content',
    description: 'Ready before key presentations',
    trigger: 'Triggered by QBR/review meetings',
    icon: Presentation,
    job: 'deck_content',
    href: '/agents/deck-content',
    enabled: true,
  },
];

// Map job types to display names and icons
const jobTypeInfo: Record<string, { name: string; icon: typeof FileText; href: string }> = {
  daily_brief: { name: 'Daily Brief', icon: FileText, href: '/agents/daily-brief' },
  meeting_prep: { name: 'Meeting Prep', icon: Users, href: '/agents/meeting-prep' },
  sprint_review: { name: 'Sprint Review', icon: Clock, href: '/agents/sprint-review' },
  voc_clustering: { name: 'VoC Clustering', icon: BarChart3, href: '/agents/voc-clustering' },
  competitor_research: { name: 'Competitor Research', icon: Target, href: '/agents/competitor-research' },
  roadmap_alignment: { name: 'Roadmap Alignment', icon: GitBranch, href: '/agents/roadmap-alignment' },
  prd_draft: { name: 'PRD Draft', icon: FileText, href: '/agents/prd-draft' },
  prototype_generation: { name: 'Prototype', icon: Wand2, href: '/agents/prototype-generation' },
  release_notes: { name: 'Release Notes', icon: Megaphone, href: '/agents/release-notes' },
  deck_content: { name: 'Deck Content', icon: Presentation, href: '/agents/deck-content' },
};

interface AgentStats {
  activeAgentsCount: number;
  connectedSourcesCount: number;
  completedJobsCount: number;
}

interface RecentJob {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(' ')[0] || 'there';
  const [hasAgentConfigured, setHasAgentConfigured] = useState<boolean | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch('/api/workbench/run-job');
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.isAdmin === true);
        }
      } catch {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, []);

  useEffect(() => {
    // Check if user has any agent configured
    async function checkAgentConfig() {
      try {
        const response = await fetch('/api/agents/daily-brief');
        if (response.ok) {
          const data = await response.json();
          setHasAgentConfigured(data.config !== null);
        }
      } catch {
        // On error, default to showing setup prompt
        setHasAgentConfigured(false);
      }
    }
    checkAgentConfig();
  }, []);

  useEffect(() => {
    // Fetch stats and recent jobs
    async function fetchData() {
      try {
        const [statsRes, jobsRes] = await Promise.all([
          fetch('/api/agents/stats'),
          fetch('/api/jobs/recent'),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setRecentJobs(jobsData.jobs || []);
        }
      } catch {
        // Silently fail - just show empty state
      } finally {
        setIsLoadingJobs(false);
        setIsLoadingStats(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Welcome back, {firstName}!
        </h1>
        <p className="mt-2 text-muted-foreground">
          What would you like to work on today?
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex gap-6">
          <Link
            href="/dashboard"
            className={cn(
              'border-b-2 pb-3 text-sm font-medium transition-colors',
              'border-cobalt-600 text-cobalt-600'
            )}
          >
            Dashboard
          </Link>
          <Link
            href="/agents"
            className={cn(
              'border-b-2 pb-3 text-sm font-medium transition-colors',
              'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'
            )}
          >
            History
          </Link>
          {isAdmin && (
            <Link
              href="/workbench"
              className={cn(
                'flex items-center gap-1.5 border-b-2 pb-3 text-sm font-medium transition-colors',
                'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'
              )}
            >
              <Wrench className="h-3.5 w-3.5" />
              Workbench
            </Link>
          )}
        </nav>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/analytics">
          <Card className="cursor-pointer transition-colors hover:border-green-200 hover:bg-green-50/30">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-green-100 p-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {isLoadingStats ? '-' : stats?.completedJobsCount || 0}
                </p>
                <p className="text-sm text-muted-foreground">Jobs Completed</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings/integrations">
          <Card className="cursor-pointer transition-colors hover:border-cobalt-200 hover:bg-cobalt-50/30">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-cobalt-100 p-2">
                <MessageSquare className="h-5 w-5 text-cobalt-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {isLoadingStats ? '-' : stats?.connectedSourcesCount || 0}
                </p>
                <p className="text-sm text-muted-foreground">Data Sources</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-amber-100 p-2">
              <Zap className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {isLoadingStats ? '-' : stats?.activeAgentsCount || 0}
              </p>
              <p className="text-sm text-muted-foreground">Active Agents</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Your Agents */}
      <div>
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-cobalt-600" />
            <h2 className="font-heading text-xl font-semibold">Your Agents</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure once, they work for you automatically
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) =>
            agent.enabled ? (
              <Link
                key={agent.job}
                href={agent.href || '#'}
                className="group flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-cobalt-200 hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cobalt-100">
                  <agent.icon className="h-5 w-5 text-cobalt-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{agent.name}</span>
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {agent.description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    {agent.trigger}
                  </p>
                </div>
              </Link>
            ) : (
              <div
                key={agent.job}
                className="flex items-start gap-3 rounded-lg border bg-card p-4 opacity-50 cursor-not-allowed"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <agent.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-muted-foreground">{agent.name}</span>
                  <p className="text-sm text-muted-foreground">
                    {agent.description}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Soon
                </Badge>
              </div>
            )
          )}
        </div>
      </div>

      {/* Setup Prompt */}
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Plug className="h-5 w-5 text-cobalt-600" />
            <CardTitle className="text-lg">Connect Your Tools</CardTitle>
          </div>
          <CardDescription>
            Connect your tools to power your agents. The more data sources you connect,
            the more valuable your agents become.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/settings/integrations">
              <Sparkles className="mr-2 h-4 w-4" />
              Set Up Integrations
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-4 font-heading text-xl font-semibold">Recent Activity</h2>
        <Card>
          {isLoadingJobs ? (
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          ) : recentJobs.length === 0 ? (
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-medium">No recent activity</h3>
              {hasAgentConfigured === false && (
                <>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Set up your first agent to see your activity here
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/agents/daily-brief">
                      Set Up Daily Brief
                    </Link>
                  </Button>
                </>
              )}
              {hasAgentConfigured === true && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Your agents haven't run yet. Activity will appear here after your first run.
                </p>
              )}
            </CardContent>
          ) : (
            <CardContent className="p-0">
              <div className="divide-y">
                {recentJobs.map((job) => {
                  const info = jobTypeInfo[job.type] || {
                    name: job.type,
                    icon: Bot,
                    href: '/agents',
                  };
                  const Icon = info.icon;
                  const timestamp = job.completedAt || job.startedAt || job.createdAt;
                  const formattedTime = new Date(timestamp).toLocaleString();

                  return (
                    <Link
                      key={job.id}
                      href={`${info.href}/${job.id}`}
                      className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cobalt-100">
                        <Icon className="h-5 w-5 text-cobalt-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{info.name}</span>
                          {job.status === 'completed' && (
                            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Completed
                            </Badge>
                          )}
                          {job.status === 'failed' && (
                            <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                              <XCircle className="mr-1 h-3 w-3" />
                              Failed
                            </Badge>
                          )}
                          {job.status === 'running' && (
                            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Running
                            </Badge>
                          )}
                          {job.status === 'pending' && (
                            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                              <Clock className="mr-1 h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formattedTime}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
