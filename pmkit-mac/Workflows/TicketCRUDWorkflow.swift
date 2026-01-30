import Foundation

/// Ticket CRUD workflow - create, read, update tickets in Linear/Jira
@MainActor
final class TicketCRUDWorkflow {
    // MARK: - Dependencies

    private let integrationManager: IntegrationManager

    // MARK: - Initialization

    init(integrationManager: IntegrationManager) {
        self.integrationManager = integrationManager
    }

    // MARK: - Create

    func createTicket(
        title: String,
        description: String,
        type: String,
        priority: String,
        tool: String
    ) async throws -> TicketResult {
        // Determine which tool to use
        let targetTool = resolveTargetTool(requested: tool)

        guard let tool = targetTool else {
            throw TicketError.noToolConnected
        }

        switch tool {
        case .linear:
            return try await createLinearTicket(
                title: title,
                description: description,
                type: type,
                priority: priority
            )
        case .jira:
            return try await createJiraTicket(
                title: title,
                description: description,
                type: type,
                priority: priority
            )
        default:
            throw TicketError.unsupportedTool
        }
    }

    private func createLinearTicket(
        title: String,
        description: String,
        type: String,
        priority: String
    ) async throws -> TicketResult {
        // Would call Linear GraphQL API via backend
        // For now, return mock result

        let ticketId = "PM-\(Int.random(in: 100...999))"
        let url = "https://linear.app/mycompany/issue/\(ticketId)"

        return TicketResult(
            success: true,
            ticketId: ticketId,
            ticketUrl: url,
            message: "Created \(type) '\(title)' in Linear as \(ticketId)"
        )
    }

    private func createJiraTicket(
        title: String,
        description: String,
        type: String,
        priority: String
    ) async throws -> TicketResult {
        // Would call Jira REST API via backend
        // For now, return mock result

        let ticketId = "PROJ-\(Int.random(in: 100...999))"
        let url = "https://mycompany.atlassian.net/browse/\(ticketId)"

        return TicketResult(
            success: true,
            ticketId: ticketId,
            ticketUrl: url,
            message: "Created \(type) '\(title)' in Jira as \(ticketId)"
        )
    }

    // MARK: - Update

    func updateTicket(
        identifier: String,
        action: String,
        value: String
    ) async throws -> TicketResult {
        // Determine which tool the ticket belongs to
        let tool = inferToolFromIdentifier(identifier)

        guard let tool = tool else {
            throw TicketError.ticketNotFound(identifier)
        }

        switch (tool, action) {
        case (.linear, "set_status"):
            return try await updateLinearStatus(ticketId: identifier, status: value)
        case (.linear, "add_comment"):
            return try await addLinearComment(ticketId: identifier, comment: value)
        case (.linear, "assign"):
            return try await assignLinearTicket(ticketId: identifier, assignee: value)
        case (.linear, "set_priority"):
            return try await updateLinearPriority(ticketId: identifier, priority: value)
        case (.jira, "set_status"):
            return try await updateJiraStatus(ticketId: identifier, status: value)
        case (.jira, "add_comment"):
            return try await addJiraComment(ticketId: identifier, comment: value)
        case (.jira, "assign"):
            return try await assignJiraTicket(ticketId: identifier, assignee: value)
        case (.jira, "set_priority"):
            return try await updateJiraPriority(ticketId: identifier, priority: value)
        default:
            throw TicketError.unsupportedAction(action)
        }
    }

    // Linear update methods
    private func updateLinearStatus(ticketId: String, status: String) async throws -> TicketResult {
        // Would call Linear GraphQL API
        return TicketResult(
            success: true,
            ticketId: ticketId,
            ticketUrl: "https://linear.app/mycompany/issue/\(ticketId)",
            message: "Updated \(ticketId) status to '\(status)'"
        )
    }

    private func addLinearComment(ticketId: String, comment: String) async throws -> TicketResult {
        return TicketResult(
            success: true,
            ticketId: ticketId,
            ticketUrl: "https://linear.app/mycompany/issue/\(ticketId)",
            message: "Added comment to \(ticketId)"
        )
    }

    private func assignLinearTicket(ticketId: String, assignee: String) async throws -> TicketResult {
        return TicketResult(
            success: true,
            ticketId: ticketId,
            ticketUrl: "https://linear.app/mycompany/issue/\(ticketId)",
            message: "Assigned \(ticketId) to \(assignee)"
        )
    }

    private func updateLinearPriority(ticketId: String, priority: String) async throws -> TicketResult {
        return TicketResult(
            success: true,
            ticketId: ticketId,
            ticketUrl: "https://linear.app/mycompany/issue/\(ticketId)",
            message: "Set \(ticketId) priority to \(priority)"
        )
    }

    // Jira update methods
    private func updateJiraStatus(ticketId: String, status: String) async throws -> TicketResult {
        return TicketResult(
            success: true,
            ticketId: ticketId,
            ticketUrl: "https://mycompany.atlassian.net/browse/\(ticketId)",
            message: "Updated \(ticketId) status to '\(status)'"
        )
    }

