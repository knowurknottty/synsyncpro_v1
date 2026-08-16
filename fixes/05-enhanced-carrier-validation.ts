/**
 * FIX #5: Enhanced Carrier Frequency Validation
 * 
 * PROBLEM: validateCarrierFrequency() exists but doesn't warn about
 * binaural beat effectiveness degradation above ~500Hz. The auditory
 * system can't resolve interaural timing differences at high frequencies
 * (Moore, 2012; Licklider et al., 1950), so binaural entrainment
 * effectiveness drops sharply above 500Hz carrier. Current highest
 * carrier is 528Hz (Heart-Brain) which is borderline. Future protocols
 * or community contributions could push higher without realizing the
 * entrainment mechanism breaks down.
 * 
 * SOLUTION: Enhanced validation that:
 * 1. Hard-clamps to safe range (20-1500Hz)
 * 2. Warns when binaural mode uses carriers >500Hz
 * 3. Auto-suggests switching to monaural/isochronic for high carriers
 * 4. Logs frequency response limitations for transparency
 */

// ============================================================
// ENHANCED CARRIER VALIDATION
// ============================================================

export interface CarrierValidationResult {
  frequency: number;              // Validated (possibly clamped) frequency
  warnings: CarrierWarning[];     // Any applicable warnings
  binauralEffective: boolean;     // Whether binaural will work well at this freq
  recommendedModes: string[];     // Best entrainment modes for this carrier
}

export interface CarrierWarning {
  level: 'info' | 'warning' | 'critical';
  code: string;
  message: string;
}

/**
 * Frequency thresholds based on auditory neuroscience research.
 */
const CARRIER_THRESHOLDS = {
  // Absolute minimum — below this, carrier itself becomes subaudible
  MIN_AUDIBLE: 20,
  
  // Below this, carrier interferes with beat frequency perception
  MIN_PRACTICAL: 80,
  
  // Optimal range for binaural beats (Oster, 1973; Licklider et al., 1950)
  BINAURAL_OPTIMAL_LOW: 100,
  BINAURAL_OPTIMAL_HIGH: 500,
  
  // Above this, interaural timing differences become unreliable
  // Phase-locking in auditory nerve degrades above ~1000Hz
  BINAURAL_DEGRADED: 500,
  
  // Above this, binaural perception essentially fails
  BINAURAL_CEILING: 1000,
  
  // Absolute maximum — beyond audible range / aliasing concerns
  MAX_SAFE: 1500,
};

