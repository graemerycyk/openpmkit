/**
 * Coda Integration
 *
 * Access docs and tables for product documentation.
 * Status: Coming Soon
 */

import type {
  IntegrationClient,
  IntegrationCredentials,
  CodaDoc,
  CodaTable,
  CodaRow,
} from './types.js';

export interface CodaClientConfig {
  apiKey?: string;
}

export interface CodaFetchParams {
  action: 'list_docs' | 'get_doc' | 'list_tables' | 'get_rows' | 'create_row';
  docId?: string;
  tableId?: string;
  rowData?: Record<string, unknown>;
  limit?: number;
}

export class CodaClient implements IntegrationClient<CodaDoc[] | CodaDoc | CodaTable[] | CodaRow[]> {
  readonly integrationId = 'coda';
  private apiKey?: string;

  get isConnected(): boolean {
    return !!this.apiKey;
  }

  async connect(credentials: IntegrationCredentials): Promise<void> {
    if (credentials.apiKey) {
      this.apiKey = credentials.apiKey;
    } else {
      throw new Error('Coda requires an API key');
    }
  }

  async disconnect(): Promise<void> {
    this.apiKey = undefined;
  }

  async testConnection(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const response = await fetch('https://coda.io/apis/v1/whoami', {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async fetchData(params: CodaFetchParams): Promise<CodaDoc[] | CodaDoc | CodaTable[] | CodaRow[]> {
    if (!this.apiKey) {
      throw new Error('Not connected to Coda');
    }

    switch (params.action) {
      case 'list_docs':
        return this.listDocs(params.limit);
      case 'get_doc':
        if (!params.docId) throw new Error('docId required');
        return this.getDoc(params.docId);
      case 'list_tables':
        if (!params.docId) throw new Error('docId required');
        return this.listTables(params.docId);
      case 'get_rows':
        if (!params.docId || !params.tableId) {
          throw new Error('docId and tableId required');
        }
        return this.getRows(params.docId, params.tableId, params.limit);
      default:
        throw new Error(`Unknown action: ${params.action}`);
    }
  }

  private async listDocs(limit = 25): Promise<CodaDoc[]> {
    const response = await fetch(`https://coda.io/apis/v1/docs?limit=${limit}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    const data = await response.json();
    return data.items.map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      owner: doc.owner,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  private async getDoc(docId: string): Promise<CodaDoc> {
    const response = await fetch(`https://coda.io/apis/v1/docs/${docId}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    const doc = await response.json();
    return {
      id: doc.id,
      name: doc.name,
      owner: doc.owner,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private async listTables(docId: string): Promise<CodaTable[]> {
    const response = await fetch(`https://coda.io/apis/v1/docs/${docId}/tables`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    const data = await response.json();
    return data.items.map((table: any) => ({
      id: table.id,
      name: table.name,
      docId,
      rowCount: table.rowCount,
    }));
  }

  private async getRows(docId: string, tableId: string, limit = 100): Promise<CodaRow[]> {
    const response = await fetch(
      `https://coda.io/apis/v1/docs/${docId}/tables/${tableId}/rows?limit=${limit}`,
      { headers: { Authorization: `Bearer ${this.apiKey}` } }
    );
    const data = await response.json();
    return data.items.map((row: any) => ({
      id: row.id,
      values: row.values,
    }));
  }
}

export function createCodaClient(config?: CodaClientConfig): CodaClient {
  const client = new CodaClient();
  if (config?.apiKey) {
    client.connect({ integrationId: 'coda', apiKey: config.apiKey });
  }
  return client;
}
