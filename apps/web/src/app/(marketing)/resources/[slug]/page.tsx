import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ArrowRight, ArrowLeft, CheckCircle2, Lightbulb, Target, Zap } from 'lucide-react';
import { getResourceBySlug, getAllResourceSlugs, type ResourcePage } from '@pmkit/content';
import { siteConfig } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllResourceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);
  if (!resource) return {};

  return {
    title: resource.title,
    description: resource.description,
    keywords: [resource.primaryKeyword, ...resource.secondaryKeywords],
    openGraph: {
      title: resource.title,
      description: resource.description,
      type: 'article',
      url: `${siteConfig.url}/resources/${resource.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: resource.title,
      description: resource.description,
    },
    alternates: {
      canonical: `${siteConfig.url}/resources/${resource.slug}`,
    },
  };
}

const categoryLabels: Record<ResourcePage['category'], string> = {
  agents: 'Agents',
  workflows: 'PM Workflows',
  integrations: 'Integrations',
  governance: 'Governance',
  competitive: 'Competition Research',
  voc: 'Voice of Customer',
};

export default async function ResourcePageComponent({ params }: PageProps) {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);

  if (!resource) {
    notFound();
  }

  // Get related resources
  const relatedResources = resource.relatedPages
    .filter((path) => path.startsWith('/resources/'))
    .map((path) => {
      const relatedSlug = path.replace('/resources/', '');
      return getResourceBySlug(relatedSlug);
    })
    .filter((r): r is ResourcePage => r !== undefined)
    .slice(0, 3);

  return (
    <>
      {/* JSON-LD for BreadcrumbList (AEO/GEO - improves navigation in search results) */}
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
                name: 'Resources',
                item: `${siteConfig.url}/resources`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: resource.title,
                item: `${siteConfig.url}/resources/${resource.slug}`,
              },
            ],
          }),
        }}
      />

      {/* JSON-LD for FAQPage (AEO/GEO - appears in "People Also Ask") */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: resource.faqItems.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          }),
        }}
      />

      {/* JSON-LD for HowTo (AEO/GEO - for workflow pages with steps) */}
      {resource.workedExample && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'HowTo',
              name: `How to use ${resource.primaryKeyword}`,
              description: resource.workedExample.scenario,
              step: resource.workedExample.steps.map((step, index) => ({
                '@type': 'HowToStep',
                position: index + 1,
                text: step,
              })),
            }),
          }}
        />
      )}

      {/* Breadcrumb */}
      <section className="border-b bg-muted/30 py-4">
        <div className="container">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/resources" className="hover:text-foreground">
              Resources
            </Link>
            <span>/</span>
            <span className="text-foreground">{categoryLabels[resource.category]}</span>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <Badge variant="cobalt" className="mb-4">
              {categoryLabels[resource.category]}
            </Badge>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {resource.title}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">{resource.description}</p>
            <div className="mt-8 flex flex-wrap gap-2">
              <Badge variant="outline">{resource.primaryKeyword}</Badge>
              {resource.secondaryKeywords.slice(0, 3).map((kw) => (
                <Badge key={kw} variant="outline">
                  {kw}
                </Badge>
              ))}
            </div>
            <div className="mt-8 flex gap-4">
              <Button asChild>
                <Link href="/demo">
                  Try the Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      {resource.keyBenefits && (
        <section className="border-t bg-muted/30 py-12">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <div className="grid gap-4 sm:grid-cols-2">
                {resource.keyBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="rounded-full bg-green-100 p-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Worked Example */}
      {resource.workedExample && (
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center gap-2 text-cobalt-600">
                <Lightbulb className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  Real Example
                </span>
              </div>
              <h2 className="mt-2 font-heading text-2xl font-bold">
                {resource.workedExample.title}
              </h2>
              <p className="mt-4 text-muted-foreground">{resource.workedExample.scenario}</p>

              <div className="mt-8 rounded-lg border bg-card p-6">
                <h3 className="font-semibold">How it works:</h3>
                <ol className="mt-4 space-y-3">
                  {resource.workedExample.steps.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cobalt-100 text-xs font-semibold text-cobalt-700">
                        {index + 1}
                      </span>
                      <span className="text-sm text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-6 rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
                <div className="flex items-center gap-2 font-semibold text-green-800">
                  <Target className="h-4 w-4" />
                  Outcome
                </div>
                <p className="mt-1 text-sm text-green-700">{resource.workedExample.outcome}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Is This Right For You? Checklist */}
      {resource.checklist && (
        <section className="border-t bg-muted/30 py-12 md:py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-heading text-2xl font-bold">Is this right for you?</h2>
              <p className="mt-2 text-muted-foreground">
                If you answer &quot;yes&quot; to any of these, {resource.primaryKeyword} can help.
              </p>
              <div className="mt-8 space-y-4">
                {resource.checklist.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg border bg-card p-4"
                  >
                    <div className="mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-cobalt-300" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How pmkit Handles This */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-2 text-cobalt-600">
              <Zap className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                The pmkit Solution
              </span>
            </div>
            <h2 className="mt-2 font-heading text-2xl font-bold">
              How pmkit handles {resource.primaryKeyword}
            </h2>

            <div className="mt-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pre-Built Job Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      • <strong>Daily Brief</strong>: Synthesize overnight activity from Slack,
                      Jira, support, and community
                    </li>
                    <li>
                      • <strong>Meeting Prep</strong>: Prepare for customer meetings with context
                      from calls and tickets
                    </li>
                    <li>
                      • <strong>Feature Intelligence</strong>: Cluster feedback into actionable themes
                      with evidence
                    </li>
                    <li>
                      • <strong>Competitor Research</strong>: Track competitor product changes and
                      releases
                    </li>
                    <li>
                      • <strong>Roadmap Alignment</strong>: Generate alignment memos with options
                      and trade-offs
                    </li>
                    <li>
                      • <strong>PRD Draft</strong>: Draft PRDs grounded in customer evidence
                    </li>
                    <li>
                      • <strong>Sprint Review</strong>: Generate sprint summaries with completed
                      work
                    </li>
                    <li>
                      • <strong>Release Notes</strong>: Auto-generate release notes from Jira
                      tickets
                    </li>
                    <li>
                      • <strong>Deck Content</strong>: Generate presentation content and talking
                      points
                    </li>
                    <li>
                      • <strong>Prototype Generation</strong>: Convert PRDs to interactive
                      prototypes
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Draft-Only Pattern</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    pmkit never writes directly to external systems. All outputs are proposals that
                    you review, edit, and approve before anything is published. This gives you AI
                    autonomy with human control.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Enterprise Governance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Role-based access control (RBAC)</li>
                    <li>• Comprehensive audit logging</li>
                    <li>• SSO integration (SAML/OIDC)</li>
                    <li>• Every insight cites its source</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cobalt-600 py-12">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-2xl font-bold text-white">
              Try {resource.primaryKeyword} in the demo
            </h2>
            <p className="mt-2 text-cobalt-100">
              See it in action with a complete demo enterprise dataset. No signup required.
            </p>
            <Button className="mt-6 bg-white text-cobalt-600 hover:bg-cobalt-50" asChild>
              <Link href="/demo">
                Launch Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-2xl font-bold">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="mt-6">
              {resource.faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Related Resources */}
      {relatedResources.length > 0 && (
        <section className="border-t bg-muted/30 py-12 md:py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-heading text-2xl font-bold">Related Resources</h2>
              <div className="mt-6 grid gap-4">
                {relatedResources.map((related) => (
                  <Link key={related.slug} href={`/resources/${related.slug}`}>
                    <Card className="transition-shadow hover:shadow-md">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{related.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {related.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section className="bg-cobalt-600 py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h3 className="font-heading text-2xl font-bold text-white">Ready to get started?</h3>
            <p className="mt-2 text-cobalt-100">
              Contact sales for a personalized demo and pricing.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-cobalt-600 hover:bg-cobalt-50" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
              <Button variant="outline" className="bg-white text-cobalt-600 border-white hover:bg-cobalt-50" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Back link */}
      <section className="py-8">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/resources"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Resources
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
