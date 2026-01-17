'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
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
} from 'lucide-react';

const quickActions = [
  {
    title: 'Run a Daily Brief',
    description: 'Get your morning PM briefing with updates from all your tools',
    icon: FileText,
    href: '/agents/daily-brief',
    color: 'bg-blue-100 text-blue-600',
    enabled: true,
  },
  {
    title: 'Prepare for a Meeting',
    description: 'Generate a meeting prep pack with account context and talking points',
    icon: Users,
    href: '/agents/meeting-prep',
    color: 'bg-green-100 text-green-600',
    enabled: true,
  },
  {
    title: 'Draft a PRD',
    description: 'Create a product requirements document with customer evidence',
    icon: Target,
    href: '/agents/prd-draft',
    color: 'bg-purple-100 text-purple-600',
    enabled: true,
  },
  {
    title: 'Generate a Prototype',
    description: 'Turn your PRD into an interactive HTML prototype',
    icon: Wand2,
    href: '/agents/prototype-generation',
    color: 'bg-amber-100 text-amber-600',
    enabled: true,
  },
];

const jobTypes = [
  { name: 'Daily Brief', icon: FileText, job: 'daily_brief', href: '/agents/daily-brief', enabled: true },
  { name: 'Meeting Prep', icon: Users, job: 'meeting_prep', href: '/agents/meeting-prep', enabled: true },
  { name: 'VoC Clustering', icon: BarChart3, job: 'voc_clustering', href: '/agents/voc-clustering', enabled: true },
  { name: 'Competitor Research', icon: Target, job: 'competitor_research', href: '/agents/competitor-research', enabled: true },
  { name: 'Roadmap Alignment', icon: GitBranch, job: 'roadmap_alignment', href: '/agents/roadmap-alignment', enabled: true },
  { name: 'PRD Draft', icon: FileText, job: 'prd_draft', href: '/agents/prd-draft', enabled: true },
  { name: 'Sprint Review', icon: Clock, job: 'sprint_review', href: '/agents/sprint-review', enabled: true },
  { name: 'Prototype', icon: Wand2, job: 'prototype_generation', href: '/agents/prototype-generation', enabled: true },
  { name: 'Release Notes', icon: Megaphone, job: 'release_notes', href: '/agents/release-notes', enabled: true },
  { name: 'Deck Content', icon: Presentation, job: 'deck_content', href: '/agents/deck-content', enabled: true },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(' ')[0] || 'there';

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

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {quickActions.map((action) => (
          <Card
            key={action.title}
            className={`group transition-all ${
              action.enabled
                ? 'cursor-pointer hover:border-cobalt-200 hover:shadow-md'
                : 'cursor-not-allowed opacity-60'
            }`}
          >
            {action.enabled ? (
              <Link href={action.href}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className={`rounded-lg p-2 ${action.color}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <CardTitle className="mt-4 text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Link>
            ) : (
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className={`rounded-lg p-2 ${action.color}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Coming Soon
                  </Badge>
                </div>
                <CardTitle className="mt-4 text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
            )}
          </Card>
        ))}
      </div>

      {/* All Job Types */}
      <div>
        <div className="mb-4">
          <h2 className="font-heading text-xl font-semibold">All PM Workflows</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {jobTypes.map((job) =>
            job.enabled ? (
              <Link
                key={job.job}
                href={job.href || '#'}
                className="flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cobalt-100">
                  <job.icon className="h-5 w-5 text-cobalt-600" />
                </div>
                <span className="font-medium">{job.name}</span>
              </Link>
            ) : (
              <div
                key={job.job}
                className="flex items-center gap-3 rounded-lg border bg-card p-4 opacity-50 cursor-not-allowed"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <job.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="font-medium text-muted-foreground">{job.name}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
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
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
              Demo Mode
            </Badge>
          </div>
          <CardDescription>
            You&apos;re currently using demo data. Connect your real tools to get personalized
            insights from your actual Jira, Slack, Gong, and more.
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

      {/* Recent Activity Placeholder */}
      <div>
        <h2 className="mb-4 font-heading text-xl font-semibold">Recent Activity</h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-medium">No recent activity</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Set up your first agent to see your activity here
            </p>
            <Button className="mt-4" asChild>
              <Link href="/agents/daily-brief">
                Set Up Daily Brief
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
