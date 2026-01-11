import { BaseMCPServer } from '@pmkit/mcp';
import { z } from 'zod';

// Mock web search results
const mockSearchResults = [
  {
    id: 'search-1',
    title: 'Competitor A Announces 20% Price Reduction for Enterprise',
    url: 'https://competitora.com/blog/enterprise-pricing-update',
    snippet:
      "Today we're announcing a significant update to our enterprise pricing. Starting February 1st, all enterprise plans will see a 20% reduction...",
    source: 'competitora.com',
    publishedDate: '2026-01-08',
    type: 'pricing',
  },
  {
    id: 'search-2',
    title: 'Product Management Tools Market Report 2026',
    url: 'https://analyst.com/reports/pm-tools-2026',
    snippet:
      'The product management tools market is expected to grow 34% YoY, driven by AI adoption. Key players include Acme, Competitor A, and Competitor B...',
    source: 'analyst.com',
    publishedDate: '2026-01-05',
    type: 'market_research',
  },
  {
    id: 'search-3',
    title: 'Competitor B Launches AI-Powered PRD Generator',
    url: 'https://competitorb.com/features/ai-prd',
    snippet:
      'Introducing our new AI PRD generator. Create comprehensive product requirements documents in minutes with our latest feature...',
    source: 'competitorb.com',
    publishedDate: '2026-01-03',
    type: 'feature_launch',
  },
  {
    id: 'search-4',
    title: 'Best Product Management Tools for 2026 - Complete Guide',
    url: 'https://productschool.com/blog/best-pm-tools-2026',
    snippet:
      'We reviewed 25 product management tools to help you find the best fit. Top picks include Acme for AI automation, Competitor A for enterprise...',
    source: 'productschool.com',
    publishedDate: '2026-01-02',
    type: 'review',
  },
  {
    id: 'search-5',
    title: 'How AI is Transforming Product Management in 2026',
    url: 'https://hbr.org/2026/01/ai-product-management',
    snippet:
      'AI agents are now handling routine PM tasks like daily briefs and meeting prep. This shift allows PMs to focus on strategy and customer relationships...',
    source: 'hbr.org',
    publishedDate: '2026-01-01',
    type: 'industry_trend',
  },
  {
    id: 'search-6',
    title: 'Competitor A vs Competitor B: 2026 Comparison',
    url: 'https://g2.com/compare/competitor-a-vs-competitor-b',
    snippet:
      'Side-by-side comparison of Competitor A and Competitor B. See pricing, features, integrations, and user reviews to make the right choice...',
    source: 'g2.com',
    publishedDate: '2025-12-28',
    type: 'comparison',
  },
];

const mockPricingData = [
  {
    competitor: 'Competitor A',
    url: 'https://competitora.com/pricing',
    lastUpdated: '2026-01-09',
    tiers: [
      { name: 'Starter', price: '$29/seat/month', features: ['5 users', 'Basic integrations'] },
      { name: 'Pro', price: '$79/seat/month', features: ['Unlimited users', 'All integrations', 'AI features'] },
      { name: 'Enterprise', price: 'Custom', features: ['SSO', 'Dedicated support', 'Custom integrations'] },
    ],
    recentChanges: ['20% price reduction on Enterprise (Jan 8, 2026)'],
  },
  {
    competitor: 'Competitor B',
    url: 'https://competitorb.com/pricing',
    lastUpdated: '2026-01-05',
    tiers: [
      { name: 'Free', price: '$0', features: ['3 users', 'Limited features'] },
      { name: 'Team', price: '$49/seat/month', features: ['10 users', 'Core integrations'] },
      { name: 'Business', price: '$99/seat/month', features: ['Unlimited users', 'All features'] },
    ],
    recentChanges: ['Added free tier (Dec 15, 2025)'],
  },
];

export class MockWebSearchMCPServer extends BaseMCPServer {
  constructor() {
    super({
      name: 'web_search',
      description: 'Search the web for competitive intelligence and market research',
      version: '1.0.0',
    });
    this.registerTools();
  }

