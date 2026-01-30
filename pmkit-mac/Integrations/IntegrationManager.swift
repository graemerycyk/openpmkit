import Foundation
import Combine
import AppKit

/// Manages all integrations and their connection state
@MainActor
final class IntegrationManager: ObservableObject {
    // MARK: - Published State

    @Published var connectedIntegrations: [Integration] = []
    @Published var isRefreshing: Bool = false
    @Published var lastError: String?

    // MARK: - Dependencies

    private let apiClient: PMKitAPIClient

    // MARK: - Initialization

    init() {
        self.apiClient = PMKitAPIClient.shared
    }

    // MARK: - Public Methods

    func refreshIntegrations() async {
        isRefreshing = true
        defer { isRefreshing = false }

        do {
            let integrations = try await apiClient.getConnectedIntegrations()
            connectedIntegrations = integrations
        } catch {
            lastError = error.localizedDescription
        }
    }

    func isConnected(_ type: IntegrationType) -> Bool {
        connectedIntegrations.contains { $0.type == type && $0.status == .connected }
    }

    func getIntegration(_ type: IntegrationType) -> Integration? {
        connectedIntegrations.first { $0.type == type }
    }

    func startOAuth(for type: IntegrationType) async {
        guard type.isAvailable else {
            lastError = "\(type.displayName) is not yet available"
            return
        }

        do {
            let authURL = try await apiClient.getOAuthURL(for: type)

            // Open in system browser
            if let url = URL(string: authURL) {
                NSWorkspace.shared.open(url)
            }
        } catch {
            lastError = "Failed to start OAuth: \(error.localizedDescription)"
        }
    }

    func completeOAuth(integration: String, code: String) async {
        do {
            try await apiClient.completeOAuth(integration: integration, code: code)
            await refreshIntegrations()
        } catch {
            lastError = "Failed to complete OAuth: \(error.localizedDescription)"
        }
    }

    func disconnect(_ type: IntegrationType) async {
        do {
            try await apiClient.disconnectIntegration(type)
            await refreshIntegrations()
        } catch {
            lastError = "Failed to disconnect: \(error.localizedDescription)"
        }
    }
}
