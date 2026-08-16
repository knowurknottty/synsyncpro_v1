/**
 * Automatic Gain Control (AGC) for consistent entrainment audio
 * Prevents volume spikes that disrupt meditative state
 * Attack/Release optimized for non-intrusive adjustment
 */

export class DynamicRangeProcessor {
  private context: AudioContext;
  private compressor: DynamicsCompressorNode;
  private limiter: DynamicsCompressorNode;

  constructor(context: AudioContext) {
    this.context = context;

    // Gentle compression for consistent perceived loudness
    this.compressor = context.createDynamicsCompressor();
    this.compressor.threshold.value = -24;  // dB
    this.compressor.knee.value = 12;        // Soft knee
    this.compressor.ratio.value = 3;        // 3:1 ratio
    this.compressor.attack.value = 0.1;     // 100ms attack (slow, non-intrusive)
    this.compressor.release.value = 0.25;   // 250ms release

    // Hard limiter for safety (prevent speaker damage)
    this.limiter = context.createDynamicsCompressor();
    this.limiter.threshold.value = -3;      // dB
    this.limiter.knee.value = 0;            // Hard knee
    this.limiter.ratio.value = 20;          // Brick wall
    this.limiter.attack.value = 0.001;      // 1ms attack
    this.limiter.release.value = 0.01;      // 10ms release
  }

  /**
   * Insert processor into signal chain
   */
  process(inputNode: AudioNode, outputNode: AudioNode): void {
    inputNode
      .connect(this.compressor)
      .connect(this.limiter)
      .connect(outputNode);
  }

  /**
   * Get processor nodes for manual routing
   */
  getNodes() {
    return {
      compressor: this.compressor,
      limiter: this.limiter
    };
  }

  /**
   * Adjust settings for different protocol types
   */
  setPreset(preset: 'sleep' | 'focus' | 'energy'): void {
    switch (preset) {
      case 'sleep':
        // Ultra-gentle for deep states
        this.compressor.threshold.value = -30;
        this.compressor.ratio.value = 2;
        this.compressor.attack.value = 0.2;
        this.compressor.release.value = 0.5;
        break;

      case 'focus':
        // Balanced for alertness
        this.compressor.threshold.value = -24;
        this.compressor.ratio.value = 3;
        this.compressor.attack.value = 0.1;
        this.compressor.release.value = 0.25;
        break;

      case 'energy':
        // Punchy for motivation
        this.compressor.threshold.value = -20;
        this.compressor.ratio.value = 4;
        this.compressor.attack.value = 0.05;
        this.compressor.release.value = 0.15;
        break;
    }
  }

  /**
   * Enable/disable processing
   */
  bypass(enabled: boolean): void {
    if (enabled) {
      this.compressor.ratio.value = 1;
      this.limiter.ratio.value = 1;
    } else {
      this.setPreset('focus'); // Restore defaults
    }
  }
}
