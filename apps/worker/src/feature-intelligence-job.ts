import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import {
  executeFeatureIntelligence,
  getLLMService,
  getEmailService,
  createJobCompletionTelemetryEvent,
  type FeatureIntelligenceConfig,
  type ConnectorCredentialsMap,
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
  config: FeatureIntelligenceConfig;
  scheduledAt: string;
}

// ============================================================================
// Job Processor
// ============================================================================

export async function processFeatureIntelligenceJob(job: Job<AgentJobPayload>): Promise<void> {
  const { agentConfigId, userId, tenantId, config, scheduledAt } = job.data;

  const now = new Date();
  const scheduledTime = new Date(scheduledAt);
  const delayMinutes = Math.round((now.getTime() - scheduledTime.getTime()) / 60000);

  console.log(`[FeatureIntelligenceJob] ========================================`);
  console.log(`[FeatureIntelligenceJob] Processing scheduled job for config ${agentConfigId}`);
  console.log(`[FeatureIntelligenceJob] Job ID: ${job.id}`);
  console.log(`[FeatureIntelligenceJob] Scheduled for: ${scheduledAt}`);
  console.log(`[FeatureIntelligenceJob] Processing at: ${now.toISOString()}`);
  console.log(`[FeatureIntelligenceJob] Delay from scheduled time: ${delayMinutes} minutes`);
  console.log(`[FeatureIntelligenceJob] ========================================`);

  // Verify the agent config still exists and is active
  const agentConfig = await prisma.agentConfig.findUnique({
    where: { id: agentConfigId },
  });

  if (!agentConfig) {
    console.warn(`[FeatureIntelligenceJob] Agent config ${agentConfigId} no longer exists`);
    return;
  }

  if (agentConfig.status !== 'active') {
    console.log(`[FeatureIntelligenceJob] Agent config ${agentConfigId} is paused, skipping`);
    // Still schedule next run (in case user reactivates)
    await scheduleNextRun(agentConfig);
    return;
  }

  // Fetch all connector installs for this tenant
  const connectorInstalls = await prisma.connectorInstall.findMany({
    where: {
      tenantId,
      status: 'real',
    },
    include: {
      credentials: true,
    },
  });

  // Build a map of connected connectors
  const connectorMap = new Map(
    connectorInstalls.map((c) => [c.connectorKey, c])
  );

  // Check which connectors are connected
  const zendeskInstall = connectorMap.get('zendesk');
  const slackInstall = connectorMap.get('slack');

  const zendeskConnected = zendeskInstall && zendeskInstall.credentials[0];
  const slackConnected = slackInstall && slackInstall.credentials[0];

  // Determine available data sources
  const hasZendeskSource = config.includeZendesk && zendeskConnected;
  const hasSlackSource = config.includeSlack && slackConnected;

  // Check if at least one feedback source is available
  const hasFeedbackSource = hasZendeskSource || hasSlackSource;

  if (!hasFeedbackSource) {
    console.error(`[FeatureIntelligenceJob] No feedback source (Zendesk or Slack) connected for tenant ${tenantId}`);

    // Create failed job record
    await prisma.job.create({
      data: {
        tenantId,
        type: 'feature_intelligence',
        status: 'failed',
        triggeredBy: userId,
        config: config as object,
        error: 'No feedback source (Zendesk or Slack) connected',
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
    console.error('[FeatureIntelligenceJob] Missing CONNECTOR_ENCRYPTION_KEY');
    await scheduleNextRun(agentConfig);
    return;
  }

  // Build ConnectorCredentialsMap for the orchestrator
  const credentials: ConnectorCredentialsMap = {};

  if (zendeskConnected && config.includeZendesk) {
    credentials.zendesk = {
      encryptedBlob: zendeskInstall.credentials[0].encryptedBlob,
      encryptionKey,
    };
  }

  if (slackConnected && config.includeSlack) {
    credentials.slack = {
      encryptedBlob: slackInstall.credentials[0].encryptedBlob,
      encryptionKey,
    };
  }

  // Log which data sources are enabled in config vs which have credentials
  console.log(`[FeatureIntelligenceJob] Config data sources:`, {
    includeZendesk: config.includeZendesk,
    includeSlack: config.includeSlack,
    includeGong: config.includeGong,
    includeCommunity: config.includeCommunity,
    lookbackDays: config.lookbackDays,
  });
  console.log(`[FeatureIntelligenceJob] Connector credentials available:`, {
    zendesk: !!credentials.zendesk,
    slack: !!credentials.slack,
  });

  // Create job record
  const jobRecord = await prisma.job.create({
    data: {
      tenantId,
      type: 'feature_intelligence',
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
      details: {
        agentType: 'feature_intelligence',
        trigger: 'scheduled',
        scheduledAt,
        connectors: Object.keys(credentials),
      },
    },
  });

  console.log(
    `[FeatureIntelligenceJob] Starting job ${jobRecord.id} with connectors: ${Object.keys(credentials).join(', ')}`
  );

  // Get LLM service
  const llmService = getLLMService();

  try {
    const result = await executeFeatureIntelligence(
      {
        tenantId,
        userId,
        jobId: jobRecord.id,
        config,
        credentials,
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
          console.log(`[FeatureIntelligenceJob ${jobRecord.id}] ${step}`);
        },
      }
    );

    // Create artifact
    await prisma.artifact.create({
      data: {
        tenantId,
        jobId: jobRecord.id,
        type: 'voc_report',
        title: `Feature Intelligence Report - ${new Date().toLocaleDateString()}`,
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

    console.log(`[FeatureIntelligenceJob] Job ${jobRecord.id} completed successfully`);

    // Send email notification
    const emailService = getEmailService();
    if (emailService.isConfigured()) {
      try {
        // Fetch user email
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true },
        });

        if (user?.email) {
          const artifactTitle = `Feature Intelligence Report - ${new Date().toLocaleDateString()}`;

          // Create telemetry event for SIEM export
          const telemetryEvent = createJobCompletionTelemetryEvent({
            jobId: jobRecord.id,
            jobType: 'feature_intelligence',
            tenantId,
            userId,
            startTime: jobRecord.startedAt || new Date(),
            endTime: new Date(),
            stats: result.stats as Record<string, unknown>,
          });

          const emailResult = await emailService.sendAgentJobCompletion({
            to: user.email,
            userName: user.name || 'there',
            agentType: 'feature_intelligence',
            jobId: jobRecord.id,
            artifactTitle,
            artifactContent: result.content,
            stats: result.stats as Record<string, unknown>,
            siemEvents: [telemetryEvent],
            includeAttachments: true,
          });

          if (emailResult.success) {
            console.log(`[FeatureIntelligenceJob] Email sent to ${user.email}, messageId: ${emailResult.messageId}`);
          } else {
            console.warn(`[FeatureIntelligenceJob] Failed to send email: ${emailResult.error}`);
          }
        } else {
          console.warn(`[FeatureIntelligenceJob] User ${userId} has no email address`);
        }
      } catch (emailError) {
        // Don't fail the job if email fails
        console.error('[FeatureIntelligenceJob] Error sending email notification:', emailError);
      }
    } else {
      console.log('[FeatureIntelligenceJob] Email service not configured, skipping notification');
    }
  } catch (error) {
    console.error(`[FeatureIntelligenceJob] Job ${jobRecord.id} failed:`, error);

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
    console.warn('[FeatureIntelligenceJob] Scheduler not available for next run scheduling');
    return;
  }

  try {
    await scheduler.scheduleNextRun({
      ...agentConfig,
      config: agentConfig.config as FeatureIntelligenceConfig,
    });
  } catch (error) {
    console.error('[FeatureIntelligenceJob] Failed to schedule next run:', error);
  }
}
