import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'openpmkit - Open Source AI Product Management Toolkit',
  description:
    'Open-source PM toolkit. 10 autonomous AI workflows for Product Managers: daily briefs, meeting prep, PRD drafts, competitor research, and more. Install with npm.',
  keywords: [
    'openpmkit',
    'open source',
    'AI product management',
    'PM toolkit',
    'AI PRD generator',
    'daily brief automation',
    'product management CLI',
    'AI PM assistant',
    'BYOK',
    'bring your own key',
  ],
  openGraph: {
    title: 'openpmkit - Open Source AI Product Management Toolkit',
    description:
      'Open-source PM toolkit. 10 AI workflows for Product Managers - install with npm.',
    url: siteConfig.url,
    siteName: 'openpmkit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'openpmkit - Open Source AI Product Management Toolkit',
    description: 'Open-source PM toolkit. 10 AI workflows for Product Managers.',
  },
  alternates: {
    canonical: siteConfig.url,
  },
};

import {
  FileText,
  Users,
  BarChart3,
  Target,
  ArrowRight,
  CheckCircle2,
  Wand2,
  Megaphone,
  Presentation,
  Terminal,
  Github,
  Heart,
  Key,
  Folder,
  Clock,
} from 'lucide-react';

const workflows = [
  {
    icon: FileText,
    title: 'Daily Brief',
    description: 'Morning brief synthesizing overnight activity from Slack, Jira, and support.',
    schedule: 'Weekdays 7am',
  },
  {
    icon: Users,
    title: 'Meeting Prep',
    description: 'Customer meeting context with recent conversations and talking points.',
    schedule: 'Weekdays 8am',
  },
  {
    icon: BarChart3,
    title: 'Feature Intelligence',
    description: 'VoC clustering with quantified demand and competitive context.',
    schedule: 'Mondays 9am',
  },
  {
    icon: FileText,
    title: 'PRD Draft',
    description: 'PRDs grounded in customer evidence with explicit assumptions.',
    schedule: 'Manual',
  },
  {
    icon: CheckCircle2,
    title: 'Sprint Review',
    description: 'Sprint summaries with completed work, metrics, and demos.',
    schedule: 'Fridays 2pm',
  },
  {
    icon: Target,
    title: 'Competitor Research',
    description: 'Track competitor mentions across social, news, and forums.',
    schedule: 'Mondays 10am',
  },
  {
    icon: Wand2,
    title: 'PRD to Prototype',
    description: 'Turn PRDs into interactive HTML prototypes for validation.',
    schedule: 'Manual',
  },
  {
    icon: Megaphone,
    title: 'Release Notes',
    description: 'Customer-facing release notes from Jira and Confluence.',
    schedule: 'Manual',
  },
  {
    icon: Presentation,
    title: 'Deck Content',
    description: 'Slide content for exec, customer, or stakeholder audiences.',
    schedule: 'Manual',
  },
];

