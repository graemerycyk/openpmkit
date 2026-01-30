import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject var appState: AppState
    @State private var currentStep: OnboardingStep = .welcome
    @Environment(\.dismiss) private var dismiss

    enum OnboardingStep: Int, CaseIterable {
        case welcome
        case apiKeys
        case preferences
        case testIt

        var title: String {
            switch self {
            case .welcome: return "Welcome"
            case .apiKeys: return "API Keys"
            case .preferences: return "Preferences"
            case .testIt: return "Try It"
            }
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            // Progress indicator
            progressIndicator
                .padding(.top)

            Divider()
                .padding(.top)

            // Content
            Group {
                switch currentStep {
                case .welcome:
                    WelcomeStep(onContinue: nextStep)
                case .apiKeys:
                    APIKeysStep(onContinue: nextStep, onBack: previousStep)
                case .preferences:
                    PreferencesStep(onContinue: nextStep, onBack: previousStep)
                case .testIt:
                    TestItStep(onComplete: completeOnboarding)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .frame(width: 600, height: 500)
    }

    // MARK: - Progress Indicator

    private var progressIndicator: some View {
        HStack(spacing: 8) {
            ForEach(OnboardingStep.allCases, id: \.self) { step in
                VStack(spacing: 4) {
                    Circle()
                        .fill(step.rawValue <= currentStep.rawValue ? Color.accentColor : Color.secondary.opacity(0.3))
                        .frame(width: 10, height: 10)

                    Text(step.title)
                        .font(.caption2)
                        .foregroundColor(step == currentStep ? .primary : .secondary)
                }
                .frame(maxWidth: .infinity)

                if step != OnboardingStep.allCases.last {
                    Rectangle()
                        .fill(step.rawValue < currentStep.rawValue ? Color.accentColor : Color.secondary.opacity(0.3))
                        .frame(height: 2)
                        .frame(maxWidth: 40)
                }
            }
        }
        .padding(.horizontal, 40)
    }

    // MARK: - Navigation

    private func nextStep() {
        withAnimation(.easeInOut(duration: 0.3)) {
            if let nextIndex = OnboardingStep(rawValue: currentStep.rawValue + 1) {
                currentStep = nextIndex
            }
        }
    }

    private func previousStep() {
        withAnimation(.easeInOut(duration: 0.3)) {
            if let prevIndex = OnboardingStep(rawValue: currentStep.rawValue - 1) {
                currentStep = prevIndex
            }
        }
    }

    private func completeOnboarding() {
        Preferences.shared.hasCompletedOnboarding = true
        dismiss()
    }
}

// MARK: - API Keys Step

struct APIKeysStep: View {
    let onContinue: () -> Void
    let onBack: () -> Void

    @State private var anthropicKey: String = ""
    @State private var showKey = false

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "key.fill")
                .font(.system(size: 48))
                .foregroundColor(.accentColor)

            Text("Configure API Keys")
                .font(.title2)
                .fontWeight(.bold)

            Text("pmkit uses Claude for AI processing. Enter your Anthropic API key to get started.")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)

            VStack(alignment: .leading, spacing: 8) {
                Text("Anthropic API Key")
                    .font(.caption)
                    .foregroundColor(.secondary)

                HStack {
                    if showKey {
                        TextField("sk-ant-...", text: $anthropicKey)
                            .textFieldStyle(.roundedBorder)
                    } else {
                        SecureField("sk-ant-...", text: $anthropicKey)
                            .textFieldStyle(.roundedBorder)
                    }

                    Button {
                        showKey.toggle()
                    } label: {
                        Image(systemName: showKey ? "eye.slash" : "eye")
                    }
                    .buttonStyle(.plain)
                }
                .frame(width: 400)

                HStack {
                    Text("Don't have a key?")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    Link("Get one from Anthropic", destination: URL(string: "https://console.anthropic.com/settings/keys")!)
                        .font(.caption)
                }
            }

            Text("You can also set the ANTHROPIC_API_KEY environment variable.")
                .font(.caption)
                .foregroundColor(.secondary)

            Spacer()

            HStack {
                Button("Back") {
                    onBack()
                }

                Spacer()

                Button("Skip for Now") {
                    onContinue()
                }
                .buttonStyle(.plain)
                .foregroundColor(.secondary)

                Button("Continue") {
                    if !anthropicKey.isEmpty {
                        TokenStorage.shared.saveAnthropicAPIKey(anthropicKey)
                    }
                    onContinue()
                }
                .buttonStyle(.borderedProminent)
            }
            .padding(.horizontal, 40)
            .padding(.bottom, 24)
        }
    }
}

#Preview {
    OnboardingView()
        .environmentObject(AppState.shared)
}
