import { z } from 'zod';
import { nanoid } from 'nanoid';
import type { JobType } from '../types';
import type { PlanKey, Subscription } from '../billing';
import { getPlan } from '../billing';
import type { ConnectorKey } from '../connectors';

// ============================================================================
// Usage Event Types
// ============================================================================

export const UsageEventTypeSchema = z.enum([
  // Job runs (all 9 job types)
  'job.run.daily_brief',
  'job.run.meeting_prep',
  'job.run.voc_clustering',
  'job.run.competitor_research',
  'job.run.roadmap_alignment',
  'job.run.prd_draft',
  'job.run.sprint_review',
  'job.run.prototype_generation',
  'job.run.release_notes',
  
  // Tool calls
  'tool.call',
  
  // Connector usage
  'connector.call',
  
  // Artifact storage
  'artifact.created',
  'artifact.storage_bytes',
  
  // LLM usage
  'llm.tokens.input',
  'llm.tokens.output',
]);
export type UsageEventType = z.infer<typeof UsageEventTypeSchema>;

export const UsageEventSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  userId: z.string().optional(),
  jobRunId: z.string().optional(),
  eventType: UsageEventTypeSchema,
  units: z.number().int().default(1),
  costEstimateUsd: z.number().optional(),
  metaJson: z.record(z.unknown()).optional(),
  createdAt: z.date(),
});
export type UsageEvent = z.infer<typeof UsageEventSchema>;

export const UsageRollupDailySchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  date: z.date(),
  totalsJson: z.record(z.number()),
});
export type UsageRollupDaily = z.infer<typeof UsageRollupDailySchema>;

// ============================================================================
// Usage Store Interface
// ============================================================================

export interface UsageStore {
  save(event: UsageEvent): Promise<void>;
  findByTenant(tenantId: string, options?: UsageQueryOptions): Promise<UsageEvent[]>;
  countByType(
    tenantId: string,
    eventType: UsageEventType,
    options?: UsageCountOptions
  ): Promise<number>;
  countByTypeAndUser(
    tenantId: string,
    userId: string,
    eventType: UsageEventType,
    options?: UsageCountOptions
  ): Promise<number>;
  getConcurrentRuns(tenantId: string): Promise<number>;
  getRollup(tenantId: string, date: Date): Promise<UsageRollupDaily | null>;
  upsertRollup(tenantId: string, date: Date, totals: Record<string, number>): Promise<void>;
}

export interface UsageQueryOptions {
  startDate?: Date;
  endDate?: Date;
  eventTypes?: UsageEventType[];
  userId?: string;
  limit?: number;
}

export interface UsageCountOptions {
  startDate?: Date;
  endDate?: Date;
}

// ============================================================================
// In-Memory Usage Store (for demo/testing)
// ============================================================================

export class InMemoryUsageStore implements UsageStore {
  private events: UsageEvent[] = [];
  private rollups: Map<string, UsageRollupDaily> = new Map();
  private concurrentRuns: Map<string, number> = new Map();

  async save(event: UsageEvent): Promise<void> {
    this.events.push(event);
  }

  async findByTenant(
    tenantId: string,
    options: UsageQueryOptions = {}
  ): Promise<UsageEvent[]> {
    let results = this.events.filter((e) => e.tenantId === tenantId);

    if (options.startDate) {
      results = results.filter((e) => e.createdAt >= options.startDate!);
    }
    if (options.endDate) {
      results = results.filter((e) => e.createdAt <= options.endDate!);
    }
    if (options.eventTypes?.length) {
      results = results.filter((e) => options.eventTypes!.includes(e.eventType));
    }
    if (options.userId) {
      results = results.filter((e) => e.userId === options.userId);
    }

    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  async countByType(
    tenantId: string,
    eventType: UsageEventType,
    options: UsageCountOptions = {}
  ): Promise<number> {
    let results = this.events.filter(
      (e) => e.tenantId === tenantId && e.eventType === eventType
    );

    if (options.startDate) {
      results = results.filter((e) => e.createdAt >= options.startDate!);
    }
    if (options.endDate) {
      results = results.filter((e) => e.createdAt <= options.endDate!);
    }

    return results.reduce((sum, e) => sum + e.units, 0);
  }

  async countByTypeAndUser(
    tenantId: string,
    userId: string,
    eventType: UsageEventType,
    options: UsageCountOptions = {}
  ): Promise<number> {
    let results = this.events.filter(
      (e) =>
        e.tenantId === tenantId &&
        e.userId === userId &&
        e.eventType === eventType
    );

    if (options.startDate) {
      results = results.filter((e) => e.createdAt >= options.startDate!);
    }
    if (options.endDate) {
      results = results.filter((e) => e.createdAt <= options.endDate!);
    }

    return results.reduce((sum, e) => sum + e.units, 0);
  }

  async getConcurrentRuns(tenantId: string): Promise<number> {
    return this.concurrentRuns.get(tenantId) || 0;
  }

  async getRollup(tenantId: string, date: Date): Promise<UsageRollupDaily | null> {
    const key = `${tenantId}:${date.toISOString().split('T')[0]}`;
    return this.rollups.get(key) || null;
  }

  async upsertRollup(
    tenantId: string,
    date: Date,
    totals: Record<string, number>
  ): Promise<void> {
    const key = `${tenantId}:${date.toISOString().split('T')[0]}`;
    this.rollups.set(key, {
      id: nanoid(),
      tenantId,
      date,
      totalsJson: totals,
    });
  }

  // For testing
  setConcurrentRuns(tenantId: string, count: number): void {
    this.concurrentRuns.set(tenantId, count);
  }

  clear(): void {
    this.events = [];
    this.rollups.clear();
    this.concurrentRuns.clear();
  }
}

// ============================================================================
// Usage Tracker
// ============================================================================

export class UsageTracker {
  constructor(private store: UsageStore) {}

