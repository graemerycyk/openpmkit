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
}

export type BlogTag =
  | 'agents'
  | 'product-management'
  | 'voc'
  | 'roadmaps'
  | 'integrations'
  | 'security-governance'
  | 'competitor-research';

export const blogPosts: BlogPost[] = [
  {
    slug: 'what-is-a-product-management-agent',
    title: 'What is a Product Management Agent? A practical guide for enterprise SaaS',
    description:
      'Learn what product management agents are, how they differ from copilots, and how enterprise teams use them to automate PM workflows while maintaining control.',
    publishedAt: '2025-12-29',
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
    publishedAt: '2025-12-25',
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
    publishedAt: '2025-12-21',
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
    publishedAt: '2025-12-17',
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
    publishedAt: '2025-12-13',
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
    publishedAt: '2025-12-09',
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
    publishedAt: '2025-12-05',
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
    publishedAt: '2025-11-30',
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
    publishedAt: '2025-11-24',
    author: 'pmkit team',
    authorRole: 'Engineering',
    primaryKeyword: 'MCP connectors',
    tags: ['integrations', 'agents'],
    readingTime: 14,
    relatedResources: ['mcp-connectors-for-enterprise-tools', 'jira-and-confluence-ai-workflows'],
    relatedPosts: ['what-is-a-product-management-agent', 'jira-confluence-slack-operating-system'],
  },
  {
    slug: 'gong-transcripts-to-product-insights',
    title: 'Gong transcripts to product insights: extracting problems, quotes, and success criteria',
    description:
      'How to systematically extract product insights from Gong call transcripts including pain points, feature requests, and competitive mentions.',
    publishedAt: '2025-11-18',
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
    publishedAt: '2025-11-12',
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
    publishedAt: '2025-11-06',
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
    publishedAt: '2025-10-31',
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
    publishedAt: '2025-10-27',
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
    publishedAt: '2025-10-24',
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
    publishedAt: '2025-10-22',
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
    publishedAt: '2025-10-21',
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
    publishedAt: '2025-10-20',
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
];

