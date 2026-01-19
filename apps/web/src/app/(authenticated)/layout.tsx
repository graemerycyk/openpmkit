'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
  User,
  LogOut,
  ChevronDown,
  Settings,
  Wrench,
} from 'lucide-react';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { data: session, status } = useSession();
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
          {/* Hide Demo button for admin users on internal plan */}
          {!isAdmin && (
            <>
              <Button size="sm" asChild className="bg-cobalt-600 hover:bg-cobalt-700 text-white">
                <Link href="/demo/console">
                  Try Demo
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-6" />
            </>
          )}
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
              {!isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/demo/console" className="flex items-center gap-2 cursor-pointer">
                    <Play className="h-4 w-4" />
                    Try Demo
                  </Link>
                </DropdownMenuItem>
              )}
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

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container max-w-6xl py-8">{children}</div>
      </main>
    </div>
  );
}
