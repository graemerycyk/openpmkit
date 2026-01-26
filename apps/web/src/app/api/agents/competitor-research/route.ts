import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Competitor Research config schema
const CompetitorResearchConfigSchema = z.object({
  competitors: z.array(z.string()).default([]),
  focusAreas: z.string().optional(),
  additionalContext: z.string().optional(),
  enabledSources: z.record(z.boolean()).optional(),
  connectorConfigs: z.object({}).optional(),
});

// GET - Fetch user's Competitor Research config
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
          agentType: 'competitor_research',
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
    console.error('[Competitor Research Config] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

// POST - Create or update Competitor Research config
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
    const parseResult = CompetitorResearchConfigSchema.safeParse(body.config);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid config', details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const configData = parseResult.data;

    // Upsert config
    const config = await prisma.agentConfig.upsert({
      where: {
        userId_agentType: {
          userId: user.id,
          agentType: 'competitor_research',
        },
      },
      create: {
        userId: user.id,
        tenantId: user.tenantId,
        agentType: 'competitor_research',
        status: body.status || 'paused',
        config: configData,
        nextRunAt: null,
      },
      update: {
        status: body.status || 'paused',
        config: configData,
        updatedAt: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.id,
        action: 'job_created',
        resourceType: 'agent_config',
        resourceId: config.id,
        details: {
          agentType: 'competitor_research',
          action: 'config_saved',
          competitorCount: configData.competitors.length,
        },
      },
    });

    console.log(
      `[Competitor Research Config] Saved for user ${user.id}, status: ${config.status}`
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
    console.error('[Competitor Research Config] POST error:', error);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}

// DELETE - Remove Competitor Research config
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
        agentType: 'competitor_research',
      },
    });

    console.log(`[Competitor Research Config] Deleted for user ${user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Competitor Research Config] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete config' }, { status: 500 });
  }
}
