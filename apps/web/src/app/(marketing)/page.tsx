import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'pmkit - AI Product Management Toolkit | Daily Briefs, PRDs, Prototypes',
  description:
    'Your daily PM toolkit. AI-powered workflows for product managers: daily briefs, meeting prep, PRD drafts, VoC clustering, competitor research, and PRD to prototype conversion.',
  keywords: [
    'pmkit',
    'AI product management',
    'PM toolkit',
    'AI PRD generator',
    'daily brief automation',
    'meeting prep AI',
    'VoC clustering',
    'competitor research AI',
    'PRD to prototype',
    'product management software',
    'AI PM assistant',
  ],
  openGraph: {
    title: 'pmkit - AI Product Management Toolkit',
    description:
      'Your daily PM toolkit. AI-powered briefs, PRDs, and prototypes - made simple.',
    url: siteConfig.url,
    siteName: 'pmkit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'pmkit - AI Product Management Toolkit',
    description: 'Your daily PM toolkit. AI-powered briefs, PRDs, and prototypes - made simple.',
  },
  alternates: {
    canonical: siteConfig.url,
  },
};
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
  MessageSquare,
  Mail,
  Wand2,
  Megaphone,
  Presentation,
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
    icon: Wand2,
    title: 'PRD to Prototype',
    description:
      'Turn PRDs into interactive HTML prototypes with working UI - validate ideas in minutes, not weeks.',
    highlight: true,
  },
  {
    icon: FileText,
    title: 'PRD Drafts',
    description:
      'Draft PRDs grounded in customer evidence, with explicit assumptions and open questions.',
  },
  {
    icon: BarChart3,
    title: 'VoC Clustering',
    description:
      'Cluster customer feedback from support, calls, and community into actionable themes with evidence.',
  },
  {
    icon: Target,
    title: 'Competitor Research',
    description:
      'Track competitor mentions across X, Reddit, LinkedIn, and news; pricing, features, messaging; with strategic implications.',
  },
  {
    icon: GitBranch,
    title: 'Roadmap Alignment',
    description:
      'Generate alignment memos with options, trade-offs, and recommendations for stakeholder decisions.',
  },
  {
    icon: CheckCircle2,
    title: 'Sprint Review Packs',
    description:
      'Generate sprint review packs with completed work, metrics, demos, and stakeholder updates.',
  },
  {
    icon: Megaphone,
    title: 'Release Notes',
    description:
      'Generate customer-facing release notes from Jira and Confluence; clear, benefit-focused, and ready to publish.',
  },
  {
    icon: Presentation,
    title: 'Deck Content',
    description:
      'Generate slide content tailored for exec, customer, team, or stakeholder audiences - ready to paste into your templates.',
    highlight: true,
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
  // Tool Integrations
  { name: 'Jira', category: 'Project Management' },
  { name: 'Confluence', category: 'Documentation' },
  { name: 'Slack', category: 'Communication' },
  { name: 'Gmail', category: 'Email' },
  { name: 'Google Drive', category: 'Documents' },
  { name: 'Google Calendar', category: 'Meetings' },
  { name: 'Gong', category: 'Call Intelligence' },
  { name: 'Loom', category: 'Video Transcripts' },
  { name: 'Zendesk', category: 'Support' },
  { name: 'Figma', category: 'Design' },
  { name: 'Discourse', category: 'Community' },
  { name: 'Amplitude', category: 'Analytics' },
  // AI Crawlers
  { name: 'Social Crawler', category: 'X, Reddit, LinkedIn, Discord, Bluesky, Threads' },
  { name: 'Web Search', category: 'Google & Bing' },
  { name: 'News Crawler', category: 'Industry News' },
  { name: 'URL Scraper', category: 'Specific Page Analysis' },
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
              'Your daily PM toolkit - briefs, PRDs, and prototypes made simple.',
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
              'AI-powered product management agent that runs 10 PM workflows: daily briefs, meeting prep, VoC clustering, competitor research, roadmap alignment, PRD drafts, sprint reviews, prototype generation, release notes, and deck content.',
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
      {/* JSON-LD for SoftwareApplication (AEO/GEO - helps AI understand this is a SaaS tool) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'pmkit',
            applicationCategory: 'BusinessApplication',
            applicationSubCategory: 'Product Management Software',
            operatingSystem: 'Web Browser',
            description:
              'AI-powered product management automation platform. Automate daily briefs, PRD writing, meeting prep, VoC clustering, competitive research, and more.',
            offers: {
              '@type': 'AggregateOffer',
              lowPrice: '0',
              highPrice: '49',
              priceCurrency: 'USD',
              offerCount: '2',
            },
            featureList: [
              'Daily Brief automation',
              'AI PRD generator',
              'Meeting prep packs',
              'Voice of Customer clustering',
              'Competitive research automation',
              'Roadmap alignment memos',
              'Sprint review packs',
              'Release notes generator',
              'PRD to prototype conversion',
              'Deck content generation',
            ],
            softwareVersion: '1.0',
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '50',
              bestRating: '5',
              worstRating: '1',
            },
          }),
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cobalt-50/50 to-background py-20 md:py-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Your daily PM toolkit;
              <span className="text-cobalt-600"> briefs, PRDs, and prototypes</span> - made simple.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Draft smarter. Decide faster. pmkit runs your PM workflows - daily briefs, meeting
              prep, PRD drafts, and interactive prototypes - while you focus on strategy.
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

      {/* PRD to Prototype Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="cobalt" className="mb-4">
              See It In Action
            </Badge>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              From PRD to clickable prototype in minutes
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Watch pmkit transform a product requirements document into an interactive UI you can share with stakeholders - no design handoff required.
            </p>
          </div>
          <div className="mt-12 mx-auto max-w-5xl">
            <div className="rounded-xl border-2 border-cobalt-200 bg-white p-2 shadow-xl overflow-hidden">
              <div className="rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 p-6">
                {/* Browser chrome mockup */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-300 font-mono">
                      prototype-search-filters.html
                    </div>
                  </div>
                </div>
                {/* Prototype preview */}
                <div className="bg-white rounded-lg overflow-hidden">
                  <div className="bg-slate-50 border-b px-4 py-3">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span className="text-slate-400 text-sm">Search documents...</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-white border rounded-lg px-3 py-2 text-sm text-slate-600">
                          Last 30 days
                        </div>
                        <div className="bg-white border rounded-lg px-3 py-2 text-sm text-slate-600">
                          All types
                        </div>
                        <div className="bg-cobalt-600 text-white rounded-lg px-4 py-2 text-sm font-medium">
                          Search
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {[
                      { title: 'Q4 Product Roadmap', type: 'Document', date: 'Dec 28' },
                      { title: 'Search Filters PRD', type: 'PRD', date: 'Dec 27' },
                      { title: 'Customer Feedback Analysis', type: 'Report', date: 'Dec 26' },
                    ].map((item) => (
                      <div key={item.title} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-cobalt-100 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-cobalt-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{item.title}</p>
                            <p className="text-xs text-slate-500">{item.type}</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">{item.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/demo/console?job=prototype_generation">
                  Try Prototype Generation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/blog/prd-to-prototype-ai-ui-generation">
                  Learn How It Works
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              PRD → Prototype is part of pmkit&apos;s artifact chaining - each job builds on previous outputs.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              10 workflows every PM needs
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              AI briefs, VoC themes, PRD drafts, prototypes, and release notes - run end-to-end with traceability and governance.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className={cn(
                  "animate-fade-up border-0 shadow-none",
                  'highlight' in feature && feature.highlight 
                    ? "bg-cobalt-50 ring-2 ring-cobalt-200" 
                    : "bg-background"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className={cn(
                    "mb-2 flex h-10 w-10 items-center justify-center rounded-lg",
                    'highlight' in feature && feature.highlight ? "bg-cobalt-200" : "bg-cobalt-100"
                  )}>
                    <feature.icon className="h-5 w-5 text-cobalt-600" />
                  </div>
                  <CardTitle className="text-xl">
                    {feature.title}
                    {'highlight' in feature && feature.highlight && (
                      <Badge variant="cobalt" className="ml-2 text-xs">Popular</Badge>
                    )}
                  </CardTitle>
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
      <section className="py-20 md:py-32">
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
                Trigger any of the 10 PM workflows; on demand or scheduled.
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

      {/* Trigger From Where You Work Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-4 border-cobalt-200 bg-cobalt-50 text-cobalt-700">
              Demo Preview
            </Badge>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Trigger pmkit from where you already work
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start jobs from Slack, Teams, or email. The demo shows how triggers work with simulated data.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
            {/* Slack */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-[#4A154B] p-2">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">Slack</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">Demo</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <code className="block rounded bg-muted p-3 text-sm font-mono">
                  /pmkit run daily brief
                </code>
                <p className="mt-3 text-sm text-muted-foreground">
                  DM the agent or use slash commands in any channel.
                </p>
              </CardContent>
            </Card>

            {/* Teams */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-[#5059C9] p-2">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">Teams</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">Demo</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <code className="block rounded bg-muted p-3 text-sm font-mono">
                  @pmkit prep meeting Acme
                </code>
                <p className="mt-3 text-sm text-muted-foreground">
                  Mention the bot in any Teams channel or chat.
                </p>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-cobalt-600 p-2">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">Email</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">Demo</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <code className="block rounded bg-muted p-3 text-sm font-mono">
                  Subject: weekly themes
                </code>
                <p className="mt-3 text-sm text-muted-foreground">
                  Email your agent address with job instructions.
                </p>
              </CardContent>
            </Card>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Demo shows trigger patterns with simulated data.{' '}
            <Link href="/contact" className="text-cobalt-600 hover:underline">
              Contact sales
            </Link>{' '}
            to set up real Slack/Teams integrations.
          </p>

          <div className="mt-8 text-center">
            <Button asChild>
              <Link href="/demo/console?view=commands">
                Try the Slack & Teams Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
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
              MCP connectors for the tools you already use. Demo uses simulated data;
              paying customers get real OAuth connections.
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
          <p className="mt-6 text-center text-sm text-muted-foreground">
            All connectors use simulated data in demo.{' '}
            <Link href="/contact" className="text-cobalt-600 hover:underline">
              Contact sales
            </Link>{' '}
            to connect your real tools.
          </p>
          <div className="mt-6 text-center">
            <Button variant="outline" asChild>
              <Link href="/integrations">
                View All Integrations
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-cobalt-600 py-20 text-white md:py-32">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Ready to try pmkit?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-cobalt-100">
              Run all 10 workflow jobs in the demo: daily brief, meeting prep, VoC clustering,
              competitor research, roadmap alignment, PRD draft, sprint review, prototype generation, and release notes.
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

