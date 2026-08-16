// services/ProtocolSafety.ts
import { Protocol } from '../types.ts';

export type FrequencyBandRisk = 'none' | 'low' | 'moderate' | 'high';

export interface ProtocolSafetyProfile {
  id: string;
  name: string;
  overallRisk: 'low' | 'moderate' | 'high';
  photosensitivityRisk: FrequencyBandRisk;
  gamma40Hz: boolean;
  has3to30Hz: boolean;
  has10to25Hz: boolean;
  hasDeltaSub4Hz: boolean;
  hasInfraslowSub1Hz: boolean;
  contraindicationsSeverity: Protocol['contraindicationsSeverity'] | undefined;
  contraindications: readonly string[];
  tags: string[];
  summary: string;
}

/**
 * Classify a protocol into a safety profile suitable for gating UI.
 * This is a policy layer, not a clinical diagnostic.
 */
export function classifyProtocolSafety(protocol: Protocol): ProtocolSafetyProfile {
  const phases: any[] = protocol.phases || [];

  let has3to30Hz = false;
  let has10to25Hz = false;
  let hasDeltaSub4Hz = false;
  let hasInfraslowSub1Hz = false;
  let gamma40Hz = false;

  for (const p of phases) {
    const beats: number[] = [];

    if (typeof p.beat === 'number') beats.push(p.beat);
    if (typeof p.beatEnd === 'number') beats.push(p.beatEnd);

    for (const b of beats) {
      if (b >= 3 && b <= 30) has3to30Hz = true;
      if (b >= 10 && b <= 25) has10to25Hz = true;
      if (b > 0 && b < 4) hasDeltaSub4Hz = true;
      if (b > 0 && b < 1) hasInfraslowSub1Hz = true;
      if (Math.abs(b - 40) < 0.5) gamma40Hz = true;
    }
  }

  let photosensitivityRisk: FrequencyBandRisk = 'none';
  if (has3to30Hz) photosensitivityRisk = 'low';
  if (has10to25Hz) photosensitivityRisk = 'moderate';
  if (gamma40Hz && has10to25Hz) photosensitivityRisk = 'high';

  const tags: string[] = [];

  if (gamma40Hz) tags.push('gamma_40hz');
  if (has10to25Hz) tags.push('alpha_beta_high_risk_band');
  if (hasDeltaSub4Hz) tags.push('delta_sleep_or_trauma');
  if (hasInfraslowSub1Hz) tags.push('infraslow_autonomic');

  switch (protocol.id) {
    case 'cognitive_boost_40hz':
      tags.push('gamma_40hz_cognitive');
      break;
    case 'deep_sleep_delta':
      tags.push('deep_sleep_longform');
      break;
    case 'anxiety_relief_v4':
      tags.push('alpha_theta_anxiety');
      break;
    case 'trauma_release':
    case 'ptsd_stabilization':
      tags.push('trauma_work');
      break;
    case 'transcendental_gamma':
      tags.push('gamma_40hz_meditation');
      break;
    default:
      break;
  }

  let overall: 'low' | 'moderate' | 'high' = 'low';
  const severity = protocol.contraindicationsSeverity;

  if (severity === 'severe' || photosensitivityRisk === 'high') {
    overall = 'high';
  } else if (
    severity === 'moderate' ||
    photosensitivityRisk === 'moderate' ||
    (gamma40Hz && has3to30Hz)
  ) {
    overall = 'moderate';
  }

  let summary = 'Standard-intensity entrainment protocol.';
  if (tags.includes('gamma_40hz_cognitive')) {
    summary = 'High-intensity 40 Hz gamma cognitive protocol with alpha foundation.';
  } else if (tags.includes('deep_sleep_longform')) {
    summary = 'Long-form delta sleep protocol with infraslow components for N3 maintenance.';
  } else if (tags.includes('alpha_theta_anxiety')) {
    summary = 'Alpha-theta descent protocol targeted at acute anxiety and autonomic down-shift.';
  } else if (tags.includes('trauma_work')) {
    summary = 'Deep limbic/trauma-oriented protocol with slow-wave and infraslow elements.';
  } else if (tags.includes('gamma_40hz_meditation')) {
    summary = 'Advanced 40 Hz gamma meditation protocol emulating expert contemplative states.';
  }

  return {
    id: protocol.id,
    name: protocol.title,
    overallRisk: overall,
    photosensitivityRisk,
    gamma40Hz,
    has3to30Hz,
    has10to25Hz,
    hasDeltaSub4Hz,
    hasInfraslowSub1Hz,
    contraindicationsSeverity: severity,
    contraindications: protocol.contraindications || ([] as string[]),
    tags,
    summary,
  };
}
