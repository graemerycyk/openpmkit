import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
} from 'lucide-react';

type ConnectionStatus = 'connected' | 'not_connected' | 'coming_soon';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: typeof FileText;
  iconBg: string;
  status: ConnectionStatus;
  category: 'tools' | 'crawlers';
  docsUrl?: string;
  isPro?: boolean;
}

const integrations: Integration[] = [
  // Tool Integrations
  {
    id: 'jira',
    name: 'Jira',
    description: 'Sync issues, epics, and sprint data for PRDs and daily briefs',
    icon: FileText,
    iconBg: 'bg-blue-100 text-blue-600',
    status: 'not_connected',
    category: 'tools',
    docsUrl: '/resources/jira-integration',
  },
  {
    id: 'confluence',
    name: 'Confluence',
    description: 'Access documentation and publish PRDs directly',
    icon: Database,
    iconBg: 'bg-blue-100 text-blue-600',
    status: 'not_connected',
    category: 'tools',
    docsUrl: '/resources/confluence-integration',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get notifications and trigger jobs from Slack channels',
    icon: MessageSquare,
    iconBg: 'bg-purple-100 text-purple-600',
    status: 'not_connected',
    category: 'tools',
    docsUrl: '/resources/slack-integration',
  },
  {
    id: 'gong',
    name: 'Gong',
    description: 'Extract customer insights from sales and CS calls',
    icon: Phone,
    iconBg: 'bg-green-100 text-green-600',
    status: 'not_connected',
    category: 'tools',
    isPro: true,
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Analyze support tickets for VoC clustering and trends',
    icon: HelpCircle,
    iconBg: 'bg-emerald-100 text-emerald-600',
    status: 'not_connected',
    category: 'tools',
    isPro: true,
  },
  {
    id: 'amplitude',
    name: 'Amplitude',
    description: 'Pull product analytics for data-driven PRDs',
    icon: BarChart3,
    iconBg: 'bg-indigo-100 text-indigo-600',
    status: 'not_connected',
    category: 'tools',
    isPro: true,
  },
  {
    id: 'discourse',
    name: 'Discourse',
    description: 'Monitor community discussions and feature requests',
    icon: Users,
    iconBg: 'bg-amber-100 text-amber-600',
    status: 'not_connected',
    category: 'tools',
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Sync issues and projects from Linear',
    icon: FileText,
    iconBg: 'bg-violet-100 text-violet-600',
    status: 'coming_soon',
    category: 'tools',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Export PRDs and artifacts to Notion pages',
    icon: Database,
    iconBg: 'bg-gray-100 text-gray-600',
    status: 'coming_soon',
    category: 'tools',
  },
  // AI Crawlers
  {
    id: 'social_crawler',
    name: 'Social Crawler',
    description: 'Monitor X, Reddit, LinkedIn, Discord, Bluesky, and Threads',
    icon: Hash,
    iconBg: 'bg-pink-100 text-pink-600',
    status: 'not_connected',
    category: 'crawlers',
    isPro: true,
  },
  {
    id: 'web_search',
    name: 'Web Search',
    description: 'Search Google and Bing for competitor intelligence',
    icon: Globe,
    iconBg: 'bg-cyan-100 text-cyan-600',
    status: 'not_connected',
    category: 'crawlers',
  },
  {
    id: 'news_crawler',
    name: 'News Crawler',
    description: 'Track industry news and press releases',
    icon: Newspaper,
    iconBg: 'bg-orange-100 text-orange-600',
    status: 'not_connected',
    category: 'crawlers',
    isPro: true,
  },
];

function StatusBadge({ status }: { status: ConnectionStatus }) {
  if (status === 'connected') {
    return (
      <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Connected
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

function IntegrationCard({ integration }: { integration: Integration }) {
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
                {integration.isPro && (
                  <Badge variant="cobalt" className="text-xs">
                    Pro
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{integration.description}</p>
              <StatusBadge status={integration.status} />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {integration.status === 'coming_soon' ? (
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            ) : integration.status === 'connected' ? (
              <Button variant="outline">
                Manage
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

export default function IntegrationsPage() {
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

      {/* Upgrade Banner */}
      <Card className="border-cobalt-200 bg-gradient-to-r from-cobalt-50 to-background">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-cobalt-100 p-3">
              <Sparkles className="h-6 w-6 text-cobalt-600" />
            </div>
            <div>
              <h3 className="font-semibold">Upgrade to Paid Plan for all integrations</h3>
              <p className="text-sm text-muted-foreground">
                Get access to Gong, Zendesk, Amplitude, and AI crawlers with a Pro plan.
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/pricing">View Plans</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Tool Integrations */}
      <div>
        <div className="mb-4">
          <h2 className="font-heading text-xl font-semibold">Tool Integrations</h2>
          <p className="text-sm text-muted-foreground">
            Connect your PM tools to pull data into jobs automatically
          </p>
        </div>
        <div className="grid gap-4">
          {toolIntegrations.map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>
      </div>

      <Separator />

      {/* AI Crawlers */}
      <div>
        <div className="mb-4">
          <h2 className="font-heading text-xl font-semibold">AI Crawlers</h2>
          <p className="text-sm text-muted-foreground">
            Let pmkit automatically gather competitive intelligence and social signals
          </p>
        </div>
        <div className="grid gap-4">
          {crawlerIntegrations.map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>
      </div>

      {/* MCP Section */}
      <Separator />
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>MCP Clients</CardTitle>
            <Badge variant="cobalt" className="text-xs">
              Pro
            </Badge>
          </div>
          <CardDescription>
            Connect pmkit MCP to your IDE or AI client. Copy a ready-to-paste config for your
            client or use the Cursor deeplink.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 rounded-lg border bg-muted/50 px-4 py-2 font-mono text-sm">
              https://app.getpmkit.com/mcp
            </div>
            <Button variant="outline">
              Copy Config
            </Button>
            <Button>
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
