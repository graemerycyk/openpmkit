import Foundation
import SwiftData

/// Async job queue with concurrency limits for executing agent jobs
actor AsyncJobQueue {
    static let shared = AsyncJobQueue()

    /// Maximum concurrent jobs
    private let maxConcurrent = 2

    /// Queue of pending jobs
    private var pendingJobs: [AgentJob] = []

    /// Currently running job IDs
    private var runningJobs: Set<String> = []

    /// Model context for SwiftData operations
    private var modelContext: ModelContext?

    private init() {}

    /// Configure with SwiftData model context
    func configure(modelContext: ModelContext) {
        self.modelContext = modelContext
    }

    // MARK: - Queue Management

    /// Enqueue a job for execution
    func enqueue(_ job: AgentJob) async {
        pendingJobs.append(job)
        print("[JobQueue] Enqueued job: \(job.id) (\(job.agentType.displayName))")
        await processQueue()
    }

    /// Enqueue multiple jobs
    func enqueueAll(_ jobs: [AgentJob]) async {
        pendingJobs.append(contentsOf: jobs)
        print("[JobQueue] Enqueued \(jobs.count) jobs")
        await processQueue()
    }

    /// Get current queue status
    func getStatus() -> (pending: Int, running: Int) {
        return (pendingJobs.count, runningJobs.count)
    }

    // MARK: - Queue Processing

    private func processQueue() async {
        // Check if we can start more jobs
        while runningJobs.count < maxConcurrent && !pendingJobs.isEmpty {
            let job = pendingJobs.removeFirst()
            runningJobs.insert(job.id)

            // Capture context before spawning task
            let context = modelContext

            // Execute job in background
            Task {
                await executeJob(job, context: context)
            }
        }
    }

    private func executeJob(_ job: AgentJob, context: ModelContext?) async {
        print("[JobQueue] Starting job: \(job.id) (\(job.agentType.displayName))")

        // Update job status to running
        await updateJobStatus(job, status: .running, context: context)

        do {
            // Get metadata from inputData
            let metadata = getJobMetadata(job)

            // Execute based on agent type
            let artifact = try await runAgentJob(job, metadata: metadata)

            // Update job status to completed
            await updateJobStatus(job, status: .completed, artifact: artifact, context: context)

            // Send notification
            if let artifact = artifact {
                await NotificationService.shared.sendJobCompleteNotification(
                    agentType: job.agentType,
                    artifactId: artifact.id,
                    title: artifact.title
                )
            }

            print("[JobQueue] Completed job: \(job.id)")

        } catch {
            print("[JobQueue] Job failed: \(job.id) - \(error.localizedDescription)")

            // Update job status to failed
            await updateJobStatus(job, status: .failed, error: error.localizedDescription, context: context)

            // Send failure notification
            await NotificationService.shared.sendJobFailedNotification(
                agentType: job.agentType,
                error: error.localizedDescription
            )
        }

        // Remove from running set and process next
        runningJobs.remove(job.id)
        await processQueue()
    }

    private func getJobMetadata(_ job: AgentJob) -> [String: String] {
        guard let data = job.inputData,
              let metadata = try? JSONDecoder().decode([String: String].self, from: data) else {
            return [:]
        }
        return metadata
    }

    private func runAgentJob(_ job: AgentJob, metadata: [String: String]) async throws -> Artifact? {
        switch job.agentType {
        case .dailyBrief:
            return try await AgentRunner.shared.runDailyBrief(jobId: job.id)

        case .meetingPrep:
            guard let eventId = metadata["eventId"] else {
                throw JobQueueError.missingMetadata("eventId")
            }
            return try await AgentRunner.shared.runMeetingPrep(
                jobId: job.id,
                eventId: eventId,
                metadata: metadata
            )

        case .featureIntelligence:
            return try await AgentRunner.shared.runFeatureIntelligence(jobId: job.id)

        case .prdDraft:
            guard let epicKey = metadata["epicKey"] else {
                throw JobQueueError.missingMetadata("epicKey")
            }
            return try await AgentRunner.shared.runPRDDraft(jobId: job.id, epicKey: epicKey)

        case .prototype:
            guard let prdId = metadata["prdId"] else {
                throw JobQueueError.missingMetadata("prdId")
            }
            return try await AgentRunner.shared.runPrototype(jobId: job.id, prdId: prdId)
        }
    }

    @MainActor
    private func updateJobStatus(
        _ job: AgentJob,
        status: JobStatus,
        artifact: Artifact? = nil,
        error: String? = nil,
        context: ModelContext?
    ) {
        job.status = status

        switch status {
        case .running:
            job.startedAt = Date()
        case .completed:
            job.completedAt = Date()
            // Link artifact via relationship
            if let artifact = artifact {
                job.artifact = artifact
            }
        case .failed:
            job.completedAt = Date()
            job.error = error
        default:
            break
        }

        // Save to SwiftData
        if let context = context {
            do {
                try context.save()
            } catch {
                print("[JobQueue] Error saving job status: \(error)")
            }
        }
    }

    // MARK: - Cleanup

    /// Cancel all pending jobs
    func cancelPending() {
        let count = pendingJobs.count
        pendingJobs.removeAll()
        print("[JobQueue] Cancelled \(count) pending jobs")
    }

    /// Clear completed jobs from history (older than specified days)
    func cleanupOldJobs(olderThan days: Int) async {
        guard let context = modelContext else { return }

        let cutoffDate = Calendar.current.date(byAdding: .day, value: -days, to: Date())!
        let completedStatus = JobStatus.completed.rawValue

        let descriptor = FetchDescriptor<AgentJob>(
            predicate: #Predicate { job in
                job.statusRaw == completedStatus && job.completedAt != nil && job.completedAt! < cutoffDate
            }
        )

        do {
            let oldJobs = try context.fetch(descriptor)
            for job in oldJobs {
                context.delete(job)
            }
            try context.save()
            print("[JobQueue] Cleaned up \(oldJobs.count) old jobs")
        } catch {
            print("[JobQueue] Error cleaning up old jobs: \(error)")
        }
    }
}

// MARK: - Errors

enum JobQueueError: LocalizedError {
    case missingMetadata(String)
    case executionFailed(String)

    var errorDescription: String? {
        switch self {
        case .missingMetadata(let key):
            return "Missing required metadata: \(key)"
        case .executionFailed(let reason):
            return "Job execution failed: \(reason)"
        }
    }
}
