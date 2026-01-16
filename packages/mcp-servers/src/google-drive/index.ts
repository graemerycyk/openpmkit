import { z } from 'zod';
import { BaseMCPServer } from '@pmkit/mcp';

// ============================================================================
// Google Drive Data Types
// ============================================================================

export const DriveFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  mimeType: z.string(),
  description: z.string().optional(),
  createdAt: z.string(),
  modifiedAt: z.string(),
  modifiedBy: z.object({
    name: z.string(),
    email: z.string(),
  }),
  owners: z.array(
    z.object({
      name: z.string(),
      email: z.string(),
    })
  ),
  parentFolderId: z.string().optional(),
  webViewLink: z.string(),
  size: z.number().optional(),
  starred: z.boolean(),
  shared: z.boolean(),
});

export type DriveFile = z.infer<typeof DriveFileSchema>;

export const DriveFolderSchema = z.object({
  id: z.string(),
  name: z.string(),
  parentFolderId: z.string().optional(),
  createdAt: z.string(),
  modifiedAt: z.string(),
});

export type DriveFolder = z.infer<typeof DriveFolderSchema>;

// ============================================================================
// Mock Google Drive MCP Server
// ============================================================================

export class MockGoogleDriveMCPServer extends BaseMCPServer {
  private mockFiles: Map<string, DriveFile> = new Map();
  private mockFolders: Map<string, DriveFolder> = new Map();

  constructor() {
    super({
      name: 'google-drive',
      description: 'Google Drive integration for documents, spreadsheets, and files',
      version: '1.0.0',
    });

    this.registerTools();
  }

  loadMockData(files: DriveFile[], folders: DriveFolder[]): void {
    this.mockFiles.clear();
    this.mockFolders.clear();

    for (const file of files) {
      this.mockFiles.set(file.id, file);
    }

    for (const folder of folders) {
      this.mockFolders.set(folder.id, folder);
    }
  }

