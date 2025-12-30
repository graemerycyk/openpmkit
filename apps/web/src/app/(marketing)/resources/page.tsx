import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { resources, type ResourcePage } from '@pmkit/content';

export const metadata: Metadata = {
  title: 'Resources',
  description:
    'Learn about product management agents, PM workflows, integrations, and enterprise governance.',
  openGraph: {
    title: 'pmkit Resources',
    description:
      'Learn about product management agents, PM workflows, integrations, and enterprise governance.',
  },
};

const categoryLabels: Record<ResourcePage['category'], string> = {
  agents: 'Agents',
  workflows: 'PM Workflows',
  integrations: 'Integrations',
  governance: 'Governance',
  competitive: 'Competitive Intel',
  voc: 'Voice of Customer',
};

const categoryDescriptions: Record<ResourcePage['category'], string> = {
  agents: 'Learn about AI agents that run PM workflows autonomously.',
  workflows: 'Automate daily briefs, meeting prep, PRDs, and more.',
  integrations: 'Connect pmkit to your existing tools.',
  governance: 'Enterprise security, RBAC, and audit logging.',
  competitive: 'Track competitors and market changes.',
  voc: 'Synthesize customer feedback into actionable themes.',
};

export default function ResourcesPage() {
  const categories = ['agents', 'workflows', 'integrations', 'governance', 'competitive', 'voc'] as const;

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-cobalt-50/50 to-background py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="cobalt" className="mb-4">
              Resources
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              Learn About pmkit
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Guides, tutorials, and deep dives on product management agents, workflows, and
              enterprise governance.
            </p>
          </div>
        </div>
      </section>

      {/* Resources by Category */}
      <section className="py-16 md:py-24">
        <div className="container">
          {categories.map((category) => {
            const categoryResources = resources.filter((r) => r.category === category);
            if (categoryResources.length === 0) return null;

            return (
              <div key={category} className="mb-16 last:mb-0">
                <div className="mb-8">
                  <h2 className="font-heading text-2xl font-bold">
                    {categoryLabels[category]}
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    {categoryDescriptions[category]}
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {categoryResources.map((resource) => (
                    <Link key={resource.slug} href={`/resources/${resource.slug}`}>
                      <Card className="h-full transition-shadow hover:shadow-md">
                        <CardHeader>
                          <Badge variant="outline" className="mb-2 w-fit">
                            {categoryLabels[resource.category]}
                          </Badge>
                          <CardTitle className="text-lg leading-snug">
                            {resource.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="line-clamp-3">
                            {resource.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

