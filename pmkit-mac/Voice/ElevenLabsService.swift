import Foundation
import AVFoundation

/// ElevenLabs text-to-speech service
@MainActor
final class ElevenLabsService: NSObject, ObservableObject {
    // MARK: - Published State

    @Published var isSpeaking: Bool = false
    @Published var error: Error?

    // MARK: - Configuration

    private let apiKey: String
    private let voiceId: String = "21m00Tcm4TlvDq8ikWAM"  // Rachel voice
    private let modelId: String = "eleven_monolingual_v1"
    private let stability: Double = 0.5
    private let similarityBoost: Double = 0.75

    // MARK: - Audio

    private var audioPlayer: AVAudioPlayer?
    private var continuation: CheckedContinuation<Void, Error>?

    // MARK: - Initialization

    override init() {
        self.apiKey = TokenStorage.shared.getElevenLabsAPIKey() ?? ""
        super.init()
    }

    // MARK: - Public Methods

    func speak(_ text: String) async throws {
        guard !apiKey.isEmpty else {
            throw ElevenLabsError.missingAPIKey
        }

        guard !text.isEmpty else {
            return
        }

        // Generate audio from text
        let audioData = try await generateSpeech(text: text)

        // Play the audio
        try await playAudio(data: audioData)
    }

    func stopPlayback() {
        audioPlayer?.stop()
        audioPlayer = nil
        isSpeaking = false
        continuation?.resume(returning: ())
        continuation = nil
    }

    // MARK: - Private Methods

    private func generateSpeech(text: String) async throws -> Data {
        let url = URL(string: "https://api.elevenlabs.io/v1/text-to-speech/\(voiceId)")!

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(apiKey, forHTTPHeaderField: "xi-api-key")
        request.setValue("audio/mpeg", forHTTPHeaderField: "Accept")

        let body: [String: Any] = [
            "text": text,
            "model_id": modelId,
            "voice_settings": [
                "stability": stability,
                "similarity_boost": similarityBoost
            ]
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw ElevenLabsError.invalidResponse
        }

        guard httpResponse.statusCode == 200 else {
            // Try to parse error message
            if let errorJson = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let detail = errorJson["detail"] as? [String: Any],
               let message = detail["message"] as? String {
                throw ElevenLabsError.apiError(message)
            }
            throw ElevenLabsError.apiError("HTTP \(httpResponse.statusCode)")
        }

        return data
    }

    private func playAudio(data: Data) async throws {
        self.audioPlayer = try AVAudioPlayer(data: data)
        self.audioPlayer?.delegate = self
        self.audioPlayer?.prepareToPlay()

        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
            self.continuation = continuation
            self.isSpeaking = true
            self.audioPlayer?.play()
        }
    }
}

// MARK: - AVAudioPlayerDelegate

extension ElevenLabsService: AVAudioPlayerDelegate {
    nonisolated func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        Task { @MainActor in
            self.isSpeaking = false
            self.continuation?.resume(returning: ())
            self.continuation = nil
        }
    }

    nonisolated func audioPlayerDecodeErrorDidOccur(_ player: AVAudioPlayer, error: Error?) {
        Task { @MainActor in
            self.isSpeaking = false
            if let error = error {
                self.continuation?.resume(throwing: error)
            } else {
                self.continuation?.resume(throwing: ElevenLabsError.playbackFailed)
            }
            self.continuation = nil
        }
    }
}

// MARK: - Errors

enum ElevenLabsError: LocalizedError {
    case missingAPIKey
    case invalidResponse
    case apiError(String)
    case playbackFailed

    var errorDescription: String? {
        switch self {
        case .missingAPIKey:
            return "ElevenLabs API key not configured"
        case .invalidResponse:
            return "Invalid response from ElevenLabs"
        case .apiError(let message):
            return "ElevenLabs API error: \(message)"
        case .playbackFailed:
            return "Audio playback failed"
        }
    }
}

// MARK: - Voice Options

struct ElevenLabsVoice: Identifiable, Codable {
    let voiceId: String
    let name: String
    let category: String?
    let description: String?

    var id: String { voiceId }

    enum CodingKeys: String, CodingKey {
        case voiceId = "voice_id"
        case name
        case category
        case description
    }
}

// MARK: - Available Voices

extension ElevenLabsService {
    static let defaultVoices: [ElevenLabsVoice] = [
        ElevenLabsVoice(voiceId: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", category: "premade", description: "Calm, professional"),
        ElevenLabsVoice(voiceId: "AZnzlk1XvdvUeBnXmlld", name: "Domi", category: "premade", description: "Strong, confident"),
        ElevenLabsVoice(voiceId: "EXAVITQu4vr4xnSDxMaL", name: "Bella", category: "premade", description: "Soft, friendly"),
        ElevenLabsVoice(voiceId: "ErXwobaYiN019PkySvjV", name: "Antoni", category: "premade", description: "Well-rounded, warm"),
        ElevenLabsVoice(voiceId: "MF3mGyEYCl7XYWbV9V6O", name: "Elli", category: "premade", description: "Young, friendly"),
        ElevenLabsVoice(voiceId: "TxGEqnHWrfWFTfGW9XjX", name: "Josh", category: "premade", description: "Young, deep"),
        ElevenLabsVoice(voiceId: "VR6AewLTigWG4xSOukaG", name: "Arnold", category: "premade", description: "Crisp, confident"),
        ElevenLabsVoice(voiceId: "pNInz6obpgDQGcFmaJgB", name: "Adam", category: "premade", description: "Deep, narration")
    ]
}
