import Foundation
import SwiftData
import UserNotifications

/// Service for handling wake from sleep and catching up on missed scheduled jobs
actor WakeRecoveryService {
    static let shared = WakeRecoveryService()

    private var isProcessing = false

    /// Model context for SwiftData operations
    private var modelContext: ModelContext?

    private init() {}

    /// Configure with SwiftData model context
    func configure(modelContext: ModelContext) {
        self.modelContext = modelContext
    }

    /// Check for missed jobs after wake from sleep or app launch
    func checkForMissedJobs() async {
        guard !isProcessing else {
            print("[WakeRecovery] Already processing missed jobs")
            return
        }

        isProcessing = true
        defer { isProcessing = false }

        print("[WakeRecovery] Checking for missed jobs...")

        // Get all enabled agent configs
        let missedJobs = await findMissedJobs()

        if missedJobs.isEmpty {
            print("[WakeRecovery] No missed jobs")
            return
        }

        print("[WakeRecovery] Found \(missedJobs.count) missed jobs")

        // Show notification
        await sendCatchingUpNotification(count: missedJobs.count)

        // Queue all missed jobs through AsyncJobQueue
        for missedJob in missedJobs {
            await createAndQueueJob(missedJob)
        }

        // Show completion notification
        await sendCaughtUpNotification()
    }

    private func findMissedJobs() async -> [MissedJob] {
        guard let context = modelContext else {
            return []
        }

        var missedJobs: [MissedJob] = []
        let now = Date()

        // Query SwiftData for enabled AgentConfigs
        let descriptor = FetchDescriptor<AgentConfig>(
            predicate: #Predicate { config in
                config.isEnabled == true
            }
        )

        do {
            let configs = try context.fetch(descriptor)

            for config in configs {
                let agentType = config.agentType

                // Only check time-based agents for missed jobs
                guard agentType.triggerType == .timeBased else {
                    continue
                }

                // Check if we missed any scheduled runs
                if let nextRunAt = config.nextRunAt, nextRunAt < now {
                    // Calculate how many runs were missed
                    let missedCount = calculateMissedRuns(
                        lastRun: config.lastRunAt,
                        nextRun: nextRunAt,
                        schedule: config.schedule,
                        now: now
                    )

                    // Add one missed job entry (we'll run it once to catch up)
                    if missedCount > 0 {
                        missedJobs.append(MissedJob(
                            configId: config.id,
                            agentType: agentType,
                            scheduledTime: nextRunAt,
                            missedCount: missedCount
                        ))
                    }
                }
            }
        } catch {
            print("[WakeRecovery] Error fetching configs: \(error)")
        }

        return missedJobs
    }

    private func calculateMissedRuns(
        lastRun: Date?,
        nextRun: Date,
        schedule: AgentSchedule?,
        now: Date
    ) -> Int {
        guard let schedule = schedule else { return 1 }

        let calendar = Calendar.current

        switch schedule.type {
        case .daily:
            // Count weekdays between nextRun and now
            var count = 0
            var checkDate = nextRun
            while checkDate < now {
                let weekday = calendar.component(.weekday, from: checkDate)
                // Only count weekdays (Mon-Fri are 2-6)
                if weekday >= 2 && weekday <= 6 {
                    count += 1
                }
                checkDate = calendar.date(byAdding: .day, value: 1, to: checkDate) ?? now
            }
            return count

        case .weekly:
            // Count weeks between nextRun and now
            let days = calendar.dateComponents([.day], from: nextRun, to: now).day ?? 0
            return max(1, days / 7)

        case .calendarTrigger, .eventTrigger:
            return 1
        }
    }

    private func createAndQueueJob(_ missedJob: MissedJob) async {
        guard let context = modelContext else { return }

        // Create AgentJob marked as late
        let job = AgentJob(
            agentType: missedJob.agentType,
            status: .pending,
            triggerSource: .wakeRecovery
        )
        job.generatedLate = true

        // Store metadata in inputData
        let metadata: [String: String] = [
            "scheduledTime": ISO8601DateFormatter().string(from: missedJob.scheduledTime),
            "missedCount": String(missedJob.missedCount)
        ]
        job.inputData = try? JSONEncoder().encode(metadata)

        context.insert(job)

        do {
            try context.save()
            print("[WakeRecovery] Created catch-up job: \(job.id) for \(missedJob.agentType.displayName)")

            // Update the config's nextRunAt
            await updateConfigNextRun(configId: missedJob.configId)

            // Queue for execution
            await AsyncJobQueue.shared.enqueue(job)
        } catch {
            print("[WakeRecovery] Error creating job: \(error)")
        }
    }

    private func updateConfigNextRun(configId: String) async {
        guard let context = modelContext else { return }

        let descriptor = FetchDescriptor<AgentConfig>(
            predicate: #Predicate { config in
                config.id == configId
            }
        )

        do {
            if let config = try context.fetch(descriptor).first {
                config.lastRunAt = Date()
                config.nextRunAt = calculateNextRunTime(config)
                try context.save()
            }
        } catch {
            print("[WakeRecovery] Error updating config: \(error)")
        }
    }

    private func calculateNextRunTime(_ config: AgentConfig) -> Date {
        let calendar = Calendar.current
        let now = Date()

        guard let schedule = config.schedule else {
            // Default: tomorrow at 8 AM
            return calendar.date(bySettingHour: 8, minute: 0, second: 0, of: now.addingTimeInterval(86400)) ?? now.addingTimeInterval(86400)
        }

        // Parse time from schedule (format "HH:mm")
        let timeComponents = schedule.time?.components(separatedBy: ":") ?? ["08", "00"]
        let hour = Int(timeComponents[0]) ?? 8
        let minute = timeComponents.count > 1 ? Int(timeComponents[1]) ?? 0 : 0

        switch schedule.type {
        case .daily:
            // Find next weekday
            var nextDate = now
            repeat {
                nextDate = calendar.date(byAdding: .day, value: 1, to: nextDate) ?? nextDate
                let weekday = calendar.component(.weekday, from: nextDate)
                if weekday >= 2 && weekday <= 6 { // Mon-Fri
                    break
                }
            } while true

            return calendar.date(bySettingHour: hour, minute: minute, second: 0, of: nextDate) ?? nextDate

        case .weekly:
            let daysOfWeek = schedule.daysOfWeek ?? [2] // Default Monday
            let targetWeekday = daysOfWeek.first ?? 2
            var components = calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: now)
            components.weekday = targetWeekday
            components.hour = hour
            components.minute = minute

            if let nextDate = calendar.date(from: components), nextDate > now {
                return nextDate
            }

            // Next week
            components.weekOfYear = (components.weekOfYear ?? 1) + 1
            return calendar.date(from: components) ?? now.addingTimeInterval(7 * 86400)

        case .calendarTrigger, .eventTrigger:
            // These are event-driven, not scheduled
            return now.addingTimeInterval(86400)
        }
    }

    @MainActor
    private func sendCatchingUpNotification(count: Int) async {
        let content = UNMutableNotificationContent()
        content.title = "Catching up..."
        content.body = "Running \(count) missed \(count == 1 ? "brief" : "briefs")"
        content.sound = nil

        let request = UNNotificationRequest(
            identifier: "catching-up",
            content: content,
            trigger: nil
        )

        try? await UNUserNotificationCenter.current().add(request)
    }

    @MainActor
    private func sendCaughtUpNotification() async {
        let content = UNMutableNotificationContent()
        content.title = "All caught up"
        content.body = "Your briefs are ready to view"
        content.sound = .default

        let request = UNNotificationRequest(
            identifier: "caught-up",
            content: content,
            trigger: nil
        )

        // Remove "catching up" notification
        UNUserNotificationCenter.current().removeDeliveredNotifications(withIdentifiers: ["catching-up"])

        try? await UNUserNotificationCenter.current().add(request)
    }
}

// MARK: - Supporting Types

struct MissedJob {
    let configId: String
    let agentType: AgentType
    let scheduledTime: Date
    let missedCount: Int
}
