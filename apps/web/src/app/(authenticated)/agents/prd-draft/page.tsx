'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  GitBranch,
  Loader2,
  Play,
  Plug,
  Target,
  Users,
} from 'lucide-react';

const PRIORITY_LEVELS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export default function PRDDraftPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [featureName, setFeatureName] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [targetUsers, setTargetUsers] = useState('');
  const [priority, setPriority] = useState('medium');
  const [additionalContext, setAdditionalContext] = useState('');

  // Connection status (would be fetched from API)
  const jiraConnected = false;
  const confluenceConnected = false;
  const slackConnected = false;

  const canRun = featureName.trim() !== '' && problemStatement.trim() !== '';

  const handleRun = async () => {
    if (!canRun) return;

    setIsRunning(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/agents/prd-draft/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featureName: featureName.trim(),
          problemStatement: problemStatement.trim(),
          targetUsers: targetUsers.trim() || undefined,
          priority,
          additionalContext: additionalContext.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(`PRD Draft started! Job ID: ${data.jobId}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to start PRD generation');
      }
    } catch {
      setError('Failed to start. Please try again.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">PRD Draft Agent</h1>
          <p className="text-muted-foreground">
            Generate a Product Requirements Document from VoC data
          </p>
        </div>
        <Badge variant="outline">On-Demand</Badge>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Feature Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Feature Information</CardTitle>
          </div>
          <CardDescription>
            Describe the feature you want to document
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="feature-name">Feature Name *</Label>
              <Input
                id="feature-name"
                placeholder="e.g., Advanced Analytics Dashboard"
                value={featureName}
                onChange={(e) => setFeatureName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_LEVELS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="problem-statement">Problem Statement *</Label>
            <Textarea
              id="problem-statement"
              placeholder="e.g., Users struggle to understand their product usage patterns and cannot make data-driven decisions about which features to invest in..."
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-users">Target Users (optional)</Label>
            <Input
              id="target-users"
              placeholder="e.g., Enterprise admins, Product managers"
              value={targetUsers}
              onChange={(e) => setTargetUsers(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (optional)</Label>
            <Textarea
              id="context"
              placeholder="e.g., This ties into our Q3 enterprise push. Related features include..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Plug className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Data Sources (Optional)</CardTitle>
          </div>
          <CardDescription>
            Connect sources to enrich the PRD with existing context
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Jira */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${jiraConnected ? 'bg-green-100' : 'bg-muted'}`}>
                <GitBranch className={`h-5 w-5 ${jiraConnected ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Jira</span>
                  <Badge variant={jiraConnected ? 'outline' : 'secondary'} className={jiraConnected ? 'border-green-200 bg-green-50 text-green-700 text-xs' : 'text-xs'}>
                    {jiraConnected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Related epics and user stories</p>
              </div>
            </div>
            {!jiraConnected && (
              <Button asChild size="sm" variant="outline">
                <Link href="/settings/integrations">Connect</Link>
              </Button>
            )}
          </div>

          {/* Confluence */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${confluenceConnected ? 'bg-green-100' : 'bg-muted'}`}>
                <FileText className={`h-5 w-5 ${confluenceConnected ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Confluence</span>
                  <Badge variant={confluenceConnected ? 'outline' : 'secondary'} className={confluenceConnected ? 'border-green-200 bg-green-50 text-green-700 text-xs' : 'text-xs'}>
                    {confluenceConnected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Existing PRDs and specs</p>
              </div>
            </div>
            {!confluenceConnected && (
              <Button asChild size="sm" variant="outline">
                <Link href="/settings/integrations">Connect</Link>
              </Button>
            )}
          </div>

          {/* Slack */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${slackConnected ? 'bg-green-100' : 'bg-muted'}`}>
                <Users className={`h-5 w-5 ${slackConnected ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Slack</span>
                  <Badge variant={slackConnected ? 'outline' : 'secondary'} className={slackConnected ? 'border-green-200 bg-green-50 text-green-700 text-xs' : 'text-xs'}>
                    {slackConnected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Customer feedback discussions</p>
              </div>
            </div>
            {!slackConnected && (
              <Button asChild size="sm" variant="outline">
                <Link href="/settings/integrations">Connect</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Output Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">What You'll Get</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Executive summary and problem statement</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>User personas and jobs to be done</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Detailed requirements with acceptance criteria</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Success metrics and KPIs</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Dependencies and risks</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/agents/prd-draft/history">
              <Clock className="mr-2 h-4 w-4" />
              View History
            </Link>
          </Button>
        </div>
        <Button onClick={handleRun} disabled={isRunning || !canRun}>
          {isRunning ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Generate PRD
        </Button>
      </div>
    </div>
  );
}
