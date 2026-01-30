import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        TabView {
            AccountSettingsView()
                .tabItem {
                    Label("API Keys", systemImage: "key")
                }

            VoiceSettingsView()
                .tabItem {
                    Label("Voice", systemImage: "waveform")
                }

            HotkeySettingsView()
                .tabItem {
                    Label("Hotkey", systemImage: "keyboard")
                }

            StorageSettingsView()
                .tabItem {
                    Label("Storage", systemImage: "folder")
                }

            AboutSettingsView()
                .tabItem {
                    Label("About", systemImage: "info.circle")
                }
        }
        .frame(width: 600, height: 450)
    }
}

#Preview {
    SettingsView()
        .environmentObject(AppState.shared)
}
