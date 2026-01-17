'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Map,
  Target,
  XCircle,
} from 'lucide-react';

interface AlignmentDetail {
  id: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  result: {
    stats?: {
      goalsAnalyzed: number;
      roadmapItems: number;
      alignmentScore: number;
      latencyMs: number;
    };
  } | null;
  config: {
    strategicGoals?: string;
    additionalContext?: string;
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

function SourceIcon({ type }: { type: string }) {
  switch (type) {
    case 'jira_epic':
    case 'jira_initiative':
      return <Map className="h-4 w-4" />;
    case 'confluence_page':
      return <FileText className="h-4 w-4" />;
    default:
      return <Compass className="h-4 w-4" />;
  }
}

export default function AlignmentDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const [alignment, setAlignment] = useState<AlignmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAlignment() {
      try {
        const res = await fetch(`/api/agents/roadmap-alignment/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          setAlignment(data.alignment);
        }
      } catch (err) {
        console.error('Failed to fetch alignment:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAlignment();
  }, [jobId]);

  const handleDownload = () => {
    if (!alignment?.artifact) return;

    const blob = new Blob([alignment.artifact.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${alignment.artifact.title.replace(/\s+/g, '-')}.md`;
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

  if (!alignment) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-medium">Alignment check not found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This roadmap alignment check could not be found.
            </p>
            <Button className="mt-4" variant="outline" asChild>
              <Link href="/agents/roadmap-alignment/history">Back to History</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const startDate = alignment.startedAt ? new Date(alignment.startedAt) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/agents/roadmap-alignment/history">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold">
                Roadmap Alignment
              </h1>
              <StatusBadge status={alignment.status} />
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
          {alignment.artifact && (
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      {alignment.result?.stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="h-4 w-4" />
                <span className="text-sm">Goals</span>
              </div>
              <p className="mt-1 text-2xl font-bold">
                {alignment.result.stats.goalsAnalyzed}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Map className="h-4 w-4" />
                <span className="text-sm">Roadmap Items</span>
              </div>
              <p className="mt-1 text-2xl font-bold">
                {alignment.result.stats.roadmapItems}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Compass className="h-4 w-4" />
                <span className="text-sm">Alignment</span>
              </div>
              <p className="mt-1 text-2xl font-bold">
                {alignment.result.stats.alignmentScore}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Duration</span>
              </div>
              <p className="mt-1 text-2xl font-bold">
                {(alignment.result.stats.latencyMs / 1000).toFixed(1)}s
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error */}
      {alignment.error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm">{alignment.error}</p>
          </CardContent>
        </Card>
      )}

      {/* Alignment Content */}
      {alignment.artifact && (
        <Card>
          <CardContent className="p-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div
                dangerouslySetInnerHTML={{
                  __html: alignment.artifact.content
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
      {alignment.sources.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="mb-4 font-heading text-lg font-semibold">
              Sources ({alignment.sources.length})
            </h2>
            <div className="space-y-2">
              {alignment.sources.map((source, index) => (
                <Card key={source.id}>
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <SourceIcon type={source.type} />
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
