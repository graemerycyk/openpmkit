'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AtSign,
  Calendar,
  CheckCircle2,
  FileText,
  Hash,
  Headphones,
  Mail,
  MessageSquare,
  Palette,
  Plug,
  Star,
  Target,
  Ticket,
} from 'lucide-react';

// All available connectors with their metadata
const CONNECTORS = {
  slack: {
    name: 'Slack',
    description: 'Messages and discussions',
    icon: MessageSquare,
  },
  jira: {
    name: 'Jira',
    description: 'Issues and epics',
    icon: Target,
  },
  confluence: {
    name: 'Confluence',
    description: 'Documentation and pages',
    icon: FileText,
  },
  gong: {
    name: 'Gong',
    description: 'Call recordings and insights',
    icon: Headphones,
  },
  zendesk: {
    name: 'Zendesk',
    description: 'Support tickets and history',
    icon: Ticket,
  },
  'google-calendar': {
    name: 'Google Calendar',
    description: 'Meetings and events',
    icon: Calendar,
  },
  'google-drive': {
    name: 'Google Drive',
    description: 'Documents and files',
    icon: FileText,
  },
  gmail: {
    name: 'Gmail',
    description: 'Email threads',
    icon: Mail,
  },
  figma: {
    name: 'Figma',
    description: 'Design files and components',
    icon: Palette,
  },
};

type ConnectorKey = keyof typeof CONNECTORS;

// Map connector IDs to OAuth endpoints
const OAUTH_ENDPOINTS: Record<string, string> = {
  slack: '/api/connectors/slack/authorize',
  jira: '/api/connectors/atlassian/authorize',
  confluence: '/api/connectors/atlassian/authorize',
  gong: '/api/connectors/gong/authorize',
  zendesk: '/api/connectors/zendesk/authorize',
  gmail: '/api/connectors/google/authorize',
  'google-drive': '/api/connectors/google/authorize',
  'google-calendar': '/api/connectors/google/authorize',
  figma: '/api/connectors/figma/authorize',
};

function getOAuthEndpoint(connectorKey: string): string {
  return OAUTH_ENDPOINTS[connectorKey] || '/settings/integrations';
}

// Connector-specific configuration types
export interface GmailConfig {
  unreadOnly: boolean;
  includeStarred: boolean;
}

export interface GoogleDriveConfig {
  sharedWithMe: boolean;
  recentEdits: boolean;
  includeComments: boolean;
}

export interface GoogleCalendarConfig {
  todayOnly: boolean;
  includeDescriptions: boolean;
}

export interface GongConfig {
  recentCallsOnly: boolean;
  includeTranscripts: boolean;
}

export interface ZendeskConfig {
  openTicketsOnly: boolean;
  includeComments: boolean;
}

export interface JiraConfig {
  assignedToMe: boolean;
  recentlyUpdated: boolean;
}

export interface ConfluenceConfig {
  recentlyEdited: boolean;
  sharedWithMe: boolean;
}

export interface SlackChannel {
  id: string;
  name: string;
  isPrivate: boolean;
  memberCount?: number;
}

export interface SlackConfig {
  includeMentions: boolean;
  selectedChannels: string[];
  channels?: SlackChannel[]; // Available channels (populated from API)
}

export interface ConnectorConfigs {
  gmail?: GmailConfig;
  'google-drive'?: GoogleDriveConfig;
  'google-calendar'?: GoogleCalendarConfig;
  gong?: GongConfig;
  zendesk?: ZendeskConfig;
  jira?: JiraConfig;
  confluence?: ConfluenceConfig;
  slack?: SlackConfig;
}

// Union type for all connector config types
export type AnyConnectorConfig = GmailConfig | GoogleDriveConfig | GoogleCalendarConfig | GongConfig | ZendeskConfig | JiraConfig | ConfluenceConfig | SlackConfig;

