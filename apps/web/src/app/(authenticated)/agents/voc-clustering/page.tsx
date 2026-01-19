'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Play,
  Save,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  DataSourcesCard,
  ConnectorConfigs,
  DEFAULT_CONNECTOR_CONFIGS,
  AnyConnectorConfig,
} from '@/components/agents/data-sources-card';
import { UsageLimitBanner } from '@/components/usage-limit-banner';
import { useUsage } from '@/hooks/use-usage';

const TIMEFRAMES = [
  { value: '7', label: 'Last 7 days' },
  { value: '14', label: 'Last 14 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

const CLUSTER_COUNTS = [
  { value: '3', label: '3 clusters' },
  { value: '5', label: '5 clusters' },
  { value: '7', label: '7 clusters' },
  { value: '10', label: '10 clusters' },
];

export default function VoCClusteringPage() {
  const { currentUsage } = useUsage('voc_clustering');
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form state
  const [timeframe, setTimeframe] = useState('30');
  const [clusterCount, setClusterCount] = useState('5');
  const [minFeedbackCount, setMinFeedbackCount] = useState('10');

  // Recommended sources for this agent
  const [suggestedSources, setSuggestedSources] = useState([
    { key: 'gong' as const, connected: false, enabled: false },
    { key: 'zendesk' as const, connected: false, enabled: false },
    { key: 'slack' as const, connected: false, enabled: false },
  ]);

  // All connected sources from API (for showing additional connected integrations)
  const [allConnectedSources, setAllConnectedSources] = useState<
    { key: 'slack' | 'jira' | 'confluence' | 'gong' | 'zendesk' | 'google-calendar' | 'google-drive' | 'gmail' | 'figma'; connected: boolean }[]
  >([]);

  // Connector-specific configurations
  const [connectorConfigs, setConnectorConfigs] = useState<ConnectorConfigs>({
    gong: { ...DEFAULT_CONNECTOR_CONFIGS.gong! },
    zendesk: { ...DEFAULT_CONNECTOR_CONFIGS.zendesk! },
    slack: { ...DEFAULT_CONNECTOR_CONFIGS.slack! },
  });

  // Check if user is admin
  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch('/api/workbench/run-job');
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.isAdmin === true);
        }
      } catch {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, []);

  useEffect(() => {
    async function fetchConnectors() {
      try {
        const res = await fetch('/api/connectors');
        if (res.ok) {
          const data = await res.json();
          const connectors = data.connectors || [];
          // Update suggested sources with connection status
          setSuggestedSources((prev) =>
            prev.map((source) => {
              const isConnected = connectors.some(
                (c: { connectorKey: string; status: string }) =>
                  c.connectorKey === source.key && c.status === 'real'
              );
              return {
                ...source,
                connected: isConnected,
                enabled: isConnected, // Auto-enable connected sources
              };
            })
          );
          // Build list of all connected sources
          const allConnected = connectors
            .filter((c: { status: string }) => c.status === 'real')
            .map((c: { connectorKey: string }) => ({
              key: c.connectorKey as 'slack' | 'jira' | 'confluence' | 'gong' | 'zendesk' | 'google-calendar' | 'google-drive' | 'gmail' | 'figma',
              connected: true,
            }));
          setAllConnectedSources(allConnected);

          // Fetch Slack channels if Slack is connected
          const slackIsConnected = connectors.some(
            (c: { connectorKey: string; status: string }) =>
              c.connectorKey === 'slack' && c.status === 'real'
          );
          if (slackIsConnected) {
            try {
              const channelsRes = await fetch('/api/connectors/slack/channels');
              if (channelsRes.ok) {
                const channelsData = await channelsRes.json();
                const fetchedChannels = channelsData.channels || [];
                // Update connector configs with fetched channels
                setConnectorConfigs((prev) => ({
                  ...prev,
                  slack: {
                    ...prev.slack!,
                    channels: fetchedChannels,
                  },
                }));
              }
            } catch (err) {
              console.error('Failed to fetch Slack channels:', err);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch connectors:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchConnectors();
  }, []);

  const hasDataSource = suggestedSources.some((s) => s.connected && s.enabled);
  const canRun = hasDataSource;

  // Handle toggling a source on/off
  const handleSourceToggle = (key: string, enabled: boolean) => {
    setSuggestedSources((prev) =>
      prev.map((source) =>
        source.key === key ? { ...source, enabled } : source
      )
    );
  };

  // Handle connector config changes
  const handleConfigChange = (key: string, config: AnyConnectorConfig) => {
    setConnectorConfigs((prev) => ({
      ...prev,
      [key]: config,
    }));
  };

  const handleRun = async () => {
    if (!canRun) return;

    setIsRunning(true);
    setError(null);
    setSuccess(null);

    const gongSource = suggestedSources.find((s) => s.key === 'gong');
    const zendeskSource = suggestedSources.find((s) => s.key === 'zendesk');
    const slackSource = suggestedSources.find((s) => s.key === 'slack');
    const gongEnabled = gongSource?.connected && gongSource?.enabled;
    const zendeskEnabled = zendeskSource?.connected && zendeskSource?.enabled;
    const slackEnabled = slackSource?.connected && slackSource?.enabled;

    try {
      const res = await fetch('/api/agents/voc-clustering/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeframeDays: parseInt(timeframe),
          clusterCount: parseInt(clusterCount),
          minFeedbackCount: parseInt(minFeedbackCount),
          sources: {
            gong: gongEnabled,
            zendesk: zendeskEnabled,
            slack: slackEnabled,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(`VoC Clustering started! Job ID: ${data.jobId}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to start clustering');
      }
    } catch {
      setError('Failed to start. Please try again.');
    } finally {
      setIsRunning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/agents">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold">VoC Clustering Agent</h1>
            <p className="text-muted-foreground">
              Cluster customer feedback into themes and identify top issues
            </p>
          </div>
        </div>
        <Badge variant="outline">Autonomous</Badge>
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
      <UsageLimitBanner
        workflowName="VoC Clustering"
        used={currentUsage?.used || 0}
        limit={currentUsage?.limit || 0}
      />

      {/* Analysis Parameters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Analysis Parameters</CardTitle>
          </div>
          <CardDescription>
            Configure how feedback should be analyzed and clustered
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="timeframe">Time Period</Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger id="timeframe">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEFRAMES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cluster-count">Number of Clusters</Label>
              <Select value={clusterCount} onValueChange={setClusterCount}>
                <SelectTrigger id="cluster-count">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLUSTER_COUNTS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="min-feedback">Min. Feedback Items</Label>
              <Input
                id="min-feedback"
                type="number"
                min="1"
                max="100"
                value={minFeedbackCount}
                onChange={(e) => setMinFeedbackCount(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <DataSourcesCard
        suggestedSources={suggestedSources}
        allConnectedSources={allConnectedSources}
        description="Select which sources to include in the analysis"
        onToggle={handleSourceToggle}
        connectorConfigs={connectorConfigs}
        onConfigChange={handleConfigChange}
      />

      {/* Output Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">What You'll Get</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Feedback themes clustered by semantic similarity</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Top issues ranked by frequency and impact</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Representative quotes for each cluster</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Trend analysis over time</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Actionable recommendations</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button
              variant="outline"
              onClick={handleRun}
              disabled={isRunning || !canRun}
            >
              {isRunning ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Run Now
            </Button>
          )}
        </div>
        <Button
          disabled={true}
          title="Agent settings coming soon"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Agent Settings
        </Button>
      </div>
    </div>
  );
}
