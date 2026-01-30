import Foundation

/// Tool/function definitions for Claude (OSS local mode)
enum FunctionDefinitions {
    static let allTools: [[String: Any]] = [
        draftPRD,
        openHistory,
        openSettings
    ]

    // MARK: - Document Functions

    static let draftPRD: [String: Any] = [
        "name": "draft_prd",
        "description": "Draft a product requirements document for a feature. Saves output to ~/pmkit/.",
        "input_schema": [
            "type": "object",
            "properties": [
                "feature_name": [
                    "type": "string",
                    "description": "Name of the feature"
                ],
                "description": [
                    "type": "string",
                    "description": "User's description of what the feature should do"
                ]
            ],
            "required": ["feature_name", "description"]
        ]
    ]

    // MARK: - Utility Functions

    static let openHistory: [String: Any] = [
        "name": "open_history",
        "description": "Open the pmkit folder containing saved documents",
        "input_schema": [
            "type": "object",
            "properties": [
                "folder": [
                    "type": "string",
                    "enum": ["all", "prds"],
                    "description": "Which folder to open. 'all' opens ~/pmkit/"
                ]
            ],
            "required": [] as [String]
        ]
    ]

    static let openSettings: [String: Any] = [
        "name": "open_settings",
        "description": "Open the pmkit settings window",
        "input_schema": [
            "type": "object",
            "properties": [
                "section": [
                    "type": "string",
                    "enum": ["api-keys", "voice", "hotkey", "storage", "about"],
                    "description": "Optional: which settings section to open"
                ]
            ],
            "required": [] as [String]
        ]
    ]
}

// MARK: - Voice Trigger Patterns

extension FunctionDefinitions {
    /// Patterns that map to each function
    static let voiceTriggers: [String: [String]] = [
        "draft_prd": [
            "draft a prd",
            "write a prd",
            "start a prd",
            "create a prd",
            "write up requirements",
            "help me draft",
            "write a spec"
        ],

        "open_history": [
            "show history",
            "open history",
            "show my prds",
            "open my documents"
        ],

        "open_settings": [
            "open settings",
            "show settings",
            "settings"
        ]
    ]
}
