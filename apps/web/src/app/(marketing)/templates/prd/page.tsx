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
import { ArrowRight, ArrowLeft, FileText, Quote, Users, Target } from 'lucide-react';
import { siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'PRD Template | pmkit - AI Product Requirements Document Generator',
  description:
    'Free PRD template powered by AI. Generate product requirements documents with cited customer evidence from Slack, Gong, and support tickets.',
  keywords: [
    'PRD template',
    'product requirements document template',
    'PRD template free',
    'AI PRD generator',
    'product requirements example',
    'how to write a PRD',
    'PRD format',
  ],
  openGraph: {
    title: 'Free PRD Template - pmkit',
    description: 'AI-powered PRD template with customer evidence citations.',
    url: `${siteConfig.url}/templates/prd`,
  },
  alternates: {
    canonical: `${siteConfig.url}/templates/prd`,
  },
};

const sections = [
  {
    icon: Target,
    title: 'Problem Statement',
    description: 'AI identifies the core problem from customer conversations and quantifies impact.',
  },
  {
    icon: Users,
    title: 'User Stories',
    description: 'Generated user stories based on actual customer requests and use cases mentioned in calls.',
  },
  {
    icon: Quote,
    title: 'Evidence Citations',
    description: 'Every claim links back to specific Slack messages, Gong calls, or support tickets.',
  },
  {
    icon: FileText,
    title: 'Acceptance Criteria',
    description: 'Clear, testable criteria derived from customer expectations.',
  },
];

const templateSections = [
  { name: 'Executive Summary', description: 'One-paragraph overview of the feature and its expected impact.' },
  { name: 'Problem Statement', description: 'What problem are we solving? For whom? With cited evidence.' },
  { name: 'Goals & Success Metrics', description: 'Measurable outcomes and KPIs to track success.' },
  { name: 'User Stories', description: 'As a [user], I want [capability] so that [benefit].' },
  { name: 'Requirements', description: 'Functional and non-functional requirements with priority.' },
  { name: 'Acceptance Criteria', description: 'Specific, testable conditions for completion.' },
  { name: 'Out of Scope', description: 'Explicitly what this PRD does NOT cover.' },
  { name: 'Dependencies', description: 'Technical, design, or organizational dependencies.' },
  { name: 'Timeline', description: 'High-level milestones (without specific dates).' },
  { name: 'Evidence Appendix', description: 'Full citations with links to source conversations.' },
];

const faqs = [
  {
    question: 'What is a PRD?',
    answer: 'A Product Requirements Document (PRD) describes what a product feature should do. It includes the problem being solved, user needs, requirements, and acceptance criteria. PRDs align engineering, design, and stakeholders around what to build.',
  },
  {
    question: 'How is pmkit\'s PRD different?',
    answer: 'Traditional PRDs are written from memory or intuition. pmkit PRDs cite actual customer evidence—specific Slack messages, Gong call transcripts, and support tickets. Every claim is traceable to source data.',
  },
  {
    question: 'Do I need to connect data sources?',
    answer: 'pmkit works best with connected tools like Slack, Gong, and Zendesk. The AI pulls relevant customer conversations to populate the PRD. Without connections, it generates a template structure without evidence.',
  },
  {
    question: 'Can I customize the PRD format?',
    answer: 'Yes. Enterprise customers can customize section headers, required fields, and output format to match their existing PRD standards.',
  },
  {
    question: 'How long does generation take?',
    answer: 'Typically 30-60 seconds. The AI searches your connected tools for relevant evidence, clusters it into themes, and generates a complete PRD draft.',
  },
  {
    question: 'Can I edit the generated PRD?',
    answer: 'Yes. Every PRD is a draft for your review. Edit sections, add context, or remove irrelevant evidence before sharing with stakeholders.',
  },
];

export default function PRDTemplatePage() {
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
              { '@type': 'ListItem', position: 2, name: 'Templates', item: `${siteConfig.url}/templates` },
              { '@type': 'ListItem', position: 3, name: 'PRD Template', item: `${siteConfig.url}/templates/prd` },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How to Create a PRD with AI',
            description: 'Generate a Product Requirements Document using pmkit AI',
            step: [
              { '@type': 'HowToStep', position: 1, text: 'Connect your data sources (Slack, Gong, Zendesk)' },
              { '@type': 'HowToStep', position: 2, text: 'Describe the feature or problem to address' },
              { '@type': 'HowToStep', position: 3, text: 'AI searches for relevant customer evidence' },
              { '@type': 'HowToStep', position: 4, text: 'Review the generated PRD draft' },
              { '@type': 'HowToStep', position: 5, text: 'Edit and share with stakeholders' },
            ],
          }),
        }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-cobalt-50/50 to-background py-16 md:py-24">
        <div className="container">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/templates">
                <ArrowLeft className="mr-2 h-4 w-4" />
                All Templates
              </Link>
            </Button>
          </div>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-cobalt-100">
              <FileText className="h-8 w-8 text-cobalt-600" />
            </div>
            <Badge variant="cobalt" className="mb-4">
              Template
            </Badge>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              PRD Template
              <span className="text-cobalt-600"> with AI</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Generate Product Requirements Documents that cite actual customer evidence.
              Every claim links back to real Slack messages, Gong calls, and support tickets.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/demo">
                  Try the PRD Generator
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/resources/prd-draft">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes It Different */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">What Makes This PRD Different</h2>
            <p className="mt-4 text-muted-foreground">
              Not another empty template. PRDs filled with real customer evidence.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
            {sections.map((section) => (
              <Card key={section.title}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cobalt-100">
                      <section.icon className="h-5 w-5 text-cobalt-600" />
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Template Sections */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">PRD Template Structure</h2>
            <p className="mt-4 text-muted-foreground">
              A complete PRD with all the sections you need.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-3xl">
            <Card>
              <CardContent className="p-6">
                <ol className="space-y-4">
                  {templateSections.map((section, index) => (
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

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">How to Create a PRD with AI</h2>
            <p className="mt-4 text-muted-foreground">
              From idea to documented requirements in minutes.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-3xl space-y-6">
            {[
              { step: 1, title: 'Connect Data Sources', description: 'Link Slack, Gong, Zendesk, and other tools where customer conversations happen.' },
              { step: 2, title: 'Describe the Feature', description: 'Tell pmkit what feature or problem you\'re documenting.' },
              { step: 3, title: 'AI Finds Evidence', description: 'pmkit searches your tools for relevant customer conversations and requests.' },
              { step: 4, title: 'Review the Draft', description: 'Get a complete PRD with cited evidence. Edit sections as needed.' },
              { step: 5, title: 'Share with Stakeholders', description: 'Export to Confluence, download as Markdown, or share a link.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-cobalt-600 text-sm font-bold text-white">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
                  <p className="mt-1 text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
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
            <h2 className="font-heading text-3xl font-bold">Try the PRD Generator</h2>
            <p className="mt-4 text-cobalt-100">
              See how pmkit creates PRDs with cited customer evidence in the demo.
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
