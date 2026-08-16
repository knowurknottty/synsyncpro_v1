/**
 * SynSync Pro — Isochronic (Speakers) Protocol Specs
 * ====================================================
 * Category: isochronic_speakers
 * Protocols designed for speaker playback (no headphones required).
 * Uses isochronic tones and monaural beats instead of binaural.
 *
 * @version 2.0.0
 */

import type { ProtocolSpec } from '../../../audio/dsp/types';
import { phase } from '../../../audio/dsp/phase-builder';
import { CARRIERS, DSP_DEFAULTS, SOLFEGGIO, OVERLAY_PRESETS } from '../../../audio/dsp/constants';

// ─── 1. Speaker Focus Session ──────────────────────────────────────
export const speakerFocus: ProtocolSpec = {
  id: 'speaker_focus_isochronic',
  name: 'Speaker Focus (Isochronic)',
  category: 'isochronic_speakers',
  version: '2.0.0',
  durationSeconds: 1800,
  evidenceLevel: 'III',
  citations: [
    'Huang, T.L. & Charyton, C. (2008) "A comprehensive review of the psychological effects of brainwave entrainment." Alternative Therapies in Health and Medicine',
  ],
  usageGoal: 'Enhance focus and concentration using isochronic tones playable through speakers. No headphones required.',
  algorithmDescription: 'Progressive isochronic entrainment from alpha relaxation (10Hz) through SMR (14Hz) to low-beta focus (18Hz). Uses amplitude-modulated pulses audible through any speaker system.',
  researchContext: 'Isochronic tones produce cortical entrainment comparable to binaural beats without requiring stereo separation. Suitable for open-office environments, group sessions, or users who cannot wear headphones.',
  targetBands: ['alpha', 'smr', 'beta'],
  neurochemistryTargets: ['acetylcholine', 'norepinephrine'],
  phases: [
    phase(0, 'Alpha Settling')
      .duration(300)
      .beat(10)
      .carrier(CARRIERS.neutral)
      .isochronic(0.5)
      .noise('pink', 0.12)
      .noCarrierOctaves()
      .purpose('Gentle alpha isochronic to settle the mind before focus ramp')
      .build(),

    phase(1, 'SMR Bridge')
      .duration(300)
      .beat([10, 14])
      .carrier(CARRIERS.bright)
      .isochronic(0.45)
      .noise('pink', 0.10)
      .gentleCarrierOctaves()
      .purpose('Ramp from alpha to SMR for motor stillness and impulse control')
      .build(),

    phase(2, 'Low Beta Focus')
      .duration(600)
      .beat(18)
      .carrier(CARRIERS.bright)
      .isochronic(0.4)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.SOL], 0.08)
      .purpose('Sustained low-beta isochronic for deep focused attention')
      .build(),

    phase(3, 'Focus Sustain')
      .duration(300)
      .beat(16)
      .carrier(CARRIERS.bright)
      .isochronic(0.45)
      .noise('pink', 0.06)
      .gentleCarrierOctaves()
      .purpose('Maintain focused state at slightly lower beta for sustainability')
      .build(),

    phase(4, 'Cool Down')
      .duration(300)
      .beat([16, 10])
      .carrier(CARRIERS.neutral)
      .isochronic(0.5)
      .noise('pink', 0.10)
      .noCarrierOctaves()
      .purpose('Gentle descent from beta back to alpha for smooth session end')
      .build(),
  ],
  breathwork: {
    name: 'Box Breath',
    ratio: [4, 4, 4, 4],
    description: 'Box breathing to anchor focus. Inhale 4, hold 4, exhale 4, hold 4.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'SO-HUM',
    pronunciation: 'soh-hum',
    tonality: 'neutral',
    meaning: 'I am that — anchor attention to breath rhythm',
    repeatInterval: 8,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: ['Epilepsy or seizure history — use with medical supervision'],
    drugInteractions: [],
    specialPopulations: [],
  },
  expectedTimeline: '5-10 minutes: Noticeable focus improvement. 2 weeks daily: Habitual focus response.',
  frequencyOfUse: 'Daily, up to 2 sessions. Best before focused work.',
  masterGain: 0.80,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: false,
};

