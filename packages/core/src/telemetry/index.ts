import { z } from 'zod';

// ============================================================================
// Extended Telemetry Schema
// ============================================================================
// This schema extends the basic AuditLog with additional fields needed for
// comprehensive agent telemetry analysis.

export const TelemetryEventTypeSchema = z.enum([
  // Job lifecycle
  'job.start',
  'job.complete',
  'job.fail',
  'job.cancel',
  
  // Tool calls
  'tool.call',
  'tool.complete',
  'tool.fail',
  'tool.skip',
  
  // LLM interactions
  'llm.request',
  'llm.response',
  'llm.stream_start',
  'llm.stream_end',
  
  // Proposals
  'proposal.create',
  'proposal.approve',
  'proposal.reject',
  'proposal.expire',
  
  // Guardrails and safety
  'guardrail.trigger',
  'guardrail.pass',
  'refusal',
  'content_filter',
  
  // Caching
  'cache.hit',
  'cache.miss',
  'cache.store',
  'cache.evict',
  
  // Policy enforcement
  'policy.check',
  'policy.allow',
  'policy.deny',
]);
export type TelemetryEventType = z.infer<typeof TelemetryEventTypeSchema>;

export const TokenUsageSchema = z.object({
  inputTokens: z.number(),
  outputTokens: z.number(),
  totalTokens: z.number(),
  cachedTokens: z.number().optional(),
});
export type TokenUsage = z.infer<typeof TokenUsageSchema>;

export const TelemetryEventSchema = z.object({
  // Unique identifiers
  id: z.string(),
  
  // Trace hierarchy for distributed tracing
  runId: z.string(),                    // Job run ID (top-level trace)
  stepId: z.string().optional(),        // Tool call / step within run
  parentStepId: z.string().optional(),  // For nested operations
  spanId: z.string().optional(),        // OpenTelemetry-compatible span ID
  
  // Event classification
  eventType: TelemetryEventTypeSchema,
  
  // Performance metrics
  latencyMs: z.number().optional(),
  startTime: z.date(),
  endTime: z.date().optional(),
  
  // LLM-specific metrics
  tokenUsage: TokenUsageSchema.optional(),
  estimatedCostUsd: z.number().optional(),
  modelId: z.string().optional(),
  promptVersion: z.string().optional(),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
  
  // Caching
  cacheHit: z.boolean().optional(),
  cacheKey: z.string().optional(),
  
  // Connector context
  connectorKey: z.string().optional(),
  toolName: z.string().optional(),
  
  // Guardrails and safety
  guardrailTriggered: z.boolean().optional(),
  guardrailType: z.string().optional(),
  guardrailReason: z.string().optional(),
  refusalReason: z.string().optional(),
  contentFilterCategory: z.string().optional(),
  
  // Approval tracking (for proposals)
  approvalOutcome: z.enum(['approved', 'rejected', 'expired', 'pending']).optional(),
  approvedBy: z.string().optional(),
  approvalLatencyMs: z.number().optional(),
  
  // Error tracking
  errorType: z.string().optional(),
  errorMessage: z.string().optional(),
  errorStack: z.string().optional(),
  
  // Standard context
  tenantId: z.string(),
  userId: z.string().optional(),
  jobType: z.string().optional(),
  
  // Extensible metadata
  metadata: z.record(z.unknown()).optional(),
  
  // Timestamps
  createdAt: z.date(),
});
export type TelemetryEvent = z.infer<typeof TelemetryEventSchema>;

// ============================================================================
// SIEM Export Schema
// ============================================================================
// Standardized event format for SIEM integration (CEF-compatible)

export const SIEMSeveritySchema = z.enum([
  'unknown',      // 0
  'low',          // 1-3
  'medium',       // 4-6
  'high',         // 7-8
  'critical',     // 9-10
]);
export type SIEMSeverity = z.infer<typeof SIEMSeveritySchema>;

