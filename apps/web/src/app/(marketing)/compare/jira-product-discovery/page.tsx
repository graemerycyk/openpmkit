import type { Metadata } from 'next';
import { ComparisonPage, type ComparisonPageData } from '@/components/comparison-page';
import { siteConfig } from '@/lib/utils';

// ============================================================================
// SEO Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'openpmkit vs Jira Product Discovery (2026): Complete Comparison Guide',
  description:
    'Compare openpmkit and Atlassian Jira Product Discovery (JPD). See feature comparison, pricing, and which product management tool is right for your team. Updated for 2026.',
  keywords: [
    'openpmkit vs jira product discovery',
    'jira product discovery alternative',
    'JPD alternative',
    'atlassian product discovery comparison',
    'product prioritization tools',
    'jira product management',
  ],
  openGraph: {
    title: 'openpmkit vs Jira Product Discovery: Which PM Tool is Right for You?',
    description:
      'Detailed comparison of openpmkit and JPD. AI synthesis vs manual prioritization for product management.',
    type: 'article',
    url: `${siteConfig.url}/compare/jira-product-discovery`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'openpmkit vs Jira Product Discovery Comparison',
    description: 'Complete comparison guide for product management tools.',
  },
  alternates: {
    canonical: `${siteConfig.url}/compare/jira-product-discovery`,
  },
};

// ============================================================================
// Page Data
// ============================================================================

