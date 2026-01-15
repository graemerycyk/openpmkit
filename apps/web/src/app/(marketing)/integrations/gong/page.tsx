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
import { ArrowRight, ArrowLeft, Check, Phone, FileText, Users, Quote } from 'lucide-react';
import { siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Gong Integration | pmkit - AI Insights from Sales Calls',
  description:
    'Connect pmkit with Gong for AI-powered VoC analysis, call transcript insights, and cited customer evidence in PRDs.',
  keywords: [
    'Gong AI integration',
    'Gong call insights',
    'sales call analysis AI',
    'VoC from Gong',
    'customer evidence PRD',
    'pmkit Gong',
  ],
  openGraph: {
    title: 'pmkit + Gong Integration',
    description: 'Extract customer insights from sales calls for evidence-backed PRDs.',
    url: `${siteConfig.url}/integrations/gong`,
  },
  alternates: {
    canonical: `${siteConfig.url}/integrations/gong`,
  },
};

const features = [
  {
    icon: Quote,
    title: 'Call Transcript Analysis',
    description: 'Extract key insights and customer quotes from Gong call transcripts automatically.',
  },
  {
    icon: FileText,
    title: 'Evidence for PRDs',
    description: 'Customer statements from calls become cited evidence in your PRDs.',
  },
  {
    icon: Users,
    title: 'VoC Clustering',
    description: 'Combine call insights with support tickets and Slack for comprehensive VoC reports.',
  },
  {
    icon: Phone,
    title: 'Call Summaries',
    description: 'Get synthesized summaries of customer calls relevant to your product area.',
  },
];

const useCases = [
  {
    title: 'Feature Validation',
    description: 'Find customer calls where specific features or pain points were discussed.',
  },
  {
    title: 'VoC Reports',
    description: 'Cluster insights from calls alongside support tickets and Slack messages.',
  },
  {
    title: 'Stakeholder Evidence',
    description: 'Back up PRD requirements with direct customer quotes from sales calls.',
  },
];

const faqs = [
  {
    question: 'How does pmkit connect to Gong?',
    answer: 'pmkit uses Gong\'s API with OAuth for secure authentication. You authorize pmkit to access call transcripts, and credentials are encrypted at rest.',
  },
  {
    question: 'What Gong data can pmkit access?',
    answer: 'pmkit can access call transcripts, call metadata (participants, duration, date), and any tags or notes associated with calls. It reads data only—no writes to Gong.',
  },
  {
    question: 'How does call transcript analysis work?',
    answer: 'pmkit processes call transcripts to extract customer statements, pain points, feature requests, and sentiment. These become citations in PRDs and VoC reports.',
  },
  {
    question: 'Can I search for specific topics in calls?',
    answer: 'Yes. When generating PRDs or VoC reports, pmkit searches your Gong calls for relevant customer statements about the topic you\'re researching.',
  },
  {
    question: 'Is call data stored?',
    answer: 'pmkit processes transcripts in memory and stores only citations (speaker, timestamp, quote snippet) for traceability. Full transcripts are not stored.',
  },
  {
    question: 'How recent are the calls pmkit can access?',
    answer: 'pmkit can access all calls in your Gong instance that your user account has permission to view. Typically teams focus on calls from the last 90 days for relevance.',
  },
];

export default function GongIntegrationPage() {
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
              { '@type': 'ListItem', position: 3, name: 'Gong', item: `${siteConfig.url}/integrations/gong` },
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
              <Phone className="h-8 w-8 text-cobalt-600" />
            </div>
            <Badge variant="cobalt" className="mb-4">
              Integration
            </Badge>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              pmkit + <span className="text-cobalt-600">Gong</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Turn sales calls into product insights. pmkit extracts customer evidence from
              Gong transcripts and cites it directly in your PRDs and VoC reports.
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
              pmkit reads Gong call transcripts and extracts actionable customer insights.
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
              How product teams use pmkit with Gong.
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
                    'Gong OAuth API authentication',
                    'Credentials encrypted with AES-256',
                    'Transcripts processed in memory only',
                    'Only citations stored, not full transcripts',
                    'Respects Gong access permissions',
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
            <h2 className="font-heading text-3xl font-bold">See Gong Integration in Action</h2>
            <p className="mt-4 text-cobalt-100">
              Try the demo to see customer insights extracted from call transcripts.
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
