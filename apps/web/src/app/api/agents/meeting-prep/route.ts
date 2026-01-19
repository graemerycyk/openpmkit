import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema for connector-specific configuration
const ConnectorConfigSchema = z.object({
  slack: z.object({
    includeMentions: z.boolean().optional(),
    selectedChannels: z.array(z.string()).optional(),
  }).optional(),
  gmail: z.object({
    unreadOnly: z.boolean().optional(),
    includeStarred: z.boolean().optional(),
  }).optional(),
  'google-drive': z.object({
    sharedWithMe: z.boolean().optional(),
    recentEdits: z.boolean().optional(),
    includeComments: z.boolean().optional(),
  }).optional(),
  'google-calendar': z.object({
    todayOnly: z.boolean().optional(),
    includeDescriptions: z.boolean().optional(),
  }).optional(),
  gong: z.object({
    recentCallsOnly: z.boolean().optional(),
    includeTranscripts: z.boolean().optional(),
  }).optional(),
  zendesk: z.object({
    openTicketsOnly: z.boolean().optional(),
    includeComments: z.boolean().optional(),
  }).optional(),
}).optional();

// Schema matching what the page sends - different from core MeetingPrepConfigSchema
// This allows more flexibility for the UI while we can transform to the canonical format
const MeetingPrepPageConfigSchema = z.object({
  lookbackDays: z.number().min(7).max(90).default(30),
  prepTimingMinutes: z.number().min(15).max(1440).default(30),
  filterDomains: z.array(z.string()).default([]),
  includeAllExternalMeetings: z.boolean().default(true),
  enabledSources: z.record(z.boolean()).optional(),
  connectorConfigs: ConnectorConfigSchema,
});

// GET - Fetch user's meeting prep config
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
          agentType: 'meeting_prep',
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
    console.error('[Meeting Prep Config] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

// POST - Create or update meeting prep config
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
    const parseResult = MeetingPrepPageConfigSchema.safeParse(body.config);
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
          agentType: 'meeting_prep',
        },
      },
      create: {
        userId: user.id,
        tenantId: user.tenantId,
        agentType: 'meeting_prep',
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
          agentType: 'meeting_prep',
          action: 'config_saved',
          lookbackDays: configData.lookbackDays,
          prepTimingMinutes: configData.prepTimingMinutes,
          filterDomains: configData.filterDomains,
          includeAllExternalMeetings: configData.includeAllExternalMeetings,
        },
      },
    });

    console.log(
      `[Meeting Prep Config] Saved for user ${user.id}, status: ${config.status}`
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
    console.error('[Meeting Prep Config] POST error:', error);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}

// DELETE - Remove meeting prep config
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
        agentType: 'meeting_prep',
      },
    });

    console.log(`[Meeting Prep Config] Deleted for user ${user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Meeting Prep Config] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete config' }, { status: 500 });
  }
}
