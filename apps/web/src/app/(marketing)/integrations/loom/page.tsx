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
import { ArrowRight, ArrowLeft, Check, Video, FileText, Zap, Shield } from 'lucide-react';
import { siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Loom Integration | pmkit - AI-Powered Video Transcript Analysis',
  description:
    'Connect pmkit with Loom to extract insights from video transcripts, cite stakeholder walkthroughs in PRDs, and surface key decisions from async updates.',
  keywords: [
    'Loom AI integration',
    'Loom transcript analysis',
    'async video insights',
    'Loom PRD automation',
    'pmkit Loom',
    'video meeting insights',
  ],
  openGraph: {
    title: 'pmkit + Loom Integration',
    description: 'AI-powered Loom transcript analysis with draft-only governance.',
    url: `${siteConfig.url}/integrations/loom`,
  },
  alternates: {
    canonical: `${siteConfig.url}/integrations/loom`,
  },
};

const features = [
  {
    icon: FileText,
    title: 'Transcript to PRD Context',
    description: 'Extract requirements and decisions from stakeholder walkthroughs to include in PRDs.',
  },
  {
    icon: Zap,
    title: 'Daily Brief Summaries',
    description: 'Surface key updates from team Looms in your daily briefs with timestamped citations.',
  },
  {
    icon: Video,
    title: 'Meeting Prep from Videos',
    description: 'Pull context from relevant Loom recordings to prepare for upcoming meetings.',
  },
  {
    icon: Shield,
    title: 'Draft-Only Governance',
    description: 'All insights are read-only. pmkit cites Loom content but never modifies your recordings.',
  },
];

const useCases = [
  {
    title: 'Stakeholder Walkthroughs',
    description: 'When stakeholders share Loom walkthroughs, pmkit extracts requirements, concerns, and decisions for your PRDs.',
  },
  {
    title: 'Async Standups',
    description: 'Team Loom updates are summarized in daily briefs, highlighting blockers and progress without watching every video.',
  },
  {
    title: 'Design Reviews',
    description: 'Pull feedback and decisions from design review Looms to document in specs and track follow-ups.',
  },
];

const faqs = [
  {
    question: 'How does pmkit connect to Loom?',
    answer: 'pmkit uses Atlassian OAuth 2.0 for secure authentication (Loom is part of Atlassian). You authorize pmkit to access your Loom workspace, and credentials are encrypted at rest. pmkit has read-only access to videos and transcripts.',
  },
  {
    question: 'What Loom permissions does pmkit need?',
    answer: 'pmkit needs read access to videos, transcripts, and workspace metadata. It cannot create, edit, or delete any Loom content—it only reads and extracts insights.',
  },
  {
    question: 'Does pmkit watch my videos?',
    answer: 'pmkit processes transcripts, not video content. Loom automatically generates transcripts, and pmkit analyzes that text to extract insights, decisions, and key points.',
  },
  {
    question: 'Can pmkit access private Looms?',
    answer: 'pmkit can only access Looms you have permission to view. It respects Loom\'s sharing settings and workspace permissions.',
  },
  {
    question: 'How are Loom insights used in artifacts?',
    answer: 'When generating PRDs, briefs, or meeting prep packs, pmkit can cite relevant Loom transcripts with timestamps. This provides traceability back to the original video.',
  },
  {
    question: 'Is this different from Gong integration?',
    answer: 'Gong focuses on sales calls and customer conversations. Loom integration is for internal async communication—stakeholder walkthroughs, design reviews, team updates, and product demos.',
  },
];

export default function LoomIntegrationPage() {
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
              { '@type': 'ListItem', position: 3, name: 'Loom', item: `${siteConfig.url}/integrations/loom` },
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
              <Video className="h-8 w-8 text-cobalt-600" />
            </div>
            <Badge variant="cobalt" className="mb-4">
              Integration
            </Badge>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              pmkit + <span className="text-cobalt-600">Loom</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Extract insights from async video transcripts. Cite stakeholder walkthroughs in PRDs,
              surface team updates in daily briefs, and never miss a key decision buried in a Loom.
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
              pmkit reads Loom transcripts and extracts actionable insights for your PM workflows.
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
              How product teams use pmkit with Loom.
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
                <CardTitle className="text-xl">Security & Governance</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    'OAuth 2.0 authentication with Atlassian',
                    'Credentials encrypted at rest (AES-256)',
                    'Read-only access to transcripts',
                    'Full audit trail of every access',
                    'RBAC controls for team access',
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
            <h2 className="font-heading text-3xl font-bold">See Loom Integration in Action</h2>
            <p className="mt-4 text-cobalt-100">
              Try the demo to see how Loom transcripts enhance PRDs and daily briefs.
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