// ─── 2. Speaker Relaxation Session ─────────────────────────────────
export const speakerRelaxation: ProtocolSpec = {
  id: 'speaker_relaxation_isochronic',
  name: 'Speaker Relaxation (Isochronic)',
  category: 'isochronic_speakers',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'III',
  citations: [
    'Wahbeh, H. et al. (2007) "Binaural beat technology in humans: a pilot study." J Altern Complement Med',
  ],
  usageGoal: 'Deep relaxation using isochronic tones through speakers. Ideal for group meditation or speaker-only environments.',
  algorithmDescription: 'Descending isochronic entrainment from alpha (10Hz) through low-alpha (8Hz) to high-theta (6Hz). Pink noise masking for ambient comfort.',
  researchContext: 'Isochronic relaxation protocols show comparable parasympathetic activation to binaural protocols. Speaker delivery enables group sessions in therapy offices, yoga studios, and home environments.',
  targetBands: ['alpha', 'theta'],
  neurochemistryTargets: ['serotonin', 'GABA'],
  phases: [
    phase(0, 'Alpha Entry')
      .duration(240)
      .beat(10)
      .carrier(CARRIERS.warm)
      .isochronic(0.5)
      .noise('pink', 0.15)
      .noCarrierOctaves()
      .purpose('Isochronic alpha to initiate relaxation response')
      .build(),

    phase(1, 'Deep Alpha')
      .duration(300)
      .beat([10, 8])
      .carrier(CARRIERS.warm)
      .isochronic(0.5)
      .noise('pink', 0.18)
      .gentleCarrierOctaves()
      .purpose('Deepen into low alpha for calm, receptive awareness')
      .build(),

    phase(2, 'Theta Drift')
      .duration(420)
      .beat(6)
      .carrier(CARRIERS.warm)
      .isochronic(0.55)
      .noise('brown', 0.20)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.LA], 0.06)
      .purpose('Theta state for deep relaxation and emotional release')
      .build(),

    phase(3, 'Gentle Return')
      .duration(240)
      .beat([6, 10])
      .carrier(CARRIERS.warm)
      .isochronic(0.5)
      .noise('pink', 0.12)
      .noCarrierOctaves()
      .purpose('Gradual return to alert alpha for grounded session end')
      .build(),
  ],
  breathwork: {
    name: '4-7-8 Relaxation Breath',
    ratio: [4, 7, 8, 0],
    description: 'Inhale 4 counts, hold 7, exhale 8. Activates parasympathetic nervous system.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'OMMM',
    pronunciation: 'ohhh-mmm',
    tonality: 'deep, resonant',
    meaning: 'Universal vibration of peace and oneness',
    repeatInterval: 12,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: ['Severe dissociative disorders — monitor for grounding'],
    drugInteractions: [],
    specialPopulations: [],
  },
  expectedTimeline: 'Immediate: Relaxation within 5 minutes. 1 week daily: Deeper relaxation response.',
  frequencyOfUse: 'Daily. Best in evening or before rest.',
  masterGain: 0.75,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: false,
};

