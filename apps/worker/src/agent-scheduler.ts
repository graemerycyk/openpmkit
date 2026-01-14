import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import type { DailyBriefConfig } from '@pmkit/core';

// ============================================================================
// Configuration
// ============================================================================

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const AGENT_QUEUE_NAME = 'pmkit-agents';

// ============================================================================
// Types
// ============================================================================

interface AgentConfigRecord {
  id: string;
  userId: string;
  tenantId: string;
  agentType: string;
  status: string;
  config: DailyBriefConfig;
  nextRunAt: Date | null;
  lastRunAt: Date | null;
}

interface AgentJobPayload {
  agentConfigId: string;
  userId: string;
  tenantId: string;
  agentType: string;
  config: DailyBriefConfig;
  scheduledAt: string;
}

// ============================================================================
// Scheduler Class
// ============================================================================

export class AgentScheduler {
  private queue: Queue<AgentJobPayload>;
  private connection: Redis;
  private isInitialized = false;

  constructor(connection: Redis) {
    this.connection = connection;
    this.queue = new Queue<AgentJobPayload>(AGENT_QUEUE_NAME, { connection });
  }

  /**
   * Calculate the next run time for a daily brief based on user's local time
   */
  private calculateNextRunTime(
    deliveryTimeLocal: string,
    timezone: string,
    afterDate?: Date
  ): Date {
    const [hours, minutes] = deliveryTimeLocal.split(':').map(Number);
    const baseDate = afterDate || new Date();

    // Create a date formatter for the target timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    // Get current time in user's timezone
    const parts = formatter.formatToParts(baseDate);
    const currentYear = parseInt(parts.find(p => p.type === 'year')?.value || '2024');
    const currentMonth = parseInt(parts.find(p => p.type === 'month')?.value || '1') - 1;
    const currentDay = parseInt(parts.find(p => p.type === 'day')?.value || '1');
    const currentHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
    const currentMinute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');

    // Start with today at the delivery time
    const targetDate = new Date(
      Date.UTC(currentYear, currentMonth, currentDay, hours, minutes)
    );

    // Calculate timezone offset
    const utcDate = new Date(targetDate.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(targetDate.toLocaleString('en-US', { timeZone: timezone }));
    const offset = utcDate.getTime() - tzDate.getTime();

    // Adjust for timezone
    const adjustedDate = new Date(targetDate.getTime() + offset);

    // If target time has passed today, schedule for tomorrow
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const targetTimeInMinutes = hours * 60 + minutes;

    if (targetTimeInMinutes <= currentTimeInMinutes) {
      adjustedDate.setTime(adjustedDate.getTime() + 24 * 60 * 60 * 1000);
    }

    return adjustedDate;
  }

  /**
   * Schedule a daily brief agent to run at a specific time
   */
  async scheduleAgent(agentConfig: AgentConfigRecord): Promise<void> {
    if (agentConfig.agentType !== 'daily_brief') {
      console.warn(`[Scheduler] Unknown agent type: ${agentConfig.agentType}`);
      return;
    }

    const config = agentConfig.config as DailyBriefConfig;
    const nextRunAt = this.calculateNextRunTime(config.deliveryTimeLocal, config.timezone);
    const delay = nextRunAt.getTime() - Date.now();

    if (delay <= 0) {
      console.warn(`[Scheduler] Calculated delay is negative for ${agentConfig.id}, skipping`);
      return;
    }

    // Remove any existing scheduled job for this config
    const jobId = `daily-brief-${agentConfig.id}`;
    const existingJob = await this.queue.getJob(jobId);
    if (existingJob) {
      await existingJob.remove();
    }

    // Add new scheduled job
    await this.queue.add(
      'daily-brief',
      {
        agentConfigId: agentConfig.id,
        userId: agentConfig.userId,
        tenantId: agentConfig.tenantId,
        agentType: agentConfig.agentType,
        config,
        scheduledAt: nextRunAt.toISOString(),
      },
      {
        jobId,
        delay,
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60000, // 1 minute initial delay for retries
        },
      }
    );

    console.log(
      `[Scheduler] Scheduled daily brief ${agentConfig.id} for ${nextRunAt.toISOString()} (in ${Math.round(delay / 60000)} minutes)`
    );
  }

  /**
   * Cancel a scheduled agent
   */
  async cancelAgent(agentConfigId: string): Promise<void> {
    const jobId = `daily-brief-${agentConfigId}`;
    const job = await this.queue.getJob(jobId);
    if (job) {
      await job.remove();
      console.log(`[Scheduler] Cancelled scheduled job for ${agentConfigId}`);
    }
  }

  /**
   * Schedule the next run after a completed run
   */
  async scheduleNextRun(agentConfig: AgentConfigRecord): Promise<void> {
    const config = agentConfig.config as DailyBriefConfig;

    // Calculate tomorrow's run time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextRunAt = this.calculateNextRunTime(
      config.deliveryTimeLocal,
      config.timezone,
      tomorrow
    );

    const delay = nextRunAt.getTime() - Date.now();
    const jobId = `daily-brief-${agentConfig.id}`;

    await this.queue.add(
      'daily-brief',
      {
        agentConfigId: agentConfig.id,
        userId: agentConfig.userId,
        tenantId: agentConfig.tenantId,
        agentType: agentConfig.agentType,
        config,
        scheduledAt: nextRunAt.toISOString(),
      },
      {
        jobId,
        delay,
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60000,
        },
      }
    );

    console.log(
      `[Scheduler] Scheduled next daily brief ${agentConfig.id} for ${nextRunAt.toISOString()}`
    );
  }

  /**
   * Get queue for creating workers
   */
  getQueue(): Queue<AgentJobPayload> {
    return this.queue;
  }
}

// ============================================================================
// Worker for Agent Jobs
// ============================================================================

export async function createAgentWorker(
  connection: Redis,
  processJob: (job: Job<AgentJobPayload>) => Promise<void>
): Promise<Worker<AgentJobPayload>> {
  const worker = new Worker<AgentJobPayload>(
    AGENT_QUEUE_NAME,
    processJob,
    {
      connection,
      concurrency: 2, // Process 2 agents at a time
    }
  );

  worker.on('completed', (job) => {
    console.log(`[AgentWorker] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, error) => {
    console.error(`[AgentWorker] Job ${job?.id} failed:`, error.message);
  });

  worker.on('error', (error) => {
    console.error('[AgentWorker] Worker error:', error);
  });

  return worker;
}

// ============================================================================
// Initialize Scheduler
// ============================================================================

let scheduler: AgentScheduler | null = null;

export async function initializeScheduler(redisUrl?: string): Promise<AgentScheduler> {
  if (scheduler) {
    return scheduler;
  }

  const connection = new Redis(redisUrl || REDIS_URL, {
    maxRetriesPerRequest: null,
  });

  await connection.ping();
  console.log('[Scheduler] Redis connection established');

  scheduler = new AgentScheduler(connection);
  return scheduler;
}

export function getScheduler(): AgentScheduler | null {
  return scheduler;
}
