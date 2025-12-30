import { nanoid } from 'nanoid';
import type {
  Job,
  JobType,
  JobStatus,
  ToolCall,
  Artifact,
  Proposal,
  User,
} from '../types';
import { RBACService, requirePermission } from '../rbac';
import { AuditLogger, InMemoryAuditStore } from '../audit';

// ============================================================================
// Job Context (passed to job handlers)
// ============================================================================

export interface JobContext {
  job: Job;
  user: User;
  tenantId: string;
  auditLogger: AuditLogger;
  toolCalls: ToolCall[];
  artifacts: Artifact[];
  proposals: Proposal[];
  addToolCall: (toolCall: Omit<ToolCall, 'id' | 'jobId' | 'tenantId' | 'createdAt'>) => ToolCall;
  addArtifact: (artifact: Omit<Artifact, 'id' | 'jobId' | 'tenantId' | 'createdAt'>) => Artifact;
  addProposal: (proposal: Omit<Proposal, 'id' | 'jobId' | 'tenantId' | 'createdAt' | 'updatedAt'>) => Proposal;
}

// ============================================================================
// Job Handler Interface
// ============================================================================

export interface JobHandler {
  type: JobType;
  name: string;
  description: string;
  execute: (ctx: JobContext) => Promise<void>;
}

// ============================================================================
// Job Store Interface
// ============================================================================

export interface JobStore {
  save(job: Job): Promise<void>;
  findById(id: string): Promise<Job | null>;
  findByTenant(tenantId: string, options?: JobQueryOptions): Promise<Job[]>;
  update(id: string, updates: Partial<Job>): Promise<void>;
}

export interface JobQueryOptions {
  limit?: number;
  offset?: number;
  status?: JobStatus[];
  type?: JobType[];
}

// ============================================================================
// In-Memory Job Store (for demo)
// ============================================================================

export class InMemoryJobStore implements JobStore {
  private jobs: Map<string, Job> = new Map();

  async save(job: Job): Promise<void> {
    this.jobs.set(job.id, job);
  }

  async findById(id: string): Promise<Job | null> {
    return this.jobs.get(id) || null;
  }

  async findByTenant(
    tenantId: string,
    options: JobQueryOptions = {}
  ): Promise<Job[]> {
    let results = Array.from(this.jobs.values()).filter(
      (job) => job.tenantId === tenantId
    );

    if (options.status?.length) {
      results = results.filter((job) => options.status!.includes(job.status));
    }
    if (options.type?.length) {
      results = results.filter((job) => options.type!.includes(job.type));
    }

    // Sort by newest first
    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (options.offset) {
      results = results.slice(options.offset);
    }
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  async update(id: string, updates: Partial<Job>): Promise<void> {
    const job = this.jobs.get(id);
    if (job) {
      this.jobs.set(id, { ...job, ...updates, updatedAt: new Date() });
    }
  }

  // For testing
  clear(): void {
    this.jobs.clear();
  }

  getAll(): Job[] {
    return Array.from(this.jobs.values());
  }
}

// ============================================================================
// Job Runner
// ============================================================================

export class JobRunner {
  private handlers: Map<JobType, JobHandler> = new Map();
  private store: JobStore;
  private auditLogger: AuditLogger;
  private toolCallStore: Map<string, ToolCall[]> = new Map();
  private artifactStore: Map<string, Artifact[]> = new Map();
  private proposalStore: Map<string, Proposal[]> = new Map();

  constructor(store: JobStore, auditLogger: AuditLogger) {
    this.store = store;
    this.auditLogger = auditLogger;
  }

  registerHandler(handler: JobHandler): void {
    this.handlers.set(handler.type, handler);
  }

