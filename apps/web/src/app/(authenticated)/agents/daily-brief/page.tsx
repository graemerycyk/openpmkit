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
  CheckCircle2,
  Clock,
  Hash,
  Loader2,
  MessageSquare,
  Play,
  Plug,
  Settings2,
  Zap,
} from 'lucide-react';

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
  const [isActive, setIsActive] = useState(true);

  // Check if agent can run (has data source connected and channels selected)
  const canRun = slackConnected && selectedChannels.length > 0;

  // Detect user's timezone
  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const matchingTz = TIMEZONES.find((tz) => tz.value === detected);
    if (matchingTz) {
      setTimezone(detected);
    }
  }, []);

  // Fetch existing config and Slack status
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
            setIsActive(data.config.status === 'active');
          }
        }

        // Check Slack connection and fetch channels
        const channelsRes = await fetch('/api/agents/daily-brief/channels');
        if (channelsRes.ok) {
          const data = await channelsRes.json();
          setChannels(data.channels || []);
          setSlackConnected(true);
        } else {
          setSlackConnected(false);
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
              <Label htmlFor="tf-36">Last 36 hours (weekend coverage)</Label>
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
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Plug className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Data Sources</CardTitle>
          </div>
          <CardDescription>
            Connect data sources to pull messages for your Daily Brief
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${slackConnected ? 'bg-green-100' : 'bg-muted'}`}>
                <MessageSquare className={`h-5 w-5 ${slackConnected ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Slack</span>
                  {slackConnected ? (
                    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 text-xs">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Not Connected
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {slackConnected
                    ? 'Select channels below to include in your brief'
                    : 'Connect Slack to pull channel messages'}
                </p>
              </div>
            </div>
            {!slackConnected && (
              <Button asChild size="sm">
                <Link href="/settings/integrations">Connect</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Channel Selection - Only show if Slack is connected */}
      {slackConnected && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Slack Channels</CardTitle>
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
            <CardDescription>
              Select which channels to include in your Daily Brief
            </CardDescription>
          </CardHeader>
          <CardContent>
            {channels.length === 0 ? (
              <p className="text-sm text-muted-foreground">
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
            <p className="mt-3 text-sm text-muted-foreground">
              {selectedChannels.length} of {channels.length} channels selected
            </p>
          </CardContent>
        </Card>
      )}

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
              {!slackConnected
                ? 'Connect Slack to run'
                : 'Select channels to run'}
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
