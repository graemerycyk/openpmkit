import SwiftUI

struct TestItStep: View {
    @EnvironmentObject var appState: AppState
    let onComplete: () -> Void

    @State private var hasTestedVoice = false

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            // Icon
            ZStack {
                Circle()
                    .fill(Color.accentColor.opacity(0.1))
                    .frame(width: 120, height: 120)

                Image(systemName: hasTestedVoice ? "checkmark.circle.fill" : "mic.circle")
                    .font(.system(size: 64))
                    .foregroundColor(hasTestedVoice ? .green : .accentColor)
            }

            // Title
            VStack(spacing: 8) {
                Text(hasTestedVoice ? "You're Ready!" : "Try It Out")
                    .font(.title)
                    .fontWeight(.bold)

                Text(hasTestedVoice
                     ? "pmkit is set up and ready to use"
                     : "Test your voice input to make sure everything works")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }

            if !hasTestedVoice {
                // Test voice section
                VStack(spacing: 16) {
                    Text("Try saying:")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    Text("\"What's my brief?\"")
                        .font(.title3)
                        .fontWeight(.medium)
                        .padding()
                        .background(Color.secondary.opacity(0.1))
                        .cornerRadius(12)

                    // Voice input button
                    VoiceInputView()
                        .frame(width: 280)

                    // Transcription result
                    if !appState.currentTranscription.isEmpty {
                        VStack(spacing: 8) {
                            Text("You said:")
                                .font(.caption)
                                .foregroundColor(.secondary)

                            Text(appState.currentTranscription)
                                .font(.subheadline)
                                .padding()
                                .background(Color.green.opacity(0.1))
                                .cornerRadius(8)
                        }
                    }

                    // Response
                    if !appState.currentResponse.isEmpty {
                        VStack(spacing: 8) {
                            Text("Response:")
                                .font(.caption)
                                .foregroundColor(.secondary)

                            Text(appState.currentResponse)
                                .font(.subheadline)
                                .lineLimit(3)
                                .padding()
                                .background(Color.accentColor.opacity(0.1))
                                .cornerRadius(8)
                        }
                        .onAppear {
                            hasTestedVoice = true
                        }
                    }
                }
            } else {
                // Success tips
                VStack(alignment: .leading, spacing: 16) {
                    tipRow(
                        icon: "menubar.rectangle",
                        title: "Menu Bar",
                        description: "Click the pmkit icon in your menu bar anytime"
                    )

                    tipRow(
                        icon: "keyboard",
                        title: "Keyboard Shortcut",
                        description: "Press ⌘⇧P to activate voice input from anywhere"
                    )

                    tipRow(
                        icon: "folder",
                        title: "History",
                        description: "All briefs and PRDs are saved in ~/pmkit/"
                    )

                    tipRow(
                        icon: "gear",
                        title: "Settings",
                        description: "Access settings from the menu bar or ⌘,"
                    )
                }
                .padding(.horizontal, 60)
            }

            Spacer()

            // Navigation buttons
            HStack {
                if !hasTestedVoice {
                    Button("Skip") {
                        onComplete()
                    }
                    .buttonStyle(.plain)
                    .foregroundColor(.secondary)
                } else {
                    SettingsLink {
                        Label("Open Settings", systemImage: "gear")
                    }
                    .buttonStyle(.plain)
                }

                Spacer()

                Button(hasTestedVoice ? "Done" : "Complete Setup") {
                    onComplete()
                }
                .buttonStyle(.borderedProminent)
            }
            .padding(.horizontal, 80)
            .padding(.bottom, 40)
        }
    }

    private func tipRow(icon: String, title: String, description: String) -> some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(.accentColor)
                .frame(width: 32)

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)

                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()
        }
    }
}

#Preview {
    TestItStep(onComplete: {})
        .environmentObject(AppState.shared)
}
