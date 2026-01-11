import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MailtoButton } from '@/components/ui/mailto-button';
import { Calendar, DollarSign, HelpCircle, Shield, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Sales',
  description: 'Contact the pmkit team for pricing, demos, and enterprise inquiries.',
  openGraph: {
    title: 'Contact pmkit Sales',
    description: 'Contact the pmkit team for pricing, demos, and enterprise inquiries.',
  },
};

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-cobalt-50/50 to-background py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="cobalt" className="mb-4">
              Contact
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              Get in Touch
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Ready to try pmkit? Book a demo, ask about pricing, or get help with any questions.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Book a Demo */}
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-cobalt-100">
                  <Calendar className="h-6 w-6 text-cobalt-600" />
                </div>
                <CardTitle>Book a Demo</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  See pmkit in action with a personalized walkthrough
                </CardDescription>
                <Button asChild>
                  <a href="https://calendar.app.google/6LFQoctmYCQWerEP6" target="_blank" rel="noopener noreferrer">
                    Schedule Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Sales & Pricing */}
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-cobalt-100">
                  <DollarSign className="h-6 w-6 text-cobalt-600" />
                </div>
                <CardTitle>Sales & Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Teams plan, Enterprise pricing, or pilot programs
                </CardDescription>
                <MailtoButton user="sales" className="w-full">
                  Email Sales
                </MailtoButton>
                <a
                  href="https://calendar.app.google/6LFQoctmYCQWerEP6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm text-muted-foreground hover:text-cobalt-600"
                >
                  Or book a call →
                </a>
              </CardContent>
            </Card>

            {/* Support & General */}
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-cobalt-100">
                  <HelpCircle className="h-6 w-6 text-cobalt-600" />
                </div>
                <CardTitle>Questions & Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  General inquiries, partnerships, or help with pmkit
                </CardDescription>
                <MailtoButton user="support" variant="outline" className="w-full">
                  Email Support
                </MailtoButton>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-cobalt-100">
                  <Shield className="h-6 w-6 text-cobalt-600" />
                </div>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Security questionnaires, compliance, or vulnerability reports
                </CardDescription>
                <MailtoButton user="support" variant="outline" className="w-full">
                  Email Security
                </MailtoButton>
                <Link
                  href="/trust"
                  className="mt-3 inline-block text-sm text-muted-foreground hover:text-cobalt-600"
                >
                  View Trust Center →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">Common Questions</h2>
          </div>
          <div className="mx-auto mt-12 max-w-3xl space-y-8">
            <div>
              <h3 className="font-heading text-lg font-semibold">
                How quickly can we get started?
              </h3>
              <p className="mt-2 text-muted-foreground">
                You can try the demo immediately. For production use, most teams are up and running
                within a week after connecting their integrations.
              </p>
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold">
                Do you offer a free trial?
              </h3>
              <p className="mt-2 text-muted-foreground">
                Yes! The demo is free and includes all features. For a trial with your own data,
                contact sales.
              </p>
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold">
                What integrations do you support?
              </h3>
              <p className="mt-2 text-muted-foreground">
                We support Jira, Confluence, Slack, Gong, Zendesk, community platforms, and
                analytics tools. Enterprise customers can request custom connectors.
              </p>
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold">
                Can we deploy on-premise?
              </h3>
              <p className="mt-2 text-muted-foreground">
                Yes, enterprise customers can deploy pmkit on their own infrastructure. Contact
                sales for details.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
