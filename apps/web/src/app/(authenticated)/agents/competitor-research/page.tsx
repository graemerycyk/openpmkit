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
  AlertCircle,
  CheckCircle2,
  Clock,
  Globe,
  Loader2,
  Newspaper,
  Play,
  Search,
  Sword,
  Target,
  TrendingUp,
  Plus,
  X,
} from 'lucide-react';

export default function CompetitorResearchPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [competitors, setCompetitors] = useState<string[]>(['']);
  const [focusAreas, setFocusAreas] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  const addCompetitor = () => {
    if (competitors.length < 5) {
      setCompetitors([...competitors, '']);
    }
  };

  const removeCompetitor = (index: number) => {
    if (competitors.length > 1) {
      setCompetitors(competitors.filter((_, i) => i !== index));
    }
  };

  const updateCompetitor = (index: number, value: string) => {
    const updated = [...competitors];
    updated[index] = value;
    setCompetitors(updated);
  };

  const canRun = competitors.some((c) => c.trim() !== '');

  const handleRun = async () => {
    if (!canRun) return;

    setIsRunning(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/agents/competitor-research/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitors: competitors.filter((c) => c.trim() !== ''),
          focusAreas: focusAreas.trim() || undefined,
          additionalContext: additionalContext.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(`Competitor Research started! Job ID: ${data.jobId}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to start research');
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
          <h1 className="font-heading text-2xl font-bold">Competitor Research Agent</h1>
          <p className="text-muted-foreground">
            Research competitors using web search and news sources
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

      {/* Competitors */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sword className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Competitors to Research</CardTitle>
          </div>
          <CardDescription>
            Add up to 5 competitors to analyze (company names or domains)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {competitors.map((competitor, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`e.g., ${index === 0 ? 'Acme Inc' : index === 1 ? 'competitor.com' : 'Company Name'}`}
                value={competitor}
                onChange={(e) => updateCompetitor(index, e.target.value)}
              />
              {competitors.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCompetitor(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {competitors.length < 5 && (
            <Button variant="outline" size="sm" onClick={addCompetitor}>
              <Plus className="mr-2 h-4 w-4" />
              Add Competitor
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Research Focus */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Research Focus</CardTitle>
          </div>
          <CardDescription>
            Optionally specify what aspects to focus on
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="focus-areas">Focus Areas (optional)</Label>
            <Input
              id="focus-areas"
              placeholder="e.g., pricing, features, market positioning, recent announcements"
              value={focusAreas}
              onChange={(e) => setFocusAreas(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (optional)</Label>
            <Textarea
              id="context"
              placeholder="e.g., We're launching a similar feature next quarter and need to understand the competitive landscape..."
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
            <Search className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Data Sources</CardTitle>
          </div>
          <CardDescription>
            The agent will gather intelligence from these sources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <div className="rounded-lg bg-blue-100 p-2">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <span className="font-medium">Web Search</span>
              <p className="text-sm text-muted-foreground">
                Company websites, product pages, and documentation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <div className="rounded-lg bg-orange-100 p-2">
              <Newspaper className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <span className="font-medium">News & Press</span>
              <p className="text-sm text-muted-foreground">
                Recent news articles, press releases, and announcements
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <div className="rounded-lg bg-purple-100 p-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <span className="font-medium">Social & Community</span>
              <p className="text-sm text-muted-foreground">
                Reddit discussions, Hacker News, and social media
              </p>
            </div>
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
              <span>Company overview and positioning analysis</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Product/feature comparison matrix</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Pricing intelligence (if available)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Recent news and announcements</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Strengths, weaknesses, and opportunities</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/agents/competitor-research/history">
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
          Start Research
        </Button>
      </div>
    </div>
  );
}
