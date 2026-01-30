import SwiftUI
import Combine

struct WaveformView: View {
    @State private var amplitudes: [CGFloat] = Array(repeating: 0.1, count: 20)
    @State private var timer: AnyCancellable?

    var barCount: Int = 20
    var minAmplitude: CGFloat = 0.1
    var maxAmplitude: CGFloat = 1.0
    var animationSpeed: Double = 0.1
    var barColor: Color = .white
    var barSpacing: CGFloat = 2

    var body: some View {
        GeometryReader { geometry in
            HStack(spacing: barSpacing) {
                ForEach(0..<barCount, id: \.self) { index in
                    RoundedRectangle(cornerRadius: 2)
                        .fill(barColor)
                        .frame(
                            width: max(2, (geometry.size.width - barSpacing * CGFloat(barCount - 1)) / CGFloat(barCount)),
                            height: geometry.size.height * amplitudes[index]
                        )
                }
            }
            .frame(maxHeight: .infinity, alignment: .center)
        }
        .onAppear {
            startAnimation()
        }
        .onDisappear {
            stopAnimation()
        }
    }

    private func startAnimation() {
        timer = Timer.publish(every: animationSpeed, on: .main, in: .common)
            .autoconnect()
            .sink { _ in
                withAnimation(.easeInOut(duration: animationSpeed)) {
                    for index in 0..<barCount {
                        amplitudes[index] = CGFloat.random(in: minAmplitude...maxAmplitude)
                    }
                }
            }
    }

    private func stopAnimation() {
        timer?.cancel()
        timer = nil
    }
}

// MARK: - Live Audio Waveform

struct LiveAudioWaveformView: View {
    @Binding var audioLevel: Float
    @State private var levels: [CGFloat] = Array(repeating: 0.1, count: 30)

    var barCount: Int = 30
    var barColor: Color = .accentColor

    var body: some View {
        GeometryReader { geometry in
            HStack(spacing: 2) {
                ForEach(0..<barCount, id: \.self) { index in
                    RoundedRectangle(cornerRadius: 1)
                        .fill(barColor.opacity(0.8))
                        .frame(
                            width: max(2, (geometry.size.width - 2 * CGFloat(barCount - 1)) / CGFloat(barCount)),
                            height: geometry.size.height * levels[index]
                        )
                }
            }
            .frame(maxHeight: .infinity, alignment: .center)
        }
        .onChange(of: audioLevel) { newLevel in
            updateLevels(with: CGFloat(newLevel))
        }
    }

    private func updateLevels(with newLevel: CGFloat) {
        withAnimation(.linear(duration: 0.05)) {
            // Shift existing levels to the left
            for i in 0..<(barCount - 1) {
                levels[i] = levels[i + 1]
            }
            // Add new level at the end
            levels[barCount - 1] = max(0.1, min(1.0, newLevel))
        }
    }
}

// MARK: - Static Waveform Display

struct StaticWaveformView: View {
    let amplitudes: [CGFloat]
    var barColor: Color = .accentColor

    var body: some View {
        GeometryReader { geometry in
            HStack(spacing: 2) {
                ForEach(0..<amplitudes.count, id: \.self) { index in
                    RoundedRectangle(cornerRadius: 1)
                        .fill(barColor)
                        .frame(
                            width: max(2, (geometry.size.width - 2 * CGFloat(amplitudes.count - 1)) / CGFloat(amplitudes.count)),
                            height: geometry.size.height * amplitudes[index]
                        )
                }
            }
            .frame(maxHeight: .infinity, alignment: .center)
        }
    }
}

#Preview {
    VStack(spacing: 32) {
        VStack {
            Text("Animated Waveform")
                .font(.caption)
            WaveformView()
                .frame(width: 200, height: 40)
        }

        VStack {
            Text("Static Waveform")
                .font(.caption)
            StaticWaveformView(amplitudes: [0.3, 0.5, 0.7, 0.9, 0.6, 0.4, 0.8, 0.5, 0.3, 0.6])
                .frame(width: 200, height: 40)
        }
    }
    .padding()
}
