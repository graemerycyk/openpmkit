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
  gong: z.object({
    recentCalls: z.boolean().optional(),
    includeTranscripts: z.boolean().optional(),
  }).optional(),
  'google-drive': z.object({
    sharedWithMe: z.boolean().optional(),
    recentEdits: z.boolean().optional(),
    includeComments: z.boolean().optional(),
  }).optional(),
  gmail: z.object({
    unreadOnly: z.boolean().optional(),
    includeStarred: z.boolean().optional(),
  }).optional(),
  'google-calendar': z.object({
    todayOnly: z.boolean().optional(),
    includeDescriptions: z.boolean().optional(),
  }).optional(),
}).optional();

// Deck Content config schema
const DeckContentConfigSchema = z.object({
  title: z.string().optional(),
  deckType: z.string().default('qbr'),
  audience: z.string().default('executive'),
  keyMessages: z.string().optional(),
  additionalContext: z.string().optional(),
  enabledSources: z.record(z.boolean()).optional(),
  connectorConfigs: ConnectorConfigSchema,
});

// GET - Fetch user's Deck Content config
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
          agentType: 'deck_content',
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
    console.error('[Deck Content Config] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

// POST - Create or update Deck Content config
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
    const parseResult = DeckContentConfigSchema.safeParse(body.config);
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
          agentType: 'deck_content',
        },
      },
      create: {
        userId: user.id,
        tenantId: user.tenantId,
        agentType: 'deck_content',
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
          agentType: 'deck_content',
          action: 'config_saved',
          title: configData.title,
          deckType: configData.deckType,
          audience: configData.audience,
        },
      },
    });

    console.log(
      `[Deck Content Config] Saved for user ${user.id}, status: ${config.status}`
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
    console.error('[Deck Content Config] POST error:', error);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}

// DELETE - Remove Deck Content config
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
        agentType: 'deck_content',
      },
    });

    console.log(`[Deck Content Config] Deleted for user ${user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Deck Content Config] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete config' }, { status: 500 });
  }
}
