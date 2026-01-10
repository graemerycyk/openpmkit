/**
 * Demo session management for tracking anonymous job runs
 * Uses localStorage to persist job count and session data across page refreshes
 */

const DEMO_JOB_COUNT_KEY = 'pmkit_demo_job_count';
const DEMO_SESSION_ID_KEY = 'pmkit_demo_session_id';
const DEMO_JOB_RUNS_KEY = 'pmkit_demo_job_runs';
const MAX_FREE_JOBS = 2;

export interface DemoJobRun {
  id: string;
  type: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  artifactTitle?: string;
}

/**
 * Generate a unique session ID for anonymous users
 */
function generateSessionId(): string {
  return `demo_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get or create a demo session ID
 */
export function getDemoSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem(DEMO_SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(DEMO_SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

/**
 * Get the current demo job count from localStorage
 */
export function getDemoJobCount(): number {
  if (typeof window === 'undefined') return 0;
  
  const count = localStorage.getItem(DEMO_JOB_COUNT_KEY);
  return count ? parseInt(count, 10) : 0;
}

/**
 * Increment the demo job count
 */
export function incrementDemoJobCount(): number {
  if (typeof window === 'undefined') return 0;
  
  const currentCount = getDemoJobCount();
  const newCount = currentCount + 1;
  localStorage.setItem(DEMO_JOB_COUNT_KEY, newCount.toString());
  return newCount;
}

/**
 * Check if the user has exceeded the free job limit
 */
export function hasExceededFreeJobLimit(): boolean {
  return getDemoJobCount() >= MAX_FREE_JOBS;
}

/**
 * Get the maximum number of free jobs allowed
 */
export function getMaxFreeJobs(): number {
  return MAX_FREE_JOBS;
}

/**
 * Reset the demo job count (used after successful authentication)
 */
export function resetDemoJobCount(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DEMO_JOB_COUNT_KEY);
}

/**
 * Store a job run in local storage
 */
export function storeDemoJobRun(jobRun: DemoJobRun): void {
  if (typeof window === 'undefined') return;
  
  const existingRuns = getDemoJobRuns();
  existingRuns.push(jobRun);
  localStorage.setItem(DEMO_JOB_RUNS_KEY, JSON.stringify(existingRuns));
  
  // Also store on server for persistence
  const sessionId = getDemoSessionId();
  fetch('/api/demo/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId, jobRun }),
  }).catch(console.error);
}

/**
 * Get all stored demo job runs
 */
export function getDemoJobRuns(): DemoJobRun[] {
  if (typeof window === 'undefined') return [];
  
  const runs = localStorage.getItem(DEMO_JOB_RUNS_KEY);
  return runs ? JSON.parse(runs) : [];
}

/**
 * Get all demo session data for migration after login
 */
export function getDemoSessionData(): {
  sessionId: string;
  jobCount: number;
  jobRuns: DemoJobRun[];
} {
  return {
    sessionId: getDemoSessionId(),
    jobCount: getDemoJobCount(),
    jobRuns: getDemoJobRuns(),
  };
}

/**
 * Migrate anonymous session to authenticated user
 */
export async function migrateSessionToUser(): Promise<{
  success: boolean;
  migratedJobs: number;
  error?: string;
}> {
  const sessionData = getDemoSessionData();
  
  if (!sessionData.sessionId || sessionData.jobRuns.length === 0) {
    return { success: true, migratedJobs: 0 };
  }
  
  try {
    const response = await fetch('/api/demo/session', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        anonymousSessionId: sessionData.sessionId,
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Clear local session data after successful migration
      clearDemoSession();
      return { success: true, migratedJobs: data.migratedJobs || 0 };
    }
    
    return { success: false, migratedJobs: 0, error: data.error };
  } catch (error) {
    console.error('Session migration error:', error);
    return { 
      success: false, 
      migratedJobs: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Clear all demo session data (used after migration)
 */
export function clearDemoSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DEMO_JOB_COUNT_KEY);
  localStorage.removeItem(DEMO_SESSION_ID_KEY);
  localStorage.removeItem(DEMO_JOB_RUNS_KEY);
}
