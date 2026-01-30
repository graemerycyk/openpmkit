import Foundation

/// Jira REST API client
final class JiraClient {
    // MARK: - Dependencies

    private let apiClient: PMKitAPIClient

    // MARK: - Initialization

    init(apiClient: PMKitAPIClient = .shared) {
        self.apiClient = apiClient
    }

    // MARK: - Issues

    func searchIssues(jql: String, maxResults: Int = 50) async throws -> [JiraIssue] {
        let endpoint = "/rest/api/3/search"
        let params: [String: Any] = [
            "jql": jql,
            "maxResults": maxResults,
            "fields": ["summary", "description", "status", "priority", "assignee", "created", "updated"]
        ]

        let response = try await apiClient.jiraRequest(endpoint: endpoint, method: "POST", body: params)

        guard let issues = response["issues"] as? [[String: Any]] else {
            throw JiraError.invalidResponse
        }

        return issues.compactMap { JiraIssue.from($0) }
    }

    func getIssue(key: String) async throws -> JiraIssue {
        let endpoint = "/rest/api/3/issue/\(key)"
        let response = try await apiClient.jiraRequest(endpoint: endpoint, method: "GET")

        guard let issue = JiraIssue.from(response) else {
            throw JiraError.invalidResponse
        }

        return issue
    }

    func createIssue(input: JiraCreateIssueInput) async throws -> JiraIssue {
        let endpoint = "/rest/api/3/issue"

        let body: [String: Any] = [
            "fields": [
                "project": ["key": input.projectKey],
                "summary": input.summary,
                "description": input.description.map { descriptionToADF($0) } as Any,
                "issuetype": ["name": input.issueType],
                "priority": input.priority.map { ["name": $0] } as Any
            ].compactMapValues { $0 }
        ]

        let response = try await apiClient.jiraRequest(endpoint: endpoint, method: "POST", body: body)

        guard let key = response["key"] as? String else {
            throw JiraError.createFailed
        }

        return try await getIssue(key: key)
    }

    func updateIssue(key: String, input: JiraUpdateIssueInput) async throws {
        let endpoint = "/rest/api/3/issue/\(key)"

        var fields: [String: Any] = [:]
        if let summary = input.summary { fields["summary"] = summary }
        if let description = input.description { fields["description"] = descriptionToADF(description) }
        if let priority = input.priority { fields["priority"] = ["name": priority] }
        if let assignee = input.assigneeId { fields["assignee"] = ["accountId": assignee] }

        let body: [String: Any] = ["fields": fields]

        _ = try await apiClient.jiraRequest(endpoint: endpoint, method: "PUT", body: body)
    }

    func transitionIssue(key: String, transitionId: String) async throws {
        let endpoint = "/rest/api/3/issue/\(key)/transitions"
        let body: [String: Any] = ["transition": ["id": transitionId]]

        _ = try await apiClient.jiraRequest(endpoint: endpoint, method: "POST", body: body)
    }

    // MARK: - Comments

    func addComment(issueKey: String, body: String) async throws {
        let endpoint = "/rest/api/3/issue/\(issueKey)/comment"
        let requestBody: [String: Any] = [
            "body": descriptionToADF(body)
        ]

        _ = try await apiClient.jiraRequest(endpoint: endpoint, method: "POST", body: requestBody)
    }

    // MARK: - Sprints

    func getActiveSprint(boardId: String) async throws -> JiraSprint? {
        let endpoint = "/rest/agile/1.0/board/\(boardId)/sprint?state=active"
        let response = try await apiClient.jiraRequest(endpoint: endpoint, method: "GET")

        guard let sprints = response["values"] as? [[String: Any]],
              let first = sprints.first else {
            return nil
        }

        return JiraSprint.from(first)
    }

