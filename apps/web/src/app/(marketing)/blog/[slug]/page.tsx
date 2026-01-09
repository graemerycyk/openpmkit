import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import * as fs from 'fs';
import * as path from 'path';
import { marked, type Tokens } from 'marked';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Clock, User } from 'lucide-react';
import { getBlogPostBySlug, getAllBlogSlugs, getRelatedPosts, blogTags, getResourceBySlug } from '@pmkit/content';
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

/**
 * Get MDX content for a blog post by reading from the file system.
 * This runs at build time for static generation.
 */
function getMdxContent(slug: string): string | null {
  // Path to the MDX files in the content package
  const mdxPath = path.join(process.cwd(), '..', '..', 'packages', 'content', 'src', 'blog-content', `${slug}.mdx`);
  
  // Alternative path when running from workspace root
  const altMdxPath = path.join(process.cwd(), 'packages', 'content', 'src', 'blog-content', `${slug}.mdx`);
  
  for (const tryPath of [mdxPath, altMdxPath]) {
    try {
      if (fs.existsSync(tryPath)) {
        return fs.readFileSync(tryPath, 'utf-8');
      }
    } catch {
      // Continue to next path
    }
  }
  
  return null;
}

/**
 * Configure marked for our styling needs
 */
function configureMarked() {
  // Configure marked with custom renderer
  const renderer = new marked.Renderer();
  
  // Custom heading renderer with proper classes
  renderer.heading = function(token: Tokens.Heading): string {
    const { text, depth } = token;
    const id = text.toLowerCase().replace(/[^\w]+/g, '-');
    const classes: Record<number, string> = {
      1: 'font-heading text-3xl font-bold tracking-tight mt-8 mb-4',
      2: 'font-heading text-2xl font-bold tracking-tight mt-10 mb-4 scroll-mt-20',
      3: 'font-heading text-xl font-semibold tracking-tight mt-8 mb-3',
      4: 'font-heading text-lg font-semibold tracking-tight mt-6 mb-2',
      5: 'font-heading text-base font-semibold mt-4 mb-2',
      6: 'font-heading text-sm font-semibold mt-4 mb-2',
    };
    return `<h${depth} id="${id}" class="${classes[depth] || ''}">${text}</h${depth}>`;
  };
  
  // Custom paragraph
  renderer.paragraph = function(token: Tokens.Paragraph): string {
    return `<p class="leading-7 mb-4">${this.parser.parseInline(token.tokens)}</p>`;
  };
  
  // Custom list
  renderer.list = function(token: Tokens.List): string {
    const tag = token.ordered ? 'ol' : 'ul';
    const listClass = token.ordered ? 'my-4 ml-6 list-decimal [&>li]:mt-2' : 'my-4 ml-6 list-disc [&>li]:mt-2';
    const body = token.items.map(item => this.listitem(item)).join('');
    return `<${tag} class="${listClass}">${body}</${tag}>`;
  };
  
  // Custom list item
  renderer.listitem = function(token: Tokens.ListItem): string {
    const content = this.parser.parse(token.tokens);
    return `<li class="leading-7">${content}</li>`;
  };
  
  // Custom blockquote
  renderer.blockquote = function(token: Tokens.Blockquote): string {
    const body = this.parser.parse(token.tokens);
    return `<blockquote class="mt-6 border-l-4 border-cobalt-500 pl-6 italic text-muted-foreground">${body}</blockquote>`;
  };
  
  // Custom link
  renderer.link = function(token: Tokens.Link): string {
    const { href, text } = token;
    const isInternal = href?.startsWith('/');
    if (isInternal) {
      return `<a href="${href}" class="text-cobalt-600 hover:text-cobalt-700 underline underline-offset-4">${text}</a>`;
    }
    return `<a href="${href}" class="text-cobalt-600 hover:text-cobalt-700 underline underline-offset-4" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };
  
  // Custom code (inline)
  renderer.codespan = function(token: Tokens.Codespan): string {
    return `<code class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">${token.text}</code>`;
  };
  
  // Custom code block
  renderer.code = function(token: Tokens.Code): string {
    const langClass = token.lang ? `language-${token.lang}` : '';
    const escapedText = token.text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre class="my-4 overflow-x-auto rounded-lg bg-muted p-4"><code class="${langClass} block font-mono text-sm">${escapedText}</code></pre>`;
  };
  
  // Custom table
  renderer.table = function(token: Tokens.Table): string {
    const headerCells = token.header.map(cell => {
      const content = this.parser.parseInline(cell.tokens);
      return `<th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">${content}</th>`;
    }).join('');
    const header = `<tr class="border-b">${headerCells}</tr>`;
    
    const bodyRows = token.rows.map(row => {
      const cells = row.map(cell => {
        const content = this.parser.parseInline(cell.tokens);
        return `<td class="p-4 align-middle">${content}</td>`;
      }).join('');
      return `<tr class="border-b transition-colors hover:bg-muted/50">${cells}</tr>`;
    }).join('');
    
    return `<div class="my-6 w-full overflow-x-auto"><table class="w-full border-collapse text-sm"><thead class="border-b bg-muted/50">${header}</thead><tbody class="divide-y">${bodyRows}</tbody></table></div>`;
  };
  
  // Custom horizontal rule
  renderer.hr = function(): string {
    return '<hr class="my-8 border-t" />';
  };
  
  // Custom strong
  renderer.strong = function(token: Tokens.Strong): string {
    return `<strong class="font-semibold">${this.parser.parseInline(token.tokens)}</strong>`;
  };
  
  // Custom emphasis
  renderer.em = function(token: Tokens.Em): string {
    return `<em class="italic">${this.parser.parseInline(token.tokens)}</em>`;
  };

  marked.use({ renderer });
}

// Configure marked once
configureMarked();

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Get MDX content
  const mdxContent = getMdxContent(slug);
  
  if (!mdxContent) {
    notFound();
  }

  // Convert markdown to HTML
  const htmlContent = await marked.parse(mdxContent);

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

              {/* Description */}
              <div className="mt-6">
                <p className="text-lg text-muted-foreground">{post.description}</p>
              </div>

              {/* Meta */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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

        {/* Article Content - Markdown Rendered */}
        <div className="pb-16">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />

              {/* CTA */}
              <div className="mt-12 rounded-lg bg-cobalt-50 p-8">
                <h3 className="font-heading text-xl font-bold">Try it in the pmkit demo</h3>
                <p className="mt-2 text-muted-foreground">
                  Experience {post.primaryKeyword} with a complete demo enterprise dataset.
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
