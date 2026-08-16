/**
 * FIX #2: Adaptive Crossfade Duration
 * 
 * PROBLEM: Global crossfade is 1.5s for all protocols. At 0.5Hz delta,
 * 1.5s = 0.75 cycles — the brain perceives a disruption mid-oscillation
 * at the phase boundary. For sub-1Hz protocols (deep sleep, pain relief,
 * delta maintenance), this can break entrainment lock.
 * 
 * SOLUTION: Crossfade duration should be a function of the current beat
 * frequency, ensuring at least 2 full cycles of the SLOWER frequency
 * (either outgoing or incoming) are covered by the crossfade.
 * 
 * For fast frequencies (>10Hz), shorter crossfades are fine (1-2s).
 * For slow frequencies (<2Hz), crossfades need 4-8s minimum.
 */

// ============================================================
// ADAPTIVE CROSSFADE CALCULATOR
// ============================================================

export interface CrossfadeConfig {
  duration: number;       // Calculated crossfade duration in seconds
  curve: 'linear' | 'equalPower' | 'sigmoid';  // Crossfade shape
  minCycles: number;      // Minimum cycles covered
}

/**
 * Calculate optimal crossfade duration for a phase transition.
 * 
 * @param outgoingBeat - Beat frequency of the ending phase (Hz)
 * @param incomingBeat - Beat frequency of the starting phase (Hz)
 * @param overrideDuration - Manual override from Phase Builder .crossfade()
 * @returns CrossfadeConfig with calculated duration
 */
export function calculateAdaptiveCrossfade(
  outgoingBeat: number,
  incomingBeat: number,
  overrideDuration?: number
): CrossfadeConfig {
  // If Phase Builder explicitly set crossfade, respect it
  // (allows protocols like sleep to set crossfade(0) for fade-to-silence)
  if (overrideDuration !== undefined && overrideDuration >= 0) {
    return {
      duration: overrideDuration,
      curve: overrideDuration === 0 ? 'linear' : 'equalPower',
      minCycles: 0,
    };
  }

  // Use the slower of the two frequencies as the reference
  // (the slower frequency needs more time to complete cycles)
  const slowestBeat = Math.min(
    Math.abs(outgoingBeat) || 0.1,
    Math.abs(incomingBeat) || 0.1
  );

  const MIN_CYCLES = 2;       // Minimum full cycles during crossfade
  const MIN_DURATION = 1.0;   // Never less than 1 second
  const MAX_DURATION = 10.0;  // Cap to prevent extremely long transitions

  // Calculate duration needed for MIN_CYCLES at the slowest frequency
  const cycleDuration = 1 / slowestBeat;
  let duration = cycleDuration * MIN_CYCLES;

  // Clamp to reasonable range
  duration = Math.max(MIN_DURATION, Math.min(MAX_DURATION, duration));

  // Select crossfade curve based on frequency range
  let curve: 'linear' | 'equalPower' | 'sigmoid';
  if (slowestBeat < 1) {
    // Sub-1Hz: Use sigmoid for the smoothest perceptual transition
    // Sigmoid avoids the "dip" in perceived volume that equal-power
    // crossfades can create at very slow modulation rates
    curve = 'sigmoid';
  } else if (slowestBeat < 8) {
    // 1-8Hz: Equal power crossfade maintains perceived loudness
    curve = 'equalPower';
  } else {
    // >8Hz: Linear is fine, transitions are fast enough
    curve = 'linear';
  }

  return {
    duration,
    curve,
    minCycles: MIN_CYCLES,
  };
}

/**
 * Frequency-specific reference table for verification:
 * 
 * Beat Freq | Cycle Period | Crossfade Duration | Curve
 * ---------|-------------|-------------------|------
 * 0.25 Hz  | 4.0s        | 8.0s              | sigmoid
 * 0.5 Hz   | 2.0s        | 4.0s              | sigmoid
 * 1.0 Hz   | 1.0s        | 2.0s              | equalPower
 * 2.0 Hz   | 0.5s        | 1.0s (min)        | equalPower
 * 3.0 Hz   | 0.33s       | 1.0s (min)        | equalPower
 * 5.0 Hz   | 0.2s        | 1.0s (min)        | equalPower
 * 7.0 Hz   | 0.14s       | 1.0s (min)        | equalPower
 * 10.0 Hz  | 0.1s        | 1.0s (min)        | linear
 * 40.0 Hz  | 0.025s      | 1.0s (min)        | linear
 */

// ============================================================
// CROSSFADE GAIN CURVES
// ============================================================

/**
 * Generate gain values for crossfade at a given progress point.
 * 
 * @param progress - 0.0 (start) to 1.0 (end) of crossfade
 * @param curve - Crossfade curve type
 * @returns { fadeOut, fadeIn } gain values [0-1]
 */
export function crossfadeGains(
  progress: number,
  curve: 'linear' | 'equalPower' | 'sigmoid'
): { fadeOut: number; fadeIn: number } {
  const p = Math.max(0, Math.min(1, progress));

  switch (curve) {
    case 'linear':
      return {
        fadeOut: 1 - p,
        fadeIn: p,
      };

    case 'equalPower':
      // Equal-power crossfade: sum of squares = 1
      // Maintains constant perceived loudness through transition
      return {
        fadeOut: Math.cos(p * Math.PI * 0.5),
        fadeIn: Math.sin(p * Math.PI * 0.5),
      };

    case 'sigmoid':
      // Sigmoid crossfade: ultra-smooth S-curve
      // Best for very slow frequencies where any volume dip is perceptible
      const sigmoidOut = 1 / (1 + Math.exp(10 * (p - 0.5)));
      const sigmoidIn = 1 / (1 + Math.exp(-10 * (p - 0.5)));
      return {
        fadeOut: sigmoidOut,
        fadeIn: sigmoidIn,
      };

    default:
      return { fadeOut: 1 - p, fadeIn: p };
  }
}

// ============================================================
// INTEGRATION INTO PHASE TRANSITION LOGIC
// ============================================================
/**
 * HOW TO INTEGRATE:
 * 
 * In the phase transition logic (where phaseIndex increments),
 * replace the hardcoded crossfade with:
 * 
 *   const outgoingBeat = currentPhase.beat ?? currentPhase.endBeat ?? 0;
 *   const incomingBeat = nextPhase.beat ?? nextPhase.startBeat ?? 0;
 *   const override = currentPhase.crossfadeDuration; // from Phase Builder
 *   
 *   const xfade = calculateAdaptiveCrossfade(
 *     outgoingBeat, incomingBeat, override
 *   );
 *   
 *   // Use xfade.duration for the transition time
 *   // Use crossfadeGains(progress, xfade.curve) for gain scheduling
 * 
 * The Phase Builder .crossfade() method still works as override.
 * Protocols that explicitly set crossfade(0) (sleep endings) are respected.
 */
