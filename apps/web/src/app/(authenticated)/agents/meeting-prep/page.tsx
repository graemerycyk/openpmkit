'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Play,
  Target,
  Users,
} from 'lucide-react';
import { DataSourcesCard } from '@/components/agents/data-sources-card';

// Meeting prep timeframes
const TIMEFRAMES = [
  { value: '7', label: 'Last 7 days' },
  { value: '14', label: 'Last 14 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

// Mock upcoming meetings (would come from Google Calendar API)
const UPCOMING_MEETINGS = [
  {
    id: 'meet-1',
    title: 'Quarterly Business Review - Acme Corp',
    datetime: '2024-01-22T14:00:00',
    attendees: ['jane.smith@acme.com', 'john.doe@acme.com'],
    description: 'Q4 review and Q1 planning discussion',
  },
  {
    id: 'meet-2',
    title: 'Product Feedback Session with TechStart',
    datetime: '2024-01-23T10:00:00',
    attendees: ['sarah@techstart.io'],
    description: 'Discuss feature requests and roadmap alignment',
  },
  {
    id: 'meet-3',
    title: 'Renewal Discussion - Global Industries',
    datetime: '2024-01-24T15:30:00',
    attendees: ['mike.johnson@globalind.com', 'lisa.chen@globalind.com'],
    description: 'Annual contract renewal and expansion',
  },
  {
    id: 'meet-4',
    title: 'Onboarding Kickoff - NewCo',
    datetime: '2024-01-25T09:00:00',
    attendees: ['alex@newco.com'],
    description: 'Implementation planning and timeline',
  },
];

export default function MeetingPrepSetupPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [selectedMeeting, setSelectedMeeting] = useState<string>('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [timeframe, setTimeframe] = useState('30');

  // Connection status
  const [connectedSources, setConnectedSources] = useState([
    { key: 'google-calendar' as const, connected: false },
    { key: 'gong' as const, connected: false },
    { key: 'slack' as const, connected: false },
    { key: 'zendesk' as const, connected: false },
    { key: 'jira' as const, connected: false },
    { key: 'confluence' as const, connected: false },
  ]);

  useEffect(() => {
    async function fetchConnectors() {
      try {
        const res = await fetch('/api/connectors');
        if (res.ok) {
          const data = await res.json();
          const connectors = data.connectors || [];
          setConnectedSources((prev) =>
            prev.map((source) => ({
              ...source,
              connected: connectors.some(
                (c: { connectorKey: string; status: string }) =>
                  c.connectorKey === source.key && c.status === 'real'
              ),
            }))
          );
        }
      } catch (err) {
        console.error('Failed to fetch connectors:', err);
      }
    }
    fetchConnectors();
  }, []);

  const calendarConnected = connectedSources.find((s) => s.key === 'google-calendar')?.connected ?? false;

  const canRun = selectedMeeting !== '' && calendarConnected;

  const handleRun = async () => {
    if (!canRun) return;

    setIsRunning(true);
    setError(null);
    setSuccess(null);

    const meeting = UPCOMING_MEETINGS.find((m) => m.id === selectedMeeting);

    try {
      const res = await fetch('/api/agents/meeting-prep/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: selectedMeeting,
          meetingTitle: meeting?.title,
          meetingDatetime: meeting?.datetime,
          attendees: meeting?.attendees,
          meetingDescription: meeting?.description,
          additionalContext,
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

  const selectedMeetingData = UPCOMING_MEETINGS.find((m) => m.id === selectedMeeting);

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

      {/* Select Meeting */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Select Meeting</CardTitle>
          </div>
          <CardDescription>
            Choose an upcoming meeting from your calendar. The agent will infer account and contact details automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!calendarConnected ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-3 font-medium">Connect Google Calendar</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Connect your calendar to see upcoming meetings
              </p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/settings/integrations">Connect Calendar</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="meeting">Upcoming Meetings</Label>
                <Select value={selectedMeeting} onValueChange={setSelectedMeeting}>
                  <SelectTrigger id="meeting">
                    <SelectValue placeholder="Select a meeting..." />
                  </SelectTrigger>
                  <SelectContent>
                    {UPCOMING_MEETINGS.map((meeting) => (
                      <SelectItem key={meeting.id} value={meeting.id}>
                        <div className="flex items-center gap-2">
                          <span>{meeting.title}</span>
                          <span className="text-muted-foreground">
                            {new Date(meeting.datetime).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedMeetingData && (
                <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                  <div>
                    <span className="text-sm font-medium">Meeting</span>
                    <p className="text-sm text-muted-foreground">{selectedMeetingData.title}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium">Date & Time</span>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedMeetingData.datetime).toLocaleString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Attendees</span>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{selectedMeetingData.attendees.length} external</span>
                      </div>
                    </div>
                  </div>
                  {selectedMeetingData.description && (
                    <div>
                      <span className="text-sm font-medium">Description</span>
                      <p className="text-sm text-muted-foreground">{selectedMeetingData.description}</p>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      The agent will identify the account and contacts from the meeting title, attendees, and your connected data sources.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Prep Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Prep Settings</CardTitle>
          </div>
          <CardDescription>
            Configure how far back to look for account context
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timeframe">Look Back Period</Label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger id="timeframe" className="w-[200px]">
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
            <p className="text-xs text-muted-foreground">
              How far back to search for calls, messages, and tickets related to this account
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (optional)</Label>
            <Textarea
              id="context"
              placeholder="e.g., Focus on their recent feature requests, they mentioned budget concerns last call..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <DataSourcesCard
        connectedSources={connectedSources}
        requiredConnectors={['google-calendar']}
        description="The agent will pull account context from your connected sources"
      />

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
