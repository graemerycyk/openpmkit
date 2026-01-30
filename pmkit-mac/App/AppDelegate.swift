import AppKit
import SwiftUI

class AppDelegate: NSObject, NSApplicationDelegate {
    private var hotkeyManager: HotkeyManager?
    private var onboardingWindow: NSWindow?

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Hide dock icon - app lives in menu bar only
        NSApp.setActivationPolicy(.accessory)

        // Setup hotkey manager
        hotkeyManager = HotkeyManager.shared
        hotkeyManager?.registerHotkey()

        // Check if first launch - show onboarding to configure API keys
        if !Preferences.shared.hasCompletedOnboarding {
            showOnboarding()
        }

        // Listen for settings open requests
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(openSettings(_:)),
            name: NSNotification.Name("OpenSettings"),
            object: nil
        )
    }

    func applicationWillTerminate(_ notification: Notification) {
        hotkeyManager?.unregisterHotkey()
    }

    @objc private func openSettings(_ notification: Notification) {
        // Open settings window
        NSApp.sendAction(Selector(("showSettingsWindow:")), to: nil, from: nil)
    }

    @MainActor
    private func showOnboarding() {
        onboardingWindow = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 600, height: 500),
            styleMask: [.titled, .closable],
            backing: .buffered,
            defer: false
        )
        onboardingWindow?.title = "Welcome to pmkit"
        onboardingWindow?.center()
        let appState = AppState.shared
        onboardingWindow?.contentView = NSHostingView(rootView: OnboardingView().environmentObject(appState))
        onboardingWindow?.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }
}
