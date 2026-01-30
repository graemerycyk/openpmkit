import SwiftUI

struct SubscriptionStep: View {
    @EnvironmentObject var appState: AppState
    let onContinue: () -> Void
    let onBack: () -> Void

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            // Icon
            Image(systemName: appState.subscriptionStatus.isPaid ? "checkmark.seal.fill" : "star.circle")
                .font(.system(size: 64))
                .foregroundColor(appState.subscriptionStatus.isPaid ? .green : .orange)

            // Title
            VStack(spacing: 8) {
                if appState.subscriptionStatus.isPaid {
                    Text("You're all set!")
                        .font(.title)
                        .fontWeight(.bold)

                    Text("Your \(appState.subscriptionStatus.displayName) subscription is active")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                } else {
                    Text("Unlock Full Access")
                        .font(.title)
                        .fontWeight(.bold)

                    Text("pmkit Pro is required to connect integrations")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            }

            // Subscription details
            if appState.subscriptionStatus.isPaid {
                // Show active subscription
                VStack(spacing: 16) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("pmkit \(appState.subscriptionStatus.displayName)")
                                .font(.headline)

                            Text("Unlimited workflows and integrations")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }

                        Spacer()

                        Text("Active")
                            .font(.caption)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.green.opacity(0.2))
                            .foregroundColor(.green)
                            .cornerRadius(4)
                    }
                    .padding()
                    .background(Color.secondary.opacity(0.1))
                    .cornerRadius(12)
                }
                .padding(.horizontal, 60)
            } else {
                // Show upgrade options
                VStack(spacing: 20) {
                    // Pro plan card
                    VStack(spacing: 12) {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("pmkit Pro")
                                    .font(.headline)

                                Text("$79/month")
                                    .font(.title2)
                                    .fontWeight(.bold)
                            }

                            Spacer()
                        }

                        Divider()

                        VStack(alignment: .leading, spacing: 8) {
                            featureItem("Connect all integrations")
                            featureItem("Unlimited daily briefs")
                            featureItem("Unlimited meeting prep")
                            featureItem("PRD drafting")
                            featureItem("Voice ticket management")
                        }

                        Button {
                            openUpgradeURL()
                        } label: {
                            Text("Upgrade to Pro")
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 8)
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding()
                    .background(Color.accentColor.opacity(0.1))
                    .cornerRadius(12)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.accentColor, lineWidth: 2)
                    )

                    // Free tier info
                    Text("Free users can sign in and explore, but integrations require Pro")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.horizontal, 60)
            }

            Spacer()

            // Navigation buttons
            HStack {
                Button("Back") {
                    onBack()
                }
                .buttonStyle(.bordered)

                Spacer()

                if !appState.subscriptionStatus.isPaid {
                    Button("Skip for now") {
                        onContinue()
                    }
                    .buttonStyle(.plain)
                    .foregroundColor(.secondary)
                }

                Button("Continue") {
                    onContinue()
                }
                .buttonStyle(.borderedProminent)
            }
            .padding(.horizontal, 80)
            .padding(.bottom, 40)
        }
    }

    private func featureItem(_ text: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "checkmark")
                .font(.caption)
                .foregroundColor(.green)

            Text(text)
                .font(.subheadline)

            Spacer()
        }
    }

    private func openUpgradeURL() {
        if let url = URL(string: "https://getpmkit.com/pricing") {
            NSWorkspace.shared.open(url)
        }
    }
}

#Preview {
    SubscriptionStep(onContinue: {}, onBack: {})
        .environmentObject(AppState.shared)
}
