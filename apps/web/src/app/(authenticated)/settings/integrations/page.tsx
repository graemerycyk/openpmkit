'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  MessageSquare,
  Phone,
  HelpCircle,
  BarChart3,
  Users,
  Database,
  Globe,
  Newspaper,
  Hash,
  ExternalLink,
  CheckCircle2,
  Circle,
  Sparkles,
  AlertCircle,
  Loader2,
  Mail,
  FolderOpen,
  Calendar,
  Palette,
  Play,
} from 'lucide-react';

type ConnectionStatus = 'connected' | 'not_connected' | 'coming_soon';

interface ConnectorData {
  connectorKey: string;
  status: 'mock' | 'real' | 'disabled';
  workspaceName?: string;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: typeof FileText;
  iconBg: string;
  status: ConnectionStatus;
  category: 'tools' | 'crawlers';
  docsUrl?: string;
  workspaceName?: string;
  supportsOAuth?: boolean;
}

const integrationDefinitions: Omit<Integration, 'status' | 'workspaceName'>[] = [
  // Tool Integrations
  {
    id: 'jira',
    name: 'Jira',
    description: 'Sync issues, epics, and sprint data for PRDs and daily briefs',
    icon: FileText,
    iconBg: 'bg-blue-100 text-blue-600',
    category: 'tools',
    docsUrl: '/resources/jira-integration',
    supportsOAuth: true,
  },
  {
    id: 'confluence',
    name: 'Confluence',
    description: 'Access documentation and publish PRDs directly',
    icon: Database,
    iconBg: 'bg-blue-100 text-blue-600',
    category: 'tools',
    docsUrl: '/resources/confluence-integration',
    supportsOAuth: true,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Read channel messages for Daily Brief and get notifications',
    icon: MessageSquare,
    iconBg: 'bg-purple-100 text-purple-600',
    category: 'tools',
    docsUrl: '/resources/slack-integration',
    supportsOAuth: true,
  },
  {
    id: 'gong',
    name: 'Gong',
    description: 'Extract customer insights from sales and CS calls',
    icon: Phone,
    iconBg: 'bg-green-100 text-green-600',
    category: 'tools',
    docsUrl: '/resources/gong-integration',
    supportsOAuth: true,
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Analyze support tickets for VoC clustering and trends',
    icon: HelpCircle,
    iconBg: 'bg-emerald-100 text-emerald-600',
    category: 'tools',
    docsUrl: '/resources/zendesk-integration',
    supportsOAuth: true,
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Read email threads for context in daily briefs and customer communications',
    icon: Mail,
    iconBg: 'bg-red-100 text-red-600',
    category: 'tools',
    docsUrl: '/resources/gmail-integration',
    supportsOAuth: true,
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Access documents, spreadsheets, and presentations for PRD context',
    icon: FolderOpen,
    iconBg: 'bg-yellow-100 text-yellow-600',
    category: 'tools',
    docsUrl: '/resources/google-drive-integration',
    supportsOAuth: true,
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Pull meeting context for meeting prep packs and daily briefs',
    icon: Calendar,
    iconBg: 'bg-blue-100 text-blue-600',
    category: 'tools',
    docsUrl: '/resources/google-calendar-integration',
    supportsOAuth: true,
  },
  {
    id: 'figma',
    name: 'Figma',
    description: 'Generate prototypes directly in Figma from PRDs',
    icon: Palette,
    iconBg: 'bg-pink-100 text-pink-600',
    category: 'tools',
    docsUrl: '/resources/figma-integration',
  },
  {
    id: 'loom',
    name: 'Loom',
    description: 'Extract insights from video transcripts for PRDs and daily briefs',
    icon: Play,
    iconBg: 'bg-purple-100 text-purple-600',
    category: 'tools',
    docsUrl: '/integrations/loom',
  },
  {
    id: 'coda',
    name: 'Coda',
    description: 'Access docs and tables for product documentation',
    icon: FileText,
    iconBg: 'bg-orange-100 text-orange-600',
    category: 'tools',
  },
  {
    id: 'amplitude',
    name: 'Amplitude',
    description: 'Pull product analytics for data-driven PRDs',
    icon: BarChart3,
    iconBg: 'bg-indigo-100 text-indigo-600',
    category: 'tools',
    docsUrl: '/resources/amplitude-integration',
  },
  {
    id: 'discourse',
    name: 'Discourse',
    description: 'Monitor community discussions and feature requests',
    icon: Users,
    iconBg: 'bg-amber-100 text-amber-600',
    category: 'tools',
    docsUrl: '/resources/discourse-integration',
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Sync issues and projects from Linear',
    icon: FileText,
    iconBg: 'bg-violet-100 text-violet-600',
    category: 'tools',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Export PRDs and artifacts to Notion pages',
    icon: Database,
    iconBg: 'bg-gray-100 text-gray-600',
    category: 'tools',
  },
  // AI Crawlers
  {
    id: 'social_crawler',
    name: 'Social Crawler',
    description: 'Monitor X, Reddit, LinkedIn, Discord, Bluesky, and Threads',
    icon: Hash,
    iconBg: 'bg-pink-100 text-pink-600',
    category: 'crawlers',
    docsUrl: '/resources/social-crawler-integration',
  },
  {
    id: 'web_search',
    name: 'Web Search',
    description: 'Search Google and Bing for competitor intelligence',
    icon: Globe,
    iconBg: 'bg-cyan-100 text-cyan-600',
    category: 'crawlers',
    docsUrl: '/resources/web-search-integration',
  },
  {
    id: 'news_crawler',
    name: 'News Crawler',
    description: 'Track industry news and press releases',
    icon: Newspaper,
    iconBg: 'bg-orange-100 text-orange-600',
    category: 'crawlers',
    docsUrl: '/resources/news-crawler-integration',
  },
];