/**
 * Validate carrier frequency with context-aware warnings.
 * 
 * @param frequency - Requested carrier frequency in Hz
 * @param entrainmentMode - Current entrainment configuration
 * @param protocolId - For logging/debugging
 * @returns CarrierValidationResult with warnings
 */
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
  const isochronicEnabled = entrainmentMode?.isochronic?.enabled ?? false;
  const monauralEnabled = entrainmentMode?.monaural?.enabled ?? false;

  // Hard clamp to safe range
  if (freq < CARRIER_THRESHOLDS.MIN_AUDIBLE) {
    freq = CARRIER_THRESHOLDS.MIN_AUDIBLE;
    warnings.push({
      level: 'critical',
      code: 'CARRIER_BELOW_AUDIBLE',
      message: `Carrier ${frequency}Hz below audible range, clamped to ${freq}Hz`,
    });
  }

  if (freq > CARRIER_THRESHOLDS.MAX_SAFE) {
    freq = CARRIER_THRESHOLDS.MAX_SAFE;
    warnings.push({
      level: 'critical',
      code: 'CARRIER_ABOVE_SAFE',
      message: `Carrier ${frequency}Hz exceeds safe maximum, clamped to ${freq}Hz`,
    });
  }

  // Practical minimum warning
  if (freq < CARRIER_THRESHOLDS.MIN_PRACTICAL && freq >= CARRIER_THRESHOLDS.MIN_AUDIBLE) {
    warnings.push({
      level: 'warning',
      code: 'CARRIER_VERY_LOW',
      message: `Carrier ${freq}Hz is very low — beat frequency may be difficult to perceive separately from carrier`,
    });
  }

  // Binaural-specific validation
  let binauralEffective = true;
  if (binauralEnabled) {
    if (freq > CARRIER_THRESHOLDS.BINAURAL_CEILING) {
      binauralEffective = false;
      warnings.push({
        level: 'critical',
        code: 'BINAURAL_INEFFECTIVE',
        message: `Carrier ${freq}Hz exceeds binaural ceiling (${CARRIER_THRESHOLDS.BINAURAL_CEILING}Hz). Auditory system cannot resolve interaural timing differences at this frequency. Binaural entrainment will NOT work. Switch to isochronic or monaural.`,
      });
    } else if (freq > CARRIER_THRESHOLDS.BINAURAL_DEGRADED) {
      binauralEffective = false; // degraded but not failed
      warnings.push({
        level: 'warning',
        code: 'BINAURAL_DEGRADED',
        message: `Carrier ${freq}Hz above optimal binaural range (${CARRIER_THRESHOLDS.BINAURAL_OPTIMAL_HIGH}Hz). Entrainment strength reduced. Consider enabling isochronic/monaural as primary mode.`,
      });
    }
  }

  // Recommend best modes for this carrier
  const recommendedModes: string[] = [];
  if (freq <= CARRIER_THRESHOLDS.BINAURAL_OPTIMAL_HIGH) {
    recommendedModes.push('binaural');
  }
  // Isochronic and monaural work at any carrier frequency
  recommendedModes.push('isochronic', 'monaural');

  // Log for debugging if protocol specified
  if (warnings.length > 0 && protocolId) {
    console.warn(
      `[CarrierValidation] Protocol "${protocolId}":`,
      warnings.map(w => w.message).join('; ')
    );
  }

  return {
    frequency: freq,
    warnings,
    binauralEffective,
    recommendedModes,
  };
}

// ============================================================
// BEAT FREQUENCY VALIDATION ENHANCEMENT
// ============================================================

/**
 * Enhanced beat frequency validation.
 * Adds Oster curve awareness — binaural beats are most effective
 * when beat frequency is 1-30Hz (Oster, 1973).
 * Above 30Hz, the beat is perceived as "roughness" not a distinct tone.
 */
export function validateBeatFrequencyEnhanced(
  beatFreq: number,
  carrier: number,
  context: string = ''
): { frequency: number; warnings: CarrierWarning[] } {
  const warnings: CarrierWarning[] = [];
  let freq = Math.abs(beatFreq);

  // Beat frequency should not exceed carrier / 4
  // (otherwise sidebands overlap and create artifacts)
  const maxBeat = carrier / 4;
  if (freq > maxBeat) {
    warnings.push({
      level: 'warning',
      code: 'BEAT_EXCEEDS_CARRIER_RATIO',
      message: `Beat ${freq}Hz exceeds carrier/4 ratio (${maxBeat}Hz) — sideband artifacts likely`,
    });
  }

  // Gamma range (30-100Hz) beats: warn about roughness perception
  if (freq > 30 && freq <= 100) {
    warnings.push({
      level: 'info',
      code: 'BEAT_ROUGHNESS_RANGE',
      message: `Beat ${freq}Hz in roughness perception range (30-100Hz). Isochronic/monaural delivery recommended over pure binaural.`,
    });
  }

  // Above 100Hz: not a meaningful entrainment frequency
  if (freq > 100) {
    freq = 100;
    warnings.push({
      level: 'critical',
      code: 'BEAT_ABOVE_ENTRAINMENT_RANGE',
      message: `Beat ${beatFreq}Hz exceeds entrainment range, clamped to 100Hz`,
    });
  }

  return { frequency: freq, warnings };
}

// ============================================================
// INTEGRATION
// ============================================================
/**
 * Replace existing validateCarrierFrequency() calls with:
 * 
 *   const validation = validateCarrierFrequencyEnhanced(
 *     phase.carrier,
 *     phase.entrainmentMode,
 *     protocol.id
 *   );
 *   const safeCarrier = validation.frequency;
 *   
 *   // Optionally display warnings in DSP telemetry panel
 *   if (validation.warnings.length > 0) {
 *     this.onWarning?.(validation.warnings);
 *   }
 */
