import { BaseMCPServer } from '@pmkit/mcp';
import { z } from 'zod';

// Mock social data
const mockSocialPosts = [
  {
    id: 'social-1',
    platform: 'x',
    author: '@techreviewer',
    content:
      'Just tried @acme_product search filters - finally! Been waiting for this for months. Much better than @competitor now.',
    engagement: { likes: 234, reposts: 45, replies: 12 },
    sentiment: 'positive',
    timestamp: '2026-01-10T14:30:00Z',
    url: 'https://x.com/techreviewer/status/123456',
  },
  {
    id: 'social-2',
    platform: 'reddit',
    author: 'u/productfan',
    content:
      "Anyone else frustrated with Acme's dashboard performance? Takes 10+ seconds to load for me.",
    engagement: { upvotes: 89, comments: 34 },
    sentiment: 'negative',
    timestamp: '2026-01-09T09:15:00Z',
    url: 'https://reddit.com/r/acme/comments/abc123',
  },
  {
    id: 'social-3',
    platform: 'linkedin',
    author: 'Sarah Chen, VP Product',
    content:
      'Excited to announce our partnership with Acme! Their API integration is best-in-class.',
    engagement: { likes: 567, comments: 23 },
    sentiment: 'positive',
    timestamp: '2026-01-08T16:00:00Z',
    url: 'https://linkedin.com/posts/sarahchen_123',
  },
  {
    id: 'social-4',
    platform: 'discord',
    author: 'DevUser#1234',
    content:
      'The new webhook feature is exactly what we needed. Saves us hours of manual work.',
    engagement: { reactions: 45 },
    sentiment: 'positive',
    timestamp: '2026-01-07T11:20:00Z',
    url: 'https://discord.com/channels/acme/product-feedback',
  },
  {
    id: 'social-5',
    platform: 'bluesky',
    author: '@pmexpert.bsky.social',
    content:
      'Comparing PM tools: Acme vs Competitor. Acme wins on integrations, Competitor on pricing. Thread 🧵',
    engagement: { likes: 123, reposts: 34 },
    sentiment: 'neutral',
    timestamp: '2026-01-06T13:45:00Z',
    url: 'https://bsky.app/profile/pmexpert/post/xyz',
  },
  {
    id: 'social-6',
    platform: 'threads',
    author: '@productleader',
    content:
      'Hot take: AI PM tools are overhyped. Most teams just need better processes, not more automation.',
    engagement: { likes: 892, reposts: 156, replies: 234 },
    sentiment: 'neutral',
    timestamp: '2026-01-05T19:00:00Z',
    url: 'https://threads.net/@productleader/post/abc',
  },
  {
    id: 'social-7',
    platform: 'x',
    author: '@enterprise_pm',
    content:
      'Our team switched from Competitor to Acme last month. The daily briefs alone save us 2 hours/day. Game changer.',
    engagement: { likes: 456, reposts: 78, replies: 45 },
    sentiment: 'positive',
    timestamp: '2026-01-04T10:30:00Z',
    url: 'https://x.com/enterprise_pm/status/789012',
  },
  {
    id: 'social-8',
    platform: 'reddit',
    author: 'u/startup_founder',
    content:
      'Looking for PM tool recommendations. Currently evaluating Acme, Competitor A, and Competitor B. Thoughts?',
    engagement: { upvotes: 234, comments: 89 },
    sentiment: 'neutral',
    timestamp: '2026-01-03T15:45:00Z',
    url: 'https://reddit.com/r/productmanagement/comments/def456',
  },
];

