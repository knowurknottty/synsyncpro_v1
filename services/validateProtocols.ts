// services/validateProtocols.ts
// RVP-Enhanced Protocol Safety Validation Module for SynSync
// Updated: February 2, 2026

import { PROTOCOLS } from '../constants';
import { Protocol, Phase } from '../types';

export interface ProtocolIssue {
  protocolId: string;
  phaseId?: string;
  level: 'error' | 'warning';
  message: string;
}

// RVP-compliant severity levels
export type RvpSeverity = 1 | 2 | 3; // 1=info, 2=warning, 3=error

export type RvpIssueCode =
  | 'MISSING_EVIDENCE_METADATA'
  | 'MISSING_SAFETY_METADATA'
  | 'INVALID_PHASE_DURATION'
  | 'INVALID_PROTOCOL_DURATION'
  | 'BEAT_OUT_OF_RANGE'
  | 'BEAT_ABOVE_SAFE_MAX'
  | 'CARRIER_OUT_OF_RANGE'
  | 'SEIZURE_RISK_BAND'
  | 'EMPTY_PHASES'
  | 'LOW_EVIDENCE_LEVEL'
  | 'EXPERIMENTAL_GROUP'
  | 'MISSING_CITATION';

export interface RvpProtocolIssue extends ProtocolIssue {
  code?: RvpIssueCode;
  severity?: RvpSeverity;
}

export const SAFETY_LIMITS = {
  maxPhaseDuration: 60 * 60,      // 60 minutes per phase
  maxSessionDuration: 3 * 60 * 60, // 3 hours total
  maxBeatFrequency: 100,           // Hz absolute max (gamma)
  safeBeatFrequency: 50,           // Hz conservative safe max
  minBeatFrequency: 0.05,          // Hz minimum (allows autonomic entrainment: HRV, baroreflex)
  maxCarrierFrequency: 500,        // Hz - Oster curve optimal upper
  minCarrierFrequency: 100,        // Hz - Oster curve optimal lower
  seizureRiskRange: [8, 12] as [number, number], // Alpha band caution
  minGain: 0,                      // Minimum gain value
  maxGain: 1,                      // Maximum gain value
};

