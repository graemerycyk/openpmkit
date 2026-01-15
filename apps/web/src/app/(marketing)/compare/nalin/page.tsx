import type { Metadata } from 'next';
import { ComparisonPage, type ComparisonPageData } from '@/components/comparison-page';
import { siteConfig } from '@/lib/utils';

// ============================================================================
// SEO Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'pmkit vs Nalin (2026): Complete Comparison Guide',
  description:
    'Compare pmkit and Nalin AI PM copilot. See feature comparison, pricing, and which AI product management tool is right for your team. Updated for 2026.',
  keywords: [
    'pmkit vs nalin',
    'nalin alternative',
    'AI PM copilot comparison',
    'AI product management assistant',
    'product management AI tools',
    'nalin ai competitor',
  ],
  openGraph: {
    title: 'pmkit vs Nalin: Which AI PM Tool is Right for You?',
    description:
      'Detailed comparison of pmkit and Nalin. Workflow automation vs conversational AI for product management.',
    type: 'article',
    url: `${siteConfig.url}/compare/nalin`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'pmkit vs Nalin Comparison',
    description: 'Complete comparison guide for AI product management tools.',
  },
  alternates: {
    canonical: `${siteConfig.url}/compare/nalin`,
  },
};

// ============================================================================
// Page Data
// ============================================================================

