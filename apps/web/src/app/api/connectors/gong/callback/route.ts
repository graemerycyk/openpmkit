import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { encryptTokens } from '@pmkit/core';

interface GongTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
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
      console.error('[Gong OAuth] User denied or error:', error);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=${error}`
      );
    }

    // Validate state for CSRF protection
    const cookieStore = await cookies();
    const storedState = cookieStore.get('gong_oauth_state')?.value;
    cookieStore.delete('gong_oauth_state');

    if (!state || state !== storedState) {
      console.error('[Gong OAuth] State mismatch - possible CSRF');
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
    const clientId = process.env.GONG_CLIENT_ID;
    const clientSecret = process.env.GONG_CLIENT_SECRET;
    const encryptionKey = process.env.CONNECTOR_ENCRYPTION_KEY;

    if (!clientId || !clientSecret) {
      console.error('[Gong OAuth] Missing GONG_CLIENT_ID or GONG_CLIENT_SECRET');
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=config_error`
      );
    }

    if (!encryptionKey) {
      console.error('[Gong OAuth] Missing CONNECTOR_ENCRYPTION_KEY');
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=config_error`
      );
    }

    const redirectUri = `${process.env.NEXTAUTH_URL}/api/connectors/gong/callback`;

    // Gong uses Basic auth for token exchange
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenResponse = await fetch('https://app.gong.io/oauth2/generate-customer-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData: GongTokenResponse = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('[Gong OAuth] Token exchange failed:', tokenData);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=token_error`
      );
    }

    // Get user from database
    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
    });

    if (!user) {
      console.error('[Gong OAuth] User not found in database:', session.user.email);
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
        expiresIn: tokenData.expires_in,
        scope: tokenData.scope,
      },
      encryptionKey
    );

    // Upsert connector install
    const existingInstall = await prisma.connectorInstall.findUnique({
      where: {
        tenantId_connectorKey: {
          tenantId: user.tenantId,
          connectorKey: 'gong',
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
          expiresAt: tokenData.expires_in
            ? new Date(Date.now() + tokenData.expires_in * 1000)
            : null,
        },
      });
    } else {
      const install = await prisma.connectorInstall.create({
        data: {
          tenantId: user.tenantId,
          connectorKey: 'gong',
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
          expiresAt: tokenData.expires_in
            ? new Date(Date.now() + tokenData.expires_in * 1000)
            : null,
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
        resourceId: 'gong',
        details: {},
      },
    });

    console.log(`[Gong OAuth] Successfully connected for tenant ${user.tenantId}`);

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/settings/integrations?success=gong_connected&workspace=Gong`
    );
  } catch (error) {
    console.error('[Gong OAuth] Callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/settings/integrations?error=server_error`
    );
  }
}
