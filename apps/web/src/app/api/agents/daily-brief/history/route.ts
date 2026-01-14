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

    // Get daily brief jobs for the user's tenant
    const jobs = await prisma.job.findMany({
      where: {
        tenantId: user.tenantId,
        type: 'daily_brief',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
      select: {
        id: true,
        status: true,
        startedAt: true,
        completedAt: true,
        error: true,
        result: true,
        config: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('[Daily Brief History] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
