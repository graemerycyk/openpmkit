import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { isAdminEmail } from '@/lib/admin';
import { crawlerJobs } from '@/lib/crawler-store';

// GET /api/crawlers/list - List all crawler jobs
export async function GET() {
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

    // Get all jobs sorted by creation date (newest first)
    const jobs = Array.from(crawlerJobs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(job => ({
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
      }));

    return NextResponse.json({
      jobs,
      total: jobs.length,
    });
  } catch (error) {
    console.error('Crawler list error:', error);
    return NextResponse.json(
      { error: 'Failed to list jobs' },
      { status: 500 }
    );
  }
}
