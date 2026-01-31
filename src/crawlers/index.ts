/**
 * AI Crawlers for openpmkit-desktop
 *
 * Re-exports @openpmkit/core crawlers with extensions:
 * - Extended Social Crawler (X, LinkedIn, Discord, Bluesky, Threads)
 * - Web Search Crawler (Serper/Google, DuckDuckGo)
 * - News Crawler (NewsAPI, GNews, Google News RSS)
 * - URL Scraper (direct fetch)
 */

// Re-export core crawlers
export {
  runWebSearchCrawler,
  runNewsCrawler,
  runUrlScrapeCrawler,
  type CrawlerResult,
  type CrawlerResponse,
  type CrawlerAnalysis,
  type SocialCrawlerInput,
  type WebSearchCrawlerInput,
  type NewsCrawlerInput,
  type UrlScrapeCrawlerInput,
} from '@openpmkit/core';

// Export extended social crawler
export {
  runExtendedSocialCrawler,
  type ExtendedSocialCrawlerInput,
  type SocialPlatform,
} from './social.js';

// ============================================================================
// Crawler Runner - Unified interface
// ============================================================================

import type {
  CrawlerResponse,
  WebSearchCrawlerInput,
  NewsCrawlerInput,
  UrlScrapeCrawlerInput,
} from '@openpmkit/core';
import {
  runWebSearchCrawler,
  runNewsCrawler,
  runUrlScrapeCrawler,
} from '@openpmkit/core';
import { runExtendedSocialCrawler, type ExtendedSocialCrawlerInput } from './social.js';

export type CrawlerType = 'social' | 'web_search' | 'news' | 'url_scrape';

export interface CrawlerRunInput {
  type: CrawlerType;
  keywords?: string[];
  platforms?: string[];
  urls?: string[];
  limit?: number;
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  competitors?: string[];
}

/**
 * Run any crawler type with unified interface
 */
export async function runCrawler(input: CrawlerRunInput): Promise<CrawlerResponse> {
  const { type, keywords = [], platforms = [], urls = [], limit = 25, timeRange = 'week' } = input;

  switch (type) {
    case 'social':
      return runExtendedSocialCrawler({
        keywords,
        platforms: (platforms.length > 0 ? platforms : ['reddit', 'hackernews']) as any,
        limit,
        timeRange,
        competitors: input.competitors,
      });

    case 'web_search':
      return runWebSearchCrawler({
        keywords,
        limit,
        searchType: 'web',
      });

    case 'news':
      return runNewsCrawler({
        keywords,
        limit,
        language: 'en',
        sortBy: 'publishedAt',
      });

    case 'url_scrape':
      return runUrlScrapeCrawler({
        urls,
        extractOptions: {
          includeMetadata: true,
          includeLinks: false,
          maxContentLength: 10000,
        },
      });

    default:
      throw new Error(`Unknown crawler type: ${type}`);
  }
}

// ============================================================================
// Crawler Analysis with LLM
// ============================================================================

import { CRAWLER_ANALYSIS_PROMPTS } from '@openpmkit/prompts';

export interface CrawlerAnalysisInput {
  results: CrawlerResponse;
  crawlerType: CrawlerType;
  keywords: string[];
  competitors?: string[];
  focusArea?: 'sentiment' | 'features' | 'competitive' | 'general';
}

/**
 * Generate analysis prompt for crawler results
 * This can be fed to an LLM for deeper analysis
 */
export function generateAnalysisPrompt(input: CrawlerAnalysisInput): {
  system: string;
  user: string;
} {
  const { results, crawlerType, keywords, competitors = [], focusArea = 'general' } = input;

  // Format results for analysis
  const formattedResults = results.results
    .map(
      (r, i) =>
        `[${i + 1}] Source: ${r.source}
Title: ${r.title}
Content: ${r.content.substring(0, 500)}${r.content.length > 500 ? '...' : ''}
URL: ${r.url || 'N/A'}
Date: ${r.publishedAt?.toISOString() || 'Unknown'}
---`
    )
    .join('\n\n');

  const systemPrompt = `You are an expert product research analyst helping PMs extract actionable insights from web crawl data.

Your job is to analyze crawler results and identify:
1. Key themes and patterns
2. Sentiment around products/features
3. Competitive intelligence
4. Actionable recommendations

Focus Area: ${focusArea}
Keywords tracked: ${keywords.join(', ')}
${competitors.length > 0 ? `Competitors: ${competitors.join(', ')}` : ''}

Guidelines:
- Be specific with data points and sources
- Highlight concerning trends early
- Connect insights to product implications
- Quantify where possible (e.g., "mentioned in 5/10 posts")`;

  const userPrompt = `Analyze these ${crawlerType} crawler results:

## Results (${results.results.length} items)

${formattedResults}

## Output Format

1. **Executive Summary** (2-3 sentences)
2. **Key Themes** (top 3-5 themes with mention counts)
3. **Sentiment Analysis** (overall and by theme)
4. **Competitive Insights** (if competitors were mentioned)
5. **Actionable Recommendations** (top 3 actions)
6. **Notable Quotes** (2-3 most relevant)`;

  return { system: systemPrompt, user: userPrompt };
}