// Connectors that support OAuth
const oauthConnectors = ['slack', 'jira', 'confluence', 'gong', 'zendesk', 'gmail', 'google-drive', 'google-calendar'];

// Connectors that are coming soon (no OAuth yet)
const comingSoonConnectors = ['figma', 'loom', 'coda', 'linear', 'notion', 'amplitude', 'discourse'];

function StatusBadge({ status, workspaceName }: { status: ConnectionStatus; workspaceName?: string }) {
  if (status === 'connected') {
    return (
      <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        {workspaceName ? `Connected to ${workspaceName}` : 'Connected'}
      </Badge>
    );
  }
  if (status === 'coming_soon') {
    return (
      <Badge variant="secondary">
        Coming Soon
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      <Circle className="mr-1 h-3 w-3" />
      Not Connected
    </Badge>
  );
}

function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  isLoading,
  isAdmin,
}: {
  integration: Integration;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  isLoading: boolean;
  isAdmin: boolean;
}) {
  const showConnect = integration.supportsOAuth && integration.status !== 'coming_soon';

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`rounded-lg p-3 ${integration.iconBg}`}>
              <integration.icon className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{integration.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{integration.description}</p>
              <StatusBadge status={integration.status} workspaceName={integration.workspaceName} />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {integration.status === 'coming_soon' ? (
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            ) : integration.status === 'connected' ? (
              <Button
                variant="outline"
                onClick={() => onDisconnect(integration.id)}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Disconnect
              </Button>
            ) : showConnect ? (
              integration.id === 'slack' ? (
                <a
                  href="/api/connectors/slack/authorize"
                  onClick={(e) => {
                    if (isLoading) {
                      e.preventDefault();
                      return;
                    }
                    onConnect(integration.id);
                  }}
                  className={isLoading ? 'pointer-events-none opacity-50' : ''}
                >
                  {isLoading ? (
                    <Button disabled>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </Button>
                  ) : (
                    <img
                      alt="Add to Slack"
                      height="40"
                      width="139"
                      src="https://platform.slack-edge.com/img/add_to_slack.png"
                      srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
                    />
                  )}
                </a>
              ) : (
                <Button onClick={() => onConnect(integration.id)} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Connect
                </Button>
              )
            ) : isAdmin ? (
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            ) : (
              <Button asChild>
                <Link href="/pricing">Upgrade to Paid Plan</Link>
              </Button>
            )}
            {integration.docsUrl && (
              <Link
                href={integration.docsUrl}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                View documentation
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function IntegrationsPageContent() {
  const [connectors, setConnectors] = useState<ConnectorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

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

  // Handle URL params from OAuth callback
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const successParam = searchParams.get('success');
    const workspace = searchParams.get('workspace');

    if (errorParam) {
      const errorMessages: Record<string, string> = {
        unauthorized: 'Please sign in to connect integrations.',
        invalid_state: 'OAuth state validation failed. Please try again.',
        missing_code: 'Authorization code missing. Please try again.',
        config_error: 'Integration not configured. Contact support.',
        user_not_found: 'User account not found. Please contact support.',
        access_denied: 'Access denied. Please grant the required permissions.',
        server_error: 'Server error. Please try again later.',
      };
      setError(errorMessages[errorParam] || `OAuth error: ${errorParam}`);
    }

    if (successParam) {
      const successMessages: Record<string, string> = {
        slack_connected: `Successfully connected to Slack${workspace ? ` workspace "${workspace}"` : ''}!`,
        atlassian_connected: `Successfully connected to Atlassian${workspace ? ` site "${workspace}"` : ''}! Jira and Confluence are now available.`,
        gong_connected: 'Successfully connected to Gong!',
        zendesk_connected: `Successfully connected to Zendesk${workspace ? ` subdomain "${workspace}"` : ''}!`,
        google_connected: 'Successfully connected to Google! Gmail, Google Drive, and Google Calendar are now available.',
        figma_connected: 'Successfully connected to Figma!',
      };
      setSuccess(successMessages[successParam] || `Successfully connected${workspace ? ` to ${workspace}` : ''}!`);
    }

    // Clear URL params
    if (errorParam || successParam) {
      router.replace('/settings/integrations');
    }
  }, [searchParams, router]);

  // Fetch connector status
  useEffect(() => {
    async function fetchConnectors() {
      try {
        const res = await fetch('/api/connectors');
        if (res.ok) {
          const data = await res.json();
          setConnectors(data.connectors || []);
        }
      } catch (err) {
        console.error('Failed to fetch connectors:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchConnectors();
  }, []);

  // Build integrations with real status
  const integrations: Integration[] = integrationDefinitions.map((def) => {
    const connector = connectors.find((c) => c.connectorKey === def.id);
    let status: ConnectionStatus = 'not_connected';

    if (comingSoonConnectors.includes(def.id)) {
      status = 'coming_soon';
    } else if (connector?.status === 'real') {
      status = 'connected';
    }

    return {
      ...def,
      status,
      workspaceName: connector?.workspaceName,
      supportsOAuth: oauthConnectors.includes(def.id),
    };
  });

  const handleConnect = async (connectorId: string) => {
    setActionLoading(connectorId);
    setError(null);

    // Map connector IDs to OAuth endpoints
    const oauthEndpoints: Record<string, string> = {
      slack: '/api/connectors/slack/authorize',
      jira: '/api/connectors/atlassian/authorize',
      confluence: '/api/connectors/atlassian/authorize',
      gong: '/api/connectors/gong/authorize',
      zendesk: '/api/connectors/zendesk/authorize',
      gmail: '/api/connectors/google/authorize',
      'google-drive': '/api/connectors/google/authorize',
      'google-calendar': '/api/connectors/google/authorize',
    };

    const endpoint = oauthEndpoints[connectorId];
    if (endpoint) {
      window.location.href = endpoint;
    } else {
      setError(`OAuth not configured for ${connectorId}`);
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (connectorId: string) => {
    setActionLoading(connectorId);
    setError(null);

    try {
      const res = await fetch(`/api/connectors/${connectorId}/disconnect`, {
        method: 'POST',
      });

      if (res.ok) {
        setConnectors((prev) =>
          prev.map((c) => (c.connectorKey === connectorId ? { ...c, status: 'disabled' } : c))
        );
        setSuccess(`Disconnected from ${connectorId}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to disconnect');
      }
    } catch {
      setError('Failed to disconnect. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const toolIntegrations = integrations.filter((i) => i.category === 'tools');
  const crawlerIntegrations = integrations.filter((i) => i.category === 'crawlers');
  const connectedCount = integrations.filter((i) => i.status === 'connected').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Connect your favorite tools to enhance your pmkit experience. Organization-level
            integrations are shared with all team members.
          </p>
        </div>
        <Badge variant="outline" className="text-muted-foreground">
          {connectedCount}/{integrations.length} connected
        </Badge>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Upgrade Banner - hidden for admin users */}
      {!isAdmin && (
        <Card className="border-cobalt-200 bg-gradient-to-r from-cobalt-50 to-background">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-cobalt-100 p-3">
                <Sparkles className="h-6 w-6 text-cobalt-600" />
              </div>
              <div>
                <h3 className="font-semibold">Upgrade to Paid Plan for all integrations</h3>
                <p className="text-sm text-muted-foreground">
                  Get access to all tool integrations and AI crawlers with a paid plan.
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/pricing">View Plans</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tool Integrations */}
      <div>
        <div className="mb-4">
          <h2 className="font-heading text-xl font-semibold">Tool Integrations</h2>
          <p className="text-sm text-muted-foreground">
            Connect your PM tools to pull data into jobs automatically
          </p>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4">
            {toolIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                isLoading={actionLoading === integration.id}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* AI Crawlers */}
      <div>
        <div className="mb-4">
          <h2 className="font-heading text-xl font-semibold">AI Crawlers</h2>
          <p className="text-sm text-muted-foreground">
            Let pmkit automatically gather competitive research and social signals
          </p>
        </div>
        <div className="grid gap-4">
          {crawlerIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              isLoading={actionLoading === integration.id}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      </div>

      {/* MCP Section */}
      <Separator />
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>MCP Clients</CardTitle>
            <Badge variant="secondary" className="text-xs">
              Coming Soon
            </Badge>
          </div>
          <CardDescription>
            Connect pmkit MCP to your IDE or AI client. Copy a ready-to-paste config for your
            client or use the Cursor deeplink.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 rounded-lg border bg-muted/50 px-4 py-2 font-mono text-sm text-muted-foreground">
              https://app.getpmkit.com/mcp
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
            <Button disabled>
              Open in Cursor
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            See setup instructions for each client in the{' '}
            <Link href="/resources/mcp-integration" className="text-cobalt-600 hover:underline">
              MCP documentation
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <IntegrationsPageContent />
    </Suspense>
  );
}
