'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Play, Save } from 'lucide-react';
import { ConnectorKey } from '@/hooks/use-agent-config';

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
  zoom: 'Zoom',
};

interface AgentActionsProps {
  /** Whether the "Run Now" button is loading */
  isTriggering: boolean;
  /** Whether the "Save" button is loading */
  isSaving: boolean;
  /** Whether the agent can be run (required connectors are connected and enabled) */
  canRun: boolean;
  /** Whether settings can be saved */
  canSave?: boolean;
  /** Whether the user is an admin (shows Run Now button) */
  isAdmin: boolean;
  /** Missing required connectors (for helper text) */
  missingRequiredConnectors?: ConnectorKey[];
  /** Callback when "Run Now" is clicked */
  onTrigger: () => void;
  /** Callback when "Save" is clicked */
  onSave: () => void;
  /** Whether this is a "coming soon" agent (save button disabled) */
  comingSoon?: boolean;
}

export function AgentActions({
  isTriggering,
  isSaving,
  canRun,
  canSave = true,
  isAdmin,
  missingRequiredConnectors = [],
  onTrigger,
  onSave,
  comingSoon = false,
}: AgentActionsProps) {
  // Build helper text for disabled Run Now button
  const runHelperText = missingRequiredConnectors.length > 0
    ? `Connect ${missingRequiredConnectors.map((k) => CONNECTOR_NAMES[k]).join(', ')} to run`
    : undefined;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isAdmin && (
          <Button
            variant="outline"
            onClick={onTrigger}
            disabled={isTriggering || !canRun || comingSoon}
          >
            {isTriggering ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Run Now
          </Button>
        )}
        {!canRun && runHelperText && (
          <span className="text-sm text-muted-foreground">
            {runHelperText}
          </span>
        )}
      </div>
      <Button
        onClick={onSave}
        disabled={isSaving || !canSave || comingSoon}
        title={comingSoon ? 'Agent settings coming soon' : undefined}
      >
        {isSaving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Save Agent Settings
      </Button>
    </div>
  );
}
