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
  Loader2,
  Play,
  Presentation,
  Target,
} from 'lucide-react';
import { DataSourcesCard } from '@/components/agents/data-sources-card';

const DECK_TYPES = [
  { value: 'qbr', label: 'Quarterly Business Review' },
  { value: 'executive', label: 'Executive Update' },
  { value: 'product_launch', label: 'Product Launch' },
  { value: 'roadmap', label: 'Roadmap Presentation' },
  { value: 'strategy', label: 'Strategy Overview' },
  { value: 'customer', label: 'Customer Presentation' },
];

const AUDIENCES = [
  { value: 'executive', label: 'Executive Team' },
  { value: 'board', label: 'Board of Directors' },
  { value: 'customer', label: 'Customer/Prospect' },
  { value: 'team', label: 'Internal Team' },
  { value: 'stakeholder', label: 'Stakeholders' },
];

export default function DeckContentPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [deckType, setDeckType] = useState('qbr');
  const [audience, setAudience] = useState('executive');
  const [keyMessages, setKeyMessages] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  // Connection status (would be fetched from API)
  // In production, this would come from an API call to /api/connectors
  const connectedSources = [
    { key: 'jira' as const, connected: false },
    { key: 'confluence' as const, connected: false },
    { key: 'slack' as const, connected: false },
    { key: 'gong' as const, connected: false },
    { key: 'google_drive' as const, connected: false },
  ];

  const canRun = title.trim() !== '';

  const handleRun = async () => {
    if (!canRun) return;

    setIsRunning(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/agents/deck-content/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          deckType,
          audience,
          keyMessages: keyMessages.trim() || undefined,
          additionalContext: additionalContext.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(`Deck Content generation started! Job ID: ${data.jobId}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to start deck generation');
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
          <h1 className="font-heading text-2xl font-bold">Deck Content Agent</h1>
          <p className="text-muted-foreground">
            Generate content for presentations and decks
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

      {/* Deck Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Presentation className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Deck Information</CardTitle>
          </div>
          <CardDescription>
            Define the presentation you want to create
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Deck Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Q1 2024 Product Update"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deck-type">Deck Type</Label>
              <Select value={deckType} onValueChange={setDeckType}>
                <SelectTrigger id="deck-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DECK_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Label htmlFor="key-messages">Key Messages (optional)</Label>
            <Textarea
              id="key-messages"
              placeholder="e.g.,
• Highlight Q1 achievements
• Discuss upcoming roadmap
• Address customer feedback themes"
              value={keyMessages}
              onChange={(e) => setKeyMessages(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (optional)</Label>
            <Textarea
              id="context"
              placeholder="Any specific data points, metrics, or topics to include..."
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
        description="Pull data from connected tools to enrich the deck"
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
              <span>Slide-by-slide content outline</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Key talking points per slide</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Data visualizations suggestions</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Executive summary and narrative</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Speaker notes and Q&A prep</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/agents/deck-content/history">
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
          Generate Content
        </Button>
      </div>
    </div>
  );
}
