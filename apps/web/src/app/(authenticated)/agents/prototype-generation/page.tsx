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
import { Layout } from 'lucide-react';
import {
  AgentPageLayout,
  AgentStatusCard,
  AgentActions,
  OutputPreviewCard,
  DataSourcesCard,
} from '@/components/agents';
import { useAgentConfig, ConnectorKey } from '@/hooks/use-agent-config';
import { useUsage } from '@/hooks/use-usage';

const PROTOTYPE_TYPES = [
  { value: 'wireframe', label: 'Wireframe (Low-fi)' },
  { value: 'mockup', label: 'Mockup (High-fi)' },
  { value: 'interactive', label: 'Interactive Prototype' },
  { value: 'code', label: 'Code Prototype (HTML/CSS)' },
];

const PLATFORMS = [
  { value: 'web', label: 'Web Application' },
  { value: 'mobile', label: 'Mobile App' },
  { value: 'desktop', label: 'Desktop Application' },
  { value: 'responsive', label: 'Responsive (All)' },
];

const SUGGESTED_CONNECTORS: ConnectorKey[] = [
  'figma',
  'confluence',
  'jira',
  'slack',
  'gmail',
  'google-calendar',
  'google-drive',
];

const OUTPUT_PREVIEW = [
  'Screen-by-screen wireframes or mockups',
  'User flow diagrams',
  'Component specifications',
  'Interaction notes and annotations',
  'Edge cases and error states',
];

interface PrototypeConfig extends Record<string, unknown> {
  featureName: string;
  description: string;
  prototypeType: string;
  platform: string;
  designNotes: string;
  enabledSources?: Record<string, boolean>;
  connectorConfigs?: object;
}

export default function PrototypeGenerationPage() {
  const { currentUsage } = useUsage('prototype_generation');

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
  } = useAgentConfig<PrototypeConfig>({
    apiEndpoint: '/api/agents/prototype-generation',
    suggestedConnectors: SUGGESTED_CONNECTORS,
    requiredConnectors: [],
  });

  // Form state
  const [featureName, setFeatureName] = useState('');
  const [description, setDescription] = useState('');
  const [prototypeType, setPrototypeType] = useState('wireframe');
  const [platform, setPlatform] = useState('web');
  const [designNotes, setDesignNotes] = useState('');

  // Load saved config values
  useEffect(() => {
    if (config?.config) {
      setFeatureName(config.config.featureName || '');
      setDescription(config.config.description || '');
      setPrototypeType(config.config.prototypeType || 'wireframe');
      setPlatform(config.config.platform || 'web');
      setDesignNotes(config.config.designNotes || '');
    }
  }, [config]);

  const canRun = featureName.trim() !== '' && description.trim() !== '';

  const onSave = async () => {
    const enabledSources: Record<string, boolean> = {};
    suggestedSources.forEach((source) => {
      enabledSources[source.key] = source.enabled;
    });

    await handleSave({
      status: isActive ? 'active' : 'paused',
      config: {
        featureName: featureName.trim(),
        description: description.trim(),
        prototypeType,
        platform,
        designNotes: designNotes.trim(),
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
      description: description.trim(),
      prototypeType,
      platform,
      designNotes: designNotes.trim() || undefined,
    });
  };

  return (
    <AgentPageLayout
      title="Prototype Generation Agent"
      description="Generate low-fidelity prototypes from PRDs"
      status="coming-soon"
      isLoading={isLoading}
      error={error}
      success={success}
      usage={{
        workflowName: 'Prototype Generation',
        used: currentUsage?.used || 0,
        limit: currentUsage?.limit || 0,
      }}
    >
      {/* Feature Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Feature to Prototype</CardTitle>
          </div>
          <CardDescription>
            Describe the feature you want to prototype
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feature-name">Feature Name *</Label>
            <Input
              id="feature-name"
              placeholder="e.g., User Onboarding Flow"
              value={featureName}
              onChange={(e) => setFeatureName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Feature Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the feature, its purpose, key user flows, and any specific requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prototype-type">Prototype Type</Label>
              <Select value={prototypeType} onValueChange={setPrototypeType}>
                <SelectTrigger id="prototype-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROTOTYPE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform">Target Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger id="platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="design-notes">Design Notes (optional)</Label>
            <Textarea
              id="design-notes"
              placeholder="Any specific design requirements, brand guidelines, or reference examples..."
              value={designNotes}
              onChange={(e) => setDesignNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <DataSourcesCard
        suggestedSources={suggestedSources}
        allConnectedSources={allConnectedSources}
        description="Connect to pull existing design context"
        onToggle={handleSourceToggle}
        connectorConfigs={connectorConfigs}
        onConfigChange={handleConfigChange}
      />

      {/* Output Preview */}
      <OutputPreviewCard outputs={OUTPUT_PREVIEW} />

      {/* Agent Status */}
      <AgentStatusCard
        agentName="Prototype Generation Agent"
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
