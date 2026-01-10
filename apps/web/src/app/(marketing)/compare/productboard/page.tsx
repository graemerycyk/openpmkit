import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Battlecard, type BattlecardPoint } from '@/components/battlecard';

export const metadata: Metadata = {
  title: 'pmkit vs Productboard',
  description:
    'Compare pmkit and Productboard. See wins, risks, and counterpunches for AI workflow agents vs product management platforms.',
  openGraph: {
    title: 'pmkit vs Productboard',
    description: 'Compare pmkit and Productboard for product management.',
  },
};

const battlecardPoints: BattlecardPoint[] = [
  {
    title: 'AI Agent vs Platform',
    wins: [
      'pmkit runs workflows automatically, no manual data entry',
      'Daily briefs, VoC clustering, PRDs generated on schedule',
      'AI synthesizes across tools you already use',
    ],
    risks: [
      'Productboard is a full PM platform with roadmaps, portals, and more',
      'Established market presence and ecosystem',
    ],
    counterpunch:
      'Productboard requires you to centralize data in their platform. pmkit works with your existing tools (Jira, Slack, Gong) and synthesizes automatically.',
  },
  {
    title: 'Draft-Only Governance',
    wins: [
      'All outputs are proposals for human review',
      'Full audit trail of every AI decision',
      'RBAC controls who can approve artifacts',
    ],
    risks: [
      'Productboard offers direct editing and publishing',
      'Faster for teams that trust their process',
    ],
    counterpunch:
      'When AI is generating content, you want a review step. pmkit\'s draft-only pattern means no surprises in your Jira board or Confluence space.',
  },
  {
    title: 'Pricing Model',
    wins: [
      'Usage-based pricing aligned with value delivered',
      'No per-seat costs that scale with team size',
      'Pay for jobs run, not users added',
    ],
    risks: [
      'Productboard pricing is predictable per-seat',
      'Established procurement patterns',
    ],
    counterpunch:
      'Per-seat pricing punishes collaboration. pmkit charges for workflows run. Add your whole team without multiplying costs.',
  },
];

export default function ProductboardComparePage() {
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
              <span className="text-cobalt-600"> Productboard</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Productboard is a PM platform. pmkit is an AI agent that runs workflows,
              synthesizes evidence, and proposes artifacts. It works with your existing tools.
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
              <strong>Use Productboard</strong> if you want a centralized PM platform with
              roadmaps, customer portals, and feature voting.
            </p>
            <p className="mt-2 text-muted-foreground">
              <strong>Use pmkit</strong> if you want AI to run PM workflows automatically,
              working with the tools you already have, with governance built in.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              They can complement each other: use Productboard for roadmap visualization,
              pmkit for automated synthesis and artifact generation.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cobalt-600 py-16 text-white md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">See AI-Powered PM Workflows</h2>
            <p className="mt-4 text-cobalt-100">
              Try all nine workflow jobs and see how pmkit automates PM work.
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

