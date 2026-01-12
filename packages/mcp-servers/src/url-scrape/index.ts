import { BaseMCPServer } from '@pmkit/mcp';
import { z } from 'zod';

// Mock scraped page results
const mockScrapedPages = [
  {
    url: 'https://competitora.com/pricing',
    title: 'Competitor A - Enterprise Product Management Platform',
    content: `Enterprise Product Management Platform

Transform how your team builds products with AI-powered automation.

Pricing:
- Starter: $29/seat/month - Up to 5 users, basic integrations
- Pro: $79/seat/month - Unlimited users, all integrations, AI features
- Enterprise: Custom pricing - SSO, dedicated support, custom integrations

Key Features:
• AI-powered PRD generation
• Jira and Confluence integration
• Real-time collaboration
• Roadmap visualization
• Sprint planning automation

Trusted by 500+ companies including Fortune 500 enterprises.

"Competitor A has transformed how we manage our product development process." - VP Product, TechCorp

Start your free 14-day trial today. No credit card required.`,
    description: 'Enterprise product management platform with AI-powered automation',
    author: undefined,
    publishedDate: undefined,
    metadata: {
      domain: 'competitora.com',
      path: '/pricing',
      contentLength: 892,
      pageType: 'pricing',
    },
  },
  {
    url: 'https://competitorb.com',
    title: 'Competitor B - The Modern PM Toolkit',
    content: `The Modern PM Toolkit - Built for Speed

Ship products faster with our streamlined workflow tools.

Why teams choose Competitor B:
1. 50% faster PRD creation with AI assistance
2. Native Slack integration - work where you already are
3. Automatic status updates from Jira
4. Meeting prep packs generated in seconds

Pricing Plans:
- Free: $0/month - 3 users, limited features
- Team: $49/seat/month - 10 users, core integrations
- Business: $99/seat/month - Unlimited users, all features, priority support

New: AI PRD Generator now available! Create comprehensive product requirements in minutes.

Join 10,000+ product managers who trust Competitor B.

Book a demo to see how we can help your team.`,
    description: 'Modern PM toolkit built for speed and efficiency',
    author: undefined,
    publishedDate: undefined,
    metadata: {
      domain: 'competitorb.com',
      path: '/',
      contentLength: 756,
      pageType: 'homepage',
    },
  },
  {
    url: 'https://notion.so/product',
    title: 'Notion - Your connected workspace for wiki, docs & projects',
    content: `Notion - The all-in-one workspace

Write, plan, collaborate, and get organized — all in one tool.

For Product Teams:
• Product roadmaps and wikis
• Sprint planning templates
• Meeting notes and decisions
• Customer feedback tracking

Notion AI Features:
- Summarize meeting notes
- Generate action items
- Draft product specs
- Translate content

Pricing:
- Free: $0 - For individuals
- Plus: $10/seat/month - For small teams
- Business: $18/seat/month - For companies
- Enterprise: Custom - Advanced controls

Used by teams at Figma, Pixar, Nike, and more.

Start free today - no credit card needed.`,
    description: 'All-in-one workspace for wiki, docs, and projects',
    author: undefined,
    publishedDate: undefined,
    metadata: {
      domain: 'notion.so',
      path: '/product',
      contentLength: 634,
      pageType: 'product',
    },
  },
  {
    url: 'https://coda.io/product',
    title: 'Coda - The doc that brings it all together',
    content: `Coda - The doc that brings it all together

All your words and data, in one flexible surface.

Product Management Features:
• Flexible docs that work like apps
• Built-in tables and databases
• Automations and integrations
• Real-time collaboration

AI Pack Features:
- AI writing assistant
- Smart summaries
- Data analysis
- Content generation

Pricing:
- Free: $0 - Unlimited docs, limited rows
- Pro: $12/doc maker/month - Unlimited rows
- Team: $36/doc maker/month - Advanced permissions
- Enterprise: Custom - SSO, audit logs

Trusted by teams at Spotify, Uber, and Square.`,
    description: 'The doc that brings words and data together',
    author: undefined,
    publishedDate: undefined,
    metadata: {
      domain: 'coda.io',
      path: '/product',
      contentLength: 589,
      pageType: 'product',
    },
  },
];

export class MockUrlScrapeMCPServer extends BaseMCPServer {
  constructor() {
    super({
      name: 'url_scrape',
      description: 'Scrape and extract content from specific URLs for competitive research',
      version: '1.0.0',
    });
    this.registerTools();
  }

