import Foundation

/// Claude API service for processing voice commands
final class ClaudeService {
    // MARK: - Configuration

    private let model: String = "claude-sonnet-4-20250514"
    private let maxTokens: Int = 4096
    private let temperature: Double = 0.7

    // MARK: - State

    private var conversationManager = ConversationManager()

    // MARK: - Computed Properties

    /// Get API key fresh each time (allows env var changes to take effect)
    private var apiKey: String {
        TokenStorage.shared.getAnthropicAPIKey() ?? ""
    }

    // MARK: - Initialization

    init() {}

    // MARK: - Public Methods

    func processVoiceCommand(_ text: String) async throws -> ClaudeResponse {
        guard !apiKey.isEmpty else {
            throw ClaudeError.missingAPIKey
        }

        // Add user message to conversation
        conversationManager.addUserMessage(text)

        // Build request
        let request = try buildRequest()

        // Make API call
        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw ClaudeError.invalidResponse
        }

        guard httpResponse.statusCode == 200 else {
            if let errorJson = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let errorObj = errorJson["error"] as? [String: Any],
               let message = errorObj["message"] as? String {
                throw ClaudeError.apiError(message)
            }
            throw ClaudeError.apiError("HTTP \(httpResponse.statusCode)")
        }

        // Parse response
        let claudeApiResponse = try JSONDecoder().decode(ClaudeAPIResponse.self, from: data)

        // Extract text and function calls
        var responseText = ""
        var functionCall: FunctionCall?

        for content in claudeApiResponse.content {
            switch content.type {
            case "text":
                responseText = content.text ?? ""
            case "tool_use":
                if let name = content.name, let input = content.input {
                    functionCall = FunctionCall(name: name, arguments: input)
                }
            default:
                break
            }
        }

        // Add assistant message to conversation
        conversationManager.addAssistantMessage(responseText)

        return ClaudeResponse(text: responseText, functionCall: functionCall)
    }

    // MARK: - Private Methods

    private func buildRequest() throws -> URLRequest {
        let url = URL(string: "https://api.anthropic.com/v1/messages")!

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(apiKey, forHTTPHeaderField: "x-api-key")
        request.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")

        let systemPrompt = buildSystemPrompt()
        let messages = conversationManager.getMessages()
        let tools = FunctionDefinitions.allTools

        let body: [String: Any] = [
            "model": model,
            "max_tokens": maxTokens,
            "temperature": temperature,
            "system": systemPrompt,
            "messages": messages.map { message -> [String: Any] in
                ["role": message.role, "content": message.content]
            },
            "tools": tools
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        return request
    }

    private func buildSystemPrompt() -> String {
        return """
        You are pmkit, a voice-first AI assistant for product managers. This is the open-source local version running entirely on the user's machine.

        You help PMs with:
        - Thinking through product decisions and strategy
        - Drafting PRDs and requirements documents
        - Brainstorming features and solutions
        - Preparing for meetings with context and talking points
        - Analyzing product problems and trade-offs
        - Writing user stories and acceptance criteria

        Important guidelines:
        - Respond conversationally but concisely — your responses will be spoken aloud
        - Keep responses under 2 minutes of speaking time (~300 words) unless generating documents
        - When you don't have enough context, ask clarifying questions
        - Be direct and actionable in your advice

        Voice command patterns to recognize:
        - Help with tasks: "help me draft a PRD for [feature]", "brainstorm ideas for [problem]"
        - Meeting prep: "prep me for [meeting/person]", "help me prepare for [meeting]"
        - Document generation: "write user stories for [feature]", "draft requirements for [feature]"
        - Analysis: "what are the trade-offs of [approach]", "help me think through [problem]"
        - Utility: "show history", "open settings"

        This is a local-only app without external integrations, so focus on providing thoughtful PM guidance based on conversation context rather than fetching external data.
        """
    }
}

// MARK: - API Response Types

struct ClaudeAPIResponse: Codable {
    let id: String
    let type: String
    let role: String
    let content: [ClaudeContent]
    let model: String
    let stopReason: String?
    let usage: ClaudeUsage

    enum CodingKeys: String, CodingKey {
        case id, type, role, content, model
        case stopReason = "stop_reason"
        case usage
    }
}

struct ClaudeContent: Codable {
    let type: String
    let text: String?
    let id: String?
    let name: String?
    let input: [String: Any]?

    enum CodingKeys: String, CodingKey {
        case type, text, id, name, input
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        type = try container.decode(String.self, forKey: .type)
        text = try container.decodeIfPresent(String.self, forKey: .text)
        id = try container.decodeIfPresent(String.self, forKey: .id)
        name = try container.decodeIfPresent(String.self, forKey: .name)

        // Handle dynamic input object
        if let inputData = try? container.decodeIfPresent(Data.self, forKey: .input),
           let inputDict = try? JSONSerialization.jsonObject(with: inputData) as? [String: Any] {
            input = inputDict
        } else if container.contains(.input) {
            // Try to decode as a dictionary directly from the JSON
            input = try? container.decode([String: AnyCodable].self, forKey: .input).mapValues { $0.value }
        } else {
            input = nil
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(type, forKey: .type)
        try container.encodeIfPresent(text, forKey: .text)
        try container.encodeIfPresent(id, forKey: .id)
        try container.encodeIfPresent(name, forKey: .name)
        if let input = input {
            let data = try JSONSerialization.data(withJSONObject: input)
            try container.encode(data, forKey: .input)
        }
    }
}

struct ClaudeUsage: Codable {
    let inputTokens: Int
    let outputTokens: Int

    enum CodingKeys: String, CodingKey {
        case inputTokens = "input_tokens"
        case outputTokens = "output_tokens"
    }
}

// MARK: - Helper for decoding Any type

struct AnyCodable: Codable {
    let value: Any

    init(_ value: Any) {
        self.value = value
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if container.decodeNil() {
            value = NSNull()
        } else if let bool = try? container.decode(Bool.self) {
            value = bool
        } else if let int = try? container.decode(Int.self) {
            value = int
        } else if let double = try? container.decode(Double.self) {
            value = double
        } else if let string = try? container.decode(String.self) {
            value = string
        } else if let array = try? container.decode([AnyCodable].self) {
            value = array.map { $0.value }
        } else if let dict = try? container.decode([String: AnyCodable].self) {
            value = dict.mapValues { $0.value }
        } else {
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Cannot decode value")
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch value {
        case is NSNull:
            try container.encodeNil()
        case let bool as Bool:
            try container.encode(bool)
        case let int as Int:
            try container.encode(int)
        case let double as Double:
            try container.encode(double)
        case let string as String:
            try container.encode(string)
        case let array as [Any]:
            try container.encode(array.map { AnyCodable($0) })
        case let dict as [String: Any]:
            try container.encode(dict.mapValues { AnyCodable($0) })
        default:
            throw EncodingError.invalidValue(value, EncodingError.Context(codingPath: [], debugDescription: "Cannot encode value"))
        }
    }
}

// MARK: - Errors

enum ClaudeError: LocalizedError {
    case missingAPIKey
    case invalidResponse
    case apiError(String)
    case rateLimited

    var errorDescription: String? {
        switch self {
        case .missingAPIKey:
            return "Claude API key not configured"
        case .invalidResponse:
            return "Invalid response from Claude"
        case .apiError(let message):
            return "Claude API error: \(message)"
        case .rateLimited:
            return "Rate limited. Please try again in a moment."
        }
    }
}
