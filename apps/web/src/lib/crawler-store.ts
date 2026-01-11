import type { CrawlerType, CrawlerResult } from '@pmkit/core';

// In-memory storage for crawler jobs (in production, use database)
export interface CrawlerJobState {
  id: string;
  type: CrawlerType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  keywords: string[];
  platforms: string[];
  config: Record<string, unknown>;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  results: CrawlerResult[];
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
