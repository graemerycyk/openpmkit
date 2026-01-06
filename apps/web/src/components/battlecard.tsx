import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Swords } from 'lucide-react';

export interface BattlecardPoint {
  title: string;
  wins: string[];
  risks: string[];
  counterpunch: string;
}

interface BattlecardProps {
  points: BattlecardPoint[];
}

export function Battlecard({ points }: BattlecardProps) {
  return (
    <div className="space-y-8">
      {points.map((point) => (
        <Card key={point.title} className="overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-lg">{point.title}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 p-6 md:grid-cols-3">
            {/* Wins */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Wins</Badge>
              </div>
              <ul className="space-y-2">
                {point.wins.map((win) => (
                  <li key={win} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-600" />
                    <span>{win}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Risks</Badge>
              </div>
              <ul className="space-y-2">
                {point.risks.map((risk) => (
                  <li key={risk} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-600" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Counterpunch */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Swords className="h-5 w-5 text-cobalt-600" />
                <Badge variant="cobalt">Counterpunch</Badge>
              </div>
              <p className="text-sm">{point.counterpunch}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

