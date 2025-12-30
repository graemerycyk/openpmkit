import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'pmkit pricing for teams and enterprises. Contact sales for custom pricing and enterprise features.',
  openGraph: {
    title: 'pmkit Pricing',
    description: 'Contact sales for custom pricing and enterprise features.',
  },
};

const plans = [
  {
    name: 'Team',
    description: 'For product teams getting started with PM automation',
    price: 'Contact Sales',
    features: [
      'Up to 10 users',
      'All 6 job types',
      'Core integrations (Jira, Slack, Confluence)',
      'Daily job runs',
      'Standard support',
      '30-day artifact retention',
    ],
    cta: 'Contact Sales',
    ctaHref: '/contact',
    highlighted: false,
  },
  {
    name: 'Business',
    description: 'For growing teams with advanced workflow needs',
    price: 'Contact Sales',
    features: [
      'Up to 50 users',
      'All 6 job types',
      'All integrations (Gong, Zendesk, Analytics)',
      'Unlimited job runs',
      'Priority support',
      '90-day artifact retention',
      'Custom job templates',
      'RBAC with custom roles',
    ],
    cta: 'Contact Sales',
    ctaHref: '/contact',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    description: 'For organizations with compliance and governance requirements',
    price: 'Contact Sales',
    features: [
      'Unlimited users',
      'All 6 job types',
      'All integrations + custom connectors',
      'Unlimited job runs',
      'Dedicated support',
      'Unlimited artifact retention',
      'Custom job templates',
      'RBAC with custom roles',
      'SAML/OIDC SSO',
      'Audit log export',
      'SLA guarantees',
      'On-premise deployment option',
    ],
    cta: 'Contact Sales',
    ctaHref: '/contact',
    highlighted: false,
  },
];

const faqs = [
  {
    question: 'Is there a free trial?',
    answer:
      'Yes! You can try the full demo experience with mock data at no cost. For a trial with your own data, contact sales.',
  },
  {
    question: 'What integrations are included?',
    answer:
      'Team plans include Jira, Confluence, and Slack. Business and Enterprise plans include Gong, Zendesk, community platforms, and analytics tools. Enterprise customers can request custom connectors.',
  },
  {
    question: 'How does the draft-only model work?',
    answer:
      'pmkit agents propose changes (Jira epics, Confluence pages, Slack messages) but never write directly. You review and approve each proposal before it\'s published.',
  },
  {
    question: 'What about data security?',
    answer:
      'pmkit uses OAuth 2.0 for integrations, encrypts all credentials at rest, and provides full audit logging. Enterprise customers can deploy on-premise.',
  },
  {
    question: 'Can I use my own LLM?',
    answer:
      'Enterprise customers can configure their own LLM endpoints (OpenAI, Anthropic, Azure OpenAI, or self-hosted). Contact sales for details.',
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
              Simple, transparent pricing
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Contact sales for custom pricing tailored to your team size and requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`flex flex-col ${plan.highlighted ? 'border-cobalt-600 shadow-lg' : ''}`}
              >
                <CardHeader>
                  {plan.highlighted && (
                    <Badge variant="cobalt" className="mb-2 w-fit">
                      Most Popular
                    </Badge>
                  )}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <ul className="flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-cobalt-600" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-8 w-full"
                    variant={plan.highlighted ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href={plan.ctaHref}>{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
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

      {/* What's Coming */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cobalt-100">
                <Sparkles className="h-6 w-6 text-cobalt-600" />
              </div>
              <h2 className="font-heading text-3xl font-bold">What&apos;s coming</h2>
              <p className="mt-4 text-muted-foreground">
                We&apos;re actively building new features based on customer feedback.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Real Integrations</CardTitle>
                  <CardDescription>Connect your actual tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-cobalt-600" />
                      Jira Cloud OAuth integration
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-cobalt-600" />
                      Slack app with slash commands
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-cobalt-600" />
                      Persistent job history
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-cobalt-600" />
                      Team workspaces
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Enterprise Features</CardTitle>
                  <CardDescription>Security and compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-cobalt-600" />
                      SSO/SAML authentication
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-cobalt-600" />
                      Custom job templates
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-cobalt-600" />
                      API access
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-cobalt-600" />
                      Webhook notifications
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Want early access to new features?{' '}
                <Link href="/contact" className="font-medium text-cobalt-600 hover:underline">
                  Contact us
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cobalt-600 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold text-white">Ready to get started?</h2>
            <p className="mt-4 text-cobalt-100">
              Try the demo or contact sales for a personalized walkthrough.
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

