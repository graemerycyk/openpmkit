'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Loader2, Lock, ChevronDown, LayoutDashboard, Play, Wrench, LogOut, Settings, ArrowLeft } from 'lucide-react';

export default function WorkbenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      if (status === 'loading') return;

      if (status === 'unauthenticated') {
        router.push('/login?callbackUrl=/workbench');
        return;
      }

      // Check admin status via API
      try {
        const res = await fetch('/api/workbench/run-job');
        const data = await res.json();
        setIsAdmin(data.isAdmin);
      } catch {
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    }

    checkAdmin();
  }, [status, router]);

  // Loading state
  if (status === 'loading' || checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-cobalt-600" />
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  // Not admin - show access denied
  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold">Access Denied</h1>
            <p className="mt-2 text-muted-foreground">
              The Workbench is only available to admin users.
            </p>
            {session?.user?.email && (
              <p className="mt-1 text-sm text-muted-foreground">
                Signed in as: {session.user.email}
              </p>
            )}
          </div>
          <Button asChild>
            <Link href="/demo/console">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Demo Console
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Admin - show workbench
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-heading text-xl font-bold text-cobalt-600">
              pmkit
            </span>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-semibold">Workbench</span>
            <Badge variant="cobalt" className="text-xs">
              Admin
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button size="sm" asChild className="bg-purple-600 hover:bg-purple-700 text-white">
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
                  <p className="text-sm font-medium">{session?.user?.name || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground">
                    {session?.user?.email}
                  </p>
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
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/workbench" className="flex items-center gap-2 cursor-pointer">
                  <Wrench className="h-4 w-4" />
                  Workbench
                  <span className="ml-auto text-xs text-cobalt-600">Admin</span>
                </Link>
              </DropdownMenuItem>
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

      {/* Main content */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
