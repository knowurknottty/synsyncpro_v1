
// src/audio/constants.ts
// SynSync Protocol Library – normalized loader
// Uses new DSP spec system exclusively (all legacy protocols migrated)

import {
  Protocol,
  Phase,
  SOLFEGGIO,
  SCHUMANN_BASE,
  SCHUMANN_HARMONICS,
} from '../../types';

import { ALL_SPECS } from '../protocols/specs/index';
import { adaptAllSpecs } from './specAdapter';

// ---------- Raw types matching your spec files ----------

type RawPhase = {
  duration: number;
  beat?: number;
  startBeat?: number;
  endBeat?: number;
  carrier?: number;
  noise?: Phase['noise'];
  noiseMix?: number;
  progressionCurve?: Phase['progressionCurve'];
  progressionVariability?: number;
  spatialMotion?: Phase['spatialMotion'];
  overlays?: readonly (number | typeof SCHUMANN_BASE | (typeof SOLFEGGIO)[keyof typeof SOLFEGGIO])[];
  overlayMix?: number;
  harmonicStacking?: boolean;
  stochastic?: boolean;
  isochronic?: boolean;
  splitHemisphere?: Phase['splitHemisphere'];
  dbssFrequency?: Phase['dbssFrequency'];
  entrainmentMode?: Phase['entrainmentMode'];
};

type RawProtocol = {
  id: string;
  title: string;
  description: string;
  evidenceLevel: Protocol['evidenceLevel'];
  citation?: string;
  category: Protocol['category'];
  section: Protocol['section'];
  duration: number;
  contraindications?: readonly string[];
  algoDesc?: string;
  usageGoal?: string;
  researchContext?: string;
  phases: readonly RawPhase[];
  breathwork?: Protocol['breathwork'];
  mantra?: Protocol['mantra'];
  evidenceGrade?: Protocol['evidenceGrade'];
  mechanismOfAction?: string;
  contraindicationsSeverity?: Protocol['contraindicationsSeverity'];
  expectedOnset?: number;
  cumulativeEffect?: boolean;
  requiredSessions?: number;
  optimalTimeOfDay?: Protocol['optimalTimeOfDay'];
};

// ---------- Phase normalizer ----------

function normalizePhase(raw: RawPhase): Phase {
  const {
    duration,
    beat,
    startBeat,
    endBeat,
    carrier = 340,
    noise,
    noiseMix,
    progressionCurve,
    progressionVariability,
    spatialMotion,
    overlays,
    overlayMix = 0.2,
    harmonicStacking,
    stochastic,
    isochronic,
    splitHemisphere,
    dbssFrequency,
    entrainmentMode,
  } = raw;

  const resolvedBeat = typeof beat === 'number' ? beat : startBeat ?? 0;
  const beatEnd =
    typeof endBeat === 'number'
      ? endBeat
      : typeof beat === 'number'
      ? undefined
      : undefined;

  const harmonicOverlay: Phase['harmonicOverlay'] | undefined =
    overlays && overlays.length
      ? overlays.map((freq, i) => {
          const amplitudeBase = overlayMix / overlays.length || 0.2;
          return {
            frequency: freq as number,
            amplitude: amplitudeBase * (1 - i * 0.15),
            type: 'sine' as const,
          };
        })
      : undefined;

  const mergedEntrainment: Phase['entrainmentMode'] =
    entrainmentMode ?? {
      binaural: { enabled: true, strength: 1.0 },
      isochronic: { enabled: !!isochronic, dutyCycle: 0.5 },
      monaural: { enabled: true, strength: 0.8 },
    };

  if (isochronic != null) {
    mergedEntrainment.isochronic = {
      ...(mergedEntrainment.isochronic ?? { dutyCycle: 0.5 }),
      enabled: isochronic,
    };
  }

  const phase: Phase = {
    duration: duration,
    carrier,
    beat: resolvedBeat,
    ...(typeof beatEnd === 'number' ? { beatEnd } : {}),
    ...(noise ? { noise, noiseMix: noiseMix ?? 0.2 } : {}),
    ...(progressionCurve ? { progressionCurve } : {}),
    ...(typeof progressionVariability === 'number'
      ? { progressionVariability }
      : {}),
    ...(spatialMotion ? { spatialMotion } : {}),
    ...(harmonicOverlay ? { harmonicOverlay } : {}),
    ...(typeof stochastic === 'boolean'
      ? {
          stochastic: {
            enabled: stochastic,
            deviation: stochastic ? 0.15 : 0,
            rate: stochastic ? 0.1 : 0,
          },
        }
      : {}),
    ...(splitHemisphere ? { splitHemisphere } : {}),
    ...(dbssFrequency ? { dbssFrequency } : {}),
    entrainmentMode: mergedEntrainment,
  };

  return phase;
}

