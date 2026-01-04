import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  ArrowRight,
  Target,
  Shield,
  CheckCircle2,
  Layers,
  FileText,
  MessageSquare,
  Mail,
  Lock,
  Calendar,
  Play,
  ExternalLink,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Invest in pmkit | Pre-Seed Round',
  description:
    'pmkit is raising €2M pre-seed at €10M post-money valuation. Join us in building the AI-powered PM toolkit for enterprise teams.',
  robots: {
    index: false,
    follow: false,
  },
};

const metrics = [
  { label: 'Raising', value: '€2M', sublabel: 'Pre-Seed' },
  { label: 'Valuation', value: '€10M', sublabel: 'Post-Money' },
  { label: 'Equity', value: '20%', sublabel: 'For Round' },
];

const cadenceOutputs = [
  {
    name: 'Daily Brief',
    description: 'Synthesized morning update from Slack, Jira, support, and community',
  },
  {
    name: 'Meeting Prep Pack',
    description: 'Customer context, recent calls, open tickets, and talking points',
  },
  {
    name: 'Weekly Themes / VoC',
    description: 'Clustered feedback with evidence links and trend signals',
  },
  {
    name: 'Competitor Research',
    description: 'Product changes, feature launches, and releases with strategic implications',
  },
  {
    name: 'Roadmap Memo',
    description: 'Options, trade-offs, and recommendations for stakeholder alignment',
  },
  {
    name: 'PRD Pack',
    description: 'Draft PRDs grounded in customer evidence with explicit assumptions',
  },
];

const differentiators = [
  {
    icon: Shield,
    title: 'Draft-Only Architecture',
    description:
      'All writes are proposals. Every output includes diffs and requires explicit approval before publishing.',
  },
  {
    icon: Lock,
    title: 'Governance Moat',
    description:
      'RBAC, audit logs, permissioning, and full traceability. Built for enterprise security reviews.',
  },
  {
    icon: Layers,
    title: 'MCP-Native Connectors',
    description:
      'Swap mock connectors for real ones without rewriting workflows. Clean abstraction layer.',
  },
  {
    icon: Target,
    title: 'Vertical PM Focus',
    description:
      'Purpose-built for Product Management workflows. Not a generic agent wrapper.',
  },
];

const productReadiness = [
  'Working MVP with interactive console',
  'Governance baseline: RBAC + proposal approvals + audit logs view',
  'Core connector set: Jira, Confluence, Slack, Gong, Zendesk',
  'Artifact-first outputs in MD/JSON with evidence links',
];

const validationMetrics = [
  { metric: 'Weekly Active Usage', description: 'PMs running jobs consistently' },
  { metric: 'Draft Acceptance Rate', description: 'Proposals approved vs. rejected' },
  { metric: 'Time Saved per PM', description: 'Hours reclaimed from synthesis work' },
  { metric: 'Procurement Pass Rate', description: 'SSO, retention, audit requirements met' },
];

const useOfFunds = [
  {
    category: 'Engineering',
    percentage: 50,
    description: 'Core platform, MCP connectors, enterprise features',
    milestones: ['Ship Teams plan enforcement', 'Complete SSO baseline', 'Expand connector coverage'],
  },
  {
    category: 'Go-to-Market',
    percentage: 25,
    description: 'Sales, marketing, pilot support',
    milestones: ['Close paid pilots', 'Build referenceable case studies', 'Repeatable sales motion'],
  },
  {
    category: 'Operations',
    percentage: 15,
    description: 'Infrastructure, compliance, legal',
    milestones: ['SOC 2 Type II certification', 'Security audit completion', 'Data residency prep'],
  },
  {
    category: 'Buffer',
    percentage: 10,
    description: 'Contingency and opportunistic spend',
    milestones: ['Runway extension', 'Unexpected opportunities'],
  },
];

