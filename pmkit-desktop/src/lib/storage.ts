/**
 * Storage system for pmkit-desktop
 *
 * Saves workflow outputs to: pmkit/{agent-name}/{timestamp}/
 * - output.md (or output.html for prototypes)
 * - telemetry.json
 */

import * as fs from 'fs';
import * as path from 'path';
import type { WorkflowId, WorkflowRunResult, TelemetryRecord } from './types.js';
import { WORKFLOWS } from './types.js';

export interface StorageOptions {
  baseDir: string;
}

export class PMKitStorage {
  private baseDir: string;

  constructor(options: StorageOptions) {
    this.baseDir = options.baseDir;
    this.ensureBaseDir();
  }

  private ensureBaseDir(): void {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  /**
   * Generate a timestamp-based directory path for a workflow run
   */
  generateRunPath(workflowId: WorkflowId): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return path.join(this.baseDir, workflowId, timestamp);
  }

  /**
   * Save workflow output (markdown or HTML)
   */
  saveOutput(
    runPath: string,
    workflowId: WorkflowId,
    content: string,
    filename?: string
  ): string {
    // Ensure directory exists
    if (!fs.existsSync(runPath)) {
      fs.mkdirSync(runPath, { recursive: true });
    }

    // Determine file extension based on workflow
    const isHtml = workflowId === 'prototype';
    const defaultFilename = isHtml ? 'output.html' : 'output.md';
    const outputFilename = filename || defaultFilename;
    const outputPath = path.join(runPath, outputFilename);

    fs.writeFileSync(outputPath, content, 'utf-8');
    return outputPath;
  }

  /**
   * Save SIEM telemetry data
   */
  saveTelemetry(runPath: string, telemetry: TelemetryRecord): string {
    // Ensure directory exists
    if (!fs.existsSync(runPath)) {
      fs.mkdirSync(runPath, { recursive: true });
    }

    const telemetryPath = path.join(runPath, 'telemetry.json');
    fs.writeFileSync(telemetryPath, JSON.stringify(telemetry, null, 2), 'utf-8');
    return telemetryPath;
  }

  /**
   * Create a telemetry record from a workflow run result
   */
  createTelemetryRecord(
    result: WorkflowRunResult,
    triggerType: 'manual' | 'scheduled',
    params?: Record<string, unknown>
  ): TelemetryRecord {
    const workflow = WORKFLOWS[result.workflowId];

    return {
      timestamp: result.startedAt.toISOString(),
      workflowId: result.workflowId,
      workflowName: workflow.name,
      triggerType,
      success: result.success,
      durationMs: result.durationMs,
      model: result.model,
      usage: result.usage,
      estimatedCostUsd: result.estimatedCostUsd,
      isStub: result.isStub,
      outputPath: result.outputPath,
      params,
      error: result.error,
      environment: {
        platform: process.platform,
        nodeVersion: process.version,
        pmkitVersion: '1.0.0',
      },
    };
  }

  /**
   * List all runs for a workflow
   */
  listRuns(workflowId: WorkflowId): string[] {
    const workflowDir = path.join(this.baseDir, workflowId);
    if (!fs.existsSync(workflowDir)) {
      return [];
    }

    return fs.readdirSync(workflowDir)
      .filter(name => {
        const stat = fs.statSync(path.join(workflowDir, name));
        return stat.isDirectory();
      })
      .sort()
      .reverse(); // Most recent first
  }

  /**
   * Get the latest run for a workflow
   */
  getLatestRun(workflowId: WorkflowId): string | null {
    const runs = this.listRuns(workflowId);
    return runs.length > 0 ? path.join(this.baseDir, workflowId, runs[0]) : null;
  }

  /**
   * Read output from a run
   */
  readOutput(runPath: string): string | null {
    // Try markdown first, then HTML
    const mdPath = path.join(runPath, 'output.md');
    const htmlPath = path.join(runPath, 'output.html');

    if (fs.existsSync(mdPath)) {
      return fs.readFileSync(mdPath, 'utf-8');
    }
    if (fs.existsSync(htmlPath)) {
      return fs.readFileSync(htmlPath, 'utf-8');
    }
    return null;
  }

  /**
   * Read telemetry from a run
   */
  readTelemetry(runPath: string): TelemetryRecord | null {
    const telemetryPath = path.join(runPath, 'telemetry.json');
    if (!fs.existsSync(telemetryPath)) {
      return null;
    }

    const content = fs.readFileSync(telemetryPath, 'utf-8');
    return JSON.parse(content) as TelemetryRecord;
  }

  /**
   * Get aggregated telemetry for all runs of a workflow
   */
  getWorkflowTelemetry(workflowId: WorkflowId): TelemetryRecord[] {
    const runs = this.listRuns(workflowId);
    const telemetry: TelemetryRecord[] = [];

    for (const run of runs) {
      const runPath = path.join(this.baseDir, workflowId, run);
      const record = this.readTelemetry(runPath);
      if (record) {
        telemetry.push(record);
      }
    }

    return telemetry;
  }

  /**
   * Get aggregated telemetry for all workflows
   */
  getAllTelemetry(): TelemetryRecord[] {
    const allTelemetry: TelemetryRecord[] = [];
    const workflowIds = Object.keys(WORKFLOWS) as WorkflowId[];

    for (const workflowId of workflowIds) {
      const records = this.getWorkflowTelemetry(workflowId);
      allTelemetry.push(...records);
    }

    return allTelemetry.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Get summary statistics for a workflow
   */
  getWorkflowStats(workflowId: WorkflowId): {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    totalCostUsd: number;
    avgDurationMs: number;
  } {
    const telemetry = this.getWorkflowTelemetry(workflowId);

    const successful = telemetry.filter(t => t.success);
    const failed = telemetry.filter(t => !t.success);
    const totalCost = telemetry.reduce((sum, t) => sum + t.estimatedCostUsd, 0);
    const avgDuration = telemetry.length > 0
      ? telemetry.reduce((sum, t) => sum + t.durationMs, 0) / telemetry.length
      : 0;

    return {
      totalRuns: telemetry.length,
      successfulRuns: successful.length,
      failedRuns: failed.length,
      totalCostUsd: totalCost,
      avgDurationMs: avgDuration,
    };
  }
}
