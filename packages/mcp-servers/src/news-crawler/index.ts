import { BaseMCPServer } from '@pmkit/mcp';
import { z } from 'zod';

// Mock news articles
const mockNewsArticles = [
  {
    id: 'news-1',
    title: 'Competitor A Raises $50M Series C to Expand AI Capabilities',
    source: 'TechCrunch',
    url: 'https://techcrunch.com/2026/01/09/competitor-a-series-c',
    summary:
      'Competitor A announced a $50M Series C round led by Sequoia Capital. The funding will be used to expand their AI product management features and enter new markets.',
    publishedDate: '2026-01-09T08:00:00Z',
    category: 'funding',
    relevance: 'high',
    competitors: ['Competitor A'],
  },
  {
    id: 'news-2',
    title: 'The Rise of AI in Product Management: 2026 Trends',
    source: 'Product Coalition',
    url: 'https://productcoalition.com/ai-pm-trends-2026',
    summary:
      'AI is transforming how product managers work. From automated briefs to AI-generated PRDs, the tools landscape is evolving rapidly.',
    publishedDate: '2026-01-07T12:00:00Z',
    category: 'industry_trend',
    relevance: 'medium',
    competitors: [] as string[],
  },
  {
    id: 'news-3',
    title: 'Competitor B Acquires Analytics Startup for $25M',
    source: 'VentureBeat',
    url: 'https://venturebeat.com/2026/01/05/competitor-b-acquisition',
    summary:
      'Competitor B has acquired DataInsights, a product analytics startup, for $25M. The acquisition strengthens their analytics capabilities.',
    publishedDate: '2026-01-05T14:30:00Z',
    category: 'acquisition',
    relevance: 'high',
    competitors: ['Competitor B'],
  },
  {
    id: 'news-4',
    title: 'New Gartner Report: Magic Quadrant for Product Management Tools',
    source: 'Gartner',
    url: 'https://gartner.com/reports/pm-tools-mq-2026',
    summary:
      'Gartner releases their 2026 Magic Quadrant for Product Management Tools. Leaders include Acme, Competitor A, and Competitor B.',
    publishedDate: '2026-01-03T09:00:00Z',
    category: 'analyst_report',
    relevance: 'high',
    competitors: ['Competitor A', 'Competitor B'],
  },
  {
    id: 'news-5',
    title: 'Competitor A Launches Enterprise SSO and Compliance Features',
    source: 'SaaS Weekly',
    url: 'https://saasweekly.com/2026/01/02/competitor-a-enterprise',
    summary:
      'Competitor A announced new enterprise features including SAML SSO, SOC 2 Type II certification, and advanced audit logging.',
    publishedDate: '2026-01-02T10:00:00Z',
    category: 'product_launch',
    relevance: 'high',
    competitors: ['Competitor A'],
  },
  {
    id: 'news-6',
    title: 'Product Management Tools Market to Reach $5B by 2028',
    source: 'Forrester',
    url: 'https://forrester.com/reports/pm-tools-market-2028',
    summary:
      'Forrester predicts the product management tools market will grow to $5B by 2028, driven by AI adoption and enterprise demand.',
    publishedDate: '2025-12-28T11:00:00Z',
    category: 'analyst_report',
    relevance: 'medium',
    competitors: [] as string[],
  },
  {
    id: 'news-7',
    title: 'Competitor B Partners with Slack for Deeper Integration',
    source: 'The Verge',
    url: 'https://theverge.com/2025/12/20/competitor-b-slack-partnership',
    summary:
      'Competitor B announced a strategic partnership with Slack, enabling native workflow automation directly from Slack channels.',
    publishedDate: '2025-12-20T15:00:00Z',
    category: 'partnership',
    relevance: 'high',
    competitors: ['Competitor B'],
  },
  {
    id: 'news-8',
    title: 'AI PM Assistants: Hype vs Reality - Industry Analysis',
    source: 'Harvard Business Review',
    url: 'https://hbr.org/2025/12/ai-pm-assistants-analysis',
    summary:
      'An in-depth analysis of AI product management tools. While adoption is growing, many teams struggle with integration and trust.',
    publishedDate: '2025-12-15T09:00:00Z',
    category: 'industry_trend',
    relevance: 'medium',
    competitors: [] as string[],
  },
];

