import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Battlecard, type BattlecardPoint } from '@/components/battlecard';

export const metadata: Metadata = {
  title: 'pmkit vs Nalin',
  description:
    'Compare pmkit and Nalin AI PM copilot. See wins, risks, and counterpunches for workflow automation vs conversational AI.',
  openGraph: {
    title: 'pmkit vs Nalin',
    description: 'Compare pmkit and Nalin AI PM copilot for product management.',
  },
};

const battlecardPoints: BattlecardPoint[] = [
  {
    title: 'Structured Workflows vs Chat',
    wins: [
      'Seven pre-built PM workflows that run end-to-end',
      'Consistent, repeatable outputs every time',
      'Scheduled jobs run without prompting',
    ],
    risks: [
      'Nalin offers flexible, conversational interactions',
      'Less adaptable to ad-hoc questions',
    ],
    counterpunch:
      'Chat is great for exploration, but PM work needs consistency. Your daily brief should look the same every day, not depend on how you phrase the prompt.',
  },
  {
    title: 'Draft-Only Governance',
    wins: [
      'All external writes are proposals for human review',
      'Full audit trail of every tool call and artifact',
      'RBAC controls who can approve what',
    ],
    risks: [
      'Nalin can take direct actions faster',
      'Approval workflow adds steps',
    ],
    counterpunch:
      'Speed without governance is how you spam Slack channels and create duplicate Jira tickets. pmkit is fast enough with guardrails.',
  },
  {
    title: 'Enterprise Integrations',
    wins: [
      'MCP connectors for Jira, Confluence, Slack, Gong, Zendesk',
      'Standardized tool protocol for adding new connectors',
      'Audit logging for every API call',
    ],
    risks: [
      'Nalin may have different integration options',
      'MCP is a newer protocol',
    ],
    counterpunch:
      'MCP is the emerging standard for AI tool integration. Building on MCP means pmkit connectors work with the broader AI ecosystem.',
  },
];

export default function NalinComparePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-cobalt-50/50 to-background py-16 md:py-24">
        <div className="container">
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
              <span className="text-cobalt-600"> Nalin</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Nalin is a conversational PM copilot. pmkit is a workflow engine with
              structured jobs, draft-only governance, and enterprise integrations.
            </p>
          </div>
        </div>
      </section>

      {/* Battlecard */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <Battlecard points={battlecardPoints} />
          </div>
        </div>
      </section>

      {/* Bottom Line */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-2xl font-bold">The Bottom Line</h2>
            <p className="mt-4 text-muted-foreground">
              <strong>Use Nalin</strong> if you want a conversational AI assistant for
              ad-hoc PM questions and brainstorming.
            </p>
            <p className="mt-2 text-muted-foreground">
              <strong>Use pmkit</strong> if you need structured workflows that run consistently,
              with governance and audit trails for enterprise teams.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cobalt-600 py-16 text-white md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">See Structured Workflows</h2>
            <p className="mt-4 text-cobalt-100">
              Run all seven PM jobs in the demo and experience consistent, repeatable outputs.
            </p>
            <div className="mt-8">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/demo">
                  Try the Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

