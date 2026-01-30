import Foundation

/// Manages conversation history for multi-turn interactions
final class ConversationManager {
    // MARK: - State

    private var messages: [Message] = []
    private var activeWorkflow: String?
    private var workflowContext: [String: Any] = [:]
    private var lastActivityAt: Date = Date()

    // MARK: - Configuration

    private let maxMessages: Int = 20
    private let expirationInterval: TimeInterval = 180  // 3 minutes

    // MARK: - Message Type

    struct Message {
        let role: String  // "user" or "assistant"
        let content: String
        let timestamp: Date

        init(role: String, content: String) {
            self.role = role
            self.content = content
            self.timestamp = Date()
        }
    }

    // MARK: - Public Methods

    func addUserMessage(_ content: String) {
        checkExpiration()
        messages.append(Message(role: "user", content: content))
        trimMessages()
        lastActivityAt = Date()
    }

    func addAssistantMessage(_ content: String) {
        messages.append(Message(role: "assistant", content: content))
        trimMessages()
        lastActivityAt = Date()
    }

    func getMessages() -> [Message] {
        checkExpiration()
        return messages
    }

    func setActiveWorkflow(_ workflow: String, context: [String: Any] = [:]) {
        activeWorkflow = workflow
        workflowContext = context
    }

    func clearActiveWorkflow() {
        activeWorkflow = nil
        workflowContext = [:]
    }

    func getActiveWorkflow() -> (name: String, context: [String: Any])? {
        guard let workflow = activeWorkflow else { return nil }
        return (workflow, workflowContext)
    }

    func updateWorkflowContext(_ updates: [String: Any]) {
        for (key, value) in updates {
            workflowContext[key] = value
        }
    }

    func clear() {
        messages = []
        activeWorkflow = nil
        workflowContext = [:]
        lastActivityAt = Date()
    }

    // MARK: - Private Methods

    private func checkExpiration() {
        let timeSinceLastActivity = Date().timeIntervalSince(lastActivityAt)
        if timeSinceLastActivity > expirationInterval {
            clear()
        }
    }

    private func trimMessages() {
        if messages.count > maxMessages {
            // Keep the first message (original context) and the most recent messages
            let keepFirst = 1
            let keepLast = maxMessages - keepFirst
            let firstMessages = Array(messages.prefix(keepFirst))
            let lastMessages = Array(messages.suffix(keepLast))
            messages = firstMessages + lastMessages
        }
    }
}

// MARK: - Conversation Context Builder

extension ConversationManager {
    /// Build context summary for long conversations
    func buildContextSummary() -> String {
        guard messages.count > 5 else { return "" }

        var summary = "Conversation context:\n"

        // Summarize earlier messages
        let earlierMessages = Array(messages.prefix(messages.count - 3))
        for message in earlierMessages {
            let truncated = String(message.content.prefix(100))
            summary += "- [\(message.role)]: \(truncated)...\n"
        }

        return summary
    }

    /// Check if user is likely following up on previous topic
    func isFollowUp(_ newMessage: String) -> Bool {
        let followUpIndicators = [
            "tell me more",
            "what about",
            "and also",
            "another thing",
            "that one",
            "this one",
            "the first one",
            "the second one",
            "yes",
            "no",
            "sure",
            "okay",
            "create a ticket for that",
            "send that to"
        ]

        let lowercased = newMessage.lowercased()
        return followUpIndicators.contains { lowercased.contains($0) }
    }

    /// Extract references from a follow-up message
    func resolveReferences(_ message: String) -> [String: Any] {
        var resolved: [String: Any] = [:]

        // Look for "that", "this", "it" references
        if message.lowercased().contains("that") || message.lowercased().contains("it") {
            // Find the most recent mentioned entity
            if let lastAssistantMessage = messages.last(where: { $0.role == "assistant" }) {
                // Extract ticket IDs, names, etc from previous response
                let ticketPattern = #"[A-Z]+-\d+"#
                if let regex = try? NSRegularExpression(pattern: ticketPattern),
                   let match = regex.firstMatch(
                       in: lastAssistantMessage.content,
                       range: NSRange(lastAssistantMessage.content.startIndex..., in: lastAssistantMessage.content)
                   ) {
                    let ticketId = String(lastAssistantMessage.content[Range(match.range, in: lastAssistantMessage.content)!])
                    resolved["referenced_ticket"] = ticketId
                }
            }
        }

        return resolved
    }
}

// MARK: - Persistence

extension ConversationManager {
    /// Save conversation to disk (for crash recovery)
    func save() {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601

        let data = ConversationData(
            messages: messages.map { SerializableMessage(role: $0.role, content: $0.content, timestamp: $0.timestamp) },
            activeWorkflow: activeWorkflow,
            lastActivityAt: lastActivityAt
        )

        if let encoded = try? encoder.encode(data) {
            let url = getConversationFileURL()
            try? encoded.write(to: url)
        }
    }

    /// Load conversation from disk
    func load() {
        let url = getConversationFileURL()
        guard let data = try? Data(contentsOf: url) else { return }

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601

        if let decoded = try? decoder.decode(ConversationData.self, from: data) {
            messages = decoded.messages.map { Message(role: $0.role, content: $0.content) }
            activeWorkflow = decoded.activeWorkflow
            lastActivityAt = decoded.lastActivityAt
        }
    }

    private func getConversationFileURL() -> URL {
        let cacheDir = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first!
        return cacheDir.appendingPathComponent("pmkit_conversation.json")
    }
}

// MARK: - Serializable Types

private struct ConversationData: Codable {
    let messages: [SerializableMessage]
    let activeWorkflow: String?
    let lastActivityAt: Date
}

private struct SerializableMessage: Codable {
    let role: String
    let content: String
    let timestamp: Date
}