    func getSprintIssues(sprintId: String) async throws -> [JiraIssue] {
        let endpoint = "/rest/agile/1.0/sprint/\(sprintId)/issue"
        let response = try await apiClient.jiraRequest(endpoint: endpoint, method: "GET")

        guard let issues = response["issues"] as? [[String: Any]] else {
            return []
        }

        return issues.compactMap { JiraIssue.from($0) }
    }

    // MARK: - Helpers

    private func descriptionToADF(_ text: String) -> [String: Any] {
        // Convert plain text to Atlassian Document Format
        return [
            "type": "doc",
            "version": 1,
            "content": [
                [
                    "type": "paragraph",
                    "content": [
                        [
                            "type": "text",
                            "text": text
                        ]
                    ]
                ]
            ]
        ]
    }
}

// MARK: - Types

struct JiraIssue {
    let id: String
    let key: String
    let summary: String
    let description: String?
    let status: String
    let priority: String?
    let assignee: JiraUser?
    let url: String?

    static func from(_ dict: [String: Any]) -> JiraIssue? {
        guard let key = dict["key"] as? String else { return nil }

        let fields = dict["fields"] as? [String: Any] ?? [:]
        let status = (fields["status"] as? [String: Any])?["name"] as? String ?? "Unknown"
        let priority = (fields["priority"] as? [String: Any])?["name"] as? String
        let assigneeDict = fields["assignee"] as? [String: Any]
        let assignee = assigneeDict.flatMap { JiraUser.from($0) }

        return JiraIssue(
            id: dict["id"] as? String ?? key,
            key: key,
            summary: fields["summary"] as? String ?? "",
            description: extractDescription(from: fields["description"]),
            status: status,
            priority: priority,
            assignee: assignee,
            url: dict["self"] as? String
        )
    }

    private static func extractDescription(from adf: Any?) -> String? {
        // Extract plain text from ADF format
        guard let doc = adf as? [String: Any],
              let content = doc["content"] as? [[String: Any]] else {
            return nil
        }

        var text = ""
        for block in content {
            if let innerContent = block["content"] as? [[String: Any]] {
                for node in innerContent {
                    if let nodeText = node["text"] as? String {
                        text += nodeText
                    }
                }
            }
        }
        return text.isEmpty ? nil : text
    }
}

struct JiraUser {
    let accountId: String
    let displayName: String
    let email: String?

    static func from(_ dict: [String: Any]) -> JiraUser? {
        guard let accountId = dict["accountId"] as? String,
              let displayName = dict["displayName"] as? String else {
            return nil
        }
        return JiraUser(
            accountId: accountId,
            displayName: displayName,
            email: dict["emailAddress"] as? String
        )
    }
}

struct JiraSprint {
    let id: String
    let name: String
    let state: String
    let startDate: Date?
    let endDate: Date?

    static func from(_ dict: [String: Any]) -> JiraSprint? {
        guard let id = dict["id"] as? Int,
              let name = dict["name"] as? String else {
            return nil
        }

        return JiraSprint(
            id: String(id),
            name: name,
            state: dict["state"] as? String ?? "unknown",
            startDate: (dict["startDate"] as? String).flatMap { ISO8601DateFormatter().date(from: $0) },
            endDate: (dict["endDate"] as? String).flatMap { ISO8601DateFormatter().date(from: $0) }
        )
    }
}

struct JiraCreateIssueInput {
    let projectKey: String
    let summary: String
    let description: String?
    let issueType: String
    let priority: String?
}

struct JiraUpdateIssueInput {
    var summary: String?
    var description: String?
    var priority: String?
    var assigneeId: String?
}

// MARK: - Errors

enum JiraError: LocalizedError {
    case invalidResponse
    case createFailed
    case updateFailed
    case transitionFailed
    case notConnected

    var errorDescription: String? {
        switch self {
        case .invalidResponse: return "Invalid response from Jira"
        case .createFailed: return "Failed to create issue"
        case .updateFailed: return "Failed to update issue"
        case .transitionFailed: return "Failed to transition issue"
        case .notConnected: return "Jira is not connected"
        }
    }
}
