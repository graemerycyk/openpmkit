import type { Metadata } from 'next';
import { ComparisonPage, type ComparisonPageData } from '@/components/comparison-page';
import { siteConfig } from '@/lib/utils';

// ============================================================================
// SEO Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'openpmkit vs Linear (2026): Complete Comparison Guide',
  description:
    'Compare openpmkit and Linear for product management. See feature comparison, pricing, and which tool is right for your team. Updated for 2026.',
  keywords: [
    'openpmkit vs linear',
    'linear alternative',
    'linear ai features',
    'modern jira alternative',
    'issue tracking vs PM automation',
    'linear for product managers',
  ],
  openGraph: {
    title: 'openpmkit vs Linear: Which PM Tool is Right for You?',
    description:
      'Detailed comparison of openpmkit and Linear. PM workflow automation vs modern issue tracking.',
    type: 'article',
    url: `${siteConfig.url}/compare/linear`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'openpmkit vs Linear Comparison',
    description: 'Complete comparison guide for product management tools.',
  },
  alternates: {
    canonical: `${siteConfig.url}/compare/linear`,
  },
};

// ============================================================================
// Page Data
// ============================================================================

const comparisonData: ComparisonPageData = {
  competitor: {
    name: 'Linear',
    tagline: 'Modern issue tracking',
    website: 'https://linear.app',
  },

  headline: 'openpmkit vs Linear: Which PM Tool is Right for You?',
  subheadline:
    'Linear is a modern issue tracking tool that streamlines development workflows. openpmkit is an AI workflow engine that automates PM tasks. Here\'s how they compare.',

  verdict: {
    summary:
      'Linear excels at fast, modern issue tracking for development teams. openpmkit excels at AI-powered PM workflows that synthesize data and produce artifacts.',
    openpmkitBestFor:
      'You need AI to automate PM workflows: daily briefs, PRDs, VoC clustering—all synthesizing data from your existing tools.',
    competitorBestFor:
      'You need fast, modern issue tracking for your development team with excellent UX and keyboard shortcuts.',
  },

  features: [
    {
      name: 'Issue tracking',
      openpmkit: 'no',
      competitor: 'yes',
      note: 'Linear is purpose-built for issue tracking',
    },
    {
      name: 'Sprint/cycle management',
      openpmkit: 'no',
      competitor: 'yes',
    },
    {
      name: 'Roadmap visualization',
      openpmkit: 'no',
      competitor: 'yes',
    },
    {
      name: 'AI daily brief generation',
      openpmkit: 'yes',
      competitor: 'no',
      note: 'Scheduled briefs synthesizing 5+ tools',
    },
    {
      name: 'PRD drafting with evidence',
      openpmkit: 'yes',
      competitor: 'no',
    },
    {
      name: 'VoC clustering',
      openpmkit: 'yes',
      competitor: 'no',
    },
    {
      name: 'Competitor research automation',
      openpmkit: 'yes',
      competitor: 'no',
    },
    {
      name: 'Sprint review generation',
      openpmkit: 'yes',
      competitor: 'no',
      note: 'Auto-generate from completed work',
    },
    {
      name: 'Release notes automation',
      openpmkit: 'yes',
      competitor: 'partial',
      note: 'Linear has release management; openpmkit generates notes',
    },
    {
      name: 'Slack integration',
      openpmkit: 'yes',
      competitor: 'yes',
    },
    {
      name: 'GitHub integration',
      openpmkit: 'partial',
      competitor: 'yes',
      note: 'Linear has deep GitHub integration',
    },
    {
      name: 'Jira integration',
      openpmkit: 'yes',
      competitor: 'partial',
    },
    {
      name: 'Gong/call integration',
      openpmkit: 'yes',
      competitor: 'no',
    },
    {
      name: 'Draft-only governance',
      openpmkit: 'yes',
      competitor: 'no',
    },
    {
      name: 'Full audit trail',
      openpmkit: 'yes',
      competitor: 'partial',
    },
    {
      name: 'Workflow chaining',
      openpmkit: 'yes',
      competitor: 'no',
    },
  ],

  sections: [
    {
      title: 'Core Purpose',
      description:
        'Linear is an issue tracker for development teams. openpmkit is an AI workflow engine for product managers.',
      pmkitAdvantage:
        'Purpose-built for PM workflows: synthesizing customer feedback, drafting PRDs, preparing meetings, generating sprint reviews. AI does the grunt work.',
      competitorAdvantage:
        'Best-in-class issue tracking with fast UX, keyboard shortcuts, and cycles. Loved by engineering teams for its speed and simplicity.',
    },
    {
      title: 'AI Capabilities',
      description:
        'Both tools leverage AI, but for different purposes.',
      pmkitAdvantage:
        'Every workflow is AI-powered: daily briefs synthesize 5+ tools, PRDs cite customer evidence, VoC clustering finds themes automatically. AI runs complete workflows.',
      competitorAdvantage:
        'Linear has AI features for writing issue descriptions and suggesting labels. AI assists within the issue tracking context.',
    },
    {
      title: 'Data Integration',
      description:
        'Where does each tool pull data from to help PMs?',
      pmkitAdvantage:
        'Deep integrations with Slack, Gong, Zendesk, Confluence, Jira. Synthesizes customer conversations, support tickets, and call transcripts into actionable insights.',
      competitorAdvantage:
        'Strong integrations with GitHub, Slack, Figma, and development tools. Built for the engineering workflow.',
    },
    {
      title: 'Team Focus',
      description:
        'Linear is engineering-focused. openpmkit is PM-focused.',
      pmkitAdvantage:
        'Every feature designed for product managers: understanding customer needs, writing specs, preparing meetings, tracking competitive landscape.',
      competitorAdvantage:
        'Built for developers first, with PM features added. Excellent for teams where engineering drives the workflow.',
    },
    {
      title: 'Best Use Case',
      description:
        'Choose based on what problem you\'re solving.',
      pmkitAdvantage:
        'PMs drowning in Slack noise, customer calls, and support tickets who want AI to synthesize and draft artifacts automatically.',
      competitorAdvantage:
        'Development teams who want fast, modern issue tracking that stays out of their way.',
    },
  ],

  faqs: [
    {
      question: 'Does openpmkit replace Linear?',
      answer:
        'No. They solve different problems. Linear is for issue tracking and sprint management. openpmkit is for AI-powered PM workflows. Many teams use Linear for engineering work and openpmkit for PM automation—they complement each other.',
    },
    {
      question: 'Can openpmkit integrate with Linear?',
      answer:
        'pmkit currently integrates with Jira for issue tracking. Linear integration is on the roadmap. For now, openpmkit can synthesize data from Slack and other tools that both teams use.',
    },
    {
      question: 'Which is better for product managers?',
      answer:
        'It depends on the task. Linear is better for tracking issues and managing sprints. openpmkit is better for synthesizing customer feedback, drafting PRDs, and automating daily workflows. Many PMs use both.',
    },
    {
      question: 'Does Linear have AI features like pmkit?',
      answer:
        'Linear has AI features for writing and suggesting within issues. pmkit\'s AI runs complete workflows: synthesizing data from multiple tools, drafting full documents, clustering feedback into themes.',
    },
    {
      question: 'What about sprint reviews?',
      answer:
        'Linear helps you track what was done in a cycle. openpmkit automatically generates sprint review documents that summarize completed work, highlight blockers, and draft release notes.',
    },
    {
      question: 'How do pricing models compare?',
      answer:
        'Linear uses per-seat pricing. openpmkit uses usage-based pricing where you pay for workflows run. For large teams, openpmkit can be more cost-effective since you don\'t multiply by seats.',
    },
  ],
};

// ============================================================================
// Page Component
// ============================================================================

export default function LinearComparisonPage() {
  return <ComparisonPage data={comparisonData} />;
}
