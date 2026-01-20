'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MarkdownContent } from '@/components/markdown-content';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  Hash,
  HelpCircle,
  Loader2,
  Mail,
  MessageSquare,
  Palette,
  Phone,
  Play,
  RefreshCw,
  Shield,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

interface DataSourceStat {
  label: string;
  value: number;
}

interface DataSourceUsed {
  key: string;
  name: string;
  stats: DataSourceStat[];
}

interface BriefStats {
  tokensUsed?: number;
  latencyMs?: number;
  [key: string]: number | undefined;
}

interface BriefDetail {
  id: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  result: {
    stats?: BriefStats;
  } | null;
  dataSourcesUsed: DataSourceUsed[];
  connectedSources: string[];
  artifact: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
  } | null;
  sources: Array<{
    id: string;
    title: string;
    url: string | null;
    channelName: string;
    author: string;
    fetchedAt: string;
  }>;
}

// Map data source keys to icons
const dataSourceIcons: Record<string, LucideIcon> = {
  slack: MessageSquare,
  gmail: Mail,
  'google-calendar': Calendar,
  'google-drive': FolderOpen,
  jira: FileText,
  confluence: Database,
  gong: Phone,
  zendesk: HelpCircle,
  loom: Play,
  figma: Palette,
};

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

export default function BriefDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [brief, setBrief] = useState<BriefDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRerunning, setIsRerunning] = useState(false);

  useEffect(() => {
    async function fetchBrief() {
      try {
        const res = await fetch(`/api/agents/daily-brief/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          setBrief(data.brief);
        }
      } catch (err) {
        console.error('Failed to fetch brief:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBrief();
  }, [jobId]);

  const handleRerun = async () => {
    setIsRerunning(true);
    try {
      const res = await fetch('/api/agents/daily-brief/trigger', {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        // Redirect to new job
        window.location.href = `/agents/daily-brief/${data.jobId}`;
      }
    } catch (err) {
      console.error('Failed to rerun:', err);
    } finally {
      setIsRerunning(false);
    }
  };

  const handleDownload = () => {
    if (!brief?.artifact) return;

    const blob = new Blob([brief.artifact.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brief.artifact.title.replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSIEMExport = () => {
    if (!brief) return;

    // Build dynamic data sources from the API response
    const dataSources: Record<string, Record<string, number>> = {};
    for (const ds of brief.dataSourcesUsed) {
      dataSources[ds.key] = {};
      for (const stat of ds.stats) {
        dataSources[ds.key][stat.label.toLowerCase().replace(/\s+/g, '_')] = stat.value;
      }
    }

    // Create CEF-formatted SIEM event
    const siemEvent = {
      version: 'CEF:0',
      deviceVendor: 'pmkit',
      deviceProduct: 'agent-platform',
      deviceVersion: '1.0.0',
      signatureId: brief.status === 'completed' ? 'PMKIT-JOB-002' : 'PMKIT-JOB-003',
      name: brief.status === 'completed' ? 'Job Completed' : 'Job Failed',
      severity: brief.status === 'completed' ? 1 : 6,
      src: 'tenant',
      act: brief.status === 'completed' ? 'job.complete' : 'job.fail',
      outcome: brief.status === 'completed' ? 'success' : 'failure',
      reason: brief.error || undefined,
      cs1: brief.id,
      cs1Label: 'runId',
      cs3: 'daily_brief',
      cs3Label: 'jobType',
      cn1: brief.result?.stats?.latencyMs,
      cn1Label: 'latencyMs',
      cn2: brief.result?.stats?.tokensUsed,
      cn2Label: 'tokenCount',
      rt: brief.startedAt ? new Date(brief.startedAt).getTime() : Date.now(),
      start: brief.startedAt ? new Date(brief.startedAt).getTime() : undefined,
      end: brief.completedAt ? new Date(brief.completedAt).getTime() : undefined,
      // Include all data sources that were used
      dataSources,
      // Include list of connected sources
      connectedSources: brief.connectedSources,
    };

    // Format as CEF string
    const cefHeader = `${siemEvent.version}|${siemEvent.deviceVendor}|${siemEvent.deviceProduct}|${siemEvent.deviceVersion}|${siemEvent.signatureId}|${siemEvent.name}|${siemEvent.severity}`;
    const extensions = [
      `src=${siemEvent.src}`,
      `act=${siemEvent.act}`,
      `outcome=${siemEvent.outcome}`,
      siemEvent.reason ? `reason=${siemEvent.reason}` : null,
      `cs1=${siemEvent.cs1} cs1Label=${siemEvent.cs1Label}`,
      `cs3=${siemEvent.cs3} cs3Label=${siemEvent.cs3Label}`,
      siemEvent.cn1 !== undefined ? `cn1=${siemEvent.cn1} cn1Label=${siemEvent.cn1Label}` : null,
      siemEvent.cn2 !== undefined ? `cn2=${siemEvent.cn2} cn2Label=${siemEvent.cn2Label}` : null,
      `rt=${siemEvent.rt}`,
      siemEvent.start ? `start=${siemEvent.start}` : null,
      siemEvent.end ? `end=${siemEvent.end}` : null,
    ].filter(Boolean).join(' ');

    const cefString = `${cefHeader}|${extensions}`;

    // Also include JSON format for full data
    const exportData = {
      cef: cefString,
      json: siemEvent,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-brief-${brief.id}-siem.json`;
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

  if (!brief) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-medium">Brief not found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This Daily Brief could not be found.
            </p>
            <Button className="mt-4" variant="outline" onClick={() => router.back()}>
              Back to History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const startDate = brief.startedAt ? new Date(brief.startedAt) : null;

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
                {brief.artifact?.title || 'Daily Brief'}
              </h1>
              <StatusBadge status={brief.status} />
            </div>
            {startDate && (
              <p className="text-muted-foreground">
                Generated on{' '}
                {startDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                at{' '}
                {startDate.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {brief.status === 'failed' && (
            <Button variant="outline" onClick={handleRerun} disabled={isRerunning}>
              {isRerunning ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Re-run
            </Button>
          )}
          <Button variant="outline" onClick={handleSIEMExport}>
            <Shield className="mr-2 h-4 w-4" />
            SIEM Export
          </Button>
          {brief.artifact && (
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      {(brief.dataSourcesUsed.length > 0 || brief.result?.stats) && (
        <div className="space-y-4">
          {/* Data Source Stats - Dynamic based on what was used */}
          {brief.dataSourcesUsed.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {brief.dataSourcesUsed.map((dataSource) => {
                const Icon = dataSourceIcons[dataSource.key] || Hash;
                return dataSource.stats.map((stat) => (
                  <Card key={`${dataSource.key}-${stat.label}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{dataSource.name} {stat.label}</span>
                      </div>
                      <p className="mt-1 text-2xl font-bold">
                        {stat.value.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                ));
              })}
            </div>
          )}

          {/* Processing Stats */}
          {brief.result?.stats && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold">
                    {brief.result.stats.latencyMs
                      ? `${(brief.result.stats.latencyMs / 1000).toFixed(1)}s`
                      : '-'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">Tokens Used</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold">
                    {brief.result.stats.tokensUsed?.toLocaleString() || '-'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {brief.error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm">{brief.error}</p>
          </CardContent>
        </Card>
      )}

      {/* Brief Content */}
      {brief.artifact && (
        <Card>
          <CardContent className="p-6">
            <MarkdownContent content={brief.artifact.content} />
          </CardContent>
        </Card>
      )}

      {/* Sources */}
      {brief.sources.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="mb-4 font-heading text-lg font-semibold">
              Sources ({brief.sources.length})
            </h2>
            <div className="space-y-2">
              {brief.sources.map((source, index) => (
                <Card key={source.id}>
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">
                          {source.author} in #{source.channelName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(source.fetchedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {source.url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={source.url} target="_blank" rel="noopener noreferrer">
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
