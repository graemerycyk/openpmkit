import Foundation

/// Linear GraphQL API client
final class LinearClient {
    // MARK: - Dependencies

    private let apiClient: PMKitAPIClient

    // MARK: - Initialization

    init(apiClient: PMKitAPIClient = .shared) {
        self.apiClient = apiClient
    }

    // MARK: - Issues

    func getIssues(filter: IssueFilter? = nil) async throws -> [LinearIssue] {
        let query = """
        query Issues($filter: IssueFilter) {
            issues(filter: $filter, first: 50) {
                nodes {
                    id
                    identifier
                    title
                    description
                    state { name }
                    priority
                    assignee { name email }
                    createdAt
                    updatedAt
                }
            }
        }
        """

        let variables: [String: Any] = filter?.toVariables() ?? [:]
        let response = try await apiClient.linearGraphQL(query: query, variables: variables)

        guard let data = response["data"] as? [String: Any],
              let issues = data["issues"] as? [String: Any],
              let nodes = issues["nodes"] as? [[String: Any]] else {
            throw LinearError.invalidResponse
        }

        return nodes.compactMap { LinearIssue.from($0) }
    }

    func createIssue(input: CreateIssueInput) async throws -> LinearIssue {
        let query = """
        mutation CreateIssue($input: IssueCreateInput!) {
            issueCreate(input: $input) {
                success
                issue {
                    id
                    identifier
                    title
                    state { name }
                    url
                }
            }
        }
        """

        let variables: [String: Any] = [
            "input": input.toVariables()
        ]

        let response = try await apiClient.linearGraphQL(query: query, variables: variables)

        guard let data = response["data"] as? [String: Any],
              let issueCreate = data["issueCreate"] as? [String: Any],
              let success = issueCreate["success"] as? Bool,
              success,
              let issue = issueCreate["issue"] as? [String: Any] else {
            throw LinearError.createFailed
        }

        guard let result = LinearIssue.from(issue) else {
            throw LinearError.invalidResponse
        }

        return result
    }

    func updateIssue(id: String, input: UpdateIssueInput) async throws -> LinearIssue {
        let query = """
        mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
            issueUpdate(id: $id, input: $input) {
                success
                issue {
                    id
                    identifier
                    title
                    state { name }
                }
            }
        }
        """

        let variables: [String: Any] = [
            "id": id,
            "input": input.toVariables()
        ]

        let response = try await apiClient.linearGraphQL(query: query, variables: variables)

        guard let data = response["data"] as? [String: Any],
              let issueUpdate = data["issueUpdate"] as? [String: Any],
              let success = issueUpdate["success"] as? Bool,
              success,
              let issue = issueUpdate["issue"] as? [String: Any],
              let result = LinearIssue.from(issue) else {
            throw LinearError.updateFailed
        }

        return result
    }

    // MARK: - Comments

    func addComment(issueId: String, body: String) async throws {
        let query = """
        mutation AddComment($input: CommentCreateInput!) {
            commentCreate(input: $input) {
                success
            }
        }
        """

        let variables: [String: Any] = [
            "input": [
                "issueId": issueId,
                "body": body
            ]
        ]

        let response = try await apiClient.linearGraphQL(query: query, variables: variables)

        guard let data = response["data"] as? [String: Any],
              let commentCreate = data["commentCreate"] as? [String: Any],
              let success = commentCreate["success"] as? Bool,
              success else {
            throw LinearError.commentFailed
        }
    }

    // MARK: - Projects & Sprints

    func getCurrentSprint(teamId: String? = nil) async throws -> LinearSprint? {
        let query = """
        query CurrentCycle($teamId: String) {
            cycles(filter: { isActive: { eq: true }, team: { id: { eq: $teamId } } }, first: 1) {
                nodes {
                    id
                    name
                    startsAt
                    endsAt
                    progress
                    issues {
                        nodes {
                            id
                            identifier
                            title
                            state { name }
                        }
                    }
                }
            }
        }
        """

        let variables: [String: Any] = teamId.map { ["teamId": $0] } ?? [:]
        let response = try await apiClient.linearGraphQL(query: query, variables: variables)

        guard let data = response["data"] as? [String: Any],
              let cycles = data["cycles"] as? [String: Any],
              let nodes = cycles["nodes"] as? [[String: Any]],
              let first = nodes.first else {
            return nil
        }

        return LinearSprint.from(first)
    }
}

