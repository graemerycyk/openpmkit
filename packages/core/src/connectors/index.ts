import { z } from 'zod';
import { nanoid } from 'nanoid';

// ============================================================================
// Connector Types
// ============================================================================

export const ConnectorKeySchema = z.enum([
  'jira',
  'confluence',
  'slack',
  'gong',
  'zendesk',
]);
export type ConnectorKey = z.infer<typeof ConnectorKeySchema>;

export const ConnectorStatusSchema = z.enum(['mock', 'real', 'disabled']);
export type ConnectorStatus = z.infer<typeof ConnectorStatusSchema>;

// ============================================================================
// Connector Install
// ============================================================================

export interface ConnectorInstall {
  id: string;
  tenantId: string;
  connectorKey: ConnectorKey;
  status: ConnectorStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConnectorCredential {
  id: string;
  installId: string;
  encryptedBlob: string;
  scopesJson?: Record<string, unknown>;
  expiresAt?: Date;
  refreshable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Connector Store Interface
// ============================================================================

export interface ConnectorStore {
  // Install operations
  findInstall(tenantId: string, connectorKey: ConnectorKey): Promise<ConnectorInstall | null>;
  findInstallsByTenant(tenantId: string): Promise<ConnectorInstall[]>;
  createInstall(install: Omit<ConnectorInstall, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConnectorInstall>;
  updateInstallStatus(id: string, status: ConnectorStatus): Promise<void>;
  deleteInstall(id: string): Promise<void>;

  // Credential operations
  findCredential(installId: string): Promise<ConnectorCredential | null>;
  saveCredential(credential: Omit<ConnectorCredential, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConnectorCredential>;
  updateCredential(id: string, updates: Partial<Pick<ConnectorCredential, 'encryptedBlob' | 'expiresAt'>>): Promise<void>;
  deleteCredential(id: string): Promise<void>;
}

// ============================================================================
// In-Memory Connector Store (for demo/testing)
// ============================================================================

export class InMemoryConnectorStore implements ConnectorStore {
  private installs: Map<string, ConnectorInstall> = new Map();
  private credentials: Map<string, ConnectorCredential> = new Map();

  async findInstall(tenantId: string, connectorKey: ConnectorKey): Promise<ConnectorInstall | null> {
    for (const install of this.installs.values()) {
      if (install.tenantId === tenantId && install.connectorKey === connectorKey) {
        return install;
      }
    }
    return null;
  }

  async findInstallsByTenant(tenantId: string): Promise<ConnectorInstall[]> {
    return Array.from(this.installs.values()).filter(i => i.tenantId === tenantId);
  }

  async createInstall(data: Omit<ConnectorInstall, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConnectorInstall> {
    const now = new Date();
    const install: ConnectorInstall = {
      ...data,
      id: nanoid(),
      createdAt: now,
      updatedAt: now,
    };
    this.installs.set(install.id, install);
    return install;
  }

  async updateInstallStatus(id: string, status: ConnectorStatus): Promise<void> {
    const install = this.installs.get(id);
    if (install) {
      install.status = status;
      install.updatedAt = new Date();
    }
  }

  async deleteInstall(id: string): Promise<void> {
    this.installs.delete(id);
  }

  async findCredential(installId: string): Promise<ConnectorCredential | null> {
    for (const cred of this.credentials.values()) {
      if (cred.installId === installId) {
        return cred;
      }
    }
    return null;
  }

  async saveCredential(data: Omit<ConnectorCredential, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConnectorCredential> {
    const now = new Date();
    const credential: ConnectorCredential = {
      ...data,
      id: nanoid(),
      createdAt: now,
      updatedAt: now,
    };
    this.credentials.set(credential.id, credential);
    return credential;
  }

  async updateCredential(id: string, updates: Partial<Pick<ConnectorCredential, 'encryptedBlob' | 'expiresAt'>>): Promise<void> {
    const cred = this.credentials.get(id);
    if (cred) {
      Object.assign(cred, updates, { updatedAt: new Date() });
    }
  }

  async deleteCredential(id: string): Promise<void> {
    this.credentials.delete(id);
  }

  // For testing
  clear(): void {
    this.installs.clear();
    this.credentials.clear();
  }
}

// ============================================================================
// Connector Service
// ============================================================================

export class ConnectorService {
  constructor(private store: ConnectorStore) {}

  /**
   * Get all installed connectors for a tenant
   */
  async getInstalledConnectors(tenantId: string): Promise<ConnectorInstall[]> {
    return this.store.findInstallsByTenant(tenantId);
  }

  /**
   * Check if a connector is installed and active
   */
  async isConnectorActive(tenantId: string, connectorKey: ConnectorKey): Promise<boolean> {
    const install = await this.store.findInstall(tenantId, connectorKey);
    return install !== null && install.status !== 'disabled';
  }

  /**
   * Install a connector for a tenant (initially in mock mode)
   */
  async installConnector(
    tenantId: string,
    connectorKey: ConnectorKey,
    userId: string
  ): Promise<ConnectorInstall> {
    // Check if already installed
    const existing = await this.store.findInstall(tenantId, connectorKey);
    if (existing) {
      throw new Error(`Connector ${connectorKey} is already installed`);
    }

    return this.store.createInstall({
      tenantId,
      connectorKey,
      status: 'mock',
      createdBy: userId,
    });
  }

  /**
   * Activate a connector with OAuth credentials (switch from mock to real)
   */
  async activateConnector(
    tenantId: string,
    connectorKey: ConnectorKey,
    encryptedCredentials: string,
    expiresAt?: Date
  ): Promise<void> {
    const install = await this.store.findInstall(tenantId, connectorKey);
    if (!install) {
      throw new Error(`Connector ${connectorKey} is not installed`);
    }

    // Save credentials
    await this.store.saveCredential({
      installId: install.id,
      encryptedBlob: encryptedCredentials,
      expiresAt,
      refreshable: true,
    });

    // Update status to real
    await this.store.updateInstallStatus(install.id, 'real');
  }

  /**
   * Update connector credentials (e.g., after token refresh)
   */
  async updateCredentials(
    tenantId: string,
    connectorKey: ConnectorKey,
    encryptedCredentials: string,
    expiresAt?: Date
  ): Promise<void> {
    const install = await this.store.findInstall(tenantId, connectorKey);
    if (!install) {
      throw new Error(`Connector ${connectorKey} is not installed`);
    }

    const credential = await this.store.findCredential(install.id);
    if (!credential) {
      throw new Error(`No credentials found for connector ${connectorKey}`);
    }

    await this.store.updateCredential(credential.id, {
      encryptedBlob: encryptedCredentials,
      expiresAt,
    });
  }

  /**
   * Get stored credentials for a connector
   */
  async getCredentials(
    tenantId: string,
    connectorKey: ConnectorKey
  ): Promise<{ encryptedBlob: string; expiresAt?: Date } | null> {
    const install = await this.store.findInstall(tenantId, connectorKey);
    if (!install || install.status !== 'real') {
      return null;
    }

    const credential = await this.store.findCredential(install.id);
    if (!credential) {
      return null;
    }

    return {
      encryptedBlob: credential.encryptedBlob,
      expiresAt: credential.expiresAt,
    };
  }

  /**
   * Disable a connector
   */
  async disableConnector(tenantId: string, connectorKey: ConnectorKey): Promise<void> {
    const install = await this.store.findInstall(tenantId, connectorKey);
    if (!install) {
      throw new Error(`Connector ${connectorKey} is not installed`);
    }

    await this.store.updateInstallStatus(install.id, 'disabled');
  }

  /**
   * Uninstall a connector (removes credentials too)
   */
  async uninstallConnector(tenantId: string, connectorKey: ConnectorKey): Promise<void> {
    const install = await this.store.findInstall(tenantId, connectorKey);
    if (!install) {
      return; // Already uninstalled
    }

    // Delete credentials first
    const credential = await this.store.findCredential(install.id);
    if (credential) {
      await this.store.deleteCredential(credential.id);
    }

    // Delete install
    await this.store.deleteInstall(install.id);
  }
}

// ============================================================================
// Default instances
// ============================================================================

const defaultConnectorStore = new InMemoryConnectorStore();
export const connectorService = new ConnectorService(defaultConnectorStore);
export { defaultConnectorStore as connectorStore };

