import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ArrowRight, ArrowLeft, Check, MessageSquare, FileText, Sunrise, Quote } from 'lucide-react';
import { siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Slack Integration | pmkit - AI Daily Briefs from Slack',
  description:
    'Connect pmkit with Slack for AI-powered daily briefs, channel synthesis, and cited insights. Never miss important updates again.',
  keywords: [
    'Slack AI integration',
    'Slack daily brief',
    'Slack synthesis AI',
    'product management Slack',
    'Slack to PRD',
    'pmkit Slack',
  ],
  openGraph: {
    title: 'pmkit + Slack Integration',
    description: 'AI-powered daily briefs and synthesis from your Slack channels.',
    url: `${siteConfig.url}/integrations/slack`,
  },
  alternates: {
    canonical: `${siteConfig.url}/integrations/slack`,
  },
};

const features = [
  {
    icon: Sunrise,
    title: 'Daily Brief Generation',
    description: 'Wake up to a synthesized brief of overnight Slack activity from your selected channels.',
  },
  {
    icon: Quote,
    title: 'Cited Insights',
    description: 'Every insight in PRDs and briefs links back to the original Slack message.',
  },
  {
    icon: FileText,
    title: 'PRD Evidence',
    description: 'Customer conversations from Slack become evidence citations in your PRDs.',
  },
  {
    icon: MessageSquare,
    title: 'Channel Selection',
    description: 'Choose which channels to monitor. Focus on customer, sales, and product channels.',
  },
];

const useCases = [
  {
    title: 'Morning Briefs',
    description: 'Start your day with a synthesized summary of what happened overnight in key Slack channels.',
  },
  {
    title: 'Feature Intelligence',
    description: 'Customer feedback shared in Slack gets clustered into themes with citations.',
  },
  {
    title: 'Evidence-Backed PRDs',
    description: 'When writing PRDs, pmkit pulls relevant Slack conversations as evidence.',
  },
];

const faqs = [
  {
    question: 'How does pmkit connect to Slack?',
    answer: 'pmkit uses Slack OAuth for secure authentication. You authorize pmkit to access specific channels, and your credentials are encrypted at rest. pmkit reads messages but never posts without your approval.',
  },
  {
    question: 'What Slack permissions does pmkit need?',
    answer: 'pmkit needs channels:history and channels:read to read public channels, groups:history and groups:read for private channels you add it to, and users:read to display author names.',
  },
  {
    question: 'Can pmkit post to Slack?',
    answer: 'Currently pmkit is read-only for Slack. It synthesizes messages into daily briefs and PRDs. Slack posting for brief delivery is on the roadmap.',
  },
  {
    question: 'How far back does pmkit read?',
    answer: 'Daily briefs pull the last 24-36 hours (configurable). For PRD evidence, pmkit can search further back to find relevant customer conversations.',
  },
  {
    question: 'Which channels should I connect?',
    answer: 'Start with channels where customer feedback appears: #customer-feedback, #sales-calls, #support-escalations, #product-requests. You can add or remove channels anytime.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. OAuth tokens are encrypted with AES-256. pmkit processes messages in memory and only stores citations, not full message content. We\'re SOC 2 Type II compliant (in progress).',
  },
];

export default function SlackIntegrationPage() {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
              { '@type': 'ListItem', position: 2, name: 'Integrations', item: `${siteConfig.url}/integrations` },
              { '@type': 'ListItem', position: 3, name: 'Slack', item: `${siteConfig.url}/integrations/slack` },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
          }),
        }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-cobalt-50/50 to-background py-16 md:py-24">
        <div className="container">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/integrations">
                <ArrowLeft className="mr-2 h-4 w-4" />
                All Integrations
              </Link>
            </Button>
          </div>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-cobalt-100">
              <MessageSquare className="h-8 w-8 text-cobalt-600" />
            </div>
            <Badge variant="cobalt" className="mb-4">
              Integration
            </Badge>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              pmkit + <span className="text-cobalt-600">Slack</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Never miss important conversations again. pmkit synthesizes your Slack channels
              into daily briefs and cites messages directly in your PRDs.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/demo">
                  Try the Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/how-it-works">How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">What You Can Do</h2>
            <p className="mt-4 text-muted-foreground">
              pmkit reads your Slack channels and synthesizes them into actionable insights.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cobalt-100">
                      <feature.icon className="h-5 w-5 text-cobalt-600" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">Use Cases</h2>
            <p className="mt-4 text-muted-foreground">
              How product teams use pmkit with Slack.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-3xl space-y-6">
            {useCases.map((useCase, index) => (
              <div key={useCase.title} className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-cobalt-600 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold">{useCase.title}</h3>
                  <p className="mt-1 text-muted-foreground">{useCase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <Card className="border-2 border-cobalt-200">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Security & Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    'Slack OAuth authentication',
                    'Credentials encrypted with AES-256',
                    'Messages processed in memory only',
                    'Only citations stored, not full content',
                    'You control which channels to connect',
                    'SOC 2 Type II compliance (in progress)',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-cobalt-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-2xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cobalt-600 py-16 text-white md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">See Slack Integration in Action</h2>
            <p className="mt-4 text-cobalt-100">
              Try the demo to see daily briefs synthesized from Slack channels.
            </p>
            <div className="mt-8">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/demo">
                  Try the Demo
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
