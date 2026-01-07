import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Clock, User } from 'lucide-react';
import { blogPosts, getBlogPostBySlug, getAllBlogSlugs, getRelatedPosts, blogTags, getResourceBySlug } from '@pmkit/content';
import { formatDate, siteConfig } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    keywords: [post.primaryKeyword],
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      url: `${siteConfig.url}/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `${siteConfig.url}/blog/${post.slug}`,
    },
  };
}

// Unique content for each blog post to ensure SEO distinctiveness
const blogContentMap: Record<string, { intro: string; challenge: string; approach: string; example: string; metrics: string }> = {
  '2026-year-of-ai-agents-manus-meta': {
    intro: "2026 is the year AI stops being something you chat with and becomes something that does work for you. Not as a vibe. As a product category. As a default workflow layer. Meta's acquisition of Manus signals that the agent race has moved from lab-grade prototypes into distribution-grade productization.",
    challenge: "2025 had agents everywhere in marketing but not everywhere in outcomes. Reliability wasn't good enough for true delegation. Integration was still a tax you paid N times. Governance and permissioning were adoption killers. Most agents were still a destination, not embedded where work happens.",
    approach: "The shift from 'AI = chat' to 'AI = delegation' means the default mental model becomes: you describe intent, the system plans and executes, you supervise outcomes. Standards like MCP make tools interoperable so the same agent brain can plug into different contexts without rewriting the world each time.",
    example: "Meta's acquisition of Manus, reported around $2B and facing regulatory scrutiny, signals that distribution is now the battleground for agents. The buyers are no longer just buying models. They're buying agent operating systems. Agents are becoming the next interface layer, not just a feature.",
    metrics: "The agent boom won't be measured by demos but by boring adoption metrics: interoperability becoming table stakes, permissioning and audit trails becoming product features, agent UX shifting from chat to controls (previews, dry-runs, checklists, human-in-the-loop gates).",
  },
  'what-is-a-product-management-agent': {
    intro: 'Product management agents represent a fundamental shift from reactive to proactive PM work. Unlike simple chatbots or copilots, these agents execute complete workflows autonomously—gathering data from Jira, synthesizing Gong calls, clustering Zendesk tickets—while keeping humans in control of final decisions.',
    challenge: 'The average enterprise PM spends 60% of their time on information gathering rather than strategic thinking. With data scattered across 8-12 tools, synthesizing a complete picture requires hours of manual work that repeats daily.',
    approach: 'A product management agent connects to your existing tools via MCP (Model Context Protocol) and runs multi-step workflows. For example, generating a daily brief involves pulling Slack messages, cross-referencing Jira tickets, analyzing support trends, and producing a prioritized summary—all in under 2 minutes.',
    example: 'Consider a PM at a 200-person SaaS company. Before agents: 45 minutes each morning checking Slack, Jira, and Zendesk. After: a 5-minute review of a synthesized brief that surfaces the critical bug affecting enterprise customers before the first standup.',
    metrics: 'Teams using PM agents report 70% reduction in information gathering time, 2x faster response to customer escalations, and 40% improvement in stakeholder alignment on priorities.',
  },
  'draft-only-ai-agents': {
    intro: 'The draft-only pattern is the key to deploying AI agents in enterprise environments. By ensuring agents propose changes rather than execute them directly, teams get AI autonomy without the risk of unreviewed content reaching production systems.',
    challenge: 'Enterprise teams hesitate to adopt AI because of governance concerns. Who approved that Slack message? Can we trace that Jira epic back to customer evidence? Without clear controls, AI adoption stalls in security reviews.',
    approach: 'Draft-only agents create proposals—a Jira epic draft, a Confluence page preview, a Slack message draft—that humans review before execution. Every proposal includes sources, reasoning, and a diff of what will change.',
    example: 'An agent drafts a customer announcement about a new feature. The PM catches that the feature is enterprise-only, not available to all users as stated. They edit the draft and approve the corrected version. Without draft-only, that error would have reached customers.',
    metrics: 'Draft-only workflows catch 15% of AI outputs that need human refinement. Error prevention alone justifies the review step, while the audit trail satisfies SOC 2 and enterprise security requirements.',
  },
  'from-slack-to-prd': {
    intro: 'Slack threads contain valuable product signal—customer pain points, feature requests, technical constraints—but this signal is lost when conversations end. Turning Slack discussions into structured PRDs captures institutional knowledge before it disappears.',
    challenge: 'A 50-message Slack thread about a customer issue contains requirements, constraints, and context. Manually extracting this into a PRD takes 2-3 hours and risks missing critical details buried in the conversation.',
    approach: 'The Slack-to-PRD workflow analyzes thread content, identifies requirements and constraints, extracts stakeholder positions, and drafts a PRD with problem statement, user stories, and acceptance criteria—all linked back to the original messages.',
    example: 'A PM triggers the workflow on a thread about dashboard performance issues. The agent identifies 4 distinct user stories, 2 technical constraints mentioned by engineering, and 3 customer quotes. The draft PRD is ready for review in 3 minutes.',
    metrics: 'Teams report 80% reduction in PRD drafting time, with higher quality first drafts that include evidence engineering previously had to request.',
  },
  'voice-of-customer-at-scale': {
    intro: 'Voice of Customer at scale means synthesizing feedback from thousands of touchpoints—support tickets, sales calls, community posts, NPS responses—into actionable themes. AI clustering makes this possible without a dedicated research team.',
    challenge: 'A mid-market SaaS company receives 500+ support tickets, 50+ sales calls, and 200+ community posts monthly. Manually reading and categorizing this volume is impossible. Important patterns go unnoticed until they become crises.',
    approach: 'VoC clustering analyzes all feedback sources, extracts pain points and requests, groups similar items into themes, and ranks by frequency and customer impact. Each theme includes representative quotes and affected customer segments.',
    example: 'The weekly VoC report surfaces "search frustration" as the top theme with 47 mentions across channels. Drilling down reveals enterprise customers mention it 3x more than SMB. This segment-specific insight changes the prioritization discussion.',
    metrics: 'Automated VoC clustering identifies themes in hours vs. weeks manually. Teams report discovering 2-3 critical patterns per month that would have been missed without systematic analysis.',
  },
  'meeting-prep-packs-for-pms': {
    intro: 'Meeting prep packs transform how PMs prepare for customer conversations. Instead of scrambling to remember account context, PMs walk into every meeting with a comprehensive brief: recent calls, open tickets, expansion opportunities, and strategic talking points.',
    challenge: 'A PM with 4-5 customer meetings daily spends 30-45 minutes preparing for each. Multiply that across a team of 8 PMs, and you have 20+ hours weekly spent on meeting prep that could be automated.',
    approach: 'Meeting prep pulls data from Gong (recent calls and pain points), Zendesk (open tickets and resolution status), CRM (deal stage and contacts), and generates a structured brief with talking points tailored to the specific account.',
    example: 'Before a QBR with Globex Corp, the prep pack surfaces that they mentioned "dashboard performance" 8 times in recent calls, have 2 open P1 tickets, and are considering a 4x seat expansion if issues are resolved. The PM opens with solutions, not discovery.',
    metrics: 'Meeting prep time drops from 30 minutes to 5 minutes per meeting. Customer satisfaction scores improve as PMs demonstrate deeper account knowledge.',
  },
  'competitor-research': {
    intro: 'Systematic competitor research means tracking product changes, pricing updates, and messaging shifts across your competitive landscape. AI-powered monitoring ensures you never learn about competitor moves from your customers.',
    challenge: 'Competitors launch features, change pricing, and update messaging constantly. Manual monitoring is sporadic at best. Sales teams get surprised by competitive objections they should have anticipated.',
    approach: 'Competitor research jobs monitor product pages, press releases, social media, and industry sources. Changes are classified by type (feature, pricing, messaging) and significance, with strategic implications highlighted.',
    example: 'The weekly competitor report flags that Notion launched AI-powered search—directly addressing your top customer pain point. The report includes talking points for sales and a gap analysis for product. You respond proactively, not reactively.',
    metrics: 'Teams using automated competitor research report 50% fewer competitive surprises in sales calls and faster response times to market changes.',
  },
  'roadmap-alignment-memos': {
    intro: 'Roadmap alignment memos present options with evidence, trade-offs, and recommendations. They transform subjective prioritization debates into data-driven decisions that stakeholders can trust.',
    challenge: 'Roadmap discussions often devolve into opinion battles. Without structured options and evidence, decisions favor the loudest voice rather than the best data. Alignment takes weeks instead of days.',
    approach: 'Alignment memos present 2-3 options with quantified pros/cons, customer evidence, resource requirements, and a clear recommendation. Each option links to VoC themes, competitive context, and analytics data.',
    example: 'The Q1 priority decision: Enterprise SSO vs. AI Search. The memo shows SSO unblocks $450K in deals (3 accounts waiting), while Search addresses 52 VoC mentions. With evidence laid out, leadership decides in one meeting instead of three.',
    metrics: 'Decision time drops 60% when using structured alignment memos. Stakeholder confidence in priorities increases because they can trace decisions to evidence.',
  },
  'prd-automation-without-hallucination': {
    intro: 'PRD automation that doesn\'t hallucinate means grounding every requirement in evidence, explicitly calling out assumptions, and structuring open questions. The result is PRDs that engineering trusts.',
    challenge: 'AI-generated PRDs risk including fabricated details or requirements that sound plausible but aren\'t grounded in customer evidence. Engineering loses trust, and the time saved is lost to verification.',
    approach: 'Evidence-grounded PRD automation links every requirement to its source—the specific support ticket, Gong call timestamp, or community post. Assumptions are explicitly labeled. Open questions are structured for follow-up.',
    example: 'The PRD for search filters includes 15 customer quotes, 3 competitor comparisons, and specific success metrics. Engineering knows exactly why each requirement exists and can push back on assumptions with data.',
    metrics: 'PRD revision cycles drop 40% when requirements are evidence-grounded. Engineering confidence in specifications increases, reducing scope creep and rework.',
  },
  'agent-workflows-with-mcp': {
    intro: 'MCP (Model Context Protocol) provides a standardized way to connect AI agents to enterprise tools. Understanding MCP architecture is essential for building maintainable, secure agent workflows.',
    challenge: 'Custom integrations for each tool create maintenance nightmares. Without standardization, adding a new tool means writing bespoke code. Security reviews slow down because each integration is unique.',
    approach: 'MCP defines how agents discover tools, authenticate, and execute operations. Connectors follow a consistent pattern: read operations for data gathering, proposal operations for writes. All calls are logged for audit.',
    example: 'Adding Zendesk to your workflow means deploying the Zendesk MCP connector. The agent immediately gains access to get_tickets, search_tickets, and propose_ticket_update operations—no custom code required.',
    metrics: 'MCP-based architectures reduce integration time by 70%. Security reviews are faster because all connectors follow the same audited patterns.',
  },
  'gong-transcripts-to-product-insights': {
    intro: 'Gong call transcripts contain the unfiltered voice of the customer—pain points, feature requests, competitive mentions, success criteria. Systematic extraction turns this goldmine into actionable product intelligence.',
    challenge: '32 hours of customer calls per week contain valuable insights that product never hears. Sales summarizes selectively. Important patterns are lost. Product decisions are based on incomplete information.',
    approach: 'Gong analysis extracts pain points, feature requests, competitor mentions, and objections from transcripts. Each insight includes speaker, timestamp, and surrounding context for verification.',
    example: 'Analyzing 50 calls reveals that enterprise customers mention "audit logging" 3x more than SMB customers. This segment-specific insight shifts the compliance feature priority from Q3 to Q1.',
    metrics: 'Teams surface 40% more product insights when systematically analyzing call transcripts vs. relying on sales summaries.',
  },
  'customer-escalations-pipeline': {
    intro: 'A repeatable escalation-to-fix pipeline turns customer crises into structured specifications. When every escalation follows the same process, response time drops and fix quality improves.',
    challenge: 'Escalations arrive as urgent Slack messages with incomplete context. Engineering asks for reproduction steps. Customer success asks for impact scope. Hours are lost before anyone starts fixing.',
    approach: 'The escalation pipeline gathers ticket history, identifies affected customers, retrieves similar past issues, and drafts a fix specification with problem statement, reproduction steps, proposed solution, and success criteria.',
    example: 'A P1 escalation arrives at 3pm. By 3:10pm, engineering has a fix spec with reproduction steps, 3 similar past issues, and a proposed solution. The fix ships by 6pm instead of the next day.',
    metrics: 'Escalation-to-fix time drops 60% with structured specifications. Customer retention improves as critical issues are resolved faster.',
  },
  'product-ops-automation': {
    intro: 'Product ops automation standardizes the recurring work that consumes PM time—sprint reviews, stakeholder updates, release notes. Automation ensures consistency while freeing PMs for strategic work.',
    challenge: 'Every Friday, PMs spend 2-3 hours compiling sprint updates. Quality varies. Some weeks get detailed reports; others get rushed summaries. Stakeholders never know what to expect.',
    approach: 'Product ops jobs run on schedule: daily briefs at 8am, sprint reviews on Fridays, release notes on deploy. Each follows a consistent template while adapting to that period\'s specific content.',
    example: 'The Friday sprint review job pulls completed tickets, calculates velocity, summarizes blockers, and drafts the stakeholder email. The PM spends 10 minutes reviewing instead of 2 hours compiling.',
    metrics: 'Recurring report generation time drops 80%. Stakeholder satisfaction increases with consistent, comprehensive updates.',
  },
  'cross-team-dependencies': {
    intro: 'Cross-team dependencies are where sprints go to die. AI monitoring detects when dependencies drift—a blocked ticket, a slipped deadline—before they derail your sprint.',
    challenge: 'Your feature depends on Platform team\'s API. They\'re blocked by an external vendor. You find out at Wednesday standup that your Friday deadline is at risk. Too late to adjust.',
    approach: 'Dependency monitoring scans linked tickets across teams, tracks status changes, and surfaces risks in daily briefs. When a dependency moves to "Blocked," you know before standup.',
    example: 'Monday\'s brief flags that PLATFORM-123 (your dependency) moved to "Blocked" over the weekend. You reach out to Platform immediately, learn about the vendor issue, and re-plan before losing a day.',
    metrics: 'Teams catch dependency risks 2 days earlier on average. Sprint completion rates improve 15% with proactive dependency management.',
  },
  'jira-confluence-slack-operating-system': {
    intro: 'Jira, Confluence, and Slack form the operating system for most product teams. Configuring them as an integrated system—with AI automation bridging the gaps—multiplies their value.',
    challenge: 'Information lives in silos. Decisions made in Slack don\'t update Jira. Confluence pages reference outdated tickets. Context is lost at every tool boundary.',
    approach: 'AI workflows bridge the tools: Slack discussions become Jira epics, Jira completions update Confluence release notes, Confluence PRDs link to Jira stories. Each tool stays current because automation handles the sync.',
    example: 'A feature ships. The Jira epic closes, triggering a Confluence release notes update and a Slack announcement draft. The PM reviews and approves. Three tools updated from one event.',
    metrics: 'Cross-tool sync time drops 90%. Information freshness improves as automation handles updates humans would forget.',
  },
  'ai-for-search-products': {
    intro: 'Search analytics reveal what users want but can\'t find. No-results queries, low-CTR searches, and trending terms are product signals hiding in plain sight.',
    challenge: 'Users search for "API documentation" 200 times per week with zero results. Without analyzing search data, this content gap goes unnoticed until users complain or churn.',
    approach: 'Search analytics jobs surface no-results queries, low-CTR searches, and trending terms. Each is cross-referenced with support tickets and feature requests to validate the signal.',
    example: 'The weekly search report shows "bulk export" queries spiking 300%. Cross-referencing with support reveals 5 tickets asking about the same feature. A content gap becomes a feature opportunity.',
    metrics: 'Teams using search analytics reduce no-results queries by 40% within 3 months by addressing discovered content gaps.',
  },
  'agentic-roadmaps': {
    intro: 'Agentic roadmaps update themselves with customer evidence, competitive changes, and analytics signals. Instead of static documents that age, you get living strategy that reflects current reality.',
    challenge: 'Roadmaps are outdated the moment they\'re published. Customer priorities shift. Competitors launch features. By quarterly review, the roadmap no longer reflects what matters.',
    approach: 'Agentic roadmaps incorporate weekly VoC themes, competitor changes, and analytics trends. Priority scores adjust based on evidence. The roadmap reflects current customer reality, not last quarter\'s assumptions.',
    example: 'A competitor launches AI search. The roadmap automatically surfaces this as a competitive gap, adjusts the priority score for your search improvements, and flags the change for PM review.',
    metrics: 'Roadmap relevance improves 50% when priorities update with evidence. Stakeholder trust increases because the roadmap reflects current data.',
  },
  'enterprise-pm-toolkit': {
    intro: 'The enterprise PM toolkit includes the essential artifacts: daily briefs, VoC themes, PRDs, and sprint review packs. AI automation ensures these artifacts exist consistently across the team.',
    challenge: 'PM artifact quality varies by person and week. Some PMs write detailed PRDs; others ship bullet points. Sprint reviews range from comprehensive to "we shipped stuff." Inconsistency undermines team credibility.',
    approach: 'The toolkit standardizes artifact templates while AI handles the data gathering. Every PRD includes customer evidence. Every sprint review includes velocity metrics. Quality becomes consistent.',
    example: 'A new PM joins the team. Instead of learning 7 different document formats, they use the standard toolkit. Their first PRD matches the quality of a 5-year veteran because the template enforces completeness.',
    metrics: 'Artifact quality consistency improves 70%. Onboarding time for new PMs drops as they inherit proven templates.',
  },
  'why-ai-pm-copilot-is-not-enough': {
    intro: 'AI copilots help with single tasks—drafting a paragraph, suggesting a response. But PM work requires multi-step workflows that span tools and synthesize data. Copilots can\'t do that.',
    challenge: 'You ask a copilot to "summarize customer feedback." It can only see what you paste into the chat. The real feedback lives in Zendesk, Gong, and Discourse. Copy-pasting defeats the purpose.',
    approach: 'Multi-step agents connect directly to your tools, execute workflows that span sources, and produce complete artifacts. The agent pulls data you\'d never think to include because it has access to everything.',
    example: 'A copilot can draft a PRD from context you provide. An agent pulls 47 support tickets, 12 Gong mentions, and 89 community votes—then drafts a PRD with evidence you didn\'t know existed.',
    metrics: 'Multi-step agents surface 3x more relevant evidence than copilot-assisted manual research. PRD quality improves because nothing is missed.',
  },
};

// Generate blog post content with unique examples per post
function generateBlogContent(post: typeof blogPosts[0]): string {
  const uniqueContent = blogContentMap[post.slug];
  
  // Use unique content if available, otherwise use generic content
  const intro = uniqueContent?.intro || `Product management is evolving rapidly, and ${post.primaryKeyword} represents one of the most significant shifts in how PMs work.`;
  const challenge = uniqueContent?.challenge || 'Modern product managers face an unprecedented volume of information scattered across multiple tools.';
  const approach = uniqueContent?.approach || `${post.primaryKeyword} offers a different path forward through automation and synthesis.`;
  const example = uniqueContent?.example || 'Teams implementing this approach report significant time savings and improved decision quality.';
  const metrics = uniqueContent?.metrics || 'Early adopters report 50-70% reduction in manual work and faster decision cycles.';
  
  const baseContent = `
