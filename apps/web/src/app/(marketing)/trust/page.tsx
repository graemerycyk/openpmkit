import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Lock,
  Eye,
  FileCheck,
  Users,
  Server,
  Key,
  Database,
  Clock,
  AlertTriangle,
  ExternalLink,
  FileText,
  Brain,
} from 'lucide-react';
import { siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Trust Center | pmkit - Security & Compliance',
  description:
    'pmkit security practices, privacy controls, and compliance status. Learn how we protect your data with draft-only architecture and enterprise-grade governance.',
  keywords: [
    'pmkit trust center',
    'AI security compliance',
    'SOC 2 compliance',
    'GDPR compliance',
    'data processing agreement',
    'enterprise AI security',
    'AI data privacy',
  ],
  openGraph: {
    title: 'pmkit Trust Center',
    description: 'Security, privacy, and compliance for enterprise product teams.',
    url: `${siteConfig.url}/trust`,
  },
  twitter: {
    card: 'summary',
    title: 'pmkit Trust Center',
    description: 'Security, privacy, and compliance information.',
  },
  alternates: {
    canonical: `${siteConfig.url}/trust`,
  },
};

const securityOverview = [
  {
    icon: Lock,
    title: 'Encryption in Transit',
    description: 'All connections use TLS 1.3. API endpoints enforce HTTPS with HSTS.',
  },
  {
    icon: Database,
    title: 'Encryption at Rest',
    description:
      'Database and object storage encrypted with AES-256. Backups encrypted with separate keys.',
  },
  {
    icon: Key,
    title: 'Credential Storage',
    description:
      'OAuth tokens and API keys stored with envelope encryption. Encryption keys rotated quarterly.',
  },
  {
    icon: Clock,
    title: 'Secret Rotation',
    description:
      'Internal secrets rotated automatically. Connector credentials refresh via OAuth 2.0 flows.',
  },
  {
    icon: FileCheck,
    title: 'Draft-Only Posture',
    description:
      'Agents propose changes but never write directly. All outputs require explicit approval.',
  },
  {
    icon: Eye,
    title: 'Proposal Approvals',
    description:
      'Every Jira epic, Confluence page, or Slack message is a reviewable proposal before execution.',
  },
];

const accessControl = [
  {
    icon: Users,
    title: 'Role-Based Access Control',
    description:
      'Fine-grained RBAC with roles: Admin, PM, Eng, CS, Sales, Exec, Viewer, Guest. Each role has specific permissions.',
  },
  {
    icon: Eye,
    title: 'Audit Logging',
    description:
      'Every job run, tool call, proposal, and data access is logged with actor, timestamp, and resource IDs.',
  },
  {
    icon: Shield,
    title: 'SSO Support',
    description:
      'Teams: OIDC with Google Workspace + Microsoft Entra ID. Enterprise: SAML SSO + SCIM directory sync.',
  },
];

const privacyControls = [
  {
    title: 'No Training on Your Data',
    description:
      'We use the OpenAI API for inference. Per OpenAI\'s API data usage policy, data sent via the API is not used for training models. Enterprise customers can use their own LLM endpoints (Azure OpenAI, self-hosted) for additional control.',
    link: {
      text: 'OpenAI API Data Usage Policy',
      href: 'https://openai.com/policies/api-data-usage-policies',
    },
  },
  {
    title: 'Data Retention',
    description:
      'Default: 90 days for artifacts and job outputs (30-day option available). Audit logs retained for subscription duration + 90 days. Raw connector data (Slack messages, Jira issues) is cached temporarily during job execution only and not persisted.',
  },
  {
    title: 'Data Minimization',
    description:
      'We only fetch data necessary for job execution. LLM conversation context is not persisted after job completion. Source content is cached temporarily and expired based on your retention settings.',
  },
];

const subprocessors = [
  { name: 'DigitalOcean', purpose: 'Application hosting', location: 'EU/US' },
  { name: 'PostgreSQL (managed)', purpose: 'Database', location: 'EU/US' },
  { name: 'Redis (managed)', purpose: 'Cache & queues', location: 'EU/US' },
  { name: 'Stripe', purpose: 'Payment processing', location: 'EU/US' },
  { name: 'OpenAI', purpose: 'LLM inference', location: 'US' },
  { name: 'Simple Analytics', purpose: 'Website analytics', location: 'EU/US' },
];

const controlsLibrary = [
  { control: 'Access logging', implementation: 'ToolCallLog + AuditLog with immutable exports' },
  { control: 'Least privilege', implementation: 'Scoped OAuth tokens + RBAC per role' },
  { control: 'Encryption at rest', implementation: 'AES-256 for DB + object storage' },
  { control: 'Encryption in transit', implementation: 'TLS 1.3 enforced on all endpoints' },
  { control: 'Secret management', implementation: 'Envelope encryption + quarterly rotation' },
  { control: 'Draft-only writes', implementation: 'Proposal model for all external writes' },
  { control: 'Data retention', implementation: 'Configurable TTL per artifact type' },
  { control: 'Audit export', implementation: 'Enterprise API for SIEM integration' },
];

