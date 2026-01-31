'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu, X, Github, Terminal } from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Blog', href: '/blog' },
  { name: 'Compare', href: '/compare' },
  { name: 'Guides', href: '/guides' },
  { name: 'Integrations', href: '/integrations' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-cobalt-600">openpmkit</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-cobalt-600',
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'text-cobalt-600'
                  : 'text-muted-foreground'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          <Button variant="ghost" asChild>
            <Link href="https://github.com/openpmkit/openpmkit" target="_blank">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Link>
          </Button>
          <Button asChild>
            <Link href="https://www.npmjs.com/package/openpmkit" target="_blank">
              <Terminal className="mr-2 h-4 w-4" />
              npm install
            </Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">Open main menu</span>
          {mobileMenuOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'block rounded-md px-3 py-2 text-base font-medium',
                  pathname === item.href
                    ? 'bg-cobalt-50 text-cobalt-600'
                    : 'text-muted-foreground hover:bg-muted'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-4 flex flex-col space-y-2">
              <Button variant="outline" asChild>
                <Link href="https://github.com/openpmkit/openpmkit" target="_blank" onClick={() => setMobileMenuOpen(false)}>
                  <Github className="mr-2 h-4 w-4" />
                  View on GitHub
                </Link>
              </Button>
              <Button asChild>
                <Link href="https://www.npmjs.com/package/openpmkit" target="_blank" onClick={() => setMobileMenuOpen(false)}>
                  <Terminal className="mr-2 h-4 w-4" />
                  npm install
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