export const SIEMEventSchema = z.object({
  // CEF Header Fields
  version: z.string().default('CEF:0'),
  deviceVendor: z.string().default('pmkit'),
  deviceProduct: z.string().default('agent-platform'),
  deviceVersion: z.string(),
  signatureId: z.string(),              // Event type identifier
  name: z.string(),                     // Human-readable event name
  severity: z.number().min(0).max(10),  // 0-10 scale
  
  // CEF Extension Fields (standard)
  src: z.string().optional(),           // Source (tenant/user)
  dst: z.string().optional(),           // Destination (connector/system)
  suser: z.string().optional(),         // Source user
  duser: z.string().optional(),         // Destination user
  act: z.string(),                      // Action taken
  outcome: z.enum(['success', 'failure', 'unknown']),
  reason: z.string().optional(),        // Reason for outcome
  
  // CEF Extension Fields (custom - cs1-cs6 for strings, cn1-cn3 for numbers)
  cs1: z.string().optional(),           // runId
  cs1Label: z.string().default('runId'),
  cs2: z.string().optional(),           // stepId
  cs2Label: z.string().default('stepId'),
  cs3: z.string().optional(),           // jobType
  cs3Label: z.string().default('jobType'),
  cs4: z.string().optional(),           // connectorKey
  cs4Label: z.string().default('connectorKey'),
  cs5: z.string().optional(),           // modelId
  cs5Label: z.string().default('modelId'),
  cs6: z.string().optional(),           // errorType
  cs6Label: z.string().default('errorType'),
  
  cn1: z.number().optional(),           // latencyMs
  cn1Label: z.string().default('latencyMs'),
  cn2: z.number().optional(),           // tokenCount
  cn2Label: z.string().default('tokenCount'),
  cn3: z.number().optional(),           // estimatedCostUsd (in microdollars)
  cn3Label: z.string().default('costMicrodollars'),
  
  // Timestamps
  rt: z.number(),                       // Receipt time (epoch ms)
  start: z.number().optional(),         // Start time (epoch ms)
  end: z.number().optional(),           // End time (epoch ms)
  
  // Raw event for full fidelity (JSON-stringified, redacted)
  rawEvent: z.string().optional(),
});
export type SIEMEvent = z.infer<typeof SIEMEventSchema>;

// ============================================================================
// Redaction Configuration
// ============================================================================
// Strategy for redacting sensitive data before SIEM export

export const RedactionStrategySchema = z.enum([
  'remove',       // Completely remove the field
  'hash',         // SHA-256 hash (preserves cardinality)
  'truncate',     // Truncate to max length
  'mask',         // Replace with asterisks (e.g., email → j***@example.com)
  'tokenize',     // Replace with reversible token (requires key)
]);
export type RedactionStrategy = z.infer<typeof RedactionStrategySchema>;

export const RedactionRuleSchema = z.object({
  field: z.string(),                    // JSON path to field
  strategy: RedactionStrategySchema,
  maxLength: z.number().optional(),     // For truncate strategy
  pattern: z.string().optional(),       // Regex pattern for mask strategy
});
export type RedactionRule = z.infer<typeof RedactionRuleSchema>;

export const RedactionConfigSchema = z.object({
  // Fields to completely remove
  removeFields: z.array(z.string()),
  
  // Fields to hash (preserve cardinality, hide values)
  hashFields: z.array(z.string()),
  
  // Fields to truncate
  truncateFields: z.array(z.object({
    field: z.string(),
    maxLength: z.number(),
  })),
  
  // PII patterns to redact (applied to all string fields)
  piiPatterns: z.array(z.object({
    name: z.string(),
    pattern: z.string(),              // Regex pattern
    replacement: z.string(),          // Replacement string
  })),
  
  // Custom rules for specific fields
  customRules: z.array(RedactionRuleSchema).optional(),
});
export type RedactionConfig = z.infer<typeof RedactionConfigSchema>;

