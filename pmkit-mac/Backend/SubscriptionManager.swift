import Foundation
import Combine

/// Manages subscription status
@MainActor
final class SubscriptionManager: ObservableObject {
    // MARK: - Published State

    @Published var status: SubscriptionStatus = .free
    @Published var expiresAt: Date?
    @Published var isLoading: Bool = false

    // MARK: - Dependencies

    private let apiClient = PMKitAPIClient.shared

    // MARK: - Public Methods

    func checkSubscriptionStatus() async {
        isLoading = true

        do {
            let response = try await apiClient.getSubscriptionStatus()
            status = response.status
            expiresAt = response.expiresAt
        } catch {
            // Default to free on error
            status = .free
        }

        isLoading = false
    }

    func requiresPaidSubscription(for feature: PaidFeature) -> Bool {
        guard !status.isPaid else { return false }

        switch feature {
        case .connectIntegrations:
            return true
        case .runWorkflows:
            return true
        case .unlimitedHistory:
            return true
        }
    }
}

// MARK: - Paid Features

enum PaidFeature {
    case connectIntegrations
    case runWorkflows
    case unlimitedHistory
}
