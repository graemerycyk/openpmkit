import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Shield,
  Eye,
  FileText,
  CheckCircle2,
  Zap,
  Database,
  Lock,
  Link2,
  Settings,
  Activity,
  ClipboardCheck,
  MessageSquare,
  BarChart3,
  Layers,
  Phone,
  Headphones,
  Mail,
  FolderOpen,
  Calendar,
  Palette,
  TrendingUp,
  Globe,
  Newspaper,
  Search,
  Play,
  GitBranch,
} from 'lucide-react';
import { siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'How It Works | pmkit - AI PM Workflow Architecture',
  description:
    'Learn how pmkit runs PM workflows with draft-only AI agents, secure integrations, and enterprise governance. Trace every insight to its source.',
  keywords: [
    'how pmkit works',
    'AI product management workflow',
    'secure integrations',
    'draft-only AI',
    'PM automation architecture',
    'enterprise AI governance',
    'traceable AI insights',
  ],
  openGraph: {
    title: 'How pmkit Works',
    description:
      'Learn how pmkit runs PM workflows with draft-only AI agents, secure integrations, and enterprise governance.',
    url: `${siteConfig.url}/how-it-works`,
  },
  twitter: {
    card: 'summary',
    title: 'How pmkit Works',
    description: 'Draft-only AI agents, secure integrations, enterprise governance.',
  },
  alternates: {
    canonical: `${siteConfig.url}/how-it-works`,
  },
};

