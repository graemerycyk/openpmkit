import Foundation
import AuthenticationServices
import UserNotifications

/// Service for managing OAuth connections to external services
final class ConnectionService: NSObject {
    static let shared = ConnectionService()

    private var authSession: ASWebAuthenticationSession?
    private var presentationContext: ASWebAuthenticationPresentationContextProviding?

    private override init() {
        super.init()
    }

    // MARK: - Connection Status

    func isConnected(_ type: ConnectorType) -> Bool {
        KeychainService.shared.hasOAuthTokens(for: type)
    }

    func getConnectionStatus(_ type: ConnectorType) -> ConnectionStatus {
        guard let tokens = KeychainService.shared.getOAuthTokens(for: type) else {
            return .disconnected
        }

        if tokens.isExpired && tokens.refreshToken == nil {
            return .expired
        }

        if tokens.needsRefresh {
            // Attempt refresh
            Task {
                await refreshTokenIfNeeded(for: type)
            }
        }

        return .connected
    }

    // MARK: - OAuth Flow

    func startOAuthFlow(
        for connector: ConnectorType,
        completion: @escaping (Result<Void, Error>) -> Void
    ) {
        let config = connector.oauthConfig

        // Build authorization URL
        var components = URLComponents(string: config.authURL)!
        var queryItems = [
            URLQueryItem(name: "response_type", value: "code"),
            URLQueryItem(name: "redirect_uri", value: redirectURI(for: connector)),
            URLQueryItem(name: "scope", value: config.scopes.joined(separator: " "))
        ]

        // Add provider-specific parameters
        switch connector {
        case .slack:
            queryItems.append(URLQueryItem(name: "client_id", value: getClientID(for: connector)))
        case .jira, .confluence:
            queryItems.append(URLQueryItem(name: "client_id", value: getClientID(for: connector)))
            queryItems.append(URLQueryItem(name: "audience", value: "api.atlassian.com"))
            queryItems.append(URLQueryItem(name: "prompt", value: "consent"))
        case .googleCalendar, .gmail, .googleDrive:
            queryItems.append(URLQueryItem(name: "client_id", value: getClientID(for: connector)))
            queryItems.append(URLQueryItem(name: "access_type", value: "offline"))
            queryItems.append(URLQueryItem(name: "prompt", value: "consent"))
        case .gong:
            queryItems.append(URLQueryItem(name: "client_id", value: getClientID(for: connector)))
        case .intercom:
            queryItems.append(URLQueryItem(name: "client_id", value: getClientID(for: connector)))
        }

        // Add state for CSRF protection
        let state = UUID().uuidString
        queryItems.append(URLQueryItem(name: "state", value: state))

        components.queryItems = queryItems

        guard let authURL = components.url else {
            completion(.failure(OAuthError.invalidURL))
            return
        }

        // Start authentication session
        authSession = ASWebAuthenticationSession(
            url: authURL,
            callbackURLScheme: "pmkit"
        ) { [weak self] callbackURL, error in
            if let error = error {
                if (error as NSError).code == ASWebAuthenticationSessionError.canceledLogin.rawValue {
                    completion(.failure(OAuthError.userCancelled))
                } else {
                    completion(.failure(error))
                }
                return
            }

            guard let callbackURL = callbackURL else {
                completion(.failure(OAuthError.noCallbackURL))
                return
            }

            // Extract authorization code
            guard let components = URLComponents(url: callbackURL, resolvingAgainstBaseURL: false),
                  let code = components.queryItems?.first(where: { $0.name == "code" })?.value else {
                completion(.failure(OAuthError.noAuthorizationCode))
                return
            }

            // Exchange code for tokens
            Task {
                do {
                    try await self?.exchangeCodeForTokens(
                        code: code,
                        connector: connector
                    )
                    completion(.success(()))
                } catch {
                    completion(.failure(error))
                }
            }
        }

        authSession?.presentationContextProvider = self
        authSession?.prefersEphemeralWebBrowserSession = false
        authSession?.start()
    }

    // MARK: - Token Exchange

