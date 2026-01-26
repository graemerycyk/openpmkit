'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Layout, FileText, CheckCircle2 } from 'lucide-react';
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
  selectedPrdId: string;
  prototypeType: string;
  platform: string;
  usePmkitPrd: boolean;
  enabledSources?: Record<string, boolean>;
  connectorConfigs?: object;
}

interface PrdArtifact {
  id: string;
  title: string;
  createdAt: string;
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
  const [selectedPrdId, setSelectedPrdId] = useState('');
  const [prototypeType, setPrototypeType] = useState('wireframe');
  const [platform, setPlatform] = useState('web');
  const [availablePrds, setAvailablePrds] = useState<PrdArtifact[]>([]);
  const [isLoadingPrds, setIsLoadingPrds] = useState(true);

  // Fetch available PRDs from pmkit
  useEffect(() => {
    async function fetchPrds() {
      setIsLoadingPrds(true);
      try {
        const res = await fetch('/api/artifacts?type=prd_draft');
        if (res.ok) {
          const data = await res.json();
          setAvailablePrds(data.artifacts || []);
        }
      } catch (err) {
        console.error('Failed to fetch PRDs:', err);
      } finally {
        setIsLoadingPrds(false);
      }
    }
    fetchPrds();
  }, []);

  // Load saved config values
  useEffect(() => {
    if (config?.config) {
      setSelectedPrdId(config.config.selectedPrdId || '');
      setPrototypeType(config.config.prototypeType || 'wireframe');
      setPlatform(config.config.platform || 'web');
    }
  }, [config]);

  // Can run when a PRD is selected
  const canRun = selectedPrdId !== '';

  const onSave = async () => {
    const enabledSources: Record<string, boolean> = {};
    suggestedSources.forEach((source) => {
      enabledSources[source.key] = source.enabled;
    });

    await handleSave({
      status: isActive ? 'active' : 'paused',
      config: {
        selectedPrdId,
        prototypeType,
        platform,
        usePmkitPrd: true,
        enabledSources,
        connectorConfigs: Object.fromEntries(
          Object.entries(connectorConfigs).filter(([key]) => enabledSources[key])
        ),
      },
    });
  };

  const onTrigger = async () => {
    await handleTrigger({
      selectedPrdId,
      prototypeType,
      platform,
      usePmkitPrd: true,
    });
  };

  const selectedPrd = availablePrds.find((p) => p.id === selectedPrdId);

  return (
    <AgentPageLayout
      title="Prototype Generation Agent"
      description="Generate low-fidelity prototypes from PRD Draft artifacts"
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
      {/* PRD Source Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Source PRD</CardTitle>
          </div>
          <CardDescription>
            Select a PRD from your PRD Draft artifacts to generate a prototype
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prd-select">Select PRD *</Label>
            <Select value={selectedPrdId} onValueChange={setSelectedPrdId}>
              <SelectTrigger id="prd-select">
                <SelectValue placeholder={isLoadingPrds ? "Loading PRDs..." : "Select a PRD..."} />
              </SelectTrigger>
              <SelectContent>
                {availablePrds.length === 0 && !isLoadingPrds && (
                  <SelectItem value="none" disabled>
                    No PRDs available - run PRD Draft agent first
                  </SelectItem>
                )}
                {availablePrds.map((prd) => (
                  <SelectItem key={prd.id} value={prd.id}>
                    {prd.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availablePrds.length === 0 && !isLoadingPrds && (
              <p className="text-sm text-muted-foreground">
                Run the PRD Draft agent first to generate PRDs that can be prototyped.
              </p>
            )}
          </div>

          {selectedPrd && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">{selectedPrd.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(selectedPrd.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prototype Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Prototype Settings</CardTitle>
          </div>
          <CardDescription>
            Configure the type and platform for your prototype
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* pmkit Data Source info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Data Sources</CardTitle>
          </div>
          <CardDescription>
            The prototype will be generated from pmkit artifacts and additional context
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border p-4 bg-cobalt-50/50">
            <div className="rounded-lg bg-cobalt-100 p-2">
              <FileText className="h-5 w-5 text-cobalt-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">pmkit PRD Drafts</span>
                <Badge variant="default" className="bg-cobalt-600">Primary Source</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Uses the selected PRD as the primary input for prototype generation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Data Sources */}
      <DataSourcesCard
        suggestedSources={suggestedSources}
        allConnectedSources={allConnectedSources}
        description="Connect additional sources to pull design context and references"
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
