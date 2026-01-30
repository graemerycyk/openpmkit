import Foundation

/// Multi-provider LLM service for processing voice commands
final class LLMService {
    // MARK: - Singleton

    static let shared = LLMService()

    // MARK: - Configuration

    private let maxTokens: Int = 4096
    private let temperature: Double = 0.7

    // MARK: - State

    private var conversationManager = ConversationManager()

    // MARK: - Computed Properties

    private var currentProvider: LLMProvider {
        Preferences.shared.llmProvider
    }

    private var currentModel: String {
        Preferences.shared.llmModelId
    }

    private var apiKey: String {
        TokenStorage.shared.getAPIKey(for: currentProvider) ?? ""
    }

    // MARK: - Initialization

    private init() {}

    // MARK: - Public Methods

    func processVoiceCommand(_ text: String) async throws -> LLMResponse {
        guard !apiKey.isEmpty else {
            throw LLMError.missingAPIKey(currentProvider)
        }

        // Add user message to conversation
        conversationManager.addUserMessage(text)

        // Route to appropriate provider
        let response: LLMResponse
        switch currentProvider {
        case .anthropic:
            response = try await callAnthropic(text)
        case .openai:
            response = try await callOpenAI(text)
        case .google:
            response = try await callGoogle(text)
        }

        // Add assistant message to conversation
        conversationManager.addAssistantMessage(response.text)

        return response
    }

    /// Validate an API key for a specific provider
    func validateAPIKey(_ key: String, for provider: LLMProvider) async throws -> Bool {
        guard !key.isEmpty else { return false }

        switch provider {
        case .anthropic:
            return try await validateAnthropicKey(key)
        case .openai:
            return try await validateOpenAIKey(key)
        case .google:
            return try await validateGoogleKey(key)
        }
    }

    func clearConversation() {
        conversationManager = ConversationManager()
    }

    // MARK: - Anthropic

    private func callAnthropic(_ text: String) async throws -> LLMResponse {
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
            "model": currentModel,
            "max_tokens": maxTokens,
            "temperature": temperature,
            "system": systemPrompt,
            "messages": messages.map { message -> [String: Any] in
                ["role": message.role, "content": message.content]
            },
            "tools": tools
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw LLMError.invalidResponse
        }

        guard httpResponse.statusCode == 200 else {
            throw try parseAnthropicError(data: data, statusCode: httpResponse.statusCode)
        }

