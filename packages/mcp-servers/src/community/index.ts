import { z } from 'zod';
import { BaseMCPServer } from '@pmkit/mcp';

// ============================================================================
// Community Data Types (Discourse, GitHub Discussions, etc.)
// ============================================================================

export const CommunityPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  author: z.string(),
  authorReputation: z.number().optional(),
  category: z.string(),
  tags: z.array(z.string()),
  upvotes: z.number(),
  replies: z.number(),
  views: z.number(),
  isResolved: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  source: z.enum(['discourse', 'github', 'reddit', 'custom']),
});

export type CommunityPost = z.infer<typeof CommunityPostSchema>;

export const CommunityReplySchema = z.object({
  id: z.string(),
  postId: z.string(),
  body: z.string(),
  author: z.string(),
  isStaffReply: z.boolean(),
  isSolution: z.boolean(),
  upvotes: z.number(),
  createdAt: z.string(),
});

export type CommunityReply = z.infer<typeof CommunityReplySchema>;

export const FeatureRequestSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  author: z.string(),
  votes: z.number(),
  status: z.enum(['open', 'under_review', 'planned', 'in_progress', 'completed', 'declined']),
  category: z.string(),
  tags: z.array(z.string()),
  comments: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type FeatureRequest = z.infer<typeof FeatureRequestSchema>;

// ============================================================================
// Mock Community MCP Server
// ============================================================================

export class MockCommunityMCPServer extends BaseMCPServer {
  private mockPosts: Map<string, CommunityPost> = new Map();
  private mockReplies: Map<string, CommunityReply[]> = new Map();
  private mockFeatureRequests: Map<string, FeatureRequest> = new Map();

  constructor() {
    super({
      name: 'community',
      description: 'Community integration for forums, discussions, and feature requests',
      version: '1.0.0',
    });

    this.registerTools();
  }

  loadMockData(
    posts: CommunityPost[],
    replies: CommunityReply[],
    featureRequests: FeatureRequest[]
  ): void {
    this.mockPosts.clear();
    this.mockReplies.clear();
    this.mockFeatureRequests.clear();

    for (const post of posts) {
      this.mockPosts.set(post.id, post);
    }

    for (const reply of replies) {
      const existing = this.mockReplies.get(reply.postId) || [];
      existing.push(reply);
      this.mockReplies.set(reply.postId, existing);
    }

    for (const request of featureRequests) {
      this.mockFeatureRequests.set(request.id, request);
    }
  }

