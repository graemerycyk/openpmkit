import type { User, UserRole } from '../types';

// ============================================================================
// Permission Definitions
// ============================================================================

export const PERMISSIONS = {
  // Job permissions
  'job.create': 'Create new jobs',
  'job.view': 'View job details and results',
  'job.cancel': 'Cancel running jobs',
  'job.view_all': 'View all jobs in tenant',

  // Proposal permissions
  'proposal.view': 'View proposals',
  'proposal.approve': 'Approve proposals for execution',
  'proposal.reject': 'Reject proposals',

  // Artifact permissions
  'artifact.view': 'View artifacts',
  'artifact.download': 'Download artifacts',

  // Source permissions
  'source.view': 'View source data',

  // Audit permissions
  'audit.view': 'View audit logs',
  'audit.export': 'Export audit logs',

  // Admin permissions
  'admin.users': 'Manage users',
  'admin.settings': 'Manage tenant settings',
  'admin.integrations': 'Manage integrations',
} as const;

export type Permission = keyof typeof PERMISSIONS;

// ============================================================================
// Role → Permission Mapping
// ============================================================================

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: Object.keys(PERMISSIONS) as Permission[],
  pm: [
    'job.create',
    'job.view',
    'job.cancel',
    'job.view_all',
    'proposal.view',
    'proposal.approve',
    'proposal.reject',
    'artifact.view',
    'artifact.download',
    'source.view',
    'audit.view',
  ],
  viewer: [
    'job.view',
    'proposal.view',
    'artifact.view',
    'artifact.download',
    'source.view',
  ],
  guest: ['job.view', 'artifact.view', 'source.view'],
};

// ============================================================================
// RBAC Service
// ============================================================================

export interface RBACContext {
  user: User;
  tenantId: string;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  checkedAt: Date;
}

export class RBACService {
  /**
   * Check if a user has a specific permission
   */
  static hasPermission(user: User, permission: Permission): boolean {
    // Check explicit user permissions first
    if (user.permissions.includes(permission)) {
      return true;
    }

    // Fall back to role-based permissions
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
  }

  /**
   * Check permission with detailed result (for audit logging)
   */
  static checkPermission(
    user: User,
    permission: Permission,
    resourceType?: string,
    resourceId?: string
  ): PermissionCheckResult {
    const allowed = this.hasPermission(user, permission);

    return {
      allowed,
      reason: allowed
        ? `User ${user.id} has permission ${permission} via role ${user.role}`
        : `User ${user.id} lacks permission ${permission}`,
      checkedAt: new Date(),
    };
  }

  /**
   * Get all permissions for a user (combining role + explicit)
   */
  static getEffectivePermissions(user: User): Permission[] {
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    const explicitPermissions = user.permissions.filter(
      (p): p is Permission => p in PERMISSIONS
    );

    return [...new Set([...rolePermissions, ...explicitPermissions])];
  }

  /**
   * Check if user can access a resource in a specific tenant
   */
  static canAccessTenant(user: User, tenantId: string): boolean {
    return user.tenantId === tenantId;
  }

  /**
   * Simulate permission check (for demo mode)
   */
  static simulatePermissionCheck(
    role: UserRole,
    permission: Permission
  ): PermissionCheckResult {
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    const allowed = rolePermissions.includes(permission);

    return {
      allowed,
      reason: allowed
        ? `Role ${role} has permission ${permission}`
        : `Role ${role} lacks permission ${permission}`,
      checkedAt: new Date(),
    };
  }
}

// ============================================================================
// Permission Guard (for use in API routes)
// ============================================================================

export function requirePermission(permission: Permission) {
  return (user: User): void => {
    if (!RBACService.hasPermission(user, permission)) {
      throw new PermissionDeniedError(user.id, permission);
    }
  };
}

export class PermissionDeniedError extends Error {
  constructor(
    public userId: string,
    public permission: Permission
  ) {
    super(`Permission denied: ${permission}`);
    this.name = 'PermissionDeniedError';
  }
}

