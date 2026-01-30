// swift-tools-version: 5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "pmkit-macos",
    platforms: [
        .macOS(.v14)  // macOS 14+ required for MarkdownUI and SwiftData
    ],
    products: [
        .executable(name: "pmkit", targets: ["pmkit"]),
        .executable(name: "pmkit-agent", targets: ["pmkit-agent"])
    ],
    dependencies: [
        // Markdown rendering
        .package(url: "https://github.com/gonzalezreal/swift-markdown-ui", from: "2.0.0"),
        // Keychain access
        .package(url: "https://github.com/kishikawakatsumi/KeychainAccess", from: "4.2.0"),
        // Sparkle for auto-updates
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.0.0")
    ],
    targets: [
        .executableTarget(
            name: "pmkit",
            dependencies: [
                .product(name: "MarkdownUI", package: "swift-markdown-ui"),
                .product(name: "KeychainAccess", package: "KeychainAccess"),
                .product(name: "Sparkle", package: "Sparkle")
            ],
            path: "pmkit/Sources"
        ),
        .executableTarget(
            name: "pmkit-agent",
            dependencies: [
                .product(name: "KeychainAccess", package: "KeychainAccess")
            ],
            path: "pmkit-agent/Sources"
        ),
        .testTarget(
            name: "pmkitTests",
            dependencies: ["pmkit"],
            path: "Tests"
        )
    ]
)
