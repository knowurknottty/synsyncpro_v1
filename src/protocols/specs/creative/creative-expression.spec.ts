/**
 * SynSync Pro — Creative Expression Protocol Specs
 * ==================================================
 * Category: creative_expression
 * Protocols targeting creative flow, divergent thinking, and artistic inspiration.
 *
 * @version 2.0.0
 */

import type { ProtocolSpec } from '../../../audio/dsp/types';
import { phase } from '../../../audio/dsp/phase-builder';
import { CARRIERS, DSP_DEFAULTS, SOLFEGGIO, OVERLAY_PRESETS } from '../../../audio/dsp/constants';

// ─── 1. Creative Flow Inducer ──────────────────────────────────────
export const creativeFlow: ProtocolSpec = {
  id: 'creative_flow_inducer',
  name: 'Creative Flow Inducer',
  category: 'creative_expression',
  version: '2.0.0',
  durationSeconds: 2400,
  evidenceLevel: 'III',
  citations: [
    'Fink, A. & Benedek, M. (2014) "EEG alpha power and creative ideation." Neuroscience & Biobehavioral Reviews',
    'Dietrich, A. (2004) "The cognitive neuroscience of creativity." Psychonomic Bulletin & Review',
  ],
  usageGoal: 'Induce creative flow state for writing, composing, designing, or problem-solving. Enhances divergent thinking and idea generation.',
  algorithmDescription: 'Alpha-theta border training (7-10Hz) with Schumann resonance anchoring. 741Hz solfeggio (intuition) and 528Hz (transformation) overlays. Stochastic jitter prevents pattern fixation, promoting novel associations.',
  researchContext: 'Creative insight correlates with alpha power increases in prefrontal cortex and alpha-theta crossover states. The "aha moment" is preceded by alpha burst followed by gamma spike. This protocol cultivates the alpha-dominant state from which creative breakthroughs emerge.',
  targetBands: ['theta', 'alpha'],
  neurochemistryTargets: ['dopamine', 'serotonin', 'anandamide'],
  phases: [
    phase(0, 'Mental Declutter')
      .duration(300)
      .beat(10)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.12)
      .noCarrierOctaves()
      .purpose('Alpha reset to clear mental clutter and analytical rigidity')
      .build(),

    phase(1, 'Divergent Thinking')
      .duration(600)
      .beat(7.83)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.10)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.TI, SOLFEGGIO.SOL], 0.10)
      .spatial('rotate', 0.04)
      .stochasticJitter(15)
      .purpose('Schumann resonance with intuition overlay for free-associative ideation')
      .build(),

    phase(2, 'Creative Immersion')
      .duration(900)
      .beat(8)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.TI, SOLFEGGIO.SOL, SOLFEGGIO.SI], 0.12)
      .spatial('pendulum', 0.03)
      .stochasticJitter(10)
      .purpose('Alpha-theta border for sustained creative immersion and pattern recognition')
      .build(),

    phase(3, 'Insight Harvest')
      .duration(360)
      .beat([8, 10])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.06)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.SOL], 0.06)
      .purpose('Gentle alpha return to capture and consolidate creative insights')
      .build(),

    phase(4, 'Alert Return')
      .duration(240)
      .beat(10)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.10)
      .noCarrierOctaves()
      .purpose('Alert alpha for transitioning creative output into action')
      .build(),
  ],
  breathwork: {
    name: 'Creative Breath',
    ratio: [4, 2, 6, 2],
    description: 'Extended exhale to relax analytical mind. Inhale inspiration, exhale resistance.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'AH',
    pronunciation: 'ahhh (open, expansive)',
    tonality: 'open, resonant',
    meaning: 'The creative syllable — opens throat chakra and expressive channels',
    repeatInterval: 10,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: ['Psychosis — monitor for loosening of associations'],
    drugInteractions: [],
    specialPopulations: [],
  },
  expectedTimeline: 'Immediate: Enhanced idea flow within 10 minutes. 2 weeks: Habitual creative access.',
  frequencyOfUse: 'Daily during creative projects. Best used before creative work sessions.',
  masterGain: 0.80,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: false,
};

// ─── 2. Musical Inspiration Protocol ───────────────────────────────
export const musicalInspiration: ProtocolSpec = {
  id: 'musical_inspiration',
  name: 'Musical Inspiration',
  category: 'creative_expression',
  version: '2.0.0',
  durationSeconds: 1800,
  evidenceLevel: 'IV',
  citations: [
    'Limb, C.J. & Braun, A.R. (2008) "Neural substrates of spontaneous musical performance: An fMRI study of jazz improvisation." PLoS ONE',
  ],
  usageGoal: 'Enhance musical creativity, improvisation, and compositional flow. Deactivates inner critic for uninhibited expression.',
  algorithmDescription: 'Theta-dominant entrainment (6Hz) with harmonic stacking and 528Hz overlay tuned to musical intervals. Deep octave layering creates a rich harmonic field that stimulates auditory cortex creativity.',
  researchContext: 'Jazz improvisation studies show deactivation of dorsolateral prefrontal cortex (inner critic) and activation of medial prefrontal cortex (self-expression). Theta states facilitate this pattern of uninhibited creative expression.',
  targetBands: ['theta', 'alpha'],
  neurochemistryTargets: ['dopamine', 'endorphins'],
  phases: [
    phase(0, 'Listening State')
      .duration(300)
      .beat(10)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.08)
      .noCarrierOctaves()
      .purpose('Calm alpha to transition from everyday mind to musical receptivity')
      .build(),

    phase(1, 'Inner Critic Release')
      .duration(360)
      .beat([10, 6])
      .carrier(CARRIERS.warm)
      .noise('pink', 0.10)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.SOL], 0.10)
      .harmonics()
      .purpose('Descend to theta to deactivate critical judgment and inner editor')
      .build(),

    phase(2, 'Improvisational Flow')
      .duration(720)
      .beat(6)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.06)
      .deepCarrierOctaves()
      .overlays([SOLFEGGIO.SOL, SOLFEGGIO.LA], 0.12)
      .spatial('rotate', 0.02)
      .stochasticJitter(12)
      .harmonics()
      .purpose('Deep theta with rich harmonics for uninhibited musical improvisation')
      .build(),

    phase(3, 'Compositional Integration')
      .duration(420)
      .beat([6, 10])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.SOL], 0.06)
      .purpose('Alpha return to capture and structure musical ideas into compositions')
      .build(),
  ],
  breathwork: {
    name: 'Rhythmic Breath',
    ratio: [3, 1, 3, 1],
    description: 'Musical 3/4 breathing pattern to entrain rhythmic awareness.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'SA-RE-GA-MA',
    pronunciation: 'sah-reh-gah-mah',
    tonality: 'ascending, melodic',
    meaning: 'Indian solfege syllables to activate tonal memory and melodic thinking',
    repeatInterval: 8,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: ['Auditory processing disorders — adjust volume carefully'],
    drugInteractions: [],
    specialPopulations: [],
  },
  expectedTimeline: 'Immediate: Enhanced musical ideation. 3 weeks: Improved improvisational ability.',
  frequencyOfUse: '3-4 times per week. Best used before practice or composition sessions.',
  masterGain: 0.78,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── Category Export ────────────────────────────────────────────────
export const CREATIVE_EXPRESSION_SPECS: ProtocolSpec[] = [
  creativeFlow,
  musicalInspiration,
];