const comparisonData: ComparisonPageData = {
  competitor: {
    name: 'Nalin',
    tagline: 'AI product management copilot',
  },

  headline: 'pmkit vs Nalin: Which AI PM Tool is Right for You?',
  subheadline:
    'Nalin is a conversational AI PM copilot. pmkit is a workflow engine with structured jobs, draft-only governance, and enterprise integrations. Here\'s how they compare.',

  verdict: {
    summary:
      'Nalin excels as a flexible, conversational AI assistant for ad-hoc PM questions. pmkit excels at structured, repeatable workflows with governance and audit trails.',
    pmkitBestFor:
      'You need consistent, repeatable PM workflows that run automatically with governance, audit trails, and enterprise integrations.',
    competitorBestFor:
      'You want a flexible, conversational AI assistant for brainstorming, ad-hoc questions, and exploratory PM work.',
  },

  features: [
    {
      name: 'Structured PM workflows',
      pmkit: 'yes',
      competitor: 'partial',
      note: 'pmkit has 10+ pre-built workflows; Nalin offers conversational interactions',
    },
    {
      name: 'Scheduled/automated jobs',
      pmkit: 'yes',
      competitor: 'no',
      note: 'Daily briefs run automatically without prompting',
    },
    {
      name: 'Draft-only governance',
      pmkit: 'yes',
      competitor: 'no',
      note: 'All external writes require human approval',
    },
    {
      name: 'Full audit trail',
      pmkit: 'yes',
      competitor: 'no',
    },
    {
      name: 'RBAC access controls',
      pmkit: 'yes',
      competitor: 'no',
    },
    {
      name: 'Enterprise integrations (MCP)',
      pmkit: 'yes',
      competitor: 'partial',
      note: 'MCP connectors for Jira, Confluence, Slack, Gong, Zendesk',
    },
    {
      name: 'Conversational AI interface',
      pmkit: 'no',
      competitor: 'yes',
      note: 'Nalin uses natural language chat; pmkit uses structured inputs',
    },
    {
      name: 'Ad-hoc questions',
      pmkit: 'partial',
      competitor: 'yes',
      note: 'Nalin better for exploratory, open-ended queries',
    },
    {
      name: 'Consistent, repeatable outputs',
      pmkit: 'yes',
      competitor: 'partial',
      note: 'Same workflow produces consistent results every time',
    },
    {
      name: 'Workflow chaining',
      pmkit: 'yes',
      competitor: 'no',
      note: 'VoC → PRD → Jira → Sprint in one flow',
    },
    {
      name: 'Source citations',
      pmkit: 'yes',
      competitor: 'partial',
    },
    {
      name: 'Daily brief generation',
      pmkit: 'yes',
      competitor: 'no',
    },
    {
      name: 'PRD drafting with evidence',
      pmkit: 'yes',
      competitor: 'yes',
    },
    {
      name: 'Meeting prep packs',
      pmkit: 'yes',
      competitor: 'partial',
    },
  ],

  sections: [
    {
      title: 'Approach to AI Assistance',
      description:
        'Nalin is a conversational copilot you chat with naturally. pmkit is a workflow engine with structured jobs that run consistently.',
      pmkitAdvantage:
        'Ten pre-built PM workflows run end-to-end with consistent, repeatable outputs. Scheduled jobs run without prompting—your daily brief appears every morning automatically.',
      competitorAdvantage:
        'Flexible, natural language interaction. Ask any PM question and get helpful responses. Better for exploration and brainstorming.',
    },
    {
      title: 'Governance & Control',
      description:
        'Enterprise teams need controls over what AI produces and does. pmkit is built for enterprise governance from the ground up.',
      pmkitAdvantage:
        'All external writes are proposals for human review. Full audit trail of every tool call and artifact. RBAC controls who can approve what.',
      competitorAdvantage:
        'Nalin can take direct actions faster without approval workflows. Less friction for quick tasks.',
    },
    {
      title: 'Integration Approach',
      description:
        'Both tools connect to PM tools, but with different architectures. pmkit uses the MCP standard for enterprise integrations.',
      pmkitAdvantage:
        'MCP connectors for Jira, Confluence, Slack, Gong, Zendesk with standardized tool protocol. Audit logging for every API call. MCP is the emerging standard for AI tool integration.',
      competitorAdvantage:
        'May have different integration options that fit specific workflows better.',
    },
    {
      title: 'Consistency vs Flexibility',
      description:
        'Chat is great for exploration, but PM work often needs consistency. Your daily brief should look the same every day.',
      pmkitAdvantage:
        'Structured workflows produce consistent outputs. The same inputs always produce comparable results, making it easier to trust and act on outputs.',
      competitorAdvantage:
        'More adaptable to unique, one-off requests. Better for situations where you don\'t know exactly what you need yet.',
    },
    {
      title: 'Best Use Case',
      description:
        'Choose based on whether you need structured workflows or flexible exploration.',
      pmkitAdvantage:
        'Teams who need consistent, auditable PM workflows with enterprise governance. Daily briefs, PRDs, sprint reviews that run reliably.',
      competitorAdvantage:
        'PMs who want a flexible AI assistant for brainstorming, ad-hoc analysis, and exploratory questions.',
    },
  ],

  faqs: [
    {
      question: 'Is pmkit a replacement for Nalin?',
      answer:
        'They serve different purposes. Nalin is better for conversational, exploratory AI assistance. pmkit is better for structured, repeatable workflows with governance. Some teams use conversational AI for ideation and pmkit for production workflows.',
    },
    {
      question: 'What\'s the main difference between pmkit and Nalin?',
      answer:
        'The core difference is structured workflows vs. conversational AI. pmkit runs pre-built PM workflows consistently with governance and audit trails. Nalin offers flexible, natural language interactions for any PM question.',
    },
    {
      question: 'Can Nalin run scheduled workflows?',
      answer:
        'Not in the same way as pmkit. pmkit can schedule recurring jobs like daily briefs that run automatically. Nalin is designed for on-demand, conversational interactions rather than automated workflows.',
    },
    {
      question: 'Which has better enterprise features?',
      answer:
        'pmkit is built for enterprise from the ground up: draft-only governance, RBAC, full audit trails, SIEM integration. These features ensure AI outputs go through proper review before affecting external systems.',
    },
    {
      question: 'Can I ask pmkit ad-hoc questions?',
      answer:
        'pmkit is optimized for structured workflows rather than open-ended chat. For ad-hoc PM questions and brainstorming, a conversational AI like Nalin may be more suitable.',
    },
    {
      question: 'What about pricing?',
      answer:
        'pmkit uses usage-based pricing where you pay for workflows run, not users added. This makes it cost-effective for larger teams. Check both products\' current pricing pages for the latest details.',
    },
  ],
};

// ============================================================================
// Page Component
// ============================================================================

export default function NalinComparisonPage() {
  return <ComparisonPage data={comparisonData} />;
}