${intro}

## The Challenge

${challenge}

When information lives in silos—Slack, Jira, Gong, Zendesk, community forums—synthesizing a complete picture requires hours of manual work. Important signals get missed. Patterns go unnoticed. And PMs spend more time gathering information than acting on it.

## The Approach

${approach}

This isn't about replacing PM judgment; it's about giving PMs the synthesized information they need to make better decisions faster.

### Key Principles

**Draft-Only by Design**: AI agents should never write directly to external systems. Every proposed change—whether it's a Jira epic, a Confluence page, or a Slack message—should be a draft that humans review and approve.

**Full Traceability**: Every insight cites its source. When an AI agent identifies a pattern, you can see exactly which support tickets, calls, or community posts contributed.

**Multi-Step Workflows**: Complete workflows span multiple tools and data sources, producing richer outputs than single-prompt interactions.

## Real-World Example

${example}

## Measuring Success

${metrics}

Key metrics to track:
- **Time saved** on information gathering
- **Insight quality** based on stakeholder feedback
- **Decision velocity** for roadmap changes
- **Traceability usage** (are people clicking through to sources?)

## Getting Started

If you're new to ${post.primaryKeyword}, start with a single use case:

1. **Daily briefs** are often the best starting point—they're low-risk and provide immediate value
2. **Meeting prep** is another good choice if you have frequent customer meetings
3. **VoC clustering** is valuable for teams drowning in customer feedback

