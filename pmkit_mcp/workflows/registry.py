"""Workflow registry containing all 13 PM Kit workflow definitions.

Each workflow includes:
- id: unique identifier used as the MCP tool name
- name: human-readable name
- description: short description for tool listing
- system_prompt: LLM system prompt
- user_prompt_template: template with {{placeholders}}
- required_fields: fields that must be provided
- optional_fields: fields that enhance output if provided
- output_format: expected output format (markdown, html, etc.)
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class FieldSpec:
    """Specification for a workflow input field."""

    name: str
    description: str
    example: str = ""


@dataclass(frozen=True)
class WorkflowDefinition:
    """Complete definition of a PM Kit workflow."""

    id: str
    name: str
    description: str
    system_prompt: str
    user_prompt_template: str
    required_fields: tuple[FieldSpec, ...] = ()
    optional_fields: tuple[FieldSpec, ...] = ()
    output_format: str = "markdown"
    category: str = "on-demand"


# ---------------------------------------------------------------------------
# 1. Daily Brief
# ---------------------------------------------------------------------------
DAILY_BRIEF = WorkflowDefinition(
    id="daily_brief",
    name="Daily Brief",
    description="Generate a morning brief synthesizing overnight activity from multiple sources.",
    category="autonomous",
    system_prompt=(
        "You are a product management assistant helping PMs stay on top of their product. "
        "Your job is to synthesize information from multiple sources into a concise, actionable daily brief.\n\n"
        "Guidelines:\n"
        "- Be concise but comprehensive\n"
        "- Highlight blockers and urgent items first\n"
        "- Include specific numbers and quotes where relevant\n"
        "- End with recommended actions\n"
        "- Use markdown formatting"
    ),
    user_prompt_template=(
        "Generate a daily brief for {{user_name}} at {{tenant_name}} for {{current_date}}.\n\n"
        "## Context\n\n"
        "### Slack Activity\n{{slack_messages}}\n\n"
        "### Jira Updates\n{{jira_updates}}\n\n"
        "### Support Tickets\n{{support_tickets}}\n\n"
        "### Community Activity\n{{community_activity}}\n\n"
        "## Output Format\n\n"
        "Create a brief with these sections:\n"
        "1. **TL;DR** - 2-3 sentence summary\n"
        "2. **Urgent Items** - Blockers, escalations, critical bugs\n"
        "3. **Sprint Progress** - Current sprint status and notable updates\n"
        "4. **Customer Signal** - Key feedback from support and community\n"
        "5. **Recommended Actions** - Top 3 things to focus on today"
    ),
    required_fields=(
        FieldSpec("user_name", "Your name", "Jane PM"),
        FieldSpec("tenant_name", "Your company name", "Acme Corp"),
        FieldSpec("current_date", "Date for the brief", "2026-01-13"),
    ),
    optional_fields=(
        FieldSpec("slack_messages", "Recent Slack channel activity", "Paste Slack messages here"),
        FieldSpec("jira_updates", "Jira ticket updates and sprint progress", "ACME-342: In Progress"),
        FieldSpec("support_tickets", "Open and recent support tickets", "Ticket #1234: Dashboard slow"),
        FieldSpec("community_activity", "Community posts and feature requests", "Feature request: dark mode"),
    ),
)

# ---------------------------------------------------------------------------
# 2. Meeting Prep
# ---------------------------------------------------------------------------
MEETING_PREP = WorkflowDefinition(
    id="meeting_prep",
    name="Meeting Prep Pack",
    description="Prepare for customer meetings with context, talking points, and risk assessment.",
    category="autonomous",
    system_prompt=(
        "You are a product management assistant helping PMs prepare for customer meetings.\n"
        "Your job is to compile relevant context and suggest talking points.\n\n"
        "Guidelines:\n"
        "- Focus on the specific customer/account\n"
        "- Include recent interactions and open issues\n"
        "- Suggest questions to ask\n"
        "- Highlight opportunities and risks\n"
        "- Be actionable and specific"
    ),
    user_prompt_template=(
        "Generate a meeting prep pack for {{user_name}} at {{tenant_name}}.\n\n"
        "## Meeting Details\n"
        "- Account: {{account_name}}\n"
        "- Meeting Type: {{meeting_type}}\n"
        "- Attendees: {{attendees}}\n"
        "- Date: {{meeting_date}}\n\n"
        "## Context\n\n"
        "### Recent Calls (Gong)\n{{gong_calls}}\n\n"
        "### Open Support Tickets\n{{support_tickets}}\n\n"
        "### Account Health\n{{account_health}}\n\n"
        "## Output Format\n\n"
        "Create a prep pack with:\n"
        "1. **Account Summary** - Key facts, contract details, health score\n"
        "2. **Recent History** - Last 3 interactions and outcomes\n"
        "3. **Open Issues** - Unresolved tickets or concerns\n"
        "4. **Key Insights** - Pain points, feature requests, sentiment from calls\n"
        "5. **Talking Points** - Suggested topics and questions\n"
        "6. **Risks & Opportunities** - What to watch for"
    ),
    required_fields=(
        FieldSpec("user_name", "Your name", "Jane PM"),
        FieldSpec("tenant_name", "Your company name", "Acme Corp"),
        FieldSpec("account_name", "Customer/account name", "Globex Corp"),
        FieldSpec("meeting_type", "Type of meeting", "QBR"),
        FieldSpec("meeting_date", "Meeting date", "2026-01-20"),
    ),
    optional_fields=(
        FieldSpec("attendees", "List of attendees", "John (CTO), Sarah (VP Product)"),
        FieldSpec("gong_calls", "Recent call transcripts or summaries", "Dec 20 QBR: discussed search"),
        FieldSpec("support_tickets", "Open support tickets for this account", "Ticket #456: SSO request"),
        FieldSpec("account_health", "Health score, NPS, contract details", "Health: 72/100, NPS: 7"),
    ),
)

# ---------------------------------------------------------------------------
# 3. VoC Clustering
# ---------------------------------------------------------------------------
VOC_CLUSTERING = WorkflowDefinition(
    id="voc_clustering",
    name="Voice of Customer (VoC) Clustering",
    description="Cluster customer feedback into actionable themes with impact assessment.",
    system_prompt=(
        "You are a product management assistant specializing in voice of customer analysis.\n"
        "Your job is to identify patterns in customer feedback and cluster them into actionable themes.\n\n"
        "Guidelines:\n"
        "- Group similar feedback together\n"
        "- Quantify each theme (# of mentions, sources)\n"
        "- Include representative quotes\n"
        "- Assess impact and urgency\n"
        "- Connect to product implications"
    ),
    user_prompt_template=(
        "Analyze customer feedback for {{tenant_name}} and identify key themes.\n\n"
        "## Feedback Sources\n\n"
        "### Support Tickets\n{{support_tickets}}\n\n"
        "### Gong Call Insights\n{{gong_insights}}\n\n"
        "### Community Posts & Feature Requests\n{{community_feedback}}\n\n"
        "### NPS Verbatims\n{{nps_verbatims}}\n\n"
        "## Output Format\n\n"
        "Create a VoC report with:\n"
        "1. **Executive Summary** - Top 3-5 themes with impact assessment\n"
        "2. **Theme Analysis** - For each theme: name, description, mentions, quotes, segments, implications\n"
        "3. **Trend Analysis** - What's changing vs. last period\n"
        "4. **Recommendations** - Prioritized actions based on themes"
    ),
    required_fields=(
        FieldSpec("tenant_name", "Your company name", "Acme Corp"),
    ),
    optional_fields=(
        FieldSpec("support_tickets", "Support ticket data", "47 tickets about search issues"),
        FieldSpec("gong_insights", "Call transcript insights", "12 calls mentioning search frustration"),
        FieldSpec("community_feedback", "Community posts and feature requests", "89-vote request for filters"),
        FieldSpec("nps_verbatims", "NPS survey responses", "NPS 7: 'Search never finds what I need'"),
    ),
)

# ---------------------------------------------------------------------------
# 4. Competitor Research
# ---------------------------------------------------------------------------
COMPETITOR_RESEARCH = WorkflowDefinition(
    id="competitor_research",
    name="Competitor Research Report",
    description="Track competitor product changes, feature gaps, and strategic implications.",
    system_prompt=(
        "You are a product research analyst helping PMs track competitor product developments.\n"
        "Your job is to synthesize competitor product updates into strategic insights.\n\n"
        "Guidelines:\n"
        "- Focus on actionable product changes (not noise)\n"
        "- Assess strategic implications for your product\n"
        "- Compare to your capabilities\n"
        "- Suggest responses where appropriate\n"
        "- Be objective and fact-based"
    ),
    user_prompt_template=(
        "Generate a competitor research report for {{tenant_name}}.\n\n"
        "## Time Period\nFrom: {{from_date}}\nTo: {{to_date}}\n\n"
        "## Competitor Updates\n{{competitor_changes}}\n\n"
        "## Feature Comparison\n{{feature_comparison}}\n\n"
        "## Output Format\n\n"
        "Create an intel report with:\n"
        "1. **Key Changes Summary** - Most significant updates\n"
        "2. **By Competitor** - Detailed changes per competitor\n"
        "3. **Feature Gap Analysis** - Where we lead/lag\n"
        "4. **Strategic Implications** - What this means for our roadmap\n"
        "5. **Recommended Actions** - Suggested responses"
    ),
    required_fields=(
        FieldSpec("tenant_name", "Your company name", "Acme Corp"),
        FieldSpec("from_date", "Start date for analysis", "2026-01-01"),
        FieldSpec("to_date", "End date for analysis", "2026-01-14"),
    ),
    optional_fields=(
        FieldSpec("competitor_changes", "Recent competitor product updates", "Notion launched AI search"),
        FieldSpec("feature_comparison", "Feature comparison data", "SSO: Us ❌, Notion ✅, Coda ✅"),
    ),
)

# ---------------------------------------------------------------------------
# 5. Roadmap Alignment
# ---------------------------------------------------------------------------
ROADMAP_ALIGNMENT = WorkflowDefinition(
    id="roadmap_alignment",
    name="Roadmap Alignment Memo",
    description="Create a decision memo with options, trade-offs, and recommendations for roadmap prioritization.",
    system_prompt=(
        "You are a strategic product advisor helping PMs make roadmap decisions.\n"
        "Your job is to synthesize context and present options with clear trade-offs.\n\n"
        "Guidelines:\n"
        "- Present 2-3 clear options\n"
        "- Be explicit about trade-offs\n"
        "- Include evidence for each option\n"
        "- Make a recommendation with reasoning\n"
        "- Format for executive review"
    ),
    user_prompt_template=(
        "Generate a roadmap alignment memo for {{tenant_name}}.\n\n"
        "## Decision Context\n{{decision_context}}\n\n"
        "## Evidence\n\n"
        "### Customer Demand (VoC)\n{{voc_themes}}\n\n"
        "### Analytics Insights\n{{analytics_insights}}\n\n"
        "### Competitive Landscape\n{{competitor_context}}\n\n"
        "### Resource Constraints\n{{resource_constraints}}\n\n"
        "## Output Format\n\n"
        "Create an alignment memo with:\n"
        "1. **Decision Required** - Clear statement of what needs to be decided\n"
        "2. **Context** - Background and why this matters now\n"
        "3. **Options** (2-3 options, each with pros, cons, evidence, resources, timeline)\n"
        "4. **Recommendation** - Which option and why\n"
        "5. **Open Questions** - What we still need to learn\n"
        "6. **Next Steps** - If approved, what happens next"
    ),
    required_fields=(
        FieldSpec("tenant_name", "Your company name", "Acme Corp"),
        FieldSpec("decision_context", "What decision needs to be made", "Q1 priority: AI Search vs SSO"),
    ),
    optional_fields=(
        FieldSpec("voc_themes", "Customer demand data", "52 mentions for search, 95 votes for SSO"),
        FieldSpec("analytics_insights", "Relevant analytics data", "Search-to-click time: 45s avg"),
        FieldSpec("competitor_context", "Competitive landscape info", "Notion launched AI search"),
        FieldSpec("resource_constraints", "Team capacity and constraints", "3 pods, 12 engineers"),
    ),
)

# ---------------------------------------------------------------------------
# 6. PRD Draft
# ---------------------------------------------------------------------------
PRD_DRAFT = WorkflowDefinition(
    id="prd_draft",
    name="PRD Draft",
    description="Draft a comprehensive PRD from customer evidence, analytics, and technical context.",
    system_prompt=(
        "You are a product management assistant helping PMs write PRDs.\n"
        "Your job is to draft a comprehensive PRD based on evidence and context.\n\n"
        "Guidelines:\n"
        "- Ground everything in evidence\n"
        "- Be specific about success criteria\n"
        "- Call out assumptions explicitly\n"
        "- Include open questions\n"
        "- Follow standard PRD structure"
    ),
    user_prompt_template=(
        "Draft a PRD for {{tenant_name}}.\n\n"
        "## Feature Context\nFeature Name: {{feature_name}}\nEpic: {{epic_key}}\n\n"
        "## Evidence\n\n"
        "### Customer Demand\n{{customer_evidence}}\n\n"
        "### Analytics Signals\n{{analytics_signals}}\n\n"
        "### Existing Documentation\n{{existing_docs}}\n\n"
        "### Technical Context\n{{technical_context}}\n\n"
        "## Output Format\n\n"
        "Create a PRD with:\n"
        "1. **Overview** - Problem statement, goals and success metrics, non-goals\n"
        "2. **Background** - Customer evidence, market context, related work\n"
        "3. **Solution** - Proposed approach, user stories, key flows\n"
        "4. **Requirements** - Functional, non-functional, edge cases\n"
        "5. **Success Criteria** - Launch criteria, success metrics, rollback criteria\n"
        "6. **Assumptions & Risks** - Key assumptions, risks and mitigations\n"
        "7. **Open Questions** - Unresolved items, dependencies\n"
        "8. **Timeline** - Phases, milestones"
    ),
    required_fields=(
        FieldSpec("tenant_name", "Your company name", "Acme Corp"),
        FieldSpec("feature_name", "Name of the feature", "Search Filters"),
        FieldSpec("customer_evidence", "Customer demand data", "47 support tickets about search"),
    ),
    optional_fields=(
        FieldSpec("epic_key", "Jira epic key", "ACME-100"),
        FieldSpec("analytics_signals", "Relevant analytics data", "Search-to-click: 45s avg"),
        FieldSpec("existing_docs", "Related documentation", "Search architecture doc"),
        FieldSpec("technical_context", "Technical constraints or context", "PostgreSQL full-text search"),
    ),
)

# ---------------------------------------------------------------------------
# 7. Sprint Review
# ---------------------------------------------------------------------------
SPRINT_REVIEW = WorkflowDefinition(
    id="sprint_review",
    name="Sprint Review Pack",
    description="Generate a sprint review summary with accomplishments, metrics, demos, and next sprint preview.",
    category="autonomous",
    system_prompt=(
        "You are a product management assistant helping PMs prepare sprint review presentations.\n"
        "Your job is to synthesize sprint data into a clear, stakeholder-friendly summary.\n\n"
        "Guidelines:\n"
        "- Focus on outcomes and value delivered, not just tasks completed\n"
        "- Highlight metrics and measurable progress\n"
        "- Include demo-ready features with key talking points\n"
        "- Note blockers and learnings for transparency\n"
        "- Keep it concise but comprehensive"
    ),
    user_prompt_template=(
        "Generate a sprint review pack for {{tenant_name}}.\n\n"
        "## Sprint Details\nSprint: {{sprint_name}}\n"
        "Period: {{sprint_start}} to {{sprint_end}}\nTeam: {{team_name}}\n\n"
        "## Sprint Data\n\n"
        "### Completed Stories\n{{completed_stories}}\n\n"
        "### Sprint Metrics\n{{sprint_metrics}}\n\n"
        "### Blockers & Issues\n{{blockers}}\n\n"
        "### Customer Feedback\n{{customer_feedback}}\n\n"
        "## Output Format\n\n"
        "Create a sprint review pack with:\n"
        "1. **Sprint Summary** - 2-3 sentence overview\n"
        "2. **Key Accomplishments** - Top 3-5 deliverables with business impact\n"
        "3. **Metrics Dashboard** - Velocity, bug count, work distribution\n"
        "4. **Demo Highlights** - Features ready to demo with talking points\n"
        "5. **Blockers & Learnings** - What slowed us down\n"
        "6. **Customer Impact** - Feedback received\n"
        "7. **Next Sprint Preview** - What's coming up"
    ),
    required_fields=(
        FieldSpec("tenant_name", "Your company name", "Acme Corp"),
        FieldSpec("sprint_name", "Sprint name/number", "Sprint 42"),
        FieldSpec("sprint_start", "Sprint start date", "2026-01-06"),
        FieldSpec("sprint_end", "Sprint end date", "2026-01-17"),
    ),
    optional_fields=(
        FieldSpec("team_name", "Team name", "Product Team"),
        FieldSpec("completed_stories", "List of completed stories", "ACME-342: Search filters (5 pts)"),
        FieldSpec("sprint_metrics", "Velocity, bug counts, etc.", "19 committed, 16 completed"),
        FieldSpec("blockers", "Blockers and issues encountered", "Redis connection pool issue"),
        FieldSpec("customer_feedback", "Relevant customer feedback", "Globex: 'filters are game-changing'"),
    ),
)

# ---------------------------------------------------------------------------
# 8. Prototype Generation
# ---------------------------------------------------------------------------
PROTOTYPE_GENERATION = WorkflowDefinition(
    id="prototype_generation",
    name="Prototype Generation",
    description="Generate a standalone interactive HTML prototype from a PRD or feature description.",
    output_format="html",
    system_prompt=(
        "You are a UI/UX engineer who creates interactive HTML prototypes from PRDs.\n\n"
        "CRITICAL: Output ONLY a complete, standalone HTML file. No markdown, no explanations, no code fences.\n\n"
        "Guidelines:\n"
        "- Create a single HTML file with embedded CSS and JavaScript\n"
        "- Use modern CSS (flexbox, grid, CSS variables) for styling\n"
        "- Include interactive elements (dropdowns, buttons, filters) using vanilla JavaScript\n"
        "- Use a clean, professional design with good typography\n"
        "- Include realistic placeholder data\n"
        "- Make all UI elements functional and interactive\n"
        "- The HTML must be self-contained and work when opened directly in a browser\n\n"
        "Design style:\n"
        "- Use a modern color palette (indigo/blue primary, gray neutrals)\n"
        "- Clean sans-serif fonts (system fonts)\n"
        "- Subtle shadows and rounded corners\n"
        "- Responsive layout"
    ),
    user_prompt_template=(
        "Generate an interactive HTML prototype based on this PRD:\n\n"
        "## PRD Content\n{{prd_content}}\n\n"
        "## Design Guidelines\n{{design_system}}\n\n"
        "## Focus Areas\n{{focus_areas}}\n\n"
        "Create a complete, standalone HTML file that demonstrates the core user experience. "
        "Output ONLY the HTML file content."
    ),
    required_fields=(
        FieldSpec("prd_content", "The PRD content to prototype", "Search filters PRD: ..."),
    ),
    optional_fields=(
        FieldSpec("design_system", "Design system description", "Indigo primary, gray neutrals"),
        FieldSpec("focus_areas", "Which parts to focus on", "Search results page with filters"),
    ),
)

# ---------------------------------------------------------------------------
# 9. Release Notes
# ---------------------------------------------------------------------------
RELEASE_NOTES = WorkflowDefinition(
    id="release_notes",
    name="Release Notes",
    description="Generate customer-facing release notes from completed work.",
    system_prompt=(
        "You are a product marketing writer who creates customer-facing release notes.\n\n"
        "Your job is to translate technical work into clear, benefit-focused release notes.\n\n"
        "Guidelines:\n"
        "- Write for customers, not engineers - focus on benefits\n"
        "- Use clear, jargon-free language\n"
        "- Categorize changes: New Features, Improvements, Bug Fixes\n"
        "- Lead with the most impactful changes\n"
        "- Include brief benefit descriptions\n"
        "- Highlight breaking changes prominently\n"
        "- Keep descriptions concise but informative\n"
        "- Use active voice and present tense"
    ),
    user_prompt_template=(
        "Generate customer-facing release notes for {{product_name}} release {{release_version}}.\n\n"
        "## Release Information\n"
        "- Version: {{release_version}}\n"
        "- Release Date: {{release_date}}\n"
        "- Product: {{product_name}}\n\n"
        "## Completed Work (from Jira)\n{{completed_issues}}\n\n"
        "## Epic Summaries\n{{epic_summaries}}\n\n"
        "## Related PRDs\n{{related_prds}}\n\n"
        "## Previous Release Notes Format\n{{release_notes_template}}\n\n"
        "Create release notes with:\n"
        "1. **Highlights** - Top 2-3 most impactful changes\n"
        "2. **New Features** - New capabilities added\n"
        "3. **Improvements** - Enhancements to existing features\n"
        "4. **Bug Fixes** - Issues resolved\n"
        "5. **Breaking Changes** - Changes requiring customer action\n"
        "6. **Coming Soon** - Brief preview of what's next"
    ),
    required_fields=(
        FieldSpec("product_name", "Your product name", "Acme Platform"),
        FieldSpec("release_version", "Version number", "v2.4.0"),
        FieldSpec("completed_issues", "Completed Jira issues", "ACME-342: Search Filters"),
    ),
    optional_fields=(
        FieldSpec("release_date", "Release date", "January 13, 2026"),
        FieldSpec("epic_summaries", "Epic summaries", "Search Improvements epic: 3 stories completed"),
        FieldSpec("related_prds", "Related PRD excerpts", "Search Filters PRD excerpt"),
        FieldSpec("release_notes_template", "Previous release notes for format reference", ""),
    ),
)

# ---------------------------------------------------------------------------
# 10. Deck Content
# ---------------------------------------------------------------------------
DECK_CONTENT = WorkflowDefinition(
    id="deck_content",
    name="Deck Content",
    description="Generate structured slide content tailored for customer, team, exec, or stakeholder audiences.",
    system_prompt=(
        "You are a presentation content expert helping PMs create compelling slide content.\n\n"
        "Your job is to generate structured slide content that can be copy-pasted into any template. "
        "PMs work with company-mandated templates, so you provide TEXT CONTENT only.\n\n"
        "For each slide, provide:\n"
        "- **[SLIDE N: Type]** - Slide number and purpose\n"
        "- **Headline**: One compelling sentence (max 10 words)\n"
        "- **Bullets**: Max 3 points, 5-7 words each\n"
        "- **Key Metric**: One number that matters\n"
        "- **Visual Suggestion**: What chart/image would help\n"
        "- **Speaker Notes**: What to say, what to avoid, likely questions\n\n"
        "Audience-specific guidelines:\n"
        "- Customer: Value and outcomes, ROI, success stories, minimal technical details\n"
        "- Team: Technical details, sprint metrics, blockers, action items\n"
        "- Executive: Business impact, 5-7 slides max, clear asks, no jargon\n"
        "- Stakeholder: Cross-functional dependencies, timeline, risks\n\n"
        "General: One message per slide. 1-3-5 rule. Narrative arc: context -> problem -> solution -> impact -> next steps."
    ),
    user_prompt_template=(
        "Generate slide content for {{tenant_name}}.\n\n"
        "## Presentation Details\n"
        "- Topic: {{topic}}\n"
        "- Audience: {{audience_type}}\n"
        "- Purpose: {{purpose}}\n"
        "- Duration: {{duration}} minutes (approximate)\n\n"
        "## Source Data\n\n"
        "### Key Data Points\n{{key_data_points}}\n\n"
        "### Supporting Evidence\n{{supporting_evidence}}\n\n"
        "### Related Artifacts\n{{related_artifacts}}\n\n"
        "## Specific Requirements\n{{requirements}}\n\n"
        "Generate structured slide content with title, agenda, context, main content, impact, "
        "next steps, and appendix suggestions. Tailor to the {{audience_type}} audience."
    ),
    required_fields=(
        FieldSpec("tenant_name", "Your company name", "Acme Corp"),
        FieldSpec("topic", "Presentation topic", "Q4 Product Update"),
        FieldSpec("audience_type", "Audience: customer, team, exec, or stakeholder", "exec"),
    ),
    optional_fields=(
        FieldSpec("purpose", "Goal of the presentation", "Secure Q2 AI search funding"),
        FieldSpec("duration", "Approximate length in minutes", "30"),
        FieldSpec("key_data_points", "Key metrics and data", "Search NPS: 3.2 -> 4.1"),
        FieldSpec("supporting_evidence", "Supporting evidence", "VoC report, competitor analysis"),
        FieldSpec("related_artifacts", "Related docs, PRDs, etc.", "Q1 roadmap, search PRD"),
        FieldSpec("requirements", "Specific requirements", "Include customer quotes"),
    ),
)

# ---------------------------------------------------------------------------
# 11. Feature Ideation (Beta)
# ---------------------------------------------------------------------------
FEATURE_IDEATION = WorkflowDefinition(
    id="feature_ideation",
    name="Feature Ideation & Planning",
    description="Transform raw ideas, feedback, and problems into structured feature concepts with action plans.",
    category="beta",
    system_prompt=(
        "You are a product strategist helping PMs transform raw ideas and customer signals "
        "into well-structured feature concepts.\n\n"
        "Your job is to take unstructured inputs (Slack discussions, feature ideas, customer problems) "
        "and synthesize them into a clear feature concept with actionable next steps.\n\n"
        "Guidelines:\n"
        "- Start with the problem, not the solution\n"
        "- Validate ideas against customer evidence\n"
        "- Consider multiple solution approaches\n"
        "- Identify assumptions that need testing\n"
        "- Create concrete, assignable action items\n"
        "- Think about what could go wrong\n"
        "- Consider the 'jobs to be done' framework\n"
        "- Be opinionated but acknowledge uncertainty\n"
        "- Output should be actionable within 1-2 weeks"
    ),
    user_prompt_template=(
        "Help me ideate and plan a feature for {{tenant_name}}.\n\n"
        "## Raw Inputs\n\n"
        "### Feature Ideas / Themes\n{{feature_ideas}}\n\n"
        "### Problem Being Solved\n{{problem_statement}}\n\n"
        "### Slack / Team Discussions\n{{slack_discussions}}\n\n"
        "### Customer Signals\n{{customer_signals}}\n\n"
        "### Competitive Context\n{{competitive_context}}\n\n"
        "### Constraints\n{{constraints}}\n\n"
        "## Output Format\n\n"
        "Create a Feature Ideation Document with:\n"
        "1. **Problem Definition** - Statement, who experiences it, pain severity, cost of inaction\n"
        "2. **Opportunity Assessment** - Market size, strategic alignment, competitive positioning, impact\n"
        "3. **Solution Exploration** - Options A/B/C with effort, pros, cons, risks\n"
        "4. **Recommended Approach** - Which option, user stories, out of scope\n"
        "5. **Assumptions to Validate** - Critical assumptions and how to test them\n"
        "6. **Risks & Mitigations** - Technical, adoption, business risks\n"
        "7. **Action Items** - Next 2 weeks with owners and due dates\n"
        "8. **Decision Points** - What needs to be decided before PRD"
    ),
    required_fields=(
        FieldSpec("tenant_name", "Your company name", "Acme Corp"),
        FieldSpec("feature_ideas", "Raw feature ideas or themes", "AI-powered search"),
        FieldSpec("problem_statement", "The problem being solved", "Users can't find content efficiently"),
    ),
    optional_fields=(
        FieldSpec("slack_discussions", "Relevant Slack threads", "#product: 'what about AI search?'"),
        FieldSpec("customer_signals", "Customer feedback or research", "Globex: 'search is our #1 issue'"),
        FieldSpec("competitive_context", "What competitors are doing", "Notion launched AI search"),
        FieldSpec("constraints", "Technical, resource, or timeline constraints", "2 pods available, 10 weeks"),
    ),
)

# ---------------------------------------------------------------------------
# 12. One-Pager (Beta)
# ---------------------------------------------------------------------------
ONE_PAGER = WorkflowDefinition(
    id="one_pager",
    name="One-Pager",
    description="Synthesize multiple inputs into a concise one-page executive summary (under 500 words).",
    category="beta",
    system_prompt=(
        "You are an executive communications expert helping PMs create concise, impactful one-pagers.\n\n"
        "Your job is to take multiple inputs and distill them into a single-page summary "
        "that busy executives or stakeholders can read in 2-3 minutes.\n\n"
        "Guidelines:\n"
        "- Ruthlessly prioritize - only include what matters most\n"
        "- Lead with the 'so what?' - why should they care?\n"
        "- Use concrete numbers over vague statements\n"
        "- Structure for skimmability (headers, bullets, bold key points)\n"
        "- Include a clear ask or decision needed (if applicable)\n"
        "- Keep it to ONE page (roughly 400-500 words max)\n"
        "- Assume the reader has 2 minutes and zero context\n"
        "- End with clear next steps or recommendations"
    ),
    user_prompt_template=(
        "Create a one-pager for {{tenant_name}}.\n\n"
        "## Purpose\n{{purpose}}\n\n"
        "## Target Audience\n{{audience}}\n\n"
        "## Source Materials\n\n"
        "### Documents / Context\n{{documents}}\n\n"
        "### Key Data Points\n{{data_points}}\n\n"
        "### Background / History\n{{background}}\n\n"
        "### Current Status\n{{current_status}}\n\n"
        "## Specific Requirements\n{{requirements}}\n\n"
        "## Output Format\n\n"
        "Create a one-pager with:\n"
        "1. **Title** - Clear, descriptive\n"
        "2. **TL;DR** (2-3 sentences)\n"
        "3. **Context** (3-4 bullets)\n"
        "4. **Key Findings / Status** (4-6 bullets)\n"
        "5. **Options / Recommendations**\n"
        "6. **Ask / Decision Needed**\n"
        "7. **Next Steps** (3-4 bullets)\n\n"
        "Keep total length under 500 words."
    ),
    required_fields=(
        FieldSpec("tenant_name", "Your company name", "Acme Corp"),
        FieldSpec("purpose", "What is this one-pager for?", "Board meeting pre-read"),
        FieldSpec("documents", "Source materials to synthesize", "Q1 search initiative results"),
    ),
    optional_fields=(
        FieldSpec("audience", "Who will read this?", "C-suite"),
        FieldSpec("data_points", "Key metrics and numbers", "40% faster search, NPS +28%"),
        FieldSpec("background", "Historical context", "Search was #1 pain point for 6 months"),
        FieldSpec("current_status", "Current state", "Filters shipped, AI search next"),
        FieldSpec("requirements", "Specific requirements or constraints", "Must include ROI numbers"),
    ),
)

# ---------------------------------------------------------------------------
# 13. TL;DR (Beta)
# ---------------------------------------------------------------------------
TLDR = WorkflowDefinition(
    id="tldr",
    name="TL;DR",
    description="Create a quick 3-5 bullet summary optimized for Slack, email, or async communication.",
    category="beta",
    system_prompt=(
        "You are a communication expert helping PMs write concise, scannable summaries for busy teams.\n\n"
        "Your job is to take complex information and distill it into a TL;DR that can be read "
        "in 30 seconds or less - perfect for Slack messages, email summaries, or async updates.\n\n"
        "Guidelines:\n"
        "- Maximum 3-5 bullet points\n"
        "- Each bullet is one line (under 15 words)\n"
        "- Lead with the most important point\n"
        "- Use emoji sparingly for visual scanning\n"
        "- Include a clear call-to-action if needed\n"
        "- Link to details rather than including them\n"
        "- Write for someone scrolling on mobile\n"
        "- No fluff, no preamble, just the essentials"
    ),
    user_prompt_template=(
        "Create a TL;DR summary.\n\n"
        "## Context Type\n{{context_type}}\n\n"
        "## Source Content\n{{source_content}}\n\n"
        "## Key Points to Emphasize\n{{key_points}}\n\n"
        "## Call to Action (if any)\n{{call_to_action}}\n\n"
        "## Output Format\n\n"
        "**TL;DR: [One-line summary]**\n\n"
        "- [Most important point]\n"
        "- [Second most important point]\n"
        "- [Third point if needed]\n"
        "- [Fourth point if needed]\n\n"
        "[Call to action or link to details]\n\n"
        "Keep it under 100 words total. Optimize for Slack/mobile reading."
    ),
    required_fields=(
        FieldSpec("source_content", "The content to summarize", "Sprint 42 review pack content..."),
    ),
    optional_fields=(
        FieldSpec("context_type", "Type of summary", "Sprint update"),
        FieldSpec("key_points", "Specific points to highlight", "Search filters shipped"),
        FieldSpec("call_to_action", "What should readers do?", "Review and approve by Friday"),
    ),
)


# ---------------------------------------------------------------------------
# Registry
# ---------------------------------------------------------------------------
WORKFLOW_REGISTRY: dict[str, WorkflowDefinition] = {
    w.id: w
    for w in [
        DAILY_BRIEF,
        MEETING_PREP,
        VOC_CLUSTERING,
        COMPETITOR_RESEARCH,
        ROADMAP_ALIGNMENT,
        PRD_DRAFT,
        SPRINT_REVIEW,
        PROTOTYPE_GENERATION,
        RELEASE_NOTES,
        DECK_CONTENT,
        FEATURE_IDEATION,
        ONE_PAGER,
        TLDR,
    ]
}
