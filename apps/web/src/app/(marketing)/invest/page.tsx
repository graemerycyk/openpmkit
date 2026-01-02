import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  TrendingUp,
  Users,
  Target,
  Zap,
  Shield,
  Globe,
  CheckCircle2,
  BarChart3,
  Layers,
  Clock,
  FileText,
  MessageSquare,
  Mail,
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

const problemPoints = [
  {
    stat: '60%',
    description: 'of PM time spent on information gathering, not strategy',
  },
  {
    stat: '4.2hrs',
    description: 'average daily time PMs spend in meetings and prep',
  },
  {
    stat: '$180K+',
    description: 'average fully-loaded cost of a senior PM annually',
  },
];

const marketStats = [
  { value: '$12B', label: 'Product Management Software TAM by 2028' },
  { value: '$8.4B', label: 'Enterprise AI Agents Market by 2027' },
  { value: '1.2M+', label: 'Product Managers in the US alone' },
];

const differentiators = [
  {
    icon: Shield,
    title: 'Draft-Only Architecture',
    description:
      'Never writes directly to external systems. Every output is a proposal for human review.',
  },
  {
    icon: Layers,
    title: 'MCP-Native Connectors',
    description:
      'Built on the Model Context Protocol for enterprise-grade tool integrations with full audit trails.',
  },
  {
    icon: Target,
    title: 'Vertical Focus',
    description:
      'Purpose-built for Product Management workflows, not a horizontal AI assistant.',
  },
  {
    icon: Zap,
    title: 'Cadence-Driven',
    description:
      'Scheduled jobs (daily briefs, weekly themes) that run automatically, not just on-demand.',
  },
];

const traction = [
  { metric: 'Beta Users', value: '50+', trend: 'Active testers' },
  { metric: 'Demo Sessions', value: '200+', trend: 'In last 30 days' },
  { metric: 'Waitlist', value: '1,200+', trend: 'Enterprise leads' },
  { metric: 'LOIs', value: '3', trend: 'Enterprise pilots' },
];

const useOfFunds = [
  { category: 'Engineering', percentage: 50, description: 'Core platform & MCP connectors' },
  { category: 'Go-to-Market', percentage: 25, description: 'Sales & marketing' },
  { category: 'Operations', percentage: 15, description: 'Infrastructure & compliance' },
  { category: 'Buffer', percentage: 10, description: 'Contingency' },
];

const timeline = [
  { quarter: 'Q1 2026', milestone: 'GA Launch', description: 'Public launch with core 6 workflows' },
  { quarter: 'Q2 2026', milestone: 'Enterprise Pilots', description: '5-10 paid enterprise pilots' },
  { quarter: 'Q3 2026', milestone: 'SOC 2 Type II', description: 'Enterprise compliance certification' },
  { quarter: 'Q4 2026', milestone: 'Series A Ready', description: '$1M+ ARR target' },
];

