import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { PrismaClient } from '@prisma/client';
import type { DailyBriefConfig } from '@pmkit/core';

// ============================================================================
// Configuration
// ============================================================================

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const AGENT_QUEUE_NAME = 'pmkit-agents';
const SCHEDULER_COMMAND_QUEUE = 'pmkit-scheduler-commands';

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

// Command types for scheduler sync
type SchedulerCommand =
  | { type: 'schedule'; agentConfigId: string }
  | { type: 'cancel'; agentConfigId: string }
  | { type: 'reload'; agentConfigId: string };

// ============================================================================
// Scheduler Class
// ============================================================================

export class AgentScheduler {
  private queue: Queue<AgentJobPayload>;
  private commandQueue: Queue<SchedulerCommand>;
  private commandWorker: Worker<SchedulerCommand> | null = null;
  private connection: Redis;
  private prisma: PrismaClient;
  private isInitialized = false;

  constructor(connection: Redis) {
    this.connection = connection;
    this.queue = new Queue<AgentJobPayload>(AGENT_QUEUE_NAME, { connection });
    this.commandQueue = new Queue<SchedulerCommand>(SCHEDULER_COMMAND_QUEUE, { connection });
    this.prisma = new PrismaClient();
  }

  /**
   * Start the command worker that listens for schedule/cancel requests from the web app
   */
  async startCommandWorker(): Promise<void> {
    if (this.commandWorker) {
      return;
    }

    this.commandWorker = new Worker<SchedulerCommand>(
      SCHEDULER_COMMAND_QUEUE,
      async (job) => {
        const command = job.data;
        console.log(`[Scheduler] Processing command: ${command.type} for ${command.agentConfigId}`);

        try {
          switch (command.type) {
            case 'schedule':
            case 'reload': {
              // Fetch the latest config from DB and schedule it
              const agentConfig = await this.prisma.agentConfig.findUnique({
                where: { id: command.agentConfigId },
              });

              if (!agentConfig) {
                console.warn(`[Scheduler] Config not found: ${command.agentConfigId}`);
                return;
              }

              if (agentConfig.status !== 'active') {
                // If paused, cancel any existing job
                await this.cancelAgent(command.agentConfigId);
                console.log(`[Scheduler] Agent ${command.agentConfigId} is paused, cancelled any scheduled jobs`);
                return;
              }

              // Schedule the agent
              await this.scheduleAgent({
                ...agentConfig,
                config: agentConfig.config as DailyBriefConfig,
              });
              break;
            }

            case 'cancel': {
              await this.cancelAgent(command.agentConfigId);
              break;
            }

            default:
              console.warn(`[Scheduler] Unknown command type`);
          }
        } catch (error) {
          console.error(`[Scheduler] Command failed:`, error);
          throw error;
        }
      },
      {
        connection: this.connection,
        concurrency: 5,
      }
    );

    this.commandWorker.on('completed', (job) => {
      console.log(`[Scheduler] Command ${job.id} completed`);
    });

    this.commandWorker.on('failed', (job, error) => {
      console.error(`[Scheduler] Command ${job?.id} failed:`, error.message);
    });

    console.log('[Scheduler] Command worker started');
  }

  /**
   * Stop the command worker gracefully
   */
  async stopCommandWorker(): Promise<void> {
    if (this.commandWorker) {
      await this.commandWorker.close();
      this.commandWorker = null;
    }
    await this.prisma.$disconnect();
  }

  /**
   * Calculate the next run time for a daily brief based on user's local time
   *
   * This properly converts user's local delivery time to UTC for scheduling.
   * For example: If user wants 7:00 AM Pacific Time, this calculates when
   * 7:00 AM Pacific is in UTC.
   */
  private calculateNextRunTime(
    deliveryTimeLocal: string,
    timezone: string,
    afterDate?: Date
  ): Date {
    const [hours, minutes] = deliveryTimeLocal.split(':').map(Number);
    const now = afterDate || new Date();

    // Get current date/time in user's timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const currentYear = parseInt(parts.find(p => p.type === 'year')?.value || '2024');
    const currentMonth = parseInt(parts.find(p => p.type === 'month')?.value || '1') - 1;
    const currentDay = parseInt(parts.find(p => p.type === 'day')?.value || '1');
    const currentHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
    const currentMinute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');

    // Determine if we need to schedule for today or tomorrow
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const targetTimeInMinutes = hours * 60 + minutes;

    let targetDay = currentDay;
    let targetMonth = currentMonth;
    let targetYear = currentYear;

    // If target time has already passed today, schedule for tomorrow
    if (targetTimeInMinutes <= currentTimeInMinutes) {
      // Add one day, handling month/year rollover
      const tempDate = new Date(currentYear, currentMonth, currentDay + 1);
      targetDay = tempDate.getDate();
      targetMonth = tempDate.getMonth();
      targetYear = tempDate.getFullYear();
    }

    // Create a date string in the user's timezone, then convert to UTC
    // Format: "YYYY-MM-DDTHH:mm:ss" interpreted in the user's timezone
    const dateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

    // Use Intl to find the UTC offset for this specific date/time in the target timezone
    // This handles DST correctly
    const targetFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // Create initial guess in UTC
    let utcGuess = new Date(`${dateStr}Z`);

    // Check what time this UTC time shows in the target timezone
    const guessParts = targetFormatter.formatToParts(utcGuess);
    const guessHour = parseInt(guessParts.find(p => p.type === 'hour')?.value || '0');
    const guessMinute = parseInt(guessParts.find(p => p.type === 'minute')?.value || '0');

    // Calculate the offset needed
    const guessTimeInMinutes = guessHour * 60 + guessMinute;
    const offsetMinutes = guessTimeInMinutes - targetTimeInMinutes;

    // Adjust to get the correct UTC time
    const finalUtc = new Date(utcGuess.getTime() - offsetMinutes * 60 * 1000);

    return finalUtc;
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
    let nextRunAt = this.calculateNextRunTime(config.deliveryTimeLocal, config.timezone);
    let delay = nextRunAt.getTime() - Date.now();

    // If delay is negative or very small (< 1 minute), schedule for tomorrow instead
    // This handles cases where the time has already passed today
    if (delay < 60000) {
      console.log(`[Scheduler] Time has passed or is imminent for ${agentConfig.id}, scheduling for tomorrow`);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      nextRunAt = this.calculateNextRunTime(config.deliveryTimeLocal, config.timezone, tomorrow);
      delay = nextRunAt.getTime() - Date.now();

      // Safety check - if still negative, something is very wrong
      if (delay <= 0) {
        console.error(`[Scheduler] Could not calculate valid future time for ${agentConfig.id}`);
        return;
      }
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

    // Update nextRunAt in database so UI shows correct time
    await this.prisma.agentConfig.update({
      where: { id: agentConfig.id },
      data: { nextRunAt },
    });

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

    // Update nextRunAt in database so UI shows correct time
    await this.prisma.agentConfig.update({
      where: { id: agentConfig.id },
      data: { nextRunAt },
    });

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
