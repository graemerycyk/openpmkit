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
import { Checkbox } from '@/components/ui/checkbox';
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
  Megaphone,
  Play,
  Plug,
  Target,
} from 'lucide-react';

const AUDIENCES = [
  { value: 'all', label: 'All Users' },
  { value: 'internal', label: 'Internal Team' },
  { value: 'enterprise', label: 'Enterprise Customers' },
  { value: 'developers', label: 'Developers/API Users' },
];

export default function ReleaseNotesPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [version, setVersion] = useState('');
  const [releaseName, setReleaseName] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [audience, setAudience] = useState('all');
  const [highlights, setHighlights] = useState('');
  const [includeJira, setIncludeJira] = useState(true);

  // Connection status (would be fetched from API)
  const jiraConnected = false;
  const confluenceConnected = false;

  const canRun = version.trim() !== '';

  const handleRun = async () => {
    if (!canRun) return;

    setIsRunning(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/agents/release-notes/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: version.trim(),
          releaseName: releaseName.trim() || undefined,
          releaseDate: releaseDate || undefined,
          audience,
          highlights: highlights.trim() || undefined,
          includeJira: includeJira && jiraConnected,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(`Release Notes started! Job ID: ${data.jobId}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to start release notes generation');
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
          <h1 className="font-heading text-2xl font-bold">Release Notes Agent</h1>
          <p className="text-muted-foreground">
            Draft release notes from Jira releases
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

      {/* Release Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Release Information</CardTitle>
          </div>
          <CardDescription>
            Define the release you want to document
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="version">Version Number *</Label>
              <Input
                id="version"
                placeholder="e.g., 2.4.0, v3.1"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="release-name">Release Name (optional)</Label>
              <Input
                id="release-name"
                placeholder="e.g., Phoenix, Summer Update"
                value={releaseName}
                onChange={(e) => setReleaseName(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="release-date">Release Date</Label>
              <Input
                id="release-date"
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger id="audience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCES.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="highlights">Key Highlights (optional)</Label>
            <Textarea
              id="highlights"
              placeholder="e.g., Major performance improvements, new dashboard features, critical security fixes..."
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
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
            <CardTitle className="text-lg">Data Sources</CardTitle>
          </div>
          <CardDescription>
            Pull release information from connected tools
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Jira */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="include-jira"
                checked={includeJira}
                onCheckedChange={(checked) => setIncludeJira(!!checked)}
                disabled={!jiraConnected}
              />
              <div className={`rounded-lg p-2 ${jiraConnected ? 'bg-green-100' : 'bg-muted'}`}>
                <GitBranch className={`h-5 w-5 ${jiraConnected ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="include-jira" className="font-medium">Jira</Label>
                  <Badge variant={jiraConnected ? 'outline' : 'secondary'} className={jiraConnected ? 'border-green-200 bg-green-50 text-green-700 text-xs' : 'text-xs'}>
                    {jiraConnected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Fix versions, epics, and issues</p>
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
                <p className="text-sm text-muted-foreground">Feature documentation and specs</p>
              </div>
            </div>
            {!confluenceConnected && (
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
              <span>Categorized features (New, Improved, Fixed)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>User-friendly descriptions from technical tickets</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Breaking changes and migration notes</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Known issues and limitations</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Audience-appropriate formatting</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/agents/release-notes/history">
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
          Generate Notes
        </Button>
      </div>
    </div>
  );
}
