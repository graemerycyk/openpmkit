import SwiftUI

struct IntegrationCard: View {
    let type: IntegrationType
    let status: IntegrationStatus
    let instanceName: String?
    let isPaidRequired: Bool
    let onAction: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            // Icon
            Image(systemName: type.iconName)
                .font(.title2)
                .foregroundColor(iconColor)
                .frame(width: 36, height: 36)
                .background(iconBackgroundColor)
                .cornerRadius(8)

            // Info
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(type.displayName)
                        .font(.subheadline)
                        .fontWeight(.medium)

                    if type.capabilities == .readWrite {
                        Text("R/W")
                            .font(.caption2)
                            .padding(.horizontal, 4)
                            .padding(.vertical, 1)
                            .background(Color.accentColor.opacity(0.2))
                            .foregroundColor(.accentColor)
                            .cornerRadius(3)
                    }
                }

                Text(type.description)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(1)

                if let instance = instanceName, status == .connected {
                    Text(instance)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }

            Spacer()

            // Action button
            actionButton
        }
        .padding(.vertical, 8)
    }

    private var iconColor: Color {
        switch status {
        case .connected:
            return .green
        case .disconnected:
            return isPaidRequired ? .secondary : .accentColor
        case .comingSoon:
            return .secondary
        }
    }

    private var iconBackgroundColor: Color {
        switch status {
        case .connected:
            return .green.opacity(0.1)
        case .disconnected:
            return isPaidRequired ? Color.secondary.opacity(0.1) : Color.accentColor.opacity(0.1)
        case .comingSoon:
            return Color.secondary.opacity(0.05)
        }
    }

    @ViewBuilder
    private var actionButton: some View {
        switch status {
        case .connected:
            Button("Disconnect") {
                onAction()
            }
            .buttonStyle(.bordered)
            .controlSize(.small)
            .foregroundColor(.red)

        case .disconnected:
            if isPaidRequired {
                Button {
                    onAction()
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "lock.fill")
                            .font(.caption2)
                        Text("Connect")
                    }
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
                .foregroundColor(.orange)
            } else {
                Button("Connect") {
                    onAction()
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.small)
            }

        case .comingSoon:
            Text("Coming Soon")
                .font(.caption)
                .foregroundColor(.secondary)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.secondary.opacity(0.1))
                .cornerRadius(4)
        }
    }
}

#Preview {
    VStack(spacing: 16) {
        IntegrationCard(
            type: .slack,
            status: .connected,
            instanceName: "acme.slack.com",
            isPaidRequired: false,
            onAction: {}
        )

        IntegrationCard(
            type: .linear,
            status: .disconnected,
            instanceName: nil,
            isPaidRequired: false,
            onAction: {}
        )

        IntegrationCard(
            type: .jira,
            status: .disconnected,
            instanceName: nil,
            isPaidRequired: true,
            onAction: {}
        )

        IntegrationCard(
            type: .gong,
            status: .comingSoon,
            instanceName: nil,
            isPaidRequired: false,
            onAction: {}
        )
    }
    .padding()
    .frame(width: 400)
}
