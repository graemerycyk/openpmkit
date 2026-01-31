import type { Metadata } from 'next';
import { ComparisonPage, type ComparisonPageData } from '@/components/comparison-page';
import { siteConfig } from '@/lib/utils';

// ============================================================================
// SEO Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'openpmkit vs Notion AI (2026): Complete Comparison Guide',
  description:
    'Compare openpmkit and Notion AI for product management. See feature comparison, pricing, and which AI workspace tool is right for your team. Updated for 2026.',
  keywords: [
    'openpmkit vs notion ai',
    'notion ai alternative',
    'notion ai for product managers',
    'AI product management workspace',
    'notion ai pm comparison',
    'best AI tool for product management',
  ],
  openGraph: {
    title: 'openpmkit vs Notion AI: Which AI PM Tool is Right for You?',
    description:
      'Detailed comparison of openpmkit and Notion AI. Purpose-built PM workflows vs general-purpose AI workspace.',
    type: 'article',
    url: `${siteConfig.url}/compare/notion-ai`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'openpmkit vs Notion AI Comparison',
    description: 'Complete comparison guide for AI product management tools.',
  },
  alternates: {
    canonical: `${siteConfig.url}/compare/notion-ai`,
  },
};

// ============================================================================
// Page Data
// ============================================================================

const comparisonData: ComparisonPageData = {
  competitor: {
    name: 'Notion AI',
    tagline: 'AI-powered workspace',
    website: 'https://notion.so/product/ai',
  },

  headline: 'openpmkit vs Notion AI: Which AI PM Tool is Right for You?',
  subheadline:
    'Notion AI enhances your general-purpose workspace with AI capabilities. openpmkit is purpose-built for PM workflows with draft-only governance and deep integrations. Here\'s how they compare.',

  verdict: {
    summary:
      'Notion AI excels as an AI-enhanced workspace for documentation and collaboration. openopenpmkit excels at purpose-built PM workflows that pull data from your tools and produce traceable artifacts.',
    openopenpmkitBestFor:
      'You need AI workflows specifically designed for product management: daily briefs, PRDs with evidence, VoC clustering, sprint reviews—all with governance and audit trails.',
    competitorBestFor:
      'You want an AI-enhanced workspace for general documentation, notes, wikis, and collaboration across your entire organization.',
  },

  features: [
    {
      name: 'Purpose-built PM workflows',
      openpmkit: 'yes',
      competitor: 'no',
      note: '10+ workflows designed specifically for product managers',
    },
    {
      name: 'Daily brief generation',
      openpmkit: 'yes',
      competitor: 'no',
      note: 'Scheduled briefs synthesizing 5+ tools',
    },
    {
      name: 'PRD drafting with evidence',
      openpmkit: 'yes',
      competitor: 'partial',
      note: 'Notion AI can help write; openpmkit cites real customer data',
    },
    {
      name: 'VoC clustering',
      openpmkit: 'yes',
      competitor: 'no',
      note: 'Automatic theme clustering from customer feedback',
    },
    {
      name: 'Jira integration',
      openpmkit: 'yes',
      competitor: 'partial',
      note: 'pmkit proposes Jira tickets; Notion syncs boards',
    },
    {
      name: 'Slack integration',
      openpmkit: 'yes',
      competitor: 'partial',
    },
    {
      name: 'Gong/call integration',
      openpmkit: 'yes',
      competitor: 'no',
      note: 'Pull insights from call transcripts',
    },
    {
      name: 'Draft-only governance',
      openpmkit: 'yes',
      competitor: 'no',
      note: 'All external writes require approval',
    },
    {
      name: 'Full audit trail',
      openpmkit: 'yes',
      competitor: 'partial',
    },
    {
      name: 'General-purpose workspace',
      openpmkit: 'no',
      competitor: 'yes',
      note: 'Notion excels as docs/wiki/notes platform',
    },
    {
      name: 'Database/wiki features',
      openpmkit: 'no',
      competitor: 'yes',
    },
    {
      name: 'AI writing assistant',
      openpmkit: 'partial',
      competitor: 'yes',
      note: 'Notion AI helps with general writing tasks',
    },
    {
      name: 'AI summarization',
      openpmkit: 'yes',
      competitor: 'yes',
    },
    {
      name: 'Workflow chaining',
      openpmkit: 'yes',
      competitor: 'no',
      note: 'VoC → PRD → Jira → Sprint in one flow',
    },
    {
      name: 'Source citations',
      openpmkit: 'yes',
      competitor: 'no',
    },
  ],

  sections: [
    {
      title: 'Approach to AI',
      description:
        'Notion AI adds AI capabilities to a general-purpose workspace. openpmkit is purpose-built for PM workflows from the ground up.',
      pmkitAdvantage:
        '10+ workflows specifically designed for product managers: daily briefs, PRDs, VoC clustering, competitor research, sprint reviews. Each workflow pulls from your connected tools and produces traceable artifacts.',
      competitorAdvantage:
        'AI-enhanced writing and summarization across your entire workspace. Works for any team, any use case. Excellent for documentation and wikis.',
    },
    {
      title: 'Data Integration',
      description:
        'Where does the AI get its context? Notion AI works within Notion. openpmkit pulls from your actual PM tools.',
      pmkitAdvantage:
        'Deep integrations with Jira, Slack, Gong, Zendesk, Confluence. Daily briefs synthesize updates from 5+ tools. PRDs cite actual customer conversations.',
      competitorAdvantage:
        'Works with data already in Notion. Syncs with some external tools. Great if your documentation is centralized in Notion.',
    },
    {
      title: 'Governance & Control',
      description:
        'Enterprise teams need controls over AI-generated content, especially for external writes.',
      pmkitAdvantage:
        'Draft-only pattern: all Jira writes, Slack posts, and external actions are proposals for human review. Full audit trail for compliance.',
      competitorAdvantage:
        'Notion\'s existing permissions model. AI assists within the workspace where you already have access controls.',
    },
    {
      title: 'Specialization vs Flexibility',
      description:
        'Choose between a PM-specific tool or a flexible all-purpose workspace.',
      pmkitAdvantage:
        'Every feature is designed for product management. No configuration needed—workflows understand PM context, terminology, and deliverables out of the box.',
      competitorAdvantage:
        'Flexible for any team or use case. Can be customized for PM work but also serves engineering, design, marketing, and company-wide documentation.',
    },
    {
      title: 'Best Use Case',
      description:
        'Choose based on whether you need PM-specific automation or general-purpose AI workspace.',
      pmkitAdvantage:
        'Teams who want AI to automate daily PM work: synthesizing updates, drafting PRDs, clustering feedback, preparing meetings—with full traceability.',
      competitorAdvantage:
        'Teams who want AI assistance across their workspace: writing help, summarization, Q&A over docs—for the whole organization.',
    },
  ],

  faqs: [
    {
      question: 'Can I use openpmkit and Notion together?',
      answer:
        'Yes. Many teams use Notion for documentation and wikis while using openpmkit for automated PM workflows. openopenpmkit generates artifacts (PRDs, briefs, reports) that you can export or reference in Notion.',
    },
    {
      question: 'What\'s the main difference between openpmkit and Notion AI?',
      answer:
        'Notion AI is a general-purpose AI assistant that enhances your workspace. openpmkit is purpose-built for PM workflows—it pulls data from Jira, Slack, Gong, and other tools to automate daily briefs, PRD drafting, VoC analysis, and more.',
    },
    {
      question: 'Can Notion AI generate daily briefs like pmkit?',
      answer:
        'Not in the same way. Notion AI can summarize documents in Notion. openpmkit automatically pulls overnight updates from Slack, Jira, Zendesk, and other tools, then synthesizes them into a daily brief delivered to your inbox.',
    },
    {
      question: 'Which is better for PRDs?',
      answer:
        'Notion AI can help write PRD content based on your prompts. openopenpmkit PRDs cite actual customer evidence—specific Slack messages, support tickets, Gong calls—making them defensible in stakeholder reviews.',
    },
    {
      question: 'Does openpmkit replace Notion?',
      answer:
        'No. They serve different purposes. Notion is a workspace for documentation and collaboration. openpmkit is an AI workflow engine for PM tasks. Many teams use both: openpmkit for automation, Notion for documentation.',
    },
    {
      question: 'What about pricing?',
      answer:
        'Notion AI is an add-on to Notion ($10/member/month as of 2026). openpmkit uses usage-based pricing where you pay for workflows run, not users added. Check both products\' current pricing pages for the latest details.',
    },
  ],
};

// ============================================================================
// Page Component
// ============================================================================

export default function NotionAIComparisonPage() {
  return <ComparisonPage data={comparisonData} />;
}
