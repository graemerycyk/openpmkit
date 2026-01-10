import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  ArrowLeft,
  Shield,
  Eye,
  FileText,
  CheckCircle2,
  XCircle,
  Link2,
  GitBranch,
  Zap,
  Bot,
  Workflow,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'pmkit vs Job Automation Tools',
  description:
    'See how pmkit differs from job automation tools like Zapier, Make, and n8n. Draft-only proposals, full traceability, and PM packs that chain into delivery.',
  openGraph: {
    title: 'pmkit vs Job Automation Tools',
    description:
      'See how pmkit differs from job automation tools like Zapier, Make, and n8n. Draft-only proposals, full traceability, and PM packs that chain into delivery.',
  },
};

const automationTools = [
  { name: 'Zapier', description: 'Connect apps with automated workflows' },
  { name: 'Make', description: 'Visual automation platform (formerly Integromat)' },
  { name: 'n8n', description: 'Open-source workflow automation' },
  { name: 'Workato', description: 'Enterprise integration and automation' },
  { name: 'Tray.io', description: 'General purpose automation platform' },
  { name: 'Power Automate', description: 'Microsoft\'s automation tool' },
];

const comparisonPoints = [
  {
    icon: Shield,
    title: 'Draft-Only Proposals',
    pmkit: 'Every external write is a proposal. Review diffs, edit content, then approve before anything touches Jira, Confluence, or Slack.',
    others: 'Actions execute immediately. One bad trigger and you\'ve created 50 Jira tickets or spammed a Slack channel.',
    pmkitBullets: [
      'Human-in-the-loop for all writes',
      'Preview and edit before publishing',
      'Approval workflows with RBAC',
      'Undo-friendly by design',
    ],
    othersBullets: [
      'Fire-and-forget execution',
      'Rollback requires manual cleanup',
      'No built-in review process',
      'Errors propagate downstream',
    ],
  },
  {
    icon: Eye,
    title: 'Traceability & Citations',
    pmkit: 'Every insight cites its source. Trace any claim back to the Slack message, Gong call, or support ticket it came from.',
    others: 'Data flows through pipes. You know something triggered, but not why the output looks the way it does.',
    pmkitBullets: [
      'Source citations in every artifact',
      'Full audit log of tool calls',
      'Trace insights to origin data',
      'Explainable AI outputs',
    ],
    othersBullets: [
      'Execution logs only',
      'No citation of source data',
      'Black-box transformations',
      'Hard to debug outputs',
    ],
  },
  {
    icon: GitBranch,
    title: 'PM Packs That Chain Into Delivery',
    pmkit: 'VoC themes become PRD sections. PRDs become Jira epics. Sprint work becomes release notes. One workflow feeds the next.',
    others: 'Point-to-point automations. Each workflow is isolated; you build the same integrations over and over.',
    pmkitBullets: [
      'VoC → PRD → Roadmap → Sprint',
      'Artifacts reference each other',
      'Context carries through the chain',
      'End-to-end PM workflow',
    ],
    othersBullets: [
      'Isolated trigger-action pairs',
      'No workflow composition',
      'Context lost between steps',
      'Rebuild for each use case',
    ],
  },
];

