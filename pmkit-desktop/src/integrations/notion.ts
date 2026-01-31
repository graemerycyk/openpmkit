/**
 * Notion Integration
 *
 * Export PRDs and artifacts to Notion pages.
 * Status: Coming Soon
 */

import type {
  IntegrationClient,
  IntegrationCredentials,
  NotionPage,
  NotionDatabase,
  NotionBlock,
} from './types.js';

export interface NotionClientConfig {
  accessToken?: string;
}

export interface NotionFetchParams {
  action: 'search' | 'get_page' | 'get_database' | 'query_database' | 'create_page' | 'append_blocks';
  pageId?: string;
  databaseId?: string;
  query?: string;
  filter?: Record<string, unknown>;
  blocks?: NotionBlock[];
  parentId?: string;
  properties?: Record<string, unknown>;
  limit?: number;
}

export class NotionClient implements IntegrationClient<NotionPage[] | NotionPage | NotionDatabase | NotionBlock[]> {
  readonly integrationId = 'notion';
  private accessToken?: string;

  get isConnected(): boolean {
    return !!this.accessToken;
  }

  async connect(credentials: IntegrationCredentials): Promise<void> {
    if (credentials.accessToken) {
      this.accessToken = credentials.accessToken;
    } else {
      throw new Error('Notion requires an access token');
    }
  }

  async disconnect(): Promise<void> {
    this.accessToken = undefined;
  }

  async testConnection(): Promise<boolean> {
    if (!this.accessToken) return false;

    try {
      const response = await fetch('https://api.notion.com/v1/users/me', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Notion-Version': '2022-06-28',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async fetchData(params: NotionFetchParams): Promise<NotionPage[] | NotionPage | NotionDatabase | NotionBlock[]> {
    if (!this.accessToken) {
      throw new Error('Not connected to Notion');
    }

    switch (params.action) {
      case 'search':
        return this.search(params.query, params.limit);
      case 'get_page':
        if (!params.pageId) throw new Error('pageId required');
        return this.getPage(params.pageId);
      case 'get_database':
        if (!params.databaseId) throw new Error('databaseId required');
        return this.getDatabase(params.databaseId);
      case 'query_database':
        if (!params.databaseId) throw new Error('databaseId required');
        return this.queryDatabase(params.databaseId, params.filter, params.limit);
      default:
        throw new Error(`Unknown action: ${params.action}`);
    }
  }

  async pushData(data: NotionPage): Promise<void> {
    // Create or update page
    throw new Error('Notion pushData not yet implemented');
  }

  private async search(query?: string, limit = 25): Promise<NotionPage[]> {
    const response = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query || '',
        page_size: limit,
      }),
    });

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results
      .filter((r: any) => r.object === 'page')
      .map((p: any) => ({
        id: p.id,
        title: this.extractTitle(p),
        url: p.url,
        createdTime: p.created_time,
        lastEditedTime: p.last_edited_time,
        parentId: p.parent?.page_id || p.parent?.database_id,
      }));
  }

  private async getPage(pageId: string): Promise<NotionPage> {
    const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Notion-Version': '2022-06-28',
      },
    });

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.status}`);
    }

    const p = await response.json();
    return {
      id: p.id,
      title: this.extractTitle(p),
      url: p.url,
      createdTime: p.created_time,
      lastEditedTime: p.last_edited_time,
      parentId: p.parent?.page_id || p.parent?.database_id,
    };
  }

  private async getDatabase(databaseId: string): Promise<NotionDatabase> {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Notion-Version': '2022-06-28',
      },
    });

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.status}`);
    }

    const db = await response.json();
    return {
      id: db.id,
      title: db.title?.[0]?.plain_text || 'Untitled',
      properties: db.properties,
    };
  }

  private async queryDatabase(
    databaseId: string,
    filter?: Record<string, unknown>,
    limit = 100
  ): Promise<NotionPage[]> {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter,
        page_size: limit,
      }),
    });

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results.map((p: any) => ({
      id: p.id,
      title: this.extractTitle(p),
      url: p.url,
      createdTime: p.created_time,
      lastEditedTime: p.last_edited_time,
      parentId: databaseId,
    }));
  }

  private extractTitle(page: any): string {
    // Try to extract title from properties
    const props = page.properties || {};
    for (const key of Object.keys(props)) {
      const prop = props[key];
      if (prop.type === 'title' && prop.title?.length > 0) {
        return prop.title[0].plain_text;
      }
    }
    return 'Untitled';
  }
}

export function createNotionClient(config?: NotionClientConfig): NotionClient {
  const client = new NotionClient();
  if (config?.accessToken) {
    client.connect({ integrationId: 'notion', accessToken: config.accessToken });
  }
  return client;
}
