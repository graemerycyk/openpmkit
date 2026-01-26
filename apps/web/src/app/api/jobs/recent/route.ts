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
      console.log('[Recent Jobs] User not found for email:', session.user.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('[Recent Jobs] Fetching jobs for tenant:', user.tenantId);

    // Get recent jobs across all agent types for the user's tenant
    const jobs = await prisma.job.findMany({
      where: {
        tenantId: user.tenantId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        type: true,
        status: true,
        startedAt: true,
        completedAt: true,
        error: true,
        createdAt: true,
      },
    });

    console.log('[Recent Jobs] Found', jobs.length, 'jobs for tenant', user.tenantId);

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('[Recent Jobs] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch recent jobs' }, { status: 500 });
  }
}
