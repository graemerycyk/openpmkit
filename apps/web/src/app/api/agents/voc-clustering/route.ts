import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { VocClusteringConfigSchema } from '@pmkit/core';
import { notifySchedulerToReload, notifySchedulerToCancel } from '@/lib/scheduler-client';

// GET - Fetch user's voc clustering config
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
          agentType: 'voc_clustering',
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
    console.error('[VoC Clustering Config] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

// POST - Create or update voc clustering config
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
    const parseResult = VocClusteringConfigSchema.safeParse(body.config);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid config', details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const configData = parseResult.data;

    // Calculate next run time based on schedule day and time
    const nextRunAt = calculateNextRunTime(
      configData.scheduleDay,
      configData.scheduleTimeLocal,
      configData.timezone
    );

    // Upsert config
    const config = await prisma.agentConfig.upsert({
      where: {
        userId_agentType: {
          userId: user.id,
          agentType: 'voc_clustering',
        },
      },
      create: {
        userId: user.id,
        tenantId: user.tenantId,
        agentType: 'voc_clustering',
        status: body.status || 'active',
        config: configData,
        nextRunAt,
      },
      update: {
        status: body.status || 'active',
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
        action: 'job_created',
        resourceType: 'agent_config',
        resourceId: config.id,
        details: {
          agentType: 'voc_clustering',
          action: 'config_saved',
          scheduleDay: configData.scheduleDay,
          scheduleTime: configData.scheduleTimeLocal,
          timezone: configData.timezone,
          lookbackDays: configData.lookbackDays,
          includeZendesk: configData.includeZendesk,
          includeGong: configData.includeGong,
          includeSlack: configData.includeSlack,
          includeCommunity: configData.includeCommunity,
        },
      },
    });

    console.log(
      `[VoC Clustering Config] Saved for user ${user.id}, next run at ${nextRunAt?.toISOString()}`
    );

    // Notify the worker scheduler to update the scheduled job
    await notifySchedulerToReload(config.id);

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
    console.error('[VoC Clustering Config] POST error:', error);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}

// DELETE - Remove voc clustering config
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

    // Find the config first so we can notify scheduler
    const existingConfig = await prisma.agentConfig.findUnique({
      where: {
        userId_agentType: {
          userId: user.id,
          agentType: 'voc_clustering',
        },
      },
    });

    await prisma.agentConfig.deleteMany({
      where: {
        userId: user.id,
        agentType: 'voc_clustering',
      },
    });

    // Notify scheduler to cancel any pending jobs for this config
    if (existingConfig) {
      await notifySchedulerToCancel(existingConfig.id);
    }

    console.log(`[VoC Clustering Config] Deleted for user ${user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[VoC Clustering Config] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete config' }, { status: 500 });
  }
}

// Helper to calculate next run time for weekly schedule
function calculateNextRunTime(
  scheduleDay: string,
  scheduleTimeLocal: string,
  timezone: string
): Date {
  const [hours, minutes] = scheduleTimeLocal.split(':').map(Number);
  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  const targetDayOfWeek = dayMap[scheduleDay];

  // Get current time in the user's timezone
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'long',
  });

  const parts = formatter.formatToParts(now);
  const currentYear = parseInt(parts.find((p) => p.type === 'year')?.value || '2024');
  const currentMonth = parseInt(parts.find((p) => p.type === 'month')?.value || '1') - 1;
  const currentDay = parseInt(parts.find((p) => p.type === 'day')?.value || '1');
  const currentHour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0');
  const currentMinute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0');

  // Calculate current day of week in user's timezone
  const currentDate = new Date(currentYear, currentMonth, currentDay);
  const currentDayOfWeek = currentDate.getDay();

  // Calculate days until next occurrence
  let daysUntil = targetDayOfWeek - currentDayOfWeek;
  if (daysUntil < 0) {
    daysUntil += 7;
  }

  // If it's the same day, check if the time has passed
  if (daysUntil === 0) {
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const targetTimeInMinutes = hours * 60 + minutes;
    if (targetTimeInMinutes <= currentTimeInMinutes) {
      daysUntil = 7; // Schedule for next week
    }
  }

  // Create target date
  let targetDate = new Date(
    Date.UTC(currentYear, currentMonth, currentDay + daysUntil, hours, minutes)
  );

  // Adjust for timezone offset
  const tzOffset = getTimezoneOffset(timezone, targetDate);
  targetDate = new Date(targetDate.getTime() + tzOffset);

  return targetDate;
}

// Get timezone offset in milliseconds
function getTimezoneOffset(timezone: string, date: Date): number {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  return utcDate.getTime() - tzDate.getTime();
}
