import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Schema for connector-specific configuration
const ConnectorConfigSchema = z.object({
  jira: z.object({
    assignedToMe: z.boolean().optional(),
    recentlyUpdated: z.boolean().optional(),
  }).optional(),
  confluence: z.object({
    recentlyEdited: z.boolean().optional(),
    sharedWithMe: z.boolean().optional(),
  }).optional(),
  slack: z.object({
    includeMentions: z.boolean().optional(),
    selectedChannels: z.array(z.string()).optional(),
  }).optional(),
  gmail: z.object({
    unreadOnly: z.boolean().optional(),
    includeStarred: z.boolean().optional(),
  }).optional(),
  'google-calendar': z.object({
    todayOnly: z.boolean().optional(),
    includeDescriptions: z.boolean().optional(),
  }).optional(),
  'google-drive': z.object({
    sharedWithMe: z.boolean().optional(),
    recentEdits: z.boolean().optional(),
    includeComments: z.boolean().optional(),
  }).optional(),
}).optional();

// Release Notes config schema
const ReleaseNotesConfigSchema = z.object({
  version: z.string().optional(),
  releaseName: z.string().optional(),
  releaseDate: z.string().optional(),
  audience: z.string().default('all'),
  highlights: z.string().optional(),
  enabledSources: z.record(z.boolean()).optional(),
  connectorConfigs: ConnectorConfigSchema,
});

// GET - Fetch user's Release Notes config
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
          agentType: 'release_notes',
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
    console.error('[Release Notes Config] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

// POST - Create or update Release Notes config
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
    const parseResult = ReleaseNotesConfigSchema.safeParse(body.config);
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
          agentType: 'release_notes',
        },
      },
      create: {
        userId: user.id,
        tenantId: user.tenantId,
        agentType: 'release_notes',
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
          agentType: 'release_notes',
          action: 'config_saved',
          version: configData.version,
          audience: configData.audience,
        },
      },
    });

    console.log(
      `[Release Notes Config] Saved for user ${user.id}, status: ${config.status}`
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
    console.error('[Release Notes Config] POST error:', error);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}

// DELETE - Remove Release Notes config
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
        agentType: 'release_notes',
      },
    });

    console.log(`[Release Notes Config] Deleted for user ${user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Release Notes Config] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete config' }, { status: 500 });
  }
}
