import type { Metadata } from 'next';
import { ComparisonPage, type ComparisonPageData } from '@/components/comparison-page';
import { siteConfig } from '@/lib/utils';

// ============================================================================
// SEO Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'openpmkit vs Productboard (2026): Complete Comparison Guide',
  description:
    'Compare openpmkit and Productboard for product management. See feature comparison, pricing, use cases, and which tool is right for your team. Updated for 2026.',
  keywords: [
    'openpmkit vs productboard',
    'productboard alternative',
    'productboard comparison',
    'AI product management tool',
    'product management software comparison',
    'best productboard alternative 2026',
  ],
  openGraph: {
    title: 'openpmkit vs Productboard: Which PM Tool is Right for You?',
    description:
      'Detailed comparison of openpmkit and Productboard. Feature comparison, pricing, and honest recommendations.',
    type: 'article',
    url: `${siteConfig.url}/compare/productboard`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'openpmkit vs Productboard Comparison',
    description: 'Complete comparison guide for product management tools.',
  },
  alternates: {
    canonical: `${siteConfig.url}/compare/productboard`,
  },
};

// ============================================================================
// Page Data
// ============================================================================

const comparisonData: ComparisonPageData = {
  competitor: {
    name: 'Productboard',
    tagline: 'Product management platform',
    website: 'https://productboard.com',
  },

  headline: 'openpmkit vs Productboard: Which AI PM Tool is Right for You?',
  subheadline:
    'Productboard is a product management platform for collecting feedback and building roadmaps. openpmkit is an AI agent that automates PM workflows using your existing tools. Here\'s how they compare.',

  verdict: {
    summary:
      'Productboard excels as a centralized platform for feedback collection and roadmap visualization. openpmkit excels at automating repetitive PM workflows with AI while working with your existing tools.',
    openpmkitBestFor:
      'You want AI to automate daily briefs, PRD drafting, VoC clustering, and other PM workflows—without migrating to a new platform.',
    competitorBestFor:
      'You need a centralized product management platform with customer portals, feature voting, and visual roadmap tools.',
  },

  features: [
    {
      name: 'AI-powered workflow automation',
      openpmkit: 'yes',
      competitor: 'partial',
      note: 'pmkit runs complete workflows automatically; Productboard has AI features but requires manual triggering',
    },
    {
      name: 'Daily brief generation',
      openpmkit: 'yes',
      competitor: 'no',
    },
    {
      name: 'PRD drafting with citations',
      openpmkit: 'yes',
      competitor: 'no',
      note: 'openpmkit PRDs cite actual customer evidence',
    },
    {
      name: 'VoC clustering & analysis',
      openpmkit: 'yes',
      competitor: 'yes',
    },
    {
      name: 'Customer feedback portal',
      openpmkit: 'no',
      competitor: 'yes',
    },
    {
      name: 'Visual roadmap builder',
      openpmkit: 'no',
      competitor: 'yes',
    },
    {
      name: 'Feature voting/prioritization',
      openpmkit: 'no',
      competitor: 'yes',
    },
    {
      name: 'Works with existing tools (Jira, Slack)',
      openpmkit: 'yes',
      competitor: 'partial',
      note: 'openpmkit synthesizes from your tools; Productboard requires data import',
    },
    {
      name: 'Draft-only governance',
      openpmkit: 'yes',
      competitor: 'no',
      note: 'All AI outputs require human approval before publishing',
    },
    {
      name: 'Full audit trail',
      openpmkit: 'yes',
      competitor: 'partial',
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
      name: 'Meeting prep packs',
      openpmkit: 'yes',
      competitor: 'no',
    },
    {
      name: 'Competitive research tracking',
      openpmkit: 'yes',
      competitor: 'no',
    },
    {
      name: 'PRD to prototype conversion',
      openpmkit: 'yes',
      competitor: 'no',
    },
  ],

  sections: [
    {
      title: 'Approach to Product Management',
      description:
        'Productboard is a platform where you centralize all product data—feedback, ideas, roadmaps. openpmkit is an AI agent that works with your existing tools and automates workflows without requiring data migration.',
      pmkitAdvantage:
        'No platform migration required. openpmkit connects to Jira, Slack, Gong, Zendesk and synthesizes insights from tools your team already uses.',
      competitorAdvantage:
        'Single source of truth for all product data. Clean interface for stakeholders to view roadmaps and submit feedback.',
    },
    {
      title: 'AI Capabilities',
      description:
        'Both tools leverage AI, but in different ways. Productboard uses AI to help categorize feedback and suggest insights. openpmkit uses AI to run complete workflows autonomously.',
      pmkitAdvantage:
        'Fully automated workflows: daily briefs appear in your inbox, PRDs are drafted with citations, VoC reports cluster themes automatically—all on schedule.',
      competitorAdvantage:
        'AI assists within the platform interface. Good for teams who prefer AI as a helper rather than an autonomous agent.',
    },
    {
      title: 'Governance & Control',
      description:
        'Enterprise teams need control over what AI produces. openpmkit uses a "draft-only" pattern where all outputs are proposals for human review.',
      pmkitAdvantage:
        'Every AI output is a draft that requires approval. Full audit trail of every decision. RBAC controls who can approve artifacts.',
      competitorAdvantage:
        'Traditional permission model. You control who can edit roadmaps and publish changes.',
    },
    {
      title: 'Pricing Model',
      description:
        'Productboard uses per-seat pricing that scales with team size. openpmkit uses usage-based pricing aligned with value delivered.',
      pmkitAdvantage:
        'Pay for workflows run, not users added. Add your whole team without multiplying costs. No per-seat fees.',
      competitorAdvantage:
        'Predictable per-seat pricing. Established procurement patterns that finance teams understand.',
    },
    {
      title: 'Best Use Case',
      description:
        'Choose based on your primary need: platform for product data vs. automation of PM workflows.',
      pmkitAdvantage:
        'Teams drowning in Slack noise, customer calls, and support tickets who want AI to synthesize and draft artifacts automatically.',
      competitorAdvantage:
        'Teams who want a dedicated product management platform with customer-facing portals and visual roadmap tools.',
    },
  ],

  faqs: [
    {
      question: 'Is openpmkit a replacement for Productboard?',
      answer:
        'Not necessarily. openpmkit and Productboard solve different problems. Productboard is a platform for centralizing product data and building roadmaps. openpmkit is an AI agent that automates PM workflows. Many teams use both: Productboard for roadmap visualization and stakeholder portals, openpmkit for automated daily briefs, PRD drafting, and VoC analysis.',
    },
    {
      question: 'Can I use openpmkit and Productboard together?',
      answer:
        'Yes. openpmkit can synthesize data from your tools and generate artifacts that you then publish to Productboard. For example, openpmkit can draft a PRD based on customer evidence, which you then review and add to Productboard as a feature specification.',
    },
    {
      question: 'What\'s the main difference between openpmkit and Productboard?',
      answer:
        'The main difference is approach: Productboard is a platform you work within, while openpmkit is an AI agent that works with your existing tools. Productboard requires you to centralize data in their system. openpmkit connects to Jira, Slack, Gong, and other tools you already use and automates workflows from there.',
    },
    {
      question: 'Which is better for enterprise teams?',
      answer:
        'Both serve enterprise teams but in different ways. Productboard offers a mature platform with established enterprise features. openpmkit offers AI automation with draft-only governance, RBAC, and full audit trails. Enterprise teams often use both for different purposes.',
    },
    {
      question: 'Does Productboard have AI features?',
      answer:
        'Yes, Productboard has added AI features for feedback categorization and insight generation. However, these are assistant-style features within the platform. pmkit\'s AI runs complete workflows autonomously—generating daily briefs, drafting PRDs, clustering VoC themes—on schedule without manual triggering.',
    },
    {
      question: 'What about pricing?',
      answer:
        'Productboard uses per-seat pricing (typically $20-80/user/month depending on tier). openpmkit uses usage-based pricing where you pay for workflows run, not users added. This makes openpmkit more cost-effective for large teams who want to give everyone access without multiplying seat costs.',
    },
  ],
};

// ============================================================================
// Page Component
// ============================================================================

export default function ProductboardComparisonPage() {
  return <ComparisonPage data={comparisonData} />;
}