function validatePhase(
  protocol: Protocol,
  phase: Phase,
  phaseIndex: number
): RvpProtocolIssue[] {
  const issues: RvpProtocolIssue[] = [];
  const phaseId = `phase-${phaseIndex}`;

  const phaseDuration = phase.duration;

  // Duration validation
  if (phaseDuration <= 0) {
    issues.push({
      protocolId: protocol.id,
      phaseId,
      level: 'error',
      severity: 3,
      code: 'INVALID_PHASE_DURATION',
      message: `Phase ${phaseIndex} has non-positive duration: ${phaseDuration}s`,
    });
  }

  if (phaseDuration > SAFETY_LIMITS.maxPhaseDuration) {
    issues.push({
      protocolId: protocol.id,
      phaseId,
      level: 'warning',
      severity: 2,
      message: `Phase ${phaseIndex} duration (${phaseDuration}s) exceeds recommended max (${SAFETY_LIMITS.maxPhaseDuration}s)`,
    });
  }

  // Beat frequency validation - RVP enhanced
  const beat = phase.beat ?? phase.dbssFrequency?.primary;
  if (typeof beat === 'number') {
    // Absolute range check
    if (beat < SAFETY_LIMITS.minBeatFrequency || beat > SAFETY_LIMITS.maxBeatFrequency) {
      issues.push({
        protocolId: protocol.id,
        phaseId,
        level: 'error',
        severity: 3,
        code: 'BEAT_OUT_OF_RANGE',
        message: `Phase ${phaseIndex} beat ${beat} Hz is outside valid range [${SAFETY_LIMITS.minBeatFrequency}-${SAFETY_LIMITS.maxBeatFrequency} Hz]`,
      });
    }
    // Conservative safe max check
    else if (beat > SAFETY_LIMITS.safeBeatFrequency) {
      issues.push({
        protocolId: protocol.id,
        phaseId,
        level: 'warning',
        severity: 2,
        code: 'BEAT_ABOVE_SAFE_MAX',
        message: `Phase ${phaseIndex} beat ${beat} Hz exceeds conservative safe max (${SAFETY_LIMITS.safeBeatFrequency} Hz)`,
      });
    }

    // CRITICAL: Seizure-risk alpha band detection (8-12 Hz)
    const [riskMin, riskMax] = SAFETY_LIMITS.seizureRiskRange;
    if (beat >= riskMin && beat <= riskMax) {
      issues.push({
        protocolId: protocol.id,
        phaseId,
        level: 'warning',
        severity: 2,
        code: 'SEIZURE_RISK_BAND',
        message: `Phase ${phaseIndex} beat ${beat} Hz lies within seizure-caution alpha band [${riskMin}-${riskMax} Hz]. Consider user screening or amplitude attenuation.`,
      });
    }
  }

  // Carrier frequency validation - Oster curve optimal range [100-500 Hz]
  if (phase.carrier < SAFETY_LIMITS.minCarrierFrequency ||
      phase.carrier > SAFETY_LIMITS.maxCarrierFrequency) {
    issues.push({
      protocolId: protocol.id,
      phaseId,
      level: 'warning',
      severity: 2,
      code: 'CARRIER_OUT_OF_RANGE',
      message: `Phase ${phaseIndex} carrier ${phase.carrier} Hz is outside Oster optimal range [${SAFETY_LIMITS.minCarrierFrequency}-${SAFETY_LIMITS.maxCarrierFrequency} Hz]. Binaural beat perception may be compromised.`,
    });
  }

  // Additional DBSS frequency validation
  if (phase.dbssFrequency) {
    const beats = [phase.dbssFrequency.primary, phase.dbssFrequency.secondary];
    for (const b of beats) {
      if (b !== undefined && b > SAFETY_LIMITS.maxBeatFrequency) {
        issues.push({
          protocolId: protocol.id,
          phaseId,
          level: 'warning',
          message: `Beat frequency ${b}Hz exceeds maxBeatFrequency (${SAFETY_LIMITS.maxBeatFrequency}Hz)`,
        });
      }
    }
  }

  // Noise mix validation
  if (phase.noiseMix !== undefined && (phase.noiseMix < 0 || phase.noiseMix > 1)) {
    issues.push({
      protocolId: protocol.id,
      phaseId,
      level: 'error',
      severity: 3,
      message: `Phase ${phaseIndex} noiseMix ${phase.noiseMix} is outside valid range [0,1]`,
    });
  }

  // Volume validation
  if (phase.volL !== undefined && (phase.volL < 0 || phase.volL > 1)) {
    issues.push({
      protocolId: protocol.id,
      phaseId,
      level: 'error',
      severity: 3,
      message: `Phase ${phaseIndex} volL ${phase.volL} is outside valid range [0,1]`,
    });
  }

  if (phase.volR !== undefined && (phase.volR < 0 || phase.volR > 1)) {
    issues.push({
      protocolId: protocol.id,
      phaseId,
      level: 'error',
      severity: 3,
      message: `Phase ${phaseIndex} volR ${phase.volR} is outside valid range [0,1]`,
    });
  }

  // Isochronic duty cycle validation
  const dutyCycle = phase.entrainmentMode?.isochronic?.dutyCycle;
  if (dutyCycle !== undefined && (dutyCycle < 0.05 || dutyCycle > 0.95)) {
    issues.push({
      protocolId: protocol.id,
      phaseId,
      level: 'warning',
      message: `dutyCycle ${dutyCycle} is outside recommended range [0.05,0.95]`,
    });
  }

  // Overlay validation
  if (phase.harmonicOverlay && phase.harmonicOverlay.length > 0) {
    for (const overlay of phase.harmonicOverlay) {
      if (overlay.frequency < 0.1 || overlay.frequency > 2000) {
        issues.push({
          protocolId: protocol.id,
          phaseId,
          level: 'warning',
          message: `Overlay frequency ${overlay.frequency}Hz is outside typical range [0.1-2000Hz]`,
        });
      }
    }
  }

  return issues;
}

