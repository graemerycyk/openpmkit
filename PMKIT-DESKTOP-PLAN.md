# pmkit-desktop: OpenClaw Fork Plan

Building a PM-focused AI assistant by forking OpenClaw and integrating pmkit's existing web connectors.

## Executive Summary

Fork OpenClaw (~34,000 lines across TypeScript gateway + Swift macOS app) to create **pmkit-desktop** - a local-first AI assistant for Product Managers. The fork will:

1. **Rebrand** OpenClaw → pmkit-desktop
2. **Remove** non-PM channels (WhatsApp, Telegram, Discord, Signal, etc.)
3. **Keep** Slack (PM's primary communication channel)
4. **Add** PM-specific skills that call pmkit's existing web fetchers
5. **Customize** system prompts for product management reasoning

## What We're Building On

### OpenClaw Strengths (Already Implemented)

| Component | Lines | Description |
|-----------|-------|-------------|
| Gateway | ~25,000 TS | WebSocket control plane, 100+ RPC methods |
| macOS App | ~8,000 Swift | Menu bar app, voice wake, hotkeys |
| Skills System | 52 skills | Markdown-based tool definitions |
| LLM Providers | 6+ | Anthropic, OpenAI, Google, Bedrock, Ollama |
| Voice | Full | Whisper STT, TTS, voice wake, push-to-talk |

### pmkit Web Strengths (Already Built)

| Component | Description |
|-----------|-------------|
| **Fetchers** | Slack, Gmail, Calendar, Drive, Jira, Confluence, Zendesk |
| **Prompt Templates** | 10 PM workflows (daily_brief, meeting_prep, prd_draft, etc.) |
| **Job Types** | Type-safe workflow definitions |
| **Mock Data** | Demo tenant data for testing |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    pmkit-desktop                             │
│                                                             │
│  ┌─────────────────┐    ┌────────────────────────────────┐ │
│  │  macOS App      │    │  Gateway (WebSocket)           │ │
│  │  (Swift)        │◄──►│  (TypeScript)                  │ │
│  │                 │    │                                │ │
│  │  • Menu bar     │    │  • Agent runner (Pi)           │ │
│  │  • Voice wake   │    │  • Skill execution             │ │
│  │  • Hotkeys      │    │  • LLM providers               │ │
│  │  • Settings     │    │  • Session management          │ │
│  └─────────────────┘    └──────────────┬─────────────────┘ │
│                                        │                    │
│                                        ▼                    │
│                         ┌──────────────────────────────┐   │
│                         │  PM Skills Layer             │   │
│                         │                              │   │
│                         │  • daily-brief               │   │
│                         │  • meeting-prep              │   │
│                         │  • prd-draft                 │   │
│                         │  • sprint-review             │   │
│                         │  • feature-intelligence      │   │
│                         │  • competitor-research       │   │
│                         │  • roadmap-alignment         │   │
│                         │  • release-notes             │   │
│                         │  • deck-content              │   │
│                         │  • prototype-generation      │   │
│                         └──────────────┬───────────────┘   │
│                                        │                    │
│                                        ▼                    │
│                         ┌──────────────────────────────┐   │
│                         │  pmkit Fetchers              │   │
│                         │  (via HTTP to web or direct) │   │
│                         │                              │   │
│                         │  • SlackFetcher              │   │
│                         │  • JiraFetcher               │   │
│                         │  • CalendarFetcher           │   │
│                         │  • ConfluenceFetcher         │   │
│                         │  • GmailFetcher              │   │
│                         │  • DriveFetcher              │   │
│                         │  • ZendeskFetcher            │   │
│                         └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Fork & Rebrand (Week 1)

### 1.1 Create Fork
```bash
# Clone OpenClaw
git clone https://github.com/graemerycyk/openclaw.git pmkit-desktop
cd pmkit-desktop

# Update package.json
# name: "openclaw" → "pmkit-desktop"
# description: "PM-focused AI assistant"

# Rename main binary
# openclaw → pmkit
```

### 1.2 Update Branding
- [ ] `package.json` - name, description, author
- [ ] `README.md` - pmkit branding, PM focus
- [ ] `apps/macos/` - Bundle ID, app name, icons
- [ ] `docs/` - Update documentation
- [ ] CLI entry point - `pmkit` command

### 1.3 Remove Non-PM Channels

**Keep:**
- `src/slack/` - Primary PM communication

**Remove from core:**
- `src/telegram/`
- `src/discord/`
- `src/signal/`
- `src/imessage/`

**Remove from extensions:**
- `extensions/whatsapp/`
- `extensions/telegram/`
- `extensions/discord/`
- `extensions/signal/`
- `extensions/msteams/`
- `extensions/matrix/`
- `extensions/bluebubbles/`
- `extensions/line/`
- `extensions/zalo/`
- `extensions/twitch/`
- `extensions/nostr/`
- (Keep `extensions/voice-call/`)

---

## Phase 2: PM Skills (Week 2-3)

### 2.1 Skill Architecture

Each PM skill is a markdown file with tool definitions that call pmkit fetchers.

```
skills/
├── pm-daily-brief/
│   └── SKILL.md          # Daily brief tool definition
├── pm-meeting-prep/
│   └── SKILL.md          # Meeting prep tool definition
├── pm-prd-draft/
│   └── SKILL.md          # PRD drafting tool
├── pm-sprint-review/
│   └── SKILL.md          # Sprint review pack
├── pm-feature-intel/
│   └── SKILL.md          # VoC/Feature intelligence
├── pm-competitor/
│   └── SKILL.md          # Competitor research
├── pm-roadmap/
│   └── SKILL.md          # Roadmap alignment
├── pm-release-notes/
│   └── SKILL.md          # Release notes generation
├── pm-deck-content/
│   └── SKILL.md          # Slide deck content
├── pm-prototype/
│   └── SKILL.md          # HTML prototype generation
└── pm-jira/
    └── SKILL.md          # Jira ticket management
```

### 2.2 Example Skill: Daily Brief

```markdown
---
name: pm-daily-brief
description: Generate morning brief from Slack, Jira, and support data
metadata: {"pmkit":{"emoji":"☀️","category":"pm"}}
---

# Daily Brief

Generate a synthesized morning brief for product managers.

## Tools

### generate_daily_brief

Generate a daily brief from connected data sources.

**Input:**
```json
{
  "sinceHoursAgo": 24,
  "includeSlack": true,
  "includeJira": true,
  "includeSupport": true,
  "focusChannels": ["#product", "#engineering", "#support"]
}
```

**Output:** Markdown brief with:
- TL;DR summary
- Urgent items (blockers, escalations)
- Sprint progress
- Customer signals
- Recommended actions

### get_slack_activity

Fetch recent Slack messages from specified channels.

### get_jira_updates

Fetch recent Jira ticket updates and sprint progress.

### get_support_tickets

Fetch recent Zendesk tickets and escalations.
```

### 2.3 Fetcher Integration

Two options for integrating pmkit fetchers:

**Option A: Direct Import (Preferred)**
```typescript
// skills/pm-daily-brief/index.ts
import { SlackFetcher, JiraFetcher, ZendeskFetcher } from '@pmkit/core/fetchers';

export async function generateDailyBrief(params: DailyBriefParams) {
  const [slack, jira, support] = await Promise.all([
    slackFetcher.fetch({ sinceHoursAgo: params.sinceHoursAgo }),
    jiraFetcher.fetch({ sinceHoursAgo: params.sinceHoursAgo }),
    zendeskFetcher.fetch({ sinceHoursAgo: params.sinceHoursAgo }),
  ]);

  // Use LLM to synthesize into brief
  return synthesize(slack, jira, support);
}
```

**Option B: HTTP to pmkit Web**
```typescript
// Call existing pmkit web API
const response = await fetch('https://app.getpmkit.com/api/agents/daily-brief/trigger', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ tenantId, params })
});
```

### 2.4 System Prompt Customization

Update `src/agents/system-prompt.ts` for PM focus:

```typescript
const PM_SYSTEM_PROMPT = `
You are pmkit, an AI assistant for Product Managers.

Your primary capabilities:
- Generate daily briefs from Slack, Jira, and support data
- Prepare meeting packs with account context and talking points
- Draft PRDs grounded in customer evidence
- Create sprint review summaries
- Analyze voice of customer themes
- Research competitor product changes
- Generate release notes and deck content

Communication style:
- Be concise but comprehensive
- Lead with insights, not data dumps
- Highlight blockers and urgent items first
- Include specific numbers and quotes
- End with actionable recommendations

When using tools:
- Fetch data from connected sources before synthesizing
- Cross-reference information across sources
- Cite sources (Slack channel, Jira ticket, etc.)
`;
```

---

## Phase 3: OAuth & Credentials (Week 3)

### 3.1 Credential Storage

OpenClaw uses `~/.openclaw/openclaw.json` for config. We'll add:

```json5
{
  // Existing OpenClaw config...

  // PM connector credentials (encrypted)
  connectors: {
    slack: {
      accessToken: "xoxb-...",
      // or OAuth flow
    },
    jira: {
      baseUrl: "https://company.atlassian.net",
      email: "user@company.com",
      apiToken: "..."
    },
    google: {
      // OAuth tokens for Calendar, Gmail, Drive
    },
    zendesk: {
      subdomain: "company",
      email: "user@company.com",
      apiToken: "..."
    }
  }
}
```

### 3.2 macOS Keychain Integration

The macOS app already uses Keychain for tokens. We'll extend to store:
- Slack OAuth tokens
- Jira API tokens
- Google OAuth tokens
- Zendesk API tokens

### 3.3 Connection Setup Flow

Add a setup wizard in the macOS app:

1. **Welcome** - Introduction to pmkit-desktop
2. **LLM Provider** - Choose Anthropic/OpenAI/Google
3. **Slack** - OAuth connect
4. **Jira** - API token setup
5. **Google** - OAuth for Calendar/Gmail/Drive
6. **Zendesk** - API token (optional)
7. **Test** - Verify connections work

---

## Phase 4: macOS App Customization (Week 4)

### 4.1 Rebrand UI

- [ ] App icon (pmkit branding)
- [ ] Menu bar icon
- [ ] App name in menu
- [ ] Settings window title
- [ ] About dialog

### 4.2 PM Dashboard View

Add a dashboard showing:
- Connection status (Slack ✅, Jira ✅, etc.)
- Recent briefs generated
- Upcoming meetings (from Calendar)
- Current sprint status
- Quick actions (Generate Brief, Prep Next Meeting)

### 4.3 Voice Commands

Customize voice wake for PM workflows:

```
"Hey pmkit, what's my brief?"        → Generate daily brief
"Hey pmkit, prep me for [meeting]"   → Meeting prep pack
"Hey pmkit, sprint status"           → Sprint review
"Hey pmkit, draft PRD for [feature]" → PRD draft
```

---

## Phase 5: Testing & Polish (Week 5)

### 5.1 Integration Tests

- [ ] Skill execution with mock data
- [ ] Fetcher integration tests
- [ ] macOS app UI tests
- [ ] Voice command recognition

### 5.2 Demo Mode

Use pmkit's existing mock-tenant data for demos:
- `packages/mock-tenant/src/data/slack.ts`
- `packages/mock-tenant/src/data/jira.ts`
- `packages/mock-tenant/src/data/google.ts`

### 5.3 Documentation

- [ ] README with setup instructions
- [ ] Skill usage guide
- [ ] Troubleshooting guide
- [ ] Architecture overview

---

## File Structure (Post-Fork)

```
pmkit-desktop/
├── src/                          # Gateway (TypeScript)
│   ├── gateway/                  # WebSocket control plane
│   ├── agents/                   # Pi agent runner
│   ├── providers/               # LLM providers
│   ├── slack/                   # Slack integration (KEEP)
│   ├── pm-fetchers/             # NEW: pmkit fetcher wrappers
│   │   ├── slack.ts
│   │   ├── jira.ts
│   │   ├── calendar.ts
│   │   ├── confluence.ts
│   │   ├── gmail.ts
│   │   ├── drive.ts
│   │   └── zendesk.ts
│   └── cli/                     # CLI entry point
├── apps/
│   └── macos/                   # macOS menu bar app (Swift)
├── skills/                      # PM skills
│   ├── pm-daily-brief/
│   ├── pm-meeting-prep/
│   ├── pm-prd-draft/
│   ├── pm-sprint-review/
│   ├── pm-feature-intel/
│   ├── pm-competitor/
│   ├── pm-roadmap/
│   ├── pm-release-notes/
│   ├── pm-deck-content/
│   ├── pm-prototype/
│   └── pm-jira/
├── extensions/
│   └── voice-call/              # Keep voice capabilities
├── docs/                        # Documentation
└── package.json                 # pmkit-desktop
```

---

## Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| 1. Fork & Rebrand | Week 1 | Renamed project, removed non-PM channels |
| 2. PM Skills | Week 2-3 | 10+ PM skill definitions, fetcher integration |
| 3. OAuth | Week 3 | Credential storage, connection flows |
| 4. macOS UI | Week 4 | Rebranded app, PM dashboard |
| 5. Testing | Week 5 | Integration tests, docs, polish |

**Total: 5 weeks**

---

## Success Criteria

1. **Functional**: Can generate a daily brief from real Slack/Jira/Zendesk data
2. **Voice**: Can trigger PM workflows via voice commands
3. **Local-first**: Runs entirely on user's machine (no pmkit web required)
4. **Multi-provider**: Works with Anthropic, OpenAI, or Google
5. **Polished**: macOS app is production-ready

---

## Open Questions

1. **Fetcher hosting**: Direct import vs. HTTP to pmkit web?
   - Direct = faster, offline capable
   - HTTP = simpler updates, shared auth

2. **OAuth flows**: Handle in macOS app or delegate to web?
   - macOS = better UX, more complex
   - Web = simpler, requires browser redirect

3. **Pricing**: Free OSS or tied to pmkit subscription?
   - OSS = wider adoption
   - Subscription = revenue

4. **Sync**: Should desktop sync with pmkit web?
   - Yes = unified experience
   - No = simpler, truly local-first

---

## Getting Started

```bash
# 1. Clone the fork
git clone https://github.com/graemerycyk/openclaw.git pmkit-desktop
cd pmkit-desktop

# 2. Install dependencies
pnpm install

# 3. Copy pmkit fetchers
cp -r ../pmkit/packages/core/src/fetchers src/pm-fetchers/

# 4. Start development
pnpm dev

# 5. Run macOS app
cd apps/macos && swift build && swift run
```

---

## Next Steps

1. [ ] Confirm approach with user
2. [ ] Create pmkit-desktop fork
3. [ ] Begin Phase 1 (rebrand)
4. [ ] Create first PM skill (daily-brief)
