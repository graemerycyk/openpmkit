'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  BarChart3,
  Activity,
  Timer,
  ArrowLeft,
  FileText,
  Users,
  Target,
  GitBranch,
  Wand2,
  Megaphone,
  Presentation,
  Bot,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

// Job type display info
const jobTypeInfo: Record<string, { name: string; icon: typeof FileText; color: string }> = {
  daily_brief: { name: 'Daily Brief', icon: FileText, color: '#4F46E5' },
  meeting_prep: { name: 'Meeting Prep', icon: Users, color: '#0891B2' },
  sprint_review: { name: 'Sprint Review', icon: Clock, color: '#7C3AED' },
  feature_intelligence: { name: 'Feature Intelligence', icon: BarChart3, color: '#059669' },
  competitor_research: { name: 'Competitor Research', icon: Target, color: '#DC2626' },
  roadmap_alignment: { name: 'Roadmap Alignment', icon: GitBranch, color: '#D97706' },
  prd_draft: { name: 'PRD Draft', icon: FileText, color: '#2563EB' },
  prototype_generation: { name: 'Prototype', icon: Wand2, color: '#9333EA' },
  release_notes: { name: 'Release Notes', icon: Megaphone, color: '#E11D48' },
  deck_content: { name: 'Deck Content', icon: Presentation, color: '#0D9488' },
};

interface AnalyticsData {
  summary: {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    pendingJobs: number;
    runningJobs: number;
    successRate: number;
    avgDurationSeconds: number;
    jobsThisWeek: number;
    jobsLastWeek: number;
    weekOverWeekChange: number;
  };
  jobsByType: Record<string, number>;
  jobsOverTime: { date: string; completed: number; failed: number }[];
  recentJobs: {
    id: string;
    type: string;
    status: string;
    createdAt: string;
    completedAt: string | null;
  }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        const responseData = await res.json();

        if (!res.ok) {
          console.error('Analytics API error:', res.status, responseData);
          const errorMsg = responseData.details
            ? `${responseData.error}: ${responseData.details}`
            : responseData.error || `Error: ${res.status}`;
          setError(errorMsg);
          return;
        }

        // Check if we got valid analytics data
        if (responseData && responseData.summary) {
          setData(responseData);
        } else {
          console.error('Invalid analytics data structure:', responseData);
          setError('Invalid data received');
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">No analytics available</h2>
        <p className="text-sm text-muted-foreground">
          {error ? `Error: ${error}` : 'Run some agents to see your analytics here.'}
        </p>
      </div>
    );
  }

  // Prepare pie chart data
  const pieData = Object.entries(data.jobsByType).map(([type, count]) => ({
    name: jobTypeInfo[type]?.name || type,
    value: count,
    color: jobTypeInfo[type]?.color || '#6B7280',
  }));

  // Format duration
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  // Format date for chart
  const formatChartDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-2 text-muted-foreground">
          Track your agent performance and job statistics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-3xl font-bold">{data.summary.totalJobs}</p>
              </div>
              <div className="rounded-lg bg-cobalt-100 p-2">
                <Activity className="h-5 w-5 text-cobalt-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              {data.summary.weekOverWeekChange > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">+{data.summary.weekOverWeekChange}%</span>
                </>
              ) : data.summary.weekOverWeekChange < 0 ? (
                <>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-red-600">{data.summary.weekOverWeekChange}%</span>
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">0%</span>
                </>
              )}
              <span className="text-muted-foreground">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-3xl font-bold">{data.summary.successRate}%</p>
              </div>
              <div className="rounded-lg bg-green-100 p-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {data.summary.completedJobs} completed, {data.summary.failedJobs} failed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Duration</p>
                <p className="text-3xl font-bold">{formatDuration(data.summary.avgDurationSeconds)}</p>
              </div>
              <div className="rounded-lg bg-amber-100 p-2">
                <Timer className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Per completed job
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-3xl font-bold">{data.summary.jobsThisWeek}</p>
              </div>
              <div className="rounded-lg bg-purple-100 p-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              vs {data.summary.jobsLastWeek} last week
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Jobs Over Time Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Jobs Over Time</CardTitle>
            <CardDescription>Completed vs failed jobs in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.jobsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatChartDate}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    labelFormatter={(value) => formatChartDate(value as string)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stackId="1"
                    stroke="#22C55E"
                    fill="#22C55E"
                    fillOpacity={0.6}
                    name="Completed"
                  />
                  <Area
                    type="monotone"
                    dataKey="failed"
                    stackId="1"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.6}
                    name="Failed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Jobs by Type Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Jobs by Agent</CardTitle>
            <CardDescription>Distribution of jobs by agent type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      iconSize={10}
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No jobs yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Jobs</CardTitle>
          <CardDescription>Your most recent agent runs</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bot className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No jobs yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentJobs.map((job) => {
                const info = jobTypeInfo[job.type] || { name: job.type, icon: Bot, color: '#6B7280' };
                const Icon = info.icon;
                return (
                  <div
                    key={job.id}
                    className="flex items-center gap-4 rounded-lg border p-3"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${info.color}20` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: info.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{info.name}</span>
                        {job.status === 'completed' && (
                          <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Completed
                          </Badge>
                        )}
                        {job.status === 'failed' && (
                          <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                            <XCircle className="mr-1 h-3 w-3" />
                            Failed
                          </Badge>
                        )}
                        {job.status === 'running' && (
                          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Running
                          </Badge>
                        )}
                        {job.status === 'pending' && (
                          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                            <Clock className="mr-1 h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(job.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