  private registerTools(): void {
    // Web search
    this.registerTool({
      name: 'search_web',
      description: 'Search the web for pages matching a query',
      inputSchema: z.object({
        query: z.string().describe('Search query'),
        site: z.string().optional().describe('Limit to specific domain (e.g., competitor.com)'),
        type: z
          .enum(['all', 'news', 'blog', 'pricing', 'docs', 'review'])
          .optional()
          .default('all')
          .describe('Filter by content type'),
        limit: z.number().optional().default(10).describe('Maximum results to return'),
      }),
      outputSchema: z.object({
        results: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            url: z.string(),
            snippet: z.string(),
            source: z.string(),
            publishedDate: z.string().optional(),
            type: z.string().optional(),
          })
        ),
        totalResults: z.number(),
      }),
      execute: async (input) => {
        let filtered = [...mockSearchResults];
        if (input.site) {
          filtered = filtered.filter((r) => r.source.includes(input.site!));
        }
        const searchType = input.type ?? 'all';
        if (searchType !== 'all') {
          filtered = filtered.filter((r) => r.type === searchType);
        }
        const limit = input.limit ?? 10;
        return {
          results: filtered.slice(0, limit),
          totalResults: filtered.length,
        };
      },
    });

    // Get page content
    this.registerTool({
      name: 'get_page_content',
      description: 'Fetch and extract content from a web page',
      inputSchema: z.object({
        url: z.string().url().describe('URL of the page to fetch'),
      }),
      outputSchema: z.object({
        title: z.string(),
        content: z.string(),
        publishedDate: z.string().optional(),
        author: z.string().optional(),
        metadata: z.record(z.string()).optional(),
      }),
      execute: async (input) => {
        // Simulate fetching page content
        const mockContent = `
# Page Content from ${input.url}

This is the extracted and cleaned content from the requested page. In production, this would contain the actual page content parsed from HTML.

## Key Points

- Point 1: Important information extracted from the page
- Point 2: Relevant details for competitive analysis
- Point 3: Pricing or feature information if applicable

## Summary

The page discusses product management tools and their evolution in 2026, with a focus on AI-powered automation and integration capabilities.
        `.trim();

        return {
          title: 'Sample Page Title',
          content: mockContent,
          publishedDate: '2026-01-10',
          author: 'Content Team',
          metadata: { wordCount: '1500', readTime: '6 min', category: 'Product Management' },
        };
      },
    });

    // Compare competitor pages
    this.registerTool({
      name: 'compare_competitor_pages',
      description: 'Compare specific pages across competitors (pricing, features, etc.)',
      inputSchema: z.object({
        pageType: z
          .enum(['pricing', 'features', 'integrations', 'security', 'about'])
          .describe('Type of page to compare'),
        competitors: z.array(z.string()).describe('List of competitor names'),
      }),
      outputSchema: z.object({
        comparison: z.array(
          z.object({
            competitor: z.string(),
            url: z.string(),
            lastUpdated: z.string(),
            keyPoints: z.array(z.string()),
            changes: z.array(z.string()).optional(),
          })
        ),
      }),
      execute: async (input) => {
        return {
          comparison: input.competitors.map((c) => {
            const pricingInfo = mockPricingData.find(
              (p) => p.competitor.toLowerCase() === c.toLowerCase()
            );
            return {
              competitor: c,
              url: `https://${c.toLowerCase().replace(/\s+/g, '')}.com/${input.pageType}`,
              lastUpdated: pricingInfo?.lastUpdated || '2026-01-09',
              keyPoints:
                input.pageType === 'pricing' && pricingInfo
                  ? pricingInfo.tiers.map((t) => `${t.name}: ${t.price}`)
                  : [
                      `${c} offers comprehensive ${input.pageType} page`,
                      `Last updated within the past week`,
                      `Includes detailed documentation`,
                    ],
              changes: pricingInfo?.recentChanges || [],
            };
          }),
        };
      },
    });

    // Get competitor pricing
    this.registerTool({
      name: 'get_competitor_pricing',
      description: 'Get detailed pricing information for competitors',
      inputSchema: z.object({
        competitors: z.array(z.string()).describe('List of competitor names'),
      }),
      outputSchema: z.object({
        pricing: z.array(
          z.object({
            competitor: z.string(),
            url: z.string(),
            lastUpdated: z.string(),
            tiers: z.array(
              z.object({
                name: z.string(),
                price: z.string(),
                features: z.array(z.string()),
              })
            ),
            recentChanges: z.array(z.string()),
          })
        ),
      }),
      execute: async (input) => {
        return {
          pricing: input.competitors.map((c) => {
            const existing = mockPricingData.find(
              (p) => p.competitor.toLowerCase() === c.toLowerCase()
            );
            return (
              existing || {
                competitor: c,
                url: `https://${c.toLowerCase().replace(/\s+/g, '')}.com/pricing`,
                lastUpdated: '2026-01-09',
                tiers: [
                  { name: 'Starter', price: '$29/seat/month', features: ['Basic features'] },
                  { name: 'Pro', price: '$79/seat/month', features: ['Advanced features'] },
                  { name: 'Enterprise', price: 'Custom', features: ['All features', 'Support'] },
                ],
                recentChanges: [],
              }
            );
          }),
        };
      },
    });

    // Track page changes
    this.registerTool({
      name: 'track_page_changes',
      description: 'Track changes to specific competitor pages over time',
      inputSchema: z.object({
        urls: z.array(z.string().url()).describe('URLs to track'),
        timeframe: z.enum(['7d', '30d', '90d']).optional().default('30d'),
      }),
      outputSchema: z.object({
        changes: z.array(
          z.object({
            url: z.string(),
            changeDate: z.string(),
            changeType: z.enum(['content', 'pricing', 'feature', 'layout']),
            summary: z.string(),
            significance: z.enum(['low', 'medium', 'high']),
          })
        ),
      }),
      execute: async (input) => {
        return {
          changes: input.urls.flatMap((url) => [
            {
              url,
              changeDate: '2026-01-08',
              changeType: 'pricing' as const,
              summary: 'Enterprise pricing reduced by 20%',
              significance: 'high' as const,
            },
            {
              url,
              changeDate: '2026-01-05',
              changeType: 'feature' as const,
              summary: 'Added new AI PRD generator feature to features page',
              significance: 'high' as const,
            },
            {
              url,
              changeDate: '2026-01-02',
              changeType: 'content' as const,
              summary: 'Updated testimonials section with new customer quotes',
              significance: 'low' as const,
            },
          ]),
        };
      },
    });
  }
}

export const mockWebSearchServer = new MockWebSearchMCPServer();
