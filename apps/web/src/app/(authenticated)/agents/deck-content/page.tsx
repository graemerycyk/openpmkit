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
import { Presentation } from 'lucide-react';
import {
  AgentPageLayout,
  AgentStatusCard,
  AgentActions,
  OutputPreviewCard,
  DataSourcesCard,
} from '@/components/agents';
import { useAgentConfig, ConnectorKey } from '@/hooks/use-agent-config';
import { useUsage } from '@/hooks/use-usage';

const DECK_TYPES = [
  { value: 'qbr', label: 'Quarterly Business Review' },
  { value: 'executive', label: 'Executive Update' },
  { value: 'product_launch', label: 'Product Launch' },
  { value: 'roadmap', label: 'Roadmap Presentation' },
  { value: 'strategy', label: 'Strategy Overview' },
  { value: 'customer', label: 'Customer Presentation' },
];

const AUDIENCES = [
  { value: 'executive', label: 'Executive Team' },
  { value: 'board', label: 'Board of Directors' },
  { value: 'customer', label: 'Customer/Prospect' },
  { value: 'team', label: 'Internal Team' },
  { value: 'stakeholder', label: 'Stakeholders' },
];

const SUGGESTED_CONNECTORS: ConnectorKey[] = [
  'jira',
  'confluence',
  'slack',
  'gong',
  'google-drive',
  'gmail',
  'google-calendar',
];

const OUTPUT_PREVIEW = [
  'Slide-by-slide content outline',
  'Key talking points per slide',
  'Data visualizations suggestions',
  'Executive summary and narrative',
  'Speaker notes and Q&A prep',
];

interface DeckContentConfig extends Record<string, unknown> {
  title: string;
  deckType: string;
  audience: string;
  keyMessages: string;
  additionalContext: string;
  enabledSources?: Record<string, boolean>;
  connectorConfigs?: object;
}

export default function DeckContentPage() {
  const { currentUsage } = useUsage('deck_content');

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
  } = useAgentConfig<DeckContentConfig>({
    apiEndpoint: '/api/agents/deck-content',
    suggestedConnectors: SUGGESTED_CONNECTORS,
    requiredConnectors: [],
  });

  // Form state
  const [title, setTitle] = useState('');
  const [deckType, setDeckType] = useState('qbr');
  const [audience, setAudience] = useState('executive');
  const [keyMessages, setKeyMessages] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  // Load saved config values
  useEffect(() => {
    if (config?.config) {
      setTitle(config.config.title || '');
      setDeckType(config.config.deckType || 'qbr');
      setAudience(config.config.audience || 'executive');
      setKeyMessages(config.config.keyMessages || '');
      setAdditionalContext(config.config.additionalContext || '');
    }
  }, [config]);

  const canRun = title.trim() !== '';

  const onSave = async () => {
    const enabledSources: Record<string, boolean> = {};
    suggestedSources.forEach((source) => {
      enabledSources[source.key] = source.enabled;
    });

    await handleSave({
      status: isActive ? 'active' : 'paused',
      config: {
        title: title.trim(),
        deckType,
        audience,
        keyMessages: keyMessages.trim(),
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
      title: title.trim(),
      deckType,
      audience,
      keyMessages: keyMessages.trim() || undefined,
      additionalContext: additionalContext.trim() || undefined,
    });
  };

  return (
    <AgentPageLayout
      title="Deck Content Agent"
      description="Generate content for presentations and decks"
      status="coming-soon"
      isLoading={isLoading}
      error={error}
      success={success}
      usage={{
        workflowName: 'Deck Content',
        used: currentUsage?.used || 0,
        limit: currentUsage?.limit || 0,
      }}
    >
      {/* Deck Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Presentation className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Deck Information</CardTitle>
          </div>
          <CardDescription>
            Define the presentation you want to create
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Deck Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Q1 2024 Product Update"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deck-type">Deck Type</Label>
              <Select value={deckType} onValueChange={setDeckType}>
                <SelectTrigger id="deck-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DECK_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Label htmlFor="key-messages">Key Messages (optional)</Label>
            <Textarea
              id="key-messages"
              placeholder="e.g.,
• Highlight Q1 achievements
• Discuss upcoming roadmap
• Address customer feedback themes"
              value={keyMessages}
              onChange={(e) => setKeyMessages(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (optional)</Label>
            <Textarea
              id="context"
              placeholder="Any specific data points, metrics, or topics to include..."
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
        description="Pull data from connected tools to enrich the deck"
        onToggle={handleSourceToggle}
        connectorConfigs={connectorConfigs}
        onConfigChange={handleConfigChange}
      />

      {/* Output Preview */}
      <OutputPreviewCard outputs={OUTPUT_PREVIEW} />

      {/* Agent Status */}
      <AgentStatusCard
        agentName="Deck Content Agent"
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
