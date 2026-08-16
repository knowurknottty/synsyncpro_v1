/**
 * FIX #4: Noise Spectral Slope Verification
 * ===========================================
 * Measures spectral slope via FFT to verify noise generators:
 * - White: 0 dB/octave
 * - Pink: -3 dB/octave
 * - Brown: -6 dB/octave
 *
 * @version 2.0.0
 */

export interface SpectralSlopeResult {
  slope: number;
  r2: number;
  expectedSlope: number;
  deviation: number;
  pass: boolean;
  noiseType: string;
}

const NOISE_SPECS: Record<string, { slope: number; tolerance: number }> = {
  white: { slope: 0, tolerance: 1.5 },
  pink:  { slope: -3, tolerance: 1.5 },
  brown: { slope: -6, tolerance: 2.0 },
};

export function measureSpectralSlope(
  analyser: AnalyserNode,
  sampleRate: number,
  noiseType: string
): SpectralSlopeResult {
  const bufferLength = analyser.frequencyBinCount;
  const frequencyData = new Float32Array(bufferLength);
  analyser.getFloatFrequencyData(frequencyData);

  const binWidth = sampleRate / (bufferLength * 2);
  const octaveBands = [31.25, 62.5, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
  const bandPowers: Array<{ logFreq: number; power: number }> = [];

  for (let i = 0; i < octaveBands.length - 1; i++) {
    const lowFreq = octaveBands[i];
    const highFreq = octaveBands[i + 1];
    const centerFreq = Math.sqrt(lowFreq * highFreq);

    const lowBin = Math.max(1, Math.floor(lowFreq / binWidth));
    const highBin = Math.min(bufferLength - 1, Math.ceil(highFreq / binWidth));
    if (highBin <= lowBin) continue;

    let sum = 0;
    let count = 0;
    for (let bin = lowBin; bin <= highBin; bin++) {
      if (frequencyData[bin] > -100) {
        sum += frequencyData[bin];
        count++;
      }
    }

    if (count > 0) {
      bandPowers.push({ logFreq: Math.log2(centerFreq), power: sum / count });
    }
  }

  const { slope, r2 } = linearRegression(bandPowers);
  const spec = NOISE_SPECS[noiseType] || NOISE_SPECS.white;
  const deviation = Math.abs(slope - spec.slope);

  return {
    slope: Math.round(slope * 100) / 100,
    r2: Math.round(r2 * 1000) / 1000,
    expectedSlope: spec.slope,
    deviation: Math.round(deviation * 100) / 100,
    pass: deviation <= spec.tolerance,
    noiseType,
  };
}

function linearRegression(
  points: Array<{ logFreq: number; power: number }>
): { slope: number; intercept: number; r2: number } {
  const n = points.length;
  if (n < 3) return { slope: 0, intercept: 0, r2: 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (const p of points) {
    sumX += p.logFreq;
    sumY += p.power;
    sumXY += p.logFreq * p.power;
    sumX2 += p.logFreq * p.logFreq;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (Math.abs(denom) < 1e-10) return { slope: 0, intercept: 0, r2: 0 };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  const meanY = sumY / n;
  let ssRes = 0, ssTot = 0;
  for (const p of points) {
    const predicted = slope * p.logFreq + intercept;
    ssRes += (p.power - predicted) ** 2;
    ssTot += (p.power - meanY) ** 2;
  }
  const r2 = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;

  return { slope, intercept, r2 };
}
