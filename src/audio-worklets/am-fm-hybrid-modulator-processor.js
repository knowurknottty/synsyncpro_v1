/**
 * Module 10: AM/FM Hybrid Modulator for ASSR (AudioWorklet)
 * 🔬 Experimental - Novel adaptation prevention approach
 *
 * Combines amplitude modulation (40 Hz) with slow frequency modulation (0.1 Hz) to create
 * 'breathing' gamma stimulation. Reduces neural adaptation while maintaining ASSR response
 * strength. Dual-oscillator implementation for stable 40 Hz gamma entrainment.
 *
 * Technical Specifications:
 * - AM Frequency: 40 Hz (gamma ASSR target)
 * - AM Depth: 80-100% (strong ASSR drive)
 * - FM Breathing Rate: 0.1 Hz (6 cycles/min, respiratory-like)
 * - FM Deviation: ±2 Hz (38-42 Hz range, stays in gamma)
 * - Carrier: 200-800 Hz (adjustable)
 * - CPU Usage: <5% (mobile)
 *
 * Safety Warnings:
 * ⚠️ 40 Hz gamma exposure limited to <60 minutes continuous
 * ⚠️ AM peaks must be <85dB SPL (measure RMS and peak separately)
 * ⚠️ Breathing rate <0.05 Hz can be disorienting (avoid)
 *
 * Evidence Base:
 * - [✅Established] 40 Hz ASSR response well-documented (Picton et al., 2003)
 * - [🔬 Experimental] FM breathing effect for adaptation prevention is novel hypothesis
 * - [🔬 Experimental] Respiratory-rate synchrony potential untested
 *
 * Clinical Applications:
 * - Gamma Spindle Enhanced: 40 Hz ASSR + breathing for extended memory protocols
 * - Dopamine Protocol: 40 Hz gamma with reduced adaptation in NAcc protocols
 * - Meditation Gamma: 40 Hz ASSR + 0.1 Hz breathing sync for contemplative states
 *
 * @author SynSync Pro Development Team
 * @version 1.0.0
 * @clinical_grade Experimental
 */

class AMFMHybridModulatorProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    // Carrier oscillator
    this.carrierFreq = 400; // Hz (200-800 range)
    this.carrierPhase = 0;

    // AM (Amplitude Modulation) - 40 Hz gamma
    this.gammaFreq = 40; // Hz (30-50 range)
    this.gammaPhase = 0;
    this.amDepth = 0.9; // 90% modulation (0.8-1.0 range)

    // FM (Frequency Modulation) - 0.1 Hz breathing
    this.breathingRate = 0.1; // Hz (0.05-0.5 range)
    this.breathingPhase = 0;
    this.fmDeviation = 2; // Hz (±2 Hz around 40 Hz center)

    // Sample rate
    this.sampleRate = 48000;

    // Safety limits
    this.maxOutput = 0.85; // Prevent clipping
    this.minBreathingRate = 0.05; // Hz (avoid disorientation)
    this.maxGammaFreq = 50; // Hz
    this.minGammaFreq = 30; // Hz

    this.port.onmessage = (event) => {
      const { type, value } = event.data;

      switch(type) {
        case 'setCarrierFreq':
          this.carrierFreq = Math.max(200, Math.min(800, value));
          break;
        case 'setGammaFreq':
          this.gammaFreq = Math.max(this.minGammaFreq,
                                    Math.min(this.maxGammaFreq, value));
          break;
        case 'setBreathingRate':
          this.breathingRate = Math.max(this.minBreathingRate,
                                        Math.min(0.5, value));
          break;
        case 'setFMDeviation':
          this.fmDeviation = Math.max(0, Math.min(5, value));
          break;
        case 'setAMDepth':
          this.amDepth = Math.max(0, Math.min(1.0, value));
          break;
        case 'setSampleRate':
          this.sampleRate = value;
          break;
      }
    };
  }

  /**
   * Process audio - generate AM/FM hybrid modulated carrier
   */
  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const channel = output[0];

    if (!channel) return true;

    for (let i = 0; i < channel.length; i++) {
      // 1. Breathing oscillator (FM on gamma frequency)
      // Slowly varies gamma frequency between 38-42 Hz
      const breathingOscillator = Math.sin(this.breathingPhase);
      const instantaneousGammaFreq = this.gammaFreq +
        (this.fmDeviation * breathingOscillator);

      // 2. Carrier oscillator (200-800 Hz tone)
      const carrierSample = Math.sin(this.carrierPhase);

      // 3. Gamma envelope (AM at ~40 Hz)
      // Creates the auditory steady-state response
      const gammaEnvelope = 1.0 + (this.amDepth * Math.sin(this.gammaPhase));

      // 4. Combine: carrier * gamma envelope
      // Result: carrier tone modulated by breathing gamma
      let outputSample = carrierSample * gammaEnvelope;

      // 5. Scale and limit output
      outputSample *= 0.5; // Base scaling
      outputSample = Math.max(-this.maxOutput,
                             Math.min(this.maxOutput, outputSample));

      channel[i] = outputSample;

      // Update phase accumulators
      this.carrierPhase += (2 * Math.PI * this.carrierFreq) / this.sampleRate;
      this.carrierPhase %= (2 * Math.PI);

      this.gammaPhase += (2 * Math.PI * instantaneousGammaFreq) / this.sampleRate;
      this.gammaPhase %= (2 * Math.PI);

      this.breathingPhase += (2 * Math.PI * this.breathingRate) / this.sampleRate;
      this.breathingPhase %= (2 * Math.PI);
    }

    // Copy to all output channels (mono -> stereo/multi)
    for (let ch = 1; ch < output.length; ch++) {
      output[ch].set(channel);
    }

    return true;
  }

  static get parameterDescriptors() {
    return [
      {
        name: 'carrierFreq',
        defaultValue: 400,
        minValue: 200,
        maxValue: 800,
        automationRate: 'k-rate'
      },
      {
        name: 'gammaFreq',
        defaultValue: 40,
        minValue: 30,
        maxValue: 50,
        automationRate: 'k-rate'
      },
      {
        name: 'breathingRate',
        defaultValue: 0.1,
        minValue: 0.05,
        maxValue: 0.5,
        automationRate: 'k-rate'
      },
      {
        name: 'fmDeviation',
        defaultValue: 2,
        minValue: 0,
        maxValue: 5,
        automationRate: 'k-rate'
      },
      {
        name: 'amDepth',
        defaultValue: 0.9,
        minValue: 0,
        maxValue: 1.0,
        automationRate: 'k-rate'
      }
    ];
  }
}

