// ============================================================================
// Resources Page Definitions
// ============================================================================

export interface ResourcePage {
  slug: string;
  title: string;
  description: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  category: 'agents' | 'workflows' | 'integrations' | 'governance' | 'competitive' | 'voc';
  relatedPages: string[];
  faqItems: { question: string; answer: string }[];
}

export const resources: ResourcePage[] = [
  // Agents Category
  {
    slug: 'product-management-agent',
    title: 'Product Management Agent: AI That Runs PM Workflows',
    description:
      'Learn how product management agents automate daily briefs, meeting prep, VoC clustering, and PRD drafts while keeping humans in control.',
    primaryKeyword: 'product management agent',
    secondaryKeywords: ['AI PM agent', 'PM automation', 'agentic product management'],
    category: 'agents',
    relatedPages: ['/demo', '/resources/agentic-product-management', '/resources/draft-only-ai-agent'],
    faqItems: [
      {
        question: 'What is a product management agent?',
        answer:
          'A product management agent is an AI system that executes multi-step PM workflows—like generating daily briefs, preparing for meetings, or drafting PRDs—by connecting to your existing tools (Jira, Slack, Gong) and synthesizing information across sources.',
      },
      {
        question: 'How is a PM agent different from a copilot?',
        answer:
          'A copilot assists with single tasks (like writing a paragraph). An agent runs complete workflows autonomously—gathering data from multiple sources, synthesizing insights, and producing artifacts—while keeping humans in the loop for approvals.',
      },
      {
        question: 'Can PM agents write directly to Jira or Confluence?',
        answer:
          'pmkit uses a draft-only approach: agents propose changes (new epics, PRD pages, Slack messages) but never write directly. You review, edit, and approve before anything is published.',
      },
    ],
  },
  {
    slug: 'ai-product-manager-assistant',
    title: 'AI Product Manager Assistant: Your Daily PM Toolkit',
    description:
      'Discover how an AI product manager assistant handles briefs, themes, and PRDs—giving PMs more time for strategy and customer conversations.',
    primaryKeyword: 'AI product manager assistant',
    secondaryKeywords: ['PM copilot', 'AI PM tool', 'product management AI'],
    category: 'agents',
    relatedPages: ['/demo', '/resources/product-management-agent', '/pricing'],
    faqItems: [
      {
        question: 'What tasks can an AI PM assistant handle?',
        answer:
          'An AI PM assistant can generate daily briefs from overnight activity, prepare meeting packs with customer context, cluster voice-of-customer feedback into themes, draft PRDs with evidence, and create competitor intel diffs.',
      },
      {
        question: 'Will an AI assistant replace product managers?',
        answer:
          'No. AI assistants handle information synthesis and document drafting—the operational work. PMs focus on strategy, customer relationships, and decision-making that requires human judgment.',
      },
      {
        question: 'How does pmkit ensure AI output quality?',
        answer:
          'Every artifact includes sources and citations, so you can trace insights back to original data. The draft-only model means you always review before publishing.',
      },
    ],
  },
  {
    slug: 'agentic-product-management',
    title: 'Agentic Product Management: Multi-Step AI Workflows',
    description:
      'Explore agentic product management—where AI agents run complete PM workflows across tools, with governance and traceability built in.',
    primaryKeyword: 'agentic product management',
    secondaryKeywords: ['AI PM workflows', 'autonomous PM agent', 'multi-step PM automation'],
    category: 'agents',
    relatedPages: ['/demo', '/resources/product-management-agent', '/how-it-works'],
    faqItems: [
      {
        question: 'What makes product management "agentic"?',
        answer:
          'Agentic PM means AI agents execute multi-step workflows—not just single prompts. An agent might pull Slack messages, cross-reference Jira tickets, analyze Gong transcripts, and produce a synthesized brief—all in one job.',
      },
      {
        question: 'How do agentic workflows maintain quality?',
        answer:
          'pmkit agents follow defined job templates, cite sources for every insight, and produce drafts for human review. Audit logs track every tool call and decision.',
      },
      {
        question: 'What integrations support agentic PM?',
        answer:
          'pmkit connects to Jira, Confluence, Slack, Gong, Zendesk, community forums, and analytics platforms via MCP (Model Context Protocol) connectors.',
      },
    ],
  },

  // Workflows Category
  {
    slug: 'prd-automation',
    title: 'PRD Automation: Draft Product Requirements with Evidence',
    description:
      'Automate PRD drafts that include customer evidence, analytics signals, and open questions—without hallucination.',
    primaryKeyword: 'PRD automation',
    secondaryKeywords: ['AI PRD generator', 'product requirements document AI', 'automated PRD'],
    category: 'workflows',
    relatedPages: ['/demo', '/resources/product-management-agent', '/blog'],
    faqItems: [
      {
        question: 'How does PRD automation work?',
        answer:
          'pmkit gathers customer evidence (VoC themes, feature requests, call transcripts), existing documentation, and analytics signals. It then drafts a PRD following your template, with sources cited for every claim.',
      },
      {
        question: 'Will automated PRDs hallucinate requirements?',
        answer:
          'pmkit grounds every section in evidence and explicitly calls out assumptions. The draft-only model means you review and edit before the PRD is finalized.',
      },
      {
        question: 'Can I customize the PRD template?',
        answer:
          'Yes. Enterprise customers can configure PRD templates to match their organization\'s format, required sections, and approval workflows.',
      },
    ],
  },
  {
    slug: 'voice-of-customer-clustering',
    title: 'Voice of Customer Clustering: AI Theme Analysis',
    description:
      'Cluster customer feedback from support, community, and calls into actionable themes with evidence and quotes.',
    primaryKeyword: 'voice of customer clustering',
    secondaryKeywords: ['VoC AI', 'customer feedback analysis', 'theme clustering'],
    category: 'voc',
    relatedPages: ['/demo', '/resources/gong-transcripts-to-product-insights', '/blog'],
    faqItems: [
      {
        question: 'What sources does VoC clustering analyze?',
        answer:
          'pmkit analyzes support tickets (Zendesk), call transcripts (Gong), community posts (Discourse, GitHub), NPS verbatims, and Slack feedback channels.',
      },
      {
        question: 'How are themes identified?',
        answer:
          'The agent extracts pain points, feature requests, and sentiment from each source, then clusters similar feedback into themes. Each theme includes mention counts, representative quotes, and affected customer segments.',
      },
      {
        question: 'How often should I run VoC clustering?',
        answer:
          'Most teams run weekly or bi-weekly VoC jobs to stay current. You can also trigger ad-hoc runs before roadmap planning sessions.',
      },
    ],
  },
  {
    slug: 'competitor-intel-diff',
    title: 'Competitor Intel Diff: Track Market Changes',
    description:
      'Generate competitor intelligence diffs that highlight pricing changes, feature launches, and strategic implications.',
    primaryKeyword: 'competitor intel diff',
    secondaryKeywords: ['competitive intelligence AI', 'competitor monitoring', 'market tracking'],
    category: 'competitive',
    relatedPages: ['/demo', '/resources/product-management-agent', '/blog'],
    faqItems: [
      {
        question: 'What competitor changes does pmkit track?',
        answer:
          'pmkit monitors pricing changes, feature launches, messaging updates, integrations, funding rounds, and leadership changes across your tracked competitors.',
      },
      {
        question: 'How are changes detected?',
        answer:
          'The competitor MCP connector aggregates signals from product pages, press releases, social media, and industry sources. Changes are classified by type and significance.',
      },
      {
        question: 'What does a competitor diff include?',
        answer:
          'Each diff summarizes changes by competitor, assesses strategic implications, compares to your capabilities, and suggests potential responses.',
      },
    ],
  },
  {
    slug: 'meeting-prep-pack-for-product-managers',
    title: 'Meeting Prep Pack for PMs: AI-Powered Context',
    description:
      'Prepare for customer meetings with AI-generated packs that include account history, open issues, and talking points.',
    primaryKeyword: 'meeting prep pack for product managers',
    secondaryKeywords: ['meeting prep AI', 'PM meeting preparation', 'customer meeting prep'],
    category: 'workflows',
    relatedPages: ['/demo', '/resources/gong-transcripts-to-product-insights', '/blog'],
    faqItems: [
      {
        question: 'What\'s included in a meeting prep pack?',
        answer:
          'Each pack includes account summary, recent interaction history, open support tickets, key insights from past calls, suggested talking points, and risks/opportunities to watch.',
      },
      {
        question: 'How far back does the prep pack look?',
        answer:
          'By default, pmkit analyzes the last 90 days of interactions. You can adjust this window based on account activity and relationship length.',
      },
      {
        question: 'Can I generate prep packs for internal meetings?',
        answer:
          'Yes. Configure the meeting prep job for internal contexts like sprint reviews, roadmap discussions, or stakeholder updates.',
      },
    ],
  },

  // Integrations Category
  {
    slug: 'slack-to-jira-draft-epics',
    title: 'Slack to Jira: Draft Epics from Conversations',
    description:
      'Turn Slack discussions into draft Jira epics with context, requirements, and acceptance criteria—ready for review.',
    primaryKeyword: 'Slack to Jira',
    secondaryKeywords: ['Slack Jira integration AI', 'conversation to epic', 'Slack to ticket'],
    category: 'integrations',
    relatedPages: ['/demo', '/resources/jira-and-confluence-ai-workflows', '/blog'],
    faqItems: [
      {
        question: 'How does Slack to Jira work?',
        answer:
          'pmkit monitors designated Slack channels for product discussions. When you trigger a job, it extracts requirements from the conversation and proposes a Jira epic with summary, description, and acceptance criteria.',
      },
      {
        question: 'Does it write directly to Jira?',
        answer:
          'No. pmkit creates a draft proposal that you review and approve. Only after approval is the epic created in Jira.',
      },
      {
        question: 'Can I customize which Slack channels are monitored?',
        answer:
          'Yes. Configure which channels to monitor and set up filters for specific topics, reactions, or participants.',
      },
    ],
  },
  {
    slug: 'gong-transcripts-to-product-insights',
    title: 'Gong to Product Insights: Extract Customer Signal',
    description:
      'Extract pain points, feature requests, and competitive mentions from Gong call transcripts automatically.',
    primaryKeyword: 'Gong transcripts to product insights',
    secondaryKeywords: ['Gong AI analysis', 'call transcript insights', 'Gong to PRD'],
    category: 'integrations',
    relatedPages: ['/demo', '/resources/voice-of-customer-clustering', '/blog'],
    faqItems: [
      {
        question: 'What insights does pmkit extract from Gong?',
        answer:
          'pmkit identifies pain points, feature requests, competitor mentions, objections, positive feedback, questions, and action items from call transcripts.',
      },
      {
        question: 'How are insights attributed?',
        answer:
          'Each insight includes the speaker, timestamp, and surrounding context. You can trace any insight back to the exact moment in the call.',
      },
      {
        question: 'Can I search across all Gong transcripts?',
        answer:
          'Yes. The Gong MCP connector supports full-text search across transcripts, filtered by date, account, or speaker role.',
      },
    ],
  },
  {
    slug: 'community-ideas-to-roadmap',
    title: 'Community Ideas to Roadmap: Feature Request Pipeline',
    description:
      'Connect community feature requests to your roadmap with voting data, sentiment analysis, and prioritization signals.',
    primaryKeyword: 'community ideas to roadmap',
    secondaryKeywords: ['feature request management', 'community feedback roadmap', 'idea management'],
    category: 'integrations',
    relatedPages: ['/demo', '/resources/voice-of-customer-clustering', '/blog'],
    faqItems: [
      {
        question: 'Which community platforms does pmkit support?',
        answer:
          'pmkit connects to Discourse, GitHub Discussions, Reddit, and custom community platforms via the community MCP connector.',
      },
      {
        question: 'How are feature requests prioritized?',
        answer:
          'pmkit surfaces requests by vote count, comment activity, and customer segment. You can filter by status (open, planned, completed) and category.',
      },
      {
        question: 'Can I link community requests to Jira epics?',
        answer:
          'Yes. When drafting Jira epics, pmkit can include links to related community requests and their vote counts.',
      },
    ],
  },
  {
    slug: 'product-ops-automation',
    title: 'Product Ops Automation: Standardize PM Workflows',
    description:
      'Automate recurring product ops tasks like sprint reviews, release notes, and stakeholder updates.',
    primaryKeyword: 'product ops automation',
    secondaryKeywords: ['product operations AI', 'PM workflow automation', 'product ops tools'],
    category: 'workflows',
    relatedPages: ['/demo', '/resources/ai-release-notes-and-sprint-review-packs', '/blog'],
    faqItems: [
      {
        question: 'What product ops tasks can be automated?',
        answer:
          'pmkit automates daily briefs, sprint review packs, release notes, stakeholder updates, VoC reports, and competitor intel diffs.',
      },
      {
        question: 'How do I set up recurring jobs?',
        answer:
          'Configure job schedules (daily, weekly, sprint-aligned) in the pmkit console. Jobs run automatically and deliver artifacts to your preferred channels.',
      },
      {
        question: 'Can I customize automation templates?',
        answer:
          'Yes. Enterprise customers can create custom job templates with specific sources, output formats, and distribution rules.',
      },
    ],
  },
  {
    slug: 'roadmap-alignment-memos',
    title: 'Roadmap Alignment Memos: Options and Trade-offs',
    description:
      'Generate executive-ready alignment memos with options, trade-offs, evidence, and recommendations.',
    primaryKeyword: 'roadmap alignment memos',
    secondaryKeywords: ['roadmap decision making', 'product strategy memos', 'alignment documents'],
    category: 'workflows',
    relatedPages: ['/demo', '/resources/agentic-product-management', '/blog'],
    faqItems: [
      {
        question: 'What\'s included in an alignment memo?',
        answer:
          'Each memo includes the decision context, 2-3 options with pros/cons/evidence, resource requirements, timeline, a recommendation, and open questions.',
      },
      {
        question: 'What evidence supports the options?',
        answer:
          'pmkit pulls VoC themes, analytics insights, competitive context, and resource constraints to ground each option in data.',
      },
      {
        question: 'Can I share memos with stakeholders?',
        answer:
          'Yes. Export memos to Confluence, Google Docs, or Notion. You can also generate PDF versions for executive reviews.',
      },
    ],
  },

  // Governance Category
  {
    slug: 'enterprise-pm-governance',
    title: 'Enterprise PM Governance: RBAC and Audit Trails',
    description:
      'Implement enterprise-grade governance with role-based access control, audit logging, and compliance features.',
    primaryKeyword: 'enterprise PM governance',
    secondaryKeywords: ['PM RBAC', 'product management audit', 'enterprise PM tools'],
    category: 'governance',
    relatedPages: ['/pricing', '/resources/draft-only-ai-agent', '/how-it-works'],
    faqItems: [
      {
        question: 'What governance features does pmkit include?',
        answer:
          'pmkit includes role-based access control (admin, PM, viewer, guest), comprehensive audit logging, permission simulation, and SSO integration (SAML/OIDC).',
      },
      {
        question: 'What\'s logged in the audit trail?',
        answer:
          'Every job run, tool call, proposal creation, approval, and artifact download is logged with user, timestamp, and relevant metadata.',
      },
      {
        question: 'Can I export audit logs for compliance?',
        answer:
          'Yes. Export audit logs to CSV, JSON, or integrate with your SIEM solution via webhook.',
      },
    ],
  },
  {
    slug: 'draft-only-ai-agent',
    title: 'Draft-Only AI Agent: Autonomy Without Risk',
    description:
      'Learn how draft-only agents provide AI autonomy while keeping humans in control of all external writes.',
    primaryKeyword: 'draft-only AI agent',
    secondaryKeywords: ['safe AI agent', 'human-in-the-loop AI', 'controlled AI automation'],
    category: 'governance',
    relatedPages: ['/how-it-works', '/resources/enterprise-pm-governance', '/demo'],
    faqItems: [
      {
        question: 'What does "draft-only" mean?',
        answer:
          'Draft-only means the agent never writes directly to external systems (Jira, Confluence, Slack). Instead, it creates proposals that you review and approve before execution.',
      },
      {
        question: 'Why is draft-only important for enterprises?',
        answer:
          'Draft-only ensures that AI mistakes don\'t propagate to production systems. Every change is reviewed by a human, maintaining quality and accountability.',
      },
      {
        question: 'Can I skip the review step for low-risk actions?',
        answer:
          'Enterprise customers can configure auto-approval rules for specific action types, while maintaining review requirements for high-impact changes.',
      },
    ],
  },
  {
    slug: 'mcp-connectors-for-enterprise-tools',
    title: 'MCP Connectors: Enterprise Tool Integration',
    description:
      'Connect pmkit to your enterprise tools via MCP (Model Context Protocol) for secure, standardized integration.',
    primaryKeyword: 'MCP connectors for enterprise tools',
    secondaryKeywords: ['Model Context Protocol', 'enterprise AI integration', 'MCP servers'],
    category: 'governance',
    relatedPages: ['/how-it-works', '/resources/jira-and-confluence-ai-workflows', '/demo'],
    faqItems: [
      {
        question: 'What is MCP (Model Context Protocol)?',
        answer:
          'MCP is a standardized protocol for connecting AI agents to external tools. It defines how agents discover, authenticate, and interact with tool APIs.',
      },
      {
        question: 'Which tools have MCP connectors?',
        answer:
          'pmkit includes connectors for Jira, Confluence, Slack, Gong, Zendesk, community platforms, and analytics tools. Custom connectors are available for enterprise customers.',
      },
      {
        question: 'How are MCP connectors secured?',
        answer:
          'Connectors use OAuth 2.0 or API key authentication, with credentials stored encrypted. All tool calls are logged in the audit trail.',
      },
    ],
  },
  {
    slug: 'jira-and-confluence-ai-workflows',
    title: 'Jira & Confluence AI Workflows: Atlassian Automation',
    description:
      'Automate Jira epic creation, Confluence page drafts, and cross-tool workflows in your Atlassian stack.',
    primaryKeyword: 'Jira and Confluence AI workflows',
    secondaryKeywords: ['Atlassian AI', 'Jira automation AI', 'Confluence AI'],
    category: 'integrations',
    relatedPages: ['/demo', '/resources/slack-to-jira-draft-epics', '/blog'],
    faqItems: [
      {
        question: 'What Jira workflows can pmkit automate?',
        answer:
          'pmkit can draft epics from Slack conversations, create stories from PRDs, propose sprint scope based on capacity, and generate release notes from completed tickets.',
      },
      {
        question: 'What Confluence workflows are supported?',
        answer:
          'pmkit can draft PRD pages, update roadmap documents, create meeting notes, and generate VoC reports—all as proposals for your review.',
      },
      {
        question: 'Does pmkit support Jira Cloud and Data Center?',
        answer:
          'Yes. The Jira MCP connector supports both Jira Cloud and Jira Data Center deployments.',
      },
    ],
  },
  {
    slug: 'ai-release-notes-and-sprint-review-packs',
    title: 'AI Release Notes & Sprint Review Packs',
    description:
      'Generate release notes and sprint review packs automatically from Jira tickets and git commits.',
    primaryKeyword: 'AI release notes',
    secondaryKeywords: ['sprint review automation', 'release notes generator', 'sprint summary AI'],
    category: 'workflows',
    relatedPages: ['/demo', '/resources/product-ops-automation', '/blog'],
    faqItems: [
      {
        question: 'How are release notes generated?',
        answer:
          'pmkit pulls completed Jira tickets, categorizes them by type (feature, fix, improvement), and generates customer-facing release notes with appropriate language.',
      },
      {
        question: 'What\'s in a sprint review pack?',
        answer:
          'Sprint review packs include velocity metrics, completed vs. planned work, blockers encountered, key learnings, and recommendations for the next sprint.',
      },
      {
        question: 'Can I customize the release notes format?',
        answer:
          'Yes. Configure templates for different audiences (customers, internal, executives) with appropriate detail levels and formatting.',
      },
    ],
  },
  {
    slug: 'customer-escalation-to-fix-spec',
    title: 'Customer Escalation to Fix Spec: Rapid Response',
    description:
      'Turn customer escalations into fix specifications with root cause analysis, scope, and success criteria.',
    primaryKeyword: 'customer escalation to fix spec',
    secondaryKeywords: ['escalation management', 'incident to fix', 'customer issue resolution'],
    category: 'workflows',
    relatedPages: ['/demo', '/resources/voice-of-customer-clustering', '/blog'],
    faqItems: [
      {
        question: 'How does escalation to fix spec work?',
        answer:
          'pmkit analyzes the escalation ticket, related support history, and affected customer context to draft a fix specification with problem statement, root cause hypothesis, proposed solution, and success criteria.',
      },
      {
        question: 'What sources inform the fix spec?',
        answer:
          'The agent pulls the escalation ticket, customer support history, related Jira issues, and any relevant Gong call context.',
      },
      {
        question: 'How quickly can I generate a fix spec?',
        answer:
          'Fix specs are typically generated in under 2 minutes, giving engineering immediate context for rapid response.',
      },
    ],
  },
  {
    slug: 'search-product-analytics-insights',
    title: 'Search & Product Analytics Insights: Data-Driven PM',
    description:
      'Extract actionable insights from search analytics, feature usage data, and user journeys.',
    primaryKeyword: 'search product analytics insights',
    secondaryKeywords: ['product analytics AI', 'Algolia insights', 'feature usage analysis'],
    category: 'integrations',
    relatedPages: ['/demo', '/resources/voice-of-customer-clustering', '/blog'],
    faqItems: [
      {
        question: 'What analytics sources does pmkit analyze?',
        answer:
          'pmkit connects to Amplitude, Mixpanel, Algolia, Segment, and custom analytics platforms via the analytics MCP connector.',
      },
      {
        question: 'What insights can I extract from search analytics?',
        answer:
          'Identify no-results queries (content gaps), low click-through queries (relevance issues), trending searches (emerging needs), and search-to-conversion patterns.',
      },
      {
        question: 'How do analytics insights inform product decisions?',
        answer:
          'Analytics insights feed into VoC reports, PRD evidence sections, and roadmap alignment memos—grounding decisions in quantitative data.',
      },
    ],
  },
  {
    slug: 'ai-for-cross-team-dependencies',
    title: 'AI for Cross-Team Dependencies: Detect Drift Early',
    description:
      'Detect cross-team dependency drift before it burns a sprint with automated monitoring and alerts.',
    primaryKeyword: 'AI for cross-team dependencies',
    secondaryKeywords: ['dependency management', 'cross-team coordination', 'sprint risk detection'],
    category: 'workflows',
    relatedPages: ['/demo', '/resources/product-ops-automation', '/blog'],
    faqItems: [
      {
        question: 'How does pmkit detect dependency drift?',
        answer:
          'pmkit monitors linked Jira issues across teams, tracking status changes and blockers. When a dependency falls behind, it surfaces the risk in daily briefs.',
      },
      {
        question: 'What actions can I take on detected risks?',
        answer:
          'pmkit can draft Slack messages to dependent teams, propose Jira comments, or escalate to stakeholders—all as proposals for your review.',
      },
      {
        question: 'Can I configure which dependencies to monitor?',
        answer:
          'Yes. Set up monitoring rules based on Jira link types, labels, or custom fields to focus on critical dependencies.',
      },
    ],
  },
];

export function getResourceBySlug(slug: string): ResourcePage | undefined {
  return resources.find((r) => r.slug === slug);
}

export function getResourcesByCategory(category: ResourcePage['category']): ResourcePage[] {
  return resources.filter((r) => r.category === category);
}

export function getAllResourceSlugs(): string[] {
  return resources.map((r) => r.slug);
}

