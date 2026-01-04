import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Clock, User } from 'lucide-react';
import { blogPosts, getBlogPostBySlug, getAllBlogSlugs, getRelatedPosts, blogTags, getResourceBySlug } from '@pmkit/content';
import { formatDate, siteConfig } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    keywords: [post.primaryKeyword],
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      url: `${siteConfig.url}/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `${siteConfig.url}/blog/${post.slug}`,
    },
  };
}

// Generate blog post content
function generateBlogContent(post: typeof blogPosts[0]): string {
  // This generates substantial content for each blog post
  // In production, this would come from MDX files
  
  const baseContent = `
Product management is evolving rapidly, and ${post.primaryKeyword} represents one of the most significant shifts in how PMs work. In this comprehensive guide, we'll explore what this means for your team and how to implement it effectively.

## The Challenge

Modern product managers face an unprecedented volume of information:

- **Slack channels** buzzing with customer feedback and team discussions
- **Jira boards** tracking hundreds of tickets across multiple sprints
- **Gong calls** containing valuable customer insights buried in hours of recordings
- **Support tickets** revealing pain points and feature requests
- **Community forums** where users share ideas and frustrations

Synthesizing all of this manually is not just time-consuming; it's nearly impossible to do consistently well. Important signals get missed. Patterns go unnoticed. And PMs spend more time gathering information than acting on it.

## A New Approach

${post.primaryKeyword} offers a different path forward. Instead of manually combing through sources, you can:

1. **Automate information gathering** across your entire tool stack
2. **Synthesize insights** using AI that understands product context
3. **Maintain full traceability** so every insight can be verified
4. **Keep humans in control** through draft-only workflows

This isn't about replacing PM judgment; it's about giving PMs the synthesized information they need to make better decisions faster.

## Key Principles

### Draft-Only by Design

The most important principle is that AI agents should never write directly to external systems. Every proposed change; whether it's a Jira epic, a Confluence page, or a Slack message; should be a draft that humans review and approve.

This approach:
- Prevents AI mistakes from propagating to production systems
- Maintains accountability for all external communications
- Gives PMs the opportunity to refine and improve AI outputs
- Creates a clear audit trail of what was proposed vs. approved

### Full Traceability

Every insight should cite its source. When an AI agent identifies a pattern in customer feedback, you should be able to:

- See exactly which support tickets, calls, or community posts contributed
- Read the original quotes in context
- Verify the interpretation is accurate
- Share the evidence with stakeholders

This traceability is essential for building trust in AI-assisted workflows.

### Multi-Step Workflows

Simple AI assistants respond to single prompts. More sophisticated approaches run complete workflows that span multiple tools and data sources.

A typical workflow might:
1. Pull recent messages from Slack product channels
2. Cross-reference with open Jira tickets
3. Analyze Gong call transcripts for related mentions
4. Check support ticket trends
5. Synthesize everything into a coherent artifact

This multi-step approach produces much richer outputs than single-prompt interactions.

## Practical Implementation

### Getting Started

If you're new to ${post.primaryKeyword}, start with a single use case:

1. **Daily briefs** are often the best starting point; they're low-risk and provide immediate value
2. **Meeting prep** is another good choice if you have frequent customer meetings
3. **VoC clustering** is valuable for teams drowning in customer feedback

Don't try to automate everything at once. Build confidence with one workflow before expanding.

### Measuring Success

Track metrics that matter:

- **Time saved** on information gathering
- **Insight quality** based on stakeholder feedback
- **Decision velocity** for roadmap changes
- **Traceability usage** (are people clicking through to sources?)

### Common Pitfalls

Avoid these mistakes:

1. **Skipping the review step** because outputs "look good"
2. **Not training the team** on the new workflow
3. **Ignoring the audit log** and losing traceability benefits
4. **Over-automating** before understanding what works

## Real-World Examples

### Example 1: Daily Brief Automation

A product team at a B2B SaaS company was spending 45 minutes each morning manually checking Slack, Jira, and support tickets. After implementing automated daily briefs:

- Morning prep time dropped to 10 minutes (reading and acting on the brief)
- Blocked issues were surfaced 2x faster
- Customer escalations were caught before they became crises

### Example 2: VoC Clustering

An enterprise software team was struggling to synthesize feedback from 50+ support tickets, 20+ customer calls, and 100+ community posts per week. After implementing VoC clustering:

- Themes were identified in hours instead of weeks
- Evidence for roadmap decisions was always at hand
- Stakeholder alignment improved because everyone saw the same data

### Example 3: PRD Drafting

A PM was spending 3-4 hours researching and drafting each PRD. After implementing AI-assisted PRD drafting:

- First drafts were ready in 30 minutes
- Customer evidence was automatically included
- Open questions were explicitly called out
- Time to PRD approval dropped by 40%

## Try It Yourself

Ready to experience ${post.primaryKeyword} firsthand? The pmkit demo lets you run all six cadence jobs with a complete mock enterprise dataset:

