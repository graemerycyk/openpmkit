/**
 * Configuration management for pmkit-desktop
 *
 * User-friendly settings system that stores API keys and preferences
 * in ~/.pmkit/config.json instead of requiring .env files.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as readline from 'readline';
import type { PMKitConfig, WorkflowId, ApiKeyInfo } from './types.js';
import { WORKFLOWS, API_KEY_INFO } from './types.js';

const CONFIG_DIR = path.join(os.homedir(), '.pmkit');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const DEFAULT_OUTPUT_DIR = path.join(os.homedir(), 'pmkit');

const DEFAULT_CONFIG: PMKitConfig = {
  outputDir: DEFAULT_OUTPUT_DIR,
  llmProvider: 'openai',
  useStubs: true, // Default to stubs for safety
  tenantId: 'demo',
  tenantName: 'My Company',
  productName: 'My Product',
  userName: 'Product Manager',
  apiKeys: {},
  scheduler: {
    enabled: false,
    timezone: 'America/Los_Angeles',
    workflows: {},
  },
};

export class ConfigManager {
  private config: PMKitConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private ensureConfigDir(): void {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
  }

  private loadConfig(): PMKitConfig {
    this.ensureConfigDir();

    if (!fs.existsSync(CONFIG_FILE)) {
      this.saveConfig(DEFAULT_CONFIG);
      return DEFAULT_CONFIG;
    }

    try {
      const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const loaded = JSON.parse(content) as Partial<PMKitConfig>;
      return { ...DEFAULT_CONFIG, ...loaded };
    } catch {
      console.warn('Failed to load config, using defaults');
      return DEFAULT_CONFIG;
    }
  }

  saveConfig(config: PMKitConfig): void {
    this.ensureConfigDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    this.config = config;
  }

  getConfig(): PMKitConfig {
    return this.config;
  }

  updateConfig(updates: Partial<PMKitConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig(this.config);
  }

  /**
   * Get workflows that are scheduled for autonomous runs
   */
  getScheduledWorkflows(): Array<{
    workflowId: WorkflowId;
    schedule: string;
    enabled: boolean;
  }> {
    const result: Array<{
      workflowId: WorkflowId;
      schedule: string;
      enabled: boolean;
    }> = [];

    const workflowIds = Object.keys(WORKFLOWS) as WorkflowId[];

    for (const workflowId of workflowIds) {
      const workflow = WORKFLOWS[workflowId];
      const override = this.config.scheduler?.workflows?.[workflowId];

      // Get schedule from override or default
      const schedule = override?.schedule || workflow.schedule;

      // Only include if there's a schedule
      if (schedule) {
        result.push({
          workflowId,
          schedule,
          enabled: override?.enabled ?? (this.config.scheduler?.enabled ?? false),
        });
      }
    }

    return result;
  }

  /**
   * Enable or disable a specific workflow's schedule
   */
  setWorkflowScheduleEnabled(workflowId: WorkflowId, enabled: boolean): void {
    if (!this.config.scheduler) {
      this.config.scheduler = {
        enabled: false,
        timezone: 'America/Los_Angeles',
        workflows: {},
      };
    }

    if (!this.config.scheduler.workflows) {
      this.config.scheduler.workflows = {};
    }

    if (!this.config.scheduler.workflows[workflowId]) {
      this.config.scheduler.workflows[workflowId] = { enabled };
    } else {
      this.config.scheduler.workflows[workflowId]!.enabled = enabled;
    }

    this.saveConfig(this.config);
  }

  /**
   * Set custom schedule for a workflow
   */
  setWorkflowSchedule(workflowId: WorkflowId, schedule: string): void {
    if (!this.config.scheduler) {
      this.config.scheduler = {
        enabled: false,
        timezone: 'America/Los_Angeles',
        workflows: {},
      };
    }

    if (!this.config.scheduler.workflows) {
      this.config.scheduler.workflows = {};
    }

    if (!this.config.scheduler.workflows[workflowId]) {
      this.config.scheduler.workflows[workflowId] = { enabled: true, schedule };
    } else {
      this.config.scheduler.workflows[workflowId]!.schedule = schedule;
    }

    this.saveConfig(this.config);
  }

  // ============================================================================
  // API Key Management
  // ============================================================================

  /**
   * Set an API key in the config
   */
  setApiKey(key: keyof NonNullable<PMKitConfig['apiKeys']>, value: string): void {
    if (!this.config.apiKeys) {
      this.config.apiKeys = {};
    }
    this.config.apiKeys[key] = value;

    // If setting OpenAI key, automatically disable stubs
    if (key === 'openai' && value) {
      this.config.useStubs = false;
    }

    this.saveConfig(this.config);
  }

  /**
   * Get an API key from config (falls back to environment variables)
   */
  getApiKeyValue(key: keyof NonNullable<PMKitConfig['apiKeys']>): string | undefined {
    // First check config
    const configValue = this.config.apiKeys?.[key];
    if (configValue) return configValue;

    // Fall back to environment variables for backwards compatibility
    const envMap: Record<string, string | undefined> = {
      openai: process.env.OPENAI_API_KEY_DEMO || process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GOOGLE_API_KEY,
      serper: process.env.SERPER_API_KEY,
      newsapi: process.env.NEWSAPI_KEY,
      gnews: process.env.GNEWS_API_KEY,
      figma: process.env.FIGMA_ACCESS_TOKEN,
      loom: process.env.LOOM_API_KEY,
      coda: process.env.CODA_API_KEY,
      amplitude: process.env.AMPLITUDE_API_KEY,
      amplitudeSecret: process.env.AMPLITUDE_SECRET_KEY,
      discourse: process.env.DISCOURSE_API_KEY,
      discourseUrl: process.env.DISCOURSE_URL,
      linear: process.env.LINEAR_API_KEY,
      notion: process.env.NOTION_ACCESS_TOKEN,
      zoom: process.env.ZOOM_ACCESS_TOKEN,
    };

    return envMap[key];
  }

  /**
   * Remove an API key from config
   */
  removeApiKey(key: keyof NonNullable<PMKitConfig['apiKeys']>): void {
    if (this.config.apiKeys) {
      delete this.config.apiKeys[key];
      this.saveConfig(this.config);
    }
  }

  /**
   * Get all configured API keys (masked for display)
   */
  getApiKeysStatus(): Array<{
    key: string;
    name: string;
    configured: boolean;
    maskedValue: string;
    category: string;
    required: boolean;
  }> {
    return API_KEY_INFO.map((info) => {
      const value = this.getApiKeyValue(info.key);
      return {
        key: info.key,
        name: info.name,
        configured: !!value,
        maskedValue: value ? maskApiKey(value) : '(not set)',
        category: info.category,
        required: info.required,
      };
    });
  }

  /**
   * Get LLM API key based on current provider
   */
  getApiKey(): string | undefined {
    const provider = this.config.llmProvider;

    switch (provider) {
      case 'openai':
        return this.getApiKeyValue('openai');
      case 'anthropic':
        return this.getApiKeyValue('anthropic');
      case 'google':
        return this.getApiKeyValue('google');
      default:
        return undefined;
    }
  }

  /**
   * Check if stubs should be used
   */
  shouldUseStubs(): boolean {
    // Check environment override first
    if (process.env.USE_STUB_LLM === 'true') {
      return true;
    }
    if (process.env.USE_STUB_LLM === 'false') {
      return false;
    }

    // If no API key is configured, use stubs
    if (!this.getApiKey()) {
      return true;
    }

    // Fall back to config
    return this.config.useStubs;
  }

  /**
   * Check if this is the first run (no config file exists)
   */
  isFirstRun(): boolean {
    return !fs.existsSync(CONFIG_FILE) || !this.config.apiKeys?.openai;
  }

  /**
   * Check if required API keys are configured
   */
  hasRequiredApiKeys(): boolean {
    return !!this.getApiKey();
  }

  // ============================================================================
  // Profile Settings
  // ============================================================================

  /**
   * Set user profile information
   */
  setProfile(profile: {
    userName?: string;
    tenantName?: string;
    productName?: string;
  }): void {
    if (profile.userName) this.config.userName = profile.userName;
    if (profile.tenantName) this.config.tenantName = profile.tenantName;
    if (profile.productName) this.config.productName = profile.productName;
    this.saveConfig(this.config);
  }

  /**
   * Get user profile information
   */
  getProfile(): {
    userName: string;
    tenantName: string;
    productName: string;
  } {
    return {
      userName: this.config.userName,
      tenantName: this.config.tenantName,
      productName: this.config.productName,
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Mask an API key for display (show first 4 and last 4 chars)
 */
function maskApiKey(key: string): string {
  if (key.length <= 12) {
    return '*'.repeat(key.length);
  }
  return `${key.slice(0, 4)}${'*'.repeat(key.length - 8)}${key.slice(-4)}`;
}

/**
 * Prompt for user input (async)
 */
async function prompt(question: string, defaultValue?: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const displayQuestion = defaultValue
      ? `${question} (${defaultValue}): `
      : `${question}: `;

    rl.question(displayQuestion, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue || '');
    });
  });
}

