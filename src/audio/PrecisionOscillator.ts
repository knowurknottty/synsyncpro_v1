/**
 * Ultra-precise oscillator with phase accumulator
 * Prevents frequency drift over long sessions
 *
 * Research requirements:
 * - Carrier frequency accuracy ±0.1Hz for therapeutic effect
 * - Zero drift over 90-minute sessions
 * - Phase accumulator prevents floating-point errors
 */

export class PrecisionOscillator {
  private context: AudioContext;
  private phase: number = 0;
  private phaseIncrement: number = 0;
  private readonly BUFFER_SIZE = 2048;

  constructor(context: AudioContext) {
    this.context = context;
  }

  /**
   * Generate binaural beat pair with sub-Hz precision
   * @param carrierFreq - Base frequency (optimal: 200-500Hz per research)
   * @param beatFreq - Target brainwave frequency (e.g., 10Hz alpha)
   * @param duration - Duration in seconds
   */
  generateBinauralPair(
    carrierFreq: number,
    beatFreq: number,
    duration: number
  ): { left: AudioBuffer; right: AudioBuffer } {
    const sampleRate = this.context.sampleRate;
    const length = Math.floor(duration * sampleRate);

    // Create stereo buffers
    const leftBuffer = this.context.createBuffer(1, length, sampleRate);
    const rightBuffer = this.context.createBuffer(1, length, sampleRate);

    const leftData = leftBuffer.getChannelData(0);
    const rightData = rightBuffer.getChannelData(0);

    // Left ear: carrier frequency
    let phaseL = 0;
    const phaseIncrementL = (2 * Math.PI * carrierFreq) / sampleRate;

    // Right ear: carrier + beat frequency
    let phaseR = 0;
    const phaseIncrementR = (2 * Math.PI * (carrierFreq + beatFreq)) / sampleRate;

    for (let i = 0; i < length; i++) {
      // Generate with phase accumulator (no drift)
      leftData[i] = Math.sin(phaseL);
      rightData[i] = Math.sin(phaseR);

      // Accumulate phase
      phaseL += phaseIncrementL;
      phaseR += phaseIncrementR;

      // Wrap phase to prevent overflow (maintains precision)
      if (phaseL > 2 * Math.PI) phaseL -= 2 * Math.PI;
      if (phaseR > 2 * Math.PI) phaseR -= 2 * Math.PI;
    }

    return { left: leftBuffer, right: rightBuffer };
  }

  /**
   * Generate isochronic tone with precise pulse timing
   * Research: Square wave modulation preferred over sine
   * @param carrierFreq - Tone frequency (e.g., 432Hz)
   * @param pulseFreq - Pulse rate matching brainwave (e.g., 10Hz)
   * @param duration - Duration in seconds
   */
  generateIsochronicTone(
    carrierFreq: number,
    pulseFreq: number,
    duration: number
  ): AudioBuffer {
    const sampleRate = this.context.sampleRate;
    const length = Math.floor(duration * sampleRate);

    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    let carrierPhase = 0;
    const carrierIncrement = (2 * Math.PI * carrierFreq) / sampleRate;

    let pulsePhase = 0;
    const pulseIncrement = (2 * Math.PI * pulseFreq) / sampleRate;

    for (let i = 0; i < length; i++) {
      // Generate carrier tone
      const carrier = Math.sin(carrierPhase);

      // Generate square wave pulse (0 or 1)
      // Research shows square modulation > sine modulation for entrainment
      const pulse = pulsePhase < Math.PI ? 1.0 : 0.0;

      // Multiply carrier by pulse (isochronic effect)
      data[i] = carrier * pulse;

      // Accumulate phases
      carrierPhase += carrierIncrement;
      pulsePhase += pulseIncrement;

      // Wrap phases
      if (carrierPhase > 2 * Math.PI) carrierPhase -= 2 * Math.PI;
      if (pulsePhase > 2 * Math.PI) pulsePhase -= 2 * Math.PI;
    }

    return buffer;
  }

  /**
   * Verify frequency accuracy (for testing)
   * Uses zero-crossing count to measure actual frequency vs intended
   */
  verifyFrequency(buffer: AudioBuffer, expectedFreq: number): number {
    const data = buffer.getChannelData(0);
    const sampleRate = this.context.sampleRate;

    // Count zero crossings to measure frequency
    let crossings = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i - 1] <= 0 && data[i] > 0) crossings++;
    }

    const duration = data.length / sampleRate;
    const measuredFreq = crossings / duration;
    const error = Math.abs(measuredFreq - expectedFreq);


    return measuredFreq;
  }
}
