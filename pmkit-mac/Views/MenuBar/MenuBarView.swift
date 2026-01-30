import SwiftUI

struct MenuBarView: View {
    @EnvironmentObject var appState: AppState
    @State private var isHovering = false

    var body: some View {
        VStack(spacing: 0) {
            // Header
            headerSection

            Divider()

            // Main content - always show (no auth required)
            mainContent

            Divider()

            // Footer with quick actions
            footerSection
        }
        .frame(width: 320)
        .background(Color(NSColor.windowBackgroundColor))
    }

    // MARK: - Header Section

    private var headerSection: some View {
        HStack {
            Image(systemName: "waveform.circle.fill")
                .font(.title2)
                .foregroundColor(.accentColor)

            Text("pmkit")
                .font(.headline)

            Spacer()

            Text("OSS")
                .font(.caption)
                .padding(.horizontal, 8)
                .padding(.vertical, 2)
                .background(Color.blue.opacity(0.2))
                .foregroundColor(.blue)
                .cornerRadius(4)
        }
        .padding()
    }

    // MARK: - Main Content

    private var mainContent: some View {
        VStack(spacing: 16) {
            // Voice input section
            VoiceInputView()

            // Response section (shown when there's a response)
            if !appState.currentResponse.isEmpty {
                ResponseView()
            }

            // Error message
            if let error = appState.lastError {
                HStack {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundColor(.orange)
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Spacer()
                    Button {
                        appState.clearError()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.secondary)
                    }
                    .buttonStyle(.plain)
                }
                .padding(.horizontal)
                .padding(.vertical, 8)
                .background(Color.orange.opacity(0.1))
                .cornerRadius(8)
                .padding(.horizontal)
            }

            // Quick commands
            quickCommands
        }
        .padding(.vertical)
    }

    // MARK: - Quick Commands

    private var quickCommands: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Try saying:")
                .font(.caption)
                .foregroundColor(.secondary)
                .padding(.horizontal)

            ForEach(suggestedCommands, id: \.self) { command in
                Button {
                    // Simulate voice command
                    Task {
                        await appState.voiceManager.processText(command)
                    }
                } label: {
                    HStack {
                        Image(systemName: "waveform")
                            .font(.caption)
                        Text(command)
                            .font(.subheadline)
                        Spacer()
                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                    .background(isHovering ? Color.accentColor.opacity(0.1) : Color.clear)
                    .cornerRadius(6)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 8)
    }

    private var suggestedCommands: [String] {
        [
            "What's my brief?",
            "Prep me for my next meeting",
            "What are customers asking for?"
        ]
    }

    // MARK: - Footer Section

    private var footerSection: some View {
        HStack {
            Button {
                NSWorkspace.shared.open(URL(fileURLWithPath: appState.storageManager.basePath))
            } label: {
                Label("History", systemImage: "folder")
            }
            .buttonStyle(.plain)
            .font(.caption)

            Spacer()

            SettingsLink {
                Image(systemName: "gear")
            }
            .buttonStyle(.plain)

            Button {
                NSApplication.shared.terminate(nil)
            } label: {
                Image(systemName: "power")
            }
            .buttonStyle(.plain)
        }
        .padding()
    }
}

#Preview {
    MenuBarView()
        .environmentObject(AppState.shared)
}
