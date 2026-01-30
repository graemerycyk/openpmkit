import SwiftUI

/// API Keys settings with provider/model selection
struct AccountSettingsView: View {
    @State private var selectedProvider: LLMProvider = Preferences.shared.llmProvider
    @State private var selectedModelId: String = Preferences.shared.llmModelId

    @State private var anthropicKey: String = ""
    @State private var openaiKey: String = ""
    @State private var googleKey: String = ""
    @State private var deepgramKey: String = ""
    @State private var elevenLabsKey: String = ""

    @State private var showAnthropicKey = false
    @State private var showOpenAIKey = false
    @State private var showGoogleKey = false
    @State private var showDeepgramKey = false
    @State private var showElevenLabsKey = false

    @State private var saveStatus: String?
    @State private var isValidating = false

    var body: some View {
        Form {
            // Header
            Section {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Image(systemName: "brain")
                            .font(.title2)
                            .foregroundColor(.accentColor)

                        VStack(alignment: .leading, spacing: 4) {
                            Text("AI Provider Settings")
                                .font(.headline)
                            Text("Choose your preferred LLM provider and model")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                .padding(.vertical, 8)
            }

            // Provider Selection
            Section("LLM Provider") {
                Picker("Provider", selection: $selectedProvider) {
                    ForEach(LLMProvider.allCases) { provider in
                        HStack {
                            Image(systemName: provider.iconName)
                            Text(provider.displayName)
                        }
                        .tag(provider)
                    }
                }
                .pickerStyle(.segmented)
                .onChange(of: selectedProvider) { _, newProvider in
                    // Update model to default for new provider
                    selectedModelId = newProvider.defaultModel.id
                    Preferences.shared.llmProvider = newProvider
                }

                // Model Selection for current provider
                Picker("Model", selection: $selectedModelId) {
                    ForEach(selectedProvider.models) { model in
                        VStack(alignment: .leading) {
                            Text(model.name)
                            Text(model.tier.description)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .tag(model.id)
                    }
                }
                .onChange(of: selectedModelId) { _, newModelId in
                    Preferences.shared.llmModelId = newModelId
                }

                // Show pricing info
                let pricing = LLMPricing.pricing(for: selectedModelId)
                HStack {
                    Text("Pricing:")
                        .foregroundColor(.secondary)
                    Spacer()
                    Text("$\(String(format: "%.2f", pricing.inputPer1M))/1M input, $\(String(format: "%.2f", pricing.outputPer1M))/1M output")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            // LLM Provider API Keys
            Section("LLM API Keys") {
                // Anthropic
                apiKeyRow(
                    provider: .anthropic,
                    key: $anthropicKey,
                    showKey: $showAnthropicKey,
                    placeholder: "sk-ant-...",
                    isRequired: selectedProvider == .anthropic
                )

                // OpenAI
                apiKeyRow(
                    provider: .openai,
                    key: $openaiKey,
                    showKey: $showOpenAIKey,
                    placeholder: "sk-...",
                    isRequired: selectedProvider == .openai
                )

                // Google
                apiKeyRow(
                    provider: .google,
                    key: $googleKey,
                    showKey: $showGoogleKey,
                    placeholder: "AI...",
                    isRequired: selectedProvider == .google
                )

                Text("Only the API key for your selected provider is required. Keys are stored securely in macOS Keychain.")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            // Voice API Keys (Optional)
            Section("Voice Services (Optional)") {
                // Deepgram
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("Deepgram")
                            .frame(width: 80, alignment: .leading)

                        if showDeepgramKey {
                            TextField("API Key", text: $deepgramKey)
                                .textFieldStyle(.roundedBorder)
                        } else {
                            SecureField("API Key", text: $deepgramKey)
                                .textFieldStyle(.roundedBorder)
                        }

                        Button {
                            showDeepgramKey.toggle()
                        } label: {
                            Image(systemName: showDeepgramKey ? "eye.slash" : "eye")
                        }
                        .buttonStyle(.plain)
                    }

                    HStack {
                        if TokenStorage.shared.getDeepgramAPIKey() != nil {
                            Label("Configured", systemImage: "checkmark.circle.fill")
                                .font(.caption)
                                .foregroundColor(.green)
                        } else {
                            Label("Not configured", systemImage: "minus.circle")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }

                        Spacer()

                        Link("Get API Key", destination: URL(string: "https://console.deepgram.com/")!)
                            .font(.caption)
                    }

                    Text("Enables speech-to-text for voice input")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Divider()

                // ElevenLabs
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("ElevenLabs")
                            .frame(width: 80, alignment: .leading)

                        if showElevenLabsKey {
                            TextField("API Key", text: $elevenLabsKey)
                                .textFieldStyle(.roundedBorder)
                        } else {
                            SecureField("API Key", text: $elevenLabsKey)
                                .textFieldStyle(.roundedBorder)
                        }

                        Button {
                            showElevenLabsKey.toggle()
                        } label: {
                            Image(systemName: showElevenLabsKey ? "eye.slash" : "eye")
                        }
                        .buttonStyle(.plain)
                    }

                    HStack {
                        if TokenStorage.shared.getElevenLabsAPIKey() != nil {
                            Label("Configured", systemImage: "checkmark.circle.fill")
                                .font(.caption)
                                .foregroundColor(.green)
                        } else {
                            Label("Not configured", systemImage: "minus.circle")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }

                        Spacer()

                        Link("Get API Key", destination: URL(string: "https://elevenlabs.io/")!)
                            .font(.caption)
                    }

                    Text("Enables text-to-speech for spoken responses")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            // Save/Clear buttons
            Section {
                HStack {
                    Button {
                        saveKeys()
                    } label: {
                        if isValidating {
                            ProgressView()
                                .scaleEffect(0.7)
                                .frame(width: 16, height: 16)
                            Text("Validating...")
                        } else {
                            Text("Save API Keys")
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(isValidating)

                    if let status = saveStatus {
                        Text(status)
                            .font(.caption)
                            .foregroundColor(status.contains("Error") ? .red : .green)
                    }

                    Spacer()

                    Button("Clear All Keys", role: .destructive) {
                        clearKeys()
                    }
                }
            }
        }
        .formStyle(.grouped)
        .onAppear {
            loadExistingKeys()
        }
    }

    // MARK: - API Key Row

    @ViewBuilder
    private func apiKeyRow(
        provider: LLMProvider,
        key: Binding<String>,
        showKey: Binding<Bool>,
        placeholder: String,
        isRequired: Bool
    ) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                HStack(spacing: 4) {
                    Image(systemName: provider.iconName)
                        .foregroundColor(isRequired ? .accentColor : .secondary)
                    Text(provider.displayName)
                        .foregroundColor(isRequired ? .primary : .secondary)
                    if isRequired {
                        Text("(Active)")
                            .font(.caption)
                            .foregroundColor(.accentColor)
                    }
                }
                .frame(width: 120, alignment: .leading)

                if showKey.wrappedValue {
                    TextField(placeholder, text: key)
                        .textFieldStyle(.roundedBorder)
                } else {
                    SecureField(placeholder, text: key)
                        .textFieldStyle(.roundedBorder)
                }

                Button {
                    showKey.wrappedValue.toggle()
                } label: {
                    Image(systemName: showKey.wrappedValue ? "eye.slash" : "eye")
                }
                .buttonStyle(.plain)
            }

            HStack {
                if TokenStorage.shared.hasAPIKey(for: provider) {
                    Label("Configured", systemImage: "checkmark.circle.fill")
                        .font(.caption)
                        .foregroundColor(.green)
                } else if isRequired {
                    Label("Required", systemImage: "exclamationmark.circle")
                        .font(.caption)
                        .foregroundColor(.orange)
                } else {
                    Label("Not configured", systemImage: "minus.circle")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                Link("Get API Key", destination: provider.apiKeyURL)
                    .font(.caption)
            }
        }
        .padding(.vertical, 4)

        if provider != .google {
            Divider()
        }
    }

    // MARK: - Actions

    private func loadExistingKeys() {
        selectedProvider = Preferences.shared.llmProvider
        selectedModelId = Preferences.shared.llmModelId

        // Load keys (don't show env vars in text fields)
        if ProcessInfo.processInfo.environment["ANTHROPIC_API_KEY"] == nil {
            anthropicKey = TokenStorage.shared.getAnthropicAPIKey() ?? ""
        }
        if ProcessInfo.processInfo.environment["OPENAI_API_KEY"] == nil {
            openaiKey = TokenStorage.shared.getOpenAIAPIKey() ?? ""
        }
        if ProcessInfo.processInfo.environment["GOOGLE_API_KEY"] == nil {
            googleKey = TokenStorage.shared.getGoogleAPIKey() ?? ""
        }
        if ProcessInfo.processInfo.environment["DEEPGRAM_API_KEY"] == nil {
            deepgramKey = TokenStorage.shared.getDeepgramAPIKey() ?? ""
        }
        if ProcessInfo.processInfo.environment["ELEVENLABS_API_KEY"] == nil {
            elevenLabsKey = TokenStorage.shared.getElevenLabsAPIKey() ?? ""
        }
    }

    private func saveKeys() {
        isValidating = true
        saveStatus = nil

        Task {
            // Validate the active provider's key if it was changed
            let activeKey: String
            switch selectedProvider {
            case .anthropic:
                activeKey = anthropicKey
            case .openai:
                activeKey = openaiKey
            case .google:
                activeKey = googleKey
            }

            // Only validate if key is non-empty and different from stored
            let storedKey = TokenStorage.shared.getAPIKey(for: selectedProvider)
            if !activeKey.isEmpty && activeKey != storedKey {
                do {
                    let isValid = try await LLMService.shared.validateAPIKey(activeKey, for: selectedProvider)
                    if !isValid {
                        await MainActor.run {
                            saveStatus = "Error: Invalid \(selectedProvider.displayName) API key"
                            isValidating = false
                        }
                        return
                    }
                } catch {
                    await MainActor.run {
                        saveStatus = "Error: \(error.localizedDescription)"
                        isValidating = false
                    }
                    return
                }
            }

            // Save all non-empty keys
            await MainActor.run {
                if !anthropicKey.isEmpty {
                    TokenStorage.shared.saveAnthropicAPIKey(anthropicKey)
                }
                if !openaiKey.isEmpty {
                    TokenStorage.shared.saveOpenAIAPIKey(openaiKey)
                }
                if !googleKey.isEmpty {
                    TokenStorage.shared.saveGoogleAPIKey(googleKey)
                }
                if !deepgramKey.isEmpty {
                    TokenStorage.shared.saveDeepgramAPIKey(deepgramKey)
                }
                if !elevenLabsKey.isEmpty {
                    TokenStorage.shared.saveElevenLabsAPIKey(elevenLabsKey)
                }

                saveStatus = "Saved!"
                isValidating = false

                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                    saveStatus = nil
                }
            }
        }
    }

    private func clearKeys() {
        TokenStorage.shared.clearAllKeys()
        anthropicKey = ""
        openaiKey = ""
        googleKey = ""
        deepgramKey = ""
        elevenLabsKey = ""
        saveStatus = "Cleared"
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            saveStatus = nil
        }
    }
}

#Preview {
    AccountSettingsView()
}
