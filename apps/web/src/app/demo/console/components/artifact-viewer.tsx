'use client';

import { useState } from 'react';
import { FileText, Download, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Artifact {
  id: string;
  name: string;
  type: 'markdown' | 'json' | 'html';
  content: string;
  sources: string[];
  createdAt: Date;
}

interface ArtifactViewerProps {
  artifacts: Artifact[];
}

export function ArtifactViewer({ artifacts }: ArtifactViewerProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadArtifact = (artifact: Artifact) => {
    const extension = artifact.type === 'markdown' ? 'md' : artifact.type;
    const blob = new Blob([artifact.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.name}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (artifacts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No artifacts generated yet</p>
          <p className="text-sm text-muted-foreground/70">
            Run a job to generate artifacts
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {artifacts.map((artifact) => (
        <Card key={artifact.id}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">{artifact.name}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {artifact.type}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(artifact.id, artifact.content)}
              >
                {copied === artifact.id ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => downloadArtifact(artifact)}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="preview">
              <TabsList className="mb-4">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="source">Source</TabsTrigger>
                <TabsTrigger value="sources">Data Sources</TabsTrigger>
              </TabsList>

              <TabsContent value="preview">
                <div className="prose prose-sm max-h-96 overflow-auto rounded-lg border bg-card p-4 text-foreground">
                  {artifact.type === 'markdown' ? (
                    <div dangerouslySetInnerHTML={{ __html: artifact.content }} />
                  ) : artifact.type === 'json' ? (
                    <pre className="font-mono text-xs text-foreground">{JSON.stringify(JSON.parse(artifact.content), null, 2)}</pre>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: artifact.content }} />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="source">
                <pre className="max-h-96 overflow-auto rounded-lg border bg-card p-4 font-sans text-sm text-foreground">
                  {artifact.content}
                </pre>
              </TabsContent>

              <TabsContent value="sources">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    This artifact was generated from the following data sources:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {artifact.sources.map((source, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

