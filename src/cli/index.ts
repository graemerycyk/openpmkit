#!/usr/bin/env node
/**
 * openpmkit CLI - Ad-hoc workflow runner for Product Managers
 *
 * Usage:
 *   openpmkit setup              # First-time setup wizard
 *   openpmkit run <workflow>     # Run a workflow
 *   openpmkit list               # List all workflows
 *   openpmkit settings           # Manage credentials & settings (BYOK)
 *   openpmkit scheduler start    # Start autonomous scheduler
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type { WorkflowId, CredentialCategory } from '../lib/types.js';
import { WORKFLOWS, CREDENTIALS, CREDENTIAL_CATEGORY_NAMES } from '../lib/types.js';
import { PMKitStorage } from '../lib/storage.js';
import { configManager, runSetupWizard, showSettings } from '../lib/config.js';
import { WorkflowRunner } from '../lib/runner.js';

// Get version from package.json
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.resolve(__dirname, '../../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const VERSION = packageJson.version;

const program = new Command();

// Initialize storage and runner
const config = configManager.getConfig();
const storage = new PMKitStorage({ baseDir: config.outputDir });
const runner = new WorkflowRunner({ config, storage });

// ============================================================================
// Setup Command (First-Time Wizard)
// ============================================================================

program
  .command('setup')
  .description('Run the first-time setup wizard')
  .action(async () => {
    await runSetupWizard();
  });

program
  .name('openpmkit')
  .description('PM-focused AI assistant - 10 autonomous workflows for Product Managers')
  .version(VERSION);

// ============================================================================
// List Workflows Command
// ============================================================================

program
  .command('list')
  .description('List all available workflows')
  .action(() => {
    // Check for first run
    if (configManager.isFirstRun()) {
      console.log(chalk.yellow('\n⚠️  openpmkit is not configured yet.'));
      console.log(chalk.gray('Run "openpmkit setup" to configure your API keys and profile.\n'));
    }

    console.log(chalk.bold('\nopenpmkit Workflows\n'));

    const categories = new Map<string, Array<{ id: WorkflowId; config: typeof WORKFLOWS[WorkflowId] }>>();

    for (const [id, config] of Object.entries(WORKFLOWS)) {
      const cat = config.category;
      if (!categories.has(cat)) {
        categories.set(cat, []);
      }
      categories.get(cat)!.push({ id: id as WorkflowId, config });
    }

    for (const [category, workflows] of categories) {
      console.log(chalk.cyan(`\n${category.toUpperCase()}`));
      console.log(chalk.gray('─'.repeat(40)));

      for (const { id, config } of workflows) {
        const scheduleInfo = config.schedule
          ? chalk.green(`[scheduled: ${config.schedule}]`)
          : chalk.yellow('[manual]');
        console.log(`  ${config.emoji}  ${chalk.bold(id.padEnd(16))} ${config.name}`);
        console.log(`      ${chalk.gray(config.description)}`);
        console.log(`      ${scheduleInfo}\n`);
      }
    }

    console.log(chalk.gray('\nRun a workflow: openpmkit run <workflow-id> [options]\n'));
  });

// ============================================================================
// Run Workflow Command
// ============================================================================

program
  .command('run <workflow>')
  .description('Run a workflow ad-hoc')
  .option('-p, --params <json>', 'JSON parameters for the workflow')
  .option('-o, --open', 'Open output file after completion')
  .option('-v, --verbose', 'Show verbose output')
  .action(async (workflowId: string, options) => {
    // Validate workflow ID
    if (!WORKFLOWS[workflowId as WorkflowId]) {
      console.error(chalk.red(`\nUnknown workflow: ${workflowId}`));
      console.log(chalk.gray('Run "openpmkit list" to see available workflows.\n'));
      process.exit(1);
    }

    const workflow = WORKFLOWS[workflowId as WorkflowId];
    const spinner = ora(`Running ${workflow.emoji} ${workflow.name}...`).start();

    // Parse params if provided
    let params: Record<string, unknown> | undefined;
    if (options.params) {
      try {
        params = JSON.parse(options.params);
      } catch {
        spinner.fail('Invalid JSON params');
        process.exit(1);
      }
    }

    try {
      const result = await runner.run({
        workflowId: workflowId as WorkflowId,
        params,
        triggerType: 'manual',
      });

      if (result.success) {
        spinner.succeed(`${workflow.emoji} ${workflow.name} completed`);

        console.log(chalk.gray('\n─'.repeat(40)));
        console.log(chalk.bold('\nOutput saved to:'));
        console.log(chalk.cyan(`  ${result.outputPath}\n`));

        if (options.verbose) {
          console.log(chalk.bold('Telemetry:'));
          console.log(chalk.gray(`  ${result.telemetryPath}`));
          console.log(chalk.gray(`  Duration: ${result.durationMs}ms`));
          console.log(chalk.gray(`  Model: ${result.model}`));
          console.log(chalk.gray(`  Stub: ${result.isStub ? 'Yes' : 'No'}\n`));
        }

        // Show preview
        console.log(chalk.bold('Preview:'));
        console.log(chalk.gray('─'.repeat(40)));
        const preview = result.content.slice(0, 500);
        console.log(preview + (result.content.length > 500 ? '\n...' : ''));
        console.log(chalk.gray('─'.repeat(40)));

        // Open file if requested
        if (options.open) {
          const { exec } = await import('child_process');
          exec(`open "${result.outputPath}"`);
        }
      } else {
        spinner.fail(`${workflow.emoji} ${workflow.name} failed`);
        console.error(chalk.red(`\nError: ${result.error}\n`));
        process.exit(1);
      }
    } catch (error) {
      spinner.fail('Workflow execution failed');
      console.error(chalk.red(`\n${error}\n`));
      process.exit(1);
    }
  });

// ============================================================================
// Run All Scheduled Workflows
// ============================================================================

program
  .command('run-all')
  .description('Run all scheduled workflows (useful for testing)')
  .option('--dry-run', 'Show what would run without executing')
  .action(async (options) => {
    const scheduled = configManager.getScheduledWorkflows();
    const enabledWorkflows = scheduled.filter(w => w.enabled || !w.enabled); // Run all for testing

    if (options.dryRun) {
      console.log(chalk.bold('\nWorkflows that would run:\n'));
      for (const { workflowId, schedule } of enabledWorkflows) {
        const wf = WORKFLOWS[workflowId];
        console.log(`  ${wf.emoji}  ${workflowId} (${schedule})`);
      }
      console.log();
      return;
    }

    console.log(chalk.bold(`\nRunning ${enabledWorkflows.length} workflows...\n`));

    for (const { workflowId } of enabledWorkflows) {
      const workflow = WORKFLOWS[workflowId];
      const spinner = ora(`${workflow.emoji} ${workflow.name}`).start();

      try {
        const result = await runner.run({
          workflowId,
          triggerType: 'scheduled',
        });

        if (result.success) {
          spinner.succeed(`${workflow.emoji} ${workflow.name} → ${result.outputPath}`);
        } else {
          spinner.fail(`${workflow.emoji} ${workflow.name}: ${result.error}`);
        }
      } catch (error) {
        spinner.fail(`${workflow.emoji} ${workflow.name}: ${error}`);
      }
    }

    console.log(chalk.green('\nAll workflows complete.\n'));
  });

// ============================================================================
// History Command
// ============================================================================

program
  .command('history <workflow>')
  .description('Show run history for a workflow')
  .option('-n, --limit <number>', 'Number of runs to show', '10')
  .action((workflowId: string, options) => {
    if (!WORKFLOWS[workflowId as WorkflowId]) {
      console.error(chalk.red(`\nUnknown workflow: ${workflowId}\n`));
      process.exit(1);
    }

    const workflow = WORKFLOWS[workflowId as WorkflowId];
    const runs = storage.listRuns(workflowId as WorkflowId);
    const limit = parseInt(options.limit, 10);

    console.log(chalk.bold(`\n${workflow.emoji} ${workflow.name} History\n`));

    if (runs.length === 0) {
      console.log(chalk.gray('No runs found.\n'));
      return;
    }

    const displayRuns = runs.slice(0, limit);
    console.log(chalk.gray('─'.repeat(60)));
    console.log(
      chalk.gray(
        'Timestamp'.padEnd(25) +
        'Duration'.padEnd(12) +
        'Status'.padEnd(10) +
        'Model'
      )
    );
    console.log(chalk.gray('─'.repeat(60)));

    for (const run of displayRuns) {
      const runPath = `${config.outputDir}/${workflowId}/${run}`;
      const telemetry = storage.readTelemetry(runPath);

      if (telemetry) {
        const timestamp = new Date(telemetry.timestamp).toLocaleString();
        const duration = `${telemetry.durationMs}ms`;
        const status = telemetry.success
          ? chalk.green('success')
          : chalk.red('failed');
        const model = telemetry.model;

        console.log(
          `${timestamp.padEnd(25)}${duration.padEnd(12)}${status.padEnd(18)}${model}`
        );
      }
    }

    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.gray(`\nShowing ${displayRuns.length} of ${runs.length} runs\n`));
  });

// ============================================================================
// Stats Command
// ============================================================================

program
  .command('stats [workflow]')
  .description('Show statistics for workflows')
  .action((workflowId?: string) => {
    if (workflowId) {
      if (!WORKFLOWS[workflowId as WorkflowId]) {
        console.error(chalk.red(`\nUnknown workflow: ${workflowId}\n`));
        process.exit(1);
      }

      const workflow = WORKFLOWS[workflowId as WorkflowId];
      const stats = storage.getWorkflowStats(workflowId as WorkflowId);

      console.log(chalk.bold(`\n${workflow.emoji} ${workflow.name} Statistics\n`));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(`Total Runs:      ${stats.totalRuns}`);
      console.log(`Successful:      ${chalk.green(stats.successfulRuns.toString())}`);
      console.log(`Failed:          ${chalk.red(stats.failedRuns.toString())}`);
      console.log(`Avg Duration:    ${Math.round(stats.avgDurationMs)}ms`);
      console.log(`Total Cost:      $${stats.totalCostUsd.toFixed(4)}`);
      console.log(chalk.gray('─'.repeat(40)));
      console.log();
    } else {
      // Show stats for all workflows
      console.log(chalk.bold('\nopenpmkit Workflow Statistics\n'));
      console.log(chalk.gray('─'.repeat(70)));
      console.log(
        chalk.gray(
          'Workflow'.padEnd(20) +
          'Runs'.padEnd(8) +
          'Success'.padEnd(10) +
          'Failed'.padEnd(10) +
          'Avg Time'.padEnd(12) +
          'Cost'
        )
      );
      console.log(chalk.gray('─'.repeat(70)));

      let totalRuns = 0;
      let totalCost = 0;

      for (const [id, wf] of Object.entries(WORKFLOWS)) {
        const stats = storage.getWorkflowStats(id as WorkflowId);
        totalRuns += stats.totalRuns;
        totalCost += stats.totalCostUsd;

        if (stats.totalRuns > 0) {
          console.log(
            `${wf.emoji} ${id.padEnd(17)}` +
            `${stats.totalRuns.toString().padEnd(8)}` +
            `${chalk.green(stats.successfulRuns.toString().padEnd(10))}` +
            `${chalk.red(stats.failedRuns.toString().padEnd(10))}` +
            `${Math.round(stats.avgDurationMs).toString().padEnd(12)}ms` +
            `$${stats.totalCostUsd.toFixed(4)}`
          );
        }
      }

      console.log(chalk.gray('─'.repeat(70)));
      console.log(
        chalk.bold(
          `${'TOTAL'.padEnd(20)}${totalRuns.toString().padEnd(8)}` +
          `${' '.repeat(32)}$${totalCost.toFixed(4)}`
        )
      );
      console.log();
    }
  });

// ============================================================================
// Settings Command (Unified BYOK Credential Management)
// ============================================================================

const settingsCmd = program
  .command('settings')
  .description('Manage credentials and settings (BYOK - Bring Your Own Key)');

// Default action: show settings
settingsCmd
  .action(() => {
    showSettings();
  });

// Show all settings
settingsCmd
  .command('show')
  .description('Show all settings and credentials')
  .action(() => {
    showSettings();
  });

// Set a credential (API key, token, etc.)
settingsCmd
  .command('set <name> <value>')
  .description('Set a credential (e.g., openai, linear, slack)')
  .action((name: string, value: string) => {
    const validKeys = CREDENTIALS.map(k => k.key);
    if (!validKeys.includes(name as any)) {
      console.error(chalk.red(`\nUnknown credential: ${name}`));
      console.log(chalk.gray(`\nValid credentials:\n`));

      const categories: CredentialCategory[] = ['ai', 'crawler', 'integration', 'connector'];
      for (const category of categories) {
        const categoryCredentials = CREDENTIALS.filter(c => c.category === category);
        console.log(chalk.cyan(`  ${CREDENTIAL_CATEGORY_NAMES[category]}:`));
        console.log(chalk.gray(`    ${categoryCredentials.map(c => c.key).join(', ')}\n`));
      }
      process.exit(1);
    }

    configManager.setCredential(name as any, value);
    const credential = CREDENTIALS.find(c => c.key === name);
    console.log(chalk.green(`\n✓ ${credential?.emoji || ''} ${credential?.name || name} saved\n`));
  });

// Remove a credential
settingsCmd
  .command('remove <name>')
  .description('Remove a credential')
  .action((name: string) => {
    configManager.removeCredential(name as any);
    console.log(chalk.yellow(`\n✓ ${name} removed\n`));
  });

// List all credentials with status
settingsCmd
  .command('list')
  .description('List all credentials and their status')
  .action(() => {
    const credentials = configManager.getCredentialsStatus();

    console.log(chalk.bold('\n🔑 All Credentials (BYOK - Bring Your Own Key)\n'));

    const categories: CredentialCategory[] = ['ai', 'crawler', 'integration', 'connector'];

    for (const category of categories) {
      const categoryCredentials = credentials.filter(c => c.category === category);
      const configuredCount = categoryCredentials.filter(c => c.configured).length;

      console.log(chalk.cyan(`  ${CREDENTIAL_CATEGORY_NAMES[category]} (${configuredCount}/${categoryCredentials.length}):`));

      for (const cred of categoryCredentials) {
        const status = cred.configured ? chalk.green('✓') : chalk.gray('○');
        const required = cred.required ? chalk.yellow(' (required)') : '';
        console.log(`    ${status} ${cred.emoji} ${cred.name.padEnd(20)} ${cred.maskedValue}${required}`);
      }
      console.log('');
    }

    console.log(chalk.gray('  Set a credential:    openpmkit settings set <name> <value>'));
    console.log(chalk.gray('  Example:             openpmkit settings set openai sk-...\n'));
  });

// Set profile
settingsCmd
  .command('profile')
  .description('View or update your profile information')
  .option('--name <name>', 'Your name')
  .option('--company <company>', 'Your company name')
  .option('--product <product>', 'Your product name')
  .action((options) => {
    if (options.name) {
      configManager.setProfile({ userName: options.name });
      console.log(chalk.green(`\n✓ Name set to: ${options.name}`));
    }
    if (options.company) {
      configManager.setProfile({ tenantName: options.company });
      console.log(chalk.green(`✓ Company set to: ${options.company}`));
    }
    if (options.product) {
      configManager.setProfile({ productName: options.product });
      console.log(chalk.green(`✓ Product set to: ${options.product}`));
    }
    if (!options.name && !options.company && !options.product) {
      const profile = configManager.getProfile();
      console.log(chalk.bold('\n📋 Current Profile\n'));
      console.log(`  Name:    ${profile.userName}`);
      console.log(`  Company: ${profile.tenantName}`);
      console.log(`  Product: ${profile.productName}\n`);
    } else {
      console.log('');
    }
  });

// Toggle stubs
settingsCmd
  .command('stubs <enabled>')
  .description('Enable or disable stub responses (true/false)')
  .action((enabled: string) => {
    const useStubs = enabled === 'true';
    configManager.updateConfig({ useStubs });
    console.log(chalk.green(`\n✓ Stub mode: ${useStubs ? 'enabled' : 'disabled'}\n`));
  });

// Set output directory
settingsCmd
  .command('output <path>')
  .description('Set the output directory for workflow results')
  .action((dirPath: string) => {
    configManager.updateConfig({ outputDir: dirPath });
    console.log(chalk.green(`\n✓ Output directory set to: ${dirPath}\n`));
  });

// Reset settings
settingsCmd
  .command('reset')
  .description('Reset all settings to defaults')
  .action(async () => {
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(chalk.yellow('\nAre you sure you want to reset all settings? (y/N): '), (answer) => {
      rl.close();
      if (answer.toLowerCase() === 'y') {
        // Delete the config file
        const os = require('os');
        const pathModule = require('path');
        const configPath = pathModule.join(os.homedir(), '.openpmkit', 'config.json');
        if (fs.existsSync(configPath)) {
          fs.unlinkSync(configPath);
        }
        console.log(chalk.green('\n✓ Settings reset. Run "openpmkit setup" to reconfigure.\n'));
      } else {
        console.log(chalk.gray('\nReset cancelled.\n'));
      }
    });
  });

// Legacy alias for 'config' command (backwards compatibility)
program
  .command('config')
  .description('Alias for "settings" command')
  .action(() => {
    console.log(chalk.yellow('\n💡 Tip: Use "openpmkit settings" instead of "openpmkit config"\n'));
    showSettings();
  });

// ============================================================================
// Open Latest Command
// ============================================================================

program
  .command('open <workflow>')
  .description('Open the latest output for a workflow')
  .action(async (workflowId: string) => {
    if (!WORKFLOWS[workflowId as WorkflowId]) {
      console.error(chalk.red(`\nUnknown workflow: ${workflowId}\n`));
      process.exit(1);
    }

    const latestRun = storage.getLatestRun(workflowId as WorkflowId);
    if (!latestRun) {
      console.log(chalk.yellow(`\nNo runs found for ${workflowId}\n`));
      return;
    }

    const output = storage.readOutput(latestRun);
    if (!output) {
      console.log(chalk.yellow(`\nNo output found for latest run\n`));
      return;
    }

    // Find the output file
    const files = fs.readdirSync(latestRun);
    const outputFile = files.find(f => f.endsWith('.md') || f.endsWith('.html'));

    if (outputFile) {
      const outputPath = `${latestRun}/${outputFile}`;
      console.log(chalk.cyan(`\nOpening: ${outputPath}\n`));

      const { exec } = await import('child_process');
      exec(`open "${outputPath}"`);
    }
  });

// ============================================================================
// Scheduler Commands
// ============================================================================

const schedulerCmd = program
  .command('scheduler')
  .description('Manage the autonomous scheduler');

schedulerCmd
  .command('status')
  .description('Show scheduler status')
  .action(() => {
    const config = configManager.getConfig();
    const scheduled = configManager.getScheduledWorkflows();

    console.log(chalk.bold('\nScheduler Status\n'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(`Enabled:  ${config.scheduler?.enabled ? chalk.green('Yes') : chalk.yellow('No')}`);
    console.log(`Timezone: ${config.scheduler?.timezone || 'America/Los_Angeles'}`);
    console.log(chalk.gray('─'.repeat(50)));

    console.log(chalk.bold('\nScheduled Workflows:\n'));
    for (const { workflowId, schedule, enabled } of scheduled) {
      const wf = WORKFLOWS[workflowId];
      const status = enabled ? chalk.green('enabled') : chalk.gray('disabled');
      console.log(`  ${wf.emoji}  ${workflowId.padEnd(16)} ${schedule.padEnd(16)} ${status}`);
    }
    console.log();
  });

schedulerCmd
  .command('enable <workflow>')
  .description('Enable scheduled runs for a workflow')
  .action((workflowId: string) => {
    if (!WORKFLOWS[workflowId as WorkflowId]) {
      console.error(chalk.red(`\nUnknown workflow: ${workflowId}\n`));
      process.exit(1);
    }

    configManager.setWorkflowScheduleEnabled(workflowId as WorkflowId, true);
    console.log(chalk.green(`\nEnabled schedule for ${workflowId}\n`));
  });

schedulerCmd
  .command('disable <workflow>')
  .description('Disable scheduled runs for a workflow')
  .action((workflowId: string) => {
    if (!WORKFLOWS[workflowId as WorkflowId]) {
      console.error(chalk.red(`\nUnknown workflow: ${workflowId}\n`));
      process.exit(1);
    }

    configManager.setWorkflowScheduleEnabled(workflowId as WorkflowId, false);
    console.log(chalk.yellow(`\nDisabled schedule for ${workflowId}\n`));
  });

schedulerCmd
  .command('set-schedule <workflow> <cron>')
  .description('Set custom schedule for a workflow (cron format)')
  .action((workflowId: string, cron: string) => {
    if (!WORKFLOWS[workflowId as WorkflowId]) {
      console.error(chalk.red(`\nUnknown workflow: ${workflowId}\n`));
      process.exit(1);
    }

    configManager.setWorkflowSchedule(workflowId as WorkflowId, cron);
    console.log(chalk.green(`\nSchedule set for ${workflowId}: ${cron}\n`));
  });

schedulerCmd
  .command('start')
  .description('Start the scheduler daemon')
  .action(async () => {
    console.log(chalk.bold('\nStarting openpmkit scheduler...\n'));
    console.log(chalk.gray('Run "openpmkit scheduler status" to see scheduled workflows.'));
    console.log(chalk.gray('Press Ctrl+C to stop.\n'));

    // Import and start scheduler
    const { startScheduler } = await import('../scheduler/index.js');
    startScheduler();
  });

// Parse and run
program.parse();
