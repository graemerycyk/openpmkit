import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/db';
import { isAdminEmail } from '@/lib/admin';

/**
 * Get subscription status for Mac app.
 * Returns the user's subscription tier.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const secret = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'fallback-secret'
    );

    // Verify the token
    let payload;
    try {
      const { payload: p } = await jwtVerify(token, secret);
      payload = p;
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      include: { tenant: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Check if admin (internal plan)
    if (isAdminEmail(user.email)) {
      return NextResponse.json({
        status: 'internal',
        plan: 'Internal',
        expiresAt: null,
      });
    }

    // For now, everyone gets pro access (we'll add billing later)
    // In production, this would check Stripe subscription status
    return NextResponse.json({
      status: 'pro',
      plan: 'Pro',
      expiresAt: null,
    });
  } catch (error) {
    console.error('[Subscription/Status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    );
  }
}
