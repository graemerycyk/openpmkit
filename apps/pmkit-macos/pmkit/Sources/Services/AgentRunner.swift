import Foundation
import SwiftData

/// Service for running autonomous agents
actor AgentRunner {
    static let shared = AgentRunner()

    private let slackFetcher = SlackFetcher()
    private let jiraFetcher = JiraFetcher()

    private init() {}

    // MARK: - Simple Job Queue Methods
    // These are called by AsyncJobQueue with minimal parameters

    /// Run Daily Brief agent (called from job queue)
    func runDailyBrief(jobId: String) async throws -> Artifact? {
        print("[AgentRunner] Starting Daily Brief (job: \(jobId))...")

        // Get default config
        let config = DailyBriefConfig()

        // Fetch Slack data
        var slackData: SlackFetchResult?
        if ConnectionService.shared.isConnected(.slack) {
            slackData = try await slackFetcher.fetchMessages(
                channels: config.slackChannels,
                lookbackHours: config.lookbackHours
            )
            print("[AgentRunner] Fetched \(slackData?.messages.count ?? 0) Slack messages")
        }

        // Fetch Jira data
        var jiraData: JiraFetchResult?
        if config.includeJira && ConnectionService.shared.isConnected(.jira) {
            jiraData = try await jiraFetcher.fetchUpdates(
                projects: config.jiraProjects,
                lookbackHours: config.lookbackHours
            )
            print("[AgentRunner] Fetched \(jiraData?.issues.count ?? 0) Jira issues")
        }

        // Generate the brief
        let prompt = PromptTemplates.dailyBrief(
            slackData: slackData,
            jiraData: jiraData
        )

        let response = try await LLMService.shared.generate(prompt: prompt)

        // Create artifact
        let artifact = Artifact(
            agentType: .dailyBrief,
            title: "Daily Brief - \(Date().formatted(date: .long, time: .omitted))",
            content: response.content
        )

        // Add sources
        if let slack = slackData {
            for (index, message) in slack.messages.enumerated() {
                let channelName = slack.channels[message.channelId]?.name ?? message.channelId
                let source = ArtifactSource(
                    sourceType: .slack,
                    title: "#\(channelName)",
                    url: message.permalink,
                    snippet: String(message.text.prefix(100)),
                    citationNumber: index + 1
                )
                artifact.sources.append(source)
            }
        }

        // Save artifact to file
        try artifact.saveToFile()

        print("[AgentRunner] Daily Brief completed")
        return artifact
    }

    /// Run Meeting Prep agent (called from job queue)
    func runMeetingPrep(
        jobId: String,
        eventId: String,
        metadata: [String: String]
    ) async throws -> Artifact? {
        let eventTitle = metadata["eventTitle"] ?? "Meeting"
        print("[AgentRunner] Starting Meeting Prep for: \(eventTitle) (job: \(jobId))...")

        let config = MeetingPrepConfig()

        // Fetch Jira context if enabled
        var jiraData: JiraFetchResult?
        if config.includeJira && ConnectionService.shared.isConnected(.jira) {
            jiraData = try await jiraFetcher.fetchUpdates(
                projects: [],  // All projects
                lookbackHours: 168  // Past week
            )
        }

        // Create a minimal event for prompt generation
        let attendeesList = metadata["attendees"]?.components(separatedBy: ",") ?? []
        let startTime = ISO8601DateFormatter().date(from: metadata["startTime"] ?? "") ?? Date()

        // Generate prep
        let prompt = PromptTemplates.meetingPrepSimple(
            eventTitle: eventTitle,
            attendees: attendeesList,
            startTime: startTime,
            jiraContext: jiraData
        )

        let response = try await LLMService.shared.generate(prompt: prompt)

        let artifact = Artifact(
            agentType: .meetingPrep,
            title: "Meeting Prep - \(eventTitle)",
            content: response.content
        )

        try artifact.saveToFile()

        print("[AgentRunner] Meeting Prep completed")
        return artifact
    }

    /// Run Feature Intelligence agent (called from job queue)
    func runFeatureIntelligence(jobId: String) async throws -> Artifact? {
        print("[AgentRunner] Starting Feature Intelligence (job: \(jobId))...")

        let config = FeatureIntelligenceConfig()

        var slackData: SlackFetchResult?
        if config.includeSlack && ConnectionService.shared.isConnected(.slack) {
            slackData = try await slackFetcher.fetchMessages(
                channels: config.slackChannels,
                lookbackHours: config.lookbackDays * 24
            )
        }

        var jiraData: JiraFetchResult?
        if config.includeJira && ConnectionService.shared.isConnected(.jira) {
            jiraData = try await jiraFetcher.fetchUpdates(
                projects: config.jiraProjects,
                lookbackHours: config.lookbackDays * 24
            )
        }

        let prompt = PromptTemplates.featureIntelligence(
            slackData: slackData,
            jiraData: jiraData,
            lookbackDays: config.lookbackDays
        )

        let response = try await LLMService.shared.generate(prompt: prompt)

        let artifact = Artifact(
            agentType: .featureIntelligence,
            title: "Feature Intelligence - Week of \(Date().formatted(date: .abbreviated, time: .omitted))",
            content: response.content
        )

        try artifact.saveToFile()

        print("[AgentRunner] Feature Intelligence completed")
        return artifact
    }

    /// Run PRD Draft agent (called from job queue)
    func runPRDDraft(jobId: String, epicKey: String) async throws -> Artifact? {
        print("[AgentRunner] Starting PRD Draft for: \(epicKey) (job: \(jobId))...")

        let config = PRDDraftConfig()

        // Fetch epic details
        let epic = try await jiraFetcher.fetchEpic(key: epicKey)

        // Get recent Feature Intelligence if enabled
        var featureIntelligence: String?
        if config.includeFeatureIntelligence {
            // TODO: Fetch most recent Feature Intelligence artifact
        }

        let prompt = PromptTemplates.prdDraft(
            epic: epic,
            featureIntelligence: featureIntelligence
        )

        let response = try await LLMService.shared.generate(prompt: prompt)

        let artifact = Artifact(
            agentType: .prdDraft,
            title: "PRD - \(epic.epic.summary)",
            content: response.content
        )

        try artifact.saveToFile()

        print("[AgentRunner] PRD Draft completed")
        return artifact
    }

    /// Run Prototype agent (called from job queue)
    func runPrototype(jobId: String, prdId: String) async throws -> Artifact? {
        print("[AgentRunner] Starting Prototype generation for PRD: \(prdId) (job: \(jobId))...")

        // TODO: Fetch PRD artifact content
        let prdContent = "PRD content placeholder"

        let prompt = PromptTemplates.prototype(prdContent: prdContent)
        let response = try await LLMService.shared.generate(prompt: prompt)

        let artifact = Artifact(
            agentType: .prototype,
            title: "Prototype",
            content: response.content
        )

        // Save as HTML file
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        let dateString = dateFormatter.string(from: Date())

        let artifactsDir = ConfigService.shared.artifactsURL.appendingPathComponent(dateString)
        try FileManager.default.createDirectory(at: artifactsDir, withIntermediateDirectories: true)

        let fileName = "prototype-\(artifact.id.prefix(8)).html"
        let fileURL = artifactsDir.appendingPathComponent(fileName)
        try artifact.content.write(to: fileURL, atomically: true, encoding: .utf8)
        artifact.filePath = "\(dateString)/\(fileName)"

        print("[AgentRunner] Prototype completed")
        return artifact
    }

    // MARK: - Full Config Methods
    // These are called with full configuration from settings UI

    /// Run a Daily Brief agent with full config
    func runDailyBrief(
        config: DailyBriefConfig,
        triggerSource: TriggerSource = .manual,
        modelContext: ModelContext
    ) async throws -> Artifact {
        print("[AgentRunner] Starting Daily Brief...")

        // Create job record
        let job = AgentJob(
            agentType: .dailyBrief,
            triggerSource: triggerSource
        )
        job.status = .running
        job.startedAt = Date()
        modelContext.insert(job)
        try modelContext.save()

        do {
            // Fetch Slack data
            var slackData: SlackFetchResult?
            if !config.slackChannels.isEmpty && ConnectionService.shared.isConnected(.slack) {
                slackData = try await slackFetcher.fetchMessages(
                    channels: config.slackChannels,
                    lookbackHours: config.lookbackHours
                )
                print("[AgentRunner] Fetched \(slackData?.messages.count ?? 0) Slack messages")
            }

            // Fetch Jira data
            var jiraData: JiraFetchResult?
            if config.includeJira && ConnectionService.shared.isConnected(.jira) {
                jiraData = try await jiraFetcher.fetchUpdates(
                    projects: config.jiraProjects,
                    lookbackHours: config.lookbackHours
                )
                print("[AgentRunner] Fetched \(jiraData?.issues.count ?? 0) Jira issues")
            }

            // Generate the brief
            let prompt = PromptTemplates.dailyBrief(
                slackData: slackData,
                jiraData: jiraData
            )

            let response = try await LLMService.shared.generate(prompt: prompt)

            // Create artifact
            let artifact = Artifact(
                agentType: .dailyBrief,
                title: "Daily Brief - \(Date().formatted(date: .long, time: .omitted))",
                content: response.content
            )

            // Add sources
            if let slack = slackData {
                for (index, message) in slack.messages.enumerated() {
                    let channelName = slack.channels[message.channelId]?.name ?? message.channelId
                    let source = ArtifactSource(
                        sourceType: .slack,
                        title: "#\(channelName)",
                        url: message.permalink,
                        snippet: String(message.text.prefix(100)),
                        citationNumber: index + 1
                    )
                    artifact.sources.append(source)
                }
            }

            // Save artifact to file
            try artifact.saveToFile()

            // Update job
            job.status = .completed
            job.completedAt = Date()
            job.artifact = artifact
            job.inputTokens = response.usage.inputTokens
            job.outputTokens = response.usage.outputTokens

            modelContext.insert(artifact)
            try modelContext.save()

            // Send notification
            await NotificationService.shared.sendJobCompleteNotification(
                agentType: .dailyBrief,
                artifactId: artifact.id,
                title: artifact.title
            )

            print("[AgentRunner] Daily Brief completed")
            return artifact

        } catch {
            job.status = .failed
            job.error = error.localizedDescription
            job.completedAt = Date()
            try? modelContext.save()

            await NotificationService.shared.sendJobFailedNotification(
                agentType: .dailyBrief,
                error: error.localizedDescription
            )

            throw error
        }
    }

    /// Run a Meeting Prep agent with full config
    func runMeetingPrep(
        event: CalendarEvent,
        config: MeetingPrepConfig,
        triggerSource: TriggerSource = .calendarEvent,
        modelContext: ModelContext
    ) async throws -> Artifact {
        print("[AgentRunner] Starting Meeting Prep for: \(event.summary)")

        let job = AgentJob(
            agentType: .meetingPrep,
            triggerSource: triggerSource
        )
        job.status = .running
        job.startedAt = Date()
        modelContext.insert(job)
        try modelContext.save()

        do {
            // Fetch Jira context if enabled
            var jiraData: JiraFetchResult?
            if config.includeJira && ConnectionService.shared.isConnected(.jira) {
                jiraData = try await jiraFetcher.fetchUpdates(
                    projects: [],  // All projects
                    lookbackHours: 168  // Past week
                )
            }

            // Generate prep
            let prompt = PromptTemplates.meetingPrep(
                event: event,
                jiraContext: jiraData,
                previousNotes: nil  // TODO: Fetch previous meeting notes
            )

            let response = try await LLMService.shared.generate(prompt: prompt)

            let artifact = Artifact(
                agentType: .meetingPrep,
                title: "Meeting Prep - \(event.summary)",
                content: response.content
            )

            try artifact.saveToFile()

            job.status = .completed
            job.completedAt = Date()
            job.artifact = artifact
            job.inputTokens = response.usage.inputTokens
            job.outputTokens = response.usage.outputTokens

            modelContext.insert(artifact)
            try modelContext.save()

            await NotificationService.shared.sendJobCompleteNotification(
                agentType: .meetingPrep,
                artifactId: artifact.id,
                title: artifact.title
            )

            return artifact

        } catch {
            job.status = .failed
            job.error = error.localizedDescription
            job.completedAt = Date()
            try? modelContext.save()
            throw error
        }
    }

    /// Run a Feature Intelligence agent with full config
    func runFeatureIntelligence(
        config: FeatureIntelligenceConfig,
        triggerSource: TriggerSource = .scheduled,
        modelContext: ModelContext
    ) async throws -> Artifact {
        print("[AgentRunner] Starting Feature Intelligence...")

        let job = AgentJob(
            agentType: .featureIntelligence,
            triggerSource: triggerSource
        )
        job.status = .running
        job.startedAt = Date()
        modelContext.insert(job)
        try modelContext.save()

        do {
            var slackData: SlackFetchResult?
            if config.includeSlack && ConnectionService.shared.isConnected(.slack) {
                slackData = try await slackFetcher.fetchMessages(
                    channels: config.slackChannels,
                    lookbackHours: config.lookbackDays * 24
                )
            }

            var jiraData: JiraFetchResult?
            if config.includeJira && ConnectionService.shared.isConnected(.jira) {
                jiraData = try await jiraFetcher.fetchUpdates(
                    projects: config.jiraProjects,
                    lookbackHours: config.lookbackDays * 24
                )
            }

            let prompt = PromptTemplates.featureIntelligence(
                slackData: slackData,
                jiraData: jiraData,
                lookbackDays: config.lookbackDays
            )

            let response = try await LLMService.shared.generate(prompt: prompt)

            let artifact = Artifact(
                agentType: .featureIntelligence,
                title: "Feature Intelligence - Week of \(Date().formatted(date: .abbreviated, time: .omitted))",
                content: response.content
            )

            try artifact.saveToFile()

            job.status = .completed
            job.completedAt = Date()
            job.artifact = artifact
            job.inputTokens = response.usage.inputTokens
            job.outputTokens = response.usage.outputTokens

            modelContext.insert(artifact)
            try modelContext.save()

            await NotificationService.shared.sendJobCompleteNotification(
                agentType: .featureIntelligence,
                artifactId: artifact.id,
                title: artifact.title
            )

            return artifact

        } catch {
            job.status = .failed
            job.error = error.localizedDescription
            job.completedAt = Date()
            try? modelContext.save()
            throw error
        }
    }

    /// Run a PRD Draft agent with full config
    func runPRDDraft(
        epicKey: String,
        config: PRDDraftConfig,
        triggerSource: TriggerSource = .jiraEvent,
        modelContext: ModelContext
    ) async throws -> Artifact {
        print("[AgentRunner] Starting PRD Draft for: \(epicKey)")

        let job = AgentJob(
            agentType: .prdDraft,
            triggerSource: triggerSource
        )
        job.status = .running
        job.startedAt = Date()
        modelContext.insert(job)
        try modelContext.save()

        do {
            // Fetch epic details
            let epic = try await jiraFetcher.fetchEpic(key: epicKey)

            // Get recent Feature Intelligence if enabled
            var featureIntelligence: String?
            if config.includeFeatureIntelligence {
                // TODO: Fetch most recent Feature Intelligence artifact
            }

            let prompt = PromptTemplates.prdDraft(
                epic: epic,
                featureIntelligence: featureIntelligence
            )

            let response = try await LLMService.shared.generate(prompt: prompt)

            let artifact = Artifact(
                agentType: .prdDraft,
                title: "PRD - \(epic.epic.summary)",
                content: response.content
            )

            try artifact.saveToFile()

            job.status = .completed
            job.completedAt = Date()
            job.artifact = artifact
            job.inputTokens = response.usage.inputTokens
            job.outputTokens = response.usage.outputTokens

            modelContext.insert(artifact)
            try modelContext.save()

            await NotificationService.shared.sendJobCompleteNotification(
                agentType: .prdDraft,
                artifactId: artifact.id,
                title: artifact.title
            )

            return artifact

        } catch {
            job.status = .failed
            job.error = error.localizedDescription
            job.completedAt = Date()
            try? modelContext.save()
            throw error
        }
    }

    /// Run a Prototype agent with full config
    func runPrototype(
        prdArtifact: Artifact,
        config: PrototypeConfig,
        triggerSource: TriggerSource = .artifactChain,
        modelContext: ModelContext
    ) async throws -> Artifact {
        print("[AgentRunner] Starting Prototype generation...")

        let job = AgentJob(
            agentType: .prototype,
            triggerSource: triggerSource
        )
        job.status = .running
        job.startedAt = Date()
        modelContext.insert(job)
        try modelContext.save()

        do {
            let prompt = PromptTemplates.prototype(prdContent: prdArtifact.content)
            let response = try await LLMService.shared.generate(prompt: prompt)

            let artifact = Artifact(
                agentType: .prototype,
                title: "Prototype - \(prdArtifact.title.replacingOccurrences(of: "PRD - ", with: ""))",
                content: response.content
            )

            // Save as HTML file
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "yyyy-MM-dd"
            let dateString = dateFormatter.string(from: Date())

            let artifactsDir = ConfigService.shared.artifactsURL.appendingPathComponent(dateString)
            try FileManager.default.createDirectory(at: artifactsDir, withIntermediateDirectories: true)

            let fileName = "prototype-\(artifact.id.prefix(8)).html"
            let fileURL = artifactsDir.appendingPathComponent(fileName)
            try artifact.content.write(to: fileURL, atomically: true, encoding: .utf8)
            artifact.filePath = "\(dateString)/\(fileName)"

            job.status = .completed
            job.completedAt = Date()
            job.artifact = artifact
            job.inputTokens = response.usage.inputTokens
            job.outputTokens = response.usage.outputTokens

            modelContext.insert(artifact)
            try modelContext.save()

            await NotificationService.shared.sendJobCompleteNotification(
                agentType: .prototype,
                artifactId: artifact.id,
                title: artifact.title
            )

            return artifact

        } catch {
            job.status = .failed
            job.error = error.localizedDescription
            job.completedAt = Date()
            try? modelContext.save()
            throw error
        }
    }
}
