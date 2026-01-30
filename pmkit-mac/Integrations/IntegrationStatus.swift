import Foundation

/// Integration status and metadata types
struct IntegrationConnectionInfo: Codable {
    let type: String
    let status: String
    let instanceName: String?
    let connectedAt: Date?
    let lastSyncAt: Date?
    let permissions: [String]?

    var integrationStatus: IntegrationStatus {
        switch status {
        case "connected":
            return .connected
        case "disconnected":
            return .disconnected
        default:
            return .comingSoon
        }
    }
}

extension IntegrationStatus {
    var displayText: String {
        switch self {
        case .connected:
            return "Connected"
        case .disconnected:
            return "Not connected"
        case .comingSoon:
            return "Coming soon"
        }
    }

    var color: String {
        switch self {
        case .connected:
            return "green"
        case .disconnected:
            return "gray"
        case .comingSoon:
            return "orange"
        }
    }
}

// MARK: - Integration Capabilities

struct IntegrationCapability: OptionSet {
    let rawValue: Int

    static let read = IntegrationCapability(rawValue: 1 << 0)
    static let write = IntegrationCapability(rawValue: 1 << 1)
    static let realtime = IntegrationCapability(rawValue: 1 << 2)

    static let readOnly: IntegrationCapability = [.read]
    static let readWrite: IntegrationCapability = [.read, .write]
    static let full: IntegrationCapability = [.read, .write, .realtime]
}

// MARK: - Integration Data Sources

enum IntegrationDataSource: String, CaseIterable {
    case messages
    case channels
    case users
    case tickets
    case issues
    case sprints
    case projects
    case meetings
    case emails
    case documents
    case recordings
    case analytics
}

extension IntegrationType {
    var dataSources: [IntegrationDataSource] {
        switch self {
        case .slack:
            return [.messages, .channels, .users]
        case .linear:
            return [.tickets, .issues, .sprints, .projects]
        case .jira:
            return [.tickets, .issues, .sprints, .projects]
        case .confluence:
            return [.documents]
        case .googleCalendar:
            return [.meetings]
        case .gmail:
            return [.emails]
        case .googleDrive:
            return [.documents]
        case .zendesk:
            return [.tickets]
        case .gong:
            return [.recordings, .analytics]
        case .figma:
            return [.documents]
        case .loom:
            return [.recordings]
        case .amplitude:
            return [.analytics]
        case .discourse:
            return [.messages]
        case .notion:
            return [.documents]
        case .zoom:
            return [.meetings, .recordings]
        }
    }
}