const mockTrendingTopics = [
  {
    topic: '#ProductManagement',
    platform: 'x',
    mentionCount: 12340,
    sentiment: 'positive',
    trend: 'rising' as const,
  },
  {
    topic: 'AI PM tools',
    platform: 'linkedin',
    mentionCount: 5670,
    sentiment: 'positive',
    trend: 'rising' as const,
  },
  {
    topic: 'r/productmanagement',
    platform: 'reddit',
    mentionCount: 8900,
    sentiment: 'neutral',
    trend: 'stable' as const,
  },
  {
    topic: 'Competitor pricing',
    platform: 'x',
    mentionCount: 2340,
    sentiment: 'negative',
    trend: 'rising' as const,
  },
  {
    topic: '#PRDAutomation',
    platform: 'x',
    mentionCount: 1890,
    sentiment: 'positive',
    trend: 'rising' as const,
  },
  {
    topic: 'Product roadmap tools',
    platform: 'linkedin',
    mentionCount: 3450,
    sentiment: 'neutral',
    trend: 'stable' as const,
  },
];

export class MockSocialCrawlerMCPServer extends BaseMCPServer {
  constructor() {
    super({
      name: 'social_crawler',
      description: 'Monitor social media platforms for brand mentions and competitive research',
      version: '1.0.0',
    });
    this.registerTools();
  }

