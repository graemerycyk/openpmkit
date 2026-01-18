'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
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
  Bot,
  Zap,
} from 'lucide-react';

const quickActions = [
  {
    title: 'Start Your Daily Brief',
    description: 'Get your morning PM briefing with updates every day without lifting a finger',
    icon: FileText,
    href: '/agents/daily-brief',
    color: 'bg-blue-100 text-blue-600',
    enabled: true,
  },
  {
    title: 'Automate Meeting Prep',
    description: 'Generate a meeting prep pack with account context for all your meetings',
    icon: Users,
    href: '/agents/meeting-prep',
    color: 'bg-green-100 text-green-600',
    enabled: true,
  },
  {
    title: 'Automate PRD Drafts',
    description: 'Create product requirements documents with customer evidence on demand',
    icon: Target,
    href: '/agents/prd-draft',
    color: 'bg-purple-100 text-purple-600',
    enabled: true,
  },
  {
    title: 'Auto-Generate Prototypes',
    description: 'Turn your PRDs into interactive HTML prototypes automatically',
    icon: Wand2,
    href: '/agents/prototype-generation',
    color: 'bg-amber-100 text-amber-600',
    enabled: true,
  },
];

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
    name: 'Sprint Review',
    description: 'Summary when each sprint closes',
    trigger: 'Triggered by sprint end in Jira',
    icon: Clock,
    job: 'sprint_review',
    href: '/agents/sprint-review',
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

export default function DashboardPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(' ')[0] || 'there';
  const [hasAgentConfigured, setHasAgentConfigured] = useState<boolean | null>(null);

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

      {/* Recent Activity Placeholder */}
      <div>
        <h2 className="mb-4 font-heading text-xl font-semibold">Recent Activity</h2>
        <Card>
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
        </Card>
      </div>
    </div>
  );
}
