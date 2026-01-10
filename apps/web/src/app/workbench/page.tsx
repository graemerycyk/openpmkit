'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  FileText,
  Users,
  BarChart3,
  Target,
  GitBranch,
  CheckCircle2,
  Wand2,
  Megaphone,
  Play,
  Loader2,
  Copy,
  Download,
  HelpCircle,
  Clock,
  DollarSign,
  Cpu,
  Trash2,
  History,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { JOB_CONTEXT_FIELDS, JOB_TYPE_INFO, type ContextField } from './field-config';
import type { JobType } from '@pmkit/core';

// Icon mapping
const ICONS: Record<string, typeof FileText> = {
  FileText,
  Users,
  BarChart3,
  Target,
  GitBranch,
  CheckCircle2,
  Wand2,
  Megaphone,
};

// Job types in display order
const JOB_TYPES: JobType[] = [
  'daily_brief',
  'meeting_prep',
  'prd_draft',
  'voc_clustering',
  'competitor_research',
  'roadmap_alignment',
  'sprint_review',
  'release_notes',
  'prototype_generation',
];

interface WorkbenchRun {
  id: string;
  jobType: JobType;
  timestamp: Date;
  content: string;
  metadata: {
    model: string;
    usage: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
    };
    latencyMs: number;
    estimatedCostUsd: number;
    isStub: boolean;
  };
  context: Record<string, string>;
}

// Local storage key for history
const HISTORY_KEY = 'pmkit-workbench-history';

function loadHistory(): WorkbenchRun[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((run: WorkbenchRun) => ({
      ...run,
      timestamp: new Date(run.timestamp),
    }));
  } catch {
    return [];
  }
}

