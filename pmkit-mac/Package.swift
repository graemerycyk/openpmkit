// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "pmkit",
    platforms: [
        .macOS(.v13)
    ],
    products: [
        .executable(name: "pmkit", targets: ["pmkit"])
    ],
    dependencies: [
        // HTTP client
        .package(url: "https://github.com/Alamofire/Alamofire.git", from: "5.8.0"),
        // Keychain access
        .package(url: "https://github.com/kishikawakatsumi/KeychainAccess.git", from: "4.2.0"),
        // Global hotkeys
        .package(url: "https://github.com/soffes/HotKey.git", from: "0.2.0")
    ],
    targets: [
        .executableTarget(
            name: "pmkit",
            dependencies: [
                "Alamofire",
                "KeychainAccess",
                "HotKey"
            ],
            path: "pmkit"
        ),
        .testTarget(
            name: "pmkitTests",
            dependencies: ["pmkit"],
            path: "pmkitTests"
        )
    ]
)
