import type { LLMService, LLMMessage } from '@pmkit/core';

// ============================================================================
// Crawler Analysis Types
// ============================================================================

export type CrawlerType = 'social' | 'web_search' | 'news';

export interface CrawlerAnalysisContext {
  crawlerType: CrawlerType;
  keywords: string[];
  platforms?: string[];
  results: Array<{
    source: string;
    title: string;
    content: string;
    url?: string;
    author?: string;
    publishedAt?: string;
    metadata?: Record<string, unknown>;
  }>;
  productName?: string;
  competitors?: string[];
}

export interface CrawlerAnalysis {
  summary: string;
  themes: Array<{
    name: string;
    description: string;
    mentionCount: number;
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    keyQuotes: string[];
    sources: string[];
  }>;
  overallSentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
  competitorMentions: Array<{
    competitor: string;
    context: string;
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    source: string;
    url?: string;
  }>;
  insights: Array<{
    type: 'opportunity' | 'threat' | 'trend' | 'action_item';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    evidence: string[];
  }>;
  topQuotes: Array<{
    quote: string;
    source: string;
    url?: string;
    relevance: string;
  }>;
  recommendations: string[];
}

export interface CrawlerAnalysisResult {
  analysis: CrawlerAnalysis;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  estimatedCostUsd: number;
  isStub: boolean;
}

// ============================================================================
// Crawler Analysis Prompts
// ============================================================================

const CRAWLER_SYSTEM_PROMPTS: Record<CrawlerType, string> = {
  social: `You are a competitive intelligence analyst specializing in social media monitoring for product teams.

Your job is to analyze social media posts and discussions to extract actionable product insights.

Guidelines:
- Identify key themes and sentiment patterns
- Extract competitive mentions and comparisons
- Highlight feature requests and pain points
- Quantify findings where possible (mention counts, sentiment distribution)
- Provide actionable recommendations for product teams
- Include specific quotes as evidence
- Be concise but comprehensive
- Return ONLY valid JSON, no other text`,

  web_search: `You are a competitive intelligence analyst specializing in web research for product teams.

Your job is to analyze web search results to extract competitive intelligence and market insights.

Guidelines:
- Identify competitor positioning and messaging
- Extract pricing and feature information
- Highlight market trends and opportunities
- Note any recent announcements or changes
- Provide strategic recommendations
- Include specific evidence from sources
- Be concise but comprehensive
- Return ONLY valid JSON, no other text`,

  news: `You are a competitive intelligence analyst specializing in industry news monitoring for product teams.

Your job is to analyze news articles and press releases to extract market intelligence.

Guidelines:
- Identify significant industry developments
- Extract funding, partnership, and acquisition news
- Highlight competitive moves and announcements
- Note market trends and analyst opinions
- Provide strategic implications for product teams
- Include specific quotes and sources
- Be concise but comprehensive
- Return ONLY valid JSON, no other text`,
};

