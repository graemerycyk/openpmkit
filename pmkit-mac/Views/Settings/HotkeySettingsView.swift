import SwiftUI
import Carbon

struct HotkeySettingsView: View {
    @EnvironmentObject var appState: AppState
    @State private var isRecordingHotkey = false
    @State private var currentHotkey = Preferences.shared.hotkeyDisplayString

    var body: some View {
        Form {
            // Current hotkey section
            Section("Keyboard Shortcut") {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Press and hold to activate voice input from anywhere.")
                        .font(.subheadline)
                        .foregroundColor(.secondary)

                    HStack {
                        // Hotkey display
                        HStack(spacing: 4) {
                            ForEach(hotkeyParts, id: \.self) { part in
                                Text(part)
                                    .font(.system(.title3, design: .rounded))
                                    .fontWeight(.medium)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 6)
                                    .background(Color.secondary.opacity(0.1))
                                    .cornerRadius(6)
                            }
                        }

                        Spacer()

                        if isRecordingHotkey {
                            HStack(spacing: 8) {
                                ProgressView()
                                    .scaleEffect(0.7)
                                Text("Press keys...")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }

                            Button("Cancel") {
                                isRecordingHotkey = false
                            }
                            .buttonStyle(.bordered)
                        } else {
                            Button("Change") {
                                startRecordingHotkey()
                            }
                            .buttonStyle(.bordered)
                        }
                    }
                }
            }

            // Preset shortcuts
            Section("Preset Shortcuts") {
                VStack(alignment: .leading, spacing: 8) {
                    presetButton("⌘⇧P", description: "Command + Shift + P (default)")
                    presetButton("⌥Space", description: "Option + Space")
                    presetButton("⌃⌘Space", description: "Control + Command + Space")
                    presetButton("F5", description: "Function 5")
                }
            }

            // Usage tips
            Section("Tips") {
                VStack(alignment: .leading, spacing: 8) {
                    tipRow(
                        icon: "hand.tap",
                        text: "Hold the shortcut while speaking, release to send"
                    )

                    tipRow(
                        icon: "menubar.rectangle",
                        text: "Or click the menu bar icon to open the voice UI"
                    )

                    tipRow(
                        icon: "exclamationmark.triangle",
                        text: "Avoid conflicts with system shortcuts"
                    )
                }
            }

            // Troubleshooting
            Section("Troubleshooting") {
                VStack(alignment: .leading, spacing: 8) {
                    Text("If the shortcut doesn't work:")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    HStack(spacing: 16) {
                        Button("Open Accessibility Settings") {
                            openAccessibilitySettings()
                        }

                        Button("Reset to Default") {
                            resetToDefault()
                        }
                    }
                }
            }
        }
        .formStyle(.grouped)
    }

    private var hotkeyParts: [String] {
        currentHotkey.components(separatedBy: "")
            .filter { !$0.isEmpty }
            .map { String($0) }
    }

    private func presetButton(_ shortcut: String, description: String) -> some View {
        Button {
            setPreset(shortcut)
        } label: {
            HStack {
                Text(shortcut)
                    .font(.system(.body, design: .monospaced))
                    .fontWeight(.medium)
                    .frame(width: 80, alignment: .leading)

                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)

                Spacer()

                if currentHotkey == shortcut {
                    Image(systemName: "checkmark")
                        .foregroundColor(.green)
                }
            }
        }
        .buttonStyle(.plain)
    }

    private func tipRow(icon: String, text: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(.accentColor)
                .frame(width: 24)

            Text(text)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }

    private func startRecordingHotkey() {
        isRecordingHotkey = true
        HotkeyManager.shared.startRecording { newHotkey in
            currentHotkey = newHotkey
            Preferences.shared.hotkeyDisplayString = newHotkey
            isRecordingHotkey = false
        }
    }

    private func setPreset(_ shortcut: String) {
        currentHotkey = shortcut
        Preferences.shared.hotkeyDisplayString = shortcut
        HotkeyManager.shared.registerHotkey()
    }

    private func resetToDefault() {
        setPreset("⌘⇧P")
    }

    private func openAccessibilitySettings() {
        if let url = URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility") {
            NSWorkspace.shared.open(url)
        }
    }
}

#Preview {
    HotkeySettingsView()
        .environmentObject(AppState.shared)
}
