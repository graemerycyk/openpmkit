import type { Metadata } from 'next';
import { ComparisonPage, type ComparisonPageData } from '@/components/comparison-page';
import { siteConfig } from '@/lib/utils';

// ============================================================================
// SEO Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'openpmkit vs Automation Tools (2026): Zapier, Make, n8n Comparison',
  description:
    'Compare openpmkit to job automation tools like Zapier, Make, and n8n. See why PM workflows need draft-only governance, traceability, and chained workflows.',
  keywords: [
    'openpmkit vs zapier',
    'openpmkit vs make',
    'openpmkit vs n8n',
    'pm automation tools',
    'product management automation',
    'zapier alternative for PMs',
    'workflow automation product managers',
    'draft-only automation',
  ],
  openGraph: {
    title: 'openpmkit vs Automation Tools: Which is Right for PM Workflows?',
    description:
      'Detailed comparison of openpmkit and job automation tools. Draft-only proposals vs fire-and-forget execution.',
    type: 'article',
    url: `${siteConfig.url}/compare/automation-tools`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'openpmkit vs Automation Tools Comparison',
    description: 'Complete comparison guide for product management automation.',
  },
  alternates: {
    canonical: `${siteConfig.url}/compare/automation-tools`,
  },
};

// ============================================================================
// Page Data
// ============================================================================

