import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = await params;

    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the job with artifact and sources
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        tenantId: user.tenantId,
        type: 'feature_intelligence',
      },
      include: {
        artifacts: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Get sources for this job
    const sources = await prisma.source.findMany({
      where: {
        tenantId: user.tenantId,
      },
      orderBy: { fetchedAt: 'desc' },
      take: 50,
    });

    // Format sources for response
    const formattedSources = sources.map((source: typeof sources[number]) => ({
      id: source.id,
      type: source.type,
      title: source.title,
      url: source.url,
      metadata: source.metadata as Record<string, unknown>,
      fetchedAt: source.fetchedAt,
    }));

    // Get the agent config for this user to know which data sources were used
    const agentConfig = await prisma.agentConfig.findUnique({
      where: {
        userId_agentType: {
          userId: user.id,
          agentType: 'feature_intelligence',
        },
      },
    });

    // Get connected data sources for this tenant
    const connectedSources = await prisma.connectorInstall.findMany({
      where: {
        tenantId: user.tenantId,
        status: { in: ['mock', 'real'] },
      },
      select: {
        connectorKey: true,
        status: true,
      },
    });

    // Build data sources info from job result stats
    // Show all CONNECTED data sources that are enabled in config, even if they returned 0 items
    const jobResult = job.result as Record<string, unknown> | null;
    const jobStats = (jobResult?.stats as Record<string, unknown>) || {};
    const connectedKeys = new Set(connectedSources.map(s => s.connectorKey));
    const configData = (agentConfig?.config as Record<string, unknown>) || {};
    const enabledSources = (configData.enabledSources as Record<string, boolean>) || {};

    const dataSourcesUsed: Array<{
      key: string;
      name: string;
      stats: Array<{ label: string; value: number }>;
    }> = [];

    // Zendesk - show if connected AND enabled in config
    const zendeskTicketsProcessed = (jobStats.zendeskTicketsProcessed as number) || 0;
    if (connectedKeys.has('zendesk') && enabledSources.zendesk !== false) {
      dataSourcesUsed.push({
        key: 'zendesk',
        name: 'Zendesk',
        stats: [
          { label: 'Tickets', value: zendeskTicketsProcessed },
        ],
      });
    }

    // Slack - show if connected AND enabled in config
    const slackMessagesProcessed = (jobStats.slackMessagesProcessed as number) || 0;
    if (connectedKeys.has('slack') && enabledSources.slack !== false) {
      dataSourcesUsed.push({
        key: 'slack',
        name: 'Slack',
        stats: [
          { label: 'Messages', value: slackMessagesProcessed },
        ],
      });
    }

    // Gong - show if connected AND enabled in config
    const gongCallsProcessed = (jobStats.gongCallsProcessed as number) || 0;
    if (connectedKeys.has('gong') && enabledSources.gong !== false) {
      dataSourcesUsed.push({
        key: 'gong',
        name: 'Gong',
        stats: [
          { label: 'Calls', value: gongCallsProcessed },
        ],
      });
    }

    const cluster = {
      id: job.id,
      status: job.status,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      error: job.error,
      result: job.result,
      config: agentConfig?.config || null,
      dataSourcesUsed,
      connectedSources: connectedSources.map(s => s.connectorKey),
      artifact: job.artifacts[0]
        ? {
            id: job.artifacts[0].id,
            title: job.artifacts[0].title,
            content: job.artifacts[0].content,
            createdAt: job.artifacts[0].createdAt,
          }
        : null,
      sources: formattedSources,
    };

    return NextResponse.json({ cluster });
  } catch (error) {
    console.error('[Feature Intelligence Detail] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch cluster' }, { status: 500 });
  }
}
