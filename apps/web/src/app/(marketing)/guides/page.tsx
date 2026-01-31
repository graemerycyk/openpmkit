import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, FileText, BarChart3, Zap } from 'lucide-react';
import { siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'PM Guides | openpmkit - Product Management How-To Guides',
  description:
    'Learn how to write PRDs with AI, prioritize features, automate release notes, and more. Step-by-step guides for product managers.',
  keywords: [
    'how to write PRD',
    'feature prioritization guide',
    'automate release notes',
    'product management guides',
    'PM best practices',
    'AI product management',
  ],
  openGraph: {
    title: 'PM Guides by pmkit',
    description: 'Step-by-step guides for AI-powered product management.',
    url: `${siteConfig.url}/guides`,
  },
  alternates: {
    canonical: `${siteConfig.url}/guides`,
  },
};

const guides = [
  {
    slug: 'how-to-write-prd-ai',
    name: 'How to Write a PRD with AI',
    tagline: 'Evidence-backed product requirements',
    description: 'Learn how to create PRDs that cite actual customer evidence using AI. Step-by-step guide from problem definition to stakeholder review.',
    icon: FileText,
    readTime: '8 min read',
  },
  {
    slug: 'prioritize-features-ai',
    name: 'How to Prioritize Features with AI',
    tagline: 'Data-driven prioritization',
    description: 'Use AI to synthesize customer feedback, quantify demand, and make evidence-based prioritization decisions.',
    icon: BarChart3,
    readTime: '6 min read',
  },
  {
    slug: 'automate-release-notes',
    name: 'How to Automate Release Notes',
    tagline: 'From Jira to customers',
    description: 'Automatically generate release notes from completed Jira issues. Save hours every release cycle.',
    icon: Zap,
    readTime: '5 min read',
  },
];

export default function GuidesPage() {
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
                name: 'Guides',
                item: `${siteConfig.url}/guides`,
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
              Guides
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              PM Guides
              <span className="text-cobalt-600"> How-To</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Step-by-step guides for AI-powered product management.
              Learn how to write PRDs, prioritize features, and automate workflows.
            </p>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <Card key={guide.slug} className="group transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cobalt-100">
                      <guide.icon className="h-6 w-6 text-cobalt-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{guide.name}</CardTitle>
                      <CardDescription>{guide.tagline}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{guide.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{guide.readTime}</span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/guides/${guide.slug}`}>
                        Read Guide
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cobalt-600 py-16 text-white md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">See Guides in Action</h2>
            <p className="mt-4 text-cobalt-100">
              Try the workflows described in these guides in the interactive demo.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="https://github.com/openpmkit/openpmkit">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white text-cobalt-600 border-white hover:bg-cobalt-50" asChild>
                <Link href="/resources">View Resources</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
