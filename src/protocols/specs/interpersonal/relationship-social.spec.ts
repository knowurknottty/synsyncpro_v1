/**
 * SynSync Pro — Relationship & Social Protocol Specs
 * ====================================================
 * Category: relationship_social
 * Protocols targeting oxytocin, empathy circuits, and social bonding.
 *
 * @version 2.0.0
 */

import type { ProtocolSpec } from '../../../audio/dsp/types';
import { phase } from '../../../audio/dsp/phase-builder';
import { CARRIERS, DSP_DEFAULTS, SOLFEGGIO } from '../../../audio/dsp/constants';

// ─── 1. Empathic Resonance Protocol ───────────────────────────────
export const empathicResonance: ProtocolSpec = {
  id: 'empathic_resonance',
  name: 'Empathic Resonance',
  category: 'relationship_social',
  version: '2.0.0',
  durationSeconds: 1500,
  evidenceLevel: 'III',
  citations: [
    'Lutz, A. et al. (2004) "Long-term meditators self-induce high-amplitude gamma synchrony during mental practice." PNAS',
    'Singer, T. et al. (2004) "Empathy for pain involves the affective but not sensory components of pain." Science',
  ],
  usageGoal: 'Enhance empathy and emotional attunement before difficult conversations, therapy sessions, or relationship work.',
  algorithmDescription: 'Theta-alpha entrainment at 7.83Hz (Schumann) with 639Hz solfeggio overlay (relationship healing). Spatial rotation creates immersive compassion-resonance field. Gentle stochastic jitter prevents habituation.',
  researchContext: 'Mirror neuron activation correlates with theta-alpha border frequencies. The 639Hz solfeggio frequency historically associated with interpersonal harmony. Combined with loving-kindness breathwork for oxytocin release.',
  targetBands: ['theta', 'alpha'],
  neurochemistryTargets: ['oxytocin', 'serotonin', 'endorphins'],
  phases: [
    phase(0, 'Heart Opening')
      .duration(300)
      .beat(10)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.12)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.LA], 0.10)
      .spatial('pendulum', 0.05)
      .purpose('Alpha entrainment with 639Hz (relationship) overlay to open empathic awareness')
      .build(),

    phase(1, 'Empathy Deepening')
      .duration(600)
      .beat(7.83)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.10)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.LA, SOLFEGGIO.SOL], 0.12)
      .spatial('rotate', 0.03)
      .stochasticJitter(8)
      .purpose('Schumann resonance with solfeggio stack for deep empathic attunement')
      .build(),

    phase(2, 'Mirror Neuron Activation')
      .duration(360)
      .beat(8)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.LA], 0.08)
      .spatial('pendulum', 0.04)
      .purpose('Low alpha for mirror neuron circuit engagement and emotional resonance')
      .build(),

    phase(3, 'Integration')
      .duration(240)
      .beat([8, 10])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.10)
      .noCarrierOctaves()
      .purpose('Return to alert alpha carrying empathic awareness into daily interaction')
      .build(),
  ],
  breathwork: {
    name: 'Loving-Kindness Breath',
    ratio: [4, 2, 6, 2],
    description: 'Extended exhale with heart focus. Inhale love, exhale compassion toward others.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'MAY-ALL-BEINGS',
    pronunciation: 'may all beings be happy, be peaceful, be free',
    tonality: 'warm, gentle',
    meaning: 'Traditional loving-kindness intention to expand empathic capacity',
    repeatInterval: 16,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: ['Active grief — may intensify emotions', 'Codependency patterns — maintain healthy boundaries'],
    drugInteractions: [],
    specialPopulations: [],
  },
  expectedTimeline: 'Immediate: Heightened emotional sensitivity. 2 weeks: Improved relationship quality.',
  frequencyOfUse: '3-4 times per week. Best before social interaction or relationship work.',
  masterGain: 0.80,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: false,
};

