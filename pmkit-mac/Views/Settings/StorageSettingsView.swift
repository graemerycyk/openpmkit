import SwiftUI

struct StorageSettingsView: View {
    @EnvironmentObject var appState: AppState
    @State private var storagePath: String = Preferences.shared.storageLocation
    @State private var storageStats: StorageStats?
    @State private var isCalculating = false

    struct StorageStats {
        let totalFiles: Int
        let totalSize: String
        let briefs: Int
        let meetingPreps: Int
        let prds: Int
        let featureIntel: Int
    }

    var body: some View {
        Form {
            // Storage location
            Section("Storage Location") {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Artifacts (briefs, PRDs, reports) are saved to:")
                        .font(.subheadline)
                        .foregroundColor(.secondary)

                    HStack {
                        TextField("Path", text: $storagePath)
                            .textFieldStyle(.roundedBorder)
                            .font(.system(.body, design: .monospaced))

                        Button("Browse...") {
                            selectFolder()
                        }
                    }

                    HStack(spacing: 16) {
                        Button("Open in Finder") {
                            openInFinder()
                        }

                        Button("Reset to Default") {
                            resetToDefault()
                        }
                        .foregroundColor(.secondary)
                    }
                }
            }

            // Storage stats
            Section("Storage Statistics") {
                if isCalculating {
                    HStack {
                        ProgressView()
                            .scaleEffect(0.8)
                        Text("Calculating...")
                            .foregroundColor(.secondary)
                    }
                } else if let stats = storageStats {
                    VStack(spacing: 12) {
                        HStack {
                            Text("Total Files")
                            Spacer()
                            Text("\(stats.totalFiles)")
                                .fontWeight(.medium)
                        }

                        HStack {
                            Text("Total Size")
                            Spacer()
                            Text(stats.totalSize)
                                .fontWeight(.medium)
                        }

                        Divider()

                        statsRow(icon: "sun.horizon", title: "Daily Briefs", count: stats.briefs)
                        statsRow(icon: "person.2", title: "Meeting Preps", count: stats.meetingPreps)
                        statsRow(icon: "doc.text", title: "PRD Drafts", count: stats.prds)
                        statsRow(icon: "lightbulb", title: "Feature Intelligence", count: stats.featureIntel)
                    }
                } else {
                    Button("Calculate Storage") {
                        calculateStorage()
                    }
                }
            }

            // Folder structure
            Section("Folder Structure") {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Each workflow creates a timestamped folder:")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    VStack(alignment: .leading, spacing: 4) {
                        folderExample("2026-01-22-083000-daily-brief/")
                        folderExample("2026-01-22-140000-meeting-prep-acme/")
                        folderExample("2026-01-23-091500-prd-search-filters/")
                    }
                    .padding()
                    .background(Color.secondary.opacity(0.05))
                    .cornerRadius(8)

                    Text("Each folder contains:")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .padding(.top, 8)

                    HStack(spacing: 24) {
                        fileItem("output.md", description: "Human-readable")
                        fileItem("output.json", description: "SIEM-friendly")
                    }
                }
            }

            // Cleanup
            Section("Cleanup") {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Artifacts are stored locally and never deleted automatically.")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    HStack(spacing: 16) {
                        Button("Delete All Artifacts") {
                            confirmDeleteAll()
                        }
                        .foregroundColor(.red)

                        Button("Archive Old Artifacts") {
                            archiveOld()
                        }
                    }
                }
            }
        }
        .formStyle(.grouped)
        .onAppear {
            calculateStorage()
        }
    }

    private func statsRow(icon: String, title: String, count: Int) -> some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(.accentColor)
                .frame(width: 24)

            Text(title)

            Spacer()

            Text("\(count)")
                .foregroundColor(.secondary)
        }
    }

    private func folderExample(_ path: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "folder.fill")
                .foregroundColor(.accentColor)
                .font(.caption)

            Text(path)
                .font(.system(.caption, design: .monospaced))
        }
    }

    private func fileItem(_ name: String, description: String) -> some View {
        HStack(spacing: 4) {
            Image(systemName: "doc.fill")
                .foregroundColor(.secondary)
                .font(.caption)

            VStack(alignment: .leading, spacing: 2) {
                Text(name)
                    .font(.system(.caption, design: .monospaced))

                Text(description)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
    }

    private func selectFolder() {
        let panel = NSOpenPanel()
        panel.canChooseFiles = false
        panel.canChooseDirectories = true
        panel.allowsMultipleSelection = false

        if panel.runModal() == .OK, let url = panel.url {
            storagePath = url.path
            Preferences.shared.storageLocation = url.path
            appState.storageManager.updateBasePath(url.path)
            calculateStorage()
        }
    }

    private func openInFinder() {
        NSWorkspace.shared.open(URL(fileURLWithPath: storagePath))
    }

    private func resetToDefault() {
        let defaultPath = NSString(string: "~/pmkit").expandingTildeInPath
        storagePath = defaultPath
        Preferences.shared.storageLocation = defaultPath
        appState.storageManager.updateBasePath(defaultPath)
        calculateStorage()
    }

    private func calculateStorage() {
        isCalculating = true

        Task {
            // In a real implementation, this would scan the directory
            // For now, return placeholder data
            try? await Task.sleep(nanoseconds: 500_000_000)

            await MainActor.run {
                storageStats = StorageStats(
                    totalFiles: 24,
                    totalSize: "1.2 MB",
                    briefs: 12,
                    meetingPreps: 6,
                    prds: 4,
                    featureIntel: 2
                )
                isCalculating = false
            }
        }
    }

    private func confirmDeleteAll() {
        let alert = NSAlert()
        alert.messageText = "Delete All Artifacts?"
        alert.informativeText = "This will permanently delete all briefs, PRDs, and reports. This cannot be undone."
        alert.alertStyle = .warning
        alert.addButton(withTitle: "Delete All")
        alert.addButton(withTitle: "Cancel")

        if alert.runModal() == .alertFirstButtonReturn {
            appState.storageManager.deleteAllArtifacts()
            calculateStorage()
        }
    }

    private func archiveOld() {
        appState.storageManager.archiveOldArtifacts(olderThan: 30)
        calculateStorage()
    }
}

#Preview {
    StorageSettingsView()
        .environmentObject(AppState.shared)
}
