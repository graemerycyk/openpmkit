'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface UsageLimitBannerProps {
  workflowName: string;
  used: number;
  limit: number;
}

export function UsageLimitBanner({ workflowName, used, limit }: UsageLimitBannerProps) {
  // Don't show if limit is -1 (unlimited) or not exceeded
  if (limit === -1 || used <= limit) {
    return null;
  }

  return (
    <Alert className="border-amber-200 bg-amber-50 text-amber-800">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        You&apos;ve exceeded your monthly limit for {workflowName} ({used}/{limit} used).
        Your agents will continue to run.
      </AlertDescription>
    </Alert>
  );
}
