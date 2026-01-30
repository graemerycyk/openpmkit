import Foundation
import SwiftData

/// Represents an OAuth connection to an external service
@Model
final class Connection {
    @Attribute(.unique) var id: String
    var connectorTypeRaw: String
    var statusRaw: String
    var createdAt: Date
    var lastUsedAt: Date?
    var expiresAt: Date?

    /// Display name (e.g., workspace name, account email)
    var displayName: String?

    /// Scopes granted (JSON encoded)
    var scopesData: Data?

    /// Metadata (e.g., workspace ID, subdomain) - JSON encoded
    var metadataData: Data?

    /// Note: OAuth tokens are stored in Keychain, not in the database
    /// Use KeychainService to access tokens

    var connectorType: ConnectorType {
        get { ConnectorType(rawValue: connectorTypeRaw) ?? .slack }
        set { connectorTypeRaw = newValue.rawValue }
    }

    var status: ConnectionStatus {
        get { ConnectionStatus(rawValue: statusRaw) ?? .disconnected }
        set { statusRaw = newValue.rawValue }
    }

    var scopes: [String] {
        get {
            guard let data = scopesData else { return [] }
            return (try? JSONDecoder().decode([String].self, from: data)) ?? []
        }
        set {
            scopesData = try? JSONEncoder().encode(newValue)
        }
    }

    var metadata: ConnectionMetadata? {
        get {
            guard let data = metadataData else { return nil }
            return try? JSONDecoder().decode(ConnectionMetadata.self, from: data)
        }
        set {
            metadataData = try? JSONEncoder().encode(newValue)
        }
    }

    init(
        id: String = UUID().uuidString,
        connectorType: ConnectorType,
        status: ConnectionStatus = .connected,
        createdAt: Date = Date(),
        displayName: String? = nil,
        scopes: [String] = []
    ) {
        self.id = id
        self.connectorTypeRaw = connectorType.rawValue
        self.statusRaw = status.rawValue
        self.createdAt = createdAt
        self.displayName = displayName
        self.scopesData = try? JSONEncoder().encode(scopes)
    }

    /// Check if token needs refresh (within 5 minutes of expiry)
    var needsRefresh: Bool {
        guard let expiresAt = expiresAt else { return false }
        return Date().addingTimeInterval(300) >= expiresAt
    }

    /// Check if connection is expired
    var isExpired: Bool {
        guard let expiresAt = expiresAt else { return false }
        return Date() >= expiresAt
    }
}

// MARK: - Enums

enum ConnectorType: String, Codable, CaseIterable {
    case slack
    case jira
    case confluence
    case googleCalendar
    case gmail
    case googleDrive
    case gong
    case intercom

    var displayName: String {
        switch self {
        case .slack: return "Slack"
        case .jira: return "Jira"
        case .confluence: return "Confluence"
        case .googleCalendar: return "Google Calendar"
        case .gmail: return "Gmail"
        case .googleDrive: return "Google Drive"
        case .gong: return "Gong"
        case .intercom: return "Intercom"
        }
    }

    var icon: String {
        switch self {
        case .slack: return "bubble.left.and.bubble.right"
        case .jira: return "ticket"
        case .confluence: return "doc.richtext"
        case .googleCalendar: return "calendar"
        case .gmail: return "envelope"
        case .googleDrive: return "folder"
        case .gong: return "phone"
        case .intercom: return "message"
        }
    }

    /// OAuth configuration
    var oauthConfig: OAuthConfig {
        switch self {
        case .slack:
            return OAuthConfig(
                authURL: "https://slack.com/oauth/v2/authorize",
                tokenURL: "https://slack.com/api/oauth.v2.access",
                scopes: ["channels:history", "channels:read", "groups:history", "groups:read", "users:read"]
            )
        case .jira, .confluence:
            return OAuthConfig(
                authURL: "https://auth.atlassian.com/authorize",
                tokenURL: "https://auth.atlassian.com/oauth/token",
                scopes: self == .jira
                    ? ["read:jira-work", "read:jira-user", "offline_access"]
                    : ["read:confluence-content.all", "read:confluence-space.summary", "offline_access"]
            )
        case .googleCalendar, .gmail, .googleDrive:
            let scope: String = {
                switch self {
                case .googleCalendar: return "https://www.googleapis.com/auth/calendar.readonly"
                case .gmail: return "https://www.googleapis.com/auth/gmail.readonly"
                case .googleDrive: return "https://www.googleapis.com/auth/drive.readonly"
                default: return ""
                }
            }()
            return OAuthConfig(
                authURL: "https://accounts.google.com/o/oauth2/v2/auth",
                tokenURL: "https://oauth2.googleapis.com/token",
                scopes: [scope]
            )
        case .gong:
            return OAuthConfig(
                authURL: "https://app.gong.io/oauth2/authorize",
                tokenURL: "https://app.gong.io/oauth2/token",
                scopes: ["api:calls:read", "api:users:read", "api:meetings:read"]
            )
        case .intercom:
            return OAuthConfig(
                authURL: "https://app.intercom.com/oauth",
                tokenURL: "https://api.intercom.io/auth/eagle/token",
                scopes: []
            )
        }
    }
}

enum ConnectionStatus: String, Codable {
    case connected
    case expired
    case error
    case disconnected
}

struct OAuthConfig {
    let authURL: String
    let tokenURL: String
    let scopes: [String]
}

struct ConnectionMetadata: Codable {
    var workspaceId: String?
    var workspaceName: String?
    var subdomain: String?
    var email: String?
    var cloudId: String? // For Atlassian
}
