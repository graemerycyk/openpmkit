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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Trash2,
  History,
  ChevronRight,
  AlertCircle,
  Expand,
  Globe,
  Newspaper,
  Hash,
  RefreshCw,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { JOB_CONTEXT_FIELDS, JOB_TYPE_INFO, type ContextField } from './field-config';
import type { JobType, CrawlerType } from '@pmkit/core';
import { CardDescription } from '@/components/ui/card';

// Workbench mode
type WorkbenchMode = 'jobs' | 'crawlers';

// Crawler job state
interface CrawlerJob {
  id: string;
  type: CrawlerType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  keywords: string[];
  platforms: string[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  resultCount: number;
  results?: CrawlerResult[];
}

interface CrawlerResult {
  id: string;
  source: string;
  title: string;
  url?: string;
  content: string;
  author?: string;
  publishedAt?: string;
  metadata?: Record<string, unknown>;
}

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
  
  // Workbench mode
  const [mode, setMode] = useState<WorkbenchMode>('jobs');
  
  // Jobs state
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
  const [expandModalOpen, setExpandModalOpen] = useState(false);
  
  // Crawler state
  const [crawlerType, setCrawlerType] = useState<CrawlerType>('social');
  const [crawlerKeywords, setCrawlerKeywords] = useState('');
  const [crawlerPlatforms, setCrawlerPlatforms] = useState<string[]>(['reddit']);
  const [crawlerJobs, setCrawlerJobs] = useState<CrawlerJob[]>([]);
  const [selectedCrawlerJob, setSelectedCrawlerJob] = useState<CrawlerJob | null>(null);
  const [isCrawlerRunning, setIsCrawlerRunning] = useState(false);
  const [crawlerError, setCrawlerError] = useState<string | null>(null);

  // Load history on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);
  
