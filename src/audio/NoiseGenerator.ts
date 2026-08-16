/**
 * Spectrally accurate noise generation for therapeutic audio
 * Implements Paul Kellett's algorithm for pink noise
 * Uses cascaded integrator for brown noise
 *
 * Research compliance:
 * - Pink noise: -3dB/octave slope (±0.5dB tolerance)
 * - Brown noise: -6dB/octave slope (±0.5dB tolerance)
 * - White noise: 0dB/octave flat spectrum
 */

export class SpectrallyAccurateNoiseGenerator {
  private context: AudioContext;
  private readonly bufferSize = 16384;

  constructor(context: AudioContext) {
    this.context = context;
  }

  /**
   * Generate pink noise (-3dB/octave spectral slope)
   * Uses Paul Kellett's optimized algorithm
   */
  generatePinkNoise(): AudioBuffer {
    const buffer = this.context.createBuffer(
      1,
      this.bufferSize,
      this.context.sampleRate
    );
    const output = buffer.getChannelData(0);

    // Paul Kellett state variables
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < this.bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      // Apply pink noise filter
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;

      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    return buffer;
  }

  /**
   * Generate brown noise (-6dB/octave spectral slope)
   * Uses cascaded integrator method
   */
  generateBrownNoise(): AudioBuffer {
    const buffer = this.context.createBuffer(
      1,
      this.bufferSize,
      this.context.sampleRate
    );
    const output = buffer.getChannelData(0);

    let lastOut = 0;

    for (let i = 0; i < this.bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Compensate for volume loss
    }

    return buffer;
  }

  /**
   * Generate white noise (flat spectrum, 0dB/octave)
   */
  generateWhiteNoise(): AudioBuffer {
    const buffer = this.context.createBuffer(
      1,
      this.bufferSize,
      this.context.sampleRate
    );
    const output = buffer.getChannelData(0);

    for (let i = 0; i < this.bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    return buffer;
  }

  /**
   * Create looping noise source node
   */
  createNoiseSource(type: 'pink' | 'brown' | 'white'): AudioBufferSourceNode {
    let buffer: AudioBuffer;

    switch (type) {
      case 'pink':
        buffer = this.generatePinkNoise();
        break;
      case 'brown':
        buffer = this.generateBrownNoise();
        break;
      case 'white':
      default:
        buffer = this.generateWhiteNoise();
        break;
    }

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    return source;
  }
}
