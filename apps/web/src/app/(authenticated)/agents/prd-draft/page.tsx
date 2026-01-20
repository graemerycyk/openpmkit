'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText } from 'lucide-react';
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
  featureName: string;
  problemStatement: string;
  targetUsers: string;
  priority: string;
  additionalContext: string;
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

  // Form state
  const [featureName, setFeatureName] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [targetUsers, setTargetUsers] = useState('');
  const [priority, setPriority] = useState('medium');
  const [additionalContext, setAdditionalContext] = useState('');

  // Load saved config values
  useEffect(() => {
    if (config?.config) {
      setFeatureName(config.config.featureName || '');
      setProblemStatement(config.config.problemStatement || '');
      setTargetUsers(config.config.targetUsers || '');
      setPriority(config.config.priority || 'medium');
      setAdditionalContext(config.config.additionalContext || '');
    }
  }, [config]);

  const canRun = featureName.trim() !== '' && problemStatement.trim() !== '';

  const onSave = async () => {
    const enabledSources: Record<string, boolean> = {};
    suggestedSources.forEach((source) => {
      enabledSources[source.key] = source.enabled;
    });

    await handleSave({
      status: isActive ? 'active' : 'paused',
      config: {
        featureName: featureName.trim(),
        problemStatement: problemStatement.trim(),
        targetUsers: targetUsers.trim(),
        priority,
        additionalContext: additionalContext.trim(),
        enabledSources,
        connectorConfigs: Object.fromEntries(
          Object.entries(connectorConfigs).filter(([key]) => enabledSources[key])
        ),
      },
    });
  };

  const onTrigger = async () => {
    await handleTrigger({
      featureName: featureName.trim(),
      problemStatement: problemStatement.trim(),
      targetUsers: targetUsers.trim() || undefined,
      priority,
      additionalContext: additionalContext.trim() || undefined,
    });
  };

  return (
    <AgentPageLayout
      title="PRD Draft Agent"
      description="Generate a Product Requirements Document from VoC data"
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
      {/* Feature Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Feature Information</CardTitle>
          </div>
          <CardDescription>
            Describe the feature you want to document
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="feature-name">Feature Name *</Label>
              <Input
                id="feature-name"
                placeholder="e.g., Advanced Analytics Dashboard"
                value={featureName}
                onChange={(e) => setFeatureName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_LEVELS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="problem-statement">Problem Statement *</Label>
            <Textarea
              id="problem-statement"
              placeholder="e.g., Users struggle to understand their product usage patterns and cannot make data-driven decisions about which features to invest in..."
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-users">Target Users (optional)</Label>
            <Input
              id="target-users"
              placeholder="e.g., Enterprise admins, Product managers"
              value={targetUsers}
              onChange={(e) => setTargetUsers(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (optional)</Label>
            <Textarea
              id="context"
              placeholder="e.g., This ties into our Q3 enterprise push. Related features include..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <DataSourcesCard
        suggestedSources={suggestedSources}
        allConnectedSources={allConnectedSources}
        description="Connect sources to enrich the PRD with existing context"
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
