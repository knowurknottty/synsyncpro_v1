/**
 * SynSync Pro — MDMA Mimicry Protocol Specs
 * ============================================
 * Category: mdma_mimicry
 * Protocols targeting serotonergic empathogenic states through brainwave entrainment.
 * Non-pharmacological approach to MDMA's entactogenic warmth and emotional openness.
 *
 * @version 2.0.0
 */

import type { ProtocolSpec } from '../../../audio/dsp/types';
import { phase } from '../../../audio/dsp/phase-builder';
import { CARRIERS, SOLFEGGIO, SCHUMANN } from '../../../audio/dsp/constants';

// ─── 1. Emotional Openness Portal (MDMA Mimic) ────────────────────
export const mdmaMimic: ProtocolSpec = {
  id: 'emotional_openness_portal',
  name: 'Emotional Openness Portal',
  category: 'mdma_mimicry',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'II',
  citations: [
    'Mithoefer, M.C. et al. (2019) "MDMA-assisted psychotherapy for PTSD." Lancet Psychiatry',
    'Gamma, A. et al. (2000) "5-HT modulates emotional processing after MDMA." Ann NY Acad Sci',
  ],
  usageGoal: 'Reduced emotional defenses and deep warmth toward self and others. Replicates MDMA\'s entactogenic quality via raphe nuclei entrainment.',
  algorithmDescription: '5Hz theta base coupled with 7Hz theta-alpha overlay and 40Hz gamma targeting serotonergic nuclei. Heavy stochastic jitter creates organic, wave-like fluctuations mimicking serotonin release dynamics. Spatial rotation generates immersive warmth field. Deep octave layering enriches the harmonic environment.',
  researchContext: 'Replicates MDMA\'s entactogenic warmth via raphe nuclei entrainment. Theta-gamma coupling with serotonergic resonance frequencies induces natural release of serotonin and oxytocin. The 528Hz (DNA repair/transformation) solfeggio overlay amplifies heart-opening effects.',
  targetBands: ['theta', 'gamma'],
  neurochemistryTargets: ['serotonin', 'oxytocin', 'dopamine', 'endorphins'],
  phases: [
    phase(0, 'Heart Opening')
      .duration(180)
      .beat(8)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.10)
      .noCarrierOctaves()
      .overlays([SOLFEGGIO.LA], 0.08)
      .purpose('Alpha settling with 639Hz relationship harmony overlay to open the heart center')
      .build(),

    phase(1, 'Serotonergic Descent')
      .duration(180)
      .beat([8, 5])
      .carrier(CARRIERS.warm)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .overlays([7, SOLFEGGIO.LA], 0.15)
      .spatial('pendulum', 0.03)
      .purpose('Descent to 5Hz theta with 7Hz overlay targeting raphe nuclei serotonin pathways')
      .build(),

    phase(2, 'Entactogenic Peak')
      .duration(540)
      .beat(5)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.06)
      .deepCarrierOctaves()
      .overlays([7, 40], 0.30)
      .deepOverlayOctaves()
      .spatial('rotate', 0.04)
      .stochasticJitter(15)
      .harmonics()
      .purpose('Full theta-gamma coupling for maximum serotonergic-empathogenic entrainment')
      .build(),

    phase(3, 'Emotional Integration')
      .duration(180)
      .beat(5)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .overlays([7], 0.12)
      .spatial('pendulum', 0.02)
      .stochasticJitter(8)
      .purpose('Maintain theta with reduced intensity for emotional processing and integration')
      .build(),

    phase(4, 'Gentle Return')
      .duration(120)
      .beat([5, 10])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.12)
      .noCarrierOctaves()
      .purpose('Gradual alpha return carrying warmth and openness into waking awareness')
      .build(),
  ],
  breathwork: {
    name: 'Feel Breath',
    ratio: [4, 0, 4, 0],
    description: 'Simple equal breathing. Do not suppress emotions. Let everything arise.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'LOVE',
    pronunciation: 'luhv (heartfelt)',
    tonality: 'warm, sincere',
    meaning: 'Genuine connection — unconditional love for self and others',
    repeatInterval: 20,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Current SSRI/SNRI use — serotonergic interaction', 'Bipolar disorder — emotional flooding risk'],
    relative: ['Trauma — emotional opening may surface unprocessed material', 'Social anxiety — reduced defenses may feel overwhelming'],
    drugInteractions: ['SSRIs — serotonergic protocol interaction', 'MAOIs — avoid combination'],
    specialPopulations: ['Not for minors', 'Caution with personality disorders'],
  },
  expectedTimeline: 'Immediate: Warmth and emotional softening. 4 weeks: Natural empathic capacity increase.',
  frequencyOfUse: '2-3 times per week. Allow emotional integration days.',
  masterGain: 0.80,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 2. Empathy Amplifier (Gamma Coherence) ────────────────────────
