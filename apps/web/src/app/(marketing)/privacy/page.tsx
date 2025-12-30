import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'pmkit privacy policy and data handling practices.',
};

export default function PrivacyPage() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-heading text-4xl font-bold">Privacy Policy</h1>
          <p className="mt-4 text-muted-foreground">Last updated: December 29, 2025</p>

          <div className="prose mt-12">
            <h2>1. Introduction</h2>
            <p>
              pmkit ("we", "our", or "us") is committed to protecting your privacy. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your information when
              you use our service.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>Account Information</h3>
            <p>
              When you create an account, we collect your name, email address, and authentication
              credentials from your OAuth provider (Google or Microsoft).
            </p>

            <h3>Integration Data</h3>
            <p>
              When you connect integrations (Jira, Slack, Gong, etc.), we access data from those
              services to run PM workflows. This data is processed in real-time and cached
              temporarily as needed.
            </p>

            <h3>Usage Data</h3>
            <p>
              We collect information about how you use pmkit, including job runs, tool calls, and
              artifact generation. This helps us improve the service.
            </p>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and maintain the pmkit service</li>
              <li>Run PM workflows and generate artifacts</li>
              <li>Improve and optimize the service</li>
              <li>Communicate with you about your account</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>4. Data Sharing</h2>
            <p>
              We do not sell your personal information. We may share data with:
            </p>
            <ul>
              <li>Service providers who help us operate pmkit</li>
              <li>Legal authorities when required by law</li>
              <li>Business partners with your consent</li>
            </ul>

            <h2>5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data, including:
            </p>
            <ul>
              <li>Encryption in transit and at rest</li>
              <li>Access controls and authentication</li>
              <li>Regular security audits</li>
              <li>Audit logging of all data access</li>
            </ul>

            <h2>6. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. You can request deletion
              of your data at any time by contacting us.
            </p>

            <h2>7. Your Rights</h2>
            <p>
              Depending on your location, you may have rights to:
            </p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your data</li>
              <li>Export your data</li>
              <li>Object to processing</li>
            </ul>

            <h2>8. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@getpmkit.com">privacy@getpmkit.com</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

