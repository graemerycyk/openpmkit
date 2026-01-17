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
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Headphones,
  Loader2,
  MessageSquare,
  Play,
  Plug,
  Target,
  Ticket,
} from 'lucide-react';

// Meeting prep timeframes
const TIMEFRAMES = [
  { value: '7', label: 'Last 7 days' },
  { value: '14', label: 'Last 14 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

export default function MeetingPrepSetupPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [accountName, setAccountName] = useState('');
  const [contactName, setContactName] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingContext, setMeetingContext] = useState('');
  const [timeframe, setTimeframe] = useState('30');

  // Connection status (would be fetched from API)
  const gongConnected = false;
  const slackConnected = false;
  const zendeskConnected = false;

  const canRun = accountName.trim() !== '' && (gongConnected || slackConnected || zendeskConnected);

  const handleRun = async () => {
    if (!canRun) return;

    setIsRunning(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/agents/meeting-prep/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountName,
          contactName,
          meetingDate,
          meetingContext,
          timeframeDays: parseInt(timeframe),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(`Meeting Prep started! Job ID: ${data.jobId}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to start meeting prep');
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
          <h1 className="font-heading text-2xl font-bold">Meeting Prep Agent</h1>
          <p className="text-muted-foreground">
            Generate a comprehensive prep pack for customer meetings
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

      {/* Account Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Account Information</CardTitle>
          </div>
          <CardDescription>
            Specify the account and contact for the meeting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="account-name">Account Name *</Label>
              <Input
                id="account-name"
                placeholder="e.g., Acme Corp"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-name">Primary Contact</Label>
              <Input
                id="contact-name"
                placeholder="e.g., Jane Smith"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Meeting Details</CardTitle>
          </div>
          <CardDescription>
            Add context about the upcoming meeting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="meeting-date">Meeting Date</Label>
              <Input
                id="meeting-date"
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeframe">Look Back Period</Label>
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="context">Meeting Context (optional)</Label>
            <Textarea
              id="context"
              placeholder="e.g., Quarterly business review, focusing on expansion opportunities..."
              value={meetingContext}
              onChange={(e) => setMeetingContext(e.target.value)}
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
            The agent will pull data from these connected sources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Gong */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${gongConnected ? 'bg-green-100' : 'bg-muted'}`}>
                <Headphones className={`h-5 w-5 ${gongConnected ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Gong</span>
                  <Badge variant={gongConnected ? 'outline' : 'secondary'} className={gongConnected ? 'border-green-200 bg-green-50 text-green-700 text-xs' : 'text-xs'}>
                    {gongConnected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Call recordings and insights</p>
              </div>
            </div>
            {!gongConnected && (
              <Button asChild size="sm" variant="outline">
                <Link href="/settings/integrations">Connect</Link>
              </Button>
            )}
          </div>

          {/* Slack */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${slackConnected ? 'bg-green-100' : 'bg-muted'}`}>
                <MessageSquare className={`h-5 w-5 ${slackConnected ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Slack</span>
                  <Badge variant={slackConnected ? 'outline' : 'secondary'} className={slackConnected ? 'border-green-200 bg-green-50 text-green-700 text-xs' : 'text-xs'}>
                    {slackConnected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Account discussions and mentions</p>
              </div>
            </div>
            {!slackConnected && (
              <Button asChild size="sm" variant="outline">
                <Link href="/settings/integrations">Connect</Link>
              </Button>
            )}
          </div>

          {/* Zendesk */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${zendeskConnected ? 'bg-green-100' : 'bg-muted'}`}>
                <Ticket className={`h-5 w-5 ${zendeskConnected ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Zendesk</span>
                  <Badge variant={zendeskConnected ? 'outline' : 'secondary'} className={zendeskConnected ? 'border-green-200 bg-green-50 text-green-700 text-xs' : 'text-xs'}>
                    {zendeskConnected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Support tickets and history</p>
              </div>
            </div>
            {!zendeskConnected && (
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
              <span>Account summary with key stakeholders</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Recent call insights and pain points</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Open support tickets and issues</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Suggested talking points</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Risks and opportunities to address</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/agents/meeting-prep/history">
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
          Generate Prep Pack
        </Button>
      </div>
    </div>
  );
}
