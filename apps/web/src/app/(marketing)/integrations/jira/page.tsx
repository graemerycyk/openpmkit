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
import { ArrowRight, ArrowLeft, Check, Layers, FileText, Zap, Shield } from 'lucide-react';
import { siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Jira Integration | pmkit - AI-Powered Jira Automation',
  description:
    'Connect pmkit with Jira for AI-powered sprint reviews, PRD-to-epic conversion, and automated release notes. Draft-only governance ensures human approval.',
  keywords: [
    'Jira AI integration',
    'Jira automation',
    'AI sprint review',
    'Jira PRD automation',
    'Jira release notes AI',
    'pmkit Jira',
  ],
  openGraph: {
    title: 'pmkit + Jira Integration',
    description: 'AI-powered Jira automation with draft-only governance.',
    url: `${siteConfig.url}/integrations/jira`,
  },
  alternates: {
    canonical: `${siteConfig.url}/integrations/jira`,
  },
};

const features = [
  {
    icon: FileText,
    title: 'PRD to Jira Epics',
    description: 'Generate Jira epics and stories from PRDs with full traceability to customer evidence.',
  },
  {
    icon: Zap,
    title: 'Sprint Review Generation',
    description: 'Automatically generate sprint reviews from completed Jira issues with status summaries.',
  },
  {
    icon: Layers,
    title: 'Release Notes Automation',
    description: 'Create release notes from resolved issues, grouped by type and priority.',
  },
  {
    icon: Shield,
    title: 'Draft-Only Governance',
    description: 'All Jira writes are proposals. Review and approve before any ticket is created.',
  },
];

const useCases = [
  {
    title: 'Sprint Planning',
    description: 'PRDs generate epics with acceptance criteria. Review the proposals, then approve to create tickets.',
  },
  {
    title: 'Sprint Reviews',
    description: 'At sprint end, pmkit summarizes completed work, blockers, and carryover items automatically.',
  },
  {
    title: 'Release Management',
    description: 'Generate customer-facing release notes from resolved Jira issues. Categorized by feature type.',
  },
];

const faqs = [
  {
    question: 'How does pmkit connect to Jira?',
    answer: 'pmkit uses Atlassian OAuth 2.0 for secure authentication. You authorize pmkit to access your Jira instance, and credentials are encrypted at rest. pmkit can read issues and propose writes, but all writes require your approval.',
  },
  {
    question: 'What Jira permissions does pmkit need?',
    answer: 'pmkit needs read access to issues, projects, and sprints (read:jira-work). For creating tickets, it needs write access (write:jira-work). All writes are proposals that you review before execution.',
  },
  {
    question: 'Can pmkit create Jira tickets automatically?',
    answer: 'pmkit proposes Jira tickets—epics, stories, bugs—but never creates them automatically. You review the proposals, edit if needed, then approve. This draft-only pattern prevents accidental ticket creation.',
  },
  {
    question: 'Does it work with Jira Cloud and Server?',
    answer: 'Currently pmkit supports Jira Cloud. Jira Server/Data Center support is planned for enterprise customers.',
  },
  {
    question: 'How does sprint review generation work?',
    answer: 'At the end of a sprint, pmkit pulls all issues from the sprint, analyzes status changes and comments, then generates a summary document with completed work, blockers, and carryover items.',
  },
  {
    question: 'Can I customize the Jira field mappings?',
    answer: 'Yes, enterprise customers can customize how pmkit fields map to their Jira configuration, including custom fields and workflows.',
  },
];

export default function JiraIntegrationPage() {
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
              { '@type': 'ListItem', position: 3, name: 'Jira', item: `${siteConfig.url}/integrations/jira` },
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
              <Layers className="h-8 w-8 text-cobalt-600" />
            </div>
            <Badge variant="cobalt" className="mb-4">
              Integration
            </Badge>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              pmkit + <span className="text-cobalt-600">Jira</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              AI-powered Jira automation with draft-only governance. Generate sprint reviews,
              convert PRDs to epics, and create release notes—all proposed for your approval.
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
              pmkit reads from Jira and proposes writes. Every action requires your approval.
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
              How product teams use pmkit with Jira.
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
                    'All writes are proposals requiring approval',
                    'Full audit trail of every proposed action',
                    'RBAC controls for who can approve',
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
            <h2 className="font-heading text-3xl font-bold">See Jira Integration in Action</h2>
            <p className="mt-4 text-cobalt-100">
              Try the demo to see sprint reviews and PRD-to-epic workflows.
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
