/**
 * SynSync Pro — Spec Adapter
 * ===========================
 * Converts new-format ProtocolSpec objects (from src/protocols/specs/)
 * into the RawProtocol shape consumed by constants.ts and the UI pipeline.
 *
 * @version 1.0.0
 */

import type { ProtocolSpec, PhaseSpec, ProtocolCategory } from './dsp/types';

// ─── Category → Section Mapping ──────────────────────────────────────
// Maps DSP ProtocolCategory enum values to UI section strings
// that match SECTIONS_CONFIG keys in ProtocolList.tsx

const CATEGORY_TO_SECTION: Record<ProtocolCategory, string> = {
  calibration:              'Calibration',
  isochronic_speakers:      'Isochronic (Speakers)',
  suffering_reduction:      'Suffering Reduction',
  performance_focus:        'Performance Focus',
  recovery_addiction:       'Recovery & Addiction',
  flow_state:               'Flow State',
  emotional_mastery:        'Emotional Mastery',
  athletic:                 'Athletic Performance',
  hormonal_physiological:   'Biohacking & Longevity',
  sleep_recovery:           'Sleep & Recovery',
  altered_states:           'Consciousness Expansion',
  speculative_experimental: 'Consciousness Expansion',
  advanced_research:        'Advanced Research',
  neural_rewiring:          'Neural Rewiring',
  autonomic_mastery:        'Autonomic Mastery',
  relationship_social:      'Relationship & Social',
  creative_expression:      'Creative Expression',
  spiritual_integration:    'Spiritual Integration',
  mdma_mimicry:             'MDMA Mimicry',
  stimulant_mimicry:        'Stimulant Mimicry',
  psychedelic_mimicry:      'Psychedelic Mimicry',
  cannabis_mimicry:         'Cannabis Mimicry',
};

// ─── Evidence Level → Mode Filter ────────────────────────────────────
// Levels I–III + Setup = "evidence" (visible in Science mode)
// Levels IV–V = "speculative" (only visible in Speculative mode)

const EVIDENCE_CATEGORIES: Record<string, string> = {
  'I':     'evidence',
  'II':    'evidence',
  'III':   'evidence',
  'Setup': 'evidence',
  'IV':    'speculative',
  'V':     'speculative',
};

const EVIDENCE_GRADES = {
  I: 'A',
  II: 'B',
  III: 'C',
  IV: 'D',
  V: 'D',
  Setup: 'A',
} as const;

// ─── Phase Adapter ───────────────────────────────────────────────────

function adaptPhase(p: PhaseSpec) {
  // Beat frequency: number → beat, [start,end] → startBeat + endBeat
  const beatFields: Record<string, number> = {};
  if (Array.isArray(p.beatFrequency)) {
    beatFields.startBeat = p.beatFrequency[0];
    beatFields.endBeat = p.beatFrequency[1];
  } else {
    beatFields.beat = p.beatFrequency;
  }

  // Noise: 'none' maps to undefined
  const noise = p.noiseType === 'none' ? undefined : p.noiseType;

  // Spatial motion: 'spiral' not in old type, map to 'rotate'
  const spatialMotion = p.spatialMotion === 'spiral' ? 'rotate' : p.spatialMotion;

  // Entrainment mode derived from delivery method
  const entrainmentMode = {
    binaural:   { enabled: p.delivery === 'binaural' || p.delivery === 'hybrid', strength: 1.0 },
    isochronic: { enabled: p.delivery === 'isochronic' || p.delivery === 'hybrid', dutyCycle: p.isochronicDuty ?? 0.5 },
    monaural:   { enabled: true, strength: 0.8 },
  };

  return {
    duration: p.durationSeconds,
    ...beatFields,
    carrier: p.carrierFrequency,
    ...(noise ? { noise, noiseMix: p.noiseMix } : {}),
    ...(p.overlays.length > 0 ? { overlays: p.overlays, overlayMix: p.overlayMix } : {}),
    ...(spatialMotion && spatialMotion !== 'fixed' ? { spatialMotion } : {}),
    ...(p.harmonicStacking ? { harmonicStacking: true } : {}),
    ...(p.stochastic ? { stochastic: true } : {}),
    ...(p.delivery === 'isochronic' || p.delivery === 'hybrid' ? { isochronic: true } : {}),
    entrainmentMode,
  };
}

// ─── Protocol Adapter ────────────────────────────────────────────────

function adaptSpec(spec: ProtocolSpec) {
  const section = CATEGORY_TO_SECTION[spec.category] ?? 'Advanced Research';
  const category = EVIDENCE_CATEGORIES[spec.evidenceLevel] ?? 'speculative';

  // Flatten contraindications from structured object to string array
  const contraindications = [
    ...spec.contraindications.absolute,
    ...spec.contraindications.relative,
  ];
  const safetyNotes =
    contraindications.length > 0
      ? contraindications
      : [
          'No protocol-specific contraindications identified; standard entrainment screening still applies',
        ];
  const contraindicationsSeverity =
    spec.contraindications.absolute.length > 0
      ? 'severe'
      : spec.contraindications.relative.length > 0
      ? 'moderate'
      : 'mild';

  // Map evidence level: 'Setup' → 'I' so calibration shows in Science mode
  const evidenceLevel = spec.evidenceLevel === 'Setup' ? 'I' as const : spec.evidenceLevel;

  return {
    id: spec.id,
    title: spec.name,
    description: spec.usageGoal,
    evidenceLevel,
    evidenceGrade: EVIDENCE_GRADES[spec.evidenceLevel],
    citation: spec.citations[0] ?? '',
    category,
    section,
    duration: spec.durationSeconds,
    contraindications: safetyNotes,
    contraindicationsSeverity,
    algoDesc: spec.algorithmDescription,
    usageGoal: spec.usageGoal,
    researchContext: spec.researchContext,
    phases: spec.phases.map(adaptPhase),
    breathwork: {
      name: spec.breathwork.name,
      ratio: spec.breathwork.ratio,
      description: spec.breathwork.description,
    },
    mantra: {
      phonetic: spec.mantra.phonetic,
      meaning: spec.mantra.meaning,
      repeatInterval: spec.mantra.repeatInterval,
    },
  };
}

// ─── Batch Adapter ───────────────────────────────────────────────────

export function adaptAllSpecs(specs: ProtocolSpec[]): Record<string, ReturnType<typeof adaptSpec>> {
  const result: Record<string, ReturnType<typeof adaptSpec>> = {};
  for (const spec of specs) {
    result[spec.id] = adaptSpec(spec);
  }
  return result;
}
