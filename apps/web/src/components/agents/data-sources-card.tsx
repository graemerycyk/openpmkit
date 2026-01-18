'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  FileText,
  Headphones,
  MessageSquare,
  Palette,
  Plug,
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
    icon: MessageSquare,
  },
  figma: {
    name: 'Figma',
    description: 'Design files and components',
    icon: Palette,
  },
};

type ConnectorKey = keyof typeof CONNECTORS;

interface ConnectorStatus {
  key: ConnectorKey;
  connected: boolean;
  workspaceName?: string;
}

interface DataSourcesCardProps {
  connectedSources: ConnectorStatus[];
  requiredConnectors?: ConnectorKey[];
  description?: string;
}

export function DataSourcesCard({
  connectedSources,
  requiredConnectors = [],
  description = 'The agent will pull data from your connected sources',
}: DataSourcesCardProps) {
  // Always show all suggested integrations, regardless of connection status
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
        {connectedSources.map((source) => {
          const connector = CONNECTORS[source.key];
          if (!connector) return null;

          const Icon = connector.icon;
          const isRequired = requiredConnectors.includes(source.key);

          return (
            <div
              key={source.key}
              className="flex items-center justify-between rounded-lg border p-4"
            >
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
                    <Badge
                      variant={source.connected ? 'outline' : 'secondary'}
                      className={
                        source.connected
                          ? 'border-green-200 bg-green-50 text-green-700 text-xs'
                          : 'text-xs'
                      }
                    >
                      {source.connected ? 'Connected' : 'Not Connected'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {source.workspaceName || connector.description}
                  </p>
                </div>
              </div>
              {!source.connected && (
                <Button asChild size="sm" variant="outline">
                  <Link href="/settings/integrations">Connect</Link>
                </Button>
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
