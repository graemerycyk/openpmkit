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
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Headphones,
  Loader2,
  MessageSquare,
  Ticket,
  User,
  XCircle,
} from 'lucide-react';

interface PrepDetail {
  id: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  result: {
    stats?: {
      sourcesProcessed: number;
      callsAnalyzed?: number;
      ticketsFound?: number;
      latencyMs: number;
    };
  } | null;
  config: {
    accountName?: string;
    contactName?: string;
    meetingDate?: string;
    meetingContext?: string;
    timeframeDays?: number;
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
    case 'gong_call':
      return <Headphones className="h-4 w-4" />;
    case 'slack_message':
      return <MessageSquare className="h-4 w-4" />;
    case 'zendesk_ticket':
      return <Ticket className="h-4 w-4" />;
    default:
      return <Building2 className="h-4 w-4" />;
  }
}

export default function PrepDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const [prep, setPrep] = useState<PrepDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPrep() {
      try {
        const res = await fetch(`/api/agents/meeting-prep/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          setPrep(data.prep);
        }
      } catch (err) {
        console.error('Failed to fetch prep:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPrep();
  }, [jobId]);

  const handleDownload = () => {
    if (!prep?.artifact) return;

    const blob = new Blob([prep.artifact.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prep.artifact.title.replace(/\s+/g, '-')}.md`;
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

  if (!prep) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-medium">Prep Pack not found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This Meeting Prep pack could not be found.
            </p>
            <Button className="mt-4" variant="outline" asChild>
              <Link href="/agents/meeting-prep/history">Back to History</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/agents/meeting-prep/history">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold">
                {prep.config?.accountName || 'Meeting Prep'}
              </h1>
              <StatusBadge status={prep.status} />
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              {prep.config?.contactName && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {prep.config.contactName}
                </span>
              )}
              {prep.config?.meetingDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Meeting:{' '}
                  {new Date(prep.config.meetingDate).toLocaleDateString(
                    'en-US',
                    { weekday: 'short', month: 'short', day: 'numeric' }
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {prep.artifact && (
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Meeting Context */}
      {prep.config?.meetingContext && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Meeting Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{prep.config.meetingContext}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {prep.result?.stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span className="text-sm">Sources</span>
              </div>
              <p className="mt-1 text-2xl font-bold">
                {prep.result.stats.sourcesProcessed}
              </p>
            </CardContent>
          </Card>
          {prep.result.stats.callsAnalyzed !== undefined && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Headphones className="h-4 w-4" />
                  <span className="text-sm">Calls</span>
                </div>
                <p className="mt-1 text-2xl font-bold">
                  {prep.result.stats.callsAnalyzed}
                </p>
              </CardContent>
            </Card>
          )}
          {prep.result.stats.ticketsFound !== undefined && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Ticket className="h-4 w-4" />
                  <span className="text-sm">Tickets</span>
                </div>
                <p className="mt-1 text-2xl font-bold">
                  {prep.result.stats.ticketsFound}
                </p>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Duration</span>
              </div>
              <p className="mt-1 text-2xl font-bold">
                {(prep.result.stats.latencyMs / 1000).toFixed(1)}s
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error */}
      {prep.error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm">{prep.error}</p>
          </CardContent>
        </Card>
      )}

      {/* Prep Content */}
      {prep.artifact && (
        <Card>
          <CardContent className="p-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div
                dangerouslySetInnerHTML={{
                  __html: prep.artifact.content
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
      {prep.sources.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="mb-4 font-heading text-lg font-semibold">
              Sources ({prep.sources.length})
            </h2>
            <div className="space-y-2">
              {prep.sources.map((source, index) => (
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
