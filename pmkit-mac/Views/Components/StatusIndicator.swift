import SwiftUI

struct StatusIndicator: View {
    let status: Status
    var showLabel: Bool = true
    var size: Size = .medium

    enum Status {
        case connected
        case disconnected
        case connecting
        case error(String?)

        var color: Color {
            switch self {
            case .connected: return .green
            case .disconnected: return .gray
            case .connecting: return .orange
            case .error: return .red
            }
        }

        var label: String {
            switch self {
            case .connected: return "Connected"
            case .disconnected: return "Disconnected"
            case .connecting: return "Connecting..."
            case .error(let message): return message ?? "Error"
            }
        }

        var icon: String {
            switch self {
            case .connected: return "checkmark.circle.fill"
            case .disconnected: return "circle"
            case .connecting: return "arrow.triangle.2.circlepath"
            case .error: return "exclamationmark.circle.fill"
            }
        }
    }

    enum Size {
        case small
        case medium
        case large

        var dotSize: CGFloat {
            switch self {
            case .small: return 6
            case .medium: return 8
            case .large: return 12
            }
        }

        var font: Font {
            switch self {
            case .small: return .caption2
            case .medium: return .caption
            case .large: return .subheadline
            }
        }
    }

    var body: some View {
        HStack(spacing: 6) {
            ZStack {
                Circle()
                    .fill(status.color)
                    .frame(width: size.dotSize, height: size.dotSize)

                if case .connecting = status {
                    Circle()
                        .stroke(status.color.opacity(0.5), lineWidth: 2)
                        .frame(width: size.dotSize + 4, height: size.dotSize + 4)
                        .rotationEffect(.degrees(360))
                        .animation(
                            Animation.linear(duration: 1).repeatForever(autoreverses: false),
                            value: UUID()
                        )
                }
            }

            if showLabel {
                Text(status.label)
                    .font(size.font)
                    .foregroundColor(status.color)
            }
        }
    }
}

// MARK: - Connection Status Badge

struct ConnectionStatusBadge: View {
    let isConnected: Bool
    var size: StatusIndicator.Size = .small

    var body: some View {
        StatusIndicator(
            status: isConnected ? .connected : .disconnected,
            showLabel: false,
            size: size
        )
    }
}

// MARK: - Service Status Row

struct ServiceStatusRow: View {
    let name: String
    let status: StatusIndicator.Status
    var icon: String? = nil

    var body: some View {
        HStack {
            if let iconName = icon {
                Image(systemName: iconName)
                    .foregroundColor(.secondary)
                    .frame(width: 24)
            }

            Text(name)

            Spacer()

            StatusIndicator(status: status, showLabel: true, size: .small)
        }
    }
}

#Preview {
    VStack(spacing: 24) {
        // Different statuses
        VStack(alignment: .leading, spacing: 12) {
            Text("Status Indicators")
                .font(.headline)

            StatusIndicator(status: .connected)
            StatusIndicator(status: .disconnected)
            StatusIndicator(status: .connecting)
            StatusIndicator(status: .error("Connection failed"))
        }

        Divider()

        // Different sizes
        VStack(alignment: .leading, spacing: 12) {
            Text("Sizes")
                .font(.headline)

            StatusIndicator(status: .connected, size: .small)
            StatusIndicator(status: .connected, size: .medium)
            StatusIndicator(status: .connected, size: .large)
        }

        Divider()

        // Service status rows
        VStack(alignment: .leading, spacing: 12) {
            Text("Service Status Rows")
                .font(.headline)

            ServiceStatusRow(name: "Deepgram", status: .connected, icon: "waveform")
            ServiceStatusRow(name: "ElevenLabs", status: .connecting, icon: "speaker.wave.3")
            ServiceStatusRow(name: "Claude", status: .error("Rate limited"), icon: "brain")
        }
    }
    .padding()
    .frame(width: 300)
}
