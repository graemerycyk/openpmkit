import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Building2, Users, Zap, Shield, HelpCircle, User, ArrowRight } from 'lucide-react';
import { siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Pricing | pmkit - AI PM Workflow Automation',
  description:
    'pmkit pricing: Individual plan at $49/month for solo PMs, Teams and Enterprise plans for product teams with SSO, governance, and collaboration.',
  keywords: [
    'pmkit pricing',
    'AI product management pricing',
    'PM automation cost',
    'product management software pricing',
    'enterprise PM tools',
    'AI PRD generator pricing',
  ],
  openGraph: {
    title: 'pmkit Pricing: Individual, Teams & Enterprise',
    description: 'Individual at $49/month, Teams and Enterprise custom pricing for product teams.',
    url: `${siteConfig.url}/pricing`,
  },
  twitter: {
    card: 'summary',
    title: 'pmkit Pricing',
    description: 'Individual at $49/month, Teams and Enterprise custom pricing.',
  },
  alternates: {
    canonical: `${siteConfig.url}/pricing`,
  },
};

interface PlanFeature {
  name: string;
  included: boolean;
  detail?: string;
  isHeader?: boolean;
}

interface Plan {
  name: string;
  description: string;
  price: string;
  priceDetail: string;
  billingNote: string | null;
  minSeats: number | null;
  badge: string | null;
  features: PlanFeature[];
  cta: string;
  ctaHref: string;
  ctaVariant: 'default' | 'outline';
  highlighted: boolean;
  icon: 'user' | 'users' | 'building';
}

const plans: Plan[] = [
  {
    name: 'Individual',
    description: 'For individual PMs who want to automate their daily workflows',
    price: '$49',
    priceDetail: 'per month',
    billingNote: 'Or $39/month billed annually ($468/year)',
    minSeats: null,
    badge: 'Most Popular',
    features: [
      { name: 'Single seat', included: true },
      { name: 'Monthly or annual billing', included: true },
      { name: 'All 10 workflow jobs', included: true },
      { name: 'All connectors: Slack, Jira, Confluence, Gong, Zendesk, Gmail, Google Calendar and more', included: true },
      { name: 'Amplitude, Discourse, Linear, Notion', included: true, detail: 'Coming soon' },
      { name: 'AI Crawlers: Social, Web, News', included: true, detail: 'Coming soon' },
      { name: 'Personal workspace', included: true },
      { name: '90-day artifact retention', included: true },
      { name: 'No training on your data', included: true },
    ],
    cta: 'Get Started',
    ctaHref: '/signup?plan=individual',
    ctaVariant: 'default' as const,
    highlighted: true,
    icon: 'user',
  },
  {
    name: 'Teams',
    description: 'For product teams with SSO, governance, and collaboration',
    price: 'Custom',
    priceDetail: 'per seat / month',
    billingNote: 'Contact sales for pricing',
    minSeats: 5,
    badge: null,
    features: [
      { name: 'Everything in Individual, plus:', included: true, isHeader: true },
      { name: 'Minimum 5 seats', included: true },
      { name: 'SSO (Google Workspace + Microsoft Entra ID)', included: true, detail: 'OIDC' },
      { name: 'Team usage analytics', included: true },
      { name: 'RBAC + proposal approvals', included: true },
      { name: 'Audit logs (view)', included: true },
      { name: 'Shared workspaces', included: true },
    ],
    cta: 'Contact Sales',
    ctaHref: '/contact?plan=teams',
    ctaVariant: 'outline' as const,
    highlighted: false,
    icon: 'users',
  },
  {
    name: 'Enterprise',
    description: 'For organizations with advanced security and compliance needs',
    price: 'Custom',
    priceDetail: 'annual contract',
    billingNote: null,
    minSeats: 10,
    badge: null,
    features: [
      { name: 'Everything in Teams, plus:', included: true, isHeader: true },
      { name: 'SAML SSO + SCIM provisioning', included: true },
      { name: 'Custom connectors (built on demand)', included: true },
      { name: 'Audit export API + longer retention', included: true },
      { name: 'BYO LLM endpoint (OpenAI, Azure, self-hosted)', included: true },
      { name: 'Data residency options', included: true, detail: 'Coming soon' },
      { name: 'Customer-managed keys (KMS)', included: true, detail: 'Coming soon' },
      { name: 'SLAs + dedicated support', included: true },
    ],
    cta: 'Contact Sales',
    ctaHref: '/contact?plan=enterprise',
    ctaVariant: 'outline' as const,
    highlighted: false,
    icon: 'building',
  },
];

