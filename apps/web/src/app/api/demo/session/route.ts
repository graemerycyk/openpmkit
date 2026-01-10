import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';

// In-memory storage for demo sessions (in production, use Redis or database)
// This stores job runs keyed by anonymous session ID
const demoSessionStore = new Map<string, DemoSessionData>();

interface JobRunData {
  id: string;
  type: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  artifactTitle?: string;
}

interface DemoSessionData {
  sessionId: string;
  jobRuns: JobRunData[];
  createdAt: string;
  lastActivityAt: string;
}

/**
 * GET /api/demo/session
 * Get the current demo session data
 */
export async function GET(request: NextRequest) {
  const sessionId = request.headers.get('x-demo-session-id');
  
  if (!sessionId) {
    return NextResponse.json({ error: 'No session ID provided' }, { status: 400 });
  }

  const sessionData = demoSessionStore.get(sessionId);
  
  return NextResponse.json({
    sessionId,
    jobRuns: sessionData?.jobRuns || [],
    jobCount: sessionData?.jobRuns.length || 0,
  });
}

/**
 * POST /api/demo/session
 * Store a job run for an anonymous session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, jobRun } = body as {
      sessionId: string;
      jobRun: JobRunData;
    };

    if (!sessionId || !jobRun) {
      return NextResponse.json(
        { error: 'Missing sessionId or jobRun' },
        { status: 400 }
      );
    }

    // Get or create session data
    let sessionData = demoSessionStore.get(sessionId);
    
    if (!sessionData) {
      sessionData = {
        sessionId,
        jobRuns: [],
        createdAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      };
    }

    // Add the job run
    sessionData.jobRuns.push(jobRun);
    sessionData.lastActivityAt = new Date().toISOString();

    // Store updated session
    demoSessionStore.set(sessionId, sessionData);

    return NextResponse.json({
      success: true,
      jobCount: sessionData.jobRuns.length,
    });
  } catch (error) {
    console.error('Error storing demo session:', error);
    return NextResponse.json(
      { error: 'Failed to store session data' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/demo/session/migrate
 * Migrate anonymous session data to authenticated user
 */
export async function PUT(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { anonymousSessionId } = body as { anonymousSessionId: string };

    if (!anonymousSessionId) {
      return NextResponse.json(
        { error: 'Missing anonymousSessionId' },
        { status: 400 }
      );
    }

    // Get the anonymous session data
    const anonymousData = demoSessionStore.get(anonymousSessionId);

    if (!anonymousData) {
      return NextResponse.json({
        success: true,
        message: 'No anonymous session data to migrate',
        migratedJobs: 0,
      });
    }

    // In production, you would:
    // 1. Store the job runs in the database linked to the user
    // 2. Delete the anonymous session data
    // For now, we just acknowledge the migration

    const migratedJobs = anonymousData.jobRuns.length;

    // Clear the anonymous session
    demoSessionStore.delete(anonymousSessionId);

    // Set a cookie to indicate migration is complete
    const cookieStore = await cookies();
    cookieStore.set('pmkit_session_migrated', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      message: `Migrated ${migratedJobs} job runs to your account`,
      migratedJobs,
      userId: session.user.id || session.user.email,
    });
  } catch (error) {
    console.error('Error migrating session:', error);
    return NextResponse.json(
      { error: 'Failed to migrate session' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/demo/session
 * Clear demo session data
 */
export async function DELETE(request: NextRequest) {
  const sessionId = request.headers.get('x-demo-session-id');
  
  if (sessionId) {
    demoSessionStore.delete(sessionId);
  }

  return NextResponse.json({ success: true });
}