        return try parseAnthropicResponse(data)
    }

    private func validateAnthropicKey(_ key: String) async throws -> Bool {
        let url = URL(string: "https://api.anthropic.com/v1/messages")!

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(key, forHTTPHeaderField: "x-api-key")
        request.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")

        let body: [String: Any] = [
            "model": "claude-sonnet-4-5-20250514",
            "max_tokens": 10,
            "messages": [["role": "user", "content": "Hi"]]
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (_, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            return false
        }

        // 200 = success, 400 = bad request (but key is valid)
        return httpResponse.statusCode == 200 || httpResponse.statusCode == 400
    }

    private func parseAnthropicResponse(_ data: Data) throws -> LLMResponse {
        struct AnthropicResponse: Codable {
            let content: [ContentBlock]

            struct ContentBlock: Codable {
                let type: String
                let text: String?
                let name: String?
            }
        }

        let response = try JSONDecoder().decode(AnthropicResponse.self, from: data)

        var responseText = ""
        var functionCall: FunctionCall?

        for content in response.content {
            if content.type == "text", let text = content.text {
                responseText = text
            } else if content.type == "tool_use", let name = content.name {
                // Parse tool input from raw JSON
                if let jsonData = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let contentArray = jsonData["content"] as? [[String: Any]] {
                    for block in contentArray where block["type"] as? String == "tool_use" {
                        if let input = block["input"] as? [String: Any] {
                            functionCall = FunctionCall(name: name, arguments: input)
                        }
                    }
                }
            }
        }

        return LLMResponse(text: responseText, functionCall: functionCall)
    }

    private func parseAnthropicError(data: Data, statusCode: Int) throws -> LLMError {
        if let errorJson = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let errorObj = errorJson["error"] as? [String: Any],
           let message = errorObj["message"] as? String {
            if statusCode == 429 {
                return .rateLimited
            }
            return .apiError(message)
        }
        return .apiError("HTTP \(statusCode)")
    }

    // MARK: - OpenAI

    private func callOpenAI(_ text: String) async throws -> LLMResponse {
        let url = URL(string: "https://api.openai.com/v1/chat/completions")!

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")

        let systemPrompt = buildSystemPrompt()
        var messages: [[String: Any]] = [
            ["role": "system", "content": systemPrompt]
        ]

        for msg in conversationManager.getMessages() {
            messages.append(["role": msg.role, "content": msg.content])
        }

        // Convert tools to OpenAI function format
        let tools = FunctionDefinitions.allTools.map { tool -> [String: Any] in
            [
                "type": "function",
                "function": [
                    "name": tool["name"] as? String ?? "",
                    "description": tool["description"] as? String ?? "",
                    "parameters": tool["input_schema"] as? [String: Any] ?? [:]
                ]
            ]
        }

        let body: [String: Any] = [
            "model": currentModel,
            "max_tokens": maxTokens,
            "temperature": temperature,
            "messages": messages,
            "tools": tools
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw LLMError.invalidResponse
        }

        guard httpResponse.statusCode == 200 else {
            throw try parseOpenAIError(data: data, statusCode: httpResponse.statusCode)
        }

        return try parseOpenAIResponse(data)
    }

    private func validateOpenAIKey(_ key: String) async throws -> Bool {
        let url = URL(string: "https://api.openai.com/v1/models")!

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(key)", forHTTPHeaderField: "Authorization")

        let (_, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            return false
        }

        return httpResponse.statusCode == 200
    }

    private func parseOpenAIResponse(_ data: Data) throws -> LLMResponse {
        struct OpenAIResponse: Codable {
            let choices: [Choice]

            struct Choice: Codable {
                let message: Message
            }

            struct Message: Codable {
                let content: String?
                let tool_calls: [ToolCall]?
            }

            struct ToolCall: Codable {
                let function: FunctionInfo
            }

            struct FunctionInfo: Codable {
                let name: String
                let arguments: String
            }
        }

        let response = try JSONDecoder().decode(OpenAIResponse.self, from: data)

        guard let choice = response.choices.first else {
            throw LLMError.invalidResponse
        }

        let responseText = choice.message.content ?? ""
        var functionCall: FunctionCall?

        if let toolCall = choice.message.tool_calls?.first {
            if let args = try? JSONSerialization.jsonObject(with: Data(toolCall.function.arguments.utf8)) as? [String: Any] {
                functionCall = FunctionCall(name: toolCall.function.name, arguments: args)
            }
        }

        return LLMResponse(text: responseText, functionCall: functionCall)
    }

    private func parseOpenAIError(data: Data, statusCode: Int) throws -> LLMError {
        if let errorJson = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let errorObj = errorJson["error"] as? [String: Any],
           let message = errorObj["message"] as? String {
            if statusCode == 429 {
                return .rateLimited
            }
            return .apiError(message)
        }
        return .apiError("HTTP \(statusCode)")
    }

    // MARK: - Google

    private func callGoogle(_ text: String) async throws -> LLMResponse {
        let baseURL = "https://generativelanguage.googleapis.com/v1beta/models/\(currentModel):generateContent"
        guard let url = URL(string: "\(baseURL)?key=\(apiKey)") else {
            throw LLMError.invalidResponse
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let systemPrompt = buildSystemPrompt()

        // Build contents array with conversation history
        var contents: [[String: Any]] = []

        // Add system instruction
        let systemInstruction: [String: Any] = [
            "parts": [["text": systemPrompt]]
        ]

        for msg in conversationManager.getMessages() {
            let role = msg.role == "assistant" ? "model" : "user"
            contents.append([
                "role": role,
                "parts": [["text": msg.content]]
            ])
        }

        // Convert tools to Google function format
        let functionDeclarations = FunctionDefinitions.allTools.map { tool -> [String: Any] in
            [
                "name": tool["name"] as? String ?? "",
                "description": tool["description"] as? String ?? "",
                "parameters": tool["input_schema"] as? [String: Any] ?? [:]
            ]
        }

        let body: [String: Any] = [
            "contents": contents,
            "systemInstruction": systemInstruction,
            "tools": [["functionDeclarations": functionDeclarations]],
            "generationConfig": [
                "maxOutputTokens": maxTokens,
                "temperature": temperature
            ]
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw LLMError.invalidResponse
        }

        guard httpResponse.statusCode == 200 else {
            throw try parseGoogleError(data: data, statusCode: httpResponse.statusCode)
        }

        return try parseGoogleResponse(data)
    }

    private func validateGoogleKey(_ key: String) async throws -> Bool {
        let url = URL(string: "https://generativelanguage.googleapis.com/v1beta/models?key=\(key)")!

        var request = URLRequest(url: url)
        request.httpMethod = "GET"

        let (_, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            return false
        }

        return httpResponse.statusCode == 200
    }

    private func parseGoogleResponse(_ data: Data) throws -> LLMResponse {
        struct GoogleResponse: Codable {
            let candidates: [Candidate]

            struct Candidate: Codable {
                let content: Content
            }

            struct Content: Codable {
                let parts: [Part]
            }

            struct Part: Codable {
                let text: String?
                let functionCall: FunctionCallInfo?
            }

            struct FunctionCallInfo: Codable {
                let name: String
                let args: [String: AnyCodableValue]?
            }
        }

        let response = try JSONDecoder().decode(GoogleResponse.self, from: data)

        guard let candidate = response.candidates.first else {
            throw LLMError.invalidResponse
        }

        var responseText = ""
        var functionCall: FunctionCall?

        for part in candidate.content.parts {
            if let text = part.text {
                responseText = text
            }
            if let fc = part.functionCall {
                let args = fc.args?.mapValues { $0.value } ?? [:]
                functionCall = FunctionCall(name: fc.name, arguments: args)
            }
        }

        return LLMResponse(text: responseText, functionCall: functionCall)
    }

    private func parseGoogleError(data: Data, statusCode: Int) throws -> LLMError {
        if let errorJson = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let errorObj = errorJson["error"] as? [String: Any],
           let message = errorObj["message"] as? String {
            if statusCode == 429 {
                return .rateLimited
            }
            return .apiError(message)
        }
        return .apiError("HTTP \(statusCode)")
    }

    // MARK: - System Prompt

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

// MARK: - Response Types

struct LLMResponse {
    let text: String
    let functionCall: FunctionCall?
}

struct FunctionCall {
    let name: String
    let arguments: [String: Any]
}

// MARK: - Errors

enum LLMError: LocalizedError {
    case missingAPIKey(LLMProvider)
    case invalidResponse
    case apiError(String)
    case rateLimited

    var errorDescription: String? {
        switch self {
        case .missingAPIKey(let provider):
            return "\(provider.displayName) API key not configured"
        case .invalidResponse:
            return "Invalid response from LLM"
        case .apiError(let message):
            return "API error: \(message)"
        case .rateLimited:
            return "Rate limited. Please try again in a moment."
        }
    }
}

// MARK: - Helper for decoding Any type from Google

struct AnyCodableValue: Codable {
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
        } else if let array = try? container.decode([AnyCodableValue].self) {
            value = array.map { $0.value }
        } else if let dict = try? container.decode([String: AnyCodableValue].self) {
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
            try container.encode(array.map { AnyCodableValue($0) })
        case let dict as [String: Any]:
            try container.encode(dict.mapValues { AnyCodableValue($0) })
        default:
            throw EncodingError.invalidValue(value, EncodingError.Context(codingPath: [], debugDescription: "Cannot encode value"))
        }
    }
}