  private registerTools(): void {
    // Scrape single URL
    this.registerTool({
      name: 'scrape_url',
      description: 'Fetch and extract content from a specific URL',
      inputSchema: z.object({
        url: z.string().url().describe('URL to scrape'),
        extractOptions: z
          .object({
            includeMetadata: z.boolean().default(true),
            maxContentLength: z.number().default(10000),
          })
          .optional(),
      }),
      outputSchema: z.object({
        success: z.boolean(),
        title: z.string(),
        content: z.string(),
        description: z.string().optional(),
        author: z.string().optional(),
        publishedDate: z.string().optional(),
        metadata: z.record(z.unknown()).optional(),
        error: z.string().optional(),
      }),
      execute: async (input) => {
        // Find mock data for this URL or generate generic response
        const mockPage = mockScrapedPages.find((p) =>
          input.url.includes(new URL(p.url).hostname)
        );

        if (mockPage) {
          return {
            success: true,
            title: mockPage.title,
            content: mockPage.content,
            description: mockPage.description,
            author: mockPage.author,
            publishedDate: mockPage.publishedDate,
            metadata: input.extractOptions?.includeMetadata ? mockPage.metadata : undefined,
          };
        }

        // Generate generic mock response for unknown URLs
        const parsedUrl = new URL(input.url);
        return {
          success: true,
          title: `Page from ${parsedUrl.hostname}`,
          content: `This is mock content extracted from ${input.url}. In production, this would contain the actual page content parsed from HTML.

The page appears to be about product management tools and their features. Key sections include pricing information, feature comparisons, and customer testimonials.

For competitive research purposes, note the following:
- Pricing tiers and positioning
- Key feature differentiators
- Target audience messaging
- Social proof and testimonials`,
          description: `Content from ${parsedUrl.hostname}`,
          metadata: input.extractOptions?.includeMetadata
            ? {
                domain: parsedUrl.hostname,
                path: parsedUrl.pathname,
                contentLength: 500,
              }
            : undefined,
        };
      },
    });

    // Scrape multiple URLs
    this.registerTool({
      name: 'scrape_urls',
      description: 'Fetch and extract content from multiple URLs',
      inputSchema: z.object({
        urls: z.array(z.string().url()).min(1).max(10).describe('URLs to scrape'),
        extractOptions: z
          .object({
            includeMetadata: z.boolean().default(true),
            maxContentLength: z.number().default(10000),
          })
          .optional(),
      }),
      outputSchema: z.object({
        results: z.array(
          z.object({
            url: z.string(),
            success: z.boolean(),
            title: z.string().optional(),
            content: z.string().optional(),
            description: z.string().optional(),
            metadata: z.record(z.unknown()).optional(),
            error: z.string().optional(),
          })
        ),
        successCount: z.number(),
        failureCount: z.number(),
      }),
      execute: async (input) => {
        const results = input.urls.map((url) => {
          const mockPage = mockScrapedPages.find((p) =>
            url.includes(new URL(p.url).hostname)
          );

          if (mockPage) {
            return {
              url,
              success: true,
              title: mockPage.title,
              content: mockPage.content,
              description: mockPage.description,
              metadata: input.extractOptions?.includeMetadata ? mockPage.metadata : undefined,
            };
          }

          // Generate generic mock response
          const parsedUrl = new URL(url);
          return {
            url,
            success: true,
            title: `Page from ${parsedUrl.hostname}`,
            content: `Mock content from ${url}. Contains product information, pricing, and features.`,
            description: `Content from ${parsedUrl.hostname}`,
            metadata: input.extractOptions?.includeMetadata
              ? {
                  domain: parsedUrl.hostname,
                  path: parsedUrl.pathname,
                }
              : undefined,
          };
        });

        return {
          results,
          successCount: results.filter((r) => r.success).length,
          failureCount: results.filter((r) => !r.success).length,
        };
      },
    });

    // Compare pages
    this.registerTool({
      name: 'compare_pages',
      description: 'Compare content from multiple competitor pages',
      inputSchema: z.object({
        urls: z.array(z.string().url()).min(2).max(5).describe('URLs to compare'),
        focusAreas: z
          .array(z.enum(['pricing', 'features', 'messaging', 'social_proof']))
          .optional()
          .describe('Areas to focus comparison on'),
      }),
      outputSchema: z.object({
        comparison: z.array(
          z.object({
            url: z.string(),
            domain: z.string(),
            title: z.string(),
            keyPoints: z.array(z.string()),
            pricing: z.string().optional(),
            differentiators: z.array(z.string()),
          })
        ),
        summary: z.string(),
      }),
      execute: async (input) => {
        const comparison = input.urls.map((url) => {
          const mockPage = mockScrapedPages.find((p) =>
            url.includes(new URL(p.url).hostname)
          );
          const parsedUrl = new URL(url);

          if (mockPage) {
            // Extract pricing from content
            const pricingMatch = mockPage.content.match(/\$\d+[^.]*month/gi);
            const pricing = pricingMatch ? pricingMatch.join(', ') : 'Custom pricing';

            return {
              url,
              domain: parsedUrl.hostname,
              title: mockPage.title,
              keyPoints: [
                'AI-powered features',
                'Enterprise integrations',
                'Team collaboration tools',
              ],
              pricing,
              differentiators: [
                'Unique positioning in market',
                'Strong integration ecosystem',
                'Focus on automation',
              ],
            };
          }

          return {
            url,
            domain: parsedUrl.hostname,
            title: `${parsedUrl.hostname} - Product Page`,
            keyPoints: ['Product management features', 'Team collaboration', 'Integrations'],
            pricing: 'See website for pricing',
            differentiators: ['Market positioning', 'Feature set', 'Target audience'],
          };
        });

        return {
          comparison,
          summary: `Compared ${input.urls.length} competitor pages. Key differences found in pricing models, feature emphasis, and target audience messaging. All competitors offer AI features and enterprise integrations.`,
        };
      },
    });

    // Extract specific data
    this.registerTool({
      name: 'extract_page_data',
      description: 'Extract specific structured data from a page (pricing, features, etc.)',
      inputSchema: z.object({
        url: z.string().url().describe('URL to extract data from'),
        dataType: z
          .enum(['pricing', 'features', 'testimonials', 'team', 'contact'])
          .describe('Type of data to extract'),
      }),
      outputSchema: z.object({
        url: z.string(),
        dataType: z.string(),
        extracted: z.record(z.unknown()),
        confidence: z.enum(['high', 'medium', 'low']),
      }),
      execute: async (input) => {
        const mockPage = mockScrapedPages.find((p) =>
          input.url.includes(new URL(p.url).hostname)
        );

        if (input.dataType === 'pricing') {
          return {
            url: input.url,
            dataType: 'pricing',
            extracted: {
              tiers: [
                { name: 'Starter', price: '$29/seat/month', features: ['Basic features', '5 users'] },
                { name: 'Pro', price: '$79/seat/month', features: ['All features', 'Unlimited users'] },
                { name: 'Enterprise', price: 'Custom', features: ['SSO', 'Dedicated support'] },
              ],
              currency: 'USD',
              billingCycle: 'monthly',
              hasFreeTier: false,
              hasTrial: true,
              trialDays: 14,
            },
            confidence: mockPage ? 'high' as const : 'medium' as const,
          };
        }

        if (input.dataType === 'features') {
          return {
            url: input.url,
            dataType: 'features',
            extracted: {
              categories: [
                {
                  name: 'AI Features',
                  features: ['PRD generation', 'Meeting summaries', 'Status updates'],
                },
                {
                  name: 'Integrations',
                  features: ['Jira', 'Slack', 'Confluence', 'Gong'],
                },
                {
                  name: 'Collaboration',
                  features: ['Real-time editing', 'Comments', 'Sharing'],
                },
              ],
              totalFeatures: 15,
              aiPowered: true,
            },
            confidence: mockPage ? 'high' as const : 'medium' as const,
          };
        }

        if (input.dataType === 'testimonials') {
          return {
            url: input.url,
            dataType: 'testimonials',
            extracted: {
              testimonials: [
                {
                  quote: 'This tool has transformed how we manage our product development.',
                  author: 'VP Product',
                  company: 'TechCorp',
                },
                {
                  quote: 'We saved 10 hours per week on documentation.',
                  author: 'Senior PM',
                  company: 'StartupXYZ',
                },
              ],
              customerLogos: ['Fortune 500 Company', 'Tech Unicorn', 'Enterprise Client'],
              totalCustomers: '500+',
            },
            confidence: mockPage ? 'high' as const : 'medium' as const,
          };
        }

        return {
          url: input.url,
          dataType: input.dataType,
          extracted: {
            message: `Mock ${input.dataType} data extracted from ${input.url}`,
          },
          confidence: 'low' as const,
        };
      },
    });
  }
}

export const mockUrlScrapeServer = new MockUrlScrapeMCPServer();
