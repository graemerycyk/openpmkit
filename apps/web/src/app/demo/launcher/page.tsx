'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageSquare,
  Mail,
  Users,
  ArrowLeft,
  Play,
  CheckCircle2,
  FileText,
  BarChart3,
  Target,
  GitBranch,
  Loader2,
  ArrowRight,
  Info,
  Hash,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Channel = 'slack' | 'teams' | 'email';

type JobType =
  | 'daily_brief'
  | 'meeting_prep'
  | 'voc_clustering'
  | 'competitor_research'
  | 'roadmap_alignment'
  | 'prd_draft'
  | 'sprint_review';

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
};

const exampleCommands: Record<Channel, string[]> = {
  slack: [
    '/pmkit run daily brief',
    '/pmkit prep meeting Globex Corp',
    '@pmkit voc themes last 30 days',
    '/pmkit competitor research',
  ],
  teams: [
    '@pmkit run daily brief',
    '@pmkit meeting prep for Acme Inc',
    '@pmkit roadmap alignment Q1',
  ],
  email: [
    'Subject: pmkit: daily brief',
    'Subject: pmkit: prep meeting Globex',
    'Subject: pmkit: weekly themes',
  ],
};

function parseCommand(input: string, _channel: Channel): ParsedIntent | null {
  const normalizedInput = input.toLowerCase().trim();
  
  // Remove common prefixes
  const cleanedInput = normalizedInput
    .replace(/^\/pmkit\s+/i, '')
    .replace(/^@pmkit\s+/i, '')
    .replace(/^pmkit:\s*/i, '')
    .replace(/^subject:\s*pmkit:\s*/i, '')
    .replace(/^run\s+/i, '');

  // Extract params (account names, time ranges, etc.)
  const params: Record<string, string> = {};
  
  // Extract account/company names
  const accountMatch = cleanedInput.match(/(?:for|prep|meeting)\s+([a-z0-9\s]+?)(?:\s+(?:last|q[1-4]|this|next)|$)/i);
  if (accountMatch) {
    params.account = accountMatch[1].trim();
  }

  // Extract time ranges
  const timeMatch = cleanedInput.match(/last\s+(\d+)\s+(days?|weeks?|months?)/i);
  if (timeMatch) {
    params.timeRange = `${timeMatch[1]} ${timeMatch[2]}`;
  }

  // Extract quarter
  const quarterMatch = cleanedInput.match(/q([1-4])/i);
  if (quarterMatch) {
    params.quarter = `Q${quarterMatch[1]}`;
  }

  // Find matching job type
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

export default function LauncherPage() {
  const [selectedChannel, setSelectedChannel] = useState<Channel>('slack');
  const [command, setCommand] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [parsedIntent, setParsedIntent] = useState<ParsedIntent | null>(null);
  const [draftResponse, setDraftResponse] = useState<DraftResponse | null>(null);
  const [runId, setRunId] = useState<string | null>(null);

  const handleRun = async () => {
    const intent = parseCommand(command, selectedChannel);
    if (!intent) {
      setParsedIntent(null);
      return;
    }

    setParsedIntent(intent);
    setIsRunning(true);
    setDraftResponse(null);
    setRunId(null);

    // Simulate job execution
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newRunId = `run_${Date.now()}`;
    setRunId(newRunId);
    setDraftResponse(generateDraftResponse(intent, selectedChannel));
    setIsRunning(false);
  };

  const handleExampleClick = (example: string) => {
    setCommand(example);
    setParsedIntent(null);
    setDraftResponse(null);
    setRunId(null);
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
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/demo"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Demo
          </Link>
          <span className="font-heading text-xl font-bold">pmkit</span>
          <Badge variant="outline" className="border-cobalt-200 bg-cobalt-50 text-cobalt-700">
            Launcher Demo
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Demo Guest</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cobalt-100 text-sm font-medium text-cobalt-700">
            PM
          </div>
        </div>
      </header>

      {/* Demo Mode Banner */}
      <div className="flex items-center gap-2 border-b bg-amber-50 px-4 py-2 text-sm text-amber-800">
        <Info className="h-4 w-4 shrink-0" />
        <span>
          <strong>Demo Mode:</strong> This launcher simulates Slack/Teams/Email triggers. All responses are draft proposals.{' '}
          <Link href="/contact" className="font-medium underline hover:no-underline">
            Contact Sales
          </Link>{' '}
          to set up real integrations.
        </span>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h1 className="font-heading text-3xl font-bold">Launch Jobs from Anywhere</h1>
            <p className="mt-2 text-muted-foreground">
              Trigger pmkit jobs from Slack, Teams, or Email. No dashboard required.
            </p>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {/* Input Panel */}
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
                    onClick={handleRun}
                    disabled={!command.trim() || isRunning}
                    className="w-full"
                  >
                    {isRunning ? (
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

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Try an example:</p>
                    <div className="flex flex-wrap gap-2">
                      {exampleCommands[selectedChannel].map((example, i) => (
                        <button
                          key={i}
                          onClick={() => handleExampleClick(example)}
                          className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Output Panel */}
            <div className="space-y-6">
              {/* Parsed Intent */}
              <Card className={cn(!parsedIntent && 'opacity-50')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cobalt-100 text-xs font-bold text-cobalt-700">
                      1
                    </span>
                    Parsed Intent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {parsedIntent ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Job Type:</span>
                        <Badge variant="outline">{parsedIntent.jobName}</Badge>
                      </div>
                      {Object.keys(parsedIntent.params).length > 0 && (
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Parameters:</span>
                          <div className="rounded-md bg-muted p-2 text-xs font-mono">
                            {JSON.stringify(parsedIntent.params, null, 2)}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Confidence:</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            parsedIntent.confidence === 'high' && 'border-green-200 bg-green-50 text-green-700',
                            parsedIntent.confidence === 'medium' && 'border-amber-200 bg-amber-50 text-amber-700',
                            parsedIntent.confidence === 'low' && 'border-red-200 bg-red-50 text-red-700'
                          )}
                        >
                          {parsedIntent.confidence}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Enter a command to see the parsed intent
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Job Status */}
              <Card className={cn(!runId && !isRunning && 'opacity-50')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cobalt-100 text-xs font-bold text-cobalt-700">
                      2
                    </span>
                    Job Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isRunning ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin text-cobalt-600" />
                      <div>
                        <p className="font-medium">Running {parsedIntent?.jobName}...</p>
                        <p className="text-sm text-muted-foreground">Collecting data from sources</p>
                      </div>
                    </div>
                  ) : runId ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Job Complete</p>
                          <p className="text-xs text-muted-foreground">Run ID: {runId}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/demo/console">
                          View in Console
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Run a command to see job status
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Draft Response */}
              <Card className={cn(!draftResponse && 'opacity-50')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cobalt-100 text-xs font-bold text-cobalt-700">
                      3
                    </span>
                    Draft Response
                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                      Proposal Only
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {draftResponse ? (
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
                      <div className="rounded-md border bg-muted/30 p-4">
                        <pre className="whitespace-pre-wrap text-sm">{draftResponse.content}</pre>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This is a draft proposal. In production, you would review and approve before posting.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Complete a job to see the draft response
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

