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

  // User profile (your info)
  tenantId: string;
  tenantName: string;
  productName: string;
  userName: string;

  // All credentials in one place (BYOK - Bring Your Own Key)
  // Each user manages their own keys - not shared across tenants
  credentials?: {
    // AI / LLM Providers
    openai?: string;
    anthropic?: string;
    google?: string;

    // AI Crawlers
    serper?: string;
    newsapi?: string;
    gnews?: string;

    // Integrations - all use simple token/key auth
    // Users get these from each service's settings page
    figma?: string;
    loom?: string;
    coda?: string;
    amplitude?: string;
    amplitudeSecret?: string;
    discourse?: string;
    discourseUrl?: string;
    linear?: string;
    notion?: string;
    zoom?: string;

    // Data source connectors
    slack?: string;
    jira?: string;
    jiraEmail?: string;
    jiraUrl?: string;
    confluence?: string;
    confluenceEmail?: string;
    confluenceUrl?: string;
    gmail?: string;
    googleCalendar?: string;
    googleDrive?: string;
    zendesk?: string;
    zendeskEmail?: string;
    zendeskSubdomain?: string;
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

  // Legacy - for backwards compatibility only
  apiKeys?: PMKitConfig['credentials'];
  connectors?: Record<string, unknown>;
}

// ============================================================================
// Credential Definitions (for Settings UI)
// ============================================================================

export type CredentialCategory = 'ai' | 'crawler' | 'integration' | 'connector';

export interface CredentialInfo {
  key: keyof NonNullable<PMKitConfig['credentials']>;
  name: string;
  description: string;
  helpUrl: string;
  required: boolean;
  category: CredentialCategory;
  emoji: string;
  // For credentials that need multiple fields (e.g., Jira needs URL + email + token)
  relatedKeys?: Array<keyof NonNullable<PMKitConfig['credentials']>>;
}

