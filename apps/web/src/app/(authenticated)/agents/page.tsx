'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
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
  Presentation,
  Search,
  Target,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';

interface AgentInfo {
  id: string;
  title: string;
  href: string;
  isAvailable: boolean;
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

// Available agents are shown to all users, others are "Coming Soon" for non-admins
const AGENTS: AgentInfo[] = [
  // Available agents (first 3)
  { id: 'daily_brief', title: 'Daily Brief', href: '/agents/daily-brief', isAvailable: true },
  { id: 'meeting_prep', title: 'Meeting Prep', href: '/agents/meeting-prep', isAvailable: true },
  { id: 'voc_clustering', title: 'VoC Clustering', href: '/agents/voc-clustering', isAvailable: true },
  // Coming soon agents (admins can still access for testing)
  { id: 'sprint_review', title: 'Sprint Review', href: '/agents/sprint-review', isAvailable: false },
  { id: 'competitor_research', title: 'Competitor Research', href: '/agents/competitor-research', isAvailable: false },
  { id: 'roadmap_alignment', title: 'Roadmap Alignment', href: '/agents/roadmap-alignment', isAvailable: false },
  { id: 'prd_draft', title: 'PRD Draft', href: '/agents/prd-draft', isAvailable: false },
  { id: 'prototype_generation', title: 'Prototype Generation', href: '/agents/prototype-generation', isAvailable: false },
  { id: 'release_notes', title: 'Release Notes', href: '/agents/release-notes', isAvailable: false },
  { id: 'deck_content', title: 'Deck Content', href: '/agents/deck-content', isAvailable: false },
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

function HistoryAgentCard({
  title,
  icon: Icon,
  href,
  isClickable
}: {
  title: string;
  icon: typeof FileText;
  href: string;
  isClickable: boolean;
}) {
  const content = (
    <Card className={cn(
      "transition-all",
      isClickable
        ? "group hover:shadow-md hover:border-cobalt-200 cursor-pointer"
        : "opacity-60 cursor-not-allowed"
    )}>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={cn(
          "rounded-lg p-3",
          isClickable ? "bg-cobalt-100" : "bg-muted"
        )}>
          <Icon className={cn(
            "h-5 w-5",
            isClickable ? "text-cobalt-600" : "text-muted-foreground"
          )} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{title}</h3>
            {!isClickable && (
              <Badge variant="secondary" className="text-xs">
                Coming Soon
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {isClickable ? 'View history' : 'Available soon'}
          </p>
        </div>
        {isClickable && (
          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        )}
      </CardContent>
    </Card>
  );

  if (isClickable) {
    return <Link href={`${href}/history`}>{content}</Link>;
  }

  return content;
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
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [jobsRes, adminRes] = await Promise.all([
          fetch('/api/jobs/recent'),
          fetch('/api/workbench/run-job'),
        ]);

        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setRecentJobs(jobsData.jobs || []);
        }

        if (adminRes.ok) {
          const adminData = await adminRes.json();
          setIsAdmin(adminData.isAdmin === true);
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
        <h1 className="font-heading text-3xl font-bold tracking-tight">History</h1>
        <p className="mt-2 text-muted-foreground">
          View your past completed jobs by all of your Agents
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex gap-6">
          <Link
            href="/dashboard"
            className={cn(
              'border-b-2 pb-3 text-sm font-medium transition-colors',
              'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'
            )}
          >
            Dashboard
          </Link>
          <Link
            href="/agents"
            className={cn(
              'border-b-2 pb-3 text-sm font-medium transition-colors',
              'border-cobalt-600 text-cobalt-600'
            )}
          >
            History
          </Link>
        </nav>
      </div>

      {/* Browse by Agent */}
      <div>
        <h3 className="mb-4 font-medium text-muted-foreground">Browse by Agent</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AGENTS.map((agent) => {
            const info = jobTypeInfo[agent.id];
            // Admin users can access all agents, others only available ones
            const isClickable = isAdmin || agent.isAvailable;
            return (
              <HistoryAgentCard
                key={agent.id}
                title={agent.title}
                icon={info?.icon || Bot}
                href={agent.href}
                isClickable={isClickable}
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
    </div>
  );
}
