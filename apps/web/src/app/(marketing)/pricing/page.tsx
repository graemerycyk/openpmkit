import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Building2, Users, Zap, Shield, HelpCircle } from 'lucide-react';
import { siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Pricing | pmkit - AI PM Workflow Automation',
  description:
    'pmkit pricing: Teams plan at $49/seat/month (billed annually) for product teams, Enterprise for custom deployments with SAML/SCIM and advanced controls.',
  keywords: [
    'pmkit pricing',
    'AI product management pricing',
    'PM automation cost',
    'product management software pricing',
    'enterprise PM tools',
    'AI PRD generator pricing',
  ],
  openGraph: {
    title: 'pmkit Pricing: Teams & Enterprise',
    description: 'Annual pricing for product teams. Teams at $49/seat/month billed annually, Enterprise custom.',
    url: `${siteConfig.url}/pricing`,
  },
  twitter: {
    card: 'summary',
    title: 'pmkit Pricing',
    description: 'Teams plan at $49/seat/month, Enterprise custom pricing.',
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
  minSeats: number;
  badge: string | null;
  features: PlanFeature[];
  cta: string;
  ctaHref: string;
  ctaVariant: 'default' | 'outline';
  highlighted: boolean;
}

const plans: Plan[] = [
  {
    name: 'Teams',
    description: 'For product teams with SSO, core connectors, and governance',
    price: '$49',
    priceDetail: 'per seat / month',
    billingNote: 'Billed annually ($588/seat/year)',
    minSeats: 5,
    badge: null,
    features: [
      { name: 'Minimum 5 seats', included: true },
      { name: 'Annual billing only', included: true },
      { name: 'SSO (Google Workspace + Microsoft Entra ID)', included: true, detail: 'OIDC' },
      { name: 'All connectors: Jira, Confluence, Slack, Gong, Zendesk', included: true },
      { name: 'All 10 workflow jobs', included: true },
      { name: 'Team usage analytics', included: true },
      { name: 'RBAC + proposal approvals', included: true },
      { name: 'Audit logs (view)', included: true },
      { name: '90-day artifact retention', included: true, detail: '30-day available' },
      { name: 'No training on your data', included: true },
    ],
    cta: 'Start with Teams',
    ctaHref: '/contact?plan=teams',
    ctaVariant: 'default' as const,
    highlighted: true,
  },
  {
    name: 'Enterprise',
    description: 'Custom pricing with SAML/SCIM, custom connectors, and enterprise controls',
    price: 'Custom',
    priceDetail: 'annual contract',
    billingNote: null,
    minSeats: 10,
    badge: 'Sales-led',
    features: [
      { name: 'Everything in Teams, plus:', included: true, isHeader: true },
      { name: 'SAML SSO + SCIM provisioning', included: true },
      { name: 'Custom connectors (built on demand)', included: true },
      { name: 'Audit export API + longer retention', included: true },
      { name: 'BYO LLM endpoint (OpenAI, Azure, self-hosted)', included: true },
      { name: 'Data residency options', included: true, detail: 'Coming soon' },
      { name: 'Customer-managed keys (KMS)', included: true, detail: 'Coming soon' },
      { name: 'Private networking / on-prem', included: true, detail: 'Coming soon' },
      { name: 'SLAs + dedicated support', included: true },
      { name: '5× higher workflow limits', included: true },
    ],
    cta: 'Contact Sales',
    ctaHref: '/contact?plan=enterprise',
    ctaVariant: 'outline' as const,
    highlighted: false,
  },
];

const jobTypes = [
  { name: 'Daily Brief', schedule: '1/day/workspace', onDemand: '4/month/seat' },
  { name: 'Weekly Themes (VoC)', schedule: '1/week/workspace', onDemand: '4/month/seat' },
  { name: 'Competitor Research', schedule: '1/week/workspace', onDemand: '4/month/seat' },
  { name: 'Meeting Prep Pack', schedule: 'On-demand', onDemand: '30/month/seat' },
  { name: 'PRD Pack', schedule: 'On-demand', onDemand: '12/month/seat' },
  { name: 'Roadmap Alignment Memo', schedule: 'On-demand', onDemand: '12/month/seat' },
  { name: 'Sprint Review Pack', schedule: 'On-demand', onDemand: '8/month/seat' },
  { name: 'Release Notes', schedule: 'On-demand', onDemand: '16/month/seat' },
  { name: 'Prototype Generation', schedule: 'On-demand', onDemand: '8/month/seat' },
  { name: 'Deck Content', schedule: 'On-demand', onDemand: '12/month/seat' },
];

const faqs = [
  {
    question: 'Why annual-only billing?',
    answer:
      'Agent workloads are costlier than typical SaaS tools. Annual billing aligns our economics with the value we deliver and allows us to offer better pricing than month-to-month.',
  },
  {
    question: 'What counts as a seat?',
    answer:
      'A seat is an active user who can trigger jobs and view outputs. Inactive users can be deactivated without counting against your seat limit. You can reassign seats as your team changes.',
  },
  {
    question: 'Are there usage limits?',
    answer:
      'Yes. Scheduled jobs (Daily Brief, Weekly Themes, Competitor Research) run at fixed cadences per workspace. On-demand jobs have generous per-seat monthly limits. Enterprise customers get 5× higher limits and can purchase additional capacity.',
  },
  {
    question: 'What about concurrency?',
    answer:
      'Teams plan includes 2 concurrent runs per 10 seats. Enterprise customers get higher concurrency limits. This prevents any single team from overwhelming shared infrastructure.',
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
      'Yes! The demo runs all 10 jobs with realistic simulated data. For a trial with your own data, contact sales to discuss a pilot program.',
  },
  {
    question: 'What SSO providers are supported?',
    answer:
      'Teams plan supports OIDC SSO with Google Workspace and Microsoft Entra ID (Azure AD). Enterprise plan adds SAML SSO and SCIM directory sync for any compatible identity provider.',
  },
];

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
              Annual pricing for product teams
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Two plans: Teams for growing product orgs, Enterprise for custom deployments.
              Both include all connectors, all 10 workflow jobs, and full audit trails.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`flex flex-col ${plan.highlighted ? 'border-cobalt-600 shadow-lg ring-1 ring-cobalt-600' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {plan.name === 'Teams' ? (
                        <Users className="h-5 w-5 text-cobalt-600" />
                      ) : (
                        <Building2 className="h-5 w-5 text-cobalt-600" />
                      )}
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    </div>
                    {plan.badge && (
                      <Badge variant="outline" className="text-xs">
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
                  {plan.minSeats > 1 && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Minimum {plan.minSeats} seats
                      {plan.name === 'Teams' && (
                        <span className="ml-1">
                          · Starting at ${(588 * plan.minSeats).toLocaleString()}/year
                        </span>
                      )}
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
                    <Link href={plan.ctaHref}>{plan.cta}</Link>
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
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cobalt-100">
                <Zap className="h-6 w-6 text-cobalt-600" />
              </div>
              <h2 className="font-heading text-3xl font-bold">Job Runs & Limits</h2>
              <p className="mt-4 text-muted-foreground">
                Scheduled jobs run at fixed cadences. On-demand jobs have per-seat monthly limits.
              </p>
            </div>

            <div className="mt-12 overflow-hidden rounded-lg border bg-background">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium">Job Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Scheduled</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">On-Demand Limit</th>
                  </tr>
                </thead>
                <tbody>
                  {jobTypes.map((job, idx) => (
                    <tr key={job.name} className={idx % 2 === 0 ? '' : 'bg-muted/20'}>
                      <td className="px-4 py-3 text-sm font-medium">{job.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {job.schedule}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {job.onDemand}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Need higher limits? Enterprise customers can purchase additional capacity packs.
            </p>
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
              Try the demo with simulated data, or contact sales for a personalized walkthrough with your
              own tools.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/demo">Try the Demo</Link>
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
