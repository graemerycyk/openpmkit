import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';

// Zendesk OAuth scopes
const ZENDESK_SCOPES = 'tickets:read users:read';

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
    const clientId = process.env.ZENDESK_CLIENT_ID;
    const subdomain = process.env.ZENDESK_SUBDOMAIN;
    if (!clientId) {
      console.error('[Zendesk OAuth] ZENDESK_CLIENT_ID not configured');
      return NextResponse.json(
        { error: 'Zendesk integration not configured' },
        { status: 500 }
      );
    }

    if (!subdomain) {
      console.error('[Zendesk OAuth] ZENDESK_SUBDOMAIN not configured');
      return NextResponse.json(
        { error: 'Zendesk subdomain not configured' },
        { status: 500 }
      );
    }

    // Generate state for CSRF protection
    const state = randomBytes(32).toString('hex');

    // Store state in cookie for validation in callback
    const cookieStore = await cookies();
    cookieStore.set('zendesk_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    // Build Zendesk OAuth URL
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/connectors/zendesk/callback`;
    const authUrl = new URL(`https://${subdomain}.zendesk.com/oauth/authorizations/new`);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('scope', ZENDESK_SCOPES);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_type', 'code');

    // Redirect to Zendesk OAuth consent page
    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('[Zendesk OAuth] Authorize error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Zendesk OAuth' },
      { status: 500 }
    );
  }
}
