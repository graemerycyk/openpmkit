'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { migrateSessionToUser, getDemoSessionData } from '@/lib/demo-session';

/**
 * Component that handles migrating anonymous demo session data
 * to the authenticated user's account on first login.
 * 
 * This should be rendered on the dashboard or any authenticated page.
 */
export function SessionMigration() {
  const { data: session, status } = useSession();
  const [migrationComplete, setMigrationComplete] = useState(false);

  useEffect(() => {
    // Only run migration once when user is authenticated
    if (status !== 'authenticated' || !session?.user || migrationComplete) {
      return;
    }

    // Check if there's any demo session data to migrate
    const demoData = getDemoSessionData();
    
    if (demoData.jobRuns.length === 0) {
      setMigrationComplete(true);
      return;
    }

    // Perform migration
    const performMigration = async () => {
      const result = await migrateSessionToUser();
      
      if (result.success && result.migratedJobs > 0) {
        console.log(`Successfully migrated ${result.migratedJobs} demo jobs to your account`);
      }
      
      setMigrationComplete(true);
    };

    performMigration();
  }, [session, status, migrationComplete]);

  // This component doesn't render anything visible
  return null;
}
