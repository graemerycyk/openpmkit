---
description: Guide through connecting your PM tools for openpmkit workflows
---

# openpmkit Setup

Set up your tool connections to get the most out of openpmkit workflows.

## Workflow

### 1. Welcome & Overview

Display this welcome message:

---

# 🚀 openpmkit Setup

Let's connect your tools so openpmkit can automatically pull data for your workflows.

**What we'll connect:**
1. 📧 Google Workspace (Gmail, Calendar, Drive)
2. 📋 Project Tracker (Jira or Linear)
3. 📝 Knowledge Base (Confluence, Notion, or Coda)
4. 💬 Chat (Slack)
5. 🎨 Design (Figma) — optional
6. 🎫 Support (Zendesk) — or manual workaround
7. 📞 Calls (Gong) — or manual workaround

Each connection takes ~30 seconds. Ready?

---

### 2. Check Current Connections

**First, check what's already connected:**

Look at available MCP tools/connectors and identify:
- Which tools are already connected
- Which tools are available to connect
- Which tools are not available as connectors

Report back:
```
✅ Already connected: [list]
⚪ Available to connect: [list]
❌ Not available as connector: [list]
```

### 3. Guide Through Connections (Priority Order)

#### Priority 1: Google Workspace
**Why:** Calendar for meetings, Gmail for context, Drive for docs

If **Google Workspace** is available but not connected:
```
📧 **Connect Google Workspace**

This gives openpmkit access to:
- Google Calendar → /daily-brief, /meeting-prep
- Gmail → /meeting-prep, /feature-intel
- Google Drive → /prd-draft, /roadmap

👉 Go to: Settings > Connectors > Google Workspace > Connect

Let me know when done!
```

If already connected: `✅ Google Workspace connected`

---

#### Priority 2: Project Tracker (Jira OR Linear)
**Why:** Sprint data, tickets, backlog — core to most workflows

If **Jira** or **Linear** is available but not connected:
```
📋 **Connect your Project Tracker**

Choose one:
- **Jira** (via Atlassian connector) — if you use Jira
- **Linear** — if you use Linear

This powers:
- /daily-brief → ticket updates, sprint status
- /sprint-review → velocity, completed work
- /release-notes → shipped tickets
- /prd-draft → related tickets, requirements

👉 Go to: Settings > Connectors > [Atlassian/Linear] > Connect

Which do you use?
```

If already connected: `✅ Project Tracker connected ([Jira/Linear])`

---

#### Priority 3: Knowledge Base (Confluence, Notion, or Coda)
**Why:** PRDs, specs, research docs

If any knowledge base is available but not connected:
```
📝 **Connect your Knowledge Base**

Choose one:
- **Confluence** (via Atlassian connector) — if you use Confluence
- **Notion** — if you use Notion
- **Coda** — if you use Coda

This powers:
- /prd-draft → existing PRDs, research
- /roadmap → strategy docs, OKRs
- /competitor → competitive intel docs

👉 Go to: Settings > Connectors > [Tool] > Connect

Which do you use? (or "none" to skip)
```

If already connected: `✅ Knowledge Base connected ([tool])`
If user says none: `⏭️ Skipping Knowledge Base — you can paste docs manually when needed`

---

#### Priority 4: Chat (Slack)
**Why:** Team discussions, decisions, context

If **Slack** is available but not connected:
```
💬 **Connect Slack**

This powers:
- /daily-brief → overnight discussions, @mentions
- /meeting-prep → internal context about accounts
- /feature-intel → team discussions about features

👉 Go to: Settings > Connectors > Slack > Connect

Let me know when done!
```

If already connected: `✅ Slack connected`

---

#### Priority 5: Design (Figma) — Optional
**Why:** Mockups, design context

```
🎨 **Connect Figma** (Optional)

Do you use Figma for design?

If yes, this helps with:
- /prd-draft → pull in related mockups
- /prototype → reference existing designs

👉 Go to: Settings > Connectors > Figma > Connect

Or say "skip" if you don't use Figma.
```

---

#### Priority 6: Support (Zendesk)
**Why:** Customer tickets, feedback, pain points

