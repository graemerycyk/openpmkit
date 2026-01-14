import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import {
  executeDailyBrief,
  getLLMService,
  type DailyBriefConfig,
} from '@pmkit/core';
import { getScheduler } from './agent-scheduler';

// ============================================================================
// Prisma Client
// ============================================================================

const prisma = new PrismaClient();

// ============================================================================
// Types
// ============================================================================

interface AgentJobPayload {
  agentConfigId: string;
  userId: string;
  tenantId: string;
  agentType: string;
  config: DailyBriefConfig;
  scheduledAt: string;
}

// ============================================================================
// Job Processor
// ============================================================================

export async function processDailyBriefJob(job: Job<AgentJobPayload>): Promise<void> {
  const { agentConfigId, userId, tenantId, config, scheduledAt } = job.data;

  console.log(`[DailyBriefJob] Processing scheduled job for config ${agentConfigId}`);
  console.log(`[DailyBriefJob] Scheduled at: ${scheduledAt}, Processing at: ${new Date().toISOString()}`);

  // Verify the agent config still exists and is active
  const agentConfig = await prisma.agentConfig.findUnique({
    where: { id: agentConfigId },
  });

  if (!agentConfig) {
    console.warn(`[DailyBriefJob] Agent config ${agentConfigId} no longer exists`);
    return;
  }

  if (agentConfig.status !== 'active') {
    console.log(`[DailyBriefJob] Agent config ${agentConfigId} is paused, skipping`);
    // Still schedule next run (in case user reactivates)
    await scheduleNextRun(agentConfig);
    return;
  }

  // Get Slack credentials
  const slackInstall = await prisma.connectorInstall.findUnique({
    where: {
      tenantId_connectorKey: {
        tenantId,
        connectorKey: 'slack',
      },
    },
    include: {
      credentials: true,
    },
  });

  if (!slackInstall || slackInstall.status !== 'real' || !slackInstall.credentials[0]) {
    console.error(`[DailyBriefJob] Slack not connected for tenant ${tenantId}`);

    // Create failed job record
    await prisma.job.create({
      data: {
        tenantId,
        type: 'daily_brief',
        status: 'failed',
        triggeredBy: userId,
        config: config as object,
        error: 'Slack not connected',
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    // Still schedule next run
    await scheduleNextRun(agentConfig);
    return;
  }

  const encryptionKey = process.env.CONNECTOR_ENCRYPTION_KEY;
  if (!encryptionKey) {
    console.error('[DailyBriefJob] Missing CONNECTOR_ENCRYPTION_KEY');
    await scheduleNextRun(agentConfig);
    return;
  }

  // Create job record
  const jobRecord = await prisma.job.create({
    data: {
      tenantId,
      type: 'daily_brief',
      status: 'running',
      triggeredBy: userId,
      config: config as object,
      startedAt: new Date(),
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      tenantId,
      userId,
      action: 'job_started',
      resourceType: 'job',
      resourceId: jobRecord.id,
      details: { agentType: 'daily_brief', trigger: 'scheduled', scheduledAt },
    },
  });

  // Get LLM service
  const llmService = getLLMService();

  try {
    const result = await executeDailyBrief(
      {
        tenantId,
        userId,
        jobId: jobRecord.id,
        config,
        slackCredentials: {
          encryptedBlob: slackInstall.credentials[0].encryptedBlob,
          encryptionKey,
        },
      },
      {
        complete: async (params) => {
          const response = await llmService.complete(params.tenantId, {
            messages: params.messages,
            maxTokens: params.maxTokens,
            temperature: params.temperature,
          });
          return {
            content: response.content,
            model: response.model,
            usage: {
              promptTokens: response.usage?.inputTokens || 0,
              completionTokens: response.usage?.outputTokens || 0,
            },
            latencyMs: response.latencyMs,
          };
        },
      },
      {
        onProgress: (step) => {
          console.log(`[DailyBriefJob ${jobRecord.id}] ${step}`);
        },
      }
    );

    // Create artifact
    await prisma.artifact.create({
      data: {
        tenantId,
        jobId: jobRecord.id,
        type: 'brief',
        title: `Daily Brief - ${new Date().toLocaleDateString()}`,
        format: 'markdown',
        content: result.content,
        metadata: {
          stats: result.stats,
          scheduledAt,
        },
      },
    });

    // Create source records
    for (const source of result.sources) {
      await prisma.source.upsert({
        where: {
          tenantId_type_externalId: {
            tenantId: source.tenantId,
            type: source.type,
            externalId: source.externalId,
          },
        },
        create: {
          tenantId: source.tenantId,
          type: source.type,
          externalId: source.externalId,
          title: source.title,
          url: source.url,
          content: source.content,
          metadata: source.metadata as Record<string, string | number | boolean>,
          fetchedAt: source.fetchedAt,
        },
        update: {
          content: source.content,
          metadata: source.metadata as Record<string, string | number | boolean>,
          fetchedAt: source.fetchedAt,
        },
      });
    }

    // Update job as completed
    await prisma.job.update({
      where: { id: jobRecord.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        result: { stats: result.stats },
      },
    });

    // Update agent config lastRunAt
    await prisma.agentConfig.update({
      where: { id: agentConfigId },
      data: { lastRunAt: new Date() },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'job_completed',
        resourceType: 'job',
        resourceId: jobRecord.id,
        details: { stats: result.stats },
      },
    });

    console.log(`[DailyBriefJob] Job ${jobRecord.id} completed successfully`);
  } catch (error) {
    console.error(`[DailyBriefJob] Job ${jobRecord.id} failed:`, error);

    // Update job as failed
    await prisma.job.update({
      where: { id: jobRecord.id },
      data: {
        status: 'failed',
        completedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'job_failed',
        resourceType: 'job',
        resourceId: jobRecord.id,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
    });

    throw error; // Re-throw to trigger BullMQ retry
  } finally {
    // Always schedule next run
    await scheduleNextRun(agentConfig);
  }
}

/**
 * Schedule the next run for an agent
 */
async function scheduleNextRun(agentConfig: {
  id: string;
  userId: string;
  tenantId: string;
  agentType: string;
  status: string;
  config: unknown;
  nextRunAt: Date | null;
  lastRunAt: Date | null;
}): Promise<void> {
  const scheduler = getScheduler();
  if (!scheduler) {
    console.warn('[DailyBriefJob] Scheduler not available for next run scheduling');
    return;
  }

  try {
    await scheduler.scheduleNextRun({
      ...agentConfig,
      config: agentConfig.config as DailyBriefConfig,
    });
  } catch (error) {
    console.error('[DailyBriefJob] Failed to schedule next run:', error);
  }
}