    private func addJiraComment(ticketId: String, comment: String) async throws -> TicketResult {
        return TicketResult(
            success: true,
            ticketId: ticketId,
            ticketUrl: "https://mycompany.atlassian.net/browse/\(ticketId)",
            message: "Added comment to \(ticketId)"
        )
    }

    private func assignJiraTicket(ticketId: String, assignee: String) async throws -> TicketResult {
        return TicketResult(
            success: true,
            ticketId: ticketId,
            ticketUrl: "https://mycompany.atlassian.net/browse/\(ticketId)",
            message: "Assigned \(ticketId) to \(assignee)"
        )
    }

    private func updateJiraPriority(ticketId: String, priority: String) async throws -> TicketResult {
        return TicketResult(
            success: true,
            ticketId: ticketId,
            ticketUrl: "https://mycompany.atlassian.net/browse/\(ticketId)",
            message: "Set \(ticketId) priority to \(priority)"
        )
    }

    // MARK: - Query

    func queryTickets(query: String) async throws -> TicketQueryResult {
        var allTickets: [TicketInfo] = []

        // Query both tools if connected
        if integrationManager.isConnected(.linear) {
            let linearTickets = try await queryLinearTickets(query: query)
            allTickets.append(contentsOf: linearTickets)
        }

        if integrationManager.isConnected(.jira) {
            let jiraTickets = try await queryJiraTickets(query: query)
            allTickets.append(contentsOf: jiraTickets)
        }

        let summary = buildQuerySummary(tickets: allTickets, query: query)

        return TicketQueryResult(
            success: true,
            tickets: allTickets,
            summary: summary
        )
    }

    private func queryLinearTickets(query: String) async throws -> [TicketInfo] {
        // Would call Linear GraphQL API
        // Parse query for filters (status, assignee, project, etc.)

        return [
            TicketInfo(
                id: "PM-233",
                title: "Search filters UI",
                status: "In Progress",
                assignee: "Sarah",
                priority: "High",
                url: "https://linear.app/mycompany/issue/PM-233"
            ),
            TicketInfo(
                id: "PM-235",
                title: "Auth refactor",
                status: "Blocked",
                assignee: "David",
                priority: "High",
                url: "https://linear.app/mycompany/issue/PM-235"
            )
        ]
    }

    private func queryJiraTickets(query: String) async throws -> [TicketInfo] {
        // Would call Jira REST API with JQL
        return []
    }

    private func buildQuerySummary(tickets: [TicketInfo], query: String) -> String {
        if tickets.isEmpty {
            return "No tickets found matching '\(query)'"
        }

        let blocked = tickets.filter { $0.status.lowercased() == "blocked" }.count
        let inProgress = tickets.filter { $0.status.lowercased().contains("progress") }.count

        var summary = "Found \(tickets.count) tickets"
        if blocked > 0 {
            summary += ", \(blocked) blocked"
        }
        if inProgress > 0 {
            summary += ", \(inProgress) in progress"
        }

        return summary
    }

    // MARK: - Helpers

    private func resolveTargetTool(requested: String) -> IntegrationType? {
        switch requested.lowercased() {
        case "linear":
            return integrationManager.isConnected(.linear) ? .linear : nil
        case "jira":
            return integrationManager.isConnected(.jira) ? .jira : nil
        case "auto":
            // Prefer Linear, fall back to Jira
            if integrationManager.isConnected(.linear) {
                return .linear
            } else if integrationManager.isConnected(.jira) {
                return .jira
            }
            return nil
        default:
            return nil
        }
    }

    private func inferToolFromIdentifier(_ identifier: String) -> IntegrationType? {
        // Linear typically uses short prefixes like "PM-123", "ENG-456"
        // Jira uses "PROJECT-123" format

        let pattern = #"^[A-Z]+-\d+$"#
        guard identifier.range(of: pattern, options: .regularExpression) != nil else {
            return nil
        }

        // Try to determine from prefix length
        let prefix = identifier.components(separatedBy: "-").first ?? ""

        if prefix.count <= 3 {
            // Short prefix like "PM", "ENG" - likely Linear
            return integrationManager.isConnected(.linear) ? .linear : nil
        } else {
            // Longer prefix like "PROJ", "MYCOMPANY" - likely Jira
            return integrationManager.isConnected(.jira) ? .jira : nil
        }
    }
}

// MARK: - Errors

enum TicketError: LocalizedError {
    case noToolConnected
    case unsupportedTool
    case ticketNotFound(String)
    case unsupportedAction(String)
    case updateFailed(String)

    var errorDescription: String? {
        switch self {
        case .noToolConnected:
            return "No ticket tool (Linear or Jira) is connected"
        case .unsupportedTool:
            return "The specified tool is not supported"
        case .ticketNotFound(let id):
            return "Ticket '\(id)' not found"
        case .unsupportedAction(let action):
            return "Action '\(action)' is not supported"
        case .updateFailed(let reason):
            return "Failed to update ticket: \(reason)"
        }
    }
}
