import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/settings',
  '/workbench',
  '/api/workbench',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Only check auth for protected routes
  if (isProtectedRoute) {
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      // If no token, redirect to login
      if (!token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      // If token check fails (e.g., no secret configured), redirect to login
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If user is authenticated and trying to access login, redirect to dashboard
  if (pathname === '/login') {
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch {
      // Ignore errors for login page - just show the login page
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Only match protected routes and login page
     * This avoids running middleware on public pages entirely
     */
    '/dashboard/:path*',
    '/settings/:path*',
    '/workbench/:path*',
    '/api/workbench/:path*',
    '/login',
  ],
};
