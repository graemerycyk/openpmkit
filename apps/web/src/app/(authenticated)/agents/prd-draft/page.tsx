'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles } from 'lucide-react';
import {
  AgentPageLayout,
  AgentStatusCard,
  AgentActions,
  OutputPreviewCard,
  DataSourcesCard,
} from '@/components/agents';
import { useAgentConfig, ConnectorKey } from '@/hooks/use-agent-config';
import { useUsage } from '@/hooks/use-usage';

const PRIORITY_LEVELS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const SUGGESTED_CONNECTORS: ConnectorKey[] = [
  'jira',
  'confluence',
  'slack',
  'gong',
  'zendesk',
  'gmail',
  'google-calendar',
  'google-drive',
];

const OUTPUT_PREVIEW = [
  'Executive summary and problem statement',
  'User personas and jobs to be done',
  'Detailed requirements with acceptance criteria',
  'Success metrics and KPIs',
  'Dependencies and risks',
];

interface PRDConfig extends Record<string, unknown> {
  autoDiscover: boolean;
  priorityFilter: string;
  includeVoC: boolean;
  includeJiraEpics: boolean;
  includeSlackDiscussions: boolean;
  enabledSources?: Record<string, boolean>;
  connectorConfigs?: object;
}

export default function PRDDraftPage() {
  const { currentUsage } = useUsage('prd_draft');

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
  } = useAgentConfig<PRDConfig>({
    apiEndpoint: '/api/agents/prd-draft',
    suggestedConnectors: SUGGESTED_CONNECTORS,
    requiredConnectors: [],
  });

  // Form state - automated discovery settings
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [includeVoC, setIncludeVoC] = useState(true);
  const [includeJiraEpics, setIncludeJiraEpics] = useState(true);
  const [includeSlackDiscussions, setIncludeSlackDiscussions] = useState(true);

  // Load saved config values
  useEffect(() => {
    if (config?.config) {
      setPriorityFilter(config.config.priorityFilter || 'all');
      setIncludeVoC(config.config.includeVoC ?? true);
      setIncludeJiraEpics(config.config.includeJiraEpics ?? true);
      setIncludeSlackDiscussions(config.config.includeSlackDiscussions ?? true);
    }
  }, [config]);

  // Can run when at least one data source is connected and enabled
  const hasEnabledSource = suggestedSources.some((s) => s.connected && s.enabled);
  const canRun = hasEnabledSource;

  const onSave = async () => {
    const enabledSources: Record<string, boolean> = {};
    suggestedSources.forEach((source) => {
      enabledSources[source.key] = source.enabled;
    });

    await handleSave({
      status: isActive ? 'active' : 'paused',
      config: {
        autoDiscover: true,
        priorityFilter,
        includeVoC,
        includeJiraEpics,
        includeSlackDiscussions,
        enabledSources,
        connectorConfigs: Object.fromEntries(
          Object.entries(connectorConfigs).filter(([key]) => enabledSources[key])
        ),
      },
    });
  };

  const onTrigger = async () => {
    await handleTrigger({
      autoDiscover: true,
      priorityFilter: priorityFilter !== 'all' ? priorityFilter : undefined,
      includeVoC,
      includeJiraEpics,
      includeSlackDiscussions,
    });
  };

  return (
    <AgentPageLayout
      title="PRD Draft Agent"
      description="Automatically discover and document features from your connected sources"
      status="coming-soon"
      isLoading={isLoading}
      error={error}
      success={success}
      usage={{
        workflowName: 'PRD Draft',
        used: currentUsage?.used || 0,
        limit: currentUsage?.limit || 0,
      }}
    >
      {/* Auto-Discovery Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Automated Discovery</CardTitle>
          </div>
          <CardDescription>
            The agent automatically identifies features to document from your connected data sources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Include Voice of Customer Data</Label>
              <p className="text-sm text-muted-foreground">
                Analyze Gong calls, Zendesk tickets, and support requests
              </p>
            </div>
            <Switch
              checked={includeVoC}
              onCheckedChange={setIncludeVoC}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Include Jira Epics & Features</Label>
              <p className="text-sm text-muted-foreground">
                Pull feature requests and epics from Jira
              </p>
            </div>
            <Switch
              checked={includeJiraEpics}
              onCheckedChange={setIncludeJiraEpics}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Include Slack Discussions</Label>
              <p className="text-sm text-muted-foreground">
                Extract feature ideas from Slack conversations
              </p>
            </div>
            <Switch
              checked={includeSlackDiscussions}
              onCheckedChange={setIncludeSlackDiscussions}
            />
          </div>
          <div className="space-y-2 pt-2">
            <Label htmlFor="priority-filter">Priority Filter</Label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger id="priority-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {PRIORITY_LEVELS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label} and above
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Only generate PRDs for features matching this priority threshold
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <DataSourcesCard
        suggestedSources={suggestedSources}
        allConnectedSources={allConnectedSources}
        description="Connect sources to discover features and enrich PRDs with context"
        onToggle={handleSourceToggle}
        connectorConfigs={connectorConfigs}
        onConfigChange={handleConfigChange}
      />

      {/* Output Preview */}
      <OutputPreviewCard outputs={OUTPUT_PREVIEW} />

      {/* Agent Status */}
      <AgentStatusCard
        agentName="PRD Draft Agent"
        isActive={isActive}
        onActiveChange={setIsActive}
        comingSoon={true}
      />

      {/* Actions */}
      <AgentActions
        isTriggering={isTriggering}
        isSaving={isSaving}
        canRun={canRun}
        isAdmin={isAdmin}
        onTrigger={onTrigger}
        onSave={onSave}
        comingSoon={true}
      />
    </AgentPageLayout>
  );
}
