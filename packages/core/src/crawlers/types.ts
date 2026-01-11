import { z } from 'zod';

// ============================================================================
// Crawler Types
// ============================================================================

export const CrawlerTypeSchema = z.enum(['social', 'web_search', 'news']);
export type CrawlerType = z.infer<typeof CrawlerTypeSchema>;

export const CrawlerStatusSchema = z.enum(['pending', 'running', 'completed', 'failed']);
export type CrawlerStatus = z.infer<typeof CrawlerStatusSchema>;

// ============================================================================
// Crawler Job
// ============================================================================

export const CrawlerJobSchema = z.object({
  id: z.string(),
  type: CrawlerTypeSchema,
  status: CrawlerStatusSchema,
  keywords: z.array(z.string()),
  platforms: z.array(z.string()).default([]),
  config: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  error: z.string().optional(),
  results: z.array(z.lazy(() => CrawlerResultSchema)).optional(),
});

export type CrawlerJob = z.infer<typeof CrawlerJobSchema>;

// ============================================================================
// Crawler Result
// ============================================================================

export const CrawlerResultSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  source: z.string(),
  title: z.string(),
  url: z.string().optional(),
  content: z.string(),
  author: z.string().optional(),
  publishedAt: z.date().optional(),
  sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
});

export type CrawlerResult = z.infer<typeof CrawlerResultSchema>;

// ============================================================================
// Crawler Input Types
// ============================================================================

export const SocialCrawlerInputSchema = z.object({
  keywords: z.array(z.string()).min(1),
  platforms: z.array(z.enum(['reddit', 'hackernews'])).default(['reddit']),
  limit: z.number().min(1).max(100).default(25),
  timeRange: z.enum(['day', 'week', 'month', 'year', 'all']).default('week'),
});

export type SocialCrawlerInput = z.infer<typeof SocialCrawlerInputSchema>;

export const WebSearchCrawlerInputSchema = z.object({
  keywords: z.array(z.string()).min(1),
  limit: z.number().min(1).max(50).default(20),
  searchType: z.enum(['web', 'news', 'images']).default('web'),
});

export type WebSearchCrawlerInput = z.infer<typeof WebSearchCrawlerInputSchema>;

export const NewsCrawlerInputSchema = z.object({
  keywords: z.array(z.string()).min(1),
  limit: z.number().min(1).max(100).default(25),
  language: z.string().default('en'),
  sortBy: z.enum(['relevancy', 'popularity', 'publishedAt']).default('publishedAt'),
});

export type NewsCrawlerInput = z.infer<typeof NewsCrawlerInputSchema>;

// ============================================================================
// Crawler Response
// ============================================================================

export interface CrawlerResponse {
  success: boolean;
  results: CrawlerResult[];
  error?: string;
  metadata?: {
    totalResults: number;
    fetchedAt: Date;
    source: string;
    rateLimitRemaining?: number;
  };
}
