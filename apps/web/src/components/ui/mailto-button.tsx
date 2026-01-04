'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface MailtoButtonProps {
  user: string;
  domain?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

/**
 * Obfuscated mailto button that constructs the email address client-side.
 * Prevents bot scraping of email addresses.
 */
export function MailtoButton({
  user,
  domain = 'getpmkit.com',
  children,
  className,
  size = 'default',
  variant = 'default',
}: MailtoButtonProps) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Construct email client-side to prevent bot scraping
    setEmail(`${user}@${domain}`);
  }, [user, domain]);

  const handleClick = () => {
    if (email) {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={className}
      size={size}
      variant={variant}
    >
      {children}
    </Button>
  );
}

