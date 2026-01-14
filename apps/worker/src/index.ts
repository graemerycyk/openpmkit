import { Worker, Queue, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { JobType, type DailyBriefConfig } from '@pmkit/core';
import { createMockMCPClient, initializeMockData } from '@pmkit/mock-tenant';
import { generateStubResponse, PROMPT_TEMPLATES } from '@pmkit/prompts';
import { initializeScheduler, createAgentWorker } from './agent-scheduler';
import { processDailyBriefJob } from './daily-brief-job';

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

    // Create agent worker
    const agentWorker = await createAgentWorker(connection, processDailyBriefJob);
    console.log('[Worker] Agent worker started');

    // Load and schedule all active daily brief configs
    const prisma = new PrismaClient();
    const activeConfigs = await prisma.agentConfig.findMany({
      where: {
        status: 'active',
        agentType: 'daily_brief',
      },
    });

    console.log(`[Worker] Found ${activeConfigs.length} active daily brief configs`);

    for (const config of activeConfigs) {
      await scheduler.scheduleAgent({
        ...config,
        config: config.config as DailyBriefConfig,
      });
    }

    await prisma.$disconnect();

    // Handle shutdown - include agent worker
    process.on('SIGTERM', async () => {
      console.log('[Worker] Received SIGTERM, shutting down...');
      await worker.close();
      await agentWorker.close();
      await connection.quit();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('[Worker] Received SIGINT, shutting down...');
      await worker.close();
      await agentWorker.close();
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

