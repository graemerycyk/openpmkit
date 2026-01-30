import Foundation
import SwiftData

/// Service for polling Jira and triggering PRD Draft / Prototype agents
@MainActor
final class JiraWatcher {
    static let shared = JiraWatcher()

    private var pollTimer: Timer?
    private var isRunning = false
    private let pollInterval: TimeInterval = 15 * 60 // 15 minutes

    /// Track processed issue transitions to avoid duplicates
    private var processedTransitions: [String: Date] = [:]

    /// Model context for SwiftData operations
    private var modelContext: ModelContext?

    private init() {
        // Load persisted transitions
        if let data = UserDefaults.standard.data(forKey: "jiraProcessedTransitions"),
           let decoded = try? JSONDecoder().decode([String: Date].self, from: data) {
            processedTransitions = decoded
        }
    }

    /// Configure with SwiftData model context
    func configure(modelContext: ModelContext) {
        self.modelContext = modelContext
        Task {
            await loadProcessedTransitions()
        }
    }

    // MARK: - Control

    func start() {
        guard !isRunning else { return }
        isRunning = true

        print("[JiraWatcher] Starting...")

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
        print("[JiraWatcher] Stopped")
    }

    // MARK: - Polling

    private func poll() async {
        guard isRunning else { return }
        guard await ConnectionService.shared.isConnected(.jira) else {
            print("[JiraWatcher] Jira not connected")
            return
        }

        print("[JiraWatcher] Polling for status changes...")

        // Clean up old transitions first
        cleanupProcessedTransitions()

        // Check for PRD trigger status
        await checkPRDTriggers()

        // Check for Prototype trigger status (PRD approved)
        await checkPrototypeTriggers()
    }

    // MARK: - PRD Draft Triggers

    private func checkPRDTriggers() async {
        let config = getPRDDraftConfig()
        let triggerStatus = config.triggerStatus
        let projects = config.projects

        do {
            let issues = try await fetchIssuesWithStatus(triggerStatus, projects: projects, issueType: "Epic")

            for issue in issues {
                let transitionKey = "prd-\(issue.key)"
                guard !hasProcessedTransition(transitionKey) else {
                    continue
                }

                print("[JiraWatcher] Triggering PRD Draft for: \(issue.key)")
                triggerPRDDraft(for: issue)
                markTransitionProcessed(transitionKey)
            }
        } catch {
            print("[JiraWatcher] Error checking PRD triggers: \(error)")
        }
    }

    // MARK: - Prototype Triggers

    private func checkPrototypeTriggers() async {
        let triggerStatus = getPrototypeTriggerStatus()

        do {
            let issues = try await fetchIssuesWithStatus(triggerStatus, projects: [], issueType: "Epic")

            for issue in issues {
                let transitionKey = "prototype-\(issue.key)"
                guard !hasProcessedTransition(transitionKey) else {
                    continue
                }

                // Check if there's a PRD artifact for this issue
                guard let prdArtifact = findPRDArtifact(for: issue.key) else {
                    print("[JiraWatcher] No PRD found for \(issue.key), skipping prototype")
                    continue
                }

                print("[JiraWatcher] Triggering Prototype for: \(issue.key)")
                triggerPrototype(for: issue, prdArtifact: prdArtifact)
                markTransitionProcessed(transitionKey)
            }
        } catch {
            print("[JiraWatcher] Error checking prototype triggers: \(error)")
        }
    }

    // MARK: - Configuration

    private func getPRDDraftConfig() -> (triggerStatus: String, projects: [String]) {
        guard let context = modelContext else {
            return ("Ready for PRD", [])
        }

        let prdDraftType = AgentType.prdDraft.rawValue
        let descriptor = FetchDescriptor<AgentConfig>(
            predicate: #Predicate { $0.agentTypeRaw == prdDraftType }
        )

        do {
            if let config = try context.fetch(descriptor).first {
                return (
                    config.triggerStatus ?? "Ready for PRD",
                    config.projects ?? []
                )
            }
        } catch {
            print("[JiraWatcher] Error fetching PRD config: \(error)")
        }

        return ("Ready for PRD", [])
    }

    private func getPrototypeTriggerStatus() -> String {
        guard let context = modelContext else {
            return "PRD Approved"
        }

        let prototypeType = AgentType.prototype.rawValue
        let descriptor = FetchDescriptor<AgentConfig>(
            predicate: #Predicate { $0.agentTypeRaw == prototypeType }
        )

        do {
            if let config = try context.fetch(descriptor).first {
                return config.triggerStatus ?? "PRD Approved"
            }
        } catch {
            print("[JiraWatcher] Error fetching Prototype config: \(error)")
        }

        return "PRD Approved"
    }