Don't try to automate everything at once. Build confidence with one workflow before expanding.

## Try It Yourself

Ready to experience ${post.primaryKeyword} firsthand? The pmkit demo lets you run all seven workflow jobs with a complete demo enterprise dataset:

- **Daily Brief**: See how overnight activity is synthesized
- **Meeting Prep**: Generate a prep pack for a demo customer meeting
- **VoC Clustering**: Watch themes emerge from support and call data
- **Competitor Research**: Track demo competitor product changes
- **Roadmap Alignment**: Generate an alignment memo with options
- **PRD Draft**: Create a PRD grounded in customer evidence
- **Sprint Review**: Generate sprint summaries and release notes

Each job shows the full tool call timeline, sources, and downloadable artifacts.

## Conclusion

${post.primaryKeyword} represents a significant opportunity for product teams to work more effectively. By automating information synthesis while keeping humans in control, teams can make better decisions with more complete information, move faster without sacrificing quality, and focus on strategy instead of data gathering.

The key is to start small, measure results, and expand thoughtfully.
`;

  return baseContent;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const content = generateBlogContent(post);
  const relatedPosts = getRelatedPosts(post.slug, 3);
  
  // Get related resources
  const relatedResources = post.relatedResources
    .map((s) => getResourceBySlug(s))
    .filter((r) => r !== undefined)
    .slice(0, 3);

  return (
    <>
      {/* JSON-LD for BlogPosting */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.description,
            datePublished: post.publishedAt,
            dateModified: post.publishedAt,
            author: {
              '@type': 'Organization',
              name: post.author,
            },
            publisher: {
              '@type': 'Organization',
              name: 'pmkit',
              logo: {
                '@type': 'ImageObject',
                url: `${siteConfig.url}/logo.png`,
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${siteConfig.url}/blog/${post.slug}`,
            },
          }),
        }}
      />

      {/* Breadcrumb */}
      <section className="border-b bg-muted/30 py-4">
        <div className="container">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/blog" className="hover:text-foreground">
              Blog
            </Link>
            <span>/</span>
            <span className="text-foreground line-clamp-1">{post.title}</span>
          </div>
        </div>
      </section>

      {/* Article Header */}
      <article>
        <header className="py-12 md:py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => {
                  const tagLabel = blogTags.find((t) => t.value === tag)?.label || tag;
                  return (
                    <Link key={tag} href={`/blog?tag=${tag}`}>
                      <Badge variant="cobalt">{tagLabel}</Badge>
                    </Link>
                  );
                })}
              </div>

              {/* Title */}
              <h1 className="mt-6 font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                {post.title}
              </h1>

              {/* Description */}
              <p className="mt-6 text-lg text-muted-foreground">{post.description}</p>

              {/* Meta */}
              <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.readingTime} min read</span>
                </div>
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="pb-16">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <div className="prose prose-lg" dangerouslySetInnerHTML={{ 
                __html: content
                  .split('\n\n')
                  .map(p => {
                    if (p.startsWith('## ')) return `<h2>${p.slice(3)}</h2>`;
                    if (p.startsWith('### ')) return `<h3>${p.slice(4)}</h3>`;
                    if (p.startsWith('- ')) return `<ul>${p.split('\n').map(li => `<li>${li.slice(2)}</li>`).join('')}</ul>`;
                    if (p.startsWith('1. ')) return `<ol>${p.split('\n').map(li => `<li>${li.slice(3)}</li>`).join('')}</ol>`;
                    if (p.trim()) return `<p>${p}</p>`;
                    return '';
                  })
                  .join('')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              }} />

              {/* CTA */}
              <div className="mt-12 rounded-lg bg-cobalt-50 p-8">
                <h3 className="font-heading text-xl font-bold">Try it in the pmkit demo</h3>
                <p className="mt-2 text-muted-foreground">
                  Experience {post.primaryKeyword} with a complete demo enterprise dataset.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/demo">
                    Try the Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Related Resources */}
              {relatedResources.length > 0 && (
                <div className="mt-16">
                  <h2 className="font-heading text-2xl font-bold">Related Resources</h2>
                  <div className="mt-6 grid gap-4">
                    {relatedResources.map((resource) => (
                      <Link key={resource.slug} href={`/resources/${resource.slug}`}>
                        <Card className="transition-shadow hover:shadow-md">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {resource.description}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="mt-16">
                  <h2 className="font-heading text-2xl font-bold">Related Posts</h2>
                  <div className="mt-6 grid gap-4">
                    {relatedPosts.map((related) => (
                      <Link key={related.slug} href={`/blog/${related.slug}`}>
                        <Card className="transition-shadow hover:shadow-md">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <time dateTime={related.publishedAt}>
                                {formatDate(related.publishedAt)}
                              </time>
                              <span>·</span>
                              <span>{related.readingTime} min read</span>
                            </div>
                            <CardTitle className="text-lg">{related.title}</CardTitle>
                          </CardHeader>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Back link */}
              <div className="mt-12">
                <Link
                  href="/blog"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}