  // Poll for crawler job updates
  useEffect(() => {
    const runningJobs = crawlerJobs.filter(j => j.status === 'pending' || j.status === 'running');
    if (runningJobs.length === 0) return;
    
    const interval = setInterval(async () => {
      for (const job of runningJobs) {
        try {
          const response = await fetch(`/api/crawlers/${job.id}`);
          if (response.ok) {
            const updatedJob = await response.json();
            setCrawlerJobs(prev => prev.map(j => j.id === job.id ? updatedJob : j));
            if (selectedCrawlerJob?.id === job.id) {
              setSelectedCrawlerJob(updatedJob);
            }
          }
        } catch (err) {
          console.error('Failed to poll crawler job:', err);
        }
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [crawlerJobs, selectedCrawlerJob]);

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
  
  // ============================================================================
  // Crawler Functions
  // ============================================================================
  
  const startCrawler = async () => {
    if (!crawlerKeywords.trim()) {
      setCrawlerError('Please enter at least one keyword');
      return;
    }
    
    setIsCrawlerRunning(true);
    setCrawlerError(null);
    
    try {
      const keywords = crawlerKeywords.split(',').map(k => k.trim()).filter(Boolean);
      
      const response = await fetch('/api/crawlers/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: crawlerType,
          keywords,
          platforms: crawlerType === 'social' ? crawlerPlatforms : undefined,
          config: {
            limit: 25,
            timeRange: 'week',
          },
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start crawler');
      }
      
      // Add new job to list
      const newJob: CrawlerJob = {
        id: data.jobId,
        type: crawlerType,
        status: 'pending',
        keywords,
        platforms: crawlerPlatforms,
        createdAt: new Date().toISOString(),
        resultCount: 0,
      };
      
      setCrawlerJobs(prev => [newJob, ...prev]);
      setSelectedCrawlerJob(newJob);
      setCrawlerKeywords('');
    } catch (err) {
      setCrawlerError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsCrawlerRunning(false);
    }
  };
  
  const refreshCrawlerJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/crawlers/${jobId}`);
      if (response.ok) {
        const updatedJob = await response.json();
        setCrawlerJobs(prev => prev.map(j => j.id === jobId ? updatedJob : j));
        if (selectedCrawlerJob?.id === jobId) {
          setSelectedCrawlerJob(updatedJob);
        }
      }
    } catch (err) {
      console.error('Failed to refresh crawler job:', err);
    }
  };
  
  const deleteCrawlerJob = async (jobId: string) => {
    try {
      await fetch(`/api/crawlers/${jobId}`, { method: 'DELETE' });
      setCrawlerJobs(prev => prev.filter(j => j.id !== jobId));
      if (selectedCrawlerJob?.id === jobId) {
        setSelectedCrawlerJob(null);
      }
    } catch (err) {
      console.error('Failed to delete crawler job:', err);
    }
  };
  
  const togglePlatform = (platform: string) => {
    setCrawlerPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        {/* Mode Selector */}
        <div className="border-b bg-muted/30 px-4 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('jobs')}
              className={cn(
                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                mode === 'jobs'
                  ? 'bg-background text-foreground shadow-sm border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              )}
            >
              <Zap className="h-4 w-4" />
              PM Jobs
            </button>
            <button
              onClick={() => setMode('crawlers')}
              className={cn(
                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                mode === 'crawlers'
                  ? 'bg-background text-foreground shadow-sm border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              )}
            >
              <Globe className="h-4 w-4" />
              AI Crawlers
              <Badge variant="cobalt" className="text-[10px] px-1.5 py-0">Live</Badge>
            </button>
          </div>
        </div>
        
        {mode === 'jobs' ? (
        <div className="flex flex-1 overflow-hidden">
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
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Format: {selectedJobType === 'prototype_generation' ? 'html' : 'markdown'}</span>
                      <span>•</span>
                      <span>Generated by pmkit</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{(result.metadata.latencyMs / 1000).toFixed(1)}s</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandModalOpen(true)}
                        className="gap-2"
                      >
                        <Expand className="h-4 w-4" />
                        Expand
                      </Button>
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
        ) : (
        // AI Crawlers View
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Crawler Jobs */}
          <div className="hidden w-72 shrink-0 border-r bg-muted/30 lg:block">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Crawler Jobs</span>
                </div>
                {crawlerJobs.length > 0 && (
                  <Badge variant="secondary">{crawlerJobs.length}</Badge>
                )}
              </div>
              <ScrollArea className="flex-1">
                {crawlerJobs.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No crawler jobs yet. Start a crawl to see results.
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {crawlerJobs.map((job) => {
                      const CrawlerIcon = job.type === 'social' ? Hash : job.type === 'news' ? Newspaper : Globe;
                      return (
                        <button
                          key={job.id}
                          onClick={() => setSelectedCrawlerJob(job)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted',
                            selectedCrawlerJob?.id === job.id && 'bg-muted'
                          )}
                        >
                          <CrawlerIcon className="h-4 w-4 shrink-0 text-cobalt-600" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium capitalize">
                              {job.type.replace('_', ' ')}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {job.keywords.slice(0, 2).join(', ')}
                              {job.keywords.length > 2 && ` +${job.keywords.length - 2}`}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {job.status === 'running' || job.status === 'pending' ? (
                              <Loader2 className="h-4 w-4 animate-spin text-cobalt-600" />
                            ) : job.status === 'completed' ? (
                              <Badge variant="outline" className="text-xs border-green-200 bg-green-50 text-green-700">
                                {job.resultCount}
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">
                                Failed
                              </Badge>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          {/* Main Crawler Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Crawler Type Selector */}
            <div className="border-b bg-background p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="shrink-0">Crawler:</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={crawlerType === 'social' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCrawlerType('social')}
                      className="gap-2"
                    >
                      <Hash className="h-4 w-4" />
                      Social
                    </Button>
                    <Button
                      variant={crawlerType === 'web_search' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCrawlerType('web_search')}
                      className="gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      Web Search
                    </Button>
                    <Button
                      variant={crawlerType === 'news' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCrawlerType('news')}
                      className="gap-2"
                    >
                      <Newspaper className="h-4 w-4" />
                      News
                    </Button>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {crawlerType === 'social' && 'Search Reddit and Hacker News for discussions and mentions.'}
                {crawlerType === 'web_search' && 'Search Google/DuckDuckGo for competitor pages and market research.'}
                {crawlerType === 'news' && 'Search news sources for industry updates and press releases.'}
              </p>
            </div>

            {/* Crawler Input */}
            <div className="border-b bg-muted/30 p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="crawler-keywords">Keywords (comma-separated)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="crawler-keywords"
                      value={crawlerKeywords}
                      onChange={(e) => setCrawlerKeywords(e.target.value)}
                      placeholder="notion, coda, monday.com, project management"
                      className="flex-1"
                    />
                    <Button
                      onClick={startCrawler}
                      disabled={isCrawlerRunning || !crawlerKeywords.trim()}
                      className="gap-2"
                    >
                      {isCrawlerRunning ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Start Crawl
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {crawlerType === 'social' && (
                  <div className="space-y-2">
                    <Label>Platforms</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={crawlerPlatforms.includes('reddit') ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => togglePlatform('reddit')}
                      >
                        Reddit
                      </Button>
                      <Button
                        variant={crawlerPlatforms.includes('hackernews') ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => togglePlatform('hackernews')}
                      >
                        Hacker News
                      </Button>
                    </div>
                  </div>
                )}

                {crawlerError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p className="text-sm">{crawlerError}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Crawler Results */}
            <ScrollArea className="flex-1">
              {selectedCrawlerJob ? (
                <div className="p-4 space-y-4">
                  {/* Job Header */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base capitalize flex items-center gap-2">
                          {selectedCrawlerJob.type === 'social' && <Hash className="h-5 w-5 text-pink-600" />}
                          {selectedCrawlerJob.type === 'web_search' && <Globe className="h-5 w-5 text-blue-600" />}
                          {selectedCrawlerJob.type === 'news' && <Newspaper className="h-5 w-5 text-amber-600" />}
                          {selectedCrawlerJob.type.replace('_', ' ')} Crawler
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {selectedCrawlerJob.status === 'running' || selectedCrawlerJob.status === 'pending' ? (
                            <Badge variant="secondary" className="gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              {selectedCrawlerJob.status}
                            </Badge>
                          ) : selectedCrawlerJob.status === 'completed' ? (
                            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Failed</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => refreshCrawlerJob(selectedCrawlerJob.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCrawlerJob(selectedCrawlerJob.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        Keywords: {selectedCrawlerJob.keywords.join(', ')}
                        {selectedCrawlerJob.platforms.length > 0 && (
                          <> • Platforms: {selectedCrawlerJob.platforms.join(', ')}</>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Started: {new Date(selectedCrawlerJob.createdAt).toLocaleString()}</span>
                        {selectedCrawlerJob.completedAt && (
                          <span>Completed: {new Date(selectedCrawlerJob.completedAt).toLocaleString()}</span>
                        )}
                        <span>Results: {selectedCrawlerJob.resultCount}</span>
                      </div>
                      {selectedCrawlerJob.error && (
                        <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">
                          <strong>Error:</strong> {selectedCrawlerJob.error}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Results List */}
                  {selectedCrawlerJob.results && selectedCrawlerJob.results.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-medium">Results ({selectedCrawlerJob.results.length})</h3>
                      {selectedCrawlerJob.results.map((result) => (
                        <Card key={result.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs shrink-0">
                                    {result.source}
                                  </Badge>
                                  {result.author && (
                                    <span className="text-xs text-muted-foreground">
                                      by {result.author}
                                    </span>
                                  )}
                                  {result.publishedAt && (
                                    <span className="text-xs text-muted-foreground">
                                      • {new Date(result.publishedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                <h4 className="mt-1 font-medium line-clamp-2">{result.title}</h4>
                                <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                                  {result.content}
                                </p>
                              </div>
                              {result.url && (
                                <Button variant="ghost" size="sm" asChild className="shrink-0">
                                  <a href={result.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {selectedCrawlerJob.status === 'completed' && selectedCrawlerJob.resultCount === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Globe className="mx-auto h-12 w-12 opacity-50" />
                      <p className="mt-2">No results found for these keywords.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Globe className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 font-heading text-lg font-semibold">Start a Crawl</h2>
                    <p className="mt-2 text-sm text-muted-foreground max-w-md">
                      Enter keywords above and click &quot;Start Crawl&quot; to fetch real data from the web.
                      Results will appear here within 1-2 minutes.
                    </p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
        )}
      </div>

      {/* Fullscreen Expand Modal */}
      <Dialog open={expandModalOpen} onOpenChange={setExpandModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="font-heading">
              {jobInfo.name} Output
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto min-h-0">
            {result && (
              selectedJobType === 'prototype_generation' && result.content.trim().startsWith('<!DOCTYPE') ? (
                <iframe
                  srcDoc={result.content}
                  className="w-full h-full min-h-[80vh] rounded-lg border bg-white"
                  title="Prototype Preview"
                  sandbox="allow-scripts"
                />
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert h-full">
                  <pre className="whitespace-pre-wrap rounded-lg border bg-card p-6 font-sans text-sm text-foreground h-full overflow-auto">
                    {result.content}
                  </pre>
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
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
