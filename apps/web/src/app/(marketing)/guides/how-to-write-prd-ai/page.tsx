import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Check, Lightbulb } from 'lucide-react';
import { siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'How to Write a PRD with AI | openpmkit Guide',
  description:
    'Step-by-step guide to writing Product Requirements Documents with AI. Learn how to create PRDs that cite real customer evidence.',
  keywords: [
    'how to write PRD',
    'PRD with AI',
    'AI PRD generator',
    'product requirements document guide',
    'writing PRD tutorial',
    'evidence-based PRD',
  ],
  openGraph: {
    title: 'How to Write a PRD with AI',
    description: 'Step-by-step guide to creating evidence-backed PRDs.',
    url: `${siteConfig.url}/guides/how-to-write-prd-ai`,
  },
  alternates: {
    canonical: `${siteConfig.url}/guides/how-to-write-prd-ai`,
  },
};

const steps = [
  {
    number: 1,
    title: 'Define the Problem',
    description: 'Start with the problem, not the solution. What pain are customers experiencing?',
    tips: [
      'Search your connected tools for customer complaints about this area',
      'Quantify impact: how many customers? How often?',
      'Distinguish symptoms from root causes',
    ],
    pmkitHelp: 'pmkit searches Slack, Gong, and Zendesk to find customer conversations about the problem. It quantifies mentions and clusters related issues.',
  },
  {
    number: 2,
    title: 'Gather Customer Evidence',
    description: 'Collect specific examples of customers describing the problem or requesting the feature.',
    tips: [
      'Look for direct quotes from sales calls',
      'Find support tickets describing the pain',
      'Check Slack for internal discussions about customer requests',
    ],
    pmkitHelp: 'pmkit automatically pulls relevant quotes from Gong call transcripts, Zendesk tickets, and Slack messages. Each citation includes a link to the source.',
  },
  {
    number: 3,
    title: 'Write User Stories',
    description: 'Translate customer needs into user stories: As a [user], I want [capability] so that [benefit].',
    tips: [
      'Base stories on actual customer use cases mentioned in calls',
      'Include different user personas if relevant',
      'Prioritize stories by customer demand',
    ],
    pmkitHelp: 'openpmkit generates user stories based on customer language and use cases found in your data. Stories are ranked by how many customers mentioned similar needs.',
  },
  {
    number: 4,
    title: 'Define Requirements',
    description: 'List what the feature must do (functional) and how well it must perform (non-functional).',
    tips: [
      'Be specific and testable',
      'Include edge cases customers mentioned',
      'Specify integrations and dependencies',
    ],
    pmkitHelp: 'pmkit extracts requirements from customer conversations—specific things they asked for—and structures them as testable requirements.',
  },
  {
    number: 5,
    title: 'Set Acceptance Criteria',
    description: 'Define how you\'ll know the feature is complete and working correctly.',
    tips: [
      'Base criteria on customer expectations',
      'Include performance benchmarks',
      'Define success metrics',
    ],
    pmkitHelp: 'pmkit suggests acceptance criteria based on what customers said they need. Each criterion is traceable to source evidence.',
  },
  {
    number: 6,
    title: 'Review with Stakeholders',
    description: 'Share the PRD with engineering, design, and leadership for feedback.',
    tips: [
      'Evidence makes reviews faster—stakeholders can see the "why"',
      'Invite questions about the customer data',
      'Iterate based on feasibility feedback',
    ],
    pmkitHelp: 'openpmkit PRDs include an evidence appendix with all citations. Stakeholders can click through to original sources to verify claims.',
  },
];

export default function HowToWritePRDPage() {
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
              { '@type': 'ListItem', position: 2, name: 'Guides', item: `${siteConfig.url}/guides` },
              { '@type': 'ListItem', position: 3, name: 'How to Write PRD with AI', item: `${siteConfig.url}/guides/how-to-write-prd-ai` },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How to Write a PRD with AI',
            description: 'Step-by-step guide to creating evidence-backed Product Requirements Documents using AI',
            totalTime: 'PT30M',
            step: steps.map((step) => ({
              '@type': 'HowToStep',
              position: step.number,
              name: step.title,
              text: step.description,
            })),
          }),
        }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-cobalt-50/50 to-background py-16 md:py-24">
        <div className="container">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/guides">
                <ArrowLeft className="mr-2 h-4 w-4" />
                All Guides
              </Link>
            </Button>
          </div>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="cobalt" className="mb-4">
              Guide
            </Badge>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              How to Write a PRD
              <span className="text-cobalt-600"> with AI</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Learn how to create Product Requirements Documents that cite real customer evidence.
              Every claim traceable, every decision defensible.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              8 min read
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl prose prose-slate">
            <h2 className="font-heading text-2xl font-bold">Why Evidence Matters in PRDs</h2>
            <p className="text-muted-foreground">
              Traditional PRDs are written from memory and intuition. When stakeholders ask
              "where did this requirement come from?", you're left scrambling to justify your decisions.
            </p>
            <p className="text-muted-foreground">
              Evidence-backed PRDs are different. Every claim cites a specific customer conversation—a
              Slack message, a Gong call, a support ticket. Stakeholder reviews go faster because
              the "why" is built into the document.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-heading text-2xl font-bold text-center mb-12">
              Step-by-Step Guide
            </h2>
            <div className="space-y-12">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cobalt-600 text-lg font-bold text-white">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-xl font-bold">{step.title}</h3>
                    <p className="mt-2 text-muted-foreground">{step.description}</p>

                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium">Tips:</h4>
                      <ul className="space-y-1">
                        {step.tips.map((tip) => (
                          <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cobalt-600" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Card className="mt-4 border-l-4 border-l-cobalt-500">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-cobalt-600" />
                          <div>
                            <span className="text-sm font-medium">How openopenpmkit helps:</span>
                            <p className="text-sm text-muted-foreground">{step.pmkitHelp}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Takeaways */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-2xl font-bold text-center mb-8">Key Takeaways</h2>
            <Card>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  {[
                    'Start with the problem, not the solution',
                    'Every claim should cite customer evidence',
                    'User stories should reflect actual customer language',
                    'Requirements should be specific and testable',
                    'Evidence makes stakeholder reviews faster',
                    'AI can find and cite evidence automatically',
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

      {/* CTA */}
      <section className="bg-cobalt-600 py-16 text-white md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">Try It Yourself</h2>
            <p className="mt-4 text-cobalt-100">
              Generate a PRD with cited evidence in the openpmkit demo.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="https://github.com/openpmkit/openpmkit">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white text-cobalt-600 border-white hover:bg-cobalt-50" asChild>
                <Link href="/templates/prd">View PRD Template</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
