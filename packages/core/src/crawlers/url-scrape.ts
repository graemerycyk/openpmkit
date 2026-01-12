/**
 * URL Scrape Crawler - Fetch and extract content from specific URLs
 *
 * Fetches page content directly and extracts text for AI analysis.
 * Useful for:
 * - Analyzing competitor pricing pages
 * - Extracting content from blog posts
 * - Reviewing documentation pages
 * - Deep-diving into specific pages found by other crawlers
 */

import type { UrlScrapeCrawlerInput, CrawlerResponse, CrawlerResult } from './types';

// ============================================================================
// Content Extraction
// ============================================================================

interface ExtractedContent {
  title: string;
  content: string;
  description?: string;
  author?: string;
  publishedDate?: string;
  metadata: Record<string, unknown>;
}

/**
 * Extract content from HTML
 * Basic implementation - in production you'd use cheerio or similar
 */
function extractContentFromHtml(html: string, url: string): ExtractedContent {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch?.[1]?.trim() || new URL(url).hostname;

  // Extract meta description
  const descMatch = html.match(
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
  ) || html.match(
    /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i
  );
  const description = descMatch?.[1];

  // Extract author
  const authorMatch = html.match(
    /<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["']/i
  ) || html.match(
    /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']author["']/i
  );
  const author = authorMatch?.[1];

  // Extract published date (Open Graph or article:published_time)
  const dateMatch = html.match(
    /<meta[^>]*property=["']article:published_time["'][^>]*content=["']([^"']+)["']/i
  ) || html.match(
    /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']article:published_time["']/i
  ) || html.match(
    /<time[^>]*datetime=["']([^"']+)["']/i
  );
  const publishedDate = dateMatch?.[1];

  // Extract Open Graph image
  const ogImageMatch = html.match(
    /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i
  );
  const ogImage = ogImageMatch?.[1];

  // Extract main content by removing non-content elements
  let content = html
    // Remove script tags and their content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    // Remove style tags and their content
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // Remove navigation
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    // Remove footer
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    // Remove header
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    // Remove aside
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
    // Remove comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove SVG
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
    // Remove noscript
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    // Convert br and p to newlines
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Decode common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();

  // Truncate if too long
  const maxLength = 10000;
  if (content.length > maxLength) {
    content = content.slice(0, maxLength) + '...';
  }

  const parsedUrl = new URL(url);

  return {
    title,
    content,
    description,
    author,
    publishedDate,
    metadata: {
      url,
      domain: parsedUrl.hostname,
      path: parsedUrl.pathname,
      contentLength: content.length,
      hasOgImage: !!ogImage,
      ogImage,
    },
  };
}

// ============================================================================
// URL Fetching
// ============================================================================

/**
 * Fetch a URL with appropriate headers
 */
async function fetchUrl(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; pmkit-crawler/1.0; +https://getpmkit.com)',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      throw new Error(`Unsupported content type: ${contentType}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================================================
// Main Crawler
// ============================================================================

/**
 * Run the URL Scrape crawler
 * Fetches and extracts content from specified URLs
 */
export async function runUrlScrapeCrawler(
  input: UrlScrapeCrawlerInput
): Promise<CrawlerResponse> {
  const { urls, extractOptions } = input;
  const results: CrawlerResult[] = [];
  const errors: string[] = [];
  const maxContentLength = extractOptions?.maxContentLength || 10000;

  // Process URLs sequentially to avoid rate limiting
  for (const url of urls) {
    try {
      // Validate URL
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Only HTTP and HTTPS URLs are supported');
      }

      // Fetch the page
      const html = await fetchUrl(url);

      // Extract content
      const extracted = extractContentFromHtml(html, url);

      // Truncate content if needed
      let content = extracted.content;
      if (content.length > maxContentLength) {
        content = content.slice(0, maxContentLength) + '...';
      }

      results.push({
        id: `url-${Date.now()}-${results.length}`,
        jobId: '', // Set by caller
        source: parsedUrl.hostname,
        title: extracted.title,
        url,
        content,
        author: extracted.author,
        publishedAt: extracted.publishedDate
          ? new Date(extracted.publishedDate)
          : undefined,
        sentiment: undefined,
        metadata: {
          ...extracted.metadata,
          description: extracted.description,
        },
        createdAt: new Date(),
      });

      // Small delay between requests to be polite
      if (urls.indexOf(url) < urls.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`${url}: ${message}`);
      console.error(`Failed to fetch ${url}:`, message);
    }
  }

  return {
    success: results.length > 0,
    results,
    error: errors.length > 0 ? `${errors.length} URL(s) failed: ${errors.join('; ')}` : undefined,
    metadata: {
      totalResults: results.length,
      fetchedAt: new Date(),
      source: 'url_scrape',
    },
  };
}

// Export for testing
export { extractContentFromHtml, fetchUrl };
