/**
 * FIX #2: Adaptive Crossfade Duration
 * =====================================
 * Replaces hardcoded 1.5s crossfade with frequency-adaptive duration
 * ensuring at least 2 full cycles of the slower frequency are covered.
 *
 * @version 2.0.0
 */

export interface CrossfadeConfig {
  duration: number;
  curve: 'linear' | 'equalPower' | 'sigmoid';
  minCycles: number;
}

export function calculateAdaptiveCrossfade(
  outgoingBeat: number,
  incomingBeat: number,
  overrideDuration?: number
): CrossfadeConfig {
  if (overrideDuration !== undefined && overrideDuration >= 0) {
    return {
      duration: overrideDuration,
      curve: overrideDuration === 0 ? 'linear' : 'equalPower',
      minCycles: 0,
    };
  }

  const slowestBeat = Math.min(
    Math.abs(outgoingBeat) || 0.1,
    Math.abs(incomingBeat) || 0.1
  );

  const MIN_CYCLES = 2;
  const MIN_DURATION = 1.0;
  const MAX_DURATION = 10.0;

  const cycleDuration = 1 / slowestBeat;
  let duration = Math.max(MIN_DURATION, Math.min(MAX_DURATION, cycleDuration * MIN_CYCLES));

  let curve: CrossfadeConfig['curve'];
  if (slowestBeat < 1) {
    curve = 'sigmoid';
  } else if (slowestBeat < 8) {
    curve = 'equalPower';
  } else {
    curve = 'linear';
  }

  return { duration, curve, minCycles: MIN_CYCLES };
}

export function crossfadeGains(
  progress: number,
  curve: CrossfadeConfig['curve']
): { fadeOut: number; fadeIn: number } {
  const p = Math.max(0, Math.min(1, progress));

  switch (curve) {
    case 'linear':
      return { fadeOut: 1 - p, fadeIn: p };

    case 'equalPower':
      return {
        fadeOut: Math.cos(p * Math.PI * 0.5),
        fadeIn: Math.sin(p * Math.PI * 0.5),
      };

    case 'sigmoid': {
      const fadeOut = 1 / (1 + Math.exp(10 * (p - 0.5)));
      const fadeIn = 1 / (1 + Math.exp(-10 * (p - 0.5)));
      return { fadeOut, fadeIn };
    }

    default:
      return { fadeOut: 1 - p, fadeIn: p };
  }
}
