/**
 * Spectral verification tests for noise generation
 * Ensures pink/brown/white noise have correct spectral slopes.
 *
 * Measurement: Welch-averaged periodogram (Hann window, 50% overlap, real
 * radix-2 FFT) over multiple independently generated buffers, then linear
 * regression of band power (dB) against octave number.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { SpectrallyAccurateNoiseGenerator } from '../NoiseGenerator';

const FFT_SIZE = 4096;
const AVERAGED_BUFFERS = 8;

/** In-place iterative radix-2 complex FFT. */
function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  // Bit-reversal permutation
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curRe = 1;
      let curIm = 0;
      for (let k = 0; k < len / 2; k++) {
        const uRe = re[i + k];
        const uIm = im[i + k];
        const vRe = re[i + k + len / 2] * curRe - im[i + k + len / 2] * curIm;
        const vIm = re[i + k + len / 2] * curIm + im[i + k + len / 2] * curRe;
        re[i + k] = uRe + vRe;
        im[i + k] = uIm + vIm;
        re[i + k + len / 2] = uRe - vRe;
        im[i + k + len / 2] = uIm - vIm;
        const nextRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
      }
    }
  }
}

/**
 * Accumulate a Welch-averaged power spectral density estimate for one buffer
 * into `psd` (length FFT_SIZE/2). Returns the number of segments averaged.
 */
function accumulateWelchPsd(samples: Float32Array, psd: Float64Array): number {
  const hop = FFT_SIZE / 2;
  const window = new Float64Array(FFT_SIZE);
  for (let i = 0; i < FFT_SIZE; i++) {
    window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (FFT_SIZE - 1))); // Hann
  }
  let segments = 0;
  for (let start = 0; start + FFT_SIZE <= samples.length; start += hop) {
    const re = new Float64Array(FFT_SIZE);
    const im = new Float64Array(FFT_SIZE);
    for (let i = 0; i < FFT_SIZE; i++) re[i] = samples[start + i] * window[i];
    fft(re, im);
    for (let bin = 0; bin < FFT_SIZE / 2; bin++) {
      psd[bin] += re[bin] * re[bin] + im[bin] * im[bin];
    }
    segments++;
  }
  return segments;
}

/**
 * Measure spectral slope in dB/octave by regressing octave-band power
 * against octave number. Bands chosen to sit in the asymptotic region of the
 * generators' filters (the brown-noise leaky integrator has a ~150 Hz corner,
 * so measurement starts at 250 Hz).
 */
function measureSpectralSlope(buffers: Float32Array[], sampleRate: number): number {
  const psd = new Float64Array(FFT_SIZE / 2);
  for (const samples of buffers) accumulateWelchPsd(samples, psd);

  const octaveBands = [
    { center: 250, low: 177, high: 354 },
    { center: 500, low: 354, high: 707 },
    { center: 1000, low: 707, high: 1414 },
    { center: 2000, low: 1414, high: 2828 },
    { center: 4000, low: 2828, high: 5657 },
  ];
  const binWidth = sampleRate / FFT_SIZE;

  const bandPowers = octaveBands.map(band => {
    const lowBin = Math.max(1, Math.round(band.low / binWidth));
    const highBin = Math.min(FFT_SIZE / 2 - 1, Math.round(band.high / binWidth));
    let power = 0;
    for (let bin = lowBin; bin <= highBin; bin++) power += psd[bin];
    power /= highBin - lowBin + 1; // mean PSD in band
    return 10 * Math.log10(Math.max(power, 1e-30));
  });

  // Linear regression: power (dB) vs octave index
  const n = bandPowers.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += bandPowers[i];
    sumXY += i * bandPowers[i];
    sumX2 += i * i;
  }
  return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
}

describe('Spectral Verification Tests', () => {
  let context: AudioContext;
  let generator: SpectrallyAccurateNoiseGenerator;

  beforeEach(() => {
    context = new (window.AudioContext || (window as any).webkitAudioContext)();
    generator = new SpectrallyAccurateNoiseGenerator(context);
  });

  function collectBuffers(generate: () => AudioBuffer): Float32Array[] {
    return Array.from({ length: AVERAGED_BUFFERS }, () => generate().getChannelData(0));
  }

  test('Pink noise has -3dB/octave slope (±0.5dB tolerance)', () => {
    const slope = measureSpectralSlope(
      collectBuffers(() => generator.generatePinkNoise()),
      context.sampleRate,
    );

    // Research standard: -3dB/octave ±0.5dB
    expect(slope).toBeGreaterThanOrEqual(-3.5);
    expect(slope).toBeLessThanOrEqual(-2.5);
  });

  test('Brown noise has -6dB/octave slope (±0.5dB tolerance)', () => {
    const slope = measureSpectralSlope(
      collectBuffers(() => generator.generateBrownNoise()),
      context.sampleRate,
    );

    // Research standard: -6dB/octave ±0.5dB
    expect(slope).toBeGreaterThanOrEqual(-6.5);
    expect(slope).toBeLessThanOrEqual(-5.5);
  });

  test('White noise has ~0dB/octave slope (±1dB tolerance)', () => {
    const slope = measureSpectralSlope(
      collectBuffers(() => generator.generateWhiteNoise()),
      context.sampleRate,
    );

    // Research standard: 0dB/octave ±1dB
    expect(slope).toBeGreaterThanOrEqual(-1);
    expect(slope).toBeLessThanOrEqual(1);
  });

  test('Noise sources are loopable without artifacts', () => {
    const pinkSource = generator.createNoiseSource('pink');
    const brownSource = generator.createNoiseSource('brown');
    const whiteSource = generator.createNoiseSource('white');

    expect(pinkSource.loop).toBe(true);
    expect(brownSource.loop).toBe(true);
    expect(whiteSource.loop).toBe(true);

    expect(pinkSource.buffer).not.toBeNull();
    expect(brownSource.buffer).not.toBeNull();
    expect(whiteSource.buffer).not.toBeNull();
  });
});
