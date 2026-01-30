import SwiftUI

/// Settings window - minimal version for debugging
struct SettingsView: View {
    var body: some View {
        VStack(spacing: 20) {
            Text("Settings")
                .font(.title)

            Text("Placeholder for settings")
                .foregroundColor(.secondary)

            Spacer()
        }
        .padding()
        .frame(width: 400, height: 300)
    }
}

#Preview {
    SettingsView()
}
