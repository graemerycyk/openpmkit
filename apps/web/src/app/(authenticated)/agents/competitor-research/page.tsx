'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Globe,
  Newspaper,
  Plus,
  Search,
  Sword,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  AgentPageLayout,
  AgentStatusCard,
  AgentActions,
  OutputPreviewCard,
} from '@/components/agents';
import { useAgentConfig, ConnectorKey } from '@/hooks/use-agent-config';
import { useUsage } from '@/hooks/use-usage';

const OUTPUT_PREVIEW = [
  'Company overview and positioning analysis',
  'Product/feature comparison matrix',
  'Pricing intelligence (if available)',
  'Recent news and announcements',
  'Strengths, weaknesses, and opportunities',
];

// No suggested connectors for this agent - uses web crawlers instead
const SUGGESTED_CONNECTORS: ConnectorKey[] = [];

interface CompetitorConfig extends Record<string, unknown> {
  competitors: string[];
  focusAreas: string;
  additionalContext: string;
  enabledSources?: Record<string, boolean>;
  connectorConfigs?: object;
}

export default function CompetitorResearchPage() {
  const { currentUsage } = useUsage('competitor_research');

  const {
    isLoading,
    isSaving,
    isTriggering,
    error,
    success,
    config,
    isActive,
    setIsActive,
    isAdmin,
    handleSave,
    handleTrigger,
  } = useAgentConfig<CompetitorConfig>({
    apiEndpoint: '/api/agents/competitor-research',
    suggestedConnectors: SUGGESTED_CONNECTORS,
    requiredConnectors: [],
  });

  // Form state
  const [competitors, setCompetitors] = useState<string[]>(['']);
  const [focusAreas, setFocusAreas] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  // Load saved config values
  useEffect(() => {
    if (config?.config) {
      setCompetitors(config.config.competitors?.length ? config.config.competitors : ['']);
      setFocusAreas(config.config.focusAreas || '');
      setAdditionalContext(config.config.additionalContext || '');
    }
  }, [config]);

  const addCompetitor = () => {
    if (competitors.length < 5) {
      setCompetitors([...competitors, '']);
    }
  };

  const removeCompetitor = (index: number) => {
    if (competitors.length > 1) {
      setCompetitors(competitors.filter((_, i) => i !== index));
    }
  };

  const updateCompetitor = (index: number, value: string) => {
    const updated = [...competitors];
    updated[index] = value;
    setCompetitors(updated);
  };

  const canRun = competitors.some((c) => c.trim() !== '');

  const onSave = async () => {
    await handleSave({
      status: isActive ? 'active' : 'paused',
      config: {
        competitors: competitors.filter((c) => c.trim() !== ''),
        focusAreas: focusAreas.trim(),
        additionalContext: additionalContext.trim(),
      },
    });
  };

  const onTrigger = async () => {
    await handleTrigger({
      competitors: competitors.filter((c) => c.trim() !== ''),
      focusAreas: focusAreas.trim() || undefined,
      additionalContext: additionalContext.trim() || undefined,
    });
  };

  return (
    <AgentPageLayout
      title="Competitor Research Agent"
      description="Research competitors using web search and news sources"
      status="coming-soon"
      isLoading={isLoading}
      error={error}
      success={success}
      usage={{
        workflowName: 'Competitor Research',
        used: currentUsage?.used || 0,
        limit: currentUsage?.limit || 0,
      }}
    >
      {/* Competitors */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sword className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Competitors to Research</CardTitle>
          </div>
          <CardDescription>
            Add up to 5 competitors to analyze (company names or domains)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {competitors.map((competitor, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`e.g., ${index === 0 ? 'Acme Inc' : index === 1 ? 'competitor.com' : 'Company Name'}`}
                value={competitor}
                onChange={(e) => updateCompetitor(index, e.target.value)}
              />
              {competitors.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCompetitor(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {competitors.length < 5 && (
            <Button variant="outline" size="sm" onClick={addCompetitor}>
              <Plus className="mr-2 h-4 w-4" />
              Add Competitor
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Research Focus */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Research Focus</CardTitle>
          </div>
          <CardDescription>
            Optionally specify what aspects to focus on
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="focus-areas">Focus Areas (optional)</Label>
            <Input
              id="focus-areas"
              placeholder="e.g., pricing, features, market positioning, recent announcements"
              value={focusAreas}
              onChange={(e) => setFocusAreas(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (optional)</Label>
            <Textarea
              id="context"
              placeholder="e.g., We're launching a similar feature next quarter and need to understand the competitive landscape..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Sources (static display for this agent) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Data Sources</CardTitle>
          </div>
          <CardDescription>
            The agent will gather intelligence from these sources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <div className="rounded-lg bg-blue-100 p-2">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <span className="font-medium">Web Search</span>
              <p className="text-sm text-muted-foreground">
                Company websites, product pages, and documentation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <div className="rounded-lg bg-orange-100 p-2">
              <Newspaper className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <span className="font-medium">News & Press</span>
              <p className="text-sm text-muted-foreground">
                Recent news articles, press releases, and announcements
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <div className="rounded-lg bg-purple-100 p-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <span className="font-medium">Social & Community</span>
              <p className="text-sm text-muted-foreground">
                Reddit discussions, Hacker News, and social media
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Output Preview */}
      <OutputPreviewCard outputs={OUTPUT_PREVIEW} />

      {/* Agent Status */}
      <AgentStatusCard
        agentName="Competitor Research Agent"
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
