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
  Download,
  ExternalLink,
  FileText,
  GitBranch,
  Loader2,
  MessageSquare,
  Presentation,
  Users,
  XCircle,
} from 'lucide-react';

interface DeckDetail {
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
    keyMessages?: string;
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
    case 'jira_story':
      return <GitBranch className="h-4 w-4" />;
    case 'confluence_page':
      return <FileText className="h-4 w-4" />;
    case 'slack_message':
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <Presentation className="h-4 w-4" />;
  }
}

export default function DeckDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const [deck, setDeck] = useState<DeckDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDeck() {
      try {
        const res = await fetch(`/api/agents/deck-content/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          setDeck(data.deck);
        }
      } catch (err) {
        console.error('Failed to fetch deck:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDeck();
  }, [jobId]);

  const handleDownload = () => {
    if (!deck?.artifact) return;

    const blob = new Blob([deck.artifact.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.artifact.title.replace(/\s+/g, '-')}.md`;
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

  if (!deck) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-medium">Deck content not found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This deck content could not be found.
            </p>
            <Button className="mt-4" variant="outline" asChild>
              <Link href="/agents/deck-content/history">Back to History</Link>
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
            <Link href="/agents/deck-content/history">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold">
                {deck.config?.title || 'Deck Content'}
              </h1>
              <StatusBadge status={deck.status} />
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              {deck.config?.deckType && (
                <Badge variant="outline">{deck.config.deckType}</Badge>
              )}
              {deck.config?.audience && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {deck.config.audience}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {deck.artifact && (
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Key Messages */}
      {deck.config?.keyMessages && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Key Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{deck.config.keyMessages}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {deck.result?.stats && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Presentation className="h-4 w-4" />
                <span className="text-sm">Slides</span>
              </div>
              <p className="mt-1 text-2xl font-bold">
                {deck.result.stats.slidesGenerated}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="text-sm">Data Points</span>
              </div>
              <p className="mt-1 text-2xl font-bold">
                {deck.result.stats.dataPointsUsed}
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
                {(deck.result.stats.latencyMs / 1000).toFixed(1)}s
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error */}
      {deck.error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm">{deck.error}</p>
          </CardContent>
        </Card>
      )}

      {/* Deck Content */}
      {deck.artifact && (
        <Card>
          <CardContent className="p-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div
                dangerouslySetInnerHTML={{
                  __html: deck.artifact.content
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
      {deck.sources.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="mb-4 font-heading text-lg font-semibold">
              Sources ({deck.sources.length})
            </h2>
            <div className="space-y-2">
              {deck.sources.map((source, index) => (
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
