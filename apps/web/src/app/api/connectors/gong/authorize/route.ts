import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';

// Gong OAuth scopes
const GONG_SCOPES = [
  'api:calls:read:basic',
  'api:calls:read:extensive',
  'api:users:read',
  'api:meetings:user:read',
].join(' ');

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Validate environment
    const clientId = process.env.GONG_CLIENT_ID;
    if (!clientId) {
      console.error('[Gong OAuth] GONG_CLIENT_ID not configured');
      return NextResponse.json(
        { error: 'Gong integration not configured' },
        { status: 500 }
      );
    }

    // Generate state for CSRF protection
    const state = randomBytes(32).toString('hex');

    // Store state in cookie for validation in callback
    const cookieStore = await cookies();
    cookieStore.set('gong_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    // Build Gong OAuth URL
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/connectors/gong/callback`;
    const authUrl = new URL('https://app.gong.io/oauth2/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('scope', GONG_SCOPES);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_type', 'code');

    // Redirect to Gong OAuth consent page
    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('[Gong OAuth] Authorize error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Gong OAuth' },
      { status: 500 }
    );
  }
}
