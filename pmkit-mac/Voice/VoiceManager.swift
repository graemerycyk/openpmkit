import Foundation
import Combine
import AVFoundation
import AppKit

/// Coordinates the voice pipeline: STT → LLM → TTS
@MainActor
final class VoiceManager: ObservableObject {
    // MARK: - Published State

    @Published var state: VoiceState = .idle
    @Published var transcription: String = ""
    @Published var responseText: String = ""
    @Published var audioLevel: Float = 0
    @Published var lastArtifact: VoiceArtifact?
    @Published var connectedIntegrations: [String] = []

    // MARK: - Services

    private let audioRecorder = AudioRecorder()
    private let deepgram = DeepgramService()
    private let elevenLabs = ElevenLabsService()
    private var llmService: LLMService { LLMService.shared }

    /// Access to workflow manager (lazy to avoid circular dependency during init)
    private var workflowManager: WorkflowManager {
        AppState.shared.workflowManager
    }

    // MARK: - State

    private var cancellables = Set<AnyCancellable>()
    private var currentTask: Task<Void, Never>?

    // MARK: - Initialization

    init() {
        setupBindings()
    }

    private func setupBindings() {
        // Bind audio recorder level to published property
        audioRecorder.$audioLevel
            .receive(on: DispatchQueue.main)
            .assign(to: &$audioLevel)

        // Bind Deepgram transcription
        deepgram.$transcription
            .receive(on: DispatchQueue.main)
            .assign(to: &$transcription)
    }

    // MARK: - Public Methods

    func startListening() {
        guard state == .idle else { return }

        state = .listening
        transcription = ""
        responseText = ""

        // Play activation sound if enabled
        if Preferences.shared.playActivationSound {
            playActivationSound()
        }

        // Start recording
        Task {
            do {
                try await audioRecorder.startRecording()
                deepgram.startStreaming()

                // Stream audio data to Deepgram
                for await audioData in audioRecorder.audioDataStream {
                    deepgram.sendAudioData(audioData)
                }
            } catch {
                await MainActor.run {
                    state = .error(error.localizedDescription)
                }
            }
        }
    }

    func stopListening() {
        guard state == .listening else { return }

        // Play deactivation sound if enabled
        if Preferences.shared.playActivationSound {
            playDeactivationSound()
        }

        // Stop recording
        audioRecorder.stopRecording()
        deepgram.stopStreaming()

        // Process the transcription
        processTranscription()
    }

    func cancel() {
        currentTask?.cancel()
        currentTask = nil

        audioRecorder.stopRecording()
        deepgram.stopStreaming()
        elevenLabs.stopPlayback()

        state = .idle
        transcription = ""
        responseText = ""
    }

    func stopSpeaking() {
        elevenLabs.stopPlayback()
        state = .idle
    }

    /// Process text input directly (for testing or text-based commands)
    func processText(_ text: String) async {
        transcription = text
        await processInput(text)
    }

    /// Speak text using TTS
    func speakText(_ text: String) async {
        guard !Preferences.shared.silentMode else { return }

        state = .speaking

        do {
            try await elevenLabs.speak(text)
            await MainActor.run {
                state = .idle
            }
        } catch {
            await MainActor.run {
                state = .error(error.localizedDescription)
            }
        }
    }

    // MARK: - Private Methods

    private func processTranscription() {
        let text = transcription.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else {
            state = .idle
            return
        }

        currentTask = Task {
            await processInput(text)
        }
    }

    private func processInput(_ text: String) async {
        await MainActor.run {
            state = .processing
        }

        do {
            // Always use local Claude processing (OSS mode)
            try await processLocally(text)

            await MainActor.run {
                state = .idle
            }
        } catch {
            await MainActor.run {
                state = .error(error.localizedDescription)
                responseText = "Sorry, I encountered an error: \(error.localizedDescription)"
            }
        }
    }

    /// Process locally using the configured LLM provider
    private func processLocally(_ text: String) async throws {
        // Check if API key is available for the selected provider
        let provider = Preferences.shared.llmProvider
        guard TokenStorage.shared.hasAPIKey(for: provider) else {
            await MainActor.run {
                responseText = "Please set your \(provider.envVarName) environment variable or configure it in Settings to use pmkit."
            }
            return
        }

        let response = try await llmService.processVoiceCommand(text)

        await MainActor.run {
            responseText = response.text
        }

        // Handle function calls if any
        if let functionCall = response.functionCall {
            await handleFunctionCall(functionCall)
        }

        // Speak the response
        if !Preferences.shared.silentMode {
            await MainActor.run {
                state = .speaking
            }
            try await elevenLabs.speak(response.text)
        }
    }

    /// Save artifact to local storage
    private func saveArtifactLocally(_ artifact: VoiceArtifact, workflow: String?) {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd-HHmmss"
        let timestamp = dateFormatter.string(from: Date())
        let workflowName = workflow ?? "response"

        let folderName = "\(timestamp)-\(workflowName)"
        let basePath = AppState.shared.storageManager.basePath
        let folderPath = (basePath as NSString).appendingPathComponent(folderName)

        do {
            try FileManager.default.createDirectory(atPath: folderPath, withIntermediateDirectories: true)

            let mdPath = (folderPath as NSString).appendingPathComponent("output.md")
            try artifact.content.write(toFile: mdPath, atomically: true, encoding: .utf8)

            // Also save metadata JSON
            let metadata: [String: Any] = [
                "id": artifact.id,
                "title": artifact.title,
                "format": artifact.format,
                "workflow": workflow ?? "unknown",
                "timestamp": ISO8601DateFormatter().string(from: Date())
            ]
            let jsonPath = (folderPath as NSString).appendingPathComponent("metadata.json")
            let jsonData = try JSONSerialization.data(withJSONObject: metadata, options: .prettyPrinted)
            try jsonData.write(to: URL(fileURLWithPath: jsonPath))
        } catch {
            print("[VoiceManager] Failed to save artifact: \(error)")
        }
    }

    private func handleFunctionCall(_ call: FunctionCall) async {
        switch call.name {
        case "draft_prd":
            if let name = call.arguments["feature_name"] as? String,
               let description = call.arguments["description"] as? String {
                _ = await workflowManager.draftPRD(featureName: name, description: description)
            }

        case "open_history":
            let folder = call.arguments["folder"] as? String ?? "all"
            openHistory(folder: folder)

        case "open_settings":
            let section = call.arguments["section"] as? String
            openSettings(section: section)

        default:
            break
        }
    }

    private func openHistory(folder: String) {
        let basePath = AppState.shared.storageManager.basePath
        NSWorkspace.shared.open(URL(fileURLWithPath: basePath))
    }

    private func openSettings(section: String?) {
        // Post notification to open settings - handled by AppDelegate
        NotificationCenter.default.post(name: NSNotification.Name("OpenSettings"), object: section)
    }

    private func playActivationSound() {
        NSSound(named: "Pop")?.play()
    }

    private func playDeactivationSound() {
        NSSound(named: "Tink")?.play()
    }
}

// MARK: - Supporting Types

// FunctionCall and LLMResponse are defined in LLM/LLMService.swift
