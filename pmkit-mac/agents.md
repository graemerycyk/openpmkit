# pmkit Agents / Workflows

> Documentation for pmkit voice-triggered workflows in the Mac app.

## Monorepo Context

This is `pmkit-mac/AGENTS.md`. See also:
- `../AGENTS.md` - Cross-project API contracts
- `CLAUDE.md` - Claude Code conventions for this project
- `LLM-INTEGRATION.md` - Claude LLM function definitions

## Overview

pmkit workflows are voice-triggered agents that synthesize data from connected integrations and produce actionable outputs. Each workflow:

1. Activates via voice command
2. Queries relevant integrations
3. Synthesizes information using Claude
4. Responds via voice (ElevenLabs TTS)
5. Saves artifacts locally (~/pmkit/)

## Available Workflows

### 1. Daily Brief

**Purpose:** Synthesize overnight activity to start your day informed.

**Voice Triggers:**
- "What's my brief?"
- "Brief me"
- "What happened overnight?"
- "Catch me up"
- "What do I need to know?"

**Data Sources:**
- Slack: Channel activity, important messages, decisions
- Linear/Jira: Sprint status, new blockers, completed work
- Zendesk: New support tickets, urgent issues, themes
- Gmail: Important emails (optional)

**Output:**
- Spoken summary (2-3 minutes)
- Saved artifact: `~/pmkit/{timestamp}-daily-brief/output.md` + `output.json`

**Output Structure:**
- Slack Activity (highlights by channel)
- Sprint Status (progress, blockers)
- Support Themes (ticket volume, urgent items)
- Action Items (prioritized list)

---

### 2. Meeting Prep

**Purpose:** Get context before any meeting — attendees, history, open issues, talking points.

**Voice Triggers:**
- "Prep me for my 2pm"
- "Prep me for [person/company]"
- "Get me ready for [meeting]"
- "What do I need to know about [person/company]?"
- "Who am I meeting with next?"

**Data Sources:**
- Google Calendar: Meeting details, attendees
- Slack: Recent conversations with attendee/company
- Linear/Jira: Open issues related to attendee/company
- Zendesk: Support tickets from company
- Gmail: Recent email threads (optional)

**Output:**
- Spoken context (1-2 minutes)
- Saved artifact: `~/pmkit/{timestamp}-meeting-prep-{name}/output.md` + `output.json`

**Output Structure:**
- Meeting Details (time, attendees, agenda if available)
- Attendee Context (role, last interaction, relationship notes)
- Open Issues (tickets, bugs, feature requests)
- Recent Conversations (Slack highlights)
- Suggested Talking Points

---

### 3. Feature Intelligence

**Purpose:** Surface customer themes, feature requests, and build recommendations.

**Voice Triggers:**
- "What are customers asking for?"
- "What should we build next?"
- "What are the top feature requests?"
- "What's the voice of customer this week?"
- "What are customers saying about [topic]?"

**Data Sources:**
- Slack: Customer channels, feedback channels
- Zendesk: Support ticket themes, feature requests
- Linear/Jira: Issues tagged as feature requests
- Gmail: Customer emails (optional)

**Output:**
- Spoken themes (2-3 minutes)
- Saved artifact: `~/pmkit/{timestamp}-feature-intelligence/output.md` + `output.json`

**Output Structure:**
- Top Themes (ranked by frequency/impact)
- Theme Details (specific requests, who's asking, ARR impact)
- Competitive Context (if mentioned)
- Recommendations (what to build, prioritization rationale)

---

### 4. PRD Draft

**Purpose:** Draft a product requirements document from voice description.

**Voice Triggers:**
- "Draft a PRD for [feature]"
- "Start a PRD about [description]"
- "Write up requirements for [feature]"

**Data Sources:**
- User's verbal description
- Linear/Jira: Related existing tickets
- Slack: Related discussions
- Confluence: Related documentation

**Output:**
- Spoken summary (1 minute)
- Saved artifact: `~/pmkit/{timestamp}-prd-{feature}/output.md` + `output.json`

**Output Structure:**
- Overview
- Problem Statement
- Goals & Success Metrics
- User Stories
- Requirements (functional, non-functional)
- Open Questions
- Related Work (links to tickets, docs)

---

### 5. Ticket CRUD

**Purpose:** Create, read, update tickets via voice.

**Voice Triggers (Create):**
- "Create a bug ticket for [description]"
- "Create a task for [description]"
- "File a story about [description]"
- "Create a ticket: [description]"

**Voice Triggers (Read):**
- "What's the status of [ticket/project]?"
- "What's blocking [project]?"
- "What's in my sprint?"
- "What did [person] work on?"

**Voice Triggers (Update):**
- "Mark [ticket] as done"
- "Close [ticket]"
- "Add a note to [ticket]: [content]"
- "Assign [ticket] to [person]"
- "Set [ticket] priority to high"

**Data Sources:**
- Linear: GraphQL API
- Jira: REST API

**Output:**
- Spoken confirmation
- No saved artifact (action confirmation only)

---

## Workflow Execution Flow

```
1. Voice Input (Deepgram STT)
   ↓
2. Intent Recognition (Claude)
   ↓
3. Function Call (workflow identified)
   ↓
4. Data Fetching (integration APIs)
   ↓
5. Synthesis (Claude)
   ↓
6. Response Generation
   ↓
7. Voice Output (ElevenLabs TTS)
   ↓
8. Artifact Save (local ~/pmkit/)
```

## Adding New Workflows

To add a new workflow:

1. Create `{WorkflowName}Workflow.swift` in `Workflows/`
2. Add function definition to `FunctionDefinitions.swift`
3. Register in `WorkflowManager.swift`
4. Add voice trigger patterns to Claude system prompt
5. Document in this file

## Subscription Requirements

- **Free users:** Can sign in, view app, but cannot connect integrations or run workflows
- **Paid users:** Full access to all workflows and integrations
