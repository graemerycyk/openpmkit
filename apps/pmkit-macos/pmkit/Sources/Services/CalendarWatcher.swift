import Foundation
import SwiftData

/// Service for polling Google Calendar and triggering Meeting Prep agents
@MainActor
final class CalendarWatcher {
    static let shared = CalendarWatcher()

    private var pollTimer: Timer?
    private var isRunning = false
    private let pollInterval: TimeInterval = 30 * 60 // 30 minutes

    /// Track triggered meetings to avoid duplicates (in-memory cache)
    private var triggeredMeetings: Set<String> = []

    /// Model context for SwiftData operations
    private var modelContext: ModelContext?

    private init() {
        // Load persisted triggered meetings
        if let persisted = UserDefaults.standard.stringArray(forKey: "triggeredMeetings") {
            triggeredMeetings = Set(persisted)
        }
    }

    /// Configure with SwiftData model context
    func configure(modelContext: ModelContext) {
        self.modelContext = modelContext
        Task {
            await loadTriggeredMeetings()
        }
    }

    // MARK: - Control

    func start() {
        guard !isRunning else { return }
        isRunning = true

        print("[CalendarWatcher] Starting...")

        // Initial poll
        Task {
            await poll()
        }

        // Schedule recurring polls
        pollTimer = Timer.scheduledTimer(withTimeInterval: pollInterval, repeats: true) { [weak self] _ in
            Task { @MainActor in
                await self?.poll()
            }
        }
    }

    func stop() {
        isRunning = false
        pollTimer?.invalidate()
        pollTimer = nil
        print("[CalendarWatcher] Stopped")
    }

    // MARK: - Polling

    private func poll() async {
        guard isRunning else { return }
        guard await ConnectionService.shared.isConnected(.googleCalendar) else {
            print("[CalendarWatcher] Google Calendar not connected")
            return
        }

        print("[CalendarWatcher] Polling for upcoming meetings...")

        do {
            let upcomingMeetings = try await fetchUpcomingMeetings()
            await processUpcomingMeetings(upcomingMeetings)
        } catch {
            print("[CalendarWatcher] Error polling: \(error)")
        }
    }

    private func fetchUpcomingMeetings() async throws -> [CalendarEvent] {
        guard let tokens = KeychainService.shared.getOAuthTokens(for: .googleCalendar) else {
            throw CalendarWatcherError.notAuthenticated
        }

        // Fetch events for the next 24 hours
        let now = Date()
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: now)!

        let dateFormatter = ISO8601DateFormatter()
        let timeMin = dateFormatter.string(from: now)
        let timeMax = dateFormatter.string(from: tomorrow)

        var components = URLComponents(string: "https://www.googleapis.com/calendar/v3/calendars/primary/events")!
        components.queryItems = [
            URLQueryItem(name: "timeMin", value: timeMin),
            URLQueryItem(name: "timeMax", value: timeMax),
            URLQueryItem(name: "singleEvents", value: "true"),
            URLQueryItem(name: "orderBy", value: "startTime")
        ]

