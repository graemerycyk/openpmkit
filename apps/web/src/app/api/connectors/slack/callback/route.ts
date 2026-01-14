import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { encryptTokens } from '@pmkit/core';

interface SlackOAuthResponse {
  ok: boolean;
  error?: string;
  access_token?: string;
  token_type?: string;
  scope?: string;
  bot_user_id?: string;
  app_id?: string;
  team?: {
    id: string;
    name: string;
  };
  authed_user?: {
    id: string;
    access_token?: string;
    token_type?: string;
    scope?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=unauthorized`
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle user cancellation
    if (error) {
      console.error('[Slack OAuth] User denied or error:', error);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=${error}`
      );
    }

    // Validate state for CSRF protection
    const cookieStore = await cookies();
    const storedState = cookieStore.get('slack_oauth_state')?.value;
    cookieStore.delete('slack_oauth_state');

    if (!state || state !== storedState) {
      console.error('[Slack OAuth] State mismatch - possible CSRF');
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=invalid_state`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=missing_code`
      );
    }

    // Exchange code for access token
    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const encryptionKey = process.env.CONNECTOR_ENCRYPTION_KEY;

    if (!clientId || !clientSecret) {
      console.error('[Slack OAuth] Missing SLACK_CLIENT_ID or SLACK_CLIENT_SECRET');
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=config_error`
      );
    }

    if (!encryptionKey) {
      console.error('[Slack OAuth] Missing CONNECTOR_ENCRYPTION_KEY');
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=config_error`
      );
    }

    const redirectUri = `${process.env.NEXTAUTH_URL}/api/connectors/slack/callback`;

    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData: SlackOAuthResponse = await tokenResponse.json();

    if (!tokenData.ok || !tokenData.access_token) {
      console.error('[Slack OAuth] Token exchange failed:', tokenData.error);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=${tokenData.error || 'token_error'}`
      );
    }

    // Get user from database (need tenantId)
    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
    });

    if (!user) {
      console.error('[Slack OAuth] User not found in database:', session.user.email);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=user_not_found`
      );
    }

    // Encrypt tokens for storage
    const encryptedBlob = encryptTokens(
      {
        accessToken: tokenData.access_token,
        tokenType: tokenData.token_type || 'bot',
        scope: tokenData.scope,
        teamId: tokenData.team?.id,
        teamName: tokenData.team?.name,
      },
      encryptionKey
    );

    // Upsert connector install
    const existingInstall = await prisma.connectorInstall.findUnique({
      where: {
        tenantId_connectorKey: {
          tenantId: user.tenantId,
          connectorKey: 'slack',
        },
      },
    });

    if (existingInstall) {
      // Update existing install to real status
      await prisma.connectorInstall.update({
        where: { id: existingInstall.id },
        data: { status: 'real', updatedAt: new Date() },
      });

      // Upsert credential (delete old one if exists, create new)
      await prisma.connectorCredential.deleteMany({
        where: { installId: existingInstall.id },
      });

      await prisma.connectorCredential.create({
        data: {
          installId: existingInstall.id,
          encryptedBlob,
          scopesJson: { scopes: tokenData.scope?.split(',') || [] },
          refreshable: false, // Slack tokens don't expire
        },
      });
    } else {
      // Create new install with credential
      const install = await prisma.connectorInstall.create({
        data: {
          tenantId: user.tenantId,
          connectorKey: 'slack',
          status: 'real',
          createdBy: user.id,
        },
      });

      await prisma.connectorCredential.create({
        data: {
          installId: install.id,
          encryptedBlob,
          scopesJson: { scopes: tokenData.scope?.split(',') || [] },
          refreshable: false,
        },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.id,
        action: 'connector_oauth_completed',
        resourceType: 'connector_install',
        resourceId: 'slack',
        details: {
          teamId: tokenData.team?.id,
          teamName: tokenData.team?.name,
        },
      },
    });

    console.log(
      `[Slack OAuth] Successfully connected workspace "${tokenData.team?.name}" for tenant ${user.tenantId}`
    );

    // Redirect to integrations page with success
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/settings/integrations?success=slack_connected&workspace=${encodeURIComponent(tokenData.team?.name || 'Slack')}`
    );
  } catch (error) {
    console.error('[Slack OAuth] Callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/settings/integrations?error=server_error`
    );
  }
}
