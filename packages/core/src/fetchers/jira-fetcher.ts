import { decryptTokens } from '../connectors';
import type {
  EncryptedCredentials,
  FetchedItem,
  FetchResult,
  FetchOptions,
  IFetcher,
} from './types';

// ============================================================================
// Jira-specific types
// ============================================================================

/**
 * Metadata specific to Jira issues.
 */
export interface JiraIssueMetadata {
  projectKey: string;
  projectName: string;
  issueType: string;
  status: string;
  priority?: string;
  labels?: string[];
  assignee?: {
    accountId: string;
    displayName: string;
    emailAddress?: string;
  };
  sprint?: {
    id: number;
    name: string;
    state: string;
  };
  storyPoints?: number;
  resolution?: string;
}

/**
 * Jira-specific fetch options.
 */
export interface JiraFetchOptions extends FetchOptions {
  /** Project keys to filter by (e.g., ['PROJ', 'TEAM']) */
  projectKeys?: string[];
  /** JQL query to filter issues */
  jql?: string;
  /** Issue types to include (e.g., ['Story', 'Bug', 'Task']) */
  issueTypes?: string[];
  /** Statuses to filter by (e.g., ['In Progress', 'Done']) */
  statuses?: string[];
  /** Include only issues assigned to current user */
  assignedToMe?: boolean;
  /** Include only recently updated issues (default: true) */
  recentlyUpdated?: boolean;
}

// ============================================================================
// Internal Types for Jira API Responses
// ============================================================================

interface JiraApiIssue {
  id: string;
  key: string;
  self: string;
  fields: {
    summary: string;
    description?: string | { content?: Array<{ content?: Array<{ text?: string }> }> };
    issuetype: { name: string };
    status: { name: string };
    priority?: { name: string };
    labels?: string[];
    assignee?: {
      accountId: string;
      displayName: string;
      emailAddress?: string;
    };
    reporter?: {
      accountId: string;
      displayName: string;
      emailAddress?: string;
    };
    project: {
      key: string;
      name: string;
    };
    created: string;
    updated: string;
    resolution?: { name: string };
    // Sprint field (customfield varies by instance)
    customfield_10020?: Array<{
      id: number;
      name: string;
      state: string;
    }>;
    // Story points (customfield varies by instance)
    customfield_10028?: number;
  };
}

interface JiraSearchResponse {
  issues: JiraApiIssue[];
  total: number;
  startAt: number;
  maxResults: number;
}

interface AtlassianTokens {
  accessToken: string;
  refreshToken?: string;
  cloudId: string;
  siteUrl: string;
  siteName: string;
}

// ============================================================================
// Jira Fetcher Implementation
// ============================================================================

/**
 * Fetcher for Jira issues.
 * Implements the IFetcher interface for use by any agent.
 *
 * @example
 * ```typescript
 * // Create from encrypted credentials
 * const fetcher = JiraFetcher.fromEncrypted({
 *   encryptedBlob: '...',
 *   encryptionKey: '...',
 * });
 *
 * // Fetch recently updated issues
 * const result = await fetcher.fetch({
 *   projectKeys: ['PROJ'],
 *   sinceHoursAgo: 24,
 * });
 *
 * // Process fetched items
 * for (const item of result.items) {
 *   console.log(`[${item.metadata.status}] ${item.title}`);
 * }
 * ```
 */
export class JiraFetcher implements IFetcher<JiraIssueMetadata, JiraFetchOptions> {
  readonly connector = 'jira';
  readonly sourceTypes = ['jira_issue'] as const;

  private accessToken: string;
  private cloudId: string;
  private siteUrl: string;

  constructor(tokens: AtlassianTokens) {
    this.accessToken = tokens.accessToken;
    this.cloudId = tokens.cloudId;
    this.siteUrl = tokens.siteUrl;
  }

  /**
   * Create fetcher from encrypted credential blob.
   */
  static fromEncrypted(credentials: EncryptedCredentials): JiraFetcher {
    const tokens = decryptTokens(credentials.encryptedBlob, credentials.encryptionKey) as AtlassianTokens;
    return new JiraFetcher(tokens);
  }

