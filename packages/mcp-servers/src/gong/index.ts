import { z } from 'zod';
import { BaseMCPServer } from '@pmkit/mcp';

// ============================================================================
// Gong Data Types
// ============================================================================

export const GongCallSchema = z.object({
  id: z.string(),
  title: z.string(),
  scheduledAt: z.string(),
  duration: z.number(), // minutes
  participants: z.array(
    z.object({
      name: z.string(),
      email: z.string(),
      role: z.enum(['internal', 'external']),
    })
  ),
  accountName: z.string().optional(),
  dealStage: z.string().optional(),
  topics: z.array(z.string()),
  sentiment: z.enum(['positive', 'neutral', 'negative', 'mixed']),
});

export type GongCall = z.infer<typeof GongCallSchema>;

export const GongTranscriptSegmentSchema = z.object({
  callId: z.string(),
  speaker: z.string(),
  speakerRole: z.enum(['internal', 'external']),
  text: z.string(),
  startTime: z.number(), // seconds
  endTime: z.number(),
  topics: z.array(z.string()),
});

export type GongTranscriptSegment = z.infer<typeof GongTranscriptSegmentSchema>;

export const GongInsightSchema = z.object({
  callId: z.string(),
  type: z.enum([
    'pain_point',
    'feature_request',
    'competitor_mention',
    'objection',
    'positive_feedback',
    'question',
    'action_item',
  ]),
  text: z.string(),
  context: z.string(),
  speaker: z.string(),
  timestamp: z.number(),
});

export type GongInsight = z.infer<typeof GongInsightSchema>;

// ============================================================================
// Mock Gong MCP Server
// ============================================================================

export class MockGongMCPServer extends BaseMCPServer {
  private mockCalls: Map<string, GongCall> = new Map();
  private mockTranscripts: Map<string, GongTranscriptSegment[]> = new Map();
  private mockInsights: Map<string, GongInsight[]> = new Map();

  constructor() {
    super({
      name: 'gong',
      description: 'Gong integration for call recordings, transcripts, and insights',
      version: '1.0.0',
    });

    this.registerTools();
  }

  loadMockData(
    calls: GongCall[],
    transcripts: GongTranscriptSegment[],
    insights: GongInsight[]
  ): void {
    this.mockCalls.clear();
    this.mockTranscripts.clear();
    this.mockInsights.clear();

    for (const call of calls) {
      this.mockCalls.set(call.id, call);
    }

    // Group transcripts by call
    for (const segment of transcripts) {
      const existing = this.mockTranscripts.get(segment.callId) || [];
      existing.push(segment);
      this.mockTranscripts.set(segment.callId, existing);
    }

    // Group insights by call
    for (const insight of insights) {
      const existing = this.mockInsights.get(insight.callId) || [];
      existing.push(insight);
      this.mockInsights.set(insight.callId, existing);
    }
  }

  private registerTools(): void {
    this.registerTool({
      name: 'get_calls',
      description: 'Get recent Gong calls',
      inputSchema: z.object({
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
        accountName: z.string().optional(),
        limit: z.number().optional().default(50),
      }),
      outputSchema: z.object({
        calls: z.array(GongCallSchema),
        total: z.number(),
      }),
      execute: async (input) => {
        let calls = Array.from(this.mockCalls.values());

        if (input.accountName) {
          calls = calls.filter((c) =>
            c.accountName?.toLowerCase().includes(input.accountName!.toLowerCase())
          );
        }

        // Sort by date descending
        calls.sort(
          (a, b) =>
            new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
        );

        return {
          calls: calls.slice(0, input.limit),
          total: calls.length,
        };
      },
    });

    this.registerTool({
      name: 'get_call',
      description: 'Get a specific Gong call by ID',
      inputSchema: z.object({ callId: z.string() }),
      outputSchema: GongCallSchema.nullable(),
      execute: async (input) => {
        return this.mockCalls.get(input.callId) || null;
      },
    });

    this.registerTool({
      name: 'get_transcript',
      description: 'Get the full transcript for a Gong call',
      inputSchema: z.object({
        callId: z.string(),
        speakerRole: z.enum(['internal', 'external', 'all']).optional().default('all'),
      }),
      outputSchema: z.array(GongTranscriptSegmentSchema),
      execute: async (input) => {
        let segments = this.mockTranscripts.get(input.callId) || [];

        if (input.speakerRole !== 'all') {
          segments = segments.filter((s) => s.speakerRole === input.speakerRole);
        }

        return segments.sort((a, b) => a.startTime - b.startTime);
      },
    });

    this.registerTool({
      name: 'get_insights',
      description: 'Get AI-extracted insights from Gong calls',
      inputSchema: z.object({
        callId: z.string().optional(),
        type: z
          .enum([
            'pain_point',
            'feature_request',
            'competitor_mention',
            'objection',
            'positive_feedback',
            'question',
            'action_item',
          ])
          .optional(),
        limit: z.number().optional().default(100),
      }),
      outputSchema: z.array(GongInsightSchema),
      execute: async (input) => {
        let insights: GongInsight[] = [];

        if (input.callId) {
          insights = this.mockInsights.get(input.callId) || [];
        } else {
          insights = Array.from(this.mockInsights.values()).flat();
        }

        if (input.type) {
          insights = insights.filter((i) => i.type === input.type);
        }

        return insights.slice(0, input.limit);
      },
    });

    this.registerTool({
      name: 'search_transcripts',
      description: 'Search across all Gong transcripts',
      inputSchema: z.object({
        query: z.string(),
        speakerRole: z.enum(['internal', 'external', 'all']).optional().default('all'),
        limit: z.number().optional().default(50),
      }),
      outputSchema: z.array(
        z.object({
          segment: GongTranscriptSegmentSchema,
          call: GongCallSchema,
        })
      ),
      execute: async (input) => {
        const results: Array<{
          segment: GongTranscriptSegment;
          call: GongCall;
        }> = [];

        const query = input.query.toLowerCase();

        for (const [callId, segments] of this.mockTranscripts) {
          const call = this.mockCalls.get(callId);
          if (!call) continue;

          for (const segment of segments) {
            if (
              input.speakerRole !== 'all' &&
              segment.speakerRole !== input.speakerRole
            ) {
              continue;
            }

            if (segment.text.toLowerCase().includes(query)) {
              results.push({ segment, call });
            }
          }
        }

        return results.slice(0, input.limit);
      },
    });

    this.registerTool({
      name: 'get_pain_points',
      description: 'Get aggregated pain points from recent calls',
      inputSchema: z.object({
        fromDate: z.string().optional(),
        limit: z.number().optional().default(50),
      }),
      outputSchema: z.array(
        z.object({
          insight: GongInsightSchema,
          call: GongCallSchema,
        })
      ),
      execute: async (input) => {
        const results: Array<{ insight: GongInsight; call: GongCall }> = [];

        for (const [callId, insights] of this.mockInsights) {
          const call = this.mockCalls.get(callId);
          if (!call) continue;

          for (const insight of insights) {
            if (insight.type === 'pain_point') {
              results.push({ insight, call });
            }
          }
        }

        return results.slice(0, input.limit);
      },
    });
  }
}

export const mockGongServer = new MockGongMCPServer();

