/**
 * Configuration management for pmkit-desktop
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { PMKitConfig, WorkflowId } from './types.js';
import { WORKFLOWS } from './types.js';

const CONFIG_DIR = path.join(os.homedir(), '.pmkit');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const DEFAULT_OUTPUT_DIR = path.join(os.homedir(), 'pmkit');

const DEFAULT_CONFIG: PMKitConfig = {
  outputDir: DEFAULT_OUTPUT_DIR,
  llmProvider: 'openai',
  useStubs: true, // Default to stubs for safety
  tenantId: 'demo',
  tenantName: 'Demo Company',
  productName: 'Demo Product',
  userName: 'Demo User',
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

  /**
   * Get LLM API key from environment
   */
  getApiKey(): string | undefined {
    const provider = this.config.llmProvider;

    switch (provider) {
      case 'openai':
        return process.env.OPENAI_API_KEY_DEMO || process.env.OPENAI_API_KEY;
      case 'anthropic':
        return process.env.ANTHROPIC_API_KEY;
      case 'google':
        return process.env.GOOGLE_API_KEY;
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

    // Fall back to config
    return this.config.useStubs;
  }
}

// Export singleton
export const configManager = new ConfigManager();
