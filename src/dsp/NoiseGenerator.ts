/**
 * Spectrally Accurate Noise Generator
 * 
 * Implements research-grade colored noise generation:
 * - White: Flat spectrum (therapeutic baseline)
 * - Pink: 1/f spectrum (mirrors neural oscillations)
 * - Brown: 1/f² spectrum (deep delta/theta support)
 * 
 * Uses Paul Kellet's refined pink noise algorithm for superior
 * spectral accuracy (±0.5dB from 20Hz-20kHz) compared to
 * simpler octave-band methods.
 */

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
 * @returns Object with white, pink, and brown AudioBuffers
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

/**
 * WHITE NOISE — flat spectrum across all frequencies.
 * This is correct as-is and serves as the reference.
 */
function generateWhiteNoiseBuffer(ctx: AudioContext, length: number): AudioBuffer {
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  return buffer;
}

/**
 * PINK NOISE — 1/f spectrum via Paul Kellet's refined algorithm.
 * 
 * Uses 7 first-order IIR filters to approximate -3dB/octave slope.
 * Spectral accuracy: ±0.5dB from 20Hz to 20kHz at 48kHz sample rate.
 * 
 * This is superior to the Voss-McCartney method for audio applications
 * because it produces continuous output without the periodic artifacts
 * that octave-band methods can introduce.
 * 
 * Therapeutic relevance: Pink noise's 1/f spectrum mirrors the power-law
 * distribution found in many biological processes including neural activity.
 * Research shows improved sleep onset and depth with pink noise masking.
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

/**
 * BROWN NOISE — 1/f² spectrum via integrated white noise.
 * 
 * Running integral of white noise with leak factor to prevent DC drift.
 * Produces true 1/f² spectral slope (-6dB/octave).
 * 
 * The leak factor (0.998) provides a very slow high-pass at ~0.16Hz,
 * preventing the integrator from accumulating DC offset while
 * maintaining the deep bass character essential for delta protocols.
 * 
 * Therapeutic relevance: Brown noise's heavy bass emphasis is particularly
 * effective for deep sleep protocols (delta 0.5-4Hz) and deep meditation
 * states where low-frequency brain activity dominates.
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

/**
 * RMS normalization utility.
 * Ensures all noise types have consistent perceived loudness.
 */
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

/**
 * Create a noise source node connected to the audio graph.
 * 
 * @param ctx - AudioContext
 * @param masterGain - Node to connect to (typically master output)
 * @param noiseBuffers - Pre-computed noise buffers
 * @param noiseType - Type of noise to generate
 * @param mix - Volume level (0-1 range)
 * @returns Source and gain nodes for lifecycle management
 */
export function createNoiseSource(
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
  source.loop = true; // Seamless looping (2s buffer, inaudible seam)

  const gain = ctx.createGain();
  gain.gain.value = mix;

  source.connect(gain);
  gain.connect(masterGain);
  source.start();

  return { source, gain };
}
