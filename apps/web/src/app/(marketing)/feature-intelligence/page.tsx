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
import { ArrowRight, Lightbulb, MessageSquare, TrendingUp, Layers, Target, Zap } from 'lucide-react';
import { siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Feature Intelligence | pmkit - AI-Powered Feature Prioritization',
  description:
    'Go beyond customer sentiment. Feature Intelligence synthesizes feedback into actionable feature recommendations with competitive context and internal alignment signals.',
  keywords: [
    'feature intelligence',
    'feature prioritization',
    'product intelligence',
    'voice of customer',
    'customer feedback analysis',
    'AI product management',
    'feature recommendations',
    'product roadmap prioritization',
  ],
  openGraph: {
    title: 'Feature Intelligence - pmkit',
    description: 'AI-powered feature prioritization that goes beyond sentiment analysis.',
    url: `${siteConfig.url}/feature-intelligence`,
  },
  alternates: {
    canonical: `${siteConfig.url}/feature-intelligence`,
  },
};

const comparisonItems = [
  {
    traditional: '47 users mentioned onboarding confusion',
    intelligent: 'Add a progress indicator to onboarding (47 mentions). Competitors X and Y use step wizards. Your eng lead flagged mobile as Q1 priority.',
  },
  {
    traditional: 'Search is a common complaint',
    intelligent: 'Implement fuzzy search with typo tolerance (31 tickets). Top competitor launched this last month. 3 enterprise deals blocked by this.',
  },
  {
    traditional: 'Users want better reporting',
    intelligent: 'Add CSV export to dashboard (28 requests). Sales confirmed 2 deals lost. Engineering estimate: 2 days. Low effort, high impact.',
  },
];

const capabilities = [
  {
    icon: MessageSquare,
    title: 'Multi-Source Aggregation',
    description: 'Synthesize feedback from Zendesk, Slack, Gong calls, and community forums into unified insights.',
  },
  {
    icon: TrendingUp,
    title: 'Quantified Impact',
    description: 'Every recommendation includes mention counts, deal impact, and urgency signals.',
  },
  {
    icon: Layers,
    title: 'Competitive Context',
    description: 'Understand how competitors have solved similar problems and where you can differentiate.',
  },
  {
    icon: Target,
    title: 'Internal Alignment',
    description: 'Surface what engineering, sales, and leadership have already flagged as priorities.',
  },
];

const outputSections = [
  { name: 'Priority Features', description: 'Top feature recommendations ranked by impact and urgency.' },
  { name: 'Evidence Summary', description: 'Mention counts, source breakdown, and representative quotes.' },
  { name: 'Competitive Landscape', description: 'How competitors address these needs.' },
  { name: 'Internal Signals', description: 'What your team has already discussed or prioritized.' },
  { name: 'Recommended Actions', description: 'Concrete next steps with effort estimates.' },
  { name: 'Full Citations', description: 'Links to every ticket, message, and call transcript.' },
];

const faqs = [
  {
    question: 'How is Feature Intelligence different from sentiment analysis?',
    answer: 'Sentiment analysis tells you customers are frustrated. Feature Intelligence tells you exactly what to build: specific features with quantified demand, competitive context, and internal alignment signals.',
  },
  {
    question: 'What data sources does it analyze?',
    answer: 'Currently: Zendesk tickets and Slack feedback channels. Coming soon: Gong call transcripts and community forums. The analysis improves as you connect more sources.',
  },
  {
    question: 'How often should I run Feature Intelligence?',
    answer: 'Weekly is typical for active products. You can configure lookback periods from 7 to 90 days depending on your feedback volume.',
  },
  {
    question: 'Does it replace manual customer research?',
    answer: 'No—it augments it. Feature Intelligence handles the volume analysis so you can focus discovery time on deep customer conversations.',
  },
  {
    question: 'How does it identify competitive context?',
    answer: 'It surfaces mentions of competitors in feedback and cross-references with configured competitor tracking. You can also connect competitive intel sources.',
  },
  {
    question: 'Can I customize the analysis focus?',
    answer: 'Yes. Configure which product areas, customer segments, or time periods to analyze. Focus on what matters for your current roadmap decisions.',
  },
];

