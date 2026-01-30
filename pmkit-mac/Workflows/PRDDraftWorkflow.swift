import Foundation

/// PRD drafting workflow - creates product requirements documents
final class PRDDraftWorkflow {
    // MARK: - Dependencies

    private let integrationManager: IntegrationManager
    private let storageManager: LocalStorageManager

    // MARK: - Initialization

    init(integrationManager: IntegrationManager, storageManager: LocalStorageManager) {
        self.integrationManager = integrationManager
        self.storageManager = storageManager
    }

    // MARK: - Execution

    func execute(featureName: String, description: String) async throws -> WorkflowResult {
        let startTime = Date()

        // Fetch related context
        let relatedTickets = try await fetchRelatedTickets(feature: featureName)
        let relatedDocs = try await fetchRelatedDocs(feature: featureName)
        let relatedConversations = try await fetchRelatedConversations(feature: featureName)

        // Generate PRD using LLM
        let prd = await generatePRD(
            featureName: featureName,
            description: description,
            relatedTickets: relatedTickets,
            relatedDocs: relatedDocs,
            relatedConversations: relatedConversations
        )

        // Save artifacts
        let identifier = sanitizeIdentifier(featureName)
        let artifactPath = try await savePRDArtifacts(prd: prd, identifier: identifier, startTime: startTime)

        return WorkflowResult(
            success: true,
            summary: "PRD drafted for '\(featureName)'. Saved to \(artifactPath)",
            artifactPath: artifactPath
        )
    }

    // MARK: - Context Fetching

    private func fetchRelatedTickets(feature: String) async throws -> [PRDRelatedTicket] {
        // Would search Linear/Jira for related tickets
        return [
            PRDRelatedTicket(
                id: "PM-100",
                title: "Research: user needs for \(feature)",
                status: "Done",
                url: "https://linear.app/mycompany/issue/PM-100"
            ),
            PRDRelatedTicket(
                id: "PM-150",
                title: "Design mockups for \(feature)",
                status: "In Progress",
                url: "https://linear.app/mycompany/issue/PM-150"
            )
        ]
    }

    private func fetchRelatedDocs(feature: String) async throws -> [PRDRelatedDoc] {
        // Would search Confluence/Drive for related docs
        return [
            PRDRelatedDoc(
                title: "User Research: \(feature)",
                source: "Confluence",
                url: "https://mycompany.atlassian.net/wiki/spaces/PROD/pages/123"
            )
        ]
    }

    private func fetchRelatedConversations(feature: String) async throws -> [PRDConversation] {
        // Would search Slack for related discussions
        return [
            PRDConversation(
                channel: "#product",
                timestamp: Date().addingTimeInterval(-86400 * 7),
                summary: "Team discussed \(feature) implementation approach"
            )
        ]
    }

    // MARK: - PRD Generation

    private func generatePRD(
        featureName: String,
        description: String,
        relatedTickets: [PRDRelatedTicket],
        relatedDocs: [PRDRelatedDoc],
        relatedConversations: [PRDConversation]
    ) async -> PRDDocument {
        // In production, this would call Claude to generate the full PRD
        // For now, return a structured template

        let overview = """
        This PRD outlines the requirements for \(featureName). \(description)
        """

        let problemStatement = """
        Users currently lack the ability to \(description.lowercased()). This creates friction in their workflow and limits the product's utility.
        """

        let goals = [
            "Enable users to \(description.lowercased())",
            "Improve user satisfaction and retention",
            "Reduce support tickets related to this functionality"
        ]

        let successMetrics = [
            SuccessMetric(metric: "Feature adoption rate", target: ">50% of active users within 30 days"),
            SuccessMetric(metric: "User satisfaction (NPS)", target: "Increase by 10 points"),
            SuccessMetric(metric: "Support ticket reduction", target: "30% fewer tickets in this category")
        ]

        let userStories = [
            UserStory(
                persona: "Product Manager",
                action: description,
                benefit: "I can be more efficient in my daily work"
            ),
            UserStory(
                persona: "Team Lead",
                action: "see my team's usage of \(featureName)",
                benefit: "I can ensure adoption across my team"
            )
        ]

        let requirements = [
            Requirement(
                type: "functional",
                priority: "P0",
                description: "Users must be able to \(description.lowercased())"
            ),
            Requirement(
                type: "functional",
                priority: "P1",
                description: "Users should receive confirmation after action completion"
            ),
            Requirement(
                type: "non-functional",
                priority: "P0",
                description: "Feature must load within 2 seconds"
            ),
            Requirement(
                type: "non-functional",
                priority: "P1",
                description: "Feature must work on all supported browsers"
            )
        ]

        let openQuestions = [
            "What permissions should be required to use this feature?",
            "Should this be available on mobile?",
            "How should we handle edge cases with large datasets?"
        ]

        return PRDDocument(
            title: featureName,
            author: "pmkit",
            createdAt: Date(),
            status: "Draft",
            overview: overview,
            problemStatement: problemStatement,
            goals: goals,
            successMetrics: successMetrics,
            userStories: userStories,
            requirements: requirements,
            openQuestions: openQuestions,
            relatedTickets: relatedTickets,
            relatedDocs: relatedDocs
        )
    }

    // MARK: - Artifact Saving

