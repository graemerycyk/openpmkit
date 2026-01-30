import Foundation
import SwiftData

/// Represents an agent job execution record
@Model
final class AgentJob {
    @Attribute(.unique) var id: String
    var agentTypeRaw: String
    var statusRaw: String
    var createdAt: Date
    var startedAt: Date?
    var completedAt: Date?
    var error: String?

    /// Input parameters for the job (JSON encoded)
    var inputData: Data?

    /// Reference to generated artifact
    @Relationship(deleteRule: .cascade)
    var artifact: Artifact?

    /// Token usage for this job
    var inputTokens: Int
    var outputTokens: Int

    /// Whether this job was generated late (due to sleep/wake recovery)
    var generatedLate: Bool

    /// Trigger source
    var triggerSourceRaw: String

    var agentType: AgentType {
        get { AgentType(rawValue: agentTypeRaw) ?? .dailyBrief }
        set { agentTypeRaw = newValue.rawValue }
    }

    var status: JobStatus {
        get { JobStatus(rawValue: statusRaw) ?? .pending }
        set { statusRaw = newValue.rawValue }
    }

    var triggerSource: TriggerSource {
        get { TriggerSource(rawValue: triggerSourceRaw) ?? .manual }
        set { triggerSourceRaw = newValue.rawValue }
    }

    init(
        id: String = UUID().uuidString,
        agentType: AgentType,
        status: JobStatus = .pending,
        createdAt: Date = Date(),
        triggerSource: TriggerSource = .manual
    ) {
        self.id = id
        self.agentTypeRaw = agentType.rawValue
        self.statusRaw = status.rawValue
        self.createdAt = createdAt
        self.inputTokens = 0
        self.outputTokens = 0
        self.generatedLate = false
        self.triggerSourceRaw = triggerSource.rawValue
    }
}

// MARK: - Enums

enum AgentType: String, Codable, CaseIterable {
    case dailyBrief = "daily_brief"
    case meetingPrep = "meeting_prep"
    case featureIntelligence = "feature_intelligence"
    case prdDraft = "prd_draft"
    case prototype = "prototype"

    var displayName: String {
        switch self {
        case .dailyBrief: return "Daily Brief"
        case .meetingPrep: return "Meeting Prep"
        case .featureIntelligence: return "Feature Intelligence"
        case .prdDraft: return "PRD Draft"
        case .prototype: return "Prototype"
        }
    }

    var icon: String {
        switch self {
        case .dailyBrief: return "sun.max"
        case .meetingPrep: return "person.2"
        case .featureIntelligence: return "lightbulb"
        case .prdDraft: return "doc.text"
        case .prototype: return "macwindow"
        }
    }

    var triggerType: TriggerType {
        switch self {
        case .dailyBrief, .featureIntelligence:
            return .timeBased
        case .meetingPrep:
            return .calendarBased
        case .prdDraft, .prototype:
            return .eventBased
        }
    }
}

enum JobStatus: String, Codable {
    case pending
    case running
    case completed
    case failed
    case cancelled
}

enum TriggerType: String, Codable {
    case timeBased
    case calendarBased
    case eventBased
}

enum TriggerSource: String, Codable {
    case manual
    case scheduled
    case wakeRecovery
    case calendarEvent
    case jiraEvent
    case artifactChain
}
