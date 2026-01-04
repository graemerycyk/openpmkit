import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agent Console | pmkit Demo',
  description: 'Interactive demo of the pmkit Agent Console with demo enterprise data.',
};

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}