        var request = URLRequest(url: components.url!)
        request.setValue("Bearer \(tokens.accessToken)", forHTTPHeaderField: "Authorization")

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw CalendarWatcherError.apiError
        }

        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        let items = json?["items"] as? [[String: Any]] ?? []

        return items.compactMap { CalendarEvent(from: $0) }
    }

    private func processUpcomingMeetings(_ meetings: [CalendarEvent]) async {
        let leadTimeMinutes = getMeetingPrepLeadTime()

        let now = Date()
        let triggerWindow = now.addingTimeInterval(TimeInterval(leadTimeMinutes * 60))

        for meeting in meetings {
            // Check if meeting is within trigger window
            guard meeting.startTime > now && meeting.startTime <= triggerWindow else {
                continue
            }

            // Check if this is an external meeting
            guard await isExternalMeeting(meeting) else {
                continue
            }

            // Check if we've already triggered for this meeting
            guard !hasTriggeredForMeeting(meeting.id) else {
                continue
            }

            print("[CalendarWatcher] Triggering Meeting Prep for: \(meeting.summary)")
            triggerMeetingPrep(for: meeting)
        }
    }

    private func getMeetingPrepLeadTime() -> Int {
        guard let context = modelContext else { return 60 }

        let meetingPrepType = AgentType.meetingPrep.rawValue
        let descriptor = FetchDescriptor<AgentConfig>(
            predicate: #Predicate { $0.agentTypeRaw == meetingPrepType }
        )

        do {
            if let config = try context.fetch(descriptor).first,
               let schedule = config.schedule {
                return schedule.leadTimeMinutes ?? 60
            }
        } catch {
            print("[CalendarWatcher] Error fetching config: \(error)")
        }

        return 60 // Default 1 hour
    }

    private func isExternalMeeting(_ meeting: CalendarEvent) async -> Bool {
        guard let attendees = meeting.attendees, !attendees.isEmpty else {
            return false
        }

        let userDomain = await getUserDomain()
        guard !userDomain.isEmpty else { return true } // If we can't determine, assume external

        // Check if any attendee is from a different domain
        for email in attendees {
            let attendeeDomain = email.components(separatedBy: "@").last ?? ""
            if !attendeeDomain.isEmpty && attendeeDomain.lowercased() != userDomain.lowercased() {
                return true
            }
        }

        return false
    }

    private func getUserDomain() async -> String {
        // Check cached domain first
        if let cached = UserDefaults.standard.string(forKey: "userEmailDomain"), !cached.isEmpty {
            return cached
        }

        // Fetch from Google API
        guard let tokens = KeychainService.shared.getOAuthTokens(for: .googleCalendar) else {
            return ""
        }

        let url = URL(string: "https://www.googleapis.com/oauth2/v1/userinfo")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(tokens.accessToken)", forHTTPHeaderField: "Authorization")

        do {
            let (data, _) = try await URLSession.shared.data(for: request)
            let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
            if let email = json?["email"] as? String {
                let domain = email.components(separatedBy: "@").last ?? ""
                UserDefaults.standard.set(domain, forKey: "userEmailDomain")
                return domain
            }
        } catch {
            print("[CalendarWatcher] Error fetching user info: \(error)")
        }

        return ""
    }

    private func hasTriggeredForMeeting(_ meetingId: String) -> Bool {
        return triggeredMeetings.contains(meetingId)
    }

    private func loadTriggeredMeetings() async {
        guard let context = modelContext else { return }

        // Load meeting IDs from jobs created in the last 7 days
        let sevenDaysAgo = Calendar.current.date(byAdding: .day, value: -7, to: Date())!
        let meetingPrepType = AgentType.meetingPrep.rawValue

        let descriptor = FetchDescriptor<AgentJob>(
            predicate: #Predicate { job in
                job.agentTypeRaw == meetingPrepType && job.createdAt >= sevenDaysAgo
            }
        )

        do {
            let jobs = try context.fetch(descriptor)
            for job in jobs {
                if let data = job.inputData,
                   let metadata = try? JSONDecoder().decode([String: String].self, from: data),
                   let eventId = metadata["eventId"] {
                    triggeredMeetings.insert(eventId)
                }
            }
            print("[CalendarWatcher] Loaded \(triggeredMeetings.count) triggered meetings from history")
        } catch {
            print("[CalendarWatcher] Error loading triggered meetings: \(error)")
        }
    }

    private func triggerMeetingPrep(for meeting: CalendarEvent) {
        guard let context = modelContext else {
            print("[CalendarWatcher] No model context configured")
            return
        }

        // Create AgentJob for meeting_prep
        let job = AgentJob(
            agentType: .meetingPrep,
            status: .pending,
            triggerSource: .calendarEvent
        )

        // Store metadata in inputData
        var metadata: [String: String] = [
            "eventId": meeting.id,
            "eventTitle": meeting.summary,
            "startTime": ISO8601DateFormatter().string(from: meeting.startTime)
        ]
        if let attendees = meeting.attendees {
            metadata["attendees"] = attendees.joined(separator: ",")
        }
        if let meetingLink = meeting.meetingLink {
            metadata["meetingLink"] = meetingLink
        }
        job.inputData = try? JSONEncoder().encode(metadata)

        context.insert(job)

        do {
            try context.save()
            print("[CalendarWatcher] Created Meeting Prep job: \(job.id)")

            // Queue for execution
            Task {
                await AsyncJobQueue.shared.enqueue(job)
            }

            // Mark meeting as triggered
            markMeetingTriggered(meeting.id)
        } catch {
            print("[CalendarWatcher] Error creating job: \(error)")
        }
    }

    private func markMeetingTriggered(_ meetingId: String) {
        triggeredMeetings.insert(meetingId)

        // Persist to UserDefaults
        var persisted = UserDefaults.standard.stringArray(forKey: "triggeredMeetings") ?? []
        persisted.append(meetingId)
        // Keep only last 100 to prevent unbounded growth
        if persisted.count > 100 {
            persisted = Array(persisted.suffix(100))
        }
        UserDefaults.standard.set(persisted, forKey: "triggeredMeetings")
    }
}

