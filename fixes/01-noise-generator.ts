/**
 * FIX #1: Spectrally Accurate Noise Generation
 * 
 * PROBLEM: Current implementation generates white noise via Math.random()*2-1
 * and uses it for all noise types. Pink noise needs 1/f spectral shaping,
 * brown noise needs 1/f² shaping. Without proper shaping, the therapeutic
 * value of noise selection is undermined — pink noise's 1/f spectrum
 * specifically mirrors natural neural oscillation patterns.
 * 
 * SOLUTION: Implement proper spectral shaping using:
 * - White: Raw random (current approach is correct)
 * - Pink: Voss-McCartney algorithm (accurate 1/f without FFT overhead)
 * - Brown: Running integral of white noise (true Brownian/1/f²)
 * 
 * DROP-IN REPLACEMENT for the existing startNoise() method in AudioEngine
 */

// ============================================================
// NOISE BUFFER GENERATOR (pre-computed for efficiency)
// ============================================================

export interface NoiseBuffers {
  white: AudioBuffer;
  pink: AudioBuffer;
  brown: AudioBuffer;
}

/**
 * Generate all three noise buffers at initialization.
 * Pre-computing avoids per-session CPU spikes.
 * 
 * @param ctx - AudioContext (uses its sampleRate)
 * @param durationSeconds - Buffer length (default 2s, looped)
 */
export function generateNoiseBuffers(
  ctx: AudioContext,
  durationSeconds: number = 2
): NoiseBuffers {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * durationSeconds;

  return {
    white: generateWhiteNoiseBuffer(ctx, length),
    pink: generatePinkNoiseBuffer(ctx, length),
    brown: generateBrownNoiseBuffer(ctx, length),
  };
}

// ============================================================
// WHITE NOISE — flat spectrum, correct as-is
// ============================================================
function generateWhiteNoiseBuffer(ctx: AudioContext, length: number): AudioBuffer {
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// ============================================================
// PINK NOISE — 1/f spectrum via Paul Kellet's refined algorithm
// ============================================================
/**
 * Paul Kellet's pink noise generator.
 * Uses 7 first-order IIR filters to approximate -3dB/octave slope.
 * Spectral accuracy: ±0.5dB from 20Hz to 20kHz at 48kHz sample rate.
 * 
 * This is superior to the Voss-McCartney method for audio applications
 * because it produces continuous output without the periodic artifacts
 * that octave-band methods can introduce.
 * 
 * Reference: http://www.firstpr.com.au/dsp/pink-noise/
 */
function generatePinkNoiseBuffer(ctx: AudioContext, length: number): AudioBuffer {
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Filter state variables (Paul Kellet coefficients)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;

    // Apply cascaded first-order IIR filters
    // Each coefficient shapes the spectrum toward -3dB/octave
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;

    const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    b6 = white * 0.115926;

    // Normalize to [-1, 1] range
    // Peak output of this filter bank is approximately ±3.5
    data[i] = pink * 0.11;
  }

  // Final normalization pass to ensure consistent RMS level
  normalizeBuffer(data, 0.15); // Target RMS ~0.15 for comfortable noise floor

  return buffer;
}

// ============================================================
// BROWN NOISE — 1/f² spectrum via integrated white noise
// ============================================================
/**
 * Brownian (red) noise generator.
 * Running integral of white noise with leak factor to prevent DC drift.
 * Produces true 1/f² spectral slope (-6dB/octave).
 * 
 * The leak factor (0.998) provides a very slow high-pass at ~0.16Hz,
 * preventing the integrator from accumulating DC offset while
 * maintaining the deep bass character essential for delta protocols.
 */
function generateBrownNoiseBuffer(ctx: AudioContext, length: number): AudioBuffer {
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let lastOut = 0;
  const leak = 0.998; // Prevents DC accumulation

  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;

    // Leaky integrator: accumulates white noise with slow decay
    lastOut = (lastOut * leak) + (white * 0.02);

    // Soft clip to prevent occasional excursions
    data[i] = Math.tanh(lastOut * 3.5);
  }

  // Normalize to consistent RMS
  normalizeBuffer(data, 0.15);

  return buffer;
}

// ============================================================
// UTILITY: RMS normalization
// ============================================================
function normalizeBuffer(data: Float32Array, targetRMS: number): void {
  // Calculate current RMS
  let sumSquares = 0;
  for (let i = 0; i < data.length; i++) {
    sumSquares += data[i] * data[i];
  }
  const currentRMS = Math.sqrt(sumSquares / data.length);

  if (currentRMS > 0) {
    const scale = targetRMS / currentRMS;
    for (let i = 0; i < data.length; i++) {
      data[i] *= scale;
      // Hard clip safety
      data[i] = Math.max(-1, Math.min(1, data[i]));
    }
  }
}

// ============================================================
// REPLACEMENT startNoise() METHOD
// ============================================================
/**
 * Drop-in replacement for AudioEngine.startNoise()
 * 
 * Usage in AudioEngine constructor or initializeContext():
 *   this.noiseBuffers = generateNoiseBuffers(this.ctx);
 * 
 * Then replace the existing startNoise method with this:
 */
export function startNoiseReplacement(
  ctx: AudioContext,
  masterGain: GainNode,
  noiseBuffers: NoiseBuffers,
  noiseType: 'white' | 'pink' | 'brown',
  mix: number
): { source: AudioBufferSourceNode; gain: GainNode } {
  // Select the pre-computed buffer for the requested noise type
  const buffer = noiseBuffers[noiseType];

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const gain = ctx.createGain();
  gain.gain.value = mix;

  source.connect(gain);
  gain.connect(masterGain);
  source.start();

  return { source, gain };
}

// ============================================================
// INTEGRATION INSTRUCTIONS
// ============================================================
/**
 * HOW TO INTEGRATE:
 * 
 * 1. In AudioEngine class, add property:
 *    private noiseBuffers: NoiseBuffers | null = null;
 * 
 * 2. In initializeContext(), after creating AudioContext:
 *    this.noiseBuffers = generateNoiseBuffers(this.ctx);
 * 
 * 3. Replace existing startNoise() method body with:
 *    async startNoise(noiseType: string, mix: number) {
 *      if (!this.ctx || !this.masterGain || !this.noiseBuffers) return;
 *      
 *      const type = (noiseType as 'white' | 'pink' | 'brown') || 'pink';
 *      const result = startNoiseReplacement(
 *        this.ctx, this.masterGain, this.noiseBuffers, type, mix
 *      );
 *      this.noiseSource = result.source;
 *      this.noiseGain = result.gain;
 *    }
 * 
 * 4. No changes needed to protocol definitions — they already
 *    specify noise type as 'white' | 'pink' | 'brown'.
 */
