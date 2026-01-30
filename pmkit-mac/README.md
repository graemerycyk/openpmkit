# pmkit Mac App

Voice-first PM assistant for macOS. Talk to your sprint.

## Overview

pmkit is a menu bar app that lets product managers interact with their tools using voice commands. Ask for your daily brief, prep for meetings, get feature intelligence, draft PRDs, and manage tickets — all by voice.

## Requirements

- macOS 13.0+
- pmkit account (free to download, paid subscription for integrations)
- Microphone access

## Installation

1. Download the DMG from https://getpmkit.com/download
2. Open the DMG and drag pmkit to Applications
3. Launch pmkit from Applications (or Spotlight)
4. If prompted by Gatekeeper, click "Open" to allow
5. Sign in with your pmkit account
6. Connect your integrations (requires paid subscription)

**Note**: pmkit is distributed directly, not via the App Store. The app is signed with Apple Developer ID and notarized for your security.

## Voice Commands

### Daily Brief
- "What's my brief?"
- "Brief me"
- "What happened overnight?"
- "Catch me up"

### Meeting Prep
- "Prep me for my 2pm"
- "Prep me for Acme"
- "Get me ready for [meeting/person/company]"

### Feature Intelligence
- "What are customers asking for?"
- "What should we build next?"
- "What are customers saying about [topic]?"

### PRD Draft
- "Draft a PRD for [feature]"
- "Start a PRD about [description]"

### Ticket Operations
- "Create a bug ticket for [description]"
- "Create a task for [description]"
- "What's the status of [project/ticket]?"
- "What's blocking [project]?"
- "Mark [ticket] as done"
- "Add a note to [ticket]: [content]"

### Utility
- "Show my history"
- "Open settings"

## Keyboard Shortcut

Default: ⌘⇧P (Command + Shift + P)

Hold to talk, release to send.

## Local Storage

Artifacts are saved to `~/pmkit/` with the following structure:

```
~/pmkit/
├── 2026-01-22-083000-daily-brief/
│   ├── output.md
│   └── output.json
├── 2026-01-22-140000-meeting-prep-acme/
│   ├── output.md
│   └── output.json
└── ...
```

## Integrations

### Available Now
- Linear (read + write)
- Jira (read + write)
- Slack (read)
- Google Calendar (read)
- Confluence (read)
- Zendesk (read)
- Gmail (read)
- Google Drive (read)

### Coming Soon
- Gong
- Figma
- Loom
- Amplitude
- Discourse
- Notion
- Zoom

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mac Menu Bar App                          │
│                      (Swift/SwiftUI)                         │
├─────────────────────────────────────────────────────────────┤
│   Voice Pipeline:                                            │
│   Deepgram (STT) → Claude (LLM) → ElevenLabs (TTS)          │
│                                                              │
│   Connects to existing pmkit backend for:                    │
│   - Auth (existing user accounts)                            │
│   - Subscription status (free vs paid)                       │
│   - Tool integrations (OAuth tokens)                         │
│   - Workflow execution                                       │
│                                                              │
│   Local storage for artifacts:                               │
│   ~/pmkit/{YYYY-MM-DD-HHMMSS-workflow-name}/                │
│   Each folder contains: output.md + output.json              │
└─────────────────────────────────────────────────────────────┘
```

## Development

### Prerequisites

- Xcode 15.0+
- macOS 13.0+
- Swift 5.9+

### Setup

1. Open `pmkit.xcodeproj` in Xcode
2. Build and run (⌘R)

### Project Structure

```
pmkit/
├── App/                  # App entry point, delegate, state
├── Views/
│   ├── MenuBar/          # Menu bar popover UI
│   ├── Onboarding/       # First-time user experience
│   ├── Settings/         # Settings window
│   └── Components/       # Reusable UI components
├── Voice/                # Voice pipeline (STT, TTS, recording)
├── LLM/                  # Claude integration
├── Workflows/            # Workflow implementations
├── Integrations/         # Integration clients
├── Backend/              # pmkit API client, auth
├── Storage/              # Local storage management
├── Utils/                # Utilities and extensions
└── Resources/            # Info.plist, assets
```

### Environment Variables

For development, set these environment variables or store in Keychain:

```bash
DEEPGRAM_API_KEY=your_key
ELEVENLABS_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
```

## Updates

pmkit automatically checks for updates on launch. When a new version is available, you'll be prompted to download and install it.

## Documentation

- [AGENTS.md](AGENTS.md) - Workflow documentation
- [LLM-INTEGRATION.md](LLM-INTEGRATION.md) - Claude LLM integration details

## License

Proprietary. © 2026 pmkit.
