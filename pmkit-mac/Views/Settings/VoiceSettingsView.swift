import SwiftUI
import AVFoundation

struct VoiceSettingsView: View {
    @EnvironmentObject var appState: AppState
    @State private var silentMode: Bool = Preferences.shared.silentMode
    @State private var playActivationSound: Bool = Preferences.shared.playActivationSound
    @State private var selectedInputDevice: String = Preferences.shared.inputDeviceID ?? "default"
    @State private var selectedOutputDevice: String = Preferences.shared.outputDeviceID ?? "default"
    @State private var inputDevices: [AudioDevice] = []
    @State private var outputDevices: [AudioDevice] = []

    struct AudioDevice: Identifiable, Hashable {
        let id: String
        let name: String
    }

    var body: some View {
        Form {
            // Voice output section
            Section("Voice Output") {
                Toggle("Silent Mode", isOn: $silentMode)
                    .onChange(of: silentMode) { newValue in
                        Preferences.shared.silentMode = newValue
                    }

                Text("When enabled, responses are shown as text only — no voice output.")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            // Sound effects
            Section("Sound Effects") {
                Toggle("Play activation sound", isOn: $playActivationSound)
                    .onChange(of: playActivationSound) { newValue in
                        Preferences.shared.playActivationSound = newValue
                    }

                Text("Play a subtle sound when starting and stopping voice input.")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            // Input device
            Section("Input Device") {
                Picker("Microphone", selection: $selectedInputDevice) {
                    Text("System Default").tag("default")
                    ForEach(inputDevices) { device in
                        Text(device.name).tag(device.id)
                    }
                }
                .onChange(of: selectedInputDevice) { newValue in
                    Preferences.shared.inputDeviceID = newValue == "default" ? nil : newValue
                }

                Button("Test Microphone") {
                    testMicrophone()
                }
            }

            // Output device
            Section("Output Device") {
                Picker("Speaker", selection: $selectedOutputDevice) {
                    Text("System Default").tag("default")
                    ForEach(outputDevices) { device in
                        Text(device.name).tag(device.id)
                    }
                }
                .onChange(of: selectedOutputDevice) { newValue in
                    Preferences.shared.outputDeviceID = newValue == "default" ? nil : newValue
                }

                Button("Test Speaker") {
                    testSpeaker()
                }
            }

        }
        .formStyle(.grouped)
        .onAppear {
            loadAudioDevices()
        }
    }

    private func loadAudioDevices() {
        // In a real implementation, this would use AVFoundation to enumerate devices
        // For now, we'll use placeholder data
        inputDevices = [
            AudioDevice(id: "builtin-mic", name: "Built-in Microphone"),
            AudioDevice(id: "airpods", name: "AirPods Pro")
        ]

        outputDevices = [
            AudioDevice(id: "builtin-speaker", name: "Built-in Speakers"),
            AudioDevice(id: "airpods", name: "AirPods Pro")
        ]
    }

    private func testMicrophone() {
        // Would start recording and show level meter
        appState.showError("Microphone test: Listening for 3 seconds...")
    }

    private func testSpeaker() {
        // Would play a test sound
        Task {
            await appState.voiceManager.speakText("This is a test of the pmkit voice output.")
        }
    }
}

#Preview {
    VoiceSettingsView()
        .environmentObject(AppState.shared)
}
