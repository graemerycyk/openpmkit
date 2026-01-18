'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Layout,
  Loader2,
  MessageSquare,
  Presentation,
  Search,
  Target,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';

interface AgentCard {
  id: string;
  title: string;
  description: string;
  trigger: string;
  icon: React.ReactNode;
  dataSources: string[];
  outputFormat: string;
  href: string;
}

interface AgentStats {
  activeAgentsCount: number;
  connectedSourcesCount: number;
  completedJobsCount: number;
  agentConfigs: Array<{
    agentType: string;
    status: string;
    lastRunAt: string | null;
  }>;
}

interface RecentJob {
  id: string;
  type: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  createdAt: string;
}

const AGENTS: AgentCard[] = [
  {
    id: 'daily_brief',
    title: 'Daily Brief',
    description: 'Morning synthesis of overnight activity from Slack, Gmail, and Calendar',
    trigger: 'Runs daily at your chosen time',
    icon: <Zap className="h-6 w-6" />,
    dataSources: ['Slack', 'Gmail', 'Calendar'],
    outputFormat: 'Markdown Brief',
    href: '/agents/daily-brief',
  },
  {
    id: 'meeting_prep',
    title: 'Meeting Prep',
    description: 'Customer meeting context with call history, open issues, and talking points',
    trigger: 'Triggered before calendar meetings',
    icon: <Users className="h-6 w-6" />,
    dataSources: ['Gong', 'Slack', 'Zendesk'],
    outputFormat: 'Prep Pack',
    href: '/agents/meeting-prep',
  },
  {
    id: 'sprint_review',
    title: 'Sprint Review',
    description: 'Sprint summary with accomplishments, metrics, and learnings',
    trigger: 'Triggered when sprint closes in Jira',
    icon: <Calendar className="h-6 w-6" />,
    dataSources: ['Jira'],
    outputFormat: 'Sprint Summary',
    href: '/agents/sprint-review',
  },
  {
    id: 'voc_clustering',
    title: 'VoC Clustering',
    description: 'Voice of Customer analysis with theme identification and sentiment',
    trigger: 'Runs weekly on your schedule',
    icon: <BarChart3 className="h-6 w-6" />,
    dataSources: ['Zendesk', 'Gong', 'Community'],
    outputFormat: 'Analysis Report',
    href: '/agents/voc-clustering',
  },
  {
    id: 'competitor_research',
    title: 'Competitor Research',
    description: 'Competitive intelligence from web monitoring and team discussions',
    trigger: 'Runs on your schedule',
    icon: <Search className="h-6 w-6" />,
    dataSources: ['Web Crawler', 'Slack'],
    outputFormat: 'Intel Report',
    href: '/agents/competitor-research',
  },
  {
    id: 'roadmap_alignment',
    title: 'Roadmap Alignment',
    description: 'Strategic planning memo with decision options and evidence',
    trigger: 'Runs monthly or before planning',
    icon: <Target className="h-6 w-6" />,
    dataSources: ['Jira', 'VoC Data'],
    outputFormat: 'Decision Memo',
    href: '/agents/roadmap-alignment',
  },
  {
    id: 'prd_draft',
    title: 'PRD Draft',
    description: 'Product requirements document with problem, solution, and success criteria',
    trigger: 'Triggered when epic moves to Ready',
    icon: <FileText className="h-6 w-6" />,
    dataSources: ['Jira', 'VoC', 'Docs'],
    outputFormat: 'PRD Document',
    href: '/agents/prd-draft',
  },
  {
    id: 'prototype_generation',
    title: 'Prototype Generation',
    description: 'Interactive HTML prototype from PRD or feature description',
    trigger: 'Triggered when PRD is approved',
    icon: <Layout className="h-6 w-6" />,
    dataSources: ['PRD Input'],
    outputFormat: 'HTML Prototype',
    href: '/agents/prototype-generation',
  },
  {
    id: 'release_notes',
    title: 'Release Notes',
    description: 'Customer-facing release notes with features, improvements, and fixes',
    trigger: 'Triggered when release ships',
    icon: <BookOpen className="h-6 w-6" />,
    dataSources: ['Jira'],
    outputFormat: 'Release Notes',
    href: '/agents/release-notes',
  },
  {
    id: 'deck_content',
    title: 'Deck Content',
    description: 'Presentation slides with speaker notes, tailored by audience',
    trigger: 'Triggered before QBR/review meetings',
    icon: <Presentation className="h-6 w-6" />,
    dataSources: ['Flexible Input'],
    outputFormat: 'Slide Content',
    href: '/agents/deck-content',
  },
];

