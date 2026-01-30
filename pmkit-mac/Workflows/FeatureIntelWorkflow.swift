import Foundation

/// Feature intelligence workflow - surfaces customer themes and recommendations
@MainActor
final class FeatureIntelWorkflow {
    // MARK: - Dependencies

    private let integrationManager: IntegrationManager
    private let storageManager: LocalStorageManager

    // MARK: - Initialization

    init(integrationManager: IntegrationManager, storageManager: LocalStorageManager) {
        self.integrationManager = integrationManager
        self.storageManager = storageManager
    }

    // MARK: - Execution

    func execute(topic: String? = nil) async throws -> WorkflowResult {
        let startTime = Date()

        // Fetch feedback from various sources
        var allFeedback: [FeedbackItem] = []

        if integrationManager.isConnected(.zendesk) {
            let supportFeedback = try await fetchZendeskFeedback(topic: topic)
            allFeedback.append(contentsOf: supportFeedback)
        }

        if integrationManager.isConnected(.slack) {
            let slackFeedback = try await fetchSlackFeedback(topic: topic)
            allFeedback.append(contentsOf: slackFeedback)
        }

        if integrationManager.isConnected(.linear) || integrationManager.isConnected(.jira) {
            let ticketFeedback = try await fetchTicketFeedback(topic: topic)
            allFeedback.append(contentsOf: ticketFeedback)
        }

        // Cluster feedback into themes
        let themes = clusterFeedback(feedback: allFeedback)

        // Generate recommendations
        let recommendations = generateRecommendations(themes: themes)

        // Build intelligence report
        let report = FeatureIntelReport(
            topic: topic,
            generatedAt: Date(),
            feedbackCount: allFeedback.count,
            themes: themes,
            recommendations: recommendations,
            summary: buildSummary(themes: themes, topic: topic)
        )

        // Save artifacts
        let identifier = topic.map { sanitizeIdentifier($0) }
        let artifactPath = try await saveReportArtifacts(report: report, identifier: identifier, startTime: startTime)

        return WorkflowResult(
            success: true,
            summary: report.summary,
            artifactPath: artifactPath
        )
    }

    // MARK: - Data Fetching

    private func fetchZendeskFeedback(topic: String?) async throws -> [FeedbackItem] {
        // Would call backend API
        return [
            FeedbackItem(
                source: "zendesk",
                content: "We really need better export options for our reports",
                customer: "Acme Corp",
                arr: 50000,
                sentiment: "negative",
                timestamp: Date().addingTimeInterval(-86400 * 2)
            ),
            FeedbackItem(
                source: "zendesk",
                content: "The dashboard is too slow to load, especially with large datasets",
                customer: "TechStart Inc",
                arr: 25000,
                sentiment: "negative",
                timestamp: Date().addingTimeInterval(-86400 * 3)
            ),
            FeedbackItem(
                source: "zendesk",
                content: "Love the new API! Would be great to have webhooks too",
                customer: "DataFlow",
                arr: 100000,
                sentiment: "positive",
                timestamp: Date().addingTimeInterval(-86400 * 1)
            )
        ]
    }

    private func fetchSlackFeedback(topic: String?) async throws -> [FeedbackItem] {
        // Would call backend API
        return [
            FeedbackItem(
                source: "slack",
                content: "Customer asking about SSO support timeline",
                customer: "Enterprise Co",
                arr: 200000,
                sentiment: "neutral",
                timestamp: Date().addingTimeInterval(-86400 * 1)
            )
        ]
    }

    private func fetchTicketFeedback(topic: String?) async throws -> [FeedbackItem] {
        // Would call backend API
        return [
            FeedbackItem(
                source: "linear",
                content: "Feature request: bulk actions in the admin panel",
                customer: nil,
                arr: nil,
                sentiment: "neutral",
                timestamp: Date().addingTimeInterval(-86400 * 5)
            )
        ]
    }

    // MARK: - Analysis

    private func clusterFeedback(feedback: [FeedbackItem]) -> [FeatureTheme] {
        // In production, this would use LLM-based clustering
        // For now, return predefined themes
        return [
            FeatureTheme(
                name: "Export & Reporting",
                description: "Customers want better export options and report customization",
                feedbackCount: 5,
                impactedARR: 150000,
                sentiment: "negative",
                sampleFeedback: ["We really need better export options for our reports"],
                requestedBy: ["Acme Corp", "DataFlow", "TechStart Inc"]
            ),
            FeatureTheme(
                name: "Performance",
                description: "Dashboard and data loading speed concerns",
                feedbackCount: 3,
                impactedARR: 75000,
                sentiment: "negative",
                sampleFeedback: ["The dashboard is too slow to load"],
                requestedBy: ["TechStart Inc"]
            ),
            FeatureTheme(
                name: "Enterprise Features",
                description: "SSO, audit logs, and compliance features",
                feedbackCount: 4,
                impactedARR: 400000,
                sentiment: "neutral",
                sampleFeedback: ["Customer asking about SSO support timeline"],
                requestedBy: ["Enterprise Co"]
            ),
            FeatureTheme(
                name: "API & Integrations",
                description: "Webhooks, API improvements, and third-party integrations",
                feedbackCount: 3,
                impactedARR: 175000,
                sentiment: "positive",
                sampleFeedback: ["Love the new API! Would be great to have webhooks too"],
                requestedBy: ["DataFlow"]
            )
        ]
    }

