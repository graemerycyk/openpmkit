import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Workflow,
  Shield,
  Eye,
  FileText,
  CheckCircle2,
  Zap,
  Database,
  Lock,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'Learn how pmkit runs PM workflows with draft-only AI agents, MCP connectors, and enterprise governance.',
  openGraph: {
    title: 'How pmkit Works',
    description:
      'Learn how pmkit runs PM workflows with draft-only AI agents, MCP connectors, and enterprise governance.',
  },
};

const steps = [
  {
    number: '01',
    title: 'Connect Your Tools',
    description:
      'MCP (Model Context Protocol) connectors link pmkit to your existing tools; Jira, Confluence, Slack, Gong, Zendesk, and more. Each connector authenticates securely and logs every interaction.',
    icon: Database,
    details: [
      'OAuth 2.0 or API key authentication',
      'Encrypted credential storage',
      'Per-tool permission scoping',
      'Audit logging for every API call',
    ],
  },
  {
    number: '02',
    title: 'Configure Jobs',
    description:
      'Set up the PM jobs you want to run; daily briefs, meeting prep, VoC clustering, competitor intel, roadmap alignment, or PRD drafts. Configure sources, schedules, and output destinations.',
    icon: Workflow,
    details: [
      'Six pre-built job types',
      'Custom job templates (Enterprise)',
      'Schedule-based or on-demand execution',
      'Source and output configuration',
    ],
  },
  {
    number: '03',
    title: 'Run with Traceability',
    description:
      'When a job runs, pmkit executes a multi-step workflow; calling tools, synthesizing data, and generating artifacts. Every step is logged with timing, inputs, and outputs.',
    icon: Eye,
    details: [
      'Real-time job progress tracking',
      'Tool call timeline with durations',
      'Source citations in every artifact',
      'Error handling with graceful fallbacks',
    ],
  },
  {
    number: '04',
    title: 'Review Proposals',
    description:
      'All external writes are proposals, not direct actions. Review the diff, edit if needed, then approve to publish to Jira, Confluence, or Slack.',
    icon: FileText,
    details: [
      'Preview before publishing',
      'Inline editing capabilities',
      'Approval workflow with RBAC',
      'Proposal expiration policies',
    ],
  },
];

const principles = [
  {
    icon: Shield,
    title: 'Draft-Only',
    description:
      'Agents never write directly to external systems. Every change is a proposal that requires human approval.',
  },
  {
    icon: Eye,
    title: 'Full Traceability',
    description:
      'Every tool call, every source, every artifact is logged. Trace any insight back to its origin.',
  },
  {
    icon: Lock,
    title: 'RBAC & Governance',
    description:
      'Role-based access control with permission simulation. Audit logs for compliance.',
  },
  {
    icon: Zap,
    title: 'MCP Architecture',
    description:
      'Swap mock connectors for real ones without changing job logic. Standardized tool integration.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-cobalt-50/50 to-background py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="cobalt" className="mb-4">
              Architecture
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              How pmkit Works
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              pmkit runs multi-step PM workflows with AI agents while keeping humans in control.
              Draft-only by design, with full traceability and enterprise governance.
            </p>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">Core Principles</h2>
            <p className="mt-4 text-muted-foreground">
              Four principles guide how pmkit handles AI automation in enterprise environments.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {principles.map((principle) => (
              <Card key={principle.title} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-cobalt-100">
                    <principle.icon className="h-6 w-6 text-cobalt-600" />
                  </div>
                  <CardTitle className="text-lg">{principle.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{principle.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Step by Step */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">Step by Step</h2>
            <p className="mt-4 text-muted-foreground">
              From connecting tools to reviewing proposals; here's how a pmkit workflow runs.
            </p>
          </div>
          <div className="mt-16 space-y-16">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`flex flex-col gap-8 lg:flex-row lg:items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <span className="font-heading text-4xl font-bold text-cobalt-600">
                      {step.number}
                    </span>
                    <h3 className="font-heading text-2xl font-bold">{step.title}</h3>
                  </div>
                  <p className="mt-4 text-muted-foreground">{step.description}</p>
                  <ul className="mt-6 space-y-2">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-cobalt-600" />
                        <span className="text-sm">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1">
                  <div className="rounded-lg border bg-card p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <step.icon className="h-4 w-4" />
                      {step.title}
                    </div>
                    <div className="mt-4 h-48 rounded bg-muted/50" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Types */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">Six Cadence Jobs</h2>
            <p className="mt-4 text-muted-foreground">
              Pre-built workflows for the most common PM tasks. Run on-demand or on a schedule.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: 'Daily Brief',
                description: 'Synthesize overnight activity from Slack, Jira, support, and community.',
                frequency: 'Daily',
              },
              {
                name: 'Meeting Prep',
                description: 'Prepare for customer meetings with context from calls, tickets, and CRM.',
                frequency: 'On-demand',
              },
              {
                name: 'VoC Clustering',
                description: 'Cluster feedback from support, calls, and community into themes.',
                frequency: 'Weekly',
              },
              {
                name: 'Competitor Intel',
                description: 'Track competitor changes with strategic implications.',
                frequency: 'Weekly',
              },
              {
                name: 'Roadmap Alignment',
                description: 'Generate alignment memos with options and trade-offs.',
                frequency: 'On-demand',
              },
              {
                name: 'PRD Draft',
                description: 'Draft PRDs grounded in customer evidence and context.',
                frequency: 'On-demand',
              },
            ].map((job) => (
              <Card key={job.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{job.name}</CardTitle>
                    <Badge variant="outline">{job.frequency}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{job.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">See It In Action</h2>
            <p className="mt-4 text-muted-foreground">
              Try all six jobs in the interactive demo with a complete mock enterprise dataset.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/demo">
                  Try the Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

