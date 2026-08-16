/**
 * Real-Time Audio QA Metrics Engine
 * 
 * Provides production-grade quality metrics using the existing AnalyserNode.
 * Replaces placeholder values with actual measurements.
 * 
 * Metrics provided:
 * - Peak/RMS/Dynamic Range
 * - Clipping detection
 * - DC offset detection
 * - Simplified LUFS loudness metering
 * - THD (Total Harmonic Distortion) estimation
 * - SNR (Signal-to-Noise Ratio) estimation
 * - Health warnings
 */

export interface QAMetrics {
  // Amplitude metrics
  peakLevel: number;          // Peak amplitude [0, 1]
  rmsLevel: number;           // RMS level [0, 1]
  dynamicRange: number;       // Peak-to-RMS ratio in dB
  clipping: boolean;          // Whether clipping detected this frame
  clipCount: number;          // Total clips since session start
  dcOffset: number;           // DC offset (should be near 0)

  // Loudness (simplified LUFS - true LUFS requires K-weighting)
  shortTermLUFS: number;      // ~3 second window loudness
  momentaryLUFS: number;      // ~400ms window loudness

  // Spectral metrics
  thd: number;                // Total Harmonic Distortion estimate (%)
  snr: number;                // Signal-to-Noise Ratio estimate (dB)
  crestFactor: number;        // Peak/RMS ratio (higher = more dynamic)

  // Health indicators
  healthy: boolean;           // Overall audio health
  warnings: string[];         // Active warnings
}

export class QAMetricsEngine {
  private analyser: AnalyserNode;
  private timeDomainBuffer: Float32Array;
  private frequencyBuffer: Float32Array;
  private sampleRate: number;

  // Running state
  private clipCount: number = 0;
  private lufsWindow: number[] = [];        // Short-term LUFS samples
  private momentaryWindow: number[] = [];   // Momentary LUFS samples
  private readonly LUFS_WINDOW_SIZE = 90;   // ~3s at 30Hz update rate
  private readonly MOMENTARY_WINDOW_SIZE = 12; // ~400ms at 30Hz

  constructor(analyser: AnalyserNode, sampleRate: number) {
    this.analyser = analyser;
    this.sampleRate = sampleRate;
    this.timeDomainBuffer = new Float32Array(analyser.fftSize);
    this.frequencyBuffer = new Float32Array(analyser.frequencyBinCount);
  }

  /**
   * Calculate all QA metrics for the current audio frame.
   * Call at 2-30Hz (no need for 60Hz — metrics don't change that fast).
   */
  measure(): QAMetrics {
    this.analyser.getFloatTimeDomainData(this.timeDomainBuffer);
    this.analyser.getFloatFrequencyData(this.frequencyBuffer);

    const warnings: string[] = [];

    // ---- PEAK LEVEL ----
    let peakLevel = 0;
    let sumSquares = 0;
    let sum = 0;
    let clipping = false;
    const CLIP_THRESHOLD = 0.99;

    for (let i = 0; i < this.timeDomainBuffer.length; i++) {
      const sample = this.timeDomainBuffer[i];
      const absSample = Math.abs(sample);

      if (absSample > peakLevel) peakLevel = absSample;
      sumSquares += sample * sample;
      sum += sample;

      if (absSample >= CLIP_THRESHOLD) clipping = true;
    }

    if (clipping) {
      this.clipCount++;
      if (this.clipCount > 10) {
        warnings.push(`Clipping detected (${this.clipCount} total events)`);
      }
    }

    // ---- RMS LEVEL ----
    const rmsLevel = Math.sqrt(sumSquares / this.timeDomainBuffer.length);

    // ---- DC OFFSET ----
    const dcOffset = sum / this.timeDomainBuffer.length;
    if (Math.abs(dcOffset) > 0.01) {
      warnings.push(`DC offset: ${(dcOffset * 100).toFixed(2)}%`);
    }

    // ---- DYNAMIC RANGE ----
    const dynamicRange = peakLevel > 0 && rmsLevel > 0
      ? 20 * Math.log10(peakLevel / rmsLevel)
      : 0;

    // ---- CREST FACTOR ----
    const crestFactor = rmsLevel > 0 ? peakLevel / rmsLevel : 0;

    // ---- LUFS (Simplified) ----
    // True LUFS requires K-weighting filter chain.
    // This is a simplified approximation using RMS-based loudness.
    // Accurate enough for monitoring purposes, not for broadcast compliance.
    const rmsDB = rmsLevel > 0 ? 20 * Math.log10(rmsLevel) : -100;
    
    this.momentaryWindow.push(rmsDB);
    if (this.momentaryWindow.length > this.MOMENTARY_WINDOW_SIZE) {
      this.momentaryWindow.shift();
    }
    
    this.lufsWindow.push(rmsDB);
    if (this.lufsWindow.length > this.LUFS_WINDOW_SIZE) {
      this.lufsWindow.shift();
    }

    const momentaryLUFS = this.averageDB(this.momentaryWindow);
    const shortTermLUFS = this.averageDB(this.lufsWindow);

    // ---- THD ESTIMATE ----
    const thd = this.estimateTHD();

    // ---- SNR ESTIMATE ----
    const snr = this.estimateSNR();

    // ---- HEALTH CHECK ----
    if (peakLevel > 0.95) warnings.push('Peak level dangerously high');
    if (rmsLevel > 0.7) warnings.push('Sustained high RMS — check master gain');
    if (thd > 5) warnings.push(`High THD: ${thd.toFixed(1)}%`);
    if (dynamicRange < 3) warnings.push('Very low dynamic range — possible compression artifact');

    const healthy = warnings.length === 0;

    return {
      peakLevel: round(peakLevel, 4),
      rmsLevel: round(rmsLevel, 4),
      dynamicRange: round(dynamicRange, 1),
      clipping,
      clipCount: this.clipCount,
      dcOffset: round(dcOffset, 5),
      shortTermLUFS: round(shortTermLUFS, 1),
      momentaryLUFS: round(momentaryLUFS, 1),
      thd: round(thd, 2),
      snr: round(snr, 1),
      crestFactor: round(crestFactor, 2),
      healthy,
      warnings,
    };
  }

