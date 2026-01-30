import Foundation

/// Available LLM providers
enum LLMProvider: String, CaseIterable, Codable, Identifiable {
    case anthropic
    case openai
    case google

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .anthropic: return "Anthropic"
        case .openai: return "OpenAI"
        case .google: return "Google"
        }
    }

    var iconName: String {
        switch self {
        case .anthropic: return "brain.head.profile"
        case .openai: return "sparkles"
        case .google: return "globe"
        }
    }

    var apiKeyPrefix: String {
        switch self {
        case .anthropic: return "sk-ant-"
        case .openai: return "sk-"
        case .google: return "AI"
        }
    }

    var apiKeyURL: URL {
        switch self {
        case .anthropic:
            return URL(string: "https://console.anthropic.com/settings/keys")!
        case .openai:
            return URL(string: "https://platform.openai.com/api-keys")!
        case .google:
            return URL(string: "https://aistudio.google.com/app/apikey")!
        }
    }

    var envVarName: String {
        switch self {
        case .anthropic: return "ANTHROPIC_API_KEY"
        case .openai: return "OPENAI_API_KEY"
        case .google: return "GOOGLE_API_KEY"
        }
    }

    /// Available models for this provider
    var models: [LLMModel] {
        switch self {
        case .anthropic:
            return [
                LLMModel(id: "claude-opus-4-5-20250514", name: "Claude Opus 4.5", tier: .flagship, provider: .anthropic),
                LLMModel(id: "claude-sonnet-4-5-20250514", name: "Claude Sonnet 4.5", tier: .balanced, provider: .anthropic),
                LLMModel(id: "claude-haiku-4-5-20250514", name: "Claude Haiku 4.5", tier: .fast, provider: .anthropic)
            ]
        case .openai:
            return [
                LLMModel(id: "gpt-4.1", name: "GPT-4.1", tier: .flagship, provider: .openai),
                LLMModel(id: "gpt-4.1-mini", name: "GPT-4.1 Mini", tier: .balanced, provider: .openai),
                LLMModel(id: "gpt-4.1-nano", name: "GPT-4.1 Nano", tier: .fast, provider: .openai)
            ]
        case .google:
            return [
                LLMModel(id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", tier: .flagship, provider: .google),
                LLMModel(id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", tier: .balanced, provider: .google)
            ]
        }
    }

    /// Default model for this provider
    var defaultModel: LLMModel {
        models.first { $0.tier == .balanced } ?? models[0]
    }
}

/// Model performance tier
enum LLMModelTier: String, Codable {
    case flagship  // Best quality, highest cost
    case balanced  // Good balance of quality and speed
    case fast      // Fastest, lowest cost

    var displayName: String {
        switch self {
        case .flagship: return "Flagship"
        case .balanced: return "Balanced"
        case .fast: return "Fast"
        }
    }

    var description: String {
        switch self {
        case .flagship: return "Best quality, higher cost"
        case .balanced: return "Good balance of quality and speed"
        case .fast: return "Fastest responses, lowest cost"
        }
    }
}

/// An LLM model configuration
struct LLMModel: Identifiable, Codable, Equatable {
    let id: String
    let name: String
    let tier: LLMModelTier
    let provider: LLMProvider

    static func == (lhs: LLMModel, rhs: LLMModel) -> Bool {
        lhs.id == rhs.id
    }
}

/// Pricing information for LLM models (per 1M tokens)
struct LLMPricing {
    let inputPer1M: Double
    let outputPer1M: Double

    static func pricing(for modelId: String) -> LLMPricing {
        switch modelId {
        // Anthropic
        case "claude-opus-4-5-20250514":
            return LLMPricing(inputPer1M: 15.0, outputPer1M: 75.0)
        case "claude-sonnet-4-5-20250514":
            return LLMPricing(inputPer1M: 3.0, outputPer1M: 15.0)
        case "claude-haiku-4-5-20250514":
            return LLMPricing(inputPer1M: 0.80, outputPer1M: 4.0)

        // OpenAI
        case "gpt-4.1":
            return LLMPricing(inputPer1M: 2.0, outputPer1M: 8.0)
        case "gpt-4.1-mini":
            return LLMPricing(inputPer1M: 0.40, outputPer1M: 1.60)
        case "gpt-4.1-nano":
            return LLMPricing(inputPer1M: 0.10, outputPer1M: 0.40)

        // Google
        case "gemini-2.5-pro":
            return LLMPricing(inputPer1M: 1.25, outputPer1M: 10.0)
        case "gemini-2.5-flash":
            return LLMPricing(inputPer1M: 0.15, outputPer1M: 0.60)

        default:
            return LLMPricing(inputPer1M: 1.0, outputPer1M: 5.0)
        }
    }
}
