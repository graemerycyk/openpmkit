import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import {
  executeMeetingPrep,
  getLLMService,
  getEmailService,
  createJobCompletionTelemetryEvent,
  type MeetingPrepConfig,
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
  config: MeetingPrepConfig;
  scheduledAt: string;
}

// ============================================================================
// Job Processor
// ============================================================================

export async function processMeetingPrepJob(job: Job<AgentJobPayload>): Promise<void> {
  const { agentConfigId, userId, tenantId, config, scheduledAt } = job.data;

  const now = new Date();
  const scheduledTime = new Date(scheduledAt);
  const delayMinutes = Math.round((now.getTime() - scheduledTime.getTime()) / 60000);

  console.log(`[MeetingPrepJob] ========================================`);
  console.log(`[MeetingPrepJob] Processing calendar check for config ${agentConfigId}`);
  console.log(`[MeetingPrepJob] Job ID: ${job.id}`);
  console.log(`[MeetingPrepJob] Scheduled for: ${scheduledAt}`);
  console.log(`[MeetingPrepJob] Processing at: ${now.toISOString()}`);
  console.log(`[MeetingPrepJob] Delay from scheduled time: ${delayMinutes} minutes`);
  console.log(`[MeetingPrepJob] ========================================`);

  // Verify the agent config still exists and is active
  const agentConfig = await prisma.agentConfig.findUnique({
    where: { id: agentConfigId },
  });

  if (!agentConfig) {
    console.warn(`[MeetingPrepJob] Agent config ${agentConfigId} no longer exists`);
    return;
  }

  if (agentConfig.status !== 'active') {
    console.log(`[MeetingPrepJob] Agent config ${agentConfigId} is paused, skipping`);
    // Still schedule next check
    await scheduleNextCheck(agentConfig);
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

  // Check if Google Calendar is connected (required for Meeting Prep)
  const calendarInstall = connectorMap.get('google-calendar');
  const calendarConnected = calendarInstall && calendarInstall.credentials[0];

  if (!calendarConnected) {
    console.log(`[MeetingPrepJob] Google Calendar not connected for tenant ${tenantId}, skipping`);
    // Still schedule next check
    await scheduleNextCheck(agentConfig);
    return;
  }

  const encryptionKey = process.env.CONNECTOR_ENCRYPTION_KEY;
  if (!encryptionKey) {
    console.error('[MeetingPrepJob] Missing CONNECTOR_ENCRYPTION_KEY');
    await scheduleNextCheck(agentConfig);
    return;
  }

  // Build ConnectorCredentialsMap for the orchestrator
  const credentials: ConnectorCredentialsMap = {};

  // Google Calendar (required)
  credentials['google-calendar'] = {
    encryptedBlob: calendarInstall.credentials[0].encryptedBlob,
    encryptionKey,
  };

  // Optional connectors
  const slackInstall = connectorMap.get('slack');
  if (slackInstall && slackInstall.credentials[0] && config.includeSlack) {
    credentials.slack = {
      encryptedBlob: slackInstall.credentials[0].encryptedBlob,
      encryptionKey,
    };
  }

  const gmailInstall = connectorMap.get('gmail');
  if (gmailInstall && gmailInstall.credentials[0]) {
    credentials.gmail = {
      encryptedBlob: gmailInstall.credentials[0].encryptedBlob,
      encryptionKey,
    };
  }

  const jiraInstall = connectorMap.get('jira');
  if (jiraInstall && jiraInstall.credentials[0] && config.includeJira) {
    credentials.jira = {
      encryptedBlob: jiraInstall.credentials[0].encryptedBlob,
      encryptionKey,
    };
  }

  const confluenceInstall = connectorMap.get('confluence');
  if (confluenceInstall && confluenceInstall.credentials[0] && config.includeConfluence) {
    credentials.confluence = {
      encryptedBlob: confluenceInstall.credentials[0].encryptedBlob,
      encryptionKey,
    };
  }

  // Log which data sources are enabled
  console.log(`[MeetingPrepJob] Config data sources:`, {
    includeSlack: config.includeSlack,
    includeJira: config.includeJira,
    includeConfluence: config.includeConfluence,
    includeGong: config.includeGong,
    leadTimeMinutes: config.leadTimeMinutes,
    lookbackDays: config.lookbackDays,
  });
  console.log(`[MeetingPrepJob] Connector credentials available:`, {
    'google-calendar': !!credentials['google-calendar'],
    gmail: !!credentials.gmail,
    slack: !!credentials.slack,
    jira: !!credentials.jira,
    confluence: !!credentials.confluence,
  });

  // Create job record
  const jobRecord = await prisma.job.create({
    data: {
      tenantId,
      type: 'meeting_prep',
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
        agentType: 'meeting_prep',
        trigger: 'calendar',
        scheduledAt,
        connectors: Object.keys(credentials),
      },
    },
  });

  console.log(
    `[MeetingPrepJob] Starting job ${jobRecord.id} with connectors: ${Object.keys(credentials).join(', ')}`
  );

  // Get LLM service
  const llmService = getLLMService();

  try {
    const result = await executeMeetingPrep(
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
          console.log(`[MeetingPrepJob ${jobRecord.id}] ${step}`);
        },
      }
    );

    // Only create artifact if meetings were found
    if (result.stats.meetingsFound > 0) {
      await prisma.artifact.create({
        data: {
          tenantId,
          jobId: jobRecord.id,
          type: 'meeting_pack',
          title: `Meeting Prep - ${result.stats.meetingTitle} - ${new Date().toLocaleDateString()}`,
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

      console.log(`[MeetingPrepJob] Generated prep for ${result.stats.meetingsFound} meetings`);
    } else {
      console.log(`[MeetingPrepJob] No meetings found within lead time window, skipping artifact creation`);
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

    console.log(`[MeetingPrepJob] Job ${jobRecord.id} completed successfully`);

    // Send email notification (only if meetings were found)
    if (result.stats.meetingsFound > 0) {
      const emailService = getEmailService();
      if (emailService.isConfigured()) {
        try {
          // Fetch user email
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
          });

          if (user?.email) {
            const artifactTitle = `Meeting Prep - ${result.stats.meetingTitle || 'Upcoming Meeting'} - ${new Date().toLocaleDateString()}`;

            // Create telemetry event for SIEM export
            const telemetryEvent = createJobCompletionTelemetryEvent({
              jobId: jobRecord.id,
              jobType: 'meeting_prep',
              tenantId,
              userId,
              startTime: jobRecord.startedAt || new Date(),
              endTime: new Date(),
              stats: result.stats as Record<string, unknown>,
            });

            const emailResult = await emailService.sendAgentJobCompletion({
              to: user.email,
              userName: user.name || 'there',
              agentType: 'meeting_prep',
              jobId: jobRecord.id,
              artifactTitle,
              artifactContent: result.content,
              stats: result.stats as Record<string, unknown>,
              siemEvents: [telemetryEvent],
              includeAttachments: true,
            });

            if (emailResult.success) {
              console.log(`[MeetingPrepJob] Email sent to ${user.email}, messageId: ${emailResult.messageId}`);
            } else {
              console.warn(`[MeetingPrepJob] Failed to send email: ${emailResult.error}`);
            }
          } else {
            console.warn(`[MeetingPrepJob] User ${userId} has no email address`);
          }
        } catch (emailError) {
          // Don't fail the job if email fails
          console.error('[MeetingPrepJob] Error sending email notification:', emailError);
        }
      } else {
        console.log('[MeetingPrepJob] Email service not configured, skipping notification');
      }
    }
  } catch (error) {
    console.error(`[MeetingPrepJob] Job ${jobRecord.id} failed:`, error);

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
    // Always schedule next check
    await scheduleNextCheck(agentConfig);
  }
}

/**
 * Schedule the next calendar check for Meeting Prep
 */
async function scheduleNextCheck(agentConfig: {
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
    console.warn('[MeetingPrepJob] Scheduler not available for next check scheduling');
    return;
  }

  try {
    await scheduler.scheduleNextRun({
      ...agentConfig,
      config: agentConfig.config as MeetingPrepConfig,
    });
  } catch (error) {
    console.error('[MeetingPrepJob] Failed to schedule next check:', error);
  }
}
