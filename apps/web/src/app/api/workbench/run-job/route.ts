import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getLLMService, type JobType } from '@pmkit/core';
import { executeJob, PROMPT_TEMPLATES, type PromptContext } from '@pmkit/prompts';
import { isAdminEmail } from '@/lib/admin';

// Max output tokens per job type
// Standard jobs: 12,288 tokens (~9K words) - sufficient for detailed markdown
// Prototype: 24,000 tokens - needed for complete HTML with inline CSS/JS
const JOB_MAX_TOKENS: Record<JobType, number> = {
  daily_brief: 12288,
  meeting_prep: 12288,
  voc_clustering: 12288,
  competitor_research: 12288,
  roadmap_alignment: 12288,
  prd_draft: 12288,
  sprint_review: 12288,
  prototype_generation: 24000,
  release_notes: 12288,
  deck_content: 12288,
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    if (!isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { jobType, context } = body as {
      jobType: JobType;
      context: Record<string, string>;
    };

    // Validate job type
    if (!PROMPT_TEMPLATES[jobType]) {
      return NextResponse.json(
        { error: `Invalid job type: ${jobType}` },
        { status: 400 }
      );
    }

    // Build prompt context from user-provided data
    const promptContext: PromptContext = {
      tenantName: context.tenantName || 'My Company',
      productName: context.productName || 'My Product',
      currentDate: new Date().toISOString().split('T')[0],
      userName: session.user.name || 'PM',
      // Spread all user-provided context fields
      ...context,
    };

    // Get LLM service
    // Note: Workbench uses production LLM key, not demo rate-limited key
    const llmService = getLLMService();
    const maxTokens = JOB_MAX_TOKENS[jobType] || 12288;

    console.log(`[Workbench] Running ${jobType} job for ${session.user.email}`);

    const result = await executeJob(
      llmService,
      'workbench', // Special tenant ID for workbench (uses prod key)
      jobType,
      promptContext,
      {
        maxTokens,
        temperature: 0.7,
      }
    );

    console.log(`[Workbench] Job completed: ${result.model}, ${result.latencyMs}ms`);

    return NextResponse.json({
      success: true,
      content: result.content,
      metadata: {
        model: result.model,
        usage: result.usage,
        latencyMs: result.latencyMs,
        estimatedCostUsd: result.estimatedCostUsd,
        isStub: result.isStub,
      },
    });
  } catch (error) {
    console.error('Workbench job execution error:', error);

    // Extract detailed error info
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Log detailed error for debugging
    console.error('Detailed error:', {
      message: errorMessage,
      stack: errorStack,
    });

    return NextResponse.json(
      {
        error: 'Failed to execute job',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check workbench status
// Returns isAdmin: false for unauthenticated or non-admin users (no 401)
export async function GET() {
  try {
    const session = await getServerSession();
    
    // Return isAdmin: false for unauthenticated users (don't throw 401)
    if (!session?.user?.email) {
      return NextResponse.json({
        isAdmin: false,
      });
    }

    const isAdmin = isAdminEmail(session.user.email);
    
    // Only include model info for admin users
    if (isAdmin) {
      const llmService = getLLMService();
      const modelInfo = llmService.getModelForTenant('workbench');
      
      return NextResponse.json({
        isAdmin: true,
        model: {
          id: modelInfo.id,
          name: modelInfo.name,
          description: modelInfo.description,
        },
        isUsingStubs: llmService.isUsingStubs(),
      });
    }

    // Non-admin authenticated user
    return NextResponse.json({
      isAdmin: false,
    });
  } catch {
    return NextResponse.json(
      { isAdmin: false, error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