  /**
   * Record a usage event
   */
  async track(
    tenantId: string,
    eventType: UsageEventType,
    options?: {
      userId?: string;
      jobRunId?: string;
      units?: number;
      costEstimateUsd?: number;
      meta?: Record<string, unknown>;
    }
  ): Promise<UsageEvent> {
    const event: UsageEvent = {
      id: nanoid(),
      tenantId,
      userId: options?.userId,
      jobRunId: options?.jobRunId,
      eventType,
      units: options?.units ?? 1,
      costEstimateUsd: options?.costEstimateUsd,
      metaJson: options?.meta,
      createdAt: new Date(),
    };

    await this.store.save(event);
    return event;
  }

  /**
   * Track a job run
   */
  async trackJobRun(
    tenantId: string,
    userId: string,
    jobType: JobType,
    jobRunId: string,
    costEstimateUsd?: number
  ): Promise<UsageEvent> {
    const eventType = `job.run.${jobType}` as UsageEventType;
    return this.track(tenantId, eventType, {
      userId,
      jobRunId,
      costEstimateUsd,
    });
  }

  /**
   * Track a tool call
   */
  async trackToolCall(
    tenantId: string,
    jobRunId: string,
    toolName: string,
    connectorKey: string,
    durationMs: number
  ): Promise<UsageEvent> {
    return this.track(tenantId, 'tool.call', {
      jobRunId,
      meta: { toolName, connectorKey, durationMs },
    });
  }

  /**
   * Track LLM token usage
   */
  async trackLlmTokens(
    tenantId: string,
    jobRunId: string,
    inputTokens: number,
    outputTokens: number,
    costEstimateUsd: number
  ): Promise<void> {
    await this.track(tenantId, 'llm.tokens.input', {
      jobRunId,
      units: inputTokens,
    });
    await this.track(tenantId, 'llm.tokens.output', {
      jobRunId,
      units: outputTokens,
      costEstimateUsd,
    });
  }

