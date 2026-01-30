import Foundation
import SwiftData

/// Configuration for an autonomous agent
@Model
final class AgentConfig {
    @Attribute(.unique) var id: String
    var agentTypeRaw: String
    var isEnabled: Bool
    var createdAt: Date
    var updatedAt: Date

    /// Schedule configuration (JSON encoded)
    var scheduleData: Data?

    /// Agent-specific configuration (JSON encoded)
    var configData: Data?

    /// Last run timestamp
    var lastRunAt: Date?

    /// Next scheduled run
    var nextRunAt: Date?

    /// For PRD/Prototype triggers
    var triggerStatus: String?
    var projects: [String]?

    var agentType: AgentType {
        get { AgentType(rawValue: agentTypeRaw) ?? .dailyBrief }
        set { agentTypeRaw = newValue.rawValue }
    }

    init(
        id: String = UUID().uuidString,
        agentType: AgentType,
        isEnabled: Bool = false,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.agentTypeRaw = agentType.rawValue
        self.isEnabled = isEnabled
        self.createdAt = createdAt
        self.updatedAt = createdAt
    }

    // MARK: - Schedule Helpers

    var schedule: AgentSchedule? {
        get {
            guard let data = scheduleData else { return nil }
            return try? JSONDecoder().decode(AgentSchedule.self, from: data)
        }
        set {
            scheduleData = try? JSONEncoder().encode(newValue)
            updatedAt = Date()
        }
    }

    // MARK: - Config Helpers

    func getConfig<T: Codable>(_ type: T.Type) -> T? {
        guard let data = configData else { return nil }
        return try? JSONDecoder().decode(type, from: data)
    }

    func setConfig<T: Codable>(_ config: T) {
        configData = try? JSONEncoder().encode(config)
        updatedAt = Date()
    }
}

// MARK: - Schedule Types

struct AgentSchedule: Codable {
    var type: ScheduleType
    var time: String? // HH:mm format for time-based
    var timezone: String
    var daysOfWeek: [Int]? // 1-7 for Mon-Sun
    var leadTimeMinutes: Int? // For calendar-based triggers

    init(
        type: ScheduleType,
        time: String? = nil,
        timezone: String = TimeZone.current.identifier,
        daysOfWeek: [Int]? = nil,
        leadTimeMinutes: Int? = nil
    ) {
        self.type = type
        self.time = time
        self.timezone = timezone
        self.daysOfWeek = daysOfWeek
        self.leadTimeMinutes = leadTimeMinutes
    }
}

enum ScheduleType: String, Codable {
    case daily
    case weekly
    case calendarTrigger
    case eventTrigger
}

// MARK: - Agent-Specific Configs

struct DailyBriefConfig: Codable {
    var slackChannels: [String]
    var includeJira: Bool
    var jiraProjects: [String]
    var lookbackHours: Int
    var deliveryTime: String // HH:mm
    var timezone: String

    init(
        slackChannels: [String] = [],
        includeJira: Bool = true,
        jiraProjects: [String] = [],
        lookbackHours: Int = 24,
        deliveryTime: String = "08:00",
        timezone: String = TimeZone.current.identifier
    ) {
        self.slackChannels = slackChannels
        self.includeJira = includeJira
        self.jiraProjects = jiraProjects
        self.lookbackHours = lookbackHours
        self.deliveryTime = deliveryTime
        self.timezone = timezone
    }
}

struct MeetingPrepConfig: Codable {
    var leadTimeMinutes: Int
    var includeGong: Bool
    var includeJira: Bool
    var externalDomainsOnly: Bool
    var excludedDomains: [String]

    init(
        leadTimeMinutes: Int = 60,
        includeGong: Bool = true,
        includeJira: Bool = true,
        externalDomainsOnly: Bool = true,
        excludedDomains: [String] = []
    ) {
        self.leadTimeMinutes = leadTimeMinutes
        self.includeGong = includeGong
        self.includeJira = includeJira
        self.externalDomainsOnly = externalDomainsOnly
        self.excludedDomains = excludedDomains
    }
}

struct FeatureIntelligenceConfig: Codable {
    var includeSlack: Bool
    var slackChannels: [String]
    var includeJira: Bool
    var jiraProjects: [String]
    var includeIntercom: Bool
    var lookbackDays: Int
    var dayOfWeek: Int // 1-7 for Mon-Sun
    var time: String // HH:mm

    init(
        includeSlack: Bool = true,
        slackChannels: [String] = [],
        includeJira: Bool = true,
        jiraProjects: [String] = [],
        includeIntercom: Bool = false,
        lookbackDays: Int = 7,
        dayOfWeek: Int = 1, // Monday
        time: String = "09:00"
    ) {
        self.includeSlack = includeSlack
        self.slackChannels = slackChannels
        self.includeJira = includeJira
        self.jiraProjects = jiraProjects
        self.includeIntercom = includeIntercom
        self.lookbackDays = lookbackDays
        self.dayOfWeek = dayOfWeek
        self.time = time
    }
}

struct PRDDraftConfig: Codable {
    var jiraProjects: [String]
    var triggerStatus: String // Jira status that triggers PRD generation
    var includeFeatureIntelligence: Bool // Chain from Feature Intelligence artifact

    init(
        jiraProjects: [String] = [],
        triggerStatus: String = "Ready for PRD",
        includeFeatureIntelligence: Bool = true
    ) {
        self.jiraProjects = jiraProjects
        self.triggerStatus = triggerStatus
        self.includeFeatureIntelligence = includeFeatureIntelligence
    }
}

struct PrototypeConfig: Codable {
    var autoGenerate: Bool // Auto-generate when PRD is approved
    var triggerStatus: String // PRD status that triggers prototype
    var outputFormat: PrototypeOutputFormat

    init(
        autoGenerate: Bool = false,
        triggerStatus: String = "Approved",
        outputFormat: PrototypeOutputFormat = .html
    ) {
        self.autoGenerate = autoGenerate
        self.triggerStatus = triggerStatus
        self.outputFormat = outputFormat
    }
}

enum PrototypeOutputFormat: String, Codable {
    case html
    case react
}