// ─── 2. Social Confidence Builder ──────────────────────────────────
export const socialConfidence: ProtocolSpec = {
  id: 'social_confidence_builder',
  name: 'Social Confidence Builder',
  category: 'relationship_social',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'III',
  citations: [
    'Knyazev, G.G. (2007) "Motivation, emotion, and their inhibitory control mirrored in brain oscillations." Neuroscience & Biobehavioral Reviews',
  ],
  usageGoal: 'Build social confidence and reduce social anxiety before presentations, meetings, or social events.',
  algorithmDescription: 'SMR-beta entrainment (14-20Hz) to suppress anxiety-linked theta excess and boost confident engagement. Alpha-to-beta ramp with 528Hz transformation overlay.',
  researchContext: 'SMR training reduces anxiety and improves social functioning. Beta-range entrainment associated with confident, outward-directed attention. 528Hz solfeggio traditionally linked to transformation and courage.',
  targetBands: ['smr', 'beta'],
  neurochemistryTargets: ['dopamine', 'norepinephrine', 'testosterone'],
  phases: [
    phase(0, 'Grounding')
      .duration(180)
      .beat(10)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.10)
      .noCarrierOctaves()
      .purpose('Brief alpha grounding to establish calm baseline before confidence ramp')
      .build(),

    phase(1, 'SMR Stabilization')
      .duration(300)
      .beat([10, 14])
      .carrier(CARRIERS.bright)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.SOL], 0.08)
      .purpose('Ramp to SMR for impulse control and social composure')
      .build(),

    phase(2, 'Confidence Activation')
      .duration(420)
      .beat(18)
      .carrier(CARRIERS.bright)
      .noise('pink', 0.06)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.SOL, SOLFEGGIO.FA], 0.10)
      .spatial('rotate', 0.08)
      .purpose('Beta entrainment for outward confidence and social assertiveness')
      .build(),

    phase(3, 'Integration')
      .duration(300)
      .beat([18, 12])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.08)
      .noCarrierOctaves()
      .purpose('Settle to alert SMR carrying confidence into social interaction')
      .build(),
  ],
  breathwork: {
    name: 'Power Breath',
    ratio: [3, 1, 3, 1],
    description: 'Quick rhythmic breathing to activate sympathetic confidence response.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'AH-HAM',
    pronunciation: 'ah-hum',
    tonality: 'strong, grounded',
    meaning: 'I am — affirmation of self-worth and presence',
    repeatInterval: 6,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: ['Mania or hypomania — beta activation may exacerbate'],
    drugInteractions: [],
    specialPopulations: [],
  },
  expectedTimeline: 'Immediate: Reduced social anxiety. 3 weeks: Lasting confidence shifts.',
  frequencyOfUse: 'As needed before social events. Max 2 sessions daily.',
  masterGain: 0.82,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: false,
};

