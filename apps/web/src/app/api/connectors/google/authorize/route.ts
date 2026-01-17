import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';

// Google OAuth scopes for Gmail, Drive, Calendar
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly', // Read emails
  'https://www.googleapis.com/auth/drive.readonly', // Read Drive files
  'https://www.googleapis.com/auth/calendar.readonly', // Read calendar events
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

    // Validate environment - reuse Google OAuth client from NextAuth
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('[Google OAuth] GOOGLE_CLIENT_ID not configured');
      return NextResponse.json(
        { error: 'Google integration not configured' },
        { status: 500 }
      );
    }

    // Generate state for CSRF protection
    const state = randomBytes(32).toString('hex');

    // Store state in cookie for validation in callback
    const cookieStore = await cookies();
    cookieStore.set('google_connector_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    // Build Google OAuth URL
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/connectors/google/callback`;
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('scope', GOOGLE_SCOPES);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('access_type', 'offline'); // Get refresh token
    authUrl.searchParams.set('prompt', 'consent'); // Force consent to get refresh token
    // Pre-fill with user's email
    if (session.user.email) {
      authUrl.searchParams.set('login_hint', session.user.email);
    }

    // Redirect to Google OAuth consent page
    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('[Google OAuth] Authorize error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth' },
      { status: 500 }
    );
  }
}
