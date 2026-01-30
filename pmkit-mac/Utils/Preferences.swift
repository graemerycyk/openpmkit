import Foundation

/// User preferences stored in UserDefaults
final class Preferences {
    // MARK: - Singleton

    static let shared = Preferences()

    // MARK: - Keys

    private enum Keys {
        static let hotkeyKeyCode = "hotkeyKeyCode"
        static let hotkeyModifiers = "hotkeyModifiers"
        static let hotkeyDisplayString = "hotkeyDisplayString"
        static let storageLocation = "storageLocation"
        static let silentMode = "silentMode"
        static let inputDeviceID = "inputDeviceID"
        static let outputDeviceID = "outputDeviceID"
        static let playActivationSound = "playActivationSound"
        static let defaultTicketTool = "defaultTicketTool"
        static let showInMenuBar = "showInMenuBar"
        static let launchAtLogin = "launchAtLogin"
        static let hasCompletedOnboarding = "hasCompletedOnboarding"
        static let llmProvider = "llmProvider"
        static let llmModel = "llmModel"
    }

    // MARK: - Initialization

    private let defaults = UserDefaults.standard

    private init() {
        registerDefaults()
    }

    private func registerDefaults() {
        let defaultPath = NSString(string: "~/pmkit").expandingTildeInPath

        defaults.register(defaults: [
            Keys.hotkeyKeyCode: 35,  // P key
            Keys.hotkeyModifiers: 768,  // Cmd + Shift
            Keys.hotkeyDisplayString: "⌘⇧P",
            Keys.storageLocation: defaultPath,
            Keys.silentMode: false,
            Keys.playActivationSound: true,
            Keys.defaultTicketTool: "auto",
            Keys.showInMenuBar: true,
            Keys.launchAtLogin: false,
            Keys.hasCompletedOnboarding: false,
            Keys.llmProvider: LLMProvider.anthropic.rawValue,
            Keys.llmModel: LLMProvider.anthropic.defaultModel.id
        ])
    }

    // MARK: - Hotkey Settings

    var hotkeyKeyCode: UInt32 {
        get { UInt32(defaults.integer(forKey: Keys.hotkeyKeyCode)) }
        set { defaults.set(Int(newValue), forKey: Keys.hotkeyKeyCode) }
    }

    var hotkeyModifiers: UInt32 {
        get { UInt32(defaults.integer(forKey: Keys.hotkeyModifiers)) }
        set { defaults.set(Int(newValue), forKey: Keys.hotkeyModifiers) }
    }

    var hotkeyDisplayString: String {
        get { defaults.string(forKey: Keys.hotkeyDisplayString) ?? "⌘⇧P" }
        set { defaults.set(newValue, forKey: Keys.hotkeyDisplayString) }
    }

    // MARK: - Storage Settings

    var storageLocation: String {
        get { defaults.string(forKey: Keys.storageLocation) ?? NSString(string: "~/pmkit").expandingTildeInPath }
        set { defaults.set(newValue, forKey: Keys.storageLocation) }
    }

    // MARK: - Voice Settings

    var silentMode: Bool {
        get { defaults.bool(forKey: Keys.silentMode) }
        set { defaults.set(newValue, forKey: Keys.silentMode) }
    }

    var inputDeviceID: String? {
        get { defaults.string(forKey: Keys.inputDeviceID) }
        set { defaults.set(newValue, forKey: Keys.inputDeviceID) }
    }

    var outputDeviceID: String? {
        get { defaults.string(forKey: Keys.outputDeviceID) }
        set { defaults.set(newValue, forKey: Keys.outputDeviceID) }
    }

    var playActivationSound: Bool {
        get { defaults.bool(forKey: Keys.playActivationSound) }
        set { defaults.set(newValue, forKey: Keys.playActivationSound) }
    }

    // MARK: - Ticket Settings

    var defaultTicketTool: String {
        get { defaults.string(forKey: Keys.defaultTicketTool) ?? "auto" }
        set { defaults.set(newValue, forKey: Keys.defaultTicketTool) }
    }

    // MARK: - App Settings

    var showInMenuBar: Bool {
        get { defaults.bool(forKey: Keys.showInMenuBar) }
        set { defaults.set(newValue, forKey: Keys.showInMenuBar) }
    }

    var launchAtLogin: Bool {
        get { defaults.bool(forKey: Keys.launchAtLogin) }
        set {
            defaults.set(newValue, forKey: Keys.launchAtLogin)
            updateLaunchAtLogin(enabled: newValue)
        }
    }

    var hasCompletedOnboarding: Bool {
        get { defaults.bool(forKey: Keys.hasCompletedOnboarding) }
        set { defaults.set(newValue, forKey: Keys.hasCompletedOnboarding) }
    }

    // MARK: - LLM Settings

    var llmProvider: LLMProvider {
        get {
            guard let rawValue = defaults.string(forKey: Keys.llmProvider),
                  let provider = LLMProvider(rawValue: rawValue) else {
                return .anthropic
            }
            return provider
        }
        set {
            defaults.set(newValue.rawValue, forKey: Keys.llmProvider)
            // Update model to default for new provider if current model isn't compatible
            if !newValue.models.contains(where: { $0.id == llmModelId }) {
                llmModelId = newValue.defaultModel.id
            }
        }
    }

    var llmModelId: String {
        get { defaults.string(forKey: Keys.llmModel) ?? llmProvider.defaultModel.id }
        set { defaults.set(newValue, forKey: Keys.llmModel) }
    }

    /// Get the currently selected LLM model
    var llmModel: LLMModel {
        llmProvider.models.first { $0.id == llmModelId } ?? llmProvider.defaultModel
    }

    // MARK: - Methods

    func reset() {
        let domain = Bundle.main.bundleIdentifier!
        defaults.removePersistentDomain(forName: domain)
        registerDefaults()
    }

    // MARK: - Launch at Login

    private func updateLaunchAtLogin(enabled: Bool) {
        // Uses SMAppService in modern macOS
        // Implementation would use ServiceManagement framework
        // For now, this is a placeholder

        #if os(macOS)
        // Would use SMAppService.mainApp.register() / unregister()
        #endif
    }
}
