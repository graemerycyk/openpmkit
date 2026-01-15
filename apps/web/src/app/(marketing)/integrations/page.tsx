import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MessageSquare, Layers, Phone, FileText, Headphones, BarChart3 } from 'lucide-react';
import { siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Integrations | pmkit',
  description:
    'Connect pmkit with your existing tools: Jira, Slack, Gong, Confluence, Zendesk, and more. AI-powered workflows that work with your stack.',
  keywords: [
    'pmkit integrations',
    'Jira AI integration',
    'Slack product management',
    'Gong AI insights',
    'product management integrations',
    'AI PM tool integrations',
  ],
  openGraph: {
    title: 'pmkit Integrations',
    description: 'Connect pmkit with Jira, Slack, Gong, Confluence, Zendesk, and more.',
    url: `${siteConfig.url}/integrations`,
  },
  alternates: {
    canonical: `${siteConfig.url}/integrations`,
  },
};

const integrations = [
  {
    slug: 'jira',
    name: 'Jira',
    tagline: 'Issue tracking & project management',
    description: 'Pull sprint data, propose epics and stories, generate sprint reviews from completed work.',
    icon: Layers,
    status: 'available',
  },
  {
    slug: 'slack',
    name: 'Slack',
    tagline: 'Team communication',
    description: 'Synthesize channel activity into daily briefs, cite messages in PRDs, track decisions.',
    icon: MessageSquare,
    status: 'available',
  },
  {
    slug: 'gong',
    name: 'Gong',
    tagline: 'Revenue intelligence',
    description: 'Extract insights from call transcripts, cite customer conversations in PRDs and VoC reports.',
    icon: Phone,
    status: 'available',
  },
  {
    slug: 'confluence',
    name: 'Confluence',
    tagline: 'Team documentation',
    description: 'Pull context from existing docs, propose new pages with drafted PRDs and specs.',
    icon: FileText,
    status: 'available',
  },
  {
    slug: 'zendesk',
    name: 'Zendesk',
    tagline: 'Customer support',
    description: 'Cluster support tickets into themes, cite customer issues in VoC reports and PRDs.',
    icon: Headphones,
    status: 'available',
  },
  {
    slug: 'amplitude',
    name: 'Amplitude',
    tagline: 'Product analytics',
    description: 'Pull usage metrics into briefs, reference data trends in PRDs.',
    icon: BarChart3,
    status: 'coming-soon',
  },
];

export default function IntegrationsPage() {
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
                name: 'Integrations',
                item: `${siteConfig.url}/integrations`,
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
              Integrations
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              Connect Your
              <span className="text-cobalt-600"> PM Stack</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              pmkit works with the tools your team already uses. Pull data from Jira, Slack, Gong,
              and more—then generate artifacts with full traceability back to source.
            </p>
          </div>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => (
              <Card key={integration.slug} className="group transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cobalt-100">
                      <integration.icon className="h-6 w-6 text-cobalt-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{integration.name}</CardTitle>
                        {integration.status === 'coming-soon' && (
                          <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                        )}
                      </div>
                      <CardDescription>{integration.tagline}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                  {integration.status === 'available' ? (
                    <Button variant="outline" className="mt-4 w-full" asChild>
                      <Link href={`/integrations/${integration.slug}`}>
                        Learn More
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

      {/* How It Works */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">How Integrations Work</h2>
            <p className="mt-4 text-muted-foreground">
              pmkit uses the Model Context Protocol (MCP) to connect to your tools securely.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-4xl">
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Connect',
                  description: 'OAuth flow connects pmkit to your tools. Your credentials are encrypted at rest.',
                },
                {
                  step: '02',
                  title: 'Read',
                  description: 'pmkit pulls data from your tools: messages, tickets, transcripts, issues.',
                },
                {
                  step: '03',
                  title: 'Propose',
                  description: 'AI generates artifacts with citations. Writes are proposals for your review.',
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cobalt-600 text-lg font-bold text-white">
                    {item.step}
                  </div>
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
            <h2 className="font-heading text-3xl font-bold">See Integrations in Action</h2>
            <p className="mt-4 text-cobalt-100">
              Try the demo to see how pmkit synthesizes data from multiple tools into actionable artifacts.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/demo">
                  Try the Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white text-cobalt-600 border-white hover:bg-cobalt-50" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
