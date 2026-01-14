import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { decryptTokens } from '@pmkit/core';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's tenant
    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ connectors: [] });
    }

    // Get all connector installs for tenant
    const installs = await prisma.connectorInstall.findMany({
      where: { tenantId: user.tenantId },
      include: {
        credentials: {
          select: {
            encryptedBlob: true,
          },
        },
      },
    });

    const encryptionKey = process.env.CONNECTOR_ENCRYPTION_KEY;

    // Map to response format
    const connectors = installs.map((install) => {
      let workspaceName: string | undefined;

      // Try to extract workspace name from credentials for Slack
      if (install.connectorKey === 'slack' && install.credentials[0] && encryptionKey) {
        try {
          const tokens = decryptTokens(install.credentials[0].encryptedBlob, encryptionKey);
          workspaceName = tokens.teamName;
        } catch {
          // Ignore decryption errors
        }
      }

      return {
        connectorKey: install.connectorKey,
        status: install.status,
        workspaceName,
        createdAt: install.createdAt,
      };
    });

    return NextResponse.json({ connectors });
  } catch (error) {
    console.error('[Connectors API] Error fetching connectors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connectors' },
      { status: 500 }
    );
  }
}
