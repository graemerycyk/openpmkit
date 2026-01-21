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
  CheckCircle2,
  Clock,
  Database,
  Download,
  ExternalLink,
  FileText,
  GitBranch,
  Hash,
  Headphones,
  HelpCircle,
  Loader2,
  MessageSquare,
  Phone,
  RefreshCw,
  Shield,
  Ticket,
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

interface ClusterDetail {
  id: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  result: {
    stats?: {
      feedbackProcessed: number;
      clustersGenerated: number;
      latencyMs: number;
      tokensUsed?: number;
    };
  } | null;
  dataSourcesUsed?: DataSourceUsed[];
  connectedSources?: string[];
  config: {
    timeframeDays?: number;
    clusterCount?: number;
    minFeedbackCount?: number;
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

// Map data source keys to icons
const dataSourceIcons: Record<string, LucideIcon> = {
  slack: MessageSquare,
  zendesk: HelpCircle,
  gong: Phone,
  jira: FileText,
  confluence: Database,
};

function SourceIcon({ type }: { type: string }) {
  switch (type) {
    case 'gong_call':
      return <Headphones className="h-4 w-4" />;
    case 'slack_message':
      return <MessageSquare className="h-4 w-4" />;
    case 'zendesk_ticket':
      return <Ticket className="h-4 w-4" />;
    default:
      return <GitBranch className="h-4 w-4" />;
  }
}

export default function ClusterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [cluster, setCluster] = useState<ClusterDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRerunning, setIsRerunning] = useState(false);

  useEffect(() => {
    async function fetchCluster() {
      try {
        const res = await fetch(`/api/agents/feature-intelligence/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          setCluster(data.cluster);
        }
      } catch (err) {
        console.error('Failed to fetch cluster:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCluster();
  }, [jobId]);

  const handleRerun = async () => {
    setIsRerunning(true);
    try {
      const res = await fetch('/api/agents/feature-intelligence/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cluster?.config || {}),
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = `/agents/feature-intelligence/${data.jobId}`;
      }
    } catch (err) {
      console.error('Failed to rerun:', err);
    } finally {
      setIsRerunning(false);
    }
  };

  const handleDownload = () => {
    if (!cluster?.artifact) return;

    const blob = new Blob([cluster.artifact.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cluster.artifact.title.replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSIEMExport = () => {
    if (!cluster) return;

    // Build dynamic data sources from the API response
    const dataSources: Record<string, Record<string, number>> = {};
    if (cluster.dataSourcesUsed) {
      for (const ds of cluster.dataSourcesUsed) {
        dataSources[ds.key] = {};
        for (const stat of ds.stats) {
          dataSources[ds.key][stat.label.toLowerCase().replace(/\s+/g, '_')] = stat.value;
        }
      }
    }

    // Create CEF-formatted SIEM event
    const siemEvent = {
      version: 'CEF:0',
      deviceVendor: 'pmkit',
      deviceProduct: 'agent-platform',
      deviceVersion: '1.0.0',
      signatureId: cluster.status === 'completed' ? 'PMKIT-JOB-002' : 'PMKIT-JOB-003',
      name: cluster.status === 'completed' ? 'Job Completed' : 'Job Failed',
      severity: cluster.status === 'completed' ? 1 : 6,
      src: 'tenant',
      act: cluster.status === 'completed' ? 'job.complete' : 'job.fail',
      outcome: cluster.status === 'completed' ? 'success' : 'failure',
      reason: cluster.error || undefined,
      cs1: cluster.id,
      cs1Label: 'runId',
      cs3: 'feature_intelligence',
      cs3Label: 'jobType',
      cn1: cluster.result?.stats?.latencyMs,
      cn1Label: 'latencyMs',
      cn2: cluster.result?.stats?.tokensUsed,
      cn2Label: 'tokenCount',
      rt: cluster.startedAt ? new Date(cluster.startedAt).getTime() : Date.now(),
      start: cluster.startedAt ? new Date(cluster.startedAt).getTime() : undefined,
      end: cluster.completedAt ? new Date(cluster.completedAt).getTime() : undefined,
      dataSources,
      connectedSources: cluster.connectedSources || [],
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

    const exportData = {
      cef: cefString,
      json: siemEvent,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feature-intelligence-${cluster.id}-siem.json`;
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

  if (!cluster) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-medium">Analysis not found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This Feature Intelligence analysis could not be found.
            </p>
            <Button className="mt-4" variant="outline" onClick={() => router.back()}>
              Back to History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const startDate = cluster.startedAt ? new Date(cluster.startedAt) : null;

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
                Feature Intelligence Analysis
              </h1>
              <StatusBadge status={cluster.status} />
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              {cluster.config?.timeframeDays && (
                <span>Last {cluster.config.timeframeDays} days</span>
              )}
              {startDate && (
                <span>
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
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {cluster.status === 'failed' && (
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
          {cluster.artifact && (
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      {(cluster.dataSourcesUsed && cluster.dataSourcesUsed.length > 0) || cluster.result?.stats ? (
        <div className="space-y-4">
          {/* Data Source Stats - Dynamic based on what was used */}
          {cluster.dataSourcesUsed && cluster.dataSourcesUsed.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {cluster.dataSourcesUsed.map((dataSource) => {
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
          {cluster.result?.stats && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold">
                    {cluster.result.stats.latencyMs
                      ? `${(cluster.result.stats.latencyMs / 1000).toFixed(1)}s`
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
                    {cluster.result.stats.tokensUsed?.toLocaleString() || '-'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      ) : null}

      {/* Error */}
      {cluster.error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm">{cluster.error}</p>
          </CardContent>
        </Card>
      )}

      {/* Analysis Content */}
      {cluster.artifact && (
        <Card>
          <CardContent className="p-6">
            <MarkdownContent content={cluster.artifact.content} />
          </CardContent>
        </Card>
      )}

      {/* Sources */}
      {cluster.sources.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="mb-4 font-heading text-lg font-semibold">
              Sources ({cluster.sources.length})
            </h2>
            <div className="space-y-2">
              {cluster.sources.map((source, index) => (
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
