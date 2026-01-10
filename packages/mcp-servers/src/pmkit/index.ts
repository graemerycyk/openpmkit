import { z } from 'zod';
import { BaseMCPServer, createProposalTool, type MCPContext } from '@pmkit/mcp';
import {
  ArtifactSchema,
  ArtifactTypeSchema,
  JobSchema,
  JobTypeSchema,
  ProposalSchema,
  type Artifact,
  type Job,
  type Proposal,
} from '@pmkit/core';

// ============================================================================
// pmkit MCP Server
// ============================================================================
// This is the REAL pmkit MCP server (not a mock) that exposes pmkit's internal
// artifacts, jobs, and proposals through the standard MCP protocol.
//
// In production: queries the actual database via Prisma
// In demo mode: uses mock data from @pmkit/mock-tenant
// ============================================================================

// ============================================================================
// Data Store Interface
// ============================================================================
// Abstract interface for data access - allows swapping between real DB and mock

export interface PmkitDataStore {
  // Artifacts
  getArtifact(tenantId: string, artifactId: string): Promise<Artifact | null>;
  listArtifacts(
    tenantId: string,
    options?: { type?: string; limit?: number; offset?: number }
  ): Promise<Artifact[]>;
  searchArtifacts(tenantId: string, query: string): Promise<Artifact[]>;

  // Jobs
  getJob(tenantId: string, jobId: string): Promise<Job | null>;
  listJobs(
    tenantId: string,
    options?: { type?: string; status?: string; limit?: number }
  ): Promise<Job[]>;

  // Proposals
  getProposal(tenantId: string, proposalId: string): Promise<Proposal | null>;
  listProposals(
    tenantId: string,
    options?: { status?: string; limit?: number }
  ): Promise<Proposal[]>;
}

// ============================================================================
// pmkit MCP Server Implementation
// ============================================================================

export class PmkitMCPServer extends BaseMCPServer {
  private dataStore: PmkitDataStore;

  constructor(dataStore: PmkitDataStore) {
    super({
      name: 'pmkit',
      description: 'Access pmkit artifacts, jobs, and proposals',
      version: '1.0.0',
    });

    this.dataStore = dataStore;
    this.registerTools();
  }

  /**
   * Update the data store (useful for switching between mock and real)
   */
  setDataStore(dataStore: PmkitDataStore): void {
    this.dataStore = dataStore;
  }

