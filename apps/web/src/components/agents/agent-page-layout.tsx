'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { UsageLimitBanner } from '@/components/usage-limit-banner';

type AgentStatus = 'active' | 'paused' | 'coming-soon';

interface AgentPageLayoutProps {
  /** Agent display name */
  title: string;
  /** Agent description shown below title */
  description: string;
  /** Current agent status */
  status?: AgentStatus;
  /** Whether the page is loading */
  isLoading?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Success message to display */
  success?: string | null;
  /** Usage information for the banner */
  usage?: {
    workflowName: string;
    used: number;
    limit: number;
  };
  /** Page content */
  children: ReactNode;
}

export function AgentPageLayout({
  title,
  description,
  status,
  isLoading = false,
  error,
  success,
  usage,
  children,
}: AgentPageLayoutProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Determine badge variant and text
  const getBadge = () => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-600">Active</Badge>;
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>;
      case 'coming-soon':
        return <Badge variant="secondary">Coming Soon</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
        {getBadge()}
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Usage Limit Banner */}
      {usage && (
        <UsageLimitBanner
          workflowName={usage.workflowName}
          used={usage.used}
          limit={usage.limit}
        />
      )}

      {/* Page content */}
      {children}
    </div>
  );
}
