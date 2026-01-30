/**
 * pmkit-desktop
 *
 * PM-focused AI assistant - 10 autonomous workflows for Product Managers
 *
 * @example
 * ```typescript
 * import { WorkflowRunner, PMKitStorage, configManager, WORKFLOWS } from 'pmkit-desktop';
 *
 * const config = configManager.getConfig();
 * const storage = new PMKitStorage({ baseDir: config.outputDir });
 * const runner = new WorkflowRunner({ config, storage });
 *
 * // Run a workflow
 * const result = await runner.run({
 *   workflowId: 'daily-brief',
 *   triggerType: 'manual',
 * });
 *
 * console.log(result.outputPath);
 * ```
 */

// Types
export type {
  WorkflowId,
  WorkflowConfig,
  WorkflowRunInput,
  WorkflowRunResult,
  TelemetryRecord,
  PMKitConfig,
} from './lib/types.js';

export { WORKFLOWS } from './lib/types.js';

// Storage
export { PMKitStorage } from './lib/storage.js';
export type { StorageOptions } from './lib/storage.js';

// Config
export { configManager, ConfigManager } from './lib/config.js';

// Runner
export { WorkflowRunner } from './lib/runner.js';
export type { RunnerOptions } from './lib/runner.js';

// Scheduler
export { startScheduler, stopScheduler, runScheduledWorkflows } from './scheduler/index.js';
