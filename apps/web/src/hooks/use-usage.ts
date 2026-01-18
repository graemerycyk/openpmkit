'use client';

import { useState, useEffect } from 'react';

interface UsageData {
  used: number;
  limit: number;
  exceeded: boolean;
  displayName: string;
}

interface UsageSummary {
  usage: Record<string, UsageData>;
  month: string;
  isUnlimited: boolean;
}

export function useUsage(jobType?: string) {
  const [data, setData] = useState<UsageSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch('/api/usage/summary');
        if (res.ok) {
          const summary = await res.json();
          setData(summary);
        } else {
          setError('Failed to fetch usage');
        }
      } catch {
        setError('Failed to fetch usage');
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsage();
  }, []);

  // Get usage for a specific job type
  const getUsage = (type: string): UsageData | null => {
    return data?.usage[type] || null;
  };

  // Check if a specific job type has exceeded its limit
  const isExceeded = (type: string): boolean => {
    const usage = getUsage(type);
    if (!usage || usage.limit === -1) return false;
    return usage.used > usage.limit;
  };

  // If a specific job type was requested, return that usage directly
  const currentUsage = jobType ? getUsage(jobType) : null;

  return {
    data,
    isLoading,
    error,
    getUsage,
    isExceeded,
    currentUsage,
    isUnlimited: data?.isUnlimited || false,
  };
}
