'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle } from 'lucide-react';

// Error messages for different NextAuth error codes
const errorMessages: Record<string, string> = {
  Configuration: 'OAuth is not configured yet. Please use the demo mode below.',
  AccessDenied: 'Access was denied. Please try again or contact support.',
  Verification: 'The verification link has expired or has already been used.',
  OAuthSignin: 'Error starting the sign-in process. Please try again.',
  OAuthCallback: 'Error during the sign-in callback. Please try again.',
  OAuthCreateAccount: 'Could not create your account. Please try again.',
  EmailCreateAccount: 'Could not create your account. Please try again.',
  Callback: 'Error during the sign-in callback. Please try again.',
  OAuthAccountNotLinked: 'This email is already associated with another account.',
  SessionRequired: 'Please sign in to access this page.',
  Default: 'An error occurred during sign-in. Please try again.',
};

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const errorMessage = error ? errorMessages[error] || errorMessages.Default : null;

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  const handleMicrosoftSignIn = () => {
    signIn('azure-ad', { callbackUrl: '/dashboard' });
  };

  // Check if OAuth is not configured (Configuration error)
  const isOAuthNotConfigured = error === 'Configuration';

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="container">
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <Link href="/" className="mb-4 text-2xl font-bold text-cobalt-600">
              pmkit
            </Link>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Log in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Sign-in unavailable</p>
                  <p className="mt-1 text-amber-700">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* OAuth Buttons - disabled if not configured */}
            <Button
              variant="outline"
              className="w-full justify-center gap-2"
              onClick={handleGoogleSignIn}
              disabled={isOAuthNotConfigured}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full justify-center gap-2"
              onClick={handleMicrosoftSignIn}
              disabled={isOAuthNotConfigured}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path fill="#F25022" d="M1 1h10v10H1z" />
                <path fill="#00A4EF" d="M1 13h10v10H1z" />
                <path fill="#7FBA00" d="M13 1h10v10H13z" />
                <path fill="#FFB900" d="M13 13h10v10H13z" />
              </svg>
              Continue with Microsoft
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Demo Mode */}
            <Button className="w-full" variant={isOAuthNotConfigured ? 'default' : 'secondary'} asChild>
              <Link href="/demo/console">Continue as Demo Guest</Link>
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-cobalt-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-cobalt-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <div className="container">
          <Card className="mx-auto max-w-md">
            <CardHeader className="text-center">
              <Link href="/" className="mb-4 text-2xl font-bold text-cobalt-600">
                pmkit
              </Link>
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>Loading...</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    }>
      <LoginContent />
    </Suspense>
  );
}
