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

  // Tenant settings (your company/product info)
  tenantId: string;
  tenantName: string;
  productName: string;
  userName: string;

  // API Keys (stored securely in config)
  apiKeys?: {
    // LLM Providers
    openai?: string;
    anthropic?: string;
    google?: string;

    // AI Crawlers
    serper?: string;       // Web search (serper.dev)
    newsapi?: string;      // News (newsapi.org)
    gnews?: string;        // News alternative (gnews.io)

    // Integrations
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
  };

  // Connector credentials (for authenticated data sources)
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

// API Key metadata for the settings UI
export interface ApiKeyInfo {
  key: keyof NonNullable<PMKitConfig['apiKeys']>;
  name: string;
  description: string;
  url: string;
  required: boolean;
  category: 'llm' | 'crawler' | 'integration';
}

export const API_KEY_INFO: ApiKeyInfo[] = [
  // LLM Providers
  {
    key: 'openai',
    name: 'OpenAI API Key',
    description: 'Required for generating AI-powered content',
    url: 'https://platform.openai.com/api-keys',
    required: true,
    category: 'llm',
  },
  {
    key: 'anthropic',
    name: 'Anthropic API Key',
    description: 'Alternative LLM provider (Claude)',
    url: 'https://console.anthropic.com/settings/keys',
    required: false,
    category: 'llm',
  },

  // AI Crawlers
  {
    key: 'serper',
    name: 'Serper API Key',
    description: 'Web search for competitor research (2,500 free/month)',
    url: 'https://serper.dev',
    required: false,
    category: 'crawler',
  },
  {
    key: 'newsapi',
    name: 'NewsAPI Key',
    description: 'News crawler for industry updates (100 free/day)',
    url: 'https://newsapi.org/register',
    required: false,
    category: 'crawler',
  },
  {
    key: 'gnews',
    name: 'GNews API Key',
    description: 'Alternative news source (600 free/day)',
    url: 'https://gnews.io',
    required: false,
    category: 'crawler',
  },

  // Integrations
  {
    key: 'figma',
    name: 'Figma Access Token',
    description: 'Access design files and comments',
    url: 'https://www.figma.com/developers/api#access-tokens',
    required: false,
    category: 'integration',
  },
  {
    key: 'loom',
    name: 'Loom API Key',
    description: 'Access video recordings',
    url: 'https://dev.loom.com',
    required: false,
    category: 'integration',
  },
  {
    key: 'coda',
    name: 'Coda API Key',
    description: 'Access docs and tables',
    url: 'https://coda.io/developers/apis/v1',
    required: false,
    category: 'integration',
  },
  {
    key: 'linear',
    name: 'Linear API Key',
    description: 'Access issues and projects',
    url: 'https://linear.app/settings/api',
    required: false,
    category: 'integration',
  },
  {
    key: 'notion',
    name: 'Notion Integration Token',
    description: 'Access pages and databases',
    url: 'https://www.notion.so/my-integrations',
    required: false,
    category: 'integration',
  },
  {
    key: 'discourse',
    name: 'Discourse API Key',
    description: 'Access community forums',
    url: 'https://meta.discourse.org/t/create-and-configure-an-api-key/230124',
    required: false,
    category: 'integration',
  },
  {
    key: 'amplitude',
    name: 'Amplitude API Key',
    description: 'Access product analytics',
    url: 'https://help.amplitude.com/hc/en-us/articles/360058073772',
    required: false,
    category: 'integration',
  },
  {
    key: 'zoom',
    name: 'Zoom Access Token',
    description: 'Access meetings and recordings',
    url: 'https://marketplace.zoom.us/docs/guides/build/oauth-app',
    required: false,
    category: 'integration',
  },
];
