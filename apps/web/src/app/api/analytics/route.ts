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

    // Get date range for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all jobs for the tenant
    const allJobs = await prisma.job.findMany({
      where: {
        tenantId: user.tenantId,
      },
      select: {
        id: true,
        type: true,
        status: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate summary stats
    const totalJobs = allJobs.length;
    const completedJobs = allJobs.filter((j) => j.status === 'completed').length;
    const failedJobs = allJobs.filter((j) => j.status === 'failed').length;
    const pendingJobs = allJobs.filter((j) => j.status === 'pending').length;
    const runningJobs = allJobs.filter((j) => j.status === 'running').length;

    // Calculate success rate
    const finishedJobs = completedJobs + failedJobs;
    const successRate = finishedJobs > 0 ? Math.round((completedJobs / finishedJobs) * 100) : 0;

    // Jobs by type
    const jobsByType: Record<string, number> = {};
    for (const job of allJobs) {
      jobsByType[job.type] = (jobsByType[job.type] || 0) + 1;
    }

    // Jobs over time (last 30 days, grouped by day)
    const jobsOverTime: { date: string; completed: number; failed: number }[] = [];
    const dateMap = new Map<string, { completed: number; failed: number }>();

    // Initialize all dates in the range
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dateMap.set(dateStr, { completed: 0, failed: 0 });
    }

    // Count jobs by date
    for (const job of allJobs) {
      const dateStr = job.createdAt.toISOString().split('T')[0];
      if (dateMap.has(dateStr)) {
        const current = dateMap.get(dateStr)!;
        if (job.status === 'completed') {
          current.completed++;
        } else if (job.status === 'failed') {
          current.failed++;
        }
      }
    }

    // Convert map to array
    for (const [date, counts] of dateMap) {
      jobsOverTime.push({ date, ...counts });
    }

    // Calculate average duration for completed jobs
    let totalDurationMs = 0;
    let jobsWithDuration = 0;
    for (const job of allJobs) {
      if (job.status === 'completed' && job.startedAt && job.completedAt) {
        totalDurationMs += job.completedAt.getTime() - job.startedAt.getTime();
        jobsWithDuration++;
      }
    }
    const avgDurationMs = jobsWithDuration > 0 ? Math.round(totalDurationMs / jobsWithDuration) : 0;
    const avgDurationSeconds = Math.round(avgDurationMs / 1000);

    // Jobs this week vs last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const jobsThisWeek = allJobs.filter((j) => j.createdAt >= oneWeekAgo).length;
    const jobsLastWeek = allJobs.filter(
      (j) => j.createdAt >= twoWeeksAgo && j.createdAt < oneWeekAgo
    ).length;

    // Calculate week-over-week change
    let weekOverWeekChange = 0;
    if (jobsLastWeek > 0) {
      weekOverWeekChange = Math.round(((jobsThisWeek - jobsLastWeek) / jobsLastWeek) * 100);
    } else if (jobsThisWeek > 0) {
      weekOverWeekChange = 100;
    }

    // Recent jobs (last 5)
    const recentJobs = allJobs.slice(0, 5).map((job) => ({
      id: job.id,
      type: job.type,
      status: job.status,
      createdAt: job.createdAt.toISOString(),
      completedAt: job.completedAt?.toISOString() || null,
    }));

    return NextResponse.json({
      summary: {
        totalJobs,
        completedJobs,
        failedJobs,
        pendingJobs,
        runningJobs,
        successRate,
        avgDurationSeconds,
        jobsThisWeek,
        jobsLastWeek,
        weekOverWeekChange,
      },
      jobsByType,
      jobsOverTime,
      recentJobs,
    });
  } catch (error) {
    console.error('[Analytics] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
