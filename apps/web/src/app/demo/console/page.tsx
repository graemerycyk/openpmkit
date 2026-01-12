'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
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
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  ArrowRight,
  User,
  Activity,
  Loader2,
  MessageSquare,
  Phone,
  HelpCircle,
  Database,
  Plug,
  Info,
  Globe,
  Newspaper,
  Hash,
  Wand2,
  Layers,
  Megaphone,
  Expand,
  Lock,
  Mail,
  Zap,
  Copy,
  Presentation,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SignInModal } from '@/components/auth/sign-in-modal';
import {
  getDemoJobCount,
  incrementDemoJobCount,
  getMaxFreeJobs,
  hasExceededFreeJobLimit,
  storeDemoJobRun,
} from '@/lib/demo-session';

// ============================================================================
// Types
// ============================================================================

type JobType =
  | 'daily_brief'
  | 'meeting_prep'
  | 'voc_clustering'
  | 'competitor_research'
  | 'roadmap_alignment'
  | 'prd_draft'
  | 'sprint_review'
  | 'prototype_generation'
  | 'release_notes'
  | 'deck_content';

type JobStatus = 'idle' | 'running' | 'completed' | 'error';

type ConnectorStatus = 'not_connected' | 'connected_demo' | 'connected_real';

type DemoView = 'workflows' | 'commands' | 'crawlers';

type Channel = 'slack' | 'teams' | 'email';

interface Connector {
  id: string;
  name: string;
  icon: typeof FileText;
  status: ConnectorStatus;
  type: 'mcp' | 'crawler';
  description?: string;
}

interface CrawlerAnalysis {
  summary: string;
  themes: Array<{
    name: string;
    description: string;
    mentionCount: number;
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    keyQuotes: string[];
    sources: string[];
  }>;
  overallSentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
  competitorMentions: Array<{
    competitor: string;
    context: string;
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    source: string;
    url?: string;
  }>;
  insights: Array<{
    type: 'opportunity' | 'threat' | 'trend' | 'action_item';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    evidence: string[];
  }>;
  topQuotes: Array<{
    quote: string;
    source: string;
    url?: string;
    relevance: string;
  }>;
  recommendations: string[];
}

interface ToolCall {
  id: string;
  name: string;
  server: string;
  status: 'pending' | 'success' | 'error';
  durationMs?: number;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
}

