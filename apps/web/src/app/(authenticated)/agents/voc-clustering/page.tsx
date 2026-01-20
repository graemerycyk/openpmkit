'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp } from 'lucide-react';
import {
  AgentPageLayout,
  AgentStatusCard,
  AgentActions,
  OutputPreviewCard,
  DataSourcesCard,
} from '@/components/agents';
import { useAgentConfig, ConnectorKey } from '@/hooks/use-agent-config';
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

const SUGGESTED_CONNECTORS: ConnectorKey[] = [
  'gong',
  'zendesk',
  'slack',
  'jira',
  'confluence',
  'gmail',
  'google-calendar',
  'google-drive',
];

const OUTPUT_PREVIEW = [
  'Feedback themes clustered by semantic similarity',
  'Top issues ranked by frequency and impact',
  'Representative quotes for each cluster',
  'Trend analysis over time',
  'Actionable recommendations',
];

interface VoCConfig extends Record<string, unknown> {
  timeframeDays: number;
  clusterCount: number;
  minFeedbackCount: number;
  enabledSources?: Record<string, boolean>;
  connectorConfigs?: object;
}

export default function VoCClusteringPage() {
  const { currentUsage } = useUsage('voc_clustering');

  // Agent config hook
  const {
    isLoading,
    isSaving,
    isTriggering,
    error,
    success,
    config,
    isActive,
    setIsActive,
    suggestedSources,
    allConnectedSources,
    connectorConfigs,
    handleSourceToggle,
    handleConfigChange,
    isAdmin,
    handleSave,
    handleTrigger,
  } = useAgentConfig<VoCConfig>({
    apiEndpoint: '/api/agents/voc-clustering',
    suggestedConnectors: SUGGESTED_CONNECTORS,
    // No required connectors - any data source can be used
    requiredConnectors: [],
  });

  // Form state
  const [timeframe, setTimeframe] = useState('30');
  const [clusterCount, setClusterCount] = useState('5');
  const [minFeedbackCount, setMinFeedbackCount] = useState('10');

  // Load saved config values
  useEffect(() => {
    if (config?.config) {
      setTimeframe(String(config.config.timeframeDays || 30));
      setClusterCount(String(config.config.clusterCount || 5));
      setMinFeedbackCount(String(config.config.minFeedbackCount || 10));
    }
  }, [config]);

  // Check if at least one data source is enabled
  const hasDataSource = suggestedSources.some((s) => s.connected && s.enabled);
  const effectiveCanRun = hasDataSource;

  // Build save payload
  const onSave = async () => {
    const enabledSources: Record<string, boolean> = {};
    suggestedSources.forEach((source) => {
      enabledSources[source.key] = source.enabled;
    });

    await handleSave({
      status: isActive ? 'active' : 'paused',
      config: {
        timeframeDays: parseInt(timeframe),
        clusterCount: parseInt(clusterCount),
        minFeedbackCount: parseInt(minFeedbackCount),
        enabledSources,
        connectorConfigs: Object.fromEntries(
          Object.entries(connectorConfigs).filter(([key]) => enabledSources[key])
        ),
      },
    });
  };

  // Build trigger payload
  const onTrigger = async () => {
    const gongSource = suggestedSources.find((s) => s.key === 'gong');
    const zendeskSource = suggestedSources.find((s) => s.key === 'zendesk');
    const slackSource = suggestedSources.find((s) => s.key === 'slack');

    await handleTrigger({
      timeframeDays: parseInt(timeframe),
      clusterCount: parseInt(clusterCount),
      minFeedbackCount: parseInt(minFeedbackCount),
      sources: {
        gong: gongSource?.connected && gongSource?.enabled,
        zendesk: zendeskSource?.connected && zendeskSource?.enabled,
        slack: slackSource?.connected && slackSource?.enabled,
      },
    });
  };

  return (
    <AgentPageLayout
      title="VoC Clustering Agent"
      description="Cluster customer feedback into themes and identify top issues"
      status={config?.status === 'active' ? 'active' : config?.status === 'paused' ? 'paused' : 'coming-soon'}
      isLoading={isLoading}
      error={error}
      success={success}
      usage={{
        workflowName: 'VoC Clustering',
        used: currentUsage?.used || 0,
        limit: currentUsage?.limit || 0,
      }}
    >
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
      <OutputPreviewCard outputs={OUTPUT_PREVIEW} />

      {/* Agent Status */}
      <AgentStatusCard
        agentName="VoC Clustering Agent"
        isActive={isActive}
        onActiveChange={setIsActive}
        disabled={!effectiveCanRun}
        missingRequiredConnectors={!hasDataSource ? ['gong'] : []}
      />

      {/* Actions */}
      <AgentActions
        isTriggering={isTriggering}
        isSaving={isSaving}
        canRun={effectiveCanRun}
        isAdmin={isAdmin}
        missingRequiredConnectors={!hasDataSource ? ['gong'] : []}
        onTrigger={onTrigger}
        onSave={onSave}
      />

      {/* Last Run Info */}
      {config?.lastRunAt && (
        <p className="text-center text-sm text-muted-foreground">
          Last run: {new Date(config.lastRunAt).toLocaleString()}
        </p>
      )}
    </AgentPageLayout>
  );
}
