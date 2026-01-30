import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { SignJWT } from 'jose';

/**
 * Mac app OAuth callback handler.
 * Exchanges the authorization code for tokens and redirects to the Mac app.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const error = req.nextUrl.searchParams.get('error');

  // Parse state to get callback URL
  let callback = 'pmkit://auth';
  if (state) {
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
      callback = stateData.callback || callback;
    } catch {
      // Use default callback
    }
  }

  // Handle OAuth errors
  if (error) {
    const errorUrl = new URL(callback);
    errorUrl.searchParams.set('error', error);
    return NextResponse.redirect(errorUrl.toString());
  }

  if (!code) {
    const errorUrl = new URL(callback);
    errorUrl.searchParams.set('error', 'missing_code');
    return NextResponse.redirect(errorUrl.toString());
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXTAUTH_URL || 'https://getpmkit.com'}/api/auth/mac/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();

    // Get user info from Google
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userInfo = await userInfoResponse.json();
    const email = userInfo.email;
    const name = userInfo.name || email.split('@')[0];

    // Find or create user in database
    let user = await prisma.user.findFirst({
      where: { email },
      include: { tenant: true },
    });

    if (!user) {
      // Create tenant and user
      const emailDomain = email.split('@')[1] || 'default';
      const tenantName = emailDomain.split('.')[0] || 'My Workspace';

      let tenant = await prisma.tenant.findFirst({
        where: { slug: emailDomain },
      });

      if (!tenant) {
        tenant = await prisma.tenant.create({
          data: {
            name: tenantName.charAt(0).toUpperCase() + tenantName.slice(1),
            slug: emailDomain,
          },
        });
      }

      user = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email,
          name,
          avatarUrl: userInfo.picture,
          role: 'admin',
        },
        include: { tenant: true },
      });

      console.log(`[Auth/Mac] Created new user: ${email}`);
    }

    // Generate JWT tokens for the Mac app
    const secret = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'fallback-secret'
    );

    const accessToken = await new SignJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      tenantId: user.tenantId,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    const refreshToken = await new SignJWT({
      sub: user.id,
      type: 'refresh',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secret);

    // Redirect to Mac app with tokens
    const successUrl = new URL(callback);
    successUrl.searchParams.set('token', accessToken);
    successUrl.searchParams.set('refreshToken', refreshToken);

    console.log(`[Auth/Mac] User signed in: ${email}`);

    return NextResponse.redirect(successUrl.toString());
  } catch (error) {
    console.error('[Auth/Mac] Error:', error);
    const errorUrl = new URL(callback);
    errorUrl.searchParams.set('error', 'auth_failed');
    return NextResponse.redirect(errorUrl.toString());
  }
}
