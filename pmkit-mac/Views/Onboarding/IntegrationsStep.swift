import SwiftUI

struct IntegrationsStep: View {
    @EnvironmentObject var appState: AppState
    let onContinue: () -> Void
    let onBack: () -> Void

    private var availableIntegrations: [IntegrationType] {
        IntegrationType.allCases.filter { $0.isAvailable }
    }

    var body: some View {
        VStack(spacing: 24) {
            // Header
            VStack(spacing: 8) {
                Image(systemName: "link.circle")
                    .font(.system(size: 48))
                    .foregroundColor(.accentColor)

                Text("Connect Your Tools")
                    .font(.title)
                    .fontWeight(.bold)

                Text("pmkit pulls data from your PM tools to power workflows")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            .padding(.top, 24)

            // Integration list
            ScrollView {
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    ForEach(availableIntegrations) { integration in
                        integrationCard(integration)
                    }
                }
                .padding(.horizontal)
            }

            // Info text
            if !appState.subscriptionStatus.isPaid {
                HStack(spacing: 8) {
                    Image(systemName: "lock.fill")
                        .font(.caption)
                        .foregroundColor(.orange)

                    Text("Upgrade to pmkit Pro to connect integrations")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.horizontal)
            }

            // Navigation buttons
            HStack {
                Button("Back") {
                    onBack()
                }
                .buttonStyle(.bordered)

                Spacer()

                Text("\(appState.connectedIntegrations.count) connected")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Button("Continue") {
                    onContinue()
                }
                .buttonStyle(.borderedProminent)
            }
            .padding(.horizontal, 40)
            .padding(.bottom, 24)
        }
    }

    private func integrationCard(_ integration: IntegrationType) -> some View {
        let isConnected = appState.connectedIntegrations.contains { $0.type == integration }
        let isPaidRequired = !appState.subscriptionStatus.isPaid

        return Button {
            if isPaidRequired {
                appState.showingPaywall = true
            } else if isConnected {
                Task {
                    await appState.disconnectIntegration(integration)
                }
            } else {
                Task {
                    await appState.connectIntegration(integration)
                }
            }
        } label: {
            HStack(spacing: 12) {
                Image(systemName: integration.iconName)
                    .font(.title3)
                    .foregroundColor(isConnected ? .green : .secondary)
                    .frame(width: 32)

                VStack(alignment: .leading, spacing: 2) {
                    Text(integration.displayName)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)

                    Text(integration.capabilities == .readWrite ? "Read + Write" : "Read only")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }

                Spacer()

                if isPaidRequired {
                    Image(systemName: "lock.fill")
                        .font(.caption)
                        .foregroundColor(.orange)
                } else if isConnected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                } else {
                    Text("Connect")
                        .font(.caption)
                        .foregroundColor(.accentColor)
                }
            }
            .padding(12)
            .background(isConnected ? Color.green.opacity(0.1) : Color.secondary.opacity(0.05))
            .cornerRadius(10)
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(isConnected ? Color.green.opacity(0.3) : Color.clear, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    IntegrationsStep(onContinue: {}, onBack: {})
        .environmentObject(AppState.shared)
}
