// utils/photicSafety.ts
// Safety model for visual (photic) entrainment. 40 Hz light flicker is the
// most safety-critical feature in the app: it is the GENUS-style gamma
// stimulation (Iaccarino et al., Nature 2016; Martorell et al., Cell 2019),
// and it is exactly what photosensitive-epilepsy guidelines exist to gate.
//
// Two principles drive every constant here:
//   1. Malformed 40 Hz is more dangerous than well-formed 40 Hz. On a display
//      that is not an integer multiple of the target rate, the flicker
//      aliases into lower bands — and 15–25 Hz is the PEAK provocation band.
//      Therefore we refuse to emit flicker unless the display can represent
//      it cleanly.
//   2. Conservative by default. This is not the high-intensity LED apparatus
//      used in the research; luminance and contrast are bounded well below a
//      "flash" as defined by the Harding/ITU photosensitivity guidelines,
//      with a soft onset ramp and a hard, always-visible abort.

/** Target gamma frequency for Alzheimer's / GENUS protocols. */
export const GAMMA_TARGET_HZ = 40;

/** A display refresh rate is "compatible" if it is an integer multiple of the
 *  flicker frequency within this fractional tolerance. 120 Hz → 3×, 240 Hz →
 *  6×. 60 Hz is NOT (60/40 = 1.5) and is rejected. */
export const REFRESH_MULTIPLE_TOLERANCE = 0.02;

/** Luminance / contrast caps. We never flash to pure white or use saturated
 *  red (the most provocative hue). The bright state is a warm off-white at a
 *  capped intensity; the dark state is a near-black gray, not pure black, so
 *  the luminance delta stays bounded. */
export const PHOTIC_LIMITS = {
  /** Maximum user-selectable intensity (0–1 of the warm-white bright state). */
  maxIntensity: 0.8,
  /** Default intensity — deliberately gentle. */
  defaultIntensity: 0.5,
  /** Bright-state color (warm white; avoids blue harshness and red provocation). */
  brightRGB: [255, 244, 224] as const,
  /** Dark-state color (near-black, not pure black — bounds the luminance delta). */
  darkRGB: [10, 10, 12] as const,
  /** Onset ramp: intensity climbs from 0 to target over this many seconds. */
  onsetRampSeconds: 4,
  /** Soft-edged field: fraction of the viewport radius used as a falloff so the
   *  flash is not a hard full-field edge. */
  edgeFalloff: 0.35,
  /** Duty cycle of the on-phase within each flicker period. 0.5 = symmetric. */
  dutyCycle: 0.5,
} as const;

export type RefreshCompatibility =
  | { ok: true; refreshHz: number; framesPerCycle: number; onFrames: number }
  | { ok: false; refreshHz: number; reason: string };

/**
 * Determines whether a measured refresh rate can cleanly represent the target
 * flicker, and if so the integer frame schedule (identical every cycle, so
 * there is no per-cycle jitter once locked to vsync).
 */
export function evaluateRefreshCompatibility(
  refreshHz: number,
  targetHz: number = GAMMA_TARGET_HZ,
  dutyCycle: number = PHOTIC_LIMITS.dutyCycle,
): RefreshCompatibility {
  if (!Number.isFinite(refreshHz) || refreshHz <= 0) {
    return { ok: false, refreshHz, reason: 'Could not measure display refresh rate.' };
  }

  const ratio = refreshHz / targetHz;
  const nearestMultiple = Math.round(ratio);

  if (nearestMultiple < 2) {
    return {
      ok: false,
      refreshHz,
      reason:
        `This display refreshes at ~${Math.round(refreshHz)} Hz, which cannot show ` +
        `${targetHz} Hz flicker cleanly (it needs at least ${targetHz * 2} Hz). ` +
        `Forcing it would produce a malformed, lower-frequency flicker in the ` +
        `most seizure-provocative range. Visual flicker is disabled — audio ` +
        `entrainment runs unaffected.`,
    };
  }

  const error = Math.abs(ratio - nearestMultiple) / nearestMultiple;
  if (error > REFRESH_MULTIPLE_TOLERANCE) {
    return {
      ok: false,
      refreshHz,
      reason:
        `This display (~${Math.round(refreshHz)} Hz) is not an integer multiple ` +
        `of ${targetHz} Hz, so flicker would drift and alias. Visual flicker is ` +
        `disabled — audio entrainment runs unaffected.`,
    };
  }

  const framesPerCycle = nearestMultiple;
  const onFrames = Math.max(1, Math.min(framesPerCycle - 1, Math.round(framesPerCycle * dutyCycle)));
  return { ok: true, refreshHz, framesPerCycle, onFrames };
}

/**
 * Protocols that carry a 40 Hz gamma component and are therefore eligible for
 * synchronized photic stimulation. Visual flicker is OFF by default for all of
 * them and only available after passing photosensitivity screening.
 */
export const GAMMA_PHOTIC_PROTOCOL_IDS = new Set<string>([
  'mgs_40',                 // canonical GENUS-style multimodal gamma
  'flow_4_flow',
  'gamma_v4_flow_state_insight',
  'transcendental_gamma',
  'cellular_cleansing',
  'cellular_regeneration',
]);

export function protocolSupportsPhotic(protocolId: string | undefined | null): boolean {
  return !!protocolId && GAMMA_PHOTIC_PROTOCOL_IDS.has(protocolId);
}

/** Tolerance for treating the live beat frequency as "in the gamma band". */
export function isGammaBeat(beatHz: number, targetHz: number = GAMMA_TARGET_HZ): boolean {
  return Math.abs(beatHz - targetHz) <= 1.5;
}

export function rgbString(rgb: readonly [number, number, number], scale = 1): string {
  const [r, g, b] = rgb;
  return `rgb(${Math.round(r * scale)}, ${Math.round(g * scale)}, ${Math.round(b * scale)})`;
}