export function validateProtocols(protocols: Protocol[] | Record<string, Protocol> = PROTOCOLS): RvpProtocolIssue[] {
  const allIssues: RvpProtocolIssue[] = [];
  const protocolList = Array.isArray(protocols) ? protocols : Object.values(protocols);

  for (const protocol of protocolList) {
    // Validate phases exist
    if (!protocol.phases || protocol.phases.length === 0) {
      allIssues.push({
        protocolId: protocol.id,
        level: 'error',
        severity: 3,
        code: 'EMPTY_PHASES',
        message: `Protocol ${protocol.id} has no phases defined`,
      });
      continue;
    }

    // Calculate total duration with tolerance (5% or 5s min, capped at 30s)
    const totalDuration = protocol.phases.reduce((acc, p) => acc + (p.duration || 0), 0);
    const tolerance = Math.min(Math.max(5, protocol.duration * 0.05), 30);
    const durationDiff = Math.abs(totalDuration - protocol.duration);

    if (durationDiff > tolerance) {
      allIssues.push({
        protocolId: protocol.id,
        level: 'warning',
        severity: 2,
        code: 'INVALID_PROTOCOL_DURATION',
        message: `Protocol ${protocol.id} total phase duration (${totalDuration}s) differs from declared duration (${protocol.duration}s) by ${durationDiff.toFixed(1)}s (tolerance: ${tolerance}s)`,
      });
    }

    // Check total session duration
    if (totalDuration > SAFETY_LIMITS.maxSessionDuration) {
      allIssues.push({
        protocolId: protocol.id,
        level: 'warning',
        severity: 2,
        message: `Protocol ${protocol.id} total duration (${totalDuration}s) exceeds max session (${SAFETY_LIMITS.maxSessionDuration}s)`,
      });
    }

    // RVP: Enforce evidence metadata presence
    if (!protocol.evidenceLevel || !protocol.evidenceGrade) {
      allIssues.push({
        protocolId: protocol.id,
        level: 'warning',
        severity: 2,
        code: 'MISSING_EVIDENCE_METADATA',
        message: `Protocol ${protocol.id} is missing evidenceLevel and/or evidenceGrade (required for production)`,
      });
    }

    const isCalibrationProtocol = protocol.category === 'calibration'
      || protocol.tags?.includes('calibration')
      || protocol.id === 'stereo_verify_test';
    if (!isCalibrationProtocol && !protocol.citation) {
      allIssues.push({
        protocolId: protocol.id,
        level: 'warning',
        severity: 2,
        code: 'MISSING_CITATION',
        message: `Protocol ${protocol.id} is missing a citation string; evidence level alone is not enough for claim audit.`,
      });
    }

    // RVP: Enforce safety metadata presence
    if (!protocol.contraindications || protocol.contraindications.length === 0 ||
        !protocol.contraindicationsSeverity) {
      allIssues.push({
        protocolId: protocol.id,
        level: 'warning',
        severity: 2,
        code: 'MISSING_SAFETY_METADATA',
        message: `Protocol ${protocol.id} is missing contraindications and/or contraindicationsSeverity`,
      });
    }

    // Flag low evidence levels
    const evidenceLevel = protocol.evidenceLevel;
    if (evidenceLevel === 'IV' || evidenceLevel === 'V') {
      allIssues.push({
        protocolId: protocol.id,
        level: 'warning',
        severity: 2,
        code: 'LOW_EVIDENCE_LEVEL',
        message: `Protocol ${protocol.id} has low evidence level: ${evidenceLevel}`,
      });
    }

    // Flag experimental protocols
    if (protocol.tags?.includes('experimental') || protocol.tags?.includes('psi_experimental')) {
      allIssues.push({
        protocolId: protocol.id,
        level: 'warning',
        severity: 1,
        code: 'EXPERIMENTAL_GROUP',
        message: `Protocol ${protocol.id} is marked as experimental - use with caution`,
      });
    }

    // Check experimental categories
    if (protocol.category === 'speculative' || protocol.category === 'research') {
      allIssues.push({
        protocolId: protocol.id,
        level: 'warning',
        message: 'Protocol is marked as experimental/research - use with caution',
      });
    }

    // Validate each phase
    protocol.phases.forEach((phase, index) => {
      allIssues.push(...validatePhase(protocol, phase, index));
    });
  }

  return allIssues;
}
