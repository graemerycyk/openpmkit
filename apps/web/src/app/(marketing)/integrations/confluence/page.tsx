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
import { ArrowRight, ArrowLeft, Check, FileText, Search, Upload, FolderOpen } from 'lucide-react';
import { siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Confluence Integration | openpmkit - AI Document Management',
  description:
    'Connect openpmkit with Confluence for AI-powered PRD publishing, context retrieval, and documentation automation.',
  keywords: [
    'Confluence AI integration',
    'Confluence automation',
    'auto-generate Confluence',
    'PRD to Confluence',
    'product documentation AI',
    'pmkit Confluence',
  ],
  openGraph: {
    title: 'openpmkit + Confluence Integration',
    description: 'AI-powered documentation with draft-only governance.',
    url: `${siteConfig.url}/integrations/confluence`,
  },
  alternates: {
    canonical: `${siteConfig.url}/integrations/confluence`,
  },
};

const features = [
  {
    icon: Upload,
    title: 'PRD Publishing',
    description: 'Propose PRDs and specs as Confluence pages. Review before publishing.',
  },
  {
    icon: Search,
    title: 'Context Retrieval',
    description: 'Pull existing documentation into PRD drafts for consistency.',
  },
  {
    icon: FolderOpen,
    title: 'Space Organization',
    description: 'Publish to the right space with proper labels and hierarchy.',
  },
  {
    icon: FileText,
    title: 'Template Compliance',
    description: 'Generated docs follow your Confluence templates and standards.',
  },
];

const useCases = [
  {
    title: 'PRD Documentation',
    description: 'Draft PRDs in pmkit, then propose them as Confluence pages for stakeholder review.',
  },
  {
    title: 'Sprint Documentation',
    description: 'Sprint reviews become Confluence pages documenting what shipped.',
  },
  {
    title: 'Release Notes',
    description: 'Auto-generated release notes published to your customer-facing Confluence space.',
  },
];

const faqs = [
  {
    question: 'How does openpmkit connect to Confluence?',
    answer: 'openpmkit uses Atlassian OAuth 2.0 for secure authentication. You authorize openpmkit to access your Confluence instance, and credentials are encrypted at rest.',
  },
  {
    question: 'What Confluence permissions does openpmkit need?',
    answer: 'pmkit needs read access to pages and spaces (read:confluence-content.all). For publishing, it needs write access (write:confluence-content). All writes are proposals for your approval.',
  },
  {
    question: 'Can openpmkit publish to Confluence automatically?',
    answer: 'pmkit proposes pages but never publishes automatically. You review the content, choose the space and labels, then approve. Draft-only governance ensures human oversight.',
  },
  {
    question: 'Does it work with Confluence Cloud and Server?',
    answer: 'Currently openpmkit supports Confluence Cloud. Confluence Server/Data Center support is planned for enterprise customers.',
  },
  {
    question: 'Can openpmkit read existing Confluence pages?',
    answer: 'Yes. openpmkit can read your existing documentation to provide context when drafting PRDs. This ensures consistency with your existing specs and terminology.',
  },
  {
    question: 'How does template compliance work?',
    answer: 'You can configure openpmkit to use your Confluence templates. Generated pages follow your standard structure and include required sections.',
  },
];

export default function ConfluenceIntegrationPage() {
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
              { '@type': 'ListItem', position: 3, name: 'Confluence', item: `${siteConfig.url}/integrations/confluence` },
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
              <FileText className="h-8 w-8 text-cobalt-600" />
            </div>
            <Badge variant="cobalt" className="mb-4">
              Integration
            </Badge>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              openpmkit + <span className="text-cobalt-600">Confluence</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              AI-powered documentation with draft-only governance. Generate PRDs and specs,
              then publish to Confluence after your review.
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
              openpmkit reads from Confluence and proposes new pages. Every publish requires your approval.
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
              How product teams use openpmkit with Confluence.
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
                    'Atlassian OAuth 2.0 authentication',
                    'Credentials encrypted with AES-256',
                    'All publishes are proposals for review',
                    'Full audit trail of proposed pages',
                    'Respects Confluence space permissions',
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
            <h2 className="font-heading text-3xl font-bold">See Confluence Integration in Action</h2>
            <p className="mt-4 text-cobalt-100">
              Try the demo to see AI-generated PRDs ready for Confluence.
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
