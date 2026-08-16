/**
 * SynSync Pro — Stimulant Mimicry Protocol Specs
 * =================================================
 * Category: stimulant_mimicry
 * Non-pharmacological protocols mimicking stimulant focus and motivation.
 * Beta-gamma entrainment for prefrontal activation without chemical crash.
 *
 * @version 2.0.0
 */

import type { ProtocolSpec } from '../../../audio/dsp/types';
import { phase } from '../../../audio/dsp/phase-builder';
import { CARRIERS, SOLFEGGIO } from '../../../audio/dsp/constants';

// ─── 1. Sustained Focus (Stimulant Mimic) ──────────────────────────
export const stimulantMimic: ProtocolSpec = {
  id: 'sustained_focus_activator',
  name: 'Sustained Focus (Stimulant Mimic)',
  category: 'stimulant_mimicry',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'II',
  citations: [
    'Arns, M. et al. (2009) "Efficacy of neurofeedback treatment in ADHD: the effects on inattention, impulsivity and hyperactivity." Clinical EEG and Neuroscience',
    'Vernon, D. et al. (2003) "The effect of training distinct neurofeedback protocols on aspects of cognitive performance." Int J Psychophysiol',
  ],
  usageGoal: 'Sustainable focus without chemical jitteriness or crash. Non-stimulant alternative for 90+ minutes of single-tasking.',
  algorithmDescription: '20Hz beta primary with 40Hz gamma overlay via hybrid isochronic delivery for maximum prefrontal drive. Multi-phase progression: alpha warm-up → beta activation → sustained beta-gamma focus → clean wind-down. Stochastic jitter prevents entrainment fatigue.',
  researchContext: 'Increases prefrontal activity without massive dopamine flooding. Beta-gamma entrainment activates the same dorsolateral prefrontal circuits as stimulants but through cortical resonance rather than neurotransmitter release, producing focus without the crash.',
  targetBands: ['beta', 'gamma'],
  neurochemistryTargets: ['dopamine', 'norepinephrine', 'acetylcholine'],
  phases: [
    phase(0, 'Neural Warm-Up')
      .duration(120)
      .beat(10)
      .carrier(CARRIERS.bright)
      .noise('pink', 0.08)
      .noCarrierOctaves()
      .purpose('Brief alpha warm-up to prime cortex before beta activation')
      .build(),

    phase(1, 'Beta Ignition')
      .duration(180)
      .beat([10, 20])
      .carrier(CARRIERS.bright)
      .isochronic(0.45)
      .noise('pink', 0.06)
      .gentleCarrierOctaves()
      .purpose('Rapid ramp to 20Hz beta with isochronic drive for prefrontal activation')
      .build(),

    phase(2, 'Sustained Focus')
      .duration(600)
      .beat(20)
      .carrier(CARRIERS.bright)
      .isochronic(0.4)
      .noise('pink', 0.04)
      .deepCarrierOctaves()
      .overlays([40], 0.25)
      .gentleOverlayOctaves()
      .spatial('rotate', 0.02)
      .stochasticJitter(8)
      .harmonics()
      .purpose('Maximum sustained beta-gamma focus — isochronic + spatial for unbreakable concentration')
      .build(),

    phase(3, 'Clean Wind-Down')
      .duration(300)
      .beat([20, 12])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .purpose('Gradual descent to SMR for clean exit — no crash, sustained calm alertness')
      .build(),
  ],
  breathwork: {
    name: 'Focus Breath',
    ratio: [4, 0, 4, 0],
    description: 'Simple equal breathing. Silence phone. Single task only.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'ONE',
    pronunciation: 'wun (sharp, decisive)',
    tonality: 'clear, pointed',
    meaning: 'Sustainable flow — one task, one focus, one breath',
    repeatInterval: 60,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Mania or hypomania — beta/gamma may exacerbate'],
    relative: ['Anxiety disorders — high-frequency may increase arousal', 'Insomnia — do not use within 4 hours of bedtime'],
    drugInteractions: ['Stimulants — additive effect, reduce dose if combining', 'Caffeine — may amplify jitteriness'],
    specialPopulations: ['ADHD — may be especially effective as non-pharmaceutical alternative'],
  },
  expectedTimeline: 'Immediate: Focus onset within 5 minutes. 2 weeks: Reliable sustained attention.',
  frequencyOfUse: 'Daily for work sessions. Max 2 sessions/day with 4-hour gap.',
  masterGain: 0.82,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 2. Motivation Amplifier (Dopamine Drive) ──────────────────────
export const motivationDopamineDrive: ProtocolSpec = {
  id: 'motivation_dopamine_drive',
  name: 'Motivation Amplifier',
  category: 'stimulant_mimicry',
  version: '2.0.0',
  durationSeconds: 900,
  evidenceLevel: 'II',
  citations: [
    'Berridge, K.C. (2007) "The debate over dopamine\'s role in reward." Psychopharmacology',
    'Salamone, J.D. & Correa, M. (2012) "The mysterious motivational functions of mesolimbic dopamine." Neuron',
  ],
  usageGoal: 'Overcome procrastination without chemical rush. Targeted activation of nucleus accumbens motivation pathway.',
  algorithmDescription: '20Hz beta primary activation targeting ventral tegmental area → nucleus accumbens dopamine pathway. Harmonic stacking creates rich frequency environment for maximum dopaminergic drive. Multi-phase design: grounding → motivation ramp → sustained drive → action launch.',
  researchContext: 'Dopamine tone elevation in motivation circuits. 20Hz beta specifically activates the mesolimbic pathway responsible for "wanting" and goal-pursuit. Unlike stimulants, entrainment-based activation doesn\'t deplete dopamine stores.',
  targetBands: ['beta'],
  neurochemistryTargets: ['dopamine', 'norepinephrine'],
  phases: [
    phase(0, 'Intention Setting')
      .duration(120)
      .beat(10)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.06)
      .noCarrierOctaves()
      .purpose('Brief alpha to set clear intention and goal before motivation activation')
      .build(),

    phase(1, 'Dopamine Ramp')
      .duration(180)
      .beat([10, 20])
      .carrier(CARRIERS.warm)
      .noise('pink', 0.04)
      .gentleCarrierOctaves()
      .harmonics()
      .spatial('rotate', 0.03)
      .purpose('Progressive beta ramp activating ventral tegmental → accumbens pathway')
      .build(),

    phase(2, 'Drive State')
      .duration(420)
      .beat(20)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.03)
      .deepCarrierOctaves()
      .stochasticJitter(10)
      .harmonics()
      .spatial('rotate', 0.04)
      .purpose('Sustained 20Hz beta with full harmonic stack for maximum motivation drive')
      .build(),

    phase(3, 'Action Launch')
      .duration(180)
      .beat(20)
      .carrier(CARRIERS.bright)
      .noise('pink', 0.04)
      .gentleCarrierOctaves()
      .harmonics()
      .purpose('Maintain beta as session ends — launch directly into action without cooldown')
      .build(),
  ],
  breathwork: {
    name: 'Drive Breath',
    ratio: [2, 0, 2, 0],
    description: 'Sharp, energetic inhales. Short rapid cycles to activate sympathetic drive.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'MOVE',
    pronunciation: 'moov (forceful)',
    tonality: 'commanding, energetic',
    meaning: 'Action potential — transform intention into movement NOW',
    repeatInterval: 10,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Mania', 'Uncontrolled hypertension'],
    relative: ['Anxiety — energizing protocols may amplify', 'Cardiac conditions — sympathetic activation'],
    drugInteractions: ['Stimulants — additive', 'MAOIs — dopaminergic interaction'],
    specialPopulations: [],
  },
  expectedTimeline: 'Immediate: Motivation surge within 5 minutes. 3 weeks: Reliable anti-procrastination tool.',
  frequencyOfUse: 'As needed. Max 3 sessions/day.',
  masterGain: 0.82,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 3. Hyperfocus State (Ultimate Concentration) ──────────────────
