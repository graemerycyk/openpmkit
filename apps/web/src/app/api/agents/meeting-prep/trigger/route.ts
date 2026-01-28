import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import {
  executeMeetingPrep,
  getLLMService,
  type MeetingPrepConfig,
  type ConnectorCredentialsMap,
} from '@pmkit/core';

export async function POST() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get agent config
    const agentConfig = await prisma.agentConfig.findUnique({
      where: {
        userId_agentType: {
          userId: user.id,
          agentType: 'meeting_prep',
        },
      },
    });

    if (!agentConfig) {
      return NextResponse.json(
        { error: 'Meeting Prep not configured. Please set up the agent first.' },
        { status: 400 }
      );
    }

    // Transform UI config to orchestrator config format
    // UI saves: prepTimingMinutes, lookbackDays, enabledSources (e.g., { slack: true, jira: false })
    // Orchestrator expects: leadTimeMinutes, lookbackDays, includeSlack, includeJira, etc.
    const savedConfig = agentConfig.config as Record<string, unknown>;
    const enabledSources = (savedConfig.enabledSources || {}) as Record<string, boolean>;

    const configData: MeetingPrepConfig = {
      ...savedConfig,
      // Map prepTimingMinutes (UI field name) to leadTimeMinutes (orchestrator field name)
      leadTimeMinutes: typeof savedConfig.prepTimingMinutes === 'number'
        ? savedConfig.prepTimingMinutes
        : (typeof savedConfig.leadTimeMinutes === 'number' ? savedConfig.leadTimeMinutes : 240),
      // Ensure lookbackDays has a default
      lookbackDays: typeof savedConfig.lookbackDays === 'number' ? savedConfig.lookbackDays : 30,
      // Map enabledSources to individual include* flags for the orchestrator
      // The UI saves enabled state in enabledSources map, but orchestrator expects includeSlack etc.
      includeSlack: enabledSources.slack === true,
      includeJira: enabledSources.jira === true,
      includeGong: enabledSources.gong === true,
      includeConfluence: enabledSources.confluence === true,
      filterDomains: Array.isArray(savedConfig.filterDomains) ? savedConfig.filterDomains as string[] : [],
      includeAllExternalMeetings: savedConfig.includeAllExternalMeetings !== false,
    } as MeetingPrepConfig;

    // Fetch all connector installs for this tenant
    const connectorInstalls = await prisma.connectorInstall.findMany({
      where: {
        tenantId: user.tenantId,
        status: 'real',
      },
      include: {
        credentials: true,
      },
    });

    // Build a map of connected connectors
    const connectorMap = new Map(
      connectorInstalls.map((c: typeof connectorInstalls[number]) => [c.connectorKey, c])
    );

    // Check which connectors are connected
    const calendarInstall = connectorMap.get('google-calendar');
    const slackInstall = connectorMap.get('slack');
    const gmailInstall = connectorMap.get('gmail');
    const jiraInstall = connectorMap.get('jira');
    const confluenceInstall = connectorMap.get('confluence');

    const calendarConnected = calendarInstall && calendarInstall.credentials[0];
    const slackConnected = slackInstall && slackInstall.credentials[0];
    const gmailConnected = gmailInstall && gmailInstall.credentials[0];
    const jiraConnected = jiraInstall && jiraInstall.credentials[0];
    const confluenceConnected = confluenceInstall && confluenceInstall.credentials[0];

    // Calendar is required for Meeting Prep
    if (!calendarConnected) {
      return NextResponse.json(
        { error: 'Google Calendar not connected. Please connect Google Calendar to run Meeting Prep.' },
        { status: 400 }
      );
    }

    const encryptionKey = process.env.CONNECTOR_ENCRYPTION_KEY;
    if (!encryptionKey) {
      console.error('[Meeting Prep Trigger] Missing CONNECTOR_ENCRYPTION_KEY');
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    // Build ConnectorCredentialsMap for the orchestrator
    const credentials: ConnectorCredentialsMap = {};

    // Calendar is required
    credentials['google-calendar'] = {
      encryptedBlob: calendarInstall.credentials[0].encryptedBlob,
      encryptionKey,
    };

    // Gmail - always include if connected (for attendee email history)
    if (gmailConnected) {
      credentials.gmail = {
        encryptedBlob: gmailInstall.credentials[0].encryptedBlob,
        encryptionKey,
      };
    }

    // Slack - include if configured and connected
    if (configData.includeSlack && slackConnected) {
      credentials.slack = {
        encryptedBlob: slackInstall.credentials[0].encryptedBlob,
        encryptionKey,
      };
    }

    // Jira - include if configured and connected
    if (configData.includeJira && jiraConnected) {
      credentials.jira = {
        encryptedBlob: jiraInstall.credentials[0].encryptedBlob,
        encryptionKey,
      };
    }

    // Confluence - include if configured and connected
    if (configData.includeConfluence && confluenceConnected) {
      credentials.confluence = {
        encryptedBlob: confluenceInstall.credentials[0].encryptedBlob,
        encryptionKey,
      };
    }

    // Note: Gong is not included yet as GongFetcher doesn't exist

    // Log transformed config values including timing settings
    console.log(`[Meeting Prep] Config timing (transformed from UI):`, {
      leadTimeMinutes: configData.leadTimeMinutes,
      lookbackDays: configData.lookbackDays,
      originalPrepTimingMinutes: savedConfig.prepTimingMinutes,
      originalLookbackDays: savedConfig.lookbackDays,
    });
    console.log(`[Meeting Prep] Config data sources (from enabledSources):`, {
      enabledSources,
      includeSlack: configData.includeSlack,
      includeJira: configData.includeJira,
      includeConfluence: configData.includeConfluence,
      includeGong: configData.includeGong,
    });
    console.log(`[Meeting Prep] Connector credentials available:`, {
      'google-calendar': !!credentials['google-calendar'],
      gmail: !!credentials.gmail,
      slack: !!credentials.slack,
      jira: !!credentials.jira,
      confluence: !!credentials.confluence,
    });

    // Create job record
    const job = await prisma.job.create({
      data: {
        tenantId: user.tenantId,
        type: 'meeting_prep',
        status: 'running',
        triggeredBy: user.id,
        config: agentConfig.config as object,
        startedAt: new Date(),
      },
    });

    // Create audit log for job start
    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.id,
        action: 'job_started',
        resourceType: 'job',
        resourceId: job.id,
        details: {
          agentType: 'meeting_prep',
          trigger: 'manual',
          connectors: Object.keys(credentials),
        },
      },
    });

    console.log(
      `[Meeting Prep] Starting job ${job.id} for user ${user.id} with connectors: ${Object.keys(credentials).join(', ')}`
    );

    // Get LLM service
    const llmService = getLLMService();

    // Track tool calls
    const toolCallIds: string[] = [];

    try {
      const result = await executeMeetingPrep(
        {
          tenantId: user.tenantId,
          userId: user.id,
          jobId: job.id,
          config: configData,
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
          onToolCall: async (toolName, input) => {
            const toolCall = await prisma.toolCall.create({
              data: {
                jobId: job.id,
                tenantId: user.tenantId,
                toolName,
                serverName: toolName.split('.')[0] || 'unknown',
                input: input as object,
                status: 'pending',
              },
            });
            toolCallIds.push(toolCall.id);
          },
          onToolComplete: async (toolName, durationMs, output) => {
            const lastToolCallId = toolCallIds[toolCallIds.length - 1];
            if (lastToolCallId) {
              await prisma.toolCall.update({
                where: { id: lastToolCallId },
                data: {
                  status: 'success',
                  durationMs,
                  output: (output as object) || {},
                },
              });
            }
          },
          onProgress: (step) => {
            console.log(`[Meeting Prep ${job.id}] ${step}`);
          },
        }
      );

      // Create artifact
      await prisma.artifact.create({
        data: {
          tenantId: user.tenantId,
          jobId: job.id,
          type: 'meeting_pack',
          title: result.stats.meetingTitle
            ? `Meeting Prep - ${result.stats.meetingTitle}`
            : `Meeting Prep - ${new Date().toLocaleDateString()}`,
          format: 'markdown',
          content: result.content,
          metadata: {
            stats: result.stats,
          },
        },
      });

      // Create source records for citations
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
        where: { id: job.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          result: { stats: result.stats },
        },
      });

      // Update agent config lastRunAt
      await prisma.agentConfig.update({
        where: { id: agentConfig.id },
        data: { lastRunAt: new Date() },
      });

      // Create audit log for job completion
      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          action: 'job_completed',
          resourceType: 'job',
          resourceId: job.id,
          details: { stats: result.stats },
        },
      });

      console.log(`[Meeting Prep] Job ${job.id} completed successfully`);

      return NextResponse.json({
        success: true,
        jobId: job.id,
        stats: result.stats,
      });
    } catch (execError) {
      const errorMessage = execError instanceof Error ? execError.message : 'Unknown error';
      console.error(`[Meeting Prep] Job ${job.id} failed:`, execError);

      // Update job as failed
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          error: errorMessage,
        },
      });

      // Create audit log for job failure
      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          action: 'job_failed',
          resourceType: 'job',
          resourceId: job.id,
          details: { error: errorMessage },
        },
      });

      return NextResponse.json(
        { error: `Agent execution failed: ${errorMessage}`, jobId: job.id },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Meeting Prep Trigger] Error:', error);
    return NextResponse.json({ error: 'Failed to trigger agent' }, { status: 500 });
  }
}
