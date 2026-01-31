/**
 * Zoom Integration
 *
 * Video meetings and recordings.
 * Status: Coming Soon
 */

import type {
  IntegrationClient,
  IntegrationCredentials,
  ZoomMeeting,
  ZoomRecording,
  ZoomTranscript,
} from './types.js';

export interface ZoomClientConfig {
  accessToken?: string;
}

export interface ZoomFetchParams {
  action: 'list_meetings' | 'get_meeting' | 'list_recordings' | 'get_transcript';
  meetingId?: string;
  recordingId?: string;
  userId?: string;
  from?: string;
  to?: string;
  limit?: number;
}

export class ZoomClient implements IntegrationClient<ZoomMeeting[] | ZoomMeeting | ZoomRecording[] | ZoomTranscript> {
  readonly integrationId = 'zoom';
  private accessToken?: string;

  get isConnected(): boolean {
    return !!this.accessToken;
  }

  async connect(credentials: IntegrationCredentials): Promise<void> {
    if (credentials.accessToken) {
      this.accessToken = credentials.accessToken;
    } else {
      throw new Error('Zoom requires an access token');
    }
  }

  async disconnect(): Promise<void> {
    this.accessToken = undefined;
  }

  async testConnection(): Promise<boolean> {
    if (!this.accessToken) return false;

    try {
      const response = await fetch('https://api.zoom.us/v2/users/me', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async fetchData(params: ZoomFetchParams): Promise<ZoomMeeting[] | ZoomMeeting | ZoomRecording[] | ZoomTranscript> {
    if (!this.accessToken) {
      throw new Error('Not connected to Zoom');
    }

    switch (params.action) {
      case 'list_meetings':
        return this.listMeetings(params.userId, params.limit);
      case 'get_meeting':
        if (!params.meetingId) throw new Error('meetingId required');
        return this.getMeeting(params.meetingId);
      case 'list_recordings':
        return this.listRecordings(params.userId, params.from, params.to);
      case 'get_transcript':
        if (!params.recordingId) throw new Error('recordingId required');
        return this.getTranscript(params.recordingId);
      default:
        throw new Error(`Unknown action: ${params.action}`);
    }
  }

  private async listMeetings(userId = 'me', limit = 30): Promise<ZoomMeeting[]> {
    const response = await fetch(
      `https://api.zoom.us/v2/users/${userId}/meetings?page_size=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Zoom API error: ${response.status}`);
    }

    const data = await response.json();
    return data.meetings.map((m: any) => ({
      id: m.id.toString(),
      uuid: m.uuid,
      topic: m.topic,
      type: m.type,
      startTime: m.start_time,
      duration: m.duration,
      hostId: m.host_id,
    }));
  }

  private async getMeeting(meetingId: string): Promise<ZoomMeeting> {
    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Zoom API error: ${response.status}`);
    }

    const m = await response.json();
    return {
      id: m.id.toString(),
      uuid: m.uuid,
      topic: m.topic,
      type: m.type,
      startTime: m.start_time,
      duration: m.duration,
      hostId: m.host_id,
    };
  }

  private async listRecordings(userId = 'me', from?: string, to?: string): Promise<ZoomRecording[]> {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);

    const response = await fetch(
      `https://api.zoom.us/v2/users/${userId}/recordings?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Zoom API error: ${response.status}`);
    }

    const data = await response.json();
    const recordings: ZoomRecording[] = [];

    for (const meeting of data.meetings || []) {
      for (const file of meeting.recording_files || []) {
        recordings.push({
          id: file.id,
          meetingId: meeting.id.toString(),
          recordingType: file.recording_type,
          downloadUrl: file.download_url,
          playUrl: file.play_url,
          fileSize: file.file_size,
        });
      }
    }

    return recordings;
  }

  private async getTranscript(recordingId: string): Promise<ZoomTranscript> {
    // Zoom transcript download requires additional handling
    // This is a simplified implementation
    throw new Error('Zoom transcript download not yet implemented');
  }
}

export function createZoomClient(config?: ZoomClientConfig): ZoomClient {
  const client = new ZoomClient();
  if (config?.accessToken) {
    client.connect({ integrationId: 'zoom', accessToken: config.accessToken });
  }
  return client;
}
