import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Battlecard, type BattlecardPoint } from '@/components/battlecard';

export const metadata: Metadata = {
  title: 'pmkit vs Jira Product Discovery',
  description:
    'Compare pmkit and Atlassian Jira Product Discovery (JPD). See wins, risks, and counterpunches for AI workflows vs prioritization tools.',
  openGraph: {
    title: 'pmkit vs Jira Product Discovery',
    description: 'Compare pmkit and Atlassian JPD for product management.',
  },
};

const battlecardPoints: BattlecardPoint[] = [
  {
    title: 'AI Synthesis vs Manual Prioritization',
    wins: [
      'AI clusters VoC feedback into themes automatically',
      'Daily briefs synthesize updates from 5+ tools',
      'Competitor research runs on schedule without manual work',
    ],
    risks: [
      'JPD is deeply integrated with Jira ecosystem',
      'Teams already using Jira have lower adoption friction',
    ],
    counterpunch:
      'JPD helps you prioritize ideas you already have. pmkit finds the ideas by synthesizing customer feedback, support tickets, and call transcripts you don\'t have time to read.',
  },
  {
    title: 'Workflow Chaining to Delivery',
    wins: [
      'VoC themes → PRD → Jira epics in one flow',
      'Sprint reviews generate release notes automatically',
      'Context carries through the entire chain',
    ],
    risks: [
      'JPD has native Jira integration',
      'Delivery board features built-in',
    ],
    counterpunch:
      'pmkit proposes Jira epics and stories—you approve before they\'re created. Same Jira integration, but with AI doing the synthesis work.',
  },
  {
    title: 'Draft-Only Governance',
    wins: [
      'All Jira writes are proposals for human review',
      'Full audit trail of what was proposed and why',
      'No accidental ticket creation or updates',
    ],
    risks: [
      'JPD allows direct manipulation of ideas',
      'Faster for quick prioritization changes',
    ],
    counterpunch:
      'Direct manipulation is fine for prioritization. But when AI is creating Jira tickets, you want a review step. pmkit never writes without approval.',
  },
];

export default function JPDComparePage() {
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
              <span className="text-cobalt-600"> Jira Product Discovery</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              JPD helps prioritize ideas. pmkit synthesizes customer evidence, drafts artifacts,
              and proposes Jira tickets—all with human approval before anything is created.
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
              <strong>Use JPD</strong> if you need a prioritization and discovery board
              tightly integrated with Jira delivery.
            </p>
            <p className="mt-2 text-muted-foreground">
              <strong>Use pmkit</strong> if you need AI to synthesize evidence, draft artifacts,
              and propose Jira tickets—with governance and approval workflows.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              They can work together: use JPD for prioritization, pmkit for synthesis and drafting.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cobalt-600 py-16 text-white md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">See AI-Powered Synthesis</h2>
            <p className="mt-4 text-cobalt-100">
              Try VoC Clustering and see how pmkit synthesizes feedback into actionable themes.
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