function buildCrawlerUserPrompt(context: CrawlerAnalysisContext): string {
  const crawlerTypeDisplay = context.crawlerType.replace('_', ' ');
  
  let prompt = `Analyze the following ${crawlerTypeDisplay} crawler results for keywords: ${context.keywords.join(', ')}

`;

  if (context.platforms && context.platforms.length > 0) {
    prompt += `Platforms searched: ${context.platforms.join(', ')}\n`;
  }

  if (context.productName) {
    prompt += `Our product: ${context.productName}\n`;
  }

  if (context.competitors && context.competitors.length > 0) {
    prompt += `Key competitors to watch: ${context.competitors.join(', ')}\n`;
  }

  prompt += `
## Raw Results (${context.results.length} items)

`;

  // Add results (limit to prevent token overflow)
  const maxResults = Math.min(context.results.length, 25);
  for (let i = 0; i < maxResults; i++) {
    const result = context.results[i];
    prompt += `### Result ${i + 1}
- **Source**: ${result.source}
- **Title**: ${result.title}
`;
    if (result.author) prompt += `- **Author**: ${result.author}\n`;
    if (result.publishedAt) prompt += `- **Date**: ${result.publishedAt}\n`;
    if (result.url) prompt += `- **URL**: ${result.url}\n`;
    
    // Truncate content if too long
    const content = result.content.length > 500 
      ? result.content.slice(0, 500) + '...' 
      : result.content;
    prompt += `\n**Content**:\n${content}\n`;
    
    if (result.metadata && Object.keys(result.metadata).length > 0) {
      prompt += `\n**Metadata**: ${JSON.stringify(result.metadata)}\n`;
    }
    
    prompt += '\n---\n\n';
  }

  if (context.results.length > maxResults) {
    prompt += `\n(${context.results.length - maxResults} additional results omitted for brevity)\n\n`;
  }

  prompt += `## Analysis Required

Provide a comprehensive analysis as a JSON object with this exact structure:

{
  "summary": "2-3 sentence executive summary of key findings",
  "themes": [
    {
      "name": "Theme name",
      "description": "Brief description",
      "mentionCount": 5,
      "sentiment": "positive|negative|neutral|mixed",
      "keyQuotes": ["Quote 1", "Quote 2"],
      "sources": ["reddit", "hackernews"]
    }
  ],
  "overallSentiment": "positive|negative|neutral|mixed",
  "sentimentBreakdown": {
    "positive": 40,
    "negative": 30,
    "neutral": 30
  },
  "competitorMentions": [
    {
      "competitor": "Competitor name",
      "context": "How they were mentioned",
      "sentiment": "positive|negative|neutral|mixed",
      "source": "reddit",
      "url": "optional url"
    }
  ],
  "insights": [
    {
      "type": "opportunity|threat|trend|action_item",
      "title": "Insight title",
      "description": "Detailed description",
      "priority": "high|medium|low",
      "evidence": ["Evidence 1", "Evidence 2"]
    }
  ],
  "topQuotes": [
    {
      "quote": "The actual quote",
      "source": "reddit",
      "url": "optional url",
      "relevance": "Why this quote matters"
    }
  ],
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2"
  ]
}

Return ONLY the JSON object, no markdown code fences or other text.`;

  return prompt;
}

/**
 * Render crawler analysis prompt
 */
export function renderCrawlerPrompt(context: CrawlerAnalysisContext): { system: string; user: string } {
  return {
    system: CRAWLER_SYSTEM_PROMPTS[context.crawlerType],
    user: buildCrawlerUserPrompt(context),
  };
}

/**
 * Execute crawler analysis using LLM
 */
export async function executeCrawlerAnalysis(
  llmService: LLMService,
  tenantId: string,
  context: CrawlerAnalysisContext,
  options: { maxTokens?: number; temperature?: number } = {}
): Promise<CrawlerAnalysisResult> {
  // Check if using stubs
  if (llmService.isUsingStubs()) {
    return {
      analysis: generateStubCrawlerAnalysis(context),
      model: 'stub',
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      latencyMs: 100,
      estimatedCostUsd: 0,
      isStub: true,
    };
  }

  // Render the prompt
  const { system, user } = renderCrawlerPrompt(context);

  // Build messages
  const messages: LLMMessage[] = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];

  // Execute the completion
  const response = await llmService.complete(tenantId, {
    messages,
    maxTokens: options.maxTokens || 8192,
    temperature: options.temperature || 0.7,
  });

  // Calculate cost
  const modelInfo = llmService.getModelForTenant(tenantId);
  const estimatedCostUsd =
    (response.usage.inputTokens / 1_000_000) * modelInfo.inputPricePerMillion +
    (response.usage.outputTokens / 1_000_000) * modelInfo.outputPricePerMillion;

  // Parse JSON from response
  let analysis: CrawlerAnalysis;
  try {
    // Extract JSON from response (may be wrapped in code fences)
    let jsonStr = response.content;
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    analysis = JSON.parse(jsonStr.trim());
  } catch (e) {
    // If parsing fails, create a basic analysis from the raw response
    console.error('Failed to parse crawler analysis JSON:', e);
    analysis = {
      summary: 'Analysis completed but response format was unexpected. Please review raw results.',
      themes: [],
      overallSentiment: 'neutral',
      sentimentBreakdown: { positive: 33, negative: 33, neutral: 34 },
      competitorMentions: [],
      insights: [{
        type: 'action_item',
        title: 'Review Raw Results',
        description: 'The AI analysis encountered a formatting issue. Please review the raw crawler results directly.',
        priority: 'medium',
        evidence: ['Response parsing failed'],
      }],
      topQuotes: [],
      recommendations: ['Review raw results for detailed analysis'],
    };
  }

  return {
    analysis,
    model: response.model,
    usage: response.usage,
    latencyMs: response.latencyMs,
    estimatedCostUsd,
    isStub: false,
  };
}

