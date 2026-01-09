import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Battlecard, type BattlecardPoint } from '@/components/battlecard';

export const metadata: Metadata = {
  title: 'pmkit vs ChatPRD',
  description:
    'Compare pmkit and ChatPRD for AI-powered PRD writing. See wins, risks, and counterpunches for each approach.',
  openGraph: {
    title: 'pmkit vs ChatPRD',
    description: 'Compare pmkit and ChatPRD for AI-powered PRD writing.',
  },
};

const battlecardPoints: BattlecardPoint[] = [
  {
    title: 'Evidence-Grounded PRDs',
    wins: [
      'PRDs cite actual Slack messages, support tickets, and Gong calls',
      'VoC clustering feeds directly into PRD sections',
      'Every claim is traceable to source data',
    ],
    risks: [
      'ChatPRD can generate PRDs faster with less setup',
      'Requires connected data sources to show value',
    ],
    counterpunch:
      'Fast PRDs without evidence are just fiction. pmkit PRDs are defensible in stakeholder reviews because every claim has a citation.',
  },
  {
    title: 'Draft-Only Governance',
    wins: [
      'PRDs are proposals. Review and edit before publishing',
      'Full audit trail of what was generated and why',
      'RBAC controls who can approve artifacts',
    ],
    risks: [
      'ChatPRD is simpler. Just generate and copy/paste',
      'Extra approval step adds friction',
    ],
    counterpunch:
      'Copy/paste PRDs have no audit trail. When leadership asks "where did this requirement come from?", pmkit has the answer.',
  },
  {
    title: 'Workflow Chaining',
    wins: [
      'PRD → Jira epics → Sprint reviews in one flow',
      'Context carries through the entire delivery chain',
      'Meeting prep references the same PRD context',
    ],
    risks: [
      'ChatPRD is focused. Does one thing well',
      'Broader scope means more to learn',
    ],
    counterpunch:
      'PRDs don\'t exist in isolation. pmkit connects the PRD to the roadmap, sprint, and release so nothing falls through the cracks.',
  },
];

export default function ChatPRDComparePage() {
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
              <span className="text-cobalt-600"> ChatPRD</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              ChatPRD generates PRDs from prompts. pmkit generates PRDs grounded in actual
              customer evidence, with full traceability and workflow chaining.
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
              <strong>Use ChatPRD</strong> if you need quick PRD drafts for early-stage ideas
              and don't need evidence trails.
            </p>
            <p className="mt-2 text-muted-foreground">
              <strong>Use pmkit</strong> if you need PRDs that cite real customer evidence,
              survive stakeholder scrutiny, and chain into delivery.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cobalt-600 py-16 text-white md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">See Evidence-Grounded PRDs</h2>
            <p className="mt-4 text-cobalt-100">
              Try the PRD Draft job in the demo and see how pmkit cites sources.
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