// Map job types to display info
const jobTypeInfo: Record<string, { name: string; icon: typeof FileText; href: string }> = {
  daily_brief: { name: 'Daily Brief', icon: Zap, href: '/agents/daily-brief' },
  meeting_prep: { name: 'Meeting Prep', icon: Users, href: '/agents/meeting-prep' },
  sprint_review: { name: 'Sprint Review', icon: Calendar, href: '/agents/sprint-review' },
  voc_clustering: { name: 'VoC Clustering', icon: BarChart3, href: '/agents/voc-clustering' },
  competitor_research: { name: 'Competitor Research', icon: Search, href: '/agents/competitor-research' },
  roadmap_alignment: { name: 'Roadmap Alignment', icon: Target, href: '/agents/roadmap-alignment' },
  prd_draft: { name: 'PRD Draft', icon: FileText, href: '/agents/prd-draft' },
  prototype_generation: { name: 'Prototype', icon: Layout, href: '/agents/prototype-generation' },
  release_notes: { name: 'Release Notes', icon: BookOpen, href: '/agents/release-notes' },
  deck_content: { name: 'Deck Content', icon: Presentation, href: '/agents/deck-content' },
};

function AgentCardComponent({ agent }: { agent: AgentCard }) {
  return (
    <Card className="group relative transition-all hover:shadow-lg hover:border-cobalt-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="rounded-lg bg-cobalt-100 p-2.5 text-cobalt-600">
            {agent.icon}
          </div>
          <Badge variant="outline" className="text-xs border-amber-200 bg-amber-50 text-amber-700">
            <Zap className="mr-1 h-3 w-3" />
            Autonomous
          </Badge>
        </div>
        <CardTitle className="text-lg">{agent.title}</CardTitle>
        <CardDescription className="text-sm">
          {agent.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="mb-3 text-xs text-muted-foreground">
          {agent.trigger}
        </p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {agent.dataSources.map((source) => (
            <Badge key={source} variant="secondary" className="text-xs">
              {source}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Output: {agent.outputFormat}
          </span>
          <Button size="sm" variant="ghost" asChild className="group-hover:bg-cobalt-50">
            <Link href={agent.href}>
              Configure
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function HistoryAgentCard({ title, icon: Icon, href }: { title: string; icon: typeof FileText; href: string }) {
  return (
    <Link href={`${href}/history`}>
      <Card className="group transition-all hover:shadow-md hover:border-cobalt-200">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-lg bg-cobalt-100 p-3">
            <Icon className="h-5 w-5 text-cobalt-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">View history</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </CardContent>
      </Card>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return (
        <Badge className="bg-green-600">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Failed
        </Badge>
      );
    case 'running':
      return (
        <Badge variant="secondary">
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          Running
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          <Clock className="mr-1 h-3 w-3" />
          {status}
        </Badge>
      );
  }
}

function RecentJobCard({ job }: { job: RecentJob }) {
  const info = jobTypeInfo[job.type] || { name: job.type, icon: Bot, href: '/agents' };
  const Icon = info.icon;
  const timestamp = job.completedAt || job.startedAt || job.createdAt;
  const formattedTime = new Date(timestamp).toLocaleString();

  return (
    <Link href={`${info.href}/${job.id}`}>
      <Card className="transition-all hover:shadow-md hover:border-cobalt-200">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-lg bg-cobalt-100 p-3">
            <Icon className="h-5 w-5 text-cobalt-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{info.name}</h3>
              <StatusBadge status={job.status} />
            </div>
            <p className="text-sm text-muted-foreground">{formattedTime}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function AgentsPage() {
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Bot className="h-8 w-8 text-cobalt-600" />
          <h1 className="font-heading text-3xl font-bold">Agents</h1>
        </div>
        <p className="mt-2 text-muted-foreground">
          Configure once, they work for you automatically. Each agent monitors your tools and
          delivers outputs when triggered.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-100 p-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {isLoading ? '-' : stats?.completedJobsCount || 0}
              </p>
              <p className="text-sm text-muted-foreground">Jobs Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-cobalt-100 p-2">
              <MessageSquare className="h-5 w-5 text-cobalt-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {isLoading ? '-' : stats?.connectedSourcesCount || 0}
              </p>
              <p className="text-sm text-muted-foreground">Data Sources</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-amber-100 p-2">
              <Zap className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {isLoading ? '-' : stats?.activeAgentsCount || 0}
              </p>
              <p className="text-sm text-muted-foreground">Active Agents</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="agents">Your Agents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Your Agents Tab */}
        <TabsContent value="agents" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AGENTS.map((agent) => (
              <AgentCardComponent key={agent.id} agent={agent} />
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          {/* Agent History Links */}
          <div>
            <h3 className="mb-4 font-medium text-muted-foreground">Browse by Agent</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {AGENTS.map((agent) => {
                const info = jobTypeInfo[agent.id];
                return (
                  <HistoryAgentCard
                    key={agent.id}
                    title={agent.title}
                    icon={info?.icon || Bot}
                    href={agent.href}
                  />
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="mb-4 font-medium text-muted-foreground">Recent Activity</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : recentJobs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 font-medium">No recent activity</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your agent runs will appear here once they start running.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <RecentJobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
