/**
 * FIX #10: Real QA Metrics Implementation
 * =========================================
 * Replaces placeholder getQAMetrics() with actual implementations:
 * peak, RMS, clipping, DC offset, LUFS, THD, SNR, crest factor.
 *
 * @version 2.0.0
 */

export interface RealQAMetrics {
  peakLevel: number;
  rmsLevel: number;
  dynamicRange: number;
  clipping: boolean;
  clipCount: number;
  dcOffset: number;
  shortTermLUFS: number;
  momentaryLUFS: number;
  thd: number;
  snr: number;
  crestFactor: number;
  healthy: boolean;
  warnings: string[];
}

export class QAMetricsEngine {
  private analyser: AnalyserNode;
  private timeDomainBuffer: Float32Array;
  private frequencyBuffer: Float32Array;
  private sampleRate: number;

  private clipCount: number = 0;
  private lufsWindow: number[] = [];
  private momentaryWindow: number[] = [];
  private readonly LUFS_WINDOW_SIZE = 90;
  private readonly MOMENTARY_WINDOW_SIZE = 12;

  constructor(analyser: AnalyserNode, sampleRate: number) {
    this.analyser = analyser;
    this.sampleRate = sampleRate;
    this.timeDomainBuffer = new Float32Array(analyser.fftSize);
    this.frequencyBuffer = new Float32Array(analyser.frequencyBinCount);
  }

  measure(): RealQAMetrics {
    this.analyser.getFloatTimeDomainData(this.timeDomainBuffer);
    this.analyser.getFloatFrequencyData(this.frequencyBuffer);

    const warnings: string[] = [];
    const CLIP_THRESHOLD = 0.99;

    let peakLevel = 0;
    let sumSquares = 0;
    let sum = 0;
    let clipping = false;

    for (let i = 0; i < this.timeDomainBuffer.length; i++) {
      const sample = this.timeDomainBuffer[i];
      const abs = Math.abs(sample);
      if (abs > peakLevel) peakLevel = abs;
      sumSquares += sample * sample;
      sum += sample;
      if (abs >= CLIP_THRESHOLD) clipping = true;
    }

    if (clipping) {
      this.clipCount++;
      if (this.clipCount > 10) warnings.push(`Clipping detected (${this.clipCount} events)`);
    }

    const rmsLevel = Math.sqrt(sumSquares / this.timeDomainBuffer.length);
    const dcOffset = sum / this.timeDomainBuffer.length;
    if (Math.abs(dcOffset) > 0.01) warnings.push(`DC offset: ${(dcOffset * 100).toFixed(2)}%`);

    const dynamicRange = peakLevel > 0 && rmsLevel > 0 ? 20 * Math.log10(peakLevel / rmsLevel) : 0;
    const crestFactor = rmsLevel > 0 ? peakLevel / rmsLevel : 0;

    const rmsDB = rmsLevel > 0 ? 20 * Math.log10(rmsLevel) : -100;
    this.momentaryWindow.push(rmsDB);
    if (this.momentaryWindow.length > this.MOMENTARY_WINDOW_SIZE) this.momentaryWindow.shift();
    this.lufsWindow.push(rmsDB);
    if (this.lufsWindow.length > this.LUFS_WINDOW_SIZE) this.lufsWindow.shift();

    const momentaryLUFS = this.averageDB(this.momentaryWindow);
    const shortTermLUFS = this.averageDB(this.lufsWindow);
    const thd = this.estimateTHD();
    const snr = this.estimateSNR();

    if (peakLevel > 0.95) warnings.push('Peak level dangerously high');
    if (rmsLevel > 0.7) warnings.push('Sustained high RMS — check master gain');
    if (thd > 5) warnings.push(`High THD: ${thd.toFixed(1)}%`);
    if (dynamicRange < 3) warnings.push('Very low dynamic range');

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
      healthy: warnings.length === 0,
      warnings,
    };
  }

  private estimateTHD(): number {
    const binWidth = this.sampleRate / (this.frequencyBuffer.length * 2);
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

    const fundamentalPowerLinear = Math.pow(10, maxPower / 20);
    let harmonicSumSquared = 0;

    for (let h = 2; h <= 8; h++) {
      const harmonicBin = fundamentalBin * h;
      if (harmonicBin >= this.frequencyBuffer.length) break;

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

    return Math.min(100, (Math.sqrt(harmonicSumSquared) / fundamentalPowerLinear) * 100);
  }

  private estimateSNR(): number {
    const binWidth = this.sampleRate / (this.frequencyBuffer.length * 2);
    const signalStart = Math.ceil(20 / binWidth);
    const signalEnd = Math.floor(8000 / binWidth);
    const noiseStart = Math.ceil(15000 / binWidth);
    const noiseEnd = Math.min(this.frequencyBuffer.length - 1, Math.floor(20000 / binWidth));

    let signalPower = 0, noisePower = 0, signalCount = 0, noiseCount = 0;

    for (let i = signalStart; i <= signalEnd && i < this.frequencyBuffer.length; i++) {
      signalPower += Math.pow(10, this.frequencyBuffer[i] / 10);
      signalCount++;
    }
    for (let i = noiseStart; i <= noiseEnd && i < this.frequencyBuffer.length; i++) {
      noisePower += Math.pow(10, this.frequencyBuffer[i] / 10);
      noiseCount++;
    }

    if (noiseCount === 0 || noisePower === 0) return 60;
    return 10 * Math.log10((signalPower / signalCount) / (noisePower / noiseCount));
  }

  private averageDB(values: number[]): number {
    if (values.length === 0) return -100;
    const sum = values.reduce((acc, db) => acc + Math.pow(10, db / 10), 0);
    return 10 * Math.log10(sum / values.length);
  }

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
