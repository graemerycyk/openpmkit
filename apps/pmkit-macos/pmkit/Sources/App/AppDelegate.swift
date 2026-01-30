import Cocoa
import SwiftUI
import UserNotifications

/// AppDelegate - minimal version for debugging
class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        // Hide dock icon (menu bar only app)
        NSApp.setActivationPolicy(.accessory)
        print("[AppDelegate] Launched successfully")
    }

    func applicationWillTerminate(_ notification: Notification) {
        print("[AppDelegate] Terminating")
    }
}

// MARK: - Notification Names

extension Notification.Name {
    static let openArtifact = Notification.Name("openArtifact")
    static let openReAuth = Notification.Name("openReAuth")
    static let jobCompleted = Notification.Name("jobCompleted")
    static let connectionStatusChanged = Notification.Name("connectionStatusChanged")
}