export const empathyExpansion: ProtocolSpec = {
  id: 'empathy_expansion_gamma_coherence',
  name: 'Empathy Amplifier',
  category: 'mdma_mimicry',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'II',
  citations: [
    'Lutz, A. et al. (2004) "Long-term meditators self-induce high-amplitude gamma synchrony." PNAS',
    'Singer, T. & Lamm, C. (2009) "The social neuroscience of empathy." Ann NY Acad Sci',
  ],
  usageGoal: 'Capacity to feel what others feel. Reduced defensiveness via mirror neuron network gamma coherence.',
  algorithmDescription: 'Strict 40Hz gamma coherence targeting mirror neuron network frequencies with 7Hz theta overlay for emotional depth. Spatial rotation creates empathic scanning field. Stochastic jitter mimics natural mirror neuron burst dynamics.',
  researchContext: 'Strengthens prefrontal-limbic integration for natural compassion. 40Hz gamma is the binding frequency for conscious emotional experience, and when coupled with theta overlay, creates the neural signature of deep empathic resonance observed in experienced meditators.',
  targetBands: ['gamma', 'theta'],
  neurochemistryTargets: ['oxytocin', 'serotonin', 'endorphins'],
  phases: [
    phase(0, 'Empathic Baseline')
      .duration(180)
      .beat(10)
      .carrier(CARRIERS.bright)
      .noise('pink', 0.08)
      .noCarrierOctaves()
      .purpose('Alpha settling to establish compassionate intention before gamma activation')
      .build(),

    phase(1, 'Mirror Network Onset')
      .duration(180)
      .beat([10, 40])
      .carrier(CARRIERS.bright)
      .noise('pink', 0.06)
      .gentleCarrierOctaves()
      .overlays([7], 0.10)
      .spatial('rotate', 0.03)
      .purpose('Ramp from alpha to 40Hz gamma for mirror neuron network engagement')
      .build(),

    phase(2, 'Full Empathic Coherence')
      .duration(540)
      .beat(40)
      .carrier(CARRIERS.bright)
      .noise('pink', 0.04)
      .deepCarrierOctaves()
      .overlays([7], 0.20)
      .deepOverlayOctaves()
      .spatial('rotate', 0.05)
      .stochasticJitter(10)
      .harmonics()
      .purpose('Sustained 40Hz gamma with theta overlay for deep mirror neuron coherence')
      .build(),

    phase(3, 'Compassion Integration')
      .duration(180)
      .beat(40)
      .carrier(CARRIERS.bright)
      .noise('pink', 0.06)
      .gentleCarrierOctaves()
      .overlays([7], 0.12)
      .spatial('rotate', 0.02)
      .purpose('Reduce intensity while maintaining gamma coherence for empathic integration')
      .build(),

    phase(4, 'Grounded Return')
      .duration(120)
      .beat([40, 10])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.10)
      .noCarrierOctaves()
      .purpose('Alpha return carrying empathic capacity into social interaction')
      .build(),
  ],
  breathwork: {
    name: 'Mirror Breath',
    ratio: [5, 5, 5, 5],
    description: 'Box breathing to stabilize empathic awareness. Speak from empathy.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'WE',
    pronunciation: 'wee (shared)',
    tonality: 'warm, unified',
    meaning: 'Unified perspective — dissolving the barrier between self and other',
    repeatInterval: 30,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Active psychosis'],
    relative: ['Empathic burnout — may need boundaries first', 'Codependency — maintain healthy separation'],
    drugInteractions: [],
    specialPopulations: [],
  },
  expectedTimeline: 'Immediate: Heightened emotional sensitivity. 3 weeks: Natural empathic capacity.',
  frequencyOfUse: '3-4 times per week. Best before social interactions.',
  masterGain: 0.78,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 3. Entactic Warmth & Heart Opening ────────────────────────────