const jobTypes = [
  { name: 'Daily Brief', individual: '31/month', teams: '31/month/seat', enterprise: '155/month/seat' },
  { name: 'Weekly Themes (VoC)', individual: '4/month', teams: '4/month/seat', enterprise: '20/month/seat' },
  { name: 'Competitor Research', individual: '4/month', teams: '4/month/seat', enterprise: '20/month/seat' },
  { name: 'Meeting Prep Pack', individual: '40/month', teams: '40/month/seat', enterprise: '200/month/seat' },
  { name: 'PRD Pack', individual: '12/month', teams: '12/month/seat', enterprise: '60/month/seat' },
  { name: 'Roadmap Alignment Memo', individual: '12/month', teams: '12/month/seat', enterprise: '60/month/seat' },
  { name: 'Sprint Review Pack', individual: '8/month', teams: '8/month/seat', enterprise: '40/month/seat' },
  { name: 'Release Notes', individual: '16/month', teams: '16/month/seat', enterprise: '80/month/seat' },
  { name: 'Prototype Generation', individual: '8/month', teams: '8/month/seat', enterprise: '40/month/seat' },
  { name: 'Deck Content', individual: '12/month', teams: '12/month/seat', enterprise: '60/month/seat' },
];

const faqs = [
  {
    question: 'What\'s included in the Individual plan?',
    answer:
      'Everything you need to automate your PM workflows: all 10 job types, all connectors (Slack, Jira, Confluence, Gong, Zendesk, Gmail, Google Drive, Google Calendar, Figma), and generous monthly run limits.',
  },
  {
    question: 'Can I upgrade from Individual to Teams later?',
    answer:
      'Yes! You can upgrade anytime. Your workspace, artifacts, and history are preserved. Just contact sales to discuss team pricing and we\'ll handle the transition.',
  },
  {
    question: 'What counts as a seat?',
    answer:
      'A seat is an active user who can trigger jobs and view outputs. Inactive users can be deactivated without counting against your seat limit. You can reassign seats as your team changes.',
  },
  {
    question: 'Are there usage limits?',
    answer:
      'Individual plan has unlimited on-demand runs. Teams plans have generous per-seat monthly limits for fair use across the organization. Enterprise customers can purchase additional capacity.',
  },
  {
    question: 'How do real connectors work vs. the demo?',
    answer:
      'The demo uses simulated data to show the experience. Paying customers get real OAuth connections to Jira, Confluence, Slack, Gong, and Zendesk. Connector credentials are encrypted and scoped to your permissions.',
  },
  {
    question: 'What does "no training on your data" mean?',
    answer:
      'We use the OpenAI API with business terms where data is not used for training by default. Enterprise customers can use their own LLM endpoints (Azure OpenAI, private models) for additional control.',
  },
  {
    question: 'Can I try before I buy?',
    answer:
      'Yes! The demo runs all 10 jobs with realistic simulated data. You can explore the full experience before connecting your real tools.',
  },
  {
    question: 'What SSO providers are supported?',
    answer:
      'Teams plan supports OIDC SSO with Google Workspace and Microsoft Entra ID (Azure AD). Enterprise plan adds SAML SSO and SCIM directory sync for any compatible identity provider.',
  },
];

