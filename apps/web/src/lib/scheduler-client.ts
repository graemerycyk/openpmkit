import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

// Command types for scheduler sync
type SchedulerCommand =
  | { type: 'schedule'; agentConfigId: string }
  | { type: 'cancel'; agentConfigId: string }
  | { type: 'reload'; agentConfigId: string };

const SCHEDULER_COMMAND_QUEUE = 'pmkit-scheduler-commands';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let commandQueue: Queue<SchedulerCommand> | null = null;
let redisConnection: Redis | null = null;

/**
 * Get or create the scheduler command queue connection
 */
async function getCommandQueue(): Promise<Queue<SchedulerCommand> | null> {
  if (commandQueue) {
    return commandQueue;
  }

  try {
    redisConnection = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });

    await redisConnection.connect();
    await redisConnection.ping();

    commandQueue = new Queue<SchedulerCommand>(SCHEDULER_COMMAND_QUEUE, {
      connection: redisConnection,
    });

    console.log('[SchedulerClient] Connected to Redis for scheduler commands');
    return commandQueue;
  } catch (error) {
    console.warn('[SchedulerClient] Redis not available, scheduler commands will be skipped:', error);
    return null;
  }
}

/**
 * Notify the worker scheduler to schedule or reschedule an agent
 * Call this when:
 * - User activates an agent (status: 'active')
 * - User changes the delivery time or timezone
 */
export async function notifySchedulerToSchedule(agentConfigId: string): Promise<boolean> {
  const queue = await getCommandQueue();
  if (!queue) {
    console.warn('[SchedulerClient] Queue not available, skipping schedule notification');
    return false;
  }

  try {
    await queue.add(
      'schedule-agent',
      { type: 'schedule', agentConfigId },
      {
        removeOnComplete: true,
        removeOnFail: 100, // Keep last 100 failed jobs for debugging
      }
    );
    console.log(`[SchedulerClient] Sent schedule command for ${agentConfigId}`);
    return true;
  } catch (error) {
    console.error('[SchedulerClient] Failed to send schedule command:', error);
    return false;
  }
}

/**
 * Notify the worker scheduler to cancel a scheduled agent
 * Call this when:
 * - User pauses an agent (status: 'paused')
 * - User deletes an agent config
 */
export async function notifySchedulerToCancel(agentConfigId: string): Promise<boolean> {
  const queue = await getCommandQueue();
  if (!queue) {
    console.warn('[SchedulerClient] Queue not available, skipping cancel notification');
    return false;
  }

  try {
    await queue.add(
      'cancel-agent',
      { type: 'cancel', agentConfigId },
      {
        removeOnComplete: true,
        removeOnFail: 100,
      }
    );
    console.log(`[SchedulerClient] Sent cancel command for ${agentConfigId}`);
    return true;
  } catch (error) {
    console.error('[SchedulerClient] Failed to send cancel command:', error);
    return false;
  }
}

/**
 * Notify the worker scheduler to reload and reschedule an agent
 * Call this when:
 * - Agent config is updated (any change)
 * This will re-read the config from DB and schedule/cancel as appropriate
 */
export async function notifySchedulerToReload(agentConfigId: string): Promise<boolean> {
  const queue = await getCommandQueue();
  if (!queue) {
    console.warn('[SchedulerClient] Queue not available, skipping reload notification');
    return false;
  }

  try {
    await queue.add(
      'reload-agent',
      { type: 'reload', agentConfigId },
      {
        removeOnComplete: true,
        removeOnFail: 100,
      }
    );
    console.log(`[SchedulerClient] Sent reload command for ${agentConfigId}`);
    return true;
  } catch (error) {
    console.error('[SchedulerClient] Failed to send reload command:', error);
    return false;
  }
}
