import Foundation
import SwiftData

/// Records LLM token usage for cost tracking
@Model
final class UsageRecord {
    @Attribute(.unique) var id: String
    var providerRaw: String
    var model: String
    var inputTokens: Int
    var outputTokens: Int
    var createdAt: Date

    /// Associated job ID (if any)
    var jobId: String?

    /// Estimated cost in USD
    var estimatedCost: Double

    var provider: LLMProvider {
        get { LLMProvider(rawValue: providerRaw) ?? .anthropic }
        set { providerRaw = newValue.rawValue }
    }

    init(
        id: String = UUID().uuidString,
        provider: LLMProvider,
        model: String,
        inputTokens: Int,
        outputTokens: Int,
        createdAt: Date = Date(),
        jobId: String? = nil
    ) {
        self.id = id
        self.providerRaw = provider.rawValue
        self.model = model
        self.inputTokens = inputTokens
        self.outputTokens = outputTokens
        self.createdAt = createdAt
        self.jobId = jobId
        self.estimatedCost = Self.calculateCost(
            provider: provider,
            model: model,
            inputTokens: inputTokens,
            outputTokens: outputTokens
        )
    }

    /// Calculate estimated cost based on provider pricing
    static func calculateCost(
        provider: LLMProvider,
        model: String,
        inputTokens: Int,
        outputTokens: Int
    ) -> Double {
        let pricing = LLMPricing.forModel(provider: provider, model: model)
        let inputCost = Double(inputTokens) / 1_000_000.0 * pricing.inputPer1M
        let outputCost = Double(outputTokens) / 1_000_000.0 * pricing.outputPer1M
        return inputCost + outputCost
    }
}

// MARK: - LLM Provider Types

enum LLMProvider: String, Codable, CaseIterable {
    case anthropic
    case openai
    case google

    var displayName: String {
        switch self {
        case .anthropic: return "Anthropic"
        case .openai: return "OpenAI"
        case .google: return "Google"
        }
    }

    var availableModels: [LLMModel] {
        switch self {
        case .anthropic:
            return [
                LLMModel(id: "claude-opus-4-5-20251101", name: "Claude Opus 4.5", tier: .flagship),
                LLMModel(id: "claude-sonnet-4-5-20250929", name: "Claude Sonnet 4.5", tier: .balanced),
                LLMModel(id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5", tier: .fast)
            ]
        case .openai:
            return [
                LLMModel(id: "gpt-5.2", name: "GPT-5.2", tier: .flagship),
                LLMModel(id: "gpt-5-mini", name: "GPT-5 Mini", tier: .balanced),
                LLMModel(id: "gpt-5-nano", name: "GPT-5 Nano", tier: .fast)
            ]
        case .google:
            return [
                LLMModel(id: "gemini-3-pro", name: "Gemini 3 Pro", tier: .flagship),
                LLMModel(id: "gemini-3-flash", name: "Gemini 3 Flash", tier: .fast)
            ]
        }
    }

    var defaultModel: String {
        switch self {
        case .anthropic: return "claude-sonnet-4-5-20250929"
        case .openai: return "gpt-5-mini"
        case .google: return "gemini-3-flash"
        }
    }
}

struct LLMModel: Identifiable {
    let id: String
    let name: String
    let tier: ModelTier

    var tierBadge: String {
        tier.rawValue.capitalized
    }
}

enum ModelTier: String {
    case flagship
    case balanced
    case fast
}

// MARK: - Pricing

struct LLMPricing {
    let inputPer1M: Double
    let outputPer1M: Double

    static func forModel(provider: LLMProvider, model: String) -> LLMPricing {
        switch provider {
        case .anthropic:
            switch model {
            case "claude-opus-4-5-20251101":
                return LLMPricing(inputPer1M: 15.0, outputPer1M: 75.0)
            case "claude-sonnet-4-5-20250929":
                return LLMPricing(inputPer1M: 3.0, outputPer1M: 15.0)
            case "claude-haiku-4-5-20251001":
                return LLMPricing(inputPer1M: 0.80, outputPer1M: 4.0)
            default:
                return LLMPricing(inputPer1M: 3.0, outputPer1M: 15.0)
            }
        case .openai:
            switch model {
            case "gpt-5.2":
                return LLMPricing(inputPer1M: 10.0, outputPer1M: 30.0)
            case "gpt-5-mini":
                return LLMPricing(inputPer1M: 3.0, outputPer1M: 12.0)
            case "gpt-5-nano":
                return LLMPricing(inputPer1M: 0.50, outputPer1M: 2.0)
            default:
                return LLMPricing(inputPer1M: 3.0, outputPer1M: 12.0)
            }
        case .google:
            switch model {
            case "gemini-3-pro":
                return LLMPricing(inputPer1M: 7.0, outputPer1M: 21.0)
            case "gemini-3-flash":
                return LLMPricing(inputPer1M: 0.70, outputPer1M: 3.50)
            default:
                return LLMPricing(inputPer1M: 0.70, outputPer1M: 3.50)
            }
        }
    }
}
