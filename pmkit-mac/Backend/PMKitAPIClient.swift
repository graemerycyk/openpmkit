import Foundation
import AppKit

/// API client for the pmkit backend
final class PMKitAPIClient {
    // MARK: - Singleton

    static let shared = PMKitAPIClient()

    // MARK: - Configuration

    private let baseURL: String = "https://getpmkit.com"
    private let session: URLSession

    // MARK: - Initialization

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: config)
    }

    // MARK: - Auth

    func signIn() async throws -> AuthResponse {
        // Opens OAuth flow in browser, handled via URL scheme callback
        // Uses /auth/mac endpoint which handles desktop app authentication
        let authURL = URL(string: "\(baseURL)/auth/mac?callback=pmkit://auth")!
        NSWorkspace.shared.open(authURL)

        // Wait for callback (handled by AppDelegate)
        throw AuthError.pendingOAuthCallback
    }

    func refreshToken(_ refreshToken: String) async throws -> AuthResponse {
        let endpoint = "/api/auth/refresh"
        let body: [String: Any] = ["refreshToken": refreshToken]

        let response = try await request(endpoint: endpoint, method: "POST", body: body)

        guard let accessToken = response["accessToken"] as? String,
              let newRefreshToken = response["refreshToken"] as? String else {
            throw AuthError.invalidResponse
        }

        return AuthResponse(accessToken: accessToken, refreshToken: newRefreshToken, user: nil)
    }

    func getCurrentUser() async throws -> User {
        let response = try await authenticatedRequest(endpoint: "/api/auth/me", method: "GET")

        guard let user = response["user"] as? [String: Any] else {
            throw AuthError.invalidResponse
        }

        return User(
            id: user["id"] as? String ?? "",
            email: user["email"] as? String ?? "",
            name: user["name"] as? String,
            image: user["image"] as? String,
            tenantId: user["tenantId"] as? String ?? "",
            role: user["role"] as? String ?? "user"
        )
    }

    // MARK: - Subscriptions

    func getSubscriptionStatus() async throws -> SubscriptionResponse {
        let response = try await authenticatedRequest(endpoint: "/api/subscription/status", method: "GET")

        guard let status = response["status"] as? String else {
            throw APIError.invalidResponse
        }

        let subscriptionStatus: SubscriptionStatus
        switch status {
        case "pro": subscriptionStatus = .pro
        case "enterprise": subscriptionStatus = .enterprise
        case "internal": subscriptionStatus = .internal_
        default: subscriptionStatus = .free
        }

        return SubscriptionResponse(
            status: subscriptionStatus,
            expiresAt: (response["expiresAt"] as? String).flatMap { ISO8601DateFormatter().date(from: $0) }
        )
    }

    // MARK: - Integrations

    func getConnectedIntegrations() async throws -> [Integration] {
        let response = try await authenticatedRequest(endpoint: "/api/connectors", method: "GET")

        guard let connectors = response["connectors"] as? [[String: Any]] else {
            throw APIError.invalidResponse
        }

        return connectors.compactMap { dict -> Integration? in
            guard let connectorKey = dict["connectorKey"] as? String,
                  let type = IntegrationType(rawValue: connectorKey) else {
                return nil
            }

            let statusStr = dict["status"] as? String ?? "disconnected"
            let status: IntegrationStatus
            switch statusStr {
            case "active": status = .connected
            case "coming_soon": status = .comingSoon
            default: status = .disconnected
            }

            return Integration(
                id: dict["id"] as? String ?? UUID().uuidString,
                type: type,
                status: status,
                instanceName: dict["workspaceName"] as? String,
                connectedAt: (dict["createdAt"] as? String).flatMap { ISO8601DateFormatter().date(from: $0) }
            )
        }
    }

    func getOAuthURL(for type: IntegrationType) async throws -> String {
        let response = try await authenticatedRequest(
            endpoint: "/api/connectors/\(type.rawValue)/authorize",
            method: "GET"
        )

        guard let url = response["authUrl"] as? String else {
            throw APIError.invalidResponse
        }

        return url
    }

    func completeOAuth(integration: String, code: String) async throws {
        let endpoint = "/api/connectors/\(integration)/callback"
        let body: [String: Any] = ["code": code]

        _ = try await authenticatedRequest(endpoint: endpoint, method: "POST", body: body)
    }

    func disconnectIntegration(_ type: IntegrationType) async throws {
        _ = try await authenticatedRequest(
            endpoint: "/api/connectors/\(type.rawValue)/disconnect",
            method: "POST"
        )
    }

    // MARK: - Voice Processing

    /// Process a voice command using the backend API.
    /// The backend handles STT, intent recognition, workflow execution with real connector data.
    ///
    /// - Parameters:
    ///   - audioData: Raw audio data (webm/opus format)
    ///   - mimeType: MIME type of the audio (default: "audio/webm")
    /// - Returns: VoiceProcessResponse with transcript, intent, response, and artifact
    func processVoiceCommand(audioData: Data, mimeType: String = "audio/webm") async throws -> VoiceProcessResponse {
        guard let accessToken = TokenStorage.shared.getAccessToken() else {
            throw AuthError.notAuthenticated
        }

        let boundary = UUID().uuidString
        var request = URLRequest(url: URL(string: "\(baseURL)/api/voice/process")!)
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")

        // Build multipart form data
        var body = Data()
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"audio\"; filename=\"audio.webm\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: \(mimeType)\r\n\r\n".data(using: .utf8)!)
        body.append(audioData)
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)

        request.httpBody = body

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        if httpResponse.statusCode == 401 {
            throw AuthError.unauthorized
        }

        if httpResponse.statusCode >= 400 {
            throw APIError.httpError(httpResponse.statusCode)
        }

        guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw APIError.invalidResponse
        }

        return try VoiceProcessResponse(from: json)
    }

    /// Process a text command using the backend API (for text fallback mode).
    ///
    /// - Parameter transcript: The text command to process
    /// - Returns: VoiceProcessResponse with intent, response, and artifact
    func processTextCommand(_ transcript: String) async throws -> VoiceProcessResponse {
        let body: [String: Any] = ["transcript": transcript]
        let response = try await authenticatedRequest(endpoint: "/api/voice/process", method: "POST", body: body)
        return try VoiceProcessResponse(from: response)
    }

    // MARK: - Integration API Proxies

    func linearGraphQL(query: String, variables: [String: Any]) async throws -> [String: Any] {
        let endpoint = "/api/linear/graphql"
        let body: [String: Any] = ["query": query, "variables": variables]

        return try await authenticatedRequest(endpoint: endpoint, method: "POST", body: body)
    }

    func jiraRequest(endpoint: String, method: String, body: [String: Any]? = nil) async throws -> [String: Any] {
        let proxyEndpoint = "/api/jira\(endpoint)"
        return try await authenticatedRequest(endpoint: proxyEndpoint, method: method, body: body)
    }

    func slackRequest(endpoint: String, params: [String: String]) async throws -> [String: Any] {
        var urlComponents = URLComponents(string: "\(baseURL)/api/slack/\(endpoint)")!
        urlComponents.queryItems = params.map { URLQueryItem(name: $0.key, value: $0.value) }

        return try await authenticatedRequest(endpoint: urlComponents.url!.path + "?" + (urlComponents.query ?? ""), method: "GET")
    }

    func googleCalendarRequest(endpoint: String, params: [String: String]) async throws -> [String: Any] {
        var urlComponents = URLComponents(string: "\(baseURL)/api/google/calendar/\(endpoint)")!
        urlComponents.queryItems = params.map { URLQueryItem(name: $0.key, value: $0.value) }

        return try await authenticatedRequest(endpoint: urlComponents.url!.path + "?" + (urlComponents.query ?? ""), method: "GET")
    }

    // MARK: - HTTP Helpers

    private func request(endpoint: String, method: String, body: [String: Any]? = nil) async throws -> [String: Any] {
        var request = URLRequest(url: URL(string: "\(baseURL)\(endpoint)")!)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let body = body {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        if httpResponse.statusCode == 401 {
            throw AuthError.unauthorized
        }

        if httpResponse.statusCode >= 400 {
            throw APIError.httpError(httpResponse.statusCode)
        }

        guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw APIError.invalidResponse
        }

        return json
    }

    private func authenticatedRequest(endpoint: String, method: String, body: [String: Any]? = nil) async throws -> [String: Any] {
        guard let accessToken = TokenStorage.shared.getAccessToken() else {
            throw AuthError.notAuthenticated
        }

        var request = URLRequest(url: URL(string: "\(baseURL)\(endpoint)")!)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")

        if let body = body {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        if httpResponse.statusCode == 401 {
            // Try to refresh token
            if let storedRefreshToken = TokenStorage.shared.getRefreshToken() {
                do {
                    let authResponse = try await self.refreshToken(storedRefreshToken)
                    TokenStorage.shared.saveTokens(
                        accessToken: authResponse.accessToken,
                        refreshToken: authResponse.refreshToken
                    )
                    // Retry request with new token
                    return try await authenticatedRequest(endpoint: endpoint, method: method, body: body)
                } catch {
                    throw AuthError.unauthorized
                }
            }
            throw AuthError.unauthorized
        }

        if httpResponse.statusCode >= 400 {
            throw APIError.httpError(httpResponse.statusCode)
        }

        guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw APIError.invalidResponse
        }

        return json
    }
}

