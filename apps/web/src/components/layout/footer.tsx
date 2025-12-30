import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const footerLinks = {
  product: [
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Demo', href: '/demo' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Changelog', href: '/changelog' },
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
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
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

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} pmkit. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <Link
              href="https://twitter.com/getpmkit"
              className="text-muted-foreground hover:text-cobalt-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

