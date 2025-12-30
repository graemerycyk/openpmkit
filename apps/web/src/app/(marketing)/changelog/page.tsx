import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Changelog',
  description:
    "See what's new in pmkit - feature releases, improvements, and known limitations.",
};

interface ChangelogEntry {
  version: string;
  date: string;
  highlights: string[];
  knownLimitations?: string[];
}

const changelog: ChangelogEntry[] = [
  {
    version: '0.1.0 (Demo)',
    date: 'December 2025',
    highlights: [
      'Initial demo release with 6 PM workflows: Daily Brief, Meeting Prep, VoC Clustering, Competitor Intel, Roadmap Alignment, and PRD Draft',
      'Mock MCP connectors for Jira, Confluence, Slack, Gong, Zendesk, and Analytics',
      'Full job traceability with tool-call timeline and audit logging',
      'Draft-only proposal system - all outputs are proposals, never direct writes',
      'Guest demo mode - explore all workflows without authentication',
      'Comprehensive resources library with 20 landing pages',
      '18 blog posts covering PM agents, workflows, and best practices',
    ],
    knownLimitations: [
      'All connectors are mocked - real integrations coming in v0.2',
      'Artifact downloads generate sample files (not connected to real data)',
      'No persistent storage between sessions in demo mode',
      'SSO/SAML integration not yet available',
      'Slack/Teams/Email triggers are coming in v0.2',
    ],
  },
];

const roadmap = [
  {
    version: '0.2.0',
    title: 'Real Integrations',
    items: [
      'Jira Cloud OAuth integration',
      'Slack app with slash commands',
      'Persistent job history',
      'Team workspaces',
    ],
  },
  {
    version: '0.3.0',
    title: 'Enterprise Features',
    items: [
      'SSO/SAML authentication',
      'Custom job templates',
      'API access',
      'Webhook notifications',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-4xl font-bold tracking-tight">Changelog</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Track what&apos;s new in pmkit - feature releases, improvements, and known limitations.
        </p>

        <div className="mt-12 space-y-8">
          {changelog.map((entry) => (
            <Card key={entry.version}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading text-xl">{entry.version}</CardTitle>
                  <Badge variant="outline">{entry.date}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground">Highlights</h3>
                  <ul className="mt-2 space-y-2">
                    {entry.highlights.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="text-green-600 shrink-0">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {entry.knownLimitations && (
                  <div>
                    <h3 className="font-semibold text-foreground">Known Limitations (Demo)</h3>
                    <ul className="mt-2 space-y-2">
                      {entry.knownLimitations.map((item, i) => (
                        <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="text-amber-600 shrink-0">⚠</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Roadmap */}
        <div className="mt-16">
          <h2 className="font-heading text-2xl font-bold tracking-tight">Roadmap</h2>
          <p className="mt-2 text-muted-foreground">What we&apos;re building next.</p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {roadmap.map((release) => (
              <Card key={release.version} className="border-dashed">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{release.version}</Badge>
                    <span className="text-sm font-medium">{release.title}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {release.items.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="text-muted-foreground/50">○</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-lg border bg-muted/30 p-6">
          <h2 className="font-heading text-lg font-semibold">Want early access?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;re working on real MCP connector integrations, persistent job history, team
            workspaces, and SSO. Get notified when new features ship.
          </p>
          <div className="mt-4 flex gap-4">
            <Link
              href="/contact"
              className="text-sm font-medium text-cobalt-600 hover:underline"
            >
              Contact Sales →
            </Link>
            <Link
              href="/demo"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Try the Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

