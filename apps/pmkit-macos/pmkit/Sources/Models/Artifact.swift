import Foundation
import SwiftData

/// Represents a generated artifact (markdown content with citations)
@Model
final class Artifact {
    @Attribute(.unique) var id: String
    var agentTypeRaw: String
    var title: String
    var content: String
    var createdAt: Date

    /// File path relative to ~/pmkit/artifacts/
    var filePath: String?

    /// Citations/sources used in this artifact
    @Relationship(deleteRule: .cascade)
    var sources: [ArtifactSource]

    /// Stats extracted from the artifact (JSON encoded)
    var statsData: Data?

    /// Metadata for the artifact (JSON encoded)
    var metadataData: Data?

    var agentType: AgentType {
        get { AgentType(rawValue: agentTypeRaw) ?? .dailyBrief }
        set { agentTypeRaw = newValue.rawValue }
    }

    var stats: ArtifactStats? {
        get {
            guard let data = statsData else { return nil }
            return try? JSONDecoder().decode(ArtifactStats.self, from: data)
        }
        set {
            statsData = try? JSONEncoder().encode(newValue)
        }
    }

    init(
        id: String = UUID().uuidString,
        agentType: AgentType,
        title: String,
        content: String,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.agentTypeRaw = agentType.rawValue
        self.title = title
        self.content = content
        self.createdAt = createdAt
        self.sources = []
    }

    /// Save artifact to file system
    func saveToFile() throws {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        let dateString = dateFormatter.string(from: createdAt)

        let artifactsDir = ConfigService.shared.artifactsURL
            .appendingPathComponent(dateString)

        try FileManager.default.createDirectory(
            at: artifactsDir,
            withIntermediateDirectories: true
        )

        let fileName = "\(agentType.rawValue)-\(id.prefix(8)).md"
        let fileURL = artifactsDir.appendingPathComponent(fileName)

        try content.write(to: fileURL, atomically: true, encoding: .utf8)
        self.filePath = "\(dateString)/\(fileName)"
    }

    /// Full URL to the artifact file
    var fileURL: URL? {
        guard let filePath = filePath else { return nil }
        return ConfigService.shared.artifactsURL.appendingPathComponent(filePath)
    }
}

// MARK: - Supporting Types

@Model
final class ArtifactSource {
    var id: String
    var sourceTypeRaw: String
    var title: String
    var url: String?
    var snippet: String?
    var citationNumber: Int

    var sourceType: SourceType {
        get { SourceType(rawValue: sourceTypeRaw) ?? .web }
        set { sourceTypeRaw = newValue.rawValue }
    }

    init(
        id: String = UUID().uuidString,
        sourceType: SourceType,
        title: String,
        url: String? = nil,
        snippet: String? = nil,
        citationNumber: Int
    ) {
        self.id = id
        self.sourceTypeRaw = sourceType.rawValue
        self.title = title
        self.url = url
        self.snippet = snippet
        self.citationNumber = citationNumber
    }
}

enum SourceType: String, Codable {
    case slack
    case jira
    case confluence
    case googleCalendar
    case gmail
    case gong
    case intercom
    case web
}

/// Stats extracted from artifacts for quick display
struct ArtifactStats: Codable {
    var keyMetrics: [String: String]

    init(keyMetrics: [String: String] = [:]) {
        self.keyMetrics = keyMetrics
    }
}
