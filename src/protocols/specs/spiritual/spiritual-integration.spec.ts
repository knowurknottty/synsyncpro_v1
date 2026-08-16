/**
 * SynSync Pro — Spiritual Integration Protocol Specs
 * ====================================================
 * Category: spiritual_integration
 * Protocols for meditation deepening, contemplative practice, and transpersonal states.
 *
 * @version 2.0.0
 */

import type { ProtocolSpec } from '../../../audio/dsp/types';
import { phase } from '../../../audio/dsp/phase-builder';
import { CARRIERS, DSP_DEFAULTS, SOLFEGGIO, SCHUMANN, OVERLAY_PRESETS } from '../../../audio/dsp/constants';

// ─── 1. Deep Meditation Protocol ───────────────────────────────────
export const deepMeditation: ProtocolSpec = {
  id: 'deep_meditation_spiritual',
  name: 'Deep Meditation',
  category: 'spiritual_integration',
  version: '2.0.0',
  durationSeconds: 2400,
  evidenceLevel: 'II',
  citations: [
    'Cahn, B.R. & Polich, J. (2006) "Meditation states and traits: EEG, ERP, and neuroimaging studies." Psychological Bulletin',
    'Lutz, A. et al. (2004) "Long-term meditators self-induce high-amplitude gamma synchrony." PNAS',
  ],
  usageGoal: 'Support deep meditation practice. Facilitate transition from surface awareness to profound stillness and insight.',
  algorithmDescription: 'Progressive descent from alpha (10Hz) through theta (5Hz) to deep theta (4Hz) with Schumann anchoring. 852Hz (spiritual order) and 963Hz (pineal activation) overlays. Spatial rotation creates immersive contemplative space.',
  researchContext: 'Long-term meditators show increased theta power during deep meditation and gamma bursts during insight moments. Schumann resonance (7.83Hz) historically associated with Earth-brain coherence. This protocol replicates the EEG signatures of experienced contemplatives.',
  targetBands: ['alpha', 'theta', 'delta'],
  neurochemistryTargets: ['serotonin', 'DMT', 'melatonin', 'endorphins'],
  phases: [
    phase(0, 'Settling')
      .duration(360)
      .beat(10)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.10)
      .noCarrierOctaves()
      .purpose('Alpha settling to quiet the discursive mind')
      .build(),

    phase(1, 'Schumann Attunement')
      .duration(420)
      .beat(7.83)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.SI], 0.08)
      .spatial('rotate', 0.02)
      .purpose('Schumann resonance for Earth-brain coherence and contemplative grounding')
      .build(),

    phase(2, 'Deep Theta')
      .duration(600)
      .beat(5)
      .carrier(CARRIERS.warm)
      .noise('brown', 0.12)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.SI, SOLFEGGIO.OM], 0.10)
      .spatial('rotate', 0.015)
      .stochasticJitter(8)
      .purpose('Deep theta for access to subconscious and transpersonal awareness')
      .build(),

    phase(3, 'Stillness')
      .duration(600)
      .beat(4)
      .carrier(CARRIERS.warm)
      .noise('brown', 0.15)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.OM], 0.06)
      .spatial('pendulum', 0.01)
      .purpose('Theta-delta border for profound stillness and non-dual awareness')
      .build(),

    phase(4, 'Gentle Return')
      .duration(420)
      .beat([4, 10])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.10)
      .noCarrierOctaves()
      .purpose('Gradual return to waking awareness carrying meditative clarity')
      .build(),
  ],
  breathwork: {
    name: 'Contemplative Breath',
    ratio: [6, 4, 8, 4],
    description: 'Slow diaphragmatic breathing. Extended exhale and pauses for deep stillness.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'OM MANI PADME HUM',
    pronunciation: 'ohm mah-nee pahd-may hoom',
    tonality: 'deep, reverent',
    meaning: 'The jewel is in the lotus — awakening compassion within wisdom',
    repeatInterval: 20,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Active psychosis', 'Severe dissociative disorders'],
    relative: ['Trauma history — deep states may surface unprocessed material'],
    drugInteractions: ['MAOIs — endogenous DMT modulation'],
    specialPopulations: [],
  },
  expectedTimeline: '1 session: Deeper meditation than usual. 4 weeks: Consistently deeper states.',
  frequencyOfUse: 'Daily or as part of meditation practice. Best in quiet, undisturbed environment.',
  masterGain: 0.75,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: false,
};

// ─── 2. Gratitude & Presence Protocol ──────────────────────────────
export const gratitudePresence: ProtocolSpec = {
  id: 'gratitude_presence',
  name: 'Gratitude & Presence',
  category: 'spiritual_integration',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'III',
  citations: [
    'Emmons, R.A. & McCullough, M.E. (2003) "Counting blessings versus burdens." J Personality and Social Psychology',
    'Fox, K.C. et al. (2014) "Is meditation associated with altered brain structure?" Neuroscience & Biobehavioral Reviews',
  ],
  usageGoal: 'Cultivate gratitude, presence, and heart-centered awareness. Ideal for morning practice or emotional reset.',
  algorithmDescription: 'Alpha-dominant (10Hz) with heart-coherence overlay at Schumann frequency. 639Hz (relationship/harmony) and 528Hz (transformation) solfeggio stack. Gentle pendulum motion for grounded, embodied awareness.',
  researchContext: 'Gratitude practice increases alpha power and heart rate variability coherence. Combining alpha entrainment with heart-focused breathing amplifies parasympathetic activation and positive emotional states. Regular practice restructures neural reward circuits.',
  targetBands: ['alpha'],
  neurochemistryTargets: ['serotonin', 'oxytocin', 'endorphins'],
  phases: [
    phase(0, 'Arrival')
      .duration(180)
      .beat(10)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.10)
      .noCarrierOctaves()
      .purpose('Alpha grounding to arrive in present moment awareness')
      .build(),

    phase(1, 'Heart Opening')
      .duration(360)
      .beat(7.83)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.LA, SOLFEGGIO.SOL], 0.10)
      .spatial('pendulum', 0.03)
      .purpose('Schumann resonance with harmony overlays for heart-centered expansion')
      .build(),

    phase(2, 'Gratitude Immersion')
      .duration(420)
      .beat(10)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.06)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.LA, SOLFEGGIO.SOL], 0.08)
      .spatial('pendulum', 0.02)
      .purpose('Sustained alpha for conscious gratitude practice and heart coherence')
      .build(),

    phase(3, 'Integration')
      .duration(240)
      .beat(10)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.08)
      .noCarrierOctaves()
      .purpose('Gentle integration carrying gratitude and presence into daily life')
      .build(),
  ],
  breathwork: {
    name: 'Heart Coherence Breath',
    ratio: [5, 0, 5, 0],
    description: 'Equal inhale/exhale at 6 breaths per minute. Focus on heart center.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'THANK-YOU',
    pronunciation: 'thank you (sincere, felt)',
    tonality: 'warm, appreciative',
    meaning: 'Simple gratitude — the most powerful reframe available',
    repeatInterval: 10,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: [],
    drugInteractions: [],
    specialPopulations: [],
  },
  expectedTimeline: 'Immediate: Elevated mood and presence. 3 weeks: Habitual gratitude response.',
  frequencyOfUse: 'Daily. Best as morning practice or emotional reset.',
  masterGain: 0.78,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: false,
};

// ─── Category Export ────────────────────────────────────────────────
export const SPIRITUAL_INTEGRATION_SPECS: ProtocolSpec[] = [
  deepMeditation,
  gratitudePresence,
];
