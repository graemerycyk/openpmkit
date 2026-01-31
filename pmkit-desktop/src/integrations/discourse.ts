/**
 * Discourse Integration
 *
 * Monitor community discussions and feature requests.
 * Status: Coming Soon
 */

import type {
  IntegrationClient,
  IntegrationCredentials,
  DiscourseTopic,
  DiscoursePost,
} from './types.js';

export interface DiscourseClientConfig {
  baseUrl: string;
  apiKey?: string;
  apiUsername?: string;
}

export interface DiscourseFetchParams {
  action: 'list_topics' | 'get_topic' | 'search' | 'get_category_topics';
  topicId?: number;
  categoryId?: number;
  query?: string;
  limit?: number;
}

export class DiscourseClient implements IntegrationClient<DiscourseTopic[] | DiscourseTopic | DiscoursePost[]> {
  readonly integrationId = 'discourse';
  private baseUrl?: string;
  private apiKey?: string;
  private apiUsername?: string;

  get isConnected(): boolean {
    return !!(this.baseUrl && this.apiKey);
  }

  async connect(credentials: IntegrationCredentials): Promise<void> {
    if (credentials.apiKey) {
      this.apiKey = credentials.apiKey;
      // baseUrl and apiUsername would be set separately
    } else {
      throw new Error('Discourse requires an API key');
    }
  }

  async disconnect(): Promise<void> {
    this.baseUrl = undefined;
    this.apiKey = undefined;
    this.apiUsername = undefined;
  }

  async testConnection(): Promise<boolean> {
    if (!this.baseUrl || !this.apiKey) return false;

    try {
      const response = await fetch(`${this.baseUrl}/session/current.json`, {
        headers: {
          'Api-Key': this.apiKey,
          'Api-Username': this.apiUsername || 'system',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async fetchData(params: DiscourseFetchParams): Promise<DiscourseTopic[] | DiscourseTopic | DiscoursePost[]> {
    if (!this.baseUrl || !this.apiKey) {
      throw new Error('Not connected to Discourse');
    }

    switch (params.action) {
      case 'list_topics':
        return this.listTopics(params.limit);
      case 'get_topic':
        if (!params.topicId) throw new Error('topicId required');
        return this.getTopic(params.topicId);
      case 'search':
        if (!params.query) throw new Error('query required');
        return this.search(params.query, params.limit);
      case 'get_category_topics':
        if (!params.categoryId) throw new Error('categoryId required');
        return this.getCategoryTopics(params.categoryId, params.limit);
      default:
        throw new Error(`Unknown action: ${params.action}`);
    }
  }

  private async listTopics(limit = 30): Promise<DiscourseTopic[]> {
    const response = await fetch(`${this.baseUrl}/latest.json?limit=${limit}`, {
      headers: {
        'Api-Key': this.apiKey!,
        'Api-Username': this.apiUsername || 'system',
      },
    });
    const data = await response.json();
    return data.topic_list.topics.map((t: any) => ({
      id: t.id,
      title: t.title,
      slug: t.slug,
      postsCount: t.posts_count,
      views: t.views,
      likeCount: t.like_count,
      createdAt: t.created_at,
      lastPostedAt: t.last_posted_at,
      categoryId: t.category_id,
    }));
  }

  private async getTopic(topicId: number): Promise<DiscourseTopic> {
    const response = await fetch(`${this.baseUrl}/t/${topicId}.json`, {
      headers: {
        'Api-Key': this.apiKey!,
        'Api-Username': this.apiUsername || 'system',
      },
    });
    const t = await response.json();
    return {
      id: t.id,
      title: t.title,
      slug: t.slug,
      postsCount: t.posts_count,
      views: t.views,
      likeCount: t.like_count,
      createdAt: t.created_at,
      lastPostedAt: t.last_posted_at,
      categoryId: t.category_id,
    };
  }

  private async search(query: string, limit = 30): Promise<DiscourseTopic[]> {
    const response = await fetch(
      `${this.baseUrl}/search.json?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Api-Key': this.apiKey!,
          'Api-Username': this.apiUsername || 'system',
        },
      }
    );
    const data = await response.json();
    return (data.topics || []).slice(0, limit).map((t: any) => ({
      id: t.id,
      title: t.title,
      slug: t.slug,
      postsCount: t.posts_count,
      views: t.views,
      likeCount: t.like_count,
      createdAt: t.created_at,
      lastPostedAt: t.last_posted_at,
      categoryId: t.category_id,
    }));
  }

  private async getCategoryTopics(categoryId: number, limit = 30): Promise<DiscourseTopic[]> {
    const response = await fetch(`${this.baseUrl}/c/${categoryId}.json`, {
      headers: {
        'Api-Key': this.apiKey!,
        'Api-Username': this.apiUsername || 'system',
      },
    });
    const data = await response.json();
    return data.topic_list.topics.slice(0, limit).map((t: any) => ({
      id: t.id,
      title: t.title,
      slug: t.slug,
      postsCount: t.posts_count,
      views: t.views,
      likeCount: t.like_count,
      createdAt: t.created_at,
      lastPostedAt: t.last_posted_at,
      categoryId: t.category_id,
    }));
  }
}

export function createDiscourseClient(config?: DiscourseClientConfig): DiscourseClient {
  const client = new DiscourseClient();
  if (config?.apiKey && config.baseUrl) {
    // Would need to set baseUrl and apiUsername as well
  }
  return client;
}