const mockPressReleases = [
  {
    company: 'Competitor A',
    title: 'Competitor A Announces Q1 2026 Product Updates',
    date: '2026-01-10',
    url: 'https://competitora.com/press/q1-2026-updates',
    summary:
      'Competitor A today announced several product updates including new AI features, improved Jira integration, and enhanced reporting capabilities.',
    type: 'product_update',
  },
  {
    company: 'Competitor B',
    title: 'Competitor B Expands to European Market',
    date: '2026-01-08',
    url: 'https://competitorb.com/press/europe-expansion',
    summary:
      'Competitor B announced expansion into the European market with new data centers in Frankfurt and London, plus GDPR compliance features.',
    type: 'expansion',
  },
  {
    company: 'Competitor A',
    title: 'Competitor A Achieves SOC 2 Type II Certification',
    date: '2026-01-05',
    url: 'https://competitora.com/press/soc2-certification',
    summary:
      'Competitor A has achieved SOC 2 Type II certification, demonstrating commitment to enterprise security and compliance standards.',
    type: 'compliance',
  },
];

export class MockNewsCrawlerMCPServer extends BaseMCPServer {
  constructor() {
    super({
      name: 'news_crawler',
      description: 'Monitor industry news, press releases, and analyst reports',
      version: '1.0.0',
    });
    this.registerTools();
  }

