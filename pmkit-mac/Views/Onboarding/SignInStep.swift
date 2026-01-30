import SwiftUI

struct SignInStep: View {
    @EnvironmentObject var appState: AppState
    let onContinue: () -> Void
    let onBack: () -> Void

    @State private var isSigningIn = false
    @State private var signInError: String?

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            // Icon
            Image(systemName: "person.circle")
                .font(.system(size: 64))
                .foregroundColor(.accentColor)

            // Title
            VStack(spacing: 8) {
                Text("Sign in to pmkit")
                    .font(.title)
                    .fontWeight(.bold)

                Text("Use your existing pmkit account or create one")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            // Already signed in
            if appState.isAuthenticated, let user = appState.currentUser {
                VStack(spacing: 16) {
                    HStack(spacing: 12) {
                        if let imageUrl = user.image, let url = URL(string: imageUrl) {
                            AsyncImage(url: url) { image in
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                            } placeholder: {
                                Circle()
                                    .fill(Color.secondary.opacity(0.2))
                            }
                            .frame(width: 48, height: 48)
                            .clipShape(Circle())
                        } else {
                            Image(systemName: "person.circle.fill")
                                .font(.system(size: 48))
                                .foregroundColor(.secondary)
                        }

                        VStack(alignment: .leading, spacing: 4) {
                            Text(user.name ?? user.email)
                                .font(.headline)

                            Text(user.email)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }

                        Spacer()

                        Image(systemName: "checkmark.circle.fill")
                            .font(.title2)
                            .foregroundColor(.green)
                    }
                    .padding()
                    .background(Color.green.opacity(0.1))
                    .cornerRadius(12)
                    .padding(.horizontal, 80)

                    Button {
                        Task {
                            await appState.signOut()
                        }
                    } label: {
                        Text("Sign in with a different account")
                            .font(.caption)
                    }
                    .buttonStyle(.plain)
                    .foregroundColor(.accentColor)
                }
            } else {
                // Sign in options
                VStack(spacing: 16) {
                    // Google sign in
                    Button {
                        signIn()
                    } label: {
                        HStack {
                            Image(systemName: "globe")
                            Text("Continue with Google")
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.large)
                    .disabled(isSigningIn)

                    // Microsoft sign in
                    Button {
                        signIn()
                    } label: {
                        HStack {
                            Image(systemName: "building.2")
                            Text("Continue with Microsoft")
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.large)
                    .disabled(isSigningIn)

                    if isSigningIn {
                        ProgressView()
                            .scaleEffect(0.8)
                    }

                    if let error = signInError {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.red)
                    }
                }
                .padding(.horizontal, 80)
            }

            Spacer()

            // Navigation buttons
            HStack {
                Button("Back") {
                    onBack()
                }
                .buttonStyle(.bordered)

                Spacer()

                Button("Continue") {
                    onContinue()
                }
                .buttonStyle(.borderedProminent)
                .disabled(!appState.isAuthenticated)
            }
            .padding(.horizontal, 80)
            .padding(.bottom, 40)
        }
    }

    private func signIn() {
        isSigningIn = true
        signInError = nil

        Task {
            await appState.signIn()
            await MainActor.run {
                isSigningIn = false
                if !appState.isAuthenticated {
                    signInError = "Sign in failed. Please try again."
                }
            }
        }
    }
}

#Preview {
    SignInStep(onContinue: {}, onBack: {})
        .environmentObject(AppState.shared)
}
