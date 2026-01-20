import { z } from 'zod';
import type { ConnectorKey } from '../connectors';

// ============================================================================
// Plan Definitions
// ============================================================================

export const PlanKeySchema = z.enum(['INDIVIDUAL', 'TEAMS', 'ENTERPRISE', 'INTERNAL']);
export type PlanKey = z.infer<typeof PlanKeySchema>;

export const SubscriptionStatusSchema = z.enum([
  'active',
  'past_due',
  'canceled',
  'trialing',
  'paused',
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

export const SeatAssignmentStatusSchema = z.enum(['active', 'inactive', 'pending']);
export type SeatAssignmentStatus = z.infer<typeof SeatAssignmentStatusSchema>;

// ============================================================================
// Connector Definitions (MVP)
// ============================================================================

// MVP connectors - available to all plans
export const MVP_CONNECTORS: ConnectorKey[] = [
  'jira',
  'confluence',
  'slack',
  'gong',
  'zendesk',
];

// ============================================================================
// Plan Configuration
// ============================================================================

export interface PlanConfig {
  key: PlanKey;
  name: string;
  description: string;
  pricePerSeatPerMonth: number | null; // null for custom/Enterprise
  pricePerSeatPerYear: number | null; // null for custom/Enterprise
  minSeats: number;
  features: PlanFeatures;
}

export interface PlanFeatures {
  // SSO
  ssoOidc: boolean;
  ssoSaml: boolean;
  scimProvisioning: boolean;

  // Connectors - all MVP connectors available to all plans
  allowedConnectors: ConnectorKey[];
  customConnectorsEnabled: boolean; // Enterprise only

  // Jobs - Scheduled
  scheduledDailyBrief: boolean;
  scheduledWeeklyThemes: boolean;
  scheduledCompetitorResearch: boolean;

  // Jobs - On-demand limits per month (Individual) or per seat per month (Teams)
  maxOnDemandDailyBriefPerMonth: number;
  maxOnDemandMeetingPrepPerMonth: number;
  maxOnDemandPrdPackPerMonth: number;
  maxOnDemandRoadmapMemoPerMonth: number;
  maxOnDemandSprintReviewPerMonth: number;
  maxOnDemandReleaseNotesPerMonth: number;
  maxOnDemandPrototypeGenPerMonth: number;
  maxOnDemandVocClusteringPerMonth: number;
  maxOnDemandCompetitorResearchPerMonth: number;
  maxOnDemandDeckContentPerMonth: number;

  // Concurrency
  maxConcurrentRunsPer10Seats: number;

  // Retention
  defaultRetentionDays: number;
  minRetentionDays: number;
  maxRetentionDays: number;

  // Audit
  auditExportApi: boolean;
  auditRetentionDays: number;

  // Advanced
  byoLlmEndpoint: boolean;
  dataResidencyOptions: boolean;
  kmsCustomerManagedKeys: boolean;
  privateNetworking: boolean;
  dedicatedSupport: boolean;
  slaGuarantees: boolean;
}

// ============================================================================
// Plan Definitions
// ============================================================================

export const INDIVIDUAL_PLAN: PlanConfig = {
  key: 'INDIVIDUAL',
  name: 'Individual',
  description: 'For individual PMs who want to automate their daily workflows',
  pricePerSeatPerMonth: 29, // $29/month launch price (regular $49)
  pricePerSeatPerYear: 228, // $228/year ($19/month equivalent) launch price
  minSeats: 1,
  features: {
    // SSO: Not available for Individual
    ssoOidc: false,
    ssoSaml: false,
    scimProvisioning: false,

    // All MVP connectors included
    allowedConnectors: MVP_CONNECTORS,
    customConnectorsEnabled: false,

    // Scheduled jobs
    scheduledDailyBrief: true,
    scheduledWeeklyThemes: true,
    scheduledCompetitorResearch: true,

    // On-demand limits per month (same as Teams per-seat limits)
    maxOnDemandDailyBriefPerMonth: 31,
    maxOnDemandMeetingPrepPerMonth: 40,
    maxOnDemandPrdPackPerMonth: 12,
    maxOnDemandRoadmapMemoPerMonth: 12,
    maxOnDemandSprintReviewPerMonth: 8,
    maxOnDemandReleaseNotesPerMonth: 16,
    maxOnDemandPrototypeGenPerMonth: 8,
    maxOnDemandVocClusteringPerMonth: 4,
    maxOnDemandCompetitorResearchPerMonth: 4,
    maxOnDemandDeckContentPerMonth: 12,

    // Concurrency: 2 concurrent runs (single user)
    maxConcurrentRunsPer10Seats: 2,

    // Retention: 90 days
    defaultRetentionDays: 90,
    minRetentionDays: 30,
    maxRetentionDays: 90,

    // Audit: view only, no export API
    auditExportApi: false,
    auditRetentionDays: 90,

    // Advanced features: none
    byoLlmEndpoint: false,
    dataResidencyOptions: false,
    kmsCustomerManagedKeys: false,
    privateNetworking: false,
    dedicatedSupport: false,
    slaGuarantees: false,
  },
};

export const TEAMS_PLAN: PlanConfig = {
  key: 'TEAMS',
  name: 'Teams',
  description: 'For product teams with SSO, all connectors, and governance',
  pricePerSeatPerMonth: 49, // $49/seat/month
  pricePerSeatPerYear: 588, // $588/seat/year (billed annually)
  minSeats: 5,
  features: {
    // SSO: OIDC only (Google Workspace + Microsoft Entra ID)
    ssoOidc: true,
    ssoSaml: false,
    scimProvisioning: false,

    // All MVP connectors included
    allowedConnectors: MVP_CONNECTORS,
    customConnectorsEnabled: false,

    // Scheduled jobs
    scheduledDailyBrief: true,
    scheduledWeeklyThemes: true,
    scheduledCompetitorResearch: true,

    // On-demand limits per seat per month (generous fair use)
    maxOnDemandDailyBriefPerMonth: 31,
    maxOnDemandMeetingPrepPerMonth: 40,
    maxOnDemandPrdPackPerMonth: 12,
    maxOnDemandRoadmapMemoPerMonth: 12,
    maxOnDemandSprintReviewPerMonth: 8,
    maxOnDemandReleaseNotesPerMonth: 16,
    maxOnDemandPrototypeGenPerMonth: 8,
    maxOnDemandVocClusteringPerMonth: 4,
    maxOnDemandCompetitorResearchPerMonth: 4,
    maxOnDemandDeckContentPerMonth: 12,

    // Concurrency: 2 concurrent runs per 10 seats
    maxConcurrentRunsPer10Seats: 2,

    // Retention: default 90 days, can request 30
    defaultRetentionDays: 90,
    minRetentionDays: 30,
    maxRetentionDays: 90,

    // Audit: view only, no export API
    auditExportApi: false,
    auditRetentionDays: 90,

    // Advanced features: none
    byoLlmEndpoint: false,
    dataResidencyOptions: false,
    kmsCustomerManagedKeys: false,
    privateNetworking: false,
    dedicatedSupport: false,
    slaGuarantees: false,
  },
};

export const ENTERPRISE_PLAN: PlanConfig = {
  key: 'ENTERPRISE',
  name: 'Enterprise',
  description: 'Custom pricing with SAML/SCIM, custom connectors, and enterprise controls',
  pricePerSeatPerMonth: null, // Custom pricing
  pricePerSeatPerYear: null, // Custom pricing
  minSeats: 10,
  features: {
    // SSO: OIDC + SAML + SCIM
    ssoOidc: true,
    ssoSaml: true,
    scimProvisioning: true,

    // All MVP connectors + custom connectors
    allowedConnectors: MVP_CONNECTORS,
    customConnectorsEnabled: true,

    // Scheduled jobs
    scheduledDailyBrief: true,
    scheduledWeeklyThemes: true,
    scheduledCompetitorResearch: true,

    // 5× higher on-demand limits (can be overridden per customer via entitlements)
    maxOnDemandDailyBriefPerMonth: 155,
    maxOnDemandMeetingPrepPerMonth: 200,
    maxOnDemandPrdPackPerMonth: 60,
    maxOnDemandRoadmapMemoPerMonth: 60,
    maxOnDemandSprintReviewPerMonth: 40,
    maxOnDemandReleaseNotesPerMonth: 80,
    maxOnDemandPrototypeGenPerMonth: 40,
    maxOnDemandVocClusteringPerMonth: 20,
    maxOnDemandCompetitorResearchPerMonth: 20,
    maxOnDemandDeckContentPerMonth: 60,

    // Higher concurrency
    maxConcurrentRunsPer10Seats: 5,

    // Retention: configurable up to unlimited
    defaultRetentionDays: 365,
    minRetentionDays: 30,
    maxRetentionDays: -1, // -1 = unlimited

    // Audit: full export API + longer retention
    auditExportApi: true,
    auditRetentionDays: 730, // 2 years

    // Advanced features: all enabled
    byoLlmEndpoint: true,
    dataResidencyOptions: true,
    kmsCustomerManagedKeys: true,
    privateNetworking: true,
    dedicatedSupport: true,
    slaGuarantees: true,
  },
};

// Internal plan for admin users (ADMIN_EMAILS)
// Hidden from pricing page, auto-assigned to admin users
export const INTERNAL_PLAN: PlanConfig = {
  key: 'INTERNAL',
  name: 'Internal',
  description: 'For pmkit team members and demos',
  pricePerSeatPerMonth: 0, // Free for internal users
  pricePerSeatPerYear: 0,
  minSeats: 1,
  features: {
    // All SSO options
    ssoOidc: true,
    ssoSaml: true,
    scimProvisioning: true,

    // All connectors including future ones
    allowedConnectors: MVP_CONNECTORS,
    customConnectorsEnabled: true,

    // All scheduled jobs
    scheduledDailyBrief: true,
    scheduledWeeklyThemes: true,
    scheduledCompetitorResearch: true,

    // Unlimited on-demand (-1 = unlimited)
    maxOnDemandDailyBriefPerMonth: -1,
    maxOnDemandMeetingPrepPerMonth: -1,
    maxOnDemandPrdPackPerMonth: -1,
    maxOnDemandRoadmapMemoPerMonth: -1,
    maxOnDemandSprintReviewPerMonth: -1,
    maxOnDemandReleaseNotesPerMonth: -1,
    maxOnDemandPrototypeGenPerMonth: -1,
    maxOnDemandVocClusteringPerMonth: -1,
    maxOnDemandCompetitorResearchPerMonth: -1,
    maxOnDemandDeckContentPerMonth: -1,

    // Unlimited concurrency
    maxConcurrentRunsPer10Seats: 100,

    // Max retention
    defaultRetentionDays: 365,
    minRetentionDays: 30,
    maxRetentionDays: -1, // Unlimited

    // Full audit access
    auditExportApi: true,
    auditRetentionDays: 730, // 2 years

    // All advanced features
    byoLlmEndpoint: true,
    dataResidencyOptions: true,
    kmsCustomerManagedKeys: true,
    privateNetworking: true,
    dedicatedSupport: true,
    slaGuarantees: true,
  },
};

export const PLANS: Record<PlanKey, PlanConfig> = {
  INDIVIDUAL: INDIVIDUAL_PLAN,
  TEAMS: TEAMS_PLAN,
  ENTERPRISE: ENTERPRISE_PLAN,
  INTERNAL: INTERNAL_PLAN,
};

export function getPlan(key: PlanKey): PlanConfig {
  return PLANS[key];
}

// ============================================================================
// Subscription Schema
// ============================================================================

export const SubscriptionSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  planKey: PlanKeySchema,
  status: SubscriptionStatusSchema,
  seatsPurchased: z.number().int().positive(),
  billingProvider: z.string(),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  currentPeriodStart: z.date(),
  currentPeriodEnd: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Subscription = z.infer<typeof SubscriptionSchema>;

export const SeatAssignmentSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  userId: z.string(),
  status: SeatAssignmentStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type SeatAssignment = z.infer<typeof SeatAssignmentSchema>;

// ============================================================================
// Entitlement System
// ============================================================================

export const EntitlementKeySchema = z.enum([
  // Connector entitlements
  'connectors.allowed',
  'connectors.customEnabled',

  // Job run limits (on-demand per month for Individual, per seat per month for Teams)
  'jobs.maxOnDemandDailyBriefPerMonth',
  'jobs.maxOnDemandMeetingPrepPerMonth',
  'jobs.maxOnDemandPrdPackPerMonth',
  'jobs.maxOnDemandRoadmapMemoPerMonth',
  'jobs.maxOnDemandSprintReviewPerMonth',
  'jobs.maxOnDemandReleaseNotesPerMonth',
  'jobs.maxOnDemandPrototypeGenPerMonth',
  'jobs.maxOnDemandVocClusteringPerMonth',
  'jobs.maxOnDemandCompetitorResearchPerMonth',
  'jobs.maxOnDemandDeckContentPerMonth',
  'jobs.maxConcurrentRunsPer10Seats',
  
  // Scheduled job toggles
  'jobs.scheduledDailyBrief',
  'jobs.scheduledWeeklyThemes',
  'jobs.scheduledCompetitorResearch',
  
  // Retention
  'retention.artifactDays',
  'retention.auditDays',
  
  // SSO
  'sso.oidcEnabled',
  'sso.samlEnabled',
  'sso.scimEnabled',
  
  // Advanced
  'advanced.byoLlmEndpoint',
  'advanced.dataResidency',
  'advanced.kmsCustomerKeys',
  'advanced.privateNetworking',
  'advanced.auditExportApi',
]);
export type EntitlementKey = z.infer<typeof EntitlementKeySchema>;

export const EntitlementSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  key: EntitlementKeySchema,
  valueJson: z.unknown(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Entitlement = z.infer<typeof EntitlementSchema>;

// ============================================================================
// Entitlement Service
// ============================================================================

export interface EntitlementStore {
  findByTenant(tenantId: string): Promise<Entitlement[]>;
  findByKey(tenantId: string, key: EntitlementKey): Promise<Entitlement | null>;
  upsert(tenantId: string, key: EntitlementKey, value: unknown): Promise<Entitlement>;
}

export class EntitlementService {
  constructor(
    private store: EntitlementStore,
    private getSubscription: (tenantId: string) => Promise<Subscription | null>
  ) {}

  /**
   * Get effective entitlement value, falling back to plan defaults
   */
  async getEntitlement<T>(tenantId: string, key: EntitlementKey): Promise<T | null> {
    // Check for explicit override
    const override = await this.store.findByKey(tenantId, key);
    if (override) {
      return override.valueJson as T;
    }

    // Fall back to plan defaults
    const subscription = await this.getSubscription(tenantId);
    if (!subscription) {
      return null;
    }

    const plan = getPlan(subscription.planKey);
    return this.getPlanDefault(plan, key) as T;
  }

  /**
   * Check if a connector is allowed for the tenant
   */
  async isConnectorAllowed(tenantId: string, connectorKey: ConnectorKey): Promise<boolean> {
    const allowed = await this.getEntitlement<ConnectorKey[]>(tenantId, 'connectors.allowed');
    return allowed?.includes(connectorKey) ?? false;
  }

  /**
   * Check if custom connectors are enabled (Enterprise only)
   */
  async isCustomConnectorsEnabled(tenantId: string): Promise<boolean> {
    const enabled = await this.getEntitlement<boolean>(tenantId, 'connectors.customEnabled');
    return enabled === true;
  }

  /**
   * Check if a feature is enabled
   */
  async isFeatureEnabled(tenantId: string, key: EntitlementKey): Promise<boolean> {
    const value = await this.getEntitlement<boolean>(tenantId, key);
    return value === true;
  }

  /**
   * Get numeric limit
   */
  async getLimit(tenantId: string, key: EntitlementKey): Promise<number> {
    const value = await this.getEntitlement<number>(tenantId, key);
    return value ?? 0;
  }

  /**
   * Provision default entitlements for a new subscription
   */
  async provisionDefaults(tenantId: string, planKey: PlanKey): Promise<void> {
    const plan = getPlan(planKey);
    const features = plan.features;

    await this.store.upsert(tenantId, 'connectors.allowed', features.allowedConnectors);
    await this.store.upsert(tenantId, 'connectors.customEnabled', features.customConnectorsEnabled);
    await this.store.upsert(tenantId, 'jobs.maxOnDemandDailyBriefPerMonth', features.maxOnDemandDailyBriefPerMonth);
    await this.store.upsert(tenantId, 'jobs.maxOnDemandMeetingPrepPerMonth', features.maxOnDemandMeetingPrepPerMonth);
    await this.store.upsert(tenantId, 'jobs.maxOnDemandPrdPackPerMonth', features.maxOnDemandPrdPackPerMonth);
    await this.store.upsert(tenantId, 'jobs.maxOnDemandRoadmapMemoPerMonth', features.maxOnDemandRoadmapMemoPerMonth);
    await this.store.upsert(tenantId, 'jobs.maxOnDemandSprintReviewPerMonth', features.maxOnDemandSprintReviewPerMonth);
    await this.store.upsert(tenantId, 'jobs.maxOnDemandReleaseNotesPerMonth', features.maxOnDemandReleaseNotesPerMonth);
    await this.store.upsert(tenantId, 'jobs.maxOnDemandPrototypeGenPerMonth', features.maxOnDemandPrototypeGenPerMonth);
    await this.store.upsert(tenantId, 'jobs.maxOnDemandVocClusteringPerMonth', features.maxOnDemandVocClusteringPerMonth);
    await this.store.upsert(tenantId, 'jobs.maxOnDemandCompetitorResearchPerMonth', features.maxOnDemandCompetitorResearchPerMonth);
    await this.store.upsert(tenantId, 'jobs.maxOnDemandDeckContentPerMonth', features.maxOnDemandDeckContentPerMonth);
    await this.store.upsert(tenantId, 'jobs.maxConcurrentRunsPer10Seats', features.maxConcurrentRunsPer10Seats);
    await this.store.upsert(tenantId, 'jobs.scheduledDailyBrief', features.scheduledDailyBrief);
    await this.store.upsert(tenantId, 'jobs.scheduledWeeklyThemes', features.scheduledWeeklyThemes);
    await this.store.upsert(tenantId, 'jobs.scheduledCompetitorResearch', features.scheduledCompetitorResearch);
    await this.store.upsert(tenantId, 'retention.artifactDays', features.defaultRetentionDays);
    await this.store.upsert(tenantId, 'retention.auditDays', features.auditRetentionDays);
    await this.store.upsert(tenantId, 'sso.oidcEnabled', features.ssoOidc);
    await this.store.upsert(tenantId, 'sso.samlEnabled', features.ssoSaml);
    await this.store.upsert(tenantId, 'sso.scimEnabled', features.scimProvisioning);
    await this.store.upsert(tenantId, 'advanced.byoLlmEndpoint', features.byoLlmEndpoint);
    await this.store.upsert(tenantId, 'advanced.dataResidency', features.dataResidencyOptions);
    await this.store.upsert(tenantId, 'advanced.kmsCustomerKeys', features.kmsCustomerManagedKeys);
    await this.store.upsert(tenantId, 'advanced.privateNetworking', features.privateNetworking);
    await this.store.upsert(tenantId, 'advanced.auditExportApi', features.auditExportApi);
  }

  private getPlanDefault(plan: PlanConfig, key: EntitlementKey): unknown {
    const features = plan.features;

    switch (key) {
      case 'connectors.allowed':
        return features.allowedConnectors;
      case 'connectors.customEnabled':
        return features.customConnectorsEnabled;
      case 'jobs.maxOnDemandDailyBriefPerMonth':
        return features.maxOnDemandDailyBriefPerMonth;
      case 'jobs.maxOnDemandMeetingPrepPerMonth':
        return features.maxOnDemandMeetingPrepPerMonth;
      case 'jobs.maxOnDemandPrdPackPerMonth':
        return features.maxOnDemandPrdPackPerMonth;
      case 'jobs.maxOnDemandRoadmapMemoPerMonth':
        return features.maxOnDemandRoadmapMemoPerMonth;
      case 'jobs.maxOnDemandSprintReviewPerMonth':
        return features.maxOnDemandSprintReviewPerMonth;
      case 'jobs.maxOnDemandReleaseNotesPerMonth':
        return features.maxOnDemandReleaseNotesPerMonth;
      case 'jobs.maxOnDemandPrototypeGenPerMonth':
        return features.maxOnDemandPrototypeGenPerMonth;
      case 'jobs.maxOnDemandVocClusteringPerMonth':
        return features.maxOnDemandVocClusteringPerMonth;
      case 'jobs.maxOnDemandCompetitorResearchPerMonth':
        return features.maxOnDemandCompetitorResearchPerMonth;
      case 'jobs.maxOnDemandDeckContentPerMonth':
        return features.maxOnDemandDeckContentPerMonth;
      case 'jobs.maxConcurrentRunsPer10Seats':
        return features.maxConcurrentRunsPer10Seats;
      case 'jobs.scheduledDailyBrief':
        return features.scheduledDailyBrief;
      case 'jobs.scheduledWeeklyThemes':
        return features.scheduledWeeklyThemes;
      case 'jobs.scheduledCompetitorResearch':
        return features.scheduledCompetitorResearch;
      case 'retention.artifactDays':
        return features.defaultRetentionDays;
      case 'retention.auditDays':
        return features.auditRetentionDays;
      case 'sso.oidcEnabled':
        return features.ssoOidc;
      case 'sso.samlEnabled':
        return features.ssoSaml;
      case 'sso.scimEnabled':
        return features.scimProvisioning;
      case 'advanced.byoLlmEndpoint':
        return features.byoLlmEndpoint;
      case 'advanced.dataResidency':
        return features.dataResidencyOptions;
      case 'advanced.kmsCustomerKeys':
        return features.kmsCustomerManagedKeys;
      case 'advanced.privateNetworking':
        return features.privateNetworking;
      case 'advanced.auditExportApi':
        return features.auditExportApi;
      default:
        return null;
    }
  }
}

// ============================================================================
// Seat Management
// ============================================================================

export interface SeatStore {
  findByTenant(tenantId: string): Promise<SeatAssignment[]>;
  findActiveByTenant(tenantId: string): Promise<SeatAssignment[]>;
  countActiveByTenant(tenantId: string): Promise<number>;
  assign(tenantId: string, userId: string): Promise<SeatAssignment>;
  unassign(tenantId: string, userId: string): Promise<void>;
}

export class SeatService {
  constructor(
    private store: SeatStore,
    private getSubscription: (tenantId: string) => Promise<Subscription | null>
  ) {}

  /**
   * Check if there are available seats
   */
  async hasAvailableSeats(tenantId: string): Promise<boolean> {
    const subscription = await this.getSubscription(tenantId);
    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    const activeCount = await this.store.countActiveByTenant(tenantId);
    return activeCount < subscription.seatsPurchased;
  }

  /**
   * Get seat usage info
   */
  async getSeatUsage(tenantId: string): Promise<{
    purchased: number;
    active: number;
    available: number;
  }> {
    const subscription = await this.getSubscription(tenantId);
    if (!subscription) {
      return { purchased: 0, active: 0, available: 0 };
    }

    const activeCount = await this.store.countActiveByTenant(tenantId);
    return {
      purchased: subscription.seatsPurchased,
      active: activeCount,
      available: Math.max(0, subscription.seatsPurchased - activeCount),
    };
  }

  /**
   * Assign a seat to a user (fails if no seats available)
   */
  async assignSeat(tenantId: string, userId: string): Promise<SeatAssignment> {
    const hasSeats = await this.hasAvailableSeats(tenantId);
    if (!hasSeats) {
      throw new NoSeatsAvailableError(tenantId);
    }

    return this.store.assign(tenantId, userId);
  }

  /**
   * Unassign a seat from a user
   */
  async unassignSeat(tenantId: string, userId: string): Promise<void> {
    return this.store.unassign(tenantId, userId);
  }

  /**
   * Check if a user has an active seat
   */
  async hasActiveSeat(tenantId: string, userId: string): Promise<boolean> {
    const assignments = await this.store.findActiveByTenant(tenantId);
    return assignments.some((a) => a.userId === userId);
  }
}

export class NoSeatsAvailableError extends Error {
  constructor(public tenantId: string) {
    super(`No seats available for tenant ${tenantId}`);
    this.name = 'NoSeatsAvailableError';
  }
}

// ============================================================================
// Billing Calculation Helpers
// ============================================================================

export function calculateAnnualPrice(planKey: PlanKey, seats: number): number | null {
  const plan = getPlan(planKey);
  if (plan.pricePerSeatPerYear === null) {
    return null; // Custom pricing
  }

  const effectiveSeats = Math.max(seats, plan.minSeats);
  return plan.pricePerSeatPerYear * effectiveSeats;
}

export function calculateMonthlyEquivalent(planKey: PlanKey, seats: number): number | null {
  const plan = getPlan(planKey);
  if (plan.pricePerSeatPerMonth === null) {
    return null; // Custom pricing
  }

  const effectiveSeats = Math.max(seats, plan.minSeats);
  return plan.pricePerSeatPerMonth * effectiveSeats;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
