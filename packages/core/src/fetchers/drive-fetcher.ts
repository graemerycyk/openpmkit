import { decryptTokens, encryptTokens, type OAuthTokens } from '../connectors';
import type {
  EncryptedCredentials,
  FetchedItem,
  FetchResult,
  IFetcher,
  DriveFetchOptions,
  DriveFileMetadata,
} from './types';

// Google OAuth token refresh endpoint
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// ============================================================================
// Internal Types for Google Drive API Responses
// ============================================================================

interface DriveApiFile {
  id: string;
  name: string;
  mimeType: string;
  description?: string;
  createdTime: string;
  modifiedTime: string;
  owners?: Array<{
    displayName: string;
    emailAddress: string;
  }>;
  lastModifyingUser?: {
    displayName: string;
    emailAddress: string;
  };
  webViewLink?: string;
  size?: string;
  starred?: boolean;
  shared?: boolean;
  parents?: string[];
}

interface DriveFileListResponse {
  files: DriveApiFile[];
  nextPageToken?: string;
}

// ============================================================================
// Google Drive Fetcher Implementation
// ============================================================================

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

/**
 * Fetcher for Google Drive files.
 * Implements the IFetcher interface for use by any agent.
 *
 * @example
 * ```typescript
 * // Create from encrypted credentials
 * const fetcher = DriveFetcher.fromEncrypted({
 *   encryptedBlob: '...',
 *   encryptionKey: '...',
 * });
 *
 * // Fetch recently modified files
 * const result = await fetcher.fetch({
 *   sinceHoursAgo: 168, // Last week
 *   mimeTypes: ['application/vnd.google-apps.document', 'application/vnd.google-apps.spreadsheet'],
 * });
 *
 * // Process fetched items
 * for (const item of result.items) {
 *   console.log(`[${item.metadata.mimeType}] ${item.title}`);
 * }
 * ```
 */
export class DriveFetcher implements IFetcher<DriveFileMetadata, DriveFetchOptions> {
  readonly connector = 'google-drive';
  readonly sourceTypes = ['drive_file'] as const;

  private tokens: OAuthTokens;
  private encryptionKey?: string;
  private googleClientId?: string;
  private googleClientSecret?: string;

  constructor(tokens: OAuthTokens, encryptionKey?: string) {
    this.tokens = tokens;
    this.encryptionKey = encryptionKey;
    this.googleClientId = process.env.GOOGLE_CLIENT_ID;
    this.googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  }

  /**
   * Create fetcher from encrypted credential blob.
   */
  static fromEncrypted(credentials: EncryptedCredentials): DriveFetcher {
    const tokens = decryptTokens(credentials.encryptedBlob, credentials.encryptionKey);
    return new DriveFetcher(tokens, credentials.encryptionKey);
  }

  /**
   * Get the current (possibly refreshed) encrypted blob for credential updates.
   */
  getUpdatedEncryptedBlob(): string | null {
    if (!this.encryptionKey) return null;
    return encryptTokens(this.tokens, this.encryptionKey);
  }

  /**
   * Fetch files from Google Drive.
   */
  async fetch(options: DriveFetchOptions): Promise<FetchResult<DriveFileMetadata>> {
    const startTime = Date.now();
    const {
      folderIds,
      mimeTypes,
      starredOnly,
      sharedOnly,
      query,
      sinceHoursAgo = 168, // Default to 1 week for Drive
      limit = 50,
      onProgress,
    } = options;

    const items: FetchedItem<DriveFileMetadata>[] = [];

    onProgress?.('Fetching Google Drive files...');

    try {
      // Build Drive search query
      const queryParts: string[] = [];

      // Time filter - files modified since X hours ago
      if (sinceHoursAgo) {
        const sinceDate = new Date(Date.now() - sinceHoursAgo * 60 * 60 * 1000);
        queryParts.push(`modifiedTime > '${sinceDate.toISOString()}'`);
      }

      // Folder filter
      if (folderIds && folderIds.length > 0) {
        const folderConditions = folderIds.map((id) => `'${id}' in parents`).join(' or ');
        queryParts.push(`(${folderConditions})`);
      }

      // MIME type filter
      if (mimeTypes && mimeTypes.length > 0) {
        const mimeConditions = mimeTypes.map((mime) => `mimeType = '${mime}'`).join(' or ');
        queryParts.push(`(${mimeConditions})`);
      }

      // Starred filter
      if (starredOnly) {
        queryParts.push('starred = true');
      }

      // Shared filter
      if (sharedOnly) {
        queryParts.push("'me' in readers and not 'me' in owners");
      }

      // Exclude trashed files
      queryParts.push('trashed = false');

      // Custom query addition
      if (query) {
        queryParts.push(`fullText contains '${query.replace(/'/g, "\\'")}'`);
      }

      const finalQuery = queryParts.join(' and ');
      console.log(`[DriveFetcher] Search query: ${finalQuery}`);

      // Fetch files with pagination
      let pageToken: string | undefined;
      const fields =
        'nextPageToken,files(id,name,mimeType,description,createdTime,modifiedTime,owners,lastModifyingUser,webViewLink,size,starred,shared,parents)';

      do {
        const params = new URLSearchParams({
          q: finalQuery,
          fields,
          orderBy: 'modifiedTime desc',
          pageSize: Math.min(limit - items.length, 100).toString(),
        });

        if (pageToken) {
          params.set('pageToken', pageToken);
        }

        const url = `${DRIVE_API_BASE}/files?${params}`;
        console.log(`[DriveFetcher] Fetching from: ${url}`);

        const response = await this.makeRequest<DriveFileListResponse>(url);
        console.log(
          `[DriveFetcher] API response: ${JSON.stringify({ fileCount: response.files?.length })}`
        );

        if (response.files) {
          for (const file of response.files) {
            const item = this.transformFile(file);
            items.push(item);
          }
        }

        onProgress?.(`Fetched ${items.length} files from Google Drive...`);

        pageToken = response.nextPageToken;

        // Stop if we've reached the limit
        if (items.length >= limit) {
          break;
        }
      } while (pageToken);

      onProgress?.(`Fetched ${items.length} files from Google Drive`);
    } catch (error) {
      onProgress?.(`Drive fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }

    // Trim to limit if needed
    const trimmedItems = items.slice(0, limit);

    return {
      connector: this.connector,
      items: trimmedItems,
      stats: {
        itemsProcessed: trimmedItems.length,
        durationMs: Date.now() - startTime,
      },
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Make an authenticated request to the Google Drive API.
   * Handles token refresh on 401 errors.
   */
  private async makeRequest<T>(url: string, retryAfterRefresh = true): Promise<T> {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.tokens.accessToken}`,
      },
    });