// Default redaction configuration
export const DEFAULT_REDACTION_CONFIG: RedactionConfig = {
  removeFields: [
    'metadata.rawContent',
    'metadata.userInput',
    'metadata.promptContent',
    'errorStack',
  ],
  hashFields: [
    'userId',
    'suser',
    'approvedBy',
  ],
  truncateFields: [
    { field: 'errorMessage', maxLength: 500 },
    { field: 'reason', maxLength: 200 },
    { field: 'guardrailReason', maxLength: 200 },
    { field: 'refusalReason', maxLength: 200 },
  ],
  piiPatterns: [
    {
      name: 'email',
      pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
      replacement: '[EMAIL_REDACTED]',
    },
    {
      name: 'phone',
      pattern: '\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b',
      replacement: '[PHONE_REDACTED]',
    },
    {
      name: 'ssn',
      pattern: '\\b\\d{3}-\\d{2}-\\d{4}\\b',
      replacement: '[SSN_REDACTED]',
    },
    {
      name: 'credit_card',
      pattern: '\\b\\d{4}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}\\b',
      replacement: '[CC_REDACTED]',
    },
    {
      name: 'api_key',
      pattern: '\\b(sk-|pk-|api_|key_)[A-Za-z0-9]{20,}\\b',
      replacement: '[API_KEY_REDACTED]',
    },
  ],
};

// ============================================================================
// Analysis Types - Failure Mode Clustering
// ============================================================================

export const FailureClusterSchema = z.object({
  clusterId: z.string(),
  failureType: z.string(),              // e.g., 'timeout', 'rate_limit', 'content_filter'
  
  // Dimensions for clustering
  connector: z.string().optional(),
  model: z.string().optional(),
  promptVersion: z.string().optional(),
  jobType: z.string().optional(),
  
  // Cluster statistics
  count: z.number(),
  firstSeen: z.date(),
  lastSeen: z.date(),
  
  // Sample data for debugging
  sampleErrors: z.array(z.string()),
  sampleRunIds: z.array(z.string()),
  
  // Trend
  trend: z.enum(['increasing', 'stable', 'decreasing']),
  countLast24h: z.number(),
  countLast7d: z.number(),
});
export type FailureCluster = z.infer<typeof FailureClusterSchema>;

// ============================================================================
// Analysis Types - Drift/Regression Detection
// ============================================================================

export const MetricBaselineSchema = z.object({
  p50: z.number(),
  p75: z.number(),
  p90: z.number(),
  p95: z.number(),
  p99: z.number(),
  mean: z.number(),
  stdDev: z.number(),
  min: z.number(),
  max: z.number(),
  sampleCount: z.number(),
});
export type MetricBaseline = z.infer<typeof MetricBaselineSchema>;

export const DriftMetricsSchema = z.object({
  jobType: z.string(),
  connector: z.string().optional(),
  model: z.string().optional(),
  
  // Time period
  period: z.object({
    start: z.date(),
    end: z.date(),
  }),
  
  // Baseline (historical)
  baseline: z.object({
    latencyMs: MetricBaselineSchema,
    tokenUsage: MetricBaselineSchema,
    costUsd: MetricBaselineSchema,
    successRate: z.number(),
    sampleCount: z.number(),
    period: z.object({
      start: z.date(),
      end: z.date(),
    }),
  }),
  
  // Current metrics
  current: z.object({
    latencyMs: MetricBaselineSchema,
    tokenUsage: MetricBaselineSchema,
    costUsd: MetricBaselineSchema,
    successRate: z.number(),
    sampleCount: z.number(),
  }),
  
  // Drift calculations
  drift: z.object({
    latencyPctChange: z.number(),       // % change from baseline p50
    tokenUsagePctChange: z.number(),
    costPctChange: z.number(),
    successRateDelta: z.number(),       // Absolute change in success rate
  }),
  
  // Anomaly detection
  anomalyDetected: z.boolean(),
  anomalyType: z.enum(['latency', 'cost', 'quality', 'multiple']).optional(),
  anomalyScore: z.number().optional(),  // 0-1, higher = more anomalous
  
  // Recommendations
  recommendations: z.array(z.string()),
});
export type DriftMetrics = z.infer<typeof DriftMetricsSchema>;

