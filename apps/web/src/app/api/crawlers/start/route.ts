import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { isAdminEmail } from '@/lib/admin';
import { crawlerJobs, cleanupOldJobs, type CrawlerJobState } from '@/lib/crawler-store';
import {
  runSocialCrawler,
  runWebSearchCrawler,
  runNewsCrawler,
  runUrlScrapeCrawler,
  getLLMService,
  type SocialCrawlerInput,
  type WebSearchCrawlerInput,
  type NewsCrawlerInput,
  type UrlScrapeCrawlerInput,
  type CrawlerType,
} from '@pmkit/core';
import { executeCrawlerAnalysis, type CrawlerAnalysisContext } from '@pmkit/prompts';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check admin access for workbench
    if (!isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { error: 'Admin access required for crawlers' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, keywords, urls, platforms, config } = body as {
      type: CrawlerType;
      keywords?: string[];
      urls?: string[];
      platforms?: string[];
      config?: Record<string, unknown>;
    };

    // Validate input
    if (!type || !['social', 'web_search', 'news', 'url_scrape'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid crawler type' },
        { status: 400 }
      );
    }

    // URL scrape requires URLs, others require keywords
    if (type === 'url_scrape') {
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

    // Create job
    const jobId = `crawl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const job: CrawlerJobState = {
      id: jobId,
      type,
      status: 'pending',
      keywords: keywords || [],
      urls: urls || [],
      platforms: platforms || [],
      config: config || {},
      createdAt: new Date(),
      results: [],
    };

    crawlerJobs.set(jobId, job);
    cleanupOldJobs();

    // Start crawler asynchronously
    runCrawlerAsync(jobId, job);

    return NextResponse.json({
      success: true,
      jobId,
      status: 'pending',
      message: 'Crawler job started',
    });
  } catch (error) {
    console.error('Crawler start error:', error);
    return NextResponse.json(
      { error: 'Failed to start crawler' },
      { status: 500 }
    );
  }
}

async function runCrawlerAsync(jobId: string, job: CrawlerJobState) {
  const jobState = crawlerJobs.get(jobId);
  if (!jobState) return;

  jobState.status = 'running';
  jobState.startedAt = new Date();

  try {
    let response;

    switch (job.type) {
      case 'social': {
        const input: SocialCrawlerInput = {
          keywords: job.keywords,
          platforms: (job.platforms.length > 0 ? job.platforms : ['reddit']) as ('reddit' | 'hackernews')[],
          limit: (job.config.limit as number) || 25,
          timeRange: (job.config.timeRange as 'day' | 'week' | 'month' | 'year' | 'all') || 'week',
        };
        response = await runSocialCrawler(input);
        break;
      }

      case 'web_search': {
        const input: WebSearchCrawlerInput = {
          keywords: job.keywords,
          limit: (job.config.limit as number) || 20,
          searchType: (job.config.searchType as 'web' | 'news' | 'images') || 'web',
        };
        response = await runWebSearchCrawler(input);
        break;
      }

      case 'news': {
        const input: NewsCrawlerInput = {
          keywords: job.keywords,
          limit: (job.config.limit as number) || 25,
          language: (job.config.language as string) || 'en',
          sortBy: (job.config.sortBy as 'relevancy' | 'popularity' | 'publishedAt') || 'publishedAt',
        };
        response = await runNewsCrawler(input);
        break;
      }

      case 'url_scrape': {
        const input: UrlScrapeCrawlerInput = {
          urls: job.urls || [],
          extractOptions: {
            includeMetadata: true,
            includeLinks: false,
            maxContentLength: (job.config.maxContentLength as number) || 10000,
          },
        };
        response = await runUrlScrapeCrawler(input);
        break;
      }

      default:
        throw new Error(`Unknown crawler type: ${job.type}`);
    }

    // Update job with results
    jobState.results = response.results.map(r => ({ ...r, jobId }));
    
    if (!response.success) {
      jobState.status = 'failed';
      jobState.completedAt = new Date();
      jobState.error = response.error;
      return;
    }

    // Skip AI analysis if no results
    if (response.results.length === 0) {
      jobState.status = 'completed';
      jobState.completedAt = new Date();
      return;
    }

    // Run AI analysis on the results
    jobState.status = 'analyzing';
    
    try {
      const llmService = getLLMService();
      
      // Build analysis context
      // For URL scrape, use the URLs as "keywords" for context
      const contextKeywords = job.type === 'url_scrape' 
        ? (job.urls || []).map(url => {
            try {
              return new URL(url).hostname;
            } catch {
              return url;
            }
          })
        : job.keywords;

      const analysisContext: CrawlerAnalysisContext = {
        crawlerType: job.type as CrawlerType,
        keywords: contextKeywords,
        platforms: job.platforms.length > 0 ? job.platforms : undefined,
        results: response.results.map(r => ({
          source: r.source,
          title: r.title,
          content: r.content,
          url: r.url,
          author: r.author,
          publishedAt: r.publishedAt?.toISOString(),
          metadata: r.metadata as Record<string, unknown>,
        })),
        productName: 'Acme Platform',
        competitors: ['Notion', 'Coda', 'Monday.com'],
      };

      // Execute AI analysis
      const analysisResult = await executeCrawlerAnalysis(
        llmService,
        'workbench', // Use workbench tenant (not demo rate limited)
        analysisContext,
        { maxTokens: 8192 }
      );

      jobState.analysis = analysisResult.analysis;
      jobState.analysisMetadata = {
        model: analysisResult.model,
        usage: analysisResult.usage,
        latencyMs: analysisResult.latencyMs,
        estimatedCostUsd: analysisResult.estimatedCostUsd,
        isStub: analysisResult.isStub,
      };
      jobState.status = 'completed';
      jobState.completedAt = new Date();
      
    } catch (analysisError) {
      console.error('AI analysis error:', analysisError);
      // Still mark as completed but note the analysis failure
      jobState.status = 'completed';
      jobState.completedAt = new Date();
      jobState.analysisError = analysisError instanceof Error ? analysisError.message : 'Analysis failed';
    }

  } catch (error) {
    jobState.status = 'failed';
    jobState.completedAt = new Date();
    jobState.error = error instanceof Error ? error.message : 'Unknown error';
  }
}
