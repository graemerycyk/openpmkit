import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { decryptTokens } from '@pmkit/core';

interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  is_member: boolean;
  num_members?: number;
}

interface SlackChannelsResponse {
  ok: boolean;
  error?: string;
  channels?: SlackChannel[];
  response_metadata?: {
    next_cursor?: string;
  };
}

/**
 * GET /api/connectors/slack/channels
 *
 * Fetches all Slack channels where the bot is a member.
 * Used by agent pages to populate channel selection UI.
 */
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

    // Check if Slack is connected
    const slackInstall = await prisma.connectorInstall.findUnique({
      where: {
        tenantId_connectorKey: {
          tenantId: user.tenantId,
          connectorKey: 'slack',
        },
      },
      include: {
        credentials: true,
      },
    });

    if (!slackInstall || slackInstall.status !== 'real') {
      return NextResponse.json(
        { error: 'Slack not connected', code: 'SLACK_NOT_CONNECTED' },
        { status: 400 }
      );
    }

    if (!slackInstall.credentials[0]) {
      return NextResponse.json(
        { error: 'No credentials found', code: 'NO_CREDENTIALS' },
        { status: 400 }
      );
    }

    const encryptionKey = process.env.CONNECTOR_ENCRYPTION_KEY;
    if (!encryptionKey) {
      console.error('[Slack Channels] Missing CONNECTOR_ENCRYPTION_KEY');
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    // Decrypt tokens
    const tokens = decryptTokens(slackInstall.credentials[0].encryptedBlob, encryptionKey);

    // Fetch channels from Slack
    const allChannels: SlackChannel[] = [];
    let cursor: string | undefined;

    // Fetch public and private channels
    do {
      const url = new URL('https://slack.com/api/conversations.list');
      url.searchParams.set('types', 'public_channel,private_channel');
      url.searchParams.set('exclude_archived', 'true');
      url.searchParams.set('limit', '200');
      if (cursor) {
        url.searchParams.set('cursor', cursor);
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      const data: SlackChannelsResponse = await response.json();

      if (!data.ok) {
        console.error('[Slack Channels] API error:', data.error);
        return NextResponse.json(
          { error: `Slack API error: ${data.error}` },
          { status: 400 }
        );
      }

      if (data.channels) {
        allChannels.push(...data.channels);
      }

      cursor = data.response_metadata?.next_cursor;
    } while (cursor);

    // Format response - only include channels where the bot is a member
    const channels = allChannels
      .filter((c) => c.is_member)
      .map((c) => ({
        id: c.id,
        name: c.name,
        isPrivate: c.is_private,
        memberCount: c.num_members,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      channels,
      total: channels.length,
    });
  } catch (error) {
    console.error('[Slack Channels] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
  }
}
