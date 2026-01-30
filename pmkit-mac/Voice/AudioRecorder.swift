import Foundation
import AVFoundation
import Combine

/// Captures audio from the microphone
final class AudioRecorder: NSObject, ObservableObject {
    // MARK: - Published State

    @Published var isRecording: Bool = false
    @Published var audioLevel: Float = 0
    @Published var error: Error?

    // MARK: - Audio Configuration

    private let sampleRate: Double = 16000
    private let channels: UInt32 = 1
    private let bitsPerSample: UInt32 = 16

    // MARK: - Audio Components

    private var audioEngine: AVAudioEngine?
    private var inputNode: AVAudioInputNode?

    // MARK: - Data Streaming

    private var audioDataContinuation: AsyncStream<Data>.Continuation?
    private(set) var audioDataStream: AsyncStream<Data>!

    // MARK: - Initialization

    override init() {
        super.init()
        setupAudioStream()
    }

    private func setupAudioStream() {
        audioDataStream = AsyncStream<Data> { continuation in
            self.audioDataContinuation = continuation
        }
    }

    // MARK: - Public Methods

    func startRecording() async throws {
        // Check microphone permission
        guard await checkMicrophonePermission() else {
            throw AudioRecorderError.permissionDenied
        }

        // Reset the stream for new recording
        setupAudioStream()

        // Setup audio engine
        audioEngine = AVAudioEngine()
        guard let audioEngine = audioEngine else {
            throw AudioRecorderError.setupFailed
        }

        inputNode = audioEngine.inputNode

        // Configure recording format
        let inputFormat = inputNode!.outputFormat(forBus: 0)
        let recordingFormat = AVAudioFormat(
            commonFormat: .pcmFormatInt16,
            sampleRate: sampleRate,
            channels: AVAudioChannelCount(channels),
            interleaved: true
        )!

        // Create format converter if needed
        let converter = AVAudioConverter(from: inputFormat, to: recordingFormat)

        // Install tap on input node
        inputNode!.installTap(onBus: 0, bufferSize: 4096, format: inputFormat) { [weak self] buffer, _ in
            guard let self = self else { return }

            // Update audio level
            self.updateAudioLevel(buffer: buffer)

            // Convert to target format
            if let converter = converter {
                let convertedBuffer = AVAudioPCMBuffer(
                    pcmFormat: recordingFormat,
                    frameCapacity: AVAudioFrameCount(recordingFormat.sampleRate * 0.1)
                )!

                var error: NSError?
                let status = converter.convert(to: convertedBuffer, error: &error) { inNumPackets, outStatus in
                    outStatus.pointee = .haveData
                    return buffer
                }

                if status == .haveData, let data = convertedBuffer.toData() {
                    self.audioDataContinuation?.yield(data)
                }
            } else if let data = buffer.toData() {
                self.audioDataContinuation?.yield(data)
            }
        }

        // Start audio engine
        try audioEngine.start()

        await MainActor.run {
            isRecording = true
        }
    }

    func stopRecording() {
        inputNode?.removeTap(onBus: 0)
        audioEngine?.stop()
        audioEngine = nil
        inputNode = nil

        audioDataContinuation?.finish()

        DispatchQueue.main.async {
            self.isRecording = false
            self.audioLevel = 0
        }
    }

    // MARK: - Private Methods

    private func checkMicrophonePermission() async -> Bool {
        switch AVCaptureDevice.authorizationStatus(for: .audio) {
        case .authorized:
            return true
        case .notDetermined:
            return await AVCaptureDevice.requestAccess(for: .audio)
        case .denied, .restricted:
            return false
        @unknown default:
            return false
        }
    }

    private func updateAudioLevel(buffer: AVAudioPCMBuffer) {
        guard let channelData = buffer.floatChannelData else { return }

        let channelDataValue = channelData.pointee
        let channelDataValueArray = stride(from: 0,
                                           to: Int(buffer.frameLength),
                                           by: buffer.stride).map { channelDataValue[$0] }

        let rms = sqrt(channelDataValueArray.map { $0 * $0 }.reduce(0, +) / Float(buffer.frameLength))
        let avgPower = 20 * log10(rms)

        // Normalize to 0-1 range
        let minDb: Float = -60
        let maxDb: Float = 0
        let normalizedLevel = max(0, min(1, (avgPower - minDb) / (maxDb - minDb)))

        DispatchQueue.main.async {
            self.audioLevel = normalizedLevel
        }
    }
}

// MARK: - Errors

enum AudioRecorderError: LocalizedError {
    case permissionDenied
    case setupFailed
    case recordingFailed

    var errorDescription: String? {
        switch self {
        case .permissionDenied:
            return "Microphone access denied. Please enable microphone access in System Preferences."
        case .setupFailed:
            return "Failed to setup audio recording"
        case .recordingFailed:
            return "Audio recording failed"
        }
    }
}

// MARK: - AVAudioPCMBuffer Extension

extension AVAudioPCMBuffer {
    func toData() -> Data? {
        let audioBuffer = self.audioBufferList.pointee.mBuffers
        return Data(bytes: audioBuffer.mData!, count: Int(audioBuffer.mDataByteSize))
    }
}
