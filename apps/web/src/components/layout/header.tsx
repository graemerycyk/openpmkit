'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Menu, X, User, ChevronDown, LayoutDashboard, Play, Wrench, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

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
  const [isAdmin, setIsAdmin] = useState(false);

  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const isLoading = status === 'loading';

  // Check if user is admin
  useEffect(() => {
    async function checkAdmin() {
      if (!isAuthenticated) {
        setIsAdmin(false);
        return;
      }
      try {
        const res = await fetch('/api/workbench/run-job');
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.isAdmin === true);
        } else {
          // Non-200 response (e.g., 401, 403) - user is not admin
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, [isAuthenticated]);

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
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          ) : isAuthenticated ? (
            <>
              <Button asChild>
                <Link href="/demo/console">Try Demo</Link>
              </Button>
              {/* User dropdown menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span>{session.user?.name?.split(' ')[0] || 'Account'}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/demo/console" className="flex items-center gap-2 cursor-pointer">
                      <Play className="h-4 w-4" />
                      Try Demo
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/workbench" className="flex items-center gap-2 cursor-pointer">
                          <Wrench className="h-4 w-4" />
                          Workbench
                          <span className="ml-auto text-xs text-cobalt-600">Admin</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
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
                      Try Demo
                    </Link>
                  </Button>
                  {isAdmin && (
                    <Button variant="secondary" asChild>
                      <Link href="/workbench" onClick={() => setMobileMenuOpen(false)}>
                        <Wrench className="mr-2 h-4 w-4" />
                        Workbench
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    Sign Out
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