const principles = [
  {
    icon: Shield,
    title: 'Draft-Only',
    description:
      'Agents never write directly to external systems. Every change is a proposal that requires human approval.',
  },
  {
    icon: Eye,
    title: 'Full Traceability',
    description:
      'Every tool call, every source, every artifact is logged. Trace any insight back to its origin.',
  },
  {
    icon: Lock,
    title: 'RBAC & Governance',
    description:
      'Role-based access control with permission simulation. Audit logs for compliance.',
  },
  {
    icon: Zap,
    title: 'Modular Architecture',
    description:
      'Swap demo connectors for real ones without changing job logic. Standardized tool integration.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-cobalt-50/50 to-background py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="cobalt" className="mb-4">
              Architecture
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              How pmkit Works
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              pmkit runs multi-step PM workflows with AI agents while keeping humans in control.
              Draft-only by design, with full traceability and enterprise governance.
            </p>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">Core Principles</h2>
            <p className="mt-4 text-muted-foreground">
              Four principles guide how pmkit handles AI automation in enterprise environments.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {principles.map((principle) => (
              <Card key={principle.title} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-cobalt-100">
                    <principle.icon className="h-6 w-6 text-cobalt-600" />
                  </div>
                  <CardTitle className="text-lg">{principle.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{principle.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Step by Step */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">Step by Step</h2>
            <p className="mt-4 text-muted-foreground">
              From connecting tools to reviewing proposals; here's how a pmkit workflow runs.
            </p>
          </div>
          <div className="mt-16 space-y-16">
            {/* Step 01: Connect Your Tools */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <span className="font-heading text-4xl font-bold text-cobalt-600">01</span>
                  <h3 className="font-heading text-2xl font-bold">Connect Your Tools</h3>
                </div>
                <p className="mt-4 text-muted-foreground">
                  Secure OAuth connectors link pmkit to your existing tools: Jira, Confluence, Slack, Gong, Zendesk, and more. Each connector authenticates securely and logs every interaction.
                </p>
                <ul className="mt-6 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                    <span className="text-sm">OAuth 2.0 or API key authentication</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                    <span className="text-sm">Encrypted credential storage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                    <span className="text-sm">Per-tool permission scoping</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                    <span className="text-sm">Audit logging for every API call</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <div className="rounded-lg border bg-card p-6">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4" />
                      Integrations
                    </div>
                    <span className="text-xs italic">Illustrative</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {['Jira', 'Confluence', 'Slack', 'Gong', 'Zendesk', 'Amplitude'].map((tool) => (
                      <div key={tool} className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-cobalt-100">
                          <Database className="h-4 w-4 text-cobalt-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{tool}</p>
                          <p className="text-xs text-muted-foreground">Connected</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    OAuth connections to your existing tools.{' '}
                    <Link href="/contact" className="underline hover:no-underline">Contact sales</Link> to get started.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 02: Configure Jobs */}
            <div className="flex flex-col gap-8 lg:flex-row-reverse lg:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <span className="font-heading text-4xl font-bold text-cobalt-600">02</span>
                  <h3 className="font-heading text-2xl font-bold">Configure Jobs</h3>
                </div>
                <p className="mt-4 text-muted-foreground">
                  Set up the PM jobs you want to run; daily briefs, meeting prep, VoC clustering, competitor research, roadmap alignment, PRD drafts, sprint reviews, prototype generation, or release notes. Configure sources, schedules, and output destinations.
                </p>
                <ul className="mt-6 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                    <span className="text-sm">Nine pre-built job types</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                    <span className="text-sm">Custom job templates (Enterprise)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                    <span className="text-sm">Schedule-based or on-demand execution</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                    <span className="text-sm">Source and output configuration</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <div className="rounded-lg border bg-card p-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Settings className="h-4 w-4" />
                    Job Configuration
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      { name: 'Daily Brief', schedule: 'Every day at 8am', icon: FileText },
                      { name: 'VoC Clustering', schedule: 'Every Monday', icon: BarChart3 },
                      { name: 'Competitor Research', schedule: 'Every Friday', icon: Eye },
                    ].map((job) => (
                      <div key={job.name} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-cobalt-100">
                            <job.icon className="h-4 w-4 text-cobalt-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{job.name}</p>
                            <p className="text-xs text-muted-foreground">{job.schedule}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">Active</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 03: Run with Traceability */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <span className="font-heading text-4xl font-bold text-cobalt-600">03</span>
                  <h3 className="font-heading text-2xl font-bold">Run with Traceability</h3>
                </div>
                <p className="mt-4 text-muted-foreground">
                  When a job runs, pmkit executes a multi-step workflow; calling tools, synthesizing data, and generating artifacts. Every step is logged with timing, inputs, and outputs.
                </p>
                <ul className="mt-6 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                    <span className="text-sm">Real-time job progress tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                    <span className="text-sm">Tool call timeline with durations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                    <span className="text-sm">Source citations in every artifact</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                    <span className="text-sm">Error handling with graceful fallbacks</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <div className="rounded-lg border bg-card p-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    Job Timeline
                  </div>
                  <div className="mt-4 space-y-2">
                    {[
                      { tool: 'slack.get_messages', duration: '142ms', status: 'success' },
                      { tool: 'jira.get_sprint', duration: '89ms', status: 'success' },
                      { tool: 'zendesk.get_tickets', duration: '156ms', status: 'success' },
                      { tool: 'gong.get_insights', duration: '201ms', status: 'success' },
                    ].map((call, i) => (
                      <div key={i} className="flex items-center gap-3 rounded bg-muted/50 p-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="flex-1 font-mono text-xs">{call.tool}</span>
                        <span className="text-xs text-muted-foreground">{call.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 04: Review Proposals */}
            <div className="flex flex-col gap-8 lg:flex-row-reverse lg:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <span className="font-heading text-4xl font-bold text-cobalt-600">04</span>
                  <h3 className="font-heading text-2xl font-bold">Review Proposals</h3>
                </div>
                <p className="mt-4 text-muted-foreground">
                  All external writes are proposals, not direct actions. Review the diff, edit if needed, then approve to publish to Jira, Confluence, or Slack.
                </p>
                <ul className="mt-6 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                    <span className="text-sm">Preview before publishing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                    <span className="text-sm">Inline editing capabilities</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                    <span className="text-sm">Approval workflow with RBAC</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                    <span className="text-sm">Proposal expiration policies</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <div className="rounded-lg border bg-card p-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ClipboardCheck className="h-4 w-4" />
                    Pending Proposals
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GitBranch className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium">Create Jira Epic</span>
                        </div>
                        <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Search Filters Feature • 3 stories</p>
                    </div>
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Post to Slack</span>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Approved</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Daily Brief • #product-team</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Types */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-6 w-6 text-cobalt-600" />
              <h2 className="font-heading text-3xl font-bold">10+ Workflows Automated</h2>
            </div>
            <p className="mt-4 text-muted-foreground">
              Pre-built workflows for the most common PM tasks, with more being added regularly.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              // First row: Available now
              {
                name: 'Daily Brief',
                description: 'Synthesize overnight activity from Slack, Jira, support, and community.',
                frequency: 'Automated',
              },
              {
                name: 'VoC Clustering',
                description: 'Cluster feedback from support, calls, and community into themes.',
                frequency: 'Automated',
              },
              {
                name: 'Meeting Prep',
                description: 'Prepare for customer meetings with context from calls, tickets, and CRM.',
                frequency: 'On-demand',
              },
              // Remaining: Coming Soon
              {
                name: 'PRD to Prototype',
                description: 'Turn PRDs into interactive HTML prototypes for rapid user validation.',
                comingSoon: true,
              },
              {
                name: 'PRD Draft',
                description: 'Draft PRDs grounded in customer evidence and context.',
                comingSoon: true,
              },
              {
                name: 'Competitor Research',
                description: 'Track competitor product changes and releases.',
                comingSoon: true,
              },
              {
                name: 'Roadmap Alignment',
                description: 'Generate alignment memos with options and trade-offs.',
                comingSoon: true,
              },
              {
                name: 'Sprint Review',
                description: 'Generate sprint summaries with completed work and release notes.',
                comingSoon: true,
              },
              {
                name: 'Release Notes',
                description: 'Generate customer-facing release notes from completed work.',
                comingSoon: true,
              },
              {
                name: 'Deck Content',
                description: 'Generate slide content tailored for exec, customer, team, or stakeholder audiences.',
                comingSoon: true,
              },
            ].map((job) => (
              <Card key={job.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{job.name}</CardTitle>
                    {'comingSoon' in job && job.comingSoon ? (
                      <Badge variant="outline">Coming Soon</Badge>
                    ) : (
                      <Badge variant="outline">{job.frequency}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{job.description}</p>
                </CardContent>
              </Card>
            ))}
            {/* More workflows coming soon card */}
            <Card className="border-2 border-dashed border-cobalt-200 bg-cobalt-50/30 flex items-center justify-center">
              <CardContent className="text-center py-8">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-cobalt-100">
                  <ArrowRight className="h-5 w-5 text-cobalt-600" />
                </div>
                <CardTitle className="text-base text-cobalt-700">More coming soon</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  New workflows added regularly
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Connected Integrations */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">Connected Integrations</h2>
            <p className="mt-4 text-muted-foreground">
              pmkit connects to the tools your team already uses. All data stays secure with OAuth and encrypted credentials.
            </p>
          </div>

          {/* Available Now */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-6 text-center">Available Now</h3>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {[
                { name: 'Slack', icon: MessageSquare, description: 'Team communication' },
                { name: 'Jira', icon: Layers, description: 'Issue tracking' },
                { name: 'Confluence', icon: FileText, description: 'Documentation' },
                { name: 'Gong', icon: Phone, description: 'Call transcripts' },
                { name: 'Zendesk', icon: Headphones, description: 'Support tickets' },
                { name: 'Gmail', icon: Mail, description: 'Email threads' },
                { name: 'Google Drive', icon: FolderOpen, description: 'Documents' },
                { name: 'Google Calendar', icon: Calendar, description: 'Meetings' },
              ].map((integration) => (
                <Card key={integration.name} className="text-center">
                  <CardContent className="pt-6">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-cobalt-100">
                      <integration.icon className="h-6 w-6 text-cobalt-600" />
                    </div>
                    <h4 className="font-medium">{integration.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{integration.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Coming Soon */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-6 text-center">Coming Soon</h3>
            <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7 max-w-5xl mx-auto">
              {[
                { name: 'Figma', icon: Palette, description: 'Design files' },
                { name: 'Loom', icon: Play, description: 'Video transcripts' },
                { name: 'Amplitude', icon: BarChart3, description: 'Analytics' },
                { name: 'Linear', icon: TrendingUp, description: 'Issue tracking' },
                { name: 'Discourse', icon: MessageSquare, description: 'Community' },
                { name: 'Notion', icon: Database, description: 'Documentation' },
                { name: 'Coda', icon: FileText, description: 'Docs & tables' },
              ].map((integration) => (
                <Card key={integration.name} className="text-center opacity-70">
                  <CardContent className="pt-6">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <integration.icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h4 className="font-medium">{integration.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{integration.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* AI-Powered Crawlers */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-6 text-center">AI-Powered Crawlers</h3>
            <div className="grid gap-4 md:grid-cols-3 max-w-3xl mx-auto">
              {[
                { name: 'Social Crawler', icon: Globe, description: 'Monitor Reddit, Twitter, and product communities' },
                { name: 'Web Search', icon: Search, description: 'Search the web for competitive intelligence' },
                { name: 'News Crawler', icon: Newspaper, description: 'Track industry news and announcements' },
              ].map((crawler) => (
                <Card key={crawler.name} className="text-center">
                  <CardContent className="pt-6">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                      <crawler.icon className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-medium">{crawler.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{crawler.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" asChild>
              <Link href="/integrations">
                View All Integrations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cobalt-600 py-16 text-white md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">See It In Action</h2>
            <p className="mt-4 text-cobalt-100">
              Try our workflow automations in the interactive demo with a complete demo enterprise dataset.
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

