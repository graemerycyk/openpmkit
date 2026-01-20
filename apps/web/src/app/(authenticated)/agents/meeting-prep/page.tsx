'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
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
  Calendar,
  CheckCircle2,
  Filter,
  Loader2,
  Play,
  Save,
  Settings2,
  Target,
  Zap,
} from 'lucide-react';
import {
  DataSourcesCard,
  ConnectorConfigs,
  DEFAULT_CONNECTOR_CONFIGS,
  AnyConnectorConfig,
} from '@/components/agents/data-sources-card';
import { UsageLimitBanner } from '@/components/usage-limit-banner';
import { useUsage } from '@/hooks/use-usage';

// Meeting prep timeframes
const TIMEFRAMES = [
  { value: '7', label: 'Last 7 days' },
  { value: '14', label: 'Last 14 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

// Prep timing options (how long before meeting to generate prep)
const PREP_TIMINGS = [
  { value: '15', label: '15 minutes before' },
  { value: '30', label: '30 minutes before' },
  { value: '60', label: '1 hour before' },
  { value: '120', label: '2 hours before' },
  { value: '1440', label: '1 day before' },
];

interface AgentConfig {
  id: string;
  status: string;
  config: {
    lookbackDays: number;
    prepTimingMinutes: number;
    filterDomains: string[];
    includeAllExternalMeetings: boolean;
    // Data source enabled states
    enabledSources?: {
      'google-calendar'?: boolean;
      gmail?: boolean;
      'google-drive'?: boolean;
      gong?: boolean;
      slack?: boolean;
      zendesk?: boolean;
      jira?: boolean;
      confluence?: boolean;
    };
    // Connector-specific configurations
    connectorConfigs?: {
      slack?: {
        includeMentions?: boolean;
        selectedChannels?: string[];
      };
      gmail?: {
        unreadOnly?: boolean;
        includeStarred?: boolean;
      };
      'google-drive'?: {
        sharedWithMe?: boolean;
        recentEdits?: boolean;
        includeComments?: boolean;
      };
      'google-calendar'?: {
        todayOnly?: boolean;
        includeDescriptions?: boolean;
      };
      gong?: {
        recentCallsOnly?: boolean;
        includeTranscripts?: boolean;
      };
      zendesk?: {
        openTicketsOnly?: boolean;
        includeComments?: boolean;
      };
      jira?: {
        assignedToMe?: boolean;
        recentlyUpdated?: boolean;
      };
      confluence?: {
        recentlyEdited?: boolean;
        sharedWithMe?: boolean;
      };
    };
  };
  nextRunAt: string | null;
  lastRunAt: string | null;
}

export default function MeetingPrepSetupPage() {
  const router = useRouter();
  const { currentUsage } = useUsage('meeting_prep');
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form state
  const [isActive, setIsActive] = useState(true);
  const [timeframe, setTimeframe] = useState('30');
  const [prepTiming, setPrepTiming] = useState('30');
  const [filterDomains, setFilterDomains] = useState('');
  const [includeAllExternalMeetings, setIncludeAllExternalMeetings] = useState(true);

  // Recommended sources for this agent
  const [suggestedSources, setSuggestedSources] = useState([
    { key: 'google-calendar' as const, connected: false, enabled: false },
    { key: 'gmail' as const, connected: false, enabled: false },
    { key: 'google-drive' as const, connected: false, enabled: false },
    { key: 'gong' as const, connected: false, enabled: false },
    { key: 'slack' as const, connected: false, enabled: false },
    { key: 'zendesk' as const, connected: false, enabled: false },
    { key: 'jira' as const, connected: false, enabled: false },
    { key: 'confluence' as const, connected: false, enabled: false },
  ]);

  // All connected sources from API (for showing additional connected integrations)
  const [allConnectedSources, setAllConnectedSources] = useState<
    { key: 'slack' | 'jira' | 'confluence' | 'gong' | 'zendesk' | 'google-calendar' | 'google-drive' | 'gmail' | 'figma'; connected: boolean }[]
  >([]);

  // Connector-specific configurations
  const [connectorConfigs, setConnectorConfigs] = useState<ConnectorConfigs>({
    'google-calendar': { ...DEFAULT_CONNECTOR_CONFIGS['google-calendar']! },
    gmail: { ...DEFAULT_CONNECTOR_CONFIGS.gmail! },
    'google-drive': { ...DEFAULT_CONNECTOR_CONFIGS['google-drive']! },
    gong: { ...DEFAULT_CONNECTOR_CONFIGS.gong! },
    zendesk: { ...DEFAULT_CONNECTOR_CONFIGS.zendesk! },
    slack: { ...DEFAULT_CONNECTOR_CONFIGS.slack! },
    jira: { ...DEFAULT_CONNECTOR_CONFIGS.jira! },
    confluence: { ...DEFAULT_CONNECTOR_CONFIGS.confluence! },
  });

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

  useEffect(() => {
    async function fetchData() {
      // Track saved config to restore enabled states
      let savedConfig: AgentConfig['config'] | null = null;

      try {
        // Fetch existing config first so we can use it when setting enabled states
        const configRes = await fetch('/api/agents/meeting-prep');
        if (configRes.ok) {
          const data = await configRes.json();
          if (data.config) {
            setConfig(data.config);
            savedConfig = data.config.config;
            setTimeframe(String(data.config.config.lookbackDays || 30));
            setPrepTiming(String(data.config.config.prepTimingMinutes || 30));
            setFilterDomains((data.config.config.filterDomains || []).join(', '));
            setIncludeAllExternalMeetings(data.config.config.includeAllExternalMeetings ?? true);
            setIsActive(data.config.status === 'active');
            // Restore saved connector configs (Slack channels, etc.)
            if (data.config.config.connectorConfigs) {
              setConnectorConfigs((prev) => ({
                ...prev,
                slack: {
                  ...prev.slack!,
                  includeMentions: data.config.config.connectorConfigs?.slack?.includeMentions ?? prev.slack!.includeMentions,
                  selectedChannels: data.config.config.connectorConfigs?.slack?.selectedChannels || [],
                },
                gmail: data.config.config.connectorConfigs?.gmail || prev.gmail,
                'google-drive': data.config.config.connectorConfigs?.['google-drive'] || prev['google-drive'],
                'google-calendar': data.config.config.connectorConfigs?.['google-calendar'] || prev['google-calendar'],
                gong: data.config.config.connectorConfigs?.gong || prev.gong,
                zendesk: data.config.config.connectorConfigs?.zendesk || prev.zendesk,
                jira: data.config.config.connectorConfigs?.jira || prev.jira,
                confluence: data.config.config.connectorConfigs?.confluence || prev.confluence,
              }));
            }
          }
        }

        // Fetch connectors
        const connectorsRes = await fetch('/api/connectors');
        if (connectorsRes.ok) {
          const data = await connectorsRes.json();
          const connectors = data.connectors || [];
          // Update suggested sources with connection status and restore enabled state from saved config
          setSuggestedSources((prev) =>
            prev.map((source) => {
              const isConnected = connectors.some(
                (c: { connectorKey: string; status: string }) =>
                  c.connectorKey === source.key && c.status === 'real'
              );

              // Determine enabled state: use saved config if available, otherwise default to connected state
              let isEnabled = isConnected; // Default for new users
              if (savedConfig?.enabledSources) {
                const savedEnabled = savedConfig.enabledSources[source.key as keyof typeof savedConfig.enabledSources];
                if (savedEnabled !== undefined) {
                  isEnabled = savedEnabled;
                }
              }

              return {
                ...source,
                connected: isConnected,
                enabled: isEnabled,
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

          // Fetch Slack channels if Slack is connected
          const slackIsConnected = connectors.some(
            (c: { connectorKey: string; status: string }) =>
              c.connectorKey === 'slack' && c.status === 'real'
          );
          if (slackIsConnected) {
            try {
              const channelsRes = await fetch('/api/connectors/slack/channels');
              if (channelsRes.ok) {
                const channelsData = await channelsRes.json();
                const fetchedChannels = channelsData.channels || [];
                // Update connector configs with fetched channels (preserve selectedChannels)
                setConnectorConfigs((prev) => ({
                  ...prev,
                  slack: {
                    ...prev.slack!,
                    channels: fetchedChannels,
                    // Preserve selectedChannels that were restored from saved config
                    selectedChannels: prev.slack?.selectedChannels || [],
                  },
                }));
              }
            } catch (err) {
              console.error('Failed to fetch Slack channels:', err);
            }
          }
        }

      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const calendarSource = suggestedSources.find((s) => s.key === 'google-calendar');
  const calendarConnected = calendarSource?.connected ?? false;
  const calendarEnabled = calendarSource?.enabled ?? false;

  const canRun = calendarConnected && calendarEnabled;

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

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const domains = filterDomains
      .split(',')
      .map((d) => d.trim().toLowerCase())
      .filter((d) => d.length > 0);

    // Build enabled sources map from current suggestedSources state
    const enabledSources: Record<string, boolean> = {};
    suggestedSources.forEach((source) => {
      enabledSources[source.key] = source.enabled;
    });

    try {
      const res = await fetch('/api/agents/meeting-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: isActive ? 'active' : 'paused',
          config: {
            lookbackDays: parseInt(timeframe),
            prepTimingMinutes: parseInt(prepTiming),
            filterDomains: domains,
            includeAllExternalMeetings,
            enabledSources,
            // Save connector-specific configs (Slack channels, etc.)
            connectorConfigs: {
              slack: enabledSources.slack ? {
                includeMentions: connectorConfigs.slack?.includeMentions,
                selectedChannels: connectorConfigs.slack?.selectedChannels || [],
              } : undefined,
              gmail: enabledSources.gmail ? connectorConfigs.gmail : undefined,
              'google-drive': enabledSources['google-drive'] ? connectorConfigs['google-drive'] : undefined,
              'google-calendar': enabledSources['google-calendar'] ? connectorConfigs['google-calendar'] : undefined,
              gong: enabledSources.gong ? connectorConfigs.gong : undefined,
              zendesk: enabledSources.zendesk ? connectorConfigs.zendesk : undefined,
              jira: enabledSources.jira ? connectorConfigs.jira : undefined,
              confluence: enabledSources.confluence ? connectorConfigs.confluence : undefined,
            },
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setSuccess('Agent settings saved successfully!');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save configuration');
      }
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTrigger = async () => {
    if (!canRun) return;

    setIsTriggering(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/agents/meeting-prep/trigger', {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(`Meeting Prep started for next meeting! Job ID: ${data.jobId}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to trigger meeting prep');
      }
    } catch {
      setError('Failed to trigger. Please try again.');
    } finally {
      setIsTriggering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold">Meeting Prep Agent</h1>
            <p className="text-muted-foreground">
              Automatically generate prep packs before customer meetings
            </p>
          </div>
        </div>
        {config && (
          <Badge
            variant={config.status === 'active' ? 'default' : 'secondary'}
            className={config.status === 'active' ? 'bg-green-600' : ''}
          >
            {config.status === 'active' ? 'Active' : 'Paused'}
          </Badge>
        )}
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
        workflowName="Meeting Prep"
        used={currentUsage?.used || 0}
        limit={currentUsage?.limit || 0}
      />

      {/* Prep Timing */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Prep Timing</CardTitle>
          </div>
          <CardDescription>
            When should the agent generate prep packs before each meeting?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prep-timing">Generate Prep Pack</Label>
            <Select value={prepTiming} onValueChange={setPrepTiming}>
              <SelectTrigger id="prep-timing" className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PREP_TIMINGS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeframe">Look Back Period</Label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger id="timeframe" className="w-[200px]">
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
            <p className="text-xs text-muted-foreground">
              How far back to search for calls, messages, and tickets related to each account
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Meeting Selection</CardTitle>
          </div>
          <CardDescription>
            Choose which meetings should automatically receive prep packs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="all-external">All external meetings</Label>
              <p className="text-sm text-muted-foreground">
                Prepare for any meeting with attendees outside your organization
              </p>
            </div>
            <Switch
              id="all-external"
              checked={includeAllExternalMeetings}
              onCheckedChange={setIncludeAllExternalMeetings}
            />
          </div>

          {!includeAllExternalMeetings && (
            <div className="space-y-2">
              <Label htmlFor="domains">Filter by Domains</Label>
              <Input
                id="domains"
                placeholder="e.g., acme.com, techstart.io"
                value={filterDomains}
                onChange={(e) => setFilterDomains(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of email domains. Only meetings with attendees from these domains will get prep packs.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendar Connection */}
      {!calendarConnected && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Connect Calendar</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-dashed p-6 text-center">
              <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-3 font-medium">Connect Google Calendar</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Connect your calendar to automatically detect upcoming meetings
              </p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/settings/integrations">Connect Calendar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Sources */}
      <DataSourcesCard
        suggestedSources={suggestedSources}
        allConnectedSources={allConnectedSources}
        requiredConnectors={['google-calendar']}
        description="The agent will pull account context from your connected sources"
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
              <span>Account summary with key stakeholders</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Recent call insights and pain points</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Open support tickets and issues</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Suggested talking points</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Risks and opportunities to address</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Agent Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Agent Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="agent-active">Enable Meeting Prep</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, the agent will automatically generate prep packs before your meetings
              </p>
            </div>
            <Switch
              id="agent-active"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={!canRun}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button
              variant="outline"
              onClick={handleTrigger}
              disabled={isTriggering || !canRun}
            >
              {isTriggering ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Run Now
            </Button>
          )}
          {!canRun && (
            <span className="text-sm text-muted-foreground">
              Connect Google Calendar to run
            </span>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Agent Settings
        </Button>
      </div>

      {/* Last Run Info */}
      {config?.lastRunAt && (
        <p className="text-center text-sm text-muted-foreground">
          Last run: {new Date(config.lastRunAt).toLocaleString()}
          {' · '}
          <Link
            href="/agents/meeting-prep/history"
            className="text-cobalt-600 hover:underline"
          >
            View History
          </Link>
        </p>
      )}
    </div>
  );
}
