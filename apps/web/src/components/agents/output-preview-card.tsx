'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Target } from 'lucide-react';

interface OutputPreviewCardProps {
  /** List of outputs the agent will produce */
  outputs: string[];
  /** Optional custom title */
  title?: string;
}

export function OutputPreviewCard({
  outputs,
  title = "What You'll Get",
}: OutputPreviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {outputs.map((output, index) => (
            <li key={index} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>{output}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
