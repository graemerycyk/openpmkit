import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ArrowRight, ArrowLeft, Check, X, Minus } from 'lucide-react';
import { siteConfig } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface ComparisonFeature {
  name: string;
  openpmkit: 'yes' | 'no' | 'partial' | string;
  competitor: 'yes' | 'no' | 'partial' | string;
  note?: string;
}

export interface ComparisonSection {
  title: string;
  description: string;
  openpmkitAdvantage: string;
  competitorAdvantage?: string;
}

export interface ComparisonFAQ {
  question: string;
  answer: string;
}

export interface ComparisonPageData {
  competitor: {
    name: string;
    tagline: string;
    website?: string;
  };
  // SEO-optimized titles
  headline: string; // e.g., "openpmkit vs ProductBoard: Which AI PM Tool is Right for You?"
  subheadline: string;
  // Quick verdict for featured snippets
  verdict: {
    openpmkitBestFor: string;
    competitorBestFor: string;
    summary: string;
  };
  // Feature comparison table
  features: ComparisonFeature[];
  // Detailed comparison sections
  sections: ComparisonSection[];
  // FAQ for schema markup
  faqs: ComparisonFAQ[];
  // Related content
  relatedResources?: string[];
}

// ============================================================================
// Feature Cell Component
// ============================================================================

function FeatureCell({ value }: { value: 'yes' | 'no' | 'partial' | string }) {
  if (value === 'yes') {
    return (
      <div className="flex items-center justify-center">
        <div className="rounded-full bg-green-100 p-1">
          <Check className="h-4 w-4 text-green-600" />
        </div>
      </div>
    );
  }
  if (value === 'no') {
    return (
      <div className="flex items-center justify-center">
        <div className="rounded-full bg-red-100 p-1">
          <X className="h-4 w-4 text-red-500" />
        </div>
      </div>
    );
  }
  if (value === 'partial') {
    return (
      <div className="flex items-center justify-center">
        <div className="rounded-full bg-amber-100 p-1">
          <Minus className="h-4 w-4 text-amber-600" />
        </div>
      </div>
    );
  }
  // Custom string value
  return <span className="text-sm text-center block">{value}</span>;
}

// ============================================================================
// Main Component
// ============================================================================

interface ComparisonPageProps {
  data: ComparisonPageData;
}

export function ComparisonPage({ data }: ComparisonPageProps) {
  const { competitor, headline, subheadline, verdict, features, sections, faqs } = data;

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
                name: 'Compare',
                item: `${siteConfig.url}/compare`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: `openpmkit vs ${competitor.name}`,
                item: `${siteConfig.url}/compare/${competitor.name.toLowerCase().replace(/\s+/g, '-')}`,
              },
            ],
          }),
        }}
      />

      {/* JSON-LD for FAQPage (AEO/GEO) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          }),
        }}
      />

      {/* JSON-LD for Article (comparison article) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: headline,
            description: subheadline,
            author: {
              '@type': 'Organization',
              name: 'openpmkit',
            },
            publisher: {
              '@type': 'Organization',
              name: 'openpmkit',
              logo: {
                '@type': 'ImageObject',
                url: `${siteConfig.url}/logo.png`,
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${siteConfig.url}/compare/${competitor.name.toLowerCase().replace(/\s+/g, '-')}`,
            },
          }),
        }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-cobalt-50/50 to-background py-16 md:py-24">
        <div className="container">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/compare">
                <ArrowLeft className="mr-2 h-4 w-4" />
                All Comparisons
              </Link>
            </Button>
          </div>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="cobalt" className="mb-4">
              Comparison Guide
            </Badge>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {headline}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">{subheadline}</p>
          </div>
        </div>
      </section>

      {/* Quick Verdict (Featured Snippet Target) */}
      <section className="border-b bg-muted/30 py-12">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <Card className="border-2 border-cobalt-200">
              <CardHeader className="bg-cobalt-50/50">
                <CardTitle className="text-center text-lg">Quick Verdict</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground mb-6">{verdict.summary}</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border bg-green-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="rounded-full bg-green-100 p-1">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-semibold text-green-800">Choose openpmkit if...</span>
                    </div>
                    <p className="text-sm text-green-700">{verdict.openpmkitBestFor}</p>
                  </div>
                  <div className="rounded-lg border bg-blue-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="rounded-full bg-blue-100 p-1">
                        <Check className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-semibold text-blue-800">Choose {competitor.name} if...</span>
                    </div>
                    <p className="text-sm text-blue-700">{verdict.competitorBestFor}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-heading text-2xl font-bold text-center mb-8">
              Feature Comparison: openpmkit vs {competitor.name}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-cobalt-200">
                    <th className="text-left py-4 px-4 font-semibold">Feature</th>
                    <th className="text-center py-4 px-4 font-semibold w-32">
                      <span className="text-cobalt-600">openpmkit</span>
                    </th>
                    <th className="text-center py-4 px-4 font-semibold w-32">
                      {competitor.name}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => (
                    <tr
                      key={feature.name}
                      className={`border-b ${index % 2 === 0 ? 'bg-muted/30' : ''}`}
                    >
                      <td className="py-4 px-4">
                        <span className="font-medium">{feature.name}</span>
                        {feature.note && (
                          <p className="text-xs text-muted-foreground mt-1">{feature.note}</p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <FeatureCell value={feature.openpmkit} />
                      </td>
                      <td className="py-4 px-4">
                        <FeatureCell value={feature.competitor} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              <Check className="inline h-3 w-3 text-green-600" /> = Yes &nbsp;
              <X className="inline h-3 w-3 text-red-500" /> = No &nbsp;
              <Minus className="inline h-3 w-3 text-amber-600" /> = Partial/Limited
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Comparison Sections */}
      <section className="bg-muted/30 py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-2xl font-bold text-center mb-8">
              Detailed Comparison
            </h2>
            <div className="space-y-6">
              {sections.map((section) => (
                <Card key={section.title}>
                  <CardHeader>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{section.description}</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg border-l-4 border-cobalt-500 bg-cobalt-50 p-4">
                        <span className="font-semibold text-cobalt-700 text-sm">openpmkit Advantage</span>
                        <p className="text-sm mt-1">{section.openpmkitAdvantage}</p>
                      </div>
                      {section.competitorAdvantage && (
                        <div className="rounded-lg border-l-4 border-gray-400 bg-gray-50 p-4">
                          <span className="font-semibold text-gray-700 text-sm">{competitor.name} Advantage</span>
                          <p className="text-sm mt-1">{section.competitorAdvantage}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-2xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cobalt-600 py-16 text-white md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">See openpmkit in Action</h2>
            <p className="mt-4 text-cobalt-100">
              Try all 10 PM workflows in the interactive demo. No signup required.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/demo">
                  Try the Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white text-cobalt-600 border-white hover:bg-cobalt-50" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
