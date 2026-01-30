import SwiftUI

struct AboutSettingsView: View {
    private let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
    private let buildNumber = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"

    var body: some View {
        Form {
            // App info
            Section {
                VStack(spacing: 16) {
                    Image(systemName: "waveform.circle.fill")
                        .font(.system(size: 64))
                        .foregroundColor(.accentColor)

                    Text("pmkit")
                        .font(.largeTitle)
                        .fontWeight(.bold)

                    Text("Voice-first PM assistant")
                        .font(.subheadline)
                        .foregroundColor(.secondary)

                    Text("Version \(appVersion) (\(buildNumber))")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 24)
            }

            // Links
            Section("Links") {
                linkRow(icon: "globe", title: "Website", url: "https://getpmkit.com")
                linkRow(icon: "book", title: "Documentation", url: "https://getpmkit.com/docs")
                linkRow(icon: "bubble.left.and.bubble.right", title: "Community", url: "https://getpmkit.com/community")
                linkRow(icon: "envelope", title: "Contact Support", url: "mailto:support@getpmkit.com")
            }

            // Legal
            Section("Legal") {
                linkRow(icon: "doc.text", title: "Terms of Service", url: "https://getpmkit.com/terms")
                linkRow(icon: "lock.shield", title: "Privacy Policy", url: "https://getpmkit.com/privacy")
                linkRow(icon: "checkmark.shield", title: "Security", url: "https://getpmkit.com/security")
            }

            // Credits
            Section("Credits") {
                VStack(alignment: .leading, spacing: 8) {
                    creditRow("Speech-to-Text", "Deepgram")
                    creditRow("AI Model", "Claude by Anthropic")
                    creditRow("Text-to-Speech", "ElevenLabs")
                }
            }

            // Debug info (for developers)
            Section("Debug") {
                VStack(alignment: .leading, spacing: 8) {
                    LabeledContent("macOS Version", value: ProcessInfo.processInfo.operatingSystemVersionString)
                    LabeledContent("Architecture", value: getArchitecture())
                    LabeledContent("Memory", value: getMemoryUsage())

                    Divider()

                    Button("Copy Debug Info") {
                        copyDebugInfo()
                    }

                    Button("Open Logs Folder") {
                        openLogsFolder()
                    }
                }
            }

            // Footer
            Section {
                Text("© 2026 pmkit. All rights reserved.")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
            }
        }
        .formStyle(.grouped)
    }

    private func linkRow(icon: String, title: String, url: String) -> some View {
        Button {
            if let url = URL(string: url) {
                NSWorkspace.shared.open(url)
            }
        } label: {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(.accentColor)
                    .frame(width: 24)

                Text(title)

                Spacer()

                Image(systemName: "arrow.up.right.square")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .buttonStyle(.plain)
    }

    private func creditRow(_ service: String, _ provider: String) -> some View {
        HStack {
            Text(service)
                .foregroundColor(.secondary)
            Spacer()
            Text(provider)
                .fontWeight(.medium)
        }
    }

    private func getArchitecture() -> String {
        #if arch(arm64)
        return "Apple Silicon (arm64)"
        #else
        return "Intel (x86_64)"
        #endif
    }

    private func getMemoryUsage() -> String {
        var info = mach_task_basic_info()
        var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size) / 4
        let result = withUnsafeMutablePointer(to: &info) {
            $0.withMemoryRebound(to: integer_t.self, capacity: Int(count)) {
                task_info(mach_task_self_, task_flavor_t(MACH_TASK_BASIC_INFO), $0, &count)
            }
        }

        if result == KERN_SUCCESS {
            let bytesInMB = Double(info.resident_size) / 1024 / 1024
            return String(format: "%.1f MB", bytesInMB)
        }
        return "Unknown"
    }

    private func copyDebugInfo() {
        let info = """
        pmkit Debug Info
        ----------------
        Version: \(appVersion) (\(buildNumber))
        macOS: \(ProcessInfo.processInfo.operatingSystemVersionString)
        Architecture: \(getArchitecture())
        Memory: \(getMemoryUsage())
        Date: \(ISO8601DateFormatter().string(from: Date()))
        """

        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(info, forType: .string)
    }

    private func openLogsFolder() {
        let logsPath = NSString(string: "~/Library/Logs/pmkit").expandingTildeInPath
        let url = URL(fileURLWithPath: logsPath)

        // Create directory if it doesn't exist
        try? FileManager.default.createDirectory(at: url, withIntermediateDirectories: true)

        NSWorkspace.shared.open(url)
    }
}

#Preview {
    AboutSettingsView()
}