// ─── 3. ISO: Settle & Calm ─────────────────────────────────────────
export const isoSettleCalm: ProtocolSpec = {
  id: 'iso_settle_calm',
  name: 'ISO: Settle & Calm',
  category: 'isochronic_speakers',
  version: '2.0.0',
  durationSeconds: 600,
  evidenceLevel: 'II',
  citations: [
    'Huang, T.L. & Charyton, C. (2008) "A comprehensive review of the psychological effects of brainwave entrainment." Alt Therapies',
  ],
  usageGoal: 'Encourage a calmer pre-event atmosphere. Speaker-optimized alpha stabilization for group environments.',
  algorithmDescription: '9Hz alpha isochronic pulses at 50% duty cycle with soft 10ms edge shaping over 440Hz concert-pitch carrier. Multi-phase: warm entry → sustained calm → gentle fade. Designed for ambient deployment in waiting rooms, event spaces, and therapy offices.',
  researchContext: 'Alpha stabilization for group environments. 9Hz sits in the relaxed-alertness sweet spot — calm but not drowsy. The 440Hz carrier is universally pleasant and culturally neutral. Soft pulse edges prevent the "clicking" artifact common in cheaper isochronic implementations.',
  targetBands: ['alpha'],
  neurochemistryTargets: ['serotonin', 'GABA'],
  phases: [
    phase(0, 'Warm Entry')
      .duration(120)
      .beat(9)
      .carrier(440)
      .isochronic(0.5)
      .noise('pink', 0.08)
      .noCarrierOctaves()
      .purpose('Gentle 9Hz isochronic onset — ambient and non-intrusive')
      .build(),

    phase(1, 'Sustained Calm')
      .duration(360)
      .beat(9)
      .carrier(440)
      .isochronic(0.5)
      .noise('pink', 0.06)
      .gentleCarrierOctaves()
      .stochasticJitter(6)
      .purpose('Maintained alpha calming pulse — space settles into calm coherence')
      .build(),

    phase(2, 'Gentle Fade')
      .duration(120)
      .beat(9)
      .carrier(440)
      .isochronic(0.5)
      .noise('pink', 0.10)
      .noCarrierOctaves()
      .purpose('Gradual intensity reduction for seamless transition to event start')
      .build(),
  ],
  breathwork: {
    name: 'Natural Breath',
    ratio: [4, 4, 4, 4],
    description: 'Observe the space. Let breathing happen naturally.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'CALM',
    pronunciation: 'kahm',
    tonality: 'neutral, ambient',
    meaning: 'Space clearing — atmosphere settles into receptive calm',
    repeatInterval: 15,
    delivery: 'internal',
  },
  contraindications: { absolute: [], relative: [], drugInteractions: [], specialPopulations: [] },
  expectedTimeline: 'Immediate: Ambient calming within 2 minutes.',
  frequencyOfUse: 'As needed for events. Safe for continuous ambient use.',
  masterGain: 0.70,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: false,
};

// ─── 4. ISO: Breathing Support ─────────────────────────────────────
export const isoBreathingPacing: ProtocolSpec = {
  id: 'iso_breathing_pacing',
  name: 'ISO: Breathing Support',
  category: 'isochronic_speakers',
  version: '2.0.0',
  durationSeconds: 420,
  evidenceLevel: 'II',
  citations: [
    'Lehrer, P.M. & Gevirtz, R. (2014) "Heart rate variability biofeedback." Biofeedback',
  ],
  usageGoal: 'Support slower breathing cadence during guided segments. Coupled amplitude modulation for breath entrainment.',
  algorithmDescription: '8Hz alpha isochronic pulses with macro-amplitude swell at 0.125Hz (8-second breath cycle). The pulse rate entrains alpha relaxation while the macro-swell provides a breathing pace cue audible through speakers. Multi-phase with progressive deepening.',
  researchContext: 'Coupled amplitude modulation for breath support. 6 breaths per minute (0.1Hz) is optimal for HRV coherence, but 0.125Hz (7.5 bpm) is more accessible for beginners. The amplitude swell creates an audible "breathe in... breathe out" rhythm without verbal instruction.',
  targetBands: ['alpha'],
  neurochemistryTargets: ['GABA', 'serotonin'],
  phases: [
    phase(0, 'Breath Sync')
      .duration(120)
      .beat(8)
      .carrier(440)
      .isochronic(0.5)
      .noise('pink', 0.08)
      .noCarrierOctaves()
      .purpose('Establish 8Hz alpha isochronic as breath pacing begins')
      .build(),

    phase(1, 'Paced Breathing')
      .duration(240)
      .beat(8)
      .carrier(440)
      .isochronic(0.5)
      .noise('pink', 0.06)
      .gentleCarrierOctaves()
      .spatial('pendulum', 0.06)
      .purpose('Sustained breath pacing — spatial pendulum mimics inhale/exhale rhythm')
      .build(),

    phase(2, 'Integration')
      .duration(60)
      .beat(8)
      .carrier(440)
      .isochronic(0.5)
      .noise('pink', 0.08)
      .noCarrierOctaves()
      .purpose('Gentle close — breathing rhythm internalized')
      .build(),
  ],
  breathwork: {
    name: 'Paced Breath',
    ratio: [4, 0, 4, 0],
    description: 'Sync with the amplitude swell. Inhale as it rises, exhale as it falls.',
    syncToBeat: true,
  },
  mantra: {
    phonetic: 'SO-HUM',
    pronunciation: 'soh-hum',
    tonality: 'rhythmic, gentle',
    meaning: 'I am — breath awareness anchored to self',
    repeatInterval: 8,
    delivery: 'internal',
  },
  contraindications: { absolute: [], relative: [], drugInteractions: [], specialPopulations: [] },
  expectedTimeline: 'Immediate: Breathing slows within 1 minute.',
  frequencyOfUse: 'As needed. Safe for guided session use.',
  masterGain: 0.72,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: false,
};

