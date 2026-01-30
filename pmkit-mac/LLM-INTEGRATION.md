# Claude Integration for pmkit

Documentation for Claude LLM integration in the pmkit Mac app.

## Overview

pmkit uses Claude (Anthropic) as the core LLM for:
- Understanding voice commands (intent recognition)
- Executing workflows via function calling
- Synthesizing data from integrations
- Generating natural language responses

## API Configuration

- **Model:** claude-sonnet-4-20250514 (or latest)
- **Max Tokens:** 4096 (responses), 8192 (PRD drafts)
- **Temperature:** 0.7 (conversational), 0.3 (structured outputs)

## System Prompt

```
You are pmkit, a voice-first assistant for product managers. You help PMs with:
- Daily briefs (synthesizing overnight activity)
- Meeting prep (context on attendees and open issues)
- Feature intelligence (customer themes and recommendations)
- PRD drafting (structured requirements documents)
- Ticket management (create, update, query in Linear/Jira)

You have access to the user's connected integrations. Use function calls to:
1. Fetch data from integrations
2. Execute workflow logic
3. Create/update tickets
4. Save artifacts

Respond conversationally but concisely — your responses will be spoken aloud.
Keep responses under 2 minutes of speaking time (~300 words) unless generating documents.

When you don't have enough context, ask clarifying questions.
When integrations aren't connected, explain what's needed and offer to open settings.

Current user subscription: {subscription_status}
Connected integrations: {connected_integrations}
```

## Function Definitions

### Workflow Functions

```json
{
  "name": "run_daily_brief",
  "description": "Generate a daily brief synthesizing overnight activity from Slack, Linear/Jira, and support channels. Saves output to ~/pmkit/.",
  "input_schema": {
    "type": "object",
    "properties": {},
    "required": []
  }
}
```

```json
{
  "name": "run_meeting_prep",
  "description": "Generate meeting prep with context on attendees, recent conversations, and open issues. Saves output to ~/pmkit/.",
  "input_schema": {
    "type": "object",
    "properties": {
      "meeting_identifier": {
        "type": "string",
        "description": "Meeting name, time (e.g., '2pm', 'next meeting'), or attendee name/company"
      }
    },
    "required": ["meeting_identifier"]
  }
}
```

```json
{
  "name": "run_feature_intelligence",
  "description": "Analyze customer feedback and feature requests to surface themes and recommendations. Saves output to ~/pmkit/.",
  "input_schema": {
    "type": "object",
    "properties": {
      "topic": {
        "type": "string",
        "description": "Optional: specific topic or feature area to focus on"
      }
    },
    "required": []
  }
}
```

```json
{
  "name": "draft_prd",
  "description": "Draft a product requirements document for a feature. Saves output to ~/pmkit/.",
  "input_schema": {
    "type": "object",
    "properties": {
      "feature_name": {
        "type": "string",
        "description": "Name of the feature"
      },
      "description": {
        "type": "string",
        "description": "User's description of what the feature should do"
      }
    },
    "required": ["feature_name", "description"]
  }
}
```

### Ticket Functions

```json
{
  "name": "create_ticket",
  "description": "Create a new ticket in Linear or Jira",
  "input_schema": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "Ticket title"
      },
      "description": {
        "type": "string",
        "description": "Ticket description"
      },
      "type": {
        "type": "string",
        "enum": ["bug", "task", "story", "feature"],
        "description": "Ticket type"
      },
      "priority": {
        "type": "string",
        "enum": ["low", "medium", "high", "urgent"],
        "description": "Ticket priority"
      },
      "tool": {
        "type": "string",
        "enum": ["linear", "jira", "auto"],
        "description": "Which tool to create in. 'auto' infers from context or user preference."
      }
    },
    "required": ["title", "description"]
  }
}
```

```json
{
  "name": "update_ticket",
  "description": "Update an existing ticket's status, add comment, or change fields",
  "input_schema": {
    "type": "object",
    "properties": {
      "ticket_identifier": {
        "type": "string",
        "description": "Ticket ID (e.g., 'PM-234') or description to find it"
      },
      "action": {
        "type": "string",
        "enum": ["set_status", "add_comment", "assign", "set_priority"],
        "description": "What to update"
      },
      "value": {
        "type": "string",
        "description": "New value (status name, comment text, assignee, priority)"
      }
    },
    "required": ["ticket_identifier", "action", "value"]
  }
}
```

```json
{
  "name": "query_tickets",
  "description": "Query tickets by status, project, assignee, or search term",
  "input_schema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Natural language query (e.g., 'blocking issues', 'my open tickets')"
      },
      "project": {
        "type": "string",
        "description": "Optional: filter by project name"
      },
      "status": {
        "type": "string",
        "description": "Optional: filter by status"
      },
      "assignee": {
        "type": "string",
        "description": "Optional: filter by assignee"
      }
    },
    "required": ["query"]
  }
}
```

### Utility Functions

```json
{
  "name": "open_history",
  "description": "Open the pmkit folder containing saved briefs, PRDs, and reports",
  "input_schema": {
    "type": "object",
    "properties": {
      "folder": {
        "type": "string",
        "enum": ["all", "briefs", "meeting-prep", "feature-intelligence", "prds"],
        "description": "Which folder to open. 'all' opens ~/pmkit/"
      }
    },
    "required": []
  }
}
```

```json
{
  "name": "open_settings",
  "description": "Open the pmkit settings window",
  "input_schema": {
    "type": "object",
    "properties": {
      "section": {
        "type": "string",
        "enum": ["account", "integrations", "voice", "hotkey", "storage", "about"],
        "description": "Optional: which settings section to open"
      }
    },
    "required": []
  }
}
```

## Conversation Management

### Multi-turn State

Maintain conversation history for follow-ups:

```swift
struct Conversation {
    var messages: [Message]
    var activeWorkflow: String?
    var context: [String: Any]  // Workflow-specific context
    var lastActivityAt: Date

    // Clear after 3 minutes of inactivity
    var isExpired: Bool {
        Date().timeIntervalSince(lastActivityAt) > 180
    }
}
```

### Follow-up Handling

After a workflow response, user can follow up:
- "Tell me more about the auth blocker"
- "Create a ticket for that"
- "Send that to David on Slack"

Claude should use conversation context to resolve references.

## Error Handling

### Integration Not Connected
```
User: "What's my brief?"
Claude: "I'd need Slack and Linear connected to generate your daily brief.
         Would you like me to open the integrations settings?"
[If yes, call open_settings with section="integrations"]
```

### Subscription Required
```
User: "Connect my Jira"
Claude: "Connecting integrations requires a pmkit subscription.
         Would you like to learn more about pmkit Pro?"
[Show paywall or link to pricing]
```

### Ambiguous Query
```
User: "Prep me for the meeting"
Claude: "I see you have three meetings today. Which one?
         - 10am: Team standup
         - 2pm: Acme quarterly review
         - 4pm: 1:1 with Sarah"
```

## Response Guidelines

1. **Be concise** — Responses are spoken. Aim for 30-60 seconds typical, 2 min max.
2. **Lead with the important stuff** — Most critical info first.
3. **Offer follow-ups** — "Want me to go deeper on any of these?"
4. **Confirm actions** — "I've created ticket PM-456. Anything else?"
5. **Handle errors gracefully** — Explain what's needed, offer to help fix.
