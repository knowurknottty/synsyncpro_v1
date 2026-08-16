/**
 * FIX #7: Stochastic Jitter Auto-Enable for Long Protocols
 * 
 * PROBLEM: Stochastic jitter (frequency micro-variations) is enabled in
 * some v4 protocols but appears disabled (stochastic: false) in most v5
 * Phase Builder protocols. Without jitter, sustained fixed-frequency
 * entrainment creates an unnaturally "locked" quality that causes:
 *   1. Auditory habituation — brain stops responding after ~10-15min
 *   2. Listener fatigue — perceived monotony reduces session completion
 *   3. Reduced ecological validity — natural brainwaves have jitter
 * 
 * SOLUTION: Auto-enable low-variance stochastic jitter on any phase
 * longer than a threshold (e.g., 10 minutes), unless explicitly disabled.
 * The Phase Builder already supports .stochasticJitter(), so this is a
 * default behavior change, not a new feature.
 */

// ============================================================
// STOCHASTIC JITTER POLICY
// ============================================================

export interface StochasticConfig {
  enabled: boolean;
  deviation: number;    // Frequency deviation in Hz (peak)
  rateHz: number;       // How often jitter changes (updates per second)
  rationale: string;
}

/**
 * Phase duration thresholds and corresponding jitter levels.
 * Longer phases need more variation to prevent habituation.
 */
const JITTER_POLICY = {
  // Phases shorter than this get no auto-jitter
  MIN_PHASE_DURATION_SECONDS: 600, // 10 minutes

  // Jitter intensity scales with phase duration
  // But caps at a maximum to prevent disrupting entrainment
  tiers: [
    { minDuration: 600,  deviation: 3,  rate: 2 },   // 10-20min: subtle
    { minDuration: 1200, deviation: 5,  rate: 3 },   // 20-30min: mild
    { minDuration: 1800, deviation: 8,  rate: 4 },   // 30-60min: moderate
    { minDuration: 3600, deviation: 12, rate: 5 },   // 60min+:  standard
  ],

  // Maximum deviation as percentage of beat frequency
  // Prevents jitter from crossing band boundaries
  MAX_DEVIATION_PERCENT: 15,

  // Frequencies where jitter should be more conservative
  // (very precise frequencies like 7.83Hz Schumann, 40Hz gamma binding)
  conservativeFrequencies: [
    { freq: 7.83, tolerance: 0.5 },   // Schumann resonance
    { freq: 40, tolerance: 2 },        // 40Hz gamma (Alzheimer's research uses precise 40Hz)
    { freq: 0.1, tolerance: 0.01 },    // HRV coherence frequency
  ],
};

/**
 * Determine stochastic jitter configuration for a phase.
 * 
 * @param phaseDuration - Phase duration in seconds
 * @param beatFrequency - Target beat frequency in Hz
 * @param explicitlyDisabled - If protocol set stochastic: false intentionally
 * @param explicitVariance - If protocol set stochasticVariance explicitly
 * @returns StochasticConfig
 */
