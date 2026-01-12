import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { isAdminEmail } from '@/lib/admin';
import { crawlerJobs } from '@/lib/crawler-store';

// GET /api/crawlers/[id] - Get job status and results
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check admin access
    if (!isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const job = crawlerJobs.get(id);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: job.id,
      type: job.type,
      status: job.status,
      keywords: job.keywords,
      platforms: job.platforms,
      createdAt: job.createdAt.toISOString(),
      startedAt: job.startedAt?.toISOString(),
      completedAt: job.completedAt?.toISOString(),
      error: job.error,
      resultCount: job.results.length,
      results: job.status === 'completed' ? job.results : undefined,
      analysis: job.status === 'completed' ? job.analysis : undefined,
      analysisMetadata: job.status === 'completed' ? job.analysisMetadata : undefined,
      analysisError: job.status === 'completed' ? job.analysisError : undefined,
    });
  } catch (error) {
    console.error('Crawler status error:', error);
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    );
  }
}

// DELETE /api/crawlers/[id] - Cancel/delete a job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check admin access
    if (!isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const deleted = crawlerJobs.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Job deleted',
    });
  } catch (error) {
    console.error('Crawler delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}
