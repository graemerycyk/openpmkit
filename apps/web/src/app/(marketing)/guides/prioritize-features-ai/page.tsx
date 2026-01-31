import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Check, Lightbulb } from 'lucide-react';
import { siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'How to Prioritize Features with AI | openpmkit Guide',
  description:
    'Learn how to use AI to prioritize product features based on customer evidence. Data-driven prioritization that stakeholders trust.',
  keywords: [
    'feature prioritization',
    'AI feature prioritization',
    'product prioritization framework',
    'data-driven prioritization',
    'customer evidence prioritization',
  ],
  openGraph: {
    title: 'How to Prioritize Features with AI',
    description: 'Data-driven feature prioritization with customer evidence.',
    url: `${siteConfig.url}/guides/prioritize-features-ai`,
  },
  alternates: {
    canonical: `${siteConfig.url}/guides/prioritize-features-ai`,
  },
};

const steps = [
  {
    number: 1,
    title: 'Gather Customer Signals',
    description: 'Collect feedback from all sources: support tickets, sales calls, Slack, surveys.',
    tips: [
      'Don\'t rely on just one source—customers express needs differently in different contexts',
      'Include churned customer feedback for perspective',
      'Look at feature requests and complaints equally',
    ],
    pmkitHelp: 'pmkit aggregates feedback from Slack, Gong, Zendesk, and other connected tools automatically.',
  },
  {
    number: 2,
    title: 'Cluster into Themes',
    description: 'Group similar requests and complaints into themes. A theme might have dozens of related pieces of feedback.',
    tips: [
      'Use customer language for theme names',
      'Some themes will be feature requests, others will be pain points',
      'Don\'t force-fit feedback into predefined categories',
    ],
    pmkitHelp: 'pmkit\'s VoC clustering uses AI to automatically group feedback into themes with sample quotes and counts.',
  },
  {
    number: 3,
    title: 'Quantify Demand',
    description: 'For each theme, count how many unique customers mentioned it, and track the trend.',
    tips: [
      'Unique customer count matters more than total mentions',
      'Look at trends: is this growing or stable?',
      'Note which customer segments care most',
    ],
    pmkitHelp: 'openpmkit provides customer counts and source breakdowns for each theme—X customers mentioned this in Y tickets and Z calls.',
  },
  {
    number: 4,
    title: 'Assess Business Impact',
    description: 'Estimate the impact of addressing each theme: retention, revenue, expansion potential.',
    tips: [
      'Match themes to strategic goals',
      'Consider both short-term wins and long-term value',
      'Talk to sales and success about deal impact',
    ],
    pmkitHelp: 'pmkit surfaces which customer segments (by ARR, plan tier, or tags) are asking for what, helping you tie themes to revenue.',
  },
  {
    number: 5,
    title: 'Estimate Effort',
    description: 'Work with engineering to rough-size each potential solution.',
    tips: [
      'T-shirt sizing (S/M/L/XL) is usually enough at this stage',
      'Include technical dependencies in the estimate',
      'Don\'t over-engineer the estimation process',
    ],
    pmkitHelp: 'pmkit doesn\'t estimate engineering effort—this requires human judgment and technical context.',
  },
  {
    number: 6,
    title: 'Score and Rank',
    description: 'Combine demand, impact, and effort into a prioritization score.',
    tips: [
      'Simple frameworks often work best (value/effort quadrant)',
      'Don\'t hide judgment behind complex formulas',
      'Be prepared to explain any ranking decision',
    ],
    pmkitHelp: 'openpmkit provides the customer evidence that informs your scoring. The final prioritization decision is yours.',
  },
];

export default function PrioritizeFeaturesPage() {
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
              { '@type': 'ListItem', position: 3, name: 'Prioritize Features with AI', item: `${siteConfig.url}/guides/prioritize-features-ai` },
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
            name: 'How to Prioritize Features with AI',
            description: 'Data-driven feature prioritization using AI-synthesized customer evidence',
            totalTime: 'PT20M',
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
              How to Prioritize Features
              <span className="text-cobalt-600"> with AI</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Use AI to synthesize customer feedback, quantify demand, and make
              evidence-based prioritization decisions that stakeholders trust.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              6 min read
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl prose prose-slate">
            <h2 className="font-heading text-2xl font-bold">The Problem with Intuition-Based Prioritization</h2>
            <p className="text-muted-foreground">
              Most feature prioritization is based on whoever shouts loudest. Sales pushes deals,
              support escalates tickets, and executives have opinions. The result? A roadmap that
              doesn't reflect what customers actually need.
            </p>
            <p className="text-muted-foreground">
              Evidence-based prioritization is different. Instead of anecdotes, you have data:
              how many customers asked for this, what segments care most, and exactly what they said.
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
                    'Gather feedback from all sources, not just the loudest',
                    'Cluster feedback into themes using customer language',
                    'Count unique customers, not total mentions',
                    'Tie themes to business impact and strategic goals',
                    'AI handles synthesis; humans make decisions',
                    'Evidence makes prioritization discussions productive',
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
            <h2 className="font-heading text-3xl font-bold">Try Feature Intelligence</h2>
            <p className="mt-4 text-cobalt-100">
              See how openpmkit clusters customer feedback into prioritizable themes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="https://github.com/openpmkit/openpmkit">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white text-cobalt-600 border-white hover:bg-cobalt-50" asChild>
                <Link href="/resources/feature-intelligence">Learn About Feature Intelligence</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
