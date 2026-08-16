/**
 * FIX #1: Spectrally Accurate Noise Generation
 * ==============================================
 * Replaces flat white noise for all types with proper spectral shaping:
 * - White: Flat spectrum (Math.random, correct as-is)
 * - Pink: 1/f via Paul Kellet's refined algorithm (±0.5dB from 20Hz-20kHz)
 * - Brown: 1/f² via leaky integrator of white noise
 *
 * Drop-in replacement for AudioEngine.startNoise()
 *
 * @version 2.0.0
 */

export interface NoiseBuffers {
  white: AudioBuffer;
  pink: AudioBuffer;
  brown: AudioBuffer;
}

/**
 * Pre-compute all three noise buffers at initialization.
 */
export function generateNoiseBuffers(
  ctx: AudioContext,
  durationSeconds: number = 2
): NoiseBuffers {
  const length = ctx.sampleRate * durationSeconds;
  return {
    white: generateWhiteNoiseBuffer(ctx, length),
    pink: generatePinkNoiseBuffer(ctx, length),
    brown: generateBrownNoiseBuffer(ctx, length),
  };
}

function generateWhiteNoiseBuffer(ctx: AudioContext, length: number): AudioBuffer {
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/**
 * Paul Kellet's pink noise generator.
 * 7 first-order IIR filters approximate -3dB/octave slope.
 * Reference: http://www.firstpr.com.au/dsp/pink-noise/
 */
function generatePinkNoiseBuffer(ctx: AudioContext, length: number): AudioBuffer {
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    b6 = white * 0.115926;
    data[i] = pink * 0.11;
  }

  normalizeBuffer(data, 0.15);
  return buffer;
}

/**
 * Brownian (red) noise: leaky integrator of white noise.
 * Produces true 1/f² spectral slope (-6dB/octave).
 */
function generateBrownNoiseBuffer(ctx: AudioContext, length: number): AudioBuffer {
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let lastOut = 0;
  const leak = 0.998;

  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut * leak) + (white * 0.02);
    data[i] = Math.tanh(lastOut * 3.5);
  }

  normalizeBuffer(data, 0.15);
  return buffer;
}

function normalizeBuffer(data: Float32Array, targetRMS: number): void {
  let sumSquares = 0;
  for (let i = 0; i < data.length; i++) {
    sumSquares += data[i] * data[i];
  }
  const currentRMS = Math.sqrt(sumSquares / data.length);
  if (currentRMS > 0) {
    const scale = targetRMS / currentRMS;
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.max(-1, Math.min(1, data[i] * scale));
    }
  }

  // Apply short crossfade at buffer boundaries to eliminate loop-point click.
  // When AudioBufferSourceNode.loop=true, the end wraps directly to the start.
  // Without this, any DC offset or amplitude mismatch produces an audible pop.
  const fadeLen = Math.min(256, data.length >> 2);
  for (let i = 0; i < fadeLen; i++) {
    const t = i / fadeLen; // 0→1
    // Fade-in at start
    data[i] *= t;
    // Fade-out at end
    data[data.length - 1 - i] *= t;
  }
}

/**
 * Drop-in replacement for AudioEngine.startNoise().
 */
export function startNoiseFromBuffers(
  ctx: AudioContext,
  masterGain: GainNode,
  noiseBuffers: NoiseBuffers,
  noiseType: 'white' | 'pink' | 'brown',
  mix: number
): { source: AudioBufferSourceNode; gain: GainNode } {
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
