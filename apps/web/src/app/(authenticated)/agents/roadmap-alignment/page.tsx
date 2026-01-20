'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Compass } from 'lucide-react';
import {
  AgentPageLayout,
  AgentStatusCard,
  AgentActions,
  OutputPreviewCard,
  DataSourcesCard,
} from '@/components/agents';
import { useAgentConfig, ConnectorKey } from '@/hooks/use-agent-config';
import { useUsage } from '@/hooks/use-usage';

const SUGGESTED_CONNECTORS: ConnectorKey[] = [
  'jira',
  'confluence',
  'slack',
  'gmail',
  'google-calendar',
  'google-drive',
];

const OUTPUT_PREVIEW = [
  'Alignment score for each strategic goal',
  'Roadmap items mapped to each goal',
  'Gaps identified (goals without coverage)',
  'Orphaned items (work not tied to goals)',
  'Recommendations for better alignment',
];

interface RoadmapConfig extends Record<string, unknown> {
  strategicGoals: string;
  additionalContext: string;
  enabledSources?: Record<string, boolean>;
  connectorConfigs?: object;
}

export default function RoadmapAlignmentPage() {
  const { currentUsage } = useUsage('roadmap_alignment');

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
  } = useAgentConfig<RoadmapConfig>({
    apiEndpoint: '/api/agents/roadmap-alignment',
    suggestedConnectors: SUGGESTED_CONNECTORS,
    requiredConnectors: [],
  });

  // Form state
  const [strategicGoals, setStrategicGoals] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  // Load saved config values
  useEffect(() => {
    if (config?.config) {
      setStrategicGoals(config.config.strategicGoals || '');
      setAdditionalContext(config.config.additionalContext || '');
    }
  }, [config]);

  const hasAnyEnabled = suggestedSources.some((s) => s.connected && s.enabled);
  const canRun = hasAnyEnabled && strategicGoals.trim() !== '';

  const onSave = async () => {
    const enabledSources: Record<string, boolean> = {};
    suggestedSources.forEach((source) => {
      enabledSources[source.key] = source.enabled;
    });

    await handleSave({
      status: isActive ? 'active' : 'paused',
      config: {
        strategicGoals: strategicGoals.trim(),
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
      strategicGoals: strategicGoals.trim(),
      additionalContext: additionalContext.trim() || undefined,
    });
  };

  return (
    <AgentPageLayout
      title="Roadmap Alignment Agent"
      description="Check if your roadmap aligns with strategic goals"
      status="coming-soon"
      isLoading={isLoading}
      error={error}
      success={success}
      usage={{
        workflowName: 'Roadmap Alignment',
        used: currentUsage?.used || 0,
        limit: currentUsage?.limit || 0,
      }}
    >
      {/* Strategic Goals */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Strategic Goals</CardTitle>
          </div>
          <CardDescription>
            Enter your company or product strategic goals to check alignment against
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="strategic-goals">Strategic Goals *</Label>
            <Textarea
              id="strategic-goals"
              placeholder="e.g.,
1. Increase enterprise market share by 30%
2. Improve user retention to 85%
3. Launch in 3 new markets by Q4
4. Reduce customer support tickets by 20%"
              value={strategicGoals}
              onChange={(e) => setStrategicGoals(e.target.value)}
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (optional)</Label>
            <Textarea
              id="context"
              placeholder="e.g., We're preparing for a board review and need to demonstrate roadmap-strategy alignment..."
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
        description="The agent will analyze your roadmap from these sources"
        onToggle={handleSourceToggle}
        connectorConfigs={connectorConfigs}
        onConfigChange={handleConfigChange}
      />

      {/* Output Preview */}
      <OutputPreviewCard outputs={OUTPUT_PREVIEW} />

      {/* Agent Status */}
      <AgentStatusCard
        agentName="Roadmap Alignment Agent"
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