// ─── 5. ISO: Meditation Anchor ─────────────────────────────────────
export const isoMeditationAnchor: ProtocolSpec = {
  id: 'iso_meditation_anchor',
  name: 'ISO: Meditation Anchor',
  category: 'isochronic_speakers',
  version: '2.0.0',
  durationSeconds: 900,
  evidenceLevel: 'II',
  citations: [
    'Cahn, B.R. & Polich, J. (2006) "Meditation states and traits." Psychological Bulletin',
  ],
  usageGoal: 'Repetitive auditory anchor for meditation. Theta persistence for internal focus through speakers.',
  algorithmDescription: '6Hz theta isochronic pulses at 55% duty cycle with soft 20ms edges over 400Hz carrier. The slightly longer duty cycle and soft edges create a meditative "hum" rather than harsh clicking. Multi-phase with deepening theta and noise reduction for internal silence.',
  researchContext: 'Theta persistence for internal focus. 6Hz theta is the core meditation frequency — deep enough for internal access but high enough to maintain awareness. The 400Hz carrier is warm without being distracting. Soft 20ms edges make this suitable for quiet meditation environments.',
  targetBands: ['theta'],
  neurochemistryTargets: ['serotonin', 'GABA', 'endorphins'],
  phases: [
    phase(0, 'Settling')
      .duration(180)
      .beat(8)
      .carrier(400)
      .isochronic(0.55)
      .noise('pink', 0.08)
      .noCarrierOctaves()
      .purpose('Alpha-theta transition to ease into meditative state')
      .build(),

    phase(1, 'Deep Theta Anchor')
      .duration(540)
      .beat(6)
      .carrier(400)
      .isochronic(0.55)
      .noise('pink', 0.04)
      .gentleCarrierOctaves()
      .spatial('pendulum', 0.01)
      .stochasticJitter(6)
      .purpose('Sustained 6Hz theta isochronic — auditory anchor for deep meditation')
      .build(),

    phase(2, 'Gentle Close')
      .duration(180)
      .beat([6, 10])
      .carrier(400)
      .isochronic(0.55)
      .noise('pink', 0.08)
      .noCarrierOctaves()
      .purpose('Gentle return to alpha for grounded session end')
      .build(),
  ],
  breathwork: {
    name: 'Deep Breath',
    ratio: [5, 5, 5, 5],
    description: 'Nasal focus. Deep, slow box breathing.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'OM',
    pronunciation: 'ohm (deep, resonant)',
    tonality: 'deep, centered',
    meaning: 'Unity — the primordial vibration of awareness',
    repeatInterval: 12,
    delivery: 'internal',
  },
  contraindications: { absolute: [], relative: [], drugInteractions: [], specialPopulations: [] },
  expectedTimeline: 'Immediate: Internal focus within 3 minutes.',
  frequencyOfUse: 'Daily. Safe for group meditation sessions.',
  masterGain: 0.70,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: false,
};

