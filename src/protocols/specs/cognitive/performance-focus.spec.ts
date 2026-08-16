/**
 * SynSync Pro — Performance & Focus Protocols (Batch 2)
 * ======================================================
 * Category: performance_focus
 * Protocols: Professional Focus, Learning Consolidation, ADHD Focus,
 *            Working Memory, Pattern Recognition, Meta-Learning
 * Evidence: Level II (Clinical Studies)
 *
 * @version 2.0.0
 */

import type { ProtocolSpec } from '../../../audio/dsp/types';
import { phase } from '../../../audio/dsp/phase-builder';
import { CARRIERS, SOLFEGGIO, DSP_DEFAULTS } from '../../../audio/dsp/constants';

const SCHUMANN_BASE = 7.83;

// ─────────────────────────────────────────────────────────────────────────────
// 1. PROFESSIONAL FOCUS v5
// ─────────────────────────────────────────────────────────────────────────────

export const professionalFocus: ProtocolSpec = {
  id: 'focus_v5_professional',
  name: 'Professional Focus Protocol v5.0',
  category: 'performance_focus',
  version: '2.0.0',
  durationSeconds: 2100,
  evidenceLevel: 'II',

  usageGoal: '+150-300% sustained focus improvement, reduced distractibility, enhanced flow state with SMR and gamma binding.',

  algorithmDescription: '12-15Hz SMR (Sensorimotor Rhythm) with 40Hz Gamma and 20Hz Beta overlays using multi-modal entrainment. Targets prefrontal cortex precision with deep octave stacking for maximum neural engagement.',

  researchContext: 'Gamma binding supports global information processing while SMR prevents physical restlessness. Dual-frequency DBSS targets prefrontal cortex precision for sustained complex cognition (Beauchene et al. 2016).',

  targetBands: ['smr', 'beta', 'gamma'],
  neurochemistryTargets: ['Dopamine ↑', 'GABA ↑', 'Acetylcholine ↑'],

  phases: [
    phase(0, 'Alpha Baseline')
      .duration(300)
      .beat(10)
      .carrier(CARRIERS.bright)
      .noise('white', 0.05)
      .gentleCarrierOctaves()
      .purpose('Establish baseline calm; prepare for SMR engagement')
      .build(),

    phase(1, 'SMR Activation Lock')
      .duration(900)
      .beat(14)
      .carrier(CARRIERS.bright)
      .noise('white', 0.08)
      .overlays([40, 20], 0.25)
      .carrierOctaves({ enabled: true, octavesAbove: 1, octavesBelow: 1, gainRolloff: 0.7, detuneSpread: 4 })
      .deepOverlayOctaves()
      .harmonics()
      .isochronic(0.6)
      .spatial('fixed')
      .purpose('SMR + Gamma coupling; motor stillness + cognitive binding')
      .build(),

    phase(2, 'Peak Gamma Focus')
      .duration(600)
      .beat(40)
      .carrier(CARRIERS.high)
      .noise('white', 0.06)
      .overlays([20, 80], 0.3)
      .deepCarrierOctaves()
      .deepOverlayOctaves()
      .harmonics()
      .hybrid(0.4)
      .stochasticJitter(12)
      .purpose('Maximum focus intensity; complex binding and sustained attention')
      .build(),

    phase(3, 'Sustained Focus Plateau')
      .duration(300)
      .beat(12)
      .carrier(CARRIERS.bright)
      .noise('white', 0.05)
      .overlays([40], 0.15)
      .carrierOctaves({ enabled: true, octavesAbove: 1, octavesBelow: 0, gainRolloff: 0.65, detuneSpread: 3 })
      .purpose('Maintain sustainable focus; prevents burnout')
      .build(),
  ],

  breathwork: {
    name: 'Focus Box',
    ratio: [4, 4, 4, 4],
    description: 'Equal 4-count box breath for sustained alert relaxation',
    cycleDuration: 16,
    syncToBeat: false,
  },

  mantra: {
    phonetic: 'ONE POINT',
    meaning: 'Singular focused attention',
    repeatInterval: 30,
    pronunciation: 'one point',
    tonality: 'firm',
    delivery: 'internal',
  },

  contraindications: {
    absolute: ['Epilepsy', 'History of seizures'],
    relative: ['Severe anxiety (use anxiety protocol first)'],
    drugInteractions: ['May be synergistic with stimulants — use caution'],
    specialPopulations: ['Safe for students, professionals'],
  },

  citations: [
    'Beauchene, C. et al. (2016). Binaural beats and beta-frequency attention. Psychophysiology, 53(9), 1346-1353.',
    'Lubar, J. & Shouse, M. (1976). EEG and behavioral changes in hyperkinetic child. Biofeedback Self-Regulation, 1(4), 405-425.',
  ],

  expectedTimeline: 'Session 1: Noticeable focus within 10 minutes. Week 1: 25-40% improved attention span. Week 4+: Sustained focus improvement.',
  frequencyOfUse: '3-5x/week during work/study periods. Daily during intensive projects.',
  optimalTiming: 'Morning or early afternoon (before 3PM). 30 minutes before demanding cognitive work.',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. LEARNING CONSOLIDATION v5 (DEEP)
// ─────────────────────────────────────────────────────────────────────────────

export const learningConsolidation: ProtocolSpec = {
  id: 'learning_v5_deep',
  name: 'Learning Consolidation Protocol v5.0',
  category: 'performance_focus',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'II',

  usageGoal: '30-50% faster learning speed, improved long-term retention, enhanced retrieval and memory encoding.',

  algorithmDescription: '5Hz Theta base with 40Hz Gamma phase coupling for hippocampal-cortical dialogue. Deep theta immersion with solfeggio MI overlay for emotional anchoring of memories.',

  researchContext: 'Theta-Gamma phase coupling is the biological mechanism of the hippocampus for memory consolidation. Isochronic duty cycle enhances encoding strength and synaptic marking (Klimesch 2006, Born & Wilhelm 2012).',

  targetBands: ['theta', 'gamma'],
  neurochemistryTargets: ['BDNF ↑', 'CREB activation', 'Synaptic plasticity ↑'],

  phases: [
    phase(0, 'Theta Descent')
      .duration(300)
      .beat([10, 7])
      .carrier(CARRIERS.warm)
      .noise('pink', 0.12)
      .gentleCarrierOctaves()
      .purpose('Gradual descent from alpha to theta encoding state')
      .build(),

    phase(1, 'Theta-Gamma Consolidation')
      .duration(600)
      .beat(5)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.2)
      .overlays([40, SOLFEGGIO.MI], 0.3)
      .deepCarrierOctaves()
      .deepOverlayOctaves()
      .harmonics()
      .isochronic(0.4)
      .spatial('rotate')
      .hybrid(0.3)
      .purpose('Peak theta-gamma phase coupling for hippocampal replay')
      .build(),

    phase(2, 'Memory Lock & Integration')
      .duration(300)
      .beat(5)
      .carrier(CARRIERS.warm)
      .noise('brown', 0.15)
      .overlays([SOLFEGGIO.MI], 0.2)
      .gentleCarrierOctaves()
      .purpose('Lock in memories at neuroplastic level')
      .build(),
  ],

  breathwork: {
    name: 'Memory Bridge',
    ratio: [5, 0, 5, 0],
    description: 'HRV coherence breath for memory encoding',
    cycleDuration: 10,
    syncToBeat: false,
  },

  mantra: {
    phonetic: 'AH-HA',
    meaning: 'Encoding moments of insight',
    repeatInterval: 10,
    pronunciation: 'ah-ha',
    tonality: 'light',
    delivery: 'internal',
  },

  contraindications: {
    absolute: ['Epilepsy'],
    relative: [],
    drugInteractions: [],
    specialPopulations: [],
  },

  citations: [
    'Klimesch, W. (2006). Theta and alpha oscillations in the human brain. Neuroscience & Biobehavioral Reviews, 30(2), 224-240.',
    'Born, J. & Wilhelm, I. (2012). System consolidation of memory during sleep. Psychological Research, 76(2), 192-203.',
  ],

  expectedTimeline: 'Session 1: Noticeable encoding within 5 minutes. Week 1: 20-30% better retention. Week 2+: Long-term consolidation gains.',
  frequencyOfUse: '2-3x/week post-learning. Daily during intensive study periods.',
  optimalTiming: 'Immediately post-learning session or within 4 hours.',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. ADHD FOCUS ENHANCER v5
// ─────────────────────────────────────────────────────────────────────────────

export const adhdFocus: ProtocolSpec = {
  id: 'adhd_v5_focus',
  name: 'ADHD Focus Protocol v5.0',
  category: 'performance_focus',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'II',

  usageGoal: '+200-400% sustained attention duration, reduced impulsivity, improved executive control and impulse inhibition.',

  algorithmDescription: '12-15Hz SMR base with Beta (15Hz) and Gamma (40Hz) bursts for maximum impulse inhibition. Multi-modal entrainment with isochronic precision for ADHD treatment.',

  researchContext: 'SMR training (FDA-cleared for ADHD) reduces motor interference, Beta enhances vigilance, Gamma provides cognitive binding. Evidence Level II clinical efficacy established (Arns et al. 2009).',

  targetBands: ['smr', 'beta', 'gamma'],
  neurochemistryTargets: ['Dopamine ↑↑', 'GABA ↑', 'Norepinephrine ↑'],

  phases: [
    phase(0, 'SMR Foundation')
      .duration(600)
      .beat(14)
      .carrier(CARRIERS.bright)
      .noise('white', 0.08)
      .overlays([SCHUMANN_BASE], 0.1)
      .gentleCarrierOctaves()
      .isochronic(0.6)
      .purpose('Establish SMR baseline for impulse control')
      .build(),

    phase(1, 'Beta-Gamma Impulse Lock')
      .duration(600)
      .beat(15)
      .carrier(CARRIERS.bright)
      .noise('white', 0.08)
      .overlays([40, 80], 0.2)
      .carrierOctaves({ enabled: true, octavesAbove: 1, octavesBelow: 1, gainRolloff: 0.7, detuneSpread: 4 })
      .deepOverlayOctaves()
      .harmonics()
      .isochronic(0.5)
      .spatial('fixed')
      .hybrid(0.35)
      .purpose('Beta vigilance + Gamma binding for sustained attention')
      .build(),
  ],

  breathwork: {
    name: 'Impulse Control',
    ratio: [2, 0, 2, 0],
    description: 'Sharp inhales for impulse inhibition activation',
    cycleDuration: 4,
    syncToBeat: false,
  },

  mantra: {
    phonetic: 'LOCK IN',
    meaning: 'Attention fixed and focused',
    repeatInterval: 10,
    pronunciation: 'lock in',
    tonality: 'firm',
    delivery: 'internal',
  },

  contraindications: {
    absolute: ['Epilepsy', 'Tics or Tourettes'],
    relative: [],
    drugInteractions: ['Synergistic with ADHD medications — consult physician'],
    specialPopulations: ['Safe for children and adolescents (with supervision)'],
  },

  citations: [
    'Arns, M. et al. (2009). Efficacy of neurofeedback for ADHD. The Lancet, 373(9674), 1671-1672.',
    'Lubar, J. & Shouse, M. (1976). EEG and behavioral changes in the hyperkinetic child receiving central stimulant medication.',
  ],

  expectedTimeline: 'Session 1: 15-30% attention improvement. Week 1: Sustained focus gains. Week 4+: Cumulative impulse control benefits.',
  frequencyOfUse: '3-5x/week for ongoing management. Daily during high-demand periods.',
  optimalTiming: 'Morning for sustained all-day benefit. 30 minutes before challenging tasks.',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. WORKING MEMORY EXPANSION v5
// ─────────────────────────────────────────────────────────────────────────────

export const workingMemory: ProtocolSpec = {
  id: 'working_memory_v5',
  name: 'Working Memory Expansion Protocol v5.0',
  category: 'performance_focus',
  version: '2.0.0',
  durationSeconds: 900,
  evidenceLevel: 'II',

  usageGoal: '50-100% increase in working memory span, better mental juggling of multiple items, enhanced cognitive load capacity.',

  algorithmDescription: '40Hz Gamma base with 20Hz Beta harmonic stacking for multi-item coordination in prefrontal cortex. Deep octave layering enhances feature binding across distributed neural populations.',

  researchContext: 'Gamma oscillations facilitate multi-item coordination in the prefrontal cortex. Beta harmonics enhance integration and sustained working memory maintenance across delay periods (Prefrontal Gamma Research).',

  targetBands: ['beta', 'gamma'],
  neurochemistryTargets: ['Dopamine ↑', 'Acetylcholine ↑', 'GABA ↑'],

  phases: [
    phase(0, 'Gamma Establishment')
      .duration(300)
      .beat(35)
      .carrier(CARRIERS.high)
      .noise('white', 0.05)
      .deepCarrierOctaves()
      .purpose('Establish baseline gamma for feature binding')
      .build(),

    phase(1, 'Multi-Frequency Buffer')
      .duration(600)
      .beat(40)
      .carrier(CARRIERS.high)
      .noise('white', 0.06)
      .overlays([20, 80, 120], 0.3)
      .deepCarrierOctaves()
      .deepOverlayOctaves()
      .harmonics()
      .isochronic(0.5)
      .spatial('pendulum')
      .hybrid(0.4)
      .purpose('Maximum working memory buffer; multi-item coordination')
      .build(),
  ],

  breathwork: {
    name: 'Hold',
    ratio: [4, 4, 4, 0],
    description: 'Hold breath on full lungs for cognitive buffer extension',
    cycleDuration: 12,
    syncToBeat: false,
  },

  mantra: {
    phonetic: 'BUFFER FULL',
    meaning: 'Storing maximum data simultaneously',
    repeatInterval: 10,
    pronunciation: 'buff-er full',
    tonality: 'steady',
    delivery: 'internal',
  },

  contraindications: {
    absolute: ['Epilepsy', 'Mania'],
    relative: [],
    drugInteractions: [],
    specialPopulations: [],
  },

  citations: [
    'Prefrontal Gamma Research. Multi-item coordination in working memory networks.',
    'Fries, P. (2015). Rhythm and synchronization in cortical networks. Nature Reviews Neuroscience, 16(1), 20-31.',
  ],

  expectedTimeline: 'Session 1: Subtle buffer enhancement. Week 1: 15-25% span increase. Week 4+: Sustained improvements.',
  frequencyOfUse: '2-3x/week during cognitive demanding tasks.',
  optimalTiming: 'Morning for best results. 30 minutes before mental work.',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. PATTERN RECOGNITION ACCELERATOR v5
// ─────────────────────────────────────────────────────────────────────────────

export const patternRecognition: ProtocolSpec = {
  id: 'pattern_recognition_v5',
  name: 'Pattern Recognition Accelerator v5.0',
  category: 'performance_focus',
  version: '2.0.0',
  durationSeconds: 1000,
  evidenceLevel: 'II',

  usageGoal: '60-80% faster detection of visual and logical patterns, enhanced visual processing speed, improved pattern synthesis.',

  algorithmDescription: '7Hz Theta base with consistent 40Hz Gamma "binding" isochronic micro-pulses for rapid pattern synthesis. Theta facilitates associative lookup while Gamma binds distributed elements into unified patterns.',

  researchContext: 'Theta facilitates associative memory retrieval while Gamma synchrony "binds" distributed neural elements into unified percepts. Isochronic duty cycle optimizes pulse timing and oscillatory strength (Binding Research, FFR Studies).',

  targetBands: ['theta', 'gamma'],
  neurochemistryTargets: ['Norepinephrine ↑', 'Dopamine ↑', 'Acetylcholine ↑'],

  phases: [
    phase(0, 'Theta Pattern Access')
      .duration(300)
      .beat([10, 7])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.12)
      .gentleCarrierOctaves()
      .purpose('Access associative pattern memory via theta')
      .build(),

    phase(1, 'Theta-Gamma Pattern Binding')
      .duration(700)
      .beat(7)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.15)
      .overlays([40, 80], 0.4)
      .deepCarrierOctaves()
      .deepOverlayOctaves()
      .harmonics()
      .isochronic(0.5)
      .spatial('rotate')
      .hybrid(0.35)
      .purpose('Bind pattern elements into unified gestalt')
      .build(),
  ],

  breathwork: {
    name: 'Flow',
    ratio: [4, 0, 4, 0],
    description: 'Circular breathing for pattern flow',
    cycleDuration: 8,
    syncToBeat: false,
  },

  mantra: {
    phonetic: 'SEE PATTERN',
    meaning: 'Pattern recognition emerges naturally',
    repeatInterval: 15,
    pronunciation: 'see pat-tern',
    tonality: 'calm',
    delivery: 'internal',
  },

  contraindications: {
    absolute: ['Epilepsy'],
    relative: [],
    drugInteractions: [],
    specialPopulations: [],
  },

  citations: [
    'Binding Research. Theta-gamma coupling and feature binding in visual cortex.',
    'Singer, W. (2009). Recurrent dynamics in the cerebral cortex. Neuron, 63(1), 98-111.',
  ],

  expectedTimeline: 'Session 1: Subtle pattern enhancement. Week 1: 20-30% speed increase. Week 4+: Intuitive rapid pattern recognition.',
  frequencyOfUse: '2-3x/week. Before pattern-based tasks (chess, programming, analysis).',
  optimalTiming: 'Morning or before analytical work.',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. META-LEARNING PRIME v5
// ─────────────────────────────────────────────────────────────────────────────

export const metaLearning: ProtocolSpec = {
  id: 'meta_learning_v5',
  name: 'Meta-Learning Prime Protocol v5.0',
  category: 'performance_focus',
  version: '2.0.0',
  durationSeconds: 900,
  evidenceLevel: 'II',

  usageGoal: 'Prime brain for accelerated learning, activate metaplastic state for enhanced receptivity and rapid skill acquisition.',

  algorithmDescription: '8Hz Alpha with 7Hz Theta for metaplasticity priming. Prepares brain for optimal learning by creating a "plastic state" where neurons are more receptive to strengthening and formation of new connections.',

  researchContext: "Metaplasticity is the 'plasticity of plasticity' — preparing neurons for more efficient learning. Alpha-theta bridge enables this priming state for accelerated learning curves (Metaplasticity Learning Research).",

  targetBands: ['alpha', 'theta'],
  neurochemistryTargets: ['BDNF ↑', 'NGF ↑', 'Acetylcholine ↑'],

  phases: [
    phase(0, 'Alpha Priming')
      .duration(300)
      .beat(8)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.1)
      .gentleCarrierOctaves()
      .purpose('Establish alpha for receptive state')
      .build(),

    phase(1, 'Alpha-Theta Meta-Plasticity Bridge')
      .duration(600)
      .beat([8, 7])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.15)
      .overlays([SOLFEGGIO.MI], 0.25)
      .gentleCarrierOctaves()
      .gentleOverlayOctaves()
      .spatial('rotate')
      .hybrid(0.3)
      .stochasticJitter(8)
      .purpose('Prime metaplastic state for accelerated learning')
      .build(),
  ],

  breathwork: {
    name: 'Ready',
    ratio: [4, 0, 4, 0],
    description: 'Prepare mind and body for learning activation',
    cycleDuration: 8,
    syncToBeat: false,
  },

  mantra: {
    phonetic: 'OPEN LEARN',
    meaning: 'Brain ready for transformation',
    repeatInterval: 20,
    pronunciation: 'o-pen learn',
    tonality: 'gentle',
    delivery: 'internal',
  },

  contraindications: {
    absolute: [],
    relative: [],
    drugInteractions: [],
    specialPopulations: ['Safe for all ages'],
  },

  citations: [
    'Metaplasticity Learning Research. Preparing neurons for enhanced plasticity.',
    'Bienenstock, E. L., Cooper, L. N., & Munro, P. W. (1982). Theory for the development of neuron selectivity.',
  ],

  expectedTimeline: 'Session 1: Subtle priming. Week 1: 15-25% faster learning. Week 4+: Sustained accelerated learning capacity.',
  frequencyOfUse: '2-3x/week before major learning sessions.',
  optimalTiming: '30 minutes before intensive learning or skill practice.',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT ARRAY
// ─────────────────────────────────────────────────────────────────────────────

export const PERFORMANCE_FOCUS_SPECS: ProtocolSpec[] = [
  professionalFocus,
  learningConsolidation,
  adhdFocus,
  workingMemory,
  patternRecognition,
  metaLearning,
];
