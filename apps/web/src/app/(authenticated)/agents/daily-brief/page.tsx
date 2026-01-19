'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
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
  Clock,
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

interface AgentConfig {
  id: string;
  status: string;
  config: {
    dataTimeframeHours: number;
    deliveryTimeLocal: string;
    timezone: string;
    slackChannels: string[];
    includeSlack: boolean;
    includeSlackMentions: boolean;
    includeGmail: boolean;
    includeGoogleDrive: boolean;
    includeGoogleCalendar: boolean;
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

// Delivery time options
const DELIVERY_TIMES = [
  { value: '06:00', label: '6:00 AM' },
  { value: '07:00', label: '7:00 AM' },
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
];

export default function DailyBriefSetupPage() {
  const { currentUsage } = useUsage('daily_brief');
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [slackConnected, setSlackConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form state
  const [dataTimeframe, setDataTimeframe] = useState<'24' | '36'>('24');
  const [deliveryTime, setDeliveryTime] = useState('08:00');
  const [timezone, setTimezone] = useState('America/New_York');
  const [isActive, setIsActive] = useState(true);

  // Google connector states
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gdriveConnected, setGdriveConnected] = useState(false);
  const [gcalConnected, setGcalConnected] = useState(false);

  // Connector-specific configurations
  const [connectorConfigs, setConnectorConfigs] = useState<ConnectorConfigs>({
    gmail: { ...DEFAULT_CONNECTOR_CONFIGS.gmail! },
    'google-drive': { ...DEFAULT_CONNECTOR_CONFIGS['google-drive']! },
    'google-calendar': { ...DEFAULT_CONNECTOR_CONFIGS['google-calendar']! },
    slack: { ...DEFAULT_CONNECTOR_CONFIGS.slack! },
  });

  // Recommended sources for this agent (for DataSourcesCard display)
  const [suggestedSources, setSuggestedSources] = useState([
    { key: 'slack' as const, connected: false, enabled: false },
    { key: 'gmail' as const, connected: false, enabled: false },
    { key: 'google-drive' as const, connected: false, enabled: false },
    { key: 'google-calendar' as const, connected: false, enabled: false },
  ]);

  // All connected sources from API (for showing additional connected integrations)
  const [allConnectedSources, setAllConnectedSources] = useState<
    { key: 'slack' | 'jira' | 'confluence' | 'gong' | 'zendesk' | 'google-calendar' | 'google-drive' | 'gmail' | 'figma'; connected: boolean }[]
  >([]);

  // Check if source is enabled in DataSourcesCard
  const isSlackEnabled = suggestedSources.find((s) => s.key === 'slack')?.enabled ?? false;
  const isGmailEnabled = suggestedSources.find((s) => s.key === 'gmail')?.enabled ?? false;
  const isGdriveEnabled = suggestedSources.find((s) => s.key === 'google-drive')?.enabled ?? false;
  const isGcalEnabled = suggestedSources.find((s) => s.key === 'google-calendar')?.enabled ?? false;

  // Check if agent can run (has at least one data source enabled and configured)
  const slackConfig = connectorConfigs.slack;
  const hasSlackData = slackConnected && isSlackEnabled && (slackConfig?.includeMentions || (slackConfig?.selectedChannels?.length ?? 0) > 0);
  const hasGoogleData = (gmailConnected && isGmailEnabled) ||
                        (gdriveConnected && isGdriveEnabled) ||
                        (gcalConnected && isGcalEnabled);
  const canRun = hasSlackData || hasGoogleData;

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

  // Fetch existing config, Slack status, and Google connector status
  useEffect(() => {
    async function fetchData() {
      // Track saved config to restore enabled states
      let savedConfig: {
        includeSlack?: boolean;
        includeSlackMentions?: boolean;
        slackChannels?: string[];
        includeGmail?: boolean;
        includeGoogleDrive?: boolean;
        includeGoogleCalendar?: boolean;
      } | null = null;

      try {
        // Fetch config
        const configRes = await fetch('/api/agents/daily-brief');
        if (configRes.ok) {
          const data = await configRes.json();
          if (data.config) {
            setConfig(data.config);
            savedConfig = data.config.config; // Store for use when setting enabled states
            setDataTimeframe(data.config.config.dataTimeframeHours === 36 ? '36' : '24');
            setDeliveryTime(data.config.config.deliveryTimeLocal);
            setTimezone(data.config.config.timezone);
            setIsActive(data.config.status === 'active');
            // Restore Slack config from saved data
            setConnectorConfigs((prev) => ({
              ...prev,
              slack: {
                ...prev.slack!,
                selectedChannels: data.config.config.slackChannels || [],
                includeMentions: data.config.config.includeSlackMentions ?? true,
              },
            }));
          }
        }

        // Check Slack connection and fetch channels
        let isSlackConnected = false;
        const channelsRes = await fetch('/api/connectors/slack/channels');
        if (channelsRes.ok) {
          const data = await channelsRes.json();
          const fetchedChannels = data.channels || [];
          setSlackConnected(true);
          isSlackConnected = true;
          // Update connector configs with fetched channels
          setConnectorConfigs((prev) => ({
            ...prev,
            slack: {
              ...prev.slack!,
              channels: fetchedChannels,
            },
          }));
        } else {
          setSlackConnected(false);
        }

        // Check connector statuses
        const connectorsRes = await fetch('/api/connectors');
        if (connectorsRes.ok) {
          const data = await connectorsRes.json();
          const connectors = data.connectors || [];

          // Update Google connector states
          const isGmailConnected = connectors.some((c: { connectorKey: string; status: string }) => c.connectorKey === 'gmail' && c.status === 'real');
          const isGdriveConnected = connectors.some((c: { connectorKey: string; status: string }) => c.connectorKey === 'google-drive' && c.status === 'real');
          const isGcalConnected = connectors.some((c: { connectorKey: string; status: string }) => c.connectorKey === 'google-calendar' && c.status === 'real');
          setGmailConnected(isGmailConnected);
          setGdriveConnected(isGdriveConnected);
          setGcalConnected(isGcalConnected);

          // Update suggested sources - restore enabled state from saved config if available
          setSuggestedSources((prev) =>
            prev.map((source) => {
              const isConnected = source.key === 'slack'
                ? isSlackConnected
                : connectors.some(
                    (c: { connectorKey: string; status: string }) =>
                      c.connectorKey === source.key && c.status === 'real'
                  );

              // Determine enabled state: use saved config if available, otherwise default to false (not enabled)
              let isEnabled = false; // Default for new users - data sources are off until explicitly enabled
              if (savedConfig) {
                // Restore enabled state from saved config
                if (source.key === 'slack') {
                  isEnabled = savedConfig.includeSlack ?? false;
                } else if (source.key === 'gmail') {
                  isEnabled = savedConfig.includeGmail ?? false;
                } else if (source.key === 'google-drive') {
                  isEnabled = savedConfig.includeGoogleDrive ?? false;
                } else if (source.key === 'google-calendar') {
                  isEnabled = savedConfig.includeGoogleCalendar ?? false;
                }
              }

              return { ...source, connected: isConnected, enabled: isEnabled };
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
        console.error('Failed to fetch data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/agents/daily-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: isActive ? 'active' : 'paused',
          config: {
            dataTimeframeHours: parseInt(dataTimeframe),
            deliveryTimeLocal: deliveryTime,
            timezone,
            slackChannels: connectorConfigs.slack?.selectedChannels || [],
            includeSlack: isSlackEnabled,
            includeSlackMentions: connectorConfigs.slack?.includeMentions ?? true,
            // Save enabled state from DataSourcesCard toggles
            includeGmail: isGmailEnabled,
            includeGoogleDrive: isGdriveEnabled,
            includeGoogleCalendar: isGcalEnabled,
            // Connector-specific configs
            connectorConfigs: {
              gmail: isGmailEnabled ? connectorConfigs.gmail : undefined,
              'google-drive': isGdriveEnabled ? connectorConfigs['google-drive'] : undefined,
              'google-calendar': isGcalEnabled ? connectorConfigs['google-calendar'] : undefined,
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
      const res = await fetch('/api/agents/daily-brief/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectorConfigs: {
            gmail: isGmailEnabled ? connectorConfigs.gmail : undefined,
            'google-drive': isGdriveEnabled ? connectorConfigs['google-drive'] : undefined,
            'google-calendar': isGcalEnabled ? connectorConfigs['google-calendar'] : undefined,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(`Daily Brief started! Job ID: ${data.jobId}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to trigger agent');
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
          <Button variant="ghost" size="icon" asChild>
            <Link href="/agents">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold">Daily Brief Agent</h1>
            <p className="text-muted-foreground">
              Get a synthesized morning brief of overnight activity from Slack, Gmail and other sources
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
        workflowName="Daily Brief"
        used={currentUsage?.used || 0}
        limit={currentUsage?.limit || 0}
      />

      {/* Data Timeframe */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Data Timeframe</CardTitle>
          </div>
          <CardDescription>
            How far back should the agent look for messages?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={dataTimeframe}
            onValueChange={(v) => setDataTimeframe(v as '24' | '36')}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="24" id="tf-24" />
              <Label htmlFor="tf-24">Last 24 hours</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="36" id="tf-36" />
              <Label htmlFor="tf-36">Last 36 hours (1.5 day overlap)</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Delivery Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Delivery Schedule</CardTitle>
          </div>
          <CardDescription>
            When should your Daily Brief be generated each day?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="delivery-time">Delivery Time</Label>
              <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                <SelectTrigger id="delivery-time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERY_TIMES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
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
          {config?.nextRunAt && canRun && (
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
        description="Connect and configure data sources for your Daily Brief"
        onToggle={handleSourceToggle}
        connectorConfigs={connectorConfigs}
        onConfigChange={handleConfigChange}
        /* All connectors use the built-in config UI from DataSourcesCard */
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
              <span>Executive summary of overnight activity</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Key discussions and decisions from selected channels</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Direct mentions and items requiring your attention</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Action items and follow-ups identified</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Links to original messages for context</span>
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
              <Label htmlFor="agent-active">Enable Daily Brief</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, the agent will run automatically at your scheduled time
              </p>
            </div>
            <Switch
              id="agent-active"
              checked={isActive}
              onCheckedChange={setIsActive}
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
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving || !canRun}
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