Check if Zendesk connector is available:

**If Zendesk IS available:**
```
🎫 **Connect Zendesk**

This powers:
- /daily-brief → new/escalated tickets
- /feature-intel → customer feedback themes
- /meeting-prep → account support history

👉 Go to: Settings > Connectors > Zendesk > Connect
```

**If Zendesk is NOT available as a connector:**
```
🎫 **Support Data (Zendesk not available)**

Zendesk isn't available as a connector yet. Here's how to work around it:

**Option A: Manual paste**
When running /feature-intel or /daily-brief, paste recent ticket data:
- Export tickets from Zendesk (CSV or copy/paste)
- Include: ticket subject, description, customer, date

**Option B: Zapier integration**
Set up a Zap to send Zendesk ticket summaries to a Slack channel or Google Sheet that IS connected.

**Option C: Weekly export**
Export a weekly ticket summary to Google Drive, then openpmkit can access it.

Which approach works for you?
```

---

#### Priority 7: Calls (Gong)
**Why:** Customer quotes, call insights, competitive intel

Check if Gong connector is available:

**If Gong IS available:**
```
📞 **Connect Gong**

This powers:
- /meeting-prep → previous call summaries
- /feature-intel → customer quotes from calls
- /competitor → competitive mentions

👉 Go to: Settings > Connectors > Gong > Connect
```

**If Gong is NOT available as a connector:**
```
📞 **Call Data (Gong not available)**

Gong isn't available as a connector yet. Here's how to work around it:

**Option A: Manual paste**
When running /meeting-prep or /feature-intel, paste relevant call notes:
- Copy key quotes from Gong
- Include: customer name, date, key points

**Option B: Gong email summaries → Gmail**
Set Gong to email call summaries to your inbox. Since Gmail IS connected, openpmkit can search for them.

**Option C: Gong → Google Drive**
Export call transcripts to Google Drive periodically.

**Option D: Slack integration**
If Gong posts to Slack and Slack is connected, openpmkit can find call summaries there.

Which approach works for you?
```

---

### 4. Setup Complete

After all steps:

```
# ✅ openpmkit Setup Complete!

**Connected:**
- ✅ Google Workspace (Calendar, Gmail, Drive)
- ✅ [Jira/Linear]
- ✅ [Confluence/Notion/Coda] (or skipped)
- ✅ Slack
- ✅ Figma (or skipped)
- ⚠️ Zendesk (using [workaround])
- ⚠️ Gong (using [workaround])

**You're ready to use:**
- `/daily-brief` — morning catchup
- `/meeting-prep [account]` — prep for calls
- `/sprint-review` — end of sprint summary
- `/feature-intel` — voice of customer analysis
- `/competitor` — competitive research
- `/prd-draft [feature]` — write PRDs
- `/roadmap [decision]` — decision memos
- `/release-notes` — customer release notes
- `/deck-content [topic]` — presentation content
- `/prototype` — interactive prototypes

**Pro tip:** Run `/daily-brief` tomorrow morning to see it in action!

Questions? Run `/pmkit-help` anytime.
```

---

## Fallback Workarounds Reference

### If Zendesk unavailable:
| Workaround | How it works | Best for |
|------------|--------------|----------|
| Manual paste | Copy tickets into chat when running commands | Ad-hoc needs |
| Zapier → Slack | Zap sends ticket summaries to a Slack channel | Real-time |
| Weekly export → Drive | Export CSV to Google Drive weekly | Batch analysis |

### If Gong unavailable:
| Workaround | How it works | Best for |
|------------|--------------|----------|
| Manual paste | Copy call notes/quotes when running commands | Ad-hoc needs |
| Email summaries → Gmail | Gong emails → Gmail → searchable | Automatic |
| Export → Drive | Save transcripts to Google Drive | Detailed analysis |
| Gong → Slack | Gong posts to Slack channel | Real-time team visibility |

---

## Notes

- Guide users through ONE connection at a time
- Celebrate each successful connection
- Don't make users feel bad about tools they don't have
- Provide practical workarounds for unavailable connectors
- End with clear next steps and encouragement
