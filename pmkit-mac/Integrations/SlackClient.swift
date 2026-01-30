import Foundation

/// Slack API client (read-only)
final class SlackClient {
    // MARK: - Dependencies

    private let apiClient: PMKitAPIClient

    // MARK: - Initialization

    init(apiClient: PMKitAPIClient = .shared) {
        self.apiClient = apiClient
    }

    // MARK: - Channels

    func getChannels() async throws -> [SlackChannel] {
        let response = try await apiClient.slackRequest(
            endpoint: "conversations.list",
            params: ["types": "public_channel,private_channel", "limit": "100"]
        )

        guard let channels = response["channels"] as? [[String: Any]] else {
            throw SlackError.invalidResponse
        }

        return channels.compactMap { SlackChannel.from($0) }
    }

    func getChannelHistory(channelId: String, limit: Int = 100, oldest: TimeInterval? = nil) async throws -> [SlackMessage] {
        var params: [String: String] = [
            "channel": channelId,
            "limit": String(limit)
        ]

        if let oldest = oldest {
            params["oldest"] = String(oldest)
        }

        let response = try await apiClient.slackRequest(
            endpoint: "conversations.history",
            params: params
        )

        guard let messages = response["messages"] as? [[String: Any]] else {
            throw SlackError.invalidResponse
        }

        return messages.compactMap { SlackMessage.from($0) }
    }

    // MARK: - Search

    func searchMessages(query: String, count: Int = 50) async throws -> [SlackMessage] {
        let response = try await apiClient.slackRequest(
            endpoint: "search.messages",
            params: ["query": query, "count": String(count)]
        )

        guard let messages = response["messages"] as? [String: Any],
              let matches = messages["matches"] as? [[String: Any]] else {
            throw SlackError.invalidResponse
        }

        return matches.compactMap { SlackMessage.from($0) }
    }

    // MARK: - Users

    func getUser(userId: String) async throws -> SlackUser {
        let response = try await apiClient.slackRequest(
            endpoint: "users.info",
            params: ["user": userId]
        )

        guard let user = response["user"] as? [String: Any],
              let result = SlackUser.from(user) else {
            throw SlackError.invalidResponse
        }

        return result
    }

    func getUsers() async throws -> [SlackUser] {
        let response = try await apiClient.slackRequest(
            endpoint: "users.list",
            params: [:]
        )

        guard let members = response["members"] as? [[String: Any]] else {
            throw SlackError.invalidResponse
        }

        return members.compactMap { SlackUser.from($0) }
    }
}

// MARK: - Types

struct SlackChannel {
    let id: String
    let name: String
    let isPrivate: Bool
    let isMember: Bool
    let memberCount: Int?

    static func from(_ dict: [String: Any]) -> SlackChannel? {
        guard let id = dict["id"] as? String,
              let name = dict["name"] as? String else {
            return nil
        }

        return SlackChannel(
            id: id,
            name: name,
            isPrivate: dict["is_private"] as? Bool ?? false,
            isMember: dict["is_member"] as? Bool ?? false,
            memberCount: dict["num_members"] as? Int
        )
    }
}

struct SlackMessage {
    let ts: String
    let text: String
    let userId: String?
    let channelId: String?
    let timestamp: Date
    let threadTs: String?
    let replyCount: Int?

    static func from(_ dict: [String: Any]) -> SlackMessage? {
        guard let ts = dict["ts"] as? String,
              let text = dict["text"] as? String else {
            return nil
        }

        let timestamp: Date
        if let tsDouble = Double(ts) {
            timestamp = Date(timeIntervalSince1970: tsDouble)
        } else {
            timestamp = Date()
        }

        return SlackMessage(
            ts: ts,
            text: text,
            userId: dict["user"] as? String,
            channelId: dict["channel"] as? String,
            timestamp: timestamp,
            threadTs: dict["thread_ts"] as? String,
            replyCount: dict["reply_count"] as? Int
        )
    }
}

struct SlackUser {
    let id: String
    let name: String
    let realName: String?
    let email: String?
    let isBot: Bool

    static func from(_ dict: [String: Any]) -> SlackUser? {
        guard let id = dict["id"] as? String,
              let name = dict["name"] as? String else {
            return nil
        }

        let profile = dict["profile"] as? [String: Any]

        return SlackUser(
            id: id,
            name: name,
            realName: profile?["real_name"] as? String,
            email: profile?["email"] as? String,
            isBot: dict["is_bot"] as? Bool ?? false
        )
    }
}

// MARK: - Errors

enum SlackError: LocalizedError {
    case invalidResponse
    case channelNotFound
    case notConnected

    var errorDescription: String? {
        switch self {
        case .invalidResponse: return "Invalid response from Slack"
        case .channelNotFound: return "Channel not found"
        case .notConnected: return "Slack is not connected"
        }
    }
}
