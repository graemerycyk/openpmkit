import Foundation

/// Manages local storage for artifacts
final class LocalStorageManager {
    // MARK: - Configuration

    private(set) var basePath: String

    // MARK: - Initialization

    init() {
        let defaultPath = NSString(string: "~/pmkit").expandingTildeInPath
        self.basePath = Preferences.shared.storageLocation.isEmpty
            ? defaultPath
            : Preferences.shared.storageLocation

        ensureBaseDirectoryExists()
    }

    // MARK: - Public Methods

    func updateBasePath(_ path: String) {
        basePath = path
        Preferences.shared.storageLocation = path
        ensureBaseDirectoryExists()
    }

    func createWorkflowFolder(type: String, identifier: String? = nil) -> String {
        let timestamp = formatTimestamp(Date())
        var folderName = "\(timestamp)-\(type)"

        if let identifier = identifier, !identifier.isEmpty {
            folderName += "-\(identifier)"
        }

        let folderPath = (basePath as NSString).appendingPathComponent(folderName)

        do {
            try FileManager.default.createDirectory(
                atPath: folderPath,
                withIntermediateDirectories: true,
                attributes: nil
            )
        } catch {
            print("Failed to create folder: \(error)")
        }

        return folderPath
    }

    func writeFile(path: String, content: String) throws {
        try content.write(toFile: path, atomically: true, encoding: .utf8)
    }

    func writeJSON(path: String, object: [String: Any]) throws {
        let data = try JSONSerialization.data(withJSONObject: object, options: [.prettyPrinted, .sortedKeys])
        try data.write(to: URL(fileURLWithPath: path))
    }

    func readFile(path: String) -> String? {
        return try? String(contentsOfFile: path, encoding: .utf8)
    }

    func listArtifacts() -> [ArtifactFolder] {
        let fileManager = FileManager.default

        guard let contents = try? fileManager.contentsOfDirectory(atPath: basePath) else {
            return []
        }

        return contents.compactMap { name -> ArtifactFolder? in
            let folderPath = (basePath as NSString).appendingPathComponent(name)

            var isDirectory: ObjCBool = false
            guard fileManager.fileExists(atPath: folderPath, isDirectory: &isDirectory),
                  isDirectory.boolValue else {
                return nil
            }

            // Parse folder name
            let components = name.components(separatedBy: "-")
            guard components.count >= 3 else { return nil }

            // Extract date (YYYY-MM-DD)
            let dateStr = components[0...2].joined(separator: "-")

            // Extract time (HHMMSS)
            let timeStr = components.count > 3 ? components[3] : "000000"

            // Extract type and identifier
            let typeComponents = components.dropFirst(4)
            let type = typeComponents.first ?? "unknown"
            let identifier = typeComponents.dropFirst().joined(separator: "-")

            // Parse date
            let formatter = DateFormatter()
            formatter.dateFormat = "yyyy-MM-dd-HHmmss"
            let date = formatter.date(from: "\(dateStr)-\(timeStr)") ?? Date()

            return ArtifactFolder(
                name: name,
                path: folderPath,
                type: type,
                identifier: identifier.isEmpty ? nil : identifier,
                createdAt: date
            )
        }.sorted { $0.createdAt > $1.createdAt }
    }

    func deleteArtifact(path: String) throws {
        try FileManager.default.removeItem(atPath: path)
    }

    func deleteAllArtifacts() {
        let artifacts = listArtifacts()
        for artifact in artifacts {
            try? deleteArtifact(path: artifact.path)
        }
    }

    func archiveOldArtifacts(olderThan days: Int) {
        let artifacts = listArtifacts()
        let cutoffDate = Date().addingTimeInterval(-Double(days) * 24 * 60 * 60)

        let archivePath = (basePath as NSString).appendingPathComponent("archive")
        try? FileManager.default.createDirectory(atPath: archivePath, withIntermediateDirectories: true)

        for artifact in artifacts where artifact.createdAt < cutoffDate {
            let destinationPath = (archivePath as NSString).appendingPathComponent(artifact.name)
            try? FileManager.default.moveItem(atPath: artifact.path, toPath: destinationPath)
        }
    }

    func getStorageStats() -> StorageStats {
        let artifacts = listArtifacts()

        var totalSize: UInt64 = 0
        var briefs = 0
        var meetingPreps = 0
        var prds = 0
        var featureIntel = 0

        for artifact in artifacts {
            // Count by type
            switch artifact.type {
            case "daily-brief": briefs += 1
            case "meeting-prep": meetingPreps += 1
            case "prd": prds += 1
            case "feature-intelligence": featureIntel += 1
            default: break
            }

            // Calculate size
            if let attributes = try? FileManager.default.attributesOfItem(atPath: artifact.path),
               let size = attributes[.size] as? UInt64 {
                totalSize += size
            }
        }

        return StorageStats(
            totalFiles: artifacts.count,
            totalSize: formatBytes(totalSize),
            briefs: briefs,
            meetingPreps: meetingPreps,
            prds: prds,
            featureIntel: featureIntel
        )
    }

    // MARK: - Private Methods

    private func ensureBaseDirectoryExists() {
        let fileManager = FileManager.default

        if !fileManager.fileExists(atPath: basePath) {
            try? fileManager.createDirectory(
                atPath: basePath,
                withIntermediateDirectories: true,
                attributes: nil
            )
        }
    }

    private func formatTimestamp(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd-HHmmss"
        return formatter.string(from: date)
    }

    private func formatBytes(_ bytes: UInt64) -> String {
        let formatter = ByteCountFormatter()
        formatter.countStyle = .file
        return formatter.string(fromByteCount: Int64(bytes))
    }
}

// MARK: - Types

struct ArtifactFolder {
    let name: String
    let path: String
    let type: String
    let identifier: String?
    let createdAt: Date
}

struct StorageStats {
    let totalFiles: Int
    let totalSize: String
    let briefs: Int
    let meetingPreps: Int
    let prds: Int
    let featureIntel: Int
}