export function calculateAutoJitter(
  phaseDuration: number,
  beatFrequency: number,
  explicitlyDisabled?: boolean,
  explicitVariance?: number
): StochasticConfig {
  // Respect explicit disable
  if (explicitlyDisabled === true) {
    return {
      enabled: false,
      deviation: 0,
      rateHz: 0,
      rationale: 'Explicitly disabled by protocol definition',
    };
  }

  // Respect explicit variance setting
  if (explicitVariance !== undefined && explicitVariance > 0) {
    return {
      enabled: true,
      deviation: explicitVariance,
      rateHz: 3,
      rationale: `Protocol-defined variance: ${explicitVariance}Hz`,
    };
  }

  // Short phases don't need jitter
  if (phaseDuration < JITTER_POLICY.MIN_PHASE_DURATION_SECONDS) {
    return {
      enabled: false,
      deviation: 0,
      rateHz: 0,
      rationale: `Phase too short (${phaseDuration}s < ${JITTER_POLICY.MIN_PHASE_DURATION_SECONDS}s threshold)`,
    };
  }

  // Find appropriate tier
  let tier = JITTER_POLICY.tiers[0];
  for (const t of JITTER_POLICY.tiers) {
    if (phaseDuration >= t.minDuration) {
      tier = t;
    }
  }

  // Cap deviation to percentage of beat frequency
  let deviation = tier.deviation;
  const maxDeviation = Math.abs(beatFrequency) * (JITTER_POLICY.MAX_DEVIATION_PERCENT / 100);
  deviation = Math.min(deviation, maxDeviation);

  // Check if this is a conservative frequency
  for (const cf of JITTER_POLICY.conservativeFrequencies) {
    if (Math.abs(beatFrequency - cf.freq) < cf.tolerance * 2) {
      deviation = Math.min(deviation, cf.tolerance);
      return {
        enabled: true,
        deviation,
        rateHz: tier.rate,
        rationale: `Conservative jitter for precise frequency ${cf.freq}Hz (±${deviation}Hz)`,
      };
    }
  }

  // Ensure minimum meaningful deviation
  deviation = Math.max(0.5, deviation);

  return {
    enabled: true,
    deviation,
    rateHz: tier.rate,
    rationale: `Auto-jitter for ${phaseDuration}s phase: ±${deviation}Hz at ${tier.rate}Hz update rate`,
  };
}

// ============================================================
// JITTER APPLICATION IN modulatePhase()
// ============================================================

/**
 * Apply stochastic jitter to oscillator frequencies.
 * Uses smoothed random walk (not raw random) to prevent jarring jumps.
 * 
 * Call this inside the modulatePhase() animation frame loop.
 * 
 * @param currentJitter - Previous jitter value (for smoothing)
 * @param config - StochasticConfig from calculateAutoJitter
 * @param deltaTime - Time since last frame (seconds)
 * @returns New jitter value to add to oscillator frequencies
 */
export function applySmoothedJitter(
  currentJitter: number,
  config: StochasticConfig,
  deltaTime: number
): number {
  if (!config.enabled || config.deviation === 0) return 0;

  // Smoothed random walk with mean reversion
  // This prevents the jitter from drifting too far from center
  // while still feeling "natural" and non-periodic

  const targetJitter = (Math.random() * 2 - 1) * config.deviation;
  
  // Exponential smoothing toward target
  // Higher rate = faster changes = more variation perceived
  const smoothingFactor = 1 - Math.exp(-config.rateHz * deltaTime);
  
  // Mean reversion term — pulls jitter back toward zero
  // Prevents sustained deviation from target frequency
  const meanReversion = -currentJitter * 0.1 * deltaTime;
  
  const newJitter = currentJitter + (targetJitter - currentJitter) * smoothingFactor + meanReversion;

  // Hard clamp to configured deviation
  return Math.max(-config.deviation, Math.min(config.deviation, newJitter));
}

// ============================================================
// INTEGRATION
// ============================================================
/**
 * In modulatePhase(), where stochastic is currently applied:
 * 
 * BEFORE:
 *   if (phase.stochastic?.enabled) {
 *     const f = (Math.random() - 0.5) * 2 * phase.stochastic.deviation;
 *     v.leftOsc.frequency.value += f;
 *     v.rightOsc.frequency.value += f;
 *   }
 * 
 * AFTER:
 *   // Calculate config once per phase transition:
 *   const jitterConfig = calculateAutoJitter(
 *     phase.duration,
 *     phase.beat ?? phase.startBeat ?? 10,
 *     phase.stochastic === false ? true : undefined,
 *     phase.stochasticVariance
 *   );
 *   
 *   // In animation frame loop:
 *   this.currentJitter = applySmoothedJitter(
 *     this.currentJitter ?? 0,
 *     jitterConfig,
 *     deltaTime
 *   );
 *   v.leftOsc.frequency.value += this.currentJitter;
 *   v.rightOsc.frequency.value += this.currentJitter;
 */