/**
 * Generate stub crawler analysis for development/testing
 */
export function generateStubCrawlerAnalysis(context: CrawlerAnalysisContext): CrawlerAnalysis {
  const keywords = context.keywords.join(', ');
  const crawlerType = context.crawlerType.replace('_', ' ');
  
  return {
    summary: `Analysis of ${context.results.length} ${crawlerType} results for "${keywords}". Found mixed sentiment with several actionable insights for product development. Key themes include feature requests and competitive comparisons.`,
    themes: [
      {
        name: 'Feature Requests',
        description: `Users are requesting improvements related to ${keywords}`,
        mentionCount: Math.ceil(context.results.length * 0.4),
        sentiment: 'neutral',
        keyQuotes: [
          'Would love to see better support for this use case',
          'This feature would be a game-changer for our workflow',
        ],
        sources: context.platforms || ['web'],
      },
      {
        name: 'Competitive Comparison',
        description: 'Users comparing different solutions in the market',
        mentionCount: Math.ceil(context.results.length * 0.3),
        sentiment: 'mixed',
        keyQuotes: [
          'Compared to alternatives, this solution stands out for...',
          'Looking for something better than what we currently use',
        ],
        sources: context.platforms || ['web'],
      },
      {
        name: 'User Experience',
        description: 'Feedback on usability and user experience',
        mentionCount: Math.ceil(context.results.length * 0.2),
        sentiment: 'positive',
        keyQuotes: [
          'The interface is intuitive and easy to use',
          'Onboarding was smoother than expected',
        ],
        sources: context.platforms || ['web'],
      },
    ],
    overallSentiment: 'mixed',
    sentimentBreakdown: {
      positive: 35,
      negative: 25,
      neutral: 40,
    },
    competitorMentions: context.competitors?.map(c => ({
      competitor: c,
      context: `Mentioned in comparison discussions about ${keywords}`,
      sentiment: 'neutral' as const,
      source: context.platforms?.[0] || 'web',
    })) || [
      {
        competitor: 'Notion',
        context: 'Frequently mentioned as an alternative solution',
        sentiment: 'positive' as const,
        source: context.platforms?.[0] || 'web',
      },
      {
        competitor: 'Coda',
        context: 'Compared on pricing and features',
        sentiment: 'neutral' as const,
        source: context.platforms?.[0] || 'web',
      },
    ],
    insights: [
      {
        type: 'opportunity',
        title: 'Growing Market Interest',
        description: `There is growing interest in ${keywords} based on discussion volume and engagement metrics`,
        priority: 'high',
        evidence: [
          `${context.results.length} relevant discussions found`,
          'Engagement metrics indicate strong interest',
          'Multiple feature requests align with product roadmap',
        ],
      },
      {
        type: 'threat',
        title: 'Competitive Pressure',
        description: 'Competitors are actively being discussed and compared',
        priority: 'medium',
        evidence: [
          'Multiple competitor mentions in discussions',
          'Users evaluating alternatives',
        ],
      },
      {
        type: 'action_item',
        title: 'Address Top Feature Requests',
        description: 'Consider prioritizing the most requested features identified in discussions',
        priority: 'high',
        evidence: [
          'Feature requests identified with high engagement',
          'User pain points documented',
          'Clear demand signal from community',
        ],
      },
      {
        type: 'trend',
        title: 'AI Integration Expectations',
        description: 'Users increasingly expect AI-powered features in this space',
        priority: 'medium',
        evidence: [
          'AI mentioned in multiple discussions',
          'Competitors launching AI features',
        ],
      },
    ],
    topQuotes: context.results.slice(0, 3).map((r, i) => ({
      quote: r.content.length > 200 ? r.content.slice(0, 200) + '...' : r.content,
      source: r.source,
      url: r.url,
      relevance: i === 0 
        ? 'Representative of primary user sentiment' 
        : i === 1 
          ? 'Highlights key feature request'
          : 'Shows competitive context',
    })),
    recommendations: [
      `Continue monitoring discussions about ${keywords} for emerging trends`,
      'Prioritize addressing the top feature requests in upcoming releases',
      'Engage with community to gather more detailed feedback on pain points',
      'Consider competitive positioning based on identified gaps',
      'Create content addressing common questions and concerns',
    ],
  };
}

