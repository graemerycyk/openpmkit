'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  FileText,
  Layout,
  Lightbulb,
  MessageSquare,
  Presentation,
  Search,
  Sparkles,
  Target,
  Users,
  Zap,
} from 'lucide-react';

interface WorkflowCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  dataSources: string[];
  outputFormat: string;
  isScheduled?: boolean;
  href: string;
}

const WORKFLOWS: WorkflowCard[] = [
  {
    id: 'daily_brief',
    title: 'Daily Brief',
    description: 'Morning synthesis of overnight activity from Slack channels',
    icon: <Zap className="h-6 w-6" />,
    dataSources: ['Slack'],
    outputFormat: 'Markdown Brief',
    isScheduled: true,
    href: '/agents/daily-brief',
  },
  {
    id: 'meeting_prep',
    title: 'Meeting Prep',
    description: 'Customer meeting context with call history, open issues, and talking points',
    icon: <Users className="h-6 w-6" />,
    dataSources: ['Gong', 'Slack', 'Zendesk'],
    outputFormat: 'Prep Pack',
    href: '/agents/meeting-prep',
  },
  {
    id: 'voc_clustering',
    title: 'VoC Clustering',
    description: 'Voice of Customer analysis with theme identification and sentiment',
    icon: <BarChart3 className="h-6 w-6" />,
    dataSources: ['Zendesk', 'Gong', 'Community'],
    outputFormat: 'Analysis Report',
    href: '/agents/voc-clustering',
  },
  {
    id: 'competitor_research',
    title: 'Competitor Research',
    description: 'Competitive intelligence from web monitoring and team discussions',
    icon: <Search className="h-6 w-6" />,
    dataSources: ['Web Crawler', 'Slack'],
    outputFormat: 'Intel Report',
    href: '/agents/competitor-research',
  },
  {
    id: 'roadmap_alignment',
    title: 'Roadmap Alignment',
    description: 'Strategic planning memo with decision options and evidence',
    icon: <Target className="h-6 w-6" />,
    dataSources: ['Jira', 'VoC Data'],
    outputFormat: 'Decision Memo',
    href: '/agents/roadmap-alignment',
  },
  {
    id: 'prd_draft',
    title: 'PRD Draft',
    description: 'Product requirements document with problem, solution, and success criteria',
    icon: <FileText className="h-6 w-6" />,
    dataSources: ['Jira', 'VoC', 'Docs'],
    outputFormat: 'PRD Document',
    href: '/agents/prd-draft',
  },
  {
    id: 'sprint_review',
    title: 'Sprint Review',
    description: 'Sprint summary with accomplishments, metrics, and learnings',
    icon: <Calendar className="h-6 w-6" />,
    dataSources: ['Jira'],
    outputFormat: 'Sprint Summary',
    href: '/agents/sprint-review',
  },
  {
    id: 'release_notes',
    title: 'Release Notes',
    description: 'Customer-facing release notes with features, improvements, and fixes',
    icon: <BookOpen className="h-6 w-6" />,
    dataSources: ['Jira'],
    outputFormat: 'Release Notes',
    href: '/agents/release-notes',
  },
  {
    id: 'prototype_generation',
    title: 'Prototype Generation',
    description: 'Interactive HTML prototype from PRD or feature description',
    icon: <Layout className="h-6 w-6" />,
    dataSources: ['PRD Input'],
    outputFormat: 'HTML Prototype',
    href: '/agents/prototype-generation',
  },
  {
    id: 'deck_content',
    title: 'Deck Content',
    description: 'Presentation slides with speaker notes, tailored by audience',
    icon: <Presentation className="h-6 w-6" />,
    dataSources: ['Flexible Input'],
    outputFormat: 'Slide Content',
    href: '/agents/deck-content',
  },
];

function WorkflowCardComponent({ workflow }: { workflow: WorkflowCard }) {
  return (
    <Card className="group relative transition-all hover:shadow-lg hover:border-cobalt-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="rounded-lg bg-cobalt-100 p-2.5 text-cobalt-600">
            {workflow.icon}
          </div>
          {workflow.isScheduled && (
            <Badge variant="outline" className="text-xs">
              <Sparkles className="mr-1 h-3 w-3" />
              Autonomous
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg">{workflow.title}</CardTitle>
        <CardDescription className="text-sm">
          {workflow.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mb-4 flex flex-wrap gap-1.5">
          {workflow.dataSources.map((source) => (
            <Badge key={source} variant="secondary" className="text-xs">
              {source}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Output: {workflow.outputFormat}
          </span>
          <Button size="sm" variant="ghost" asChild className="group-hover:bg-cobalt-50">
            <Link href={workflow.href}>
              Configure
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AgentsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold">AI Agents</h1>
        <p className="mt-2 text-muted-foreground">
          Configure and run autonomous agents that synthesize data from your connected tools
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-100 p-2">
              <Lightbulb className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">10</p>
              <p className="text-sm text-muted-foreground">Available Workflows</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-cobalt-100 p-2">
              <MessageSquare className="h-5 w-5 text-cobalt-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-muted-foreground">Data Source Types</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-purple-100 p-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm text-muted-foreground">Autonomous Agent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Grid */}
      <div>
        <h2 className="mb-4 font-heading text-xl font-semibold">All Workflows</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WORKFLOWS.map((workflow) => (
            <WorkflowCardComponent key={workflow.id} workflow={workflow} />
          ))}
        </div>
      </div>
    </div>
  );
}
