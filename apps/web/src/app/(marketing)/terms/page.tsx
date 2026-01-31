import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Terms of Service | pmkit',
  description: 'pmkit terms of service and usage agreement. Fair use policy, acceptable use, and service terms.',
  keywords: [
    'pmkit terms of service',
    'AI service agreement',
    'product management SaaS terms',
    'fair use policy',
  ],
  openGraph: {
    title: 'pmkit Terms of Service',
    description: 'Service agreement and usage terms for pmkit.',
    url: `${siteConfig.url}/terms`,
  },
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
};

export default function TermsPage() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-heading text-4xl font-bold">Terms of Service</h1>
          <p className="mt-4 text-muted-foreground">Last updated: January 11, 2026</p>

          <div className="prose mt-12">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using pmkit, you agree to be bound by these Terms of Service. If you
              do not agree to these terms, please do not use our service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              openpmkit is a PM toolkit that provides AI-powered workflows for product managers,
              including daily briefs, meeting summaries, PRD drafts, and more. The service
              integrates with third-party tools to aggregate and process data.
            </p>

            <h2>3. Account Registration</h2>
            <p>
              To use pmkit, you must create an account using Google or Microsoft OAuth. You are
              responsible for maintaining the confidentiality of your account and for all
              activities that occur under your account.
            </p>

            <h2>4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the service</li>
              <li>Interfere with or disrupt the service</li>
              <li>Use the service to transmit harmful code</li>
              <li>Reverse engineer or attempt to extract source code</li>
              <li>Use automated systems to exceed fair use limits</li>
              <li>Share account credentials or circumvent seat-based licensing</li>
              <li>Resell or redistribute service outputs without authorization</li>
            </ul>

            <h2>5. Fair Use Policy</h2>
            <p>
              openpmkit subscriptions include generous usage allowances designed for normal business
              use. We reserve the right to limit or suspend accounts that significantly exceed
              typical usage patterns or that we reasonably believe are being used in ways that
              negatively impact service quality for other customers.
            </p>
            <p>
              Usage limits are applied per seat and reset monthly. If you consistently need
              higher limits, please contact us about our Enterprise plan with custom capacity.
            </p>

            <h2>6. Draft-Only Operations</h2>
            <p>
              openpmkit operates on a draft-only basis. All outputs are proposals that require your
              review and approval before any action is taken in connected systems. openpmkit does not
              directly write to external systems without explicit user action.
            </p>

            <h2>7. Intellectual Property</h2>
            <p>
              The openpmkit service, including all content, features, and functionality, is owned by
              openpmkit and protected by intellectual property laws. You retain ownership of your data
              and content processed through the service.
            </p>

            <h2>8. Third-Party Integrations</h2>
            <p>
              openpmkit integrates with third-party services (Jira, Slack, Gong, etc.). Your use of
              these integrations is subject to the terms of service of those third parties. pmkit
              is not responsible for the availability or functionality of third-party services.
            </p>

            <h2>9. Disclaimer of Warranties</h2>
            <p>
              The service is provided "as is" without warranties of any kind. We do not guarantee
              that the service will be uninterrupted, error-free, or meet your specific
              requirements.
            </p>

            <h2>10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, openpmkit shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages arising from your use of the
              service.
            </p>

            <h2>11. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. We will notify you of any material
              changes by posting the new terms on this page.
            </p>

            <h2>12. Contact</h2>
            <p>
              If you have questions about these Terms of Service, please{' '}
              <Link href="/contact" className="text-cobalt-600 hover:underline">
                contact us
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