export const CREDENTIALS: CredentialInfo[] = [
  // ============================================================================
  // AI / LLM Providers
  // ============================================================================
  {
    key: 'openai',
    name: 'OpenAI',
    description: 'Powers AI content generation (GPT-4, etc.)',
    helpUrl: 'https://platform.openai.com/api-keys',
    required: true,
    category: 'ai',
    emoji: '🤖',
  },
  {
    key: 'anthropic',
    name: 'Anthropic',
    description: 'Alternative AI provider (Claude)',
    helpUrl: 'https://console.anthropic.com/settings/keys',
    required: false,
    category: 'ai',
    emoji: '🧠',
  },

  // ============================================================================
  // AI Crawlers
  // ============================================================================
  {
    key: 'serper',
    name: 'Serper',
    description: 'Web search for competitor research (2,500 free/month)',
    helpUrl: 'https://serper.dev',
    required: false,
    category: 'crawler',
    emoji: '🔍',
  },
  {
    key: 'newsapi',
    name: 'NewsAPI',
    description: 'News crawler for industry updates (100 free/day)',
    helpUrl: 'https://newsapi.org/register',
    required: false,
    category: 'crawler',
    emoji: '📰',
  },
  {
    key: 'gnews',
    name: 'GNews',
    description: 'Alternative news source (600 free/day)',
    helpUrl: 'https://gnews.io',
    required: false,
    category: 'crawler',
    emoji: '📰',
  },

  // ============================================================================
  // Integrations (PM Tools)
  // ============================================================================
  {
    key: 'linear',
    name: 'Linear',
    description: 'Issue tracking and project management',
    helpUrl: 'https://linear.app/settings/api',
    required: false,
    category: 'integration',
    emoji: '📋',
  },
  {
    key: 'notion',
    name: 'Notion',
    description: 'Pages, databases, and docs',
    helpUrl: 'https://www.notion.so/my-integrations',
    required: false,
    category: 'integration',
    emoji: '📓',
  },
  {
    key: 'figma',
    name: 'Figma',
    description: 'Design files and comments',
    helpUrl: 'https://www.figma.com/developers/api#access-tokens',
    required: false,
    category: 'integration',
    emoji: '🎨',
  },
  {
    key: 'coda',
    name: 'Coda',
    description: 'Docs and tables',
    helpUrl: 'https://coda.io/developers/apis/v1',
    required: false,
    category: 'integration',
    emoji: '📝',
  },
  {
    key: 'loom',
    name: 'Loom',
    description: 'Video recordings and transcripts',
    helpUrl: 'https://dev.loom.com',
    required: false,
    category: 'integration',
    emoji: '🎬',
  },
  {
    key: 'amplitude',
    name: 'Amplitude',
    description: 'Product analytics',
    helpUrl: 'https://help.amplitude.com/hc/en-us/articles/360058073772',
    required: false,
    category: 'integration',
    emoji: '📊',
    relatedKeys: ['amplitudeSecret'],
  },
  {
    key: 'discourse',
    name: 'Discourse',
    description: 'Community forums',
    helpUrl: 'https://meta.discourse.org/t/create-and-configure-an-api-key/230124',
    required: false,
    category: 'integration',
    emoji: '💬',
    relatedKeys: ['discourseUrl'],
  },
  {
    key: 'zoom',
    name: 'Zoom',
    description: 'Meetings and recordings',
    helpUrl: 'https://marketplace.zoom.us/docs/guides/build/oauth-app',
    required: false,
    category: 'integration',
    emoji: '🎥',
  },

  // ============================================================================
  // Data Source Connectors
  // ============================================================================
  {
    key: 'slack',
    name: 'Slack',
    description: 'Team messages and channels',
    helpUrl: 'https://api.slack.com/apps',
    required: false,
    category: 'connector',
    emoji: '💬',
  },
  {
    key: 'jira',
    name: 'Jira',
    description: 'Issues and sprints',
    helpUrl: 'https://id.atlassian.com/manage-profile/security/api-tokens',
    required: false,
    category: 'connector',
    emoji: '🎯',
    relatedKeys: ['jiraEmail', 'jiraUrl'],
  },
  {
    key: 'confluence',
    name: 'Confluence',
    description: 'Wiki pages and spaces',
    helpUrl: 'https://id.atlassian.com/manage-profile/security/api-tokens',
    required: false,
    category: 'connector',
    emoji: '📚',
    relatedKeys: ['confluenceEmail', 'confluenceUrl'],
  },
  {
    key: 'gmail',
    name: 'Gmail',
    description: 'Email threads',
    helpUrl: 'https://console.cloud.google.com/apis/credentials',
    required: false,
    category: 'connector',
    emoji: '📧',
  },
  {
    key: 'googleCalendar',
    name: 'Google Calendar',
    description: 'Meeting schedules',
    helpUrl: 'https://console.cloud.google.com/apis/credentials',
    required: false,
    category: 'connector',
    emoji: '📅',
  },
  {
    key: 'googleDrive',
    name: 'Google Drive',
    description: 'Documents and files',
    helpUrl: 'https://console.cloud.google.com/apis/credentials',
    required: false,
    category: 'connector',
    emoji: '📁',
  },
  {
    key: 'zendesk',
    name: 'Zendesk',
    description: 'Support tickets',
    helpUrl: 'https://support.zendesk.com/hc/en-us/articles/4408889192858',
    required: false,
    category: 'connector',
    emoji: '🎫',
    relatedKeys: ['zendeskEmail', 'zendeskSubdomain'],
  },
];

// Helper to get credentials by category
export function getCredentialsByCategory(category: CredentialCategory): CredentialInfo[] {
  return CREDENTIALS.filter(c => c.category === category);
}

// Category display names
export const CREDENTIAL_CATEGORY_NAMES: Record<CredentialCategory, string> = {
  ai: 'AI Providers',
  crawler: 'Research Crawlers',
  integration: 'Integrations',
  connector: 'Data Connectors',
};

// Legacy export for backwards compatibility
export const API_KEY_INFO = CREDENTIALS;