const comparisonData: ComparisonPageData = {
  competitor: {
    name: 'Jira Product Discovery',
    tagline: 'Atlassian\'s prioritization tool',
    website: 'https://www.atlassian.com/software/jira/product-discovery',
  },

  headline: 'openpmkit vs Jira Product Discovery: Which PM Tool is Right for You?',
  subheadline:
    'Jira Product Discovery (JPD) helps prioritize ideas within the Atlassian ecosystem. openpmkit synthesizes customer evidence, drafts artifacts, and proposes Jira tickets with human approval. Here\'s how they compare.',

  verdict: {
    summary:
      'JPD excels at prioritizing ideas with native Jira integration. openpmkit excels at AI-powered synthesis of customer evidence into actionable artifacts that chain into Jira delivery.',
    openpmkitBestFor:
      'You need AI to synthesize customer feedback into insights, draft artifacts, and propose Jira tickets—with governance and approval workflows.',
    competitorBestFor:
      'You need a prioritization and discovery board tightly integrated with Jira delivery, with manual idea management.',
  },

  features: [
    {
      name: 'AI synthesis of customer feedback',
      openpmkit: 'yes',
      competitor: 'no',
      note: 'pmkit clusters VoC feedback into themes automatically',
    },
    {
      name: 'Daily brief generation',
      openpmkit: 'yes',
      competitor: 'no',
      note: 'Synthesizes updates from 5+ tools automatically',
    },
    {
      name: 'PRD drafting with evidence',
      openpmkit: 'yes',
      competitor: 'no',
    },
    {
      name: 'Workflow chaining',
      openpmkit: 'yes',
      competitor: 'no',
      note: 'VoC → PRD → Jira epics in one flow',
    },
    {
      name: 'Draft-only Jira writes',
      openpmkit: 'yes',
      competitor: 'no',
      note: 'All Jira writes are proposals for review',
    },
    {
      name: 'Native Jira integration',
      openpmkit: 'yes',
      competitor: 'yes',
      note: 'Both integrate with Jira; JPD is native Atlassian',
    },
    {
      name: 'Idea prioritization matrix',
      openpmkit: 'no',
      competitor: 'yes',
    },
    {
      name: 'Delivery board features',
      openpmkit: 'no',
      competitor: 'yes',
    },
    {
      name: 'Impact/effort scoring',
      openpmkit: 'no',
      competitor: 'yes',
    },
    {
      name: 'Stakeholder voting',
      openpmkit: 'no',
      competitor: 'yes',
    },
    {
      name: 'Competitor research automation',
      openpmkit: 'yes',
      competitor: 'no',
      note: 'Scheduled competitor monitoring',
    },
    {
      name: 'Sprint review generation',
      openpmkit: 'yes',
      competitor: 'no',
    },
    {
      name: 'Release notes automation',
      openpmkit: 'yes',
      competitor: 'no',
    },
    {
      name: 'Full audit trail',
      openpmkit: 'yes',
      competitor: 'partial',
    },
  ],

  sections: [
    {
      title: 'Approach to Product Discovery',
      description:
        'JPD helps you prioritize ideas you already have. openpmkit finds the ideas by synthesizing customer feedback you don\'t have time to read.',
      pmkitAdvantage:
        'AI clusters VoC feedback into themes automatically. Daily briefs synthesize updates from 5+ tools. Competitor research runs on schedule without manual work.',
      competitorAdvantage:
        'Deeply integrated with Jira ecosystem. Teams already using Jira have lower adoption friction. Native impact/effort scoring.',
    },
    {
      title: 'Workflow to Delivery',
      description:
        'Both tools help get from ideas to shipped features, but with different approaches.',
      pmkitAdvantage:
        'VoC themes → PRD → Jira epics in one flow. Sprint reviews generate release notes automatically. Context carries through the entire chain.',
      competitorAdvantage:
        'Native Jira integration with delivery board features built-in. Ideas flow directly to Jira issues without leaving Atlassian.',
    },
    {
      title: 'Governance & Control',
      description:
        'When AI creates Jira tickets, you want a review step. When humans create tickets, direct manipulation is fine.',
      pmkitAdvantage:
        'All Jira writes are proposals for human review. Full audit trail of what was proposed and why. No accidental ticket creation or updates.',
      competitorAdvantage:
        'Direct manipulation of ideas and priorities. Faster for quick prioritization changes without approval overhead.',
    },
    {
      title: 'AI Capabilities',
      description:
        'openpmkit is built around AI synthesis; JPD is built around manual prioritization with some AI features.',
      pmkitAdvantage:
        'Every workflow is AI-powered: VoC clustering, PRD drafting, competitor research, daily briefs. AI does the synthesis work while humans make decisions.',
      competitorAdvantage:
        'Atlassian Intelligence features are available. Focus on manual workflows means more control over outputs.',
    },
    {
      title: 'Best Use Case',
      description:
        'Choose based on whether you need AI synthesis or manual prioritization.',
      pmkitAdvantage:
        'Teams drowning in customer feedback, support tickets, and Slack noise who want AI to synthesize and draft artifacts automatically.',
      competitorAdvantage:
        'Teams who want a visual prioritization board integrated with Jira delivery, with manual control over idea management.',
    },
  ],

  faqs: [
    {
      question: 'Can openpmkit and Jira Product Discovery work together?',
      answer:
        'Yes. They serve different purposes. Use JPD for prioritization and the visual discovery board. Use openpmkit for AI synthesis, PRD drafting, and automated workflows. openpmkit can propose Jira epics that flow into your JPD-managed backlog.',
    },
    {
      question: 'What\'s the main difference between openpmkit and JPD?',
      answer:
        'JPD helps you prioritize ideas you already have with manual workflows. openpmkit uses AI to find ideas by synthesizing customer feedback, support tickets, and call transcripts, then drafts artifacts and proposes Jira tickets.',
    },
    {
      question: 'Does openpmkit replace Jira?',
      answer:
        'No. openpmkit integrates with Jira. It proposes Jira epics and stories based on synthesized customer evidence. You approve the proposals, then the tickets are created in your Jira instance. openpmkit enhances Jira, not replaces it.',
    },
    {
      question: 'Is JPD free for Jira users?',
      answer:
        'Jira Product Discovery has its own pricing, typically included in certain Jira plans or available as an add-on. Check Atlassian\'s current pricing for the latest details.',
    },
    {
      question: 'Which has better Atlassian integration?',
      answer:
        'JPD is native Atlassian and has deeper integration with the Atlassian ecosystem. openpmkit integrates with Jira via APIs and can propose tickets, but it\'s not an Atlassian product.',
    },
    {
      question: 'Can openpmkit help with prioritization?',
      answer:
        'pmkit surfaces customer evidence that informs prioritization decisions, but it doesn\'t have a visual prioritization matrix like JPD. Use openpmkit to synthesize evidence, then make prioritization decisions in JPD or your preferred tool.',
    },
  ],
};

// ============================================================================
// Page Component
// ============================================================================

export default function JiraProductDiscoveryComparisonPage() {
  return <ComparisonPage data={comparisonData} />;
}
