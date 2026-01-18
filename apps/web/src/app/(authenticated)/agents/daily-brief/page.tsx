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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  AtSign,
  CheckCircle2,
  Clock,
  Hash,
  Loader2,
  Play,
  Settings2,
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

interface SlackChannel {
  id: string;
  name: string;
  isPrivate: boolean;
  memberCount?: number;
}

interface AgentConfig {
  id: string;
  status: string;
  config: {
    dataTimeframeHours: number;
    deliveryTimeLocal: string;
    timezone: string;
    slackChannels: string[];
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
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [slackConnected, setSlackConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [dataTimeframe, setDataTimeframe] = useState<'24' | '36'>('24');
  const [deliveryTime, setDeliveryTime] = useState('08:00');
  const [timezone, setTimezone] = useState('America/New_York');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [includeSlackMentions, setIncludeSlackMentions] = useState(true);
  const [isActive, setIsActive] = useState(true);

  // Google connector states
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gdriveConnected, setGdriveConnected] = useState(false);
  const [gcalConnected, setGcalConnected] = useState(false);
  const [includeGmail, setIncludeGmail] = useState(false);
  const [includeGoogleDrive, setIncludeGoogleDrive] = useState(false);
  const [includeGoogleCalendar, setIncludeGoogleCalendar] = useState(false);

  // Connector-specific configurations
  const [connectorConfigs, setConnectorConfigs] = useState<ConnectorConfigs>({
    gmail: { ...DEFAULT_CONNECTOR_CONFIGS.gmail! },
    'google-drive': { ...DEFAULT_CONNECTOR_CONFIGS['google-drive']! },
    'google-calendar': { ...DEFAULT_CONNECTOR_CONFIGS['google-calendar']! },
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
  const hasSlackData = slackConnected && isSlackEnabled && (includeSlackMentions || selectedChannels.length > 0);
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
      try {
        // Fetch config
        const configRes = await fetch('/api/agents/daily-brief');
        if (configRes.ok) {
          const data = await configRes.json();
          if (data.config) {
            setConfig(data.config);
            setDataTimeframe(data.config.config.dataTimeframeHours === 36 ? '36' : '24');
            setDeliveryTime(data.config.config.deliveryTimeLocal);
            setTimezone(data.config.config.timezone);
            setSelectedChannels(data.config.config.slackChannels || []);
            setIncludeSlackMentions(data.config.config.includeSlackMentions ?? true);
            setIncludeGmail(data.config.config.includeGmail ?? false);
            setIncludeGoogleDrive(data.config.config.includeGoogleDrive ?? false);
            setIncludeGoogleCalendar(data.config.config.includeGoogleCalendar ?? false);
            setIsActive(data.config.status === 'active');
          }
        }

        // Check Slack connection and fetch channels
        let isSlackConnected = false;
        const channelsRes = await fetch('/api/agents/daily-brief/channels');
        if (channelsRes.ok) {
          const data = await channelsRes.json();
          setChannels(data.channels || []);
          setSlackConnected(true);
          isSlackConnected = true;
        } else {
          setSlackConnected(false);
        }

        // Check connector statuses
        const connectorsRes = await fetch('/api/connectors');
        if (connectorsRes.ok) {
          const data = await connectorsRes.json();
          const connectors = data.connectors || [];

          // Update Google connector states
          setGmailConnected(connectors.some((c: { connectorKey: string; status: string }) => c.connectorKey === 'gmail' && c.status === 'real'));
          setGdriveConnected(connectors.some((c: { connectorKey: string; status: string }) => c.connectorKey === 'google-drive' && c.status === 'real'));
          setGcalConnected(connectors.some((c: { connectorKey: string; status: string }) => c.connectorKey === 'google-calendar' && c.status === 'real'));

          // Update suggested sources for DataSourcesCard display
          setSuggestedSources((prev) =>
            prev.map((source) => {
              if (source.key === 'slack') {
                return { ...source, connected: isSlackConnected };
              }
              const isConnected = connectors.some(
                (c: { connectorKey: string; status: string }) =>
                  c.connectorKey === source.key && c.status === 'real'
              );
              return { ...source, connected: isConnected };
            })
          );

          // Update enabled states based on loaded config
          setSuggestedSources((prev) =>
            prev.map((source) => {
              let isEnabled = false;
              if (source.key === 'slack') {
                isEnabled = isSlackConnected;  // Auto-enable if connected for backward compat
              } else if (source.key === 'gmail') {
                isEnabled = connectors.some((c: { connectorKey: string; status: string }) => c.connectorKey === 'gmail' && c.status === 'real');
              } else if (source.key === 'google-drive') {
                isEnabled = connectors.some((c: { connectorKey: string; status: string }) => c.connectorKey === 'google-drive' && c.status === 'real');
              } else if (source.key === 'google-calendar') {
                isEnabled = connectors.some((c: { connectorKey: string; status: string }) => c.connectorKey === 'google-calendar' && c.status === 'real');
              }
              return { ...source, enabled: isEnabled };
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
            slackChannels: selectedChannels,
            includeSlackMentions,
            includeGmail,
            includeGoogleDrive,
            includeGoogleCalendar,
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
        setSuccess('Configuration saved successfully!');
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

  const toggleChannel = (channelId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };

  const selectAllChannels = () => {
    setSelectedChannels(channels.map((c) => c.id));
  };

  const deselectAllChannels = () => {
    setSelectedChannels([]);
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
        <div>
          <h1 className="font-heading text-2xl font-bold">Daily Brief Agent</h1>
          <p className="text-muted-foreground">
            Get a synthesized morning brief of overnight activity from Slack
          </p>
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
        renderConfig={(key) => {
          // Only Slack has custom configuration UI - others use the default config UI
          if (key === 'slack' && slackConnected) {
            return (
              <div className="space-y-6">
                {/* @mentions toggle */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <AtSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-medium">Include @mentions</span>
                      <p className="text-sm text-muted-foreground">
                        Messages where you are directly mentioned across all channels
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={includeSlackMentions}
                    onCheckedChange={setIncludeSlackMentions}
                  />
                </div>

                {/* Channel Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Additional Channels</span>
                    </div>
                    {channels.length > 0 && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={selectAllChannels}>
                          Select All
                        </Button>
                        <Button variant="outline" size="sm" onClick={deselectAllChannels}>
                          Deselect All
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Select channels to include all messages from, regardless of @mentions
                  </p>

                  {channels.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                      No channels found. Make sure the pmkit Slack app is added to the channels you
                      want to monitor.
                    </p>
                  ) : (
                    <div className="max-h-64 space-y-2 overflow-y-auto">
                      {channels.map((channel) => (
                        <div
                          key={channel.id}
                          className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50"
                        >
                          <Checkbox
                            id={channel.id}
                            checked={selectedChannels.includes(channel.id)}
                            onCheckedChange={() => toggleChannel(channel.id)}
                          />
                          <Label
                            htmlFor={channel.id}
                            className="flex flex-1 cursor-pointer items-center gap-2"
                          >
                            <span className="text-muted-foreground">#</span>
                            <span>{channel.name}</span>
                            {channel.isPrivate && (
                              <Badge variant="outline" className="text-xs">
                                Private
                              </Badge>
                            )}
                          </Label>
                          {channel.memberCount && (
                            <span className="text-xs text-muted-foreground">
                              {channel.memberCount} members
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {selectedChannels.length} of {channels.length} channels selected
                  </p>
                </div>
              </div>
            );
          }

          // Return null for other connectors - they will use the default config UI
          // provided by DataSourcesCard
          return null;
        }}
      />

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
          {!canRun && (
            <span className="text-sm text-muted-foreground">
              Configure at least one data source to run
            </span>
          )}
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-2 h-4 w-4" />
          )}
          Save Configuration
        </Button>
      </div>

      {/* Last Run Info */}
      {config?.lastRunAt && (
        <p className="text-center text-sm text-muted-foreground">
          Last run: {new Date(config.lastRunAt).toLocaleString()}
          {' · '}
          <Link
            href="/agents/daily-brief/history"
            className="text-cobalt-600 hover:underline"
          >
            View History
          </Link>
        </p>
      )}
    </div>
  );
}
