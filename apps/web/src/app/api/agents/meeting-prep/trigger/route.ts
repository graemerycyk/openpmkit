import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

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
      connectorInstalls.map((c) => [c.connectorKey, c])
    );

    // Check which connectors are connected
    const calendarInstall = connectorMap.get('google-calendar');
    const calendarConnected = calendarInstall && calendarInstall.credentials[0];

    if (!calendarConnected) {
      return NextResponse.json(
        { error: 'Google Calendar not connected. Please connect Google Calendar to run Meeting Prep.' },
        { status: 400 }
      );
    }

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
        },
      },
    });

    console.log(`[Meeting Prep] Starting job ${job.id} for user ${user.id}`);

    // Get config details for the artifact
    const configData = agentConfig.config as {
      leadTimeMinutes?: number;
      timezone?: string;
      enabledSources?: Record<string, boolean>;
    };

    // Check what other connectors are available
    const slackInstall = connectorMap.get('slack');
    const gmailInstall = connectorMap.get('gmail');
    const driveInstall = connectorMap.get('google-drive');
    const jiraInstall = connectorMap.get('jira');
    const confluenceInstall = connectorMap.get('confluence');
    const gongInstall = connectorMap.get('gong');

    const connectedSources = [
      calendarConnected ? 'Google Calendar' : null,
      slackInstall?.credentials[0] ? 'Slack' : null,
      gmailInstall?.credentials[0] ? 'Gmail' : null,
      driveInstall?.credentials[0] ? 'Google Drive' : null,
      jiraInstall?.credentials[0] ? 'Jira' : null,
      confluenceInstall?.credentials[0] ? 'Confluence' : null,
      gongInstall?.credentials[0] ? 'Gong' : null,
    ].filter(Boolean);

    // For now, mark as completed immediately since the actual execution
    // would require the meeting prep orchestrator to be implemented
    // This provides a foundation for the manual trigger functionality
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        result: {
          message: 'Meeting prep triggered successfully',
          connectedSources,
        },
      },
    });

    // Create placeholder artifact
    const today = new Date();
    const artifactContent = `# Meeting Prep - ${today.toLocaleDateString()}

## Overview
Meeting Prep agent triggered successfully.

## Configuration
- **Lead Time**: ${configData.leadTimeMinutes || 240} minutes before meeting
- **Timezone**: ${configData.timezone || 'Not set'}

## Connected Data Sources
${connectedSources.map(s => `- ${s}`).join('\n') || '- None connected'}

## What This Agent Will Do
When fully implemented, the Meeting Prep agent will:

1. **Find your upcoming meeting** from Google Calendar
2. **Gather context** from connected sources:
   - Recent emails with attendees (Gmail)
   - Relevant Slack conversations
   - Related documents (Google Drive)
   - Customer tickets (Jira/Zendesk)
   - Call recordings (Gong)
3. **Generate a prep pack** with:
   - Attendee background
   - Recent interactions timeline
   - Key topics to discuss
   - Open action items
   - Suggested talking points

## Status
The Meeting Prep agent has been triggered. Full automated prep pack generation is coming soon.

---
*Generated at ${today.toISOString()}*
`;

    await prisma.artifact.create({
      data: {
        tenantId: user.tenantId,
        jobId: job.id,
        type: 'meeting_pack',
        title: `Meeting Prep - ${today.toLocaleDateString()}`,
        format: 'markdown',
        content: artifactContent,
        metadata: {
          status: 'placeholder',
          connectedSources,
          leadTimeMinutes: configData.leadTimeMinutes || 240,
        },
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
        details: { trigger: 'manual', connectedSources },
      },
    });

    console.log(`[Meeting Prep] Job ${job.id} completed (placeholder)`);

    return NextResponse.json({
      success: true,
      jobId: job.id,
    });
  } catch (error) {
    console.error('[Meeting Prep Trigger] Error:', error);
    return NextResponse.json({ error: 'Failed to trigger agent' }, { status: 500 });
  }
}
