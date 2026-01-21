import type { Metadata } from 'next';
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
  Play,
  Clock,
  Database,
  CheckCircle2,
  Wand2,
  Megaphone,
  MessageSquare,
  Globe,
  Newspaper,
  Hash,
  Presentation,
  Link2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Demo',
  description:
    'Try the pmkit Agent Console with a complete demo enterprise dataset. Run all 10+ PM workflow jobs end-to-end.',
  openGraph: {
    title: 'pmkit Demo',
    description: 'Try the Agent Console with a complete demo enterprise dataset.',
  },
};

const jobs = [
  {
    id: 'daily_brief',
    name: 'Daily Brief',
    description: 'Synthesize overnight activity from Slack, Jira, support, and community.',
    icon: FileText,
    duration: '~30s',
    sources: ['Slack', 'Jira', 'Zendesk', 'Discourse'],
  },
  {
    id: 'feature_intelligence',
    name: 'Feature Intelligence',
    description: 'Cluster customer feedback into actionable themes with evidence.',
    icon: BarChart3,
    duration: '~45s',
    sources: ['Zendesk', 'Gong', 'Discourse', 'Social Crawler'],
  },
  {
    id: 'meeting_prep',
    name: 'Meeting Prep',
    description: 'Prepare for customer meetings with context from calls, tickets, and history.',
    icon: Users,
    duration: '~25s',
    sources: ['Gong', 'Zendesk', 'Jira'],
  },
  {
    id: 'prototype_generation',
    name: 'PRD to Prototype',
    description: 'Turn PRDs into interactive HTML prototypes - validate ideas in minutes, not weeks.',
    icon: Wand2,
    duration: '~50s',
    sources: ['pmkit', 'Confluence', 'Jira'],
    highlight: true,
  },
  {
    id: 'prd_draft',
    name: 'PRD Draft',
    description: 'Draft PRDs grounded in customer evidence and context.',
    icon: FileText,
    duration: '~40s',
    sources: ['Discourse', 'Gong', 'Amplitude', 'Confluence'],
  },
  {
    id: 'competitor_research',
    name: 'Competitor Research',
    description: 'Track competitor product changes and releases.',
    icon: Target,
    duration: '~20s',
    sources: ['Social Crawler', 'Web Search', 'News Crawler', 'URL Scraper'],
  },
  {
    id: 'roadmap_alignment',
    name: 'Roadmap Alignment',
    description: 'Generate alignment memos with options, trade-offs, and recommendations.',
    icon: GitBranch,
    duration: '~35s',
    sources: ['Jira', 'Amplitude', 'Discourse', 'News Crawler'],
  },
  {
    id: 'sprint_review',
    name: 'Sprint Review',
    description: 'Generate sprint review packs with shipped work, metrics, and follow-ups.',
    icon: CheckCircle2,
    duration: '~35s',
    sources: ['Jira', 'Confluence', 'Slack', 'Amplitude'],
  },
  {
    id: 'release_notes',
    name: 'Release Notes',
    description: 'Generate customer-facing release notes from completed work.',
    icon: Megaphone,
    duration: '~30s',
    sources: ['Jira', 'Confluence', 'pmkit'],
  },
  {
    id: 'deck_content',
    name: 'Deck Content',
    description: 'Generate slide content tailored for exec, customer, team, or stakeholder audiences.',
    icon: Presentation,
    duration: '~35s',
    sources: ['pmkit', 'Jira', 'Amplitude', 'Confluence'],
    highlight: true,
  },
];

const demoFeatures = [
  {
    title: 'Demo Connectors',
    description:
      'All connectors use simulated data. Real OAuth connectors available for paying customers.',
  },
  {
    title: 'Full Traceability',
    description:
      'See the complete tool call timeline, sources, and citations for every artifact.',
  },
  {
    title: 'Downloadable Artifacts',
    description:
      'Download generated briefs, reports, and PRDs in Markdown format.',
  },
  {
    title: 'Permission Simulation',
    description:
      'See how RBAC works with different user roles (Admin, PM, Viewer, Guest).',
  },
];

