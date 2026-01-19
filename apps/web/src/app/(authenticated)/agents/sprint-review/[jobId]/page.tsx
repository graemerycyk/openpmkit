'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
  GitBranch,
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
      tokensUsed?: number;
    };
  } | null;
  dataSourcesUsed?: DataSourceUsed[];
  connectedSources?: string[];
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

export default function SprintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [sprint, setSprint] = useState<SprintDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRerunning, setIsRerunning] = useState(false);

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

  const handleRerun = async () => {
    setIsRerunning(true);
    try {
      const res = await fetch('/api/agents/sprint-review/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sprint?.config || {}),
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = `/agents/sprint-review/${data.jobId}`;
      }
    } catch (err) {
      console.error('Failed to rerun:', err);
    } finally {
      setIsRerunning(false);
    }
  };

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

  const handleSIEMExport = () => {
    if (!sprint) return;

    // Build dynamic data sources from the API response
    const dataSources: Record<string, Record<string, number>> = {};
    if (sprint.dataSourcesUsed) {
      for (const ds of sprint.dataSourcesUsed) {
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
      signatureId: sprint.status === 'completed' ? 'PMKIT-JOB-002' : 'PMKIT-JOB-003',
      name: sprint.status === 'completed' ? 'Job Completed' : 'Job Failed',
      severity: sprint.status === 'completed' ? 1 : 6,
      src: 'tenant',
      act: sprint.status === 'completed' ? 'job.complete' : 'job.fail',
      outcome: sprint.status === 'completed' ? 'success' : 'failure',
      reason: sprint.error || undefined,
      cs1: sprint.id,
      cs1Label: 'runId',
      cs3: 'sprint_review',
      cs3Label: 'jobType',
      cn1: sprint.result?.stats?.latencyMs,
      cn1Label: 'latencyMs',
      cn2: sprint.result?.stats?.tokensUsed,
      cn2Label: 'tokenCount',
      rt: sprint.startedAt ? new Date(sprint.startedAt).getTime() : Date.now(),
      start: sprint.startedAt ? new Date(sprint.startedAt).getTime() : undefined,
      end: sprint.completedAt ? new Date(sprint.completedAt).getTime() : undefined,
      dataSources,
      connectedSources: sprint.connectedSources || [],
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
    a.download = `sprint-review-${sprint.id}-siem.json`;
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
          {sprint.status === 'failed' && (
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
      {(sprint.dataSourcesUsed && sprint.dataSourcesUsed.length > 0) || sprint.result?.stats ? (
        <div className="space-y-4">
          {/* Data Source Stats - Dynamic based on what was used */}
          {sprint.dataSourcesUsed && sprint.dataSourcesUsed.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {sprint.dataSourcesUsed.map((dataSource) => {
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
          {sprint.result?.stats && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold">
                    {sprint.result.stats.latencyMs
                      ? `${(sprint.result.stats.latencyMs / 1000).toFixed(1)}s`
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
                    {sprint.result.stats.tokensUsed?.toLocaleString() || '-'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      ) : null}

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
