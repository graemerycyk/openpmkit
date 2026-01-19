import { z } from 'zod';

// ============================================================================
// Core Entity Types
// ============================================================================

export const TenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  settings: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Tenant = z.infer<typeof TenantSchema>;

export const UserRoleSchema = z.enum(['admin', 'pm', 'eng', 'cs', 'sales', 'exec', 'viewer', 'guest']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatarUrl: z.string().optional(),
  role: UserRoleSchema,
  permissions: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type User = z.infer<typeof UserSchema>;

// UserRole is now exported from UserRoleSchema above

// ============================================================================
// Job Types
// ============================================================================

export const JobTypeSchema = z.enum([
  'daily_brief',
  'meeting_prep',
  'voc_clustering',
  'competitor_research',
  'roadmap_alignment',
  'prd_draft',
  'sprint_review',
  'prototype_generation',
  'release_notes',
  'deck_content',
]);
export type JobType = z.infer<typeof JobTypeSchema>;

export const JobStatusSchema = z.enum([
  'pending',
  'queued',
  'running',
  'completed',
  'failed',
  'cancelled',
]);
export type JobStatus = z.infer<typeof JobStatusSchema>;

export const JobSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  type: JobTypeSchema,
  status: JobStatusSchema,
  triggeredBy: z.string(),
  config: z.record(z.unknown()).optional(),
  result: z.record(z.unknown()).optional(),
  error: z.string().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Job = z.infer<typeof JobSchema>;

// ============================================================================
// Agent Config Types
// ============================================================================

export const AgentTypeSchema = z.enum([
  'daily_brief',
  'meeting_prep',
  'sprint_review',
  'voc_clustering',
  'competitor_research',
  'roadmap_alignment',
  'deck_content',
  'release_notes',
  'prd_draft',
  'prototype_generation',
]);
export type AgentType = z.infer<typeof AgentTypeSchema>;

// Trigger types for autonomous agents
export const AgentTriggerTypeSchema = z.enum([
  'schedule',    // Runs on a schedule (daily, weekly, monthly)
  'calendar',    // Triggered by calendar events
  'jira',        // Triggered by Jira webhooks (release, epic status)
  'artifact',    // Triggered when another agent produces an artifact
]);
export type AgentTriggerType = z.infer<typeof AgentTriggerTypeSchema>;

export const AgentStatusSchema = z.enum(['active', 'paused']);
export type AgentStatus = z.infer<typeof AgentStatusSchema>;

// Daily Brief specific config
export const DailyBriefConfigSchema = z.object({
  dataTimeframeHours: z.number().min(12).max(48).default(24),
  deliveryTimeLocal: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Must be HH:MM format'),
  timezone: z.string(), // IANA timezone, e.g., 'America/New_York'
  // Slack configuration
  slackChannels: z.array(z.string()).default([]), // Array of channel IDs (user-selected)
  includeSlack: z.boolean().default(false), // Enable Slack as a data source
  includeSlackMentions: z.boolean().default(true), // Include messages where user is @mentioned
  // Google connectors (optional - include if connected)
  includeGmail: z.boolean().default(false),
  includeGoogleDrive: z.boolean().default(false),
  includeGoogleCalendar: z.boolean().default(false),
});
export type DailyBriefConfig = z.infer<typeof DailyBriefConfigSchema>;

// Meeting Prep config (calendar-triggered)
export const MeetingPrepConfigSchema = z.object({
  leadTimeMinutes: z.number().min(30).max(1440).default(240), // 4 hours default
  timezone: z.string(),
  // Data sources
  includeJira: z.boolean().default(true),
  includeSlack: z.boolean().default(false),
  includeGong: z.boolean().default(false),
  includeConfluence: z.boolean().default(false),
});
export type MeetingPrepConfig = z.infer<typeof MeetingPrepConfigSchema>;

// Sprint Review config (calendar-triggered)
export const SprintReviewConfigSchema = z.object({
  calendarKeywords: z.array(z.string()).default(['Sprint Demo', 'Sprint Review', 'Department Sprint Review']),
  leadTimeMinutes: z.number().min(60).max(1440).default(240), // 4 hours default
  timezone: z.string(),
  // Jira configuration
  jiraProjectKeys: z.array(z.string()).default([]), // Project keys to pull sprint data from
  includeVelocity: z.boolean().default(true),
  includeCarryover: z.boolean().default(true), // Include items carried from previous sprint
  // Additional data sources
  includeSlackHighlights: z.boolean().default(false),
  includeConfluence: z.boolean().default(false),
});
export type SprintReviewConfig = z.infer<typeof SprintReviewConfigSchema>;

// VoC Clustering config (schedule-triggered)
export const VocClusteringConfigSchema = z.object({
  scheduleDay: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).default('monday'),
  scheduleTimeLocal: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Must be HH:MM format'),
  timezone: z.string(),
  lookbackDays: z.number().min(7).max(90).default(7),
  // Data sources
  includeZendesk: z.boolean().default(true),
  includeGong: z.boolean().default(true),
  includeSlack: z.boolean().default(false),
  includeCommunity: z.boolean().default(true),
});
export type VocClusteringConfig = z.infer<typeof VocClusteringConfigSchema>;