export default function DemoPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-cobalt-50/50 to-background py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="cobalt" className="mb-4">
              Interactive Demo
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              Try the Agent Console
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Run all 10+ PM workflow jobs with a complete demo enterprise dataset. See tool calls,
              sources, and downloadable artifacts.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/demo/console">
                  Workflow Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/demo/console?view=commands">
                  Slack/Teams Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/demo/console?view=crawlers">
                  AI Crawlers Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Job Types */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">10+ Product Manager Workflows</h2>
            <p className="mt-4 text-muted-foreground">
              Run any job to see the complete workflow; tool calls, sources, and artifacts.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <Card 
                key={job.id}
                className={'highlight' in job && job.highlight ? 'ring-2 ring-cobalt-200 bg-cobalt-50/30' : ''}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${'highlight' in job && job.highlight ? 'bg-cobalt-200' : 'bg-cobalt-100'}`}>
                      <job.icon className="h-5 w-5 text-cobalt-600" />
                    </div>
                    <div className="flex items-center gap-2">
                      {'highlight' in job && job.highlight && (
                        <Badge variant="cobalt" className="text-xs">Try This</Badge>
                      )}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {job.duration}
                      </div>
                    </div>
                  </div>
                  <CardTitle className="mt-4 text-lg">{job.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{job.description}</CardDescription>
                  <div className="mt-4 flex flex-wrap gap-1">
                    {job.sources.map((source) => (
                      <Badge key={source} variant="outline" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            {/* More coming soon card */}
            <Card className="border-2 border-dashed border-cobalt-200 bg-cobalt-50/30 flex items-center justify-center">
              <CardContent className="text-center py-12">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cobalt-100">
                  <ArrowRight className="h-6 w-6 text-cobalt-600" />
                </div>
                <CardTitle className="text-lg text-cobalt-700">More coming soon</CardTitle>
                <CardDescription className="mt-2">
                  New workflows added regularly
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Features */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">What's in the Demo</h2>
            <p className="mt-4 text-muted-foreground">
              A complete demo environment with realistic data and full functionality.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {demoFeatures.map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-cobalt-100">
                  <Database className="h-5 w-5 text-cobalt-600" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slack/Teams Launcher */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="cobalt" className="mb-4">
              Slack/Teams Launcher
            </Badge>
            <h2 className="font-heading text-3xl font-bold">Launch Jobs from Anywhere</h2>
            <p className="mt-4 text-muted-foreground">
              Trigger pmkit jobs directly from Slack, Microsoft Teams, or Email. No dashboard required - get
              results delivered right where you work.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-cobalt-100">
                <Hash className="h-7 w-7 text-cobalt-600" />
              </div>
              <h3 className="mt-4 font-heading font-semibold">Slack Commands</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Use <code className="rounded bg-muted px-1 py-0.5 text-xs">/pmkit</code> slash commands to run any workflow.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-cobalt-100">
                <Users className="h-7 w-7 text-cobalt-600" />
              </div>
              <h3 className="mt-4 font-heading font-semibold">Teams Integration</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Mention <code className="rounded bg-muted px-1 py-0.5 text-xs">@pmkit</code> in any channel to trigger jobs.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-cobalt-100">
                <MessageSquare className="h-7 w-7 text-cobalt-600" />
              </div>
              <h3 className="mt-4 font-heading font-semibold">Draft-Only Responses</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                All responses are proposals - review and approve before posting.
              </p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link href="/demo/console?view=commands">
                Try Slack/Teams Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* AI Crawlers */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="cobalt" className="mb-4">
              AI Crawlers
            </Badge>
            <h2 className="font-heading text-3xl font-bold">Real-Time Competitive Research</h2>
            <p className="mt-4 text-muted-foreground">
              Monitor social media, web, and news sources for competitor updates, customer sentiment,
              and market trends - automatically fed into your PM workflows.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100">
                  <Hash className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle className="mt-4">Social Crawler</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Monitor Reddit, Hacker News, and more for brand mentions, competitor discussions, and customer sentiment.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="mt-4">Web Search</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Search Google and DuckDuckGo for competitor pages, pricing changes, and market research.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                  <Newspaper className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle className="mt-4">News Crawler</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track industry news, press releases, and analyst reports for competitive research.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                  <Link2 className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle className="mt-4">URL Scraper</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Fetch and analyze specific URLs for deep competitive research on pricing, features, and positioning.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link href="/demo/console?view=crawlers">
                Try AI Crawlers Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Mock Data Preview */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">Demo Enterprise Dataset</h2>
            <p className="mt-4 text-muted-foreground">
              The demo includes a realistic dataset for "Acme SaaS" with interconnected data
              across all sources.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Jira', items: '15 issues, 3 sprints' },
              { name: 'Confluence', items: '5 pages, 3 spaces' },
              { name: 'Slack', items: '20 messages, 5 channels' },
              { name: 'Gong', items: '4 calls, 15 insights' },
              { name: 'Zendesk', items: '10 tickets, 12 comments' },
              { name: 'Analytics', items: '13 search queries, 11 features' },
              { name: 'Competitor', items: '5 competitors, 7 changes' },
              { name: 'Community', items: '5 posts, 8 feature requests' },
              { name: 'pmkit', items: '5 artifacts, 3 PRDs' },
            ].map((source) => (
              <Card key={source.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{source.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{source.items}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cobalt-600 py-16 text-white md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">Ready to try it?</h2>
            <p className="mt-4 text-cobalt-100">
              Launch the Agent Console and run your first job in seconds.
            </p>
            <p className="mt-2 text-sm text-cobalt-200">
              Demo uses simulated data. Contact sales to connect your real tools.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/demo/console">
                  <Play className="mr-2 h-4 w-4" />
                  Workflow Demo
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white bg-white text-cobalt-600 hover:bg-white/90"
                asChild
              >
                <Link href="/contact">Connect Real Tools</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

