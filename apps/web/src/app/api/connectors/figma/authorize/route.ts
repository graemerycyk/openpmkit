import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';

// Figma OAuth scopes
const FIGMA_SCOPES = 'file_read';

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
    const clientId = process.env.FIGMA_CLIENT_ID;
    if (!clientId) {
      console.error('[Figma OAuth] FIGMA_CLIENT_ID not configured');
      return NextResponse.json(
        { error: 'Figma integration not configured' },
        { status: 500 }
      );
    }

    // Generate state for CSRF protection
    const state = randomBytes(32).toString('hex');

    // Store state in cookie for validation in callback
    const cookieStore = await cookies();
    cookieStore.set('figma_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    // Build Figma OAuth URL
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/connectors/figma/callback`;
    const authUrl = new URL('https://www.figma.com/oauth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('scope', FIGMA_SCOPES);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_type', 'code');

    // Redirect to Figma OAuth consent page
    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('[Figma OAuth] Authorize error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Figma OAuth' },
      { status: 500 }
    );
  }
}
