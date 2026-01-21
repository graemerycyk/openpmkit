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

    // Build data sources info from job result stats
    // ONLY show data sources that were actually fetched (non-zero counts)
    const jobResult = job.result as Record<string, unknown> | null;
    const jobStats = (jobResult?.stats as Record<string, unknown>) || {};

    // Map of data source keys to their display info and stats
    const dataSourcesUsed: Array<{
      key: string;
      name: string;
      stats: Array<{ label: string; value: number }>;
    }> = [];

    // Slack - only show if messages were actually fetched
    const messagesProcessed = (jobStats.messagesProcessed as number) || 0;
    if (messagesProcessed > 0) {
      const slackStats: Array<{ label: string; value: number }> = [];
      const channelsProcessed = (jobStats.channelsProcessed as number) || 0;
      if (channelsProcessed > 0) {
        slackStats.push({ label: 'Channels', value: channelsProcessed });
      }
      slackStats.push({ label: 'Messages', value: messagesProcessed });
      dataSourcesUsed.push({
        key: 'slack',
        name: 'Slack',
        stats: slackStats,
      });
    }

    // Gmail - only show if emails were actually fetched
    const emailsProcessed = (jobStats.emailsProcessed as number) || 0;
    if (emailsProcessed > 0) {
      dataSourcesUsed.push({
        key: 'gmail',
        name: 'Gmail',
        stats: [
          { label: 'Emails', value: emailsProcessed },
        ],
      });
    }

    // Google Calendar - only show if events were actually fetched
    const eventsProcessed = (jobStats.eventsProcessed as number) || 0;
    if (eventsProcessed > 0) {
      dataSourcesUsed.push({
        key: 'google-calendar',
        name: 'Calendar',
        stats: [
          { label: 'Events', value: eventsProcessed },
        ],
      });
    }

    // Google Drive - only show if files were actually fetched
    const driveFilesProcessed = (jobStats.driveFilesProcessed as number) || 0;
    if (driveFilesProcessed > 0) {
      dataSourcesUsed.push({
        key: 'google-drive',
        name: 'Drive',
        stats: [
          { label: 'Files', value: driveFilesProcessed },
        ],
      });
    }

    // Jira - only show if issues were actually fetched
    const jiraIssuesProcessed = (jobStats.jiraIssuesProcessed as number) || 0;
    if (jiraIssuesProcessed > 0) {
      dataSourcesUsed.push({
        key: 'jira',
        name: 'Jira',
        stats: [
          { label: 'Issues', value: jiraIssuesProcessed },
        ],
      });
    }

    // Confluence - only show if pages were actually fetched
    const confluencePagesProcessed = (jobStats.confluencePagesProcessed as number) || 0;
    if (confluencePagesProcessed > 0) {
      dataSourcesUsed.push({
        key: 'confluence',
        name: 'Confluence',
        stats: [
          { label: 'Pages', value: confluencePagesProcessed },
        ],
      });
    }

    // Gong - only show if calls were actually fetched
    const callsProcessed = (jobStats.callsProcessed as number) || 0;
    if (callsProcessed > 0) {
      dataSourcesUsed.push({
        key: 'gong',
        name: 'Gong',
        stats: [
          { label: 'Calls', value: callsProcessed },
        ],
      });
    }

    // Zendesk - only show if tickets were actually fetched
    const zendeskTicketsProcessed = (jobStats.zendeskTicketsProcessed as number) || 0;
    if (zendeskTicketsProcessed > 0) {
      dataSourcesUsed.push({
        key: 'zendesk',
        name: 'Zendesk',
        stats: [
          { label: 'Tickets', value: zendeskTicketsProcessed },
        ],
      });
    }

    // Loom - only show if videos were actually fetched
    const videosProcessed = (jobStats.videosProcessed as number) || 0;
    if (videosProcessed > 0) {
      dataSourcesUsed.push({
        key: 'loom',
        name: 'Loom',
        stats: [
          { label: 'Videos', value: videosProcessed },
        ],
      });
    }

    // Figma - only show if frames were actually fetched
    const framesProcessed = (jobStats.framesProcessed as number) || 0;
    if (framesProcessed > 0) {
      dataSourcesUsed.push({
        key: 'figma',
        name: 'Figma',
        stats: [
          { label: 'Frames', value: framesProcessed },
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