    private func generateRecommendations(themes: [FeatureTheme]) -> [Recommendation] {
        // Sort themes by impacted ARR
        let sortedThemes = themes.sorted { $0.impactedARR > $1.impactedARR }

        return sortedThemes.prefix(3).enumerated().map { index, theme in
            Recommendation(
                rank: index + 1,
                theme: theme.name,
                rationale: "High ARR impact (\(formatCurrency(theme.impactedARR))) with \(theme.feedbackCount) requests",
                suggestedAction: "Prioritize in next quarter roadmap",
                effortEstimate: index == 0 ? "Large" : "Medium"
            )
        }
    }

    private func buildSummary(themes: [FeatureTheme], topic: String?) -> String {
        let topTheme = themes.sorted { $0.impactedARR > $1.impactedARR }.first
        var summary = "Feature intelligence report: "

        if let topic = topic {
            summary += "Focused on \(topic). "
        }

        summary += "Found \(themes.count) themes across customer feedback. "

        if let top = topTheme {
            summary += "Top priority: \(top.name) impacting \(formatCurrency(top.impactedARR)) ARR."
        }

        return summary
    }

    // MARK: - Artifact Saving

    private func saveReportArtifacts(report: FeatureIntelReport, identifier: String?, startTime: Date) async throws -> String {
        let folderPath = storageManager.createWorkflowFolder(type: "feature-intelligence", identifier: identifier)

        // Build markdown content
        let markdown = buildMarkdown(report: report)

        // Build JSON content
        let json = buildJSON(report: report, startTime: startTime)

        // Save files
        try storageManager.writeFile(path: "\(folderPath)/output.md", content: markdown)
        try storageManager.writeFile(path: "\(folderPath)/output.json", content: json)

        return folderPath
    }

    private func buildMarkdown(report: FeatureIntelReport) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .long

        var md = """
        # Feature Intelligence Report

        **Generated:** \(formatter.string(from: report.generatedAt))

        """

        if let topic = report.topic {
            md += "**Focus:** \(topic)\n"
        }

        md += "**Feedback Analyzed:** \(report.feedbackCount)\n\n"
        md += "---\n\n"

        // Themes section
        md += "## Themes\n\n"
        for (index, theme) in report.themes.enumerated() {
            md += "### \(index + 1). \(theme.name)\n\n"
            md += "\(theme.description)\n\n"
            md += "- **Requests:** \(theme.feedbackCount)\n"
            md += "- **Impacted ARR:** \(formatCurrency(theme.impactedARR))\n"
            md += "- **Sentiment:** \(theme.sentiment.capitalized)\n"
            md += "- **Requested by:** \(theme.requestedBy.joined(separator: ", "))\n\n"

            md += "**Sample Feedback:**\n"
            for sample in theme.sampleFeedback.prefix(2) {
                md += "> \"\(sample)\"\n\n"
            }
        }

        // Recommendations section
        if !report.recommendations.isEmpty {
            md += "---\n\n## Recommendations\n\n"
            for rec in report.recommendations {
                md += "### #\(rec.rank): \(rec.theme)\n\n"
                md += "**Rationale:** \(rec.rationale)\n\n"
                md += "**Suggested Action:** \(rec.suggestedAction)\n\n"
                md += "**Effort:** \(rec.effortEstimate)\n\n"
            }
        }

        md += "---\n\n*Generated by pmkit*\n"

        return md
    }

    private func buildJSON(report: FeatureIntelReport, startTime: Date) -> String {
        let endTime = Date()
        let durationMs = Int(endTime.timeIntervalSince(startTime) * 1000)

        var json: [String: Any] = [
            "type": "feature_intelligence",
            "version": "1.0",
            "generated_at": ISO8601DateFormatter().string(from: report.generatedAt),
            "duration_ms": durationMs,
            "feedback_count": report.feedbackCount,
            "theme_count": report.themes.count,
            "summary": report.summary
        ]

        if let topic = report.topic {
            json["topic"] = topic
        }

        json["themes"] = report.themes.map { theme -> [String: Any] in
            [
                "name": theme.name,
                "description": theme.description,
                "feedback_count": theme.feedbackCount,
                "impacted_arr": theme.impactedARR,
                "sentiment": theme.sentiment,
                "requested_by": theme.requestedBy
            ]
        }

        json["recommendations"] = report.recommendations.map { rec -> [String: Any] in
            [
                "rank": rec.rank,
                "theme": rec.theme,
                "rationale": rec.rationale,
                "suggested_action": rec.suggestedAction,
                "effort_estimate": rec.effortEstimate
            ]
        }

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

    private func formatCurrency(_ amount: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD"
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: amount)) ?? "$\(amount)"
    }
}

// MARK: - Data Types

struct FeedbackItem {
    let source: String
    let content: String
    let customer: String?
    let arr: Int?
    let sentiment: String
    let timestamp: Date
}

struct FeatureTheme {
    let name: String
    let description: String
    let feedbackCount: Int
    let impactedARR: Int
    let sentiment: String
    let sampleFeedback: [String]
    let requestedBy: [String]
}

struct Recommendation {
    let rank: Int
    let theme: String
    let rationale: String
    let suggestedAction: String
    let effortEstimate: String
}

struct FeatureIntelReport {
    let topic: String?
    let generatedAt: Date
    let feedbackCount: Int
    let themes: [FeatureTheme]
    let recommendations: [Recommendation]
    let summary: String
}
