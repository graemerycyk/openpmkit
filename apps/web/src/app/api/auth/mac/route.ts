import { NextRequest, NextResponse } from 'next/server';

/**
 * Mac app authentication endpoint.
 * Redirects to Google OAuth with a special callback that returns tokens to the Mac app.
 *
 * Flow:
 * 1. Mac app opens: getpmkit.com/api/auth/mac?callback=pmkit://auth
 * 2. User signs in with Google
 * 3. Callback redirects to pmkit://auth?token=...&refreshToken=...
 * 4. Mac app receives tokens via URL scheme handler
 */
export async function GET(req: NextRequest) {
  const callback = req.nextUrl.searchParams.get('callback') || 'pmkit://auth';

  // Store the callback URL in a secure cookie for the callback handler
  const stateData = {
    callback,
    timestamp: Date.now(),
  };
  const state = Buffer.from(JSON.stringify(stateData)).toString('base64url');

  // Build Google OAuth URL
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL || 'https://getpmkit.com'}/api/auth/mac/callback`;

  if (!clientId) {
    return NextResponse.json(
      { error: 'Google OAuth not configured' },
      { status: 500 }
    );
  }

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  return NextResponse.redirect(authUrl.toString());
}