  private registerTools(): void {
    // ========================================================================
    // Artifact Tools
    // ========================================================================

    this.registerTool({
      name: 'get_artifact',
      description: 'Get a pmkit artifact by ID (PRD, brief, VoC report, etc.)',
      inputSchema: z.object({
        artifactId: z.string().describe('The artifact ID'),
      }),
      outputSchema: ArtifactSchema.nullable(),
      execute: async (input, context) => {
        return this.dataStore.getArtifact(context.tenantId, input.artifactId);
      },
    });

    this.registerTool({
      name: 'list_artifacts',
      description: 'List pmkit artifacts with optional filters',
      inputSchema: z.object({
        type: ArtifactTypeSchema.optional().describe('Filter by artifact type'),
        limit: z.number().optional().default(10).describe('Maximum results to return'),
        offset: z.number().optional().default(0).describe('Offset for pagination'),
      }),
      outputSchema: z.object({
        artifacts: z.array(ArtifactSchema),
        total: z.number(),
      }),
      execute: async (input, context) => {
        const artifacts = await this.dataStore.listArtifacts(context.tenantId, {
          type: input.type,
          limit: input.limit,
          offset: input.offset,
        });
        return {
          artifacts,
          total: artifacts.length,
        };
      },
    });

    this.registerTool({
      name: 'search_artifacts',
      description: 'Search pmkit artifact content',
      inputSchema: z.object({
        query: z.string().describe('Search query'),
      }),
      outputSchema: z.object({
        artifacts: z.array(ArtifactSchema),
        total: z.number(),
      }),
      execute: async (input, context) => {
        const artifacts = await this.dataStore.searchArtifacts(
          context.tenantId,
          input.query
        );
        return {
          artifacts,
          total: artifacts.length,
        };
      },
    });

    this.registerTool({
      name: 'get_recent_artifacts',
      description: 'Get the most recent pmkit artifacts',
      inputSchema: z.object({
        limit: z.number().optional().default(5).describe('Number of artifacts to return'),
        type: ArtifactTypeSchema.optional().describe('Filter by artifact type'),
      }),
      outputSchema: z.array(ArtifactSchema),
      execute: async (input, context) => {
        return this.dataStore.listArtifacts(context.tenantId, {
          type: input.type,
          limit: input.limit,
        });
      },
    });

    // ========================================================================
    // Job Tools
    // ========================================================================

    this.registerTool({
      name: 'get_job',
      description: 'Get a pmkit job by ID',
      inputSchema: z.object({
        jobId: z.string().describe('The job ID'),
      }),
      outputSchema: JobSchema.nullable(),
      execute: async (input, context) => {
        return this.dataStore.getJob(context.tenantId, input.jobId);
      },
    });

    this.registerTool({
      name: 'list_jobs',
      description: 'List pmkit jobs with optional filters',
      inputSchema: z.object({
        type: JobTypeSchema.optional().describe('Filter by job type'),
        status: z.enum(['pending', 'running', 'completed', 'failed']).optional(),
        limit: z.number().optional().default(10),
      }),
      outputSchema: z.object({
        jobs: z.array(JobSchema),
        total: z.number(),
      }),
      execute: async (input, context) => {
        const jobs = await this.dataStore.listJobs(context.tenantId, {
          type: input.type,
          status: input.status,
          limit: input.limit,
        });
        return {
          jobs,
          total: jobs.length,
        };
      },
    });

    // ========================================================================
    // Proposal Tools
    // ========================================================================

    this.registerTool({
      name: 'get_proposal',
      description: 'Get a pmkit proposal by ID',
      inputSchema: z.object({
        proposalId: z.string().describe('The proposal ID'),
      }),
      outputSchema: ProposalSchema.nullable(),
      execute: async (input, context) => {
        return this.dataStore.getProposal(context.tenantId, input.proposalId);
      },
    });

    this.registerTool({
      name: 'list_proposals',
      description: 'List pmkit proposals with optional filters',
      inputSchema: z.object({
        status: z
          .enum(['draft', 'pending_review', 'approved', 'rejected', 'executed'])
          .optional(),
        limit: z.number().optional().default(10),
      }),
      outputSchema: z.object({
        proposals: z.array(ProposalSchema),
        total: z.number(),
      }),
      execute: async (input, context) => {
        const proposals = await this.dataStore.listProposals(context.tenantId, {
          status: input.status,
          limit: input.limit,
        });
        return {
          proposals,
          total: proposals.length,
        };
      },
    });

    // ========================================================================
    // Proposal Tools (Draft-Only Pattern)
    // ========================================================================

    this.registerTool(
      createProposalTool(
        'artifact_update',
        'Propose an update to an existing artifact',
        z.object({
          artifactId: z.string().describe('The artifact ID to update'),
          title: z.string().optional().describe('New title'),
          content: z.string().optional().describe('New content'),
          metadata: z.record(z.unknown()).optional().describe('Updated metadata'),
        }),
        'pmkit',
        async (input, context) => {
          const artifact = await this.dataStore.getArtifact(
            context.tenantId,
            input.artifactId
          );

          if (!artifact) {
            throw new Error(`Artifact not found: ${input.artifactId}`);
          }

          const changes: string[] = [];
          if (input.title && input.title !== artifact.title) {
            changes.push(`Title: "${artifact.title}" → "${input.title}"`);
          }
          if (input.content) {
            changes.push('Content updated');
          }
          if (input.metadata) {
            changes.push('Metadata updated');
          }

          return {
            title: `Update ${artifact.type}: ${artifact.title}`,
            preview: `**Proposed changes to ${artifact.title}:**\n\n${changes.join('\n')}`,
            diff: changes.join('\n'),
            bundle: {
              artifactId: input.artifactId,
              updates: {
                title: input.title,
                content: input.content,
                metadata: input.metadata,
              },
            },
            targetId: input.artifactId,
          };
        }
      )
    );

    this.registerTool(
      createProposalTool(
        'artifact_link',
        'Propose linking two artifacts together',
        z.object({
          sourceArtifactId: z.string().describe('The source artifact ID'),
          targetArtifactId: z.string().describe('The target artifact ID'),
          linkType: z
            .enum(['derived_from', 'supersedes', 'related_to', 'implements'])
            .describe('Type of relationship'),
          notes: z.string().optional().describe('Notes about the relationship'),
        }),
        'pmkit',
        async (input, context) => {
          const source = await this.dataStore.getArtifact(
            context.tenantId,
            input.sourceArtifactId
          );
          const target = await this.dataStore.getArtifact(
            context.tenantId,
            input.targetArtifactId
          );

          if (!source) {
            throw new Error(`Source artifact not found: ${input.sourceArtifactId}`);
          }
          if (!target) {
            throw new Error(`Target artifact not found: ${input.targetArtifactId}`);
          }

          return {
            title: `Link: ${source.title} → ${target.title}`,
            preview: `**Proposed artifact link:**\n\n- **Source**: ${source.title} (${source.type})\n- **Target**: ${target.title} (${target.type})\n- **Relationship**: ${input.linkType}\n${input.notes ? `- **Notes**: ${input.notes}` : ''}`,
            bundle: {
              sourceArtifactId: input.sourceArtifactId,
              targetArtifactId: input.targetArtifactId,
              linkType: input.linkType,
              notes: input.notes,
            },
          };
        }
      )
    );
  }
}