// ============================================================================
// Mock Crawler Data for Demo
// ============================================================================

export const MOCK_CRAWLER_DATA = {
  social: {
    reddit: [
      {
        id: 'reddit-1',
        source: 'reddit',
        title: 'Best tools for product management in 2026?',
        content: 'Looking for recommendations on PM tools. Currently using Notion but finding it hard to keep track of everything. Need something with better Jira integration and AI features. Anyone tried pmkit or similar?',
        author: 'productguy2026',
        url: 'https://reddit.com/r/ProductManagement/comments/abc123',
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { subreddit: 'ProductManagement', score: 127, numComments: 45 },
      },
      {
        id: 'reddit-2',
        source: 'reddit',
        title: 'Frustrated with manual PRD writing',
        content: 'Spent 6 hours on a PRD yesterday. There has to be a better way. AI tools help but they hallucinate too much. Need something that actually uses our real data from Jira/Slack.',
        author: 'pm_burnout',
        url: 'https://reddit.com/r/ProductManagement/comments/def456',
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { subreddit: 'ProductManagement', score: 89, numComments: 32 },
      },
      {
        id: 'reddit-3',
        source: 'reddit',
        title: 'How do you handle competitive intelligence?',
        content: 'Our team spends hours every week manually checking competitor websites and news. Looking for automation. Tried a few tools but they either miss things or give too much noise.',
        author: 'competitive_pm',
        url: 'https://reddit.com/r/ProductManagement/comments/ghi789',
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { subreddit: 'ProductManagement', score: 156, numComments: 67 },
      },
      {
        id: 'reddit-4',
        source: 'reddit',
        title: 'Daily standups are killing my productivity',
        content: 'Between standups, sprint planning, and keeping up with Slack, I barely have time for actual PM work. Anyone found good ways to automate the status updates and briefings?',
        author: 'overwhelmed_pm',
        url: 'https://reddit.com/r/ProductManagement/comments/jkl012',
        publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { subreddit: 'ProductManagement', score: 234, numComments: 89 },
      },
    ],
    hackernews: [
      {
        id: 'hn-1',
        source: 'hackernews',
        title: 'Show HN: AI-powered product management assistant',
        content: 'Built a tool that connects to Jira, Slack, and Gong to generate daily briefs and PRDs. Uses draft-only pattern so AI never writes directly to your systems. Looking for feedback from PMs.',
        author: 'pmkit_founder',
        url: 'https://news.ycombinator.com/item?id=123456',
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { points: 187, numComments: 78 },
      },
      {
        id: 'hn-2',
        source: 'hackernews',
        title: 'The problem with AI writing tools for product teams',
        content: 'Most AI tools hallucinate because they dont have context. The solution is connecting to your actual data sources - Jira, Slack, support tickets. Then the AI has real information to work with.',
        author: 'ai_skeptic',
        url: 'https://news.ycombinator.com/item?id=234567',
        publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { points: 145, numComments: 92 },
      },
      {
        id: 'hn-3',
        source: 'hackernews',
        title: 'MCP (Model Context Protocol) is changing how we build AI tools',
        content: 'Anthropics MCP standard is making it much easier to connect AI to enterprise tools. Seeing a lot of interesting PM tools being built on this. The draft-only pattern is smart for enterprise.',
        author: 'mcp_enthusiast',
        url: 'https://news.ycombinator.com/item?id=345678',
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { points: 312, numComments: 156 },
      },
    ],
  },
  web_search: [
    {
      id: 'web-1',
      source: 'google',
      title: 'Product Management Tools Comparison 2026 - G2',
      content: 'Compare the top product management tools of 2026. Features include AI-powered PRD generation, roadmap planning, and integrations with Jira, Confluence, and Slack. See pricing and reviews.',
      url: 'https://www.g2.com/categories/product-management',
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: { domain: 'g2.com', type: 'comparison' },
    },
    {
      id: 'web-2',
      source: 'google',
      title: 'How AI is Transforming Product Management - Harvard Business Review',
      content: 'AI tools are automating routine PM tasks like status updates, meeting prep, and documentation. The best tools connect to existing workflows rather than creating new silos. Draft-only approaches are gaining traction in enterprise.',
      url: 'https://hbr.org/2026/01/ai-product-management',
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: { domain: 'hbr.org', type: 'article' },
    },
    {
      id: 'web-3',
      source: 'google',
      title: 'Notion AI vs Competitors: Which PM Tool is Best?',
      content: 'Notion AI is great for general docs but lacks deep integrations. Specialized PM tools like pmkit offer better Jira/Slack integration and more PM-specific workflows like daily briefs and sprint reviews.',
      url: 'https://www.productplan.com/blog/notion-ai-alternatives',
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: { domain: 'productplan.com', type: 'comparison' },
    },
    {
      id: 'web-4',
      source: 'google',
      title: 'Enterprise AI Governance: The Draft-Only Pattern',
      content: 'Enterprise teams are adopting draft-only AI patterns where AI proposes changes but humans approve before any writes occur. This addresses compliance concerns while still leveraging AI productivity gains.',
      url: 'https://www.forrester.com/report/enterprise-ai-governance',
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: { domain: 'forrester.com', type: 'report' },
    },
  ],
  news: [
    {
      id: 'news-1',
      source: 'techcrunch',
      title: 'AI Product Management Tools See 300% Growth in Enterprise Adoption',
      content: 'Enterprise adoption of AI-powered product management tools has tripled in the past year. Key drivers include integration with existing tools like Jira and Slack, and governance features like audit trails and draft-only writes.',
      author: 'Sarah Chen',
      url: 'https://techcrunch.com/2026/01/ai-pm-tools-growth',
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: { publication: 'TechCrunch', category: 'Enterprise' },
    },
    {
      id: 'news-2',
      source: 'venturebeat',
      title: 'Anthropic MCP Standard Gains Traction in Enterprise AI',
      content: 'Anthropics Model Context Protocol is becoming the standard for connecting AI to enterprise tools. Product management is a key use case, with tools using MCP to connect to Jira, Confluence, Slack, and Gong.',
      author: 'Mike Johnson',
      url: 'https://venturebeat.com/2026/01/anthropic-mcp-enterprise',
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: { publication: 'VentureBeat', category: 'AI' },
    },
    {
      id: 'news-3',
      source: 'reuters',
      title: 'Atlassian Announces AI Partnership for Jira Integration',
      content: 'Atlassian has announced partnerships with several AI vendors to improve Jira integration. The focus is on automated status updates, sprint planning assistance, and PRD generation from ticket data.',
      author: 'Emily Davis',
      url: 'https://reuters.com/technology/atlassian-ai-partnership',
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: { publication: 'Reuters', category: 'Technology' },
    },
    {
      id: 'news-4',
      source: 'forbes',
      title: 'The Rise of the AI Product Manager',
      content: 'AI is not replacing product managers but augmenting them. The most successful PMs are using AI to automate routine tasks like daily briefs, meeting prep, and documentation, freeing time for strategic work.',
      author: 'Alex Kim',
      url: 'https://forbes.com/sites/ai-product-manager',
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: { publication: 'Forbes', category: 'Leadership' },
    },
  ],
};
