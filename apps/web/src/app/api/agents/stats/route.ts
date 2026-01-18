import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function GET() {
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

    // Count active agents (agent configs with status 'active')
    const activeAgentsCount = await prisma.agentConfig.count({
      where: {
        userId: user.id,
        status: 'active',
      },
    });

    // Count connected data sources (connectors with status 'real')
    const connectedSourcesCount = await prisma.connectorInstall.count({
      where: {
        tenantId: user.tenantId,
        status: 'real',
      },
    });

    // Count completed jobs (status 'completed')
    const completedJobsCount = await prisma.job.count({
      where: {
        tenantId: user.tenantId,
        status: 'completed',
      },
    });

    // Get agent configs for the user to show which agents are configured
    const agentConfigs = await prisma.agentConfig.findMany({
      where: {
        userId: user.id,
      },
      select: {
        agentType: true,
        status: true,
        lastRunAt: true,
      },
    });

    return NextResponse.json({
      activeAgentsCount,
      connectedSourcesCount,
      completedJobsCount,
      agentConfigs,
    });
  } catch (error) {
    console.error('[Agent Stats] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch agent stats' }, { status: 500 });
  }
}
