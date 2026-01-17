'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  Headphones,
  Loader2,
  MessageSquare,
  Play,
  Plug,
  Target,
  Ticket,
  TrendingUp,
} from 'lucide-react';

const TIMEFRAMES = [
  { value: '7', label: 'Last 7 days' },
  { value: '14', label: 'Last 14 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

const CLUSTER_COUNTS = [
  { value: '3', label: '3 clusters' },
  { value: '5', label: '5 clusters' },
  { value: '7', label: '7 clusters' },
  { value: '10', label: '10 clusters' },
];

export default function VoCClusteringPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [timeframe, setTimeframe] = useState('30');
  const [clusterCount, setClusterCount] = useState('5');
  const [minFeedbackCount, setMinFeedbackCount] = useState('10');
  const [includeGong, setIncludeGong] = useState(true);
  const [includeZendesk, setIncludeZendesk] = useState(true);
  const [includeSlack, setIncludeSlack] = useState(true);

  // Connection status (would be fetched from API)
  const gongConnected = false;
  const slackConnected = false;
  const zendeskConnected = false;

  const hasDataSource = gongConnected || slackConnected || zendeskConnected;
  const canRun = hasDataSource;

  const handleRun = async () => {
    if (!canRun) return;

    setIsRunning(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/agents/voc-clustering/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeframeDays: parseInt(timeframe),
          clusterCount: parseInt(clusterCount),
          minFeedbackCount: parseInt(minFeedbackCount),
          sources: {
            gong: includeGong && gongConnected,
            zendesk: includeZendesk && zendeskConnected,
            slack: includeSlack && slackConnected,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(`VoC Clustering started! Job ID: ${data.jobId}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to start clustering');
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
          <h1 className="font-heading text-2xl font-bold">VoC Clustering Agent</h1>
          <p className="text-muted-foreground">
            Cluster customer feedback into themes and identify top issues
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

      {/* Analysis Parameters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Analysis Parameters</CardTitle>
          </div>
          <CardDescription>
            Configure how feedback should be analyzed and clustered
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="timeframe">Time Period</Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger id="timeframe">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEFRAMES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cluster-count">Number of Clusters</Label>
              <Select value={clusterCount} onValueChange={setClusterCount}>
                <SelectTrigger id="cluster-count">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLUSTER_COUNTS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="min-feedback">Min. Feedback Items</Label>
              <Input
                id="min-feedback"
                type="number"
                min="1"
                max="100"
                value={minFeedbackCount}
                onChange={(e) => setMinFeedbackCount(e.target.value)}
              />
            </div>
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
            Select which sources to include in the analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Gong */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="include-gong"
                checked={includeGong}
                onCheckedChange={(checked) => setIncludeGong(!!checked)}
                disabled={!gongConnected}
              />
              <div className={`rounded-lg p-2 ${gongConnected ? 'bg-green-100' : 'bg-muted'}`}>
                <Headphones className={`h-5 w-5 ${gongConnected ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="include-gong" className="font-medium">Gong</Label>
                  <Badge variant={gongConnected ? 'outline' : 'secondary'} className={gongConnected ? 'border-green-200 bg-green-50 text-green-700 text-xs' : 'text-xs'}>
                    {gongConnected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Call recordings and customer feedback</p>
              </div>
            </div>
            {!gongConnected && (
              <Button asChild size="sm" variant="outline">
                <Link href="/settings/integrations">Connect</Link>
              </Button>
            )}
          </div>

          {/* Zendesk */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="include-zendesk"
                checked={includeZendesk}
                onCheckedChange={(checked) => setIncludeZendesk(!!checked)}
                disabled={!zendeskConnected}
              />
              <div className={`rounded-lg p-2 ${zendeskConnected ? 'bg-green-100' : 'bg-muted'}`}>
                <Ticket className={`h-5 w-5 ${zendeskConnected ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="include-zendesk" className="font-medium">Zendesk</Label>
                  <Badge variant={zendeskConnected ? 'outline' : 'secondary'} className={zendeskConnected ? 'border-green-200 bg-green-50 text-green-700 text-xs' : 'text-xs'}>
                    {zendeskConnected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Support tickets and customer issues</p>
              </div>
            </div>
            {!zendeskConnected && (
              <Button asChild size="sm" variant="outline">
                <Link href="/settings/integrations">Connect</Link>
              </Button>
            )}
          </div>

          {/* Slack */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="include-slack"
                checked={includeSlack}
                onCheckedChange={(checked) => setIncludeSlack(!!checked)}
                disabled={!slackConnected}
              />
              <div className={`rounded-lg p-2 ${slackConnected ? 'bg-green-100' : 'bg-muted'}`}>
                <MessageSquare className={`h-5 w-5 ${slackConnected ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="include-slack" className="font-medium">Slack</Label>
                  <Badge variant={slackConnected ? 'outline' : 'secondary'} className={slackConnected ? 'border-green-200 bg-green-50 text-green-700 text-xs' : 'text-xs'}>
                    {slackConnected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Customer feedback channels</p>
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
              <span>Feedback themes clustered by semantic similarity</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Top issues ranked by frequency and impact</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Representative quotes for each cluster</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Trend analysis over time</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Actionable recommendations</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/agents/voc-clustering/history">
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
          Run Clustering
        </Button>
      </div>
    </div>
  );
}
