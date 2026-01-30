import SwiftUI

struct PaywallView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 24) {
            // Header
            VStack(spacing: 12) {
                Image(systemName: "star.circle.fill")
                    .font(.system(size: 56))
                    .foregroundColor(.orange)

                Text("Upgrade to pmkit Pro")
                    .font(.title)
                    .fontWeight(.bold)

                Text("Unlock integrations and full workflow capabilities")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            .padding(.top, 24)

            // Features comparison
            VStack(spacing: 0) {
                // Header row
                HStack {
                    Text("Feature")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    Text("Free")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.secondary)
                        .frame(width: 60)

                    Text("Pro")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.accentColor)
                        .frame(width: 60)
                }
                .padding(.horizontal)
                .padding(.vertical, 8)
                .background(Color.secondary.opacity(0.1))

                // Feature rows
                featureRow("Connect integrations", free: false, pro: true)
                featureRow("Daily briefs", free: false, pro: true)
                featureRow("Meeting prep", free: false, pro: true)
                featureRow("Feature intelligence", free: false, pro: true)
                featureRow("PRD drafting", free: false, pro: true)
                featureRow("Ticket management", free: false, pro: true)
                featureRow("Local artifact storage", free: true, pro: true)
            }
            .background(Color.secondary.opacity(0.05))
            .cornerRadius(12)
            .padding(.horizontal, 24)

            // Pricing
            VStack(spacing: 8) {
                HStack(alignment: .firstTextBaseline, spacing: 4) {
                    Text("$79")
                        .font(.system(size: 36, weight: .bold))

                    Text("/month")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }

                Text("Cancel anytime • 14-day free trial")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            // CTA buttons
            VStack(spacing: 12) {
                Button {
                    openUpgradeURL()
                } label: {
                    Text("Start Free Trial")
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)

                Button {
                    dismiss()
                } label: {
                    Text("Maybe Later")
                        .font(.subheadline)
                }
                .buttonStyle(.plain)
                .foregroundColor(.secondary)
            }
            .padding(.horizontal, 40)

            Spacer()

            // Footer
            HStack(spacing: 16) {
                Link("Terms", destination: URL(string: "https://getpmkit.com/terms")!)
                Link("Privacy", destination: URL(string: "https://getpmkit.com/privacy")!)
            }
            .font(.caption)
            .foregroundColor(.secondary)
            .padding(.bottom, 16)
        }
        .frame(width: 400, height: 600)
    }

    private func featureRow(_ feature: String, free: Bool, pro: Bool) -> some View {
        HStack {
            Text(feature)
                .font(.subheadline)
                .frame(maxWidth: .infinity, alignment: .leading)

            checkmark(free)
                .frame(width: 60)

            checkmark(pro)
                .frame(width: 60)
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
    }

    @ViewBuilder
    private func checkmark(_ included: Bool) -> some View {
        if included {
            Image(systemName: "checkmark")
                .foregroundColor(.green)
                .fontWeight(.medium)
        } else {
            Image(systemName: "minus")
                .foregroundColor(.secondary.opacity(0.5))
        }
    }

    private func openUpgradeURL() {
        if let url = URL(string: "https://getpmkit.com/pricing?source=mac-app") {
            NSWorkspace.shared.open(url)
        }
        dismiss()
    }
}

// MARK: - Inline Paywall Banner

struct PaywallBanner: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "lock.fill")
                .foregroundColor(.orange)

            VStack(alignment: .leading, spacing: 2) {
                Text("Upgrade to unlock")
                    .font(.subheadline)
                    .fontWeight(.medium)

                Text("Connect integrations and run workflows")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            Button("Upgrade") {
                appState.showingPaywall = true
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.small)
        }
        .padding()
        .background(Color.orange.opacity(0.1))
        .cornerRadius(12)
    }
}

#Preview {
    PaywallView()
        .environmentObject(AppState.shared)
}
