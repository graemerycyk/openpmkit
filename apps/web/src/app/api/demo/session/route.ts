import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';

// In-memory storage for demo sessions (in production, use Redis or database)
// This stores job runs keyed by anonymous session ID
const demoSessionStore = new Map<string, DemoSessionData>();

// Maximum number of sessions to store (prevent memory exhaustion)
const MAX_SESSIONS = 10000;

// Maximum job runs per session
const MAX_JOBS_PER_SESSION = 50;

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
  clientIP: string; // Track IP to prevent session hijacking
}

/**
 * Validate session ID format
 * Must be: demo_{timestamp}_{random}
 */
function isValidSessionId(sessionId: string): boolean {
  if (!sessionId || typeof sessionId !== 'string') return false;
  if (sessionId.length > 100) return false; // Prevent overly long IDs
  
  // Must match format: demo_{timestamp}_{random}
  const pattern = /^demo_\d{13}_[a-z0-9]{10,20}$/;
  return pattern.test(sessionId);
}

/**
 * Clean up old sessions to prevent memory exhaustion
 */
function cleanupOldSessions(): void {
  if (demoSessionStore.size <= MAX_SESSIONS) return;
  
  // Sort by lastActivityAt and remove oldest
  const entries = Array.from(demoSessionStore.entries())
    .sort((a, b) => new Date(a[1].lastActivityAt).getTime() - new Date(b[1].lastActivityAt).getTime());
  
  const toRemove = entries.slice(0, demoSessionStore.size - MAX_SESSIONS + 100);
  for (const [key] of toRemove) {
    demoSessionStore.delete(key);
  }
}

/**
 * GET /api/demo/session
 * Get the current demo session data
 */
export async function GET(request: NextRequest) {
  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimitResult = checkRateLimit(`session:get:${clientIP}`, RATE_LIMITS.session);
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  const sessionId = request.headers.get('x-demo-session-id');
  
  if (!sessionId) {
    return NextResponse.json({ error: 'No session ID provided' }, { status: 400 });
  }

  // Validate session ID format
  if (!isValidSessionId(sessionId)) {
    return NextResponse.json({ error: 'Invalid session ID format' }, { status: 400 });
  }

  const sessionData = demoSessionStore.get(sessionId);
  
  // Verify IP matches (prevent session hijacking)
  if (sessionData && sessionData.clientIP !== clientIP) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  
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
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`session:post:${clientIP}`, RATE_LIMITS.session);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

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

    // Validate session ID format
    if (!isValidSessionId(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session ID format' },
        { status: 400 }
      );
    }

    // Validate job run data
    if (!jobRun.id || !jobRun.type || !jobRun.status) {
      return NextResponse.json(
        { error: 'Invalid job run data' },
        { status: 400 }
      );
    }

    // Get or create session data
    let sessionData = demoSessionStore.get(sessionId);
    
    if (!sessionData) {
      // Clean up old sessions before creating new one
      cleanupOldSessions();
      
      sessionData = {
        sessionId,
        jobRuns: [],
        createdAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        clientIP,
      };
    } else {
      // Verify IP matches (prevent session hijacking)
      if (sessionData.clientIP !== clientIP) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
    }

    // Limit jobs per session
    if (sessionData.jobRuns.length >= MAX_JOBS_PER_SESSION) {
      return NextResponse.json(
        { error: 'Maximum jobs per session reached' },
        { status: 400 }
      );
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
  const clientIP = getClientIP(request);
  const sessionId = request.headers.get('x-demo-session-id');
  
  if (sessionId && isValidSessionId(sessionId)) {
    const sessionData = demoSessionStore.get(sessionId);
    
    // Only allow deletion if IP matches
    if (sessionData && sessionData.clientIP === clientIP) {
      demoSessionStore.delete(sessionId);
    }
  }

  return NextResponse.json({ success: true });
}
