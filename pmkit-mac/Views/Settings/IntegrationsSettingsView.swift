import SwiftUI

struct IntegrationsSettingsView: View {
    @EnvironmentObject var appState: AppState

    private var connectedIntegrations: [Integration] {
        appState.connectedIntegrations
    }

    private var availableIntegrations: [IntegrationType] {
        IntegrationType.allCases.filter { type in
            type.isAvailable && !connectedIntegrations.contains { $0.type == type }
        }
    }

    private var comingSoonIntegrations: [IntegrationType] {
        IntegrationType.allCases.filter { !$0.isAvailable }
    }

    var body: some View {
        Form {
            // Header
            Section {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Connect your PM tools to pull data into workflows.")
                        .font(.subheadline)
                        .foregroundColor(.secondary)

                    if !appState.subscriptionStatus.isPaid {
                        HStack(spacing: 8) {
                            Image(systemName: "lock.fill")
                                .foregroundColor(.orange)

                            Text("pmkit Pro required to connect integrations")
                                .font(.caption)
                                .foregroundColor(.orange)

                            Spacer()

                            Button("Upgrade") {
                                appState.showingPaywall = true
                            }
                            .buttonStyle(.borderedProminent)
                            .controlSize(.small)
                        }
                        .padding(12)
                        .background(Color.orange.opacity(0.1))
                        .cornerRadius(8)
                    }
                }
            }

            // Connected integrations
            if !connectedIntegrations.isEmpty {
                Section("Connected") {
                    ForEach(connectedIntegrations) { integration in
                        IntegrationCard(
                            type: integration.type,
                            status: .connected,
                            instanceName: integration.instanceName,
                            isPaidRequired: false,
                            onAction: {
                                Task {
                                    await appState.disconnectIntegration(integration.type)
                                }
                            }
                        )
                    }
                }
            }

            // Available integrations
            if !availableIntegrations.isEmpty {
                Section("Available") {
                    ForEach(availableIntegrations) { integration in
                        IntegrationCard(
                            type: integration,
                            status: .disconnected,
                            instanceName: nil,
                            isPaidRequired: !appState.subscriptionStatus.isPaid,
                            onAction: {
                                Task {
                                    await appState.connectIntegration(integration)
                                }
                            }
                        )
                    }
                }
            }

            // Coming soon integrations
            Section("Coming Soon") {
                ForEach(comingSoonIntegrations) { integration in
                    IntegrationCard(
                        type: integration,
                        status: .comingSoon,
                        instanceName: nil,
                        isPaidRequired: false,
                        onAction: {}
                    )
                }
            }
        }
        .formStyle(.grouped)
    }
}

#Preview {
    IntegrationsSettingsView()
        .environmentObject(AppState.shared)
}
