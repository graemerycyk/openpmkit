import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { isAdminEmail } from '@/lib/admin';

// Map job types to their limit field names in billing config
const JOB_TYPE_LIMITS: Record<string, { limitKey: string; displayName: string }> = {
  daily_brief: { limitKey: 'maxOnDemandDailyBriefPerMonth', displayName: 'Daily Brief' },
  meeting_prep: { limitKey: 'maxOnDemandMeetingPrepPerMonth', displayName: 'Meeting Prep' },
  prd_draft: { limitKey: 'maxOnDemandPrdPackPerMonth', displayName: 'PRD Pack' },
  roadmap_alignment: { limitKey: 'maxOnDemandRoadmapMemoPerMonth', displayName: 'Roadmap Alignment' },
  sprint_review: { limitKey: 'maxOnDemandSprintReviewPerMonth', displayName: 'Sprint Review' },
  release_notes: { limitKey: 'maxOnDemandReleaseNotesPerMonth', displayName: 'Release Notes' },
  prototype_generation: { limitKey: 'maxOnDemandPrototypeGenPerMonth', displayName: 'Prototype Generation' },
  voc_clustering: { limitKey: 'maxOnDemandVocClusteringPerMonth', displayName: 'VoC Clustering' },
  competitor_research: { limitKey: 'maxOnDemandCompetitorResearchPerMonth', displayName: 'Competitor Research' },
  deck_content: { limitKey: 'maxOnDemandDeckContentPerMonth', displayName: 'Deck Content' },
};

// Individual/Teams plan limits (same for both)
const PLAN_LIMITS: Record<string, number> = {
  maxOnDemandDailyBriefPerMonth: 31,
  maxOnDemandMeetingPrepPerMonth: 40,
  maxOnDemandPrdPackPerMonth: 12,
  maxOnDemandRoadmapMemoPerMonth: 12,
  maxOnDemandSprintReviewPerMonth: 8,
  maxOnDemandReleaseNotesPerMonth: 16,
  maxOnDemandPrototypeGenPerMonth: 8,
  maxOnDemandVocClusteringPerMonth: 4,
  maxOnDemandCompetitorResearchPerMonth: 4,
  maxOnDemandDeckContentPerMonth: 12,
};

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

    // Check if admin (internal plan = unlimited)
    const isAdmin = isAdminEmail(session.user.email);

    // Get start of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Count jobs by type for this tenant this month
    const jobCounts = await prisma.job.groupBy({
      by: ['type'],
      where: {
        tenantId: user.tenantId,
        createdAt: {
          gte: startOfMonth,
        },
      },
      _count: {
        id: true,
      },
    });

    // Build usage summary for each job type
    const usage: Record<string, { used: number; limit: number; exceeded: boolean; displayName: string }> = {};

    for (const [jobType, config] of Object.entries(JOB_TYPE_LIMITS)) {
      const countRecord = jobCounts.find((c) => c.type === jobType);
      const used = countRecord?._count?.id || 0;
      const limit = isAdmin ? -1 : PLAN_LIMITS[config.limitKey] || 0;
      const exceeded = limit !== -1 && used > limit;

      usage[jobType] = {
        used,
        limit,
        exceeded,
        displayName: config.displayName,
      };
    }

    return NextResponse.json({
      usage,
      month: startOfMonth.toISOString(),
      isUnlimited: isAdmin,
    });
  } catch (error) {
    console.error('[Usage Summary] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch usage summary' }, { status: 500 });
  }
}
