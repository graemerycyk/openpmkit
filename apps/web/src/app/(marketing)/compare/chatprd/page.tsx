import type { Metadata } from 'next';
import { ComparisonPage, type ComparisonPageData } from '@/components/comparison-page';
import { siteConfig } from '@/lib/utils';

// ============================================================================
// SEO Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'pmkit vs ChatPRD (2026): Complete Comparison Guide',
  description:
    'Compare pmkit and ChatPRD for AI-powered PRD writing. See feature comparison, pricing, and which AI PRD generator is right for your team. Updated for 2026.',
  keywords: [
    'pmkit vs chatprd',
    'chatprd alternative',
    'AI PRD generator comparison',
    'best AI PRD tool',
    'product requirements document AI',
    'AI PRD writing assistant',
  ],
  openGraph: {
    title: 'pmkit vs ChatPRD: Which AI PRD Tool is Right for You?',
    description:
      'Detailed comparison of pmkit and ChatPRD. Feature comparison, evidence grounding, and honest recommendations.',
    type: 'article',
    url: `${siteConfig.url}/compare/chatprd`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'pmkit vs ChatPRD Comparison',
    description: 'Complete comparison guide for AI PRD tools.',
  },
  alternates: {
    canonical: `${siteConfig.url}/compare/chatprd`,
  },
};

// ============================================================================
// Page Data
// ============================================================================

