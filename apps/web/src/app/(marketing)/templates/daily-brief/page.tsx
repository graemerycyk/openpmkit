import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ArrowRight, ArrowLeft, Sunrise, MessageSquare, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Daily Brief Template | pmkit - AI Morning Standup Automation',
  description:
    'Free daily brief template for product managers. Automatically synthesize overnight Slack, Jira, and support updates into a morning brief.',
  keywords: [
    'daily brief template',
    'daily standup template',
    'PM morning briefing',
    'product manager daily update',
    'standup automation',
    'AI daily brief',
  ],
  openGraph: {
    title: 'Daily Brief Template - pmkit',
    description: 'AI-powered daily brief template for product managers.',
    url: `${siteConfig.url}/templates/daily-brief`,
  },
  alternates: {
    canonical: `${siteConfig.url}/templates/daily-brief`,
  },
};

const sections = [
  {
    icon: AlertTriangle,
    title: 'Urgent Items',
    description: 'Escalations, blockers, and high-priority issues that need immediate attention.',
  },
  {
    icon: CheckCircle,
    title: 'Sprint Progress',
    description: 'What shipped yesterday, what\'s in progress, what\'s blocked.',
  },
  {
    icon: MessageSquare,
    title: 'Customer Signal',
    description: 'Key customer conversations from Slack, support, and sales calls.',
  },
  {
    icon: Clock,
    title: 'Today\'s Focus',
    description: 'Recommended priorities based on deadlines and dependencies.',
  },
];

const templateSections = [
  { name: 'TL;DR', description: '2-3 sentence summary of the most important updates.' },
  { name: 'Urgent Items', description: 'Blockers, escalations, and items needing immediate attention.' },
  { name: 'Sprint Progress', description: 'Completed, in-progress, and blocked items.' },
  { name: 'Customer Signal', description: 'Notable customer feedback, requests, or issues.' },
  { name: 'Competitive Intel', description: 'Relevant competitor activity (if configured).' },
  { name: 'Recommended Actions', description: 'Suggested priorities for today.' },
  { name: 'Sources', description: 'Links to original Slack messages, tickets, and issues.' },
];

const faqs = [
  {
    question: 'What is a daily brief?',
    answer: 'A daily brief is a synthesized summary of overnight activity across your PM tools. Instead of checking Slack, Jira, and email separately, you get one document with everything important.',
  },
  {
    question: 'How is this different from Slack digests?',
    answer: 'Slack digests show you messages. pmkit daily briefs synthesize across tools—Slack, Jira, Zendesk, Gong—and highlight what matters for PMs specifically: blockers, customer escalations, sprint progress.',
  },
  {
    question: 'Can I customize which channels are included?',
    answer: 'Yes. You choose which Slack channels, Jira projects, and other sources to include. Focus on customer-facing channels and your product area.',
  },
  {
    question: 'What time does the brief arrive?',
    answer: 'You configure your preferred delivery time (typically 6-10 AM) and timezone. The brief synthesizes activity from the last 24-36 hours.',
  },
  {
    question: 'Does it work on weekends?',
    answer: 'You can configure weekend delivery. Many teams use 36-hour lookback on Monday to capture weekend activity.',
  },
  {
    question: 'How do I get started?',
    answer: 'Connect your Slack workspace, select channels to monitor, set your delivery time, and enable the agent. Briefs will arrive automatically.',
  },
];

export default function DailyBriefTemplatePage() {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
              { '@type': 'ListItem', position: 2, name: 'Templates', item: `${siteConfig.url}/templates` },
              { '@type': 'ListItem', position: 3, name: 'Daily Brief', item: `${siteConfig.url}/templates/daily-brief` },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How to Set Up AI Daily Briefs',
            description: 'Configure automated daily briefs with pmkit',
            step: [
              { '@type': 'HowToStep', position: 1, text: 'Connect your Slack workspace via OAuth' },
              { '@type': 'HowToStep', position: 2, text: 'Select channels to monitor' },
              { '@type': 'HowToStep', position: 3, text: 'Set your preferred delivery time and timezone' },
              { '@type': 'HowToStep', position: 4, text: 'Enable the Daily Brief agent' },
              { '@type': 'HowToStep', position: 5, text: 'Receive briefs automatically every morning' },
            ],
          }),
        }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-cobalt-50/50 to-background py-16 md:py-24">
        <div className="container">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/templates">
                <ArrowLeft className="mr-2 h-4 w-4" />
                All Templates
              </Link>
            </Button>
          </div>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-cobalt-100">
              <Sunrise className="h-8 w-8 text-cobalt-600" />
            </div>
            <Badge variant="cobalt" className="mb-4">
              Template
            </Badge>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Daily Brief Template
              <span className="text-cobalt-600"> Automated</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Start every morning with a synthesized brief of overnight activity.
              Slack, Jira, support tickets—all in one document, delivered automatically.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/demo">
                  Try the Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/resources/daily-brief">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">What's in Your Daily Brief</h2>
            <p className="mt-4 text-muted-foreground">
              Everything a PM needs to start the day, synthesized from your tools.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
            {sections.map((section) => (
              <Card key={section.title}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cobalt-100">
                      <section.icon className="h-5 w-5 text-cobalt-600" />
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Brief Structure */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">Daily Brief Structure</h2>
            <p className="mt-4 text-muted-foreground">
              A consistent format so you always know where to look.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-3xl">
            <Card>
              <CardContent className="p-6">
                <ol className="space-y-4">
                  {templateSections.map((section, index) => (
                    <li key={section.name} className="flex gap-4">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cobalt-100 text-xs font-medium text-cobalt-600">
                        {index + 1}
                      </span>
                      <div>
                        <span className="font-medium">{section.name}</span>
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">How to Set Up Daily Briefs</h2>
            <p className="mt-4 text-muted-foreground">
              Configure once, receive briefs automatically every morning.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-3xl space-y-6">
            {[
              { step: 1, title: 'Connect Slack', description: 'OAuth flow links pmkit to your Slack workspace securely.' },
              { step: 2, title: 'Select Channels', description: 'Choose which channels to monitor—customer, product, engineering.' },
              { step: 3, title: 'Set Delivery Time', description: 'Pick when you want your brief (6-10 AM) and your timezone.' },
              { step: 4, title: 'Enable the Agent', description: 'Turn on the Daily Brief agent. It runs automatically.' },
              { step: 5, title: 'Receive Briefs', description: 'Every morning, a synthesized brief appears in your dashboard.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-cobalt-600 text-sm font-bold text-white">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
                  <p className="mt-1 text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-2xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cobalt-600 py-16 text-white md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">Try Daily Briefs</h2>
            <p className="mt-4 text-cobalt-100">
              See a sample daily brief in the demo, synthesized from mock data.
            </p>
            <div className="mt-8">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/demo">
                  Try the Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
