import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Clock,
  Server,
  Database,
  Globe,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'System Status | pmkit',
  description:
    'pmkit system status and service health. Check the current operational status of all pmkit services.',
  keywords: [
    'pmkit status',
    'pmkit uptime',
    'service status',
    'system health',
  ],
  openGraph: {
    title: 'pmkit System Status',
    description: 'Current operational status of pmkit services.',
    url: `${siteConfig.url}/status`,
  },
  alternates: {
    canonical: `${siteConfig.url}/status`,
  },
};

// Service status types
type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance';

interface Service {
  name: string;
  description: string;
  status: ServiceStatus;
  icon: typeof Server;
}

// Current service statuses (in production, this would come from a monitoring API)
const services: Service[] = [
  {
    name: 'Web Application',
    description: 'Main web application and dashboard',
    status: 'operational',
    icon: Globe,
  },
  {
    name: 'API',
    description: 'REST API and MCP endpoints',
    status: 'operational',
    icon: Zap,
  },
  {
    name: 'Database',
    description: 'PostgreSQL database cluster',
    status: 'operational',
    icon: Database,
  },
  {
    name: 'Job Runner',
    description: 'Background job processing',
    status: 'operational',
    icon: Server,
  },
  {
    name: 'LLM Inference',
    description: 'AI model inference (OpenAI)',
    status: 'operational',
    icon: Zap,
  },
];

// Status badge styling
const statusConfig: Record<ServiceStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  operational: {
    label: 'Operational',
    variant: 'default',
    className: 'bg-green-500 hover:bg-green-500',
  },
  degraded: {
    label: 'Degraded',
    variant: 'secondary',
    className: 'bg-amber-500 hover:bg-amber-500 text-white',
  },
  outage: {
    label: 'Outage',
    variant: 'destructive',
    className: '',
  },
  maintenance: {
    label: 'Maintenance',
    variant: 'outline',
    className: 'border-blue-500 text-blue-700',
  },
};

// Calculate overall status
function getOverallStatus(services: Service[]): ServiceStatus {
  if (services.some((s) => s.status === 'outage')) return 'outage';
  if (services.some((s) => s.status === 'degraded')) return 'degraded';
  if (services.some((s) => s.status === 'maintenance')) return 'maintenance';
  return 'operational';
}

export default function StatusPage() {
  const overallStatus = getOverallStatus(services);
  const lastUpdated = new Date().toISOString();

  return (
    <>
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              System Status
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Current operational status of pmkit services.
            </p>

            {/* Overall Status Banner */}
            <div className="mt-8">
              {overallStatus === 'operational' ? (
                <div className="inline-flex items-center gap-3 rounded-full bg-green-50 px-6 py-3 text-green-700 border border-green-200">
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="text-lg font-semibold">All Systems Operational</span>
                </div>
              ) : overallStatus === 'degraded' ? (
                <div className="inline-flex items-center gap-3 rounded-full bg-amber-50 px-6 py-3 text-amber-700 border border-amber-200">
                  <AlertTriangle className="h-6 w-6" />
                  <span className="text-lg font-semibold">Degraded Performance</span>
                </div>
              ) : overallStatus === 'outage' ? (
                <div className="inline-flex items-center gap-3 rounded-full bg-red-50 px-6 py-3 text-red-700 border border-red-200">
                  <AlertTriangle className="h-6 w-6" />
                  <span className="text-lg font-semibold">Service Outage</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-3 rounded-full bg-blue-50 px-6 py-3 text-blue-700 border border-blue-200">
                  <Clock className="h-6 w-6" />
                  <span className="text-lg font-semibold">Scheduled Maintenance</span>
                </div>
              )}
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-2xl font-bold mb-6">Services</h2>
            <div className="space-y-4">
              {services.map((service) => {
                const config = statusConfig[service.status];
                return (
                  <Card key={service.name}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <service.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                      </div>
                      <Badge variant={config.variant} className={config.className}>
                        {config.label}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Incident History */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-2xl font-bold mb-6">Recent Incidents</h2>
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                <p className="mt-4 font-medium">No recent incidents</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  All systems have been operating normally.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Uptime */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-2xl font-bold mb-6">Uptime</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Last 24 Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">100%</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Last 7 Days
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">100%</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Last 30 Days
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">99.9%</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe / Contact */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <h3 className="font-heading text-xl font-bold">Stay Informed</h3>
                  <p className="mt-2 text-muted-foreground">
                    Get notified about scheduled maintenance and service incidents.
                  </p>
                  <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Button asChild>
                      <Link href="/contact?subject=status-updates">
                        Subscribe to Updates
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/contact?subject=support">
                        Report an Issue
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="border-t py-8">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center text-sm text-muted-foreground">
            <p>
              For real-time status updates and incident notifications, we recommend subscribing to
              our status updates. Enterprise customers can configure webhook notifications for
              automated alerting.
            </p>
            <p className="mt-4">
              <Link href="/trust" className="text-cobalt-600 hover:underline">
                Learn more about our security and reliability practices →
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