  private registerTools(): void {
    this.registerTool({
      name: 'get_files',
      description: 'Get files from Google Drive',
      inputSchema: z.object({
        folderId: z.string().optional(),
        mimeType: z.string().optional(),
        starred: z.boolean().optional(),
        shared: z.boolean().optional(),
        modifiedAfter: z.string().optional(),
        limit: z.number().optional().default(50),
      }),
      outputSchema: z.object({
        files: z.array(DriveFileSchema),
        total: z.number(),
      }),
      execute: async (input) => {
        let files = Array.from(this.mockFiles.values());

        if (input.folderId) {
          files = files.filter((f) => f.parentFolderId === input.folderId);
        }

        if (input.mimeType) {
          files = files.filter((f) => f.mimeType.includes(input.mimeType!));
        }

        if (input.starred !== undefined) {
          files = files.filter((f) => f.starred === input.starred);
        }

        if (input.shared !== undefined) {
          files = files.filter((f) => f.shared === input.shared);
        }

        if (input.modifiedAfter) {
          const afterDate = new Date(input.modifiedAfter);
          files = files.filter((f) => new Date(f.modifiedAt) >= afterDate);
        }

        // Sort by modified date descending
        files.sort(
          (a, b) =>
            new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
        );

        return {
          files: files.slice(0, input.limit),
          total: files.length,
        };
      },
    });

    this.registerTool({
      name: 'get_file',
      description: 'Get a specific file by ID',
      inputSchema: z.object({ fileId: z.string() }),
      outputSchema: DriveFileSchema.nullable(),
      execute: async (input) => {
        return this.mockFiles.get(input.fileId) || null;
      },
    });

    this.registerTool({
      name: 'get_folders',
      description: 'Get folders from Google Drive',
      inputSchema: z.object({
        parentFolderId: z.string().optional(),
      }),
      outputSchema: z.object({
        folders: z.array(DriveFolderSchema),
        total: z.number(),
      }),
      execute: async (input) => {
        let folders = Array.from(this.mockFolders.values());

        if (input.parentFolderId) {
          folders = folders.filter((f) => f.parentFolderId === input.parentFolderId);
        }

        // Sort by name
        folders.sort((a, b) => a.name.localeCompare(b.name));

        return {
          folders,
          total: folders.length,
        };
      },
    });

    this.registerTool({
      name: 'search_files',
      description: 'Search for files by name or description',
      inputSchema: z.object({
        query: z.string(),
        mimeType: z.string().optional(),
        limit: z.number().optional().default(50),
      }),
      outputSchema: z.array(DriveFileSchema),
      execute: async (input) => {
        const query = input.query.toLowerCase();

        let results = Array.from(this.mockFiles.values()).filter(
          (f) =>
            f.name.toLowerCase().includes(query) ||
            f.description?.toLowerCase().includes(query)
        );

        if (input.mimeType) {
          results = results.filter((f) => f.mimeType.includes(input.mimeType!));
        }

        // Sort by relevance (name match first)
        results.sort((a, b) => {
          const aNameMatch = a.name.toLowerCase().includes(query) ? 1 : 0;
          const bNameMatch = b.name.toLowerCase().includes(query) ? 1 : 0;
          if (aNameMatch !== bNameMatch) return bNameMatch - aNameMatch;
          return (
            new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
          );
        });

        return results.slice(0, input.limit);
      },
    });

    this.registerTool({
      name: 'get_documents',
      description: 'Get Google Docs documents',
      inputSchema: z.object({
        folderId: z.string().optional(),
        starred: z.boolean().optional(),
        limit: z.number().optional().default(50),
      }),
      outputSchema: z.array(DriveFileSchema),
      execute: async (input) => {
        let files = Array.from(this.mockFiles.values()).filter((f) =>
          f.mimeType.includes('document')
        );

        if (input.folderId) {
          files = files.filter((f) => f.parentFolderId === input.folderId);
        }

        if (input.starred !== undefined) {
          files = files.filter((f) => f.starred === input.starred);
        }

        files.sort(
          (a, b) =>
            new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
        );

        return files.slice(0, input.limit);
      },
    });

    this.registerTool({
      name: 'get_spreadsheets',
      description: 'Get Google Sheets spreadsheets',
      inputSchema: z.object({
        folderId: z.string().optional(),
        starred: z.boolean().optional(),
        limit: z.number().optional().default(50),
      }),
      outputSchema: z.array(DriveFileSchema),
      execute: async (input) => {
        let files = Array.from(this.mockFiles.values()).filter((f) =>
          f.mimeType.includes('spreadsheet')
        );

        if (input.folderId) {
          files = files.filter((f) => f.parentFolderId === input.folderId);
        }

        if (input.starred !== undefined) {
          files = files.filter((f) => f.starred === input.starred);
        }

        files.sort(
          (a, b) =>
            new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
        );

        return files.slice(0, input.limit);
      },
    });

    this.registerTool({
      name: 'get_presentations',
      description: 'Get Google Slides presentations',
      inputSchema: z.object({
        folderId: z.string().optional(),
        starred: z.boolean().optional(),
        limit: z.number().optional().default(50),
      }),
      outputSchema: z.array(DriveFileSchema),
      execute: async (input) => {
        let files = Array.from(this.mockFiles.values()).filter((f) =>
          f.mimeType.includes('presentation')
        );

        if (input.folderId) {
          files = files.filter((f) => f.parentFolderId === input.folderId);
        }

        if (input.starred !== undefined) {
          files = files.filter((f) => f.starred === input.starred);
        }

        files.sort(
          (a, b) =>
            new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
        );

        return files.slice(0, input.limit);
      },
    });

    this.registerTool({
      name: 'get_recent_activity',
      description: 'Get recently modified files across all folders',
      inputSchema: z.object({
        daysBack: z.number().optional().default(7),
        limit: z.number().optional().default(20),
      }),
      outputSchema: z.array(DriveFileSchema),
      execute: async (input) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - input.daysBack!);

        const files = Array.from(this.mockFiles.values())
          .filter((f) => new Date(f.modifiedAt) >= cutoffDate)
          .sort(
            (a, b) =>
              new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
          );

        return files.slice(0, input.limit);
      },
    });
  }
}

export const mockGoogleDriveServer = new MockGoogleDriveMCPServer();
