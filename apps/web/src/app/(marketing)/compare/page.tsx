import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, FileText, Lightbulb, LayoutGrid, Target, Workflow } from 'lucide-react';

export const metadata: Metadata = {
  title: 'pmkit vs Competitors',
  description:
    'See how pmkit compares to ChatPRD, Nalin, Atlassian Jira Product Discovery, Productboard, and automation tools like Zapier. Battlecard comparisons with wins, risks, and counterpunches.',
  openGraph: {
    title: 'pmkit vs Competitors',
    description:
      'See how pmkit compares to ChatPRD, Nalin, Atlassian Jira Product Discovery, Productboard, and automation tools.',
  },
};

const competitors = [
  {
    slug: 'automation-tools',
    name: 'Automation Tools',
    tagline: 'Zapier, Make, n8n, and more',
    description: 'Job automation tools are great for simple workflows. pmkit is built for PM work that needs governance, traceability, and chained deliverables.',
    icon: Workflow,
  },
  {
    slug: 'chatprd',
    name: 'ChatPRD',
    tagline: 'AI PRD writing assistant',
    description: 'ChatPRD generates PRDs from prompts. pmkit grounds PRDs in actual customer evidence with full traceability.',
    icon: FileText,
  },
  {
    slug: 'nalin',
    name: 'Nalin',
    tagline: 'AI product management copilot',
    description: 'Nalin is a general PM copilot. pmkit is a workflow engine with draft-only governance and chained deliverables.',
    icon: Lightbulb,
  },
  {
    slug: 'jira-product-discovery',
    name: 'Jira Product Discovery',
    tagline: 'Atlassian\'s prioritization tool',
    description: 'JPD helps prioritize ideas. pmkit synthesizes evidence, drafts artifacts, and chains into Jira delivery.',
    icon: LayoutGrid,
  },
  {
    slug: 'productboard',
    name: 'Productboard',
    tagline: 'Product management platform',
    description: 'Productboard is a PM platform. pmkit is an AI agent that runs workflows and proposes artifacts for review.',
    icon: Target,
  },
];

export default function ComparePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-cobalt-50/50 to-background py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="cobalt" className="mb-4">
              Battlecards
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              pmkit vs
              <span className="text-cobalt-600"> The Competition</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Honest comparisons with wins, risks, and counterpunches. See where pmkit shines
              and where alternatives might fit better.
            </p>
          </div>
        </div>
      </section>

      {/* Competitor Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2">
            {competitors.map((competitor) => (
              <Card key={competitor.slug} className="group transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cobalt-100">
                      <competitor.icon className="h-6 w-6 text-cobalt-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">pmkit vs {competitor.name}</CardTitle>
                      <CardDescription>{competitor.tagline}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{competitor.description}</p>
                  <Button variant="outline" className="mt-4 w-full" asChild>
                    <Link href={`/compare/${competitor.slug}`}>
                      View Battlecard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
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
            <h2 className="font-heading text-3xl font-bold">Try It Yourself</h2>
            <p className="mt-4 text-cobalt-100">
              The best comparison is hands-on. Run all eight PM workflows in the demo.
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