// ---------- Protocol normalizer ----------

function normalizeProtocol(raw: RawProtocol): Protocol {
  const { phases, duration, ...rest } = raw;

  return {
    ...rest,
    duration,
    phases: phases.map(normalizePhase),
  } as Protocol;
}

// ---------- Adapt new DSP spec files --------------------------------

const ADAPTED_SPECS = adaptAllSpecs(ALL_SPECS);

// ---------- Use only NEW DSP format protocols ----------

const RAW_PROTOCOLS: Record<string, RawProtocol> = {
  ...(ADAPTED_SPECS as Record<string, RawProtocol>),
};

// ---------- Final exported protocol map ----------

export const PROTOCOLS: Record<string, Protocol> = Object.fromEntries(
  Object.entries(RAW_PROTOCOLS).map(([id, raw]) => [
    id,
    normalizeProtocol(raw),
  ]),
);

export const PROTOCOL_COUNT = Object.keys(PROTOCOLS).length;

export const PROTOCOL_SECTIONS = {
  CALIBRATION: 'Calibration',
  SLEEP_RECOVERY: 'Sleep & Recovery',
  CONSCIOUSNESS: 'Consciousness Expansion',
  PERFORMANCE: 'Performance Focus',
  NEURAL_REWIRING: 'Neural Rewiring',
  AUTONOMIC: 'Autonomic Mastery',
  SUFFERING_REDUCTION: 'Suffering Reduction',
  RECOVERY_ADDICTION: 'Recovery & Addiction',
  FLOW_STATE: 'Flow State',
  EMOTIONAL_MASTERY: 'Emotional Mastery',
  ATHLETIC_PERFORMANCE: 'Athletic Performance',
  BIOHACKING_LONGEVITY: 'Biohacking & Longevity',
  ADVANCED_RESEARCH: 'Advanced Research',
} as const;

export const PROTOCOL_CHAINS = {
    anxiety_to_flow: {
        id: 'anxiety_to_flow',
        name: 'Anxiety → Flow → Deep Rest',
        protocols: [
            PROTOCOLS.anxiety_relief_v4,
            PROTOCOLS.flow_1_ignition,
            PROTOCOLS.deep_sleep_v4
        ],
        transitionMode: 'crossfade',
        adaptation: 'adaptive'
    },
    cognitive_performance: {
        id: 'cognitive_performance',
        name: 'Wake → Focus → Memory',
        protocols: [
            PROTOCOLS.mood_elevator_v4,
            PROTOCOLS.focus_v4,
            PROTOCOLS.learning_consolidation_v5
        ],
        transitionMode: 'immediate',
        adaptation: 'linear'
    },
    trauma_healing: {
        id: 'trauma_healing',
        name: 'Stabilize → Process → Integrate',
        protocols: [
            PROTOCOLS.neuro_analgesia,
            PROTOCOLS.emotional_processing,
            PROTOCOLS.acute_stress_reset
        ],
        transitionMode: 'pause',
        adaptation: 'adaptive'
    }
};