  private registerTools(): void {
    // Search social posts
    this.registerTool({
      name: 'search_social_posts',
      description: 'Search for social media posts matching keywords across platforms',
      inputSchema: z.object({
        query: z.string().describe('Search query (keywords, hashtags, mentions)'),
        platforms: z
          .array(z.enum(['x', 'reddit', 'linkedin', 'discord', 'bluesky', 'threads']))
          .optional()
          .describe('Filter by specific platforms'),
        sentiment: z
          .enum(['positive', 'negative', 'neutral'])
          .optional()
          .describe('Filter by sentiment'),
        minEngagement: z.number().optional().describe('Minimum engagement threshold'),
        limit: z.number().optional().default(20).describe('Maximum results to return'),
      }),
      outputSchema: z.object({
        posts: z.array(
          z.object({
            id: z.string(),
            platform: z.string(),
            author: z.string(),
            content: z.string(),
            engagement: z.record(z.number()),
            sentiment: z.string(),
            timestamp: z.string(),
            url: z.string().optional(),
          })
        ),
        totalCount: z.number(),
      }),
      execute: async (input) => {
        let filtered = [...mockSocialPosts];

        if (input.platforms) {
          filtered = filtered.filter((p) => input.platforms!.includes(p.platform as 'x' | 'reddit' | 'linkedin' | 'discord' | 'bluesky' | 'threads'));
        }
        if (input.sentiment) {
          filtered = filtered.filter((p) => p.sentiment === input.sentiment);
        }

        const limit = input.limit ?? 20;
        return {
          posts: filtered.slice(0, limit).map((p) => {
            // Convert engagement to Record<string, number> by filtering out undefined values
            const engagement: Record<string, number> = {};
            for (const [key, value] of Object.entries(p.engagement)) {
              if (typeof value === 'number') {
                engagement[key] = value;
              }
            }
            return {
              id: p.id,
              platform: p.platform,
              author: p.author,
              content: p.content,
              engagement,
              sentiment: p.sentiment,
              timestamp: p.timestamp,
              url: p.url,
            };
          }),
          totalCount: filtered.length,
        };
      },
    });

    // Get trending topics
    this.registerTool({
      name: 'get_trending_topics',
      description: 'Get trending topics and hashtags related to configured keywords',
      inputSchema: z.object({
        platforms: z
          .array(z.enum(['x', 'reddit', 'linkedin', 'bluesky', 'threads']))
          .optional()
          .describe('Filter by specific platforms'),
        timeframe: z
          .enum(['24h', '7d', '30d'])
          .optional()
          .default('7d')
          .describe('Time period for trend analysis'),
      }),
      outputSchema: z.object({
        topics: z.array(
          z.object({
            topic: z.string(),
            platform: z.string(),
            mentionCount: z.number(),
            sentiment: z.string(),
            trend: z.enum(['rising', 'stable', 'declining']),
          })
        ),
      }),
      execute: async (input) => {
        let filtered = [...mockTrendingTopics];
        if (input.platforms) {
          filtered = filtered.filter((t) => input.platforms!.includes(t.platform as 'x' | 'reddit' | 'linkedin' | 'bluesky' | 'threads'));
        }
        return { topics: filtered };
      },
    });

    // Get competitor mentions
    this.registerTool({
      name: 'get_competitor_mentions',
      description: 'Get social media mentions of competitors',
      inputSchema: z.object({
        competitors: z.array(z.string()).describe('List of competitor names to track'),
        timeframe: z
          .enum(['24h', '7d', '30d'])
          .optional()
          .default('7d')
          .describe('Time period for mentions'),
      }),
      outputSchema: z.object({
        mentions: z.array(
          z.object({
            competitor: z.string(),
            platform: z.string(),
            content: z.string(),
            sentiment: z.string(),
            engagement: z.record(z.number()),
            timestamp: z.string(),
            url: z.string().optional(),
          })
        ),
      }),
      execute: async (input) => {
        return {
          mentions: input.competitors.flatMap((competitor) => [
            {
              competitor,
              platform: 'x',
              content: `${competitor} just launched their new AI feature. Looks interesting but pricey.`,
              sentiment: 'neutral',
              engagement: { likes: 89, reposts: 12 } as Record<string, number>,
              timestamp: '2026-01-10T10:00:00Z',
              url: `https://x.com/user/status/${Date.now()}`,
            },
            {
              competitor,
              platform: 'reddit',
              content: `Has anyone tried ${competitor}'s new pricing? Seems more expensive than before.`,
              sentiment: 'negative',
              engagement: { upvotes: 45, comments: 23 } as Record<string, number>,
              timestamp: '2026-01-09T14:30:00Z',
              url: `https://reddit.com/r/productmanagement/comments/${Date.now()}`,
            },
            {
              competitor,
              platform: 'linkedin',
              content: `Great webinar by ${competitor} on AI in product management. Key takeaways in thread.`,
              sentiment: 'positive',
              engagement: { likes: 234, comments: 12 } as Record<string, number>,
              timestamp: '2026-01-08T09:00:00Z',
              url: `https://linkedin.com/posts/${Date.now()}`,
            },
          ]),
        };
      },
    });

    // Get sentiment summary
    this.registerTool({
      name: 'get_sentiment_summary',
      description: 'Get aggregated sentiment analysis across platforms',
      inputSchema: z.object({
        keywords: z.array(z.string()).describe('Keywords to analyze sentiment for'),
        timeframe: z.enum(['24h', '7d', '30d']).optional().default('7d'),
      }),
      outputSchema: z.object({
        summary: z.object({
          overall: z.object({
            positive: z.number(),
            negative: z.number(),
            neutral: z.number(),
          }),
          byPlatform: z.array(
            z.object({
              platform: z.string(),
              positive: z.number(),
              negative: z.number(),
              neutral: z.number(),
              totalMentions: z.number(),
            })
          ),
          topPositiveThemes: z.array(z.string()),
          topNegativeThemes: z.array(z.string()),
        }),
      }),
      execute: async () => {
        return {
          summary: {
            overall: { positive: 62, negative: 18, neutral: 20 },
            byPlatform: [
              { platform: 'x', positive: 58, negative: 22, neutral: 20, totalMentions: 1234 },
              { platform: 'reddit', positive: 45, negative: 35, neutral: 20, totalMentions: 567 },
              { platform: 'linkedin', positive: 78, negative: 8, neutral: 14, totalMentions: 890 },
              { platform: 'discord', positive: 72, negative: 12, neutral: 16, totalMentions: 345 },
            ],
            topPositiveThemes: [
              'Integration quality',
              'Time savings',
              'Customer support',
              'AI features',
            ],
            topNegativeThemes: ['Pricing concerns', 'Dashboard performance', 'Learning curve'],
          },
        };
      },
    });
  }
}

export const mockSocialCrawlerServer = new MockSocialCrawlerMCPServer();
