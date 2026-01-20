// ============================================================================
// Resources Page Definitions
// ============================================================================

export interface WorkedExample {
  title: string;
  scenario: string;
  steps: string[];
  outcome: string;
}

export interface ResourcePage {
  slug: string;
  title: string;
  description: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  category: 'agents' | 'workflows' | 'integrations' | 'governance' | 'competitive' | 'voc';
  relatedPages: string[];
  faqItems: { question: string; answer: string }[];
  // SEO-enhanced fields
  workedExample?: WorkedExample;
  checklist?: string[];
  keyBenefits?: string[];
  useCases?: string[];
}

export const resources: ResourcePage[] = [
  // Agents Category
  {
    slug: 'product-management-agent',
    title: 'Product Management Agent: AI That Runs PM Workflows',
    description:
      'Learn how product management agents automate 10 PM workflows (daily briefs, meeting prep, VoC clustering, PRD drafts, deck content, and more) while keeping humans in control.',
    primaryKeyword: 'product management agent',
    secondaryKeywords: ['AI PM agent', 'PM automation', 'agentic product management'],
    category: 'agents',
    relatedPages: ['/demo', '/resources/agentic-product-management', '/resources/draft-only-ai-agent'],
    workedExample: {
      title: 'Daily Brief Generation in Action',
      scenario: 'Sarah, a PM at a B2B SaaS company, starts her day at 8am. Instead of spending 45 minutes checking Slack, Jira, and support tickets, she runs the Daily Brief job.',
      steps: [
        'Agent pulls 47 messages from #product-feedback and #customer-success Slack channels',
        'Cross-references 12 open Jira tickets in the current sprint with their status changes',
        'Identifies 3 enterprise escalations from Zendesk with P1 priority',
        'Analyzes 8 community posts mentioning search functionality',
        'Synthesizes all data into a structured brief with urgency rankings',
      ],
      outcome: 'Sarah spends 5 minutes reviewing a prioritized brief instead of 45 minutes gathering information. She identifies a critical bug affecting enterprise customers before her first meeting.',
    },
    checklist: [
      'Do you spend more than 30 minutes daily gathering information from multiple tools?',
      'Are customer signals scattered across Slack, support tickets, and call recordings?',
      'Do stakeholders frequently ask for the same status updates?',
      'Is your team missing important customer escalations until they become critical?',
      'Do you wish you had a synthesized view of overnight activity each morning?',
    ],
    keyBenefits: [
      'Reduce information gathering time by 80%',
      'Never miss critical customer escalations',
      'Start every day with prioritized action items',
      'Keep stakeholders informed without manual updates',
    ],
    faqItems: [
      {
        question: 'What is a product management agent?',
        answer:
          'A product management agent is an AI system that executes multi-step PM workflows (like generating daily briefs, preparing for meetings, or drafting PRDs) by connecting to your existing tools (Jira, Slack, Gong) and synthesizing information across sources.',
      },
      {
        question: 'How is a PM agent different from a copilot?',
        answer:
          'A copilot assists with single tasks (like writing a paragraph). An agent runs complete workflows autonomously, gathering data from multiple sources, synthesizing insights, and producing artifacts, while keeping humans in the loop for approvals.',
      },
      {
        question: 'Can PM agents write directly to Jira or Confluence?',
        answer:
          'pmkit uses a draft-only approach: agents propose changes (new epics, PRD pages, Slack messages) but never write directly. You review, edit, and approve before anything is published.',
      },
      {
        question: 'What tools does a PM agent connect to?',
        answer:
          'pmkit agents connect to Jira, Confluence, Slack, Gong, Zendesk, community forums (Discourse, GitHub), and analytics platforms via secure OAuth connectors. Enterprise customers can add custom integrations.',
      },
      {
        question: 'How long does it take to set up a PM agent?',
        answer:
          'Most teams are running their first jobs within 30 minutes. Connect your tools via OAuth, configure your first job template, and run it. No engineering required.',
      },
    ],
  },
  {
    slug: 'ai-product-manager-assistant',
    title: 'AI Product Manager Assistant: Your Daily PM Toolkit',
    description:
      'Discover how an AI product manager assistant handles briefs, themes, and PRDs, giving PMs more time for strategy and customer conversations.',
    primaryKeyword: 'AI product manager assistant',
    secondaryKeywords: ['PM copilot', 'AI PM tool', 'product management AI'],
    category: 'agents',
    relatedPages: ['/demo', '/resources/product-management-agent', '/pricing'],
    workedExample: {
      title: 'Meeting Prep That Actually Prepares You',
      scenario: 'Before a QBR with Globex Corp, Marcus needs context on the account. The AI assistant prepares a comprehensive meeting pack.',
      steps: [
        'Pulls last 5 Gong call transcripts with Globex stakeholders',
        'Extracts pain points mentioned: search frustration (mentioned 12 times), dashboard performance (8 times)',
        'Retrieves open support tickets and their resolution status',
        'Identifies expansion opportunity: they mentioned 4x seat growth if issues resolved',
        'Compiles talking points aligned with their specific concerns',
      ],
      outcome: 'Marcus walks into the meeting knowing exactly what matters to Globex. He addresses their search concerns proactively and secures verbal commitment for the expansion.',
    },
    checklist: [
      'Do you scramble to prepare for customer meetings at the last minute?',
      'Have you missed important context from previous customer conversations?',
      'Do you struggle to remember which customers mentioned which pain points?',
      'Is your meeting prep inconsistent across different accounts?',
      'Do you wish you had a system that remembered every customer interaction?',
    ],
    keyBenefits: [
      'Walk into every meeting fully prepared',
      'Never forget important customer context',
      'Identify expansion opportunities automatically',
      'Consistent preparation across all accounts',
    ],
    faqItems: [
      {
        question: 'What tasks can an AI PM assistant handle?',
        answer:
          'An AI PM assistant can generate daily briefs from overnight activity, prepare meeting packs with customer context, cluster voice-of-customer feedback into themes, draft PRDs with evidence, and create competitor research reports.',
      },
      {
        question: 'Will an AI assistant replace product managers?',
        answer:
          'No. AI assistants handle information synthesis and document drafting, the operational work. PMs focus on strategy, customer relationships, and decision-making that requires human judgment.',
      },
      {
        question: 'How does pmkit ensure AI output quality?',
        answer:
          'Every artifact includes sources and citations, so you can trace insights back to original data. The draft-only model means you always review before publishing.',
      },
      {
        question: 'Can I customize what the assistant focuses on?',
        answer:
          'Yes. Configure job templates to prioritize specific data sources, customer segments, or topics. Enterprise customers can create fully custom workflows.',
      },
    ],
  },
  {
    slug: 'agentic-product-management',
    title: 'Agentic Product Management: Multi-Step AI Workflows',
    description:
      'Explore agentic product management, where AI agents run complete PM workflows across tools, with governance and traceability built in.',
    primaryKeyword: 'agentic product management',
    secondaryKeywords: ['AI PM workflows', 'autonomous PM agent', 'multi-step PM automation'],
    category: 'agents',
    relatedPages: ['/demo', '/resources/product-management-agent', '/how-it-works'],
    workedExample: {
      title: 'From Customer Feedback to PRD in One Workflow',
      scenario: 'The product team needs to prioritize the next major feature. An agentic workflow synthesizes evidence from multiple sources into a decision-ready PRD.',
      steps: [
        'Agent queries Gong for pain points mentioned in last 30 days (finds 47 mentions of "search")',
        'Pulls community feature requests and vote counts (89 votes for search filters)',
        'Analyzes support ticket themes from Zendesk (35% mention search frustration)',
        'Checks competitor landscape for recent search-related launches',
        'Drafts PRD with problem statement, evidence, and proposed solution',
      ],
      outcome: 'The team has a PRD grounded in customer evidence, not assumptions. Every claim links to a source. Decision-makers can trust the prioritization.',
    },
    checklist: [
      'Are your PRDs based on evidence or intuition?',
      'Do you struggle to synthesize feedback from multiple channels?',
      'Is there a gap between what customers say and what gets built?',
      'Do you wish you could trace every product decision to customer evidence?',
      'Are your competitors shipping features you should have prioritized?',
    ],
    keyBenefits: [
      'PRDs grounded in real customer evidence',
      'Synthesize feedback from all channels automatically',
      'Trace every decision to its source',
      'Move faster with confidence',
    ],
    faqItems: [
      {
        question: "What makes product management 'agentic'?",
        answer:
          'Agentic PM means AI agents execute multi-step workflows, not just single prompts. An agent might pull Slack messages, cross-reference Jira tickets, analyze Gong transcripts, and produce a synthesized brief, all in one job.',
      },
      {
        question: 'How do agentic workflows maintain quality?',
        answer:
          'pmkit agents follow defined job templates, cite sources for every insight, and produce drafts for human review. Audit logs track every tool call and decision.',
      },
      {
        question: 'What integrations support agentic PM?',
        answer:
          'pmkit connects to Jira, Confluence, Slack, Gong, Zendesk, community platforms, and analytics tools via secure OAuth connectors.',
      },
      {
        question: 'How is this different from just using ChatGPT?',
        answer:
          'ChatGPT requires you to copy-paste context. Agentic workflows connect directly to your tools, pull real-time data, and execute multi-step processes automatically with full traceability.',
      },
    ],
  },

  // Workflows Category
  {
    slug: 'prd-automation',
    title: 'PRD Automation: Draft Product Requirements with Evidence',
    description:
      'Automate PRD drafts that include customer evidence, analytics signals, and open questions, without hallucination.',
    primaryKeyword: 'PRD automation',
    secondaryKeywords: ['AI PRD generator', 'product requirements document AI', 'automated PRD'],
    category: 'workflows',
    relatedPages: ['/demo', '/resources/product-management-agent', '/blog'],
    workedExample: {
      title: 'Evidence-Based PRD for Search Filters',
      scenario: 'The team needs a PRD for the most-requested feature: search filters. Instead of starting from scratch, the PM runs the PRD Draft job.',
      steps: [
        'Agent identifies "search filters" as top community request (89 votes)',
        'Pulls 12 Gong call excerpts where customers mention search frustration',
        'Retrieves 47 support tickets tagged with search-related issues',
        'Finds existing Confluence docs on search architecture',
        'Drafts PRD with problem statement, user stories, and success metrics',
      ],
      outcome: 'The PRD includes 15 customer quotes, 3 competitor comparisons, and specific success metrics. Engineering has the context they need to estimate and build.',
    },
    checklist: [
      'Do your PRDs take days to write?',
      'Are you missing customer evidence in your requirements?',
      'Do engineers ask for more context after reading your PRDs?',
      'Is there inconsistency in PRD quality across your team?',
      'Do you struggle to prioritize which features to specify first?',
    ],
    keyBenefits: [
      'Draft PRDs in minutes, not days',
      'Every requirement backed by customer evidence',
      'Consistent quality across all PRDs',
      'Engineers get the context they need upfront',
    ],
    faqItems: [
      {
        question: 'How does PRD automation work?',
        answer:
          "pmkit gathers customer evidence (VoC themes, feature requests, call transcripts), existing documentation, and analytics signals. It then drafts a PRD following your template, with sources cited for every claim.",
      },
      {
        question: 'Will automated PRDs hallucinate requirements?',
        answer:
          'pmkit grounds every section in evidence and explicitly calls out assumptions. The draft-only model means you review and edit before the PRD is finalized.',
      },
      {
        question: 'Can I customize the PRD template?',
        answer:
          "Yes. Enterprise customers can configure PRD templates to match their organization's format, required sections, and approval workflows.",
      },
      {
        question: 'How do I know the evidence is accurate?',
        answer:
          'Every piece of evidence links to its source: the specific Gong call timestamp, support ticket, or community post. You can verify any claim with one click.',
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
    workedExample: {
      title: 'Quarterly VoC Report in 10 Minutes',
      scenario: 'Before the quarterly planning session, the PM needs a comprehensive view of customer feedback. The VoC Clustering job analyzes 3 months of data.',
      steps: [
        'Analyzes 156 support tickets from Zendesk',
        'Processes 89 Gong call transcripts for pain points and requests',
        'Reviews 234 community posts and their engagement',
        'Clusters feedback into 7 major themes with mention counts',
        'Identifies trending topics (up/down vs. last quarter)',
      ],
      outcome: 'The planning session starts with data, not opinions. The team aligns on priorities based on actual customer pain points, with quotes they can reference.',
    },
    checklist: [
      'Is customer feedback scattered across multiple tools?',
      'Do you struggle to identify the most common pain points?',
      'Are product decisions based on the loudest voices rather than patterns?',
      'Do you wish you could quantify which issues matter most?',
      'Is your team surprised by churn that "came out of nowhere"?',
    ],
    keyBenefits: [
      'See patterns across all feedback channels',
      'Quantify which issues matter most',
      'Make decisions based on data, not opinions',
      'Predict churn before it happens',
    ],
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
          "Most teams run weekly or bi-weekly VoC jobs to stay current. You can also trigger ad-hoc runs before roadmap planning sessions.",
      },
      {
        question: 'Can I filter by customer segment?',
        answer:
          'Yes. Filter VoC analysis by customer tier (enterprise, mid-market, SMB), industry, or custom attributes from your CRM.',
      },
    ],
  },
  {
    slug: 'competitor-research',
    title: 'Competitor Research: Track Product Changes',
    description:
      'Generate competitor research reports that highlight product changes, feature launches, and strategic implications.',
    primaryKeyword: 'competitor research',
    secondaryKeywords: ['competitor product tracking', 'competitor monitoring', 'product research'],
    category: 'competitive',
    relatedPages: ['/demo', '/resources/product-management-agent', '/blog'],
    workedExample: {
      title: 'Catching a Competitor Price Cut Before Sales Does',
      scenario: 'The weekly Competitor Research job runs Sunday night. Monday morning, the PM sees a critical alert.',
      steps: [
        'Agent detects Coda reduced enterprise pricing by 20%',
        'Identifies 3 new feature launches from Notion (AI search)',
        'Flags Monday.com partnership announcement with Slack',
        'Compares feature gaps across all tracked competitors',
        'Suggests talking points for sales team',
      ],
      outcome: 'Sales is briefed before their Monday calls. They have responses ready for "why are you more expensive than Coda?" and can highlight features competitors lack.',
    },
    checklist: [
      'Do you find out about competitor changes from customers?',
      'Is your competitor research outdated by the time you use it?',
      'Do sales reps get surprised by competitor pricing in negotiations?',
      'Are you tracking competitors manually (or not at all)?',
      'Do you wish you had a systematic way to monitor the market?',
    ],
    keyBenefits: [
      'Never be surprised by competitor moves',
      'Arm sales with current competitor research',
      'Identify feature gaps before customers mention them',
      'Systematic market monitoring without manual effort',
    ],
    faqItems: [
      {
        question: 'What competitor changes does pmkit track?',
        answer:
          'pmkit monitors pricing changes, feature launches, messaging updates, integrations, funding rounds, and leadership changes across your tracked competitors.',
      },
      {
        question: 'How are changes detected?',
        answer:
          'The competitor research integration aggregates signals from product pages, press releases, social media, and industry sources. Changes are classified by type and significance.',
      },
      {
        question: 'What does a competitor research report include?',
        answer:
          'Each report summarizes changes by competitor, assesses strategic implications, compares to your capabilities, and suggests potential responses.',
      },
      {
        question: 'How many competitors can I track?',
        answer:
          'Standard plans include 5 competitors. Enterprise plans offer unlimited competitor tracking with custom alerting rules.',
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
    workedExample: {
      title: 'From Calendar Invite to Full Context in 2 Minutes',
      scenario: 'A PM has a customer call in 30 minutes with an account they haven\'t spoken to in 6 weeks. They run Meeting Prep.',
      steps: [
        'Agent identifies the account from the calendar invite',
        'Retrieves last 3 call transcripts and extracts key discussion points',
        'Pulls current support ticket status (2 open, 1 escalated)',
        'Finds the feature request they submitted 2 months ago (now shipped)',
        'Generates talking points: celebrate shipped feature, address escalation',
      ],
      outcome: 'The PM opens with "I know you\'ve been waiting for date filters. They shipped last week!" The customer is impressed. The escalation is addressed proactively.',
    },
    checklist: [
      'Do you scramble to remember account context before calls?',
      'Have you ever been surprised by an issue the customer assumed you knew about?',
      'Do you miss opportunities to celebrate wins with customers?',
      'Is your prep time eating into your actual meeting time?',
      'Do you wish you had a "cheat sheet" for every customer call?',
    ],
    keyBenefits: [
      'Full account context in 2 minutes',
      'Never be caught off-guard by open issues',
      'Celebrate wins customers forgot they requested',
      'More time for conversation, less for prep',
    ],
    faqItems: [
      {
        question: "What's included in a meeting prep pack?",
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
      {
        question: 'Does it integrate with my calendar?',
        answer:
          'Yes. pmkit can pull meeting context from Google Calendar or Outlook, automatically identifying the account and attendees.',
      },
    ],
  },

  // Integrations Category
  {
    slug: 'slack-to-jira-draft-epics',
    title: 'Slack to Jira: Draft Epics from Conversations',
    description:
      'Turn Slack discussions into draft Jira epics with context, requirements, and acceptance criteria, ready for review.',
    primaryKeyword: 'Slack to Jira',
    secondaryKeywords: ['Slack Jira integration AI', 'conversation to epic', 'Slack to ticket'],
    category: 'integrations',
    relatedPages: ['/demo', '/resources/jira-and-confluence-ai-workflows', '/blog'],
    workedExample: {
      title: 'From Slack Thread to Jira Epic in 30 Seconds',
      scenario: 'A 47-message Slack thread about a customer issue needs to become a Jira epic. Instead of reading and summarizing manually, the PM triggers the Slack-to-Jira job.',
      steps: [
        'Agent reads the full thread and identifies the core problem',
        'Extracts requirements mentioned by different stakeholders',
        'Identifies the customer impact and urgency signals',
        'Drafts epic with summary, description, and acceptance criteria',
        'Proposes the epic for review (not created until approved)',
      ],
      outcome: 'The PM reviews a well-structured epic draft, makes minor edits, and approves. The epic is created in Jira with full context. No information lost from the thread.',
    },
    checklist: [
      'Do Slack discussions get lost before becoming tickets?',
      'Do you spend time manually summarizing threads into Jira?',
      'Is context lost when conversations become requirements?',
      'Do different PMs create inconsistent Jira tickets?',
      'Do you wish Slack threads could auto-convert to epics?',
    ],
    keyBenefits: [
      'Never lose context from Slack discussions',
      'Consistent epic quality across the team',
      'Save 10+ minutes per epic creation',
      'Full traceability from conversation to ticket',
    ],
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
      {
        question: 'What if the thread has irrelevant messages?',
        answer:
          'The agent filters for product-relevant content and ignores off-topic messages. You can also highlight specific messages to include.',
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
    workedExample: {
      title: 'Mining 50 Sales Calls for Product Signal',
      scenario: 'The PM wants to understand what customers are really saying in sales calls. Running Gong analysis on the last 50 calls surfaces patterns.',
      steps: [
        'Agent processes 50 call transcripts (32 hours of audio)',
        'Extracts 127 pain point mentions across 23 unique themes',
        'Identifies 45 feature requests with customer context',
        'Flags 18 competitor mentions (Notion: 12, Coda: 6)',
        'Ranks themes by frequency and customer segment',
      ],
      outcome: 'The PM discovers that enterprise customers mention "audit logging" 3x more than SMB. This insight shifts the roadmap priority for compliance features.',
    },
    checklist: [
      'Are valuable insights trapped in call recordings?',
      'Do you rely on sales to remember and relay customer feedback?',
      'Is there a gap between what customers say and what product hears?',
      'Do you wish you could search across all customer calls?',
      'Are competitor mentions going untracked?',
    ],
    keyBenefits: [
      'Unlock insights from every customer call',
      'Hear directly from customers, not filtered through sales',
      'Track competitor mentions automatically',
      'Search across all calls for specific topics',
    ],
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
          'Yes. The Gong integration supports full-text search across transcripts, filtered by date, account, or speaker role.',
      },
      {
        question: 'Does this work with other call recording tools?',
        answer:
          'Currently pmkit supports Gong natively. Chorus and other tools are on the roadmap. Contact us for specific integration requests.',
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
    workedExample: {
      title: 'Prioritizing Community Requests for Q1',
      scenario: 'The community has 200+ open feature requests. The PM needs to identify which ones to prioritize for Q1 planning.',
      steps: [
        'Agent retrieves all open feature requests with vote counts',
        'Segments requests by customer tier (enterprise votes weighted 3x)',
        'Identifies requests that align with strategic themes',
        'Cross-references with support tickets for pain point overlap',
        'Produces ranked list with evidence for each priority',
      ],
      outcome: 'The PM presents a data-driven priority list to leadership. Each recommendation includes vote counts, customer segments, and support ticket correlation.',
    },
    checklist: [
      'Is your community feedback disconnected from your roadmap?',
      'Do you struggle to prioritize hundreds of feature requests?',
      'Are enterprise customer votes weighted appropriately?',
      'Do you wish feature requests linked to support pain points?',
      'Is your community feeling unheard?',
    ],
    keyBenefits: [
      'Connect community voice to roadmap decisions',
      'Prioritize based on customer value, not volume',
      'Show customers their feedback matters',
      'Data-driven prioritization for leadership',
    ],
    faqItems: [
      {
        question: 'Which community platforms does pmkit support?',
        answer:
          'pmkit connects to Discourse, GitHub Discussions, Reddit, and custom community platforms via secure OAuth connectors.',
      },
      {
        question: 'How are feature requests prioritized?',
        answer:
          "pmkit surfaces requests by vote count, comment activity, and customer segment. You can filter by status (open, planned, completed) and category.",
      },
      {
        question: 'Can I link community requests to Jira epics?',
        answer:
          'Yes. When drafting Jira epics, pmkit can include links to related community requests and their vote counts.',
      },
      {
        question: 'How do I close the loop with the community?',
        answer:
          'pmkit can draft community update posts when features ship, linking back to the original requests that influenced the decision.',
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
    workedExample: {
      title: 'Automated Weekly Stakeholder Update',
      scenario: 'Every Friday, the PM sends a stakeholder update. Instead of spending 2 hours compiling it, they run the weekly update job.',
      steps: [
        'Agent pulls sprint progress from Jira (velocity, completed stories)',
        'Summarizes customer feedback themes from the week',
        'Highlights key wins and blockers',
        'Drafts update email in the team\'s standard format',
        'Proposes the update for PM review before sending',
      ],
      outcome: 'The PM spends 10 minutes reviewing and personalizing instead of 2 hours compiling. Stakeholders get consistent, comprehensive updates every week.',
    },
    checklist: [
      'Do recurring updates take hours to compile?',
      'Is update quality inconsistent across the team?',
      'Do stakeholders complain about lack of visibility?',
      'Are you duplicating effort across similar reports?',
      'Do you wish updates wrote themselves?',
    ],
    keyBenefits: [
      'Consistent updates without the effort',
      'More time for strategic work',
      'Stakeholders always informed',
      'Standardized across the team',
    ],
    faqItems: [
      {
        question: 'What product ops tasks can be automated?',
        answer:
          'pmkit automates daily briefs, sprint review packs, release notes, stakeholder updates, VoC reports, and competitor research reports.',
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
      {
        question: 'What happens if a job fails?',
        answer:
          'Failed jobs are logged with error details. You can configure alerts via Slack or email when jobs fail.',
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
    workedExample: {
      title: 'SSO vs. Search: Making the Call',
      scenario: 'Leadership needs to decide Q1 priority: Enterprise SSO or AI Search. The PM generates an alignment memo with evidence for both options.',
      steps: [
        'Agent quantifies SSO impact: 3 deals worth $450K blocked',
        'Quantifies Search impact: 52 VoC mentions, 89-vote community request',
        'Estimates engineering effort for each (SSO: 8 weeks, Search: 10 weeks)',
        'Identifies dependencies and risks for each option',
        'Drafts memo with recommendation and reasoning',
      ],
      outcome: 'Leadership makes an informed decision with clear trade-offs. The memo becomes the record of why the decision was made.',
    },
    checklist: [
      'Do roadmap decisions lack clear evidence?',
      'Is it hard to articulate trade-offs to leadership?',
      'Do you wish you had a structured format for decision memos?',
      'Are past decisions poorly documented?',
      'Do stakeholders question prioritization without data?',
    ],
    keyBenefits: [
      'Evidence-based roadmap decisions',
      'Clear trade-off articulation',
      'Documented decision rationale',
      'Executive-ready format',
    ],
    faqItems: [
      {
        question: "What's included in an alignment memo?",
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
      {
        question: 'How do I customize the memo format?',
        answer:
          'Enterprise customers can configure memo templates to match their organization\'s decision-making framework.',
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
    workedExample: {
      title: 'Audit Evidence for Compliance Reviews',
      scenario: 'During a security review, the team needs to demonstrate that AI-generated content is reviewed before publication.',
      steps: [
        'Reviewer requests log of all AI-generated artifacts',
        'pmkit exports complete audit trail with timestamps and approvers',
        'Each artifact shows: who ran the job, what data was accessed, who approved',
        'Logs include permission checks and any denied access attempts',
        'Export provides evidence for RBAC and approval controls',
      ],
      outcome: 'The review demonstrates that the draft-only model provides stronger controls than most AI tools. Audit evidence is readily available.',
    },
    checklist: [
      'Does your AI tooling meet enterprise compliance requirements?',
      'Can you prove who approved AI-generated content?',
      'Do you have audit logs for all AI actions?',
      'Is access to sensitive data properly controlled?',
      'Can you demonstrate AI governance to auditors?',
    ],
    keyBenefits: [
      'Supports SOC 2 audit evidence (RBAC, audit logs, approvals)',
      'Complete audit trail for all actions',
      'Role-based access control',
      'Demonstrate AI governance to stakeholders',
    ],
    faqItems: [
      {
        question: 'What governance features does pmkit include?',
        answer:
          'pmkit includes role-based access control (admin, PM, viewer, guest), comprehensive audit logging, permission simulation, and SSO integration (OIDC for Teams, SAML for Enterprise).',
      },
      {
        question: "What's logged in the audit trail?",
        answer:
          'Every job run, tool call, proposal creation, approval, and artifact download is logged with user, timestamp, and relevant metadata.',
      },
      {
        question: 'Can I export audit logs for compliance?',
        answer:
          'Yes. Export audit logs to CSV or JSON. Enterprise customers can integrate with SIEM solutions via webhook.',
      },
      {
        question: 'What is pmkit\'s compliance status?',
        answer:
          'SOC 2 Type II certification is in progress. DPA available on request for GDPR compliance. Contact us for current security questionnaire responses.',
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
    workedExample: {
      title: 'Catching an Error Before It Ships',
      scenario: 'An agent drafts a Slack announcement about a feature launch. Before approval, the PM notices an error.',
      steps: [
        'Agent drafts announcement: "Search filters now available for all users"',
        'PM reviews and catches error: filters are enterprise-only initially',
        'PM edits the draft to clarify availability',
        'PM approves the corrected version',
        'Only the corrected message is posted to Slack',
      ],
      outcome: 'A potentially embarrassing miscommunication is caught before it reaches customers. The draft-only model prevented the error from going live.',
    },
    checklist: [
      'Are you worried about AI making mistakes in production?',
      'Do you need human review before AI outputs go live?',
      'Is your team hesitant to adopt AI due to risk concerns?',
      'Do you need to demonstrate AI controls to leadership?',
      'Have you seen AI tools make embarrassing errors?',
    ],
    keyBenefits: [
      'AI autonomy with human control',
      'Catch errors before they go live',
      'Build trust in AI gradually',
      'Demonstrate responsible AI to stakeholders',
    ],
    faqItems: [
      {
        question: 'What does "draft-only" mean?',
        answer:
          'Draft-only means the agent never writes directly to external systems (Jira, Confluence, Slack). Instead, it creates proposals that you review and approve before execution.',
      },
      {
        question: 'Why is draft-only important for enterprises?',
        answer:
          "Draft-only ensures that AI mistakes don't propagate to production systems. Every change is reviewed by a human, maintaining quality and accountability.",
      },
      {
        question: 'Can I skip the review step for low-risk actions?',
        answer:
          'Enterprise customers can configure auto-approval rules for specific action types, while maintaining review requirements for high-impact changes.',
      },
      {
        question: 'How does this compare to other AI tools?',
        answer:
          'Most AI tools either have no external actions (just chat) or allow direct writes. pmkit\'s draft-only model provides the best of both: autonomous workflows with human oversight.',
      },
    ],
  },
  {
    slug: 'secure-connectors-for-enterprise-tools',
    title: 'Secure Connectors: Enterprise Tool Integration',
    description:
      'Connect pmkit to your enterprise tools via secure OAuth integrations for standardized, auditable access.',
    primaryKeyword: 'enterprise tool connectors',
    secondaryKeywords: ['enterprise AI integration', 'OAuth connectors', 'secure integrations'],
    category: 'governance',
    relatedPages: ['/how-it-works', '/resources/jira-and-confluence-ai-workflows', '/demo'],
    workedExample: {
      title: 'Adding a Custom CRM Connector',
      scenario: 'An enterprise customer uses a custom CRM that pmkit doesn\'t support natively. They need to integrate it for meeting prep.',
      steps: [
        'Customer provides API documentation for their CRM',
        'pmkit team builds custom connector with required endpoints',
        'Connector is tested in staging with sample data',
        'Customer configures OAuth credentials in pmkit',
        'Meeting prep now includes CRM data (deal stage, contacts, notes)',
      ],
      outcome: 'Meeting prep packs now include deal context from the custom CRM. The PM knows the deal stage, key contacts, and recent notes before every call.',
    },
    checklist: [
      'Do you use tools that aren\'t supported by standard integrations?',
      'Is your data spread across many specialized systems?',
      'Do you need secure, auditable connections to enterprise tools?',
      'Are you concerned about data security with AI integrations?',
      'Do you want a standardized way to add new integrations?',
    ],
    keyBenefits: [
      'OAuth-based secure authentication',
      'Encrypted credential storage',
      'Custom connectors for any tool',
      'Enterprise-grade security',
    ],
    faqItems: [
      {
        question: 'How do pmkit connectors work?',
        answer:
          'pmkit connectors use secure OAuth 2.0 authentication to connect to your enterprise tools. Each connector authenticates on behalf of your account and logs every interaction for audit purposes.',
      },
      {
        question: 'Which tools have connectors available?',
        answer:
          'pmkit includes connectors for Jira, Confluence, Slack, Gmail, Google Drive, Google Calendar, Gong, Zendesk, and more. Custom connectors are available for enterprise customers.',
      },
      {
        question: 'How are connectors secured?',
        answer:
          'Connectors use OAuth 2.0 authentication, with credentials stored encrypted using AES-256-GCM. All tool calls are logged in the audit trail for compliance.',
      },
      {
        question: 'Can I request a custom connector?',
        answer:
          'Enterprise customers can request custom connectors for tools not in our standard set. All connectors go through security review before deployment.',
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
    workedExample: {
      title: 'PRD to Jira Epics in One Click',
      scenario: 'A PRD is approved. Now it needs to become Jira epics and stories. Instead of manual creation, the PM runs the PRD-to-Jira job.',
      steps: [
        'Agent parses the PRD for requirements and user stories',
        'Creates draft epic with summary and description',
        'Breaks requirements into individual story drafts',
        'Links stories to the epic with proper hierarchy',
        'Proposes all tickets for review before creation',
      ],
      outcome: 'The PM reviews 1 epic and 8 stories, makes minor edits, and approves. All tickets are created in Jira with proper linking. 30 minutes saved.',
    },
    checklist: [
      'Do you manually create Jira tickets from PRDs?',
      'Is there inconsistency in how epics and stories are structured?',
      'Do you spend time on Jira administration instead of product work?',
      'Are your Confluence pages disconnected from Jira tickets?',
      'Do you wish Atlassian workflows were more automated?',
    ],
    keyBenefits: [
      'PRD to Jira in one click',
      'Consistent ticket structure',
      'Connected Confluence and Jira',
      'Less admin, more product work',
    ],
    faqItems: [
      {
        question: 'What Jira workflows can pmkit automate?',
        answer:
          'pmkit can draft epics from Slack conversations, create stories from PRDs, propose sprint scope based on capacity, and generate release notes from completed tickets.',
      },
      {
        question: 'What Confluence workflows are supported?',
        answer:
          'pmkit can draft PRD pages, update roadmap documents, create meeting notes, and generate VoC reports, all as proposals for your review.',
      },
      {
        question: 'Does pmkit support Jira Cloud and Data Center?',
        answer:
          'Yes. The Jira integration supports both Jira Cloud and Jira Data Center deployments.',
      },
      {
        question: 'Can I customize the Jira ticket templates?',
        answer:
          'Yes. Configure templates for epics, stories, and bugs to match your team\'s conventions.',
      },
    ],
  },
  {
    slug: 'ai-release-notes-and-sprint-review-packs',
    title: 'AI Release Notes & Sprint Review Packs',
    description:
      'Generate customer-facing release notes and internal sprint review packs automatically from Jira tickets. Save hours per release while improving communication.',
    primaryKeyword: 'AI release notes',
    secondaryKeywords: ['sprint review automation', 'release notes generator', 'sprint summary AI', 'changelog automation'],
    category: 'workflows',
    relatedPages: ['/demo', '/resources/product-ops-automation', '/blog/ai-release-notes-from-jira'],
    workedExample: {
      title: 'Release Notes in 5 Minutes Instead of 2 Hours',
      scenario: 'It\'s release day. The PM needs customer-facing release notes. Instead of reading 47 Jira tickets, they run the release notes job.',
      steps: [
        'Agent retrieves all tickets in the release (47 completed)',
        'Categorizes by type: 12 features, 28 fixes, 7 improvements',
        'Writes customer-friendly descriptions (no Jira jargon)',
        'Highlights top 3 features with benefit statements',
        'Drafts release notes in the team\'s standard format',
        'Creates sales enablement talking points for CSM/Sales',
      ],
      outcome: 'The PM reviews and publishes release notes in 5 minutes. Customers see a polished update. Sales has talking points for customer calls. Marketing has content for the announcement.',
    },
    checklist: [
      'Do release notes take hours to write?',
      'Is there inconsistency in release note quality?',
      'Do you struggle to translate Jira tickets to customer language?',
      'Does sales lack visibility into what shipped?',
      'Do CSMs miss opportunities to proactively share updates?',
      'Do you wish release notes wrote themselves?',
    ],
    keyBenefits: [
      'Release notes in minutes, not hours',
      'Customer-friendly language automatically',
      'Consistent quality every release',
      'Sales enablement same-day',
      'Multiple audience versions from one source',
    ],
    useCases: [
      'Customer-facing changelog updates',
      'In-app "What\'s New" notifications',
      'Release announcement emails',
      'Sales enablement talking points',
      'CSM proactive outreach',
      'Support team briefings',
    ],
    faqItems: [
      {
        question: 'How are release notes generated?',
        answer:
          'pmkit pulls completed Jira tickets for the release version, retrieves epic context for the bigger picture, references related PRDs to connect features to customer problems, and generates customer-facing notes in your team\'s format.',
      },
      {
        question: 'How is this different from Sprint Review?',
        answer:
          'Sprint Review is internal-focused (velocity, blockers, team metrics). Release Notes is customer-focused (benefits, features, fixes). Sprint Review includes what didn\'t ship; Release Notes only includes what shipped.',
      },
      {
        question: 'Can I customize the release notes format?',
        answer:
          'Yes. Configure templates for different audiences (customers, sales, internal) with appropriate detail levels, tone, and formatting.',
      },
      {
        question: 'Can it generate multiple versions?',
        answer:
          'Yes. From the same source data, pmkit can generate customer-facing notes, sales talking points, and technical changelogs with appropriate detail for each audience.',
      },
      {
        question: 'Does it connect features to customer requests?',
        answer:
          'Yes. pmkit can reference VoC data and PRDs to include statements like "This addresses feedback from 89 customers who requested better search capabilities."',
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
    workedExample: {
      title: 'From P1 Escalation to Fix Spec in 10 Minutes',
      scenario: 'An enterprise customer escalates a critical issue. Engineering needs a fix spec immediately.',
      steps: [
        'Agent retrieves the escalation ticket and full history',
        'Pulls related support tickets from other customers',
        'Identifies the customer\'s environment and configuration',
        'Drafts fix spec with problem statement and reproduction steps',
        'Proposes scope, success criteria, and rollback plan',
      ],
      outcome: 'Engineering has a clear fix spec in 10 minutes instead of 2 hours of investigation. The fix ships same-day. The customer is retained.',
    },
    checklist: [
      'Do escalations take too long to turn into fix specs?',
      'Is context lost between support and engineering?',
      'Do you struggle to identify related issues quickly?',
      'Are fix specs inconsistent in quality?',
      'Do you wish escalation response was faster?',
    ],
    keyBenefits: [
      'Fix specs in minutes, not hours',
      'Full context for engineering',
      'Identify related issues automatically',
      'Faster customer resolution',
    ],
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
      {
        question: 'Does it suggest solutions?',
        answer:
          'The agent proposes potential solutions based on similar past issues, but the final approach is always decided by engineering.',
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
    workedExample: {
      title: 'Discovering a Content Gap from Search Data',
      scenario: 'The PM wants to understand what users are searching for but not finding. They run the search analytics job.',
      steps: [
        'Agent retrieves no-results queries from the last 30 days',
        'Identifies top 10 queries with zero results (integration, API, export)',
        'Cross-references with feature requests and support tickets',
        'Discovers "API documentation" is searched 200x/week with no results',
        'Drafts recommendation to create API docs section',
      ],
      outcome: 'The PM prioritizes API documentation. After launch, no-results queries drop 40%. Support tickets about API questions drop 60%.',
    },
    checklist: [
      'Do you know what users search for but don\'t find?',
      'Is feature usage data disconnected from product decisions?',
      'Do you wish analytics insights surfaced automatically?',
      'Are you making decisions without usage data?',
      'Do you struggle to identify content gaps?',
    ],
    keyBenefits: [
      'Discover content gaps automatically',
      'Connect usage data to decisions',
      'Identify underused features',
      'Data-driven prioritization',
    ],
    faqItems: [
      {
        question: 'What analytics sources does pmkit analyze?',
        answer:
          'pmkit connects to Amplitude, Mixpanel, Algolia, Segment, and custom analytics platforms via secure OAuth connectors.',
      },
      {
        question: 'What insights can I extract from search analytics?',
        answer:
          'Identify no-results queries (content gaps), low click-through queries (relevance issues), trending searches (emerging needs), and search-to-conversion patterns.',
      },
      {
        question: 'How do analytics insights inform product decisions?',
        answer:
          'Analytics insights feed into VoC reports, PRD evidence sections, and roadmap alignment memos, grounding decisions in quantitative data.',
      },
      {
        question: 'Can I set up alerts for specific patterns?',
        answer:
          'Yes. Configure alerts for spikes in no-results queries, drops in feature usage, or other patterns that indicate issues.',
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
    workedExample: {
      title: 'Catching a Blocked Dependency Before Standup',
      scenario: 'The Daily Brief job runs at 7am. It surfaces a dependency risk before the 9am standup.',
      steps: [
        'Agent scans linked Jira tickets across teams',
        'Identifies that PLATFORM-123 (your dependency) moved to "Blocked"',
        'Checks the blocker: waiting on external vendor',
        'Calculates impact: your ACME-456 is now at risk',
        'Drafts alert with context and suggested actions',
      ],
      outcome: 'The PM addresses the risk at standup. The team re-plans before losing a day. The sprint is saved.',
    },
    checklist: [
      'Do you find out about blocked dependencies too late?',
      'Is cross-team coordination a constant pain point?',
      'Do you manually check linked tickets for status?',
      'Are sprints derailed by surprise blockers?',
      'Do you wish dependencies monitored themselves?',
    ],
    keyBenefits: [
      'Early warning on blocked dependencies',
      'Automated cross-team monitoring',
      'Sprints protected from surprise blockers',
      'Proactive instead of reactive',
    ],
    faqItems: [
      {
        question: 'How does pmkit detect dependency drift?',
        answer:
          'pmkit monitors linked Jira issues across teams, tracking status changes and blockers. When a dependency falls behind, it surfaces the risk in daily briefs.',
      },
      {
        question: 'What actions can I take on detected risks?',
        answer:
          'pmkit can draft Slack messages to dependent teams, propose Jira comments, or escalate to stakeholders, all as proposals for your review.',
      },
      {
        question: 'Can I configure which dependencies to monitor?',
        answer:
          'Yes. Set up monitoring rules based on Jira link types, labels, or custom fields to focus on critical dependencies.',
      },
      {
        question: 'How often are dependencies checked?',
        answer:
          'Dependencies are checked with each Daily Brief job (typically morning). You can also configure more frequent checks for critical paths.',
      },
    ],
  },
  {
    slug: 'prd-to-prototype-generation',
    title: 'PRD to Prototype: AI-Generated UI from Requirements',
    description:
      'Generate functional UI prototypes directly from PRDs using AI. Validate product direction in minutes instead of weeks.',
    primaryKeyword: 'PRD to prototype',
    secondaryKeywords: ['AI UI generation', 'prototype from PRD', 'automated prototyping', 'AI mockup generator'],
    category: 'workflows',
    relatedPages: ['/demo', '/resources/prd-automation', '/blog/prd-to-prototype-ai-ui-generation'],
    workedExample: {
      title: 'From Search Filters PRD to Interactive Prototype',
      scenario: 'After generating a PRD for search filters, the PM wants to validate the UX with users before investing in design. They run the Prototype Generation job.',
      steps: [
        'Agent extracts user stories and acceptance criteria from the PRD',
        'Identifies key UI components: filter panel, date picker, content type selector',
        'Generates React/Tailwind code for the search interface',
        'Renders interactive prototype with realistic placeholder data',
        'PM shares prototype link with 3 users for same-day feedback',
      ],
      outcome: 'Users provide feedback within hours. One insight: they expected a calendar picker, not just presets. The PRD is updated before design begins, saving a week of iteration.',
    },
    checklist: [
      'Do you wait weeks between PRD approval and user feedback?',
      'Are stakeholders struggling to visualize written requirements?',
      'Do design iterations reveal PRD gaps that could have been caught earlier?',
      'Is your team building features that don\'t match user expectations?',
      'Do you wish you could test product direction before investing in design?',
    ],
    keyBenefits: [
      'Validate product direction in minutes, not weeks',
      'Reduce miscommunication between PM and design',
      'Catch PRD gaps before engineering investment',
      'Align stakeholders with tangible prototypes',
    ],
    useCases: [
      'New feature validation before design investment',
      'Stakeholder alignment with interactive demos',
      'User research with tangible prototypes',
      'Internal tool rapid development',
      'Concept testing for roadmap prioritization',
    ],
    faqItems: [
      {
        question: 'How does PRD to prototype generation work?',
        answer:
          'pmkit extracts user stories, acceptance criteria, and requirements from your PRD, then generates functional React/Tailwind code that renders as an interactive prototype. The prototype demonstrates core user flows with realistic placeholder data.',
      },
      {
        question: 'Will AI-generated prototypes replace designers?',
        answer:
          'No. AI prototypes are for validation, not production. Designers focus on polish, brand consistency, and complex interactions rather than basic layout exploration. The prototype gives them a validated starting point.',
      },
      {
        question: 'How good are the generated prototypes?',
        answer:
          'Good enough for validation. Expect 70-80% of the way to a polished design. The goal is to test product direction quickly, not produce pixel-perfect mockups.',
      },
      {
        question: 'Can I use the generated code in production?',
        answer:
          'Sometimes. Simple components may be production-ready. Complex features need engineering review. Treat generated code as a reference implementation, not final code.',
      },
      {
        question: 'What if user feedback contradicts the PRD?',
        answer:
          'That\'s the point! Update the PRD based on what you learned, then regenerate the prototype. Each iteration takes minutes, not weeks.',
      },
    ],
  },
  {
    slug: 'deck-content-generation',
    title: 'Deck Content Generation: AI Slide Content for Any Audience',
    description:
      'Generate presentation slide content tailored for exec, customer, team, or stakeholder audiences. Copy-paste ready text for your existing templates.',
    primaryKeyword: 'AI slide content',
    secondaryKeywords: ['presentation content generator', 'slide deck AI', 'executive presentation', 'PM presentation automation'],
    category: 'workflows',
    relatedPages: ['/demo', '/resources/prd-automation', '/resources/roadmap-alignment-memos'],
    workedExample: {
      title: 'Q4 Board Update in 20 Minutes',
      scenario: 'A PM has a board meeting in 2 hours. They need a deck covering Q4 progress, key metrics, and the Q1 roadmap ask. Instead of starting from scratch, they run Deck Content.',
      steps: [
        'Agent pulls recent VoC report, competitor research, and sprint metrics from pmkit',
        'Identifies key wins: search filters shipped, 40% improvement in search-to-click time',
        'Structures content for exec audience: business impact first, minimal technical detail',
        'Generates 8 slides with headlines, bullets, speaker notes, and visual suggestions',
        'Includes Q&A prep with likely questions and recommended answers',
      ],
      outcome: 'The PM pastes content into the company deck template, makes minor tweaks, and is ready with 90 minutes to spare. The board meeting goes smoothly with data-backed answers to every question.',
    },
    checklist: [
      'Do you spend hours gathering data for presentations?',
      'Do you struggle to tailor content for different audiences?',
      'Are your decks inconsistent in quality and structure?',
      'Do you wish you had speaker notes and Q&A prep?',
      'Do you have company templates but struggle with content?',
    ],
    keyBenefits: [
      'Presentation content in minutes, not hours',
      'Audience-appropriate tone and depth',
      'Consistent structure across all decks',
      'Speaker notes and Q&A prep included',
    ],
    useCases: [
      'Executive/board presentations',
      'Customer QBRs and business reviews',
      'Team sprint reviews and demos',
      'Stakeholder alignment meetings',
      'Investor updates',
      'Sales enablement decks',
    ],
    faqItems: [
      {
        question: 'Does this generate actual slides?',
        answer:
          'No. Deck Content generates the text content for slides—headlines, bullets, speaker notes, and visual suggestions. You paste this into your existing company templates. This approach works with any presentation tool (PowerPoint, Google Slides, Keynote) and respects your brand guidelines.',
      },
      {
        question: 'What audiences are supported?',
        answer:
          'Four audience types: Executive (business impact, strategic), Customer (outcomes, value), Team (technical details, action items), and Stakeholder (cross-functional, dependencies). Each gets different tone, depth, and content focus.',
      },
      {
        question: 'What data sources inform the content?',
        answer:
          'Deck Content pulls from pmkit artifacts (VoC reports, competitor research, PRDs), Jira (sprint metrics, roadmap), Amplitude (product metrics), and Confluence (existing documentation). The more context you provide, the better the output.',
      },
      {
        question: 'Can I customize the slide structure?',
        answer:
          'Yes. Specify your requirements in the job input—number of slides, specific topics to cover, asks to include. Enterprise customers can create custom templates for recurring presentation types.',
      },
      {
        question: 'How does it handle confidential data?',
        answer:
          'Deck Content follows pmkit\'s draft-only model. All content is generated as a draft for your review. You control what goes into the final presentation. Sensitive data is never shared externally.',
      },
    ],
  },

  // ============================================================================
  // Integration Documentation Pages
  // ============================================================================

  // Jira Integration
  {
    slug: 'jira-integration',
    title: 'Jira Integration: Connect Your Project Tracking',
    description:
      'Connect Jira to pmkit to sync issues, epics, and sprint data for automated PRDs, daily briefs, and sprint reviews.',
    primaryKeyword: 'Jira integration',
    secondaryKeywords: ['Jira AI', 'Jira automation', 'Jira integration'],
    category: 'integrations',
    relatedPages: ['/demo', '/resources/jira-and-confluence-ai-workflows', '/resources/slack-to-jira-draft-epics'],
    workedExample: {
      title: 'Syncing Sprint Data for Daily Briefs',
      scenario: 'A PM connects Jira to pmkit to automate their daily brief generation with real-time sprint data.',
      steps: [
        'Connect Jira via OAuth in pmkit settings',
        'Select the projects and boards to sync',
        'Configure which issue types to include (epics, stories, bugs)',
        'Daily Brief job now pulls sprint progress, blockers, and velocity automatically',
        'PRD Draft job references existing epics and stories for context',
      ],
      outcome: 'Daily briefs include real-time sprint status. PRDs reference existing Jira context. Sprint reviews generate automatically from completed tickets.',
    },
    keyBenefits: [
      'Real-time sprint data in daily briefs',
      'PRDs linked to existing Jira epics',
      'Automated sprint review generation',
      'Draft epics and stories from Slack conversations',
    ],
    faqItems: [
      {
        question: 'What Jira data does pmkit access?',
        answer:
          'pmkit reads issues, epics, sprints, projects, and comments. It can propose new epics and stories but never writes directly—all changes require your approval.',
      },
      {
        question: 'Does pmkit support Jira Cloud and Data Center?',
        answer:
          'Yes. The Jira integration supports both Jira Cloud and Jira Data Center deployments.',
      },
      {
        question: 'How do I connect Jira?',
        answer:
          'Go to Settings → Integrations → Jira and click "Connect". You\'ll be redirected to Atlassian to authorize pmkit. Select the sites and projects to sync.',
      },
      {
        question: 'What permissions does pmkit need?',
        answer:
          'pmkit requests read access to issues, projects, and sprints. Write access is only used for creating draft proposals that you approve.',
      },
    ],
  },

  // Confluence Integration
  {
    slug: 'confluence-integration',
    title: 'Confluence Integration: Publish PRDs and Documentation',
    description:
      'Connect Confluence to pmkit to access existing documentation and publish PRDs, meeting notes, and artifacts directly.',
    primaryKeyword: 'Confluence integration',
    secondaryKeywords: ['Confluence AI', 'Confluence automation', 'Confluence integration'],
    category: 'integrations',
    relatedPages: ['/demo', '/resources/jira-and-confluence-ai-workflows', '/resources/prd-automation'],
    workedExample: {
      title: 'Publishing PRDs to Confluence',
      scenario: 'After generating a PRD in pmkit, the PM publishes it directly to their team\'s Confluence space.',
      steps: [
        'Connect Confluence via OAuth in pmkit settings',
        'Generate a PRD using the PRD Draft job',
        'Review and edit the PRD in pmkit',
        'Click "Publish to Confluence" and select the target space',
        'PRD is created as a new Confluence page with proper formatting',
      ],
      outcome: 'PRDs flow seamlessly from pmkit to Confluence. Team members access documentation in their familiar workspace. Version history is maintained.',
    },
    keyBenefits: [
      'Publish PRDs directly to Confluence',
      'Access existing documentation for context',
      'Maintain consistent formatting',
      'Link artifacts to Confluence pages',
    ],
    faqItems: [
      {
        question: 'What Confluence data does pmkit access?',
        answer:
          'pmkit reads pages, spaces, and page hierarchies. It can propose new pages but requires your approval before publishing.',
      },
      {
        question: 'Can pmkit update existing Confluence pages?',
        answer:
          'Yes. pmkit can propose updates to existing pages. You review the changes before they\'re applied.',
      },
      {
        question: 'How does formatting work?',
        answer:
          'pmkit converts markdown artifacts to Confluence\'s storage format, preserving headers, lists, tables, and code blocks.',
      },
      {
        question: 'Can I choose which space to publish to?',
        answer:
          'Yes. When publishing, you select the target space and parent page. pmkit respects your Confluence permissions.',
      },
    ],
  },

  // Slack Integration
  {
    slug: 'slack-integration',
    title: 'Slack Integration: Notifications and Job Triggers',
    description:
      'Connect Slack to pmkit for notifications, job triggers, and extracting product discussions from channels.',
    primaryKeyword: 'Slack integration',
    secondaryKeywords: ['Slack AI', 'Slack automation', 'Slack integration'],
    category: 'integrations',
    relatedPages: ['/demo', '/resources/slack-to-jira-draft-epics', '/resources/product-management-agent'],
    workedExample: {
      title: 'Turning Slack Threads into Jira Epics',
      scenario: 'A product discussion in Slack needs to become a Jira epic. The PM triggers the Slack-to-Jira job.',
      steps: [
        'Connect Slack via OAuth in pmkit settings',
        'Configure which channels to monitor for product discussions',
        'React to a thread with the pmkit emoji or use /pmkit command',
        'pmkit extracts requirements from the conversation',
        'Review and approve the draft epic before it\'s created in Jira',
      ],
      outcome: 'Slack discussions become structured Jira epics without manual summarization. Context is preserved. Nothing falls through the cracks.',
    },
    keyBenefits: [
      'Extract requirements from Slack threads',
      'Receive job completion notifications',
      'Trigger jobs with slash commands',
      'Monitor channels for product signals',
    ],
    faqItems: [
      {
        question: 'What Slack data does pmkit access?',
        answer:
          'pmkit reads messages from channels you configure. It can post notifications to channels but never sends messages without your approval.',
      },
      {
        question: 'Can I trigger jobs from Slack?',
        answer:
          'Yes. Use /pmkit commands to trigger jobs directly from Slack. Results are delivered to the channel or as a DM.',
      },
      {
        question: 'Which channels should I connect?',
        answer:
          'Connect channels where product discussions happen: #product-feedback, #customer-success, #feature-requests, etc.',
      },
      {
        question: 'Does pmkit read private channels?',
        answer:
          'Only if you explicitly add pmkit to the private channel. pmkit respects Slack\'s permission model.',
      },
    ],
  },

  // MCP Integration
  {
    slug: 'mcp-integration',
    title: 'MCP Integration: Connect pmkit to Your AI Client',
    description:
      'Use Model Context Protocol (MCP) to connect pmkit tools to Cursor, Claude Desktop, or other AI clients.',
    primaryKeyword: 'MCP integration',
    secondaryKeywords: ['Model Context Protocol', 'MCP server', 'AI client integration'],
    category: 'integrations',
    relatedPages: ['/demo', '/integrations', '/how-it-works'],
    workedExample: {
      title: 'Adding pmkit to Cursor IDE',
      scenario: 'A developer wants to access pmkit tools directly from their Cursor IDE.',
      steps: [
        'Copy the pmkit MCP configuration from Settings → Integrations',
        'Open Cursor settings and navigate to MCP configuration',
        'Paste the pmkit config into your mcp.json file',
        'Restart Cursor to load the new MCP server',
        'pmkit tools are now available in Cursor\'s AI assistant',
      ],
      outcome: 'Developers can query pmkit data, run jobs, and access artifacts directly from their IDE without context switching.',
    },
    keyBenefits: [
      'Access pmkit from your IDE',
      'Query artifacts and proposals',
      'Run jobs without leaving your workflow',
      'Standardized MCP protocol',
    ],
    faqItems: [
      {
        question: 'What is MCP (Model Context Protocol)?',
        answer:
          'MCP is a standardized protocol for connecting AI agents to external tools. It defines how AI clients discover and interact with tool APIs.',
      },
      {
        question: 'Which AI clients support MCP?',
        answer:
          'Cursor, Claude Desktop, and other MCP-compatible clients. Check your client\'s documentation for MCP support.',
      },
      {
        question: 'What pmkit tools are available via MCP?',
        answer:
          'Query artifacts, list jobs, search proposals, and access connector data. All read operations are available; writes create proposals for review.',
      },
      {
        question: 'Is MCP secure?',
        answer:
          'Yes. MCP connections use your pmkit API key for authentication. All requests are logged in the audit trail.',
      },
    ],
  },

  // Gong Integration
  {
    slug: 'gong-integration',
    title: 'Gong Integration: Extract Customer Insights from Calls',
    description:
      'Connect Gong to pmkit to automatically extract pain points, feature requests, and competitive mentions from sales and CS calls.',
    primaryKeyword: 'Gong integration',
    secondaryKeywords: ['Gong AI', 'call transcript analysis', 'Gong integration'],
    category: 'integrations',
    relatedPages: ['/demo', '/resources/gong-transcripts-to-product-insights', '/resources/voice-of-customer-clustering'],
    workedExample: {
      title: 'Mining Customer Calls for Product Signal',
      scenario: 'A PM wants to understand what customers are really saying in sales calls. They run Gong analysis.',
      steps: [
        'Connect Gong via OAuth in pmkit settings',
        'Configure which call types to analyze (sales, CS, onboarding)',
        'Run the VoC Clustering job with Gong as a source',
        'pmkit extracts pain points, feature requests, and competitor mentions',
        'Review clustered themes with supporting call excerpts',
      ],
      outcome: 'Product decisions are grounded in actual customer conversations. Competitor mentions are tracked automatically. Nothing is lost in translation from sales.',
    },
    keyBenefits: [
      'Extract insights from every call',
      'Track competitor mentions automatically',
      'Hear directly from customers',
      'Search across all transcripts',
    ],
    faqItems: [
      {
        question: 'What Gong data does pmkit access?',
        answer:
          'pmkit reads call transcripts, metadata (participants, duration, date), and Gong\'s extracted insights. It never accesses call recordings directly.',
      },
      {
        question: 'How are insights attributed?',
        answer:
          'Each insight includes the speaker, timestamp, and surrounding context. You can trace any insight back to the exact moment in the call.',
      },
      {
        question: 'Can I filter by account or segment?',
        answer:
          'Yes. Filter Gong analysis by account, deal stage, customer segment, or date range.',
      },
      {
        question: 'Does this work with Chorus or other tools?',
        answer:
          'Currently pmkit supports Gong natively. Chorus integration is on the roadmap.',
      },
    ],
  },

  // Zendesk Integration
  {
    slug: 'zendesk-integration',
    title: 'Zendesk Integration: Analyze Support Tickets',
    description:
      'Connect Zendesk to pmkit to analyze support tickets for VoC clustering, escalation tracking, and trend analysis.',
    primaryKeyword: 'Zendesk integration',
    secondaryKeywords: ['Zendesk AI', 'support ticket analysis', 'Zendesk integration'],
    category: 'integrations',
    relatedPages: ['/demo', '/resources/voice-of-customer-clustering', '/resources/customer-escalation-to-fix-spec'],
    workedExample: {
      title: 'Tracking Support Trends for Product',
      scenario: 'A PM wants to understand which product issues are driving the most support tickets.',
      steps: [
        'Connect Zendesk via OAuth in pmkit settings',
        'Configure which ticket views or tags to analyze',
        'Run VoC Clustering with Zendesk as a source',
        'pmkit clusters tickets by theme and tracks trends over time',
        'Daily briefs highlight escalations and trending issues',
      ],
      outcome: 'Product is never surprised by support trends. Escalations surface in daily briefs. VoC reports include quantified support data.',
    },
    keyBenefits: [
      'Cluster support tickets by theme',
      'Track escalations automatically',
      'Quantify issue impact',
      'Identify trends over time',
    ],
    faqItems: [
      {
        question: 'What Zendesk data does pmkit access?',
        answer:
          'pmkit reads tickets, comments, tags, and custom fields. It respects your Zendesk views and permissions.',
      },
      {
        question: 'Can pmkit create or update tickets?',
        answer:
          'pmkit can propose ticket updates (like adding tags) but never writes directly. All changes require your approval.',
      },
      {
        question: 'How do I filter which tickets to analyze?',
        answer:
          'Configure ticket views, tags, or custom field filters in the integration settings.',
      },
      {
        question: 'Does pmkit support Zendesk Suite and Support?',
        answer:
          'Yes. pmkit works with both Zendesk Suite and standalone Zendesk Support.',
      },
    ],
  },

  // Amplitude Integration
  {
    slug: 'amplitude-integration',
    title: 'Amplitude Integration: Product Analytics for PRDs',
    description:
      'Connect Amplitude to pmkit to pull product analytics, feature usage data, and user journeys into PRDs and reports.',
    primaryKeyword: 'Amplitude integration',
    secondaryKeywords: ['product analytics AI', 'Amplitude integration', 'usage data'],
    category: 'integrations',
    relatedPages: ['/demo', '/resources/search-product-analytics-insights', '/resources/prd-automation'],
    workedExample: {
      title: 'Grounding PRDs in Usage Data',
      scenario: 'A PM is drafting a PRD for a feature improvement. They want to include current usage metrics.',
      steps: [
        'Connect Amplitude via OAuth in pmkit settings',
        'Configure which events and properties to sync',
        'Run PRD Draft job with Amplitude as a data source',
        'PRD includes current feature adoption, user segments, and drop-off points',
        'Stakeholders see evidence-based requirements',
      ],
      outcome: 'PRDs include quantitative evidence. Feature decisions are grounded in actual usage. Success metrics are based on current baselines.',
    },
    keyBenefits: [
      'Include usage data in PRDs',
      'Track feature adoption automatically',
      'Identify user segments and behaviors',
      'Set evidence-based success metrics',
    ],
    faqItems: [
      {
        question: 'What Amplitude data does pmkit access?',
        answer:
          'pmkit reads events, user properties, cohorts, and charts. It can query specific metrics but never modifies your Amplitude configuration.',
      },
      {
        question: 'Can I include charts in PRDs?',
        answer:
          'pmkit can reference Amplitude metrics and trends. For visual charts, link to Amplitude dashboards.',
      },
      {
        question: 'How do I configure which events to sync?',
        answer:
          'Select specific events, properties, and cohorts in the integration settings. pmkit only accesses what you configure.',
      },
      {
        question: 'Does pmkit support other analytics tools?',
        answer:
          'Mixpanel and Segment integrations are on the roadmap. Contact us for specific requests.',
      },
    ],
  },

  // Discourse Integration
  {
    slug: 'discourse-integration',
    title: 'Discourse Integration: Monitor Community Discussions',
    description:
      'Connect Discourse to pmkit to monitor community discussions, feature requests, and user feedback.',
    primaryKeyword: 'Discourse integration',
    secondaryKeywords: ['community monitoring', 'Discourse integration', 'feature request tracking'],
    category: 'integrations',
    relatedPages: ['/demo', '/resources/community-ideas-to-roadmap', '/resources/voice-of-customer-clustering'],
    workedExample: {
      title: 'Prioritizing Community Feature Requests',
      scenario: 'The community has hundreds of feature requests. The PM needs to identify which ones to prioritize.',
      steps: [
        'Connect Discourse via API key in pmkit settings',
        'Configure which categories to monitor (Feature Requests, Feedback)',
        'Run VoC Clustering with Discourse as a source',
        'pmkit clusters requests by theme and ranks by engagement',
        'Roadmap alignment memo includes community evidence',
      ],
      outcome: 'Community voice is heard in roadmap decisions. Feature requests are quantified. Users see their feedback matters.',
    },
    keyBenefits: [
      'Track feature requests automatically',
      'Quantify community sentiment',
      'Include community evidence in PRDs',
      'Close the loop with users',
    ],
    faqItems: [
      {
        question: 'What Discourse data does pmkit access?',
        answer:
          'pmkit reads topics, posts, likes, and user activity from configured categories. It respects your Discourse permissions.',
      },
      {
        question: 'Can pmkit post to Discourse?',
        answer:
          'pmkit can propose posts (like feature shipped announcements) but requires your approval before posting.',
      },
      {
        question: 'How do I filter which categories to monitor?',
        answer:
          'Select specific categories in the integration settings. Common choices: Feature Requests, Feedback, Bug Reports.',
      },
      {
        question: 'Does pmkit support other community platforms?',
        answer:
          'GitHub Discussions is supported. Circle and custom platforms are available for enterprise customers.',
      },
    ],
  },

  // Social Crawler Integration
  {
    slug: 'social-crawler-integration',
    title: 'Social Crawler: Monitor Social Media for Product Signal',
    description:
      'Monitor X, Reddit, LinkedIn, Discord, Bluesky, and Threads for mentions, sentiment, and competitive research.',
    primaryKeyword: 'social media monitoring',
    secondaryKeywords: ['social crawler', 'social listening AI', 'brand monitoring'],
    category: 'integrations',
    relatedPages: ['/demo', '/resources/competitor-research', '/resources/voice-of-customer-clustering'],
    workedExample: {
      title: 'Catching a Viral Complaint Before It Escalates',
      scenario: 'A customer posts a complaint on X that starts gaining traction. The Social Crawler surfaces it in the daily brief.',
      steps: [
        'Configure Social Crawler with your brand keywords and competitors',
        'Crawler monitors X, Reddit, and other platforms continuously',
        'High-engagement posts are flagged and included in daily briefs',
        'PM sees the complaint before it goes viral',
        'Team responds proactively, turning a detractor into an advocate',
      ],
      outcome: 'Social issues are caught early. Competitive launches are tracked in real-time. Community sentiment is quantified.',
    },
    keyBenefits: [
      'Monitor multiple platforms from one place',
      'Catch issues before they escalate',
      'Track competitor social presence',
      'Quantify community sentiment',
    ],
    faqItems: [
      {
        question: 'Which platforms does Social Crawler monitor?',
        answer:
          'X (Twitter), Reddit, LinkedIn, Discord (public servers), Bluesky, and Threads. Additional platforms can be added for enterprise customers.',
      },
      {
        question: 'How does keyword monitoring work?',
        answer:
          'Configure brand keywords, competitor names, and product terms. The crawler searches for mentions and tracks engagement metrics.',
      },
      {
        question: 'Can I filter by sentiment?',
        answer:
          'Yes. Social Crawler classifies posts by sentiment (positive, negative, neutral) and can filter alerts by sentiment threshold.',
      },
      {
        question: 'How often is data refreshed?',
        answer:
          'Continuous monitoring with alerts for high-engagement posts. Daily summaries are included in daily briefs.',
      },
    ],
  },

  // Web Search Integration
  {
    slug: 'web-search-integration',
    title: 'Web Search: Competitive Research from the Web',
    description:
      'Search Google and Bing for competitor intelligence, industry news, and market research.',
    primaryKeyword: 'web search integration',
    secondaryKeywords: ['competitive research', 'market research AI', 'web crawler'],
    category: 'integrations',
    relatedPages: ['/demo', '/resources/competitor-research', '/resources/agentic-product-management'],
    workedExample: {
      title: 'Discovering a Competitor Price Change',
      scenario: 'The weekly Competitor Research job uses Web Search to discover a competitor has changed their pricing.',
      steps: [
        'Configure Web Search with competitor domains and keywords',
        'Crawler searches for pricing pages, press releases, and announcements',
        'Competitor Research job synthesizes findings into a report',
        'PM sees the price change before sales encounters it in deals',
        'Sales is briefed with competitive positioning',
      ],
      outcome: 'Competitive changes are discovered proactively. Sales has current intelligence. Product roadmap considers competitive context.',
    },
    keyBenefits: [
      'Discover competitor changes automatically',
      'Track industry news and trends',
      'Research market context for PRDs',
      'Stay ahead of competitive moves',
    ],
    faqItems: [
      {
        question: 'What does Web Search crawl?',
        answer:
          'Web Search queries Google and Bing for configured keywords, then crawls result pages for relevant content. It respects robots.txt and rate limits.',
      },
      {
        question: 'How do I configure search terms?',
        answer:
          'Set up competitor names, product keywords, and industry terms. Web Search combines these into targeted queries.',
      },
      {
        question: 'Can Web Search access paywalled content?',
        answer:
          'No. Web Search only accesses publicly available content. For paywalled sources, use direct integrations.',
      },
      {
        question: 'How is this different from manual Google searches?',
        answer:
          'Web Search runs automatically on schedule, tracks changes over time, and synthesizes findings into structured reports.',
      },
    ],
  },

  // News Crawler Integration
  {
    slug: 'news-crawler-integration',
    title: 'News Crawler: Track Industry News and Press Releases',
    description:
      'Monitor industry news, press releases, and analyst reports for competitive research and market context.',
    primaryKeyword: 'news monitoring',
    secondaryKeywords: ['news crawler', 'press release tracking', 'industry news AI'],
    category: 'integrations',
    relatedPages: ['/demo', '/resources/competitor-research', '/resources/roadmap-alignment-memos'],
    workedExample: {
      title: 'Catching a Competitor Funding Announcement',
      scenario: 'A competitor announces a $50M funding round. News Crawler surfaces it in the daily brief.',
      steps: [
        'Configure News Crawler with competitor names and industry keywords',
        'Crawler monitors news sources, press releases, and tech publications',
        'Funding announcement is detected and classified as high-priority',
        'Daily brief includes the announcement with strategic implications',
        'Leadership is informed before the news spreads internally',
      ],
      outcome: 'Strategic news is surfaced proactively. Competitive context informs roadmap discussions. No one is caught off-guard.',
    },
    keyBenefits: [
      'Track competitor announcements',
      'Monitor industry trends',
      'Surface strategic news automatically',
      'Inform roadmap with market context',
    ],
    faqItems: [
      {
        question: 'What news sources does News Crawler monitor?',
        answer:
          'Major tech publications, industry-specific news sites, press release wires, and company newsrooms. Enterprise customers can add custom sources.',
      },
      {
        question: 'How are news items prioritized?',
        answer:
          'News Crawler classifies items by relevance (competitor mention, industry trend, direct impact) and source authority.',
      },
      {
        question: 'Can I get alerts for specific topics?',
        answer:
          'Yes. Configure alert rules for specific competitors, topics, or news types. Alerts can be delivered via Slack or email.',
      },
      {
        question: 'How far back does News Crawler search?',
        answer:
          'Continuous monitoring for new content. Historical search available for the past 30 days.',
      },
    ],
  },

  // URL Scraper Integration
  {
    slug: 'url-scraper-integration',
    title: 'URL Scraper: Deep Analysis of Specific Pages',
    description:
      'Fetch and analyze specific URLs for deep competitive research on pricing, features, and positioning.',
    primaryKeyword: 'url scraper',
    secondaryKeywords: ['page analysis', 'competitive page scraping', 'pricing page analysis'],
    category: 'integrations',
    relatedPages: ['/demo', '/resources/competitor-research', '/resources/web-search-integration'],
    workedExample: {
      title: 'Analyzing Competitor Pricing Pages',
      scenario: 'You want to compare pricing structures across 5 competitors. URL Scraper fetches and analyzes each pricing page.',
      steps: [
        'Enter competitor pricing page URLs',
        'URL Scraper fetches and extracts content from each page',
        'AI analyzes pricing tiers, features, and positioning',
        'Structured comparison is generated with insights',
        'Battlecard is updated with current pricing intelligence',
      ],
      outcome: 'Pricing intelligence is always current. Feature comparisons are automated. Competitive positioning is data-driven.',
    },
    keyBenefits: [
      'Deep-dive into specific competitor pages',
      'Extract structured data from unstructured content',
      'Compare pricing and features across competitors',
      'Track page changes over time',
    ],
    faqItems: [
      {
        question: 'What types of pages can URL Scraper analyze?',
        answer:
          'Pricing pages, feature pages, blog posts, documentation, landing pages, and any publicly accessible web page.',
      },
      {
        question: 'How does URL Scraper differ from Web Search?',
        answer:
          'Web Search finds pages based on keywords. URL Scraper does deep analysis of specific URLs you provide. Use Web Search to discover pages, then URL Scraper to analyze them in detail.',
      },
      {
        question: 'Can URL Scraper extract pricing information?',
        answer:
          'Yes. The AI analyzes page content to extract pricing tiers, features per tier, and pricing models (per-seat, usage-based, etc.).',
      },
      {
        question: 'How many URLs can I analyze at once?',
        answer:
          'Up to 10 URLs per analysis job. For larger batches, schedule multiple jobs or use the API.',
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
