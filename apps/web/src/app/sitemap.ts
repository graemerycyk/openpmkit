import { MetadataRoute } from 'next';
import { getAllResourceSlugs, blogPosts } from '@pmkit/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://getpmkit.com';

  // Static pages
  const staticPages = [
    '',
    '/how-it-works',
    '/demo',
    '/pricing',
    '/resources',
    '/blog',
    '/contact',
    '/login',
    '/privacy',
    '/terms',
    '/changelog',
    '/security',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Resource pages
  const resourcePages = getAllResourceSlugs().map((slug) => ({
    url: `${baseUrl}/resources/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Blog posts
  const blogPages = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...resourcePages, ...blogPages];
}

