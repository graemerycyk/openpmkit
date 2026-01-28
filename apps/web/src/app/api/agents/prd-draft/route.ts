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
  jira: z.object({
    assignedToMe: z.boolean().optional(),
    recentlyUpdated: z.boolean().optional(),
  }).optional(),
  confluence: z.object({
    recentlyEdited: z.boolean().optional(),
    sharedWithMe: z.boolean().optional(),
  }).optional(),
  gong: z.object({
    recentCalls: z.boolean().optional(),
    includeTranscripts: z.boolean().optional(),
  }).optional(),
  zendesk: z.object({
    openTicketsOnly: z.boolean().optional(),
    includeComments: z.boolean().optional(),
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
}).optional();

// PRD Draft config schema
const PRDDraftConfigSchema = z.object({
  autoDiscover: z.boolean().default(true),
  priorityFilter: z.string().default('all'),
  includeVoC: z.boolean().default(true),
  includeJiraEpics: z.boolean().default(true),
  includeSlackDiscussions: z.boolean().default(true),
  enabledSources: z.record(z.boolean()).optional(),
  connectorConfigs: ConnectorConfigSchema.optional(),
});

// GET - Fetch user's PRD Draft config
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
          agentType: 'prd_draft',
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
    console.error('[PRD Draft Config] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

// POST - Create or update PRD Draft config
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
    const parseResult = PRDDraftConfigSchema.safeParse(body.config);
    if (!parseResult.success) {
      console.error('[PRD Draft Config] Validation failed:', parseResult.error.errors);
      console.error('[PRD Draft Config] Received config:', JSON.stringify(body.config, null, 2));
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
          agentType: 'prd_draft',
        },
      },
      create: {
        userId: user.id,
        tenantId: user.tenantId,
        agentType: 'prd_draft',
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
          agentType: 'prd_draft',
          action: 'config_saved',
          autoDiscover: configData.autoDiscover,
          priorityFilter: configData.priorityFilter,
          includeVoC: configData.includeVoC,
          includeJiraEpics: configData.includeJiraEpics,
          includeSlackDiscussions: configData.includeSlackDiscussions,
        },
      },
    });

    console.log(
      `[PRD Draft Config] Saved for user ${user.id}, status: ${config.status}`
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
    console.error('[PRD Draft Config] POST error:', error);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}

// DELETE - Remove PRD Draft config
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
        agentType: 'prd_draft',
      },
    });

    console.log(`[PRD Draft Config] Deleted for user ${user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PRD Draft Config] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete config' }, { status: 500 });
  }
}