export const entacticWarmth: ProtocolSpec = {
  id: 'entactic_warmth_love_frequency',
  name: 'Entactic Warmth & Heart Opening',
  category: 'mdma_mimicry',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'III',
  citations: [
    'McCraty, R. et al. (2009) "The coherent heart: Heart-brain interactions." Integral Review',
    'Lehrer, P.M. (2007) "Heart rate variability biofeedback." Biofeedback',
  ],
  usageGoal: 'Spontaneous gratitude and a sense of belonging. Chest warmth. Entrains the cardiac vagal system for empathogenic heart opening.',
  algorithmDescription: '7Hz theta relaxation lock over 528Hz biological resonance carrier with 40Hz gamma overlay for conscious heart awareness. Harmonic stacking creates rich overtone series at heart-resonant frequencies. Spatial pendulum mimics heartbeat-like rhythm.',
  researchContext: 'Entrains the cardiac vagal system for empathogenic heart opening. The 528Hz carrier resonates with biological repair frequencies. Theta-gamma coupling with cardiac vagal entrainment produces the chest warmth and spontaneous gratitude associated with MDMA\'s entactogenic phase.',
  targetBands: ['theta', 'gamma'],
  neurochemistryTargets: ['serotonin', 'oxytocin', 'endorphins', 'GABA'],
  phases: [
    phase(0, 'Heart Center Focus')
      .duration(180)
      .beat(10)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.08)
      .noCarrierOctaves()
      .overlays([SOLFEGGIO.SOL], 0.10)
      .purpose('Alpha with 528Hz overlay to bring attention to heart center')
      .build(),

    phase(1, 'Vagal Activation')
      .duration(180)
      .beat([10, 7])
      .carrier(CARRIERS.warm)
      .noise('pink', 0.06)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.SOL, SOLFEGGIO.LA], 0.15)
      .spatial('pendulum', 0.03)
      .harmonics()
      .purpose('Theta descent with heart-resonant solfeggio stack for cardiac vagal engagement')
      .build(),

    phase(2, 'Heart Resonance Peak')
      .duration(540)
      .beat(7)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.04)
      .deepCarrierOctaves()
      .overlays([40, SOLFEGGIO.SOL], 0.25)
      .deepOverlayOctaves()
      .spatial('pendulum', 0.02)
      .stochasticJitter(8)
      .harmonics()
      .purpose('Full theta-gamma coupling over heart resonance for maximum entactic warmth')
      .build(),

    phase(3, 'Gratitude Sustain')
      .duration(180)
      .beat(7)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.06)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.SOL], 0.10)
      .spatial('pendulum', 0.015)
      .harmonics()
      .purpose('Sustain heart opening with reduced intensity for gratitude consolidation')
      .build(),

    phase(4, 'Warm Return')
      .duration(120)
      .beat([7, 10])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.10)
      .noCarrierOctaves()
      .purpose('Alpha return carrying chest warmth and gratitude into embodied daily life')
      .build(),
  ],
  breathwork: {
    name: 'Heart-Open Breath',
    ratio: [6, 0, 6, 0],
    description: 'Breathe into the chest. Feel warmth expanding with each cycle.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'THANKS',
    pronunciation: 'thanks (deeply felt)',
    tonality: 'warm, grateful',
    meaning: 'Belonging — spontaneous gratitude for existence itself',
    repeatInterval: 15,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Recent cardiac event — vagal stimulation contraindicated'],
    relative: ['Heart conditions — monitor vagal response', 'Emotional trauma — warmth may surface grief'],
    drugInteractions: ['Beta blockers — vagal interaction', 'SSRIs — serotonergic overlap'],
    specialPopulations: [],
  },
  expectedTimeline: 'Immediate: Chest warmth and gratitude. 2 weeks: Natural heart opening tendency.',
  frequencyOfUse: 'Daily. Best as morning heart practice or before connection.',
  masterGain: 0.78,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── Category Export ────────────────────────────────────────────────
export const MDMA_MIMICRY_SPECS: ProtocolSpec[] = [
  mdmaMimic,
  empathyExpansion,
  entacticWarmth,
];
