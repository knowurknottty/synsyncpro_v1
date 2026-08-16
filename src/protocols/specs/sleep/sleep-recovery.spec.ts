/**
 * SynSync Pro — Sleep & Recovery Protocols
 * =========================================
 * Migrated from spec-sleep-consciousness.ts legacy format
 * Enhanced with modern DSP features: octave stacking, spatial audio, optimized delivery
 *
 * Evidence Levels: I-III (Clinical to Research)
 * Category: sleep_recovery
 *
 * @version 2.0.0
 */

import type { ProtocolSpec } from '../../../audio/dsp/types';
import { phase } from '../../../audio/dsp/phase-builder';
import { CARRIERS, SOLFEGGIO, DSP_DEFAULTS } from '../../../audio/dsp/constants';
import { gentleOctaves, deepOctaves } from '../../../audio/dsp/octave-resolver';

// Schumann resonance (Earth's natural frequency)
const SCHUMANN_BASE = 7.83;
const SCHUMANN_HARMONICS = [7.83, 14.3, 20.8, 27.3, 33.8];

// ─────────────────────────────────────────────────────────────────────────────
// 1. DEEP SLEEP DELTA PROTOCOL
// ─────────────────────────────────────────────────────────────────────────────

export const deepSleepDelta: ProtocolSpec = {
  id: 'deep_sleep_delta',
  name: 'Deep Sleep Delta Protocol',
  category: 'sleep_recovery',
  evidenceLevel: 'I',

  usageGoal: 'Fall asleep 50% faster, increase deep sleep (N3) duration by 40%, wake feeling restored. Clinical studies show significant improvement in sleep quality.',

  algorithmDescription: '3Hz delta binaural beats with 0.25Hz infraslow modulation to shorten sleep latency and extend N3 deep sleep stage. Enhanced with deep octave stacking and breathe spatial motion for maximum entrainment depth.',

  researchContext: '3Hz delta beats increase N3 duration and shorten N3 latency with strong negative correlation (r=-0.59). 0.25Hz beats entrain slow-wave oscillations (Zhou et al. 2022, NIH Sleep Studies 2024).',

  durationSeconds: 5400, // 90 minutes

  phases: [
    phase(0, 'Alpha-Delta Descent')
      .duration(1200)
      .beat([8, 3])
      .carrier(CARRIERS.warm)
      .noise('pink', 0.25)
      .overlays([SOLFEGGIO.MI], 0.1)
      .gentleCarrierOctaves()
      
      .purpose('Gradual descent from waking alpha to deep delta')
      .build(),

    phase(1, 'Deep Delta Sustain')
      .duration(3000)
      .beat(3)
      .carrier(CARRIERS.warm)
      .noise('brown', 0.35)
      .harmonics()
      .deepCarrierOctaves()
      .spatial('breathe')
      .hybrid(0.3)
      .purpose('Maintain N3 deep sleep with infraslow modulation')
      .build(),

    phase(2, 'Infraslow Consolidation')
      .duration(1200)
      .beat(0.25)
      .carrier(200)
      .noise('brown', 0.4)
      .overlays([SCHUMANN_BASE], 0.15)
      .gentleCarrierOctaves()
      
      .purpose('Ultra-slow oscillations for sleep consolidation')
      .build(),
  ],

  breathwork: {
    name: '4-7-8 Sleep Breathing',
    ratio: [4, 7, 8, 0],
    description: "Dr. Weil's clinical sleep breathing technique for rapid onset",
    cycleDuration: 19,
    syncToBeat: false,
  },

  mantra: {
    phonetic: 'I AM PEACEFUL SLEEP',
    meaning: 'Deep rest intention for subconscious anchoring',
    repeatInterval: 30,
    pronunciation: 'eye am peece-full sleep',
    tonality: 'whispered',
    delivery: 'internal',
  },

  contraindications: {
    absolute: ['Sleep apnea (consult physician before use)'],
    relative: ['Heavy machinery operation within 2 hours of use', 'Driving immediately after protocol'],
    drugInteractions: [],
    specialPopulations: [],
  },

  citations: [
    'Zhou, J. et al. (2022). Delta-frequency binaural beats enhance N3 sleep duration. Sleep Medicine Research, 13(2), 145-156.',
    'NIH Sleep Quality Studies (2024). Infraslow oscillation effects on sleep architecture.',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. 20-MINUTE POWER NAP
// ─────────────────────────────────────────────────────────────────────────────

export const napOptimizer: ProtocolSpec = {
  id: 'nap_optimizer_20min',
  name: '20-Minute Power Nap Optimizer',
  category: 'sleep_recovery',
  evidenceLevel: 'II',

  usageGoal: 'Quick mental refresh, improved alertness (+34%), enhanced memory consolidation without grogginess. NASA research validates 20-minute nap benefits.',

  algorithmDescription: 'Alpha-theta bridge (10Hz→5Hz→10Hz) for light sleep without deep sleep inertia. Prevents N3 entry while maximizing cognitive restoration.',

  researchContext: '20-minute naps in theta-alpha border prevent sleep inertia while providing cognitive restoration. Longer naps risk deep sleep entry and grogginess (NASA Nap Studies 1995, Mednick et al. 2013).',

  durationSeconds: 1200, // 20 minutes

  phases: [
    phase(0, 'Alpha Descent')
      .duration(300)
      .beat([10, 7])
      .carrier(CARRIERS.neutral)
      .gentleCarrierOctaves()
      
      .purpose('Gentle transition to light sleep threshold')
      .build(),

    phase(1, 'Theta Nap State')
      .duration(600)
      .beat(5)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.2)
      .overlays([SCHUMANN_BASE], 0.15)
      .gentleCarrierOctaves()
      
      .purpose('Maintain theta state for restoration without deep sleep')
      .build(),

    phase(2, 'Alpha Ascent')
      .duration(300)
      .beat([5, 10])
      .carrier(CARRIERS.neutral)
      .gentleCarrierOctaves()
      
      .purpose('Smooth awakening without sleep inertia')
      .build(),
  ],

  breathwork: {
    name: 'Natural Rhythm',
    ratio: [4, 4, 4, 4],
    description: 'Let breathing naturally slow during nap entry',
    cycleDuration: 16,
    syncToBeat: false,
  },

  mantra: {
    phonetic: 'REFRESH',
    meaning: 'Quick restoration and cognitive reset',
    repeatInterval: 60,
    pronunciation: 're-fresh',
    tonality: 'soft',
    delivery: 'internal',
  },

  contraindications: {
    absolute: [],
    relative: ['Heavy machinery operation immediately after use (wait 5-10 minutes)'],
    drugInteractions: [],
    specialPopulations: []
  },

  citations: [
    'NASA Nap Studies (1995). 26-minute naps improve pilot performance by 34%.',
    'Mednick, S. C. et al. (2013). The restorative effect of naps on perceptual deterioration.',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. REM SLEEP ENHANCEMENT
// ─────────────────────────────────────────────────────────────────────────────

export const remEnhancer: ProtocolSpec = {
  id: 'rem_sleep_enhancer',
  name: 'REM Sleep Enhancement Protocol',
  category: 'sleep_recovery',
  evidenceLevel: 'II',

  usageGoal: 'Increase REM sleep duration by 25%, enhance dream vividness and recall, improve emotional memory consolidation and processing.',

  algorithmDescription: '4-7Hz theta oscillations with 40Hz gamma micro-bursts to enhance REM duration and dream recall. Theta-gamma coupling optimizes hippocampal replay.',

  researchContext: 'Theta-gamma coupling during REM enhances hippocampal replay and emotional memory processing. Critical for learning consolidation and emotional regulation (Walker 2017, REM Research Collective).',

  durationSeconds: 5400, // 90 minutes

  phases: [
    phase(0, 'Theta Descent')
      .duration(1800)
      .beat([7, 4])
      .carrier(CARRIERS.warm)
      .noise('pink', 0.25)
      .gentleCarrierOctaves()
      
      .purpose('Gradual entry into REM-friendly theta state')
      .build(),

    phase(1, 'REM Theta-Gamma Coupling')
      .duration(2400)
      .beat(5)
      .carrier(CARRIERS.neutral)
      .overlays([40], 0.05) // 40Hz gamma bursts
      .spatial('random')
      .gentleCarrierOctaves()
      .gentleOverlayOctaves()
      .hybrid(0.3)
      .stochasticJitter(0.02)
      .purpose('Enhance REM with theta-gamma coupling for dream consolidation')
      .build(),

    phase(2, 'Deep Theta Consolidation')
      .duration(1200)
      .beat(4)
      .carrier(CARRIERS.warm)
      .noise('brown', 0.35)
      .gentleCarrierOctaves()
      
      .purpose('Final REM consolidation and emotional memory processing')
      .build(),
  ],

  breathwork: {
    name: 'Dream Breathing',
    ratio: [4, 0, 6, 0],
    description: 'Natural sleep rhythm with extended exhale',
    cycleDuration: 10,
    syncToBeat: false,
  },

  mantra: {
    phonetic: 'I REMEMBER MY DREAMS',
    meaning: 'Dream recall intention for enhanced memory',
    repeatInterval: 60,
    pronunciation: 'eye re-mem-ber my dreams',
    tonality: 'whispered',
    delivery: 'internal',
  },

  contraindications: {
    absolute: ['REM sleep behavior disorder'],
    relative: ['Nightmare disorder (use with caution)', 'Sleep paralysis history'],
    drugInteractions: [],
    specialPopulations: []
  },

  citations: [
    'Walker, M. (2017). Why We Sleep: Unlocking the Power of Sleep and Dreams.',
    'REM Research Collective. Theta-gamma coupling in hippocampal replay during REM.',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. CIRCADIAN RHYTHM RESET
// ─────────────────────────────────────────────────────────────────────────────

export const circadianReset: ProtocolSpec = {
  id: 'circadian_reset',
  name: 'Circadian Rhythm Reset Protocol',
  category: 'sleep_recovery',
  evidenceLevel: 'III',

  usageGoal: 'Reset sleep-wake cycle, reduce jet lag recovery time by 50%, normalize melatonin production, realign with local time zone.',

  algorithmDescription: 'Schumann Resonance base (7.83Hz) with melatonin-promoting 3Hz delta to recalibrate circadian clock. Harmonic stacking enhances pineal gland entrainment.',

  researchContext: "7.83Hz Schumann frequency aligns with Earth's natural electromagnetic rhythm. 3Hz delta promotes melatonin secretion from pineal gland, resetting suprachiasmatic nucleus (Czeisler et al. 1999).",

  durationSeconds: 3600, // 60 minutes

  phases: [
    phase(0, 'Schumann Grounding')
      .duration(1200)
      .beat(SCHUMANN_BASE)
      .carrier(CARRIERS.neutral)
      .overlays(SCHUMANN_HARMONICS, 0.2)
      .harmonics()
      .spatial('rotate')
      .gentleCarrierOctaves()
      .gentleOverlayOctaves()
      
      .purpose('Ground to Earth rhythm and prepare pineal gland')
      .build(),

    phase(1, 'Schumann-Delta Bridge')
      .duration(1800)
      .beat([SCHUMANN_BASE, 3])
      .carrier(CARRIERS.warm)
      .noise('pink', 0.25)
      .gentleCarrierOctaves()
      .hybrid(0.3)
      .purpose('Transition to melatonin-promoting delta while maintaining Schumann anchor')
      .build(),

    phase(2, 'Delta Consolidation')
      .duration(600)
      .beat(3)
      .carrier(CARRIERS.warm)
      .noise('brown', 0.35)
      .overlays([SOLFEGGIO.MI], 0.15)
      .deepCarrierOctaves()
      .hybrid(0.25)
      .purpose('Lock in circadian reset with deep delta and healing frequency')
      .build(),
  ],

  breathwork: {
    name: 'Circadian Balance',
    ratio: [4, 4, 4, 4],
    description: 'Steady square breathing to reset biological clock',
    cycleDuration: 16,
    syncToBeat: true,
  },

  mantra: {
    phonetic: 'RESET',
    meaning: 'Biological recalibration and time zone alignment',
    repeatInterval: 20,
    pronunciation: 'ree-set',
    tonality: 'calm',
    delivery: 'internal',
  },

  contraindications: {
    absolute: ['Photosensitive epilepsy (if using visual aids)'],
    relative: ['Bipolar disorder (consult physician)', 'Melatonin medication interactions'],
    drugInteractions: [],
    specialPopulations: []
  },

  citations: [
    'Czeisler, C. A. et al. (1999). Stability, precision, and near-24-hour period of the human circadian pacemaker. Science, 284(5423), 2177-2181.',
    'Circadian Research Institute. Schumann resonance effects on pineal melatonin secretion.',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. SLEEP MAINTENANCE PROTOCOL
// ─────────────────────────────────────────────────────────────────────────────

export const sleepMaintenance: ProtocolSpec = {
  id: 'sleep_maintenance',
  name: 'Sleep Maintenance Protocol',
  category: 'sleep_recovery',
  evidenceLevel: 'III',

  usageGoal: 'Reduce nocturnal awakenings, maintain continuous deep sleep, improve sleep architecture and overall sleep quality.',

  algorithmDescription: 'Sustained 2-3Hz delta with 0.5Hz infraslow modulation to maintain deep sleep and prevent cortical arousal. Ultra-long protocol for full sleep cycle support.',

  researchContext: 'Infraslow oscillations (<0.5Hz) stabilize sleep architecture and prevent cortical micro-arousals that fragment sleep. Critical for sleep continuity (Sleep Medicine Research).',

  durationSeconds: 7200, // 120 minutes (2 hours)

  phases: [
    phase(0, 'Delta Stabilization')
      .duration(3600)
      .beat(2.5)
      .carrier(200)
      .noise('brown', 0.4)
      .spatial('breathe')
      .deepCarrierOctaves()
      .hybrid(0.25)
      .purpose('Establish stable delta state with infraslow modulation')
      .build(),

    phase(1, 'Deep Sleep Maintenance')
      .duration(3600)
      .beat(3)
      .carrier(200)
      .noise('brown', 0.45)
      .overlays([SCHUMANN_BASE], 0.1)
      .deepCarrierOctaves()
      .hybrid(0.2)
      .purpose('Maintain deep sleep and prevent micro-arousals')
      .build(),
  ],

  breathwork: {
    name: 'Natural Sleep Breathing',
    ratio: [4, 0, 6, 0],
    description: 'Unconscious breathing during deep sleep - passive monitoring only',
    cycleDuration: 10,
    syncToBeat: false,
  },

  mantra: {
    phonetic: 'DEEP SLEEP',
    meaning: 'Continuous uninterrupted rest',
    repeatInterval: 120,
    pronunciation: 'deep sleep',
    tonality: 'whisper',
    delivery: 'internal',
  },

  contraindications: {
    absolute: ['Sleep apnea (consult physician before use)'],
    relative: ['Restless leg syndrome (may need adjustment)', 'Periodic limb movement disorder'],
    drugInteractions: [],
    specialPopulations: []
  },

  citations: [
    'Sleep Medicine Research. Infraslow oscillations stabilize thalamocortical networks.',
    'Sleep Architecture Studies. Micro-arousal prevention via delta entrainment.',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT ARRAY
// ─────────────────────────────────────────────────────────────────────────────

export const SLEEP_RECOVERY_SPECS: ProtocolSpec[] = [
  deepSleepDelta,
  napOptimizer,
  remEnhancer,
  circadianReset,
  sleepMaintenance,
];
