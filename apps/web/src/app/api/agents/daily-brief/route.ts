import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { DailyBriefConfigSchema } from '@pmkit/core';
import { notifySchedulerToReload, notifySchedulerToCancel } from '@/lib/scheduler-client';

// GET - Fetch user's daily brief config
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
          agentType: 'daily_brief',
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
    console.error('[Daily Brief Config] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

// POST - Create or update daily brief config
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
    const parseResult = DailyBriefConfigSchema.safeParse(body.config);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid config', details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const configData = parseResult.data;

    // Calculate next run time based on delivery time and timezone
    const nextRunAt = calculateNextRunTime(configData.deliveryTimeLocal, configData.timezone);

    // Upsert config
    const config = await prisma.agentConfig.upsert({
      where: {
        userId_agentType: {
          userId: user.id,
          agentType: 'daily_brief',
        },
      },
      create: {
        userId: user.id,
        tenantId: user.tenantId,
        agentType: 'daily_brief',
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
        action: 'job_created', // Using existing enum value
        resourceType: 'agent_config',
        resourceId: config.id,
        details: {
          agentType: 'daily_brief',
          action: 'config_saved',
          deliveryTime: configData.deliveryTimeLocal,
          timezone: configData.timezone,
          channelCount: configData.slackChannels.length,
          includeSlack: configData.includeSlack,
          includeSlackMentions: configData.includeSlackMentions,
          includeGmail: configData.includeGmail,
          includeGoogleDrive: configData.includeGoogleDrive,
          includeGoogleCalendar: configData.includeGoogleCalendar,
          includeJira: configData.includeJira,
          includeConfluence: configData.includeConfluence,
          includeZendesk: configData.includeZendesk,
        },
      },
    });

    console.log(
      `[Daily Brief Config] Saved for user ${user.id}, next run at ${nextRunAt?.toISOString()}`
    );

    // Notify the worker scheduler to update the scheduled job
    // This allows the worker to pick up changes without restart
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
    console.error('[Daily Brief Config] POST error:', error);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}

// DELETE - Remove daily brief config
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
          agentType: 'daily_brief',
        },
      },
    });

    await prisma.agentConfig.deleteMany({
      where: {
        userId: user.id,
        agentType: 'daily_brief',
      },
    });

    // Notify scheduler to cancel any pending jobs for this config
    if (existingConfig) {
      await notifySchedulerToCancel(existingConfig.id);
    }

    console.log(`[Daily Brief Config] Deleted for user ${user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Daily Brief Config] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete config' }, { status: 500 });
  }
}

// Helper to calculate next run time
function calculateNextRunTime(deliveryTimeLocal: string, timezone: string): Date {
  const [hours, minutes] = deliveryTimeLocal.split(':').map(Number);

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
  });

  const parts = formatter.formatToParts(now);
  const currentYear = parseInt(parts.find(p => p.type === 'year')?.value || '2024');
  const currentMonth = parseInt(parts.find(p => p.type === 'month')?.value || '1') - 1;
  const currentDay = parseInt(parts.find(p => p.type === 'day')?.value || '1');
  const currentHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
  const currentMinute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');

  // Create target date in user's timezone (today at delivery time)
  let targetDate = new Date(Date.UTC(currentYear, currentMonth, currentDay, hours, minutes));

  // Adjust for timezone offset
  const tzOffset = getTimezoneOffset(timezone, targetDate);
  targetDate = new Date(targetDate.getTime() + tzOffset);

  // If target time has passed today, schedule for tomorrow
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const targetTimeInMinutes = hours * 60 + minutes;

  if (targetTimeInMinutes <= currentTimeInMinutes) {
    targetDate = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);
  }

  return targetDate;
}

// Get timezone offset in milliseconds
function getTimezoneOffset(timezone: string, date: Date): number {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  return (utcDate.getTime() - tzDate.getTime());
}
