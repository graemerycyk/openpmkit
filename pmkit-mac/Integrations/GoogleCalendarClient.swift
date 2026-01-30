import Foundation

/// Google Calendar API client (read-only)
final class GoogleCalendarClient {
    // MARK: - Dependencies

    private let apiClient: PMKitAPIClient

    // MARK: - Initialization

    init(apiClient: PMKitAPIClient = .shared) {
        self.apiClient = apiClient
    }

    // MARK: - Events

    func getUpcomingEvents(calendarId: String = "primary", maxResults: Int = 10) async throws -> [CalendarEvent] {
        let now = ISO8601DateFormatter().string(from: Date())
        let oneWeekLater = ISO8601DateFormatter().string(from: Date().addingTimeInterval(7 * 24 * 60 * 60))

        let response = try await apiClient.googleCalendarRequest(
            endpoint: "calendars/\(calendarId)/events",
            params: [
                "timeMin": now,
                "timeMax": oneWeekLater,
                "maxResults": String(maxResults),
                "singleEvents": "true",
                "orderBy": "startTime"
            ]
        )

        guard let items = response["items"] as? [[String: Any]] else {
            throw CalendarError.invalidResponse
        }

        return items.compactMap { CalendarEvent.from($0) }
    }

    func getEvent(calendarId: String = "primary", eventId: String) async throws -> CalendarEvent {
        let response = try await apiClient.googleCalendarRequest(
            endpoint: "calendars/\(calendarId)/events/\(eventId)",
            params: [:]
        )

        guard let event = CalendarEvent.from(response) else {
            throw CalendarError.invalidResponse
        }

        return event
    }

    func findNextMeeting() async throws -> CalendarEvent? {
        let events = try await getUpcomingEvents(maxResults: 5)
        return events.first
    }

    func findMeetingByTime(_ timeDescription: String) async throws -> CalendarEvent? {
        // Parse time descriptions like "2pm", "next meeting", "tomorrow at 3"
        let events = try await getUpcomingEvents(maxResults: 20)

        let lowercased = timeDescription.lowercased()

        // Handle "next meeting"
        if lowercased.contains("next") {
            return events.first
        }

        // Handle time-based queries like "2pm", "2:00"
        if let hour = parseHour(from: timeDescription) {
            let calendar = Calendar.current
            return events.first { event in
                let eventHour = calendar.component(.hour, from: event.startTime)
                return eventHour == hour
            }
        }

        return nil
    }

    func findMeetingByAttendee(_ name: String) async throws -> CalendarEvent? {
        let events = try await getUpcomingEvents(maxResults: 20)
        let lowercased = name.lowercased()

        return events.first { event in
            event.attendees.contains { attendee in
                attendee.name?.lowercased().contains(lowercased) == true ||
                attendee.email.lowercased().contains(lowercased)
            }
        }
    }

    // MARK: - Helpers

    private func parseHour(from text: String) -> Int? {
        let pattern = #"(\d{1,2})(?::(\d{2}))?\s*(am|pm)?"#
        guard let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive),
              let match = regex.firstMatch(in: text, range: NSRange(text.startIndex..., in: text)) else {
            return nil
        }

        guard let hourRange = Range(match.range(at: 1), in: text),
              var hour = Int(text[hourRange]) else {
            return nil
        }

        if let ampmRange = Range(match.range(at: 3), in: text) {
            let ampm = text[ampmRange].lowercased()
            if ampm == "pm" && hour < 12 {
                hour += 12
            } else if ampm == "am" && hour == 12 {
                hour = 0
            }
        }

        return hour
    }
}

// MARK: - Types

struct CalendarEvent {
    let id: String
    let summary: String
    let description: String?
    let startTime: Date
    let endTime: Date
    let attendees: [CalendarAttendee]
    let location: String?
    let meetingLink: String?
    let recurringEventId: String?

    static func from(_ dict: [String: Any]) -> CalendarEvent? {
        guard let id = dict["id"] as? String else { return nil }

        let summary = dict["summary"] as? String ?? "(No title)"

        // Parse start time
        let start = dict["start"] as? [String: Any]
        let startTimeStr = start?["dateTime"] as? String ?? start?["date"] as? String
        guard let startTime = startTimeStr.flatMap({ ISO8601DateFormatter().date(from: $0) }) else {
            return nil
        }

        // Parse end time
        let end = dict["end"] as? [String: Any]
        let endTimeStr = end?["dateTime"] as? String ?? end?["date"] as? String
        let endTime = endTimeStr.flatMap { ISO8601DateFormatter().date(from: $0) } ?? startTime.addingTimeInterval(3600)

        // Parse attendees
        let attendeesDicts = dict["attendees"] as? [[String: Any]] ?? []
        let attendees = attendeesDicts.compactMap { CalendarAttendee.from($0) }

        // Extract meeting link
        var meetingLink: String?
        if let hangoutLink = dict["hangoutLink"] as? String {
            meetingLink = hangoutLink
        } else if let conferenceData = dict["conferenceData"] as? [String: Any],
                  let entryPoints = conferenceData["entryPoints"] as? [[String: Any]],
                  let videoEntry = entryPoints.first(where: { ($0["entryPointType"] as? String) == "video" }) {
            meetingLink = videoEntry["uri"] as? String
        }

        return CalendarEvent(
            id: id,
            summary: summary,
            description: dict["description"] as? String,
            startTime: startTime,
            endTime: endTime,
            attendees: attendees,
            location: dict["location"] as? String,
            meetingLink: meetingLink,
            recurringEventId: dict["recurringEventId"] as? String
        )
    }
}

struct CalendarAttendee {
    let email: String
    let name: String?
    let responseStatus: String
    let isOrganizer: Bool

    static func from(_ dict: [String: Any]) -> CalendarAttendee? {
        guard let email = dict["email"] as? String else { return nil }

        return CalendarAttendee(
            email: email,
            name: dict["displayName"] as? String,
            responseStatus: dict["responseStatus"] as? String ?? "needsAction",
            isOrganizer: dict["organizer"] as? Bool ?? false
        )
    }
}

// MARK: - Errors

enum CalendarError: LocalizedError {
    case invalidResponse
    case eventNotFound
    case notConnected

    var errorDescription: String? {
        switch self {
        case .invalidResponse: return "Invalid response from Google Calendar"
        case .eventNotFound: return "Event not found"
        case .notConnected: return "Google Calendar is not connected"
        }
    }
}
