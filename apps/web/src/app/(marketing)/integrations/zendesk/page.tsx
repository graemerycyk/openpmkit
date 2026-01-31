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
import { ArrowRight, ArrowLeft, Check, Headphones, FileText, Users, TrendingUp } from 'lucide-react';
import { siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Zendesk Integration | openpmkit - AI Support Ticket Analysis',
  description:
    'Connect openpmkit with Zendesk for AI-powered VoC analysis, ticket clustering, and customer evidence for PRDs.',
  keywords: [
    'Zendesk AI integration',
    'Zendesk ticket analysis',
    'support ticket clustering AI',
    'VoC from Zendesk',
    'customer feedback PRD',
    'pmkit Zendesk',
  ],
  openGraph: {
    title: 'openpmkit + Zendesk Integration',
    description: 'Transform support tickets into product insights.',
    url: `${siteConfig.url}/integrations/zendesk`,
  },
  alternates: {
    canonical: `${siteConfig.url}/integrations/zendesk`,
  },
};

const features = [
  {
    icon: TrendingUp,
    title: 'Ticket Clustering',
    description: 'Automatically cluster support tickets into themes to identify top pain points.',
  },
  {
    icon: FileText,
    title: 'PRD Evidence',
    description: 'Support tickets become cited evidence in your PRDs and VoC reports.',
  },
  {
    icon: Users,
    title: 'Customer Impact',
    description: 'Quantify how many customers are affected by specific issues.',
  },
  {
    icon: Headphones,
    title: 'Escalation Tracking',
    description: 'Daily briefs highlight high-priority escalations that need PM attention.',
  },
];

const useCases = [
  {
    title: 'VoC Reports',
    description: 'Cluster tickets alongside Slack and Gong to see the full customer picture.',
  },
  {
    title: 'Pain Point Discovery',
    description: 'Identify recurring issues that should inform your product roadmap.',
  },
  {
    title: 'Stakeholder Evidence',
    description: 'Back up feature requests with data: "147 tickets about this issue in Q4."',
  },
];

const faqs = [
  {
    question: 'How does openpmkit connect to Zendesk?',
    answer: 'openpmkit uses Zendesk OAuth for secure authentication. You authorize openpmkit to access tickets, and credentials are encrypted at rest. openpmkit reads ticket data only—no writes to Zendesk.',
  },
  {
    question: 'What Zendesk data can openpmkit access?',
    answer: 'pmkit can access ticket subjects, descriptions, comments, tags, and status. It reads this data to cluster themes and find relevant customer issues for PRDs.',
  },
  {
    question: 'How does ticket clustering work?',
    answer: 'openpmkit uses AI to analyze ticket content and group similar issues into themes. Each theme includes sample tickets and a count of affected customers.',
  },
  {
    question: 'Can openpmkit update Zendesk tickets?',
    answer: 'No, openpmkit is read-only for Zendesk. It analyzes tickets for insights but never modifies them. This simplifies permissions and ensures support workflows aren\'t affected.',
  },
  {
    question: 'How far back can openpmkit analyze?',
    answer: 'pmkit can analyze all tickets you have access to, but typically focuses on recent tickets (last 30-90 days) for relevance. You can configure the timeframe.',
  },
  {
    question: 'Is ticket data stored?',
    answer: 'pmkit processes tickets in memory and stores only citations (ticket ID, subject snippet) for traceability. Full ticket content is not stored.',
  },
];

export default function ZendeskIntegrationPage() {
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
              { '@type': 'ListItem', position: 3, name: 'Zendesk', item: `${siteConfig.url}/integrations/zendesk` },
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
              <Headphones className="h-8 w-8 text-cobalt-600" />
            </div>
            <Badge variant="cobalt" className="mb-4">
              Integration
            </Badge>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              openpmkit + <span className="text-cobalt-600">Zendesk</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Transform support tickets into product insights. openpmkit clusters customer issues,
              quantifies impact, and cites tickets directly in your PRDs.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="https://github.com/openpmkit/openpmkit">
                  Get Started
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
              openpmkit reads Zendesk tickets and transforms them into actionable product insights.
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
              How product teams use openpmkit with Zendesk.
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
                    'Zendesk OAuth authentication',
                    'Credentials encrypted with AES-256',
                    'Read-only access to tickets',
                    'Only citations stored, not full content',
                    'Respects Zendesk access permissions',
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
            <h2 className="font-heading text-3xl font-bold">See Zendesk Integration in Action</h2>
            <p className="mt-4 text-cobalt-100">
              Try the demo to see customer issues clustered into themes.
            </p>
            <div className="mt-8">
              <Button size="lg" variant="secondary" asChild>
                <Link href="https://github.com/openpmkit/openpmkit">
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
