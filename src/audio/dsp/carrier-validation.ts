/**
 * FIX #5: Enhanced Carrier Frequency Validation
 * ===============================================
 * Warns about binaural beat degradation above ~500Hz.
 * Auto-suggests isochronic/monaural for high carriers.
 *
 * @version 2.0.0
 */

export interface CarrierWarning {
  level: 'info' | 'warning' | 'critical';
  code: string;
  message: string;
}

export interface CarrierValidationResult {
  frequency: number;
  warnings: CarrierWarning[];
  binauralEffective: boolean;
  recommendedModes: string[];
}

const CARRIER_THRESHOLDS = {
  MIN_AUDIBLE: 20,
  MIN_PRACTICAL: 80,
  BINAURAL_OPTIMAL_LOW: 100,
  BINAURAL_OPTIMAL_HIGH: 500,
  BINAURAL_DEGRADED: 500,
  BINAURAL_CEILING: 1000,
  MAX_SAFE: 1500,
};

export function validateCarrierFrequencyEnhanced(
  frequency: number,
  entrainmentMode?: {
    binaural?: { enabled: boolean };
    isochronic?: { enabled: boolean };
    monaural?: { enabled: boolean };
  },
  protocolId?: string
): CarrierValidationResult {
  const warnings: CarrierWarning[] = [];
  let freq = frequency;
  const binauralEnabled = entrainmentMode?.binaural?.enabled ?? true;

  if (freq < CARRIER_THRESHOLDS.MIN_AUDIBLE) {
    freq = CARRIER_THRESHOLDS.MIN_AUDIBLE;
    warnings.push({ level: 'critical', code: 'CARRIER_BELOW_AUDIBLE', message: `Carrier ${frequency}Hz below audible range, clamped to ${freq}Hz` });
  }
  if (freq > CARRIER_THRESHOLDS.MAX_SAFE) {
    freq = CARRIER_THRESHOLDS.MAX_SAFE;
    warnings.push({ level: 'critical', code: 'CARRIER_ABOVE_SAFE', message: `Carrier ${frequency}Hz exceeds safe maximum, clamped to ${freq}Hz` });
  }
  if (freq < CARRIER_THRESHOLDS.MIN_PRACTICAL && freq >= CARRIER_THRESHOLDS.MIN_AUDIBLE) {
    warnings.push({ level: 'warning', code: 'CARRIER_VERY_LOW', message: `Carrier ${freq}Hz is very low — beat may be difficult to perceive` });
  }

  let binauralEffective = true;
  if (binauralEnabled) {
    if (freq > CARRIER_THRESHOLDS.BINAURAL_CEILING) {
      binauralEffective = false;
      warnings.push({ level: 'critical', code: 'BINAURAL_INEFFECTIVE', message: `Carrier ${freq}Hz exceeds binaural ceiling. Switch to isochronic or monaural.` });
    } else if (freq > CARRIER_THRESHOLDS.BINAURAL_DEGRADED) {
      binauralEffective = false;
      warnings.push({ level: 'warning', code: 'BINAURAL_DEGRADED', message: `Carrier ${freq}Hz above optimal binaural range. Consider isochronic/monaural.` });
    }
  }

  const recommendedModes: string[] = [];
  if (freq <= CARRIER_THRESHOLDS.BINAURAL_OPTIMAL_HIGH) recommendedModes.push('binaural');
  recommendedModes.push('isochronic', 'monaural');

  if (warnings.length > 0 && protocolId) {
    console.warn(`[CarrierValidation] Protocol "${protocolId}":`, warnings.map(w => w.message).join('; '));
  }

  return { frequency: freq, warnings, binauralEffective, recommendedModes };
}

export function validateBeatFrequencyEnhanced(
  beatFreq: number,
  carrier: number,
): { frequency: number; warnings: CarrierWarning[] } {
  const warnings: CarrierWarning[] = [];
  let freq = Math.abs(beatFreq);

  const maxBeat = carrier / 4;
  if (freq > maxBeat) {
    warnings.push({ level: 'warning', code: 'BEAT_EXCEEDS_CARRIER_RATIO', message: `Beat ${freq}Hz exceeds carrier/4 ratio (${maxBeat}Hz)` });
  }
  if (freq > 30 && freq <= 100) {
    warnings.push({ level: 'info', code: 'BEAT_ROUGHNESS_RANGE', message: `Beat ${freq}Hz in roughness range. Isochronic/monaural recommended.` });
  }
  if (freq > 100) {
    freq = 100;
    warnings.push({ level: 'critical', code: 'BEAT_ABOVE_ENTRAINMENT_RANGE', message: `Beat ${beatFreq}Hz exceeds range, clamped to 100Hz` });
  }

  return { frequency: freq, warnings };
}