  /**
   * Estimate Total Harmonic Distortion from frequency spectrum.
   * Finds the dominant frequency, then sums energy at integer harmonics.
   */
  private estimateTHD(): number {
    const binWidth = this.sampleRate / (this.frequencyBuffer.length * 2);
    
    // Find fundamental (loudest bin above 20Hz)
    let maxPower = -Infinity;
    let fundamentalBin = 0;
    const minBin = Math.ceil(20 / binWidth);
    const maxBin = Math.min(this.frequencyBuffer.length, Math.ceil(2000 / binWidth));

    for (let i = minBin; i < maxBin; i++) {
      if (this.frequencyBuffer[i] > maxPower) {
        maxPower = this.frequencyBuffer[i];
        fundamentalBin = i;
      }
    }

    if (fundamentalBin === 0 || maxPower < -60) return 0;

    // Sum harmonic energy (2nd through 8th harmonics)
    const fundamentalPowerLinear = Math.pow(10, maxPower / 20);
    let harmonicSumSquared = 0;

    for (let h = 2; h <= 8; h++) {
      const harmonicBin = fundamentalBin * h;
      if (harmonicBin >= this.frequencyBuffer.length) break;

      // Check ±1 bin for harmonic (accounts for spectral leakage)
      let harmonicPower = -Infinity;
      for (let offset = -1; offset <= 1; offset++) {
        const bin = harmonicBin + offset;
        if (bin >= 0 && bin < this.frequencyBuffer.length) {
          harmonicPower = Math.max(harmonicPower, this.frequencyBuffer[bin]);
        }
      }

      const harmonicLinear = Math.pow(10, harmonicPower / 20);
      harmonicSumSquared += harmonicLinear * harmonicLinear;
    }

    const thd = (Math.sqrt(harmonicSumSquared) / fundamentalPowerLinear) * 100;
    return Math.min(100, thd); // Cap at 100%
  }

  /**
   * Estimate SNR by comparing signal band energy to noise floor.
   */
  private estimateSNR(): number {
    // Signal: energy in 20Hz-8000Hz range
    // Noise: energy in 15000Hz-20000Hz range (above content)
    const binWidth = this.sampleRate / (this.frequencyBuffer.length * 2);
    
    const signalStart = Math.ceil(20 / binWidth);
    const signalEnd = Math.floor(8000 / binWidth);
    const noiseStart = Math.ceil(15000 / binWidth);
    const noiseEnd = Math.min(this.frequencyBuffer.length - 1, Math.floor(20000 / binWidth));

    let signalPower = 0, noisePower = 0;
    let signalCount = 0, noiseCount = 0;

    for (let i = signalStart; i <= signalEnd && i < this.frequencyBuffer.length; i++) {
      signalPower += Math.pow(10, this.frequencyBuffer[i] / 10);
      signalCount++;
    }

    for (let i = noiseStart; i <= noiseEnd && i < this.frequencyBuffer.length; i++) {
      noisePower += Math.pow(10, this.frequencyBuffer[i] / 10);
      noiseCount++;
    }

    if (noiseCount === 0 || noisePower === 0) return 60; // Assume good SNR
    
    const avgSignal = signalPower / signalCount;
    const avgNoise = noisePower / noiseCount;

    return 10 * Math.log10(avgSignal / avgNoise);
  }

  /**
   * Average dB values (power-weighted mean, not arithmetic).
   */
  private averageDB(values: number[]): number {
    if (values.length === 0) return -100;
    const sum = values.reduce((acc, db) => acc + Math.pow(10, db / 10), 0);
    return 10 * Math.log10(sum / values.length);
  }

  /**
   * Reset all running counters (on protocol start).
   */
  reset(): void {
    this.clipCount = 0;
    this.lufsWindow = [];
    this.momentaryWindow = [];
  }
}

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