// Competitor Research config (schedule-triggered)
export const CompetitorResearchConfigSchema = z.object({
  scheduleDay: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).default('friday'),
  scheduleTimeLocal: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Must be HH:MM format'),
  timezone: z.string(),
  competitors: z.array(z.string()).default([]), // Company names to track
  trackPricing: z.boolean().default(true),
  trackFeatures: z.boolean().default(true),
  trackNews: z.boolean().default(true),
});
export type CompetitorResearchConfig = z.infer<typeof CompetitorResearchConfigSchema>;

// Roadmap Alignment config (schedule-triggered)
export const RoadmapAlignmentConfigSchema = z.object({
  scheduleFrequency: z.enum(['weekly', 'biweekly', 'monthly']).default('monthly'),
  scheduleDay: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']).default('monday'),
  scheduleTimeLocal: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Must be HH:MM format'),
  timezone: z.string(),
  // Data sources
  includeJira: z.boolean().default(true),
  includeConfluence: z.boolean().default(true),
  includeSlackFeedback: z.boolean().default(true),
});
export type RoadmapAlignmentConfig = z.infer<typeof RoadmapAlignmentConfigSchema>;

// Deck Content config (calendar-triggered)
export const DeckContentConfigSchema = z.object({
  calendarKeywords: z.array(z.string()).default(['QBR', 'Board Meeting', 'All Hands', 'Presentation']),
  leadTimeMinutes: z.number().min(60).max(2880).default(480), // 8 hours default
  timezone: z.string(),
  // Data sources
  includeMetrics: z.boolean().default(true),
  includeJira: z.boolean().default(true),
  includeCompetitorInsights: z.boolean().default(false),
});
export type DeckContentConfig = z.infer<typeof DeckContentConfigSchema>;

// Release Notes config (jira-triggered)
export const ReleaseNotesConfigSchema = z.object({
  jiraProjectKeys: z.array(z.string()).default([]),
  autoTriggerOnRelease: z.boolean().default(true), // Trigger when Jira version is released
  includeBreakingChanges: z.boolean().default(true),
  includeDeprecations: z.boolean().default(true),
  audienceTypes: z.array(z.enum(['technical', 'end-user', 'internal'])).default(['end-user']),
  timezone: z.string(),
});
export type ReleaseNotesConfig = z.infer<typeof ReleaseNotesConfigSchema>;

// PRD Draft config (jira-triggered)
export const PrdDraftConfigSchema = z.object({
  jiraProjectKeys: z.array(z.string()).default([]),
  triggerOnEpicStatus: z.array(z.string()).default(['Ready for PRD', 'Needs PRD']), // Epic status values
  includeMarketResearch: z.boolean().default(true),
  includeCompetitorAnalysis: z.boolean().default(false),
  includeVocInsights: z.boolean().default(true),
  timezone: z.string(),
});
export type PrdDraftConfig = z.infer<typeof PrdDraftConfigSchema>;

// Prototype Generation config (artifact-triggered)
export const PrototypeGenerationConfigSchema = z.object({
  triggerOnArtifactTypes: z.array(z.enum(['prd', 'brief'])).default(['prd']),
  autoGenerate: z.boolean().default(false), // When true, auto-generate after PRD
  includeInteractions: z.boolean().default(true),
  includeResponsive: z.boolean().default(true),
  timezone: z.string(),
});
export type PrototypeGenerationConfig = z.infer<typeof PrototypeGenerationConfigSchema>;

// Union of all agent config types
export const AgentConfigDataSchema = z.discriminatedUnion('agentType', [
  z.object({ agentType: z.literal('daily_brief'), ...DailyBriefConfigSchema.shape }),
  z.object({ agentType: z.literal('meeting_prep'), ...MeetingPrepConfigSchema.shape }),
  z.object({ agentType: z.literal('sprint_review'), ...SprintReviewConfigSchema.shape }),
  z.object({ agentType: z.literal('voc_clustering'), ...VocClusteringConfigSchema.shape }),
  z.object({ agentType: z.literal('competitor_research'), ...CompetitorResearchConfigSchema.shape }),
  z.object({ agentType: z.literal('roadmap_alignment'), ...RoadmapAlignmentConfigSchema.shape }),
  z.object({ agentType: z.literal('deck_content'), ...DeckContentConfigSchema.shape }),
  z.object({ agentType: z.literal('release_notes'), ...ReleaseNotesConfigSchema.shape }),
  z.object({ agentType: z.literal('prd_draft'), ...PrdDraftConfigSchema.shape }),
  z.object({ agentType: z.literal('prototype_generation'), ...PrototypeGenerationConfigSchema.shape }),
]);
export type AgentConfigData = z.infer<typeof AgentConfigDataSchema>;

