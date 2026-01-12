'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SessionMigration } from '@/components/auth/session-migration';
import {
  LayoutDashboard,
  Play,
  FileText,
  User,
  Plug,
  CreditCard,
  LogOut,
  ChevronDown,
  Sparkles,
  Settings,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Try Demo',
    href: '/demo/console',
    icon: Play,
    badge: 'Demo',
  },
  {
    title: 'Artifacts',
    href: '/dashboard/artifacts',
    icon: FileText,
    disabled: true,
    badge: 'Soon',
  },
];

const settingsNavItems = [
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: User,
  },
  {
    title: 'Integrations',
    href: '/settings/integrations',
    icon: Plug,
  },
  {
    title: 'Billing',
    href: '/settings/billing',
    icon: CreditCard,
    disabled: true,
    badge: 'Soon',
  },
];

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    async function checkAdmin() {
      if (status !== 'authenticated') {
        setIsAdmin(false);
        return;
      }
      try {
        const res = await fetch('/api/workbench/run-job');
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.isAdmin === true);
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, [status]);

  return (
    <div className="flex h-screen flex-col">
      {/* Handle session migration from anonymous demo */}
      <SessionMigration />
      {/* Top Header */}
      <header className="flex h-14 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-heading text-xl font-bold text-cobalt-600">pmkit</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button size="sm" asChild className="bg-cobalt-600 hover:bg-cobalt-700 text-white">
            <Link href="/demo/console">
              Try Demo
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cobalt-100 text-cobalt-600">
                <User className="h-4 w-4" />
              </div>
            )}
                <div className="hidden text-left sm:block">
              <p className="text-sm font-medium">{session?.user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/demo/console" className="flex items-center gap-2 cursor-pointer">
                  <Play className="h-4 w-4" />
                  Run Jobs
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
              <DropdownMenuItem asChild>
                <Link href="/settings/profile" className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
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
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/30">
          <ScrollArea className="h-full py-4">
            <div className="px-3">
              {/* Main Navigation */}
              <div className="space-y-1">
                {sidebarNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.disabled ? '#' : item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      pathname === item.href
                        ? 'bg-cobalt-100 text-cobalt-700 font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      item.disabled && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                    {item.badge && (
                      <Badge
                        variant={item.badge === 'Demo' ? 'outline' : 'secondary'}
                        className={cn(
                          'ml-auto text-xs',
                          item.badge === 'Demo' && 'border-amber-200 bg-amber-50 text-amber-700'
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Settings Navigation */}
              <div className="mb-2 px-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Settings
                </h4>
              </div>
              <div className="space-y-1">
                {settingsNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.disabled ? '#' : item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      pathname === item.href || pathname.startsWith(item.href)
                        ? 'bg-cobalt-100 text-cobalt-700 font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      item.disabled && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Upgrade CTA */}
              <div className="rounded-lg border bg-gradient-to-br from-cobalt-50 to-background p-4">
                <div className="flex items-center gap-2 text-cobalt-600">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">Upgrade to Paid Plan</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Connect your real tools and unlock unlimited jobs.
                </p>
                <Button size="sm" className="mt-3 w-full" asChild>
                  <Link href="/pricing">View Plans</Link>
                </Button>
              </div>

              <Separator className="my-4" />

              {/* Sign Out */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container max-w-6xl py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
