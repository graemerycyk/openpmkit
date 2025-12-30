import { z } from 'zod';
import { BaseMCPServer } from '@pmkit/mcp';

// ============================================================================
// Competitor Intel Data Types
// ============================================================================

export const CompetitorSchema = z.object({
  id: z.string(),
  name: z.string(),
  website: z.string(),
  description: z.string(),
  category: z.string(),
  lastUpdated: z.string(),
});

export type Competitor = z.infer<typeof CompetitorSchema>;

export const CompetitorChangeSchema = z.object({
  id: z.string(),
  competitorId: z.string(),
  competitorName: z.string(),
  changeType: z.enum([
    'pricing',
    'feature',
    'messaging',
    'integration',
    'acquisition',
    'funding',
    'leadership',
    'product_launch',
  ]),
  title: z.string(),
  summary: z.string(),
  details: z.string(),
  source: z.string(),
  sourceUrl: z.string().optional(),
  detectedAt: z.string(),
  significance: z.enum(['low', 'medium', 'high', 'critical']),
});

export type CompetitorChange = z.infer<typeof CompetitorChangeSchema>;

export const CompetitorFeatureSchema = z.object({
  competitorId: z.string(),
  competitorName: z.string(),
  featureName: z.string(),
  category: z.string(),
  description: z.string(),
  hasFeature: z.boolean(),
  notes: z.string().optional(),
  lastVerified: z.string(),
});

export type CompetitorFeature = z.infer<typeof CompetitorFeatureSchema>;

// ============================================================================
// Mock Competitor Intel MCP Server
// ============================================================================

export class MockCompetitorMCPServer extends BaseMCPServer {
  private mockCompetitors: Map<string, Competitor> = new Map();
  private mockChanges: CompetitorChange[] = [];
  private mockFeatures: CompetitorFeature[] = [];

  constructor() {
    super({
      name: 'competitor',
      description: 'Competitor intelligence integration for tracking market changes',
      version: '1.0.0',
    });

    this.registerTools();
  }

  loadMockData(
    competitors: Competitor[],
    changes: CompetitorChange[],
    features: CompetitorFeature[]
  ): void {
    this.mockCompetitors.clear();
    this.mockChanges = changes;
    this.mockFeatures = features;

    for (const competitor of competitors) {
      this.mockCompetitors.set(competitor.id, competitor);
    }
  }

