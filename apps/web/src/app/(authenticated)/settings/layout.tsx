'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const settingsTabs = [
  { name: 'Profile', href: '/settings/profile' },
  { name: 'Integrations', href: '/settings/integrations' },
  { name: 'Billing', href: '/settings/billing', disabled: true },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account settings and integrations.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex gap-6">
          {settingsTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.disabled ? '#' : tab.href}
              className={cn(
                'border-b-2 pb-3 text-sm font-medium transition-colors',
                pathname === tab.href || pathname.startsWith(tab.href)
                  ? 'border-cobalt-600 text-cobalt-600'
                  : 'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground',
                tab.disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {tab.name}
              {tab.disabled && (
                <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs">Soon</span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
