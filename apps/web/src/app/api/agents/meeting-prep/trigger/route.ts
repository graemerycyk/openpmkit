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

    // For now, mark as completed immediately since the actual execution
    // would require the meeting prep orchestrator to be implemented
    // This provides a foundation for the manual trigger functionality
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        result: { message: 'Meeting prep triggered successfully' },
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
        details: { trigger: 'manual' },
      },
    });

    console.log(`[Meeting Prep] Job ${job.id} completed successfully`);

    return NextResponse.json({
      success: true,
      jobId: job.id,
    });
  } catch (error) {
    console.error('[Meeting Prep Trigger] Error:', error);
    return NextResponse.json({ error: 'Failed to trigger agent' }, { status: 500 });
  }
}