    private func savePRDArtifacts(prd: PRDDocument, identifier: String, startTime: Date) async throws -> String {
        let folderPath = storageManager.createWorkflowFolder(type: "prd", identifier: identifier)

        // Build markdown content
        let markdown = buildMarkdown(prd: prd)

        // Build JSON content
        let json = buildJSON(prd: prd, startTime: startTime)

        // Save files
        try storageManager.writeFile(path: "\(folderPath)/output.md", content: markdown)
        try storageManager.writeFile(path: "\(folderPath)/output.json", content: json)

        return folderPath
    }

    private func buildMarkdown(prd: PRDDocument) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .long

        var md = """
        # PRD: \(prd.title)

        | | |
        |---|---|
        | **Author** | \(prd.author) |
        | **Created** | \(formatter.string(from: prd.createdAt)) |
        | **Status** | \(prd.status) |

        ---

        ## Overview

        \(prd.overview)

        ---

        ## Problem Statement

        \(prd.problemStatement)

        ---

        ## Goals

        """

        for (index, goal) in prd.goals.enumerated() {
            md += "\(index + 1). \(goal)\n"
        }

        md += "\n---\n\n## Success Metrics\n\n"
        md += "| Metric | Target |\n"
        md += "|--------|--------|\n"
        for metric in prd.successMetrics {
            md += "| \(metric.metric) | \(metric.target) |\n"
        }

        md += "\n---\n\n## User Stories\n\n"
        for story in prd.userStories {
            md += "**As a** \(story.persona), **I want to** \(story.action), **so that** \(story.benefit).\n\n"
        }

        md += "---\n\n## Requirements\n\n"
        md += "### Functional Requirements\n\n"
        for req in prd.requirements.filter({ $0.type == "functional" }) {
            md += "- **[\(req.priority)]** \(req.description)\n"
        }

        md += "\n### Non-Functional Requirements\n\n"
        for req in prd.requirements.filter({ $0.type == "non-functional" }) {
            md += "- **[\(req.priority)]** \(req.description)\n"
        }

        if !prd.openQuestions.isEmpty {
            md += "\n---\n\n## Open Questions\n\n"
            for question in prd.openQuestions {
                md += "- [ ] \(question)\n"
            }
        }

        if !prd.relatedTickets.isEmpty {
            md += "\n---\n\n## Related Work\n\n"
            md += "### Tickets\n\n"
            for ticket in prd.relatedTickets {
                md += "- [\(ticket.id)](\(ticket.url ?? "#")): \(ticket.title) (\(ticket.status))\n"
            }
        }

        if !prd.relatedDocs.isEmpty {
            md += "\n### Documents\n\n"
            for doc in prd.relatedDocs {
                md += "- [\(doc.title)](\(doc.url ?? "#")) (\(doc.source))\n"
            }
        }

        md += "\n---\n\n*Generated by pmkit*\n"

        return md
    }

    private func buildJSON(prd: PRDDocument, startTime: Date) -> String {
        let endTime = Date()
        let durationMs = Int(endTime.timeIntervalSince(startTime) * 1000)

        let json: [String: Any] = [
            "type": "prd",
            "version": "1.0",
            "generated_at": ISO8601DateFormatter().string(from: prd.createdAt),
            "duration_ms": durationMs,
            "title": prd.title,
            "author": prd.author,
            "status": prd.status,
            "overview": prd.overview,
            "problem_statement": prd.problemStatement,
            "goals": prd.goals,
            "success_metrics": prd.successMetrics.map { ["metric": $0.metric, "target": $0.target] },
            "user_stories": prd.userStories.map { ["persona": $0.persona, "action": $0.action, "benefit": $0.benefit] },
            "requirements": prd.requirements.map { ["type": $0.type, "priority": $0.priority, "description": $0.description] },
            "open_questions": prd.openQuestions,
            "related_tickets": prd.relatedTickets.map { ["id": $0.id, "title": $0.title, "status": $0.status, "url": $0.url ?? ""] },
            "related_docs": prd.relatedDocs.map { ["title": $0.title, "source": $0.source, "url": $0.url ?? ""] }
        ]

        if let data = try? JSONSerialization.data(withJSONObject: json, options: [.prettyPrinted, .sortedKeys]),
           let string = String(data: data, encoding: .utf8) {
            return string
        }
        return "{}"
    }

    private func sanitizeIdentifier(_ identifier: String) -> String {
        identifier
            .lowercased()
            .replacingOccurrences(of: " ", with: "-")
            .filter { $0.isLetter || $0.isNumber || $0 == "-" }
    }
}

// MARK: - Data Types

struct PRDDocument {
    let title: String
    let author: String
    let createdAt: Date
    let status: String
    let overview: String
    let problemStatement: String
    let goals: [String]
    let successMetrics: [SuccessMetric]
    let userStories: [UserStory]
    let requirements: [Requirement]
    let openQuestions: [String]
    let relatedTickets: [PRDRelatedTicket]
    let relatedDocs: [PRDRelatedDoc]
}

struct SuccessMetric {
    let metric: String
    let target: String
}

struct UserStory {
    let persona: String
    let action: String
    let benefit: String
}

struct Requirement {
    let type: String  // "functional" or "non-functional"
    let priority: String  // "P0", "P1", "P2"
    let description: String
}

struct PRDRelatedTicket {
    let id: String
    let title: String
    let status: String
    let url: String?
}

struct PRDRelatedDoc {
    let title: String
    let source: String
    let url: String?
}

struct PRDConversation {
    let channel: String
    let timestamp: Date
    let summary: String
}