// ─── 3. Communication Clarity ─────────────────────────────────────
export const communicationClarity: ProtocolSpec = {
  id: 'communication_clarity',
  name: 'Communication Clarity',
  category: 'relationship_social',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'II',
  citations: [
    'Beauchene, C. et al. (2016) "Gamma tACS enhances verbal fluency." Brain Stimulation',
    'Lubar, J. (1976) "SMR and self-regulation of verbal expression"',
  ],
  usageGoal: '+40-60% clarity in verbal expression. Targets Broca\'s and Wernicke\'s areas for rapid verbal synthesis.',
  algorithmDescription: '40Hz gamma base for rapid cognitive synthesis with 12Hz SMR overlay for social grounding. Gamma accelerates verbal processing in Broca\'s/Wernicke\'s language centers while SMR provides the calm needed to articulate clearly under social pressure. Carrier at 240Hz for bright, articulate tone.',
  researchContext: 'Language production requires two systems: rapid associative synthesis (gamma in Broca\'s area) and motor-social composure (SMR). Gamma alone produces rapid but chaotic speech. SMR alone produces calm but slow speech. Combined, they produce eloquence — the fluent, clear communication of someone who thinks fast and speaks calmly.',
  targetBands: ['gamma', 'smr'],
  neurochemistryTargets: ['Dopamine ↑ (verbal fluidity)', 'Acetylcholine ↑ (processing)', 'GABA ↑ (composure)'],
  phases: [
    phase(0, 'Alpha Centering')
      .duration(120)
      .beat(10)
      .carrier(CARRIERS.bright)
      .noise('pink', 0.06)
      .noCarrierOctaves()
      .purpose('Center before verbal activation')
      .build(),

    phase(1, 'SMR Social Ground')
      .duration(240)
      .beat([10, 12])
      .carrier(CARRIERS.bright)
      .noise('pink', 0.06)
      .gentleCarrierOctaves()
      .purpose('Establish composure baseline for clear articulation')
      .build(),

    phase(2, 'Gamma-SMR Verbal Core')
      .duration(660)
      .beat(40)
      .carrier(CARRIERS.bright)
      .noise('white', 0.04)
      .overlays([12], 0.35)
      .deepCarrierOctaves()
      .harmonics()
      .stochasticJitter(6)
      .purpose('Peak verbal fluidity — Broca/Wernicke activation with SMR composure; eloquence state')
      .build(),

    phase(3, 'Integration')
      .duration(180)
      .beat([40, 14])
      .carrier(CARRIERS.bright)
      .noise('pink', 0.04)
      .gentleCarrierOctaves()
      .purpose('Settle to sustainable SMR-beta for real-world communication')
      .build(),
  ],
  breathwork: {
    name: 'Eloquence Breath',
    ratio: [4, 0, 4, 0],
    description: 'Clear nasal breath. Each exhale prepares the vocal apparatus for articulate expression.',
    cycleDuration: 8,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'SPEAK',
    pronunciation: 'Speak (crisp, clear)',
    tonality: 'Articulate, precise',
    meaning: 'Crystal truth — every word lands with clarity and impact',
    repeatInterval: 15,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Epilepsy (gamma)'],
    relative: ['Social anxiety — combine with confidence builder first if severe'],
    drugInteractions: [],
    specialPopulations: ['Public speakers', 'Executives', 'Those with speech anxiety'],
  },
  expectedTimeline: 'Immediate: Noticeable verbal clarity within 15min. 2 weeks: Sustained communication improvement.',
  frequencyOfUse: '3-5x/week or as-needed before presentations.',
  optimalTiming: '30 minutes before presentations, meetings, or important conversations',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 4. Empathy Deepener ──────────────────────────────────────────
export const empathyDeepener: ProtocolSpec = {
  id: 'empathy_deepener',
  name: 'Empathy Deepener',
  category: 'relationship_social',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'II',
  citations: [
    'Rizzolatti, G. & Craighero, L. (2004) "The mirror-neuron system." Ann Rev Neurosci',
    'Lutz, A. et al. (2004) "Gamma synchrony during compassion meditation." PNAS',
  ],
  usageGoal: 'Achieve deep mirror neuron coupling with others. Directly stimulates mirror neuron system for emotional resonance.',
  algorithmDescription: '7Hz theta base with 40Hz gamma coupling signature. Theta opens emotional receptivity while gamma binds the mirror neuron system for real-time empathic coupling. Warm carrier (200Hz) with spatial rotation creates an immersive compassion field. Designed for use before or during interpersonal connection.',
  researchContext: 'Rizzolatti (2004) established that mirror neurons fire both when performing and observing actions, creating the neural basis for empathy. Lutz (2004) showed experienced compassion meditators exhibit strong gamma synchrony. Theta-gamma coupling enables deep emotional resonance with others.',
  targetBands: ['theta', 'gamma'],
  neurochemistryTargets: ['Oxytocin ↑ (bonding)', 'Serotonin ↑ (warmth)', 'Mirror neuron activation ↑'],
  phases: [
    phase(0, 'Heart Opening')
      .duration(180)
      .beat(10)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.08)
      .noCarrierOctaves()
      .overlays([SOLFEGGIO.LA], 0.06) // 639Hz relationship
      .purpose('Open emotional receptivity; heart center activation')
      .build(),

    phase(1, 'Theta Empathic Descent')
      .duration(300)
      .beat([10, 7])
      .carrier(CARRIERS.warm)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.LA, SOLFEGGIO.SOL], 0.10) // 639Hz + 528Hz
      .spatial('rotate', 0.03)
      .purpose('Descent to theta for deep emotional receptivity; mirror neuron priming')
      .build(),

    phase(2, 'Mirror Neuron Coupling Core')
      .duration(540)
      .beat(7)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.06)
      .overlays([40], 0.30)
      .deepCarrierOctaves()
      .harmonics()
      .spatial('rotate', 0.04)
      .stochasticJitter(8)
      .purpose('Peak theta-gamma coupling — mirror neurons fully engaged; deep empathic resonance')
      .build(),

    phase(3, 'Integration')
      .duration(180)
      .beat([7, 10])
      .carrier(CARRIERS.warm)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.LA], 0.04)
      .purpose('Return to alpha carrying empathic depth into waking interaction')
      .build(),
  ],
  breathwork: {
    name: 'Heart Coherence Breath',
    ratio: [5, 0, 5, 0],
    description: 'Coherent heart breath. Breathe in and out through the heart center. Feel connection.',
    cycleDuration: 10,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'WE',
    pronunciation: 'We (soft, inclusive)',
    tonality: 'Warm, inclusive',
    meaning: 'Unified field — dissolving the boundary between self and other',
    repeatInterval: 30,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: ['Codependency — maintain healthy boundaries', 'Active grief — may intensify'],
    drugInteractions: [],
    specialPopulations: ['Couples', 'Therapists', 'Caregivers'],
  },
  expectedTimeline: 'Immediate: Heightened emotional sensitivity. 2 weeks: Deeper interpersonal connections. 4 weeks: Sustained empathic capacity.',
  frequencyOfUse: '3-5x/week. Ideal before couples therapy, group work, or important relationships.',
  optimalTiming: 'Before interpersonal interactions or during couples sessions',
  masterGain: 0.80,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── Category Export ────────────────────────────────────────────────
export const RELATIONSHIP_SOCIAL_SPECS: ProtocolSpec[] = [
  empathicResonance,
  socialConfidence,
  communicationClarity,
  empathyDeepener,
];
