import { nanoid } from 'nanoid';
import type { AuditLog, AuditAction } from '../types';

// ============================================================================
// Audit Log Service
// ============================================================================

export interface AuditLogEntry {
  tenantId: string;
  userId?: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogStore {
  save(log: AuditLog): Promise<void>;
  findByTenant(tenantId: string, options?: AuditQueryOptions): Promise<AuditLog[]>;
  findByResource(
    tenantId: string,
    resourceType: string,
    resourceId: string
  ): Promise<AuditLog[]>;
  findByUser(tenantId: string, userId: string): Promise<AuditLog[]>;
}

export interface AuditQueryOptions {
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
  actions?: AuditAction[];
  resourceTypes?: string[];
}

// ============================================================================
// In-Memory Store (for demo/testing)
// ============================================================================

export class InMemoryAuditStore implements AuditLogStore {
  private logs: AuditLog[] = [];

  async save(log: AuditLog): Promise<void> {
    this.logs.push(log);
  }

  async findByTenant(
    tenantId: string,
    options: AuditQueryOptions = {}
  ): Promise<AuditLog[]> {
    let results = this.logs.filter((log) => log.tenantId === tenantId);

    if (options.startDate) {
      results = results.filter((log) => log.createdAt >= options.startDate!);
    }
    if (options.endDate) {
      results = results.filter((log) => log.createdAt <= options.endDate!);
    }
    if (options.actions?.length) {
      results = results.filter((log) => options.actions!.includes(log.action));
    }
    if (options.resourceTypes?.length) {
      results = results.filter((log) =>
        options.resourceTypes!.includes(log.resourceType)
      );
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

  async findByResource(
    tenantId: string,
    resourceType: string,
    resourceId: string
  ): Promise<AuditLog[]> {
    return this.logs.filter(
      (log) =>
        log.tenantId === tenantId &&
        log.resourceType === resourceType &&
        log.resourceId === resourceId
    );
  }

  async findByUser(tenantId: string, userId: string): Promise<AuditLog[]> {
    return this.logs.filter(
      (log) => log.tenantId === tenantId && log.userId === userId
    );
  }

  // For testing
  clear(): void {
    this.logs = [];
  }

  getAll(): AuditLog[] {
    return [...this.logs];
  }
}

// ============================================================================
// Audit Logger
// ============================================================================

export class AuditLogger {
  constructor(private store: AuditLogStore) {}

  async log(entry: AuditLogEntry): Promise<AuditLog> {
    const log: AuditLog = {
      id: nanoid(),
      tenantId: entry.tenantId,
      userId: entry.userId,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      details: entry.details,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      createdAt: new Date(),
    };

    await this.store.save(log);
    return log;
  }

  // Convenience methods for common actions
  async logJobCreated(
    tenantId: string,
    userId: string,
    jobId: string,
    jobType: string
  ): Promise<AuditLog> {
    return this.log({
      tenantId,
      userId,
      action: 'job.created',
      resourceType: 'job',
      resourceId: jobId,
      details: { jobType },
    });
  }

  async logJobStarted(tenantId: string, jobId: string): Promise<AuditLog> {
    return this.log({
      tenantId,
      action: 'job.started',
      resourceType: 'job',
      resourceId: jobId,
    });
  }

  async logJobCompleted(
    tenantId: string,
    jobId: string,
    durationMs: number
  ): Promise<AuditLog> {
    return this.log({
      tenantId,
      action: 'job.completed',
      resourceType: 'job',
      resourceId: jobId,
      details: { durationMs },
    });
  }

  async logJobFailed(
    tenantId: string,
    jobId: string,
    error: string
  ): Promise<AuditLog> {
    return this.log({
      tenantId,
      action: 'job.failed',
      resourceType: 'job',
      resourceId: jobId,
      details: { error },
    });
  }

  async logToolCalled(
    tenantId: string,
    jobId: string,
    toolCallId: string,
    toolName: string,
    serverName: string
  ): Promise<AuditLog> {
    return this.log({
      tenantId,
      action: 'tool.called',
      resourceType: 'tool_call',
      resourceId: toolCallId,
      details: { jobId, toolName, serverName },
    });
  }

  async logToolCompleted(
    tenantId: string,
    toolCallId: string,
    durationMs: number
  ): Promise<AuditLog> {
    return this.log({
      tenantId,
      action: 'tool.completed',
      resourceType: 'tool_call',
      resourceId: toolCallId,
      details: { durationMs },
    });
  }

  async logProposalCreated(
    tenantId: string,
    userId: string,
    proposalId: string,
    proposalType: string
  ): Promise<AuditLog> {
    return this.log({
      tenantId,
      userId,
      action: 'proposal.created',
      resourceType: 'proposal',
      resourceId: proposalId,
      details: { proposalType },
    });
  }

  async logProposalApproved(
    tenantId: string,
    userId: string,
    proposalId: string
  ): Promise<AuditLog> {
    return this.log({
      tenantId,
      userId,
      action: 'proposal.approved',
      resourceType: 'proposal',
      resourceId: proposalId,
    });
  }

  async logProposalRejected(
    tenantId: string,
    userId: string,
    proposalId: string,
    reason?: string
  ): Promise<AuditLog> {
    return this.log({
      tenantId,
      userId,
      action: 'proposal.rejected',
      resourceType: 'proposal',
      resourceId: proposalId,
      details: reason ? { reason } : undefined,
    });
  }

  async logPermissionDenied(
    tenantId: string,
    userId: string,
    permission: string,
    resourceType: string,
    resourceId: string
  ): Promise<AuditLog> {
    return this.log({
      tenantId,
      userId,
      action: 'permission.denied',
      resourceType,
      resourceId,
      details: { permission },
    });
  }

  // Query methods
  async getByTenant(
    tenantId: string,
    options?: AuditQueryOptions
  ): Promise<AuditLog[]> {
    return this.store.findByTenant(tenantId, options);
  }

  async getByResource(
    tenantId: string,
    resourceType: string,
    resourceId: string
  ): Promise<AuditLog[]> {
    return this.store.findByResource(tenantId, resourceType, resourceId);
  }

  async getByUser(tenantId: string, userId: string): Promise<AuditLog[]> {
    return this.store.findByUser(tenantId, userId);
  }
}

// ============================================================================
// Default instance (uses in-memory store)
// ============================================================================

const defaultStore = new InMemoryAuditStore();
export const auditLogger = new AuditLogger(defaultStore);
export { defaultStore as auditStore };