// ============================================================================
// In-Memory Data Store (for demo mode)
// ============================================================================
// Note: This avoids circular dependency with @pmkit/mock-tenant
// The mock data is loaded separately via loadMockData()

/**
 * In-memory data store implementation for demo/testing
 */
export class InMemoryPmkitDataStore implements PmkitDataStore {
  private artifacts: Artifact[] = [];
  private jobs: Job[] = [];
  private proposals: Proposal[] = [];

  /**
   * Load artifacts into the store
   */
  loadArtifacts(artifacts: Artifact[]): void {
    this.artifacts = artifacts;
  }

  /**
   * Load jobs into the store
   */
  loadJobs(jobs: Job[]): void {
    this.jobs = jobs;
  }

  /**
   * Load proposals into the store
   */
  loadProposals(proposals: Proposal[]): void {
    this.proposals = proposals;
  }

  async getArtifact(_tenantId: string, artifactId: string): Promise<Artifact | null> {
    return this.artifacts.find((a) => a.id === artifactId) || null;
  }

  async listArtifacts(
    _tenantId: string,
    options?: { type?: string; limit?: number; offset?: number }
  ): Promise<Artifact[]> {
    let results = [...this.artifacts];

    if (options?.type) {
      results = results.filter((a) => a.type === options.type);
    }

    // Sort by createdAt descending
    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const offset = options?.offset || 0;
    const limit = options?.limit || 10;

    return results.slice(offset, offset + limit);
  }

  async searchArtifacts(_tenantId: string, query: string): Promise<Artifact[]> {
    const lowerQuery = query.toLowerCase();
    return this.artifacts.filter(
      (a) =>
        a.title.toLowerCase().includes(lowerQuery) ||
        a.content.toLowerCase().includes(lowerQuery)
    );
  }

  async getJob(_tenantId: string, jobId: string): Promise<Job | null> {
    return this.jobs.find((j) => j.id === jobId) || null;
  }

  async listJobs(
    _tenantId: string,
    options?: { type?: string; status?: string; limit?: number }
  ): Promise<Job[]> {
    let results = [...this.jobs];

    if (options?.type) {
      results = results.filter((j) => j.type === options.type);
    }
    if (options?.status) {
      results = results.filter((j) => j.status === options.status);
    }

    const limit = options?.limit || 10;
    return results.slice(0, limit);
  }

  async getProposal(_tenantId: string, proposalId: string): Promise<Proposal | null> {
    return this.proposals.find((p) => p.id === proposalId) || null;
  }

  async listProposals(
    _tenantId: string,
    options?: { status?: string; limit?: number }
  ): Promise<Proposal[]> {
    let results = [...this.proposals];

    if (options?.status) {
      results = results.filter((p) => p.status === options.status);
    }

    const limit = options?.limit || 10;
    return results.slice(0, limit);
  }
}

// ============================================================================
// Default Instance
// ============================================================================

export const inMemoryPmkitDataStore = new InMemoryPmkitDataStore();
export const pmkitServer = new PmkitMCPServer(inMemoryPmkitDataStore);