- **Daily Brief**: See how overnight activity is synthesized
- **Meeting Prep**: Generate a prep pack for a mock customer meeting
- **VoC Clustering**: Watch themes emerge from support and call data
- **Competitor Research**: Track mock competitor product changes
- **Roadmap Alignment**: Generate an alignment memo with options
- **PRD Draft**: Create a PRD grounded in customer evidence

Each job shows the full tool call timeline, sources, and downloadable artifacts.

## Conclusion

${post.primaryKeyword} represents a significant opportunity for product teams to work more effectively. By automating information synthesis while keeping humans in control, teams can:

- Make better decisions with more complete information
- Move faster without sacrificing quality
- Maintain full traceability and governance
- Focus on strategy instead of data gathering

The key is to start small, measure results, and expand thoughtfully. The tools are ready; the question is whether your team is ready to use them.
`;

  return baseContent;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const content = generateBlogContent(post);
  const relatedPosts = getRelatedPosts(post.slug, 3);
  
  // Get related resources
  const relatedResources = post.relatedResources
    .map((s) => getResourceBySlug(s))
    .filter((r) => r !== undefined)
    .slice(0, 3);

  return (
    <>
      {/* JSON-LD for BlogPosting */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.description,
            datePublished: post.publishedAt,
            dateModified: post.publishedAt,
            author: {
              '@type': 'Organization',
              name: post.author,
            },
            publisher: {
              '@type': 'Organization',
              name: 'pmkit',
              logo: {
                '@type': 'ImageObject',
                url: `${siteConfig.url}/logo.png`,
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${siteConfig.url}/blog/${post.slug}`,
            },
          }),
        }}
      />

      {/* Breadcrumb */}
      <section className="border-b bg-muted/30 py-4">
        <div className="container">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/blog" className="hover:text-foreground">
              Blog
            </Link>
            <span>/</span>
            <span className="text-foreground line-clamp-1">{post.title}</span>
          </div>
        </div>
      </section>

      {/* Article Header */}
      <article>
        <header className="py-12 md:py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => {
                  const tagLabel = blogTags.find((t) => t.value === tag)?.label || tag;
                  return (
                    <Link key={tag} href={`/blog?tag=${tag}`}>
                      <Badge variant="cobalt">{tagLabel}</Badge>
                    </Link>
                  );
                })}
              </div>

              {/* Title */}
              <h1 className="mt-6 font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                {post.title}
              </h1>

              {/* Description */}
              <p className="mt-6 text-lg text-muted-foreground">{post.description}</p>

              {/* Meta */}
              <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.readingTime} min read</span>
                </div>
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="pb-16">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <div className="prose prose-lg" dangerouslySetInnerHTML={{ 
                __html: content
                  .split('\n\n')
                  .map(p => {
                    if (p.startsWith('## ')) return `<h2>${p.slice(3)}</h2>`;
                    if (p.startsWith('### ')) return `<h3>${p.slice(4)}</h3>`;
                    if (p.startsWith('- ')) return `<ul>${p.split('\n').map(li => `<li>${li.slice(2)}</li>`).join('')}</ul>`;
                    if (p.startsWith('1. ')) return `<ol>${p.split('\n').map(li => `<li>${li.slice(3)}</li>`).join('')}</ol>`;
                    if (p.trim()) return `<p>${p}</p>`;
                    return '';
                  })
                  .join('')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              }} />

              {/* CTA */}
              <div className="mt-12 rounded-lg bg-cobalt-50 p-8">
                <h3 className="font-heading text-xl font-bold">Try it in the pmkit demo</h3>
                <p className="mt-2 text-muted-foreground">
                  Experience {post.primaryKeyword} with a complete mock enterprise dataset.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/demo">
                    Try the Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Related Resources */}
              {relatedResources.length > 0 && (
                <div className="mt-16">
                  <h2 className="font-heading text-2xl font-bold">Related Resources</h2>
                  <div className="mt-6 grid gap-4">
                    {relatedResources.map((resource) => (
                      <Link key={resource.slug} href={`/resources/${resource.slug}`}>
                        <Card className="transition-shadow hover:shadow-md">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {resource.description}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="mt-16">
                  <h2 className="font-heading text-2xl font-bold">Related Posts</h2>
                  <div className="mt-6 grid gap-4">
                    {relatedPosts.map((related) => (
                      <Link key={related.slug} href={`/blog/${related.slug}`}>
                        <Card className="transition-shadow hover:shadow-md">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <time dateTime={related.publishedAt}>
                                {formatDate(related.publishedAt)}
                              </time>
                              <span>·</span>
                              <span>{related.readingTime} min read</span>
                            </div>
                            <CardTitle className="text-lg">{related.title}</CardTitle>
                          </CardHeader>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Back link */}
              <div className="mt-12">
                <Link
                  href="/blog"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}

