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
        type: 'meeting_prep',
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
          agentType: 'meeting_prep',
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
    // Show all CONNECTED data sources that the agent uses, even if they returned 0 items
    const jobResult = job.result as Record<string, unknown> | null;
    const jobStats = (jobResult?.stats as Record<string, unknown>) || {};
    const connectedKeys = new Set(connectedSources.map((s: typeof connectedSources[number]) => s.connectorKey));

    // Get agent config to see what sources are enabled
    const configData = (agentConfig?.config as Record<string, unknown>) || {};
    const enabledSources = (configData.enabledSources as Record<string, boolean>) || {};

    const dataSourcesUsed: Array<{
      key: string;
      name: string;
      stats: Array<{ label: string; value: number }>;
    }> = [];

    // Meetings found (from Calendar) - always show if calendar is connected
    const meetingsFound = (jobStats.meetingsFound as number) || 0;
    const meetingTitles = (jobStats.meetingTitles as string[]) || [];
    if (connectedKeys.has('google-calendar')) {
      const meetingStats: Array<{ label: string; value: number }> = [
        { label: 'Meetings', value: meetingsFound },
      ];
      const attendeesCount = (jobStats.attendeesCount as number) || 0;
      if (attendeesCount > 0) {
        meetingStats.push({ label: 'Attendees', value: attendeesCount });
      }
      dataSourcesUsed.push({
        key: 'google-calendar',
        name: 'Calendar',
        stats: meetingStats,
      });
    }

    // Gmail - show if connected (always used for attendee context)
    const emailsProcessed = (jobStats.emailsProcessed as number) || 0;
    if (connectedKeys.has('gmail')) {
      dataSourcesUsed.push({
        key: 'gmail',
        name: 'Gmail',
        stats: [
          { label: 'Emails', value: emailsProcessed },
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

    // Jira - show if connected AND enabled in config
    const jiraIssuesProcessed = (jobStats.jiraIssuesProcessed as number) || 0;
    if (connectedKeys.has('jira') && enabledSources.jira !== false) {
      dataSourcesUsed.push({
        key: 'jira',
        name: 'Jira',
        stats: [
          { label: 'Issues', value: jiraIssuesProcessed },
        ],
      });
    }

    // Confluence - show if connected AND enabled in config
    const confluencePagesProcessed = (jobStats.confluencePagesProcessed as number) || 0;
    if (connectedKeys.has('confluence') && enabledSources.confluence !== false) {
      dataSourcesUsed.push({
        key: 'confluence',
        name: 'Confluence',
        stats: [
          { label: 'Pages', value: confluencePagesProcessed },
        ],
      });
    }

    const prep = {
      id: job.id,
      status: job.status,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      error: job.error,
      result: job.result,
      config: job.config,
      dataSourcesUsed,
      connectedSources: connectedSources.map((s: typeof connectedSources[number]) => s.connectorKey),
      // Meeting info from stats
      meetingsFound,
      meetingTitles,
      meetingTitle: (jobStats.meetingTitle as string) || null,
      meetingTime: (jobStats.meetingTime as string) || null,
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

    return NextResponse.json({ prep });
  } catch (error) {
    console.error('[Meeting Prep Detail] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch prep' }, { status: 500 });
  }
}