export const hyperfocusUltimate: ProtocolSpec = {
  id: 'hyperfocus_ultimate_concentration',
  name: 'Hyperfocus State',
  category: 'stimulant_mimicry',
  version: '2.0.0',
  durationSeconds: 1500,
  evidenceLevel: 'III',
  citations: [
    'Gruzelier, J. (2009) "A theory of alpha/theta neurofeedback, creative performance enhancement." Neuroscience Letters',
    'Egner, T. & Gruzelier, J. (2004) "EEG biofeedback of low beta band components." Applied Psychophysiology and Biofeedback',
  ],
  usageGoal: '3-4 hours of undeniable concentration where the external world fades. INTENSE — for experienced users only.',
  algorithmDescription: '30Hz high-beta primary with 20Hz and 40Hz overlay stack via isochronic delivery for maximum prefrontal gamma-beta synchrony. Creates unbreakable attention lock through multi-frequency beta-gamma entrainment. Deep octave layering and spatial rotation for full immersion.',
  researchContext: 'Creates maximum prefrontal activation and sustained dopamine engagement. The 20-30-40Hz triad activates the full beta-gamma spectrum simultaneously, producing the "zone" state athletes and programmers describe as effortless hyperfocus. WARNING: Intense protocol — ensure hydration and planned breaks.',
  targetBands: ['beta', 'gamma'],
  neurochemistryTargets: ['dopamine', 'norepinephrine', 'acetylcholine', 'glutamate'],
  phases: [
    phase(0, 'Warm-Up')
      .duration(120)
      .beat(12)
      .carrier(CARRIERS.bright)
      .noise('pink', 0.06)
      .noCarrierOctaves()
      .purpose('SMR warm-up to prime cortex before intense beta-gamma activation')
      .build(),

    phase(1, 'Beta Ramp')
      .duration(180)
      .beat([12, 30])
      .carrier(CARRIERS.bright)
      .isochronic(0.4)
      .noise('pink', 0.04)
      .gentleCarrierOctaves()
      .overlays([20], 0.15)
      .purpose('Aggressive ramp to 30Hz high-beta with 20Hz floor for full beta activation')
      .build(),

    phase(2, 'Hyperfocus Lock')
      .duration(900)
      .beat(30)
      .carrier(CARRIERS.bright)
      .isochronic(0.35)
      .noise('pink', 0.03)
      .deepCarrierOctaves()
      .overlays([20, 40], 0.40)
      .deepOverlayOctaves()
      .spatial('rotate', 0.03)
      .stochasticJitter(8)
      .harmonics()
      .purpose('Maximum 20-30-40Hz triad for unbreakable hyperfocus lock — the external world ceases to exist')
      .build(),

    phase(3, 'Sustained Hold')
      .duration(180)
      .beat(30)
      .carrier(CARRIERS.bright)
      .isochronic(0.4)
      .noise('pink', 0.04)
      .gentleCarrierOctaves()
      .overlays([40], 0.20)
      .purpose('Maintain hyperfocus at slightly reduced intensity for clean sustainability')
      .build(),

    phase(4, 'Exit Ramp')
      .duration(120)
      .beat([30, 12])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.08)
      .noCarrierOctaves()
      .purpose('Controlled descent to SMR — prevent abrupt cognitive crash')
      .build(),
  ],
  breathwork: {
    name: 'Hyperfocus Breath',
    ratio: [2, 0, 2, 0],
    description: 'Rapid micro-breaths. Only the task exists. Everything else dissolves.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'LOCK',
    pronunciation: 'lok (sharp, clicking)',
    tonality: 'decisive, metallic',
    meaning: 'Unbreakable focus — attention locked on target with no escape',
    repeatInterval: 10,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Mania or psychosis', 'Seizure disorders — intense gamma component', 'Uncontrolled anxiety'],
    relative: ['First-time users — start with Stimulant Mimic first', 'Cardiac conditions — sustained sympathetic activation', 'Not for use within 6 hours of bedtime'],
    drugInteractions: ['Stimulants — potentially dangerous synergy at this intensity', 'Caffeine — excessive arousal risk'],
    specialPopulations: ['Experienced practitioners only', 'Must hydrate during session'],
  },
  expectedTimeline: 'Immediate: Deep focus within 5 minutes. Session: 2-4 hours productive output.',
  frequencyOfUse: 'Max once daily. Not recommended more than 4x/week — allow cortical recovery.',
  masterGain: 0.80,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── Category Export ────────────────────────────────────────────────
export const STIMULANT_MIMICRY_SPECS: ProtocolSpec[] = [
  stimulantMimic,
  motivationDopamineDrive,
  hyperfocusUltimate,
];
