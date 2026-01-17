import { z } from 'zod';
import {
  RealRestMCPServer,
  RestOAuthTokens,
  TokenRefreshCallback,
  buildQueryString,
} from '@pmkit/mcp';
import {
  GongCallSchema,
  GongTranscriptSegmentSchema,
  GongInsightSchema,
  GongCall,
  GongTranscriptSegment,
  GongInsight,
} from './index';

// ============================================================================
// Gong API Response Types
// ============================================================================

interface GongApiCall {
  metaData: {
    id: string;
    title?: string;
    scheduled?: string;
    duration?: number;
    parties?: Array<{
      name?: string;
      emailAddress?: string;
      affiliation?: 'Internal' | 'External';
    }>;
    primaryAccountName?: string;
  };
}

interface GongApiCallsResponse {
  requestId: string;
  records?: {
    calls?: GongApiCall[];
    cursor?: string;
    totalRecords?: number;
  };
}

interface GongApiTranscript {
  callId: string;
  transcript?: Array<{
    speakerId?: string;
    sentences?: Array<{
      text?: string;
      start?: number;
      end?: number;
    }>;
  }>;
}

// ============================================================================
// Real Gong MCP Server
// ============================================================================

const GONG_API_BASE = 'https://api.gong.io/v2';

export class RealGongMCPServer extends RealRestMCPServer {
  constructor(
    tokens: RestOAuthTokens,
    options?: {
      onTokenRefresh?: TokenRefreshCallback;
      timeout?: number;
    }
  ) {
    const clientId = process.env.GONG_CLIENT_ID ?? '';
    const clientSecret = process.env.GONG_CLIENT_SECRET ?? '';

    super(
      {
        name: 'gong',
        description: 'Gong integration via Gong REST API',
        version: '1.0.0',
      },
      tokens,
      {
        ...options,
        tokenRefreshConfig: {
          tokenUrl: 'https://app.gong.io/oauth2/generate-customer-token',
          clientId,
          clientSecret,
        },
      }
    );

    this.registerTools();
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
        const body: Record<string, unknown> = {};

        if (input.fromDate) {
          body.fromDateTime = new Date(input.fromDate).toISOString();
        }
        if (input.toDate) {
          body.toDateTime = new Date(input.toDate).toISOString();
        }

        const response = await this.post<GongApiCallsResponse>(
          `${GONG_API_BASE}/calls/extensive`,
          {
            filter: body,
            contentSelector: {
              context: 'Extended',
            },
          }
        );

        let calls = (response.records?.calls ?? []).map((c) => this.transformCall(c));

        if (input.accountName) {
          calls = calls.filter((c) =>
            c.accountName?.toLowerCase().includes(input.accountName!.toLowerCase())
          );
        }

        return {
          calls: calls.slice(0, input.limit),
          total: response.records?.totalRecords ?? calls.length,
        };
      },
    });

    this.registerTool({
      name: 'get_call',
      description: 'Get a specific Gong call by ID',
      inputSchema: z.object({ callId: z.string() }),
      outputSchema: GongCallSchema.nullable(),
      execute: async (input) => {
        try {
          const response = await this.post<GongApiCallsResponse>(
            `${GONG_API_BASE}/calls/extensive`,
            {
              filter: {
                callIds: [input.callId],
              },
              contentSelector: {
                context: 'Extended',
              },
            }
          );

          const apiCall = response.records?.calls?.[0];
          if (!apiCall) return null;

          return this.transformCall(apiCall);
        } catch {
          return null;
        }
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
        const response = await this.post<{ callTranscripts?: GongApiTranscript[] }>(
          `${GONG_API_BASE}/calls/transcript`,
          {
            filter: {
              callIds: [input.callId],
            },
          }
        );

        const transcriptData = response.callTranscripts?.[0];
        if (!transcriptData?.transcript) {
          return [];
        }

        const segments: GongTranscriptSegment[] = [];

        for (const speaker of transcriptData.transcript) {
          // Determine speaker role (simplified - would need to lookup user data)
          const speakerRole: 'internal' | 'external' = 'internal'; // Default

          if (input.speakerRole !== 'all' && speakerRole !== input.speakerRole) {
            continue;
          }

          for (const sentence of speaker.sentences ?? []) {
            segments.push({
              callId: input.callId,
              speaker: speaker.speakerId ?? 'Unknown',
              speakerRole,
              text: sentence.text ?? '',
              startTime: sentence.start ?? 0,
              endTime: sentence.end ?? 0,
              topics: [], // Topics would need separate API call
            });
          }
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
        // Gong insights API - would fetch from /calls/{callId}/points-of-interest
        // For now, return empty array as this requires specific API access
        return [];
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
        // Gong search API - would use /calls/search endpoint
        // For now, return empty array as this requires specific implementation
        return [];
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
        // This would aggregate insights from multiple calls
        // For now, return empty array
        return [];
      },
    });
  }

  // ============================================================================
  // Transform Gong API response to our schema
  // ============================================================================

  private transformCall(apiCall: GongApiCall): GongCall {
    const meta = apiCall.metaData;

    return {
      id: meta.id,
      title: meta.title ?? 'Untitled Call',
      scheduledAt: meta.scheduled ?? new Date().toISOString(),
      duration: meta.duration ?? 0,
      participants: (meta.parties ?? []).map((p) => ({
        name: p.name ?? 'Unknown',
        email: p.emailAddress ?? 'unknown@example.com',
        role: p.affiliation === 'External' ? 'external' : 'internal',
      })),
      accountName: meta.primaryAccountName,
      dealStage: undefined,
      topics: [],
      sentiment: 'neutral',
    };
  }

  // Override token refresh for Gong (uses Basic auth)
  protected async refreshAccessToken(): Promise<void> {
    if (!this.tokens.refreshToken) {
      throw new Error('No refresh token available');
    }

    const clientId = process.env.GONG_CLIENT_ID ?? '';
    const clientSecret = process.env.GONG_CLIENT_SECRET ?? '';
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch('https://app.gong.io/oauth2/generate-customer-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.tokens.refreshToken,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token refresh failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    this.tokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? this.tokens.refreshToken,
      expiresAt: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : undefined,
      expiresIn: data.expires_in,
      tokenType: data.token_type ?? 'Bearer',
      scope: data.scope ?? this.tokens.scope,
    };

    if (this.onTokenRefresh) {
      await this.onTokenRefresh(this.tokens);
    }
  }
}
