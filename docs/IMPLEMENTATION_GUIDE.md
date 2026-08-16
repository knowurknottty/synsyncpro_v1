# SynSyncPro Implementation & Evidence Guide

## 🔬 Evidence-Based Entrainment Protocols

### 1. Binaural Beats (Differential Phase-Locking)
*   **Carrier**: Optimal < 1000Hz.
*   **Mechanism**: Subcortical phase-locking in the Superior Olivary Complex.
*   **Evidence**: Systematic review suggests effectiveness for anxiety reduction (2023) [web:6][web:10].
*   **Target**: Best for relaxation (Theta/Alpha) with headphones.

### 2. Isochronic Tones (Photic-Equivalent Auditory Stimulus)
*   **Mechanism**: Sharp amplitude modulation producing strong Cortical Evoked Responses.
*   **Evidence**: Research suggests isochronic tones provide stronger brainwave entrainment than binaural beats (2025) [web:11][web:14].
*   **Target**: Superior for focus and arousal (Beta/Gamma).

### 3. DBSS (Dynamic Binaural Spectrum Stimulation)
*   **Mechanism**: Monaural beats created by physical interference of two frequencies in a single channel.
*   **Evidence**: Reduces user fatigue compared to binaural beats [cite:Jirakittayakorn2017].
*   **Target**: Optimal for long research sessions and speaker-based entrainment.

## 🎛️ Audio Engine Enhancements

### DBSS Voice Implementation
Uses physical summing of `f1` and `f2` to create a perceptible beat without headphone requirement.
```typescript
class MonauralVoice extends BaseVoice {
  constructor(ctx, carrier, beat) {
    this.osc1.frequency.value = carrier;
    this.osc2.frequency.value = carrier + beat;
  }
}
```

### Cymatics Real-Time Sync
Synchronizes visual Chladni patterns to AudioEngine FFT data.
*   **FFT Size**: 2048 for high-resolution frequency detection.
*   **Safety**: Hard ceiling at 25Hz flicker to prevent photosensitive seizures.

## 🧠 Muse EEG Biofeedback Loop (Beta)
Integration via Web Bluetooth (muse-js / web-muse).
*   **Protocol**: Adjust `beatCents` and `noiseMix` based on real-time Alpha/Theta ratios.
*   **Calibration**: Use `iapf_detection` to set personalized carrier resonance.
