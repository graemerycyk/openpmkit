'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  Presentation,
  XCircle,
} from 'lucide-react';

interface DeckJob {
  id: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  result: {
    stats?: {
      slidesGenerated: number;
      dataPointsUsed: number;
      latencyMs: number;
    };
  } | null;
  config: {
    title?: string;
    deckType?: string;
    audience?: string;
  } | null;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return (
        <Badge className="bg-green-600">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Failed
        </Badge>
      );
    case 'running':
      return (
        <Badge variant="secondary">
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          Running
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          <Clock className="mr-1 h-3 w-3" />
          {status}
        </Badge>
      );
  }
}

function DeckCard({ job }: { job: DeckJob }) {
  const startDate = job.startedAt ? new Date(job.startedAt) : null;
  const duration = job.result?.stats?.latencyMs
    ? `${(job.result.stats.latencyMs / 1000).toFixed(1)}s`
    : null;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-cobalt-100 p-3">
              <Presentation className="h-5 w-5 text-cobalt-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">
                  {job.config?.title || 'Deck Content'}
                </h3>
                <StatusBadge status={job.status} />
              </div>
              <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                {startDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {startDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                )}
                {job.config?.deckType && (
                  <Badge variant="outline" className="text-xs">
                    {job.config.deckType}
                  </Badge>
                )}
                {duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {duration}
                  </span>
                )}
                {job.result?.stats && (
                  <span>{job.result.stats.slidesGenerated} slides</span>
                )}
              </div>
              {job.error && (
                <p className="mt-1 text-sm text-destructive">{job.error}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/agents/deck-content/${job.id}`}>
              View
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DeckHistoryPage() {
  const [jobs, setJobs] = useState<DeckJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/agents/deck-content/history');
        if (res.ok) {
          const data = await res.json();
          setJobs(data.jobs || []);
        }
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Deck History</h1>
          <p className="text-muted-foreground">
            View your generated deck content
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/agents/deck-content">Back to Agent</Link>
        </Button>
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Presentation className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-medium">No decks yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your deck content will appear here.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/agents/deck-content">Generate Content</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <DeckCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
