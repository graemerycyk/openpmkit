/**
 * News Crawler - NewsAPI.org & GNews
 *
 * Uses NewsAPI.org (100 req/day free tier)
 * Falls back to GNews API if NewsAPI unavailable
 */

import type { NewsCrawlerInput, CrawlerResponse, CrawlerResult } from './types';

// ============================================================================
// NewsAPI.org
// ============================================================================

interface NewsAPIArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

async function searchWithNewsAPI(
  query: string,
  limit: number,
  language: string,
  sortBy: string,
  apiKey: string
): Promise<CrawlerResult[]> {
  const url = new URL('https://newsapi.org/v2/everything');
  url.searchParams.set('q', query);
  url.searchParams.set('pageSize', String(Math.min(limit, 100)));
  url.searchParams.set('language', language);
  url.searchParams.set('sortBy', sortBy);

  const response = await fetch(url.toString(), {
    headers: {
      'X-Api-Key': apiKey,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `NewsAPI error: ${response.status} - ${(errorData as { message?: string }).message || 'Unknown error'}`
    );
  }

  const data: NewsAPIResponse = await response.json();

  if (data.status !== 'ok') {
    throw new Error('NewsAPI returned non-ok status');
  }

  return data.articles.map((article, index): CrawlerResult => ({
    id: `newsapi-${Date.now()}-${index}`,
    jobId: '', // Will be set by caller
    source: article.source.name || 'news',
    title: article.title,
    url: article.url,
    content: article.description || article.content || article.title,
    author: article.author || undefined,
    publishedAt: new Date(article.publishedAt),
    sentiment: undefined,
    metadata: {
      sourceId: article.source.id,
      imageUrl: article.urlToImage,
    },
    createdAt: new Date(),
  }));
}

// ============================================================================
// GNews API (Alternative)
// ============================================================================

interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: { name: string; url: string };
}

interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}

async function searchWithGNews(
  query: string,
  limit: number,
  language: string,
  apiKey: string
): Promise<CrawlerResult[]> {
  const url = new URL('https://gnews.io/api/v4/search');
  url.searchParams.set('q', query);
  url.searchParams.set('max', String(Math.min(limit, 100)));
  url.searchParams.set('lang', language);
  url.searchParams.set('token', apiKey);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`GNews API error: ${response.status}`);
  }

  const data: GNewsResponse = await response.json();

  return data.articles.map((article, index): CrawlerResult => ({
    id: `gnews-${Date.now()}-${index}`,
    jobId: '',
    source: article.source.name,
    title: article.title,
    url: article.url,
    content: article.description || article.content,
    author: undefined,
    publishedAt: new Date(article.publishedAt),
    sentiment: undefined,
    metadata: {
      imageUrl: article.image,
      sourceUrl: article.source.url,
    },
    createdAt: new Date(),
  }));
}

// ============================================================================
// RSS Feed Fallback (Free, no auth)
// ============================================================================

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source?: string;
}

async function searchWithRSSFeeds(
  query: string,
  limit: number
): Promise<CrawlerResult[]> {
  // Use Google News RSS as a free fallback
  const url = new URL('https://news.google.com/rss/search');
  url.searchParams.set('q', query);
  url.searchParams.set('hl', 'en-US');
  url.searchParams.set('gl', 'US');
  url.searchParams.set('ceid', 'US:en');

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Google News RSS error: ${response.status}`);
    }

    const text = await response.text();

    // Simple XML parsing for RSS items
    const items: CrawlerResult[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(text)) !== null && items.length < limit) {
      const itemXml = match[1];

      const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') || '';
      const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
      const description = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') || '';
      const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
      const source = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') || 'Google News';

      if (title && link) {
        items.push({
          id: `rss-${Date.now()}-${items.length}`,
          jobId: '',
          source: source,
          title: title.trim(),
          url: link.trim(),
          content: description.replace(/<[^>]*>/g, '').trim() || title,
          author: undefined,
          publishedAt: pubDate ? new Date(pubDate) : undefined,
          sentiment: undefined,
          metadata: { type: 'rss' },
          createdAt: new Date(),
        });
      }
    }

    return items;
  } catch (error) {
    console.error('RSS feed error:', error);
    return [];
  }
}

// ============================================================================
// Main News Crawler
// ============================================================================

export async function runNewsCrawler(
  input: NewsCrawlerInput
): Promise<CrawlerResponse> {
  const { keywords, limit, language, sortBy } = input;
  const query = keywords.join(' OR ');

  const newsApiKey = process.env.NEWSAPI_KEY;
  const gnewsApiKey = process.env.GNEWS_API_KEY;

  try {
    let results: CrawlerResult[];
    let source: string;

    if (newsApiKey) {
      // Primary: NewsAPI.org
      results = await searchWithNewsAPI(query, limit, language, sortBy, newsApiKey);
      source = 'newsapi';
    } else if (gnewsApiKey) {
      // Fallback: GNews
      results = await searchWithGNews(query, limit, language, gnewsApiKey);
      source = 'gnews';
    } else {
      // Free fallback: Google News RSS
      console.warn('No news API key set, using Google News RSS fallback');
      results = await searchWithRSSFeeds(query, limit);
      source = 'google-news-rss';
    }

    return {
      success: true,
      results,
      metadata: {
        totalResults: results.length,
        fetchedAt: new Date(),
        source,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // Try RSS fallback on error
    if (newsApiKey || gnewsApiKey) {
      console.warn('News API failed, trying RSS fallback:', message);
      try {
        const results = await searchWithRSSFeeds(query, limit);
        return {
          success: true,
          results,
          metadata: {
            totalResults: results.length,
            fetchedAt: new Date(),
            source: 'google-news-rss-fallback',
          },
        };
      } catch {
        // RSS also failed
      }
    }

    return {
      success: false,
      results: [],
      error: message,
      metadata: {
        totalResults: 0,
        fetchedAt: new Date(),
        source: 'error',
      },
    };
  }
}

// Export for testing
export { searchWithNewsAPI, searchWithGNews, searchWithRSSFeeds };