// ─── 6. ISO: Sleep Onset ───────────────────────────────────────────
export const isoSleepOnset: ProtocolSpec = {
  id: 'iso_sleep_onset',
  name: 'ISO: Sleep Onset',
  category: 'isochronic_speakers',
  version: '2.0.0',
  durationSeconds: 1800,
  evidenceLevel: 'II',
  citations: [
    'Jirakittayakorn, N. & Wongsawat, Y. (2017) "Brain responses to a 6-Hz binaural beat." Int J Psychophysiol',
  ],
  usageGoal: 'Encourage sleepiness in quiet settings. Sleep spindle mimicry for nap transition in small groups.',
  algorithmDescription: '3Hz delta isochronic pulses at 60% duty cycle with heavy 25ms edges over 350Hz warm carrier. The high duty cycle and heavy edges create a soporific, lulling quality. Progressive descent from theta to deep delta with increasing brown noise for sleep-compatible masking.',
  researchContext: 'Sleep spindle mimicry. 3Hz delta is within the deep sleep frequency range (0.5-4Hz). The 60% duty cycle mimics the longer "on" phase of natural sleep spindles. Brown noise masking eliminates environmental disruptions compatible with shared sleeping spaces.',
  targetBands: ['theta', 'delta'],
  neurochemistryTargets: ['melatonin', 'GABA', 'adenosine'],
  phases: [
    phase(0, 'Theta Drowsy')
      .duration(360)
      .beat(6)
      .carrier(350)
      .isochronic(0.55)
      .noise('brown', 0.12)
      .noCarrierOctaves()
      .purpose('Theta onset to initiate drowsiness — eyelids heavy, body releasing')
      .build(),

    phase(1, 'Delta Descent')
      .duration(360)
      .beat([6, 3])
      .carrier(350)
      .isochronic(0.6)
      .noise('brown', 0.18)
      .gentleCarrierOctaves()
      .purpose('Gradual descent from theta to delta — consciousness softening')
      .build(),

    phase(2, 'Deep Sleep Hold')
      .duration(900)
      .beat(3)
      .carrier(350)
      .isochronic(0.6)
      .noise('brown', 0.22)
      .gentleCarrierOctaves()
      .spatial('pendulum', 0.005)
      .purpose('Sustained 3Hz delta — sleep spindle mimicry for deep sleep maintenance')
      .build(),

    phase(3, 'Fade Out')
      .duration(180)
      .beat(3)
      .carrier(350)
      .isochronic(0.6)
      .noise('brown', 0.25)
      .noCarrierOctaves()
      .purpose('Volume fade with increasing noise — natural sleep transition')
      .build(),
  ],
  breathwork: {
    name: 'Melt Breath',
    ratio: [4, 7, 8, 0],
    description: 'Vagal slide breathing. Body melts into sleep.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'REST',
    pronunciation: 'rest (whispered, dissolving)',
    tonality: 'soft, fading',
    meaning: 'Deep reset — permission to let go completely',
    repeatInterval: 30,
    delivery: 'internal',
  },
  contraindications: { absolute: [], relative: ['Narcolepsy — may deepen unwanted sleep'], drugInteractions: [], specialPopulations: [] },
  expectedTimeline: 'Immediate: Drowsiness within 5-10 minutes. Full effect: Sleep within 15-20 minutes.',
  frequencyOfUse: 'Nightly or as needed for nap support.',
  masterGain: 0.68,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: false,
};

// ─── 7. ISO: Focus Block ───────────────────────────────────────────
export const isoFocusBlock: ProtocolSpec = {
  id: 'iso_focus_block',
  name: 'ISO: Focus Block',
  category: 'isochronic_speakers',
  version: '2.0.0',
  durationSeconds: 1500,
  evidenceLevel: 'II',
  citations: [
    'Vernon, D. et al. (2003) "The effect of training distinct neurofeedback protocols." Int J Psychophysiol',
  ],
  usageGoal: 'Support sustained focus while preventing habituation. Speaker-compatible for office/studio environments.',
  algorithmDescription: '16Hz beta isochronic pulses with anti-habituation stochastic drift (±0.5Hz every 60s) over 500Hz bright carrier. The stochastic frequency walking prevents the cortex from habituating to the stimulus, maintaining arousal across long work blocks.',
  researchContext: 'Anti-habituation maintains cortical arousal. A fixed-frequency stimulus loses efficacy after 15-20 minutes as the brain adapts. The random walk within ±0.5Hz of 16Hz maintains novelty signaling while staying within the productive beta band.',
  targetBands: ['beta'],
  neurochemistryTargets: ['dopamine', 'norepinephrine', 'acetylcholine'],
  phases: [
    phase(0, 'Ramp-In')
      .duration(120)
      .beat([10, 16])
      .carrier(500)
      .isochronic(0.5)
      .noise('pink', 0.04)
      .noCarrierOctaves()
      .purpose('Ramp from alpha to 16Hz beta for focus activation')
      .build(),

    phase(1, 'Sustained Focus')
      .duration(1200)
      .beat(16)
      .carrier(500)
      .isochronic(0.5)
      .noise('pink', 0.03)
      .gentleCarrierOctaves()
      .stochasticJitter(12)
      .purpose('Long-duration 16Hz beta with stochastic anti-habituation for sustained work block')
      .build(),

    phase(2, 'Wind-Down')
      .duration(180)
      .beat([16, 10])
      .carrier(500)
      .isochronic(0.5)
      .noise('pink', 0.06)
      .noCarrierOctaves()
      .purpose('Clean exit ramp to alpha — prevents abrupt cognitive drop')
      .build(),
  ],
  breathwork: {
    name: 'Box Breath',
    ratio: [4, 4, 4, 4],
    description: 'Mental point. Box breathing maintains oxygen for cognitive work.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'ONE',
    pronunciation: 'wun',
    tonality: 'focused, quiet',
    meaning: 'Focus — one task, one mind',
    repeatInterval: 60,
    delivery: 'internal',
  },
  contraindications: { absolute: [], relative: ['Anxiety — beta may increase arousal'], drugInteractions: [], specialPopulations: [] },
  expectedTimeline: 'Immediate: Focus within 3 minutes. Sustained: 25-minute work blocks.',
  frequencyOfUse: 'Daily for work. Max 2 sessions/day.',
  masterGain: 0.72,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: false,
};