  private registerTools(): void {
    this.registerTool({
      name: 'get_posts',
      description: 'Get community posts with optional filters',
      inputSchema: z.object({
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        source: z.enum(['discourse', 'github', 'reddit', 'custom']).optional(),
        minUpvotes: z.number().optional(),
        fromDate: z.string().optional(),
        limit: z.number().optional().default(50),
      }),
      outputSchema: z.object({
        posts: z.array(CommunityPostSchema),
        total: z.number(),
      }),
      execute: async (input) => {
        let posts = Array.from(this.mockPosts.values());

        if (input.category) {
          posts = posts.filter((p) => p.category === input.category);
        }
        if (input.tags?.length) {
          posts = posts.filter((p) =>
            input.tags!.some((tag) => p.tags.includes(tag))
          );
        }
        if (input.source) {
          posts = posts.filter((p) => p.source === input.source);
        }
        if (input.minUpvotes) {
          posts = posts.filter((p) => p.upvotes >= input.minUpvotes!);
        }

        // Sort by engagement (upvotes + replies)
        posts.sort((a, b) => b.upvotes + b.replies - (a.upvotes + a.replies));

        return {
          posts: posts.slice(0, input.limit),
          total: posts.length,
        };
      },
    });

    this.registerTool({
      name: 'get_post',
      description: 'Get a specific community post with replies',
      inputSchema: z.object({ postId: z.string() }),
      outputSchema: z
        .object({
          post: CommunityPostSchema,
          replies: z.array(CommunityReplySchema),
        })
        .nullable(),
      execute: async (input) => {
        const post = this.mockPosts.get(input.postId);
        if (!post) return null;

        const replies = this.mockReplies.get(input.postId) || [];

        return { post, replies };
      },
    });

    this.registerTool({
      name: 'search_posts',
      description: 'Search community posts by text',
      inputSchema: z.object({
        query: z.string(),
        limit: z.number().optional().default(25),
      }),
      outputSchema: z.array(CommunityPostSchema),
      execute: async (input) => {
        const query = input.query.toLowerCase();

        return Array.from(this.mockPosts.values())
          .filter(
            (p) =>
              p.title.toLowerCase().includes(query) ||
              p.body.toLowerCase().includes(query)
          )
          .slice(0, input.limit);
      },
    });

    this.registerTool({
      name: 'get_trending_topics',
      description: 'Get trending topics based on recent activity',
      inputSchema: z.object({
        period: z.enum(['day', 'week', 'month']).optional().default('week'),
        limit: z.number().optional().default(10),
      }),
      outputSchema: z.array(
        z.object({
          topic: z.string(),
          postCount: z.number(),
          totalEngagement: z.number(),
          examplePosts: z.array(z.string()),
        })
      ),
      execute: async (input) => {
        // Aggregate by tags
        const topicMap: Record<
          string,
          { postCount: number; engagement: number; examples: string[] }
        > = {};

        for (const post of this.mockPosts.values()) {
          for (const tag of post.tags) {
            if (!topicMap[tag]) {
              topicMap[tag] = { postCount: 0, engagement: 0, examples: [] };
            }
            topicMap[tag].postCount++;
            topicMap[tag].engagement += post.upvotes + post.replies;
            if (topicMap[tag].examples.length < 3) {
              topicMap[tag].examples.push(post.title);
            }
          }
        }

        return Object.entries(topicMap)
          .map(([topic, data]) => ({
            topic,
            postCount: data.postCount,
            totalEngagement: data.engagement,
            examplePosts: data.examples,
          }))
          .sort((a, b) => b.totalEngagement - a.totalEngagement)
          .slice(0, input.limit);
      },
    });

    this.registerTool({
      name: 'get_feature_requests',
      description: 'Get feature requests from the community',
      inputSchema: z.object({
        status: z
          .enum(['open', 'under_review', 'planned', 'in_progress', 'completed', 'declined'])
          .optional(),
        category: z.string().optional(),
        minVotes: z.number().optional(),
        sortBy: z.enum(['votes', 'recent', 'comments']).optional().default('votes'),
        limit: z.number().optional().default(25),
      }),
      outputSchema: z.object({
        requests: z.array(FeatureRequestSchema),
        total: z.number(),
      }),
      execute: async (input) => {
        let requests = Array.from(this.mockFeatureRequests.values());

        if (input.status) {
          requests = requests.filter((r) => r.status === input.status);
        }
        if (input.category) {
          requests = requests.filter((r) => r.category === input.category);
        }
        if (input.minVotes) {
          requests = requests.filter((r) => r.votes >= input.minVotes!);
        }

        // Sort
        requests.sort((a, b) => {
          switch (input.sortBy) {
            case 'recent':
              return (
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
              );
            case 'comments':
              return b.comments - a.comments;
            default:
              return b.votes - a.votes;
          }
        });

        return {
          requests: requests.slice(0, input.limit),
          total: requests.length,
        };
      },
    });

    this.registerTool({
      name: 'get_top_feature_requests',
      description: 'Get the most voted feature requests',
      inputSchema: z.object({
        minVotes: z.number().optional().default(10),
        excludeCompleted: z.boolean().optional().default(true),
        limit: z.number().optional().default(10),
      }),
      outputSchema: z.array(FeatureRequestSchema),
      execute: async (input) => {
        const minVotes = input.minVotes ?? 10;
        const excludeCompleted = input.excludeCompleted ?? true;
        const limit = input.limit ?? 10;
        
        let requests = Array.from(this.mockFeatureRequests.values()).filter(
          (r) => r.votes >= minVotes
        );

        if (excludeCompleted) {
          requests = requests.filter(
            (r) => r.status !== 'completed' && r.status !== 'declined'
          );
        }

        return requests.sort((a, b) => b.votes - a.votes).slice(0, limit);
      },
    });

    this.registerTool({
      name: 'get_unanswered_posts',
      description: 'Get posts that need staff attention',
      inputSchema: z.object({
        minAge: z.number().optional().default(24), // hours
        limit: z.number().optional().default(25),
      }),
      outputSchema: z.array(CommunityPostSchema),
      execute: async (input) => {
        const posts: CommunityPost[] = [];

        for (const post of this.mockPosts.values()) {
          const replies = this.mockReplies.get(post.id) || [];
          const hasStaffReply = replies.some((r) => r.isStaffReply);

          if (!hasStaffReply && !post.isResolved) {
            posts.push(post);
          }
        }

        return posts
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
          .slice(0, input.limit);
      },
    });
  }
}

export const mockCommunityServer = new MockCommunityMCPServer();

