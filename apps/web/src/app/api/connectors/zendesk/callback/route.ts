import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { encryptTokens } from '@pmkit/core';

interface ZendeskTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  scope: string;
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
      console.error('[Zendesk OAuth] User denied or error:', error);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=${error}`
      );
    }

    // Validate state for CSRF protection
    const cookieStore = await cookies();
    const storedState = cookieStore.get('zendesk_oauth_state')?.value;
    cookieStore.delete('zendesk_oauth_state');

    if (!state || state !== storedState) {
      console.error('[Zendesk OAuth] State mismatch - possible CSRF');
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
    const clientId = process.env.ZENDESK_CLIENT_ID;
    const clientSecret = process.env.ZENDESK_CLIENT_SECRET;
    const subdomain = process.env.ZENDESK_SUBDOMAIN;
    const encryptionKey = process.env.CONNECTOR_ENCRYPTION_KEY;

    if (!clientId || !clientSecret || !subdomain) {
      console.error('[Zendesk OAuth] Missing configuration');
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=config_error`
      );
    }

    if (!encryptionKey) {
      console.error('[Zendesk OAuth] Missing CONNECTOR_ENCRYPTION_KEY');
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=config_error`
      );
    }

    const redirectUri = `${process.env.NEXTAUTH_URL}/api/connectors/zendesk/callback`;

    const tokenResponse = await fetch(`https://${subdomain}.zendesk.com/oauth/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        scope: 'tickets:read users:read',
      }),
    });

    const tokenData: ZendeskTokenResponse = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('[Zendesk OAuth] Token exchange failed:', tokenData);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=token_error`
      );
    }

    // Get user from database
    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
    });

    if (!user) {
      console.error('[Zendesk OAuth] User not found in database:', session.user.email);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=user_not_found`
      );
    }

    // Encrypt tokens for storage
    const encryptedBlob = encryptTokens(
      {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenType: tokenData.token_type,
        scope: tokenData.scope,
        subdomain,
      },
      encryptionKey
    );

    // Upsert connector install
    const existingInstall = await prisma.connectorInstall.findUnique({
      where: {
        tenantId_connectorKey: {
          tenantId: user.tenantId,
          connectorKey: 'zendesk',
        },
      },
    });

    if (existingInstall) {
      await prisma.connectorInstall.update({
        where: { id: existingInstall.id },
        data: { status: 'real', updatedAt: new Date() },
      });

      await prisma.connectorCredential.deleteMany({
        where: { installId: existingInstall.id },
      });

      await prisma.connectorCredential.create({
        data: {
          installId: existingInstall.id,
          encryptedBlob,
          scopesJson: { scopes: tokenData.scope?.split(' ') || [] },
          refreshable: !!tokenData.refresh_token,
        },
      });
    } else {
      const install = await prisma.connectorInstall.create({
        data: {
          tenantId: user.tenantId,
          connectorKey: 'zendesk',
          status: 'real',
          createdBy: user.id,
        },
      });

      await prisma.connectorCredential.create({
        data: {
          installId: install.id,
          encryptedBlob,
          scopesJson: { scopes: tokenData.scope?.split(' ') || [] },
          refreshable: !!tokenData.refresh_token,
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
        resourceId: 'zendesk',
        details: { subdomain },
      },
    });

    console.log(`[Zendesk OAuth] Successfully connected subdomain "${subdomain}" for tenant ${user.tenantId}`);

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/settings/integrations?success=zendesk_connected&workspace=${encodeURIComponent(subdomain)}`
    );
  } catch (error) {
    console.error('[Zendesk OAuth] Callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/settings/integrations?error=server_error`
    );
  }
}