// ============================================================================
// Analysis Types - Anomaly Baselines
// ============================================================================

export const AnomalyBaselineSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  
  // Scope
  jobType: z.string(),
  connector: z.string().optional(),
  model: z.string().optional(),
  
  // Baseline metrics
  metrics: z.object({
    latencyMs: MetricBaselineSchema,
    tokenUsage: MetricBaselineSchema,
    costUsd: MetricBaselineSchema,
  }),
  
  // Thresholds for anomaly detection
  thresholds: z.object({
    latencyMs: z.object({
      warning: z.number(),              // e.g., p95
      critical: z.number(),             // e.g., p99 * 1.5
    }),
    tokenUsage: z.object({
      warning: z.number(),
      critical: z.number(),
    }),
    costUsd: z.object({
      warning: z.number(),
      critical: z.number(),
    }),
    successRate: z.object({
      warning: z.number(),              // e.g., 0.95
      critical: z.number(),             // e.g., 0.90
    }),
  }),
  
  // Metadata
  sampleCount: z.number(),
  calculatedAt: z.date(),
  validUntil: z.date(),
  
  // Auto-update settings
  autoUpdate: z.boolean(),
  updateFrequency: z.enum(['hourly', 'daily', 'weekly']),
});
export type AnomalyBaseline = z.infer<typeof AnomalyBaselineSchema>;

// ============================================================================
// SIEM Event Mapping
// ============================================================================
// Maps TelemetryEvent to SIEMEvent

export const SIEM_EVENT_SIGNATURES: Record<TelemetryEventType, { signatureId: string; name: string; baseSeverity: number }> = {
  'job.start': { signatureId: 'PMKIT-JOB-001', name: 'Job Started', baseSeverity: 1 },
  'job.complete': { signatureId: 'PMKIT-JOB-002', name: 'Job Completed', baseSeverity: 1 },
  'job.fail': { signatureId: 'PMKIT-JOB-003', name: 'Job Failed', baseSeverity: 6 },
  'job.cancel': { signatureId: 'PMKIT-JOB-004', name: 'Job Cancelled', baseSeverity: 3 },
  
  'tool.call': { signatureId: 'PMKIT-TOOL-001', name: 'Tool Called', baseSeverity: 1 },
  'tool.complete': { signatureId: 'PMKIT-TOOL-002', name: 'Tool Completed', baseSeverity: 1 },
  'tool.fail': { signatureId: 'PMKIT-TOOL-003', name: 'Tool Failed', baseSeverity: 5 },
  'tool.skip': { signatureId: 'PMKIT-TOOL-004', name: 'Tool Skipped', baseSeverity: 2 },
  
  'llm.request': { signatureId: 'PMKIT-LLM-001', name: 'LLM Request', baseSeverity: 1 },
  'llm.response': { signatureId: 'PMKIT-LLM-002', name: 'LLM Response', baseSeverity: 1 },
  'llm.stream_start': { signatureId: 'PMKIT-LLM-003', name: 'LLM Stream Started', baseSeverity: 1 },
  'llm.stream_end': { signatureId: 'PMKIT-LLM-004', name: 'LLM Stream Ended', baseSeverity: 1 },
  
  'proposal.create': { signatureId: 'PMKIT-PROP-001', name: 'Proposal Created', baseSeverity: 2 },
  'proposal.approve': { signatureId: 'PMKIT-PROP-002', name: 'Proposal Approved', baseSeverity: 3 },
  'proposal.reject': { signatureId: 'PMKIT-PROP-003', name: 'Proposal Rejected', baseSeverity: 3 },
  'proposal.expire': { signatureId: 'PMKIT-PROP-004', name: 'Proposal Expired', baseSeverity: 2 },
  
  'guardrail.trigger': { signatureId: 'PMKIT-GUARD-001', name: 'Guardrail Triggered', baseSeverity: 7 },
  'guardrail.pass': { signatureId: 'PMKIT-GUARD-002', name: 'Guardrail Passed', baseSeverity: 1 },
  'refusal': { signatureId: 'PMKIT-GUARD-003', name: 'Content Refused', baseSeverity: 6 },
  'content_filter': { signatureId: 'PMKIT-GUARD-004', name: 'Content Filtered', baseSeverity: 5 },
  
  'cache.hit': { signatureId: 'PMKIT-CACHE-001', name: 'Cache Hit', baseSeverity: 1 },
  'cache.miss': { signatureId: 'PMKIT-CACHE-002', name: 'Cache Miss', baseSeverity: 1 },
  'cache.store': { signatureId: 'PMKIT-CACHE-003', name: 'Cache Store', baseSeverity: 1 },
  'cache.evict': { signatureId: 'PMKIT-CACHE-004', name: 'Cache Evict', baseSeverity: 1 },
  
  'policy.check': { signatureId: 'PMKIT-POL-001', name: 'Policy Check', baseSeverity: 1 },
  'policy.allow': { signatureId: 'PMKIT-POL-002', name: 'Policy Allowed', baseSeverity: 1 },
  'policy.deny': { signatureId: 'PMKIT-POL-003', name: 'Policy Denied', baseSeverity: 6 },
};

