import { Worker, Queue, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { JobType, type DailyBriefConfig, type FeatureIntelligenceConfig, type MeetingPrepConfig } from '@pmkit/core';
import { createMockMCPClient, initializeMockData } from '@pmkit/mock-tenant';
import { generateStubResponse, PROMPT_TEMPLATES } from '@pmkit/prompts';
import { initializeScheduler, createAgentWorker } from './agent-scheduler';
import { processDailyBriefJob } from './daily-brief-job';
import { processFeatureIntelligenceJob } from './feature-intelligence-job';
import { processMeetingPrepJob } from './meeting-prep-job';

// ============================================================================
// Configuration
// ============================================================================

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const QUEUE_NAME = 'pmkit-jobs';

// ============================================================================
// Job Processor
// ============================================================================

interface JobPayload {
  tenantId: string;
  userId: string;
  jobType: JobType;
  config?: Record<string, unknown>;
}

async function processJob(job: Job<JobPayload>): Promise<void> {
  const { tenantId, userId, jobType, config } = job.data;

  console.log(`[Worker] Processing job ${job.id}: ${jobType} for tenant ${tenantId}`);

  // Initialize mock data
  initializeMockData();

  // Get MCP client
  const mcpClient = createMockMCPClient();

  // Get prompt template
  const template = PROMPT_TEMPLATES[jobType];

  // Create context
  const context = {
    tenantName: 'Acme SaaS',
    productName: 'Acme Platform',
    currentDate: new Date().toISOString().split('T')[0],
    userName: 'Demo User',
    ...config,
  };

  // Simulate tool calls based on job type
  const toolCalls: Array<{
    server: string;
    tool: string;
    input: Record<string, unknown>;
    output: unknown;
    durationMs: number;
  }> = [];

  // Execute tool calls based on job type
  switch (jobType) {
    case 'daily_brief':
      // Slack messages
      const slackResult = await mcpClient.callTool('slack', 'get_channel_messages', {
        channelId: 'C001',
        limit: 50,
      });
      toolCalls.push({
        server: 'slack',
        tool: 'get_channel_messages',
        input: { channelId: 'C001', limit: 50 },
        output: slackResult.data,
        durationMs: slackResult.durationMs,
      });

      // Jira sprint
      const jiraResult = await mcpClient.callTool('jira', 'get_sprint_issues', {
        sprintId: 'sprint-42',
      });
      toolCalls.push({
        server: 'jira',
        tool: 'get_sprint_issues',
        input: { sprintId: 'sprint-42' },
        output: jiraResult.data,
        durationMs: jiraResult.durationMs,
      });

      // Zendesk tickets
      const zendeskResult = await mcpClient.callTool('zendesk', 'get_tickets', {
        status: 'open',
        limit: 25,
      });
      toolCalls.push({
        server: 'zendesk',
        tool: 'get_tickets',
        input: { status: 'open', limit: 25 },
        output: zendeskResult.data,
        durationMs: zendeskResult.durationMs,
      });
      break;

    case 'meeting_prep':
      // Gong calls
      const gongCallsResult = await mcpClient.callTool('gong', 'get_calls', {
        accountName: config?.accountName || 'Globex Corp',
        limit: 5,
      });
      toolCalls.push({
        server: 'gong',
        tool: 'get_calls',
        input: { accountName: config?.accountName || 'Globex Corp', limit: 5 },
        output: gongCallsResult.data,
        durationMs: gongCallsResult.durationMs,
      });

      // Gong insights
      const gongInsightsResult = await mcpClient.callTool('gong', 'get_insights', {
        type: 'pain_point',
      });
      toolCalls.push({
        server: 'gong',
        tool: 'get_insights',
        input: { type: 'pain_point' },
        output: gongInsightsResult.data,
        durationMs: gongInsightsResult.durationMs,
      });
      break;

    // Add other job types as needed
    default:
      console.log(`[Worker] Using default tool calls for ${jobType}`);
  }

  // Generate artifact using stub generator
  const artifact = generateStubResponse(jobType, context);

  console.log(`[Worker] Job ${job.id} completed with ${toolCalls.length} tool calls`);

  // In production, save to database
  // await prisma.artifact.create({ ... });

  return;
}

// ============================================================================
// Worker Setup
// ============================================================================

async function startWorker(): Promise<void> {
  console.log('[Worker] Starting pmkit worker...');
  console.log(`[Worker] Connecting to Redis at ${REDIS_URL}`);

  let connection: Redis;

  try {
    connection = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
    });

    await connection.ping();
    console.log('[Worker] Redis connection established');
  } catch (error) {
    console.warn('[Worker] Redis not available, running in inline mode');
    // In development without Redis, jobs run inline
    return;
  }

  const worker = new Worker<JobPayload>(
    QUEUE_NAME,
    async (job) => {
      await processJob(job);
    },
    {
      connection,
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, error) => {
    console.error(`[Worker] Job ${job?.id} failed:`, error.message);
  });

  worker.on('error', (error) => {
    console.error('[Worker] Worker error:', error);
  });

  console.log('[Worker] Worker started and listening for jobs');

  // Initialize agent scheduler and load active configs
  try {
    const scheduler = await initializeScheduler(REDIS_URL);

    // Start the command worker to listen for schedule/cancel requests from web app
    await scheduler.startCommandWorker();
    console.log('[Worker] Scheduler command worker started');

    // Create agent worker with a dispatcher that routes to the correct processor
    const agentJobDispatcher = async (job: Job) => {
      const agentType = job.data.agentType;
      if (agentType === 'daily_brief') {
        await processDailyBriefJob(job);
      } else if (agentType === 'feature_intelligence') {
        await processFeatureIntelligenceJob(job);
      } else if (agentType === 'meeting_prep') {
        await processMeetingPrepJob(job);
      } else {
        console.warn(`[Worker] Unknown agent type: ${agentType}, skipping job ${job.id}`);
      }
    };
    const agentWorker = await createAgentWorker(connection, agentJobDispatcher);
    console.log('[Worker] Agent worker started');

    // Load and schedule all active agent configs
    const prisma = new PrismaClient();

    // Load Daily Brief configs
    const dailyBriefConfigs = await prisma.agentConfig.findMany({
      where: {
        status: 'active',
        agentType: 'daily_brief',
      },
    });
    console.log(`[Worker] Found ${dailyBriefConfigs.length} active daily brief configs`);

    // Load Feature Intelligence configs
    const featureIntelligenceConfigs = await prisma.agentConfig.findMany({
      where: {
        status: 'active',
        agentType: 'feature_intelligence',
      },
    });
    console.log(`[Worker] Found ${featureIntelligenceConfigs.length} active feature intelligence configs`);

    // Load Meeting Prep configs
    const meetingPrepConfigs = await prisma.agentConfig.findMany({
      where: {
        status: 'active',
        agentType: 'meeting_prep',
      },
    });
    console.log(`[Worker] Found ${meetingPrepConfigs.length} active meeting prep configs`);

    // First, check the current state of the queue
    const queue = scheduler.getQueue();
    const delayedJobs = await queue.getDelayed();
    const waitingJobs = await queue.getWaiting();
    console.log(`[Worker] Queue state: ${delayedJobs.length} delayed, ${waitingJobs.length} waiting`);

    // Schedule Daily Brief configs
    for (const config of dailyBriefConfigs) {
      // Check if there's already a valid job for this config in the queue
      const jobId = `daily-brief-${config.id}`;
      const existingJob = await queue.getJob(jobId);

      if (existingJob) {
        const state = await existingJob.getState();
        const jobData = existingJob.data;
        const scheduledAt = jobData?.scheduledAt ? new Date(jobData.scheduledAt) : null;

        // If job is delayed and scheduled for the future, skip re-scheduling
        if (state === 'delayed' && scheduledAt && scheduledAt > new Date()) {
          console.log(`[Worker] Daily Brief ${config.id} already has valid delayed job scheduled for ${scheduledAt.toISOString()}`);
          continue;
        }
      }

      await scheduler.scheduleAgent({
        ...config,
        config: config.config as DailyBriefConfig,
      });
    }

    // Schedule Feature Intelligence configs
    for (const config of featureIntelligenceConfigs) {
      // Check if there's already a valid job for this config in the queue
      const jobId = `feature-intelligence-${config.id}`;
      const existingJob = await queue.getJob(jobId);

      if (existingJob) {
        const state = await existingJob.getState();
        const jobData = existingJob.data;
        const scheduledAt = jobData?.scheduledAt ? new Date(jobData.scheduledAt) : null;

        // If job is delayed and scheduled for the future, skip re-scheduling
        if (state === 'delayed' && scheduledAt && scheduledAt > new Date()) {
          console.log(`[Worker] Feature Intelligence ${config.id} already has valid delayed job scheduled for ${scheduledAt.toISOString()}`);
          continue;
        }
      }

      await scheduler.scheduleAgent({
        ...config,
        config: config.config as FeatureIntelligenceConfig,
      });
    }

    // Schedule Meeting Prep configs (calendar polling)
    for (const config of meetingPrepConfigs) {
      // Check if there's already a valid job for this config in the queue
      const jobId = `meeting-prep-${config.id}`;
      const existingJob = await queue.getJob(jobId);

      if (existingJob) {
        const state = await existingJob.getState();
        // Meeting Prep jobs run frequently, so we always reschedule unless currently active
        if (state === 'active') {
          console.log(`[Worker] Meeting Prep ${config.id} is currently active`);
          continue;
        }
        // Remove delayed/waiting job and reschedule to ensure fresh timing
        if (state === 'delayed' || state === 'waiting') {
          await existingJob.remove();
        }
      }

      await scheduler.scheduleAgent({
        ...config,
        config: config.config as MeetingPrepConfig,
      });
    }

    // Log final queue state
    const finalDelayed = await queue.getDelayed();
    console.log(`[Worker] After scheduling: ${finalDelayed.length} delayed jobs`);
    for (const job of finalDelayed) {
      const delay = job.opts.delay || 0;
      const processAt = new Date(job.timestamp + delay);
      console.log(`[Worker] - Job ${job.id}: scheduled to process at ${processAt.toISOString()}`);
    }

    await prisma.$disconnect();

    // Handle shutdown - include agent worker and scheduler
    process.on('SIGTERM', async () => {
      console.log('[Worker] Received SIGTERM, shutting down...');
      await worker.close();
      await agentWorker.close();
      await scheduler.stopCommandWorker();
      await connection.quit();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('[Worker] Received SIGINT, shutting down...');
      await worker.close();
      await agentWorker.close();
      await scheduler.stopCommandWorker();
      await connection.quit();
      process.exit(0);
    });
  } catch (error) {
    console.warn('[Worker] Agent scheduler initialization failed:', error);

    // Handle shutdown without agent worker
    process.on('SIGTERM', async () => {
      console.log('[Worker] Received SIGTERM, shutting down...');
      await worker.close();
      await connection.quit();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('[Worker] Received SIGINT, shutting down...');
      await worker.close();
      await connection.quit();
      process.exit(0);
    });
  }
}

// ============================================================================
// Inline Job Runner (for dev without Redis)
// ============================================================================

export async function runJobInline(payload: JobPayload): Promise<void> {
  const mockJob = {
    id: `inline-${Date.now()}`,
    data: payload,
  } as Job<JobPayload>;

  await processJob(mockJob);
}

// Start worker
startWorker().catch((error) => {
  console.error('[Worker] Failed to start:', error);
  process.exit(1);
});

