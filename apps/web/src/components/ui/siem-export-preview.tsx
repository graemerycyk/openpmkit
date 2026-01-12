'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Shield,
  Copy,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface TelemetryEventInput {
  // Event identification
  id: string;
  runId: string;
  stepId?: string;
  
  // Event type
  eventType: 
    | 'job.start' | 'job.complete' | 'job.fail'
    | 'tool.call' | 'tool.complete'
    | 'llm.request' | 'llm.response'
    | 'proposal.create';
  
  // Timing
  timestamp: Date;
  latencyMs?: number;
  
  // LLM metrics (for llm.response events)
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  estimatedCostUsd?: number;
  modelId?: string;
  
  // Tool call info
  toolName?: string;
  connectorKey?: string;
  
  // Context
  tenantId: string;
  userId?: string;
  jobType?: string;
  
  // Status
  success: boolean;
  errorMessage?: string;
  
  // Source indicator
  isSimulated?: boolean; // true for mocked data, false for real
}

export interface SIEMExportPreviewProps {
  events: TelemetryEventInput[];
  className?: string;
}

// ============================================================================
// SIEM Event Conversion
// ============================================================================

interface SIEMEvent {
  version: string;
  deviceVendor: string;
  deviceProduct: string;
  deviceVersion: string;
  signatureId: string;
  name: string;
  severity: number;
  
  src: string;
  suser?: string;
  act: string;
  outcome: 'success' | 'failure' | 'unknown';
  reason?: string;
  
  cs1?: string;
  cs1Label: string;
  cs2?: string;
  cs2Label: string;
  cs3?: string;
  cs3Label: string;
  cs4?: string;
  cs4Label: string;
  cs5?: string;
  cs5Label: string;
  
  cn1?: number;
  cn1Label: string;
  cn2?: number;
  cn2Label: string;
  cn3?: number;
  cn3Label: string;
  
  rt: number;
}

const EVENT_SIGNATURES: Record<string, { signatureId: string; name: string; baseSeverity: number }> = {
  'job.start': { signatureId: 'PMKIT-JOB-001', name: 'Job Started', baseSeverity: 1 },
  'job.complete': { signatureId: 'PMKIT-JOB-002', name: 'Job Completed', baseSeverity: 1 },
  'job.fail': { signatureId: 'PMKIT-JOB-003', name: 'Job Failed', baseSeverity: 6 },
  'tool.call': { signatureId: 'PMKIT-TOOL-001', name: 'Tool Called', baseSeverity: 1 },
  'tool.complete': { signatureId: 'PMKIT-TOOL-002', name: 'Tool Completed', baseSeverity: 1 },
  'llm.request': { signatureId: 'PMKIT-LLM-001', name: 'LLM Request', baseSeverity: 1 },
  'llm.response': { signatureId: 'PMKIT-LLM-002', name: 'LLM Response', baseSeverity: 1 },
  'proposal.create': { signatureId: 'PMKIT-PROP-001', name: 'Proposal Created', baseSeverity: 2 },
};

function hashUserId(userId: string): string {
  // Simple hash representation for demo
  return `${userId.substring(0, 2)}***${userId.substring(userId.length - 2)}`;
}

function convertToSIEM(event: TelemetryEventInput): SIEMEvent {
  const signature = EVENT_SIGNATURES[event.eventType] || {
    signatureId: 'PMKIT-UNK-001',
    name: 'Unknown Event',
    baseSeverity: 3,
  };
  
  return {
    version: 'CEF:0',
    deviceVendor: 'pmkit',
    deviceProduct: 'agent-platform',
    deviceVersion: '1.0.0',
    signatureId: signature.signatureId,
    name: signature.name,
    severity: event.success ? signature.baseSeverity : Math.min(10, signature.baseSeverity + 3),
    
    src: event.tenantId,
    suser: event.userId ? hashUserId(event.userId) : undefined,
    act: event.eventType,
    outcome: event.success ? 'success' : 'failure',
    reason: event.errorMessage,
    
    cs1: event.runId,
    cs1Label: 'runId',
    cs2: event.stepId,
    cs2Label: 'stepId',
    cs3: event.jobType,
    cs3Label: 'jobType',
    cs4: event.connectorKey,
    cs4Label: 'connectorKey',
    cs5: event.modelId,
    cs5Label: 'modelId',
    
    cn1: event.latencyMs,
    cn1Label: 'latencyMs',
    cn2: event.tokenUsage?.totalTokens,
    cn2Label: 'tokenCount',
    cn3: event.estimatedCostUsd ? Math.round(event.estimatedCostUsd * 1000000) : undefined,
    cn3Label: 'costMicrodollars',
    
    rt: event.timestamp.getTime(),
  };
}