const comparisonData: ComparisonPageData = {
  competitor: {
    name: 'Automation Tools',
    tagline: 'Zapier, Make, n8n, Workato',
    website: 'https://zapier.com',
  },

  headline: 'openpmkit vs Automation Tools: Which is Right for PM Workflows?',
  subheadline:
    'Zapier, Make, and n8n are great for simple trigger-action automations. But PM workflows need draft-only governance, traceable insights, and artifacts that chain into delivery.',

  verdict: {
    summary:
      'Automation tools excel at simple, predictable workflows that can execute immediately. openpmkit excels at complex PM workflows that need judgment, traceability, and human oversight.',
    openpmkitBestFor:
      'PM workflows that synthesize data from multiple tools, require human review before external writes, and chain into delivery artifacts.',
    competitorBestFor:
      'Simple trigger-action automations where immediate execution is fine and you need thousands of app connectors.',
  },

  features: [
    {
      name: 'Draft-only proposals',
      openpmkit: 'yes',
      competitor: 'no',
      note: 'pmkit never writes directly—always draft first',
    },
    {
      name: 'Human approval before writes',
      openpmkit: 'yes',
      competitor: 'no',
    },
    {
      name: 'Source citations in outputs',
      openpmkit: 'yes',
      competitor: 'no',
      note: 'Every insight traceable to source',
    },
    {
      name: 'Full audit trail',
      openpmkit: 'yes',
      competitor: 'partial',
      note: 'Automation tools log executions, not decisions',
    },
    {
      name: 'Workflow chaining',
      openpmkit: 'yes',
      competitor: 'partial',
      note: 'openpmkit: VoC→PRD→Sprint. Others: isolated workflows',
    },
    {
      name: 'PM-specific workflows',
      openpmkit: 'yes',
      competitor: 'no',
      note: 'Daily briefs, PRDs, VoC clustering',
    },
    {
      name: 'Context preservation',
      openpmkit: 'yes',
      competitor: 'no',
      note: 'Artifacts reference each other',
    },
    {
      name: 'AI synthesis across tools',
      openpmkit: 'yes',
      competitor: 'no',
    },
    {
      name: 'Simple trigger-action automations',
      openpmkit: 'no',
      competitor: 'yes',
      note: 'Different use case—not pmkit\'s focus',
    },
    {
      name: 'Thousands of app connectors',
      openpmkit: 'no',
      competitor: 'yes',
      note: 'Automation tools have massive connector libraries',
    },
    {
      name: 'Visual workflow builder',
      openpmkit: 'no',
      competitor: 'yes',
    },
    {
      name: 'Self-service setup',
      openpmkit: 'yes',
      competitor: 'yes',
    },
    {
      name: 'Enterprise SSO',
      openpmkit: 'yes',
      competitor: 'yes',
    },
    {
      name: 'RBAC permissions',
      openpmkit: 'yes',
      competitor: 'partial',
    },
  ],

  sections: [
    {
      title: 'Core Philosophy',
      description:
        'Fundamentally different approaches to automation.',
      pmkitAdvantage:
        'Draft-only by design. Every external write becomes a proposal you review, edit, and approve. Errors don\'t propagate—they\'re caught before they happen.',
      competitorAdvantage:
        'Fire-and-forget efficiency. Triggers execute immediately without human intervention. Great when speed matters more than oversight.',
    },
    {
      title: 'Traceability',
      description:
        'Where does output data come from?',
      pmkitAdvantage:
        'Every claim cites its source. Trace any insight back to the Slack message, Gong call, or support ticket it came from. Full audit log of every tool call.',
      competitorAdvantage:
        'Execution logs show what triggered and when. Good for debugging workflows, but no citation of why outputs look the way they do.',
    },
    {
      title: 'Workflow Composition',
      description:
        'How do workflows connect to each other?',
      pmkitAdvantage:
        'PM Packs chain into delivery. VoC themes become PRD sections. PRDs become Jira epics. Sprint work becomes release notes. Context flows through the entire chain.',
      competitorAdvantage:
        'Each workflow is independent. You can chain triggers, but context doesn\'t carry through. Rebuild integrations for each use case.',
    },
    {
      title: 'Use Case Focus',
      description:
        'What are these tools built for?',
      pmkitAdvantage:
        'Purpose-built for product management: synthesizing customer feedback, drafting PRDs, preparing meetings, generating sprint reviews. Every feature serves PM workflows.',
      competitorAdvantage:
        'General-purpose automation for any team. Marketing, sales, HR, IT—anyone can automate routine tasks across thousands of apps.',
    },
    {
      title: 'When to Use Each',
      description:
        'Choose based on the job to be done.',
      pmkitAdvantage:
        'Complex PM workflows: daily briefs from 5+ tools, PRDs with cited evidence, VoC clustering, sprint reviews. Work that needs judgment and traceability.',
      competitorAdvantage:
        'Simple automations: new lead → add to sequence, form submit → Slack notification, file uploaded → backup. Predictable, immediate execution.',
    },
  ],

  faqs: [
    {
      question: 'Can I use openpmkit and Zapier together?',
      answer:
        'Yes. They solve different problems. Use Zapier for simple trigger-action automations (new lead → email sequence). Use openpmkit for PM workflows that need synthesis, judgment, and traceability (VoC → PRD → Sprint).',
    },
    {
      question: 'Why doesn\'t openpmkit have thousands of connectors?',
      answer:
        'openpmkit focuses on PM-relevant connectors: Slack, Jira, Confluence, Gong, Zendesk. These are the tools PMs actually use. We go deep on these integrations rather than shallow on thousands.',
    },
    {
      question: 'What is draft-only governance?',
      answer:
        'pmkit never writes directly to external systems. Every external action (create Jira ticket, post to Slack, update Confluence) becomes a proposal. You review the diff, edit if needed, and approve. This prevents automation mistakes from propagating.',
    },
    {
      question: 'Can automation tools do what openpmkit does?',
      answer:
        'You could build similar workflows with Zapier + AI, but you\'d lose the core benefits: draft-only governance, source citations, and workflow chaining. openpmkit is purpose-built for these PM requirements.',
    },
    {
      question: 'Is openpmkit more expensive than Zapier?',
      answer:
        'Different pricing models. Automation tools charge per task/operation. openpmkit charges per workflow run. For complex PM workflows that would require many tasks, openpmkit is often more cost-effective.',
    },
    {
      question: 'Do I need technical skills to use pmkit?',
      answer:
        'No. openpmkit is designed for product managers, not developers. Configure your integrations, select your workflow, and run. No coding, no workflow building, no technical setup.',
    },
  ],
};

// ============================================================================
// Page Component
// ============================================================================

export default function AutomationToolsComparisonPage() {
  return <ComparisonPage data={comparisonData} />;
}
