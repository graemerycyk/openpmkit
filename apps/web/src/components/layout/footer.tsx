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
    { name: 'Competitor Research', href: '/resources/competitor-research' },
    { name: 'Customer Escalations', href: '/resources/customer-escalation-to-fix-spec' },
    { name: 'Search Analytics', href: '/resources/search-product-analytics-insights' },
  ],
  compare: [
    { name: 'vs Automation Tools', href: '/compare/automation-tools' },
    { name: 'vs ChatPRD', href: '/compare/chatprd' },
    { name: 'vs Nalin', href: '/compare/nalin' },
    { name: 'vs Jira Product Discovery', href: '/compare/jira-product-discovery' },
    { name: 'vs Productboard', href: '/compare/productboard' },
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
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-8">
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

          {/* Discovery */}
          <div>
            <h3 className="font-heading text-sm font-semibold">Discovery</h3>
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

          {/* Compare */}
          <div>
            <h3 className="font-heading text-sm font-semibold">Compare</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.compare.map((link) => (
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
              href="https://www.linkedin.com/company/pmkit/"
              className="text-muted-foreground hover:text-cobalt-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">LinkedIn</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
