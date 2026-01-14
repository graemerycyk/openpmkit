import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { executeDailyBrief, getLLMService, type DailyBriefConfig } from '@pmkit/core';

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

    // Get Slack credentials
    const slackInstall = await prisma.connectorInstall.findUnique({
      where: {
        tenantId_connectorKey: {
          tenantId: user.tenantId,
          connectorKey: 'slack',
        },
      },
      include: {
        credentials: true,
      },
    });

    if (!slackInstall || slackInstall.status !== 'real' || !slackInstall.credentials[0]) {
      return NextResponse.json(
        { error: 'Slack not connected. Please connect Slack in integrations.' },
        { status: 400 }
      );
    }

    const encryptionKey = process.env.CONNECTOR_ENCRYPTION_KEY;
    if (!encryptionKey) {
      console.error('[Daily Brief Trigger] Missing CONNECTOR_ENCRYPTION_KEY');
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

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
        details: { agentType: 'daily_brief', trigger: 'manual' },
      },
    });

    console.log(`[Daily Brief] Starting job ${job.id} for user ${user.id}`);

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
          onToolCall: async (toolName, input) => {
            const toolCall = await prisma.toolCall.create({
              data: {
                jobId: job.id,
                tenantId: user.tenantId,
                toolName,
                serverName: 'slack',
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
                  output: output as object || {},
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
    return NextResponse.json(
      { error: 'Failed to trigger agent' },
      { status: 500 }
    );
  }
}
