import Foundation
import SwiftUI

// MARK: - Date Extensions

extension Date {
    /// Format date for display
    func formatted(style: DateFormatter.Style = .medium) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = style
        formatter.timeStyle = .short
        return formatter.string(from: self)
    }

    /// Relative time description (e.g., "2 hours ago")
    var relativeDescription: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: self, relativeTo: Date())
    }

    /// Check if date is today
    var isToday: Bool {
        Calendar.current.isDateInToday(self)
    }

    /// Check if date is yesterday
    var isYesterday: Bool {
        Calendar.current.isDateInYesterday(self)
    }
}

// MARK: - String Extensions

extension String {
    /// Truncate string with ellipsis
    func truncated(to length: Int, trailing: String = "...") -> String {
        if count > length {
            return String(prefix(length - trailing.count)) + trailing
        }
        return self
    }

    /// Remove extra whitespace and newlines
    var trimmed: String {
        trimmingCharacters(in: .whitespacesAndNewlines)
    }

    /// Check if string is valid email
    var isValidEmail: Bool {
        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let predicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
        return predicate.evaluate(with: self)
    }

    /// Convert to URL-safe slug
    var slug: String {
        lowercased()
            .replacingOccurrences(of: " ", with: "-")
            .components(separatedBy: CharacterSet.alphanumerics.inverted.subtracting(CharacterSet(charactersIn: "-")))
            .joined()
    }
}

// MARK: - Array Extensions

extension Array {
    /// Safe subscript that returns nil for out-of-bounds indices
    subscript(safe index: Int) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}

extension Array where Element: Hashable {
    /// Remove duplicates while preserving order
    var uniqued: [Element] {
        var seen = Set<Element>()
        return filter { seen.insert($0).inserted }
    }
}

// MARK: - Color Extensions

extension Color {
    /// pmkit brand colors
    static let pmkitAccent = Color(red: 0.0, green: 0.47, blue: 0.95)  // Cobalt blue
    static let pmkitSuccess = Color.green
    static let pmkitWarning = Color.orange
    static let pmkitError = Color.red

    /// Initialize from hex string
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)

        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - View Extensions

extension View {
    /// Apply modifier conditionally
    @ViewBuilder
    func `if`<Content: View>(_ condition: Bool, transform: (Self) -> Content) -> some View {
        if condition {
            transform(self)
        } else {
            self
        }
    }

    /// Hide view conditionally
    @ViewBuilder
    func hidden(_ shouldHide: Bool) -> some View {
        if shouldHide {
            self.hidden()
        } else {
            self
        }
    }
}

// MARK: - Bundle Extensions

extension Bundle {
    /// App version string
    var appVersion: String {
        infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
    }

    /// Build number
    var buildNumber: String {
        infoDictionary?["CFBundleVersion"] as? String ?? "1"
    }

    /// Full version string (e.g., "1.0.0 (1)")
    var fullVersion: String {
        "\(appVersion) (\(buildNumber))"
    }
}

// MARK: - URL Extensions

extension URL {
    /// Open URL in default browser
    func openInBrowser() {
        NSWorkspace.shared.open(self)
    }
}

// MARK: - Notification.Name Extensions

extension Notification.Name {
    static let voiceStateChanged = Notification.Name("voiceStateChanged")
    static let integrationConnected = Notification.Name("integrationConnected")
    static let integrationDisconnected = Notification.Name("integrationDisconnected")
    static let workflowCompleted = Notification.Name("workflowCompleted")
    static let authStateChanged = Notification.Name("authStateChanged")
}

// MARK: - Result Extensions

extension Result {
    /// Check if result is success
    var isSuccess: Bool {
        switch self {
        case .success: return true
        case .failure: return false
        }
    }

    /// Get success value or nil
    var successValue: Success? {
        switch self {
        case .success(let value): return value
        case .failure: return nil
        }
    }

    /// Get failure error or nil
    var failureError: Failure? {
        switch self {
        case .success: return nil
        case .failure(let error): return error
        }
    }
}