export default function AutomationToolsComparePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cobalt-50/50 to-background py-16 md:py-24">
        <div className="container relative z-10">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/compare">
                <ArrowLeft className="mr-2 h-4 w-4" />
                All Comparisons
              </Link>
            </Button>
          </div>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="cobalt" className="mb-4">
              Battlecard
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              pmkit vs
              <span className="text-cobalt-600"> Job Automation Tools</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Zapier, Make, and n8n are great for simple automations. But PM workflows need
              more: draft-only governance, traceable insights, and packs that chain into delivery.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/demo">
                  Try the Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/how-it-works">See How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-cobalt-100/30 blur-3xl" />
        </div>
      </section>

      {/* Job Automation Tools Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">
              What are job automation tools?
            </h2>
            <p className="mt-4 text-muted-foreground">
              These platforms connect apps with trigger-action workflows. They're powerful for
              simple automations, but PM work needs more than "if this, then that."
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {automationTools.map((tool) => (
              <div
                key={tool.name}
                className="flex items-center gap-4 rounded-lg border bg-card p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Bot className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{tool.name}</p>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            These tools excel at simple automations. pmkit is purpose-built for PM workflows
            that require judgment, traceability, and human oversight.
          </p>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">Three Key Differences</h2>
            <p className="mt-4 text-muted-foreground">
              pmkit isn't just another automation tool. It's built for the unique needs of
              product management.
            </p>
          </div>

          <div className="mt-16 space-y-16">
            {comparisonPoints.map((point, index) => (
              <div
                key={point.title}
                className={`flex flex-col gap-8 lg:flex-row ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''} lg:items-start`}
              >
                {/* Description */}
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cobalt-100">
                      <point.icon className="h-6 w-6 text-cobalt-600" />
                    </div>
                    <h3 className="font-heading text-2xl font-bold">{point.title}</h3>
                  </div>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    {/* pmkit */}
                    <div className="rounded-lg border-2 border-cobalt-200 bg-cobalt-50/50 p-5">
                      <div className="flex items-center gap-2">
                        <Badge variant="cobalt">pmkit</Badge>
                      </div>
                      <p className="mt-3 text-sm">{point.pmkit}</p>
                      <ul className="mt-4 space-y-2">
                        {point.pmkitBullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-cobalt-600" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Others */}
                    <div className="rounded-lg border bg-card p-5">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Automation Tools</Badge>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">{point.others}</p>
                      <ul className="mt-4 space-y-2">
                        {point.othersBullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Chain Visual */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">
              PM Packs Chain Into Delivery
            </h2>
            <p className="mt-4 text-muted-foreground">
              Unlike isolated automations, pmkit workflows build on each other. Customer
              feedback becomes product decisions becomes shipped features.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-4xl">
            <div className="relative">
              {/* Connection lines (desktop) */}
              <div className="absolute left-[calc(16.67%-1rem)] right-[calc(16.67%-1rem)] top-16 hidden h-0.5 bg-gradient-to-r from-cobalt-200 via-cobalt-400 to-cobalt-200 md:block" />

              <div className="grid gap-6 md:grid-cols-3">
                {[
                  {
                    step: '01',
                    title: 'VoC Clustering',
                    description: 'Cluster customer feedback into themes with evidence',
                    output: 'Theme Report',
                    icon: Eye,
                  },
                  {
                    step: '02',
                    title: 'PRD Draft',
                    description: 'Draft PRDs grounded in customer evidence',
                    output: 'PRD Document',
                    icon: FileText,
                  },
                  {
                    step: '03',
                    title: 'Sprint Review',
                    description: 'Generate release notes from completed work',
                    output: 'Release Notes',
                    icon: Zap,
                  },
                ].map((item) => (
                  <Card key={item.step} className="relative text-center">
                    <CardHeader>
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-cobalt-600 text-lg font-bold text-white">
                        {item.step}
                      </div>
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-cobalt-100">
                        <item.icon className="h-5 w-5 text-cobalt-600" />
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <div className="mt-4">
                        <Badge variant="outline" className="text-xs">
                          → {item.output}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-lg border bg-muted/30 p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Workflow className="h-4 w-4" />
                <span>Context flows through the entire chain</span>
              </div>
              <p className="mt-2 text-sm">
                VoC themes cite specific Slack messages and support tickets. PRDs reference
                those themes. Sprint reviews link back to the PRD requirements. Every step
                is traceable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Comparison Table */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">At a Glance</h2>
            <p className="mt-4 text-muted-foreground">
              A quick comparison of capabilities.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-lg border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left font-heading text-sm font-semibold">Capability</th>
                  <th className="p-4 text-center font-heading text-sm font-semibold text-cobalt-600">pmkit</th>
                  <th className="p-4 text-center font-heading text-sm font-semibold text-muted-foreground">Zapier/Make/n8n</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { feature: 'Draft-only proposals', pmkit: true, others: false },
                  { feature: 'Human approval before writes', pmkit: true, others: false },
                  { feature: 'Source citations in outputs', pmkit: true, others: false },
                  { feature: 'Full audit trail', pmkit: true, others: 'Partial' },
                  { feature: 'Workflow chaining', pmkit: true, others: 'Limited' },
                  { feature: 'PM-specific job types', pmkit: true, others: false },
                  { feature: 'Context preservation', pmkit: true, others: false },
                  { feature: 'Simple trigger-action automations', pmkit: false, others: true },
                  { feature: 'Thousands of app connectors', pmkit: false, others: true },
                ].map((row) => (
                  <tr key={row.feature}>
                    <td className="p-4 text-sm">{row.feature}</td>
                    <td className="p-4 text-center">
                      {row.pmkit === true ? (
                        <CheckCircle2 className="mx-auto h-5 w-5 text-cobalt-600" />
                      ) : row.pmkit === false ? (
                        <XCircle className="mx-auto h-5 w-5 text-muted-foreground/30" />
                      ) : (
                        <span className="text-sm text-muted-foreground">{row.pmkit}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {row.others === true ? (
                        <CheckCircle2 className="mx-auto h-5 w-5 text-muted-foreground" />
                      ) : row.others === false ? (
                        <XCircle className="mx-auto h-5 w-5 text-muted-foreground/30" />
                      ) : (
                        <span className="text-sm text-muted-foreground">{row.others}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Different tools for different jobs. Use Zapier for simple automations.
            Use pmkit for PM workflows that need judgment and governance.
          </p>
        </div>
      </section>

      {/* Use Case Examples */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">When to Use What</h2>
            <p className="mt-4 text-muted-foreground">
              Both tools have their place. Here's how to choose.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
            {/* Use Automation Tools */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Bot className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle>Use Zapier/Make/n8n</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    'New lead in CRM → Add to email sequence',
                    'Form submission → Create Slack notification',
                    'New file in Dropbox → Backup to Google Drive',
                    'Calendar event → Send reminder email',
                    'New row in spreadsheet → Update database',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted-foreground">
                  Simple, predictable automations where immediate execution is fine.
                </p>
              </CardContent>
            </Card>

            {/* Use pmkit */}
            <Card className="border-2 border-cobalt-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cobalt-100">
                    <Link2 className="h-5 w-5 text-cobalt-600" />
                  </div>
                  <CardTitle className="text-cobalt-600">Use pmkit</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    'Synthesize daily updates from 5+ tools',
                    'Cluster customer feedback into themes',
                    'Draft PRDs with cited evidence',
                    'Prepare meeting packs with context',
                    'Generate sprint reviews and release notes',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-cobalt-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted-foreground">
                  Complex PM workflows that need judgment, traceability, and human oversight.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Bottom Line */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-2xl font-bold">The Bottom Line</h2>
            <p className="mt-4 text-muted-foreground">
              <strong>Use Zapier/Make/n8n</strong> for simple, predictable automations
              where immediate execution is fine and you don't need audit trails.
            </p>
            <p className="mt-2 text-muted-foreground">
              <strong>Use pmkit</strong> for PM workflows that need governance, traceability,
              and artifacts that chain into delivery.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cobalt-600 py-16 text-white md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">
              See the Difference
            </h2>
            <p className="mt-4 text-cobalt-100">
              Try all eight PM workflow jobs in the interactive demo. Experience draft-only
              proposals, traceable insights, and chained workflows firsthand.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/demo">
                  Try the Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white bg-white text-cobalt-600 hover:bg-white/90"
                asChild
              >
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