const timeline = [
  {
    quarter: 'Q1 2026',
    milestone: 'Pilots + Teams Plan',
    description: 'Close paid pilots, enforce Teams plan, SSO baseline complete',
  },
  {
    quarter: 'Q2 2026',
    milestone: 'Convert & Expand',
    description: 'Convert pilots to annual contracts, expand seats and connector usage',
  },
  {
    quarter: 'Q3 2026',
    milestone: 'Repeatable Pipeline',
    description: 'Referenceable case studies, repeatable sales motion, SOC 2 in progress',
  },
  {
    quarter: 'Q4 2026',
    milestone: 'Series A Ready',
    description: 'Retention, expansion, and ARR targets that support Series A',
  },
];

const fairUseLimits = [
  { limit: 'Run Limits', description: 'Per seat and per workspace caps' },
  { limit: 'Concurrency', description: 'Maximum parallel job executions' },
  { limit: 'Connector Lookback', description: 'Historical data window per connector' },
  { limit: 'Tool Calls', description: 'Maximum tool calls per job run' },
];

const trustPoints = [
  'Encryption at rest and in transit',
  'Secure credential storage (never stored in plaintext)',
  'Role-based access control (RBAC)',
  'Full audit trail for every action',
  'Configurable data retention',
  'Subprocessor transparency',
];