// ─── 8. ISO: Alertness Burst ───────────────────────────────────────
export const isoAlertnessBurst: ProtocolSpec = {
  id: 'iso_alertness_burst',
  name: 'ISO: Alertness Burst',
  category: 'isochronic_speakers',
  version: '2.0.0',
  durationSeconds: 120,
  evidenceLevel: 'II',
  citations: [
    'Arns, M. et al. (2009) "Efficacy of neurofeedback treatment in ADHD." Clinical EEG and Neuroscience',
  ],
  usageGoal: 'Short burst to increase perceived alertness. High-beta CNS arousal via speakers.',
  algorithmDescription: '20Hz high-beta isochronic pulses with sharp 8ms edges over 500Hz bright carrier. Ultra-short 2-minute protocol for rapid alertness boost. Sharp pulse edges maximize cortical response per pulse.',
  researchContext: 'High-Beta stimulation for CNS arousal. 20Hz targets the alertness band directly. Sharp 8ms edges create maximum cortical evoked response, and the short duration prevents overstimulation.',
  targetBands: ['beta'],
  neurochemistryTargets: ['norepinephrine', 'dopamine'],
  phases: [
    phase(0, 'Alertness Burst')
      .duration(120)
      .beat(20)
      .carrier(500)
      .isochronic(0.45)
      .noise('pink', 0.02)
      .noCarrierOctaves()
      .harmonics()
      .purpose('Maximum 20Hz high-beta burst for immediate alertness activation')
      .build(),
  ],
  breathwork: {
    name: 'Fire Breath',
    ratio: [1, 0, 1, 0],
    description: 'Fast nasal breathing. Rapid activation.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'NOW',
    pronunciation: 'now (sharp)',
    tonality: 'sharp, immediate',
    meaning: 'Alert — full presence NOW',
    repeatInterval: 5,
    delivery: 'internal',
  },
  contraindications: { absolute: ['Epilepsy'], relative: ['Anxiety', 'Hypertension'], drugInteractions: [], specialPopulations: [] },
  expectedTimeline: 'Immediate: Alertness within 30 seconds.',
  frequencyOfUse: 'As needed. Max 4x/day. Not within 4 hours of bedtime.',
  masterGain: 0.75,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: false,
};

// ─── 9. ISO: Energy Hype ──────────────────────────────────────────
export const isoEnergyHype: ProtocolSpec = {
  id: 'iso_energy_hype',
  name: 'ISO: Energy Hype',
  category: 'isochronic_speakers',
  version: '2.0.0',
  durationSeconds: 60,
  evidenceLevel: 'II',
  citations: [
    'Lutz, A. et al. (2004) "Long-term meditators self-induce high-amplitude gamma synchrony." PNAS',
  ],
  usageGoal: 'Increase perceived energy before entrances. Speaker-optimized gamma binding for peak activation.',
  algorithmDescription: '40Hz gamma isochronic pulses with ultra-sharp 5ms edges over 500Hz bright carrier. 60-second micro-burst for maximum pre-event energy activation. The sharp edges and high frequency create intense cortical driving.',
  researchContext: 'Gamma binding for peak activation. 40Hz is the universal binding frequency — maximum cortical coherence and energy. Ultra-sharp 5ms edges maximize the evoked response per pulse cycle. One minute is sufficient for neural activation without overstimulation.',
  targetBands: ['gamma'],
  neurochemistryTargets: ['dopamine', 'norepinephrine', 'glutamate'],
  phases: [
    phase(0, 'Gamma Burst')
      .duration(60)
      .beat(40)
      .carrier(500)
      .isochronic(0.5)
      .noise('none', 0)
      .noCarrierOctaves()
      .harmonics()
      .purpose('Maximum 40Hz gamma burst — ultra-sharp pulses for peak energy activation')
      .build(),
  ],
  breathwork: {
    name: 'Max Breath',
    ratio: [1, 0, 1, 0],
    description: 'Maximum activation breathing.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'GO',
    pronunciation: 'go (explosive)',
    tonality: 'explosive, commanding',
    meaning: 'Action — full activation NOW',
    repeatInterval: 2,
    delivery: 'internal',
  },
  contraindications: { absolute: ['Epilepsy'], relative: ['Anxiety'], drugInteractions: [], specialPopulations: [] },
  expectedTimeline: 'Immediate: Peak energy within 15 seconds.',
  frequencyOfUse: 'Pre-event only. Max 3x/day.',
  masterGain: 0.78,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: false,
};

