import SwiftUI
import SwiftData

/// Main view displayed in the menu bar popover
struct MenuBarView: View {
    var body: some View {
        VStack(spacing: 16) {
            Text("pmkit")
                .font(.headline)

            Text("Menu bar app is running")
                .foregroundColor(.secondary)

            Spacer()

            Button("Quit") {
                NSApplication.shared.terminate(nil)
            }
        }
        .padding()
        .frame(width: 300, height: 200)
    }
}

#Preview {
    MenuBarView()
}
