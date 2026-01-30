import Foundation

/// Daily brief workflow - synthesizes overnight activity
@MainActor
final class DailyBriefWorkflow {
    // MARK: - Dependencies

    private let integrationManager: IntegrationManager
    private let storageManager: LocalStorageManager

    // MARK: - Configuration

    private let defaultTimeframeHours: Int = 24

    // MARK: - Initialization

    init(integrationManager: IntegrationManager, storageManager: LocalStorageManager) {
        self.integrationManager = integrationManager
        self.storageManager = storageManager
    }

    // MARK: - Execution

    func execute(timeframeHours: Int? = nil) async throws -> WorkflowResult {
        let hours = timeframeHours ?? defaultTimeframeHours
        let startTime = Date()

        // Fetch data from all connected sources
        var slackData: SlackBriefData?
        var ticketData: TicketBriefData?
        var supportData: SupportBriefData?

        // Fetch Slack activity
        if integrationManager.isConnected(.slack) {
            slackData = try await fetchSlackActivity(hours: hours)
        }

        // Fetch ticket data (Linear or Jira)
        if integrationManager.isConnected(.linear) || integrationManager.isConnected(.jira) {
            ticketData = try await fetchTicketActivity(hours: hours)
        }

        // Fetch support data (Zendesk)
        if integrationManager.isConnected(.zendesk) {
            supportData = try await fetchSupportActivity(hours: hours)
        }

        // Build brief content
        let brief = buildBrief(
            slack: slackData,
            tickets: ticketData,
            support: supportData,
            timeframeHours: hours
        )

        // Save artifacts
        let artifactPath = try await saveBriefArtifacts(brief: brief, startTime: startTime)

        return WorkflowResult(
            success: true,
            summary: brief.summary,
            artifactPath: artifactPath
        )
    }

    // MARK: - Data Fetching

    private func fetchSlackActivity(hours: Int) async throws -> SlackBriefData {
        // This would call the pmkit backend API
        // For now, return placeholder data
        return SlackBriefData(
            channels: [
                SlackChannelActivity(
                    channelName: "#backend",
                    messageCount: 15,
                    highlights: ["Deployment issue flagged at 2am, resolved by 4am"]
                ),
                SlackChannelActivity(
                    channelName: "#product",
                    messageCount: 8,
                    highlights: ["Q2 roadmap discussion ongoing"]
                )
            ],
            mentions: 3,
            directMessages: 2
        )
    }

    private func fetchTicketActivity(hours: Int) async throws -> TicketBriefData {
        // This would call the pmkit backend API
        return TicketBriefData(
            sprintName: "Sprint 23",
            sprintProgress: 0.8,
            completedYesterday: [
                TicketSummary(id: "PM-231", title: "Auth token refresh logic"),
                TicketSummary(id: "PM-232", title: "Dashboard loading optimization")
            ],
            inProgress: [
                TicketSummary(id: "PM-233", title: "Search filters UI"),
                TicketSummary(id: "PM-234", title: "API rate limiting")
            ],
            blocked: [
                BlockedTicket(
                    id: "PM-235",
                    title: "Auth refactor",
                    blockedReason: "Waiting on schema decision",
                    blockedDays: 3
                )
            ]
        )
    }

    private func fetchSupportActivity(hours: Int) async throws -> SupportBriefData {
        // This would call the pmkit backend API
        return SupportBriefData(
            newTickets: 12,
            urgentTickets: 2,
            themes: [
                SupportTheme(theme: "Payment timeout errors", count: 5, severity: "urgent"),
                SupportTheme(theme: "Dashboard slow loading", count: 3, severity: "normal"),
                SupportTheme(theme: "Export feature requests", count: 2, severity: "low")
            ]
        )
    }

    // MARK: - Brief Building

    private func buildBrief(
        slack: SlackBriefData?,
        tickets: TicketBriefData?,
        support: SupportBriefData?,
        timeframeHours: Int
    ) -> DailyBrief {
        var sections: [BriefSection] = []
        var actionItems: [ActionItem] = []
        var summaryParts: [String] = []

        // Slack section
        if let slack = slack {
            var slackContent = ""
            for channel in slack.channels {
                slackContent += "### \(channel.channelName)\n"
                for highlight in channel.highlights {
                    slackContent += "- \(highlight)\n"
                }
                slackContent += "\n"
            }
            sections.append(BriefSection(
                title: "Slack Activity",
                content: slackContent,
                icon: "number"
            ))
            summaryParts.append("\(slack.channels.count) active channels")
        }

        // Tickets section
        if let tickets = tickets {
            var ticketContent = "**\(tickets.sprintName)** — \(Int(tickets.sprintProgress * 100))% complete\n\n"

            if !tickets.completedYesterday.isEmpty {
                ticketContent += "### Completed Yesterday\n"
                for ticket in tickets.completedYesterday {
                    ticketContent += "- \(ticket.id): \(ticket.title)\n"
                }
                ticketContent += "\n"
            }

            if !tickets.blocked.isEmpty {
                ticketContent += "### Blocked\n"
                for ticket in tickets.blocked {
                    ticketContent += "- **\(ticket.id): \(ticket.title)** — \(ticket.blockedReason) (\(ticket.blockedDays) days)\n"
                    actionItems.append(ActionItem(
                        task: "Unblock \(ticket.id): \(ticket.blockedReason)",
                        priority: "high",
                        relatedTicket: ticket.id
                    ))
                }
            }

            sections.append(BriefSection(
                title: "Sprint Status",
                content: ticketContent,
                icon: "list.bullet.rectangle"
            ))
            summaryParts.append("\(tickets.blocked.count) blocked tickets")
        }

        // Support section
        if let support = support {
            var supportContent = "**\(support.newTickets) new tickets** (\(support.urgentTickets) urgent)\n\n"
            supportContent += "### Top Themes\n"
            for (index, theme) in support.themes.enumerated() {
                supportContent += "\(index + 1). \(theme.theme) (\(theme.count) tickets) — \(theme.severity.capitalized)\n"
                if theme.severity == "urgent" {
                    actionItems.append(ActionItem(
                        task: "Review \(theme.theme) (\(theme.count) tickets)",
                        priority: "high",
                        relatedTicket: nil
                    ))
                }
            }

            sections.append(BriefSection(
                title: "Support",
                content: supportContent,
                icon: "headphones"
            ))
            summaryParts.append("\(support.urgentTickets) urgent support tickets")
        }

        let summary = "Your daily brief: \(summaryParts.joined(separator: ", "))."

        return DailyBrief(
            generatedAt: Date(),
            timeframeHours: timeframeHours,
            summary: summary,
            sections: sections,
            actionItems: actionItems
        )
    }