// ─── 10. ISO: Discomfort Relief ────────────────────────────────────
export const isoDistractionRelief: ProtocolSpec = {
  id: 'iso_distraction_relief',
  name: 'ISO: Discomfort Relief',
  category: 'isochronic_speakers',
  version: '2.0.0',
  durationSeconds: 600,
  evidenceLevel: 'II',
  citations: [
    'Huang, T.L. & Charyton, C. (2008) "A comprehensive review of brainwave entrainment." Alt Therapies',
  ],
  usageGoal: 'Distraction during mild discomfort or waits. Alpha amplitude gating for somatic relief via speakers.',
  algorithmDescription: '10Hz alpha isochronic pulses with soft 15ms edges over 430Hz warm carrier. Alpha gating modulates attention away from discomfort signals. Warm carrier and pink noise create pleasant masking environment. Multi-phase with gradual deepening.',
  researchContext: 'Alpha amplitude gating for somatic relief. 10Hz alpha entrainment activates the sensory gating mechanism that naturally dampens pain and discomfort signals. The isochronic delivery through speakers makes this suitable for clinical waiting rooms and dental offices.',
  targetBands: ['alpha'],
  neurochemistryTargets: ['endorphins', 'GABA', 'serotonin'],
  phases: [
    phase(0, 'Comfort Onset')
      .duration(120)
      .beat(10)
      .carrier(430)
      .isochronic(0.5)
      .noise('pink', 0.10)
      .noCarrierOctaves()
      .purpose('Gentle alpha isochronic onset for initial comfort and distraction')
      .build(),

    phase(1, 'Deep Relief')
      .duration(360)
      .beat(10)
      .carrier(430)
      .isochronic(0.5)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .spatial('pendulum', 0.02)
      .stochasticJitter(6)
      .purpose('Sustained alpha gating — attention redirected away from discomfort')
      .build(),

    phase(2, 'Gentle Close')
      .duration(120)
      .beat(10)
      .carrier(430)
      .isochronic(0.5)
      .noise('pink', 0.10)
      .noCarrierOctaves()
      .purpose('Gentle session close maintaining comfort')
      .build(),
  ],
  breathwork: {
    name: 'Release Breath',
    ratio: [4, 0, 8, 0],
    description: 'Extended exhale. Breathe through the discomfort.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'SOFT',
    pronunciation: 'sawft (gentle)',
    tonality: 'soft, releasing',
    meaning: 'Release — let the discomfort dissolve with each breath',
    repeatInterval: 15,
    delivery: 'internal',
  },
  contraindications: { absolute: [], relative: ['Severe pain — seek medical attention'], drugInteractions: [], specialPopulations: [] },
  expectedTimeline: 'Immediate: Distraction within 2 minutes. Sustained: Comfort throughout.',
  frequencyOfUse: 'As needed. Safe for continuous use during discomfort.',
  masterGain: 0.72,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: false,
};

// ─── Category Export ────────────────────────────────────────────────
export const ISOCHRONIC_SPEAKERS_SPECS: ProtocolSpec[] = [
  speakerFocus,
  speakerRelaxation,
  isoSettleCalm,
  isoBreathingPacing,
  isoMeditationAnchor,
  isoSleepOnset,
  isoFocusBlock,
  isoAlertnessBurst,
  isoEnergyHype,
  isoDistractionRelief,
];
