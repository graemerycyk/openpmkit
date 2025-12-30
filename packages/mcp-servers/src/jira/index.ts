import { z } from 'zod';
import { BaseMCPServer, createProposalTool, type MCPContext } from '@pmkit/mcp';

// ============================================================================
// Jira Data Types
// ============================================================================

export const JiraIssueSchema = z.object({
  key: z.string(),
  summary: z.string(),
  description: z.string().optional(),
  issueType: z.enum(['Epic', 'Story', 'Task', 'Bug', 'Subtask']),
  status: z.string(),
  priority: z.enum(['Highest', 'High', 'Medium', 'Low', 'Lowest']),
  assignee: z.string().optional(),
  reporter: z.string(),
  labels: z.array(z.string()),
  components: z.array(z.string()),
  sprint: z.string().optional(),
  storyPoints: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type JiraIssue = z.infer<typeof JiraIssueSchema>;

export const JiraSprintSchema = z.object({
  id: z.string(),
  name: z.string(),
  state: z.enum(['future', 'active', 'closed']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  goal: z.string().optional(),
});

export type JiraSprint = z.infer<typeof JiraSprintSchema>;

// ============================================================================
// Mock Jira MCP Server
// ============================================================================

export class MockJiraMCPServer extends BaseMCPServer {
  private mockIssues: Map<string, JiraIssue> = new Map();
  private mockSprints: Map<string, JiraSprint> = new Map();

  constructor() {
    super({
      name: 'jira',
      description: 'Jira integration for issue tracking and project management',
      version: '1.0.0',
    });

    this.registerTools();
  }

  loadMockData(issues: JiraIssue[], sprints: JiraSprint[]): void {
    this.mockIssues.clear();
    this.mockSprints.clear();

    for (const issue of issues) {
      this.mockIssues.set(issue.key, issue);
    }
    for (const sprint of sprints) {
      this.mockSprints.set(sprint.id, sprint);
    }
  }

  private registerTools(): void {
    // Read tools
    this.registerTool({
      name: 'get_issue',
      description: 'Get a Jira issue by key',
      inputSchema: z.object({ key: z.string() }),
      outputSchema: JiraIssueSchema.nullable(),
      execute: async (input) => {
        return this.mockIssues.get(input.key) || null;
      },
    });

    this.registerTool({
      name: 'search_issues',
      description: 'Search Jira issues with JQL',
      inputSchema: z.object({
        jql: z.string(),
        maxResults: z.number().optional().default(50),
      }),
      outputSchema: z.object({
        issues: z.array(JiraIssueSchema),
        total: z.number(),
      }),
      execute: async (input) => {
        // Simple mock search - in reality would parse JQL
        const issues = Array.from(this.mockIssues.values());
        return {
          issues: issues.slice(0, input.maxResults),
          total: issues.length,
        };
      },
    });

    this.registerTool({
      name: 'get_sprint',
      description: 'Get sprint details',
      inputSchema: z.object({ sprintId: z.string() }),
      outputSchema: JiraSprintSchema.nullable(),
      execute: async (input) => {
        return this.mockSprints.get(input.sprintId) || null;
      },
    });

    this.registerTool({
      name: 'get_sprint_issues',
      description: 'Get all issues in a sprint',
      inputSchema: z.object({ sprintId: z.string() }),
      outputSchema: z.array(JiraIssueSchema),
      execute: async (input) => {
        const sprint = this.mockSprints.get(input.sprintId);
        if (!sprint) return [];

        return Array.from(this.mockIssues.values()).filter(
          (issue) => issue.sprint === sprint.name
        );
      },
    });

    this.registerTool({
      name: 'get_epics',
      description: 'Get all epics in a project',
      inputSchema: z.object({ projectKey: z.string() }),
      outputSchema: z.array(JiraIssueSchema),
      execute: async (input) => {
        return Array.from(this.mockIssues.values()).filter(
          (issue) =>
            issue.issueType === 'Epic' && issue.key.startsWith(input.projectKey)
        );
      },
    });

    // Proposal tools (draft-only)
    this.registerTool(
      createProposalTool(
        'jira_epic',
        'Propose a new Jira epic',
        z.object({
          projectKey: z.string(),
          summary: z.string(),
          description: z.string(),
          labels: z.array(z.string()).optional(),
          priority: z.enum(['Highest', 'High', 'Medium', 'Low', 'Lowest']).optional(),
        }),
        'jira',
        async (input) => {
          const epicKey = `${input.projectKey}-${Date.now()}`;
          return {
            title: input.summary,
            preview: `**New Epic: ${input.summary}**\n\n${input.description}`,
            bundle: {
              type: 'Epic',
              projectKey: input.projectKey,
              summary: input.summary,
              description: input.description,
              labels: input.labels || [],
              priority: input.priority || 'Medium',
            },
            targetId: epicKey,
          };
        }
      )
    );

    this.registerTool(
      createProposalTool(
        'jira_story',
        'Propose a new Jira story',
        z.object({
          projectKey: z.string(),
          epicKey: z.string().optional(),
          summary: z.string(),
          description: z.string(),
          acceptanceCriteria: z.array(z.string()),
          storyPoints: z.number().optional(),
          labels: z.array(z.string()).optional(),
        }),
        'jira',
        async (input) => {
          const storyKey = `${input.projectKey}-${Date.now()}`;
          const acList = input.acceptanceCriteria
            .map((ac, i) => `${i + 1}. ${ac}`)
            .join('\n');

          return {
            title: input.summary,
            preview: `**New Story: ${input.summary}**\n\n${input.description}\n\n**Acceptance Criteria:**\n${acList}`,
            diff: input.epicKey ? `Parent Epic: ${input.epicKey}` : undefined,
            bundle: {
              type: 'Story',
              projectKey: input.projectKey,
              epicKey: input.epicKey,
              summary: input.summary,
              description: input.description,
              acceptanceCriteria: input.acceptanceCriteria,
              storyPoints: input.storyPoints,
              labels: input.labels || [],
            },
            targetId: storyKey,
          };
        }
      )
    );

    this.registerTool(
      createProposalTool(
        'jira_comment',
        'Propose a comment on a Jira issue',
        z.object({
          issueKey: z.string(),
          body: z.string(),
        }),
        'jira',
        async (input) => {
          return {
            title: `Comment on ${input.issueKey}`,
            preview: input.body,
            bundle: {
              issueKey: input.issueKey,
              body: input.body,
            },
            targetId: input.issueKey,
          };
        }
      )
    );
  }
}

export const mockJiraServer = new MockJiraMCPServer();

