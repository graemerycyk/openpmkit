import Foundation

/// Logs session activity for audit trail / SIEM
final class SessionLogger {
    // MARK: - Singleton

    static let shared = SessionLogger()

    // MARK: - Configuration

    private let logsDirectory: String
    private let maxLogEntries = 10000
    private let maxLogFiles = 30

    // MARK: - Initialization

    private init() {
        let basePath = NSString(string: "~/pmkit/logs").expandingTildeInPath
        self.logsDirectory = basePath

        ensureDirectoryExists()
        rotateLogsIfNeeded()
    }

    // MARK: - Public Methods

    func log(event: LogEvent) {
        let entry = LogEntry(
            timestamp: Date(),
            event: event.type,
            details: event.details,
            userId: event.userId,
            sessionId: event.sessionId
        )

        appendEntry(entry)
    }

    func logWorkflowStart(type: String, userId: String) {
        log(event: LogEvent(
            type: .workflowStart,
            details: ["workflow_type": type],
            userId: userId,
            sessionId: currentSessionId
        ))
    }

    func logWorkflowComplete(type: String, durationMs: Int, artifactPath: String?, userId: String) {
        var details: [String: Any] = [
            "workflow_type": type,
            "duration_ms": durationMs
        ]
        if let path = artifactPath {
            details["artifact_path"] = path
        }

        log(event: LogEvent(
            type: .workflowComplete,
            details: details,
            userId: userId,
            sessionId: currentSessionId
        ))
    }

    func logWorkflowError(type: String, error: String, userId: String) {
        log(event: LogEvent(
            type: .workflowError,
            details: [
                "workflow_type": type,
                "error": error
            ],
            userId: userId,
            sessionId: currentSessionId
        ))
    }

    func logVoiceCommand(transcription: String, intent: String?, userId: String) {
        var details: [String: Any] = ["transcription": transcription]
        if let intent = intent {
            details["intent"] = intent
        }

        log(event: LogEvent(
            type: .voiceCommand,
            details: details,
            userId: userId,
            sessionId: currentSessionId
        ))
    }

    func logIntegrationAccess(integration: String, operation: String, userId: String) {
        log(event: LogEvent(
            type: .integrationAccess,
            details: [
                "integration": integration,
                "operation": operation
            ],
            userId: userId,
            sessionId: currentSessionId
        ))
    }

    func logAuthEvent(action: String, userId: String?) {
        log(event: LogEvent(
            type: .auth,
            details: ["action": action],
            userId: userId,
            sessionId: currentSessionId
        ))
    }

    // MARK: - Session Management

    private var _currentSessionId: String?

    var currentSessionId: String {
        if let id = _currentSessionId {
            return id
        }
        let id = UUID().uuidString
        _currentSessionId = id
        return id
    }

    func startNewSession() {
        _currentSessionId = UUID().uuidString

        log(event: LogEvent(
            type: .sessionStart,
            details: [:],
            userId: nil,
            sessionId: currentSessionId
        ))
    }

    func endSession() {
        log(event: LogEvent(
            type: .sessionEnd,
            details: [:],
            userId: nil,
            sessionId: currentSessionId
        ))

        _currentSessionId = nil
    }

    // MARK: - Private Methods

    private func ensureDirectoryExists() {
        try? FileManager.default.createDirectory(
            atPath: logsDirectory,
            withIntermediateDirectories: true,
            attributes: nil
        )
    }

    private func appendEntry(_ entry: LogEntry) {
        let todayFile = currentLogFilePath()

        // Read existing entries
        var entries: [[String: Any]] = []
        if let data = FileManager.default.contents(atPath: todayFile),
           let existing = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]] {
            entries = existing
        }

        // Add new entry
        entries.append(entry.toDictionary())

        // Trim if needed
        if entries.count > maxLogEntries {
            entries = Array(entries.suffix(maxLogEntries))
        }

        // Write back
        if let data = try? JSONSerialization.data(withJSONObject: entries, options: [.prettyPrinted]) {
            try? data.write(to: URL(fileURLWithPath: todayFile))
        }
    }

    private func currentLogFilePath() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        let fileName = "session-\(formatter.string(from: Date())).json"
        return (logsDirectory as NSString).appendingPathComponent(fileName)
    }

    private func rotateLogsIfNeeded() {
        let fileManager = FileManager.default

        guard let files = try? fileManager.contentsOfDirectory(atPath: logsDirectory) else {
            return
        }

        let logFiles = files.filter { $0.hasPrefix("session-") && $0.hasSuffix(".json") }
            .sorted()

        if logFiles.count > maxLogFiles {
            let filesToDelete = logFiles.prefix(logFiles.count - maxLogFiles)
            for file in filesToDelete {
                let path = (logsDirectory as NSString).appendingPathComponent(file)
                try? fileManager.removeItem(atPath: path)
            }
        }
    }
}

// MARK: - Types

struct LogEvent {
    let type: LogEventType
    let details: [String: Any]
    let userId: String?
    let sessionId: String
}

enum LogEventType: String {
    case sessionStart = "session_start"
    case sessionEnd = "session_end"
    case voiceCommand = "voice_command"
    case workflowStart = "workflow_start"
    case workflowComplete = "workflow_complete"
    case workflowError = "workflow_error"
    case integrationAccess = "integration_access"
    case auth = "auth"
}

struct LogEntry {
    let timestamp: Date
    let event: LogEventType
    let details: [String: Any]
    let userId: String?
    let sessionId: String

    func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "timestamp": ISO8601DateFormatter().string(from: timestamp),
            "event": event.rawValue,
            "details": details,
            "session_id": sessionId
        ]
        if let userId = userId {
            dict["user_id"] = userId
        }
        return dict
    }
}