interface JobRun {
  id: string;
  type: JobType;
  status: JobStatus;
  startedAt?: Date;
  completedAt?: Date;
  toolCalls: ToolCall[];
  artifact?: {
    title: string;
    content: string;
    format: string;
  };
  error?: string;
  llmMetadata?: {
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
}

interface ParsedIntent {
  jobType: JobType;
  jobName: string;
  params: Record<string, string>;
  confidence: 'high' | 'medium' | 'low';
}

interface DraftResponse {
  channel: Channel;
  content: string;
  recipient?: string;
  subject?: string;
}

// ============================================================================
// Constants
// ============================================================================

const connectors: Connector[] = [
  // Tool Integrations (MCP Connectors)
  { id: 'jira', name: 'Jira', icon: FileText, status: 'connected_demo', type: 'mcp' },
  { id: 'confluence', name: 'Confluence', icon: Database, status: 'connected_demo', type: 'mcp' },
  { id: 'slack', name: 'Slack', icon: MessageSquare, status: 'connected_demo', type: 'mcp' },
  { id: 'gong', name: 'Gong', icon: Phone, status: 'connected_demo', type: 'mcp' },
  { id: 'zendesk', name: 'Zendesk', icon: HelpCircle, status: 'connected_demo', type: 'mcp' },
  { id: 'amplitude', name: 'Amplitude', icon: BarChart3, status: 'connected_demo', type: 'mcp' },
  { id: 'discourse', name: 'Discourse', icon: Users, status: 'connected_demo', type: 'mcp' },
  { id: 'pmkit', name: 'pmkit Artifacts', icon: Layers, status: 'connected_demo', type: 'mcp', description: 'PRDs, briefs, reports from previous jobs' },
  // AI Crawlers
  { id: 'social_crawler', name: 'Social Crawler', icon: Hash, status: 'connected_demo', type: 'crawler', description: 'X, Reddit, LinkedIn, Discord, Bluesky, Threads' },
  { id: 'web_search', name: 'Web Search', icon: Globe, status: 'connected_demo', type: 'crawler', description: 'Google & Bing' },
  { id: 'news_crawler', name: 'News Crawler', icon: Newspaper, status: 'connected_demo', type: 'crawler', description: 'Industry news & press releases' },
];

const jobConfigs: Record<
  JobType,
  {
    name: string;
    description: string;
    icon: typeof FileText;
    toolCalls: Omit<ToolCall, 'id' | 'status' | 'durationMs'>[];
    sources: string[];
    highlight?: boolean;
  }
> = {
  prototype_generation: {
    name: 'PRD to Prototype',
    description: 'Generate interactive UI from PRD',
    icon: Wand2,
    sources: ['pmkit', 'confluence', 'jira'],
    highlight: true,
    toolCalls: [
      { name: 'get_prd_artifact', server: 'pmkit', input: { artifactId: 'artifact-prd-001' } },
      { name: 'extract_user_stories', server: 'pmkit', input: { prdId: 'artifact-prd-001' } },
      { name: 'get_design_system', server: 'confluence', input: { spaceKey: 'DESIGN' } },
      { name: 'generate_ui_code', server: 'openai', input: { framework: 'react', styling: 'tailwind' } },
    ],
  },
  daily_brief: {
    name: 'Daily Brief',
    description: 'Synthesize overnight activity',
    icon: FileText,
    sources: ['slack', 'jira', 'zendesk', 'discourse'],
    toolCalls: [
      { name: 'get_channel_messages', server: 'slack', input: { channelId: 'C001', limit: 50 } },
      { name: 'get_sprint_issues', server: 'jira', input: { sprintId: 'sprint-42' } },
      { name: 'get_tickets', server: 'zendesk', input: { status: 'open', limit: 25 } },
      { name: 'get_posts', server: 'discourse', input: { limit: 20 } },
    ],
  },
  meeting_prep: {
    name: 'Meeting Prep',
    description: 'Prepare for customer meeting',
    icon: Users,
    sources: ['gong', 'zendesk'],
    toolCalls: [
      { name: 'get_calls', server: 'gong', input: { accountName: 'Globex Corp', limit: 5 } },
      { name: 'get_insights', server: 'gong', input: { type: 'pain_point' } },
      { name: 'get_tickets', server: 'zendesk', input: { tags: ['enterprise'], limit: 10 } },
    ],
  },
  prd_draft: {
    name: 'PRD Draft',
    description: 'Draft PRD with evidence',
    icon: FileText,
    sources: ['discourse', 'gong', 'amplitude', 'confluence'],
    toolCalls: [
      { name: 'get_top_feature_requests', server: 'discourse', input: { limit: 10 } },
      { name: 'get_pain_points', server: 'gong', input: { limit: 20 } },
      { name: 'get_no_results_queries', server: 'amplitude', input: { minCount: 10 } },
      { name: 'search_pages', server: 'confluence', input: { query: 'search', spaceKey: 'PROD' } },
    ],
  },
  voc_clustering: {
    name: 'VoC Clustering',
    description: 'Cluster customer feedback into themes',
    icon: BarChart3,
    sources: ['zendesk', 'gong', 'discourse', 'social_crawler'],
    toolCalls: [
      { name: 'get_tickets', server: 'zendesk', input: { limit: 50 } },
      { name: 'get_insights', server: 'gong', input: { limit: 50 } },
      { name: 'get_feature_requests', server: 'discourse', input: { status: 'open', limit: 25 } },
      { name: 'get_posts', server: 'discourse', input: { limit: 30 } },
      { name: 'search_mentions', server: 'social_crawler', input: { channels: ['x', 'reddit', 'linkedin'], limit: 50 } },
    ],
  },
  competitor_research: {
    name: 'Competitor Research',
    description: 'Track competitor product changes',
    icon: Target,
    sources: ['social_crawler', 'web_search', 'news_crawler'],
    toolCalls: [
      { name: 'search_mentions', server: 'social_crawler', input: { query: 'competitor:notion OR competitor:coda', channels: ['x', 'reddit', 'linkedin', 'discord'], limit: 50 } },
      { name: 'search_web', server: 'web_search', input: { query: 'notion pricing OR coda features', engines: ['google', 'bing'], limit: 20 } },
      { name: 'search_news', server: 'news_crawler', input: { query: 'notion coda monday.com', limit: 25 } },
    ],
  },
  roadmap_alignment: {
    name: 'Roadmap Alignment',
    description: 'Generate alignment memo',
    icon: GitBranch,
    sources: ['jira', 'amplitude', 'discourse', 'news_crawler'],
    toolCalls: [
      { name: 'get_epics', server: 'jira', input: { projectKey: 'ACME' } },
      { name: 'get_feature_usage', server: 'amplitude', input: { period: 'week' } },
      { name: 'get_top_feature_requests', server: 'discourse', input: { limit: 10 } },
      { name: 'search_news', server: 'news_crawler', input: { query: 'competitor announcements', limit: 10 } },
    ],
  },
  sprint_review: {
    name: 'Sprint Review',
    description: 'Generate sprint review pack',
    icon: CheckCircle2,
    sources: ['jira', 'confluence', 'slack', 'amplitude'],
    toolCalls: [
      { name: 'get_sprint_issues', server: 'jira', input: { sprintId: 'sprint-42', includeChangelog: true } },
      { name: 'get_sprint_goal', server: 'jira', input: { sprintId: 'sprint-42' } },
      { name: 'search_pages', server: 'confluence', input: { query: 'sprint-42 release notes', spaceKey: 'PROD' } },
      { name: 'get_channel_messages', server: 'slack', input: { channelId: 'C-product-updates', limit: 50 } },
      { name: 'get_feature_usage', server: 'amplitude', input: { features: ['search_filters', 'bulk_export'], period: 'sprint' } },
    ],
  },
  release_notes: {
    name: 'Release Notes',
    description: 'Generate customer-facing release notes',
    icon: Megaphone,
    sources: ['jira', 'confluence', 'pmkit'],
    toolCalls: [
      { name: 'get_release_issues', server: 'jira', input: { fixVersion: 'v2.4.0', status: 'Done' } },
      { name: 'get_epic_summaries', server: 'jira', input: { fixVersion: 'v2.4.0' } },
      { name: 'get_release_template', server: 'confluence', input: { spaceKey: 'PROD', title: 'Release Notes Template' } },
      { name: 'get_recent_artifacts', server: 'pmkit', input: { type: 'prd', limit: 5 } },
    ],
  },
  deck_content: {
    name: 'Deck Content',
    description: 'Generate slide content for any audience',
    icon: Presentation,
    sources: ['pmkit', 'jira', 'amplitude', 'confluence'],
    highlight: true,
    toolCalls: [
      { name: 'get_recent_artifacts', server: 'pmkit', input: { types: ['voc_report', 'competitor_report', 'prd'], limit: 5 } },
      { name: 'get_sprint_metrics', server: 'jira', input: { sprintId: 'sprint-42' } },
      { name: 'get_feature_usage', server: 'amplitude', input: { period: 'month' } },
      { name: 'search_pages', server: 'confluence', input: { query: 'roadmap', spaceKey: 'PROD' } },
    ],
  },
};

// Command parsing for Slack/Teams/Email
const jobTypeMap: Record<string, { type: JobType; name: string; icon: typeof FileText }> = {
  daily_brief: { type: 'daily_brief', name: 'Daily Brief', icon: FileText },
  brief: { type: 'daily_brief', name: 'Daily Brief', icon: FileText },
  meeting_prep: { type: 'meeting_prep', name: 'Meeting Prep', icon: Users },
  meeting: { type: 'meeting_prep', name: 'Meeting Prep', icon: Users },
  prep: { type: 'meeting_prep', name: 'Meeting Prep', icon: Users },
  voc: { type: 'voc_clustering', name: 'VoC Clustering', icon: BarChart3 },
  voc_clustering: { type: 'voc_clustering', name: 'VoC Clustering', icon: BarChart3 },
  themes: { type: 'voc_clustering', name: 'VoC Clustering', icon: BarChart3 },
  competitor: { type: 'competitor_research', name: 'Competitor Research', icon: Target },
  competitor_research: { type: 'competitor_research', name: 'Competitor Research', icon: Target },
  research: { type: 'competitor_research', name: 'Competitor Research', icon: Target },
  roadmap: { type: 'roadmap_alignment', name: 'Roadmap Alignment', icon: GitBranch },
  roadmap_alignment: { type: 'roadmap_alignment', name: 'Roadmap Alignment', icon: GitBranch },
  alignment: { type: 'roadmap_alignment', name: 'Roadmap Alignment', icon: GitBranch },
  prd: { type: 'prd_draft', name: 'PRD Draft', icon: FileText },
  prd_draft: { type: 'prd_draft', name: 'PRD Draft', icon: FileText },
  sprint: { type: 'sprint_review', name: 'Sprint Review', icon: CheckCircle2 },
  sprint_review: { type: 'sprint_review', name: 'Sprint Review', icon: CheckCircle2 },
  review: { type: 'sprint_review', name: 'Sprint Review', icon: CheckCircle2 },
  prototype: { type: 'prototype_generation', name: 'PRD to Prototype', icon: Wand2 },
  prototype_generation: { type: 'prototype_generation', name: 'PRD to Prototype', icon: Wand2 },
  release: { type: 'release_notes', name: 'Release Notes', icon: Megaphone },
  release_notes: { type: 'release_notes', name: 'Release Notes', icon: Megaphone },
  notes: { type: 'release_notes', name: 'Release Notes', icon: Megaphone },
  deck: { type: 'deck_content', name: 'Deck Content', icon: Presentation },
  deck_content: { type: 'deck_content', name: 'Deck Content', icon: Presentation },
  slides: { type: 'deck_content', name: 'Deck Content', icon: Presentation },
  presentation: { type: 'deck_content', name: 'Deck Content', icon: Presentation },
};

// Workflow examples for each job type, per channel
interface WorkflowExample {
  jobType: JobType;
  jobName: string;
  icon: typeof FileText;
  commands: Record<Channel, string>;
}

const workflowExamples: WorkflowExample[] = [
  {
    jobType: 'prototype_generation',
    jobName: 'PRD to Prototype',
    icon: Wand2,
    commands: {
      slack: '/pmkit prototype from PRD-001',
      teams: '@pmkit generate prototype',
      email: 'Subject: pmkit: prototype from PRD',
    },
  },
  {
    jobType: 'daily_brief',
    jobName: 'Daily Brief',
    icon: FileText,
    commands: {
      slack: '/pmkit run daily brief',
      teams: '@pmkit daily brief',
      email: 'Subject: pmkit: daily brief',
    },
  },
  {
    jobType: 'meeting_prep',
    jobName: 'Meeting Prep',
    icon: Users,
    commands: {
      slack: '/pmkit prep meeting Globex Corp',
      teams: '@pmkit meeting prep for Acme Inc',
      email: 'Subject: pmkit: prep meeting Globex',
    },
  },
  {
    jobType: 'prd_draft',
    jobName: 'PRD Draft',
    icon: FileText,
    commands: {
      slack: '/pmkit draft prd search filters',
      teams: '@pmkit prd draft for search',
      email: 'Subject: pmkit: prd draft search filters',
    },
  },
  {
    jobType: 'voc_clustering',
    jobName: 'VoC Clustering',
    icon: BarChart3,
    commands: {
      slack: '/pmkit voc themes last 30 days',
      teams: '@pmkit voc clustering this month',
      email: 'Subject: pmkit: voc themes',
    },
  },
  {
    jobType: 'competitor_research',
    jobName: 'Competitor Research',
    icon: Target,
    commands: {
      slack: '/pmkit competitor research Notion',
      teams: '@pmkit research competitors',
      email: 'Subject: pmkit: competitor research',
    },
  },
  {
    jobType: 'roadmap_alignment',
    jobName: 'Roadmap Alignment',
    icon: GitBranch,
    commands: {
      slack: '/pmkit roadmap alignment Q1',
      teams: '@pmkit alignment memo Q1',
      email: 'Subject: pmkit: roadmap alignment Q1',
    },
  },
  {
    jobType: 'sprint_review',
    jobName: 'Sprint Review',
    icon: CheckCircle2,
    commands: {
      slack: '/pmkit sprint review Sprint 42',
      teams: '@pmkit sprint review pack',
      email: 'Subject: pmkit: sprint 42 review',
    },
  },
  {
    jobType: 'release_notes',
    jobName: 'Release Notes',
    icon: Megaphone,
    commands: {
      slack: '/pmkit release notes v2.4.0',
      teams: '@pmkit release notes',
      email: 'Subject: pmkit: release notes v2.4',
    },
  },
  {
    jobType: 'deck_content',
    jobName: 'Deck Content',
    icon: Presentation,
    commands: {
      slack: '/pmkit deck content for exec on Q4',
      teams: '@pmkit slides for customer',
      email: 'Subject: pmkit: deck for board meeting',
    },
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

function ConnectorStatusBadge({ status }: { status: ConnectorStatus }) {
  if (status === 'connected_demo') {
    return (
      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
        Demo
      </Badge>
    );
  }
  if (status === 'connected_real') {
    return (
      <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
        Connected
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      Not Connected
    </Badge>
  );
}

function parseCommand(input: string, _channel: Channel): ParsedIntent | null {
  const normalizedInput = input.toLowerCase().trim();
  
  const cleanedInput = normalizedInput
    .replace(/^\/pmkit\s+/i, '')
    .replace(/^@pmkit\s+/i, '')
    .replace(/^pmkit:\s*/i, '')
    .replace(/^subject:\s*pmkit:\s*/i, '')
    .replace(/^run\s+/i, '');

  const params: Record<string, string> = {};
  
  const accountMatch = cleanedInput.match(/(?:for|prep|meeting)\s+([a-z0-9\s]+?)(?:\s+(?:last|q[1-4]|this|next)|$)/i);
  if (accountMatch) {
    params.account = accountMatch[1].trim();
  }

  const timeMatch = cleanedInput.match(/last\s+(\d+)\s+(days?|weeks?|months?)/i);
  if (timeMatch) {
    params.timeRange = `${timeMatch[1]} ${timeMatch[2]}`;
  }

  const quarterMatch = cleanedInput.match(/q([1-4])/i);
  if (quarterMatch) {
    params.quarter = `Q${quarterMatch[1]}`;
  }

  for (const [keyword, job] of Object.entries(jobTypeMap)) {
    if (cleanedInput.includes(keyword)) {
      return {
        jobType: job.type,
        jobName: job.name,
        params,
        confidence: cleanedInput.startsWith(keyword) || cleanedInput.includes(`run ${keyword}`) ? 'high' : 'medium',
      };
    }
  }

  return null;
}

function generateDraftResponse(intent: ParsedIntent, channel: Channel): DraftResponse {
  const baseContent = `✅ **${intent.jobName}** completed successfully!

📊 **Summary**
Your ${intent.jobName.toLowerCase()} has been generated with data from 4 sources.

🔗 **View Full Results**
[Open in pmkit Console →](/demo/console)

---
*This is a draft proposal. Review before posting.*`;

  const slackContent = `${baseContent}

_Generated by pmkit • Draft-only mode_`;

  const teamsContent = `${baseContent}

_Generated by pmkit • Draft-only mode_`;

  const emailContent = `Hi,

Your ${intent.jobName} job has completed successfully.

Summary:
- Data collected from 4 sources
- Artifact generated and ready for review
- All tool calls logged for audit trail

View the full results: https://getpmkit.com/demo/console

---
This is a draft email. Review and edit before sending.

Best,
pmkit Agent`;

  if (channel === 'email') {
    return {
      channel,
      content: emailContent,
      recipient: 'you@company.com',
      subject: `Re: pmkit: ${intent.jobName} - Complete`,
    };
  }

  return {
    channel,
    content: channel === 'slack' ? slackContent : teamsContent,
  };
}

// ============================================================================
// Main Component
// ============================================================================

function ConsolePageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  
  // Determine initial view and job from URL params
  const initialJob = searchParams.get('job') as JobType | null;
  const initialView = searchParams.get('view') as DemoView | null;
  
  // Top-level view state
  const [demoView, setDemoView] = useState<DemoView>(initialView || 'workflows');
  
  // PM Workflows state
  const [selectedJob, setSelectedJob] = useState<JobType | null>(
    initialJob && jobConfigs[initialJob] ? initialJob : 'prototype_generation'
  );
  const [jobRuns, setJobRuns] = useState<Record<JobType, JobRun | null>>({
    daily_brief: null,
    meeting_prep: null,
    voc_clustering: null,
    competitor_research: null,
    roadmap_alignment: null,
    prd_draft: null,
    sprint_review: null,
    prototype_generation: null,
    release_notes: null,
    deck_content: null,
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'artifact' | 'connectors'>(
    'overview'
  );
  const [artifactModalOpen, setArtifactModalOpen] = useState(false);
  
  // Command demo state
  const [selectedChannel, setSelectedChannel] = useState<Channel>('slack');
  const [command, setCommand] = useState('');
  const [isCommandRunning, setIsCommandRunning] = useState(false);
  const [parsedIntent, setParsedIntent] = useState<ParsedIntent | null>(null);
  const [draftResponse, setDraftResponse] = useState<DraftResponse | null>(null);
  const [commandRunId, setCommandRunId] = useState<string | null>(null);
  
  // Crawler demo state
  type CrawlerType = 'social' | 'web_search' | 'news';
  const [crawlerRunning, setCrawlerRunning] = useState<CrawlerType | null>(null);
  const [crawlerResult, setCrawlerResult] = useState<{
    type: CrawlerType;
    keywords: string[];
    resultCount: number;
    analysis: CrawlerAnalysis | null;
    metadata?: {
      model: string;
      latencyMs: number;
      isStub: boolean;
    };
  } | null>(null);
  const [crawlerError, setCrawlerError] = useState<string | null>(null);
  
  // Demo job counter state
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [demoJobCount, setDemoJobCount] = useState(0);
  const maxFreeJobs = getMaxFreeJobs();
  const isAuthenticated = !!session?.user;

  // Load demo job count from localStorage on mount
  useEffect(() => {
    setDemoJobCount(getDemoJobCount());
  }, []);

  // Get the current run for the selected job
  const currentRun = selectedJob ? jobRuns[selectedJob] : null;

  const runJob = async (jobType: JobType) => {
    if (!isAuthenticated && hasExceededFreeJobLimit()) {
      setSignInModalOpen(true);
      return;
    }

    const config = jobConfigs[jobType];
    const runId = `run-${Date.now()}`;

    const run: JobRun = {
      id: runId,
      type: jobType,
      status: 'running',
      startedAt: new Date(),
      toolCalls: config.toolCalls.map((tc, i) => ({
        ...tc,
        id: `tc-${i}`,
        status: 'pending' as const,
      })),
    };

    setJobRuns((prev) => ({ ...prev, [jobType]: run }));
    setActiveTab('timeline');
    
    if (!isAuthenticated) {
      const newCount = incrementDemoJobCount();
      setDemoJobCount(newCount);
    }

    for (let i = 0; i < run.toolCalls.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 300));

      setJobRuns((prev) => {
        const currentJobRun = prev[jobType];
        if (!currentJobRun) return prev;
        const toolCalls = [...currentJobRun.toolCalls];
        toolCalls[i] = {
          ...toolCalls[i],
          status: 'success',
          durationMs: Math.floor(100 + Math.random() * 200),
          output: { success: true, count: Math.floor(Math.random() * 50) },
        };
        return { ...prev, [jobType]: { ...currentJobRun, toolCalls } };
      });
    }

    try {
      const response = await fetch('/api/demo/run-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobType }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.isRateLimited 
          ? data.message 
          : data.message || 'Failed to generate artifact';
        
        setJobRuns((prev) => {
          const currentJobRun = prev[jobType];
          if (!currentJobRun) return prev;
          return {
            ...prev,
            [jobType]: {
              ...currentJobRun,
              status: 'error',
              completedAt: new Date(),
              error: errorMessage,
            },
          };
        });
        return;
      }

      const generatedContent = data.content?.trim();
      
      if (!generatedContent) {
        const errorMessage = `LLM returned empty content for ${jobType}. This may be due to content filtering or model issues.`;
        
        setJobRuns((prev) => {
          const currentJobRun = prev[jobType];
          if (!currentJobRun) return prev;
          return {
            ...prev,
            [jobType]: {
              ...currentJobRun,
              status: 'error',
              completedAt: new Date(),
              error: errorMessage,
              llmMetadata: data.metadata,
            },
          };
        });
        return;
      }

      const completedAt = new Date();
      setJobRuns((prev) => {
        const currentJobRun = prev[jobType];
        if (!currentJobRun) return prev;
        return {
          ...prev,
          [jobType]: {
            ...currentJobRun,
            status: 'completed',
            completedAt,
            artifact: {
              title: config.name,
              content: generatedContent,
              format: jobType === 'prototype_generation' ? 'html' : 'markdown',
            },
            llmMetadata: data.metadata,
          },
        };
      });

      if (!isAuthenticated && run.startedAt) {
        storeDemoJobRun({
          id: runId,
          type: jobType,
          status: 'completed',
          startedAt: run.startedAt.toISOString(),
          completedAt: completedAt.toISOString(),
          artifactTitle: config.name,
        });
      }

      setActiveTab('artifact');
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? `LLM API error: ${error.message}` 
        : 'LLM API error: Unknown error occurred';
      
      setJobRuns((prev) => {
        const currentJobRun = prev[jobType];
        if (!currentJobRun) return prev;
        return {
          ...prev,
          [jobType]: {
            ...currentJobRun,
            status: 'error',
            completedAt: new Date(),
            error: errorMessage,
          },
        };
      });
    }
  };

  const downloadArtifact = () => {
    if (!currentRun?.artifact) return;

    const isHtml = selectedJob === 'prototype_generation';
    const mimeType = isHtml ? 'text/html' : 'text/markdown';
    const extension = isHtml ? '.html' : '.md';

    const blob = new Blob([currentRun.artifact.content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentRun.artifact.title.toLowerCase().replace(/\s+/g, '-')}${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getJobSources = (jobType: JobType) => {
    const config = jobConfigs[jobType];
    return config.sources.map((sourceId) => {
      const connector = connectors.find((c) => c.id === sourceId);
      return connector || { id: sourceId, name: sourceId, icon: Database, status: 'connected_demo' as ConnectorStatus };
    });
  };

  // Command demo handlers
  const handleCommandRun = async () => {
    // Check free job limit for unauthenticated users
    if (!isAuthenticated && hasExceededFreeJobLimit()) {
      setSignInModalOpen(true);
      return;
    }

    const intent = parseCommand(command, selectedChannel);
    if (!intent) {
      setParsedIntent(null);
      return;
    }

    setParsedIntent(intent);
    setIsCommandRunning(true);
    setDraftResponse(null);
    setCommandRunId(null);

    // Increment job count for unauthenticated users
    if (!isAuthenticated) {
      const newCount = incrementDemoJobCount();
      setDemoJobCount(newCount);
    }

    try {
      // Call the actual API to run the job (counts against rate limits)
      const response = await fetch('/api/demo/run-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobType: intent.jobType }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limit or other errors
        if (data.isRateLimited) {
          setIsCommandRunning(false);
          setParsedIntent(null);
          // Show error in the UI
          return;
        }
      }

      const newRunId = `run_${Date.now()}`;
      setCommandRunId(newRunId);
      setDraftResponse(generateDraftResponse(intent, selectedChannel));
    } catch (error) {
      console.error('Command run error:', error);
    } finally {
      setIsCommandRunning(false);
    }
  };

  // Handler for crawler demo buttons
  const handleCrawlerDemo = async (crawlerType: 'social' | 'web_search' | 'news') => {
    // Check free job limit for unauthenticated users
    if (!isAuthenticated && hasExceededFreeJobLimit()) {
      setSignInModalOpen(true);
      return;
    }
    
    setCrawlerRunning(crawlerType);
    setCrawlerError(null);
    setCrawlerResult(null);
    
    // Increment demo job count for unauthenticated users
    if (!isAuthenticated) {
      const newCount = incrementDemoJobCount();
      setDemoJobCount(newCount);
    }
    
    try {
      // Default keywords based on crawler type
      const keywords = crawlerType === 'social' 
        ? ['product management', 'notion', 'coda']
        : crawlerType === 'web_search'
          ? ['product management tools 2026', 'notion vs coda']
          : ['AI product management', 'SaaS funding'];
      
      const platforms = crawlerType === 'social' ? ['reddit', 'hackernews'] : undefined;
      
      const response = await fetch('/api/demo/run-crawler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crawlerType,
          keywords,
          platforms,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to run crawler');
      }
      
      const data = await response.json();
      
      setCrawlerResult({
        type: crawlerType,
        keywords,
        resultCount: data.resultCount,
        analysis: data.analysis,
        metadata: data.metadata,
      });
    } catch (error) {
      setCrawlerError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setCrawlerRunning(null);
    }
  };

  const handleExampleClick = (example: string) => {
    setCommand(example);
    setParsedIntent(null);
    setDraftResponse(null);
    setCommandRunId(null);
  };

  const channelIcons: Record<Channel, typeof MessageSquare> = {
    slack: Hash,
    teams: Users,
    email: Mail,
  };

  const channelNames: Record<Channel, string> = {
    slack: 'Slack',
    teams: 'Microsoft Teams',
    email: 'Email',
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-heading text-xl font-bold text-cobalt-600"
          >
            pmkit
          </Link>
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
            Demo Mode
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          {!isAuthenticated && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {demoJobCount}/{maxFreeJobs} free jobs used
              </span>
              {demoJobCount >= maxFreeJobs && (
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 gap-1 text-xs"
                  onClick={() => setSignInModalOpen(true)}
                >
                  <Lock className="h-3 w-3" />
                  Sign in for more
                </Button>
              )}
            </div>
          )}
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{isAuthenticated ? session.user?.name || 'User' : 'Demo Guest'}</span>
            <Badge variant="secondary">PM</Badge>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="outline" size="sm" asChild>
            <Link href={isAuthenticated ? '/dashboard' : '/'}>
              Exit Demo
            </Link>
          </Button>
        </div>
      </header>

      {/* Demo Mode Banner */}
      <div className="flex items-center gap-2 border-b bg-gradient-to-r from-amber-50 to-cobalt-50 px-4 py-2 text-sm">
        <Info className="h-4 w-4 shrink-0 text-amber-700" />
        <span className="text-amber-800">
          <strong>Demo Mode:</strong> Connectors use simulated data.{' '}
          <span className="text-cobalt-700 font-medium">AI outputs are real</span> (GPT-5 mini).{' '}
          <Link href="/contact" className="font-medium underline hover:no-underline text-cobalt-600">
            Contact Sales
          </Link>{' '}
          to connect your real tools.
        </span>
      </div>

      {/* Top-Level View Selector */}
      <div className="border-b bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDemoView('workflows')}
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              demoView === 'workflows'
                ? 'bg-background text-foreground shadow-sm border'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            <Zap className="h-4 w-4" />
            PM Workflows
          </button>
          <button
            onClick={() => setDemoView('commands')}
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              demoView === 'commands'
                ? 'bg-background text-foreground shadow-sm border'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            <MessageSquare className="h-4 w-4" />
            Slack & Teams
          </button>
          <button
            onClick={() => setDemoView('crawlers')}
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              demoView === 'crawlers'
                ? 'bg-background text-foreground shadow-sm border'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            <Globe className="h-4 w-4" />
            AI Crawlers
          </button>
        </div>
      </div>

      {/* Main Content - Conditional based on view */}
      {demoView === 'workflows' ? (
        // PM Workflows View
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Job Selection */}
          <aside className="flex w-64 flex-col border-r bg-muted/30">
            <div className="p-4">
              <h2 className="font-heading text-sm font-semibold text-muted-foreground">
                PM WORKFLOWS
              </h2>
            </div>
            <nav className="space-y-1 px-2">
              {(Object.keys(jobConfigs) as JobType[]).map((jobType) => {
                const config = jobConfigs[jobType];
                const isSelected = selectedJob === jobType;
                const jobRun = jobRuns[jobType];
                const isRunning = jobRun?.status === 'running';
                const isCompleted = jobRun?.status === 'completed';

                return (
                  <button
                    key={jobType}
                    onClick={() => setSelectedJob(jobType)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
                      isSelected
                        ? 'bg-cobalt-100 text-cobalt-700'
                        : config.highlight
                          ? 'bg-cobalt-50/50 text-cobalt-600 hover:bg-cobalt-100/50'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <config.icon className="h-4 w-4" />
                    <span className="flex-1">{config.name}</span>
                    {config.highlight && !isRunning && !isCompleted && (
                      <Badge variant="cobalt" className="text-[10px] px-1.5 py-0">Try</Badge>
                    )}
                    {isRunning && <Loader2 className="h-4 w-4 animate-spin text-cobalt-600" />}
                    {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  </button>
                );
              })}
            </nav>

            {/* Connectors Status */}
            <div className="mt-6 flex-1 overflow-y-auto border-t p-4">
              <div className="flex items-center gap-2">
                <Plug className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-heading text-sm font-semibold text-muted-foreground">
                  CONNECTORS
                </h2>
              </div>
              
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground/70">Tool Integrations</p>
                {connectors.filter(c => c.type === 'mcp').map((connector) => (
                  <div key={connector.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <connector.icon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{connector.name}</span>
                    </div>
                    <ConnectorStatusBadge status={connector.status} />
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground/70">AI Crawlers</p>
                {connectors.filter(c => c.type === 'crawler').map((connector) => (
                  <div key={connector.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <connector.icon className="h-3 w-3 text-cobalt-600" />
                      <span className="text-muted-foreground">{connector.name}</span>
                    </div>
                    <ConnectorStatusBadge status={connector.status} />
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Panel */}
          <main className="flex-1 overflow-hidden">
            {!selectedJob ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h2 className="mt-4 font-heading text-lg font-semibold">Select a Workflow</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Choose a PM workflow from the sidebar to run it.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col">
                {/* Job Header */}
                <div className="flex items-center justify-between border-b p-4">
                  <div>
                    <h1 className="font-heading text-xl font-bold">
                      {jobConfigs[selectedJob].name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {jobConfigs[selectedJob].description}
                    </p>
                  </div>
                  <Button
                    onClick={() => runJob(selectedJob)}
                    disabled={jobRuns[selectedJob]?.status === 'running'}
                  >
                    {jobRuns[selectedJob]?.status === 'running' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Running...
                      </>
                    ) : currentRun?.status === 'completed' ? (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Run Again
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Run Job
                      </>
                    )}
                  </Button>
                </div>

                {/* Tabs */}
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as typeof activeTab)}
                  className="flex min-h-0 flex-1 flex-col overflow-hidden"
                >
                  <div className="border-b px-4">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="timeline">
                        Timeline
                        {currentRun && (
                          <Badge variant="secondary" className="ml-2">
                            {currentRun.toolCalls.filter((tc) => tc.status === 'success').length}/
                            {currentRun.toolCalls.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="artifact" disabled={!currentRun?.artifact}>
                        Artifact
                      </TabsTrigger>
                      <TabsTrigger value="connectors">Connectors</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="overview" className="h-full flex-1 overflow-auto p-4">
                    {/* Artifact Chaining Callout for Prototype Generation */}
                    {selectedJob === 'prototype_generation' && (
                      <div className="mb-6 rounded-lg bg-gradient-to-r from-cobalt-50 to-indigo-50 border border-cobalt-200 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cobalt-100">
                            <Layers className="h-4 w-4 text-cobalt-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-cobalt-900">Artifact Chaining</p>
                            <p className="mt-1 text-sm text-cobalt-700">
                              This job uses your PRD artifact as input. Run <strong>PRD Draft</strong> first to create evidence-grounded requirements, then generate a prototype from it—no copy-paste needed.
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-xs text-cobalt-600">
                              <Badge variant="outline" className="border-cobalt-200 bg-white">VoC Report</Badge>
                              <ArrowRight className="h-3 w-3" />
                              <Badge variant="outline" className="border-cobalt-200 bg-white">PRD Draft</Badge>
                              <ArrowRight className="h-3 w-3" />
                              <Badge variant="cobalt">Prototype</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Artifact Chaining Callout for PRD Draft */}
                    {selectedJob === 'prd_draft' && (
                      <div className="mb-6 rounded-lg bg-gradient-to-r from-cobalt-50 to-indigo-50 border border-cobalt-200 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cobalt-100">
                            <Layers className="h-4 w-4 text-cobalt-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-cobalt-900">Artifact Chaining</p>
                            <p className="mt-1 text-sm text-cobalt-700">
                              After running this job, use the PRD artifact as input for <strong>PRD to Prototype</strong> to generate an interactive UI mockup.
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-xs text-cobalt-600">
                              <Badge variant="cobalt">PRD Draft</Badge>
                              <ArrowRight className="h-3 w-3" />
                              <Badge variant="outline" className="border-cobalt-200 bg-white">Prototype</Badge>
                              <ArrowRight className="h-3 w-3" />
                              <Badge variant="outline" className="border-cobalt-200 bg-white">User Testing</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid gap-6 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Data Sources</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {getJobSources(selectedJob).map((source) => (
                              <div
                                key={source.id}
                                className="flex items-center justify-between rounded-md border p-2"
                              >
                                <div className="flex items-center gap-2">
                                  <source.icon className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{source.name}</span>
                                </div>
                                <ConnectorStatusBadge status={source.status} />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Tool Calls</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            {jobConfigs[selectedJob].toolCalls.map((tc) => (
                              <li key={tc.name} className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="border-amber-200 bg-amber-50 text-amber-700"
                                >
                                  Demo
                                </Badge>
                                <span className="font-mono text-muted-foreground">{tc.server}.</span>
                                <span className="font-mono">{tc.name}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="timeline" className="h-full flex-1 overflow-auto p-4">
                    {currentRun ? (
                      <div className="space-y-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">Job Run</CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    currentRun.status === 'completed'
                                      ? 'default'
                                      : currentRun.status === 'running'
                                        ? 'secondary'
                                        : 'destructive'
                                  }
                                >
                                  {currentRun.status}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>ID: {currentRun.id}</span>
                              {currentRun.startedAt && (
                                <span>Started: {currentRun.startedAt.toLocaleTimeString()}</span>
                              )}
                              {currentRun.completedAt && (
                                <span>
                                  Duration:{' '}
                                  {(
                                    (currentRun.completedAt.getTime() -
                                      currentRun.startedAt!.getTime()) /
                                    1000
                                  ).toFixed(1)}
                                  s
                                </span>
                              )}
                            </div>
                            {currentRun.error && (
                              <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">
                                <strong>Error:</strong> {currentRun.error}
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        <div className="space-y-2">
                          {currentRun.toolCalls.map((tc) => (
                            <Card
                              key={tc.id}
                              className={cn(
                                'transition-opacity',
                                tc.status === 'pending' && 'opacity-50'
                              )}
                            >
                              <CardContent className="flex items-center gap-4 py-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                  {tc.status === 'pending' && (
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  {tc.status === 'success' && (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  )}
                                  {tc.status === 'error' && (
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 font-mono text-sm">
                                    <span className="text-muted-foreground">{tc.server}.</span>
                                    {tc.name}
                                    <Badge
                                      variant="outline"
                                      className="border-amber-200 bg-amber-50 text-xs text-amber-700"
                                    >
                                      Demo
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {JSON.stringify(tc.input)}
                                  </div>
                                </div>
                                {tc.durationMs && (
                                  <span className="text-sm text-muted-foreground">
                                    {tc.durationMs}ms
                                  </span>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                          <p className="mt-4 text-sm text-muted-foreground">
                            Run the job to see the tool call timeline.
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="artifact" className="h-full flex-1 overflow-hidden">
                    {currentRun?.artifact ? (
                      <div className="flex h-full flex-col">
                        <div className="border-b">
                          <div className="flex items-center justify-between p-4">
                            <div>
                              <h3 className="font-heading font-semibold">
                                {currentRun.artifact.title}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span>Format: {currentRun.artifact.format}</span>
                                {currentRun.llmMetadata && !currentRun.llmMetadata.isStub && (
                                  <>
                                    <span>•</span>
                                    <span className="text-cobalt-600 font-medium">
                                      Generated by pmkit
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {(currentRun.llmMetadata.latencyMs / 1000).toFixed(1)}s
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => setArtifactModalOpen(true)}>
                                <Expand className="mr-2 h-4 w-4" />
                                Expand
                              </Button>
                              <Button variant="outline" size="sm" onClick={downloadArtifact}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </Button>
                            </div>
                          </div>
                          <div className="border-t bg-amber-50 px-4 py-3">
                            <div className="flex items-start gap-2 text-sm text-amber-800">
                              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                              <div>
                                <p className="font-medium">
                                  {currentRun.llmMetadata?.isStub === false 
                                    ? 'AI-Generated Draft (Real LLM)' 
                                    : 'Draft Proposal (Demo)'}
                                </p>
                                <p className="mt-0.5 text-xs text-amber-700">
                                  Data sources:{' '}
                                  {getJobSources(selectedJob)
                                    .map((s) => `${s.name} (Demo)`)
                                    .join(', ')}
                                </p>
                                <p className="text-xs text-amber-700">
                                  Actions: All outputs are proposals only. Nothing will be written to
                                  external systems.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                          {selectedJob === 'prototype_generation' && currentRun.artifact.content.trim().startsWith('<!DOCTYPE') ? (
                            <div className="h-full">
                              <iframe
                                srcDoc={currentRun.artifact.content}
                                className="w-full h-full min-h-[600px] rounded-lg border bg-white"
                                title="Prototype Preview"
                                sandbox="allow-scripts"
                              />
                            </div>
                          ) : (
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <pre className="whitespace-pre-wrap rounded-lg border bg-card p-4 font-sans text-sm text-foreground">
                                {currentRun.artifact.content}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                          <p className="mt-4 text-sm text-muted-foreground">
                            No artifact generated yet.
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="connectors" className="h-full flex-1 overflow-auto p-4">
                    <div className="space-y-6">
                      <Card className="border-amber-200 bg-amber-50">
                        <CardContent className="flex items-start gap-3 pt-6">
                          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                          <div>
                            <h3 className="font-semibold text-amber-900">Demo Mode - Simulated Data</h3>
                            <p className="mt-1 text-sm text-amber-800">
                              In this demo, all connectors return simulated data. To connect your
                              real Jira, Slack, Gong, and other tools, contact our sales team for
                              enterprise access.
                            </p>
                            <Link
                              href="/contact"
                              className="mt-2 inline-block text-sm font-medium text-amber-900 underline hover:no-underline"
                            >
                              Contact Sales →
                            </Link>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="mb-6">
                        <h4 className="mb-3 text-sm font-medium text-muted-foreground">Tool Integrations</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                          {connectors.filter(c => c.type === 'mcp').map((connector) => (
                            <Card key={connector.id}>
                              <CardContent className="flex items-center justify-between pt-6">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                    <connector.icon className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{connector.name}</p>
                                    <p className="text-xs text-muted-foreground">MCP Connector</p>
                                  </div>
                                </div>
                                <ConnectorStatusBadge status={connector.status} />
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-3 text-sm font-medium text-muted-foreground">AI Crawlers</h4>
                        <div className="grid gap-4 md:grid-cols-1">
                          {connectors.filter(c => c.type === 'crawler').map((connector) => (
                            <Card key={connector.id}>
                              <CardContent className="flex items-center justify-between pt-6">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cobalt-100">
                                    <connector.icon className="h-5 w-5 text-cobalt-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{connector.name}</p>
                                    <p className="text-xs text-muted-foreground">{connector.description}</p>
                                  </div>
                                </div>
                                <ConnectorStatusBadge status={connector.status} />
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </main>
        </div>
      ) : demoView === 'commands' ? (
        // Slack & Teams Commands View
        <main className="flex-1 overflow-auto p-8">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="text-center">
              <h1 className="font-heading text-3xl font-bold">Launch Jobs from Anywhere</h1>
              <p className="mt-2 text-muted-foreground">
                Trigger pmkit jobs from Slack, Teams, or Email. No dashboard required.
              </p>
            </div>

            {/* Status Steps Row */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {/* Step 1: Parsed Intent */}
              <Card className={cn('transition-opacity', !parsedIntent && 'opacity-50')}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cobalt-100 text-xs font-bold text-cobalt-700">
                      1
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">Parsed Intent</p>
                      {parsedIntent ? (
                        <div className="mt-1 space-y-1">
                          <Badge variant="outline" className="text-xs">{parsedIntent.jobName}</Badge>
                          <Badge
                            variant="outline"
                            className={cn(
                              'ml-1 text-xs',
                              parsedIntent.confidence === 'high' && 'border-green-200 bg-green-50 text-green-700',
                              parsedIntent.confidence === 'medium' && 'border-amber-200 bg-amber-50 text-amber-700',
                              parsedIntent.confidence === 'low' && 'border-red-200 bg-red-50 text-red-700'
                            )}
                          >
                            {parsedIntent.confidence}
                          </Badge>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter a command to see the parsed intent
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Job Status */}
              <Card className={cn('transition-opacity', !commandRunId && !isCommandRunning && 'opacity-50')}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cobalt-100 text-xs font-bold text-cobalt-700">
                      2
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">Job Status</p>
                      {isCommandRunning ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Loader2 className="h-3 w-3 animate-spin text-cobalt-600" />
                          <span className="text-xs text-muted-foreground">Running...</span>
                        </div>
                      ) : commandRunId ? (
                        <div className="flex items-center gap-2 mt-1">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">Complete</span>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                          Run a command to see job status
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Draft Response */}
              <Card className={cn('transition-opacity', !draftResponse && 'opacity-50')}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cobalt-100 text-xs font-bold text-cobalt-700">
                      3
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">Draft Response</p>
                        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-[10px] px-1.5 py-0">
                          Proposal Only
                        </Badge>
                      </div>
                      {draftResponse ? (
                        <div className="flex items-center gap-2 mt-1">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">Ready to review</span>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                          Complete a job to see the draft response
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content: Input + Examples | Draft Response */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* Left Column: Channel Selection + Command Input */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Select Channel</CardTitle>
                    <CardDescription>Choose where you want to trigger the job from</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={selectedChannel} onValueChange={(v) => setSelectedChannel(v as Channel)}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="slack" className="flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          Slack
                        </TabsTrigger>
                        <TabsTrigger value="teams" className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Teams
                        </TabsTrigger>
                        <TabsTrigger value="email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Enter Command</CardTitle>
                    <CardDescription>
                      Type a command like you would in {channelNames[selectedChannel]}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <div className="absolute left-3 top-3 flex items-center gap-2 text-muted-foreground">
                        {(() => {
                          const Icon = channelIcons[selectedChannel];
                          return <Icon className="h-4 w-4" />;
                        })()}
                      </div>
                      <Textarea
                        value={command}
                        onChange={(e) => {
                          setCommand(e.target.value);
                          setParsedIntent(null);
                          setDraftResponse(null);
                        }}
                        placeholder={
                          selectedChannel === 'email'
                            ? 'Subject: pmkit: daily brief'
                            : selectedChannel === 'slack'
                            ? '/pmkit run daily brief'
                            : '@pmkit run daily brief'
                        }
                        className="min-h-[100px] pl-10 pt-3"
                      />
                    </div>

                    <Button
                      onClick={handleCommandRun}
                      disabled={!command.trim() || isCommandRunning}
                      className="w-full"
                    >
                      {isCommandRunning ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Running Job...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Run Job
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Draft Response Preview (shown when available) */}
                {draftResponse && (
                  <Card className="border-green-200 bg-green-50/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Draft Response Ready
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {(() => {
                            const Icon = channelIcons[draftResponse.channel];
                            return <Icon className="h-4 w-4" />;
                          })()}
                          <span>Draft {channelNames[draftResponse.channel]} message</span>
                        </div>
                        {draftResponse.subject && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Subject: </span>
                            <span className="font-medium">{draftResponse.subject}</span>
                          </div>
                        )}
                        {draftResponse.recipient && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">To: </span>
                            <span>{draftResponse.recipient}</span>
                          </div>
                        )}
                        <div className="rounded-md border bg-white p-4">
                          <pre className="whitespace-pre-wrap text-sm">{draftResponse.content}</pre>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            This is a draft proposal. Review and approve before posting.
                          </p>
                          <Button variant="outline" size="sm" onClick={() => setDemoView('workflows')}>
                            View in Console
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column: Workflow Examples */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>Workflow Examples</CardTitle>
                  <CardDescription>
                    Click any example to copy it to the command input
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {workflowExamples.map((workflow) => {
                      const Icon = workflow.icon;
                      const exampleCommand = workflow.commands[selectedChannel];
                      return (
                        <div
                          key={workflow.jobType}
                          className="flex items-center justify-between rounded-md border p-2 hover:bg-muted/50 transition-colors group cursor-pointer"
                          onClick={() => handleExampleClick(exampleCommand)}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{workflow.jobName}</p>
                              <p className="text-xs text-muted-foreground font-mono truncate">
                                {exampleCommand}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExampleClick(exampleCommand);
                            }}
                          >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy to input</span>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      ) : demoView === 'crawlers' ? (
        // AI Crawlers View
        <main className="flex-1 overflow-auto p-8">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="text-center">
              <h1 className="font-heading text-3xl font-bold">AI Crawlers</h1>
              <p className="mt-2 text-muted-foreground">
                Monitor social media, web, and news for competitive intelligence and customer insights.
              </p>
            </div>

            {/* How It Works */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>How AI Crawlers Work</CardTitle>
                <CardDescription>
                  Crawlers run asynchronously and return results within minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-4">
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cobalt-100">
                      <span className="text-lg font-bold text-cobalt-600">1</span>
                    </div>
                    <p className="mt-2 font-medium">Configure Keywords</p>
                    <p className="text-sm text-muted-foreground">
                      Set up keywords, competitors, or topics to monitor
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cobalt-100">
                      <span className="text-lg font-bold text-cobalt-600">2</span>
                    </div>
                    <p className="mt-2 font-medium">Start Crawl</p>
                    <p className="text-sm text-muted-foreground">
                      Crawler fetches data from multiple sources
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cobalt-100">
                      <span className="text-lg font-bold text-cobalt-600">3</span>
                    </div>
                    <p className="mt-2 font-medium">Process Results</p>
                    <p className="text-sm text-muted-foreground">
                      AI analyzes and categorizes findings
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cobalt-100">
                      <span className="text-lg font-bold text-cobalt-600">4</span>
                    </div>
                    <p className="mt-2 font-medium">Use in Jobs</p>
                    <p className="text-sm text-muted-foreground">
                      Feed results into VoC, Competitor Research, etc.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Crawler Cards */}
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {/* Social Crawler */}
              <Card className="relative overflow-hidden flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-purple-50 opacity-50" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100">
                      <Hash className="h-6 w-6 text-pink-600" />
                    </div>
                    <div>
                      <CardTitle>Social Crawler</CardTitle>
                      <CardDescription>Reddit, Hacker News</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative flex flex-1 flex-col">
                  <div className="flex-1 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Monitor social platforms for brand mentions, competitor discussions, and customer sentiment.
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">PLATFORMS</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Reddit</Badge>
                        <Badge variant="outline">Hacker News</Badge>
                        <Badge variant="secondary" className="opacity-50">X (Coming Soon)</Badge>
                        <Badge variant="secondary" className="opacity-50">LinkedIn (Coming Soon)</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">EXAMPLE KEYWORDS</p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="cobalt" className="text-xs">notion</Badge>
                        <Badge variant="cobalt" className="text-xs">coda</Badge>
                        <Badge variant="cobalt" className="text-xs">monday.com</Badge>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="mt-4 w-full" 
                    variant="outline"
                    onClick={() => handleCrawlerDemo('social')}
                    disabled={crawlerRunning !== null}
                  >
                    {crawlerRunning === 'social' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Run Demo Crawl
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Web Search Crawler */}
              <Card className="relative overflow-hidden flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <Globe className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>Web Search</CardTitle>
                      <CardDescription>Google, DuckDuckGo</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative flex flex-1 flex-col">
                  <div className="flex-1 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Search the web for competitor pages, pricing changes, and market research.
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">SEARCH ENGINES</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Google</Badge>
                        <Badge variant="outline">DuckDuckGo</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">EXAMPLE QUERIES</p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="cobalt" className="text-xs">notion pricing 2026</Badge>
                        <Badge variant="cobalt" className="text-xs">coda vs notion</Badge>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="mt-4 w-full" 
                    variant="outline"
                    onClick={() => handleCrawlerDemo('web_search')}
                    disabled={crawlerRunning !== null}
                  >
                    {crawlerRunning === 'web_search' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Run Demo Search
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* News Crawler */}
              <Card className="relative overflow-hidden flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-50" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                      <Newspaper className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle>News Crawler</CardTitle>
                      <CardDescription>Industry news & press</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative flex flex-1 flex-col">
                  <div className="flex-1 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Track industry news, press releases, and analyst reports for competitive intelligence.
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">SOURCES</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Google News</Badge>
                        <Badge variant="outline">NewsAPI</Badge>
                        <Badge variant="secondary" className="opacity-50">TechCrunch (Coming Soon)</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">EXAMPLE TOPICS</p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="cobalt" className="text-xs">AI product management</Badge>
                        <Badge variant="cobalt" className="text-xs">SaaS funding</Badge>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="mt-4 w-full" 
                    variant="outline"
                    onClick={() => handleCrawlerDemo('news')}
                    disabled={crawlerRunning !== null}
                  >
                    {crawlerRunning === 'news' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Crawling...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Run Demo Crawl
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Crawler Error */}
            {crawlerError && (
              <Card className="mt-8 border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Error:</span>
                    <span>{crawlerError}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Crawler Results */}
            {crawlerResult && crawlerResult.analysis && (
              <Card className="mt-8 border-cobalt-200 bg-gradient-to-br from-cobalt-50/50 to-background">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-cobalt-600" />
                    <CardTitle>AI Analysis Results</CardTitle>
                    {crawlerResult.metadata && (
                      <Badge variant="outline" className="ml-auto">
                        {crawlerResult.metadata.model}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    Analyzed {crawlerResult.resultCount} results for: {crawlerResult.keywords.join(', ')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Executive Summary */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Executive Summary</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {crawlerResult.analysis.summary}
                    </p>
                  </div>

                  {/* Sentiment Overview */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Sentiment Overview</h4>
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={
                          crawlerResult.analysis.overallSentiment === 'positive' ? 'default' :
                          crawlerResult.analysis.overallSentiment === 'negative' ? 'destructive' :
                          'secondary'
                        }
                        className="capitalize"
                      >
                        {crawlerResult.analysis.overallSentiment}
                      </Badge>
                      <div className="flex-1 flex items-center gap-2 text-xs">
                        <span className="text-green-600">+{crawlerResult.analysis.sentimentBreakdown.positive}%</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden flex">
                          <div 
                            className="bg-green-500 h-full" 
                            style={{ width: `${crawlerResult.analysis.sentimentBreakdown.positive}%` }}
                          />
                          <div 
                            className="bg-gray-400 h-full" 
                            style={{ width: `${crawlerResult.analysis.sentimentBreakdown.neutral}%` }}
                          />
                          <div 
                            className="bg-red-500 h-full" 
                            style={{ width: `${crawlerResult.analysis.sentimentBreakdown.negative}%` }}
                          />
                        </div>
                        <span className="text-red-600">-{crawlerResult.analysis.sentimentBreakdown.negative}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Themes */}
                  {crawlerResult.analysis.themes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Key Themes</h4>
                      <div className="space-y-2">
                        {crawlerResult.analysis.themes.slice(0, 3).map((theme, i) => (
                          <div key={i} className="p-3 rounded-lg border bg-background">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{theme.name}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {theme.mentionCount} mentions
                                </Badge>
                                <Badge 
                                  variant={
                                    theme.sentiment === 'positive' ? 'default' :
                                    theme.sentiment === 'negative' ? 'destructive' :
                                    'secondary'
                                  }
                                  className="text-xs capitalize"
                                >
                                  {theme.sentiment}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{theme.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Insights */}
                  {crawlerResult.analysis.insights.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Key Insights</h4>
                      <div className="space-y-2">
                        {crawlerResult.analysis.insights.slice(0, 3).map((insight, i) => (
                          <div key={i} className="p-3 rounded-lg border bg-background">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge 
                                variant={
                                  insight.type === 'opportunity' ? 'default' :
                                  insight.type === 'threat' ? 'destructive' :
                                  'secondary'
                                }
                                className="text-xs capitalize"
                              >
                                {insight.type.replace('_', ' ')}
                              </Badge>
                              <Badge 
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  insight.priority === 'high' && "border-red-200 text-red-700",
                                  insight.priority === 'medium' && "border-amber-200 text-amber-700"
                                )}
                              >
                                {insight.priority}
                              </Badge>
                            </div>
                            <h5 className="font-medium text-sm">{insight.title}</h5>
                            <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {crawlerResult.analysis.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {crawlerResult.analysis.recommendations.slice(0, 4).map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-cobalt-600 mt-0.5 shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Metadata */}
                  {crawlerResult.metadata && (
                    <div className="pt-3 border-t text-xs text-muted-foreground flex items-center gap-4">
                      <span>Model: {crawlerResult.metadata.model}</span>
                      <span>Latency: {(crawlerResult.metadata.latencyMs / 1000).toFixed(1)}s</span>
                      {crawlerResult.metadata.isStub && (
                        <Badge variant="outline" className="text-xs">Stub Response</Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      ) : null}

      {/* Artifact Fullscreen Modal */}
      <Dialog open={artifactModalOpen} onOpenChange={setArtifactModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="font-heading">
              {currentRun?.artifact?.title || 'Artifact'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto min-h-0">
            {currentRun?.artifact && (
              selectedJob === 'prototype_generation' && currentRun.artifact.content.trim().startsWith('<!DOCTYPE') ? (
                <iframe
                  srcDoc={currentRun.artifact.content}
                  className="w-full h-full min-h-[80vh] rounded-lg border bg-white"
                  title="Prototype Preview"
                  sandbox="allow-scripts"
                />
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert h-full">
                  <pre className="whitespace-pre-wrap rounded-lg border bg-card p-6 font-sans text-sm text-foreground h-full overflow-auto">
                    {currentRun.artifact.content}
                  </pre>
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Sign In Modal */}
      <SignInModal
        open={signInModalOpen}
        onOpenChange={setSignInModalOpen}
        jobsUsed={demoJobCount}
        maxFreeJobs={maxFreeJobs}
      />
    </div>
  );
}

// Loading fallback for Suspense
function ConsolePageLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cobalt-600 border-t-transparent mx-auto" />
        <p className="mt-4 text-sm text-muted-foreground">Loading demo console...</p>
      </div>
    </div>
  );
}

// Wrap with Suspense for useSearchParams
export default function ConsolePage() {
  return (
    <Suspense fallback={<ConsolePageLoading />}>
      <ConsolePageContent />
    </Suspense>
  );
}