// MARK: - Supporting Types

struct CalendarEvent: Identifiable {
    let id: String
    let summary: String
    let startTime: Date
    let endTime: Date
    let attendees: [String]?
    let description: String?
    let meetingLink: String?
    let organizerEmail: String?

    init?(from json: [String: Any]) {
        guard let id = json["id"] as? String,
              let summary = json["summary"] as? String else {
            return nil
        }

        self.id = id
        self.summary = summary

        // Parse start time
        if let start = json["start"] as? [String: Any] {
            if let dateTimeStr = start["dateTime"] as? String {
                let formatter = ISO8601DateFormatter()
                self.startTime = formatter.date(from: dateTimeStr) ?? Date()
            } else if let dateStr = start["date"] as? String {
                let formatter = DateFormatter()
                formatter.dateFormat = "yyyy-MM-dd"
                self.startTime = formatter.date(from: dateStr) ?? Date()
            } else {
                return nil
            }
        } else {
            return nil
        }

        // Parse end time
        if let end = json["end"] as? [String: Any] {
            if let dateTimeStr = end["dateTime"] as? String {
                let formatter = ISO8601DateFormatter()
                self.endTime = formatter.date(from: dateTimeStr) ?? Date()
            } else if let dateStr = end["date"] as? String {
                let formatter = DateFormatter()
                formatter.dateFormat = "yyyy-MM-dd"
                self.endTime = formatter.date(from: dateStr) ?? Date()
            } else {
                self.endTime = startTime
            }
        } else {
            self.endTime = startTime
        }

        // Parse attendees
        if let attendeesJson = json["attendees"] as? [[String: Any]] {
            self.attendees = attendeesJson.compactMap { $0["email"] as? String }
        } else {
            self.attendees = nil
        }

        self.description = json["description"] as? String

        // Extract meeting link
        if let conferenceData = json["conferenceData"] as? [String: Any],
           let entryPoints = conferenceData["entryPoints"] as? [[String: Any]],
           let videoEntry = entryPoints.first(where: { $0["entryPointType"] as? String == "video" }) {
            self.meetingLink = videoEntry["uri"] as? String
        } else {
            self.meetingLink = nil
        }

        // Extract organizer
        if let organizer = json["organizer"] as? [String: Any] {
            self.organizerEmail = organizer["email"] as? String
        } else {
            self.organizerEmail = nil
        }
    }
}

enum CalendarWatcherError: LocalizedError {
    case notAuthenticated
    case apiError

    var errorDescription: String? {
        switch self {
        case .notAuthenticated:
            return "Google Calendar not authenticated"
        case .apiError:
            return "Failed to fetch calendar events"
        }
    }
}
