import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import {
  executeDailyBrief,
  getLLMService,
  getEmailService,
  createJobCompletionTelemetryEvent,
  type DailyBriefConfig,
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
  config: DailyBriefConfig;
  scheduledAt: string;
}

// ============================================================================
// Job Processor
// ============================================================================

export async function processDailyBriefJob(job: Job<AgentJobPayload>): Promise<void> {
  const { agentConfigId, userId, tenantId, config, scheduledAt } = job.data;

  const now = new Date();
  const scheduledTime = new Date(scheduledAt);
  const delayMinutes = Math.round((now.getTime() - scheduledTime.getTime()) / 60000);

  console.log(`[DailyBriefJob] ========================================`);
  console.log(`[DailyBriefJob] Processing scheduled job for config ${agentConfigId}`);
  console.log(`[DailyBriefJob] Job ID: ${job.id}`);
  console.log(`[DailyBriefJob] Scheduled for: ${scheduledAt}`);
  console.log(`[DailyBriefJob] Processing at: ${now.toISOString()}`);
  console.log(`[DailyBriefJob] Delay from scheduled time: ${delayMinutes} minutes`);
  console.log(`[DailyBriefJob] ========================================`);

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
  const slackInstall = connectorMap.get('slack');
  const gmailInstall = connectorMap.get('gmail');
  const calendarInstall = connectorMap.get('google-calendar');
  const driveInstall = connectorMap.get('google-drive');
  const jiraInstall = connectorMap.get('jira');
  const confluenceInstall = connectorMap.get('confluence');
  const zendeskInstall = connectorMap.get('zendesk');

  const slackConnected = slackInstall && slackInstall.credentials[0];
  const gmailConnected = gmailInstall && gmailInstall.credentials[0];
  const calendarConnected = calendarInstall && calendarInstall.credentials[0];
  const driveConnected = driveInstall && driveInstall.credentials[0];
  const jiraConnected = jiraInstall && jiraInstall.credentials[0];
  const confluenceConnected = confluenceInstall && confluenceInstall.credentials[0];
  const zendeskConnected = zendeskInstall && zendeskInstall.credentials[0];

  // Determine available data sources
  const wantsSlackData =
    config.includeSlack &&
    (config.includeSlackMentions ||
      (config.slackChannels && config.slackChannels.length > 0));
  const hasSlackData = wantsSlackData && slackConnected;
  const hasGmailSource = config.includeGmail && gmailConnected;

  // Check if at least one primary data source is available
  const hasPrimarySource = hasSlackData || hasGmailSource;

  if (!hasPrimarySource) {
    console.error(`[DailyBriefJob] No primary data source (Slack or Gmail) connected for tenant ${tenantId}`);

    // Create failed job record
    await prisma.job.create({
      data: {
        tenantId,
        type: 'daily_brief',
        status: 'failed',
        triggeredBy: userId,
        config: config as object,
        error: 'No primary data source (Slack or Gmail) connected',
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

  // Build ConnectorCredentialsMap for the orchestrator
  const credentials: ConnectorCredentialsMap = {};

  if (slackConnected) {
    credentials.slack = {
      encryptedBlob: slackInstall.credentials[0].encryptedBlob,
      encryptionKey,
    };
  }

  if (gmailConnected) {
    credentials.gmail = {
      encryptedBlob: gmailInstall.credentials[0].encryptedBlob,
      encryptionKey,
    };
  }

  if (calendarConnected) {
    credentials['google-calendar'] = {
      encryptedBlob: calendarInstall.credentials[0].encryptedBlob,
      encryptionKey,
    };
  }

  if (driveConnected && config.includeGoogleDrive) {
    credentials['google-drive'] = {
      encryptedBlob: driveInstall.credentials[0].encryptedBlob,
      encryptionKey,
    };
  }

  if (jiraConnected && config.includeJira) {
    credentials.jira = {
      encryptedBlob: jiraInstall.credentials[0].encryptedBlob,
      encryptionKey,
    };
  }

  if (confluenceConnected && config.includeConfluence) {
    credentials.confluence = {
      encryptedBlob: confluenceInstall.credentials[0].encryptedBlob,
      encryptionKey,
    };
  }

  if (zendeskConnected && config.includeZendesk) {
    credentials.zendesk = {
      encryptedBlob: zendeskInstall.credentials[0].encryptedBlob,
      encryptionKey,
    };
  }

  // Log which data sources are enabled in config vs which have credentials
  console.log(`[DailyBriefJob] Config data sources:`, {
    includeSlack: config.includeSlack,
    includeGmail: config.includeGmail,
    includeGoogleCalendar: config.includeGoogleCalendar,
    includeGoogleDrive: config.includeGoogleDrive,
    includeJira: config.includeJira,
    includeConfluence: config.includeConfluence,
    includeZendesk: config.includeZendesk,
  });
  console.log(`[DailyBriefJob] Connector credentials available:`, {
    slack: !!credentials.slack,
    gmail: !!credentials.gmail,
    'google-calendar': !!credentials['google-calendar'],
    'google-drive': !!credentials['google-drive'],
    jira: !!credentials.jira,
    confluence: !!credentials.confluence,
    zendesk: !!credentials.zendesk,
  });

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
      details: {
        agentType: 'daily_brief',
        trigger: 'scheduled',
        scheduledAt,
        connectors: Object.keys(credentials),
      },
    },
  });

  console.log(
    `[DailyBriefJob] Starting job ${jobRecord.id} with connectors: ${Object.keys(credentials).join(', ')}`
  );

  // Get LLM service
  const llmService = getLLMService();

  try {
    const result = await executeDailyBrief(
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
          const artifactTitle = `Daily Brief - ${new Date().toLocaleDateString()}`;

          // Create telemetry event for SIEM export
          const telemetryEvent = createJobCompletionTelemetryEvent({
            jobId: jobRecord.id,
            jobType: 'daily_brief',
            tenantId,
            userId,
            startTime: jobRecord.startedAt || new Date(),
            endTime: new Date(),
            stats: result.stats as Record<string, unknown>,
          });

          const emailResult = await emailService.sendAgentJobCompletion({
            to: user.email,
            userName: user.name || 'there',
            agentType: 'daily_brief',
            jobId: jobRecord.id,
            artifactTitle,
            artifactContent: result.content,
            stats: result.stats as Record<string, unknown>,
            siemEvents: [telemetryEvent],
            includeAttachments: true,
          });

          if (emailResult.success) {
            console.log(`[DailyBriefJob] Email sent to ${user.email}, messageId: ${emailResult.messageId}`);
          } else {
            console.warn(`[DailyBriefJob] Failed to send email: ${emailResult.error}`);
          }
        } else {
          console.warn(`[DailyBriefJob] User ${userId} has no email address`);
        }
      } catch (emailError) {
        // Don't fail the job if email fails
        console.error('[DailyBriefJob] Error sending email notification:', emailError);
      }
    } else {
      console.log('[DailyBriefJob] Email service not configured, skipping notification');
    }
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
