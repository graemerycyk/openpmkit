# pmkit Mac TODO List

> Mac menu bar app tasks. For cross-project tasks, see `../TODO.md`.

Last updated: 2026-01-23

---

## 🚀 P0 - Blocking Release

| Task | Status | Notes |
|------|--------|-------|
| Code signing (Developer ID) | 🔲 Not Started | Required for direct download |
| Notarization | 🔲 Not Started | Required for Gatekeeper |
| DMG creation and hosting | 🔲 Not Started | Upload to getpmkit.com/download |

---

## 🎯 P1 - Core Features

| Task | Status | Notes |
|------|--------|-------|
| Backend API integration | ✅ Done | `PMKitAPIClient.processVoiceCommand()` and `processTextCommand()` |
| VoiceManager backend mode | ✅ Done | Auto-switches to backend when authenticated |
| OAuth token sync | 🔲 Not Started | Use web's OAuth tokens |
| Subscription check | 🔲 Not Started | Verify user has active subscription |
| Real connector data | ✅ Done | Backend API uses all 7 connectors |

---

## ✨ P2 - Polish

| Task | Status | Notes |
|------|--------|-------|
| Auto-update (Sparkle) | 🔲 Not Started | Check getpmkit.com for updates |
| Error monitoring | 🔲 Not Started | Crash reporting |
| Analytics | 🔲 Not Started | Usage tracking |
| Proactive notifications | 🔲 Not Started | Alert when something needs attention |
| Scheduled briefs | 🔲 Not Started | Automatic daily brief at user's time |

---

## 🔮 P3 - Future

| Task | Status | Notes |
|------|--------|-------|
| App Store submission | 🔲 Not Started | Optional distribution channel |
| iOS app | 🔲 Not Started | Mobile voice assistant |

---

## 🤖 Local AI Future

**Goal**: Eliminate cloud API costs by running models locally on Mac.

> **Note**: Local AI does NOT enable offline mode - pmkit still needs network to fetch integration data. Local AI eliminates LLM/TTS API costs only.

### Qwen3-TTS for Local TTS

Replace ElevenLabs with [Qwen3-TTS](https://github.com/QwenLM/Qwen3-TTS):

| Task | Status | Notes |
|------|--------|-------|
| Evaluate Qwen3-TTS **0.6B** on Apple Silicon | 🔲 Not Started | Fast model, test latency |
| Evaluate Qwen3-TTS **1.7B** on Apple Silicon | 🔲 Not Started | Quality model, test latency |
| Decide integration approach | 🔲 Not Started | Python bundle vs Core ML conversion |
| Implement Swift wrapper | 🔲 Not Started | Call from Swift |
| Add settings toggle (Cloud/Local TTS) | 🔲 Not Started | User preference |
| Test on M1, M2, M3, M4 | 🔲 Not Started | Performance matrix |

### Local LLM for Intent Recognition

Replace Claude with a local LLM:

| Task | Status | Notes |
|------|--------|-------|
| Evaluate local LLMs | 🔲 Not Started | Llama, Mistral, Qwen, Phi-3 |
| Benchmark on Apple Silicon | 🔲 Not Started | MLX or llama.cpp |
| Implement Swift wrapper | 🔲 Not Started | Use MLX-Swift or similar |
| Add settings toggle (Cloud/Local LLM) | 🔲 Not Started | User preference |
| Test accuracy vs Claude | 🔲 Not Started | Intent recognition quality |

### Target Architecture

```
Mac App (Fully Local AI)
├── Voice Input (Apple Speech or local Whisper)
├── Intent Recognition (Local LLM - Llama/Mistral/Qwen)
├── TTS Output (Qwen3-TTS 0.6B or 1.7B)
└── Network only for integration data fetch

Still Requires Network:
├── OAuth flows (Slack, Jira, etc.)
├── Integration data fetching
└── Complex analysis (optional cloud fallback)
```

### Model Sizes Reference

| Model | Size | Purpose | Expected Performance |
|-------|------|---------|---------------------|
| Qwen3-TTS 0.6B | ~1.2GB | Fast TTS | <100ms on M1+ |
| Qwen3-TTS 1.7B | ~3.4GB | Quality TTS | ~200ms on M1+ |
| Phi-3 Mini | ~2GB | Intent recognition | Fast, good accuracy |
| Llama 3 8B | ~4GB | Full LLM | Slower, highest quality |

---

## 📋 Implementation Notes

### Voice Pipeline (Current)
```
Mic → Deepgram (cloud) → Claude (cloud) → ElevenLabs (cloud) → Speaker
```

### Voice Pipeline (Future Local)
```
Mic → Apple Speech/Whisper → Local LLM → Qwen3-TTS → Speaker
       (local)               (local)     (local)
```

### Key Files to Modify for Local AI

| Component | Current File | Notes |
|-----------|--------------|-------|
| TTS | `Voice/TTSService.swift` | Add local provider option |
| LLM | `LLM/ClaudeClient.swift` | Add local LLM option |
| Settings | `Views/Settings/` | Add provider toggles |

---

## See Also

- `../TODO.md` - Cross-project tasks and Local AI roadmap
- `CLAUDE.md` - Development guide
- `LLM-INTEGRATION.md` - Current Claude integration