registerProcessor('am-fm-hybrid-modulator-processor', AMFMHybridModulatorProcessor);

/**
 * USAGE EXAMPLE:
 *
 * // Register processor
 * await audioContext.audioWorklet.addModule('am-fm-hybrid-modulator-processor.js');
 *
 * // Create node
 * const modulator = new AudioWorkletNode(audioContext, 'am-fm-hybrid-modulator-processor');
 *
 * // Configure for breathing gamma ASSR
 * modulator.port.postMessage({
 *   type: 'setGammaFreq',
 *   value: 40 // 40 Hz gamma
 * });
 *
 * modulator.port.postMessage({
 *   type: 'setBreathingRate',
 *   value: 0.1 // 6 cycles per minute
 * });
 *
 * modulator.port.postMessage({
 *   type: 'setFMDeviation',
 *   value: 2 // ±2 Hz (38-42 Hz range)
 * });
 *
 * // Connect to audio graph
 * modulator.connect(audioContext.destination);
 *
 * TESTING CRITERIA:
 * - AM accuracy: 40 Hz modulation frequency ±0.1 Hz (FFT verified)
 * - FM accuracy: 0.1 Hz breathing rate ±0.01 Hz (long-window FFT)
 * - Frequency deviation: Instantaneous gamma stays 38-42 Hz (time-domain check)
 * - ASSR strength: Mean frequency = 40 Hz over breathing cycle
 * - CPU efficiency: <5% on iPhone 12 / Pixel 6
 * - Adaptation test: User engagement sustained >20 min vs constant 40 Hz
 *
 * MATHEMATICAL MODEL:
 * carrier(t) = A * sin(2π * fc * t)
 * gamma_envelope(t) = 1 + d * sin(2π * (fg + Δf * sin(2π * fb * t)) * t)
 * output(t) = carrier(t) * gamma_envelope(t)
 *
 * Where:
 * fc = carrier frequency (400 Hz)
 * fg = gamma frequency (40 Hz)
 * fb = breathing rate (0.1 Hz)
 * Δf = FM deviation (2 Hz)
 * d = AM depth (0.9)
 */