    private func exchangeCodeForTokens(
        code: String,
        connector: ConnectorType
    ) async throws {
        let config = connector.oauthConfig

        var request = URLRequest(url: URL(string: config.tokenURL)!)
        request.httpMethod = "POST"
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")

        var params = [
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirectURI(for: connector),
            "client_id": getClientID(for: connector),
            "client_secret": getClientSecret(for: connector)
        ]

        // Slack uses a different parameter name
        if connector == .slack {
            params.removeValue(forKey: "grant_type")
        }

        let body = params.map { "\($0.key)=\($0.value.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")" }
            .joined(separator: "&")
        request.httpBody = body.data(using: .utf8)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw OAuthError.tokenExchangeFailed
        }

        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]

        guard let accessToken = json?["access_token"] as? String else {
            throw OAuthError.invalidTokenResponse
        }

        let refreshToken = json?["refresh_token"] as? String

        var expiresAt: Date?
        if let expiresIn = json?["expires_in"] as? Int {
            expiresAt = Date().addingTimeInterval(TimeInterval(expiresIn))
        }

        // Store tokens
        try KeychainService.shared.setOAuthTokens(
            for: connector,
            accessToken: accessToken,
            refreshToken: refreshToken,
            expiresAt: expiresAt
        )

        // Notify of connection change
        NotificationCenter.default.post(
            name: .connectionStatusChanged,
            object: nil,
            userInfo: ["connector": connector.rawValue, "status": "connected"]
        )
    }

    // MARK: - Token Refresh

    func refreshTokenIfNeeded(for connector: ConnectorType) async {
        guard let tokens = KeychainService.shared.getOAuthTokens(for: connector),
              let refreshToken = tokens.refreshToken,
              tokens.needsRefresh else {
            return
        }

        do {
            try await refreshTokens(refreshToken: refreshToken, connector: connector)
        } catch {
            print("[OAuth] Failed to refresh tokens for \(connector.displayName): \(error)")
            // Token refresh failed - notify user
            await sendReAuthNotification(for: connector)
        }
    }

    private func refreshTokens(
        refreshToken: String,
        connector: ConnectorType
    ) async throws {
        let config = connector.oauthConfig

        var request = URLRequest(url: URL(string: config.tokenURL)!)
        request.httpMethod = "POST"
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")

        let params = [
            "grant_type": "refresh_token",
            "refresh_token": refreshToken,
            "client_id": getClientID(for: connector),
            "client_secret": getClientSecret(for: connector)
        ]

        let body = params.map { "\($0.key)=\($0.value.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")" }
            .joined(separator: "&")
        request.httpBody = body.data(using: .utf8)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw OAuthError.tokenRefreshFailed
        }

        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]

        guard let accessToken = json?["access_token"] as? String else {
            throw OAuthError.invalidTokenResponse
        }

        let newRefreshToken = json?["refresh_token"] as? String ?? refreshToken

        var expiresAt: Date?
        if let expiresIn = json?["expires_in"] as? Int {
            expiresAt = Date().addingTimeInterval(TimeInterval(expiresIn))
        }

        try KeychainService.shared.setOAuthTokens(
            for: connector,
            accessToken: accessToken,
            refreshToken: newRefreshToken,
            expiresAt: expiresAt
        )

        print("[OAuth] Refreshed tokens for \(connector.displayName)")
    }

    // MARK: - Disconnect

    func disconnect(_ connector: ConnectorType) throws {
        try KeychainService.shared.deleteOAuthTokens(for: connector)

        NotificationCenter.default.post(
            name: .connectionStatusChanged,
            object: nil,
            userInfo: ["connector": connector.rawValue, "status": "disconnected"]
        )
    }

    // MARK: - Helpers

    private func redirectURI(for connector: ConnectorType) -> String {
        "pmkit://oauth/\(connector.rawValue)/callback"
    }

    private func getClientID(for connector: ConnectorType) -> String {
        // In production, these would be stored securely
        // For now, return from environment or config
        switch connector {
        case .slack:
            return ProcessInfo.processInfo.environment["SLACK_CLIENT_ID"] ?? ""
        case .jira, .confluence:
            return ProcessInfo.processInfo.environment["ATLASSIAN_CLIENT_ID"] ?? ""
        case .googleCalendar, .gmail, .googleDrive:
            return ProcessInfo.processInfo.environment["GOOGLE_CLIENT_ID"] ?? ""
        case .gong:
            return ProcessInfo.processInfo.environment["GONG_CLIENT_ID"] ?? ""
        case .intercom:
            return ProcessInfo.processInfo.environment["INTERCOM_CLIENT_ID"] ?? ""
        }
    }

    private func getClientSecret(for connector: ConnectorType) -> String {
        switch connector {
        case .slack:
            return ProcessInfo.processInfo.environment["SLACK_CLIENT_SECRET"] ?? ""
        case .jira, .confluence:
            return ProcessInfo.processInfo.environment["ATLASSIAN_CLIENT_SECRET"] ?? ""
        case .googleCalendar, .gmail, .googleDrive:
            return ProcessInfo.processInfo.environment["GOOGLE_CLIENT_SECRET"] ?? ""
        case .gong:
            return ProcessInfo.processInfo.environment["GONG_CLIENT_SECRET"] ?? ""
        case .intercom:
            return ProcessInfo.processInfo.environment["INTERCOM_CLIENT_SECRET"] ?? ""
        }
    }

    @MainActor
    private func sendReAuthNotification(for connector: ConnectorType) async {
        let content = UNMutableNotificationContent()
        content.title = "\(connector.displayName) connection expired"
        content.body = "Tap to reconnect your \(connector.displayName) account"
        content.categoryIdentifier = "REAUTH_REQUIRED"
        content.userInfo = ["connectorType": connector.rawValue]

        let request = UNNotificationRequest(
            identifier: "reauth-\(connector.rawValue)",
            content: content,
            trigger: nil
        )

        try? await UNUserNotificationCenter.current().add(request)
    }
}

// MARK: - ASWebAuthenticationPresentationContextProviding

extension ConnectionService: ASWebAuthenticationPresentationContextProviding {
    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        NSApp.windows.first { $0.isKeyWindow } ?? NSApp.windows.first!
    }
}

// MARK: - OAuth Errors

enum OAuthError: LocalizedError {
    case invalidURL
    case userCancelled
    case noCallbackURL
    case noAuthorizationCode
    case tokenExchangeFailed
    case tokenRefreshFailed
    case invalidTokenResponse

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid authorization URL"
        case .userCancelled:
            return "Authentication was cancelled"
        case .noCallbackURL:
            return "No callback URL received"
        case .noAuthorizationCode:
            return "No authorization code received"
        case .tokenExchangeFailed:
            return "Failed to exchange code for tokens"
        case .tokenRefreshFailed:
            return "Failed to refresh access token"
        case .invalidTokenResponse:
            return "Invalid token response from server"
        }
    }
}
