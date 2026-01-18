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
        type: 'daily_brief',
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
        type: 'slack_message',
      },
      orderBy: { fetchedAt: 'desc' },
      take: 50,
    });

    // Format sources for response
    const formattedSources = sources.map((source) => ({
      id: source.id,
      title: source.title,
      url: source.url,
      channelName: (source.metadata as Record<string, unknown>)?.channelName as string || 'unknown',
      author: (source.metadata as Record<string, unknown>)?.author as string || 'unknown',
      fetchedAt: source.fetchedAt,
    }));

    // Get the agent config for this user to know which data sources were used
    const agentConfig = await prisma.agentConfig.findUnique({
      where: {
        userId_agentType: {
          userId: user.id,
          agentType: 'daily_brief',
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

    // Build data sources info from job result stats and config
    const jobResult = job.result as Record<string, unknown> | null;
    const jobStats = (jobResult?.stats as Record<string, unknown>) || {};
    const configData = (agentConfig?.config as Record<string, unknown>) || {};

    // Map of data source keys to their display info and stats
    const dataSourcesUsed: Array<{
      key: string;
      name: string;
      stats: Array<{ label: string; value: number }>;
    }> = [];

    // Check which data sources were configured/used
    // Slack
    if (configData.slackChannels || jobStats.channelsProcessed !== undefined) {
      dataSourcesUsed.push({
        key: 'slack',
        name: 'Slack',
        stats: [
          { label: 'Channels', value: (jobStats.channelsProcessed as number) || 0 },
          { label: 'Messages', value: (jobStats.messagesProcessed as number) || 0 },
        ],
      });
    }

    // Gmail
    if (configData.includeGmail || jobStats.emailsProcessed !== undefined) {
      dataSourcesUsed.push({
        key: 'gmail',
        name: 'Gmail',
        stats: [
          { label: 'Emails', value: (jobStats.emailsProcessed as number) || 0 },
        ],
      });
    }

    // Google Calendar
    if (configData.includeGoogleCalendar || jobStats.eventsProcessed !== undefined) {
      dataSourcesUsed.push({
        key: 'google-calendar',
        name: 'Google Calendar',
        stats: [
          { label: 'Events', value: (jobStats.eventsProcessed as number) || 0 },
        ],
      });
    }

    // Google Drive
    if (configData.includeGoogleDrive || jobStats.filesProcessed !== undefined) {
      dataSourcesUsed.push({
        key: 'google-drive',
        name: 'Google Drive',
        stats: [
          { label: 'Files', value: (jobStats.filesProcessed as number) || 0 },
        ],
      });
    }

    // Jira
    if (configData.includeJira || jobStats.issuesProcessed !== undefined) {
      dataSourcesUsed.push({
        key: 'jira',
        name: 'Jira',
        stats: [
          { label: 'Issues', value: (jobStats.issuesProcessed as number) || 0 },
        ],
      });
    }

    // Confluence
    if (configData.includeConfluence || jobStats.pagesProcessed !== undefined) {
      dataSourcesUsed.push({
        key: 'confluence',
        name: 'Confluence',
        stats: [
          { label: 'Pages', value: (jobStats.pagesProcessed as number) || 0 },
        ],
      });
    }

    // Gong
    if (configData.includeGong || jobStats.callsProcessed !== undefined) {
      dataSourcesUsed.push({
        key: 'gong',
        name: 'Gong',
        stats: [
          { label: 'Calls', value: (jobStats.callsProcessed as number) || 0 },
        ],
      });
    }

    // Zendesk
    if (configData.includeZendesk || jobStats.ticketsProcessed !== undefined) {
      dataSourcesUsed.push({
        key: 'zendesk',
        name: 'Zendesk',
        stats: [
          { label: 'Tickets', value: (jobStats.ticketsProcessed as number) || 0 },
        ],
      });
    }

    // Loom
    if (configData.includeLoom || jobStats.videosProcessed !== undefined) {
      dataSourcesUsed.push({
        key: 'loom',
        name: 'Loom',
        stats: [
          { label: 'Videos', value: (jobStats.videosProcessed as number) || 0 },
        ],
      });
    }

    // Figma
    if (configData.includeFigma || jobStats.framesProcessed !== undefined) {
      dataSourcesUsed.push({
        key: 'figma',
        name: 'Figma',
        stats: [
          { label: 'Frames', value: (jobStats.framesProcessed as number) || 0 },
        ],
      });
    }

    const brief = {
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

    return NextResponse.json({ brief });
  } catch (error) {
    console.error('[Daily Brief Detail] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch brief' }, { status: 500 });
  }
}
