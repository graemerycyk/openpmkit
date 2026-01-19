'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Layout,
  Loader2,
  Play,
  Save,
  Target,
} from 'lucide-react';
import {
  DataSourcesCard,
  ConnectorConfigs,
  DEFAULT_CONNECTOR_CONFIGS,
  AnyConnectorConfig,
} from '@/components/agents/data-sources-card';
import { UsageLimitBanner } from '@/components/usage-limit-banner';
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

export default function PrototypeGenerationPage() {
  const { currentUsage } = useUsage('prototype_generation');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

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

  // Form state
  const [featureName, setFeatureName] = useState('');
  const [description, setDescription] = useState('');
  const [prototypeType, setPrototypeType] = useState('wireframe');
  const [platform, setPlatform] = useState('web');
  const [designNotes, setDesignNotes] = useState('');

  // Recommended sources for this agent
  const [suggestedSources, setSuggestedSources] = useState([
    { key: 'figma' as const, connected: false, enabled: false },
    { key: 'confluence' as const, connected: false, enabled: false },
    { key: 'jira' as const, connected: false, enabled: false },
  ]);

  // All connected sources from API (for showing additional connected integrations)
  const [allConnectedSources, setAllConnectedSources] = useState<
    { key: 'slack' | 'jira' | 'confluence' | 'gong' | 'zendesk' | 'google-calendar' | 'google-drive' | 'gmail' | 'figma'; connected: boolean }[]
  >([]);

  // Connector-specific configurations
  const [connectorConfigs, setConnectorConfigs] = useState<ConnectorConfigs>({
    jira: { ...DEFAULT_CONNECTOR_CONFIGS.jira! },
    confluence: { ...DEFAULT_CONNECTOR_CONFIGS.confluence! },
  });

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
        }
      } catch (err) {
        console.error('Failed to fetch connectors:', err);
      }
    }
    fetchConnectors();
  }, []);

  const canRun = featureName.trim() !== '' && description.trim() !== '';

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

    try {
      const res = await fetch('/api/agents/prototype-generation/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featureName: featureName.trim(),
          description: description.trim(),
          prototypeType,
          platform,
          designNotes: designNotes.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(`Prototype Generation started! Job ID: ${data.jobId}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to start prototype generation');
      }
    } catch {
      setError('Failed to start. Please try again.');
    } finally {
      setIsRunning(false);
    }
  };

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
            <h1 className="font-heading text-2xl font-bold">Prototype Generation Agent</h1>
            <p className="text-muted-foreground">
              Generate low-fidelity prototypes from PRDs
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
        workflowName="Prototype Generation"
        used={currentUsage?.used || 0}
        limit={currentUsage?.limit || 0}
      />

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
              <span>Screen-by-screen wireframes or mockups</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>User flow diagrams</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Component specifications</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Interaction notes and annotations</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Edge cases and error states</span>
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
