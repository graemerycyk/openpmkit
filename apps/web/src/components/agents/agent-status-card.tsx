'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings2 } from 'lucide-react';
import { ConnectorKey } from '@/hooks/use-agent-config';

interface AgentStatusCardProps {
  /** Display name of the agent */
  agentName: string;
  /** Whether the agent is currently enabled */
  isActive: boolean;
  /** Callback when the toggle changes */
  onActiveChange: (active: boolean) => void;
  /** Whether the toggle should be disabled */
  disabled?: boolean;
  /** List of missing required connectors (shown as helper text) */
  missingRequiredConnectors?: ConnectorKey[];
  /** Whether this is a "coming soon" agent (always disabled) */
  comingSoon?: boolean;
}

// Human-readable connector names
const CONNECTOR_NAMES: Record<ConnectorKey, string> = {
  slack: 'Slack',
  jira: 'Jira',
  confluence: 'Confluence',
  gong: 'Gong',
  zendesk: 'Zendesk',
  'google-calendar': 'Google Calendar',
  'google-drive': 'Google Drive',
  gmail: 'Gmail',
  figma: 'Figma',
};

export function AgentStatusCard({
  agentName,
  isActive,
  onActiveChange,
  disabled = false,
  missingRequiredConnectors = [],
  comingSoon = false,
}: AgentStatusCardProps) {
  const isDisabled = comingSoon || disabled || missingRequiredConnectors.length > 0;

  // Build helper text explaining why the toggle is disabled
  let helperText = 'When enabled, the agent will run automatically at your scheduled time';
  if (comingSoon) {
    helperText = 'This agent is coming soon and cannot be enabled yet';
  } else if (missingRequiredConnectors.length > 0) {
    const connectorNames = missingRequiredConnectors.map((key) => CONNECTOR_NAMES[key]).join(', ');
    helperText = `Connect and enable ${connectorNames} to enable this agent`;
  }

  return (
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
            <Label htmlFor="agent-active">Enable {agentName}</Label>
            <p className="text-sm text-muted-foreground">
              {helperText}
            </p>
          </div>
          <Switch
            id="agent-active"
            checked={isActive}
            onCheckedChange={onActiveChange}
            disabled={isDisabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}
