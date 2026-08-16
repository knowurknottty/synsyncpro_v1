/**
 * FIX #7: Auto-Enable Stochastic Jitter for Long Protocols
 * ==========================================================
 * Auto-enables low-variance jitter for phases >10min to prevent
 * auditory habituation, with conservative handling for precise
 * frequencies (Schumann 7.83Hz, 40Hz gamma).
 *
 * @version 2.0.0
 */

export interface StochasticConfig {
  enabled: boolean;
  deviation: number;
  rateHz: number;
  rationale: string;
}

const JITTER_POLICY = {
  MIN_PHASE_DURATION_SECONDS: 600,
  tiers: [
    { minDuration: 600,  deviation: 3,  rate: 2 },
    { minDuration: 1200, deviation: 5,  rate: 3 },
    { minDuration: 1800, deviation: 8,  rate: 4 },
    { minDuration: 3600, deviation: 12, rate: 5 },
  ],
  MAX_DEVIATION_PERCENT: 15,
  conservativeFrequencies: [
    { freq: 7.83, tolerance: 0.5 },
    { freq: 40, tolerance: 2 },
    { freq: 0.1, tolerance: 0.01 },
  ],
};

export function calculateAutoJitter(
  phaseDuration: number,
  beatFrequency: number,
  explicitlyDisabled?: boolean,
  explicitVariance?: number
): StochasticConfig {
  if (explicitlyDisabled === true) {
    return { enabled: false, deviation: 0, rateHz: 0, rationale: 'Explicitly disabled' };
  }
  if (explicitVariance !== undefined && explicitVariance > 0) {
    return { enabled: true, deviation: explicitVariance, rateHz: 3, rationale: `Protocol-defined: ${explicitVariance}Hz` };
  }
  if (phaseDuration < JITTER_POLICY.MIN_PHASE_DURATION_SECONDS) {
    return { enabled: false, deviation: 0, rateHz: 0, rationale: `Phase too short (${phaseDuration}s)` };
  }

  let tier = JITTER_POLICY.tiers[0];
  for (const t of JITTER_POLICY.tiers) {
    if (phaseDuration >= t.minDuration) tier = t;
  }

  let deviation = tier.deviation;
  const maxDeviation = Math.abs(beatFrequency) * (JITTER_POLICY.MAX_DEVIATION_PERCENT / 100);
  deviation = Math.min(deviation, maxDeviation);

  for (const cf of JITTER_POLICY.conservativeFrequencies) {
    if (Math.abs(beatFrequency - cf.freq) < cf.tolerance * 2) {
      deviation = Math.min(deviation, cf.tolerance);
      return { enabled: true, deviation, rateHz: tier.rate, rationale: `Conservative for ${cf.freq}Hz (±${deviation}Hz)` };
    }
  }

  deviation = Math.max(0.5, deviation);
  return { enabled: true, deviation, rateHz: tier.rate, rationale: `Auto-jitter for ${phaseDuration}s phase: ±${deviation}Hz` };
}

export function applySmoothedJitter(
  currentJitter: number,
  config: StochasticConfig,
  deltaTime: number
): number {
  if (!config.enabled || config.deviation === 0) return 0;

  const targetJitter = (Math.random() * 2 - 1) * config.deviation;
  const smoothingFactor = 1 - Math.exp(-config.rateHz * deltaTime);
  const meanReversion = -currentJitter * 0.1 * deltaTime;
  const newJitter = currentJitter + (targetJitter - currentJitter) * smoothingFactor + meanReversion;

  return Math.max(-config.deviation, Math.min(config.deviation, newJitter));
}