export default function InvestPage() {
  const pageVersion = 'v1.0';
  const pageDate = 'January 2026';

  return (
    <div className="relative">
      {/* Confidential Banner */}
      <div className="bg-amber-50 border-b border-amber-200 py-3 text-center text-sm text-amber-800">
        <div className="container">
          <span className="font-semibold">Confidential</span> — For qualified investors only. Do not
          distribute.
          <span className="mx-2">·</span>
          <span className="text-amber-700">
            This is not an offer to sell securities. Contains forward-looking statements.
          </span>
          <span className="mx-2">·</span>
          <span className="text-amber-600">{pageVersion} · {pageDate}</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-cobalt-950 to-slate-900 py-24 md:py-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 border-cobalt-400/30 bg-cobalt-500/10 text-cobalt-300">
              Pre-Seed Round Open
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              The AI toolkit for
              <span className="block bg-gradient-to-r from-cobalt-400 to-violet-400 bg-clip-text text-transparent">
                Product Managers
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 md:text-xl">
              pmkit runs the daily workflows that consume PM time—briefs, meeting prep, VoC
              clustering, and PRD drafts—so PMs can focus on strategy.
            </p>

            {/* Key Metrics */}
            <div className="mt-12 grid grid-cols-3 gap-6">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                >
                  <div className="text-3xl font-bold text-white md:text-4xl">{metric.value}</div>
                  <div className="mt-1 text-sm text-slate-400">{metric.label}</div>
                  <div className="text-xs text-cobalt-400">{metric.sublabel}</div>
                </div>
              ))}
            </div>

            {/* What This Funds */}
            <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4 text-slate-300">
              <span className="font-medium text-white">What this funds:</span> 18 months to ship
              enterprise-ready Teams plan + paid pilots → repeatable GTM motion.
            </div>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-cobalt-500 hover:bg-cobalt-600 text-white"
                asChild
              >
                <a href="mailto:grae@getpmkit.com">
                  Book Founder Call
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/demo">
                  <Play className="mr-2 h-4 w-4" />
                  View Demo Console
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Background Effects */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 left-1/4 h-[600px] w-[600px] rounded-full bg-cobalt-600/20 blur-[128px]" />
          <div className="absolute -bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-600/20 blur-[128px]" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-4">
              The Problem
            </Badge>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Enterprise PM reality
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Signal is scattered across Slack, Jira, Confluence, Gong, and Zendesk. PMs spend their
              days synthesizing instead of strategizing.
            </p>
          </div>

          <div className="mt-12 mx-auto max-w-3xl">
            <Card className="border-0 bg-white shadow-lg p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <MessageSquare className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      "I spend the first two hours of every day just catching up on Slack and Jira"
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      — Repeated in PM interviews across B2B SaaS companies
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <Calendar className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      "Meeting prep takes 30-45 minutes per customer call, and I have 4-5 a day"
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      — Common pattern in enterprise PM workflows
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <FileText className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      "By the time I've gathered all the context for a PRD, I'm too tired to write
                      it well"
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      — The synthesis tax on strategic output
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="cobalt" className="mb-4">
              What pmkit Does
            </Badge>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              The cadence factory
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              pmkit runs scheduled workflows that produce artifact-first outputs—MD and JSON files
              with evidence links—ready for review and approval.
            </p>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cadenceOutputs.map((output, index) => (
              <Card key={output.name} className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cobalt-100 text-cobalt-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <h3 className="font-heading font-semibold">{output.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{output.description}</p>
              </Card>
            ))}
          </div>

          {/* Demo CTA */}
          <div className="mt-16 rounded-2xl border-2 border-dashed border-cobalt-200 bg-cobalt-50/50 p-12 text-center">
            <div className="mx-auto max-w-md">
              <Play className="mx-auto h-12 w-12 text-cobalt-400" />
              <h3 className="mt-4 font-heading text-xl font-semibold">See it in action</h3>
              <p className="mt-2 text-muted-foreground">
                Run all 7 workflow jobs in the interactive demo with mock data.
              </p>
              <Button className="mt-6" asChild>
                <Link href="/demo">
                  Launch Demo Console
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-4">
              Why We Win
            </Badge>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Differentiators
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {differentiators.map((diff) => (
              <div
                key={diff.title}
                className="flex gap-4 rounded-xl border bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-cobalt-100">
                  <diff.icon className="h-6 w-6 text-cobalt-600" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold">{diff.title}</h3>
                  <p className="mt-1 text-muted-foreground">{diff.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Readiness */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
            <div>
              <Badge variant="outline" className="mb-4">
                Product Readiness
              </Badge>
              <h2 className="font-heading text-3xl font-bold">
                Pre-revenue validation
              </h2>
              <p className="mt-4 text-muted-foreground">
                Working product with governance baseline. Moving into paid pilots.
              </p>

              <ul className="mt-8 space-y-4">
                {productReadiness.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-cobalt-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Status:</span> Pre-revenue. Moving into paid
                  pilots with explicit success metrics.
                </p>
              </div>
            </div>

            <div>
              <Badge variant="outline" className="mb-4">
                Validation Plan
              </Badge>
              <h2 className="font-heading text-3xl font-bold">
                Next 60–90 days
              </h2>
              <p className="mt-4 text-muted-foreground">
                Close paid pilots with explicit success metrics:
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {validationMetrics.map((item) => (
                  <Card key={item.metric} className="p-4">
                    <div className="font-medium">{item.metric}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-slate-900 to-cobalt-950 text-white">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 border-cobalt-400/30 bg-cobalt-500/10 text-cobalt-300">
              Market Opportunity
            </Badge>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Bottom-up TAM
            </h2>
            <p className="mt-4 text-lg text-slate-300">
              We size the market from our ICP, not analyst reports.
            </p>
          </div>

          <div className="mt-12 mx-auto max-w-3xl">
            <Card className="bg-white/5 border-white/10 p-8">
              <div className="space-y-6 text-slate-200">
                <div className="grid grid-cols-3 gap-4 text-center border-b border-white/10 pb-6">
                  <div>
                    <div className="text-2xl font-bold text-white">50K+</div>
                    <div className="text-sm text-slate-400">B2B SaaS companies</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">×5</div>
                    <div className="text-sm text-slate-400">Avg PM seats</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">$900</div>
                    <div className="text-sm text-slate-400">Per seat/year</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-cobalt-400">$225M+</div>
                  <div className="mt-2 text-slate-300">Addressable market in our ICP alone</div>
                </div>
                <p className="text-sm text-slate-400 text-center">
                  Expands significantly with Enterprise tier, additional seats, and adjacent roles
                  (PMM, CS, Sales Eng).
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Business Model */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-4">
              Business Model
            </Badge>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              SaaS pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Annual subscriptions with per-seat pricing. No credits—fair use with enforceable caps.
            </p>
          </div>

          <div className="mt-16 mx-auto max-w-5xl grid gap-8 md:grid-cols-2">
            {/* Teams Plan */}
            <Card className="p-8">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Teams
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold">$900</span>
                <span className="text-muted-foreground">/seat/year</span>
              </div>
              <div className="text-sm text-muted-foreground">Minimum 5 seats · Annual only</div>

              <div className="mt-8 space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Authentication</div>
                  <p className="text-sm text-muted-foreground">OIDC SSO included</p>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Cadence Jobs</div>
                  <p className="text-sm text-muted-foreground">All 6 workflows included</p>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Connectors</div>
                  <p className="text-sm text-muted-foreground">
                    Jira, Confluence, Slack, Gong, Zendesk
                  </p>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Governance</div>
                  <p className="text-sm text-muted-foreground">
                    RBAC, proposal approvals, audit logs (view), usage analytics
                  </p>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Retention</div>
                  <p className="text-sm text-muted-foreground">90 days (30-day option available)</p>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Data Training</div>
                  <p className="text-sm text-muted-foreground">Never trained on your data</p>
                </div>
              </div>
            </Card>

            {/* Enterprise Plan */}
            <Card className="p-8 border-2 border-cobalt-500 relative">
              <div className="absolute -top-3 left-6">
                <Badge className="bg-cobalt-600">Enterprise</Badge>
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Enterprise
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <div className="text-sm text-muted-foreground">Minimum 10 seats · Annual</div>

              <div className="mt-8 space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Everything in Teams, plus:</div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cobalt-600 mt-0.5" />
                  <span className="text-sm">SAML + SCIM provisioning</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cobalt-600 mt-0.5" />
                  <span className="text-sm">Custom connectors</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cobalt-600 mt-0.5" />
                  <span className="text-sm">Audit export API + extended retention</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cobalt-600 mt-0.5" />
                  <span className="text-sm">BYO LLM endpoint</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cobalt-600 mt-0.5" />
                  <span className="text-sm">Higher limits + dedicated capacity</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cobalt-600 mt-0.5" />
                  <span className="text-sm">SLAs + priority support</span>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Roadmap:</span> Data residency, customer-managed
                    keys, private networking
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Fair Use & Limits */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-4">
              Fair Use
            </Badge>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              No credits, but enforceable caps
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We don't use credit systems. Instead, we apply fair use limits that scale with your
              plan.
            </p>
          </div>

          <div className="mt-12 mx-auto max-w-2xl grid gap-4 sm:grid-cols-2">
            {fairUseLimits.map((item) => (
              <Card key={item.limit} className="p-4">
                <div className="font-medium">{item.limit}</div>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </Card>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Enterprise customers can raise limits and access dedicated capacity.
          </p>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge variant="outline" className="mb-4">
                Trust & Security
              </Badge>
              <h2 className="font-heading text-3xl font-bold">
                Enterprise-ready security
              </h2>
              <p className="mt-4 text-muted-foreground">
                Built for teams that need governance without friction.
              </p>

              <ul className="mt-8 space-y-3">
                {trustPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-cobalt-600" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Compliance:</span> SOC 2 Type II in progress.
                  ISO 27001 planned post-SOC 2. DPA available on request.
                </p>
              </div>

              <div className="mt-6">
                <Button variant="outline" asChild>
                  <Link href="/trust">
                    View Trust Center
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                Audit Log Preview
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
                  <span className="text-cobalt-600">artifact.created</span> brief_2026-01-02.md
                </div>
                <div className="rounded bg-muted p-2">
                  <span className="text-cobalt-600">proposal.pending</span> awaiting approval
                </div>
                <div className="rounded bg-muted p-2">
                  <span className="text-emerald-600">proposal.approved</span> by sarah.chen
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use of Funds & Timeline */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container">
          <div className="grid gap-16 lg:grid-cols-2">
            {/* Use of Funds */}
            <div>
              <Badge variant="outline" className="mb-4">
                Use of Funds
              </Badge>
              <h2 className="font-heading text-3xl font-bold">
                18-month runway
              </h2>
              <p className="mt-4 text-muted-foreground">
                €2M to build the team, ship enterprise features, and establish repeatable GTM.
              </p>

              <div className="mt-8 space-y-6">
                {useOfFunds.map((item) => (
                  <div key={item.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{item.category}</span>
                      <span className="text-muted-foreground">{item.percentage}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cobalt-500 to-cobalt-600 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                    <ul className="mt-2 space-y-1">
                      {item.milestones.map((milestone) => (
                        <li key={milestone} className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-cobalt-400" />
                          {milestone}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <Badge variant="outline" className="mb-4">
                Roadmap
              </Badge>
              <h2 className="font-heading text-3xl font-bold">
                Path to Series A
              </h2>
              <p className="mt-4 text-muted-foreground">
                Milestone-gated execution with clear success criteria.
              </p>

              <div className="mt-8 space-y-6">
                {timeline.map((item, index) => (
                  <div key={item.quarter} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cobalt-100 text-cobalt-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="w-0.5 flex-1 bg-cobalt-100 mt-2" />
                      )}
                    </div>
                    <div className="pb-6">
                      <div className="text-sm font-medium text-cobalt-600">{item.quarter}</div>
                      <div className="font-heading text-lg font-semibold">{item.milestone}</div>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-4">
              Team
            </Badge>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Solo founder, strong founder-market fit
            </h2>
          </div>

          <div className="mt-12 mx-auto max-w-2xl">
            <Card className="p-8">
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-cobalt-400 to-violet-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                  G
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-heading text-xl font-semibold">Founder</h3>
                  <p className="mt-2 text-muted-foreground">
                    Exited ModerateKit (April 2025). Background in enterprise PM tooling and
                    B2B SaaS operations. Deep understanding of the PM workflow pain points from
                    years of building and operating product teams.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <Badge variant="outline">Enterprise SaaS</Badge>
                    <Badge variant="outline">Product Management</Badge>
                    <Badge variant="outline">Previous Exit</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* The Ask */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-cobalt-600 via-cobalt-700 to-violet-700 text-white">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl md:text-5xl">
              Join us in building the future of PM
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-cobalt-100 text-lg">
              We're raising €2M at a €10M post-money valuation to build the definitive AI toolkit
              for Product Managers.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 text-center max-w-lg mx-auto">
              <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold">€2M</div>
                <div className="mt-1 text-sm text-cobalt-200">Raising</div>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold">€10M</div>
                <div className="mt-1 text-sm text-cobalt-200">Post-Money</div>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-white text-cobalt-700 hover:bg-white/90"
                asChild
              >
                <a href="mailto:grae@getpmkit.com">
                  Book Founder Call
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
                asChild
              >
                <Link href="/demo">
                  <Play className="mr-2 h-4 w-4" />
                  View Demo Console
                </Link>
              </Button>
            </div>

            <div className="mt-8">
              <a
                href="mailto:grae@getpmkit.com"
                className="text-cobalt-200 hover:text-white transition-colors inline-flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                grae@getpmkit.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-8 bg-slate-100 text-center text-sm text-muted-foreground">
        <div className="container space-y-2">
          <p>
            This page is intended for qualified investors only. This is not an offer to sell
            securities.
          </p>
          <p>
            Information presented contains forward-looking statements and is subject to change.
          </p>
          <p className="text-xs">
            {pageVersion} · {pageDate}
          </p>
        </div>
      </section>
    </div>
  );
}
