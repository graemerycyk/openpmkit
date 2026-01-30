import SwiftUI

struct VoiceInputView: View {
    @EnvironmentObject var appState: AppState
    @State private var isPressing = false

    var body: some View {
        VStack(spacing: 12) {
            // Status indicator
            statusIndicator

            // Waveform or button
            mainInteractionArea

            // Transcription (when listening)
            if appState.voiceState == .listening && !appState.currentTranscription.isEmpty {
                transcriptionView
            }

            // Keyboard shortcut hint
            shortcutHint
        }
        .padding(.horizontal)
    }

    // MARK: - Status Indicator

    private var statusIndicator: some View {
        HStack(spacing: 8) {
            Circle()
                .fill(statusColor)
                .frame(width: 8, height: 8)
                .overlay(
                    Circle()
                        .stroke(statusColor.opacity(0.5), lineWidth: 2)
                        .scaleEffect(appState.voiceState == .listening ? 1.5 : 1)
                        .opacity(appState.voiceState == .listening ? 0 : 1)
                        .animation(
                            appState.voiceState == .listening ?
                                Animation.easeOut(duration: 1).repeatForever(autoreverses: false) :
                                .default,
                            value: appState.voiceState
                        )
                )

            Text(statusText)
                .font(.caption)
                .foregroundColor(.secondary)

            Spacer()

            if appState.voiceState == .listening || appState.voiceState == .processing || appState.voiceState == .speaking {
                Button {
                    appState.cancelCurrentOperation()
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.secondary)
                }
                .buttonStyle(.plain)
                .help("Cancel")
            }
        }
    }

    private var statusColor: Color {
        switch appState.voiceState {
        case .idle:
            return .gray
        case .listening:
            return .red
        case .processing:
            return .orange
        case .speaking:
            return .green
        case .error:
            return .red
        }
    }

    private var statusText: String {
        switch appState.voiceState {
        case .idle:
            return "Ready"
        case .listening:
            return "Listening..."
        case .processing:
            return "Processing..."
        case .speaking:
            return "Speaking..."
        case .error(let message):
            return message
        }
    }

    // MARK: - Main Interaction Area

    private var mainInteractionArea: some View {
        Button {
            // Toggle handled by gesture
        } label: {
            ZStack {
                // Background
                RoundedRectangle(cornerRadius: 16)
                    .fill(buttonBackgroundColor)
                    .frame(height: 64)

                // Content
                HStack(spacing: 12) {
                    if appState.voiceState == .listening {
                        WaveformView()
                            .frame(width: 100, height: 40)
                    } else if appState.voiceState == .processing {
                        ProgressView()
                            .scaleEffect(0.8)
                    } else {
                        Image(systemName: "mic.fill")
                            .font(.title2)
                    }

                    Text(buttonText)
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
                .foregroundColor(buttonForegroundColor)
            }
        }
        .buttonStyle(.plain)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in
                    if !isPressing && appState.voiceState == .idle {
                        isPressing = true
                        appState.startListening()
                    }
                }
                .onEnded { _ in
                    if isPressing {
                        isPressing = false
                        appState.stopListening()
                    }
                }
        )
        .disabled(appState.voiceState == .processing || appState.voiceState == .speaking)
    }

    private var buttonBackgroundColor: Color {
        switch appState.voiceState {
        case .idle:
            return Color.accentColor.opacity(isPressing ? 0.8 : 1)
        case .listening:
            return Color.red.opacity(0.9)
        case .processing, .speaking:
            return Color.secondary.opacity(0.2)
        case .error:
            return Color.red.opacity(0.2)
        }
    }

    private var buttonForegroundColor: Color {
        switch appState.voiceState {
        case .idle, .listening:
            return .white
        case .processing, .speaking, .error:
            return .primary
        }
    }

    private var buttonText: String {
        switch appState.voiceState {
        case .idle:
            return "Hold to Talk"
        case .listening:
            return "Release to Send"
        case .processing:
            return "Thinking..."
        case .speaking:
            return "Speaking..."
        case .error:
            return "Try Again"
        }
    }

    // MARK: - Transcription View

    private var transcriptionView: some View {
        HStack {
            Text(appState.currentTranscription)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .lineLimit(2)

            Spacer()
        }
        .padding(12)
        .background(Color.secondary.opacity(0.1))
        .cornerRadius(8)
    }

    // MARK: - Shortcut Hint

    private var shortcutHint: some View {
        HStack(spacing: 4) {
            Text("or press")
                .font(.caption2)
                .foregroundColor(.secondary)

            HStack(spacing: 2) {
                Text("⌘")
                Text("⇧")
                Text("P")
            }
            .font(.caption2)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(Color.secondary.opacity(0.1))
            .cornerRadius(4)
        }
    }
}

#Preview {
    VoiceInputView()
        .environmentObject(AppState.shared)
        .frame(width: 300)
        .padding()
}
