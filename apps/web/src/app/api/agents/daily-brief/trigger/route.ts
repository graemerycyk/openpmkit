import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import {
  executeDailyBrief,
  getLLMService,
  type DailyBriefConfig,
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
          agentType: 'daily_brief',
        },
      },
    });

    if (!agentConfig) {
      return NextResponse.json(
        { error: 'Daily Brief not configured. Please set up the agent first.' },
        { status: 400 }
      );
    }

    // Get agent config to check what data sources are enabled
    const configData = agentConfig.config as DailyBriefConfig;
    const wantsSlackData =
      configData.includeSlack &&
      (configData.includeSlackMentions ||
        (configData.slackChannels && configData.slackChannels.length > 0));

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
    type ConnectorInstall = typeof connectorInstalls[number];
    const connectorMap = new Map<string, ConnectorInstall>(
      connectorInstalls.map((c: ConnectorInstall) => [c.connectorKey, c])
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

    // Determine what data sources are actually available (configured AND connected)
    const hasSlackData = wantsSlackData && slackConnected;
    const hasGmailSource = configData.includeGmail && gmailConnected;
    // Note: Calendar is a supplementary source, not a primary data source
    // Calendar credentials are still included in the credentials map if connected

    // Check if at least one primary data source is available (Slack OR Gmail)
    const hasPrimarySource = hasSlackData || hasGmailSource;

    if (!hasPrimarySource) {
      // Provide helpful error message based on what's configured vs connected
      if (wantsSlackData && !slackConnected && configData.includeGmail && !gmailConnected) {
        return NextResponse.json(
          {
            error:
              'No primary data source available. Please connect Slack or Gmail in integrations.',
          },
          { status: 400 }
        );
      }
      if (wantsSlackData && !slackConnected) {
        return NextResponse.json(
          {
            error:
              'Slack not connected. Please connect Slack in integrations or enable Gmail.',
          },
          { status: 400 }
        );
      }
      if (configData.includeGmail && !gmailConnected) {
        return NextResponse.json(
          {
            error:
              'Gmail not connected. Please connect Gmail in integrations or enable Slack.',
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          error:
            'No data sources available. Please connect Slack or Gmail to generate a Daily Brief.',
        },
        { status: 400 }
      );
    }

    const encryptionKey = process.env.CONNECTOR_ENCRYPTION_KEY;
    if (!encryptionKey) {
      console.error('[Daily Brief Trigger] Missing CONNECTOR_ENCRYPTION_KEY');
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
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

    if (driveConnected && configData.includeGoogleDrive) {
      credentials['google-drive'] = {
        encryptedBlob: driveInstall.credentials[0].encryptedBlob,
        encryptionKey,
      };
    }

    if (jiraConnected && configData.includeJira) {
      credentials.jira = {
        encryptedBlob: jiraInstall.credentials[0].encryptedBlob,
        encryptionKey,
      };
    }

    if (confluenceConnected && configData.includeConfluence) {
      credentials.confluence = {
        encryptedBlob: confluenceInstall.credentials[0].encryptedBlob,
        encryptionKey,
      };
    }

    if (zendeskConnected && configData.includeZendesk) {
      credentials.zendesk = {
        encryptedBlob: zendeskInstall.credentials[0].encryptedBlob,
        encryptionKey,
      };
    }

    // Log which data sources are enabled in config vs which have credentials
    console.log(`[Daily Brief] Config data sources:`, {
      includeSlack: configData.includeSlack,
      includeGmail: configData.includeGmail,
      includeGoogleCalendar: configData.includeGoogleCalendar,
      includeGoogleDrive: configData.includeGoogleDrive,
      includeJira: configData.includeJira,
      includeConfluence: configData.includeConfluence,
      includeZendesk: configData.includeZendesk,
    });
    console.log(`[Daily Brief] Connector credentials available:`, {
      slack: !!credentials.slack,
      gmail: !!credentials.gmail,
      'google-calendar': !!credentials['google-calendar'],
      'google-drive': !!credentials['google-drive'],
      jira: !!credentials.jira,
      confluence: !!credentials.confluence,
      zendesk: !!credentials.zendesk,
    });

    // Create job record
    const job = await prisma.job.create({
      data: {
        tenantId: user.tenantId,
        type: 'daily_brief',
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
          agentType: 'daily_brief',
          trigger: 'manual',
          connectors: Object.keys(credentials),
        },
      },
    });

    console.log(
      `[Daily Brief] Starting job ${job.id} for user ${user.id} with connectors: ${Object.keys(credentials).join(', ')}`
    );

    // Execute agent (non-blocking for now, in production this would be queued)
    const config = agentConfig.config as DailyBriefConfig;

    // Get LLM service
    const llmService = getLLMService();

    // Track tool calls
    const toolCallIds: string[] = [];

    try {
      const result = await executeDailyBrief(
        {
          tenantId: user.tenantId,
          userId: user.id,
          jobId: job.id,
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
            console.log(`[Daily Brief ${job.id}] ${step}`);
          },
        }
      );

      // Create artifact
      await prisma.artifact.create({
        data: {
          tenantId: user.tenantId,
          jobId: job.id,
          type: 'brief',
          title: `Daily Brief - ${new Date().toLocaleDateString()}`,
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

      console.log(`[Daily Brief] Job ${job.id} completed successfully`);

      return NextResponse.json({
        success: true,
        jobId: job.id,
        stats: result.stats,
      });
    } catch (execError) {
      console.error(`[Daily Brief] Job ${job.id} failed:`, execError);

      // Update job as failed
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          error: execError instanceof Error ? execError.message : 'Unknown error',
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
          details: { error: execError instanceof Error ? execError.message : 'Unknown error' },
        },
      });

      return NextResponse.json(
        { error: 'Agent execution failed', jobId: job.id },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Daily Brief Trigger] Error:', error);
    return NextResponse.json({ error: 'Failed to trigger agent' }, { status: 500 });
  }
}
