import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const footerLinks = {
  product: [
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Demo', href: '/demo' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Trust Center', href: '/trust' },
  ],
  agents: [
    { name: 'Product Management Agent', href: '/resources/product-management-agent' },
    { name: 'AI PM Assistant', href: '/resources/ai-product-manager-assistant' },
    { name: 'Agentic PM', href: '/resources/agentic-product-management' },
    { name: 'Draft-Only Agents', href: '/resources/draft-only-ai-agent' },
  ],
  workflows: [
    { name: 'PRD Automation', href: '/resources/prd-automation' },
    { name: 'Meeting Prep Packs', href: '/resources/meeting-prep-pack-for-product-managers' },
    { name: 'Roadmap Alignment', href: '/resources/roadmap-alignment-memos' },
    { name: 'Product Ops Automation', href: '/resources/product-ops-automation' },
    { name: 'Sprint Review Packs', href: '/resources/ai-release-notes-and-sprint-review-packs' },
  ],
  integrations: [
    { name: 'Slack to Jira', href: '/resources/slack-to-jira-draft-epics' },
    { name: 'Gong Insights', href: '/resources/gong-transcripts-to-product-insights' },
    { name: 'Community to Roadmap', href: '/resources/community-ideas-to-roadmap' },
    { name: 'Jira & Confluence', href: '/resources/jira-and-confluence-ai-workflows' },
    { name: 'MCP Connectors', href: '/resources/mcp-connectors-for-enterprise-tools' },
  ],
  governance: [
    { name: 'Enterprise Governance', href: '/resources/enterprise-pm-governance' },
    { name: 'RBAC & Audit', href: '/resources/enterprise-pm-governance' },
    { name: 'Cross-Team Dependencies', href: '/resources/ai-for-cross-team-dependencies' },
  ],
  voc: [
    { name: 'VoC Clustering', href: '/resources/voice-of-customer-clustering' },
    { name: 'Competitor Intel', href: '/resources/competitor-intel-diff' },
    { name: 'Customer Escalations', href: '/resources/customer-escalation-to-fix-spec' },
    { name: 'Search Analytics', href: '/resources/search-product-analytics-insights' },
  ],
  company: [
    { name: 'Blog', href: '/blog' },
    { name: 'Contact Sales', href: '/contact' },
  ],
  legal: [
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
    { name: 'Security', href: '/security' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12 md:py-16">
        {/* Main footer grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-7">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="text-xl font-bold text-cobalt-600">
              pmkit
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Your daily PM toolkit - briefs, meetings, and PRDs made simple.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-heading text-sm font-semibold">Product</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-cobalt-600"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Agents */}
          <div>
            <h3 className="font-heading text-sm font-semibold">Agents</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.agents.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-cobalt-600"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Workflows */}
          <div>
            <h3 className="font-heading text-sm font-semibold">PM Workflows</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.workflows.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-cobalt-600"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Integrations */}
          <div>
            <h3 className="font-heading text-sm font-semibold">Integrations</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.integrations.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-cobalt-600"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* VoC & Intel */}
          <div>
            <h3 className="font-heading text-sm font-semibold">VoC & Intel</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.voc.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-cobalt-600"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Secondary links row */}
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
          {footerLinks.governance.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-cobalt-600"
            >
              {link.name}
            </Link>
          ))}
          {footerLinks.company.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-cobalt-600"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Copyright and legal */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} pmkit. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-cobalt-600"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="https://x.com/getpmkit"
              className="text-muted-foreground hover:text-cobalt-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">X</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Link>
            <Link
              href="https://github.com/getpmkit"
              className="text-muted-foreground hover:text-cobalt-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">GitHub</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