  private registerTools(): void {
    this.registerTool({
      name: 'get_competitors',
      description: 'Get list of tracked competitors',
      inputSchema: z.object({
        category: z.string().optional(),
      }),
      outputSchema: z.array(CompetitorSchema),
      execute: async (input) => {
        let competitors = Array.from(this.mockCompetitors.values());

        if (input.category) {
          competitors = competitors.filter((c) => c.category === input.category);
        }

        return competitors;
      },
    });

    this.registerTool({
      name: 'get_competitor',
      description: 'Get details for a specific competitor',
      inputSchema: z.object({ competitorId: z.string() }),
      outputSchema: CompetitorSchema.nullable(),
      execute: async (input) => {
        return this.mockCompetitors.get(input.competitorId) || null;
      },
    });

    this.registerTool({
      name: 'get_recent_changes',
      description: 'Get recent competitor changes and updates',
      inputSchema: z.object({
        competitorId: z.string().optional(),
        changeType: z
          .enum([
            'pricing',
            'feature',
            'messaging',
            'integration',
            'acquisition',
            'funding',
            'leadership',
            'product_launch',
          ])
          .optional(),
        significance: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        fromDate: z.string().optional(),
        limit: z.number().optional().default(25),
      }),
      outputSchema: z.array(CompetitorChangeSchema),
      execute: async (input) => {
        let changes = [...this.mockChanges];

        if (input.competitorId) {
          changes = changes.filter((c) => c.competitorId === input.competitorId);
        }
        if (input.changeType) {
          changes = changes.filter((c) => c.changeType === input.changeType);
        }
        if (input.significance) {
          changes = changes.filter((c) => c.significance === input.significance);
        }

        // Sort by detected date descending
        changes.sort(
          (a, b) =>
            new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
        );

        return changes.slice(0, input.limit);
      },
    });

    this.registerTool({
      name: 'get_significant_changes',
      description: 'Get high-significance competitor changes that need attention',
      inputSchema: z.object({
        minSignificance: z.enum(['medium', 'high', 'critical']).optional().default('high'),
        limit: z.number().optional().default(10),
      }),
      outputSchema: z.array(CompetitorChangeSchema),
      execute: async (input) => {
        const significanceOrder = ['low', 'medium', 'high', 'critical'];
        const minSignificance = input.minSignificance ?? 'high';
        const limit = input.limit ?? 10;
        const minIndex = significanceOrder.indexOf(minSignificance);

        return this.mockChanges
          .filter(
            (c) => significanceOrder.indexOf(c.significance) >= minIndex
          )
          .sort(
            (a, b) =>
              new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
          )
          .slice(0, limit);
      },
    });

    this.registerTool({
      name: 'get_feature_comparison',
      description: 'Get feature comparison across competitors',
      inputSchema: z.object({
        featureCategory: z.string().optional(),
        competitorIds: z.array(z.string()).optional(),
      }),
      outputSchema: z.array(CompetitorFeatureSchema),
      execute: async (input) => {
        let features = [...this.mockFeatures];

        if (input.featureCategory) {
          features = features.filter((f) => f.category === input.featureCategory);
        }
        if (input.competitorIds?.length) {
          features = features.filter((f) =>
            input.competitorIds!.includes(f.competitorId)
          );
        }

        return features;
      },
    });

    this.registerTool({
      name: 'get_competitor_gaps',
      description: 'Get features where we have an advantage over competitors',
      inputSchema: z.object({
        competitorId: z.string().optional(),
      }),
      outputSchema: z.array(
        z.object({
          featureName: z.string(),
          category: z.string(),
          competitorsWithout: z.array(z.string()),
        })
      ),
      execute: async (input) => {
        // Group features by name
        const featureMap: Record<
          string,
          { category: string; competitorsWithout: string[] }
        > = {};

        let features = [...this.mockFeatures];
        if (input.competitorId) {
          features = features.filter((f) => f.competitorId === input.competitorId);
        }

        for (const feature of features) {
          if (!feature.hasFeature) {
            if (!featureMap[feature.featureName]) {
              featureMap[feature.featureName] = {
                category: feature.category,
                competitorsWithout: [],
              };
            }
            featureMap[feature.featureName].competitorsWithout.push(
              feature.competitorName
            );
          }
        }

        return Object.entries(featureMap).map(([name, data]) => ({
          featureName: name,
          category: data.category,
          competitorsWithout: data.competitorsWithout,
        }));
      },
    });

    this.registerTool({
      name: 'generate_competitor_diff',
      description: 'Generate a diff summary of competitor changes over a period',
      inputSchema: z.object({
        competitorId: z.string(),
        fromDate: z.string(),
        toDate: z.string().optional(),
      }),
      outputSchema: z.object({
        competitor: CompetitorSchema,
        changes: z.array(CompetitorChangeSchema),
        summary: z.object({
          totalChanges: z.number(),
          byType: z.record(z.number()),
          bySignificance: z.record(z.number()),
          highlights: z.array(z.string()),
        }),
      }),
      execute: async (input) => {
        const competitor = this.mockCompetitors.get(input.competitorId);
        if (!competitor) {
          throw new Error(`Competitor not found: ${input.competitorId}`);
        }

        const fromDate = new Date(input.fromDate);
        const toDate = input.toDate ? new Date(input.toDate) : new Date();

        const changes = this.mockChanges.filter((c) => {
          if (c.competitorId !== input.competitorId) return false;
          const detected = new Date(c.detectedAt);
          return detected >= fromDate && detected <= toDate;
        });

        const byType: Record<string, number> = {};
        const bySignificance: Record<string, number> = {};

        for (const change of changes) {
          byType[change.changeType] = (byType[change.changeType] || 0) + 1;
          bySignificance[change.significance] =
            (bySignificance[change.significance] || 0) + 1;
        }

        const highlights = changes
          .filter((c) => c.significance === 'high' || c.significance === 'critical')
          .map((c) => c.title);

        return {
          competitor,
          changes,
          summary: {
            totalChanges: changes.length,
            byType,
            bySignificance,
            highlights,
          },
        };
      },
    });
  }
}

export const mockCompetitorServer = new MockCompetitorMCPServer();