function PlanIcon({ type }: { type: 'user' | 'users' | 'building' }) {
  if (type === 'user') return <User className="h-5 w-5 text-cobalt-600" />;
  if (type === 'users') return <Users className="h-5 w-5 text-cobalt-600" />;
  return <Building2 className="h-5 w-5 text-cobalt-600" />;
}

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-cobalt-50/50 to-background py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="cobalt" className="mb-4">
              Pricing
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              Simple pricing for every PM
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Start with Individual for solo workflows, or contact sales for team pricing.
              All plans include all connectors, all 10 workflow jobs, and full audit trails.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`flex flex-col ${plan.highlighted ? 'border-cobalt-600 shadow-lg ring-1 ring-cobalt-600' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PlanIcon type={plan.icon} />
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    </div>
                    {plan.badge && (
                      <Badge variant="cobalt" className="text-xs">
                        {plan.badge}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                  <div className="mt-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="ml-2 text-muted-foreground">{plan.priceDetail}</span>
                  </div>
                  {plan.billingNote && (
                    <p className="mt-1 text-sm text-muted-foreground">{plan.billingNote}</p>
                  )}
                  {plan.minSeats && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Minimum {plan.minSeats} seats
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <ul className="flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature.name}
                        className={`flex items-start gap-2 ${feature.isHeader ? 'font-medium text-foreground' : ''}`}
                      >
                        {!feature.isHeader && (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-cobalt-600" />
                        )}
                        <span className={`text-sm ${feature.isHeader ? '' : ''}`}>
                          {feature.name}
                          {feature.detail && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({feature.detail})
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button className="mt-8 w-full" variant={plan.ctaVariant} asChild>
                    <Link href={plan.ctaHref}>
                      {plan.cta}
                      {plan.highlighted && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Job Limits Table */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cobalt-100">
                <Zap className="h-6 w-6 text-cobalt-600" />
              </div>
              <h2 className="font-heading text-3xl font-bold">Job Runs & Limits</h2>
              <p className="mt-4 text-muted-foreground">
                Individual plan has unlimited on-demand runs. Teams plans have fair-use limits per seat.
              </p>
            </div>

            <div className="mt-12 overflow-hidden rounded-lg border bg-background">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium">Job Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Individual</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Teams</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {jobTypes.map((job, idx) => (
                    <tr key={job.name} className={idx % 2 === 0 ? '' : 'bg-muted/20'}>
                      <td className="px-4 py-3 text-sm font-medium">{job.name}</td>
                      <td className="px-4 py-3 text-sm text-cobalt-600 font-medium">
                        {job.individual}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {job.teams}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {job.enterprise}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Callout */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <Card className="border-cobalt-200 bg-cobalt-50/50">
              <CardContent className="flex flex-col items-center gap-6 p-8 md:flex-row">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-cobalt-100">
                  <Shield className="h-8 w-8 text-cobalt-600" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-heading text-xl font-bold">Enterprise-grade security</h3>
                  <p className="mt-2 text-muted-foreground">
                    Draft-only architecture, encrypted credentials, full audit trails, and no training
                    on your data. See our Trust Center for security practices and compliance status.
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/trust">View Trust Center</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cobalt-100">
              <HelpCircle className="h-6 w-6 text-cobalt-600" />
            </div>
            <h2 className="font-heading text-3xl font-bold">Frequently Asked Questions</h2>
          </div>
          <div className="mx-auto mt-12 max-w-3xl space-y-8">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-heading text-lg font-semibold">{faq.question}</h3>
                <p className="mt-2 text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cobalt-600 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold text-white">Ready to get started?</h2>
            <p className="mt-4 text-cobalt-100">
              Try the demo with simulated data, or sign up for the Individual plan to connect your real tools.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/demo">Try the Demo</Link>
              </Button>
              <Button
                size="lg"
                className="bg-white text-cobalt-600 hover:bg-cobalt-50"
                asChild
              >
                <Link href="/signup?plan=individual">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
