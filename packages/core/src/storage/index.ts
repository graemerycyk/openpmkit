import { nanoid } from 'nanoid';
import * as fs from 'fs/promises';
import * as path from 'path';

// ============================================================================
// Storage Adapter Interface
// ============================================================================

export interface StorageAdapter {
  put(key: string, data: Buffer | string, contentType?: string): Promise<string>;
  get(key: string): Promise<Buffer>;
  getUrl(key: string, expiresIn?: number): Promise<string>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  list(prefix: string): Promise<string[]>;
}

export interface StorageConfig {
  type: 'local' | 's3';
  // Local config
  localPath?: string;
  // S3/DO Spaces config
  endpoint?: string;
  bucket?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

// ============================================================================
// Local Filesystem Adapter (dev fallback)
// ============================================================================

export class LocalStorageAdapter implements StorageAdapter {
  private basePath: string;

  constructor(basePath: string = '.local-storage') {
    this.basePath = basePath;
  }

  private async ensureDir(filePath: string): Promise<void> {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
  }

  private getFullPath(key: string): string {
    return path.join(this.basePath, key);
  }

  async put(
    key: string,
    data: Buffer | string,
    _contentType?: string
  ): Promise<string> {
    const fullPath = this.getFullPath(key);
    await this.ensureDir(fullPath);
    await fs.writeFile(fullPath, data);
    return key;
  }

  async get(key: string): Promise<Buffer> {
    const fullPath = this.getFullPath(key);
    return fs.readFile(fullPath);
  }

  async getUrl(key: string, _expiresIn?: number): Promise<string> {
    // For local storage, return a file:// URL or a relative path
    return `/api/storage/${key}`;
  }

  async delete(key: string): Promise<void> {
    const fullPath = this.getFullPath(key);
    await fs.unlink(fullPath);
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(this.getFullPath(key));
      return true;
    } catch {
      return false;
    }
  }

  async list(prefix: string): Promise<string[]> {
    const fullPath = this.getFullPath(prefix);
    try {
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      const files: string[] = [];

      for (const entry of entries) {
        const entryPath = path.join(prefix, entry.name);
        if (entry.isFile()) {
          files.push(entryPath);
        } else if (entry.isDirectory()) {
          const subFiles = await this.list(entryPath);
          files.push(...subFiles);
        }
      }

      return files;
    } catch {
      return [];
    }
  }
}

// ============================================================================
// S3-Compatible Adapter (DO Spaces, AWS S3, MinIO, etc.)
// ============================================================================

export class S3StorageAdapter implements StorageAdapter {
  private endpoint: string;
  private bucket: string;
  private region: string;
  private accessKeyId: string;
  private secretAccessKey: string;

  constructor(config: {
    endpoint: string;
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  }) {
    this.endpoint = config.endpoint;
    this.bucket = config.bucket;
    this.region = config.region;
    this.accessKeyId = config.accessKeyId;
    this.secretAccessKey = config.secretAccessKey;
  }

  async put(
    key: string,
    data: Buffer | string,
    contentType: string = 'application/octet-stream'
  ): Promise<string> {
    // In production, use @aws-sdk/client-s3
    // For now, this is a stub that would be replaced
    const url = `${this.endpoint}/${this.bucket}/${key}`;

    // Convert Buffer to Uint8Array for fetch compatibility
    const body = typeof data === 'string' ? data : new Uint8Array(data);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        // In production, add proper AWS Signature V4 auth
        'x-amz-acl': 'private',
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload to S3: ${response.statusText}`);
    }

    return key;
  }

  async get(key: string): Promise<Buffer> {
    const url = `${this.endpoint}/${this.bucket}/${key}`;

    const response = await fetch(url, {
      method: 'GET',
      // In production, add proper AWS Signature V4 auth
    });

    if (!response.ok) {
      throw new Error(`Failed to get from S3: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async getUrl(key: string, expiresIn: number = 3600): Promise<string> {
    // In production, generate a pre-signed URL using AWS SDK
    // For now, return a placeholder URL
    const expiry = Date.now() + expiresIn * 1000;
    return `${this.endpoint}/${this.bucket}/${key}?expires=${expiry}`;
  }

  async delete(key: string): Promise<void> {
    const url = `${this.endpoint}/${this.bucket}/${key}`;

    const response = await fetch(url, {
      method: 'DELETE',
      // In production, add proper AWS Signature V4 auth
    });

    if (!response.ok) {
      throw new Error(`Failed to delete from S3: ${response.statusText}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    const url = `${this.endpoint}/${this.bucket}/${key}`;

    const response = await fetch(url, {
      method: 'HEAD',
      // In production, add proper AWS Signature V4 auth
    });

    return response.ok;
  }

  async list(prefix: string): Promise<string[]> {
    // In production, use ListObjectsV2 from AWS SDK
    // For now, return empty array
    console.log(`Listing objects with prefix: ${prefix}`);
    return [];
  }
}

// ============================================================================
// Storage Factory
// ============================================================================

export function createStorageAdapter(config: StorageConfig): StorageAdapter {
  if (config.type === 's3') {
    if (
      !config.endpoint ||
      !config.bucket ||
      !config.region ||
      !config.accessKeyId ||
      !config.secretAccessKey
    ) {
      throw new Error('S3 storage requires endpoint, bucket, region, accessKeyId, and secretAccessKey');
    }

    return new S3StorageAdapter({
      endpoint: config.endpoint,
      bucket: config.bucket,
      region: config.region,
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    });
  }

  return new LocalStorageAdapter(config.localPath);
}

// ============================================================================
// Artifact Store (high-level API for storing job artifacts)
// ============================================================================

export class ArtifactStore {
  constructor(private adapter: StorageAdapter) {}

  async saveArtifact(
    tenantId: string,
    jobId: string,
    artifactId: string,
    content: string,
    format: 'markdown' | 'html' | 'pdf' | 'json'
  ): Promise<string> {
    const key = `${tenantId}/artifacts/${jobId}/${artifactId}.${format}`;
    const contentType = this.getContentType(format);
    await this.adapter.put(key, content, contentType);
    return key;
  }

  async getArtifact(storageKey: string): Promise<string> {
    const buffer = await this.adapter.get(storageKey);
    return buffer.toString('utf-8');
  }

  async getArtifactUrl(storageKey: string, expiresIn?: number): Promise<string> {
    return this.adapter.getUrl(storageKey, expiresIn);
  }

  async deleteArtifact(storageKey: string): Promise<void> {
    await this.adapter.delete(storageKey);
  }

  async listArtifacts(tenantId: string, jobId?: string): Promise<string[]> {
    const prefix = jobId
      ? `${tenantId}/artifacts/${jobId}/`
      : `${tenantId}/artifacts/`;
    return this.adapter.list(prefix);
  }

  private getContentType(format: string): string {
    switch (format) {
      case 'markdown':
        return 'text/markdown';
      case 'html':
        return 'text/html';
      case 'pdf':
        return 'application/pdf';
      case 'json':
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }
}

// ============================================================================
// Default instance
// ============================================================================

const defaultAdapter = new LocalStorageAdapter();
export const artifactStore = new ArtifactStore(defaultAdapter);