// Default configurations for each connector
export const DEFAULT_CONNECTOR_CONFIGS: ConnectorConfigs = {
  gmail: {
    unreadOnly: false,
    includeStarred: true,
  },
  'google-drive': {
    sharedWithMe: true,
    recentEdits: true,
    includeComments: true,
  },
  'google-calendar': {
    todayOnly: false,
    includeDescriptions: true,
  },
  gong: {
    recentCallsOnly: true,
    includeTranscripts: false,
  },
  zendesk: {
    openTicketsOnly: true,
    includeComments: true,
  },
  jira: {
    assignedToMe: false,
    recentlyUpdated: true,
  },
  confluence: {
    recentlyEdited: true,
    sharedWithMe: true,
  },
  slack: {
    includeMentions: true,
    selectedChannels: [],
    channels: [],
  },
};

interface ConnectorStatus {
  key: ConnectorKey;
  connected: boolean;
  enabled?: boolean;
  workspaceName?: string;
}

interface DataSourcesCardProps {
  /** Recommended integrations for this agent (shown regardless of connection status) */
  suggestedSources: ConnectorStatus[];
  /** All connected integrations from the API (used to show additional connected sources) */
  allConnectedSources?: ConnectorStatus[];
  /** Connectors that are required for the agent to run */
  requiredConnectors?: ConnectorKey[];
  /** Description shown below the card title */
  description?: string;
  /** Callback when a source is toggled on/off */
  onToggle?: (key: ConnectorKey, enabled: boolean) => void;
  /** Render configuration UI for a specific connector when it's enabled (overrides default config UI) */
  renderConfig?: (key: ConnectorKey) => ReactNode;
  /** Current connector configurations */
  connectorConfigs?: ConnectorConfigs;
  /** Callback when connector configuration changes */
  onConfigChange?: (key: ConnectorKey, config: AnyConnectorConfig) => void;
}

// Default configuration UI components for each connector
function GmailConfigUI({
  config,
  onChange,
}: {
  config: GmailConfig;
  onChange: (config: GmailConfig) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-normal">Unread emails only</Label>
        </div>
        <Switch
          checked={config.unreadOnly}
          onCheckedChange={(checked) => onChange({ ...config, unreadOnly: checked })}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-normal">Include starred emails</Label>
        </div>
        <Switch
          checked={config.includeStarred}
          onCheckedChange={(checked) => onChange({ ...config, includeStarred: checked })}
        />
      </div>
    </div>
  );
}

