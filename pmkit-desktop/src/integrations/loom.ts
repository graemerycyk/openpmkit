/**
 * Loom Integration
 *
 * Extract insights from video transcripts for PRDs and daily briefs.
 * Status: Coming Soon
 */

import type {
  IntegrationClient,
  IntegrationCredentials,
  LoomRecording,
  LoomTranscript,
} from './types.js';

export interface LoomClientConfig {
  accessToken?: string;
}

export interface LoomFetchParams {
  action: 'list_recordings' | 'get_recording' | 'get_transcript';
  recordingId?: string;
  limit?: number;
}

export class LoomClient implements IntegrationClient<LoomRecording[] | LoomRecording | LoomTranscript> {
  readonly integrationId = 'loom';
  private accessToken?: string;

  get isConnected(): boolean {
    return !!this.accessToken;
  }

  async connect(credentials: IntegrationCredentials): Promise<void> {
    if (credentials.accessToken) {
      this.accessToken = credentials.accessToken;
    } else {
      throw new Error('Loom requires an access token');
    }
  }

  async disconnect(): Promise<void> {
    this.accessToken = undefined;
  }

  async testConnection(): Promise<boolean> {
    if (!this.accessToken) return false;
    // Coming soon: Test Loom API connection
    return false;
  }

  async fetchData(params: LoomFetchParams): Promise<LoomRecording[] | LoomRecording | LoomTranscript> {
    if (!this.accessToken) {
      throw new Error('Not connected to Loom');
    }

    switch (params.action) {
      case 'list_recordings':
        throw new Error('Loom list_recordings not yet implemented');
      case 'get_recording':
        throw new Error('Loom get_recording not yet implemented');
      case 'get_transcript':
        throw new Error('Loom get_transcript not yet implemented');
      default:
        throw new Error(`Unknown action: ${params.action}`);
    }
  }
}

export function createLoomClient(config?: LoomClientConfig): LoomClient {
  const client = new LoomClient();
  if (config?.accessToken) {
    client.connect({ integrationId: 'loom', accessToken: config.accessToken });
  }
  return client;
}
