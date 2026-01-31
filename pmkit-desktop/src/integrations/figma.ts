/**
 * Figma Integration
 *
 * Generate prototypes directly in Figma from PRDs.
 * Status: Coming Soon
 */

import type {
  IntegrationClient,
  IntegrationCredentials,
  FigmaFile,
  FigmaFrame,
  FigmaExportResult,
} from './types.js';

export interface FigmaClientConfig {
  accessToken?: string;
}

export interface FigmaFetchParams {
  action: 'list_files' | 'get_file' | 'get_frame' | 'export_frame';
  fileKey?: string;
  frameId?: string;
}

export class FigmaClient implements IntegrationClient<FigmaFile | FigmaFrame | FigmaExportResult> {
  readonly integrationId = 'figma';
  private accessToken?: string;

  get isConnected(): boolean {
    return !!this.accessToken;
  }

  async connect(credentials: IntegrationCredentials): Promise<void> {
    if (credentials.accessToken) {
      this.accessToken = credentials.accessToken;
    } else {
      throw new Error('Figma requires an access token');
    }
  }

  async disconnect(): Promise<void> {
    this.accessToken = undefined;
  }

  async testConnection(): Promise<boolean> {
    if (!this.accessToken) return false;

    try {
      const response = await fetch('https://api.figma.com/v1/me', {
        headers: {
          'X-Figma-Token': this.accessToken,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async fetchData(params: FigmaFetchParams): Promise<FigmaFile | FigmaFrame | FigmaExportResult> {
    if (!this.accessToken) {
      throw new Error('Not connected to Figma');
    }

    switch (params.action) {
      case 'list_files':
        // Coming soon: List files from team
        throw new Error('Figma list_files not yet implemented');

      case 'get_file':
        if (!params.fileKey) throw new Error('fileKey required');
        return this.getFile(params.fileKey);

      case 'get_frame':
        if (!params.fileKey || !params.frameId) {
          throw new Error('fileKey and frameId required');
        }
        return this.getFrame(params.fileKey, params.frameId);

      case 'export_frame':
        if (!params.fileKey || !params.frameId) {
          throw new Error('fileKey and frameId required');
        }
        return this.exportFrame(params.fileKey, params.frameId);

      default:
        throw new Error(`Unknown action: ${params.action}`);
    }
  }

  private async getFile(fileKey: string): Promise<FigmaFile> {
    const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: {
        'X-Figma-Token': this.accessToken!,
      },
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      key: fileKey,
      name: data.name,
      lastModified: data.lastModified,
      thumbnailUrl: data.thumbnailUrl,
    };
  }

  private async getFrame(fileKey: string, frameId: string): Promise<FigmaFrame> {
    const response = await fetch(
      `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${frameId}`,
      {
        headers: {
          'X-Figma-Token': this.accessToken!,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status}`);
    }

    const data = await response.json();
    const node = data.nodes[frameId];

    return {
      id: frameId,
      name: node.document.name,
      type: node.document.type,
      children: node.document.children,
    };
  }

  private async exportFrame(fileKey: string, frameId: string): Promise<FigmaExportResult> {
    const response = await fetch(
      `https://api.figma.com/v1/images/${fileKey}?ids=${frameId}&format=png&scale=2`,
      {
        headers: {
          'X-Figma-Token': this.accessToken!,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      fileKey,
      frameId,
      imageUrl: data.images[frameId],
    };
  }
}

// Factory function
export function createFigmaClient(config?: FigmaClientConfig): FigmaClient {
  const client = new FigmaClient();
  if (config?.accessToken) {
    client.connect({ integrationId: 'figma', accessToken: config.accessToken });
  }
  return client;
}
