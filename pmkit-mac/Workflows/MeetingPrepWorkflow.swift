import Foundation

/// Meeting prep workflow - gathers context for upcoming meetings
final class MeetingPrepWorkflow {
    // MARK: - Dependencies

    private let integrationManager: IntegrationManager
    private let storageManager: LocalStorageManager

    // MARK: - Initialization

    init(integrationManager: IntegrationManager, storageManager: LocalStorageManager) {
        self.integrationManager = integrationManager
        self.storageManager = storageManager
    }

    // MARK: - Execution

    func execute(meetingIdentifier: String) async throws -> WorkflowResult {
        let startTime = Date()

        // Find the meeting
        let meeting = try await findMeeting(identifier: meetingIdentifier)

        // Fetch context for each attendee/company
        var attendeeContexts: [AttendeeContext] = []
        for attendee in meeting.attendees {
            let context = try await fetchAttendeeContext(attendee: attendee)
            attendeeContexts.append(context)
        }

        // Fetch related tickets and conversations
        let relatedTickets = try await fetchRelatedTickets(meeting: meeting)
        let recentConversations = try await fetchRecentConversations(meeting: meeting)

        // Build meeting prep
        let prep = buildMeetingPrep(
            meeting: meeting,
            attendeeContexts: attendeeContexts,
            relatedTickets: relatedTickets,
            recentConversations: recentConversations
        )

        // Save artifacts
        let identifier = sanitizeIdentifier(meetingIdentifier)
        let artifactPath = try await savePrepArtifacts(prep: prep, identifier: identifier, startTime: startTime)

        return WorkflowResult(
            success: true,
            summary: prep.summary,
            artifactPath: artifactPath
        )
    }

    // MARK: - Meeting Discovery

    private func findMeeting(identifier: String) async throws -> MeetingInfo {
        // This would call Google Calendar API via backend
        // Parse identifier (time like "2pm", name like "Acme", or "next meeting")

        // For now, return placeholder data
        return MeetingInfo(
            id: "meeting_123",
            title: "Quarterly Review with Acme",
            startTime: Date().addingTimeInterval(3600),
            endTime: Date().addingTimeInterval(7200),
            attendees: [
                Attendee(name: "Sarah Chen", email: "sarah@acme.com", company: "Acme"),
                Attendee(name: "John Smith", email: "john@acme.com", company: "Acme")
            ],
            description: "Q1 review and Q2 planning discussion"
        )
    }

    // MARK: - Context Fetching

    private func fetchAttendeeContext(attendee: Attendee) async throws -> AttendeeContext {
        // Would fetch from various sources
        return AttendeeContext(
            attendee: attendee,
            role: "VP of Product",
            lastInteraction: Date().addingTimeInterval(-86400 * 7),
            interactionNotes: "Discussed pricing concerns last week",
            companyInfo: CompanyInfo(
                name: attendee.company ?? "Unknown",
                arr: "$500K",
                contractRenewal: Date().addingTimeInterval(86400 * 90),
                healthScore: "Good"
            )
        )
    }

    private func fetchRelatedTickets(meeting: MeetingInfo) async throws -> [RelatedTicket] {
        // Would search for tickets related to attendees/companies
        return [
            RelatedTicket(
                id: "PM-456",
                title: "API performance issues for Acme",
                status: "In Progress",
                assignee: "David",
                priority: "High"
            ),
            RelatedTicket(
                id: "PM-421",
                title: "Custom reporting feature request",
                status: "Backlog",
                assignee: nil,
                priority: "Medium"
            )
        ]
    }

    private func fetchRecentConversations(meeting: MeetingInfo) async throws -> [ConversationSummary] {
        // Would fetch from Slack
        return [
            ConversationSummary(
                channel: "#customer-acme",
                timestamp: Date().addingTimeInterval(-86400 * 2),
                summary: "Discussion about API rate limits and potential solutions"
            ),
            ConversationSummary(
                channel: "#sales",
                timestamp: Date().addingTimeInterval(-86400 * 5),
                summary: "Renewal discussion - they want a multi-year deal"
            )
        ]
    }

    // MARK: - Prep Building

    private func buildMeetingPrep(
        meeting: MeetingInfo,
        attendeeContexts: [AttendeeContext],
        relatedTickets: [RelatedTicket],
        recentConversations: [ConversationSummary]
    ) -> MeetingPrep {
        var talkingPoints: [String] = []

        // Generate talking points based on context
        if !relatedTickets.isEmpty {
            let openIssues = relatedTickets.filter { $0.status != "Done" }
            if !openIssues.isEmpty {
                talkingPoints.append("Address \(openIssues.count) open issues: \(openIssues.map { $0.title }.joined(separator: ", "))")
            }
        }

        if let companyInfo = attendeeContexts.first?.companyInfo {
            if let renewal = companyInfo.contractRenewal {
                let daysUntilRenewal = Calendar.current.dateComponents([.day], from: Date(), to: renewal).day ?? 0
                if daysUntilRenewal < 90 {
                    talkingPoints.append("Contract renewal in \(daysUntilRenewal) days - discuss terms")
                }
            }
        }

        let summary = "Meeting prep for \(meeting.title): \(attendeeContexts.count) attendees, \(relatedTickets.count) open issues"

        return MeetingPrep(
            meeting: meeting,
            attendeeContexts: attendeeContexts,
            relatedTickets: relatedTickets,
            recentConversations: recentConversations,
            talkingPoints: talkingPoints,
            summary: summary
        )
    }

