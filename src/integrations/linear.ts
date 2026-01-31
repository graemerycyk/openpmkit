/**
 * Linear Integration
 *
 * Sync issues and projects from Linear.
 * Status: Coming Soon
 */

import type {
  IntegrationClient,
  IntegrationCredentials,
  LinearIssue,
  LinearProject,
} from './types.js';

export interface LinearClientConfig {
  accessToken?: string;
}

export interface LinearFetchParams {
  action: 'list_issues' | 'get_issue' | 'list_projects' | 'search_issues';
  issueId?: string;
  projectId?: string;
  query?: string;
  teamId?: string;
  limit?: number;
}

export class LinearClient implements IntegrationClient<LinearIssue[] | LinearIssue | LinearProject[]> {
  readonly integrationId = 'linear';
  private accessToken?: string;

  get isConnected(): boolean {
    return !!this.accessToken;
  }

  async connect(credentials: IntegrationCredentials): Promise<void> {
    if (credentials.accessToken) {
      this.accessToken = credentials.accessToken;
    } else {
      throw new Error('Linear requires an access token');
    }
  }

  async disconnect(): Promise<void> {
    this.accessToken = undefined;
  }

  async testConnection(): Promise<boolean> {
    if (!this.accessToken) return false;

    try {
      const response = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          Authorization: this.accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: '{ viewer { id email } }',
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async fetchData(params: LinearFetchParams): Promise<LinearIssue[] | LinearIssue | LinearProject[]> {
    if (!this.accessToken) {
      throw new Error('Not connected to Linear');
    }

    switch (params.action) {
      case 'list_issues':
        return this.listIssues(params.teamId, params.limit);
      case 'get_issue':
        if (!params.issueId) throw new Error('issueId required');
        return this.getIssue(params.issueId);
      case 'list_projects':
        return this.listProjects(params.teamId, params.limit);
      case 'search_issues':
        if (!params.query) throw new Error('query required');
        return this.searchIssues(params.query, params.limit);
      default:
        throw new Error(`Unknown action: ${params.action}`);
    }
  }

  private async graphql(query: string, variables?: Record<string, unknown>): Promise<any> {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        Authorization: this.accessToken!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`Linear API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data;
  }

  private async listIssues(teamId?: string, limit = 50): Promise<LinearIssue[]> {
    const query = `
      query($first: Int, $teamId: String) {
        issues(first: $first, filter: { team: { id: { eq: $teamId } } }) {
          nodes {
            id identifier title description priority createdAt updatedAt
            state { name color }
            assignee { name email }
          }
        }
      }
    `;
    const data = await this.graphql(query, { first: limit, teamId });
    return data.issues.nodes.map((i: any) => ({
      id: i.id,
      identifier: i.identifier,
      title: i.title,
      description: i.description,
      state: i.state,
      priority: i.priority,
      assignee: i.assignee,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    }));
  }

  private async getIssue(issueId: string): Promise<LinearIssue> {
    const query = `
      query($id: String!) {
        issue(id: $id) {
          id identifier title description priority createdAt updatedAt
          state { name color }
          assignee { name email }
        }
      }
    `;
    const data = await this.graphql(query, { id: issueId });
    const i = data.issue;
    return {
      id: i.id,
      identifier: i.identifier,
      title: i.title,
      description: i.description,
      state: i.state,
      priority: i.priority,
      assignee: i.assignee,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    };
  }

  private async listProjects(teamId?: string, limit = 25): Promise<LinearProject[]> {
    const query = `
      query($first: Int) {
        projects(first: $first) {
          nodes {
            id name description state progress startDate targetDate
          }
        }
      }
    `;
    const data = await this.graphql(query, { first: limit });
    return data.projects.nodes.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      state: p.state,
      progress: p.progress,
      startDate: p.startDate,
      targetDate: p.targetDate,
    }));
  }

  private async searchIssues(query: string, limit = 25): Promise<LinearIssue[]> {
    const gql = `
      query($query: String!, $first: Int) {
        issueSearch(query: $query, first: $first) {
          nodes {
            id identifier title description priority createdAt updatedAt
            state { name color }
            assignee { name email }
          }
        }
      }
    `;
    const data = await this.graphql(gql, { query, first: limit });
    return data.issueSearch.nodes.map((i: any) => ({
      id: i.id,
      identifier: i.identifier,
      title: i.title,
      description: i.description,
      state: i.state,
      priority: i.priority,
      assignee: i.assignee,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    }));
  }
}

export function createLinearClient(config?: LinearClientConfig): LinearClient {
  const client = new LinearClient();
  if (config?.accessToken) {
    client.connect({ integrationId: 'linear', accessToken: config.accessToken });
  }
  return client;
}