  async createJob(
    tenantId: string,
    user: User,
    type: JobType,
    config?: Record<string, unknown>
  ): Promise<Job> {
    // Check permission
    requirePermission('job.create')(user);

    const job: Job = {
      id: nanoid(),
      tenantId,
      type,
      status: 'pending',
      triggeredBy: user.id,
      config,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.store.save(job);
    await this.auditLogger.logJobCreated(tenantId, user.id, job.id, type);

    return job;
  }

  async runJob(jobId: string, user: User): Promise<Job> {
    const job = await this.store.findById(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    // Check permission
    if (!RBACService.canAccessTenant(user, job.tenantId)) {
      throw new Error('Access denied to this tenant');
    }

    const handler = this.handlers.get(job.type);
    if (!handler) {
      throw new Error(`No handler registered for job type: ${job.type}`);
    }

    // Update status to running
    await this.store.update(jobId, {
      status: 'running',
      startedAt: new Date(),
    });
    await this.auditLogger.logJobStarted(job.tenantId, jobId);

    // Initialize stores for this job
    this.toolCallStore.set(jobId, []);
    this.artifactStore.set(jobId, []);
    this.proposalStore.set(jobId, []);

    const startTime = Date.now();

    try {
      // Create context
      const ctx = this.createContext(job, user);

      // Execute handler
      await handler.execute(ctx);

      // Update status to completed
      const durationMs = Date.now() - startTime;
      await this.store.update(jobId, {
        status: 'completed',
        completedAt: new Date(),
        result: {
          toolCallCount: ctx.toolCalls.length,
          artifactCount: ctx.artifacts.length,
          proposalCount: ctx.proposals.length,
          durationMs,
        },
      });
      await this.auditLogger.logJobCompleted(job.tenantId, jobId, durationMs);

      return (await this.store.findById(jobId))!;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.store.update(jobId, {
        status: 'failed',
        error: errorMessage,
        completedAt: new Date(),
      });
      await this.auditLogger.logJobFailed(job.tenantId, jobId, errorMessage);

      throw error;
    }
  }

  async cancelJob(jobId: string, user: User): Promise<void> {
    const job = await this.store.findById(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    requirePermission('job.cancel')(user);

    if (job.status !== 'running' && job.status !== 'queued') {
      throw new Error(`Cannot cancel job in status: ${job.status}`);
    }

    await this.store.update(jobId, {
      status: 'cancelled',
      completedAt: new Date(),
    });
  }

  async getJob(jobId: string): Promise<Job | null> {
    return this.store.findById(jobId);
  }

  async getJobs(tenantId: string, options?: JobQueryOptions): Promise<Job[]> {
    return this.store.findByTenant(tenantId, options);
  }

  getToolCalls(jobId: string): ToolCall[] {
    return this.toolCallStore.get(jobId) || [];
  }

  getArtifacts(jobId: string): Artifact[] {
    return this.artifactStore.get(jobId) || [];
  }

  getProposals(jobId: string): Proposal[] {
    return this.proposalStore.get(jobId) || [];
  }

  private createContext(job: Job, user: User): JobContext {
    const toolCalls = this.toolCallStore.get(job.id) || [];
    const artifacts = this.artifactStore.get(job.id) || [];
    const proposals = this.proposalStore.get(job.id) || [];

    return {
      job,
      user,
      tenantId: job.tenantId,
      auditLogger: this.auditLogger,
      toolCalls,
      artifacts,
      proposals,

      addToolCall: (tc) => {
        const toolCall: ToolCall = {
          ...tc,
          id: nanoid(),
          jobId: job.id,
          tenantId: job.tenantId,
          createdAt: new Date(),
        };
        toolCalls.push(toolCall);
        return toolCall;
      },

      addArtifact: (a) => {
        const artifact: Artifact = {
          ...a,
          id: nanoid(),
          jobId: job.id,
          tenantId: job.tenantId,
          createdAt: new Date(),
        };
        artifacts.push(artifact);
        return artifact;
      },

      addProposal: (p) => {
        const now = new Date();
        const proposal: Proposal = {
          ...p,
          id: nanoid(),
          jobId: job.id,
          tenantId: job.tenantId,
          createdAt: now,
          updatedAt: now,
        };
        proposals.push(proposal);
        return proposal;
      },
    };
  }
}

// ============================================================================
// Default instances
// ============================================================================

const defaultJobStore = new InMemoryJobStore();
const defaultAuditStore = new InMemoryAuditStore();
const defaultAuditLogger = new AuditLogger(defaultAuditStore);
export const jobRunner = new JobRunner(defaultJobStore, defaultAuditLogger);

export { defaultJobStore as jobStore };

