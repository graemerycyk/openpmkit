import { NextRequest, NextResponse } from 'next/server';
import { getLLMService } from '@pmkit/core';
import { 
  executeCrawlerAnalysis, 
  MOCK_CRAWLER_DATA,
  type CrawlerType,
  type CrawlerAnalysisContext,
} from '@pmkit/prompts';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';

// Max output tokens for crawler analysis
const CRAWLER_MAX_TOKENS = 8192;

export async function POST(request: NextRequest) {
  try {
    // IP-based rate limiting to prevent abuse
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`demo:crawler:${clientIP}`, RATE_LIMITS.demo);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${Math.ceil((rateLimitResult.retryAfterMs || 0) / 1000)} seconds.`,
          isRateLimited: true,
          retryAfterMs: rateLimitResult.retryAfterMs,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.retryAfterMs || 0) / 1000)),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.resetAt),
          },
        }
      );
    }

    const body = await request.json();
    const { crawlerType, keywords, urls, platforms } = body as { 
      crawlerType: CrawlerType; 
      keywords?: string[];
      urls?: string[];
      platforms?: string[];
    };

    // Validate crawler type
    if (!['social', 'web_search', 'news', 'url_scrape'].includes(crawlerType)) {
      return NextResponse.json(
        { error: `Invalid crawler type: ${crawlerType}` },
        { status: 400 }
      );
    }

    // Validate input based on crawler type
    if (crawlerType === 'url_scrape') {
      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return NextResponse.json(
          { error: 'URLs are required for URL scrape crawler' },
          { status: 400 }
        );
      }
    } else {
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { error: 'Keywords are required' },
        { status: 400 }
      );
      }
    }

    // Get mock data based on crawler type
    let mockResults: CrawlerAnalysisContext['results'] = [];
    
    switch (crawlerType) {
      case 'social': {
        const socialData = MOCK_CRAWLER_DATA.social;
        // Combine reddit and hackernews data
        const redditResults = (platforms?.includes('reddit') || !platforms?.length) 
          ? socialData.reddit 
          : [];
        const hnResults = (platforms?.includes('hackernews') || !platforms?.length)
          ? socialData.hackernews
          : [];
        type SocialResult = typeof redditResults[number];
        mockResults = [...redditResults, ...hnResults].map((r: SocialResult) => ({
          source: r.source,
          title: r.title,
          content: r.content,
          url: r.url,
          author: r.author,
          publishedAt: r.publishedAt,
          metadata: r.metadata,
        }));
        break;
      }
      case 'web_search':
        mockResults = MOCK_CRAWLER_DATA.web_search.map((r: typeof MOCK_CRAWLER_DATA.web_search[number]) => ({
          source: r.source,
          title: r.title,
          content: r.content,
          url: r.url,
          publishedAt: r.publishedAt,
          metadata: r.metadata,
        }));
        break;
      case 'news':
        mockResults = MOCK_CRAWLER_DATA.news.map((r: typeof MOCK_CRAWLER_DATA.news[number]) => ({
          source: r.source,
          title: r.title,
          content: r.content,
          url: r.url,
          author: r.author,
          publishedAt: r.publishedAt,
          metadata: r.metadata,
        }));
        break;
      case 'url_scrape':
        mockResults = MOCK_CRAWLER_DATA.url_scrape.map((r: typeof MOCK_CRAWLER_DATA.url_scrape[number]) => ({
          source: r.source,
          title: r.title,
          content: r.content,
          url: r.url,
          publishedAt: r.publishedAt,
          metadata: r.metadata,
        }));
        break;
    }

    // Build analysis context
    // For URL scrape, use hostnames as "keywords" for context
    const contextKeywords = crawlerType === 'url_scrape' && urls
      ? urls.map(url => {
          try { return new URL(url).hostname; } catch { return url; }
        })
      : keywords || [];

    const analysisContext: CrawlerAnalysisContext = {
      crawlerType,
      keywords: contextKeywords,
      platforms: platforms || (crawlerType === 'social' ? ['reddit', 'hackernews'] : undefined),
      results: mockResults,
      productName: 'Acme Platform',
      competitors: ['Notion', 'Coda', 'Monday.com'],
    };

    // Get LLM service
    const llmService = getLLMService();

    // Execute AI analysis
    const result = await executeCrawlerAnalysis(
      llmService,
      'demo', // Demo tenant - uses OPENAI_API_KEY_DEMO with rate limiting
      analysisContext,
      {
        maxTokens: CRAWLER_MAX_TOKENS,
        temperature: 0.7,
      }
    );

    return NextResponse.json({
      success: true,
      crawlerType,
      keywords: keywords || [],
      urls: urls || [],
      platforms: analysisContext.platforms,
      resultCount: mockResults.length,
      results: mockResults,
      analysis: result.analysis,
      metadata: {
        model: result.model,
        usage: result.usage,
        latencyMs: result.latencyMs,
        estimatedCostUsd: result.estimatedCostUsd,
        isStub: result.isStub,
      },
    });
  } catch (error) {
    console.error('Demo crawler execution error:', error);
    
    // Check for rate limit error
    if (error instanceof Error && error.name === 'DemoRateLimitError') {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: error.message,
          isRateLimited: true,
        },
        { status: 429 }
      );
    }

    // Extract detailed error info
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to execute crawler', 
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check available crawler types
export async function GET() {
  return NextResponse.json({
    crawlerTypes: [
      {
        id: 'social',
        name: 'Social Crawler',
        description: 'Monitor Reddit, Hacker News, and other social platforms',
        platforms: ['reddit', 'hackernews'],
      },
      {
        id: 'web_search',
        name: 'Web Search',
        description: 'Search Google and Bing for competitive research',
        platforms: ['google', 'bing'],
      },
      {
        id: 'news',
        name: 'News Crawler',
        description: 'Monitor industry news and press releases',
        platforms: ['techcrunch', 'venturebeat', 'reuters', 'forbes'],
      },
      {
        id: 'url_scrape',
        name: 'URL Scraper',
        description: 'Fetch and analyze specific URLs for deep competitive research',
        platforms: [],
      },
    ],
  });
}