    // MARK: - Jira API

    private func getCloudId() -> String? {
        return UserDefaults.standard.string(forKey: "jira_cloud_id")
    }

    private func fetchIssuesWithStatus(_ status: String, projects: [String], issueType: String? = nil) async throws -> [JiraWatcherIssue] {
        guard let tokens = KeychainService.shared.getOAuthTokens(for: .jira) else {
            throw JiraWatcherError.notAuthenticated
        }

        guard let cloudId = getCloudId() else {
            throw JiraWatcherError.noCloudId
        }

        // Build JQL query
        var jqlParts: [String] = []
        jqlParts.append("status = \"\(status)\"")

        if !projects.isEmpty {
            let projectList = projects.map { "\"\($0)\"" }.joined(separator: ", ")
            jqlParts.append("project IN (\(projectList))")
        }

        if let issueType = issueType {
            jqlParts.append("issuetype = \"\(issueType)\"")
        }

        // Only fetch issues updated in the last day
        jqlParts.append("updated >= -1d")

        let jql = jqlParts.joined(separator: " AND ")

        var components = URLComponents(string: "https://api.atlassian.com/ex/jira/\(cloudId)/rest/api/3/search")!
        components.queryItems = [
            URLQueryItem(name: "jql", value: jql),
            URLQueryItem(name: "maxResults", value: "50"),
            URLQueryItem(name: "fields", value: "summary,status,description,issuetype,priority,labels,created,updated")
        ]

        var request = URLRequest(url: components.url!)
        request.setValue("Bearer \(tokens.accessToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw JiraWatcherError.apiError
        }

        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        let issues = json?["issues"] as? [[String: Any]] ?? []

        return issues.compactMap { JiraWatcherIssue(from: $0) }
    }

    // MARK: - Trigger Actions

    private func triggerPRDDraft(for issue: JiraWatcherIssue) {
        guard let context = modelContext else {
            print("[JiraWatcher] No model context configured")
            return
        }

        // Create AgentJob for prd_draft
        let job = AgentJob(
            agentType: .prdDraft,
            status: .pending,
            triggerSource: .jiraEvent
        )

        // Store metadata in inputData
        let metadata: [String: String] = [
            "epicKey": issue.key,
            "epicTitle": issue.summary,
            "issueType": issue.issueType,
            "epicDescription": issue.description ?? ""
        ]
        job.inputData = try? JSONEncoder().encode(metadata)

        context.insert(job)

        do {
            try context.save()
            print("[JiraWatcher] Created PRD Draft job: \(job.id)")

            // Queue for execution
            Task {
                await AsyncJobQueue.shared.enqueue(job)
            }
        } catch {
            print("[JiraWatcher] Error creating PRD job: \(error)")
        }
    }

    private func triggerPrototype(for issue: JiraWatcherIssue, prdArtifact: Artifact) {
        guard let context = modelContext else {
            print("[JiraWatcher] No model context configured")
            return
        }

        // Create AgentJob for prototype
        let job = AgentJob(
            agentType: .prototype,
            status: .pending,
            triggerSource: .artifactChain
        )

        // Store metadata in inputData
        let metadata: [String: String] = [
            "prdId": prdArtifact.id,
            "epicKey": issue.key,
            "epicTitle": issue.summary
        ]
        job.inputData = try? JSONEncoder().encode(metadata)

        context.insert(job)

        do {
            try context.save()
            print("[JiraWatcher] Created Prototype job: \(job.id)")

            // Queue for execution
            Task {
                await AsyncJobQueue.shared.enqueue(job)
            }
        } catch {
            print("[JiraWatcher] Error creating Prototype job: \(error)")
        }
    }

    private func findPRDArtifact(for issueKey: String) -> Artifact? {
        guard let context = modelContext else { return nil }

        let prdDraftType = AgentType.prdDraft.rawValue
        let descriptor = FetchDescriptor<Artifact>(
            predicate: #Predicate { artifact in
                artifact.agentTypeRaw == prdDraftType
            },
            sortBy: [SortDescriptor(\.createdAt, order: .reverse)]
        )

