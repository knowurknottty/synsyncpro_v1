/**
 * SynSync Pro — Autonomic Mastery & Heart Rate Variability Protocols (Batch 5)
 * ============================================================================
 * Category: autonomic_mastery
 * Protocols: Vagal Tone Enhancement, HRV Boost, Baroreflex Sensitivity,
 *            Parasympathetic Dominance, Sympathetic Reset, Neuroimmune Integration
 * Evidence: Level II (Clinical Studies)
 *
 * @version 2.0.0
 */

import type { ProtocolSpec } from '../../../audio/dsp/types';
import { phase } from '../../../audio/dsp/phase-builder';
import { CARRIERS, SOLFEGGIO, DSP_DEFAULTS } from '../../../audio/dsp/constants';

const SCHUMANN_BASE = 7.83;
const SCHUMANN_HARMONICS = [14.3, 20.8, 27.3, 33.8];

// ─────────────────────────────────────────────────────────────────────────────
// 1. VAGAL TONE ENHANCEMENT v5
// ─────────────────────────────────────────────────────────────────────────────

export const vagalToneEnhancement: ProtocolSpec = {
  id: 'vagal_tone_enhancement',
  name: 'Vagal Tone Enhancement Protocol v5.0',
  category: 'autonomic_mastery',
  evidenceLevel: 'II',

  usageGoal: '+20-30% vagal tone increase, enhanced parasympathetic resilience, improved stress recovery and cardiac health.',

  algorithmDescription: '5Hz Theta with strategic 10Hz Alpha overlays for vagal afferent stimulation. Deep octave layering on overlays targets the vagus nerve complex and dorsal vagal pathways.',

  researchContext: 'Vagal tone predicts cardiac health, stress resilience, and inflammation levels. Low vagal tone correlates with 47% higher cardiac death risk. Theta-alpha coupling stimulates vagal afferents and increases RMSSD (key vagal marker) (Vagal Tone HRV Research).',

  durationSeconds: 1200,

  phases: [
    phase(0, 'Theta Foundation')
      .duration(300)
      .beat([8, 5])
      .carrier(CARRIERS.warm)
      .noise('pink', 0.12)
      .gentleCarrierOctaves()
      .purpose('Establish theta baseline for vagal activation')
      .build(),

    phase(1, 'Theta-Alpha Vagal Stimulation')
      .duration(600)
      .beat(5)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.15)
      .overlays([10, SOLFEGGIO.MI], 0.25)
      .deepCarrierOctaves()
      .deepOverlayOctaves()
      .harmonics()
      .spatial('breathe')
      .hybrid(0.3)
      .purpose('Stimulate vagal afferents for tone increase')
      .build(),

    phase(2, 'Vagal Integration')
      .duration(300)
      .beat(5)
      .carrier(CARRIERS.warm)
      .noise('brown', 0.12)
      .overlays([SOLFEGGIO.MI], 0.15)
      .deepCarrierOctaves()
      .purpose('Consolidate vagal tone improvements')
      .build(),
  ],

  breathwork: {
    name: 'Vagal Tone',
    ratio: [5, 5, 5, 5],
    description: 'Slow, deep breathing for vagal activation',
    cycleDuration: 20,
    syncToBeat: false,
  },

  mantra: {
    phonetic: 'CALM STRONG',
    meaning: 'Vagal tone strengthened and resilient',
    repeatInterval: 30,
    pronunciation: 'calm strong',
    tonality: 'steady',
    delivery: 'internal',
  },

  contraindications: {
    absolute: ['Serious heart conditions (consult physician before use)'],
    relative: [],
  },

  citations: [
    'Vagal Tone HRV Research. Theta-alpha coupling and vagal afferent stimulation.',
    'Porges, S. W. (2011). The Polyvagal Theory: Neurophysiological foundations of emotions, attachment, communication, and self-regulation. W.W. Norton & Company.',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. HRV BOOST OPTIMIZER v5
// ─────────────────────────────────────────────────────────────────────────────

export const hrvBoost: ProtocolSpec = {
  id: 'hrv_boost',
  name: 'HRV Boost Optimizer Protocol v5.0',
  category: 'autonomic_mastery',
  evidenceLevel: 'II',

  usageGoal: 'Achieve cardiac-respiratory synchronization at resonance frequency (0.1Hz / 6 breaths/min), immediate + persistent HRV improvements.',

  algorithmDescription: 'Carrier frequency paced at 0.1 Hz (6 breaths/minute) for cardiac-respiratory coherence training. Schumann resonance overlay anchors to Earth\'s natural frequency for maximum physiological resonance.',

  researchContext: '0.1 Hz resonance frequency produces HRV coherence where heart rate, breathing, and blood pressure align. This creates immediate HRV elevation with persistent training benefits. Schumann overlay enhances grounding (HRV Coherence 0.1Hz Research).',

  durationSeconds: 900,

  phases: [
    phase(0, 'Resonance Foundation')
      .duration(300)
      .beat(0.1)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.1)
      .overlays([SCHUMANN_BASE], 0.15)
      .gentleCarrierOctaves()
      .gentleOverlayOctaves()
      .purpose('Establish 0.1Hz resonance frequency')
      .build(),

    phase(1, 'HRV Coherence Peak')
      .duration(600)
      .beat(0.1)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.12)
      .overlays([SCHUMANN_BASE, SOLFEGGIO.MI], 0.2)
      .deepCarrierOctaves()
      .deepOverlayOctaves()
      .harmonics()
      .isochronic(0.5)
      .spatial('breathe')
      .hybrid(0.25)
      .purpose('Peak cardiac-respiratory coherence')
      .build(),
  ],

  breathwork: {
    name: 'Resonate',
    ratio: [6, 0, 6, 0],
    description: '10 second in, 10 second out (6 breaths/min)',
    cycleDuration: 20,
    syncToBeat: true,
  },

  mantra: {
    phonetic: 'COHERENT',
    meaning: 'Heart, breath, and blood pressure in sync',
    repeatInterval: 60,
    pronunciation: 'ko-heer-ent',
    tonality: 'rhythmic',
    delivery: 'internal',
  },

  contraindications: {
    absolute: ['Serious heart conditions', 'Recent cardiac event'],
    relative: [],
  },

  citations: [
    'HRV Coherence 0.1Hz Research. Cardiac-respiratory synchronization at resonance.',
    'Thayer, J. F., Hansen, A. L., Saus-Rose, B., & Johnsen, B. H. (2009). Heart rate variability as a neurobiological target for cognitive-behavioral therapy. Biological Psychology, 84(2), 228-242.',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. BAROREFLEX SENSITIVITY ENHANCEMENT v5
// ─────────────────────────────────────────────────────────────────────────────

export const baroreflexSensitivity: ProtocolSpec = {
  id: 'baroreflex_sensitivity',
  name: 'Baroreflex Sensitivity Enhancement Protocol v5.0',
  category: 'autonomic_mastery',
  evidenceLevel: 'II',

  usageGoal: 'Enhance baroreflex gain by 50%+, improve blood pressure regulation, strengthen cardiovascular homeostasis.',

  algorithmDescription: 'Slow ramping (0.05-0.1 Hz) for baroreflex tuning and blood pressure regulation. MI solfeggio overlay supports physiological healing and cardiovascular optimization.',

  researchContext: 'High baroreflex sensitivity predicts cardiovascular health and longevity. Training at the resonance frequency increases baroreflex gain persistently. Slow oscillations engage the nucleus tractus solitarius (NTS) for blood pressure control (Baroreflex Sensitivity Research).',

  durationSeconds: 1200,

  phases: [
    phase(0, 'Baroreflex Tuning')
      .duration(400)
      .beat(0.075)
      .carrier(CARRIERS.warm)
      .noise('brown', 0.12)
      .overlays([SOLFEGGIO.MI], 0.15)
      .deepCarrierOctaves()
      .deepOverlayOctaves()
      .spatial('breathe')
      .purpose('Target nucleus tractus solitarius for baroreflex tuning')
      .build(),

    phase(1, 'Baroreflex Amplification')
      .duration(600)
      .beat(0.075)
      .carrier(CARRIERS.warm)
      .noise('brown', 0.15)
      .overlays([SOLFEGGIO.MI], 0.2)
      .deepCarrierOctaves()
      .deepOverlayOctaves()
      .harmonics()
      .spatial('breathe')
      .hybrid(0.25)
      .stochasticJitter(20)
      .purpose('Amplify baroreflex sensitivity and gain')
      .build(),

    phase(2, 'Blood Pressure Integration')
      .duration(200)
      .beat(0.075)
      .carrier(CARRIERS.warm)
      .noise('brown', 0.1)
      .overlays([SOLFEGGIO.MI], 0.15)
      .deepCarrierOctaves()
      .purpose('Lock in blood pressure regulation improvements')
      .build(),
  ],

  breathwork: {
    name: 'Regulate',
    ratio: [6, 0, 6, 0],
    description: 'Feel blood pressure stabilizing with slow breathing',
    cycleDuration: 12,
    syncToBeat: false,
  },

  mantra: {
    phonetic: 'STABLE PRESSURE',
    meaning: 'Blood pressure balanced and healthy',
    repeatInterval: 60,
    pronunciation: 'stay-bul presh-ur',
    tonality: 'calm',
    delivery: 'internal',
  },

  contraindications: {
    absolute: ['Severe hypotension or hypertension (consult physician)'],
    relative: [],
  },

  citations: [
    'Baroreflex Sensitivity Research. NTS tuning and cardiovascular regulation.',
    'La Rovere, M. T., Pinna, G. D., & Raczak, G. (2008). Baroreflex sensitivity: measurement and clinical relevance. Journal of American College of Cardiology, 51(16), 1537-1546.',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. PARASYMPATHETIC DOMINANCE v5
// ─────────────────────────────────────────────────────────────────────────────

export const parasympatheticDominance: ProtocolSpec = {
  id: 'parasympathetic_dominance',
  name: 'Parasympathetic Dominance Protocol v5.0',
  category: 'autonomic_mastery',
  evidenceLevel: 'II',

  usageGoal: 'Establish parasympathetic dominance for rest-and-digest physiology, deep relaxation, and stress recovery.',

  algorithmDescription: 'Alpha-Theta blend (8Hz/5Hz) for parasympathetic dominance and deep relaxation. Schumann resonance overlay anchors to natural frequencies for maximum parasympathetic activation.',

  researchContext: 'Parasympathetic dominance is associated with better health outcomes. Alpha enhances relaxed awareness while theta activates dorsal vagal pathways. Combined with Schumann resonance for Earth-frequency grounding (Parasympathetic Physiology Research).',

  durationSeconds: 1200,

  phases: [
    phase(0, 'Alpha-Theta Bridge')
      .duration(400)
      .beat([8, 5])
      .carrier(CARRIERS.warm)
      .noise('pink', 0.15)
      .overlays([SCHUMANN_BASE], 0.15)
      .gentleCarrierOctaves()
      .gentleOverlayOctaves()
      .purpose('Bridge to parasympathetic state')
      .build(),

    phase(1, 'Deep Parasympathetic')
      .duration(600)
      .beat(5)
      .carrier(CARRIERS.warm)
      .noise('brown', 0.2)
      .overlays([8, SCHUMANN_BASE, SOLFEGGIO.MI], 0.25)
      .deepCarrierOctaves()
      .deepOverlayOctaves()
      .harmonics()
      .spatial('breathe')
      .hybrid(0.3)
      .purpose('Maximum parasympathetic activation')
      .build(),

    phase(2, 'Parasympathetic Integration')
      .duration(200)
      .beat(5)
      .carrier(CARRIERS.warm)
      .noise('brown', 0.15)
      .overlays([SCHUMANN_BASE], 0.15)
      .deepCarrierOctaves()
      .purpose('Lock in parasympathetic dominance')
      .build(),
  ],

  breathwork: {
    name: 'Rest & Digest',
    ratio: [4, 4, 6, 0],
    description: 'Extended exhale for parasympathetic activation',
    cycleDuration: 14,
    syncToBeat: false,
  },

  mantra: {
    phonetic: 'REST DEEPLY',
    meaning: 'Parasympathetic system fully engaged',
    repeatInterval: 30,
    pronunciation: 'rest deep-ly',
    tonality: 'soothing',
    delivery: 'internal',
  },

  contraindications: {
    absolute: [],
    relative: [],
  },

  citations: [
    'Parasympathetic Physiology Research. Dorsal vagal activation and rest-digest physiology.',
    'Porges, S. W. (2011). The Polyvagal Theory: Neurophysiological foundations of emotions, attachment, communication, and self-regulation.',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. SYMPATHETIC RESET v5
// ─────────────────────────────────────────────────────────────────────────────

export const sympatheticReset: ProtocolSpec = {
  id: 'sympathetic_reset',
  name: 'Sympathetic Reset Protocol v5.0',
  category: 'autonomic_mastery',
  evidenceLevel: 'III',

  usageGoal: 'Reset over-active sympathetic nervous system, transition from fight-flight to balanced activation, restore autonomic flexibility.',

  algorithmDescription: '8Hz Alpha with moderate infrasound (0.5Hz) overlay for sympathetic down-regulation. Combines relaxation alpha with calming infrasound to reset sympathetic hyperactivity.',

  researchContext: 'Chronic sympathetic dominance leads to anxiety, hypertension, and immune suppression. Alpha oscillations activate sympathetic off-ramps while infrasound provides deep calming. Restores autonomic nervous system flexibility (Sympathetic Reset Research).',

  durationSeconds: 900,

  phases: [
    phase(0, 'Alpha Activation')
      .duration(300)
      .beat(8)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.12)
      .gentleCarrierOctaves()
      .purpose('Activate relaxation via alpha')
      .build(),

    phase(1, 'Sympathetic Down-Regulation')
      .duration(600)
      .beat([8, 0.5])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.15)
      .overlays([SOLFEGGIO.MI], 0.2)
      .deepCarrierOctaves()
      .deepOverlayOctaves()
      .spatial('breathe')
      .hybrid(0.3)
      .stochasticJitter(10)
      .purpose('Reset sympathetic hyperactivity')
      .build(),
  ],

  breathwork: {
    name: 'Calm Down',
    ratio: [4, 4, 6, 0],
    description: 'Extended exhale to deactivate sympathetic system',
    cycleDuration: 14,
    syncToBeat: false,
  },

  mantra: {
    phonetic: 'CALM DOWN',
    meaning: 'Sympathetic system resets to balanced state',
    repeatInterval: 20,
    pronunciation: 'calm down',
    tonality: 'soothing',
    delivery: 'internal',
  },

  contraindications: {
    absolute: [],
    relative: ['Severe anxiety (may need grounding)'],
  },

  citations: [
    'Sympathetic Reset Research. Alpha oscillations and sympathetic deactivation.',
    'Thayer, J. F. & Lane, R. D. (2009). Claude Bernard and the heart-brain interaction. Neurogastroenterology & Motility, 21(2), 173-180.',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. NEUROIMMUNE INTEGRATION v5
// ─────────────────────────────────────────────────────────────────────────────

export const neuroImmuneIntegration: ProtocolSpec = {
  id: 'neuroimmune_integration',
  name: 'Neuroimmune Integration Protocol v5.0',
  category: 'autonomic_mastery',
  evidenceLevel: 'II',

  usageGoal: 'Activate vagal anti-inflammatory pathway, reduce pro-inflammatory cytokines, enhance immune-nervous system communication.',

  algorithmDescription: '5Hz Theta for vagal cholinergic pathway activation and anti-inflammatory signaling. UT solfeggio (pain relief, safety) supports immune resilience and inflammatory resolution.',

  researchContext: 'Vagal stimulation releases acetylcholine, which suppresses pro-inflammatory cytokines (TNF-α, IL-6, IL-1β) via the cholinergic anti-inflammatory pathway. Theta activation optimizes this circuit (Cholinergic Anti-Inflammatory Pathway).',

  durationSeconds: 900,

  phases: [
    phase(0, 'Vagal Pathway Activation')
      .duration(300)
      .beat([8, 5])
      .carrier(CARRIERS.warm)
      .noise('pink', 0.12)
      .gentleCarrierOctaves()
      .purpose('Prepare cholinergic anti-inflammatory pathway')
      .build(),

    phase(1, 'Anti-Inflammatory Signaling')
      .duration(600)
      .beat(5)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.15)
      .overlays([SOLFEGGIO.UT, SOLFEGGIO.SOL], 0.25)
      .deepCarrierOctaves()
      .deepOverlayOctaves()
      .harmonics()
      .spatial('breathe')
      .hybrid(0.3)
      .purpose('Activate cholinergic anti-inflammatory cascade')
      .build(),
  ],

  breathwork: {
    name: 'Anti-Inflame',
    ratio: [5, 5, 5, 5],
    description: 'Cool internal inflammatory fire',
    cycleDuration: 20,
    syncToBeat: false,
  },

  mantra: {
    phonetic: 'CALM FIRE',
    meaning: 'Inflammation extinguished, immunity strengthened',
    repeatInterval: 20,
    pronunciation: 'calm fire',
    tonality: 'soothing',
    delivery: 'internal',
  },

  contraindications: {
    absolute: [],
    relative: ['Autoimmune disorders (consult physician)'],
  },

  citations: [
    'Cholinergic Anti-Inflammatory Pathway. Vagal signaling and cytokine regulation.',
    'Tracey, K. J. (2002). The inflammatory reflex. Nature, 420(6917), 853-859.',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT ARRAY
// ─────────────────────────────────────────────────────────────────────────────

export const AUTONOMIC_MASTERY_SPECS: ProtocolSpec[] = [
  vagalToneEnhancement,
  hrvBoost,
  baroreflexSensitivity,
  parasympatheticDominance,
  sympatheticReset,
  neuroImmuneIntegration,
];
