import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
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
  competitive: 'Competitive Intel',
  voc: 'Voice of Customer',
};

// Generate long-form content for each resource
function generateResourceContent(resource: ResourcePage): string {
  // This would typically come from MDX files, but for the MVP we generate it
  return `
## What is ${resource.title.split(':')[0]}?

${resource.description}

Understanding ${resource.primaryKeyword} is essential for modern product teams looking to scale their operations while maintaining quality and governance. This guide covers everything you need to know about implementing ${resource.primaryKeyword} in your organization.

## Why ${resource.primaryKeyword} Matters

Product managers today face an overwhelming amount of information from multiple sources—Slack messages, Jira tickets, support conversations, customer calls, and community feedback. Manually synthesizing this information is time-consuming and error-prone.

${resource.primaryKeyword} addresses this challenge by:

- **Automating information gathering** across your tool stack
- **Synthesizing insights** from multiple sources into coherent artifacts
- **Maintaining traceability** so every insight can be traced back to its source
- **Enabling governance** through draft-only workflows and audit logging

## Key Concepts

### Multi-Step Workflows

Unlike simple AI assistants that respond to single prompts, ${resource.primaryKeyword} involves running complete workflows that span multiple tools and data sources. A typical workflow might:

1. Pull recent messages from Slack product channels
2. Cross-reference with open Jira tickets
3. Analyze Gong call transcripts for related mentions
4. Synthesize everything into a coherent brief or document

### Draft-Only Pattern

One of the most important aspects of ${resource.primaryKeyword} is the draft-only pattern. This means:

- Agents **never write directly** to external systems
- All outputs are **proposals** for human review
- You can **edit and refine** before publishing
- Full **audit trail** of what was proposed vs. approved

### MCP Connectors

pmkit uses MCP (Model Context Protocol) connectors to integrate with your tools. This architecture means:

- **Standardized integration** patterns across all tools
- **Swap mock for real** connectors without changing job logic
- **Secure authentication** with OAuth 2.0 or API keys
- **Audit logging** for every API call

## How pmkit Handles This

pmkit provides a complete solution for ${resource.primaryKeyword}:

### Pre-Built Job Types

- **Daily Brief**: Synthesize overnight activity from Slack, Jira, support, and community
- **Meeting Prep**: Prepare for customer meetings with context from calls and tickets
- **VoC Clustering**: Cluster feedback into actionable themes with evidence
- **Competitor Intel**: Track competitor changes with strategic implications
- **Roadmap Alignment**: Generate alignment memos with options and trade-offs
- **PRD Draft**: Draft PRDs grounded in customer evidence

### Enterprise Governance

- Role-based access control (RBAC)
- Permission simulation for testing
- Comprehensive audit logging
- Proposal expiration policies

### Traceability

- Every insight cites its source
- Tool call timeline with durations
- Downloadable artifacts in multiple formats

## Getting Started

Ready to try ${resource.primaryKeyword}? Here's how to get started:

1. **Try the Demo**: Run all six job types with mock enterprise data
2. **Contact Sales**: Get a personalized walkthrough for your team
3. **Configure Connectors**: Connect to your existing tools
4. **Run Your First Job**: Start with a daily brief to see the value immediately

## Best Practices

When implementing ${resource.primaryKeyword}, keep these best practices in mind:

1. **Start with one job type** and expand as you see value
2. **Review proposals carefully** before approving—the draft-only model is there for a reason
3. **Use the audit log** to understand how insights are generated
4. **Iterate on templates** based on what's most useful for your team
5. **Train your team** on the review and approval workflow

## Related Resources

Explore these related topics to deepen your understanding:
`;
}

export default async function ResourcePage({ params }: PageProps) {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);

  if (!resource) {
    notFound();
  }

  const content = generateResourceContent(resource);

  // Get related resources
  const relatedResources = resource.relatedPages
    .filter((path) => path.startsWith('/resources/'))
    .map((path) => {
      const slug = path.replace('/resources/', '');
      return getResourceBySlug(slug);
    })
    .filter((r): r is ResourcePage => r !== undefined)
    .slice(0, 3);

  return (
    <>
      {/* JSON-LD for FAQPage */}
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
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="prose" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>').replace(/## /g, '</p><h2>').replace(/### /g, '</p><h3>').replace(/- \*\*/g, '<li><strong>').replace(/\*\*/g, '</strong>').replace(/<\/strong> /g, '</strong>: ') }} />

            {/* CTA */}
            <div className="mt-12 rounded-lg bg-cobalt-50 p-8">
              <h3 className="font-heading text-xl font-bold">Try it in the pmkit demo</h3>
              <p className="mt-2 text-muted-foreground">
                See {resource.primaryKeyword} in action with a complete mock enterprise dataset.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/demo">
                  Try the Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* FAQ */}
            <div className="mt-16">
              <h2 className="font-heading text-2xl font-bold">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="mt-6">
                {resource.faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Related Resources */}
            {relatedResources.length > 0 && (
              <div className="mt-16">
                <h2 className="font-heading text-2xl font-bold">Related Resources</h2>
                <div className="mt-6 grid gap-4">
                  {relatedResources.map((related) => (
                    <Link key={related.slug} href={`/resources/${related.slug}`}>
                      <Card className="transition-shadow hover:shadow-md">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{related.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {related.description}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Contact CTA */}
            <div className="mt-16 rounded-lg border p-8 text-center">
              <h3 className="font-heading text-xl font-bold">Ready to get started?</h3>
              <p className="mt-2 text-muted-foreground">
                Contact sales for a personalized demo and pricing.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>

            {/* Back link */}
            <div className="mt-12">
              <Link
                href="/resources"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Resources
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

