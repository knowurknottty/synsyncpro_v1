/**
 * Real-time audio quality metrics
 * Detects clipping, measures loudness, estimates THD+N
 */

export interface QualityReport {
  peak: number;
  rms: number;
  peakDb: number;
  rmsDb: number;
  clipping: boolean;
  clippedSamples: number;
  thd?: number;
}

export class AudioQualityMetrics {
  private analyser: AnalyserNode;
  private timeDomainData: Float32Array;
  private frequencyData: Float32Array;

  constructor(context: AudioContext, sourceNode: AudioNode) {
    this.analyser = context.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0;

    this.timeDomainData = new Float32Array(this.analyser.fftSize);
    this.frequencyData = new Float32Array(this.analyser.frequencyBinCount);

    sourceNode.connect(this.analyser);
  }

  /**
   * Detect clipping events
   */
  detectClipping(): { isClipping: boolean; clippedSamples: number } {
    this.analyser.getFloatTimeDomainData(this.timeDomainData);

    let clippedSamples = 0;
    const threshold = 0.99;

    for (let i = 0; i < this.timeDomainData.length; i++) {
      if (Math.abs(this.timeDomainData[i]) >= threshold) {
        clippedSamples++;
      }
    }

    return {
      isClipping: clippedSamples > 0,
      clippedSamples,
    };
  }

  /**
   * Calculate RMS (Root Mean Square) level
   * This is perceived loudness
   */
  calculateRMS(): number {
    this.analyser.getFloatTimeDomainData(this.timeDomainData);

    let sum = 0;
    for (let i = 0; i < this.timeDomainData.length; i++) {
      const sample = this.timeDomainData[i];
      sum += sample * sample;
    }

    return Math.sqrt(sum / this.timeDomainData.length);
  }

  /**
   * Calculate peak level (maximum amplitude)
   */
  calculatePeak(): number {
    this.analyser.getFloatTimeDomainData(this.timeDomainData);

    let peak = 0;
    for (let i = 0; i < this.timeDomainData.length; i++) {
      peak = Math.max(peak, Math.abs(this.timeDomainData[i]));
    }

    return peak;
  }

  /**
   * Estimate THD+N (Total Harmonic Distortion + Noise)
   * Lower is better, <1% is excellent
   */
  estimateTHD(fundamentalFreq: number): number {
    this.analyser.getFloatFrequencyData(this.frequencyData);

    const sampleRate = this.analyser.context.sampleRate;
    const binWidth = sampleRate / this.analyser.fftSize;
    const fundamentalBin = Math.round(fundamentalFreq / binWidth);

    // Get fundamental power
    const fundamentalPower = Math.pow(10, this.frequencyData[fundamentalBin] / 10);

    // Sum harmonic powers (2nd through 5th harmonics)
    let harmonicsPower = 0;
    for (let n = 2; n <= 5; n++) {
      const harmonicBin = fundamentalBin * n;
      if (harmonicBin < this.frequencyData.length) {
        harmonicsPower += Math.pow(10, this.frequencyData[harmonicBin] / 10);
      }
    }

    // THD = sqrt(harmonics / fundamental)
    return Math.sqrt(harmonicsPower / fundamentalPower);
  }

  /**
   * Get comprehensive quality report
   */
  getQualityReport(): QualityReport {
    const { isClipping, clippedSamples } = this.detectClipping();
    const rms = this.calculateRMS();
    const peak = this.calculatePeak();

    // Convert to dB
    const peakDb = 20 * Math.log10(Math.max(peak, 1e-10));
    const rmsDb = 20 * Math.log10(Math.max(rms, 1e-10));

    return {
      peak,
      rms,
      peakDb,
      rmsDb,
      clipping: isClipping,
      clippedSamples,
    };
  }

  /**
   * Get crest factor (peak/RMS ratio)
   * Good audio typically has 3-6 dB crest factor
   */
  getCrestFactor(): number {
    const peak = this.calculatePeak();
    const rms = this.calculateRMS();
    return 20 * Math.log10(peak / rms);
  }
}
