#!/usr/bin/env node
/**
 * pmkit CLI - Ad-hoc workflow runner for Product Managers
 *
 * Usage:
 *   pmkit run <workflow> [options]
 *   pmkit list
 *   pmkit history <workflow>
 *   pmkit stats [workflow]
 *   pmkit config
 *   pmkit scheduler start
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import type { WorkflowId } from '../lib/types.js';
import { WORKFLOWS } from '../lib/types.js';
import { PMKitStorage } from '../lib/storage.js';
import { configManager } from '../lib/config.js';
import { WorkflowRunner } from '../lib/runner.js';

const program = new Command();

// Initialize storage and runner
const config = configManager.getConfig();
const storage = new PMKitStorage({ baseDir: config.outputDir });
const runner = new WorkflowRunner({ config, storage });

program
  .name('pmkit')
  .description('PM-focused AI assistant - 10 autonomous workflows for Product Managers')
  .version('1.0.0');

// ============================================================================
// List Workflows Command
// ============================================================================

program
  .command('list')
  .description('List all available workflows')
  .action(() => {
    console.log(chalk.bold('\npmkit Workflows\n'));

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

    console.log(chalk.gray('\nRun a workflow: pmkit run <workflow-id> [options]\n'));
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
      console.log(chalk.gray('Run "pmkit list" to see available workflows.\n'));
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
      console.log(chalk.bold('\npmkit Workflow Statistics\n'));
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
// Config Command
// ============================================================================

program
  .command('config')
  .description('Show or update configuration')
  .option('--show', 'Show current config')
  .option('--set <key=value>', 'Set a config value')
  .option('--output-dir <path>', 'Set output directory')
  .option('--use-stubs <bool>', 'Use stub responses (true/false)')
  .option('--tenant-name <name>', 'Set tenant name')
  .option('--user-name <name>', 'Set user name')
  .action((options) => {
    const config = configManager.getConfig();

    if (options.outputDir) {
      configManager.updateConfig({ outputDir: options.outputDir });
      console.log(chalk.green(`\nOutput directory set to: ${options.outputDir}\n`));
      return;
    }

    if (options.useStubs !== undefined) {
      const useStubs = options.useStubs === 'true';
      configManager.updateConfig({ useStubs });
      console.log(chalk.green(`\nStub mode: ${useStubs ? 'enabled' : 'disabled'}\n`));
      return;
    }

    if (options.tenantName) {
      configManager.updateConfig({ tenantName: options.tenantName });
      console.log(chalk.green(`\nTenant name set to: ${options.tenantName}\n`));
      return;
    }

    if (options.userName) {
      configManager.updateConfig({ userName: options.userName });
      console.log(chalk.green(`\nUser name set to: ${options.userName}\n`));
      return;
    }

    // Default: show config
    console.log(chalk.bold('\npmkit Configuration\n'));
    console.log(chalk.gray('─'.repeat(40)));
    console.log(`Output Dir:    ${config.outputDir}`);
    console.log(`LLM Provider:  ${config.llmProvider}`);
    console.log(`Use Stubs:     ${config.useStubs}`);
    console.log(`Tenant:        ${config.tenantName}`);
    console.log(`User:          ${config.userName}`);
    console.log(chalk.gray('─'.repeat(40)));
    console.log(chalk.gray('\nConfig file: ~/.pmkit/config.json\n'));
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
    console.log(chalk.bold('\nStarting pmkit scheduler...\n'));
    console.log(chalk.gray('Run "pmkit scheduler status" to see scheduled workflows.'));
    console.log(chalk.gray('Press Ctrl+C to stop.\n'));

    // Import and start scheduler
    const { startScheduler } = await import('../scheduler/index.js');
    startScheduler();
  });

// Parse and run
program.parse();