    // Handle token expiration - try to refresh
    if (response.status === 401 && retryAfterRefresh && this.tokens.refreshToken) {
      console.log('[DriveFetcher] Access token expired, attempting refresh...');
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry the request with the new token
        return this.makeRequest<T>(url, false);
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Drive API error: ${response.status} ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Refresh the access token using the refresh token.
   */
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.tokens.refreshToken) {
      console.warn('[DriveFetcher] No refresh token available');
      return false;
    }

    if (!this.googleClientId || !this.googleClientSecret) {
      console.warn('[DriveFetcher] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET for token refresh');
      return false;
    }

    try {
      const response = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.googleClientId,
          client_secret: this.googleClientSecret,
          refresh_token: this.tokens.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DriveFetcher] Token refresh failed:', errorText);
        return false;
      }

      const data = await response.json();

      // Update tokens (refresh token stays the same, access token is new)
      this.tokens = {
        ...this.tokens,
        accessToken: data.access_token,
        expiresIn: data.expires_in,
        expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      };

      console.log('[DriveFetcher] Access token refreshed successfully');
      return true;
    } catch (error) {
      console.error('[DriveFetcher] Token refresh error:', error);
      return false;
    }
  }

  /**
   * Transform a Google Drive file to a FetchedItem.
   */
  private transformFile(file: DriveApiFile): FetchedItem<DriveFileMetadata> {
    const owner = file.owners?.[0];
    const lastModifier = file.lastModifyingUser || owner;

    return {
      externalId: file.id,
      sourceType: 'drive_file',
      title: file.name,
      url: file.webViewLink || `https://drive.google.com/file/d/${file.id}`,
      content: this.buildContent(file),
      timestamp: new Date(file.modifiedTime),
      author: {
        id: lastModifier?.emailAddress || 'unknown',
        name: lastModifier?.displayName || 'Unknown',
        email: lastModifier?.emailAddress,
      },
      metadata: {
        mimeType: file.mimeType,
        description: file.description,
        modifiedBy: {
          name: lastModifier?.displayName || 'Unknown',
          email: lastModifier?.emailAddress || 'unknown',
        },
        webViewLink: file.webViewLink || `https://drive.google.com/file/d/${file.id}`,
        size: file.size ? parseInt(file.size) : undefined,
        starred: file.starred || false,
        shared: file.shared || false,
        parents: file.parents,
      },
    };
  }

  /**
   * Build content string for LLM consumption.
   */
  private buildContent(file: DriveApiFile): string {
    const parts = [
      `File: ${file.name}`,
      `Type: ${this.getReadableMimeType(file.mimeType)}`,
      `Modified: ${new Date(file.modifiedTime).toLocaleDateString()}`,
    ];

    if (file.lastModifyingUser) {
      parts.push(`Modified by: ${file.lastModifyingUser.displayName}`);
    }

    if (file.description) {
      parts.push(`Description: ${file.description}`);
    }

    if (file.size) {
      parts.push(`Size: ${this.formatFileSize(parseInt(file.size))}`);
    }

    if (file.starred) {
      parts.push('Starred');
    }

    if (file.shared) {
      parts.push('Shared');
    }

    return parts.join('\n');
  }

  /**
   * Convert MIME type to human-readable format.
   */
  private getReadableMimeType(mimeType: string): string {
    const mimeMap: Record<string, string> = {
      'application/vnd.google-apps.document': 'Google Doc',
      'application/vnd.google-apps.spreadsheet': 'Google Sheet',
      'application/vnd.google-apps.presentation': 'Google Slides',
      'application/vnd.google-apps.form': 'Google Form',
      'application/vnd.google-apps.drawing': 'Google Drawing',
      'application/vnd.google-apps.folder': 'Folder',
      'application/pdf': 'PDF',
      'image/png': 'PNG Image',
      'image/jpeg': 'JPEG Image',
      'text/plain': 'Text File',
      'text/csv': 'CSV File',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
    };

    return mimeMap[mimeType] || mimeType.split('/').pop() || 'File';
  }

  /**
   * Format file size in human-readable format.
   */
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
}
