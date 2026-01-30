import Foundation

/// Writes workflow artifacts to local storage
final class ArtifactWriter {
    // MARK: - Dependencies

    private let storageManager: LocalStorageManager

    // MARK: - Initialization

    init(storageManager: LocalStorageManager) {
        self.storageManager = storageManager
    }

    // MARK: - Public Methods

    func writeArtifact(
        type: ArtifactType,
        identifier: String? = nil,
        markdown: String,
        json: [String: Any]
    ) throws -> String {
        let folderPath = storageManager.createWorkflowFolder(
            type: type.folderName,
            identifier: identifier
        )

        let mdPath = (folderPath as NSString).appendingPathComponent("output.md")
        let jsonPath = (folderPath as NSString).appendingPathComponent("output.json")

        try storageManager.writeFile(path: mdPath, content: markdown)
        try storageManager.writeJSON(path: jsonPath, object: json)

        return folderPath
    }

    func appendToLog(message: String) {
        let logsPath = (storageManager.basePath as NSString).appendingPathComponent("logs")

        // Ensure logs directory exists
        try? FileManager.default.createDirectory(
            atPath: logsPath,
            withIntermediateDirectories: true,
            attributes: nil
        )

        let logFile = (logsPath as NSString).appendingPathComponent("sessions.json")

        // Read existing log
        var logs: [[String: Any]] = []
        if let data = FileManager.default.contents(atPath: logFile),
           let existing = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]] {
            logs = existing
        }

        // Add new entry
        let entry: [String: Any] = [
            "timestamp": ISO8601DateFormatter().string(from: Date()),
            "message": message
        ]
        logs.append(entry)

        // Keep only last 1000 entries
        if logs.count > 1000 {
            logs = Array(logs.suffix(1000))
        }

        // Write back
        if let data = try? JSONSerialization.data(withJSONObject: logs, options: .prettyPrinted) {
            try? data.write(to: URL(fileURLWithPath: logFile))
        }
    }
}

// MARK: - Artifact Types

enum ArtifactType {
    case dailyBrief
    case meetingPrep
    case featureIntelligence
    case prd
    case sprintReview

    var folderName: String {
        switch self {
        case .dailyBrief: return "daily-brief"
        case .meetingPrep: return "meeting-prep"
        case .featureIntelligence: return "feature-intelligence"
        case .prd: return "prd"
        case .sprintReview: return "sprint-review"
        }
    }

    var displayName: String {
        switch self {
        case .dailyBrief: return "Daily Brief"
        case .meetingPrep: return "Meeting Prep"
        case .featureIntelligence: return "Feature Intelligence"
        case .prd: return "PRD"
        case .sprintReview: return "Sprint Review"
        }
    }
}
