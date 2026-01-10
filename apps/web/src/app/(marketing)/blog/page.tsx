import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { blogPosts, blogTags, type BlogTag } from '@pmkit/content';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Insights on product management agents, PM workflows, VoC analysis, and enterprise governance.',
  openGraph: {
    title: 'pmkit Blog',
    description:
      'Insights on product management agents, PM workflows, VoC analysis, and enterprise governance.',
  },
  alternates: {
    types: {
      'application/rss+xml': 'https://getpmkit.com/rss.xml',
    },
  },
};

interface PageProps {
  searchParams: Promise<{ tag?: string }>;
}

export default async function BlogPage({ searchParams }: PageProps) {
  const { tag } = await searchParams;
  const selectedTag = tag as BlogTag | undefined;
  
  const filteredPosts = selectedTag
    ? blogPosts.filter((post) => post.tags.includes(selectedTag))
    : blogPosts;

  // Sort by featured first, then by date descending
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    // Featured posts come first
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    // Then sort by date
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-cobalt-50/50 to-background py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="cobalt" className="mb-4">
              Blog
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              Insights & Guides
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Deep dives on product management agents, PM workflows, VoC analysis, and enterprise
              governance.
            </p>
          </div>
        </div>
      </section>

      {/* Tag Filter */}
      <section className="border-b py-4">
        <div className="container">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Filter:</span>
            <Link href="/blog">
              <Badge variant={!selectedTag ? 'default' : 'outline'}>All</Badge>
            </Link>
            {blogTags.map((tag) => (
              <Link key={tag.value} href={`/blog?tag=${tag.value}`}>
                <Badge variant={selectedTag === tag.value ? 'default' : 'outline'}>
                  {tag.label}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {sortedPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Card className={`h-full transition-shadow hover:shadow-md ${post.featured ? 'ring-2 ring-cobalt-200 bg-cobalt-50/30' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {post.featured && (
                        <>
                          <Badge variant="cobalt" className="text-xs">Featured</Badge>
                          <span>·</span>
                        </>
                      )}
                      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                      <span>·</span>
                      <span>{post.readingTime} min read</span>
                    </div>
                    <CardTitle className="mt-2 text-xl leading-snug">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-3">
                      {post.description}
                    </CardDescription>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.slice(0, 2).map((tag) => {
                        const tagLabel = blogTags.find((t) => t.value === tag)?.label || tag;
                        return (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tagLabel}
                          </Badge>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {sortedPosts.length === 0 && (
            <div className="text-center text-muted-foreground">
              No posts found for this tag.
            </div>
          )}
        </div>
      </section>

    </>
  );
}

