# CLAUDE.md

> Configuration file for Claude Code when working on pmkit-mac (macOS menu bar app).

## Monorepo Context

This is `pmkit-mac`, part of the pmkit monorepo. See also:
- `../CLAUDE.md` - Cross-project context and shared concepts
- `../AGENTS.md` - API contracts between Mac app and backend
- `../TODO.md` - Cross-project task tracking
- `LLM-INTEGRATION.md` - Claude LLM integration details (function definitions, prompts)

## Quick Start

```bash
# Open in Xcode
open Package.swift

# Build and run
# ⌘R in Xcode
```

Requirements:
- Xcode 15.0+
- macOS 13.0+
- Swift 5.9+

## Project Structure

```
pmkit-mac/
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

## Key Principles

1. **Voice-First**: Every feature should be accessible by voice
2. **Local Artifacts**: Save outputs to `~/pmkit/` for offline access
3. **Backend Integration**: Use pmkit-web API for auth, subscriptions, workflow execution
4. **Native Feel**: Follow Apple HIG, use SwiftUI idioms

## Code Conventions

### SwiftUI Views

```swift
// Use @State for local state
// Use @StateObject for owned ObservableObjects
// Use @EnvironmentObject for shared state

struct ContentView: View {
    @StateObject private var viewModel = ContentViewModel()
    @EnvironmentObject var appState: AppState

    var body: some View {
        // ...
    }
}
```

### Async/Await

```swift
// Use Task for async operations in views
// Use async/await instead of completion handlers

func fetchData() async throws -> Data {
    let (data, _) = try await URLSession.shared.data(from: url)
    return data
}
```

### Error Handling

```swift
// Use Result type for operations that can fail
// Show user-friendly error messages via alerts

do {
    try await performOperation()
} catch {
    await MainActor.run {
        showError(error.localizedDescription)
    }
}
```

## Key Files

| Purpose | Location |
|---------|----------|
| App Entry | `App/pmkitApp.swift` |
| Menu Bar View | `Views/MenuBar/MenuBarView.swift` |
| Voice Recording | `Voice/VoiceRecorder.swift` |
| Claude Client | `LLM/ClaudeClient.swift` |
| Backend API | `Backend/PMKitAPI.swift` |
| Local Storage | `Storage/ArtifactStorage.swift` |
| Keychain | `Utils/KeychainHelper.swift` |

## Environment Variables (Development)

Set in Xcode scheme or store in Keychain:

```bash
DEEPGRAM_API_KEY=...       # Speech-to-text
ELEVENLABS_API_KEY=...     # Text-to-speech
ANTHROPIC_API_KEY=...      # Claude LLM
PMKIT_API_URL=...          # Backend URL (default: https://getpmkit.com)
```

## Voice Pipeline

```
Microphone → Deepgram STT → Claude LLM → ElevenLabs TTS → Speaker
                              ↓
                        Function Calls
                              ↓
                        pmkit Backend API
```

## Backend Integration

Mac app communicates with pmkit-web via REST API:

| Endpoint | Purpose |
|----------|---------|
| `POST /api/voice/process` | Process voice command |
| `GET /api/user/subscription` | Check subscription |
| `GET /api/connectors/status` | Get connected integrations |
| `POST /api/agents/{type}/trigger` | Trigger workflow |

See `../AGENTS.md` for full API contract details.

## Local Storage

Artifacts saved to `~/pmkit/`:

```
~/pmkit/
├── YYYY-MM-DD-HHMMSS-daily-brief/
│   ├── output.md
│   └── output.json
└── ...
```

## Testing

```bash
# Run tests in Xcode
# ⌘U

# Or via command line
xcodebuild test -scheme pmkit
```

## Deployment (Direct Download)

The app is distributed directly via the website, not the App Store.

### Build & Release Process

1. **Archive** in Xcode (Product → Archive)
2. **Export** with Developer ID signing
3. **Notarize** via `xcrun notarytool`
4. **Create DMG** with app bundle
5. **Upload** to getpmkit.com/download

### Code Signing Requirements

- Apple Developer Program membership
- Developer ID Application certificate
- Hardened Runtime enabled
- Notarization for Gatekeeper approval

### Auto-Updates (Sparkle)

The app uses Sparkle framework for automatic updates:
- Checks getpmkit.com for new versions
- Downloads and installs updates in background
- Appcast XML at getpmkit.com/appcast.xml

## Common Tasks

### Adding a New Voice Command

1. Add function definition to `LLM/FunctionDefinitions.swift`
2. Add handler in `Workflows/WorkflowManager.swift`
3. Update system prompt if needed
4. Test with voice input

### Adding a New Integration

1. Create client in `Integrations/{Name}Client.swift`
2. Add OAuth flow if needed
3. Register in `Integrations/IntegrationManager.swift`
4. Update backend API calls

### Adding a New View

1. Create view in appropriate `Views/` subfolder
2. Follow SwiftUI conventions
3. Use design system components
4. Add navigation if needed

## See Also

- `AGENTS.md` - Workflow documentation
- `LLM-INTEGRATION.md` - Claude LLM function definitions
- `README.md` - User-facing documentation
- `../CLAUDE.md` - Cross-project context
