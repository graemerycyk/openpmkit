import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';

// Atlassian OAuth scopes for Jira + Confluence
const ATLASSIAN_SCOPES = [
  'read:jira-work', // Read issues, projects, sprints
  'read:jira-user', // Read user info
  'read:confluence-content.all', // Read Confluence content
  'read:confluence-space.summary', // Read space info
  'offline_access', // Refresh tokens
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
    const clientId = process.env.ATLASSIAN_CLIENT_ID;
    if (!clientId) {
      console.error('[Atlassian OAuth] ATLASSIAN_CLIENT_ID not configured');
      return NextResponse.json(
        { error: 'Atlassian integration not configured' },
        { status: 500 }
      );
    }

    // Generate state for CSRF protection
    const state = randomBytes(32).toString('hex');

    // Store state in cookie for validation in callback
    const cookieStore = await cookies();
    cookieStore.set('atlassian_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    // Build Atlassian OAuth URL
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/connectors/atlassian/callback`;
    const authUrl = new URL('https://auth.atlassian.com/authorize');
    authUrl.searchParams.set('audience', 'api.atlassian.com');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('scope', ATLASSIAN_SCOPES);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('prompt', 'consent');

    // Redirect to Atlassian OAuth consent page
    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('[Atlassian OAuth] Authorize error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Atlassian OAuth' },
      { status: 500 }
    );
  }
}
