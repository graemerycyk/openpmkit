// ============================================================================
// Blog Post Definitions
// ============================================================================

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // ISO date string
  author: string;
  authorRole: string;
  primaryKeyword: string;
  tags: BlogTag[];
  readingTime: number; // minutes
  relatedResources: string[];
  relatedPosts: string[];
  featured?: boolean; // Featured posts appear first on the blog page
}

export type BlogTag =
  | 'agents'
  | 'product-management'
  | 'voc'
  | 'roadmaps'
  | 'integrations'
  | 'security-governance'
  | 'competitor-research'
  | 'founders-notes';

export const blogPosts: BlogPost[] = [
  // Deck Content blog post
  {
    slug: 'deck-content-ai-slide-generation',
    title: 'Deck Content: AI-Generated Slide Content for Every PM Presentation',
    description:
      'Learn how to generate tailored slide content for exec, customer, team, or stakeholder presentations—headlines, bullets, speaker notes, and Q&A prep in minutes.',
    publishedAt: '2026-01-17',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'AI slide content',
    tags: ['agents', 'product-management'],
    readingTime: 10,
    relatedResources: ['deck-content-generation', 'roadmap-alignment-memos', 'product-ops-automation'],
    relatedPosts: ['10-pm-workflows-automate-today', 'enterprise-pm-toolkit', 'prd-to-prototype-ai-ui-generation'],
    featured: true,
  },
  // AI Crawler blog posts
  {
    slug: 'reddit-to-roadmap-mining-social-platforms',
    title: 'From Reddit Thread to Roadmap: Mining Social Platforms for Product Signal',
    description:
      'How to systematically extract product insights from Reddit, Hacker News, and other communities—turning user discussions into roadmap priorities.',
    publishedAt: '2026-01-16',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'reddit product feedback',
    tags: ['voc', 'product-management', 'agents'],
    readingTime: 11,
    relatedResources: ['social-crawler-integration', 'community-to-roadmap', 'voice-of-customer-clustering'],
    relatedPosts: ['voice-of-customer-at-scale', 'social-listening-for-product-managers', 'from-slack-to-prd'],
  },
  {
    slug: 'competitive-research-system-ai-crawlers',
    title: 'Building a Competitive Research System with AI Crawlers',
    description:
      'A practical guide to building an automated competitive research system using four AI crawlers—Social, Web Search, News, and URL Scraper—from setup to daily briefs.',
    publishedAt: '2026-01-15',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'competitive research automation',
    tags: ['competitor-research', 'agents', 'integrations'],
    readingTime: 14,
    relatedResources: ['web-search-integration', 'news-crawler-integration', 'url-scraper-integration', 'competitor-research'],
    relatedPosts: ['competitor-research', '10-pm-workflows-automate-today', 'enterprise-pm-toolkit'],
  },
  {
    slug: 'social-listening-for-product-managers',
    title: 'Social Listening for Product Managers: Finding Product Signal in the Noise',
    description:
      'Learn how PMs can use social listening differently than marketing—finding feature requests, competitive mentions, and early warning signals on Reddit, X, and Hacker News.',
    publishedAt: '2026-01-14',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'social listening product management',
    tags: ['voc', 'competitor-research', 'agents'],
    readingTime: 12,
    relatedResources: ['social-crawler-integration', 'voice-of-customer-clustering', 'competitor-research'],
    relatedPosts: ['voice-of-customer-at-scale', 'competitor-research', 'from-slack-to-prd'],
  },
  {
    slug: 'artifact-chaining-ai-agents-build-on-work',
    title: 'Artifact Chaining: How AI Agents Build on Their Own Work',
    description:
      'Learn how AI agents can reference and build upon their previous outputs, creating compound value through artifact chaining—from VoC reports to PRDs to prototypes.',
    publishedAt: '2026-01-13',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'AI agent memory',
    tags: ['agents', 'product-management'],
    readingTime: 11,
    relatedResources: ['product-management-agent', 'agentic-product-management', 'prd-automation'],
    relatedPosts: ['what-is-a-product-management-agent', 'prd-to-prototype-ai-ui-generation', 'draft-only-ai-agents'],
  },
  {
    slug: 'sprint-review-vs-release-notes',
    title: 'Sprint Review vs Release Notes: Internal vs External Communication',
    description:
      'Understand the key differences between sprint reviews and release notes—who reads them, what they contain, and how to automate both without losing quality.',
    publishedAt: '2026-01-12',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'sprint review vs release notes',
    tags: ['product-management', 'agents'],
    readingTime: 13,
    relatedResources: ['ai-release-notes-and-sprint-review-packs', 'product-ops-automation'],
    relatedPosts: ['ai-release-notes-from-jira', 'product-ops-automation', 'enterprise-pm-toolkit'],
  },
  {
    slug: 'mcp-for-product-management',
    title: 'MCP for Product Management: Connecting Your PM Stack',
    description:
      'A practical guide to MCP (Model Context Protocol) for product managers—how it connects Jira, Confluence, Slack, Gong, and more into unified AI workflows.',
    publishedAt: '2026-01-11',
    author: 'pmkit team',
    authorRole: 'Engineering',
    primaryKeyword: 'MCP product management',
    tags: ['integrations', 'agents'],
    readingTime: 14,
    relatedResources: ['jira-and-confluence-ai-workflows'],
    relatedPosts: ['agent-workflows-with-mcp', 'jira-confluence-slack-operating-system', 'what-is-a-product-management-agent'],
  },
  {
    slug: '10-pm-workflows-automate-today',
    title: '10 PM Workflows You Can Automate Today',
    description:
      'A comprehensive guide to the ten product management workflows you can automate with AI agents—from daily briefs to deck content, with time savings for each.',
    publishedAt: '2026-01-10',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'PM workflow automation',
    tags: ['agents', 'product-management'],
    readingTime: 15,
    relatedResources: ['product-management-agent', 'product-ops-automation', 'agentic-product-management'],
    relatedPosts: ['what-is-a-product-management-agent', 'enterprise-pm-toolkit', 'product-ops-automation'],
  },
  {
    slug: 'ai-release-notes-from-jira',
    title: 'AI-Generated Release Notes: From Jira Tickets to Customer-Ready Updates',
    description:
      'Learn how to generate customer-facing release notes automatically from Jira tickets, saving hours per release while improving communication with customers and sales teams.',
    publishedAt: '2026-01-09',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'AI release notes',
    tags: ['agents', 'product-management', 'integrations'],
    readingTime: 12,
    relatedResources: ['ai-release-notes-sprint-review', 'jira-confluence-integration', 'product-ops-automation'],
    relatedPosts: ['product-ops-automation', 'jira-confluence-slack-operating-system', 'prd-automation-without-hallucination'],
  },
  {
    slug: 'prd-to-prototype-ai-ui-generation',
    title: 'PRD to Prototype: AI-Generated UI from Product Requirements',
    description:
      'Learn how to generate functional UI prototypes directly from PRDs using AI, accelerating validation and reducing time to user feedback from weeks to minutes.',
    publishedAt: '2026-01-08',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'PRD to prototype',
    tags: ['agents', 'product-management'],
    readingTime: 14,
    relatedResources: ['prd-automation', 'product-management-agent', 'agentic-product-management'],
    relatedPosts: ['prd-automation-without-hallucination', 'from-slack-to-prd', 'enterprise-pm-toolkit'],
    featured: true,
  },
  {
    slug: '2026-year-of-ai-agents-manus-meta',
    title: "Why 2026 Will Be the Year of AI Agents (and What Meta's Manus Deal Signals)",
    description:
      "A 2025 AI recap and a 2026 forecast: why agents didn't break out last year, what changed, and what the Meta-Manus deal signals.",
    publishedAt: '2026-01-07',
    author: 'Graeme Rycyk',
    authorRole: 'Founder',
    primaryKeyword: 'AI agents 2026',
    tags: ['founders-notes', 'agents'],
    readingTime: 10,
    relatedResources: ['product-management-agent', 'draft-only-ai-agent'],
    relatedPosts: ['what-is-a-product-management-agent', 'draft-only-ai-agents', 'agent-workflows-with-mcp'],
  },
  {
    slug: 'what-is-a-product-management-agent',
    title: 'What is a Product Management Agent? A practical guide for enterprise SaaS',
    description:
      'Learn what product management agents are, how they differ from copilots, and how enterprise teams use them to automate PM workflows while maintaining control.',
    publishedAt: '2026-01-04',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'product management agent',
    tags: ['agents', 'product-management'],
    readingTime: 12,
    relatedResources: ['product-management-agent', 'agentic-product-management', 'draft-only-ai-agent'],
    relatedPosts: ['draft-only-ai-agents', 'why-ai-pm-copilot-is-not-enough'],
  },
  {
    slug: 'draft-only-ai-agents',
    title: 'Draft-only AI agents: how to get autonomy without losing control',
    description:
      'Explore the draft-only pattern for AI agents; how to give agents autonomy over workflows while keeping humans in control of all external writes.',
    publishedAt: '2026-01-03',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'draft-only AI agent',
    tags: ['agents', 'security-governance'],
    readingTime: 10,
    relatedResources: ['draft-only-ai-agent', 'enterprise-pm-governance'],
    relatedPosts: ['what-is-a-product-management-agent', 'enterprise-pm-toolkit'],
  },
  {
    slug: 'from-slack-to-prd',
    title: 'From Slack to PRD: turning internal signal into scoped product work',
    description:
      'A practical guide to capturing product signal from Slack conversations and transforming it into well-scoped PRDs with AI assistance.',
    publishedAt: '2026-01-02',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'Slack to PRD',
    tags: ['integrations', 'product-management'],
    readingTime: 11,
    relatedResources: ['slack-to-jira-draft-epics', 'prd-automation'],
    relatedPosts: ['prd-automation-without-hallucination', 'gong-transcripts-to-product-insights'],
  },
  {
    slug: 'voice-of-customer-at-scale',
    title: 'Voice of Customer at scale: clustering themes from support, community, and calls',
    description:
      'How to synthesize customer feedback from multiple sources into actionable themes using AI-powered clustering and evidence-based analysis.',
    publishedAt: '2026-01-01',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'voice of customer clustering',
    tags: ['voc', 'product-management'],
    readingTime: 13,
    relatedResources: ['voice-of-customer-clustering', 'gong-transcripts-to-product-insights'],
    relatedPosts: ['gong-transcripts-to-product-insights', 'customer-escalations-pipeline'],
  },
  {
    slug: 'meeting-prep-packs-for-pms',
    title: 'Meeting prep packs for PMs: the fastest way to compound product insight',
    description:
      'Learn how AI-generated meeting prep packs help PMs arrive prepared with customer context, open issues, and strategic talking points.',
    publishedAt: '2025-12-31',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'meeting prep for PMs',
    tags: ['product-management', 'integrations'],
    readingTime: 9,
    relatedResources: ['meeting-prep-pack-for-product-managers', 'gong-transcripts-to-product-insights'],
    relatedPosts: ['gong-transcripts-to-product-insights', 'voice-of-customer-at-scale'],
  },
  {
    slug: 'competitor-research',
    title: 'Competitor research: tracking product changes and why they matter',
    description:
      'A systematic approach to competitor product research that tracks pricing, features, and releases with strategic implications.',
    publishedAt: '2025-12-30',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'competitor research',
    tags: ['competitor-research', 'product-management'],
    readingTime: 10,
    relatedResources: ['competitor-research', 'roadmap-alignment-memos'],
    relatedPosts: ['roadmap-alignment-memos', 'agentic-roadmaps'],
  },
  {
    slug: 'roadmap-alignment-memos',
    title: 'Roadmap alignment memos: options, trade-offs, and executive-ready decisions',
    description:
      'How to create alignment memos that present roadmap options with evidence, trade-offs, and clear recommendations for stakeholder decisions.',
    publishedAt: '2025-12-29',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'roadmap alignment',
    tags: ['roadmaps', 'product-management'],
    readingTime: 11,
    relatedResources: ['roadmap-alignment-memos', 'agentic-product-management'],
    relatedPosts: ['agentic-roadmaps', 'competitor-research'],
  },
  {
    slug: 'prd-automation-without-hallucination',
    title: 'PRD automation that doesn\'t hallucinate: evidence, assumptions, and open questions',
    description:
      'How to use AI for PRD drafting while avoiding hallucination through evidence grounding, explicit assumptions, and structured open questions.',
    publishedAt: '2025-12-28',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'PRD automation',
    tags: ['product-management', 'agents'],
    readingTime: 12,
    relatedResources: ['prd-automation', 'voice-of-customer-clustering'],
    relatedPosts: ['from-slack-to-prd', 'voice-of-customer-at-scale'],
  },
  {
    slug: 'agent-workflows-with-mcp',
    title: 'How to design agent workflows with MCP connectors (and why it matters)',
    description:
      'A technical guide to designing AI agent workflows using MCP (Model Context Protocol) connectors for enterprise tool integration.',
    publishedAt: '2025-12-27',
    author: 'pmkit team',
    authorRole: 'Engineering',
    primaryKeyword: 'MCP connectors',
    tags: ['integrations', 'agents'],
    readingTime: 14,
    relatedResources: ['jira-and-confluence-ai-workflows'],
    relatedPosts: ['what-is-a-product-management-agent', 'jira-confluence-slack-operating-system'],
  },
  {
    slug: 'gong-transcripts-to-product-insights',
    title: 'Gong transcripts to product insights: extracting problems, quotes, and success criteria',
    description:
      'How to systematically extract product insights from Gong call transcripts including pain points, feature requests, and competitive mentions.',
    publishedAt: '2025-12-26',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'Gong transcripts to product insights',
    tags: ['voc', 'integrations'],
    readingTime: 11,
    relatedResources: ['gong-transcripts-to-product-insights', 'voice-of-customer-clustering'],
    relatedPosts: ['voice-of-customer-at-scale', 'meeting-prep-packs-for-pms'],
  },
  {
    slug: 'customer-escalations-pipeline',
    title: 'Customer escalations: building a repeatable escalation → fix pipeline',
    description:
      'How to turn customer escalations into fix specifications with root cause analysis, scope definition, and success criteria.',
    publishedAt: '2025-12-25',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'customer escalation to fix spec',
    tags: ['product-management', 'voc'],
    readingTime: 10,
    relatedResources: ['customer-escalation-to-fix-spec', 'voice-of-customer-clustering'],
    relatedPosts: ['voice-of-customer-at-scale', 'product-ops-automation'],
  },
  {
    slug: 'product-ops-automation',
    title: 'Product ops automation: what to standardize first in an enterprise team',
    description:
      'A prioritization framework for product ops automation; which workflows to standardize first and how to measure success.',
    publishedAt: '2025-12-24',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'product ops automation',
    tags: ['product-management', 'agents'],
    readingTime: 12,
    relatedResources: ['product-ops-automation', 'ai-release-notes-and-sprint-review-packs'],
    relatedPosts: ['enterprise-pm-toolkit', 'customer-escalations-pipeline'],
  },
  {
    slug: 'cross-team-dependencies',
    title: 'Cross-team dependencies: how agents detect drift before it burns a sprint',
    description:
      'Using AI agents to monitor cross-team dependencies, detect risks early, and facilitate proactive communication.',
    publishedAt: '2025-12-23',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'cross-team dependencies',
    tags: ['product-management', 'agents'],
    readingTime: 9,
    relatedResources: ['ai-for-cross-team-dependencies', 'product-ops-automation'],
    relatedPosts: ['product-ops-automation', 'jira-confluence-slack-operating-system'],
  },
  {
    slug: 'jira-confluence-slack-operating-system',
    title: 'Jira + Confluence + Slack: a practical operating system for product delivery',
    description:
      'How to configure Jira, Confluence, and Slack as an integrated operating system for product teams with AI automation.',
    publishedAt: '2025-12-22',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'Jira Confluence Slack',
    tags: ['integrations', 'product-management'],
    readingTime: 13,
    relatedResources: ['jira-and-confluence-ai-workflows', 'slack-to-jira-draft-epics'],
    relatedPosts: ['agent-workflows-with-mcp', 'cross-team-dependencies'],
  },
  {
    slug: 'ai-for-search-products',
    title: 'AI for search products: using analytics signals to prioritize what matters',
    description:
      'How product teams can use search analytics (no-results queries, CTR, trends) to inform roadmap priorities and content strategy.',
    publishedAt: '2025-12-21',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'search product analytics',
    tags: ['integrations', 'product-management'],
    readingTime: 10,
    relatedResources: ['search-product-analytics-insights', 'voice-of-customer-clustering'],
    relatedPosts: ['voice-of-customer-at-scale', 'roadmap-alignment-memos'],
  },
  {
    slug: 'agentic-roadmaps',
    title: 'Agentic roadmaps: building strategy that updates with real customer evidence',
    description:
      'How to create living roadmaps that automatically incorporate customer evidence, competitive changes, and analytics signals.',
    publishedAt: '2025-12-20',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'agentic roadmaps',
    tags: ['roadmaps', 'agents'],
    readingTime: 11,
    relatedResources: ['agentic-product-management', 'roadmap-alignment-memos'],
    relatedPosts: ['roadmap-alignment-memos', 'voice-of-customer-at-scale'],
  },
  {
    slug: 'enterprise-pm-toolkit',
    title: 'The enterprise PM toolkit: briefs, themes, PRDs, and sprint review packs',
    description:
      'A comprehensive guide to the essential PM artifacts for enterprise teams and how AI agents can automate their creation.',
    publishedAt: '2025-12-19',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'enterprise PM toolkit',
    tags: ['product-management', 'agents'],
    readingTime: 14,
    relatedResources: ['product-management-agent', 'prd-automation', 'ai-release-notes-and-sprint-review-packs'],
    relatedPosts: ['what-is-a-product-management-agent', 'product-ops-automation'],
  },
  {
    slug: 'why-ai-pm-copilot-is-not-enough',
    title: 'Why "AI PM copilot" is not enough: the case for multi-step PM jobs',
    description:
      'Why single-prompt copilots fall short for PM work and how multi-step agents that run complete workflows deliver better results.',
    publishedAt: '2025-12-18',
    author: 'pmkit team',
    authorRole: 'Product',
    primaryKeyword: 'AI PM copilot',
    tags: ['agents', 'product-management'],
    readingTime: 10,
    relatedResources: ['product-management-agent', 'agentic-product-management'],
    relatedPosts: ['what-is-a-product-management-agent', 'draft-only-ai-agents'],
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getBlogPostsByTag(tag: BlogTag): BlogPost[] {
  return blogPosts.filter((p) => p.tags.includes(tag));
}

export function getAllBlogSlugs(): string[] {
  return blogPosts.map((p) => p.slug);
}

export function getRecentBlogPosts(limit: number = 10): BlogPost[] {
  return [...blogPosts]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

export function getRelatedPosts(slug: string, limit: number = 3): BlogPost[] {
  const post = getBlogPostBySlug(slug);
  if (!post) return [];

  return post.relatedPosts
    .map((s) => getBlogPostBySlug(s))
    .filter((p): p is BlogPost => p !== undefined)
    .slice(0, limit);
}

export const blogTags: { value: BlogTag; label: string }[] = [
  { value: 'agents', label: 'Agents' },
  { value: 'product-management', label: 'Product Management' },
  { value: 'voc', label: 'VoC' },
  { value: 'roadmaps', label: 'Roadmaps' },
  { value: 'integrations', label: 'Integrations' },
  { value: 'security-governance', label: 'Security/Governance' },
  { value: 'competitor-research', label: 'Competitor Research' },
  { value: 'founders-notes', label: "Founder's Notes" },
];

