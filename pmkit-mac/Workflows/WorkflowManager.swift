import Foundation

/// Coordinates workflow execution using the configured LLM provider
@MainActor
final class WorkflowManager {
    // MARK: - Dependencies

    private let storageManager: LocalStorageManager
    private var llmService: LLMService { LLMService.shared }

    // MARK: - Initialization

    init(storageManager: LocalStorageManager) {
        self.storageManager = storageManager
    }

    // MARK: - Workflow Execution

    /// Run daily brief workflow - generates a summary of PM activities
    func runDailyBrief() async -> WorkflowResult {
        // In OSS mode, Claude generates responses based on conversation context
        // without external integrations
        return WorkflowResult(
            success: true,
            summary: "Daily brief is available through voice commands. Ask me 'What's my brief?' to get started.",
            artifactPath: nil
        )
    }

    /// Run meeting prep workflow
    func runMeetingPrep(meetingIdentifier: String) async -> WorkflowResult {
        return WorkflowResult(
            success: true,
            summary: "Meeting prep for '\(meetingIdentifier)' is available through voice commands.",
            artifactPath: nil
        )
    }

    /// Run feature intelligence workflow
    func runFeatureIntelligence(topic: String?) async -> WorkflowResult {
        let topicDesc = topic ?? "general"
        return WorkflowResult(
            success: true,
            summary: "Feature intelligence for '\(topicDesc)' is available through voice commands.",
            artifactPath: nil
        )
    }

    /// Draft a PRD
    func draftPRD(featureName: String, description: String) async -> WorkflowResult {
        return WorkflowResult(
            success: true,
            summary: "PRD drafting for '\(featureName)' is available through voice commands.",
            artifactPath: nil
        )
    }

    /// Create a ticket (stub - would need integration in non-OSS mode)
    func createTicket(
        title: String,
        description: String,
        type: String,
        priority: String,
        tool: String
    ) async -> TicketResult {
        return TicketResult(
            success: false,
            ticketId: nil,
            ticketUrl: nil,
            message: "Ticket creation requires integration with Linear or Jira. This feature is not available in OSS mode."
        )
    }

    /// Update a ticket (stub - would need integration in non-OSS mode)
    func updateTicket(identifier: String, action: String, value: String) async -> TicketResult {
        return TicketResult(
            success: false,
            ticketId: identifier,
            ticketUrl: nil,
            message: "Ticket updates require integration with Linear or Jira. This feature is not available in OSS mode."
        )
    }

    /// Query tickets (stub - would need integration in non-OSS mode)
    func queryTickets(query: String) async -> TicketQueryResult {
        return TicketQueryResult(
            success: false,
            tickets: [],
            summary: "Ticket queries require integration with Linear or Jira. This feature is not available in OSS mode."
        )
    }
}

// MARK: - Result Types

struct WorkflowResult {
    let success: Bool
    let summary: String
    let artifactPath: String?
}

struct TicketResult {
    let success: Bool
    let ticketId: String?
    let ticketUrl: String?
    let message: String
}

struct TicketQueryResult {
    let success: Bool
    let tickets: [TicketInfo]
    let summary: String
}

struct TicketInfo {
    let id: String
    let title: String
    let status: String
    let assignee: String?
    let priority: String?
    let url: String?
}
