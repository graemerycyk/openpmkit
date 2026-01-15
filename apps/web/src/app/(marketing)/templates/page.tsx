import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, FileText, Sunrise, Zap, Users } from 'lucide-react';
import { siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'PM Templates | pmkit - AI-Powered Product Management Templates',
  description:
    'Free product management templates: PRD template, daily brief template, sprint review template. Powered by AI with customer evidence.',
  keywords: [
    'PRD template',
    'product requirements template',
    'daily brief template',
    'daily standup template',
    'sprint review template',
    'PM templates',
    'product management templates',
  ],
  openGraph: {
    title: 'PM Templates by pmkit',
    description: 'Free AI-powered product management templates.',
    url: `${siteConfig.url}/templates`,
  },
  alternates: {
    canonical: `${siteConfig.url}/templates`,
  },
};

const templates = [
  {
    slug: 'prd',
    name: 'PRD Template',
    tagline: 'Product Requirements Document',
    description: 'AI-powered PRD template that cites customer evidence. Includes problem statement, user stories, acceptance criteria, and more.',
    icon: FileText,
    keywords: 'PRD template, product requirements document template, AI PRD generator',
  },
  {
    slug: 'daily-brief',
    name: 'Daily Brief Template',
    tagline: 'Morning standup briefing',
    description: 'Automated daily brief template that synthesizes overnight updates from Slack, Jira, and support tickets.',
    icon: Sunrise,
    keywords: 'daily brief template, daily standup template, PM morning briefing',
  },
  {
    slug: 'sprint-review',
    name: 'Sprint Review Template',
    tagline: 'End-of-sprint summary',
    description: 'Auto-generated sprint review with completed work, blockers, carryover items, and release notes.',
    icon: Zap,
    status: 'coming-soon',
  },
  {
    slug: 'meeting-prep',
    name: 'Meeting Prep Template',
    tagline: 'Stakeholder meeting preparation',
    description: 'Prepare for executive reviews with context, talking points, and anticipated questions.',
    icon: Users,
    status: 'coming-soon',
  },
];

export default function TemplatesPage() {
  return (
    <>
      {/* JSON-LD for BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: siteConfig.url,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Templates',
                item: `${siteConfig.url}/templates`,
              },
            ],
          }),
        }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-cobalt-50/50 to-background py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="cobalt" className="mb-4">
              Templates
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              PM Templates
              <span className="text-cobalt-600"> Powered by AI</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Free product management templates that integrate with pmkit's AI workflows.
              Generate PRDs, daily briefs, and more with cited customer evidence.
            </p>
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2">
            {templates.map((template) => (
              <Card key={template.slug} className="group transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cobalt-100">
                      <template.icon className="h-6 w-6 text-cobalt-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{template.name}</CardTitle>
                        {template.status === 'coming-soon' && (
                          <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                        )}
                      </div>
                      <CardDescription>{template.tagline}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  {template.status !== 'coming-soon' ? (
                    <Button variant="outline" className="mt-4 w-full" asChild>
                      <Link href={`/templates/${template.slug}`}>
                        View Template
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" className="mt-4 w-full" disabled>
                      Coming Soon
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why AI Templates */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">Why AI-Powered Templates?</h2>
            <p className="mt-4 text-muted-foreground">
              Traditional templates are empty shells. pmkit templates are filled with real data.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-4xl">
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  title: 'Evidence-Grounded',
                  description: 'PRDs cite actual customer conversations from Slack, Gong, and Zendesk.',
                },
                {
                  title: 'Auto-Populated',
                  description: 'Daily briefs pull overnight updates from your connected tools automatically.',
                },
                {
                  title: 'Always Current',
                  description: 'Sprint reviews reflect what actually shipped, not what you remember.',
                },
              ].map((item) => (
                <div key={item.title} className="text-center">
                  <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cobalt-600 py-16 text-white md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">Try Templates in Action</h2>
            <p className="mt-4 text-cobalt-100">
              See how pmkit fills templates with real data in the interactive demo.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/demo">
                  Try the Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white text-cobalt-600 border-white hover:bg-cobalt-50" asChild>
                <Link href="/how-it-works">How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
