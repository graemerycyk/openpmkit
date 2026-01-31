import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Github, Terminal } from 'lucide-react';

const footerLinks = {
  product: [
    { name: 'GitHub', href: 'https://github.com/openpmkit/openpmkit', external: true },
    { name: 'npm package', href: 'https://www.npmjs.com/package/openpmkit', external: true },
    { name: 'Documentation', href: 'https://github.com/openpmkit/openpmkit#readme', external: true },
  ],
  resources: [
    { name: 'Blog', href: '/blog' },
    { name: 'Guides', href: '/guides' },
    { name: 'Integrations', href: '/integrations' },
  ],
  compare: [
    { name: 'vs Productboard', href: '/compare/productboard' },
    { name: 'vs Jira Product Discovery', href: '/compare/jira-product-discovery' },
    { name: 'vs ChatPRD', href: '/compare/chatprd' },
    { name: 'vs Aha!', href: '/compare/aha' },
    { name: 'vs Linear', href: '/compare/linear' },
    { name: 'vs Notion AI', href: '/compare/notion-ai' },
    { name: 'vs Nalin', href: '/compare/nalin' },
    { name: 'vs Automation Tools', href: '/compare/automation-tools' },
  ],
  community: [
    { name: 'Issues', href: 'https://github.com/openpmkit/openpmkit/issues', external: true },
    { name: 'Discussions', href: 'https://github.com/openpmkit/openpmkit/discussions', external: true },
    { name: 'Contributing', href: 'https://github.com/openpmkit/openpmkit/blob/main/CONTRIBUTING.md', external: true },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12 md:py-16">
        {/* Main footer grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="text-xl font-bold text-cobalt-600">
              openpmkit
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Open-source AI toolkit for Product Managers. 10 autonomous workflows, runs locally.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Link
                href="https://github.com/openpmkit/openpmkit"
                target="_blank"
                className="text-muted-foreground hover:text-cobalt-600"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.npmjs.com/package/openpmkit"
                target="_blank"
                className="text-muted-foreground hover:text-cobalt-600"
              >
                <Terminal className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-heading text-sm font-semibold">Product</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    className="text-sm text-muted-foreground hover:text-cobalt-600"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-heading text-sm font-semibold">Resources</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-cobalt-600"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Compare */}
          <div>
            <h3 className="font-heading text-sm font-semibold">Compare</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.compare.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-cobalt-600"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-heading text-sm font-semibold">Community</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    className="text-sm text-muted-foreground hover:text-cobalt-600"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} openpmkit. MIT License.
          </p>
          <div className="flex items-center space-x-4">
            <Link
              href="https://x.com/openpmkit"
              className="text-muted-foreground hover:text-cobalt-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">X</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Link>
            <Link
              href="https://github.com/openpmkit/openpmkit"
              className="text-muted-foreground hover:text-cobalt-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">GitHub</span>
              <Github className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
