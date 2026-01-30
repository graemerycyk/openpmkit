import Foundation
import Carbon
import AppKit

/// Manages global hotkey registration
final class HotkeyManager {
    // MARK: - Singleton

    static let shared = HotkeyManager()

    // MARK: - State

    private var eventHandler: EventHandlerRef?
    private var hotkeyRef: EventHotKeyRef?
    private var recordingCallback: ((String) -> Void)?
    private var isRecording = false

    // MARK: - Configuration

    private let defaultKeyCode: UInt32 = 35  // P key
    private let defaultModifiers: UInt32 = UInt32(cmdKey | shiftKey)

    // MARK: - Initialization

    private init() {}

    // MARK: - Public Methods

    func registerHotkey() {
        unregisterHotkey()

        // Install event handler
        var eventType = EventTypeSpec(eventClass: OSType(kEventClassKeyboard), eventKind: UInt32(kEventHotKeyPressed))

        let handler: EventHandlerUPP = { _, event, _ -> OSStatus in
            HotkeyManager.shared.handleHotkey()
            return noErr
        }

        InstallEventHandler(
            GetApplicationEventTarget(),
            handler,
            1,
            &eventType,
            nil,
            &eventHandler
        )

        // Register hotkey
        let hotkeyID = EventHotKeyID(signature: OSType(0x504D4B54), id: 1)  // "PMKT"

        let keyCode = Preferences.shared.hotkeyKeyCode
        let modifiers = Preferences.shared.hotkeyModifiers

        let status = RegisterEventHotKey(
            keyCode,
            modifiers,
            hotkeyID,
            GetApplicationEventTarget(),
            0,
            &hotkeyRef
        )

        if status != noErr {
            print("Failed to register hotkey: \(status)")
        }
    }

    func unregisterHotkey() {
        if let hotkeyRef = hotkeyRef {
            UnregisterEventHotKey(hotkeyRef)
            self.hotkeyRef = nil
        }

        if let eventHandler = eventHandler {
            RemoveEventHandler(eventHandler)
            self.eventHandler = nil
        }
    }

    func startRecording(callback: @escaping (String) -> Void) {
        isRecording = true
        recordingCallback = callback

        // Monitor for key events
        NSEvent.addLocalMonitorForEvents(matching: .keyDown) { [weak self] event in
            guard let self = self, self.isRecording else { return event }

            let modifiers = event.modifierFlags
            let keyCode = event.keyCode

            // Build hotkey string
            var parts: [String] = []
            if modifiers.contains(.control) { parts.append("⌃") }
            if modifiers.contains(.option) { parts.append("⌥") }
            if modifiers.contains(.shift) { parts.append("⇧") }
            if modifiers.contains(.command) { parts.append("⌘") }

            if let keyName = self.keyCodeToString(keyCode) {
                parts.append(keyName)
            }

            let hotkeyString = parts.joined()

            // Save the new hotkey
            self.saveHotkey(keyCode: keyCode, modifiers: modifiers)

            // Call callback
            self.recordingCallback?(hotkeyString)
            self.isRecording = false
            self.recordingCallback = nil

            // Re-register with new hotkey
            self.registerHotkey()

            return nil  // Consume the event
        }
    }

    // MARK: - Private Methods

    private func handleHotkey() {
        Task { @MainActor in
            AppState.shared.toggleListening()
        }
    }

    private func saveHotkey(keyCode: UInt16, modifiers: NSEvent.ModifierFlags) {
        Preferences.shared.hotkeyKeyCode = UInt32(keyCode)
        Preferences.shared.hotkeyModifiers = carbonModifiers(from: modifiers)
    }

    private func carbonModifiers(from flags: NSEvent.ModifierFlags) -> UInt32 {
        var carbon: UInt32 = 0
        if flags.contains(.command) { carbon |= UInt32(cmdKey) }
        if flags.contains(.option) { carbon |= UInt32(optionKey) }
        if flags.contains(.control) { carbon |= UInt32(controlKey) }
        if flags.contains(.shift) { carbon |= UInt32(shiftKey) }
        return carbon
    }

    private func keyCodeToString(_ keyCode: UInt16) -> String? {
        let keyMapping: [UInt16: String] = [
            0: "A", 1: "S", 2: "D", 3: "F", 4: "H", 5: "G", 6: "Z", 7: "X",
            8: "C", 9: "V", 11: "B", 12: "Q", 13: "W", 14: "E", 15: "R",
            16: "Y", 17: "T", 18: "1", 19: "2", 20: "3", 21: "4", 22: "6",
            23: "5", 24: "=", 25: "9", 26: "7", 27: "-", 28: "8", 29: "0",
            30: "]", 31: "O", 32: "U", 33: "[", 34: "I", 35: "P", 36: "Return",
            37: "L", 38: "J", 39: "'", 40: "K", 41: ";", 42: "\\", 43: ",",
            44: "/", 45: "N", 46: "M", 47: ".", 48: "Tab", 49: "Space",
            50: "`", 51: "Delete", 53: "Escape",
            96: "F5", 97: "F6", 98: "F7", 99: "F3", 100: "F8",
            101: "F9", 103: "F11", 105: "F13", 107: "F14",
            109: "F10", 111: "F12", 113: "F15", 118: "F4",
            119: "F2", 120: "F1", 122: "F1", 123: "Left", 124: "Right",
            125: "Down", 126: "Up"
        ]

        return keyMapping[keyCode]
    }
}