        do {
            let artifacts = try context.fetch(descriptor)
            // Find artifact where metadataData contains this epic key
            return artifacts.first { artifact in
                guard let data = artifact.metadataData,
                      let metadata = try? JSONDecoder().decode([String: String].self, from: data) else {
                    return false
                }
                return metadata["epicKey"] == issueKey
            }
        } catch {
            print("[JiraWatcher] Error finding PRD artifact: \(error)")
            return nil
        }
    }

    // MARK: - Transition Tracking

    private func hasProcessedTransition(_ key: String) -> Bool {
        return processedTransitions[key] != nil
    }

    private func markTransitionProcessed(_ key: String) {
        processedTransitions[key] = Date()
        persistTransitions()
    }

    private func loadProcessedTransitions() async {
        guard let context = modelContext else { return }

        // Also load from existing jobs in the last 7 days
        let sevenDaysAgo = Calendar.current.date(byAdding: .day, value: -7, to: Date())!
        let prdDraftType = AgentType.prdDraft.rawValue
        let prototypeType = AgentType.prototype.rawValue

        let prdDescriptor = FetchDescriptor<AgentJob>(
            predicate: #Predicate { job in
                job.agentTypeRaw == prdDraftType && job.createdAt >= sevenDaysAgo
            }
        )

        let prototypeDescriptor = FetchDescriptor<AgentJob>(
            predicate: #Predicate { job in
                job.agentTypeRaw == prototypeType && job.createdAt >= sevenDaysAgo
            }
        )

        do {
            let prdJobs = try context.fetch(prdDescriptor)
            for job in prdJobs {
                if let data = job.inputData,
                   let metadata = try? JSONDecoder().decode([String: String].self, from: data),
                   let epicKey = metadata["epicKey"] {
                    processedTransitions["prd-\(epicKey)"] = job.createdAt
                }
            }

            let prototypeJobs = try context.fetch(prototypeDescriptor)
            for job in prototypeJobs {
                if let data = job.inputData,
                   let metadata = try? JSONDecoder().decode([String: String].self, from: data),
                   let epicKey = metadata["epicKey"] {
                    processedTransitions["prototype-\(epicKey)"] = job.createdAt
                }
            }

            print("[JiraWatcher] Loaded \(processedTransitions.count) processed transitions")
        } catch {
            print("[JiraWatcher] Error loading transitions: \(error)")
        }
    }

    private func persistTransitions() {
        if let data = try? JSONEncoder().encode(processedTransitions) {
            UserDefaults.standard.set(data, forKey: "jiraProcessedTransitions")
        }
    }

    /// Clear old processed transitions (older than 7 days)
    func cleanupProcessedTransitions() {
        let sevenDaysAgo = Date().addingTimeInterval(-7 * 24 * 60 * 60)
        processedTransitions = processedTransitions.filter { $0.value > sevenDaysAgo }
        persistTransitions()
    }
}

// MARK: - Supporting Types

struct JiraWatcherIssue: Identifiable {
    let id: String
    let key: String
    let summary: String
    let status: String
    let issueType: String
    let description: String?
    let priority: String?
    let labels: [String]

    init?(from json: [String: Any]) {
        guard let id = json["id"] as? String,
              let key = json["key"] as? String,
              let fields = json["fields"] as? [String: Any],
              let summary = fields["summary"] as? String else {
            return nil
        }

        self.id = id
        self.key = key
        self.summary = summary

        if let statusObj = fields["status"] as? [String: Any] {
            self.status = statusObj["name"] as? String ?? "Unknown"
        } else {
            self.status = "Unknown"
        }

        if let issueTypeObj = fields["issuetype"] as? [String: Any] {
            self.issueType = issueTypeObj["name"] as? String ?? "Unknown"
        } else {
            self.issueType = "Unknown"
        }

        // Parse description (Atlassian Document Format)
        if let descObj = fields["description"] as? [String: Any] {
            self.description = JiraWatcherIssue.extractTextFromADF(descObj)
        } else {
            self.description = nil
        }

        if let priorityObj = fields["priority"] as? [String: Any] {
            self.priority = priorityObj["name"] as? String
        } else {
            self.priority = nil
        }

        self.labels = fields["labels"] as? [String] ?? []
    }

    /// Extract plain text from Atlassian Document Format
    private static func extractTextFromADF(_ adf: [String: Any]) -> String? {
        guard let content = adf["content"] as? [[String: Any]] else {
            return nil
        }

        var text = ""
        for block in content {
            if let blockContent = block["content"] as? [[String: Any]] {
                for item in blockContent {
                    if let itemText = item["text"] as? String {
                        text += itemText
                    }
                }
                text += "\n"
            }
        }
        return text.isEmpty ? nil : text.trimmingCharacters(in: .whitespacesAndNewlines)
    }
}

enum JiraWatcherError: LocalizedError {
    case notAuthenticated
    case noCloudId
    case apiError

    var errorDescription: String? {
        switch self {
        case .notAuthenticated:
            return "Jira not authenticated"
        case .noCloudId:
            return "Jira cloud ID not configured"
        case .apiError:
            return "Failed to fetch Jira issues"
        }
    }
}
