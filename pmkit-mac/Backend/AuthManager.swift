import Foundation
import Combine

/// Manages authentication state
@MainActor
final class AuthManager: ObservableObject {
    // MARK: - Published State

    @Published var isAuthenticated: Bool = false
    @Published var currentUser: User?
    @Published var isLoading: Bool = false
    @Published var error: String?

    // MARK: - Dependencies

    private let apiClient = PMKitAPIClient.shared

    // MARK: - Initialization

    init() {
        // Check for existing tokens
        if TokenStorage.shared.getAccessToken() != nil {
            isAuthenticated = true
        }
    }

    // MARK: - Public Methods

    func checkAuthStatus() async {
        guard TokenStorage.shared.getAccessToken() != nil else {
            isAuthenticated = false
            currentUser = nil
            return
        }

        do {
            let user = try await apiClient.getCurrentUser()
            currentUser = user
            isAuthenticated = true
        } catch {
            // Token may be expired
            isAuthenticated = false
            currentUser = nil
            TokenStorage.shared.clearTokens()
        }
    }

    func signIn() async {
        isLoading = true
        error = nil

        do {
            // This opens the browser for OAuth
            _ = try await apiClient.signIn()
            // Callback handled by AppDelegate
        } catch AuthError.pendingOAuthCallback {
            // Expected - waiting for callback
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }

    func signOut() async {
        TokenStorage.shared.clearTokens()
        isAuthenticated = false
        currentUser = nil
    }

    func refreshSession() async -> Bool {
        guard let refreshToken = TokenStorage.shared.getRefreshToken() else {
            return false
        }

        do {
            let response = try await apiClient.refreshToken(refreshToken)
            TokenStorage.shared.saveTokens(
                accessToken: response.accessToken,
                refreshToken: response.refreshToken
            )
            return true
        } catch {
            await signOut()
            return false
        }
    }
}