/**
 * Prompt for a secret (password-style, doesn't echo)
 */
async function promptSecret(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    // Note: This doesn't actually hide input in all terminals
    // For a production app, we'd use a library like 'read' or 'inquirer'
    rl.question(`${question}: `, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ============================================================================
// Interactive Setup Wizard
// ============================================================================

/**
 * Run the interactive setup wizard
 */
export async function runSetupWizard(): Promise<void> {
  const config = configManager;

  console.log('\n' + '='.repeat(60));
  console.log('  Welcome to pmkit! Let\'s set up your configuration.');
  console.log('='.repeat(60) + '\n');

  // Profile setup
  console.log('📋 First, tell us about yourself and your product:\n');

  const userName = await prompt('Your name', config.getProfile().userName);
  const tenantName = await prompt('Your company name', config.getProfile().tenantName);
  const productName = await prompt('Your product name', config.getProfile().productName);

  config.setProfile({ userName, tenantName, productName });
  console.log('\n✓ Profile saved!\n');

  // API Key setup
  console.log('🔑 Now let\'s set up your API keys:\n');

  // OpenAI (required)
  console.log('OpenAI API Key is required to generate AI-powered content.');
  console.log('Get one at: https://platform.openai.com/api-keys\n');

  const openaiKey = await promptSecret('Enter your OpenAI API Key (starts with sk-)');
  if (openaiKey) {
    config.setApiKey('openai', openaiKey);
    console.log('✓ OpenAI API Key saved!\n');
  } else {
    console.log('⚠ No OpenAI key provided. pmkit will use stub responses.\n');
  }

  // Optional keys
  console.log('Optional: Set up additional API keys for more features?\n');
  const setupMore = await prompt('Set up crawler/integration keys? (y/N)', 'n');

  if (setupMore.toLowerCase() === 'y') {
    console.log('\n📡 AI Crawlers (for web/news research):\n');

    const serperKey = await promptSecret('Serper API Key (web search, https://serper.dev) - press Enter to skip');
    if (serperKey) config.setApiKey('serper', serperKey);

    const newsapiKey = await promptSecret('NewsAPI Key (news, https://newsapi.org) - press Enter to skip');
    if (newsapiKey) config.setApiKey('newsapi', newsapiKey);

    console.log('\n🔗 Integrations:\n');

    const linearKey = await promptSecret('Linear API Key (https://linear.app/settings/api) - press Enter to skip');
    if (linearKey) config.setApiKey('linear', linearKey);

    const notionKey = await promptSecret('Notion Integration Token (https://notion.so/my-integrations) - press Enter to skip');
    if (notionKey) config.setApiKey('notion', notionKey);

    const figmaKey = await promptSecret('Figma Access Token - press Enter to skip');
    if (figmaKey) config.setApiKey('figma', figmaKey);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('  Setup Complete!');
  console.log('='.repeat(60) + '\n');

  console.log('Your configuration has been saved to: ~/.pmkit/config.json\n');
  console.log('You can now run workflows:\n');
  console.log('  pmkit list              # See available workflows');
  console.log('  pmkit run daily-brief   # Run a workflow');
  console.log('  pmkit config            # Manage settings\n');

  const status = config.getApiKeysStatus();
  const configured = status.filter(s => s.configured);

  console.log(`API Keys configured: ${configured.length}/${status.length}`);
  configured.forEach(k => {
    console.log(`  ✓ ${k.name}: ${k.maskedValue}`);
  });

  console.log('');
}

/**
 * Display current settings
 */
export function showSettings(): void {
  const config = configManager;
  const profile = config.getProfile();
  const apiKeys = config.getApiKeysStatus();

  console.log('\n📋 Profile:\n');
  console.log(`  Name:    ${profile.userName}`);
  console.log(`  Company: ${profile.tenantName}`);
  console.log(`  Product: ${profile.productName}`);

  console.log('\n🔑 API Keys:\n');

  const categories = ['llm', 'crawler', 'integration'] as const;
  const categoryNames = {
    llm: 'LLM Providers',
    crawler: 'AI Crawlers',
    integration: 'Integrations',
  };

  for (const category of categories) {
    const keys = apiKeys.filter(k => k.category === category);
    console.log(`  ${categoryNames[category]}:`);
    for (const key of keys) {
      const status = key.configured ? '✓' : '○';
      const required = key.required ? ' (required)' : '';
      console.log(`    ${status} ${key.name}: ${key.maskedValue}${required}`);
    }
    console.log('');
  }

  console.log('⚙️  Settings:\n');
  console.log(`  Output directory: ${config.getConfig().outputDir}`);
  console.log(`  LLM Provider:     ${config.getConfig().llmProvider}`);
  console.log(`  Use stubs:        ${config.shouldUseStubs()}`);
  console.log(`  Config file:      ${CONFIG_FILE}`);
  console.log('');
}

// Export singleton
export const configManager = new ConfigManager();
