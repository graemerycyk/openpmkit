import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import {
  executeFeatureIntelligence,
  getLLMService,
  type FeatureIntelligenceConfig,
  type ConnectorCredentialsMap,
} from '@pmkit/core';

export async function POST() {
  try {
    console.log('[Feature Intelligence Trigger] Starting...');

    const session = await getServerSession();
    if (!session?.user?.email) {
      console.log('[Feature Intelligence Trigger] No session/email');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Feature Intelligence Trigger] Session found for:', session.user.email);

    let user;
    try {
      user = await prisma.user.findFirst({
        where: { email: session.user.email },
      });
    } catch (dbError) {
      console.error('[Feature Intelligence Trigger] Database error finding user:', dbError);
      return NextResponse.json(
        { error: `Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('[Feature Intelligence Trigger] User found:', user.id, 'tenant:', user.tenantId);

    // Get agent config
    let agentConfig;
    try {
      agentConfig = await prisma.agentConfig.findUnique({
        where: {
          userId_agentType: {
            userId: user.id,
            agentType: 'feature_intelligence',
          },
        },
      });
    } catch (dbError) {
      console.error('[Feature Intelligence Trigger] Database error finding config:', dbError);
      return NextResponse.json(
        { error: `Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    if (!agentConfig) {
      return NextResponse.json(
        { error: 'Feature Intelligence not configured. Please set up the agent first.' },
        { status: 400 }
      );
    }

    // Transform UI config to orchestrator config format
    // UI saves: timeframeDays, enabledSources (e.g., { zendesk: true, slack: false })
    // Orchestrator expects: lookbackDays, includeZendesk, includeSlack, etc.
    const savedConfig = agentConfig.config as Record<string, unknown>;
    const enabledSources = (savedConfig.enabledSources || {}) as Record<string, boolean>;

    const configData: FeatureIntelligenceConfig = {
      // Map timeframeDays (UI field name) to lookbackDays (orchestrator field name)
      lookbackDays: typeof savedConfig.timeframeDays === 'number'
        ? savedConfig.timeframeDays
        : (typeof savedConfig.lookbackDays === 'number' ? savedConfig.lookbackDays : 7),
      // Map enabledSources to individual include* flags for the orchestrator
      includeZendesk: enabledSources.zendesk === true || savedConfig.includeZendesk === true,
      includeSlack: enabledSources.slack === true || savedConfig.includeSlack === true,
      includeGong: enabledSources.gong === true || savedConfig.includeGong === true,
      includeCommunity: enabledSources.community === true || savedConfig.includeCommunity === true,
      // Schedule fields (use defaults if not set - these are for the scheduler, not the orchestrator)
      scheduleDay: typeof savedConfig.scheduleDay === 'string' ? savedConfig.scheduleDay : 'monday',
      scheduleTimeLocal: typeof savedConfig.scheduleTimeLocal === 'string' ? savedConfig.scheduleTimeLocal : '09:00',
      timezone: typeof savedConfig.timezone === 'string' ? savedConfig.timezone : 'America/New_York',
    } as FeatureIntelligenceConfig;

    // Fetch all connector installs for this tenant
    let connectorInstalls;
    try {
      connectorInstalls = await prisma.connectorInstall.findMany({
        where: {
          tenantId: user.tenantId,
          status: 'real',
        },
        include: {
          credentials: true,
        },
      });
      console.log('[Feature Intelligence Trigger] Found', connectorInstalls.length, 'connector installs');
    } catch (dbError) {
      console.error('[Feature Intelligence Trigger] Database error finding connectors:', dbError);
      return NextResponse.json(
        { error: `Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Build a map of connected connectors
    type ConnectorInstall = typeof connectorInstalls[number];
    const connectorMap = new Map<string, ConnectorInstall>(
      connectorInstalls.map((c: ConnectorInstall) => [c.connectorKey, c])
    );

    // Check which connectors are connected
    const zendeskInstall = connectorMap.get('zendesk');
    const slackInstall = connectorMap.get('slack');

    const zendeskConnected = zendeskInstall && zendeskInstall.credentials[0];
    const slackConnected = slackInstall && slackInstall.credentials[0];

    // At least one feedback source is required
    const hasZendeskSource = configData.includeZendesk && zendeskConnected;
    const hasSlackSource = configData.includeSlack && slackConnected;

    if (!hasZendeskSource && !hasSlackSource) {
      return NextResponse.json(
        {
          error:
            'No feedback source available. Please connect Zendesk or enable Slack feedback channels.',
        },
        { status: 400 }
      );
    }

    const encryptionKey = process.env.CONNECTOR_ENCRYPTION_KEY;
    if (!encryptionKey) {
      console.error('[Feature Intelligence Trigger] Missing CONNECTOR_ENCRYPTION_KEY');
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    // Build ConnectorCredentialsMap for the orchestrator
    const credentials: ConnectorCredentialsMap = {};

    // Zendesk - primary feedback source
    if (configData.includeZendesk && zendeskConnected) {
      credentials.zendesk = {
        encryptedBlob: zendeskInstall.credentials[0].encryptedBlob,
        encryptionKey,
      };
    }

    // Slack - for customer feedback channels
    if (configData.includeSlack && slackConnected) {
      credentials.slack = {
        encryptedBlob: slackInstall.credentials[0].encryptedBlob,
        encryptionKey,
      };
    }

    // Note: Gong and Community are not included yet as their fetchers don't exist

    // Log transformed config values including timing settings
    console.log(`[Feature Intelligence] Config timing (transformed from UI):`, {
      lookbackDays: configData.lookbackDays,
      originalTimeframeDays: savedConfig.timeframeDays,
    });
    console.log(`[Feature Intelligence] Config data sources (from enabledSources):`, {
      enabledSources,
      includeZendesk: configData.includeZendesk,
      includeSlack: configData.includeSlack,
      includeGong: configData.includeGong,
      includeCommunity: configData.includeCommunity,
    });
    console.log(`[Feature Intelligence] Connector credentials available:`, {
      zendesk: !!credentials.zendesk,
      slack: !!credentials.slack,
    });

    // Create job record
    const job = await prisma.job.create({
      data: {
        tenantId: user.tenantId,
        type: 'feature_intelligence',
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
          agentType: 'feature_intelligence',
          trigger: 'manual',
          connectors: Object.keys(credentials),
          lookbackDays: configData.lookbackDays,
        },
      },
    });

    console.log(
      `[Feature Intelligence] Starting job ${job.id} for user ${user.id} with connectors: ${Object.keys(credentials).join(', ')}`
    );

    // Get LLM service
    const llmService = getLLMService();

    // Track tool calls
    const toolCallIds: string[] = [];

    try {
      const result = await executeFeatureIntelligence(
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
            console.log(`[Feature Intelligence ${job.id}] ${step}`);
          },
        }
      );

      // Create artifact
      await prisma.artifact.create({
        data: {
          tenantId: user.tenantId,
          jobId: job.id,
          type: 'voc_report',
          title: `Voice of Customer Report - ${new Date().toLocaleDateString()}`,
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

      console.log(`[Feature Intelligence] Job ${job.id} completed successfully`);

      return NextResponse.json({
        success: true,
        jobId: job.id,
        stats: result.stats,
      });
    } catch (execError) {
      console.error(`[Feature Intelligence] Job ${job.id} failed:`, execError);

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
    console.error('[Feature Intelligence Trigger] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to trigger agent: ${errorMessage}` },
      { status: 500 }
    );
  }
}