// ============================================================================
// Example SIEM Event JSON
// ============================================================================
// This is an example of what a SIEM event looks like when exported

export const EXAMPLE_SIEM_EVENT: SIEMEvent = {
  version: 'CEF:0',
  deviceVendor: 'pmkit',
  deviceProduct: 'agent-platform',
  deviceVersion: '1.0.0',
  signatureId: 'PMKIT-JOB-002',
  name: 'Job Completed',
  severity: 1,
  
  src: 'tenant-abc123',
  suser: 'a]b2c3d4e5f6...',  // Hashed userId
  act: 'job.complete',
  outcome: 'success',
  
  cs1: 'run-xyz789',
  cs1Label: 'runId',
  cs2: undefined,
  cs2Label: 'stepId',
  cs3: 'daily_brief',
  cs3Label: 'jobType',
  cs4: undefined,
  cs4Label: 'connectorKey',
  cs5: 'gpt-4o',
  cs5Label: 'modelId',
  cs6: undefined,
  cs6Label: 'errorType',
  
  cn1: 4523,
  cn1Label: 'latencyMs',
  cn2: 2847,
  cn2Label: 'tokenCount',
  cn3: 28470,  // $0.02847 in microdollars
  cn3Label: 'costMicrodollars',
  
  rt: Date.now(),
  start: Date.now() - 4523,
  end: Date.now(),
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert a TelemetryEvent to a SIEMEvent
 */
export function telemetryToSIEM(
  event: TelemetryEvent,
  config: RedactionConfig = DEFAULT_REDACTION_CONFIG,
  deviceVersion: string = '1.0.0'
): SIEMEvent {
  const signature = SIEM_EVENT_SIGNATURES[event.eventType];
  
  return {
    version: 'CEF:0',
    deviceVendor: 'pmkit',
    deviceProduct: 'agent-platform',
    deviceVersion,
    signatureId: signature.signatureId,
    name: signature.name,
    severity: calculateSeverity(event, signature.baseSeverity),
    
    src: event.tenantId,
    suser: event.userId ? hashField(event.userId) : undefined,
    act: event.eventType,
    outcome: event.errorType ? 'failure' : 'success',
    reason: truncateField(event.errorMessage, 200),
    
    cs1: event.runId,
    cs1Label: 'runId',
    cs2: event.stepId,
    cs2Label: 'stepId',
    cs3: event.jobType,
    cs3Label: 'jobType',
    cs4: event.connectorKey,
    cs4Label: 'connectorKey',
    cs5: event.modelId,
    cs5Label: 'modelId',
    cs6: event.errorType,
    cs6Label: 'errorType',
    
    cn1: event.latencyMs,
    cn1Label: 'latencyMs',
    cn2: event.tokenUsage?.totalTokens,
    cn2Label: 'tokenCount',
    cn3: event.estimatedCostUsd ? Math.round(event.estimatedCostUsd * 1000000) : undefined,
    cn3Label: 'costMicrodollars',
    
    rt: event.createdAt.getTime(),
    start: event.startTime.getTime(),
    end: event.endTime?.getTime(),
  };
}

/**
 * Calculate severity based on event type and context
 */
function calculateSeverity(event: TelemetryEvent, baseSeverity: number): number {
  let severity = baseSeverity;
  
  // Increase severity for errors
  if (event.errorType) {
    severity = Math.min(10, severity + 2);
  }
  
  // Increase severity for guardrail triggers
  if (event.guardrailTriggered) {
    severity = Math.min(10, severity + 3);
  }
  
  // Increase severity for refusals
  if (event.refusalReason) {
    severity = Math.min(10, severity + 2);
  }
  
  return severity;
}

/**
 * Hash a field value (SHA-256, truncated)
 */
function hashField(value: string): string {
  // In production, use crypto.subtle.digest or similar
  // This is a placeholder that shows the format
  return `${value.substring(0, 1)}]${value.substring(1, 8)}...`;
}

/**
 * Truncate a field to max length
 */
function truncateField(value: string | undefined, maxLength: number): string | undefined {
  if (!value) return undefined;
  if (value.length <= maxLength) return value;
  return value.substring(0, maxLength - 3) + '...';
}

/**
 * Format a SIEM event as CEF string
 */
export function formatCEF(event: SIEMEvent): string {
  const header = `${event.version}|${event.deviceVendor}|${event.deviceProduct}|${event.deviceVersion}|${event.signatureId}|${event.name}|${event.severity}`;
  
  const extensions: string[] = [];
  
  if (event.src) extensions.push(`src=${event.src}`);
  if (event.suser) extensions.push(`suser=${event.suser}`);
  if (event.act) extensions.push(`act=${event.act}`);
  if (event.outcome) extensions.push(`outcome=${event.outcome}`);
  if (event.reason) extensions.push(`reason=${event.reason}`);
  
  if (event.cs1) extensions.push(`cs1=${event.cs1} cs1Label=${event.cs1Label}`);
  if (event.cs2) extensions.push(`cs2=${event.cs2} cs2Label=${event.cs2Label}`);
  if (event.cs3) extensions.push(`cs3=${event.cs3} cs3Label=${event.cs3Label}`);
  if (event.cs4) extensions.push(`cs4=${event.cs4} cs4Label=${event.cs4Label}`);
  if (event.cs5) extensions.push(`cs5=${event.cs5} cs5Label=${event.cs5Label}`);
  if (event.cs6) extensions.push(`cs6=${event.cs6} cs6Label=${event.cs6Label}`);
  
  if (event.cn1 !== undefined) extensions.push(`cn1=${event.cn1} cn1Label=${event.cn1Label}`);
  if (event.cn2 !== undefined) extensions.push(`cn2=${event.cn2} cn2Label=${event.cn2Label}`);
  if (event.cn3 !== undefined) extensions.push(`cn3=${event.cn3} cn3Label=${event.cn3Label}`);
  
  extensions.push(`rt=${event.rt}`);
  if (event.start) extensions.push(`start=${event.start}`);
  if (event.end) extensions.push(`end=${event.end}`);
  
  return `${header}|${extensions.join(' ')}`;
}
