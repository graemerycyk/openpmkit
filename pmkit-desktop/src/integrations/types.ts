/**
 * Integration Types for pmkit-desktop
 */

export type IntegrationStatus = 'connected' | 'not_connected' | 'coming_soon' | 'error' | 'not_found';
export type IntegrationCategory = 'design' | 'video' | 'documentation' | 'analytics' | 'community' | 'project_management';
export type AuthType = 'oauth2' | 'api_key' | 'none';

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  authType: AuthType;
  requiredScopes: string[];
  docsUrl: string;
}

export interface IntegrationCredentials {
  integrationId: string;
  accessToken?: string;
  refreshToken?: string;
  apiKey?: string;
  expiresAt?: Date;
  scopes?: string[];
}

export interface IntegrationConnection {
  integration: Integration;
  credentials?: IntegrationCredentials;
  connectedAt?: Date;
  lastUsedAt?: Date;
}

// ============================================================================
// Base Integration Client
// ============================================================================

export interface IntegrationClient<T = unknown> {
  readonly integrationId: string;
  readonly isConnected: boolean;

  connect(credentials: IntegrationCredentials): Promise<void>;
  disconnect(): Promise<void>;
  testConnection(): Promise<boolean>;

  // Generic operations
  fetchData(params: unknown): Promise<T>;
  pushData?(data: T): Promise<void>;
}

// ============================================================================
// Figma Types
// ============================================================================

export interface FigmaFile {
  key: string;
  name: string;
  lastModified: string;
  thumbnailUrl: string;
}

export interface FigmaFrame {
  id: string;
  name: string;
  type: string;
  children?: FigmaFrame[];
}

export interface FigmaExportResult {
  fileKey: string;
  frameId: string;
  imageUrl: string;
}

// ============================================================================
// Loom Types
// ============================================================================

export interface LoomRecording {
  id: string;
  title: string;
  duration: number;
  createdAt: string;
  thumbnailUrl: string;
  shareUrl: string;
}

export interface LoomTranscript {
  recordingId: string;
  text: string;
  segments: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

// ============================================================================
// Coda Types
// ============================================================================

export interface CodaDoc {
  id: string;
  name: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface CodaTable {
  id: string;
  name: string;
  docId: string;
  rowCount: number;
}

export interface CodaRow {
  id: string;
  values: Record<string, unknown>;
}

// ============================================================================
// Amplitude Types
// ============================================================================

export interface AmplitudeChart {
  id: string;
  name: string;
  chartType: string;
  data: unknown;
}

export interface AmplitudeEvent {
  eventType: string;
  eventProperties: Record<string, unknown>;
  userProperties: Record<string, unknown>;
  timestamp: string;
}

// ============================================================================
// Discourse Types
// ============================================================================

export interface DiscourseTopic {
  id: number;
  title: string;
  slug: string;
  postsCount: number;
  views: number;
  likeCount: number;
  createdAt: string;
  lastPostedAt: string;
  categoryId: number;
}

export interface DiscoursePost {
  id: number;
  topicId: number;
  username: string;
  content: string;
  createdAt: string;
  likeCount: number;
}

// ============================================================================
// Linear Types
// ============================================================================

export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  state: { name: string; color: string };
  priority: number;
  assignee?: { name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface LinearProject {
  id: string;
  name: string;
  description?: string;
  state: string;
  progress: number;
  startDate?: string;
  targetDate?: string;
}

// ============================================================================
// Notion Types
// ============================================================================

export interface NotionPage {
  id: string;
  title: string;
  url: string;
  createdTime: string;
  lastEditedTime: string;
  parentId?: string;
}

export interface NotionDatabase {
  id: string;
  title: string;
  properties: Record<string, unknown>;
}

export interface NotionBlock {
  id: string;
  type: string;
  content: unknown;
  children?: NotionBlock[];
}

// ============================================================================
// Zoom Types
// ============================================================================

export interface ZoomMeeting {
  id: string;
  uuid: string;
  topic: string;
  type: number;
  startTime: string;
  duration: number;
  hostId: string;
}

export interface ZoomRecording {
  id: string;
  meetingId: string;
  recordingType: string;
  downloadUrl: string;
  playUrl: string;
  fileSize: number;
}

export interface ZoomTranscript {
  recordingId: string;
  content: string;
  participants: string[];
}
