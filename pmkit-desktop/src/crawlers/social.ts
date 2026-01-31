/**
 * Extended Social Crawler for openpmkit-desktop
 *
 * Extends @openpmkit/core social crawler with additional platforms:
 * - X (Twitter) - via search API or nitter scraping
 * - LinkedIn - via search (limited)
 * - Discord - via public server search
 * - Bluesky - via AT Protocol API
 * - Threads - via search
 *
 * Plus the existing platforms from core:
 * - Reddit (Official API)
 * - Hacker News (Algolia API)
 */

import type { CrawlerResult, CrawlerResponse } from '@openpmkit/core';
import { runSocialCrawler as runCoreSocialCrawler } from '@openpmkit/core';

// ============================================================================
// Extended Social Platform Types
// ============================================================================

export type SocialPlatform =
  | 'reddit'
  | 'hackernews'
  | 'x'
  | 'linkedin'
  | 'discord'
  | 'bluesky'
  | 'threads';

export interface ExtendedSocialCrawlerInput {
  keywords: string[];
  platforms: SocialPlatform[];
  limit: number;
  timeRange: 'day' | 'week' | 'month' | 'year' | 'all';
  competitors?: string[];
}

// ============================================================================
// X (Twitter) Crawler - Nitter Instances
// ============================================================================

interface NitterTweet {
  username: string;
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  replies: number;
  url: string;
}

const NITTER_INSTANCES = [
  'nitter.privacydev.net',
  'nitter.poast.org',
  'nitter.cz',
];

async function searchX(
  keywords: string[],
  limit: number
): Promise<CrawlerResult[]> {
  const query = encodeURIComponent(keywords.join(' OR '));
  const results: CrawlerResult[] = [];

  // Try multiple Nitter instances
  for (const instance of NITTER_INSTANCES) {
    if (results.length >= limit) break;

    try {
      const url = `https://${instance}/search?f=tweets&q=${query}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; openpmkit-crawler/1.0)',
          Accept: 'text/html',
        },
      });

      if (!response.ok) continue;

      const html = await response.text();

      // Parse tweets from Nitter HTML
      const tweetRegex =
        /<div class="timeline-item"[\s\S]*?<div class="tweet-content[^"]*">([^<]+)<\/div>[\s\S]*?<a class="tweet-link"[^>]*href="([^"]+)">/g;
      const usernameRegex = /<a class="username"[^>]*>@([^<]+)<\/a>/g;
      const statsRegex =
        /<span class="tweet-stat"[^>]*><span class="icon-(\w+)"[^>]*><\/span>\s*(\d+)/g;

      let match;
      while ((match = tweetRegex.exec(html)) !== null && results.length < limit) {
        const content = match[1]?.trim() || '';
        const tweetPath = match[2] || '';

        if (content && tweetPath) {
          results.push({
            id: `x-${Date.now()}-${results.length}`,
            jobId: '',
            source: 'x',
            title: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
            url: `https://twitter.com${tweetPath}`,
            content,
            author: tweetPath.split('/')[1] || 'unknown',
            publishedAt: new Date(), // Nitter doesn't always have dates
            sentiment: undefined,
            metadata: {
              platform: 'x',
              nitterInstance: instance,
            },
            createdAt: new Date(),
          });
        }
      }

      if (results.length > 0) break; // Found results, don't try more instances
    } catch (error) {
      console.warn(`Nitter instance ${instance} failed:`, error);
      continue;
    }
  }

  return results;
}

// ============================================================================
// Bluesky Crawler - AT Protocol
// ============================================================================

interface BlueskyPost {
  uri: string;
  cid: string;
  author: {
    handle: string;
    displayName?: string;
  };
  record: {
    text: string;
    createdAt: string;
  };
  likeCount?: number;
  repostCount?: number;
  replyCount?: number;
}

interface BlueskySearchResponse {
  posts: BlueskyPost[];
  cursor?: string;
}