    // MARK: - Artifact Saving

    private func saveBriefArtifacts(brief: DailyBrief, startTime: Date) async throws -> String {
        let folderPath = storageManager.createWorkflowFolder(type: "daily-brief")

        // Build markdown content
        let markdown = buildMarkdown(brief: brief)

        // Build JSON content
        let json = buildJSON(brief: brief, startTime: startTime)

        // Save files
        try storageManager.writeFile(path: "\(folderPath)/output.md", content: markdown)
        try storageManager.writeFile(path: "\(folderPath)/output.json", content: json)

        return folderPath
    }

    private func buildMarkdown(brief: DailyBrief) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .long
        formatter.timeStyle = .short

        var md = """
        # Daily Brief — \(formatter.string(from: brief.generatedAt))

        Generated at \(DateFormatter.localizedString(from: brief.generatedAt, dateStyle: .none, timeStyle: .short))

        ---


        """

        for section in brief.sections {
            md += "## \(section.title)\n\n"
            md += section.content
            md += "\n---\n\n"
        }

        if !brief.actionItems.isEmpty {
            md += "## Action Items\n\n"
            for item in brief.actionItems {
                md += "- [ ] \(item.task)"
                if let ticket = item.relatedTicket {
                    md += " (\(ticket))"
                }
                md += "\n"
            }
            md += "\n"
        }

        md += "---\n\n*Generated by pmkit*\n"

        return md
    }

    private func buildJSON(brief: DailyBrief, startTime: Date) -> String {
        let endTime = Date()
        let durationMs = Int(endTime.timeIntervalSince(startTime) * 1000)

        let json: [String: Any] = [
            "type": "daily_brief",
            "version": "1.0",
            "generated_at": ISO8601DateFormatter().string(from: brief.generatedAt),
            "duration_ms": durationMs,
            "timeframe_hours": brief.timeframeHours,
            "summary": brief.summary,
            "sections": brief.sections.map { section -> [String: Any] in
                [
                    "title": section.title,
                    "icon": section.icon,
                    "content": section.content
                ]
            },
            "action_items": brief.actionItems.map { item -> [String: Any] in
                var dict: [String: Any] = [
                    "task": item.task,
                    "priority": item.priority
                ]
                if let ticket = item.relatedTicket {
                    dict["related_ticket"] = ticket
                }
                return dict
            },
            "metadata": [
                "app_version": "1.0.0",
                "llm_model": "claude-sonnet-4-20250514"
            ]
        ]

        if let data = try? JSONSerialization.data(withJSONObject: json, options: [.prettyPrinted, .sortedKeys]),
           let string = String(data: data, encoding: .utf8) {
            return string
        }
        return "{}"
    }
}

// MARK: - Data Types

struct SlackBriefData {
    let channels: [SlackChannelActivity]
    let mentions: Int
    let directMessages: Int
}

struct SlackChannelActivity {
    let channelName: String
    let messageCount: Int
    let highlights: [String]
}

struct TicketBriefData {
    let sprintName: String
    let sprintProgress: Double
    let completedYesterday: [TicketSummary]
    let inProgress: [TicketSummary]
    let blocked: [BlockedTicket]
}

struct TicketSummary {
    let id: String
    let title: String
}

struct BlockedTicket {
    let id: String
    let title: String
    let blockedReason: String
    let blockedDays: Int
}

struct SupportBriefData {
    let newTickets: Int
    let urgentTickets: Int
    let themes: [SupportTheme]
}

struct SupportTheme {
    let theme: String
    let count: Int
    let severity: String
}

struct DailyBrief {
    let generatedAt: Date
    let timeframeHours: Int
    let summary: String
    let sections: [BriefSection]
    let actionItems: [ActionItem]
}

struct BriefSection {
    let title: String
    let content: String
    let icon: String
}

struct ActionItem {
    let task: String
    let priority: String
    let relatedTicket: String?
}
