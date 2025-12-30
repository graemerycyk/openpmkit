import { z } from 'zod';
import { BaseMCPServer, createProposalTool } from '@pmkit/mcp';

// ============================================================================
// Confluence Data Types
// ============================================================================

export const ConfluencePageSchema = z.object({
  id: z.string(),
  title: z.string(),
  spaceKey: z.string(),
  body: z.string(),
  version: z.number(),
  ancestors: z.array(z.object({ id: z.string(), title: z.string() })),
  labels: z.array(z.string()),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedBy: z.string(),
  updatedAt: z.string(),
});

export type ConfluencePage = z.infer<typeof ConfluencePageSchema>;

export const ConfluenceSpaceSchema = z.object({
  key: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['global', 'personal']),
});

export type ConfluenceSpace = z.infer<typeof ConfluenceSpaceSchema>;

// ============================================================================
// Mock Confluence MCP Server
// ============================================================================

export class MockConfluenceMCPServer extends BaseMCPServer {
  private mockPages: Map<string, ConfluencePage> = new Map();
  private mockSpaces: Map<string, ConfluenceSpace> = new Map();

  constructor() {
    super({
      name: 'confluence',
      description: 'Confluence integration for documentation and knowledge management',
      version: '1.0.0',
    });

    this.registerTools();
  }

  loadMockData(pages: ConfluencePage[], spaces: ConfluenceSpace[]): void {
    this.mockPages.clear();
    this.mockSpaces.clear();

    for (const page of pages) {
      this.mockPages.set(page.id, page);
    }
    for (const space of spaces) {
      this.mockSpaces.set(space.key, space);
    }
  }

  private registerTools(): void {
    // Read tools
    this.registerTool({
      name: 'get_page',
      description: 'Get a Confluence page by ID',
      inputSchema: z.object({ pageId: z.string() }),
      outputSchema: ConfluencePageSchema.nullable(),
      execute: async (input) => {
        return this.mockPages.get(input.pageId) || null;
      },
    });

    this.registerTool({
      name: 'search_pages',
      description: 'Search Confluence pages',
      inputSchema: z.object({
        query: z.string(),
        spaceKey: z.string().optional(),
        maxResults: z.number().optional().default(25),
      }),
      outputSchema: z.object({
        pages: z.array(ConfluencePageSchema),
        total: z.number(),
      }),
      execute: async (input) => {
        let pages = Array.from(this.mockPages.values());

        if (input.spaceKey) {
          pages = pages.filter((p) => p.spaceKey === input.spaceKey);
        }

        // Simple text search
        const query = input.query.toLowerCase();
        pages = pages.filter(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            p.body.toLowerCase().includes(query)
        );

        return {
          pages: pages.slice(0, input.maxResults),
          total: pages.length,
        };
      },
    });

    this.registerTool({
      name: 'get_space_pages',
      description: 'Get all pages in a Confluence space',
      inputSchema: z.object({
        spaceKey: z.string(),
        maxResults: z.number().optional().default(100),
      }),
      outputSchema: z.array(ConfluencePageSchema),
      execute: async (input) => {
        return Array.from(this.mockPages.values())
          .filter((p) => p.spaceKey === input.spaceKey)
          .slice(0, input.maxResults);
      },
    });

    this.registerTool({
      name: 'get_page_children',
      description: 'Get child pages of a Confluence page',
      inputSchema: z.object({ parentId: z.string() }),
      outputSchema: z.array(ConfluencePageSchema),
      execute: async (input) => {
        return Array.from(this.mockPages.values()).filter((p) =>
          p.ancestors.some((a) => a.id === input.parentId)
        );
      },
    });

    // Proposal tools (draft-only)
    this.registerTool(
      createProposalTool(
        'confluence_page',
        'Propose a new Confluence page',
        z.object({
          spaceKey: z.string(),
          title: z.string(),
          body: z.string(),
          parentId: z.string().optional(),
          labels: z.array(z.string()).optional(),
        }),
        'confluence',
        async (input) => {
          const pageId = `page-${Date.now()}`;
          return {
            title: input.title,
            preview: `**${input.title}**\n\n${input.body.substring(0, 500)}${input.body.length > 500 ? '...' : ''}`,
            bundle: {
              spaceKey: input.spaceKey,
              title: input.title,
              body: input.body,
              parentId: input.parentId,
              labels: input.labels || [],
            },
            targetId: pageId,
          };
        }
      )
    );

    this.registerTool(
      createProposalTool(
        'confluence_update',
        'Propose an update to an existing Confluence page',
        z.object({
          pageId: z.string(),
          title: z.string().optional(),
          body: z.string(),
          comment: z.string().optional(),
        }),
        'confluence',
        async (input) => {
          const existingPage = this.mockPages.get(input.pageId);
          const title = input.title || existingPage?.title || 'Unknown Page';

          // Generate a simple diff
          const diff = existingPage
            ? `--- Original\n+++ Updated\n@@ Changes @@\n${input.body.substring(0, 200)}...`
            : undefined;

          return {
            title: `Update: ${title}`,
            preview: input.body.substring(0, 500),
            diff,
            bundle: {
              pageId: input.pageId,
              title: input.title,
              body: input.body,
              comment: input.comment,
              version: existingPage ? existingPage.version + 1 : 1,
            },
            targetId: input.pageId,
          };
        }
      )
    );
  }
}

export const mockConfluenceServer = new MockConfluenceMCPServer();