async function searchBluesky(
  keywords: string[],
  limit: number
): Promise<CrawlerResult[]> {
  const query = keywords.join(' OR ');

  try {
    // Bluesky public search API
    const url = new URL('https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts');
    url.searchParams.set('q', query);
    url.searchParams.set('limit', String(Math.min(limit, 100)));

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Bluesky API error: ${response.status}`);
    }

    const data: BlueskySearchResponse = await response.json();

    return data.posts.map((post, index): CrawlerResult => ({
      id: `bluesky-${post.cid}`,
      jobId: '',
      source: 'bluesky',
      title: post.record.text.substring(0, 100) + (post.record.text.length > 100 ? '...' : ''),
      url: `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split('/').pop()}`,
      content: post.record.text,
      author: post.author.displayName || post.author.handle,
      publishedAt: new Date(post.record.createdAt),
      sentiment: undefined,
      metadata: {
        handle: post.author.handle,
        likes: post.likeCount,
        reposts: post.repostCount,
        replies: post.replyCount,
      },
      createdAt: new Date(),
    }));
  } catch (error) {
    console.error('Bluesky search error:', error);
    return [];
  }
}

// ============================================================================
// LinkedIn Crawler - Public Posts (Limited)
// ============================================================================

async function searchLinkedIn(
  keywords: string[],
  limit: number
): Promise<CrawlerResult[]> {
  // LinkedIn doesn't have a public search API
  // We use Google site search as a workaround
  const query = `site:linkedin.com/posts ${keywords.join(' ')}`;

  try {
    // Use DuckDuckGo HTML search
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; openpmkit-crawler/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`DuckDuckGo error: ${response.status}`);
    }

    const html = await response.text();
    const results: CrawlerResult[] = [];

    // Parse results from DuckDuckGo HTML
    const resultRegex =
      /<a[^>]*class="result__a"[^>]*href="([^"]*linkedin\.com[^"]*)"[^>]*>([^<]*)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([^<]*)<\/a>/g;

    let match;
    while ((match = resultRegex.exec(html)) !== null && results.length < limit) {
      const linkedinUrl = match[1];
      const title = match[2]?.trim() || '';
      const snippet = match[3]?.trim() || '';

      if (linkedinUrl && (title || snippet)) {
        results.push({
          id: `linkedin-${Date.now()}-${results.length}`,
          jobId: '',
          source: 'linkedin',
          title: title || snippet.substring(0, 100),
          url: linkedinUrl,
          content: snippet || title,
          author: undefined,
          publishedAt: undefined,
          sentiment: undefined,
          metadata: {
            platform: 'linkedin',
            searchMethod: 'duckduckgo-site-search',
          },
          createdAt: new Date(),
        });
      }
    }

    return results;
  } catch (error) {
    console.error('LinkedIn search error:', error);
    return [];
  }
}

// ============================================================================
// Discord Crawler - Public Servers via DiscordServers.com
// ============================================================================

async function searchDiscord(
  keywords: string[],
  limit: number
): Promise<CrawlerResult[]> {
  const query = keywords.join(' ');

  try {
    // Search public Discord servers
    const url = `https://discordservers.com/search?query=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; openpmkit-crawler/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Discord servers search error: ${response.status}`);
    }

    const html = await response.text();
    const results: CrawlerResult[] = [];

    // Parse server listings
    const serverRegex =
      /<a[^>]*href="(\/server\/[^"]+)"[^>]*>[\s\S]*?<h5[^>]*>([^<]+)<\/h5>[\s\S]*?<p[^>]*class="[^"]*description[^"]*"[^>]*>([^<]*)<\/p>/g;

    let match;
    while ((match = serverRegex.exec(html)) !== null && results.length < limit) {
      const serverPath = match[1];
      const name = match[2]?.trim() || '';
      const description = match[3]?.trim() || '';

      if (serverPath && name) {
        results.push({
          id: `discord-${Date.now()}-${results.length}`,
          jobId: '',
          source: 'discord',
          title: name,
          url: `https://discordservers.com${serverPath}`,
          content: description || name,
          author: undefined,
          publishedAt: undefined,
          sentiment: undefined,
          metadata: {
            platform: 'discord',
            type: 'server',
          },
          createdAt: new Date(),
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Discord search error:', error);
    return [];
  }
}

// ============================================================================
// Threads Crawler - Via Google site search
// ============================================================================

async function searchThreads(
  keywords: string[],
  limit: number
): Promise<CrawlerResult[]> {
  const query = `site:threads.net ${keywords.join(' ')}`;

  try {
    // Use DuckDuckGo HTML search
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; openpmkit-crawler/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`DuckDuckGo error: ${response.status}`);
    }

    const html = await response.text();
    const results: CrawlerResult[] = [];

    // Parse results
    const resultRegex =
      /<a[^>]*class="result__a"[^>]*href="([^"]*threads\.net[^"]*)"[^>]*>([^<]*)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([^<]*)<\/a>/g;

    let match;
    while ((match = resultRegex.exec(html)) !== null && results.length < limit) {
      const threadsUrl = match[1];
      const title = match[2]?.trim() || '';
      const snippet = match[3]?.trim() || '';

      if (threadsUrl && (title || snippet)) {
        // Extract username from URL
        const usernameMatch = threadsUrl.match(/threads\.net\/@([^\/]+)/);
        const username = usernameMatch?.[1];

        results.push({
          id: `threads-${Date.now()}-${results.length}`,
          jobId: '',
          source: 'threads',
          title: title || snippet.substring(0, 100),
          url: threadsUrl,
          content: snippet || title,
          author: username,
          publishedAt: undefined,
          sentiment: undefined,
          metadata: {
            platform: 'threads',
            searchMethod: 'duckduckgo-site-search',
          },
          createdAt: new Date(),
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Threads search error:', error);
    return [];
  }
}

// ============================================================================
// Main Extended Social Crawler
// ============================================================================

export async function runExtendedSocialCrawler(
  input: ExtendedSocialCrawlerInput
): Promise<CrawlerResponse> {
  const { keywords, platforms, limit, timeRange } = input;
  const results: CrawlerResult[] = [];
  const errors: string[] = [];

  // Calculate per-platform limit
  const perPlatformLimit = Math.ceil(limit / platforms.length);

  // Separate core platforms from extended platforms
  const corePlatforms = platforms.filter((p) =>
    ['reddit', 'hackernews'].includes(p)
  ) as ('reddit' | 'hackernews')[];
  const extendedPlatforms = platforms.filter(
    (p) => !['reddit', 'hackernews'].includes(p)
  );

  // Run core crawler for Reddit/HN
  if (corePlatforms.length > 0) {
    try {
      const coreResult = await runCoreSocialCrawler({
        keywords,
        platforms: corePlatforms,
        limit: perPlatformLimit * corePlatforms.length,
        timeRange,
      });
      results.push(...coreResult.results);
      if (coreResult.error) {
        errors.push(coreResult.error);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Core crawler error';
      errors.push(msg);
    }
  }

  // Run extended platform crawlers
  for (const platform of extendedPlatforms) {
    try {
      let platformResults: CrawlerResult[] = [];

      switch (platform) {
        case 'x':
          platformResults = await searchX(keywords, perPlatformLimit);
          break;
        case 'bluesky':
          platformResults = await searchBluesky(keywords, perPlatformLimit);
          break;
        case 'linkedin':
          platformResults = await searchLinkedIn(keywords, perPlatformLimit);
          break;
        case 'discord':
          platformResults = await searchDiscord(keywords, perPlatformLimit);
          break;
        case 'threads':
          platformResults = await searchThreads(keywords, perPlatformLimit);
          break;
      }

      results.push(...platformResults);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`${platform}: ${message}`);
    }
  }

  return {
    success: errors.length === 0 || results.length > 0,
    results: results.slice(0, limit),
    error: errors.length > 0 ? errors.join('; ') : undefined,
    metadata: {
      totalResults: results.length,
      fetchedAt: new Date(),
      source: platforms.join(', '),
    },
  };
}

// Export individual crawlers for testing
export {
  searchX,
  searchBluesky,
  searchLinkedIn,
  searchDiscord,
  searchThreads,
};
