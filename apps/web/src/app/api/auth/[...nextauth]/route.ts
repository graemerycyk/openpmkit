import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import MicrosoftProvider from 'next-auth/providers/azure-ad';
import type { AuthOptions } from 'next-auth';
import { NextRequest } from 'next/server';

// Force dynamic rendering to ensure env vars are read at runtime, not build time
export const dynamic = 'force-dynamic';

// Build auth options as a function to ensure env vars are read at request time
// This is critical because Next.js evaluates module-level code at build time
function getAuthOptions(): AuthOptions {
  const providers = [];

  // Check env vars at runtime
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    );
  }

  if (process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET) {
    providers.push(
      MicrosoftProvider({
        clientId: process.env.AZURE_AD_CLIENT_ID,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
        tenantId: process.env.AZURE_AD_TENANT_ID ?? 'common',
      })
    );
  }

  return {
    providers,
    pages: {
      signIn: '/login',
      error: '/login',
    },
    callbacks: {
      async session({ session, token }) {
        if (session.user && token.sub) {
          session.user.id = token.sub;
        }
        return session;
      },
      async jwt({ token, account }) {
        if (account) {
          token.provider = account.provider;
        }
        return token;
      },
      async redirect({ url, baseUrl }) {
        // After sign in, redirect to dashboard
        if (url.startsWith('/')) return `${baseUrl}${url}`;
        if (url.startsWith(baseUrl)) return url;
        return `${baseUrl}/dashboard`;
      },
    },
    session: {
      strategy: 'jwt',
    },
    debug: process.env.NODE_ENV === 'development',
  };
}

// Create handler that builds options at request time
async function handler(
  req: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  const { nextauth } = await context.params;
  // NextAuth expects the context in a specific format for App Router
  return NextAuth(req, { params: { nextauth } }, getAuthOptions());
}

export { handler as GET, handler as POST };
