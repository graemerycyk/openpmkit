import Foundation
import Security

/// Secure storage for API keys using Keychain
final class TokenStorage {
    // MARK: - Singleton

    static let shared = TokenStorage()

    // MARK: - Keys

    private let deepgramAPIKeyKey = "com.pmkit.deepgramAPIKey"
    private let elevenLabsAPIKeyKey = "com.pmkit.elevenLabsAPIKey"
    private let anthropicAPIKeyKey = "com.pmkit.anthropicAPIKey"
    private let openaiAPIKeyKey = "com.pmkit.openaiAPIKey"
    private let googleAPIKeyKey = "com.pmkit.googleAPIKey"

    // MARK: - Initialization

    private init() {}

    // MARK: - API Keys

    func saveDeepgramAPIKey(_ key: String) {
        save(key: deepgramAPIKeyKey, value: key)
    }

    func getDeepgramAPIKey() -> String? {
        // Check environment first, then keychain
        if let envKey = ProcessInfo.processInfo.environment["DEEPGRAM_API_KEY"] {
            return envKey
        }
        return get(key: deepgramAPIKeyKey)
    }

    func clearDeepgramAPIKey() {
        delete(key: deepgramAPIKeyKey)
    }

    func saveElevenLabsAPIKey(_ key: String) {
        save(key: elevenLabsAPIKeyKey, value: key)
    }

    func getElevenLabsAPIKey() -> String? {
        if let envKey = ProcessInfo.processInfo.environment["ELEVENLABS_API_KEY"] {
            return envKey
        }
        return get(key: elevenLabsAPIKeyKey)
    }

    func clearElevenLabsAPIKey() {
        delete(key: elevenLabsAPIKeyKey)
    }

    func saveAnthropicAPIKey(_ key: String) {
        save(key: anthropicAPIKeyKey, value: key)
    }

    func getAnthropicAPIKey() -> String? {
        if let envKey = ProcessInfo.processInfo.environment["ANTHROPIC_API_KEY"] {
            return envKey
        }
        return get(key: anthropicAPIKeyKey)
    }

    func clearAnthropicAPIKey() {
        delete(key: anthropicAPIKeyKey)
    }

    // MARK: - OpenAI API Key

    func saveOpenAIAPIKey(_ key: String) {
        save(key: openaiAPIKeyKey, value: key)
    }

    func getOpenAIAPIKey() -> String? {
        if let envKey = ProcessInfo.processInfo.environment["OPENAI_API_KEY"] {
            return envKey
        }
        return get(key: openaiAPIKeyKey)
    }

    func clearOpenAIAPIKey() {
        delete(key: openaiAPIKeyKey)
    }

    // MARK: - Google API Key

    func saveGoogleAPIKey(_ key: String) {
        save(key: googleAPIKeyKey, value: key)
    }

    func getGoogleAPIKey() -> String? {
        if let envKey = ProcessInfo.processInfo.environment["GOOGLE_API_KEY"] {
            return envKey
        }
        return get(key: googleAPIKeyKey)
    }

    func clearGoogleAPIKey() {
        delete(key: googleAPIKeyKey)
    }

    // MARK: - Provider-based API Key Access

    /// Get API key for a specific LLM provider
    func getAPIKey(for provider: LLMProvider) -> String? {
        switch provider {
        case .anthropic:
            return getAnthropicAPIKey()
        case .openai:
            return getOpenAIAPIKey()
        case .google:
            return getGoogleAPIKey()
        }
    }

    /// Save API key for a specific LLM provider
    func saveAPIKey(_ key: String, for provider: LLMProvider) {
        switch provider {
        case .anthropic:
            saveAnthropicAPIKey(key)
        case .openai:
            saveOpenAIAPIKey(key)
        case .google:
            saveGoogleAPIKey(key)
        }
    }

    /// Check if API key exists for a specific LLM provider
    func hasAPIKey(for provider: LLMProvider) -> Bool {
        getAPIKey(for: provider) != nil
    }

    /// Clear API key for a specific LLM provider
    func clearAPIKey(for provider: LLMProvider) {
        switch provider {
        case .anthropic:
            clearAnthropicAPIKey()
        case .openai:
            clearOpenAIAPIKey()
        case .google:
            clearGoogleAPIKey()
        }
    }

    /// Clear all stored API keys
    func clearAllKeys() {
        delete(key: deepgramAPIKeyKey)
        delete(key: elevenLabsAPIKeyKey)
        delete(key: anthropicAPIKeyKey)
        delete(key: openaiAPIKeyKey)
        delete(key: googleAPIKeyKey)
    }

    // MARK: - Keychain Operations

    private func save(key: String, value: String) {
        let data = value.data(using: .utf8)!

        // Delete existing item first
        delete(key: key)

        // Add new item
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
        ]

        SecItemAdd(query as CFDictionary, nil)
    }

    private func get(key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var dataTypeRef: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &dataTypeRef)

        guard status == errSecSuccess,
              let data = dataTypeRef as? Data,
              let value = String(data: data, encoding: .utf8) else {
            return nil
        }

        return value
    }

    private func delete(key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ]

        SecItemDelete(query as CFDictionary)
    }
}