const features = [
  {
    icon: Key,
    title: 'BYOK (Bring Your Own Key)',
    description: 'Use your own API keys. No data leaves your machine. Full control over costs.',
  },
  {
    icon: Folder,
    title: 'Local Markdown Output',
    description: 'All outputs saved to ~/openpmkit as markdown files with SIEM telemetry.',
  },
  {
    icon: Clock,
    title: 'Scheduled or Ad-hoc',
    description: 'Run workflows manually or on autonomous schedules with cron.',
  },
  {
    icon: Terminal,
    title: 'Simple CLI',
    description: 'Install globally with npm. Run with a single command. No setup required.',
  },
];

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'openpmkit',
            applicationCategory: 'DeveloperApplication',
            applicationSubCategory: 'Product Management CLI',
            operatingSystem: 'Windows, macOS, Linux',
            description:
              'Open-source AI product management CLI. 10 autonomous workflows for PMs: daily briefs, PRDs, prototypes, and more.',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            softwareVersion: '1.0.0',
            downloadUrl: 'https://www.npmjs.com/package/openpmkit',
            codeRepository: 'https://github.com/openpmkit/openpmkit',
          }),
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cobalt-50/50 to-background py-20 md:py-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="outline" className="mb-4 border-green-500 bg-green-50 text-green-700">
              <Github className="mr-1 h-3 w-3" />
              Open Source
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="text-cobalt-600">openpmkit</span>
              <br />
              AI workflows for Product Managers
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              10 autonomous workflows that run locally. Daily briefs, PRDs, prototypes, competitor research -
              all powered by your own API keys. No SaaS, no subscriptions, no data leaving your machine.
            </p>

            {/* Install command */}
            <div className="mx-auto mt-8 max-w-lg">
              <div className="rounded-lg border-2 border-cobalt-200 bg-slate-900 p-4">
                <div className="flex items-center justify-between">
                  <code className="font-mono text-sm text-white">
                    <span className="text-green-400">$</span> npm install -g openpmkit
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-400 hover:text-white"
                    onClick={() => navigator.clipboard?.writeText('npm install -g openpmkit')}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="https://github.com/openpmkit/openpmkit" target="_blank">
                  <Github className="mr-2 h-4 w-4" />
                  View on GitHub
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="https://www.npmjs.com/package/openpmkit" target="_blank">
                  <Terminal className="mr-2 h-4 w-4" />
                  npm package
                </Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-cobalt-100/30 blur-3xl" />
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-2xl font-bold text-center sm:text-3xl mb-8">
              Get started in 30 seconds
            </h2>
            <div className="rounded-lg border bg-slate-900 p-6 font-mono text-sm">
              <div className="space-y-2 text-slate-300">
                <p><span className="text-green-400">$</span> npm install -g openpmkit</p>
                <p><span className="text-green-400">$</span> openpmkit setup</p>
                <p className="text-slate-500"># Enter your OpenAI API key when prompted</p>
                <p><span className="text-green-400">$</span> openpmkit run daily-brief</p>
                <p className="text-slate-500"># Output saved to ~/openpmkit/daily-brief/</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Built for PMs who value control
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No cloud dependencies. No subscription fees. Your data stays on your machine.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 bg-background">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-cobalt-100">
                    <feature.icon className="h-5 w-5 text-cobalt-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workflows Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              10 workflows every PM needs
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Each workflow runs locally and outputs markdown with full telemetry.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <Card key={workflow.title} className="border bg-background">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cobalt-100">
                      <workflow.icon className="h-4 w-4 text-cobalt-600" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {workflow.schedule}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{workflow.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{workflow.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <code className="rounded bg-muted px-3 py-2 font-mono text-sm">
              openpmkit list
            </code>
            <span className="ml-2 text-muted-foreground">to see all available workflows</span>
          </div>
        </div>
      </section>

      {/* Built on openclaw Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-4">
              <Heart className="mr-1 h-3 w-3 text-red-500" />
              Open Source Ecosystem
            </Badge>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Standing on the shoulders of giants
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              openpmkit is inspired by and built on patterns from{' '}
              <Link href="https://github.com/anthropics/anthropic-cookbook" className="text-cobalt-600 hover:underline">
                Anthropic&apos;s cookbook
              </Link>{' '}
              and the{' '}
              <Link href="https://github.com/openclaw/openclaw" className="text-cobalt-600 hover:underline">
                openclaw
              </Link>{' '}
              CLI architecture. We believe AI tools for PMs should be open, extensible, and privacy-first.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button variant="outline" asChild>
                <Link href="https://github.com/openpmkit/openpmkit" target="_blank">
                  <Github className="mr-2 h-4 w-4" />
                  Contribute
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="https://github.com/openpmkit/openpmkit/issues" target="_blank">
                  Report Issues
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-cobalt-600 py-16 text-white md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Ready to automate your PM workflows?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-cobalt-100">
              Install openpmkit and run your first workflow in under a minute.
              Free forever, open source, no account required.
            </p>
            <div className="mt-8">
              <div className="mx-auto max-w-md rounded-lg bg-slate-900 p-4">
                <code className="font-mono text-white">
                  npm install -g openpmkit && openpmkit setup
                </code>
              </div>
            </div>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link href="https://github.com/openpmkit/openpmkit" target="_blank">
                  <Github className="mr-2 h-4 w-4" />
                  Star on GitHub
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-cobalt-600"
                asChild
              >
                <Link href="https://github.com/openpmkit/openpmkit#readme" target="_blank">
                  Read the Docs
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