const comparisonData: ComparisonPageData = {
  competitor: {
    name: 'ChatPRD',
    tagline: 'AI PRD writing assistant',
    website: 'https://chatprd.ai',
  },

  headline: 'pmkit vs ChatPRD: Which AI PRD Tool is Right for You?',
  subheadline:
    'ChatPRD generates PRDs from prompts using AI. pmkit generates PRDs grounded in actual customer evidence, with full traceability and workflow chaining. Here\'s how they compare.',

  verdict: {
    summary:
      'ChatPRD excels at quickly generating PRD drafts from prompts. pmkit excels at creating evidence-grounded PRDs that cite real customer feedback and chain into delivery workflows.',
    pmkitBestFor:
      'You need PRDs that cite actual customer evidence from Slack, Gong, and support tickets—and want artifacts that survive stakeholder scrutiny.',
    competitorBestFor:
      'You need quick PRD drafts for early-stage ideas and brainstorming without needing evidence trails or traceability.',
  },

  features: [
    {
      name: 'PRD generation from prompts',
      pmkit: 'yes',
      competitor: 'yes',
    },
    {
      name: 'Customer evidence citations',
      pmkit: 'yes',
      competitor: 'no',
      note: 'pmkit PRDs cite actual Slack messages, support tickets, and Gong calls',
    },
    {
      name: 'VoC clustering integration',
      pmkit: 'yes',
      competitor: 'no',
      note: 'VoC themes feed directly into PRD sections',
    },
    {
      name: 'Source traceability',
      pmkit: 'yes',
      competitor: 'no',
      note: 'Every claim traceable to source data',
    },
    {
      name: 'Draft-only governance',
      pmkit: 'yes',
      competitor: 'no',
      note: 'PRDs are proposals that require human approval',
    },
    {
      name: 'Full audit trail',
      pmkit: 'yes',
      competitor: 'no',
    },
    {
      name: 'RBAC controls',
      pmkit: 'yes',
      competitor: 'no',
      note: 'Control who can approve artifacts',
    },
    {
      name: 'Workflow chaining',
      pmkit: 'yes',
      competitor: 'no',
      note: 'PRD → Jira epics → Sprint reviews in one flow',
    },
    {
      name: 'Jira integration',
      pmkit: 'yes',
      competitor: 'no',
      note: 'Propose Jira epics from PRDs',
    },
    {
      name: 'Meeting prep integration',
      pmkit: 'yes',
      competitor: 'no',
      note: 'Meeting packs reference PRD context',
    },
    {
      name: 'Quick chat-style generation',
      pmkit: 'partial',
      competitor: 'yes',
      note: 'pmkit uses structured inputs; ChatPRD uses conversational prompts',
    },
    {
      name: 'Template customization',
      pmkit: 'yes',
      competitor: 'yes',
    },
    {
      name: 'Free tier available',
      pmkit: 'yes',
      competitor: 'yes',
    },
  ],

  sections: [
    {
      title: 'Approach to PRD Generation',
      description:
        'ChatPRD uses conversational AI to generate PRDs from prompts you provide. pmkit generates PRDs grounded in actual customer evidence pulled from your connected tools.',
      pmkitAdvantage:
        'PRDs cite actual Slack messages, support tickets, and Gong calls. Every claim is traceable to real customer feedback, making PRDs defensible in stakeholder reviews.',
      competitorAdvantage:
        'Fast, conversational interface. Type your requirements and get a PRD instantly without needing to connect data sources.',
    },
    {
      title: 'Evidence & Traceability',
      description:
        'When stakeholders ask "where did this requirement come from?", evidence becomes critical. pmkit tracks sources; ChatPRD relies on what you provide.',
      pmkitAdvantage:
        'Full audit trail of what was generated and why. Every PRD section can be traced back to specific customer conversations, support tickets, or call transcripts.',
      competitorAdvantage:
        'Simpler workflow—just copy and paste what you need. No setup required for data connections.',
    },
    {
      title: 'Workflow Integration',
      description:
        'PRDs don\'t exist in isolation. They inform roadmaps, create Jira tickets, and drive sprint planning. pmkit chains these workflows together.',
      pmkitAdvantage:
        'PRD → Jira epics → Sprint reviews in one flow. Context carries through the entire delivery chain so nothing falls through the cracks.',
      competitorAdvantage:
        'Focused on PRD generation only. Does one thing well without the complexity of workflow chaining.',
    },
    {
      title: 'Governance & Control',
      description:
        'Enterprise teams need control over AI-generated artifacts. pmkit uses a draft-only pattern where all outputs require human approval.',
      pmkitAdvantage:
        'Every PRD is a draft that requires approval. RBAC controls who can approve artifacts. Full audit trail for compliance.',
      competitorAdvantage:
        'Direct generation—copy the output and use it immediately. No approval workflow overhead.',
    },
    {
      title: 'Best Use Case',
      description:
        'Choose based on your primary need: quick drafts vs. evidence-grounded, traceable PRDs.',
      pmkitAdvantage:
        'Teams who need PRDs that survive stakeholder scrutiny, cite real evidence, and chain into delivery workflows.',
      competitorAdvantage:
        'Early-stage ideation, quick brainstorming, and situations where speed matters more than evidence trails.',
    },
  ],

  faqs: [
    {
      question: 'Is pmkit a replacement for ChatPRD?',
      answer:
        'They serve different use cases. ChatPRD is great for quick PRD drafts when you don\'t need evidence trails. pmkit is better when you need PRDs that cite real customer feedback and integrate with your delivery workflow. Some teams use ChatPRD for early brainstorming and pmkit for production PRDs.',
    },
    {
      question: 'What makes pmkit PRDs different from ChatPRD?',
      answer:
        'pmkit PRDs cite actual customer evidence—specific Slack messages, support tickets, and Gong call transcripts. ChatPRD generates PRDs from what you type in the prompt. When a stakeholder asks "where did this requirement come from?", pmkit has the answer.',
    },
    {
      question: 'Which is faster for generating PRDs?',
      answer:
        'ChatPRD is faster for quick drafts—just type your prompt and get a result. pmkit takes slightly longer because it pulls data from your connected tools to find relevant customer evidence. The tradeoff is evidence-grounded PRDs vs. speed.',
    },
    {
      question: 'Can I use pmkit without connecting data sources?',
      answer:
        'Yes, but you lose the key differentiator. pmkit\'s value is in grounding PRDs in actual customer evidence. Without connected tools like Slack, Gong, or Zendesk, it\'s just another PRD generator. For pure prompt-based generation, ChatPRD may be simpler.',
    },
    {
      question: 'Does ChatPRD have workflow chaining?',
      answer:
        'No, ChatPRD focuses specifically on PRD generation. pmkit chains workflows together: VoC clustering → PRD drafting → Jira epics → Sprint reviews. Context carries through so your PRD requirements connect to delivered features.',
    },
    {
      question: 'What about pricing differences?',
      answer:
        'ChatPRD offers simple per-user pricing. pmkit uses usage-based pricing where you pay for workflows run, not users added. This makes pmkit more cost-effective for larger teams who want everyone to access PRDs without multiplying seat costs.',
    },
  ],
};

// ============================================================================
// Page Component
// ============================================================================

export default function ChatPRDComparisonPage() {
  return <ComparisonPage data={comparisonData} />;
}
