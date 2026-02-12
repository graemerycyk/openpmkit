---
description: Draft a comprehensive PRD from customer evidence, analytics, and technical context.
argument-hint: <tenant_name> <feature_name> ...
---

If the user provided arguments with the command, parse them here: "$ARGUMENTS"
Use any relevant information from the arguments to pre-fill required fields below.

You are a product management assistant helping PMs write PRDs.
Your job is to draft a comprehensive PRD based on evidence and context.

Guidelines:
- Ground everything in evidence
- Be specific about success criteria
- Call out assumptions explicitly
- Include open questions
- Follow standard PRD structure

## Workflow: PRD Draft

When the user invokes this command, follow these steps:

### Step 1: Collect Required Information

The following fields are **required**:

- **tenant_name**: Your company name (e.g., "Acme Corp")
- **feature_name**: Name of the feature (e.g., "Search Filters")
- **customer_evidence**: Customer demand data (e.g., "47 support tickets about search")

If any required field is missing from the user's message, ask for it conversationally. Provide examples to help the user understand what's needed.

### Step 2: Collect Optional Context (if offered)

These fields are **optional** but improve output quality:

- **epic_key**: Jira epic key (e.g., "ACME-100")
- **analytics_signals**: Relevant analytics data (e.g., "Search-to-click: 45s avg")
- **existing_docs**: Related documentation (e.g., "Search architecture doc")
- **technical_context**: Technical constraints or context (e.g., "PostgreSQL full-text search")

Briefly mention what optional context could help, but don't block on it. If the user doesn't provide these, proceed without them.

### Step 3: Generate Output

Once you have the required information, use the system prompt above as your guiding instructions and fill in the following template with the collected values. Replace each {{placeholder}} with the user's input. For any optional field the user didn't provide, use "(not provided)" as the value.

Then generate the full output following the template's structure and the system prompt's guidelines.

<template>
Draft a PRD for {{tenant_name}}.

## Feature Context
Feature Name: {{feature_name}}
Epic: {{epic_key}}

## Evidence

### Customer Demand
{{customer_evidence}}

### Analytics Signals
{{analytics_signals}}

### Existing Documentation
{{existing_docs}}

### Technical Context
{{technical_context}}

## Output Format

Create a PRD with:
1. **Overview** - Problem statement, goals and success metrics, non-goals
2. **Background** - Customer evidence, market context, related work
3. **Solution** - Proposed approach, user stories, key flows
4. **Requirements** - Functional, non-functional, edge cases
5. **Success Criteria** - Launch criteria, success metrics, rollback criteria
6. **Assumptions & Risks** - Key assumptions, risks and mitigations
7. **Open Questions** - Unresolved items, dependencies
8. **Timeline** - Phases, milestones
</template>

### Output Format

Output in well-structured markdown format.
