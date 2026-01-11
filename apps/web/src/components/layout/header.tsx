'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu, X, User } from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Demo', href: '/demo' },
  { name: 'Resources', href: '/resources' },
  { name: 'Blog', href: '/blog' },
  { name: 'Pricing', href: '/pricing' },
];

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const isLoading = status === 'loading';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-cobalt-600">pmkit</span>
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

        {/* Desktop CTA - Session Aware */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          {isLoading ? (
            // Loading state - show placeholder
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          ) : isAuthenticated ? (
            // Authenticated - show dashboard link and user info
            <>
              <Button variant="ghost" asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span>{session.user?.name?.split(' ')[0] || 'Dashboard'}</span>
                </Link>
              </Button>
              <Button asChild>
                <Link href="/demo/console">Run Jobs</Link>
              </Button>
            </>
          ) : (
            // Not authenticated - show login and demo buttons
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/demo">Try Demo</Link>
              </Button>
            </>
          )}
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
              {isAuthenticated ? (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/demo/console" onClick={() => setMobileMenuOpen(false)}>
                      Run Jobs
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      Log in
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/demo" onClick={() => setMobileMenuOpen(false)}>
                      Try Demo
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