export const AgentConfigSchema = z.object({
  id: z.string(),
  userId: z.string(),
  tenantId: z.string(),
  agentType: AgentTypeSchema,
  status: AgentStatusSchema,
  config: z.record(z.unknown()), // Validated against specific schema based on agentType
  nextRunAt: z.date().optional(),
  lastRunAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type AgentConfig = z.infer<typeof AgentConfigSchema>;

// ============================================================================
// Tool Call Types (MCP)
// ============================================================================

export const ToolCallStatusSchema = z.enum(['pending', 'success', 'error', 'skipped']);
export type ToolCallStatus = z.infer<typeof ToolCallStatusSchema>;

export const ToolCallSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  tenantId: z.string(),
  toolName: z.string(),
  serverName: z.string(),
  input: z.record(z.unknown()),
  output: z.record(z.unknown()).optional(),
  status: ToolCallStatusSchema,
  durationMs: z.number().optional(),
  error: z.string().optional(),
  createdAt: z.date(),
});
export type ToolCall = z.infer<typeof ToolCallSchema>;

// ============================================================================
// Proposal Types (Draft-Only Pattern)
// ============================================================================

export const ProposalStatusSchema = z.enum([
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'expired',
]);
export type ProposalStatus = z.infer<typeof ProposalStatusSchema>;

export const ProposalTypeSchema = z.enum([
  'jira_epic',
  'jira_story',
  'confluence_page',
  'slack_message',
  'prd_document',
  'release_notes',
]);
export type ProposalType = z.infer<typeof ProposalTypeSchema>;

export const ProposalSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  jobId: z.string(),
  type: ProposalTypeSchema,
  status: ProposalStatusSchema,
  title: z.string(),
  preview: z.string(),
  diff: z.string().optional(),
  bundle: z.record(z.unknown()),
  targetSystem: z.string(),
  targetId: z.string().optional(),
  createdBy: z.string(),
  reviewedBy: z.string().optional(),
  reviewedAt: z.date().optional(),
  expiresAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Proposal = z.infer<typeof ProposalSchema>;

// ============================================================================
// Artifact Types
// ============================================================================

export const ArtifactTypeSchema = z.enum([
  'brief',
  'meeting_pack',
  'voc_report',
  'competitor_report',
  'alignment_memo',
  'prd',
  'sprint_review',
  'release_notes',
  'prototype',
  'deck_content',
]);
export type ArtifactType = z.infer<typeof ArtifactTypeSchema>;

export const ArtifactSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  jobId: z.string(),
  type: ArtifactTypeSchema,
  title: z.string(),
  format: z.enum(['markdown', 'html', 'pdf', 'json']),
  content: z.string(),
  metadata: z.record(z.unknown()).optional(),
  storageKey: z.string().optional(),
  createdAt: z.date(),
});
export type Artifact = z.infer<typeof ArtifactSchema>;

// ============================================================================
// Source Types (for traceability)
// ============================================================================

export const SourceTypeSchema = z.enum([
  'slack_message',
  'jira_issue',
  'confluence_page',
  'gong_call',
  'zendesk_ticket',
  'community_post',
  'analytics_event',
  'competitor_page',
  'internal_doc',
]);
export type SourceType = z.infer<typeof SourceTypeSchema>;

export const SourceSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  type: SourceTypeSchema,
  externalId: z.string(),
  title: z.string(),
  url: z.string().optional(),
  content: z.string(),
  metadata: z.record(z.unknown()).optional(),
  fetchedAt: z.date(),
  createdAt: z.date(),
});
export type Source = z.infer<typeof SourceSchema>;

// ============================================================================
// Audit Log Types
// ============================================================================

export const AuditActionSchema = z.enum([
  'job.created',
  'job.started',
  'job.completed',
  'job.failed',
  'job.cancelled',
  'tool.called',
  'tool.completed',
  'tool.failed',
  'proposal.created',
  'proposal.approved',
  'proposal.rejected',
  'artifact.created',
  'artifact.downloaded',
  'user.login',
  'user.logout',
  'permission.checked',
  'permission.denied',
  // Guardrail and safety events
  'guardrail.triggered',
  'guardrail.passed',
  'llm.refusal',
  'content.filtered',
  // Policy events
  'policy.checked',
  'policy.denied',
  // Cache events
  'cache.hit',
  'cache.miss',
]);
export type AuditAction = z.infer<typeof AuditActionSchema>;

export const AuditLogSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  userId: z.string().optional(),
  action: AuditActionSchema,
  resourceType: z.string(),
  resourceId: z.string(),
  details: z.record(z.unknown()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  createdAt: z.date(),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;

// ============================================================================
// Demo Arc Types (for guided demo experience)
// ============================================================================

export const DemoArcSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  steps: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      jobType: JobTypeSchema,
      config: z.record(z.unknown()).optional(),
    })
  ),
});
export type DemoArc = z.infer<typeof DemoArcSchema>;

