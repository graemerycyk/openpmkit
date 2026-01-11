/**
 * Social Crawler - Reddit & Hacker News
 *
 * Uses free APIs:
 * - Reddit: Official API (free, 100 req/min)
 * - Hacker News: Official API (free, unlimited)
 */

import type { SocialCrawlerInput, CrawlerResponse, CrawlerResult } from './types';

// ============================================================================
// Reddit Crawler (Official API - Free)
// ============================================================================

interface RedditPost {
  data: {
    id: string;
    title: string;
    selftext: string;
    author: string;
    subreddit: string;
    url: string;
    permalink: string;
    created_utc: number;
    score: number;
    num_comments: number;
    ups: number;
    downs: number;
  };
}

interface RedditResponse {
  data: {
    children: RedditPost[];
    after: string | null;
  };
}

async function searchReddit(
  keywords: string[],
  limit: number,
  timeRange: string
): Promise<CrawlerResult[]> {
  const query = keywords.join(' OR ');
  const timeMap: Record<string, string> = {
    day: 'day',
    week: 'week',
    month: 'month',
    year: 'year',
    all: 'all',
  };

  const url = new URL('https://www.reddit.com/search.json');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(Math.min(limit, 100)));
  url.searchParams.set('t', timeMap[timeRange] || 'week');
  url.searchParams.set('sort', 'relevance');

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'pmkit-crawler/1.0 (https://getpmkit.com)',
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data: RedditResponse = await response.json();

    return data.data.children.map((post): CrawlerResult => ({
      id: `reddit-${post.data.id}`,
      jobId: '', // Will be set by caller
      source: 'reddit',
      title: post.data.title,
      url: `https://reddit.com${post.data.permalink}`,
      content: post.data.selftext || post.data.title,
      author: post.data.author,
      publishedAt: new Date(post.data.created_utc * 1000),
      sentiment: undefined, // Could add sentiment analysis
      metadata: {
        subreddit: post.data.subreddit,
        score: post.data.score,
        numComments: post.data.num_comments,
        ups: post.data.ups,
      },
      createdAt: new Date(),
    }));
  } catch (error) {
    console.error('Reddit search error:', error);
    return [];
  }
}

// ============================================================================
// Hacker News Crawler (Official API - Free)
// ============================================================================

interface HNItem {
  id: number;
  title?: string;
  text?: string;
  by?: string;
  url?: string;
  time?: number;
  score?: number;
  descendants?: number;
  type: string;
}

interface HNSearchResponse {
  hits: Array<{
    objectID: string;
    title: string;
    url?: string;
    author: string;
    story_text?: string;
    created_at: string;
    points: number;
    num_comments: number;
  }>;
  nbHits: number;
}

async function searchHackerNews(
  keywords: string[],
  limit: number
): Promise<CrawlerResult[]> {
  const query = keywords.join(' ');

  // Using Algolia's HN Search API (free, no auth required)
  const url = new URL('https://hn.algolia.com/api/v1/search');
  url.searchParams.set('query', query);
  url.searchParams.set('hitsPerPage', String(Math.min(limit, 50)));
  url.searchParams.set('tags', 'story');

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HN API error: ${response.status}`);
    }

    const data: HNSearchResponse = await response.json();

    return data.hits.map((hit): CrawlerResult => ({
      id: `hn-${hit.objectID}`,
      jobId: '', // Will be set by caller
      source: 'hackernews',
      title: hit.title,
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      content: hit.story_text || hit.title,
      author: hit.author,
      publishedAt: new Date(hit.created_at),
      sentiment: undefined,
      metadata: {
        points: hit.points,
        numComments: hit.num_comments,
      },
      createdAt: new Date(),
    }));
  } catch (error) {
    console.error('HN search error:', error);
    return [];
  }
}

// ============================================================================
// Main Social Crawler
// ============================================================================

export async function runSocialCrawler(
  input: SocialCrawlerInput
): Promise<CrawlerResponse> {
  const { keywords, platforms, limit, timeRange } = input;
  const results: CrawlerResult[] = [];
  const errors: string[] = [];

  // Calculate per-platform limit
  const perPlatformLimit = Math.ceil(limit / platforms.length);

  for (const platform of platforms) {
    try {
      let platformResults: CrawlerResult[] = [];

      switch (platform) {
        case 'reddit':
          platformResults = await searchReddit(keywords, perPlatformLimit, timeRange);
          break;
        case 'hackernews':
          platformResults = await searchHackerNews(keywords, perPlatformLimit);
          break;
        default:
          console.warn(`Unknown platform: ${platform}`);
      }

      results.push(...platformResults);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`${platform}: ${message}`);
    }
  }

  return {
    success: errors.length === 0,
    results: results.slice(0, limit),
    error: errors.length > 0 ? errors.join('; ') : undefined,
    metadata: {
      totalResults: results.length,
      fetchedAt: new Date(),
      source: platforms.join(', '),
    },
  };
}

// Export for testing
export { searchReddit, searchHackerNews };
