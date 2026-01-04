// ============================================================================
// Keyword Strategy Map
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
    keyword: 'MCP connectors enterprise',
    category: 'long-tail',
    searchVolume: 'low',
    difficulty: 'low',
    intent: 'informational',
    relatedPages: ['/resources/mcp-connectors-for-enterprise-tools', '/how-it-works'],
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

