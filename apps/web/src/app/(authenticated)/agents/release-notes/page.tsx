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
import { Megaphone } from 'lucide-react';
import {
  AgentPageLayout,
  AgentStatusCard,
  AgentActions,
  OutputPreviewCard,
  DataSourcesCard,
} from '@/components/agents';
import { useAgentConfig, ConnectorKey } from '@/hooks/use-agent-config';
import { useUsage } from '@/hooks/use-usage';

const AUDIENCES = [
  { value: 'all', label: 'All Users' },
  { value: 'internal', label: 'Internal Team' },
  { value: 'enterprise', label: 'Enterprise Customers' },
  { value: 'developers', label: 'Developers/API Users' },
];

const SUGGESTED_CONNECTORS: ConnectorKey[] = [
  'jira',
  'confluence',
  'slack',
  'gmail',
  'google-calendar',
  'google-drive',
];

const OUTPUT_PREVIEW = [
  'Categorized features (New, Improved, Fixed)',
  'User-friendly descriptions from technical tickets',
  'Breaking changes and migration notes',
  'Known issues and limitations',
  'Audience-appropriate formatting',
];

interface ReleaseNotesConfig extends Record<string, unknown> {
  version: string;
  releaseName: string;
  releaseDate: string;
  audience: string;
  highlights: string;
  enabledSources?: Record<string, boolean>;
  connectorConfigs?: object;
}

export default function ReleaseNotesPage() {
  const { currentUsage } = useUsage('release_notes');

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
    missingRequiredConnectors,
    canRun: canRunBase,
  } = useAgentConfig<ReleaseNotesConfig>({
    apiEndpoint: '/api/agents/release-notes',
    suggestedConnectors: SUGGESTED_CONNECTORS,
    requiredConnectors: ['jira'],
  });

  // Form state
  const [version, setVersion] = useState('');
  const [releaseName, setReleaseName] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [audience, setAudience] = useState('all');
  const [highlights, setHighlights] = useState('');

  // Load saved config values
  useEffect(() => {
    if (config?.config) {
      setVersion(config.config.version || '');
      setReleaseName(config.config.releaseName || '');
      setReleaseDate(config.config.releaseDate || '');
      setAudience(config.config.audience || 'all');
      setHighlights(config.config.highlights || '');
    }
  }, [config]);

  const canRun = canRunBase && version.trim() !== '';

  const onSave = async () => {
    const enabledSources: Record<string, boolean> = {};
    suggestedSources.forEach((source) => {
      enabledSources[source.key] = source.enabled;
    });

    await handleSave({
      status: isActive ? 'active' : 'paused',
      config: {
        version: version.trim(),
        releaseName: releaseName.trim(),
        releaseDate,
        audience,
        highlights: highlights.trim(),
        enabledSources,
        connectorConfigs: Object.fromEntries(
          Object.entries(connectorConfigs).filter(([key]) => enabledSources[key])
        ),
      },
    });
  };

  const onTrigger = async () => {
    const jiraSource = suggestedSources.find((s) => s.key === 'jira');
    const includeJira = jiraSource?.connected && jiraSource?.enabled;

    await handleTrigger({
      version: version.trim(),
      releaseName: releaseName.trim() || undefined,
      releaseDate: releaseDate || undefined,
      audience,
      highlights: highlights.trim() || undefined,
      includeJira,
    });
  };

  return (
    <AgentPageLayout
      title="Release Notes Agent"
      description="Draft release notes from Jira releases"
      status="coming-soon"
      isLoading={isLoading}
      error={error}
      success={success}
      usage={{
        workflowName: 'Release Notes',
        used: currentUsage?.used || 0,
        limit: currentUsage?.limit || 0,
      }}
    >
      {/* Release Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Release Information</CardTitle>
          </div>
          <CardDescription>
            Define the release you want to document
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="version">Version Number *</Label>
              <Input
                id="version"
                placeholder="e.g., 2.4.0, v3.1"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="release-name">Release Name (optional)</Label>
              <Input
                id="release-name"
                placeholder="e.g., Phoenix, Summer Update"
                value={releaseName}
                onChange={(e) => setReleaseName(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="release-date">Release Date</Label>
              <Input
                id="release-date"
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger id="audience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCES.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="highlights">Key Highlights (optional)</Label>
            <Textarea
              id="highlights"
              placeholder="e.g., Major performance improvements, new dashboard features, critical security fixes..."
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <DataSourcesCard
        suggestedSources={suggestedSources}
        allConnectedSources={allConnectedSources}
        requiredConnectors={['jira']}
        description="Pull release information from connected tools"
        onToggle={handleSourceToggle}
        connectorConfigs={connectorConfigs}
        onConfigChange={handleConfigChange}
      />

      {/* Output Preview */}
      <OutputPreviewCard outputs={OUTPUT_PREVIEW} />

      {/* Agent Status */}
      <AgentStatusCard
        agentName="Release Notes Agent"
        isActive={isActive}
        onActiveChange={setIsActive}
        missingRequiredConnectors={missingRequiredConnectors}
        comingSoon={true}
      />

      {/* Actions */}
      <AgentActions
        isTriggering={isTriggering}
        isSaving={isSaving}
        canRun={canRun}
        isAdmin={isAdmin}
        missingRequiredConnectors={missingRequiredConnectors}
        onTrigger={onTrigger}
        onSave={onSave}
        comingSoon={true}
      />
    </AgentPageLayout>
  );
}
