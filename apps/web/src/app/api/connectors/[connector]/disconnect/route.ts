import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ connector: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { connector } = await params;

    // Get user's tenant
    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find the connector install
    const install = await prisma.connectorInstall.findUnique({
      where: {
        tenantId_connectorKey: {
          tenantId: user.tenantId,
          connectorKey: connector,
        },
      },
    });

    if (!install) {
      return NextResponse.json(
        { error: 'Connector not found' },
        { status: 404 }
      );
    }

    // Delete credentials
    await prisma.connectorCredential.deleteMany({
      where: { installId: install.id },
    });

    // Update status to disabled
    await prisma.connectorInstall.update({
      where: { id: install.id },
      data: { status: 'disabled' },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.id,
        action: 'connector_installed', // Using existing enum value for disconnect
        resourceType: 'connector_install',
        resourceId: connector,
        details: { action: 'disconnected' },
      },
    });

    console.log(`[Connector] Disconnected ${connector} for tenant ${user.tenantId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Connector] Disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect connector' },
      { status: 500 }
    );
  }
}
