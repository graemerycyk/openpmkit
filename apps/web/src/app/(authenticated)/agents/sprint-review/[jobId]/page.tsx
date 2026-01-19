'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  GitBranch,
  Loader2,
  Repeat,
  Target,
  TrendingUp,
  XCircle,
} from 'lucide-react';

interface SprintDetail {
  id: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  result: {
    stats?: {
      issuesCompleted: number;
      issuesCarryover: number;
      storyPointsCompleted: number;
      storyPointsPlanned: number;
      latencyMs: number;
    };
  } | null;
  config: {
    sprintName?: string;
    sprintGoal?: string;
    startDate?: string;
    endDate?: string;
  } | null;
  artifact: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
  } | null;
  sources: Array<{
    id: string;
    type: string;
    title: string;
    url: string | null;
    metadata: Record<string, unknown>;
    fetchedAt: string;
  }>;
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

export default function SprintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [sprint, setSprint] = useState<SprintDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSprint() {
      try {
        const res = await fetch(`/api/agents/sprint-review/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          setSprint(data.sprint);
        }
      } catch (err) {
        console.error('Failed to fetch sprint:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSprint();
  }, [jobId]);

  const handleDownload = () => {
    if (!sprint?.artifact) return;

    const blob = new Blob([sprint.artifact.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sprint.artifact.title.replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-medium">Sprint review not found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This sprint review could not be found.
            </p>
            <Button className="mt-4" variant="outline" onClick={() => router.back()}>
              Back to History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const startDate = sprint.startedAt ? new Date(sprint.startedAt) : null;
  const completionRate =
    sprint.result?.stats?.storyPointsPlanned && sprint.result?.stats?.storyPointsCompleted
      ? Math.round(
          (sprint.result.stats.storyPointsCompleted / sprint.result.stats.storyPointsPlanned) * 100
        )
      : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold">
                {sprint.config?.sprintName || 'Sprint Review'}
              </h1>
              <StatusBadge status={sprint.status} />
            </div>
            {startDate && (
              <p className="text-muted-foreground">
                Generated on{' '}
                {startDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {sprint.artifact && (
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Sprint Goal */}
      {sprint.config?.sprintGoal && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sprint Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{sprint.config.sprintGoal}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {sprint.result?.stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Completed</span>
              </div>
              <p className="mt-1 text-2xl font-bold">
                {sprint.result.stats.issuesCompleted}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Repeat className="h-4 w-4" />
                <span className="text-sm">Carryover</span>
              </div>
              <p className="mt-1 text-2xl font-bold">
                {sprint.result.stats.issuesCarryover}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Story Points</span>
              </div>
              <p className="mt-1 text-2xl font-bold">
                {sprint.result.stats.storyPointsCompleted}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="h-4 w-4" />
                <span className="text-sm">Completion</span>
              </div>
              <p className="mt-1 text-2xl font-bold">
                {completionRate !== null ? `${completionRate}%` : '-'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error */}
      {sprint.error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm">{sprint.error}</p>
          </CardContent>
        </Card>
      )}

      {/* Review Content */}
      {sprint.artifact && (
        <Card>
          <CardContent className="p-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div
                dangerouslySetInnerHTML={{
                  __html: sprint.artifact.content
                    .replace(/^# /gm, '<h1 class="text-xl font-bold mt-6 mb-3">')
                    .replace(/^## /gm, '<h2 class="text-lg font-semibold mt-5 mb-2">')
                    .replace(/^### /gm, '<h3 class="text-base font-medium mt-4 mb-2">')
                    .replace(/\n/g, '<br>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(
                      /\[(.*?)\]\((.*?)\)/g,
                      '<a href="$2" class="text-cobalt-600 hover:underline" target="_blank">$1</a>'
                    )
                    .replace(/- /g, '&bull; '),
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sources */}
      {sprint.sources.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="mb-4 font-heading text-lg font-semibold">
              Sources ({sprint.sources.length})
            </h2>
            <div className="space-y-2">
              {sprint.sources.map((source, index) => (
                <Card key={source.id}>
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <GitBranch className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">{source.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {source.type.replace('_', ' ')} &bull;{' '}
                          {new Date(source.fetchedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {source.url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
