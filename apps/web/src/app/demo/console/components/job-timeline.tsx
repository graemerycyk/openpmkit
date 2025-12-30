'use client';

import { useState } from 'react';
import { CheckCircle, Circle, Loader2, Clock, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ToolCall {
  id: string;
  tool: string;
  server: string;
  input: Record<string, unknown>;
  output?: unknown;
  status: 'pending' | 'running' | 'completed' | 'error';
  duration?: number;
  timestamp: Date;
}

interface JobTimelineProps {
  jobId: string;
  jobName: string;
  toolCalls: ToolCall[];
  status: 'pending' | 'running' | 'completed' | 'error';
  onComplete?: () => void;
}

const serverColors: Record<string, string> = {
  jira: 'bg-blue-500',
  confluence: 'bg-blue-600',
  slack: 'bg-purple-500',
  gong: 'bg-green-500',
  zendesk: 'bg-teal-500',
  analytics: 'bg-orange-500',
  competitor: 'bg-red-500',
  community: 'bg-pink-500',
};

export function JobTimeline({ jobName, toolCalls, status }: JobTimelineProps) {
  const [expandedCall, setExpandedCall] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{jobName}</CardTitle>
        <Badge
          variant={
            status === 'completed'
              ? 'default'
              : status === 'running'
                ? 'secondary'
                : status === 'error'
                  ? 'destructive'
                  : 'outline'
          }
        >
          {status === 'running' && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
          {status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 h-full w-0.5 bg-border" />

          {/* Tool calls */}
          <div className="space-y-4">
            {toolCalls.map((call) => (
              <div key={call.id} className="relative pl-10">
                {/* Timeline dot */}
                <div
                  className={cn(
                    'absolute left-2 top-1 h-5 w-5 rounded-full border-2 border-background',
                    call.status === 'completed'
                      ? serverColors[call.server] || 'bg-primary'
                      : call.status === 'running'
                        ? 'bg-yellow-500'
                        : call.status === 'error'
                          ? 'bg-destructive'
                          : 'bg-muted'
                  )}
                >
                  {call.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4 text-white" />
                  ) : call.status === 'running' ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : call.status === 'error' ? (
                    <Circle className="h-4 w-4 text-white" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                {/* Call content */}
                <button
                  onClick={() => setExpandedCall(expandedCall === call.id ? null : call.id)}
                  className="w-full text-left"
                >
                  <div className="rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {call.server}
                        </Badge>
                        <span className="font-mono text-sm">{call.tool}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {call.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {call.duration}ms
                          </span>
                        )}
                        <ExternalLink className="h-3 w-3" />
                      </div>
                    </div>

                    {expandedCall === call.id && (
                      <div className="mt-3 space-y-2 border-t pt-3">
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Input:</span>
                          <pre className="mt-1 overflow-auto rounded border bg-card p-2 font-mono text-xs text-foreground">
                            {JSON.stringify(call.input, null, 2)}
                          </pre>
                        </div>
                        {call.output !== undefined && (
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">
                              Output:
                            </span>
                            <pre className="mt-1 max-h-40 overflow-auto rounded border bg-card p-2 font-mono text-xs text-foreground">
                              {JSON.stringify(call.output, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

