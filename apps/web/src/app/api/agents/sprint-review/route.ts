import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { SprintReviewConfigSchema } from '@pmkit/core';

// GET - Fetch user's sprint review config
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

    const config = await prisma.agentConfig.findUnique({
      where: {
        userId_agentType: {
          userId: user.id,
          agentType: 'sprint_review',
        },
      },
    });

    if (!config) {
      return NextResponse.json({ config: null });
    }

    return NextResponse.json({
      config: {
        id: config.id,
        status: config.status,
        config: config.config,
        nextRunAt: config.nextRunAt,
        lastRunAt: config.lastRunAt,
      },
    });
  } catch (error) {
    console.error('[Sprint Review Config] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

// POST - Create or update sprint review config
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validate config
    const parseResult = SprintReviewConfigSchema.safeParse(body.config);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid config', details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const configData = parseResult.data;

    // For calendar-triggered agents, nextRunAt is calculated when calendar events are scanned
    // Set to null initially - the scheduler will populate this
    const nextRunAt = null;

    // Upsert config
    const config = await prisma.agentConfig.upsert({
      where: {
        userId_agentType: {
          userId: user.id,
          agentType: 'sprint_review',
        },
      },
      create: {
        userId: user.id,
        tenantId: user.tenantId,
        agentType: 'sprint_review',
        status: body.status || 'paused',
        config: configData,
        nextRunAt,
      },
      update: {
        status: body.status || 'paused',
        config: configData,
        nextRunAt,
        updatedAt: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.id,
        action: 'job_created', // Using existing enum value
        resourceType: 'agent_config',
        resourceId: config.id,
        details: {
          agentType: 'sprint_review',
          action: 'config_saved',
          calendarKeywords: configData.calendarKeywords,
          leadTimeMinutes: configData.leadTimeMinutes,
          timezone: configData.timezone,
          jiraProjectKeys: configData.jiraProjectKeys,
        },
      },
    });

    console.log(
      `[Sprint Review Config] Saved for user ${user.id}, status: ${config.status}`
    );

    return NextResponse.json({
      success: true,
      config: {
        id: config.id,
        status: config.status,
        config: config.config,
        nextRunAt: config.nextRunAt,
        lastRunAt: config.lastRunAt,
      },
    });
  } catch (error) {
    console.error('[Sprint Review Config] POST error:', error);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}

// DELETE - Remove sprint review config
export async function DELETE() {
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

    await prisma.agentConfig.deleteMany({
      where: {
        userId: user.id,
        agentType: 'sprint_review',
      },
    });

    console.log(`[Sprint Review Config] Deleted for user ${user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Sprint Review Config] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete config' }, { status: 500 });
  }
}
