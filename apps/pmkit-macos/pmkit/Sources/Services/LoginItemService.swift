import Foundation
import ServiceManagement

/// Service for managing Launch at Login functionality
/// Uses SMAppService (requires macOS 13+ and a proper .app bundle)
@MainActor
final class LoginItemService {
    static let shared = LoginItemService()

    /// Cache the bundle check result
    private let canUseServiceManagement: Bool

    private init() {
        // Check once at init time whether we can use SMAppService
        // This avoids repeated checks and ensures consistency
        self.canUseServiceManagement = Self.checkIfProperlyBundled()
        if !canUseServiceManagement {
            print("[LoginItem] SMAppService unavailable - running from development environment")
        }
    }

    /// Check if the app is properly bundled (required for SMAppService)
    private static func checkIfProperlyBundled() -> Bool {
        // First, check we have a bundle identifier
        guard let bundleId = Bundle.main.bundleIdentifier,
              !bundleId.isEmpty else {
            return false
        }

        let bundlePath = Bundle.main.bundlePath

        // Check for DerivedData (Xcode debug builds via SPM)
        if bundlePath.contains("DerivedData") {
            return false
        }

        // Check for Build/Products (also Xcode builds)
        if bundlePath.contains("Build/Products") {
            return false
        }

        // Check that we have a proper .app bundle
        if !bundlePath.hasSuffix(".app") {
            return false
        }

        return true
    }

    /// Whether the app is currently registered as a login item
    /// Returns false if unable to check (e.g., running from Xcode/development)
    var isEnabled: Bool {
        guard canUseServiceManagement else {
            return false
        }
        return SMAppService.mainApp.status == .enabled
    }

    /// Enable or disable launch at login
    func setEnabled(_ enabled: Bool) throws {
        guard canUseServiceManagement else {
            print("[LoginItem] Cannot manage login items - not running from a proper .app bundle")
            return
        }

        let service = SMAppService.mainApp

        if enabled {
            try service.register()
        } else {
            try service.unregister()
        }

        // Update config to match
        var config = ConfigService.shared.config
        config.launchAtLogin = enabled
        ConfigService.shared.config = config

        print("[LoginItem] Launch at login: \(enabled ? "enabled" : "disabled")")
    }
}

// MARK: - Errors

enum LoginItemError: LocalizedError {
    case failedToAccessLoginItems
    case failedToAdd
    case failedToRemove

    var errorDescription: String? {
        switch self {
        case .failedToAccessLoginItems:
            return "Failed to access login items list"
        case .failedToAdd:
            return "Failed to add app to login items"
        case .failedToRemove:
            return "Failed to remove app from login items"
        }
    }
}