export default function InvestPage() {
  return (
    <div className="relative">
      {/* Confidential Banner */}
      <div className="bg-amber-50 border-b border-amber-200 py-2 text-center text-sm text-amber-800">
        <span className="font-medium">Confidential</span> — For qualified investors only. Do not
        distribute.
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
              pmkit automates the 60% of PM work that's information gathering—daily briefs, meeting
              prep, VoC clustering, and PRD drafts—so PMs can focus on strategy.
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

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-cobalt-500 hover:bg-cobalt-600 text-white"
                asChild
              >
                <Link href="/contact">
                  Schedule a Call
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/demo">Try the Demo</Link>
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
              Product Managers are drowning in busywork
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The best PMs should be thinking strategically—but most of their time is spent
              gathering information, prepping for meetings, and synthesizing feedback.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {problemPoints.map((point, index) => (
              <Card
                key={index}
                className="border-0 bg-white shadow-lg text-center p-8"
              >
                <div className="text-5xl font-bold text-cobalt-600">{point.stat}</div>
                <p className="mt-4 text-muted-foreground">{point.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="cobalt" className="mb-4">
              Our Solution
            </Badge>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              An AI agent that runs your PM workflows
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              pmkit connects to your existing tools and runs scheduled jobs—daily briefs, meeting
              prep, VoC clustering, competitor intel, and PRD drafts—automatically.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {differentiators.map((diff) => (
              <div
                key={diff.title}
                className="flex gap-4 rounded-xl border bg-card p-6"
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

          {/* Product Screenshot/Demo CTA */}
          <div className="mt-16 rounded-2xl border-2 border-dashed border-cobalt-200 bg-cobalt-50/50 p-12 text-center">
            <div className="mx-auto max-w-md">
              <FileText className="mx-auto h-12 w-12 text-cobalt-400" />
              <h3 className="mt-4 font-heading text-xl font-semibold">See it in action</h3>
              <p className="mt-2 text-muted-foreground">
                Try the interactive demo with mock data to see how pmkit generates briefs, meeting
                packs, and PRDs.
              </p>
              <Button className="mt-6" asChild>
                <Link href="/demo">
                  Launch Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
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
              A massive, underserved market
            </h2>
            <p className="mt-4 text-lg text-slate-300">
              Product Management tools have focused on roadmapping and project tracking. The
              day-to-day PM workflow is ripe for AI automation.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {marketStats.map((stat) => (
              <div
                key={stat.label}
                className="text-center rounded-xl border border-white/10 bg-white/5 p-8"
              >
                <div className="text-4xl font-bold text-cobalt-400">{stat.value}</div>
                <p className="mt-3 text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 mx-auto max-w-3xl">
            <h3 className="font-heading text-xl font-semibold text-center mb-8">
              Why Now?
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                <span className="text-slate-200">
                  LLMs now capable of complex reasoning and synthesis
                </span>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                <span className="text-slate-200">
                  MCP protocol enables secure enterprise integrations
                </span>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                <span className="text-slate-200">
                  Enterprise AI budgets growing 40%+ YoY
                </span>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                <span className="text-slate-200">
                  PM teams under pressure to do more with less
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Traction Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-4">
              Traction
            </Badge>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Early momentum
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We're in beta with active users and enterprise interest.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {traction.map((item) => (
              <Card key={item.metric} className="text-center p-6">
                <div className="text-4xl font-bold text-cobalt-600">{item.value}</div>
                <div className="mt-2 font-medium">{item.metric}</div>
                <div className="mt-1 text-sm text-muted-foreground">{item.trend}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Business Model */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-4">
              Business Model
            </Badge>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              SaaS with usage-based pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Per-seat subscription with job execution credits. Enterprise tiers include SSO, audit
              logs, and custom connectors.
            </p>
          </div>

          <div className="mt-16 mx-auto max-w-4xl grid gap-8 md:grid-cols-3">
            <Card className="p-6 text-center">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Starter
              </div>
              <div className="mt-2 text-3xl font-bold">€49</div>
              <div className="text-sm text-muted-foreground">/user/month</div>
              <ul className="mt-6 space-y-2 text-sm text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                  100 job runs/month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                  Core integrations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                  7-day history
                </li>
              </ul>
            </Card>
            <Card className="p-6 text-center border-2 border-cobalt-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-cobalt-600">Popular</Badge>
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Team
              </div>
              <div className="mt-2 text-3xl font-bold">€99</div>
              <div className="text-sm text-muted-foreground">/user/month</div>
              <ul className="mt-6 space-y-2 text-sm text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                  500 job runs/month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                  All integrations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                  90-day history
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                  Team sharing
                </li>
              </ul>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Enterprise
              </div>
              <div className="mt-2 text-3xl font-bold">Custom</div>
              <div className="text-sm text-muted-foreground">contact us</div>
              <ul className="mt-6 space-y-2 text-sm text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                  Unlimited runs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                  SSO & SCIM
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                  Custom connectors
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                  Dedicated support
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Use of Funds & Timeline */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid gap-16 lg:grid-cols-2">
            {/* Use of Funds */}
            <div>
              <Badge variant="outline" className="mb-4">
                Use of Funds
              </Badge>
              <h2 className="font-heading text-3xl font-bold">
                18-month runway to Series A
              </h2>
              <p className="mt-4 text-muted-foreground">
                We're raising €2M to build the team, ship the product, and acquire early customers.
              </p>

              <div className="mt-8 space-y-4">
                {useOfFunds.map((item) => (
                  <div key={item.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{item.category}</span>
                      <span className="text-muted-foreground">{item.percentage}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cobalt-500 to-cobalt-600 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
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
                Clear milestones to demonstrate product-market fit and enterprise readiness.
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
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-4">
              Team
            </Badge>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Built by PMs, for PMs
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our founding team combines deep product management experience with enterprise SaaS
              expertise.
            </p>
          </div>

          <div className="mt-16 mx-auto max-w-2xl">
            <Card className="p-8">
              <div className="text-center">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-cobalt-400 to-violet-500 flex items-center justify-center text-white text-2xl font-bold">
                  G
                </div>
                <h3 className="mt-4 font-heading text-xl font-semibold">Founding Team</h3>
                <p className="mt-2 text-muted-foreground">
                  10+ years combined experience in product management and enterprise SaaS
                </p>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3 text-center text-sm">
                <div className="p-4 rounded-lg bg-slate-50">
                  <div className="font-medium">Product</div>
                  <div className="text-muted-foreground">Ex-Atlassian, Notion</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50">
                  <div className="font-medium">Engineering</div>
                  <div className="text-muted-foreground">Ex-Stripe, Vercel</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50">
                  <div className="font-medium">GTM</div>
                  <div className="text-muted-foreground">Ex-Salesforce, HubSpot</div>
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

            <div className="mt-12 grid gap-6 sm:grid-cols-3 text-center">
              <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold">€2M</div>
                <div className="mt-1 text-sm text-cobalt-200">Raising</div>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold">€10M</div>
                <div className="mt-1 text-sm text-cobalt-200">Post-Money</div>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold">€100K</div>
                <div className="mt-1 text-sm text-cobalt-200">Min. Check</div>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-white text-cobalt-700 hover:bg-white/90"
                asChild
              >
                <Link href="/contact">
                  Schedule a Call
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
                asChild
              >
                <a href="mailto:invest@getpmkit.com">
                  <Mail className="mr-2 h-4 w-4" />
                  invest@getpmkit.com
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-8 bg-slate-100 text-center text-sm text-muted-foreground">
        <div className="container">
          <p>
            This page is intended for qualified investors only. Information presented is subject to
            change. Past performance does not guarantee future results.
          </p>
        </div>
      </section>
    </div>
  );
}

