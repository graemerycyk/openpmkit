import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import type { SprintReviewConfig } from '@pmkit/core';

export async function POST() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get agent config
    const agentConfig = await prisma.agentConfig.findUnique({
      where: {
        userId_agentType: {
          userId: user.id,
          agentType: 'sprint_review',
        },
      },
    });

    if (!agentConfig) {
      return NextResponse.json(
        { error: 'Sprint Review not configured. Please set up the agent first.' },
        { status: 400 }
      );
    }

    const configData = agentConfig.config as SprintReviewConfig;

    // Fetch connector installs to check what's connected
    const connectorInstalls = await prisma.connectorInstall.findMany({
      where: {
        tenantId: user.tenantId,
        status: 'real',
      },
      include: {
        credentials: true,
      },
    });

    // Build a map of connected connectors
    type ConnectorInstall = typeof connectorInstalls[number];
    const connectorMap = new Map<string, ConnectorInstall>(
      connectorInstalls.map((c: ConnectorInstall) => [c.connectorKey, c])
    );

    // Check which connectors are connected
    const jiraInstall = connectorMap.get('jira');
    const jiraConnected = jiraInstall && jiraInstall.credentials[0];

    // Jira is required for Sprint Review
    if (!jiraConnected) {
      return NextResponse.json(
        {
          error: 'Jira not connected. Please connect Jira in integrations to run Sprint Review.',
        },
        { status: 400 }
      );
    }

    // Create job record
    const job = await prisma.job.create({
      data: {
        tenantId: user.tenantId,
        type: 'sprint_review',
        status: 'running',
        triggeredBy: user.id,
        config: agentConfig.config as object,
        startedAt: new Date(),
      },
    });

    // Create audit log for job start
    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.id,
        action: 'job_started',
        resourceType: 'job',
        resourceId: job.id,
        details: {
          agentType: 'sprint_review',
          trigger: 'manual',
          config: {
            calendarKeywords: configData.calendarKeywords,
            includeVelocity: configData.includeVelocity,
            includeCarryover: configData.includeCarryover,
          },
        },
      },
    });

    console.log(
      `[Sprint Review] Starting job ${job.id} for user ${user.id}`
    );

    // For now, mark as completed with a placeholder result
    // In the future, this will execute the Sprint Review orchestrator
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        result: {
          message: 'Sprint Review agent execution placeholder - full implementation coming soon',
        },
      },
    });

    // Create placeholder artifact
    const today = new Date();
    const artifactContent = `# Sprint Review - ${today.toLocaleDateString()}

## Overview
Sprint Review agent triggered successfully.

## Configuration
- **Calendar Keywords**: ${configData.calendarKeywords?.join(', ') || 'None configured'}
- **Include Velocity**: ${configData.includeVelocity ? 'Yes' : 'No'}
- **Include Carryover**: ${configData.includeCarryover ? 'Yes' : 'No'}
- **Include Slack Highlights**: ${configData.includeSlackHighlights ? 'Yes' : 'No'}
- **Include Confluence**: ${configData.includeConfluence ? 'Yes' : 'No'}
- **Include Zendesk**: ${configData.includeZendesk ? 'Yes' : 'No'}

## Status
The Sprint Review agent has been triggered. Full automated sprint review generation is coming soon.

---
*Generated at ${today.toISOString()}*
`;

    await prisma.artifact.create({
      data: {
        tenantId: user.tenantId,
        jobId: job.id,
        type: 'sprint_review',
        title: `Sprint Review - ${today.toLocaleDateString()}`,
        format: 'markdown',
        content: artifactContent,
        metadata: {
          status: 'placeholder',
          configuredSources: {
            jira: true,
            slack: configData.includeSlackHighlights,
            confluence: configData.includeConfluence,
            zendesk: configData.includeZendesk,
          },
        },
      },
    });

    // Update agent config lastRunAt
    await prisma.agentConfig.update({
      where: { id: agentConfig.id },
      data: { lastRunAt: new Date() },
    });

    // Create audit log for job completion
    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.id,
        action: 'job_completed',
        resourceType: 'job',
        resourceId: job.id,
        details: { status: 'placeholder' },
      },
    });

    console.log(`[Sprint Review] Job ${job.id} completed (placeholder)`);

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: 'Sprint Review triggered successfully',
    });
  } catch (error) {
    console.error('[Sprint Review Trigger] Error:', error);
    return NextResponse.json({ error: 'Failed to trigger agent' }, { status: 500 });
  }
}
