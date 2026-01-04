import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, Eye, FileCheck, Users, Server } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Security',
  description:
    'Learn about pmkit security practices, data protection, and enterprise-grade governance.',
};

const securityFeatures = [
  {
    icon: Shield,
    title: 'Draft-Only Architecture',
    description:
      'pmkit never writes directly to your systems. All outputs are proposals that require explicit approval before any action is taken.',
  },
  {
    icon: Lock,
    title: 'Encryption',
    description:
      'All data is encrypted in transit using TLS 1.3 and at rest using AES-256. API keys and credentials are stored in secure vaults.',
  },
  {
    icon: Eye,
    title: 'Audit Logging',
    description:
      'Every tool call, job run, and data access is logged with full traceability. Export audit logs for compliance and review.',
  },
  {
    icon: FileCheck,
    title: 'Role-Based Access Control',
    description:
      'Fine-grained RBAC ensures users only access data they need. Simulate permissions before deployment.',
  },
  {
    icon: Users,
    title: 'SSO & OAuth',
    description:
      'Enterprise SSO integration with Google and Microsoft. No passwords stored; authentication delegated to your identity provider.',
  },
  {
    icon: Server,
    title: 'Infrastructure Security',
    description:
      'Hosted on managed cloud infrastructure (Vercel, Neon) with encryption, access controls, and monitoring. SOC 2 certification in progress.',
  },
];

export default function SecurityPage() {
  return (
    <>
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-heading text-4xl font-bold md:text-5xl">
              Enterprise-Grade Security
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              pmkit is built with security and governance at its core. Your data is protected by
              industry-leading practices and transparent controls.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-16">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {securityFeatures.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary" />
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-3xl font-bold">Compliance Status</h2>
            <div className="mt-8 space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">SOC 2 Type II</h3>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    In Progress
                  </span>
                </div>
                <p className="mt-2 text-muted-foreground">
                  We are actively working toward SOC 2 Type II certification. Contact us for our
                  current security questionnaire responses.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">GDPR</h3>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    DPA Available
                  </span>
                </div>
                <p className="mt-2 text-muted-foreground">
                  Data Processing Agreement available on request. Subprocessors listed in our Trust
                  Center. Configurable data retention (default: 90 days). Data subject rights
                  supported via support request.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">Data Residency</h3>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    Enterprise
                  </span>
                </div>
                <p className="mt-2 text-muted-foreground">
                  Enterprise customers can request data residency options. Not all regions available
                  at launch. Contact sales for details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-3xl font-bold">Responsible Disclosure</h2>
            <p className="mt-4 text-muted-foreground">
              We take security seriously and appreciate the work of security researchers. If you
              discover a vulnerability, please report it via our contact form. We will respond
              within 48 hours and work with you to address the issue.
            </p>
            <div className="mt-6">
              <Button variant="outline" asChild>
                <Link href="/contact?subject=security">Report a Vulnerability</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

