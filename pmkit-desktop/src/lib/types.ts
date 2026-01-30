/**
 * Core types for pmkit-desktop
 */

export type WorkflowId =
  | 'daily-brief'
  | 'meeting-prep'
  | 'feature-intel'
  | 'prd-draft'
  | 'sprint-review'
  | 'competitor'
  | 'roadmap'
  | 'release-notes'
  | 'deck-content'
  | 'prototype';

export interface WorkflowConfig {
  id: WorkflowId;
  name: string;
  description: string;
  emoji: string;
  category: string;
  schedule: string | null; // cron expression or null for manual
  jobType: string; // maps to @pmkit/core JobType
}

export const WORKFLOWS: Record<WorkflowId, WorkflowConfig> = {
  'daily-brief': {
    id: 'daily-brief',
    name: 'Daily Brief',
    description: 'Morning brief synthesizing overnight activity',
    emoji: '☀️',
    category: 'operational-intelligence',
    schedule: '0 7 * * 1-5', // Weekdays 7am
    jobType: 'daily_brief',
  },
  'meeting-prep': {
    id: 'meeting-prep',
    name: 'Meeting Prep Pack',
    description: 'Customer meeting context and talking points',
    emoji: '🤝',
    category: 'stakeholder-intelligence',
    schedule: '0 8 * * 1-5', // Weekdays 8am
    jobType: 'meeting_prep',
  },
  'feature-intel': {
    id: 'feature-intel',
    name: 'Feature Intelligence',
    description: 'VoC clustering with quantified demand',
    emoji: '🔬',
    category: 'feature-intelligence',
    schedule: '0 9 * * 1', // Mondays 9am
    jobType: 'feature_intelligence',
  },
  'prd-draft': {
    id: 'prd-draft',
    name: 'PRD Draft',
    description: 'PRDs grounded in customer evidence',
    emoji: '📝',
    category: 'documentation',
    schedule: null, // Manual only
    jobType: 'prd_draft',
  },
  'sprint-review': {
    id: 'sprint-review',
    name: 'Sprint Review Pack',
    description: 'Sprint summaries with metrics and demos',
    emoji: '🏃',
    category: 'agile',
    schedule: '0 14 * * 5', // Fridays 2pm
    jobType: 'sprint_review',
  },
  competitor: {
    id: 'competitor',
    name: 'Competitor Research',
    description: 'Competitor tracking with strategic implications',
    emoji: '🔍',
    category: 'competitive-intelligence',
    schedule: '0 10 * * 1', // Mondays 10am
    jobType: 'competitor_research',
  },
  roadmap: {
    id: 'roadmap',
    name: 'Roadmap Alignment',
    description: 'Alignment memos with options and trade-offs',
    emoji: '🗺️',
    category: 'strategy',
    schedule: null, // Manual only
    jobType: 'roadmap_alignment',
  },
  'release-notes': {
    id: 'release-notes',
    name: 'Release Notes',
    description: 'Customer-facing release notes',
    emoji: '📢',
    category: 'documentation',
    schedule: null, // Manual only
    jobType: 'release_notes',
  },
  'deck-content': {
    id: 'deck-content',
    name: 'Deck Content',
    description: 'Slide content for any audience',
    emoji: '📊',
    category: 'communication',
    schedule: null, // Manual only
    jobType: 'deck_content',
  },
  prototype: {
    id: 'prototype',
    name: 'PRD to Prototype',
    description: 'Interactive HTML prototypes from PRDs',
    emoji: '🎨',
    category: 'design',
    schedule: null, // Manual only
    jobType: 'prototype_generation',
  },
};

export interface WorkflowRunInput {
  workflowId: WorkflowId;
  params?: Record<string, unknown>;
  triggerType: 'manual' | 'scheduled';
}

export interface WorkflowRunResult {
  success: boolean;
  workflowId: WorkflowId;
  outputPath: string;
  telemetryPath: string;
  content: string;
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  estimatedCostUsd: number;
  isStub: boolean;
  error?: string;
}

export interface TelemetryRecord {
  timestamp: string;
  workflowId: WorkflowId;
  workflowName: string;
  triggerType: 'manual' | 'scheduled';
  success: boolean;
  durationMs: number;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  estimatedCostUsd: number;
  isStub: boolean;
  outputPath: string;
  params?: Record<string, unknown>;
  error?: string;
  environment: {
    platform: string;
    nodeVersion: string;
    pmkitVersion: string;
  };
}

export interface PMKitConfig {
  // Output settings
  outputDir: string;

  // LLM settings
  llmProvider: 'openai' | 'anthropic' | 'google';
  llmModel?: string;
  useStubs: boolean;

  // Tenant settings
  tenantId: string;
  tenantName: string;
  productName: string;
  userName: string;

  // Connector credentials (encrypted)
  connectors?: {
    slack?: {
      accessToken: string;
    };
    jira?: {
      baseUrl: string;
      email: string;
      apiToken: string;
    };
    google?: {
      accessToken: string;
      refreshToken: string;
    };
    zendesk?: {
      subdomain: string;
      email: string;
      apiToken: string;
    };
    confluence?: {
      baseUrl: string;
      email: string;
      apiToken: string;
    };
  };

  // Scheduler settings
  scheduler?: {
    enabled: boolean;
    timezone: string;
    workflows: Partial<Record<WorkflowId, {
      enabled: boolean;
      schedule?: string; // Override default schedule
    }>>;
  };
}
