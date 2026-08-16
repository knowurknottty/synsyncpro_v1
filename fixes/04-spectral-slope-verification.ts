/**
 * FIX #4: Noise Spectral Slope Verification
 * 
 * PROBLEM: QA metrics track clipping, peak, RMS, dynamic range, THD, SNR,
 * and LUFS — but don't verify that noise generators produce correct spectral
 * slopes. Pink noise should be -3dB/octave, brown should be -6dB/octave.
 * Without verification, a broken noise generator (flat spectrum labeled as
 * "pink") would pass all existing QA checks.
 * 
 * SOLUTION: Add spectral slope measurement to getQAMetrics(). Uses FFT
 * data already available from the existing analyser node. Calculates
 * linear regression across octave bands to determine dB/octave slope.
 */

// ============================================================
// SPECTRAL SLOPE ANALYZER
// ============================================================

export interface SpectralSlopeResult {
  slope: number;           // dB per octave (negative = falling)
  r2: number;              // Coefficient of determination (fit quality)
  expectedSlope: number;   // What this noise type should produce
  deviation: number;       // Absolute difference from expected
  pass: boolean;           // Within acceptable tolerance
  noiseType: string;       // Which noise was tested
}

/**
 * Expected spectral slopes by noise type.
 * Tolerance is ±1.5 dB/octave to account for finite buffer effects.
 */
const NOISE_SPECS: Record<string, { slope: number; tolerance: number }> = {
  white: { slope: 0, tolerance: 1.5 },
  pink:  { slope: -3, tolerance: 1.5 },
  brown: { slope: -6, tolerance: 2.0 }, // Brown is harder to measure precisely
};

/**
 * Measure the spectral slope of the current noise generator output.
 * 
 * Uses the existing AnalyserNode to get frequency data, then performs
 * linear regression on power-vs-frequency in log-log space (which
 * converts the power law to a linear relationship).
 * 
 * @param analyser - The existing AnalyserNode from AudioEngine
 * @param sampleRate - AudioContext sample rate
 * @param noiseType - Current noise type for comparison
 * @returns SpectralSlopeResult
 */
export function measureSpectralSlope(
  analyser: AnalyserNode,
  sampleRate: number,
  noiseType: string
): SpectralSlopeResult {
  const bufferLength = analyser.frequencyBinCount;
  const frequencyData = new Float32Array(bufferLength);
  analyser.getFloatFrequencyData(frequencyData);

  const binWidth = sampleRate / (bufferLength * 2);

  // Collect octave-band averages from 31.25Hz to 16kHz
  // (8 octave bands, standard audio analysis range)
  const octaveBands = [31.25, 62.5, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
  const bandPowers: Array<{ logFreq: number; power: number }> = [];

  for (let i = 0; i < octaveBands.length - 1; i++) {
    const lowFreq = octaveBands[i];
    const highFreq = octaveBands[i + 1];
    const centerFreq = Math.sqrt(lowFreq * highFreq); // Geometric center

    const lowBin = Math.max(1, Math.floor(lowFreq / binWidth));
    const highBin = Math.min(bufferLength - 1, Math.ceil(highFreq / binWidth));

    if (highBin <= lowBin) continue;

    // Average power in this octave band (already in dB from getFloatFrequencyData)
    let sum = 0;
    let count = 0;
    for (let bin = lowBin; bin <= highBin; bin++) {
      if (frequencyData[bin] > -100) { // Skip silence/noise floor
        sum += frequencyData[bin];
        count++;
      }
    }

    if (count > 0) {
      bandPowers.push({
        logFreq: Math.log2(centerFreq),
        power: sum / count,
      });
    }
  }

  // Linear regression: power(dB) = slope * log2(freq) + intercept
  // slope = dB per octave (since x-axis is in octaves)
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

/**
 * Simple linear regression.
 * Returns slope and R² (coefficient of determination).
 */
function linearRegression(
  points: Array<{ logFreq: number; power: number }>
): { slope: number; intercept: number; r2: number } {
  const n = points.length;
  if (n < 3) return { slope: 0, intercept: 0, r2: 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

  for (const p of points) {
    sumX += p.logFreq;
    sumY += p.power;
    sumXY += p.logFreq * p.power;
    sumX2 += p.logFreq * p.logFreq;
    sumY2 += p.power * p.power;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (Math.abs(denom) < 1e-10) return { slope: 0, intercept: 0, r2: 0 };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // R² calculation
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

// ============================================================
// INTEGRATION INTO getQAMetrics()
// ============================================================
/**
 * Add to the existing getQAMetrics() return object:
 * 
 *   getQAMetrics() {
 *     if (!this.analyser) return null;
 *     
 *     // ... existing metrics code ...
 *     
 *     // NEW: Spectral slope verification
 *     const noiseType = this.activeProtocol?.phases[this.phaseIndex]?.noise || 'white';
 *     const spectralSlope = measureSpectralSlope(
 *       this.analyser, this.ctx.sampleRate, noiseType
 *     );
 *     
 *     return {
 *       ...existingMetrics,
 *       spectralSlope,  // Add to metrics object
 *     };
 *   }
 * 
 * Optional: Add visual indicator in the DSP telemetry panel:
 *   if (!spectralSlope.pass) {
 *     console.warn(`Noise spectral slope out of spec: 
 *       ${spectralSlope.slope}dB/oct (expected ${spectralSlope.expectedSlope}dB/oct)`);
 *   }
 */
