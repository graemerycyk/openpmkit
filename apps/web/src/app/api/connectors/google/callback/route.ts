import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { encryptTokens } from '@pmkit/core';

interface GoogleTokenResponse {
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
      console.error('[Google OAuth] User denied or error:', error);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=${error}`
      );
    }

    // Validate state for CSRF protection
    const cookieStore = await cookies();
    const storedState = cookieStore.get('google_connector_oauth_state')?.value;
    cookieStore.delete('google_connector_oauth_state');

    if (!state || state !== storedState) {
      console.error('[Google OAuth] State mismatch - possible CSRF');
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
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const encryptionKey = process.env.CONNECTOR_ENCRYPTION_KEY;

    if (!clientId || !clientSecret) {
      console.error('[Google OAuth] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=config_error`
      );
    }

    if (!encryptionKey) {
      console.error('[Google OAuth] Missing CONNECTOR_ENCRYPTION_KEY');
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=config_error`
      );
    }

    const redirectUri = `${process.env.NEXTAUTH_URL}/api/connectors/google/callback`;

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData: GoogleTokenResponse = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('[Google OAuth] Token exchange failed:', tokenData);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings/integrations?error=token_error`
      );
    }

    // Get user from database
    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
    });

    if (!user) {
      console.error('[Google OAuth] User not found in database:', session.user.email);
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

    // Save credentials for Gmail, Google Drive, and Google Calendar
    const googleConnectors = ['gmail', 'google-drive', 'google-calendar'];

    for (const connectorKey of googleConnectors) {
      const existingInstall = await prisma.connectorInstall.findUnique({
        where: {
          tenantId_connectorKey: {
            tenantId: user.tenantId,
            connectorKey,
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
            connectorKey,
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
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.id,
        action: 'connector_oauth_completed',
        resourceType: 'connector_install',
        resourceId: 'google',
        details: {
          connectors: googleConnectors,
          email: session.user.email,
        },
      },
    });

    console.log(`[Google OAuth] Successfully connected Gmail, Drive, Calendar for tenant ${user.tenantId}`);

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/settings/integrations?success=google_connected&workspace=Google`
    );
  } catch (error) {
    console.error('[Google OAuth] Callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/settings/integrations?error=server_error`
    );
  }
}
