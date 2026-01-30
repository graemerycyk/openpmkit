import SwiftUI

struct WelcomeStep: View {
    let onContinue: () -> Void

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            // Logo
            ZStack {
                Circle()
                    .fill(Color.accentColor.opacity(0.1))
                    .frame(width: 120, height: 120)

                Image(systemName: "waveform.circle.fill")
                    .font(.system(size: 64))
                    .foregroundColor(.accentColor)
            }

            // Title
            VStack(spacing: 8) {
                Text("Welcome to pmkit")
                    .font(.largeTitle)
                    .fontWeight(.bold)

                Text("Your voice-first PM assistant")
                    .font(.title3)
                    .foregroundColor(.secondary)
            }

            // Features
            VStack(alignment: .leading, spacing: 16) {
                featureRow(
                    icon: "calendar.badge.clock",
                    title: "Daily Briefs",
                    description: "Get caught up on what happened overnight"
                )

                featureRow(
                    icon: "person.2.circle",
                    title: "Meeting Prep",
                    description: "Context on attendees and open issues"
                )

                featureRow(
                    icon: "lightbulb.circle",
                    title: "Feature Intelligence",
                    description: "What are customers asking for?"
                )

                featureRow(
                    icon: "doc.text.magnifyingglass",
                    title: "PRD Drafts",
                    description: "Draft requirements by voice"
                )

                featureRow(
                    icon: "checklist",
                    title: "Ticket Management",
                    description: "Create, update, and query tickets"
                )
            }
            .padding(.horizontal, 40)

            Spacer()

            // Continue button
            Button {
                onContinue()
            } label: {
                Text("Get Started")
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
            .padding(.horizontal, 80)
            .padding(.bottom, 40)
        }
    }

    private func featureRow(icon: String, title: String, description: String) -> some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(.accentColor)
                .frame(width: 32)

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)

                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()
        }
    }
}

#Preview {
    WelcomeStep(onContinue: {})
}
