import type { Metadata } from 'next';
import { ComparisonPage, type ComparisonPageData } from '@/components/comparison-page';
import { siteConfig } from '@/lib/utils';

// ============================================================================
// SEO Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'pmkit vs Aha! (2026): Complete Comparison Guide',
  description:
    'Compare pmkit and Aha! for product management. See feature comparison, pricing, and which roadmap tool is right for your team. Updated for 2026.',
  keywords: [
    'pmkit vs aha',
    'aha alternative',
    'aha roadmap software comparison',
    'product roadmap tools',
    'AI product management vs roadmap software',
    'aha product management',
  ],
  openGraph: {
    title: 'pmkit vs Aha!: Which PM Tool is Right for You?',
    description:
      'Detailed comparison of pmkit and Aha!. AI workflow automation vs comprehensive roadmap software.',
    type: 'article',
    url: `${siteConfig.url}/compare/aha`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'pmkit vs Aha! Comparison',
    description: 'Complete comparison guide for product management tools.',
  },
  alternates: {
    canonical: `${siteConfig.url}/compare/aha`,
  },
};

// ============================================================================
// Page Data
// ============================================================================

const comparisonData: ComparisonPageData = {
  competitor: {
    name: 'Aha!',
    tagline: 'Product roadmap software',
    website: 'https://www.aha.io',
  },

  headline: 'pmkit vs Aha!: Which PM Tool is Right for You?',
  subheadline:
    'Aha! is comprehensive product roadmap software with strategy, roadmaps, and idea management. pmkit is an AI workflow engine that automates PM tasks. Here\'s how they compare.',

  verdict: {
    summary:
      'Aha! excels as comprehensive roadmap software for strategic planning and portfolio management. pmkit excels at AI-powered automation of daily PM workflows with traceable artifacts.',
    pmkitBestFor:
      'You need AI to automate daily PM work: synthesizing feedback, drafting PRDs, generating briefs—all from your existing tools.',
    competitorBestFor:
      'You need comprehensive roadmap software with strategy planning, portfolio management, and stakeholder communication.',
  },

  features: [
    {
      name: 'Product roadmap builder',
      pmkit: 'no',
      competitor: 'yes',
      note: 'Aha! is known for visual roadmaps',
    },
    {
      name: 'Strategy planning',
      pmkit: 'no',
      competitor: 'yes',
    },
    {
      name: 'Portfolio management',
      pmkit: 'no',
      competitor: 'yes',
    },
    {
      name: 'Idea management portal',
      pmkit: 'no',
      competitor: 'yes',
    },
    {
      name: 'AI daily brief generation',
      pmkit: 'yes',
      competitor: 'no',
      note: 'Scheduled briefs synthesizing 5+ tools',
    },
    {
      name: 'PRD drafting with evidence',
      pmkit: 'yes',
      competitor: 'partial',
      note: 'Aha! has templates; pmkit cites customer data',
    },
    {
      name: 'VoC clustering',
      pmkit: 'yes',
      competitor: 'partial',
      note: 'Aha! Ideas captures feedback; pmkit clusters automatically',
    },
    {
      name: 'Competitor research automation',
      pmkit: 'yes',
      competitor: 'partial',
    },
    {
      name: 'Sprint review generation',
      pmkit: 'yes',
      competitor: 'no',
    },
    {
      name: 'Release notes automation',
      pmkit: 'yes',
      competitor: 'partial',
    },
    {
      name: 'Jira integration',
      pmkit: 'yes',
      competitor: 'yes',
    },
    {
      name: 'Slack integration',
      pmkit: 'yes',
      competitor: 'yes',
    },
    {
      name: 'Gong/call integration',
      pmkit: 'yes',
      competitor: 'no',
    },
    {
      name: 'Draft-only governance',
      pmkit: 'yes',
      competitor: 'no',
    },
    {
      name: 'Full audit trail',
      pmkit: 'yes',
      competitor: 'partial',
    },
    {
      name: 'Workflow chaining',
      pmkit: 'yes',
      competitor: 'no',
    },
    {
      name: 'Whiteboard/diagrams',
      pmkit: 'no',
      competitor: 'yes',
    },
  ],

  sections: [
    {
      title: 'Core Purpose',
      description:
        'Aha! is comprehensive PM software for roadmaps and strategy. pmkit is an AI engine for automating PM workflows.',
      pmkitAdvantage:
        'AI handles the grunt work: synthesizing customer feedback, drafting PRDs, preparing meetings. You focus on decisions, not document creation.',
      competitorAdvantage:
        'Complete product management suite: strategy → roadmap → release. Visual tools for communicating plans to stakeholders.',
    },
    {
      title: 'Roadmap & Strategy',
      description:
        'Aha! is built around visual roadmaps. pmkit doesn\'t compete here.',
      pmkitAdvantage:
        'pmkit focuses on synthesis and automation. Use it to generate the evidence and artifacts that inform your roadmap decisions.',
      competitorAdvantage:
        'Industry-leading roadmap visualization. Multiple views (timeline, Kanban, list). Strategic planning hierarchy from goals to features.',
    },
    {
      title: 'AI Capabilities',
      description:
        'How each tool leverages AI for product management.',
      pmkitAdvantage:
        'Every workflow is AI-powered: daily briefs synthesize 5+ tools, PRDs cite customer evidence, VoC clustering finds themes. Runs autonomously on schedule.',
      competitorAdvantage:
        'Aha! has AI features for writing and analysis within the platform. AI assists with content creation in the context of your roadmap.',
    },
    {
      title: 'Customer Evidence',
      description:
        'Both tools help capture customer feedback, but with different approaches.',
      pmkitAdvantage:
        'Pulls data from Slack, Gong, Zendesk, and other tools where customer conversations happen. PRDs cite specific messages and calls.',
      competitorAdvantage:
        'Aha! Ideas provides a portal for capturing and voting on customer feedback. Good for structured feedback collection.',
    },
    {
      title: 'Best Use Case',
      description:
        'Choose based on your primary need.',
      pmkitAdvantage:
        'Teams who want AI to automate daily PM work: no more manual synthesis of Slack, support tickets, and call notes.',
      competitorAdvantage:
        'Teams who need comprehensive roadmap software with strategy alignment, portfolio views, and stakeholder communication.',
    },
  ],

  faqs: [
    {
      question: 'Can pmkit and Aha! work together?',
      answer:
        'Yes. They serve different purposes. Use Aha! for strategic roadmapping and stakeholder communication. Use pmkit for AI-powered synthesis and artifact generation. pmkit can generate evidence that informs your Aha! roadmap decisions.',
    },
    {
      question: 'Does pmkit have roadmap features?',
      answer:
        'No. pmkit focuses on AI-powered workflows for synthesis and artifact creation. For visual roadmaps and strategy planning, Aha! or similar tools are better suited.',
    },
    {
      question: 'What\'s the main difference?',
      answer:
        'Aha! is comprehensive PM software centered on roadmaps and strategy. pmkit is an AI workflow engine that automates daily PM tasks like synthesizing feedback, drafting PRDs, and generating briefs.',
    },
    {
      question: 'Which is better for PRDs?',
      answer:
        'Aha! provides PRD templates and document management. pmkit generates PRDs that cite actual customer evidence—specific Slack messages, support tickets, Gong calls—making them defensible in reviews.',
    },
    {
      question: 'How does pricing compare?',
      answer:
        'Aha! uses per-user pricing (typically $59-149/user/month depending on tier). pmkit uses usage-based pricing where you pay for workflows run. For large teams, pmkit can be more cost-effective.',
    },
    {
      question: 'Does Aha! have AI like pmkit?',
      answer:
        'Aha! has AI features for writing and analysis. pmkit\'s AI runs complete workflows autonomously: daily briefs appear in your inbox, PRDs are drafted with citations, VoC reports cluster themes—all on schedule.',
    },
  ],
};

// ============================================================================
// Page Component
// ============================================================================

export default function AhaComparisonPage() {
  return <ComparisonPage data={comparisonData} />;
}