const intelligenceFramework = [
  {
    name: 'Operational Intelligence',
    agent: 'Daily Brief',
    description: 'Start every morning knowing what happened overnight.',
    href: '/templates/daily-brief',
  },
  {
    name: 'Stakeholder Intelligence',
    agent: 'Meeting Prep',
    description: 'Walk into every meeting with complete context.',
    href: '/templates/meeting-prep',
  },
  {
    name: 'Feature Intelligence',
    agent: 'VoC Clustering',
    description: 'Know exactly what to build and why.',
    href: '/feature-intelligence',
    current: true,
  },
];

export default function FeatureIntelligencePage() {
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
              { '@type': 'ListItem', position: 2, name: 'Feature Intelligence', item: `${siteConfig.url}/feature-intelligence` },
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
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-cobalt-100">
              <Lightbulb className="h-8 w-8 text-cobalt-600" />
            </div>
            <Badge variant="cobalt" className="mb-4">
              Product Intelligence
            </Badge>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Feature Intelligence
              <span className="text-cobalt-600"> Not Just Sentiment</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Go beyond "customers are frustrated." Get specific feature recommendations
              with quantified demand, competitive context, and internal alignment signals.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/demo">
                  Try the Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/blog/feature-intelligence-vs-customer-intelligence">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">The Problem with Customer Intelligence</h2>
            <p className="mt-4 text-muted-foreground">
              Traditional VoC tools tell you what customers feel. They don't tell you what to build.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-4xl space-y-6">
            {comparisonItems.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Customer Intelligence
                      </div>
                      <p className="text-muted-foreground">{item.traditional}</p>
                    </div>
                    <div className="border-t pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                      <div className="mb-2 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-cobalt-600" />
                        <span className="text-xs font-medium uppercase tracking-wide text-cobalt-600">
                          Feature Intelligence
                        </span>
                      </div>
                      <p className="font-medium">{item.intelligent}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">How Feature Intelligence Works</h2>
            <p className="mt-4 text-muted-foreground">
              Synthesize feedback from every source into actionable feature recommendations.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
            {capabilities.map((capability) => (
              <Card key={capability.title}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cobalt-100">
                      <capability.icon className="h-5 w-5 text-cobalt-600" />
                    </div>
                    <CardTitle className="text-lg">{capability.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{capability.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Output Structure */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">What You Get</h2>
            <p className="mt-4 text-muted-foreground">
              A complete feature intelligence report ready for roadmap decisions.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-3xl">
            <Card>
              <CardContent className="p-6">
                <ol className="space-y-4">
                  {outputSections.map((section, index) => (
                    <li key={section.name} className="flex gap-4">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cobalt-100 text-xs font-medium text-cobalt-600">
                        {index + 1}
                      </span>
                      <div>
                        <span className="font-medium">{section.name}</span>
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Intelligence Framework */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">Product Management Intelligence</h2>
            <p className="mt-4 text-muted-foreground">
              Feature Intelligence is part of a complete intelligence framework for PMs.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
            {intelligenceFramework.map((item) => (
              <Card key={item.name} className={item.current ? 'border-cobalt-600 ring-1 ring-cobalt-600' : ''}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {item.name}
                    {item.current && (
                      <Badge variant="cobalt" className="ml-2 text-xs">
                        Current
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Powered by <span className="font-medium">{item.agent}</span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24">
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
            <h2 className="font-heading text-3xl font-bold">Try Feature Intelligence</h2>
            <p className="mt-4 text-cobalt-100">
              See a sample Feature Intelligence report in the demo,
              synthesized from mock support tickets and feedback.
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
