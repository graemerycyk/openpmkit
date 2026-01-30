import Foundation
import Combine

/// Deepgram streaming speech-to-text service
final class DeepgramService: ObservableObject {
    // MARK: - Published State

    @Published var transcription: String = ""
    @Published var isConnected: Bool = false
    @Published var error: Error?

    // MARK: - Configuration

    private let apiKey: String
    private let model: String = "nova-2"
    private let language: String = "en-US"
    private let punctuate: Bool = true
    private let interimResults: Bool = true

    // MARK: - WebSocket

    private var webSocket: URLSessionWebSocketTask?
    private var urlSession: URLSession?
    private var receiveTask: Task<Void, Never>?

    // MARK: - State

    private var interimTranscription: String = ""
    private var finalTranscription: String = ""

    // MARK: - Initialization

    init() {
        self.apiKey = TokenStorage.shared.getDeepgramAPIKey() ?? ""
    }

    // MARK: - Public Methods

    func startStreaming() {
        guard !apiKey.isEmpty else {
            error = DeepgramError.missingAPIKey
            return
        }

        let urlString = buildWebSocketURL()
        guard let url = URL(string: urlString) else {
            error = DeepgramError.invalidURL
            return
        }

        // Create URL session with authorization header
        let config = URLSessionConfiguration.default
        config.httpAdditionalHeaders = ["Authorization": "Token \(apiKey)"]
        urlSession = URLSession(configuration: config)

        webSocket = urlSession?.webSocketTask(with: url)
        webSocket?.resume()

        isConnected = true
        transcription = ""
        interimTranscription = ""
        finalTranscription = ""

        // Start receiving messages
        startReceiving()
    }

    func stopStreaming() {
        // Send close message
        webSocket?.cancel(with: .normalClosure, reason: nil)
        webSocket = nil
        urlSession = nil
        receiveTask?.cancel()
        receiveTask = nil
        isConnected = false
    }

    func sendAudioData(_ data: Data) {
        guard isConnected else { return }

        webSocket?.send(.data(data)) { [weak self] error in
            if let error = error {
                DispatchQueue.main.async {
                    self?.error = error
                }
            }
        }
    }

    // MARK: - Private Methods

    private func buildWebSocketURL() -> String {
        var components = URLComponents()
        components.scheme = "wss"
        components.host = "api.deepgram.com"
        components.path = "/v1/listen"
        components.queryItems = [
            URLQueryItem(name: "model", value: model),
            URLQueryItem(name: "language", value: language),
            URLQueryItem(name: "punctuate", value: String(punctuate)),
            URLQueryItem(name: "interim_results", value: String(interimResults)),
            URLQueryItem(name: "encoding", value: "linear16"),
            URLQueryItem(name: "sample_rate", value: "16000"),
            URLQueryItem(name: "channels", value: "1")
        ]
        return components.url?.absoluteString ?? ""
    }

    private func startReceiving() {
        receiveTask = Task { [weak self] in
            while !Task.isCancelled {
                guard let self = self, let webSocket = self.webSocket else { break }

                do {
                    let message = try await webSocket.receive()
                    await self.handleMessage(message)
                } catch {
                    if !Task.isCancelled {
                        await MainActor.run {
                            self.error = error
                            self.isConnected = false
                        }
                    }
                    break
                }
            }
        }
    }

    @MainActor
    private func handleMessage(_ message: URLSessionWebSocketTask.Message) {
        switch message {
        case .string(let text):
            parseTranscriptResponse(text)
        case .data(let data):
            if let text = String(data: data, encoding: .utf8) {
                parseTranscriptResponse(text)
            }
        @unknown default:
            break
        }
    }

    private func parseTranscriptResponse(_ jsonString: String) {
        guard let data = jsonString.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let channel = json["channel"] as? [String: Any],
              let alternatives = channel["alternatives"] as? [[String: Any]],
              let firstAlt = alternatives.first,
              let transcript = firstAlt["transcript"] as? String else {
            return
        }

        let isFinal = json["is_final"] as? Bool ?? false

        if isFinal {
            // Append to final transcription
            if !transcript.isEmpty {
                if !finalTranscription.isEmpty {
                    finalTranscription += " "
                }
                finalTranscription += transcript
            }
            interimTranscription = ""
            transcription = finalTranscription
        } else {
            // Update interim transcription
            interimTranscription = transcript
            transcription = finalTranscription + (finalTranscription.isEmpty ? "" : " ") + interimTranscription
        }
    }
}

// MARK: - Errors

enum DeepgramError: LocalizedError {
    case missingAPIKey
    case invalidURL
    case connectionFailed
    case transcriptionFailed

    var errorDescription: String? {
        switch self {
        case .missingAPIKey:
            return "Deepgram API key not configured"
        case .invalidURL:
            return "Invalid Deepgram WebSocket URL"
        case .connectionFailed:
            return "Failed to connect to Deepgram"
        case .transcriptionFailed:
            return "Transcription failed"
        }
    }
}

// MARK: - Response Types

struct DeepgramResponse: Codable {
    let type: String?
    let channel: DeepgramChannel?
    let isFinal: Bool?

    enum CodingKeys: String, CodingKey {
        case type
        case channel
        case isFinal = "is_final"
    }
}

struct DeepgramChannel: Codable {
    let alternatives: [DeepgramAlternative]
}

struct DeepgramAlternative: Codable {
    let transcript: String
    let confidence: Double
    let words: [DeepgramWord]?
}

struct DeepgramWord: Codable {
    let word: String
    let start: Double
    let end: Double
    let confidence: Double
}
