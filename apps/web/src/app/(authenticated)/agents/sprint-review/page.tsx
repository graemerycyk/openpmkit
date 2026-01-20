'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
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
  Loader2,
  Play,
  Save,
  Settings2,
  Target,
  X,
} from 'lucide-react';
import {
  DataSourcesCard,
  ConnectorConfigs,
  DEFAULT_CONNECTOR_CONFIGS,
  AnyConnectorConfig,
} from '@/components/agents/data-sources-card';
import { UsageLimitBanner } from '@/components/usage-limit-banner';
import { useUsage } from '@/hooks/use-usage';

interface AgentConfig {
  id: string;
  status: string;
  config: {
    calendarKeywords: string[];
    leadTimeMinutes: number;
    timezone: string;
    jiraProjectKeys: string[];
    includeVelocity: boolean;
    includeCarryover: boolean;
    includeSlackHighlights: boolean;
    includeConfluence: boolean;
    // Connector-specific configurations
    connectorConfigs?: {
      slack?: {
        includeMentions?: boolean;
        selectedChannels?: string[];
      };
      jira?: {
        assignedToMe?: boolean;
        recentlyUpdated?: boolean;
      };
      confluence?: {
        recentlyEdited?: boolean;
        sharedWithMe?: boolean;
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
    };
  };
  nextRunAt: string | null;
  lastRunAt: string | null;
}

// Common timezones
const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (MST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central European (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)' },
  { value: 'Asia/Shanghai', label: 'China (CST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

// Lead time options (minutes before meeting)
const LEAD_TIME_OPTIONS = [
  { value: '60', label: '1 hour before' },
  { value: '120', label: '2 hours before' },
  { value: '240', label: '4 hours before' },
  { value: '480', label: '8 hours before' },
  { value: '1440', label: '24 hours before' },
];

// Default calendar keywords for sprint meetings
const DEFAULT_KEYWORDS = ['Sprint Demo', 'Sprint Review', 'Department Sprint Review'];

export default function SprintReviewPage() {
  const router = useRouter();
  const { currentUsage } = useUsage('sprint_review');
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Agent configuration state
  const [isActive, setIsActive] = useState(false);
  const [calendarKeywords, setCalendarKeywords] = useState<string[]>(DEFAULT_KEYWORDS);
  const [newKeyword, setNewKeyword] = useState('');
  const [leadTimeMinutes, setLeadTimeMinutes] = useState('240');
  const [timezone, setTimezone] = useState('America/New_York');
  const [includeVelocity, setIncludeVelocity] = useState(true);
  const [includeCarryover, setIncludeCarryover] = useState(true);

  // Recommended sources for this agent
  const [suggestedSources, setSuggestedSources] = useState([
    { key: 'jira' as const, connected: false, enabled: false },
    { key: 'confluence' as const, connected: false, enabled: false },
    { key: 'slack' as const, connected: false, enabled: false },
    { key: 'zendesk' as const, connected: false, enabled: false },
  ]);

  // All connected sources from API (for showing additional connected integrations)
  const [allConnectedSources, setAllConnectedSources] = useState<
    { key: 'slack' | 'jira' | 'confluence' | 'gong' | 'zendesk' | 'google-calendar' | 'google-drive' | 'gmail' | 'figma'; connected: boolean; enabled?: boolean }[]
  >([]);

  // Connector-specific configurations
  const [connectorConfigs, setConnectorConfigs] = useState<ConnectorConfigs>({
    jira: { ...DEFAULT_CONNECTOR_CONFIGS.jira! },
    confluence: { ...DEFAULT_CONNECTOR_CONFIGS.confluence! },
    slack: { ...DEFAULT_CONNECTOR_CONFIGS.slack! },
    gmail: { ...DEFAULT_CONNECTOR_CONFIGS.gmail! },
    'google-drive': { ...DEFAULT_CONNECTOR_CONFIGS['google-drive']! },
    'google-calendar': { ...DEFAULT_CONNECTOR_CONFIGS['google-calendar']! },
    zendesk: { ...DEFAULT_CONNECTOR_CONFIGS.zendesk! },
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

  // Detect user's timezone
  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const matchingTz = TIMEZONES.find((tz) => tz.value === detected);
    if (matchingTz) {
      setTimezone(detected);
    }
  }, []);

  // Fetch agent config and connectors
  useEffect(() => {
    async function fetchData() {
      // Track saved config to restore enabled states
      let savedConfig: {
        includeSlackHighlights?: boolean;
        includeConfluence?: boolean;
        includeZendesk?: boolean;
        connectorConfigs?: {
          gmail?: object;
          'google-drive'?: object;
          'google-calendar'?: object;
          zendesk?: object;
        };
      } | null = null;

      try {
        // Fetch agent config
        const configRes = await fetch('/api/agents/sprint-review');
        if (configRes.ok) {
          const data = await configRes.json();
          if (data.config) {
            setConfig(data.config);
            savedConfig = data.config.config; // Store for use when setting enabled states
            setIsActive(data.config.status === 'active');
            setCalendarKeywords(data.config.config.calendarKeywords || DEFAULT_KEYWORDS);
            setLeadTimeMinutes(String(data.config.config.leadTimeMinutes || 240));
            setTimezone(data.config.config.timezone || 'America/New_York');
            setIncludeVelocity(data.config.config.includeVelocity ?? true);
            setIncludeCarryover(data.config.config.includeCarryover ?? true);
            // Restore saved connector configs (Slack channels, etc.)
            if (data.config.config.connectorConfigs) {
              setConnectorConfigs((prev) => ({
                ...prev,
                slack: {
                  ...prev.slack!,
                  includeMentions: data.config.config.connectorConfigs?.slack?.includeMentions ?? prev.slack!.includeMentions,
                  selectedChannels: data.config.config.connectorConfigs?.slack?.selectedChannels || [],
                },
                jira: data.config.config.connectorConfigs?.jira || prev.jira,
                confluence: data.config.config.connectorConfigs?.confluence || prev.confluence,
                gmail: data.config.config.connectorConfigs?.gmail || prev.gmail,
                'google-drive': data.config.config.connectorConfigs?.['google-drive'] || prev['google-drive'],
                'google-calendar': data.config.config.connectorConfigs?.['google-calendar'] || prev['google-calendar'],
              }));
            }
          }
        }

        // Fetch connectors
        const res = await fetch('/api/connectors');
        if (res.ok) {
          const data = await res.json();
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
              if (savedConfig) {
                if (source.key === 'jira') {
                  // Jira is required, always enable if connected
                  isEnabled = isConnected;
                } else if (source.key === 'slack') {
                  isEnabled = savedConfig.includeSlackHighlights ?? isConnected;
                } else if (source.key === 'confluence') {
                  isEnabled = savedConfig.includeConfluence ?? isConnected;
                } else if (source.key === 'zendesk') {
                  isEnabled = savedConfig.includeZendesk ?? isConnected;
                }
              }

              return {
                ...source,
                connected: isConnected,
                enabled: isEnabled,
              };
            })
          );
          // Build list of all connected sources, restoring enabled state from saved config
          const savedConnectorConfigs = savedConfig?.connectorConfigs;
          const allConnected = connectors
            .filter((c: { status: string }) => c.status === 'real')
            .map((c: { connectorKey: string }) => {
              const key = c.connectorKey as 'slack' | 'jira' | 'confluence' | 'gong' | 'zendesk' | 'google-calendar' | 'google-drive' | 'gmail' | 'figma';
              // Restore enabled state from saved config - if connector config was saved, it was enabled
              let enabled = false;
              if (savedConnectorConfigs) {
                if (key === 'gmail') {
                  enabled = savedConnectorConfigs.gmail !== undefined;
                } else if (key === 'google-drive') {
                  enabled = savedConnectorConfigs['google-drive'] !== undefined;
                } else if (key === 'google-calendar') {
                  enabled = savedConnectorConfigs['google-calendar'] !== undefined;
                }
              }
              return {
                key,
                connected: true,
                enabled,
              };
            });
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

  const jiraSource = suggestedSources.find((s) => s.key === 'jira');
  const jiraConnected = jiraSource?.connected ?? false;
  const jiraEnabled = jiraSource?.enabled ?? false;
  // canSave: can save settings when keywords exist (Jira is recommended but not strictly required for saving)
  const canSave = calendarKeywords.length > 0;
  // canRun: can run when Jira is connected and enabled (admin only)
  const canRun = jiraConnected && jiraEnabled;

  // Handle toggling a source on/off
  const handleSourceToggle = (key: string, enabled: boolean) => {
    // Update suggestedSources if the key exists there
    setSuggestedSources((prev) =>
      prev.map((source) =>
        source.key === key ? { ...source, enabled } : source
      )
    );
    // Also update allConnectedSources for additional sources (like Google connectors)
    setAllConnectedSources((prev) =>
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

  // Keyword management
  const addKeyword = () => {
    const keyword = newKeyword.trim();
    if (keyword && !calendarKeywords.includes(keyword)) {
      setCalendarKeywords([...calendarKeywords, keyword]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setCalendarKeywords(calendarKeywords.filter((k) => k !== keyword));
  };

  // Save configuration
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    // Get enabled states for connectors from both suggestedSources and allConnectedSources
    const slackEnabled = suggestedSources.find(s => s.key === 'slack')?.enabled ?? false;
    const confluenceEnabled = suggestedSources.find(s => s.key === 'confluence')?.enabled ?? false;
    const jiraEnabled = suggestedSources.find(s => s.key === 'jira')?.enabled ?? false;
    const zendeskEnabled = suggestedSources.find(s => s.key === 'zendesk')?.enabled ?? false;
    const gmailEnabled = allConnectedSources.find(s => s.key === 'gmail')?.enabled ?? false;
    const driveEnabled = allConnectedSources.find(s => s.key === 'google-drive')?.enabled ?? false;
    const calendarEnabled = allConnectedSources.find(s => s.key === 'google-calendar')?.enabled ?? false;

    try {
      const res = await fetch('/api/agents/sprint-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: isActive ? 'active' : 'paused',
          config: {
            calendarKeywords,
            leadTimeMinutes: parseInt(leadTimeMinutes),
            timezone,
            jiraProjectKeys: [], // Will be populated from connector config
            includeVelocity,
            includeCarryover,
            includeSlackHighlights: slackEnabled,
            includeConfluence: confluenceEnabled,
            includeZendesk: zendeskEnabled,
            // Save connector-specific configs (Slack channels, etc.)
            connectorConfigs: {
              slack: slackEnabled ? {
                includeMentions: connectorConfigs.slack?.includeMentions,
                selectedChannels: connectorConfigs.slack?.selectedChannels || [],
              } : undefined,
              jira: jiraEnabled ? connectorConfigs.jira : undefined,
              confluence: confluenceEnabled ? connectorConfigs.confluence : undefined,
              zendesk: zendeskEnabled ? connectorConfigs.zendesk : undefined,
              gmail: gmailEnabled ? connectorConfigs.gmail : undefined,
              'google-drive': driveEnabled ? connectorConfigs['google-drive'] : undefined,
              'google-calendar': calendarEnabled ? connectorConfigs['google-calendar'] : undefined,
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

  const handleRun = async () => {
    if (!canRun) return;

    setIsRunning(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/agents/sprint-review/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectorConfigs: {
            jira: jiraEnabled ? connectorConfigs.jira : undefined,
            confluence: suggestedSources.find(s => s.key === 'confluence')?.enabled ? connectorConfigs.confluence : undefined,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(`Sprint Review started! Job ID: ${data.jobId}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to trigger agent');
      }
    } catch {
      setError('Failed to trigger. Please try again.');
    } finally {
      setIsRunning(false);
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
            <h1 className="font-heading text-2xl font-bold">Sprint Review Agent</h1>
            <p className="text-muted-foreground">
              Automatically prepare sprint reviews when meetings are detected
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
        workflowName="Sprint Review"
        used={currentUsage?.used || 0}
        limit={currentUsage?.limit || 0}
      />

      {/* Calendar Trigger Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Calendar Trigger</CardTitle>
          </div>
          <CardDescription>
            The agent will automatically run when meetings matching these keywords are detected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Keywords */}
          <div className="space-y-3">
            <Label>Meeting Keywords</Label>
            <div className="flex flex-wrap gap-2">
              {calendarKeywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="gap-1 py-1">
                  {keyword}
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="ml-1 rounded-full hover:bg-muted-foreground/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a keyword..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
              />
              <Button variant="outline" onClick={addKeyword}>
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The agent will prepare a sprint review when a calendar event contains any of these keywords
            </p>
          </div>

          {/* Lead Time */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lead-time">Preparation Lead Time</Label>
              <Select value={leadTimeMinutes} onValueChange={setLeadTimeMinutes}>
                <SelectTrigger id="lead-time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_TIME_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {config?.nextRunAt && isActive && (
            <p className="text-sm text-muted-foreground">
              Next scheduled run:{' '}
              <span className="font-medium">
                {new Date(config.nextRunAt).toLocaleString()}
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Data Sources */}
      <DataSourcesCard
        suggestedSources={suggestedSources}
        allConnectedSources={allConnectedSources}
        requiredConnectors={['jira']}
        description="Connect Jira to analyze sprint data. Google Calendar is required for automatic triggers."
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
              <span>Sprint goal achievement summary</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Completed vs planned work breakdown</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Key accomplishments and highlights</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Carryover items and blockers</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Velocity metrics and trends</span>
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
              <Label htmlFor="agent-active">Enable Sprint Review Agent</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, the agent will automatically run before detected sprint review meetings
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
          onClick={handleSave}
          disabled={isSaving || !canSave}
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
        </p>
      )}
    </div>
  );
}