function GoogleDriveConfigUI({
  config,
  onChange,
}: {
  config: GoogleDriveConfig;
  onChange: (config: GoogleDriveConfig) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-normal">Include shared files</Label>
        <Switch
          checked={config.sharedWithMe}
          onCheckedChange={(checked) => onChange({ ...config, sharedWithMe: checked })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-normal">Recent edits only</Label>
        <Switch
          checked={config.recentEdits}
          onCheckedChange={(checked) => onChange({ ...config, recentEdits: checked })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-normal">Include comments & suggestions</Label>
        <Switch
          checked={config.includeComments}
          onCheckedChange={(checked) => onChange({ ...config, includeComments: checked })}
        />
      </div>
    </div>
  );
}

function GoogleCalendarConfigUI({
  config,
  onChange,
}: {
  config: GoogleCalendarConfig;
  onChange: (config: GoogleCalendarConfig) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-normal">Today&apos;s events only</Label>
        <Switch
          checked={config.todayOnly}
          onCheckedChange={(checked) => onChange({ ...config, todayOnly: checked })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-normal">Include meeting descriptions</Label>
        <Switch
          checked={config.includeDescriptions}
          onCheckedChange={(checked) => onChange({ ...config, includeDescriptions: checked })}
        />
      </div>
    </div>
  );
}

function GongConfigUI({
  config,
  onChange,
}: {
  config: GongConfig;
  onChange: (config: GongConfig) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-normal">Recent calls only (last 7 days)</Label>
        <Switch
          checked={config.recentCallsOnly}
          onCheckedChange={(checked) => onChange({ ...config, recentCallsOnly: checked })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-normal">Include transcripts</Label>
        <Switch
          checked={config.includeTranscripts}
          onCheckedChange={(checked) => onChange({ ...config, includeTranscripts: checked })}
        />
      </div>
    </div>
  );
}

function ZendeskConfigUI({
  config,
  onChange,
}: {
  config: ZendeskConfig;
  onChange: (config: ZendeskConfig) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-normal">Open tickets only</Label>
        <Switch
          checked={config.openTicketsOnly}
          onCheckedChange={(checked) => onChange({ ...config, openTicketsOnly: checked })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-normal">Include ticket comments</Label>
        <Switch
          checked={config.includeComments}
          onCheckedChange={(checked) => onChange({ ...config, includeComments: checked })}
        />
      </div>
    </div>
  );
}

function JiraConfigUI({
  config,
  onChange,
}: {
  config: JiraConfig;
  onChange: (config: JiraConfig) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-normal">Assigned to me only</Label>
        <Switch
          checked={config.assignedToMe}
          onCheckedChange={(checked) => onChange({ ...config, assignedToMe: checked })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-normal">Recently updated (last 7 days)</Label>
        <Switch
          checked={config.recentlyUpdated}
          onCheckedChange={(checked) => onChange({ ...config, recentlyUpdated: checked })}
        />
      </div>
    </div>
  );
}

function ConfluenceConfigUI({
  config,
  onChange,
}: {
  config: ConfluenceConfig;
  onChange: (config: ConfluenceConfig) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-normal">Recently edited pages</Label>
        <Switch
          checked={config.recentlyEdited}
          onCheckedChange={(checked) => onChange({ ...config, recentlyEdited: checked })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-normal">Shared with me</Label>
        <Switch
          checked={config.sharedWithMe}
          onCheckedChange={(checked) => onChange({ ...config, sharedWithMe: checked })}
        />
      </div>
    </div>
  );
}

function SlackConfigUI({
  config,
  onChange,
}: {
  config: SlackConfig;
  onChange: (config: SlackConfig) => void;
}) {
  const channels = config.channels || [];
  const selectedChannels = config.selectedChannels || [];

  const toggleChannel = (channelId: string) => {
    const newSelected = selectedChannels.includes(channelId)
      ? selectedChannels.filter((id) => id !== channelId)
      : [...selectedChannels, channelId];
    onChange({ ...config, selectedChannels: newSelected });
  };

  const selectAllChannels = () => {
    onChange({ ...config, selectedChannels: channels.map((c) => c.id) });
  };

  const deselectAllChannels = () => {
    onChange({ ...config, selectedChannels: [] });
  };

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
          checked={config.includeMentions}
          onCheckedChange={(checked) => onChange({ ...config, includeMentions: checked })}
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

export function DataSourcesCard({
  suggestedSources,
  allConnectedSources = [],
  requiredConnectors = [],
  description = 'The agent will pull data from your connected sources',
  onToggle,
  renderConfig,
  connectorConfigs,
  onConfigChange,
}: DataSourcesCardProps) {
  // Merge suggested sources with any additional connected sources not in suggested list
  const suggestedKeys = new Set(suggestedSources.map((s) => s.key));
  const additionalConnectedSources = allConnectedSources.filter(
    (s) => s.connected && !suggestedKeys.has(s.key)
  );
  const allSources = [...suggestedSources, ...additionalConnectedSources];

  // Render default configuration UI for a connector
  const renderDefaultConfig = (key: ConnectorKey): ReactNode => {
    if (!onConfigChange) return null;

    const configs = connectorConfigs || DEFAULT_CONNECTOR_CONFIGS;

    switch (key) {
      case 'gmail': {
        const config = configs.gmail || DEFAULT_CONNECTOR_CONFIGS.gmail!;
        return (
          <GmailConfigUI
            config={config}
            onChange={(newConfig) => onConfigChange(key, newConfig)}
          />
        );
      }
      case 'google-drive': {
        const config = configs['google-drive'] || DEFAULT_CONNECTOR_CONFIGS['google-drive']!;
        return (
          <GoogleDriveConfigUI
            config={config}
            onChange={(newConfig) => onConfigChange(key, newConfig)}
          />
        );
      }
      case 'google-calendar': {
        const config = configs['google-calendar'] || DEFAULT_CONNECTOR_CONFIGS['google-calendar']!;
        return (
          <GoogleCalendarConfigUI
            config={config}
            onChange={(newConfig) => onConfigChange(key, newConfig)}
          />
        );
      }
      case 'gong': {
        const config = configs.gong || DEFAULT_CONNECTOR_CONFIGS.gong!;
        return (
          <GongConfigUI
            config={config}
            onChange={(newConfig) => onConfigChange(key, newConfig)}
          />
        );
      }
      case 'zendesk': {
        const config = configs.zendesk || DEFAULT_CONNECTOR_CONFIGS.zendesk!;
        return (
          <ZendeskConfigUI
            config={config}
            onChange={(newConfig) => onConfigChange(key, newConfig)}
          />
        );
      }
      case 'jira': {
        const config = configs.jira || DEFAULT_CONNECTOR_CONFIGS.jira!;
        return (
          <JiraConfigUI
            config={config}
            onChange={(newConfig) => onConfigChange(key, newConfig)}
          />
        );
      }
      case 'confluence': {
        const config = configs.confluence || DEFAULT_CONNECTOR_CONFIGS.confluence!;
        return (
          <ConfluenceConfigUI
            config={config}
            onChange={(newConfig) => onConfigChange(key, newConfig)}
          />
        );
      }
      case 'slack': {
        const config = configs.slack || DEFAULT_CONNECTOR_CONFIGS.slack!;
        return (
          <SlackConfigUI
            config={config}
            onChange={(newConfig) => onConfigChange(key, newConfig)}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Plug className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Data Sources</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {allSources.map((source) => {
          const connector = CONNECTORS[source.key];
          if (!connector) return null;

          const Icon = connector.icon;
          const isRequired = requiredConnectors.includes(source.key);

          // Use custom renderConfig if provided, otherwise use default config UI
          const customConfig = source.enabled && renderConfig ? renderConfig(source.key) : null;
          const defaultConfig = source.enabled && !customConfig ? renderDefaultConfig(source.key) : null;
          const configContent = customConfig || defaultConfig;

          return (
            <div key={source.key} className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg p-2 ${
                      source.connected ? 'bg-green-100' : 'bg-muted'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        source.connected ? 'text-green-600' : 'text-muted-foreground'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{connector.name}</span>
                      {isRequired && (
                        <Badge variant="secondary" className="text-xs">
                          Required
                        </Badge>
                      )}
                      {source.connected ? (
                        <Badge
                          variant="outline"
                          className="border-green-200 bg-green-50 text-green-700 text-xs"
                        >
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
                      {source.workspaceName || connector.description}
                    </p>
                  </div>
                </div>
                {source.connected ? (
                  <Switch
                    checked={source.enabled ?? false}
                    onCheckedChange={(checked) => onToggle?.(source.key, checked)}
                  />
                ) : source.key === 'slack' ? (
                  <a href="/api/connectors/slack/authorize">
                    <img
                      alt="Add to Slack"
                      height="40"
                      width="139"
                      src="https://platform.slack-edge.com/img/add_to_slack.png"
                      srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
                    />
                  </a>
                ) : (
                  <Button asChild size="sm">
                    <Link href={getOAuthEndpoint(source.key)}>Connect</Link>
                  </Button>
                )}
              </div>
              {/* Configuration UI shown when source is enabled */}
              {configContent && (
                <div className="ml-4 rounded-lg border border-dashed p-4">
                  {configContent}
                </div>
              )}
            </div>
          );
        })}

        {/* Link to add more integrations */}
        <div className="pt-2 text-center">
          <Button asChild variant="ghost" size="sm">
            <Link href="/settings/integrations" className="text-muted-foreground">
              <Plug className="mr-2 h-4 w-4" />
              Manage Integrations
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
