import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

// Mock upcoming meetings data for demo mode
// In production, this would fetch from Google Calendar API
const MOCK_MEETINGS = [
  {
    id: 'meet-1',
    title: 'Quarterly Business Review - Acme Corp',
    datetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    attendees: ['john.smith@acme.com', 'sarah.johnson@acme.com'],
    description: 'Q4 review with Acme Corp leadership team',
    domain: 'acme.com',
    prepScheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'meet-2',
    title: 'Product Demo - TechStart',
    datetime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    attendees: ['mike@techstart.io', 'lisa@techstart.io', 'dev@techstart.io'],
    description: 'Demo of new features for TechStart team',
    domain: 'techstart.io',
    prepScheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'meet-3',
    title: 'Implementation Kickoff - GlobalBank',
    datetime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    attendees: ['pm@globalbank.com', 'tech.lead@globalbank.com'],
    description: 'Kickoff meeting for GlobalBank implementation project',
    domain: 'globalbank.com',
    prepScheduledFor: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'meet-4',
    title: 'Support Escalation Review - DataFlow',
    datetime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days from now
    attendees: ['support@dataflow.ai', 'cto@dataflow.ai'],
    description: 'Review of escalated support tickets with DataFlow',
    domain: 'dataflow.ai',
    prepScheduledFor: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString(),
  },
];

// GET - Fetch upcoming external meetings from calendar
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

    // Check if Google Calendar is connected
    const calendarConnector = await prisma.connector.findFirst({
      where: {
        tenantId: user.tenantId,
        connectorKey: 'google-calendar',
        status: 'real',
      },
    });

    if (!calendarConnector) {
      return NextResponse.json({
        meetings: [],
        message: 'Google Calendar not connected',
      });
    }

    // In demo/development mode, return mock meetings
    // In production, this would call Google Calendar API with the stored OAuth tokens
    // For now, we'll return mock data to demonstrate the UI

    // Get user's meeting prep config to calculate prep times
    const agentConfig = await prisma.agentConfig.findUnique({
      where: {
        userId_agentType: {
          userId: user.id,
          agentType: 'meeting_prep',
        },
      },
    });

    const prepTimingMinutes = (agentConfig?.config as { prepTimingMinutes?: number })?.prepTimingMinutes || 30;

    // Update prepScheduledFor based on user's config
    const meetingsWithConfig = MOCK_MEETINGS.map(meeting => ({
      ...meeting,
      prepScheduledFor: new Date(
        new Date(meeting.datetime).getTime() - prepTimingMinutes * 60 * 1000
      ).toISOString(),
    }));

    return NextResponse.json({
      meetings: meetingsWithConfig,
    });
  } catch (error) {
    console.error('[Meeting Prep Meetings] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
  }
}
