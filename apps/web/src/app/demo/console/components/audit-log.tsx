'use client';

import { useState } from 'react';
import { Shield, User, Clock, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  actor: {
    id: string;
    name: string;
    role: string;
  };
  resource: {
    type: string;
    id: string;
    name?: string;
  };
  details: Record<string, unknown>;
  result: 'allowed' | 'denied';
}

interface AuditLogProps {
  entries: AuditEntry[];
}

const actionColors: Record<string, string> = {
  'job.start': 'bg-blue-500',
  'job.complete': 'bg-green-500',
  'tool.call': 'bg-purple-500',
  'artifact.create': 'bg-orange-500',
  'proposal.create': 'bg-yellow-500',
  'permission.check': 'bg-gray-500',
};

export function AuditLog({ entries }: AuditLogProps) {
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState<string | null>(null);

  const filteredEntries = filterAction
    ? entries.filter((e) => e.action === filterAction)
    : entries;

  const uniqueActions = [...new Set(entries.map((e) => e.action))];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Audit Log</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filterAction ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setFilterAction(null)}
          >
            <Filter className="mr-1 h-3 w-3" />
            {filterAction || 'All'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filter chips */}
        <div className="mb-4 flex flex-wrap gap-2">
          {uniqueActions.map((action) => (
            <Badge
              key={action}
              variant={filterAction === action ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilterAction(filterAction === action ? null : action)}
            >
              {action}
            </Badge>
          ))}
        </div>

        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
              >
                <button
                  className="w-full text-left"
                  onClick={() =>
                    setExpandedEntry(expandedEntry === entry.id ? null : entry.id)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          actionColors[entry.action] || 'bg-gray-400'
                        }`}
                      />
                      <span className="font-mono text-sm">{entry.action}</span>
                      <Badge
                        variant={entry.result === 'allowed' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {entry.result}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {entry.timestamp.toLocaleTimeString()}
                      {expandedEntry === entry.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {entry.actor.name} ({entry.actor.role})
                    </span>
                    <span>
                      {entry.resource.type}: {entry.resource.name || entry.resource.id}
                    </span>
                  </div>
                </button>

                {expandedEntry === entry.id && (
                  <div className="mt-3 border-t pt-3">
                    <span className="text-xs font-medium text-muted-foreground">Details:</span>
                    <pre className="mt-1 overflow-auto rounded border bg-card p-2 font-mono text-xs text-foreground">
                      {JSON.stringify(entry.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

