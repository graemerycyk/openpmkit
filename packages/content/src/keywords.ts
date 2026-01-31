// ============================================================================
// Keyword Strategy Map
// Last updated: 2026-01-26
// ============================================================================

export interface KeywordEntry {
  keyword: string;
  category: 'primary' | 'adjacent' | 'integration' | 'long-tail';
  searchVolume: 'high' | 'medium' | 'low';
  difficulty: 'high' | 'medium' | 'low';
  intent: 'informational' | 'commercial' | 'transactional';
  relatedPages: string[];
}

export const keywords: KeywordEntry[] = [
  // Primary Keywords
  {
    keyword: 'product management agent',
    category: 'primary',
    searchVolume: 'medium',
    difficulty: 'medium',
    intent: 'commercial',
    relatedPages: ['/resources/product-management-agent', '/demo', '/how-it-works'],
  },
  {
    keyword: 'AI PM agent',
    category: 'primary',
    searchVolume: 'medium',
    difficulty: 'medium',
    intent: 'commercial',
    relatedPages: ['/resources/ai-product-manager-assistant', '/demo'],
  },
  {
    keyword: 'PM copilot',
    category: 'primary',
    searchVolume: 'medium',
    difficulty: 'high',
    intent: 'commercial',
    relatedPages: ['/resources/ai-product-manager-assistant', '/'],
  },
  {
    keyword: 'agentic product management',
    category: 'primary',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/resources/agentic-product-management', '/blog'],
  },
  {
    keyword: 'PRD automation',
    category: 'primary',
    searchVolume: 'medium',
    difficulty: 'medium',
    intent: 'commercial',
    relatedPages: ['/resources/prd-automation', '/demo'],
  },

  // Adjacent Keywords
  {
    keyword: 'voice of customer AI',
    category: 'adjacent',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/resources/voice-of-customer-clustering', '/demo'],
  },
  {
    keyword: 'roadmap alignment',
    category: 'adjacent',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/resources/roadmap-alignment-memos', '/demo'],
  },
  {
    keyword: 'meeting prep for PMs',
    category: 'adjacent',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/resources/meeting-prep-pack-for-product-managers', '/demo'],
  },
  {
    keyword: 'product ops automation',
    category: 'adjacent',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/resources/product-ops-automation', '/demo'],
  },
  {
    keyword: 'competitor monitoring for product',
    category: 'adjacent',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/resources/competitor-research', '/demo'],
  },

  // Integration-Intent Keywords
  {
    keyword: 'Slack to Jira',
    category: 'integration',
    searchVolume: 'medium',
    difficulty: 'high',
    intent: 'commercial',
    relatedPages: ['/resources/slack-to-jira-draft-epics', '/demo'],
  },
  {
    keyword: 'Gong to PRD',
    category: 'integration',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'commercial',
    relatedPages: ['/resources/gong-transcripts-to-product-insights', '/demo'],
  },
  {
    keyword: 'community to roadmap',
    category: 'integration',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/resources/community-ideas-to-roadmap', '/demo'],
  },
  {
    keyword: 'PX analytics insights',
    category: 'integration',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/resources/search-product-analytics-insights', '/demo'],
  },
  {
    keyword: 'Algolia search analytics',
    category: 'integration',
    searchVolume: 'low',
    difficulty: 'medium',
    intent: 'informational',
    relatedPages: ['/resources/search-product-analytics-insights', '/demo'],
  },

  // Long-tail Keywords
  {
    keyword: 'AI for enterprise product management',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'commercial',
    relatedPages: ['/resources/enterprise-pm-governance', '/pricing'],
  },
  {
    keyword: 'draft-only AI agent',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/resources/draft-only-ai-agent', '/how-it-works'],
  },
  {
    keyword: 'enterprise connectors',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/integrations', '/how-it-works'],
  },
  {
    keyword: 'Jira Confluence AI workflows',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'commercial',
    relatedPages: ['/resources/jira-and-confluence-ai-workflows', '/demo'],
  },
  {
    keyword: 'customer escalation to fix spec',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/resources/customer-escalation-to-fix-spec', '/demo'],
  },

  // Feature Intelligence Keywords
  {
    keyword: 'feature intelligence',
    category: 'primary',
    searchVolume: 'medium',
    difficulty: 'low',
    intent: 'commercial',
    relatedPages: ['/feature-intelligence', '/demo', '/blog/feature-intelligence-vs-customer-intelligence'],
  },
  {
    keyword: 'feature prioritization AI',
    category: 'adjacent',
    searchVolume: 'medium',
    difficulty: 'medium',
    intent: 'commercial',
    relatedPages: ['/feature-intelligence', '/demo'],
  },
  {
    keyword: 'product intelligence platform',
    category: 'primary',
    searchVolume: 'medium',
    difficulty: 'medium',
    intent: 'commercial',
    relatedPages: ['/', '/feature-intelligence', '/demo'],
  },
  {
    keyword: 'feature intelligence vs customer intelligence',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/blog/feature-intelligence-vs-customer-intelligence', '/feature-intelligence'],
  },
  {
    keyword: 'AI feature recommendations',
    category: 'adjacent',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'commercial',
    relatedPages: ['/feature-intelligence', '/demo'],
  },
  {
    keyword: 'product management intelligence',
    category: 'primary',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/', '/feature-intelligence', '/resources/product-management-agent'],
  },
  {
    keyword: 'operational intelligence PM',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/', '/templates/daily-brief'],
  },
  {
    keyword: 'stakeholder intelligence PM',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/', '/templates/meeting-prep'],
  },

  // PRD to Prototype Keywords
  {
    keyword: 'PRD to prototype',
    category: 'primary',
    searchVolume: 'medium',
    difficulty: 'low',
    intent: 'commercial',
    relatedPages: ['/demo', '/resources/prd-automation', '/blog/prd-to-prototype-ai-ui-generation'],
  },
  {
    keyword: 'AI UI generation from PRD',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/demo', '/blog/prd-to-prototype-ai-ui-generation'],
  },
  {
    keyword: 'generate prototype from requirements',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'commercial',
    relatedPages: ['/demo', '/resources/prd-automation'],
  },
  {
    keyword: 'AI prototype generator',
    category: 'adjacent',
    searchVolume: 'medium',
    difficulty: 'medium',
    intent: 'commercial',
    relatedPages: ['/demo', '/blog/prd-to-prototype-ai-ui-generation'],
  },
  {
    keyword: 'PRD to UI mockup',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/demo', '/resources/prd-automation'],
  },
  {
    keyword: 'automated UI prototyping',
    category: 'adjacent',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'commercial',
    relatedPages: ['/demo', '/blog/prd-to-prototype-ai-ui-generation'],
  },
  {
    keyword: 'AI mockup generator from requirements',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'commercial',
    relatedPages: ['/demo', '/resources/prd-to-prototype-generation'],
  },

  // Release Notes Keywords
  {
    keyword: 'AI release notes',
    category: 'primary',
    searchVolume: 'medium',
    difficulty: 'medium',
    intent: 'commercial',
    relatedPages: ['/demo', '/resources/ai-release-notes-sprint-review', '/blog/ai-release-notes-from-jira'],
  },
  {
    keyword: 'release notes generator',
    category: 'adjacent',
    searchVolume: 'medium',
    difficulty: 'medium',
    intent: 'commercial',
    relatedPages: ['/demo', '/resources/ai-release-notes-sprint-review'],
  },
  {
    keyword: 'automated release notes from Jira',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'commercial',
    relatedPages: ['/demo', '/blog/ai-release-notes-from-jira', '/resources/jira-confluence-integration'],
  },
  {
    keyword: 'generate release notes from tickets',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/blog/ai-release-notes-from-jira', '/demo'],
  },
  {
    keyword: 'customer-facing release notes AI',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'commercial',
    relatedPages: ['/demo', '/resources/ai-release-notes-sprint-review'],
  },
  {
    keyword: 'changelog automation',
    category: 'adjacent',
    searchVolume: 'medium',
    difficulty: 'medium',
    intent: 'commercial',
    relatedPages: ['/demo', '/blog/ai-release-notes-from-jira'],
  },
  {
    keyword: 'release notes for sales enablement',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/blog/ai-release-notes-from-jira', '/resources/ai-release-notes-sprint-review'],
  },

  // Artifact Chaining Keywords
  {
    keyword: 'AI agent memory',
    category: 'primary',
    searchVolume: 'medium',
    difficulty: 'medium',
    intent: 'informational',
    relatedPages: ['/blog/artifact-chaining-ai-agents-build-on-work', '/resources/agentic-product-management'],
  },
  {
    keyword: 'artifact chaining',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/blog/artifact-chaining-ai-agents-build-on-work', '/how-it-works'],
  },
  {
    keyword: 'connected AI workflows',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/blog/artifact-chaining-ai-agents-build-on-work', '/demo'],
  },
  {
    keyword: 'AI agent context persistence',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/blog/artifact-chaining-ai-agents-build-on-work', '/resources/product-management-agent'],
  },
  {
    keyword: 'compound AI workflows',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'commercial',
    relatedPages: ['/blog/artifact-chaining-ai-agents-build-on-work', '/demo'],
  },

  // Sprint Review vs Release Notes Keywords
  {
    keyword: 'sprint review vs release notes',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/blog/sprint-review-vs-release-notes', '/resources/ai-release-notes-sprint-review'],
  },
  {
    keyword: 'internal vs external product updates',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/blog/sprint-review-vs-release-notes', '/blog/ai-release-notes-from-jira'],
  },
  {
    keyword: 'sprint review automation',
    category: 'adjacent',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'commercial',
    relatedPages: ['/blog/sprint-review-vs-release-notes', '/demo', '/resources/ai-release-notes-sprint-review'],
  },

  // MCP for Product Management Keywords
  {
    keyword: 'AI product management integrations',
    category: 'primary',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/blog/mcp-for-product-management', '/integrations'],
  },
  {
    keyword: 'AI PM integrations',
    category: 'adjacent',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'commercial',
    relatedPages: ['/blog/mcp-for-product-management', '/demo'],
  },
  {
    keyword: 'connected PM tools',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/blog/mcp-for-product-management', '/how-it-works'],
  },
  {
    keyword: 'Model Context Protocol PM',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/blog/mcp-for-product-management', '/blog/agent-workflows-with-mcp'],
  },
  {
    keyword: 'MCP Jira Confluence Slack',
    category: 'integration',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'commercial',
    relatedPages: ['/blog/mcp-for-product-management', '/resources/jira-and-confluence-ai-workflows'],
  },

  // 10 PM Workflows Keywords
  {
    keyword: 'PM workflow automation',
    category: 'primary',
    searchVolume: 'medium',
    difficulty: 'medium',
    intent: 'commercial',
    relatedPages: ['/blog/10-pm-workflows-automate-today', '/demo', '/how-it-works'],
  },
  {
    keyword: 'product management automation',
    category: 'primary',
    searchVolume: 'medium',
    difficulty: 'high',
    intent: 'commercial',
    relatedPages: ['/blog/10-pm-workflows-automate-today', '/resources/product-ops-automation'],
  },
  {
    keyword: 'AI PM workflows',
    category: 'adjacent',
    searchVolume: 'medium',
    difficulty: 'medium',
    intent: 'commercial',
    relatedPages: ['/blog/10-pm-workflows-automate-today', '/demo'],
  },
  {
    keyword: 'automate PM tasks',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'commercial',
    relatedPages: ['/blog/10-pm-workflows-automate-today', '/resources/product-management-agent'],
  },
  {
    keyword: 'product manager daily brief automation',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/blog/10-pm-workflows-automate-today', '/demo'],
  },
  {
    keyword: 'AI meeting prep for PMs',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'commercial',
    relatedPages: ['/blog/10-pm-workflows-automate-today', '/resources/meeting-prep-pack-for-product-managers'],
  },
];

export function getKeywordsByCategory(category: KeywordEntry['category']): KeywordEntry[] {
  return keywords.filter((k) => k.category === category);
}

export function getKeywordsByIntent(intent: KeywordEntry['intent']): KeywordEntry[] {
  return keywords.filter((k) => k.intent === intent);
}

export function getRelatedKeywords(page: string): KeywordEntry[] {
  return keywords.filter((k) => k.relatedPages.includes(page));
}

