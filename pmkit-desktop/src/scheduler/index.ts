/**
 * Autonomous scheduler for pmkit-desktop
 *
 * Runs workflows on cron-like schedules for fully autonomous operation.
 */

import cron from 'node-cron';
import chalk from 'chalk';
import type { WorkflowId } from '../lib/types.js';
import { WORKFLOWS } from '../lib/types.js';
import { PMKitStorage } from '../lib/storage.js';
import { configManager } from '../lib/config.js';
import { WorkflowRunner } from '../lib/runner.js';

interface ScheduledJob {
  workflowId: WorkflowId;
  schedule: string;
  task: cron.ScheduledTask;
}

const scheduledJobs: ScheduledJob[] = [];

/**
 * Start the scheduler
 */
export function startScheduler(): void {
  const config = configManager.getConfig();
  const storage = new PMKitStorage({ baseDir: config.outputDir });
  const runner = new WorkflowRunner({ config, storage });

  const scheduledWorkflows = configManager.getScheduledWorkflows();

  console.log(chalk.bold('pmkit Scheduler Starting\n'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(`Timezone: ${config.scheduler?.timezone || 'system default'}`);
  console.log(`Output:   ${config.outputDir}`);
  console.log(chalk.gray('─'.repeat(50)));
  console.log();

  let activeCount = 0;

  for (const { workflowId, schedule, enabled } of scheduledWorkflows) {
    if (!enabled) {
      console.log(
        chalk.gray(`  ⏸  ${workflowId.padEnd(16)} ${schedule.padEnd(16)} (disabled)`)
      );
      continue;
    }

    // Validate cron expression
    if (!cron.validate(schedule)) {
      console.log(
        chalk.red(`  ✗  ${workflowId.padEnd(16)} Invalid cron: ${schedule}`)
      );
      continue;
    }

    const workflow = WORKFLOWS[workflowId];

    // Create scheduled task
    const task = cron.schedule(
      schedule,
      async () => {
        const timestamp = new Date().toLocaleString();
        console.log(
          chalk.cyan(`\n[${timestamp}] Running ${workflow.emoji} ${workflow.name}...`)
        );

        try {
          const result = await runner.run({
            workflowId,
            triggerType: 'scheduled',
          });

          if (result.success) {
            console.log(
              chalk.green(`[${timestamp}] ✓ ${workflow.name} completed`)
            );
            console.log(chalk.gray(`  Output: ${result.outputPath}`));
          } else {
            console.log(
              chalk.red(`[${timestamp}] ✗ ${workflow.name} failed: ${result.error}`)
            );
          }
        } catch (error) {
          console.log(
            chalk.red(`[${timestamp}] ✗ ${workflow.name} error: ${error}`)
          );
        }
      },
      {
        timezone: config.scheduler?.timezone,
      }
    );

    scheduledJobs.push({ workflowId, schedule, task });
    activeCount++;

    console.log(
      chalk.green(`  ✓  ${workflowId.padEnd(16)} ${schedule.padEnd(16)} ${workflow.name}`)
    );
  }

  console.log(chalk.gray('\n─'.repeat(50)));
  console.log(chalk.bold(`\n${activeCount} workflows scheduled\n`));

  if (activeCount === 0) {
    console.log(chalk.yellow('No workflows are enabled for scheduling.'));
    console.log(chalk.gray('Enable workflows with: pmkit scheduler enable <workflow>\n'));
    return;
  }

  console.log(chalk.gray('Scheduler is running. Press Ctrl+C to stop.\n'));

  // Show next run times
  showNextRuns();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\nShutting down scheduler...'));
    stopScheduler();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log(chalk.yellow('\nShutting down scheduler...'));
    stopScheduler();
    process.exit(0);
  });
}

/**
 * Stop all scheduled jobs
 */
export function stopScheduler(): void {
  for (const job of scheduledJobs) {
    job.task.stop();
  }
  scheduledJobs.length = 0;
  console.log(chalk.gray('All scheduled jobs stopped.'));
}

/**
 * Show next scheduled run times
 */
function showNextRuns(): void {
  console.log(chalk.bold('Next scheduled runs:'));
  console.log(chalk.gray('─'.repeat(50)));

  const now = new Date();

  for (const { workflowId, schedule } of scheduledJobs) {
    const workflow = WORKFLOWS[workflowId];
    const nextRun = getNextCronDate(schedule, now);

    if (nextRun) {
      const diff = nextRun.getTime() - now.getTime();
      const minutes = Math.round(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;

      let timeStr: string;
      if (hours > 0) {
        timeStr = `in ${hours}h ${mins}m`;
      } else {
        timeStr = `in ${mins}m`;
      }

      console.log(
        `  ${workflow.emoji}  ${workflowId.padEnd(16)} ${nextRun.toLocaleString().padEnd(25)} (${timeStr})`
      );
    }
  }
  console.log(chalk.gray('─'.repeat(50)));
  console.log();
}

/**
 * Calculate next cron date (simplified)
 */
function getNextCronDate(cronExpression: string, from: Date): Date | null {
  // Parse cron expression: minute hour dayOfMonth month dayOfWeek
  const parts = cronExpression.split(' ');
  if (parts.length !== 5) return null;

  const [minuteStr, hourStr, _dayStr, _monthStr, _dowStr] = parts;

  // Simple parsing for common cases
  const minute = minuteStr === '*' ? from.getMinutes() : parseInt(minuteStr, 10);
  const hour = hourStr === '*' ? from.getHours() : parseInt(hourStr, 10);

  const next = new Date(from);
  next.setSeconds(0);
  next.setMilliseconds(0);
  next.setMinutes(minute);
  next.setHours(hour);

  // If the time has passed today, move to tomorrow
  if (next <= from) {
    next.setDate(next.getDate() + 1);
  }

  return next;
}

/**
 * Run a one-off scheduled check (for testing)
 */
export async function runScheduledWorkflows(): Promise<void> {
  const config = configManager.getConfig();
  const storage = new PMKitStorage({ baseDir: config.outputDir });
  const runner = new WorkflowRunner({ config, storage });

  const scheduledWorkflows = configManager.getScheduledWorkflows();

  for (const { workflowId, enabled } of scheduledWorkflows) {
    if (!enabled) continue;

    const workflow = WORKFLOWS[workflowId];
    console.log(`Running ${workflow.emoji} ${workflow.name}...`);

    try {
      const result = await runner.run({
        workflowId,
        triggerType: 'scheduled',
      });

      if (result.success) {
        console.log(`  ✓ Output: ${result.outputPath}`);
      } else {
        console.log(`  ✗ Error: ${result.error}`);
      }
    } catch (error) {
      console.log(`  ✗ Error: ${error}`);
    }
  }
}

// If run directly, start the scheduler
if (import.meta.url === `file://${process.argv[1]}`) {
  startScheduler();
}
