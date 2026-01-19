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
    { name: 'Deck Content', href: '/resources/deck-content-generation' },
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
    { name: 'Social Crawler', href: '/resources/social-crawler-integration' },
    { name: 'Web Search', href: '/resources/web-search-integration' },
    { name: 'News Crawler', href: '/resources/news-crawler-integration' },
  ],
  compare: [
    { name: 'vs Productboard', href: '/compare/productboard' },
    { name: 'vs Jira Product Discovery', href: '/compare/jira-product-discovery' },
    { name: 'vs ChatPRD', href: '/compare/chatprd' },
    { name: 'vs Aha!', href: '/compare/aha' },
    { name: 'vs Linear', href: '/compare/linear' },
    { name: 'vs Notion AI', href: '/compare/notion-ai' },
    { name: 'vs Nalin', href: '/compare/nalin' },
    { name: 'vs Automation Tools', href: '/compare/automation-tools' },
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
              Your daily PM toolkit - briefs, PRDs, and prototypes made simple.
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
            <Link
              href="https://www.reddit.com/r/pmkit/"
              className="text-muted-foreground hover:text-cobalt-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">Reddit</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
