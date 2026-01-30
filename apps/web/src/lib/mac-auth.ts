import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/db';

type User = {
  id: string;
  email: string;
  name: string | null;
  tenantId: string;
  role: string;
};

/**
 * Get the authenticated user from either:
 * 1. NextAuth session (web browser)
 * 2. Bearer token (Mac app)
 *
 * Returns null if not authenticated.
 */
export async function getAuthenticatedUser(
  req?: NextRequest
): Promise<User | null> {
  // First, try NextAuth session (for web)
  const session = await getServerSession();
  if (session?.user?.email) {
    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
    });
    if (user) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        tenantId: user.tenantId,
        role: user.role,
      };
    }
  }

  // If no session and we have a request, try Bearer token (for Mac app)
  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const secret = new TextEncoder().encode(
        process.env.NEXTAUTH_SECRET ||
          process.env.JWT_SECRET ||
          'fallback-secret'
      );

      try {
        const { payload } = await jwtVerify(token, secret);
        const user = await prisma.user.findUnique({
          where: { id: payload.sub as string },
        });
        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            tenantId: user.tenantId,
            role: user.role,
          };
        }
      } catch {
        // Token invalid or expired
        return null;
      }
    }
  }

  return null;
}
