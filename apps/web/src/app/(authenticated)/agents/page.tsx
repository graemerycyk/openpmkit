'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Calendar,
  FileText,
  Layout,
  MessageSquare,
  Presentation,
  Search,
  Target,
  Users,
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

export default function AgentsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Bot className="h-8 w-8 text-cobalt-600" />
          <h1 className="font-heading text-3xl font-bold">Your Agents</h1>
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
            <div className="rounded-lg bg-amber-100 p-2">
              <Zap className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">10</p>
              <p className="text-sm text-muted-foreground">Autonomous Agents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-cobalt-100 p-2">
              <MessageSquare className="h-5 w-5 text-cobalt-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-muted-foreground">Data Sources</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-100 p-2">
              <Bot className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Active Now</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Grid */}
      <div>
        <h2 className="mb-4 font-heading text-xl font-semibold">All Agents</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AGENTS.map((agent) => (
            <AgentCardComponent key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  );
}
