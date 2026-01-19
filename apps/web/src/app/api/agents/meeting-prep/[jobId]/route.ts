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
    const formattedSources = sources.map((source) => ({
      id: source.id,
      type: source.type,
      title: source.title,
      url: source.url,
      metadata: source.metadata as Record<string, unknown>,
      fetchedAt: source.fetchedAt,
    }));

    const prep = {
      id: job.id,
      status: job.status,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      error: job.error,
      result: job.result,
      config: job.config,
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
