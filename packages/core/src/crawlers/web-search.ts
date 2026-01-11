/**
 * Web Search Crawler - Serper.dev
 *
 * Uses Serper.dev API (2,500 free queries/month)
 * Falls back to DuckDuckGo if no API key
 */

import type { WebSearchCrawlerInput, CrawlerResponse, CrawlerResult } from './types';

// ============================================================================
// Serper.dev API (Google Search Results)
// ============================================================================

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
  position: number;
}

interface SerperResponse {
  organic: SerperResult[];
  searchParameters: {
    q: string;
    type: string;
  };
  credits: number;
}

async function searchWithSerper(
  query: string,
  limit: number,
  apiKey: string
): Promise<CrawlerResult[]> {
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: query,
      num: Math.min(limit, 100),
    }),
  });

  if (!response.ok) {
    throw new Error(`Serper API error: ${response.status}`);
  }

  const data: SerperResponse = await response.json();

  return data.organic.map((result, index): CrawlerResult => ({
    id: `serper-${Date.now()}-${index}`,
    jobId: '', // Will be set by caller
    source: 'google',
    title: result.title,
    url: result.link,
    content: result.snippet,
    author: undefined,
    publishedAt: result.date ? new Date(result.date) : undefined,
    sentiment: undefined,
    metadata: {
      position: result.position,
    },
    createdAt: new Date(),
  }));
}

// ============================================================================
// DuckDuckGo Instant Answer API (Free, no auth)
// ============================================================================

interface DDGResponse {
  AbstractText: string;
  AbstractSource: string;
  AbstractURL: string;
  Heading: string;
  RelatedTopics: Array<{
    Text: string;
    FirstURL: string;
    Icon?: { URL: string };
  }>;
}

async function searchWithDuckDuckGo(
  query: string,
  limit: number
): Promise<CrawlerResult[]> {
  // DuckDuckGo Instant Answer API (limited but free)
  const url = new URL('https://api.duckduckgo.com/');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('no_redirect', '1');
  url.searchParams.set('no_html', '1');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`DuckDuckGo API error: ${response.status}`);
  }

  const data: DDGResponse = await response.json();
  const results: CrawlerResult[] = [];

  // Add abstract if available
  if (data.AbstractText && data.AbstractURL) {
    results.push({
      id: `ddg-abstract-${Date.now()}`,
      jobId: '',
      source: 'duckduckgo',
      title: data.Heading || query,
      url: data.AbstractURL,
      content: data.AbstractText,
      author: data.AbstractSource,
      publishedAt: undefined,
      sentiment: undefined,
      metadata: { type: 'abstract' },
      createdAt: new Date(),
    });
  }

  // Add related topics
  for (const topic of data.RelatedTopics.slice(0, limit - results.length)) {
    if (topic.Text && topic.FirstURL) {
      results.push({
        id: `ddg-topic-${Date.now()}-${results.length}`,
        jobId: '',
        source: 'duckduckgo',
        title: topic.Text.split(' - ')[0] || topic.Text.substring(0, 100),
        url: topic.FirstURL,
        content: topic.Text,
        author: undefined,
        publishedAt: undefined,
        sentiment: undefined,
        metadata: { type: 'related' },
        createdAt: new Date(),
      });
    }
  }

  return results;
}

// ============================================================================
// Main Web Search Crawler
// ============================================================================

export async function runWebSearchCrawler(
  input: WebSearchCrawlerInput
): Promise<CrawlerResponse> {
  const { keywords, limit } = input;
  const query = keywords.join(' ');
  const apiKey = process.env.SERPER_API_KEY;

  try {
    let results: CrawlerResult[];

    if (apiKey) {
      // Use Serper.dev if API key is available
      results = await searchWithSerper(query, limit, apiKey);
    } else {
      // Fall back to DuckDuckGo (limited but free)
      console.warn('SERPER_API_KEY not set, using DuckDuckGo fallback');
      results = await searchWithDuckDuckGo(query, limit);
    }

    return {
      success: true,
      results,
      metadata: {
        totalResults: results.length,
        fetchedAt: new Date(),
        source: apiKey ? 'serper' : 'duckduckgo',
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
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
export { searchWithSerper, searchWithDuckDuckGo };
