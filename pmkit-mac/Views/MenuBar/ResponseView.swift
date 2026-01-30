import SwiftUI

struct ResponseView: View {
    @EnvironmentObject var appState: AppState
    @State private var isExpanded = false

    private let maxCollapsedHeight: CGFloat = 120

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Header
            HStack {
                Image(systemName: "sparkles")
                    .foregroundColor(.accentColor)

                Text("Response")
                    .font(.caption)
                    .fontWeight(.medium)

                Spacer()

                if appState.voiceState == .speaking {
                    Button {
                        appState.voiceManager.stopSpeaking()
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "stop.fill")
                            Text("Stop")
                        }
                        .font(.caption)
                        .foregroundColor(.orange)
                    }
                    .buttonStyle(.plain)
                }

                Button {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        isExpanded.toggle()
                    }
                } label: {
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .buttonStyle(.plain)
            }

            // Response text
            ScrollView {
                Text(appState.currentResponse)
                    .font(.subheadline)
                    .textSelection(.enabled)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .frame(maxHeight: isExpanded ? 300 : maxCollapsedHeight)

            // Actions
            HStack(spacing: 12) {
                Button {
                    copyToClipboard()
                } label: {
                    Label("Copy", systemImage: "doc.on.doc")
                        .font(.caption)
                }
                .buttonStyle(.plain)
                .foregroundColor(.secondary)

                Button {
                    replayResponse()
                } label: {
                    Label("Replay", systemImage: "speaker.wave.2")
                        .font(.caption)
                }
                .buttonStyle(.plain)
                .foregroundColor(.secondary)

                Spacer()

                Button {
                    clearResponse()
                } label: {
                    Label("Clear", systemImage: "xmark")
                        .font(.caption)
                }
                .buttonStyle(.plain)
                .foregroundColor(.secondary)
            }
        }
        .padding(12)
        .background(Color.secondary.opacity(0.05))
        .cornerRadius(12)
        .padding(.horizontal)
    }

    private func copyToClipboard() {
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(appState.currentResponse, forType: .string)
    }

    private func replayResponse() {
        Task {
            await appState.voiceManager.speakText(appState.currentResponse)
        }
    }

    private func clearResponse() {
        withAnimation {
            appState.currentResponse = ""
        }
    }
}

#Preview {
    ResponseView()
        .environmentObject(AppState.shared)
        .frame(width: 300)
        .padding()
}
