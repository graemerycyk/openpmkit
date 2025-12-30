import { z } from 'zod';
import { BaseMCPServer } from '@pmkit/mcp';

// ============================================================================
// Analytics Data Types (PX, Amplitude, Algolia, etc.)
// ============================================================================

export const AnalyticsEventSchema = z.object({
  id: z.string(),
  eventType: z.string(),
  userId: z.string().optional(),
  sessionId: z.string(),
  timestamp: z.string(),
  properties: z.record(z.unknown()),
  source: z.enum(['px', 'amplitude', 'algolia', 'segment', 'custom']),
});

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

export const SearchQuerySchema = z.object({
  query: z.string(),
  count: z.number(),
  clickThroughRate: z.number(),
  avgPosition: z.number().optional(),
  noResultsRate: z.number(),
  period: z.string(),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export const FeatureUsageSchema = z.object({
  featureName: z.string(),
  uniqueUsers: z.number(),
  totalEvents: z.number(),
  avgSessionsPerUser: z.number(),
  adoptionRate: z.number(),
  trend: z.enum(['up', 'down', 'stable']),
  period: z.string(),
});

export type FeatureUsage = z.infer<typeof FeatureUsageSchema>;

export const UserJourneySchema = z.object({
  userId: z.string(),
  accountName: z.string().optional(),
  events: z.array(
    z.object({
      eventType: z.string(),
      timestamp: z.string(),
      properties: z.record(z.unknown()),
    })
  ),
  totalSessions: z.number(),
  firstSeen: z.string(),
  lastSeen: z.string(),
});

export type UserJourney = z.infer<typeof UserJourneySchema>;

// ============================================================================
// Mock Analytics MCP Server
// ============================================================================

export class MockAnalyticsMCPServer extends BaseMCPServer {
  private mockEvents: AnalyticsEvent[] = [];
  private mockSearchQueries: SearchQuery[] = [];
  private mockFeatureUsage: FeatureUsage[] = [];
  private mockUserJourneys: Map<string, UserJourney> = new Map();

  constructor() {
    super({
      name: 'analytics',
      description:
        'Product analytics integration for usage data, search analytics, and feature adoption',
      version: '1.0.0',
    });

    this.registerTools();
  }

  loadMockData(
    events: AnalyticsEvent[],
    searchQueries: SearchQuery[],
    featureUsage: FeatureUsage[],
    userJourneys: UserJourney[]
  ): void {
    this.mockEvents = events;
    this.mockSearchQueries = searchQueries;
    this.mockFeatureUsage = featureUsage;
    this.mockUserJourneys.clear();

    for (const journey of userJourneys) {
      this.mockUserJourneys.set(journey.userId, journey);
    }
  }

  private registerTools(): void {
    this.registerTool({
      name: 'get_events',
      description: 'Get raw analytics events',
      inputSchema: z.object({
        eventType: z.string().optional(),
        source: z.enum(['px', 'amplitude', 'algolia', 'segment', 'custom']).optional(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
        limit: z.number().optional().default(100),
      }),
      outputSchema: z.object({
        events: z.array(AnalyticsEventSchema),
        total: z.number(),
      }),
      execute: async (input) => {
        let events = [...this.mockEvents];

        if (input.eventType) {
          events = events.filter((e) => e.eventType === input.eventType);
        }
        if (input.source) {
          events = events.filter((e) => e.source === input.source);
        }

        return {
          events: events.slice(0, input.limit),
          total: events.length,
        };
      },
    });

    this.registerTool({
      name: 'get_search_analytics',
      description: 'Get search query analytics (from Algolia or similar)',
      inputSchema: z.object({
        period: z.enum(['day', 'week', 'month']).optional().default('week'),
        minCount: z.number().optional().default(5),
        sortBy: z
          .enum(['count', 'noResultsRate', 'clickThroughRate'])
          .optional()
          .default('count'),
        limit: z.number().optional().default(50),
      }),
      outputSchema: z.object({
        queries: z.array(SearchQuerySchema),
        summary: z.object({
          totalQueries: z.number(),
          avgNoResultsRate: z.number(),
          avgClickThroughRate: z.number(),
        }),
      }),
      execute: async (input) => {
        const minCount = input.minCount ?? 5;
        let queries = [...this.mockSearchQueries].filter(
          (q) => q.count >= minCount
        );

        // Sort
        queries.sort((a, b) => {
          switch (input.sortBy) {
            case 'noResultsRate':
              return b.noResultsRate - a.noResultsRate;
            case 'clickThroughRate':
              return b.clickThroughRate - a.clickThroughRate;
            default:
              return b.count - a.count;
          }
        });

        const totalQueries = queries.reduce((sum, q) => sum + q.count, 0);
        const avgNoResultsRate =
          queries.reduce((sum, q) => sum + q.noResultsRate * q.count, 0) /
          totalQueries;
        const avgClickThroughRate =
          queries.reduce((sum, q) => sum + q.clickThroughRate * q.count, 0) /
          totalQueries;

        return {
          queries: queries.slice(0, input.limit),
          summary: {
            totalQueries,
            avgNoResultsRate: avgNoResultsRate || 0,
            avgClickThroughRate: avgClickThroughRate || 0,
          },
        };
      },
    });

    this.registerTool({
      name: 'get_no_results_queries',
      description: 'Get search queries with high no-results rate',
      inputSchema: z.object({
        minNoResultsRate: z.number().optional().default(0.3),
        minCount: z.number().optional().default(10),
        limit: z.number().optional().default(25),
      }),
      outputSchema: z.array(SearchQuerySchema),
      execute: async (input) => {
        const minNoResultsRate = input.minNoResultsRate ?? 0.3;
        const minCount = input.minCount ?? 10;
        const limit = input.limit ?? 25;
        return this.mockSearchQueries
          .filter(
            (q) =>
              q.noResultsRate >= minNoResultsRate && q.count >= minCount
          )
          .sort((a, b) => b.noResultsRate - a.noResultsRate)
          .slice(0, limit);
      },
    });

    this.registerTool({
      name: 'get_feature_usage',
      description: 'Get feature adoption and usage metrics',
      inputSchema: z.object({
        period: z.enum(['day', 'week', 'month']).optional().default('week'),
        sortBy: z
          .enum(['uniqueUsers', 'totalEvents', 'adoptionRate'])
          .optional()
          .default('uniqueUsers'),
        limit: z.number().optional().default(25),
      }),
      outputSchema: z.array(FeatureUsageSchema),
      execute: async (input) => {
        const features = [...this.mockFeatureUsage];

        features.sort((a, b) => {
          switch (input.sortBy) {
            case 'totalEvents':
              return b.totalEvents - a.totalEvents;
            case 'adoptionRate':
              return b.adoptionRate - a.adoptionRate;
            default:
              return b.uniqueUsers - a.uniqueUsers;
          }
        });

        return features.slice(0, input.limit);
      },
    });

    this.registerTool({
      name: 'get_low_adoption_features',
      description: 'Get features with low adoption that may need attention',
      inputSchema: z.object({
        maxAdoptionRate: z.number().optional().default(0.2),
        limit: z.number().optional().default(10),
      }),
      outputSchema: z.array(FeatureUsageSchema),
      execute: async (input) => {
        const maxAdoptionRate = input.maxAdoptionRate ?? 0.2;
        const limit = input.limit ?? 10;
        return this.mockFeatureUsage
          .filter((f) => f.adoptionRate <= maxAdoptionRate)
          .sort((a, b) => a.adoptionRate - b.adoptionRate)
          .slice(0, limit);
      },
    });

    this.registerTool({
      name: 'get_user_journey',
      description: 'Get the event journey for a specific user',
      inputSchema: z.object({
        userId: z.string(),
      }),
      outputSchema: UserJourneySchema.nullable(),
      execute: async (input) => {
        return this.mockUserJourneys.get(input.userId) || null;
      },
    });

    this.registerTool({
      name: 'get_drop_off_points',
      description: 'Identify common drop-off points in user journeys',
      inputSchema: z.object({
        flowName: z.string().optional(),
        limit: z.number().optional().default(10),
      }),
      outputSchema: z.array(
        z.object({
          step: z.string(),
          dropOffRate: z.number(),
          totalUsers: z.number(),
          droppedUsers: z.number(),
        })
      ),
      execute: async () => {
        // Mock drop-off data
        return [
          {
            step: 'onboarding_step_3',
            dropOffRate: 0.35,
            totalUsers: 1000,
            droppedUsers: 350,
          },
          {
            step: 'first_project_creation',
            dropOffRate: 0.28,
            totalUsers: 650,
            droppedUsers: 182,
          },
          {
            step: 'invite_team_member',
            dropOffRate: 0.45,
            totalUsers: 468,
            droppedUsers: 211,
          },
        ];
      },
    });

    this.registerTool({
      name: 'get_engagement_metrics',
      description: 'Get overall engagement metrics',
      inputSchema: z.object({
        period: z.enum(['day', 'week', 'month']).optional().default('week'),
      }),
      outputSchema: z.object({
        dau: z.number(),
        wau: z.number(),
        mau: z.number(),
        dauMauRatio: z.number(),
        avgSessionDuration: z.number(),
        avgSessionsPerUser: z.number(),
        retentionRate: z.number(),
      }),
      execute: async () => {
        // Mock engagement metrics
        return {
          dau: 2450,
          wau: 8900,
          mau: 24500,
          dauMauRatio: 0.1,
          avgSessionDuration: 12.5,
          avgSessionsPerUser: 3.2,
          retentionRate: 0.72,
        };
      },
    });
  }
}

export const mockAnalyticsServer = new MockAnalyticsMCPServer();

