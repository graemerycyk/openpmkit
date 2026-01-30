import SwiftUI
import Combine

/// Global application state
@MainActor
final class AppState: ObservableObject {
    static let shared = AppState()

    // MARK: - Published State

    @Published var voiceState: VoiceState = .idle
    @Published var currentTranscription: String = ""
    @Published var currentResponse: String = ""
    @Published var lastError: String?

    // MARK: - Managers

    let voiceManager: VoiceManager
    let workflowManager: WorkflowManager
    let storageManager = LocalStorageManager()
    let conversationManager = ConversationManager()

    // MARK: - Menu Bar State

    var menuBarIcon: String {
        switch voiceState {
        case .idle:
            return "waveform.circle"
        case .listening:
            return "waveform.circle.fill"
        case .processing:
            return "arrow.trianglehead.2.clockwise.rotate.90.circle"
        case .speaking:
            return "speaker.wave.3.fill"
        case .error:
            return "exclamationmark.circle"
        }
    }

    // MARK: - API Keys Status

    var hasAnthropicKey: Bool {
        TokenStorage.shared.getAnthropicAPIKey() != nil
    }

    var hasDeepgramKey: Bool {
        TokenStorage.shared.getDeepgramAPIKey() != nil
    }

    var hasElevenLabsKey: Bool {
        TokenStorage.shared.getElevenLabsAPIKey() != nil
    }

    var isConfigured: Bool {
        hasAnthropicKey
    }

    // MARK: - Initialization

    private init() {
        // Initialize managers that have dependencies
        self.workflowManager = WorkflowManager(storageManager: storageManager)
        self.voiceManager = VoiceManager()

        setupBindings()
    }

    private func setupBindings() {
        // Bind voice manager state to app state
        voiceManager.$state
            .receive(on: DispatchQueue.main)
            .assign(to: &$voiceState)

        voiceManager.$transcription
            .receive(on: DispatchQueue.main)
            .assign(to: &$currentTranscription)

        voiceManager.$responseText
            .receive(on: DispatchQueue.main)
            .assign(to: &$currentResponse)
    }

    // MARK: - Voice Methods

    func startListening() {
        guard hasAnthropicKey else {
            showError("Please configure your Anthropic API key in Settings")
            return
        }

        voiceManager.startListening()
    }

    func stopListening() {
        voiceManager.stopListening()
    }

    func toggleListening() {
        if voiceState == .listening {
            stopListening()
        } else if voiceState == .idle {
            startListening()
        }
    }

    func cancelCurrentOperation() {
        voiceManager.cancel()
    }

    // MARK: - Error Handling

    func showError(_ message: String) {
        lastError = message
        DispatchQueue.main.asyncAfter(deadline: .now() + 5) { [weak self] in
            if self?.lastError == message {
                self?.lastError = nil
            }
        }
    }

    func clearError() {
        lastError = nil
    }
}

// MARK: - Supporting Types

enum VoiceState: Equatable {
    case idle
    case listening
    case processing
    case speaking
    case error(String)

    static func == (lhs: VoiceState, rhs: VoiceState) -> Bool {
        switch (lhs, rhs) {
        case (.idle, .idle), (.listening, .listening), (.processing, .processing), (.speaking, .speaking):
            return true
        case (.error(let a), .error(let b)):
            return a == b
        default:
            return false
        }
    }
}