function saveHistory(history: WorkbenchRun[]) {
  if (typeof window === 'undefined') return;
  // Keep only last 20 runs
  const trimmed = history.slice(0, 20);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

export default function WorkbenchPage() {
  useSession(); // Used for auth check in layout
  const [selectedJobType, setSelectedJobType] = useState<JobType>('daily_brief');
  const [contextValues, setContextValues] = useState<Record<string, string>>({});
  const [tenantName, setTenantName] = useState('');
  const [productName, setProductName] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WorkbenchRun | null>(null);
  const [history, setHistory] = useState<WorkbenchRun[]>([]);
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');
  const [copied, setCopied] = useState(false);

  // Load history on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Get fields for current job type
  const fields = JOB_CONTEXT_FIELDS[selectedJobType] || [];
  const jobInfo = JOB_TYPE_INFO[selectedJobType];
  const JobIcon = ICONS[jobInfo.icon] || FileText;

  // Handle job type change
  const handleJobTypeChange = (jobType: JobType) => {
    setSelectedJobType(jobType);
    setContextValues({});
    setError(null);
  };

  // Handle field change
  const handleFieldChange = (key: string, value: string) => {
    setContextValues((prev) => ({ ...prev, [key]: value }));
  };

  // Check if form is valid
  const isFormValid = () => {
    const requiredFields = fields.filter((f) => f.required);
    return requiredFields.every((f) => contextValues[f.key]?.trim());
  };

  // Run job
  const runJob = async () => {
    if (!isFormValid()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsRunning(true);
    setError(null);
    setActiveTab('output');

    try {
      const response = await fetch('/api/workbench/run-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobType: selectedJobType,
          context: {
            ...contextValues,
            tenantName: tenantName || 'My Company',
            productName: productName || 'My Product',
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to run job');
      }

      const run: WorkbenchRun = {
        id: `run-${Date.now()}`,
        jobType: selectedJobType,
        timestamp: new Date(),
        content: data.content,
        metadata: data.metadata,
        context: contextValues,
      };

      setResult(run);
      setHistory((prev) => {
        const updated = [run, ...prev];
        saveHistory(updated);
        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    if (!result?.content) return;
    await navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download as markdown
  const downloadMarkdown = () => {
    if (!result?.content) return;
    const blob = new Blob([result.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedJobType}-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Load from history
  const loadFromHistory = (run: WorkbenchRun) => {
    setSelectedJobType(run.jobType);
    setContextValues(run.context);
    setResult(run);
    setActiveTab('output');
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  return (
    <TooltipProvider>
      <div className="flex h-full">
        {/* Sidebar - History */}
        <div className="hidden w-64 shrink-0 border-r bg-muted/30 lg:block">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">History</span>
              </div>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="h-8 px-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <ScrollArea className="flex-1">
              {history.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No runs yet. Run a job to see history.
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {history.map((run) => {
                    const info = JOB_TYPE_INFO[run.jobType];
                    const Icon = ICONS[info.icon] || FileText;
                    return (
                      <button
                        key={run.id}
                        onClick={() => loadFromHistory(run)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted',
                          result?.id === run.id && 'bg-muted'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-cobalt-600" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {info.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {run.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Job type selector */}
          <div className="border-b bg-background p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="job-type" className="shrink-0">
                  Job Type:
                </Label>
                <Select
                  value={selectedJobType}
                  onValueChange={(v) => handleJobTypeChange(v as JobType)}
                >
                  <SelectTrigger id="job-type" className="w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((type) => {
                      const info = JOB_TYPE_INFO[type];
                      const Icon = ICONS[info.icon] || FileText;
                      return (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-cobalt-600" />
                            <span>{info.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Label htmlFor="tenant-name" className="shrink-0 text-muted-foreground">
                  Company:
                </Label>
                <Input
                  id="tenant-name"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder="My Company"
                  className="w-[150px]"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="product-name" className="shrink-0 text-muted-foreground">
                  Product:
                </Label>
                <Input
                  id="product-name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="My Product"
                  className="w-[150px]"
                />
              </div>
              <div className="ml-auto">
                <Button
                  onClick={runJob}
                  disabled={isRunning || !isFormValid()}
                  className="gap-2"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Run Job
                    </>
                  )}
                </Button>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              <JobIcon className="mr-1 inline h-4 w-4" />
              {jobInfo.description}
            </p>
          </div>

          {/* Tabs for input/output */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'input' | 'output')}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="border-b px-4">
              <TabsList className="h-12">
                <TabsTrigger value="input" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Input Data
                </TabsTrigger>
                <TabsTrigger value="output" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Output
                  {result && (
                    <Badge variant="cobalt" className="ml-1">
                      Ready
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Input tab */}
            <TabsContent value="input" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full">
                <div className="space-y-6 p-6">
                  {fields.map((field) => (
                    <FieldInput
                      key={field.key}
                      field={field}
                      value={contextValues[field.key] || ''}
                      onChange={(value) => handleFieldChange(field.key, value)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Output tab */}
            <TabsContent value="output" className="flex-1 overflow-hidden m-0">
              {error && (
                <div className="m-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {isRunning && (
                <div className="flex h-full flex-col items-center justify-center gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-cobalt-600" />
                  <div className="text-center">
                    <p className="font-medium">Generating {jobInfo.name}...</p>
                    <p className="text-sm text-muted-foreground">
                      This may take 30-60 seconds
                    </p>
                  </div>
                </div>
              )}

              {!isRunning && !result && !error && (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <JobIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">No output yet</p>
                    <p className="text-sm text-muted-foreground">
                      Fill in the input data and click &quot;Run Job&quot;
                    </p>
                  </div>
                </div>
              )}

              {!isRunning && result && (
                <div className="flex h-full flex-col">
                  {/* Output toolbar */}
                  <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Cpu className="h-4 w-4" />
                        <span>{result.metadata.model}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{(result.metadata.latencyMs / 1000).toFixed(1)}s</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>${result.metadata.estimatedCostUsd.toFixed(4)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>
                          {result.metadata.usage.totalTokens.toLocaleString()} tokens
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        className="gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadMarkdown}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* Output content */}
                  <ScrollArea className="flex-1">
                    {selectedJobType === 'prototype_generation' ? (
                      <div className="p-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Wand2 className="h-5 w-5 text-cobalt-600" />
                              Generated Prototype
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="overflow-hidden rounded-lg border">
                              <iframe
                                srcDoc={result.content}
                                className="h-[600px] w-full"
                                title="Generated Prototype"
                                sandbox="allow-scripts"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="p-6">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <MarkdownRenderer content={result.content} />
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}

// Field input component
function FieldInput({
  field,
  value,
  onChange,
}: {
  field: ContextField;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={field.key} className="font-medium">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </Label>
        {field.hint && (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[300px]">
              <p>{field.hint}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      {field.multiline ? (
        <Textarea
          id={field.key}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="min-h-[200px] font-mono text-sm"
        />
      ) : (
        <Input
          id={field.key}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      )}
    </div>
  );
}

// Simple markdown renderer (basic implementation)
function MarkdownRenderer({ content }: { content: string }) {
  // Very basic markdown rendering - in production you'd use react-markdown
  const html = content
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-8 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-cobalt-500 pl-4 my-4 text-muted-foreground">$1</blockquote>')
    // Horizontal rules
    .replace(/^---$/gim, '<hr class="my-6 border-t" />')
    // Unordered lists
    .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-cobalt-600 hover:underline" target="_blank" rel="noopener">$1</a>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="my-4">')
    .replace(/\n/g, '<br />');

  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: `<p class="my-4">${html}</p>` }}
    />
  );
}
