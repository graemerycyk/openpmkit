/**
 * Configuration management for openpmkit-desktop
 *
 * User-friendly settings system that stores all credentials and preferences
 * in ~/.openpmkit/config.json instead of requiring .env files.
 *
 * This is a BYOK (Bring Your Own Key) platform - each user manages their own
 * API keys and tokens for all services (AI, crawlers, integrations, connectors).
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as readline from 'readline';
import type { PMKitConfig, WorkflowId, CredentialInfo, CredentialCategory } from './types.js';
import { WORKFLOWS, CREDENTIALS, CREDENTIAL_CATEGORY_NAMES, getCredentialsByCategory } from './types.js';

const CONFIG_DIR = path.join(os.homedir(), '.openopenpmkit');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const DEFAULT_OUTPUT_DIR = path.join(os.homedir(), 'openopenpmkit');

const DEFAULT_CONFIG: PMKitConfig = {
  outputDir: DEFAULT_OUTPUT_DIR,
  llmProvider: 'openai',
  useStubs: true, // Default to stubs for safety
  tenantId: 'demo',
  tenantName: 'My Company',
  productName: 'My Product',
  userName: 'Product Manager',
  credentials: {},
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
  // Credential Management (BYOK - Bring Your Own Key)
  // ============================================================================

  /**
   * Set a credential (API key, token, etc.)
   */
  setCredential(key: keyof NonNullable<PMKitConfig['credentials']>, value: string): void {
    if (!this.config.credentials) {
      this.config.credentials = {};
    }
    this.config.credentials[key] = value;

    // If setting OpenAI key, automatically disable stubs
    if (key === 'openai' && value) {
      this.config.useStubs = false;
    }

    this.saveConfig(this.config);
  }

  /**
   * Get a credential from config (falls back to environment variables)
   */
  getCredential(key: keyof NonNullable<PMKitConfig['credentials']>): string | undefined {
    // First check credentials (new)
    const credValue = this.config.credentials?.[key];
    if (credValue) return credValue;

    // Check legacy apiKeys for backwards compatibility
    const legacyValue = this.config.apiKeys?.[key as keyof NonNullable<PMKitConfig['apiKeys']>];
    if (legacyValue) return legacyValue;

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
      slack: process.env.SLACK_TOKEN,
      jira: process.env.JIRA_API_TOKEN,
      jiraEmail: process.env.JIRA_EMAIL,
      jiraUrl: process.env.JIRA_URL,
      confluence: process.env.CONFLUENCE_API_TOKEN,
      confluenceEmail: process.env.CONFLUENCE_EMAIL,
      confluenceUrl: process.env.CONFLUENCE_URL,
      gmail: process.env.GMAIL_ACCESS_TOKEN,
      googleCalendar: process.env.GOOGLE_CALENDAR_TOKEN,
      googleDrive: process.env.GOOGLE_DRIVE_TOKEN,
      zendesk: process.env.ZENDESK_API_TOKEN,
      zendeskEmail: process.env.ZENDESK_EMAIL,
      zendeskSubdomain: process.env.ZENDESK_SUBDOMAIN,
    };

    return envMap[key];
  }

  /**
   * Remove a credential from config
   */
  removeCredential(key: keyof NonNullable<PMKitConfig['credentials']>): void {
    if (this.config.credentials) {
      delete this.config.credentials[key];
      this.saveConfig(this.config);
    }
  }

  /**
   * Get all credentials status (masked for display)
   */
  getCredentialsStatus(): Array<{
    key: string;
    name: string;
    configured: boolean;
    maskedValue: string;
    category: CredentialCategory;
    required: boolean;
    emoji: string;
    helpUrl: string;
  }> {
    return CREDENTIALS.map((info) => {
      const value = this.getCredential(info.key);
      return {
        key: info.key,
        name: info.name,
        configured: !!value,
        maskedValue: value ? maskCredential(value) : '(not set)',
        category: info.category,
        required: info.required,
        emoji: info.emoji,
        helpUrl: info.helpUrl,
      };
    });
  }

  /**
   * Get credentials by category
   */
  getCredentialsByCategory(category: CredentialCategory): ReturnType<typeof this.getCredentialsStatus> {
    return this.getCredentialsStatus().filter(c => c.category === category);
  }

  /**
   * Get LLM API key based on current provider
   */
  getLLMKey(): string | undefined {
    const provider = this.config.llmProvider;

    switch (provider) {
      case 'openai':
        return this.getCredential('openai');
      case 'anthropic':
        return this.getCredential('anthropic');
      case 'google':
        return this.getCredential('google');
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

    // If no LLM key is configured, use stubs
    if (!this.getLLMKey()) {
      return true;
    }

    // Fall back to config
    return this.config.useStubs;
  }

  /**
   * Check if this is the first run (no config file exists or no OpenAI key)
   */
  isFirstRun(): boolean {
    return !fs.existsSync(CONFIG_FILE) || !this.getCredential('openai');
  }

  /**
   * Check if required credentials are configured
   */
  hasRequiredCredentials(): boolean {
    return !!this.getLLMKey();
  }

  // Legacy methods for backwards compatibility
  setApiKey(key: keyof NonNullable<PMKitConfig['credentials']>, value: string): void {
    this.setCredential(key, value);
  }

  getApiKeyValue(key: keyof NonNullable<PMKitConfig['credentials']>): string | undefined {
    return this.getCredential(key);
  }

  removeApiKey(key: keyof NonNullable<PMKitConfig['credentials']>): void {
    this.removeCredential(key);
  }

  getApiKeysStatus() {
    return this.getCredentialsStatus();
  }

  getApiKey(): string | undefined {
    return this.getLLMKey();
  }

  hasRequiredApiKeys(): boolean {
    return this.hasRequiredCredentials();
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
 * Mask a credential for display (show first 4 and last 4 chars)
 */
function maskCredential(key: string): string {
  if (key.length <= 12) {
    return '*'.repeat(key.length);
  }
  return `${key.slice(0, 4)}${'*'.repeat(key.length - 8)}${key.slice(-4)}`;
}

// Legacy alias
const maskApiKey = maskCredential;

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
  console.log('  Welcome to openpmkit! Let\'s set up your configuration.');
  console.log('='.repeat(60) + '\n');

  // Profile setup
  console.log('📋 First, tell us about yourself and your product:\n');

  const userName = await prompt('Your name', config.getProfile().userName);
  const tenantName = await prompt('Your company name', config.getProfile().tenantName);
  const productName = await prompt('Your product name', config.getProfile().productName);

  config.setProfile({ userName, tenantName, productName });
  console.log('\n✓ Profile saved!\n');

  // Credential setup
  console.log('🔑 Now let\'s set up your credentials:\n');
  console.log('openpmkit is a BYOK (Bring Your Own Key) platform.');
  console.log('You provide your own API keys - they\'re stored locally.\n');

  // OpenAI (required)
  console.log('🤖 OpenAI API Key is required to generate AI-powered content.');
  console.log('   Get one at: https://platform.openai.com/api-keys\n');

  const openaiKey = await promptSecret('Enter your OpenAI API Key (starts with sk-)');
  if (openaiKey) {
    config.setCredential('openai', openaiKey);
    console.log('✓ OpenAI API Key saved!\n');
  } else {
    console.log('⚠ No OpenAI key provided. openpmkit will use stub responses.\n');
  }

  // Optional: Set up more credentials
  console.log('Would you like to set up additional credentials?\n');
  const setupMore = await prompt('Set up crawlers, integrations, or data connectors? (y/N)', 'n');

  if (setupMore.toLowerCase() === 'y') {
    // Crawlers
    console.log('\n🔍 Research Crawlers (for competitor/market research):\n');

    const serperKey = await promptSecret('Serper API Key (web search) - press Enter to skip');
    if (serperKey) config.setCredential('serper', serperKey);

    const newsapiKey = await promptSecret('NewsAPI Key (news) - press Enter to skip');
    if (newsapiKey) config.setCredential('newsapi', newsapiKey);

    // Integrations
    console.log('\n🔗 Integrations (PM tools):\n');

    const linearKey = await promptSecret('Linear API Key - press Enter to skip');
    if (linearKey) config.setCredential('linear', linearKey);

    const notionKey = await promptSecret('Notion Integration Token - press Enter to skip');
    if (notionKey) config.setCredential('notion', notionKey);

    const figmaKey = await promptSecret('Figma Access Token - press Enter to skip');
    if (figmaKey) config.setCredential('figma', figmaKey);

    // Data connectors
    console.log('\n📊 Data Connectors (for daily briefs, etc.):\n');

    const slackKey = await promptSecret('Slack Bot Token - press Enter to skip');
    if (slackKey) config.setCredential('slack', slackKey);

    const jiraKey = await promptSecret('Jira API Token - press Enter to skip');
    if (jiraKey) {
      config.setCredential('jira', jiraKey);
      const jiraEmail = await prompt('Jira Email');
      if (jiraEmail) config.setCredential('jiraEmail', jiraEmail);
      const jiraUrl = await prompt('Jira URL (e.g., https://yourcompany.atlassian.net)');
      if (jiraUrl) config.setCredential('jiraUrl', jiraUrl);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('  Setup Complete!');
  console.log('='.repeat(60) + '\n');

  console.log('Your configuration has been saved to: ~/.openpmkit/config.json\n');
  console.log('You can now run workflows:\n');
  console.log('  openpmkit list                    # See available workflows');
  console.log('  openpmkit run daily-brief         # Run a workflow');
  console.log('  openpmkit settings                # View/edit all settings\n');

  const status = config.getCredentialsStatus();
  const configured = status.filter(s => s.configured);

  console.log(`Credentials configured: ${configured.length}/${status.length}`);
  configured.forEach(k => {
    console.log(`  ${k.emoji} ${k.name}: ${k.maskedValue}`);
  });

  console.log('\nTo add more credentials later: openpmkit settings\n');
}

/**
 * Display current settings (unified view)
 */
export function showSettings(): void {
  const config = configManager;
  const profile = config.getProfile();
  const credentials = config.getCredentialsStatus();

  console.log('\n' + '='.repeat(60));
  console.log('  openpmkit Settings');
  console.log('='.repeat(60));

  // Profile
  console.log('\n📋 Profile:\n');
  console.log(`  Name:    ${profile.userName}`);
  console.log(`  Company: ${profile.tenantName}`);
  console.log(`  Product: ${profile.productName}`);

  // Credentials by category
  console.log('\n🔑 Credentials:\n');

  const categories: CredentialCategory[] = ['ai', 'crawler', 'integration', 'connector'];

  for (const category of categories) {
    const categoryCredentials = credentials.filter(c => c.category === category);
    const configuredCount = categoryCredentials.filter(c => c.configured).length;
    const categoryName = CREDENTIAL_CATEGORY_NAMES[category];

    console.log(`  ${categoryName} (${configuredCount}/${categoryCredentials.length} configured):`);

    for (const cred of categoryCredentials) {
      const status = cred.configured ? '✓' : '○';
      const required = cred.required ? ' (required)' : '';
      console.log(`    ${status} ${cred.emoji} ${cred.name.padEnd(18)} ${cred.maskedValue}${required}`);
    }
    console.log('');
  }

  // General settings
  console.log('⚙️  General Settings:\n');
  console.log(`  Output directory: ${config.getConfig().outputDir}`);
  console.log(`  LLM Provider:     ${config.getConfig().llmProvider}`);
  console.log(`  Use stubs:        ${config.shouldUseStubs()}`);
  console.log(`  Config file:      ${CONFIG_FILE}`);

  // Help
  console.log('\n💡 Commands:\n');
  console.log('  openpmkit settings set <key> <value>    # Set a credential');
  console.log('  openpmkit settings remove <key>         # Remove a credential');
  console.log('  openpmkit settings list                 # List all credentials');
  console.log('  openpmkit settings profile              # View/update profile');
  console.log('  openpmkit settings reset                # Reset all settings');
  console.log('');
}

// Export singleton
export const configManager = new ConfigManager();
