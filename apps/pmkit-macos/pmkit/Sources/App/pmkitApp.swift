import SwiftUI

/// Main entry point for the pmkit Mac menu bar app.
/// Minimal version for debugging crash
@main
struct pmkitApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        // Settings window (opened via menu bar)
        Settings {
            SettingsView()
        }

        // Menu bar extra (the main UI)
        MenuBarExtra {
            MenuBarView()
        } label: {
            Image(systemName: "brain.head.profile")
        }
        .menuBarExtraStyle(.window)
    }
}