  /**
   * Get usage summary for a tenant
   */
  async getUsageSummary(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<UsageSummary> {
    const events = await this.store.findByTenant(tenantId, {
      startDate,
      endDate,
    });

    const summary: UsageSummary = {
      period: { start: startDate, end: endDate },
      jobRuns: {
        daily_brief: 0,
        meeting_prep: 0,
        voc_clustering: 0,
        competitor_research: 0,
        roadmap_alignment: 0,
        prd_draft: 0,
        sprint_review: 0,
        prototype_generation: 0,
        release_notes: 0,
      },
      toolCalls: 0,
      llmTokens: { input: 0, output: 0 },
      estimatedCostUsd: 0,
    };

    for (const event of events) {
      if (event.eventType.startsWith('job.run.')) {
        const jobType = event.eventType.replace('job.run.', '') as JobType;
        summary.jobRuns[jobType] += event.units;
      } else if (event.eventType === 'tool.call') {
        summary.toolCalls += event.units;
      } else if (event.eventType === 'llm.tokens.input') {
        summary.llmTokens.input += event.units;
      } else if (event.eventType === 'llm.tokens.output') {
        summary.llmTokens.output += event.units;
      }

      if (event.costEstimateUsd) {
        summary.estimatedCostUsd += event.costEstimateUsd;
      }
    }

    return summary;
  }

  /**
   * Get usage by user for analytics
   */
  async getUsageByUser(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Map<string, UserUsage>> {
    const events = await this.store.findByTenant(tenantId, {
      startDate,
      endDate,
    });

    const byUser = new Map<string, UserUsage>();

    for (const event of events) {
      if (!event.userId) continue;

      if (!byUser.has(event.userId)) {
        byUser.set(event.userId, {
          userId: event.userId,
          jobRuns: 0,
          toolCalls: 0,
          estimatedCostUsd: 0,
        });
      }

      const usage = byUser.get(event.userId)!;

      if (event.eventType.startsWith('job.run.')) {
        usage.jobRuns += event.units;
      } else if (event.eventType === 'tool.call') {
        usage.toolCalls += event.units;
      }

      if (event.costEstimateUsd) {
        usage.estimatedCostUsd += event.costEstimateUsd;
      }
    }

    return byUser;
  }
}

export interface UsageSummary {
  period: { start: Date; end: Date };
  jobRuns: Record<JobType, number>;
  toolCalls: number;
  llmTokens: { input: number; output: number };
  estimatedCostUsd: number;
}

export interface UserUsage {
  userId: string;
  jobRuns: number;
  toolCalls: number;
  estimatedCostUsd: number;
}

// ============================================================================
// Limits Enforcer
// ============================================================================

export interface LimitsContext {
  tenantId: string;
  userId: string;
  subscription: Subscription;
  activeSeats: number;
}

export class LimitsEnforcer {
  constructor(private usageStore: UsageStore) {}

  /**
   * Check if a job run is allowed
   */
  async canRunJob(
    ctx: LimitsContext,
    jobType: JobType
  ): Promise<LimitCheckResult> {
    const plan = getPlan(ctx.subscription.planKey);
    const features = plan.features;

    // Check subscription status
    if (ctx.subscription.status !== 'active') {
      return {
        allowed: false,
        reason: 'Subscription is not active',
        limit: 0,
        current: 0,
      };
    }

    // Check concurrency
    const concurrentRuns = await this.usageStore.getConcurrentRuns(ctx.tenantId);
    const maxConcurrent = Math.ceil(
      (ctx.activeSeats / 10) * features.maxConcurrentRunsPer10Seats
    );

    if (concurrentRuns >= maxConcurrent) {
      return {
        allowed: false,
        reason: 'Maximum concurrent runs reached',
        limit: maxConcurrent,
        current: concurrentRuns,
      };
    }

    // Check on-demand limits for specific job types
    // daily_brief is scheduled-only, all others have on-demand limits
    const onDemandJobs: JobType[] = [
      'meeting_prep',
      'prd_draft',
      'roadmap_alignment',
      'sprint_review',
      'release_notes',
      'prototype_generation',
      'voc_clustering',
      'competitor_research',
    ];
    
    if (onDemandJobs.includes(jobType)) {
      const result = await this.checkOnDemandLimit(ctx, jobType, features);
      if (!result.allowed) {
        return result;
      }
    }

    return { allowed: true };
  }

  /**
   * Check if a connector can be used
   */
  async canUseConnector(
    ctx: LimitsContext,
    connectorKey: ConnectorKey
  ): Promise<LimitCheckResult> {
    const plan = getPlan(ctx.subscription.planKey);

    if (!plan.features.allowedConnectors.includes(connectorKey)) {
      return {
        allowed: false,
        reason: `Connector '${connectorKey}' is not included in your plan`,
        limit: 0,
        current: 0,
      };
    }

    return { allowed: true };
  }

  private async checkOnDemandLimit(
    ctx: LimitsContext,
    jobType: JobType,
    features: { 
      maxOnDemandMeetingPrepPerSeatPerMonth: number;
      maxOnDemandPrdPackPerSeatPerMonth: number;
      maxOnDemandRoadmapMemoPerSeatPerMonth: number;
      maxOnDemandSprintReviewPerSeatPerMonth: number;
      maxOnDemandReleaseNotesPerSeatPerMonth: number;
      maxOnDemandPrototypeGenPerSeatPerMonth: number;
      maxOnDemandVocClusteringPerSeatPerMonth: number;
      maxOnDemandCompetitorResearchPerSeatPerMonth: number;
    }
  ): Promise<LimitCheckResult> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const eventType = `job.run.${jobType}` as UsageEventType;

    const currentCount = await this.usageStore.countByTypeAndUser(
      ctx.tenantId,
      ctx.userId,
      eventType,
      { startDate: startOfMonth }
    );

    let limit: number;
    switch (jobType) {
      case 'meeting_prep':
        limit = features.maxOnDemandMeetingPrepPerSeatPerMonth;
        break;
      case 'prd_draft':
        limit = features.maxOnDemandPrdPackPerSeatPerMonth;
        break;
      case 'roadmap_alignment':
        limit = features.maxOnDemandRoadmapMemoPerSeatPerMonth;
        break;
      case 'sprint_review':
        limit = features.maxOnDemandSprintReviewPerSeatPerMonth;
        break;
      case 'release_notes':
        limit = features.maxOnDemandReleaseNotesPerSeatPerMonth;
        break;
      case 'prototype_generation':
        limit = features.maxOnDemandPrototypeGenPerSeatPerMonth;
        break;
      case 'voc_clustering':
        limit = features.maxOnDemandVocClusteringPerSeatPerMonth;
        break;
      case 'competitor_research':
        limit = features.maxOnDemandCompetitorResearchPerSeatPerMonth;
        break;
      default:
        return { allowed: true };
    }

    if (currentCount >= limit) {
      return {
        allowed: false,
        reason: `Monthly limit for ${jobType} reached (${limit}/month per seat)`,
        limit,
        current: currentCount,
      };
    }

    return { allowed: true };
  }
}

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  limit?: number;
  current?: number;
}

// ============================================================================
// Default instances
// ============================================================================

const defaultUsageStore = new InMemoryUsageStore();
export const usageTracker = new UsageTracker(defaultUsageStore);
export const limitsEnforcer = new LimitsEnforcer(defaultUsageStore);
export { defaultUsageStore as usageStore };