  private registerTools(): void {
    // Search news
    this.registerTool({
      name: 'search_news',
      description: 'Search for news articles matching keywords',
      inputSchema: z.object({
        query: z.string().describe('Search query'),
        sources: z.array(z.string()).optional().describe('Filter by specific news sources'),
        category: z
          .enum([
            'all',
            'funding',
            'acquisition',
            'product_launch',
            'industry_trend',
            'analyst_report',
            'partnership',
          ])
          .optional()
          .default('all')
          .describe('Filter by news category'),
        timeframe: z
          .enum(['24h', '7d', '30d', '90d'])
          .optional()
          .default('30d')
          .describe('Time period for news search'),
        limit: z.number().optional().default(20).describe('Maximum results to return'),
      }),
      outputSchema: z.object({
        articles: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            source: z.string(),
            url: z.string(),
            summary: z.string(),
            publishedDate: z.string(),
            category: z.string(),
            relevance: z.string(),
          })
        ),
        totalCount: z.number(),
      }),
      execute: async (input) => {
        let filtered = [...mockNewsArticles];
        const category = input.category ?? 'all';
        if (category !== 'all') {
          filtered = filtered.filter((a) => a.category === category);
        }
        if (input.sources && input.sources.length > 0) {
          filtered = filtered.filter((a) =>
            input.sources!.some((s) => a.source.toLowerCase().includes(s.toLowerCase()))
          );
        }
        const limit = input.limit ?? 20;
        return {
          articles: filtered.slice(0, limit).map((a) => ({
            id: a.id,
            title: a.title,
            source: a.source,
            url: a.url,
            summary: a.summary,
            publishedDate: a.publishedDate,
            category: a.category,
            relevance: a.relevance,
          })),
          totalCount: filtered.length,
        };
      },
    });

    // Get competitor news
    this.registerTool({
      name: 'get_competitor_news',
      description: 'Get recent news about specific competitors',
      inputSchema: z.object({
        competitors: z.array(z.string()).describe('List of competitor names'),
        timeframe: z
          .enum(['7d', '30d', '90d'])
          .optional()
          .default('30d')
          .describe('Time period for news search'),
      }),
      outputSchema: z.object({
        news: z.array(
          z.object({
            competitor: z.string(),
            articles: z.array(
              z.object({
                title: z.string(),
                source: z.string(),
                url: z.string(),
                summary: z.string(),
                publishedDate: z.string(),
                category: z.string(),
              })
            ),
          })
        ),
      }),
      execute: async (input) => {
        return {
          news: input.competitors.map((competitor) => ({
            competitor,
            articles: mockNewsArticles
              .filter((a) =>
                a.competitors.some((c) => c.toLowerCase().includes(competitor.toLowerCase()))
              )
              .map(({ id, competitors, relevance, ...rest }) => rest),
          })),
        };
      },
    });

    // Get press releases
    this.registerTool({
      name: 'get_press_releases',
      description: 'Get recent press releases from configured companies',
      inputSchema: z.object({
        companies: z.array(z.string()).describe('List of company names'),
        timeframe: z
          .enum(['7d', '30d', '90d'])
          .optional()
          .default('30d')
          .describe('Time period for press releases'),
      }),
      outputSchema: z.object({
        releases: z.array(
          z.object({
            company: z.string(),
            title: z.string(),
            date: z.string(),
            url: z.string(),
            summary: z.string(),
            type: z.string(),
          })
        ),
      }),
      execute: async (input) => {
        const filtered = mockPressReleases.filter((pr) =>
          input.companies.some((c) => pr.company.toLowerCase().includes(c.toLowerCase()))
        );
        return { releases: filtered };
      },
    });

    // Get industry reports
    this.registerTool({
      name: 'get_industry_reports',
      description: 'Get recent analyst and industry reports',
      inputSchema: z.object({
        topics: z.array(z.string()).optional().describe('Filter by specific topics'),
        sources: z
          .array(z.string())
          .optional()
          .describe('Filter by sources (e.g., Gartner, Forrester)'),
      }),
      outputSchema: z.object({
        reports: z.array(
          z.object({
            title: z.string(),
            source: z.string(),
            url: z.string(),
            summary: z.string(),
            publishedDate: z.string(),
            type: z.string(),
          })
        ),
      }),
      execute: async (input) => {
        let filtered = mockNewsArticles.filter((a) => a.category === 'analyst_report');
        if (input.sources && input.sources.length > 0) {
          filtered = filtered.filter((a) =>
            input.sources!.some((s) => a.source.toLowerCase().includes(s.toLowerCase()))
          );
        }
        return {
          reports: filtered.map(({ id, competitors, relevance, category, ...rest }) => ({
            ...rest,
            type: 'analyst_report',
          })),
        };
      },
    });

    // Get news summary
    this.registerTool({
      name: 'get_news_summary',
      description: 'Get a summary of recent news by category and competitor',
      inputSchema: z.object({
        timeframe: z.enum(['7d', '30d']).optional().default('7d'),
      }),
      outputSchema: z.object({
        summary: z.object({
          totalArticles: z.number(),
          byCategory: z.array(
            z.object({
              category: z.string(),
              count: z.number(),
              topArticle: z.string(),
            })
          ),
          byCompetitor: z.array(
            z.object({
              competitor: z.string(),
              mentionCount: z.number(),
              sentiment: z.string(),
              topNews: z.string(),
            })
          ),
          highlights: z.array(z.string()),
        }),
      }),
      execute: async () => {
        const categories = ['funding', 'acquisition', 'product_launch', 'industry_trend', 'analyst_report'];
        return {
          summary: {
            totalArticles: mockNewsArticles.length,
            byCategory: categories.map((cat) => {
              const articles = mockNewsArticles.filter((a) => a.category === cat);
              return {
                category: cat,
                count: articles.length,
                topArticle: articles[0]?.title || 'No articles',
              };
            }),
            byCompetitor: [
              {
                competitor: 'Competitor A',
                mentionCount: 4,
                sentiment: 'positive',
                topNews: 'Raises $50M Series C',
              },
              {
                competitor: 'Competitor B',
                mentionCount: 3,
                sentiment: 'neutral',
                topNews: 'Acquires Analytics Startup',
              },
            ],
            highlights: [
              'Competitor A raised $50M Series C funding',
              'Competitor B acquired DataInsights for $25M',
              'New Gartner Magic Quadrant released',
              'Market expected to reach $5B by 2028',
            ],
          },
        };
      },
    });

    // Set up alerts
    this.registerTool({
      name: 'configure_news_alerts',
      description: 'Configure alerts for specific news topics or competitors',
      inputSchema: z.object({
        keywords: z.array(z.string()).describe('Keywords to monitor'),
        competitors: z.array(z.string()).optional().describe('Competitors to track'),
        categories: z
          .array(z.enum(['funding', 'acquisition', 'product_launch', 'partnership']))
          .optional()
          .describe('Categories to alert on'),
        minRelevance: z.enum(['low', 'medium', 'high']).optional().default('medium'),
      }),
      outputSchema: z.object({
        alertId: z.string(),
        status: z.string(),
        configuration: z.object({
          keywords: z.array(z.string()),
          competitors: z.array(z.string()),
          categories: z.array(z.string()),
          minRelevance: z.string(),
        }),
      }),
      execute: async (input) => {
        return {
          alertId: `alert-${Date.now()}`,
          status: 'active',
          configuration: {
            keywords: input.keywords,
            competitors: input.competitors || [],
            categories: input.categories || ['funding', 'acquisition', 'product_launch'],
            minRelevance: input.minRelevance ?? 'medium',
          },
        };
      },
    });
  }
}

export const mockNewsCrawlerServer = new MockNewsCrawlerMCPServer();