function formatCEF(event: SIEMEvent): string {
  const header = `${event.version}|${event.deviceVendor}|${event.deviceProduct}|${event.deviceVersion}|${event.signatureId}|${event.name}|${event.severity}`;
  
  const extensions: string[] = [];
  
  if (event.src) extensions.push(`src=${event.src}`);
  if (event.suser) extensions.push(`suser=${event.suser}`);
  if (event.act) extensions.push(`act=${event.act}`);
  if (event.outcome) extensions.push(`outcome=${event.outcome}`);
  if (event.reason) extensions.push(`reason=${event.reason}`);
  
  if (event.cs1) extensions.push(`cs1=${event.cs1} cs1Label=${event.cs1Label}`);
  if (event.cs2) extensions.push(`cs2=${event.cs2} cs2Label=${event.cs2Label}`);
  if (event.cs3) extensions.push(`cs3=${event.cs3} cs3Label=${event.cs3Label}`);
  if (event.cs4) extensions.push(`cs4=${event.cs4} cs4Label=${event.cs4Label}`);
  if (event.cs5) extensions.push(`cs5=${event.cs5} cs5Label=${event.cs5Label}`);
  
  if (event.cn1 !== undefined) extensions.push(`cn1=${event.cn1} cn1Label=${event.cn1Label}`);
  if (event.cn2 !== undefined) extensions.push(`cn2=${event.cn2} cn2Label=${event.cn2Label}`);
  if (event.cn3 !== undefined) extensions.push(`cn3=${event.cn3} cn3Label=${event.cn3Label}`);
  
  extensions.push(`rt=${event.rt}`);
  
  return `${header}|${extensions.join(' ')}`;
}

// ============================================================================
// Component
// ============================================================================

