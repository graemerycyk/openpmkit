import { z } from 'zod';
import {
  GoogleRestMCPServer,
  RestOAuthTokens,
  TokenRefreshCallback,
  buildQueryString,
} from '@pmkit/mcp';
import { DriveFileSchema, DriveFolderSchema, DriveFile, DriveFolder } from './index';

// ============================================================================
// Google Drive API Response Types
// ============================================================================

interface DriveApiFile {
  id: string;
  name: string;
  mimeType: string;
  description?: string;
  createdTime?: string;
  modifiedTime?: string;
  lastModifyingUser?: {
    displayName?: string;
    emailAddress?: string;
  };
  owners?: Array<{
    displayName?: string;
    emailAddress?: string;
  }>;
  parents?: string[];
  webViewLink?: string;
  size?: string;
  starred?: boolean;
  shared?: boolean;
}

interface DriveApiListResponse {
  files?: DriveApiFile[];
  nextPageToken?: string;
}

// ============================================================================
// Real Google Drive MCP Server
// ============================================================================

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

export class RealGoogleDriveMCPServer extends GoogleRestMCPServer {
  constructor(
    tokens: RestOAuthTokens,
    options?: {
      onTokenRefresh?: TokenRefreshCallback;
      timeout?: number;
    }
  ) {
    super(
      {
        name: 'google-drive',
        description: 'Google Drive integration via Google REST API',
        version: '1.0.0',
      },
      tokens,
      options
    );

    this.registerTools();
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
        const queryParts: string[] = ["trashed = false"];

        if (input.folderId) {
          queryParts.push(`'${input.folderId}' in parents`);
        }
        if (input.mimeType) {
          queryParts.push(`mimeType contains '${input.mimeType}'`);
        }
        if (input.starred === true) {
          queryParts.push("starred = true");
        }
        if (input.shared === true) {
          queryParts.push("sharedWithMe = true");
        }
        if (input.modifiedAfter) {
          queryParts.push(`modifiedTime > '${input.modifiedAfter}'`);
        }
        // Exclude folders from file listings
        queryParts.push("mimeType != 'application/vnd.google-apps.folder'");

        const q = queryParts.join(' and ');
        const fields = 'files(id,name,mimeType,description,createdTime,modifiedTime,lastModifyingUser,owners,parents,webViewLink,size,starred,shared)';

        const url = `${DRIVE_API_BASE}/files${buildQueryString({
          q,
          fields,
          pageSize: input.limit,
          orderBy: 'modifiedTime desc',
        })}`;

        const response = await this.get<DriveApiListResponse>(url);

        const files = (response.files ?? []).map((f) => this.transformFile(f));

        return {
          files,
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
        try {
          const fields = 'id,name,mimeType,description,createdTime,modifiedTime,lastModifyingUser,owners,parents,webViewLink,size,starred,shared';
          const url = `${DRIVE_API_BASE}/files/${input.fileId}${buildQueryString({ fields })}`;
          const file = await this.get<DriveApiFile>(url);
          return this.transformFile(file);
        } catch {
          return null;
        }
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
        const queryParts: string[] = [
          "mimeType = 'application/vnd.google-apps.folder'",
          "trashed = false",
        ];

        if (input.parentFolderId) {
          queryParts.push(`'${input.parentFolderId}' in parents`);
        }

        const q = queryParts.join(' and ');
        const fields = 'files(id,name,createdTime,modifiedTime,parents)';

        const url = `${DRIVE_API_BASE}/files${buildQueryString({
          q,
          fields,
          orderBy: 'name',
        })}`;

        const response = await this.get<DriveApiListResponse>(url);

        const folders: DriveFolder[] = (response.files ?? []).map((f) => ({
          id: f.id,
          name: f.name,
          parentFolderId: f.parents?.[0],
          createdAt: f.createdTime ?? new Date().toISOString(),
          modifiedAt: f.modifiedTime ?? new Date().toISOString(),
        }));

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
        const queryParts: string[] = [
          `fullText contains '${input.query.replace(/'/g, "\\'")}'`,
          "trashed = false",
        ];

        if (input.mimeType) {
          queryParts.push(`mimeType contains '${input.mimeType}'`);
        }

        const q = queryParts.join(' and ');
        const fields = 'files(id,name,mimeType,description,createdTime,modifiedTime,lastModifyingUser,owners,parents,webViewLink,size,starred,shared)';

        const url = `${DRIVE_API_BASE}/files${buildQueryString({
          q,
          fields,
          pageSize: input.limit,
        })}`;

        const response = await this.get<DriveApiListResponse>(url);

        return (response.files ?? []).map((f) => this.transformFile(f));
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
        const queryParts: string[] = [
          "mimeType = 'application/vnd.google-apps.document'",
          "trashed = false",
        ];

        if (input.folderId) {
          queryParts.push(`'${input.folderId}' in parents`);
        }
        if (input.starred === true) {
          queryParts.push("starred = true");
        }

        const q = queryParts.join(' and ');
        const fields = 'files(id,name,mimeType,description,createdTime,modifiedTime,lastModifyingUser,owners,parents,webViewLink,size,starred,shared)';

        const url = `${DRIVE_API_BASE}/files${buildQueryString({
          q,
          fields,
          pageSize: input.limit,
          orderBy: 'modifiedTime desc',
        })}`;

        const response = await this.get<DriveApiListResponse>(url);

        return (response.files ?? []).map((f) => this.transformFile(f));
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
        const queryParts: string[] = [
          "mimeType = 'application/vnd.google-apps.spreadsheet'",
          "trashed = false",
        ];

        if (input.folderId) {
          queryParts.push(`'${input.folderId}' in parents`);
        }
        if (input.starred === true) {
          queryParts.push("starred = true");
        }

        const q = queryParts.join(' and ');
        const fields = 'files(id,name,mimeType,description,createdTime,modifiedTime,lastModifyingUser,owners,parents,webViewLink,size,starred,shared)';

        const url = `${DRIVE_API_BASE}/files${buildQueryString({
          q,
          fields,
          pageSize: input.limit,
          orderBy: 'modifiedTime desc',
        })}`;

        const response = await this.get<DriveApiListResponse>(url);

        return (response.files ?? []).map((f) => this.transformFile(f));
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
        const queryParts: string[] = [
          "mimeType = 'application/vnd.google-apps.presentation'",
          "trashed = false",
        ];

        if (input.folderId) {
          queryParts.push(`'${input.folderId}' in parents`);
        }
        if (input.starred === true) {
          queryParts.push("starred = true");
        }

        const q = queryParts.join(' and ');
        const fields = 'files(id,name,mimeType,description,createdTime,modifiedTime,lastModifyingUser,owners,parents,webViewLink,size,starred,shared)';

        const url = `${DRIVE_API_BASE}/files${buildQueryString({
          q,
          fields,
          pageSize: input.limit,
          orderBy: 'modifiedTime desc',
        })}`;

        const response = await this.get<DriveApiListResponse>(url);

        return (response.files ?? []).map((f) => this.transformFile(f));
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

        const q = `modifiedTime > '${cutoffDate.toISOString()}' and trashed = false and mimeType != 'application/vnd.google-apps.folder'`;
        const fields = 'files(id,name,mimeType,description,createdTime,modifiedTime,lastModifyingUser,owners,parents,webViewLink,size,starred,shared)';

        const url = `${DRIVE_API_BASE}/files${buildQueryString({
          q,
          fields,
          pageSize: input.limit,
          orderBy: 'modifiedTime desc',
        })}`;

        const response = await this.get<DriveApiListResponse>(url);

        return (response.files ?? []).map((f) => this.transformFile(f));
      },
    });
  }

  // ============================================================================
  // Transform Drive API response to our schema
  // ============================================================================

  private transformFile(f: DriveApiFile): DriveFile {
    return {
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      description: f.description,
      createdAt: f.createdTime ?? new Date().toISOString(),
      modifiedAt: f.modifiedTime ?? new Date().toISOString(),
      modifiedBy: {
        name: f.lastModifyingUser?.displayName ?? 'Unknown',
        email: f.lastModifyingUser?.emailAddress ?? 'unknown@example.com',
      },
      owners: (f.owners ?? []).map((o) => ({
        name: o.displayName ?? 'Unknown',
        email: o.emailAddress ?? 'unknown@example.com',
      })),
      parentFolderId: f.parents?.[0],
      webViewLink: f.webViewLink ?? `https://drive.google.com/file/d/${f.id}/view`,
      size: f.size ? parseInt(f.size, 10) : undefined,
      starred: f.starred ?? false,
      shared: f.shared ?? false,
    };
  }
}
