import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // If user is authenticated and trying to access login, redirect to dashboard
    if (req.nextUrl.pathname === '/login' && req.nextauth.token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Public routes - always allow
        if (
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/api/demo') ||
          pathname === '/login' ||
          pathname === '/' ||
          pathname.startsWith('/demo') ||
          pathname.startsWith('/blog') ||
          pathname.startsWith('/resources') ||
          pathname.startsWith('/how-it-works') ||
          pathname.startsWith('/pricing') ||
          pathname.startsWith('/contact') ||
          pathname.startsWith('/privacy') ||
          pathname.startsWith('/terms') ||
          pathname.startsWith('/security') ||
          pathname.startsWith('/trust') ||
          pathname.startsWith('/compare') ||
          pathname.startsWith('/invest') ||
          pathname.startsWith('/why-pmkit') ||
          pathname.startsWith('/_next') ||
          pathname.startsWith('/favicon') ||
          pathname.startsWith('/icon') ||
          pathname.startsWith('/apple') ||
          pathname.startsWith('/manifest') ||
          pathname.startsWith('/robots') ||
          pathname.startsWith('/sitemap') ||
          pathname.startsWith('/rss') ||
          pathname.startsWith('/opengraph') ||
          pathname.startsWith('/twitter')
        ) {
          return true;
        }
        
        // Protected routes - require authentication
        if (
          pathname.startsWith('/dashboard') ||
          pathname.startsWith('/settings') ||
          pathname.startsWith('/workbench') ||
          pathname.startsWith('/api/workbench')
        ) {
          return !!token;
        }
        
        // Default: allow
        return true;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