export function SIEMExportPreview({ events, className }: SIEMExportPreviewProps) {
  const [format, setFormat] = useState<'json' | 'cef'>('json');
  const [copied, setCopied] = useState(false);
  
  // Convert events to SIEM format
  const siemEvents = events.map(convertToSIEM);
  
  // Count real vs simulated events
  const realEvents = events.filter(e => !e.isSimulated);
  const simulatedEvents = events.filter(e => e.isSimulated);
  
  // Count redacted fields
  const redactedCount = events.filter(e => e.userId).length;
  
  // Generate export content
  const exportContent = format === 'json'
    ? JSON.stringify(siemEvents, null, 2)
    : siemEvents.map(formatCEF).join('\n');
  
  // Copy to clipboard
  const handleCopy = async () => {
    await navigator.clipboard.writeText(exportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Download file
  const handleDownload = () => {
    const blob = new Blob([exportContent], { 
      type: format === 'json' ? 'application/json' : 'text/plain' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pmkit-siem-export-${new Date().toISOString().split('T')[0]}.${format === 'json' ? 'json' : 'cef'}`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <Card className={cn('border-cobalt-200 bg-gradient-to-br from-cobalt-50/30 to-background', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-cobalt-600" />
            <CardTitle className="text-base">SIEM Export Preview</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            Enterprise Feature
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Export audit events to your SIEM (Splunk, Sentinel, Datadog, etc.) via webhook or API.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Event Summary */}
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-green-600" />
            <span className="text-muted-foreground">Real LLM data:</span>
            <span className="font-medium">{realEvents.length} events</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Database className="h-4 w-4 text-amber-600" />
            <span className="text-muted-foreground">Simulated tool calls:</span>
            <span className="font-medium">{simulatedEvents.length} events</span>
          </div>
          {redactedCount > 0 && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-cobalt-600" />
              <span className="text-muted-foreground">PII redacted:</span>
              <span className="font-medium">{redactedCount} user IDs</span>
            </div>
          )}
        </div>
        
        {/* Format Selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Format:</span>
          <Select value={format} onValueChange={(v) => setFormat(v as 'json' | 'cef')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="cef">CEF (Common Event Format)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Export Preview */}
        <ScrollArea className="h-[300px] rounded-lg border bg-slate-950">
          <pre className="p-4 text-xs text-slate-300 font-mono whitespace-pre-wrap break-all">
            {exportContent}
          </pre>
        </ScrollArea>
        
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download Sample
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-2 text-muted-foreground"
          >
            <a href="/trust" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              View Security Docs
            </a>
          </Button>
        </div>
        
        {/* Info Note */}
        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <p>
            <strong>Enterprise customers</strong> can configure automatic webhook delivery to their SIEM. 
            Events are sent in real-time with configurable batching and retry policies.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Helper to generate telemetry events from job run data
// ============================================================================

export interface JobRunData {
  runId: string;
  jobType: string;
  tenantId: string;
  userId?: string;
  startedAt: Date;
  completedAt?: Date;
  success: boolean;
  errorMessage?: string;
  
  // Tool calls (mocked or from user input)
  toolCalls: Array<{
    id: string;
    toolName: string;
    connectorKey: string;
    latencyMs?: number;
    success: boolean;
    isSimulated: boolean;
  }>;
  
  // LLM metrics (real)
  llmMetrics?: {
    model: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    latencyMs: number;
    estimatedCostUsd: number;
  };
}

export function generateTelemetryEvents(jobRun: JobRunData): TelemetryEventInput[] {
  const events: TelemetryEventInput[] = [];
  let stepCounter = 0;
  
  // Job start event
  events.push({
    id: `${jobRun.runId}-start`,
    runId: jobRun.runId,
    eventType: 'job.start',
    timestamp: jobRun.startedAt,
    tenantId: jobRun.tenantId,
    userId: jobRun.userId,
    jobType: jobRun.jobType,
    success: true,
    isSimulated: false,
  });
  
  // Tool call events
  for (const tc of jobRun.toolCalls) {
    stepCounter++;
    const stepId = `step-${stepCounter}`;
    
    events.push({
      id: `${jobRun.runId}-${tc.id}-call`,
      runId: jobRun.runId,
      stepId,
      eventType: 'tool.call',
      timestamp: new Date(jobRun.startedAt.getTime() + stepCounter * 100),
      latencyMs: tc.latencyMs,
      toolName: tc.toolName,
      connectorKey: tc.connectorKey,
      tenantId: jobRun.tenantId,
      userId: jobRun.userId,
      jobType: jobRun.jobType,
      success: tc.success,
      isSimulated: tc.isSimulated,
    });
    
    events.push({
      id: `${jobRun.runId}-${tc.id}-complete`,
      runId: jobRun.runId,
      stepId,
      eventType: 'tool.complete',
      timestamp: new Date(jobRun.startedAt.getTime() + stepCounter * 100 + (tc.latencyMs || 100)),
      latencyMs: tc.latencyMs,
      toolName: tc.toolName,
      connectorKey: tc.connectorKey,
      tenantId: jobRun.tenantId,
      userId: jobRun.userId,
      jobType: jobRun.jobType,
      success: tc.success,
      isSimulated: tc.isSimulated,
    });
  }
  
  // LLM events (real data)
  if (jobRun.llmMetrics) {
    stepCounter++;
    const llmStepId = `step-${stepCounter}`;
    
    events.push({
      id: `${jobRun.runId}-llm-request`,
      runId: jobRun.runId,
      stepId: llmStepId,
      eventType: 'llm.request',
      timestamp: new Date(jobRun.startedAt.getTime() + stepCounter * 100),
      modelId: jobRun.llmMetrics.model,
      tenantId: jobRun.tenantId,
      userId: jobRun.userId,
      jobType: jobRun.jobType,
      success: true,
      isSimulated: false,
    });
    
    events.push({
      id: `${jobRun.runId}-llm-response`,
      runId: jobRun.runId,
      stepId: llmStepId,
      eventType: 'llm.response',
      timestamp: new Date(jobRun.startedAt.getTime() + stepCounter * 100 + jobRun.llmMetrics.latencyMs),
      latencyMs: jobRun.llmMetrics.latencyMs,
      tokenUsage: {
        inputTokens: jobRun.llmMetrics.inputTokens,
        outputTokens: jobRun.llmMetrics.outputTokens,
        totalTokens: jobRun.llmMetrics.totalTokens,
      },
      estimatedCostUsd: jobRun.llmMetrics.estimatedCostUsd,
      modelId: jobRun.llmMetrics.model,
      tenantId: jobRun.tenantId,
      userId: jobRun.userId,
      jobType: jobRun.jobType,
      success: jobRun.success,
      errorMessage: jobRun.errorMessage,
      isSimulated: false,
    });
  }
  
  // Job complete event
  if (jobRun.completedAt) {
    events.push({
      id: `${jobRun.runId}-complete`,
      runId: jobRun.runId,
      eventType: jobRun.success ? 'job.complete' : 'job.fail',
      timestamp: jobRun.completedAt,
      latencyMs: jobRun.completedAt.getTime() - jobRun.startedAt.getTime(),
      tenantId: jobRun.tenantId,
      userId: jobRun.userId,
      jobType: jobRun.jobType,
      success: jobRun.success,
      errorMessage: jobRun.errorMessage,
      isSimulated: false,
    });
  }
  
  return events;
}
