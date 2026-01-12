import type { CrawlerType, CrawlerResult } from '@pmkit/core';
import type { CrawlerAnalysis } from '@pmkit/prompts';

// In-memory storage for crawler jobs (in production, use database)
export interface CrawlerJobState {
  id: string;
  type: CrawlerType;
  status: 'pending' | 'running' | 'analyzing' | 'completed' | 'failed';
  keywords: string[];
  platforms: string[];
  config: Record<string, unknown>;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  results: CrawlerResult[];
  // AI Analysis
  analysis?: CrawlerAnalysis;
  analysisMetadata?: {
    model: string;
    usage: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
    };
    latencyMs: number;
    estimatedCostUsd: number;
    isStub: boolean;
  };
  analysisError?: string;
}

// Global job store (in production, use Redis or database)
export const crawlerJobs = new Map<string, CrawlerJobState>();

// Clean up old jobs (keep last 100)
export function cleanupOldJobs() {
  if (crawlerJobs.size > 100) {
    const sortedJobs = Array.from(crawlerJobs.entries())
      .sort((a, b) => b[1].createdAt.getTime() - a[1].createdAt.getTime());
    
    const toDelete = sortedJobs.slice(100);
    for (const [id] of toDelete) {
      crawlerJobs.delete(id);
    }
  }
}
