import SwiftUI
import AVFoundation

struct PreferencesStep: View {
    @EnvironmentObject var appState: AppState
    let onContinue: () -> Void
    let onBack: () -> Void

    @State private var selectedHotkey = "⌘⇧P"
    @State private var silentMode = false
    @State private var launchAtLogin = false
    @State private var selectedInputDevice: String = "Default"
    @State private var selectedOutputDevice: String = "Default"

    var body: some View {
        VStack(spacing: 24) {
            // Header
            VStack(spacing: 8) {
                Image(systemName: "gearshape.circle")
                    .font(.system(size: 48))
                    .foregroundColor(.accentColor)

                Text("Set Your Preferences")
                    .font(.title)
                    .fontWeight(.bold)

                Text("Configure hotkey, voice, and storage settings")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            .padding(.top, 24)

            // Settings sections
            ScrollView {
                VStack(spacing: 20) {
                    // Hotkey section
                    settingsSection(title: "Keyboard Shortcut", icon: "keyboard") {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Press and hold to activate voice input")
                                .font(.caption)
                                .foregroundColor(.secondary)

                            HStack {
                                Text(selectedHotkey)
                                    .font(.title3)
                                    .fontWeight(.medium)
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 8)
                                    .background(Color.secondary.opacity(0.1))
                                    .cornerRadius(8)

                                Spacer()

                                Button("Change") {
                                    // Would open hotkey recorder
                                }
                                .buttonStyle(.bordered)
                            }
                        }
                    }

                    // Voice section
                    settingsSection(title: "Voice Settings", icon: "waveform") {
                        VStack(alignment: .leading, spacing: 12) {
                            Toggle("Silent Mode (text only, no voice output)", isOn: $silentMode)
                                .onChange(of: silentMode) { newValue in
                                    Preferences.shared.silentMode = newValue
                                }

                            Divider()

                            HStack {
                                Text("Input Device")
                                    .foregroundColor(.secondary)
                                Spacer()
                                Picker("", selection: $selectedInputDevice) {
                                    Text("Default").tag("Default")
                                    // Would populate with actual devices
                                }
                                .frame(width: 200)
                            }

                            HStack {
                                Text("Output Device")
                                    .foregroundColor(.secondary)
                                Spacer()
                                Picker("", selection: $selectedOutputDevice) {
                                    Text("Default").tag("Default")
                                    // Would populate with actual devices
                                }
                                .frame(width: 200)
                            }
                        }
                    }

                    // Storage section
                    settingsSection(title: "Storage", icon: "folder") {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Artifacts are saved to:")
                                .font(.caption)
                                .foregroundColor(.secondary)

                            HStack {
                                Text(appState.storageManager.basePath)
                                    .font(.system(.caption, design: .monospaced))
                                    .lineLimit(1)
                                    .truncationMode(.middle)

                                Spacer()

                                Button("Open") {
                                    NSWorkspace.shared.open(URL(fileURLWithPath: appState.storageManager.basePath))
                                }
                                .buttonStyle(.bordered)
                            }
                        }
                    }

                    // Startup section
                    settingsSection(title: "Startup", icon: "power") {
                        Toggle("Launch pmkit at login", isOn: $launchAtLogin)
                            .onChange(of: launchAtLogin) { newValue in
                                Preferences.shared.launchAtLogin = newValue
                            }
                    }
                }
                .padding(.horizontal, 40)
            }

            // Navigation buttons
            HStack {
                Button("Back") {
                    onBack()
                }
                .buttonStyle(.bordered)

                Spacer()

                Button("Continue") {
                    savePreferences()
                    onContinue()
                }
                .buttonStyle(.borderedProminent)
            }
            .padding(.horizontal, 40)
            .padding(.bottom, 24)
        }
    }

    private func settingsSection<Content: View>(
        title: String,
        icon: String,
        @ViewBuilder content: () -> Content
    ) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .foregroundColor(.accentColor)
                Text(title)
                    .font(.headline)
            }

            content()
        }
        .padding()
        .background(Color.secondary.opacity(0.05))
        .cornerRadius(12)
    }

    private func savePreferences() {
        Preferences.shared.silentMode = silentMode
        Preferences.shared.launchAtLogin = launchAtLogin
    }
}

#Preview {
    PreferencesStep(onContinue: {}, onBack: {})
        .environmentObject(AppState.shared)
}
