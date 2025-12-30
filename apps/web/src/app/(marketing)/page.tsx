import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  Users,
  BarChart3,
  Shield,
  GitBranch,
  Target,
  ArrowRight,
  CheckCircle2,
  Link2,
  Play,
  ClipboardCheck,
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Daily Briefs',
    description:
      'Start each day with a synthesized brief from Slack, Jira, support, and community; automatically.',
  },
  {
    icon: Users,
    title: 'Meeting Prep Packs',
    description:
      'Walk into every customer meeting with context: recent calls, open tickets, and talking points.',
  },
  {
    icon: BarChart3,
    title: 'VoC Clustering',
    description:
      'Cluster customer feedback from support, calls, and community into actionable themes with evidence.',
  },
  {
    icon: Target,
    title: 'Competitor Intel',
    description:
      'Track competitor changes; pricing, features, messaging; with strategic implications.',
  },
  {
    icon: GitBranch,
    title: 'Roadmap Alignment',
    description:
      'Generate alignment memos with options, trade-offs, and recommendations for stakeholder decisions.',
  },
  {
    icon: FileText,
    title: 'PRD Drafts',
    description:
      'Draft PRDs grounded in customer evidence, with explicit assumptions and open questions.',
  },
];

const benefits = [
  'Draft-only: Never writes directly to external systems',
  'Full audit trail for every tool call and artifact',
  'RBAC with permission simulation',
  'MCP connectors for enterprise tools',
  'Sources and citations for every insight',
  'Downloadable artifacts in multiple formats',
];

const integrations = [
  { name: 'Jira', category: 'Project Management' },
  { name: 'Confluence', category: 'Documentation' },
  { name: 'Slack', category: 'Communication' },
  { name: 'Gong', category: 'Call Intelligence' },
  { name: 'Zendesk', category: 'Support' },
  { name: 'Discourse', category: 'Community' },
  { name: 'Amplitude', category: 'Analytics' },
  { name: 'Algolia', category: 'Search Analytics' },
];

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'pmkit',
            url: 'https://getpmkit.com',
            logo: 'https://getpmkit.com/logo.png',
            description:
              'Your daily PM toolkit - briefs, meetings, and PRDs made simple.',
            sameAs: [
              'https://twitter.com/getpmkit',
              'https://github.com/getpmkit',
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'pmkit',
            url: 'https://getpmkit.com',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://getpmkit.com/search?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'pmkit',
            description:
              'AI-powered product management agent that runs daily briefs, meeting prep, VoC clustering, and PRD drafts.',
            brand: {
              '@type': 'Brand',
              name: 'pmkit',
            },
            offers: {
              '@type': 'Offer',
              availability: 'https://schema.org/InStock',
              priceCurrency: 'USD',
              price: '0',
              priceValidUntil: '2026-12-31',
            },
          }),
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cobalt-50/50 to-background py-20 md:py-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="cobalt" className="mb-6">
              Now in Beta
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Your daily PM toolkit;   
              <span className="text-cobalt-600">briefs, meetings, and PRDs</span> made simple.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Draft smarter. Decide faster. pmkit runs your PM workflows; daily briefs, meeting
              prep, VoC themes, and PRD drafts; while you focus on strategy.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/demo">
                  Try the Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/how-it-works">See How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-cobalt-100/30 blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              The kit every PM needs
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              AI briefs, themes, and draft PRDs; run end-to-end with traceability and governance.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="animate-fade-up border-0 bg-muted/30 shadow-none"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-cobalt-100">
                    <feature.icon className="h-5 w-5 text-cobalt-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/30 py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Draft-only by design
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              pmkit agents propose changes but never write directly. You review, edit, and approve
              before anything is published.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-cobalt-100">
                <Link2 className="h-12 w-12 text-cobalt-600" />
              </div>
              <div className="mx-auto mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-cobalt-600 text-sm font-bold text-white">
                1
              </div>
              <h3 className="font-heading text-lg font-semibold">Connect Your Tools</h3>
              <p className="mt-2 text-muted-foreground">
                MCP connectors link to Jira, Slack, Gong, and more; securely and with audit logging.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-cobalt-100">
                <Play className="h-12 w-12 text-cobalt-600" />
              </div>
              <div className="mx-auto mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-cobalt-600 text-sm font-bold text-white">
                2
              </div>
              <h3 className="font-heading text-lg font-semibold">Run Jobs</h3>
              <p className="mt-2 text-muted-foreground">
                Trigger daily briefs, meeting prep, VoC clustering, or PRD drafts; on demand or
                scheduled.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-cobalt-100">
                <ClipboardCheck className="h-12 w-12 text-cobalt-600" />
              </div>
              <div className="mx-auto mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-cobalt-600 text-sm font-bold text-white">
                3
              </div>
              <h3 className="font-heading text-lg font-semibold">Review & Approve</h3>
              <p className="mt-2 text-muted-foreground">
                Every output is a proposal. Review the diff, edit if needed, then approve to
                publish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold sm:text-4xl">
                Enterprise governance built in
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                pmkit is designed for teams that need autonomy without risk. Every action is
                traceable, every write is a proposal.
              </p>
              <ul className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-cobalt-600" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button asChild>
                  <Link href="/resources/enterprise-pm-governance">
                    Learn About Governance
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                Audit Log
              </div>
              <div className="mt-4 space-y-3 font-mono text-sm">
                <div className="rounded bg-muted p-2">
                  <span className="text-cobalt-600">job.started</span> daily_brief by sarah.chen
                </div>
                <div className="rounded bg-muted p-2">
                  <span className="text-cobalt-600">tool.called</span> slack.get_channel_messages
                </div>
                <div className="rounded bg-muted p-2">
                  <span className="text-cobalt-600">tool.called</span> jira.get_sprint_issues
                </div>
                <div className="rounded bg-muted p-2">
                  <span className="text-cobalt-600">artifact.created</span> brief_2025-12-29.md
                </div>
                <div className="rounded bg-muted p-2">
                  <span className="text-cobalt-600">job.completed</span> 4 tool calls, 1 artifact
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="bg-muted/30 py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Connects to your stack
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              MCP connectors for the tools you already use. Swap mock connectors for real ones
              without changing job logic.
            </p>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="flex items-center gap-2 rounded-full border bg-background px-4 py-2"
              >
                <span className="font-medium">{integration.name}</span>
                <span className="text-sm text-muted-foreground">{integration.category}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link href="/resources/mcp-connectors-for-enterprise-tools">
                View All Integrations
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-3xl rounded-2xl bg-cobalt-600 p-8 text-center text-white md:p-12">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Ready to try pmkit?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-cobalt-100">
              Run all 6 cadence jobs in the demo; daily brief, meeting prep, VoC clustering,
              competitor intel, roadmap alignment, and PRD draft.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/demo">
                  Try the Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white bg-white text-cobalt-600 hover:bg-white/90"
                asChild
              >
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