// MARK: - Types

struct LinearIssue {
    let id: String
    let identifier: String
    let title: String
    let description: String?
    let state: String
    let priority: Int?
    let assignee: LinearUser?
    let url: String?

    static func from(_ dict: [String: Any]) -> LinearIssue? {
        guard let id = dict["id"] as? String,
              let identifier = dict["identifier"] as? String,
              let title = dict["title"] as? String else {
            return nil
        }

        let state = (dict["state"] as? [String: Any])?["name"] as? String ?? "Unknown"
        let assigneeDict = dict["assignee"] as? [String: Any]
        let assignee = assigneeDict.flatMap { LinearUser.from($0) }

        return LinearIssue(
            id: id,
            identifier: identifier,
            title: title,
            description: dict["description"] as? String,
            state: state,
            priority: dict["priority"] as? Int,
            assignee: assignee,
            url: dict["url"] as? String
        )
    }
}

struct LinearUser {
    let id: String
    let name: String
    let email: String?

    static func from(_ dict: [String: Any]) -> LinearUser? {
        guard let name = dict["name"] as? String else { return nil }
        return LinearUser(
            id: dict["id"] as? String ?? "",
            name: name,
            email: dict["email"] as? String
        )
    }
}

struct LinearSprint {
    let id: String
    let name: String
    let startsAt: Date?
    let endsAt: Date?
    let progress: Double
    let issues: [LinearIssue]

    static func from(_ dict: [String: Any]) -> LinearSprint? {
        guard let id = dict["id"] as? String,
              let name = dict["name"] as? String else {
            return nil
        }

        let issuesDict = dict["issues"] as? [String: Any]
        let issueNodes = issuesDict?["nodes"] as? [[String: Any]] ?? []
        let issues = issueNodes.compactMap { LinearIssue.from($0) }

        return LinearSprint(
            id: id,
            name: name,
            startsAt: (dict["startsAt"] as? String).flatMap { ISO8601DateFormatter().date(from: $0) },
            endsAt: (dict["endsAt"] as? String).flatMap { ISO8601DateFormatter().date(from: $0) },
            progress: dict["progress"] as? Double ?? 0,
            issues: issues
        )
    }
}

struct IssueFilter {
    var state: String?
    var assignee: String?
    var project: String?
    var priority: Int?

    func toVariables() -> [String: Any] {
        var filter: [String: Any] = [:]
        if let state = state { filter["state"] = ["name": ["eq": state]] }
        if let assignee = assignee { filter["assignee"] = ["name": ["eq": assignee]] }
        return filter.isEmpty ? [:] : ["filter": filter]
    }
}

struct CreateIssueInput {
    let title: String
    let description: String?
    let teamId: String
    let priority: Int?
    let stateId: String?

    func toVariables() -> [String: Any] {
        var input: [String: Any] = [
            "title": title,
            "teamId": teamId
        ]
        if let description = description { input["description"] = description }
        if let priority = priority { input["priority"] = priority }
        if let stateId = stateId { input["stateId"] = stateId }
        return input
    }
}

struct UpdateIssueInput {
    var stateId: String?
    var assigneeId: String?
    var priority: Int?

    func toVariables() -> [String: Any] {
        var input: [String: Any] = [:]
        if let stateId = stateId { input["stateId"] = stateId }
        if let assigneeId = assigneeId { input["assigneeId"] = assigneeId }
        if let priority = priority { input["priority"] = priority }
        return input
    }
}

// MARK: - Errors

enum LinearError: LocalizedError {
    case invalidResponse
    case createFailed
    case updateFailed
    case commentFailed
    case notConnected

    var errorDescription: String? {
        switch self {
        case .invalidResponse: return "Invalid response from Linear"
        case .createFailed: return "Failed to create issue"
        case .updateFailed: return "Failed to update issue"
        case .commentFailed: return "Failed to add comment"
        case .notConnected: return "Linear is not connected"
        }
    }
}