    // MARK: - Artifact Saving

    private func savePrepArtifacts(prep: MeetingPrep, identifier: String, startTime: Date) async throws -> String {
        let folderPath = storageManager.createWorkflowFolder(type: "meeting-prep", identifier: identifier)

        // Build markdown content
        let markdown = buildMarkdown(prep: prep)

        // Build JSON content
        let json = buildJSON(prep: prep, startTime: startTime)

        // Save files
        try storageManager.writeFile(path: "\(folderPath)/output.md", content: markdown)
        try storageManager.writeFile(path: "\(folderPath)/output.json", content: json)

        return folderPath
    }

    private func buildMarkdown(prep: MeetingPrep) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short

        var md = """
        # Meeting Prep: \(prep.meeting.title)

        **When:** \(formatter.string(from: prep.meeting.startTime))
        **Duration:** \(Int(prep.meeting.endTime.timeIntervalSince(prep.meeting.startTime) / 60)) minutes

        ---

        ## Attendees


        """

        for context in prep.attendeeContexts {
            md += "### \(context.attendee.name)\n"
            md += "- **Email:** \(context.attendee.email)\n"
            if let role = context.role {
                md += "- **Role:** \(role)\n"
            }
            if let company = context.companyInfo {
                md += "- **Company:** \(company.name)"
                if let arr = company.arr {
                    md += " (ARR: \(arr))"
                }
                md += "\n"
            }
            if let notes = context.interactionNotes {
                md += "- **Recent:** \(notes)\n"
            }
            md += "\n"
        }

        if !prep.relatedTickets.isEmpty {
            md += "---\n\n## Open Issues\n\n"
            for ticket in prep.relatedTickets {
                md += "- **\(ticket.id):** \(ticket.title) (\(ticket.status))\n"
            }
            md += "\n"
        }

        if !prep.recentConversations.isEmpty {
            md += "---\n\n## Recent Conversations\n\n"
            for conv in prep.recentConversations {
                md += "- **\(conv.channel):** \(conv.summary)\n"
            }
            md += "\n"
        }

        if !prep.talkingPoints.isEmpty {
            md += "---\n\n## Suggested Talking Points\n\n"
            for point in prep.talkingPoints {
                md += "- [ ] \(point)\n"
            }
            md += "\n"
        }

        md += "---\n\n*Generated by pmkit*\n"

        return md
    }

    private func buildJSON(prep: MeetingPrep, startTime: Date) -> String {
        let endTime = Date()
        let durationMs = Int(endTime.timeIntervalSince(startTime) * 1000)

        let json: [String: Any] = [
            "type": "meeting_prep",
            "version": "1.0",
            "generated_at": ISO8601DateFormatter().string(from: Date()),
            "duration_ms": durationMs,
            "meeting": [
                "id": prep.meeting.id,
                "title": prep.meeting.title,
                "start_time": ISO8601DateFormatter().string(from: prep.meeting.startTime),
                "end_time": ISO8601DateFormatter().string(from: prep.meeting.endTime)
            ],
            "attendee_count": prep.attendeeContexts.count,
            "open_issues_count": prep.relatedTickets.count,
            "talking_points": prep.talkingPoints
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
            .replacingOccurrences(of: "'", with: "")
            .filter { $0.isLetter || $0.isNumber || $0 == "-" }
    }
}

// MARK: - Data Types

struct MeetingInfo {
    let id: String
    let title: String
    let startTime: Date
    let endTime: Date
    let attendees: [Attendee]
    let description: String?
}

struct Attendee {
    let name: String
    let email: String
    let company: String?
}

struct AttendeeContext {
    let attendee: Attendee
    let role: String?
    let lastInteraction: Date?
    let interactionNotes: String?
    let companyInfo: CompanyInfo?
}

struct CompanyInfo {
    let name: String
    let arr: String?
    let contractRenewal: Date?
    let healthScore: String?
}

struct RelatedTicket {
    let id: String
    let title: String
    let status: String
    let assignee: String?
    let priority: String?
}

struct ConversationSummary {
    let channel: String
    let timestamp: Date
    let summary: String
}

struct MeetingPrep {
    let meeting: MeetingInfo
    let attendeeContexts: [AttendeeContext]
    let relatedTickets: [RelatedTicket]
    let recentConversations: [ConversationSummary]
    let talkingPoints: [String]
    let summary: String
}
