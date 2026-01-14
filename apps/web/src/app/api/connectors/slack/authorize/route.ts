import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';

// Slack OAuth scopes needed for Daily Brief agent
const SLACK_SCOPES = [
  'channels:history', // Read messages from public channels
  'channels:read', // List public channels
  'groups:history', // Read messages from private channels
  'groups:read', // List private channels
  'users:read', // Get user info for message authors
].join(',');

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
    const clientId = process.env.SLACK_CLIENT_ID;
    if (!clientId) {
      console.error('[Slack OAuth] SLACK_CLIENT_ID not configured');
      return NextResponse.json(
        { error: 'Slack integration not configured' },
        { status: 500 }
      );
    }

    // Generate state for CSRF protection
    const state = randomBytes(32).toString('hex');

    // Store state in cookie for validation in callback
    const cookieStore = await cookies();
    cookieStore.set('slack_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    // Build Slack OAuth URL
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/connectors/slack/callback`;
    const authUrl = new URL('https://slack.com/oauth/v2/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('scope', SLACK_SCOPES);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);

    // Redirect to Slack OAuth consent page
    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('[Slack OAuth] Authorize error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Slack OAuth' },
      { status: 500 }
    );
  }
}