export default function TrustPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-cobalt-50/50 to-background py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="cobalt" className="mb-4">
              Trust Center
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              Security, privacy, and compliance
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              pmkit is built with enterprise governance at its core. Draft-only architecture,
              encrypted credentials, full audit trails, and transparent controls.
            </p>
          </div>
        </div>
      </section>

      {/* Security Overview */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">Security Overview</h2>
            <p className="mt-4 text-muted-foreground">
              Defense in depth with encryption, access controls, and the draft-only pattern.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {securityOverview.map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <item.icon className="h-8 w-8 text-cobalt-600" />
                  <CardTitle className="mt-4 text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Access Control */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">Access Control</h2>
            <p className="mt-4 text-muted-foreground">
              RBAC, audit logging, and SSO for enterprise identity management.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-3">
            {accessControl.map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cobalt-100">
                  <item.icon className="h-8 w-8 text-cobalt-600" />
                </div>
                <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & AI Data Use */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cobalt-100">
                <Brain className="h-6 w-6 text-cobalt-600" />
              </div>
              <h2 className="font-heading text-3xl font-bold">Privacy & AI Data Use</h2>
              <p className="mt-4 text-muted-foreground">
                Your data is not used to train models. Enterprise customers can use their own LLM
                endpoints.
              </p>
            </div>

            <div className="mt-12 space-y-8">
              {privacyControls.map((item) => (
                <Card key={item.title}>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.description}</p>
                    {item.link && (
                      <a
                        href={item.link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-sm text-cobalt-600 hover:underline"
                      >
                        {item.link.text}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Subprocessors */}
            <div className="mt-12">
              <h3 className="font-heading text-xl font-bold">Subprocessors</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Third-party services that process customer data on our behalf.
              </p>
              <div className="mt-6 overflow-hidden rounded-lg border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium">Provider</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Purpose</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subprocessors.map((sp, idx) => (
                      <tr key={sp.name} className={idx % 2 === 0 ? '' : 'bg-muted/20'}>
                        <td className="px-4 py-3 text-sm font-medium">{sp.name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{sp.purpose}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{sp.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cobalt-100">
                <FileText className="h-6 w-6 text-cobalt-600" />
              </div>
              <h2 className="font-heading text-3xl font-bold">Compliance</h2>
              <p className="mt-4 text-muted-foreground">
                Current certifications and compliance initiatives.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      In Progress
                    </Badge>
                  </div>
                  <CardTitle className="mt-2">SOC 2 Type II</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We are actively working toward SOC 2 Type II certification. Contact us for our
                    current security questionnaire responses and timeline.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                      Planned
                    </Badge>
                  </div>
                  <CardTitle className="mt-2">ISO 27001</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    ISO 27001 certification is on our roadmap following SOC 2 completion.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Available
                    </Badge>
                  </div>
                  <CardTitle className="mt-2">DPA</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Data Processing Agreement available on request for all customers. GDPR-compliant
                    terms included.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Enterprise
                    </Badge>
                  </div>
                  <CardTitle className="mt-2">Data Residency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Enterprise customers can request data residency in specific regions. Contact
                    sales for options. Note: Not all regions available at launch.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Controls Library */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <h2 className="font-heading text-3xl font-bold">Controls Library</h2>
              <p className="mt-4 text-muted-foreground">
                How we implement key security controls.
              </p>
            </div>

            <div className="mt-12 overflow-hidden rounded-lg border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium">Control</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Implementation</th>
                  </tr>
                </thead>
                <tbody>
                  {controlsLibrary.map((item, idx) => (
                    <tr key={item.control} className={idx % 2 === 0 ? '' : 'bg-muted/20'}>
                      <td className="px-4 py-3 text-sm font-medium">{item.control}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {item.implementation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Operational */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cobalt-100">
                <Server className="h-6 w-6 text-cobalt-600" />
              </div>
              <h2 className="font-heading text-3xl font-bold">Operational Security</h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status Page</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    System status and incident communication.
                  </p>
                  <Link
                    href="/status"
                    className="mt-3 inline-flex items-center gap-1 text-sm text-cobalt-600 hover:underline"
                  >
                    getpmkit.com/status
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Incident Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Security incidents: acknowledged within 4 hours, updates every 24 hours until
                    resolution. Critical issues escalated immediately.
                  </p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <CardTitle className="text-lg">Vulnerability Disclosure</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We take security seriously and appreciate the work of security researchers. If
                    you discover a vulnerability, please{' '}
                    <Link
                      href="/contact?subject=security"
                      className="text-cobalt-600 hover:underline"
                    >
                      report it via our contact form
                    </Link>
                    . We will acknowledge within 48 hours and work with you to address the issue.
                    We do not pursue legal action against good-faith security research.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Data Processing Pack */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cobalt-100">
                <FileText className="h-6 w-6 text-cobalt-600" />
              </div>
              <h2 className="font-heading text-3xl font-bold">Security & Data Processing Pack</h2>
              <p className="mt-4 text-muted-foreground">
                Available on request for procurement and security reviews.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold">Data Processing Agreement (DPA)</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    GDPR-compliant DPA with Standard Contractual Clauses for cross-border transfers.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold">Subprocessor List</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Current list of third-party services that process customer data (see table above).
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold">RBAC Model Documentation</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Role definitions, permission matrix, and access control implementation details.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold">Audit Log Scope</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    What events are logged, retention periods, and export capabilities.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold">LLM Data Handling</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    How data flows to LLM providers, API terms, and BYO LLM options for Enterprise.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold">Security Questionnaire</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Pre-filled responses for common security questionnaire formats (CAIQ, SIG, custom).
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <Button asChild>
                <Link href="/contact?subject=security">Request Security Pack</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">Questions about security?</h2>
            <p className="mt-4 text-muted-foreground">
              Contact us for security questionnaire responses, DPA requests, or to discuss
              enterprise security requirements.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/contact?subject=security">Contact Security Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

