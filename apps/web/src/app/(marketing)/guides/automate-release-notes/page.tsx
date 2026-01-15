import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Check, Lightbulb } from 'lucide-react';
import { siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'How to Automate Release Notes | pmkit Guide',
  description:
    'Learn how to automatically generate release notes from Jira issues. Save hours every release with AI-powered documentation.',
  keywords: [
    'automate release notes',
    'release notes automation',
    'Jira release notes',
    'AI release notes',
    'automated changelog',
    'release documentation',
  ],
  openGraph: {
    title: 'How to Automate Release Notes',
    description: 'From Jira to customers—automatically.',
    url: `${siteConfig.url}/guides/automate-release-notes`,
  },
  alternates: {
    canonical: `${siteConfig.url}/guides/automate-release-notes`,
  },
};

const steps = [
  {
    number: 1,
    title: 'Connect Jira',
    description: 'Link pmkit to your Jira instance via OAuth. pmkit needs read access to issues and projects.',
    tips: [
      'Works with Jira Cloud out of the box',
      'Enterprise customers can use Jira Server/Data Center',
      'All data access follows your Jira permissions',
    ],
    pmkitHelp: 'One-time OAuth setup. pmkit requests only the permissions needed to read issues and generate notes.',
  },
  {
    number: 2,
    title: 'Configure Your Project',
    description: 'Tell pmkit which Jira project(s) to monitor and how to categorize issues.',
    tips: [
      'Select the projects that ship customer-facing changes',
      'Map issue types to release note categories (Features, Fixes, etc.)',
      'Optionally filter by labels or components',
    ],
    pmkitHelp: 'pmkit learns your Jira structure and lets you configure which issues matter for release notes.',
  },
  {
    number: 3,
    title: 'Set Release Criteria',
    description: 'Define what "done" means: status, fix version, or date range.',
    tips: [
      'Fix Version is the cleanest approach',
      'Status-based works if you don\'t use versions',
      'Date range is good for continuous delivery',
    ],
    pmkitHelp: 'pmkit queries Jira for issues matching your release criteria—all issues in version X, or resolved between dates.',
  },
  {
    number: 4,
    title: 'Generate Release Notes',
    description: 'Run the release notes workflow. pmkit pulls issues and generates customer-friendly notes.',
    tips: [
      'AI translates ticket titles into customer language',
      'Issues are grouped by type (New, Improved, Fixed)',
      'Technical jargon is cleaned up automatically',
    ],
    pmkitHelp: 'pmkit fetches all matching issues, extracts key information, and generates release notes in markdown format.',
  },
  {
    number: 5,
    title: 'Review and Edit',
    description: 'Check the generated notes for accuracy and tone. Edit as needed.',
    tips: [
      'Verify that sensitive issues aren\'t included',
      'Add context for major features',
      'Remove internal-only changes',
    ],
    pmkitHelp: 'Generated notes are drafts. Review, edit, and approve before publishing anywhere.',
  },
  {
    number: 6,
    title: 'Publish',
    description: 'Export to your preferred format or propose to Confluence.',
    tips: [
      'Download as Markdown for docs sites',
      'Propose to Confluence for internal wikis',
      'Copy to email for customer announcements',
    ],
    pmkitHelp: 'pmkit can export as Markdown, HTML, or propose a Confluence page. You control where notes are published.',
  },
];

export default function AutomateReleaseNotesPage() {
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
              { '@type': 'ListItem', position: 3, name: 'Automate Release Notes', item: `${siteConfig.url}/guides/automate-release-notes` },
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
            name: 'How to Automate Release Notes',
            description: 'Generate release notes automatically from Jira issues',
            totalTime: 'PT15M',
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
              How to Automate
              <span className="text-cobalt-600"> Release Notes</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Stop writing release notes by hand. Let AI pull completed Jira issues and
              generate customer-friendly notes automatically.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              5 min read
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl prose prose-slate">
            <h2 className="font-heading text-2xl font-bold">Why Automate Release Notes?</h2>
            <p className="text-muted-foreground">
              Writing release notes is tedious. You're combing through Jira, translating
              technical ticket titles into customer language, and hoping you didn't miss anything.
            </p>
            <p className="text-muted-foreground">
              Automated release notes solve this. AI queries Jira for completed work,
              extracts what matters, and generates notes in your preferred format.
              You review and edit—the grunt work is done.
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
                            <span className="text-sm font-medium">How pmkit helps:</span>
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
                    'Connect Jira once, generate notes every release',
                    'AI translates ticket titles into customer language',
                    'Issues are categorized automatically (New, Improved, Fixed)',
                    'Always review generated notes before publishing',
                    'Export to Markdown, Confluence, or email',
                    'Save hours every release cycle',
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
            <h2 className="font-heading text-3xl font-bold">Try Release Notes Generation</h2>
            <p className="mt-4 text-cobalt-100">
              See how pmkit generates release notes from Jira data in the demo.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/demo">
                  Try the Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white text-cobalt-600 border-white hover:bg-cobalt-50" asChild>
                <Link href="/resources/release-notes">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