// MARK: - Response Types

struct AuthResponse {
    let accessToken: String
    let refreshToken: String
    let user: User?
}

struct SubscriptionResponse {
    let status: SubscriptionStatus
    let expiresAt: Date?
}

/// Response from the voice processing API
struct VoiceProcessResponse {
    let success: Bool
    let transcript: String
    let workflow: String?
    let response: String
    let artifact: VoiceArtifact?
    let connectedIntegrations: [String]
    let isAuthenticated: Bool

    init(from json: [String: Any]) throws {
        guard let success = json["success"] as? Bool else {
            throw APIError.invalidResponse
        }

        self.success = success
        self.transcript = json["transcript"] as? String ?? ""
        self.workflow = json["workflow"] as? String
        self.response = json["response"] as? String ?? ""
        self.connectedIntegrations = json["connectedIntegrations"] as? [String] ?? []
        self.isAuthenticated = json["isAuthenticated"] as? Bool ?? false

        if let artifactDict = json["artifact"] as? [String: Any] {
            self.artifact = VoiceArtifact(
                id: artifactDict["id"] as? String ?? "",
                title: artifactDict["title"] as? String ?? "",
                content: artifactDict["content"] as? String ?? "",
                format: artifactDict["format"] as? String ?? "markdown"
            )
        } else {
            self.artifact = nil
        }
    }
}

/// Artifact returned from voice processing
struct VoiceArtifact {
    let id: String
    let title: String
    let content: String
    let format: String
}

// MARK: - Errors

enum APIError: LocalizedError {
    case invalidResponse
    case httpError(Int)
    case networkError(Error)

    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            return "Invalid response from server"
        case .httpError(let code):
            return "HTTP error: \(code)"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        }
    }
}

enum AuthError: LocalizedError {
    case notAuthenticated
    case unauthorized
    case invalidResponse
    case pendingOAuthCallback

    var errorDescription: String? {
        switch self {
        case .notAuthenticated:
            return "Not authenticated"
        case .unauthorized:
            return "Session expired. Please sign in again."
        case .invalidResponse:
            return "Invalid authentication response"
        case .pendingOAuthCallback:
            return "Waiting for OAuth callback"
        }
    }
}