  /**
   * Fetch issues from Jira.
   */
  async fetch(options: JiraFetchOptions): Promise<FetchResult<JiraIssueMetadata>> {
    const startTime = Date.now();
    const {
      projectKeys,
      jql,
      issueTypes,
      statuses,
      assignedToMe,
      sinceHoursAgo = 24,
      recentlyUpdated = true,
      limit = 100,
      onProgress,
    } = options;

    const items: FetchedItem<JiraIssueMetadata>[] = [];

    // Build JQL query
    const jqlParts: string[] = [];

    if (jql) {
      jqlParts.push(`(${jql})`);
    }

    if (projectKeys && projectKeys.length > 0) {
      jqlParts.push(`project IN (${projectKeys.join(', ')})`);
    }

    if (issueTypes && issueTypes.length > 0) {
      jqlParts.push(`issuetype IN (${issueTypes.map((t) => `"${t}"`).join(', ')})`);
    }

    if (statuses && statuses.length > 0) {
      jqlParts.push(`status IN (${statuses.map((s) => `"${s}"`).join(', ')})`);
    }

    if (assignedToMe) {
      jqlParts.push('assignee = currentUser()');
    }

    if (recentlyUpdated && sinceHoursAgo) {
      // Jira uses negative minutes for "within the last X minutes"
      const minutes = sinceHoursAgo * 60;
      jqlParts.push(`updated >= -${minutes}m`);
    }

    const finalJql = jqlParts.length > 0 ? jqlParts.join(' AND ') : 'ORDER BY updated DESC';

    onProgress?.('Fetching Jira issues...');

    let startAt = 0;
    const maxResults = 50;

    do {
      const searchUrl = `https://api.atlassian.com/ex/jira/${this.cloudId}/rest/api/3/search`;
      const params = new URLSearchParams({
        jql: finalJql,
        startAt: startAt.toString(),
        maxResults: maxResults.toString(),
        fields: 'summary,description,issuetype,status,priority,labels,assignee,reporter,project,created,updated,resolution,customfield_10020,customfield_10028',
      });

      const response = await fetch(`${searchUrl}?${params}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Jira API error (${response.status}): ${errorText}`);
      }

      const data: JiraSearchResponse = await response.json();

      for (const issue of data.issues) {
        const item = this.transformIssue(issue);
        items.push(item);
      }

      onProgress?.(`Fetched ${items.length} of ${data.total} issues...`);

      startAt += maxResults;

      // Stop if we've reached the limit or there are no more results
      if (items.length >= limit || startAt >= data.total) {
        break;
      }
    } while (true);

    // Trim to limit if needed
    const trimmedItems = items.slice(0, limit);

    return {
      connector: this.connector,
      items: trimmedItems,
      stats: {
        itemsProcessed: trimmedItems.length,
        durationMs: Date.now() - startTime,
      },
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Transform a Jira API issue to a FetchedItem.
   */
  private transformIssue(issue: JiraApiIssue): FetchedItem<JiraIssueMetadata> {
    const description = this.extractDescription(issue.fields.description);
    const sprint = issue.fields.customfield_10020?.[0];

    return {
      externalId: issue.key,
      sourceType: 'jira_issue',
      title: `[${issue.key}] ${issue.fields.summary}`,
      url: `${this.siteUrl}/browse/${issue.key}`,
      content: this.buildContent(issue, description),
      timestamp: new Date(issue.fields.updated),
      author: {
        id: issue.fields.reporter?.accountId || 'unknown',
        name: issue.fields.reporter?.displayName || 'Unknown',
        email: issue.fields.reporter?.emailAddress,
      },
      metadata: {
        projectKey: issue.fields.project.key,
        projectName: issue.fields.project.name,
        issueType: issue.fields.issuetype.name,
        status: issue.fields.status.name,
        priority: issue.fields.priority?.name,
        labels: issue.fields.labels,
        assignee: issue.fields.assignee
          ? {
              accountId: issue.fields.assignee.accountId,
              displayName: issue.fields.assignee.displayName,
              emailAddress: issue.fields.assignee.emailAddress,
            }
          : undefined,
        sprint: sprint
          ? {
              id: sprint.id,
              name: sprint.name,
              state: sprint.state,
            }
          : undefined,
        storyPoints: issue.fields.customfield_10028,
        resolution: issue.fields.resolution?.name,
      },
    };
  }

  /**
   * Extract plain text description from Jira's ADF format.
   */
  private extractDescription(description: JiraApiIssue['fields']['description']): string {
    if (!description) return '';

    // Plain text description
    if (typeof description === 'string') {
      return description;
    }

    // ADF (Atlassian Document Format) - extract text content
    try {
      const textParts: string[] = [];

      const extractText = (node: unknown): void => {
        if (!node || typeof node !== 'object') return;

        const n = node as Record<string, unknown>;

        if (n.text && typeof n.text === 'string') {
          textParts.push(n.text);
        }

        if (Array.isArray(n.content)) {
          for (const child of n.content) {
            extractText(child);
          }
        }
      };

      extractText(description);
      return textParts.join(' ');
    } catch {
      return '';
    }
  }

  /**
   * Build content string for LLM consumption.
   */
  private buildContent(issue: JiraApiIssue, description: string): string {
    const parts = [
      `Issue: ${issue.key}`,
      `Summary: ${issue.fields.summary}`,
      `Type: ${issue.fields.issuetype.name}`,
      `Status: ${issue.fields.status.name}`,
    ];

    if (issue.fields.priority) {
      parts.push(`Priority: ${issue.fields.priority.name}`);
    }

    if (issue.fields.assignee) {
      parts.push(`Assignee: ${issue.fields.assignee.displayName}`);
    }

    if (issue.fields.labels && issue.fields.labels.length > 0) {
      parts.push(`Labels: ${issue.fields.labels.join(', ')}`);
    }

    if (description) {
      parts.push(`\nDescription:\n${description}`);
    }

    return parts.join('\n');
  }
}
