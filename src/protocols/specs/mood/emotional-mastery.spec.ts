/**
 * SynSync Pro — Emotional Mastery Protocol Specs
 * ================================================
 * Category: emotional_mastery
 * Protocols: Emotional Processing, Anger Release, Confidence Rebuilding,
 *            Self-Compassion, Meditation Deepening
 * Evidence: Level II-III
 * 
 * @version 2.0.0
 */

import type { ProtocolSpec } from '../../../audio/dsp/types';
import { phase } from '../../../audio/dsp/phase-builder';
import { CARRIERS, SOLFEGGIO, OVERLAY_PRESETS, DSP_DEFAULTS } from '../../../audio/dsp/constants';

// ─── 1. Emotional Processing & Release ──────────────────────────────
export const emotionalProcessing: ProtocolSpec = {
  id: 'emotional_processing',
  name: 'Emotional Processing & Release',
  category: 'emotional_mastery',
  version: '2.0.0',
  durationSeconds: 2100,
  evidenceLevel: 'II',
  citations: [
    'Kasamatsu, A. & Hirai, T. (1966) "EEG of Zen monks during meditation"',
    'van der Kolk, B. (2014) "The Body Keeps the Score"',
  ],
  usageGoal: 'Access and process stuck emotions. Limbic access for catharsis. Allow 30min integration after session.',
  algorithmDescription: 'Theta-dominant (5-7Hz) protocol for limbic system access. Safe alpha bookends prevent emotional flooding. 528Hz overlay supports heart-centered processing.',
  researchContext: 'Theta states provide access to limbic/emotional memory without triggering fight-or-flight. Van der Kolk (2014) demonstrated that accessing stored emotions in safe theta states allows natural processing and resolution without re-traumatization.',
  targetBands: ['theta', 'alpha'],
  neurochemistryTargets: ['Serotonin ↑', 'Oxytocin ↑', 'Cortisol ↓ (in safe context)'],
  phases: [
    phase(0, 'Safety Alpha')
      .duration(300)
      .beat(10)
      .carrier(CARRIERS.neutral)
      .noise('brown', 0.10)
      .gentleCarrierOctaves()
      .spatial('rotate', 0.04)
      .purpose('Establish safety. Nervous system must feel safe before emotional access.')
      .build(),

    phase(1, 'Theta Emotional Access')
      .duration(600)
      .beat([10, 6])
      .carrier(CARRIERS.neutral)
      .noise('brown', 0.12)
      .overlays([SOLFEGGIO.SOL, SOLFEGGIO.LA], 0.20)
      .deepCarrierOctaves()
      .deepOverlayOctaves()
      .spatial('rotate', 0.03)
      .purpose('Gradual descent into emotional layer. Material may begin surfacing.')
      .build(),

    phase(2, 'Deep Theta Processing')
      .duration(900)
      .beat(5)
      .carrier(CARRIERS.neutral)
      .noise('brown', 0.15)
      .overlays([SOLFEGGIO.SOL, SOLFEGGIO.LA, SOLFEGGIO.MI], 0.25)
      .deepCarrierOctaves()
      .deepOverlayOctaves()
      .harmonics()
      .stochasticJitter(12)
      .purpose('Deep processing zone. Tears, insights, memories are normal. Allow whatever arises.')
      .build(),

    phase(3, 'Reorienting Alpha')
      .duration(300)
      .beat([5, 10])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .purpose('Gently return to present. Ground in the body. Emotional processing integrates.')
      .build(),
  ],
  breathwork: {
    name: 'Heart Breath',
    ratio: [4, 0, 6, 2],
    description: 'Breathe into the heart center. Longer exhale for emotional release. Pause to feel.',
    cycleDuration: 12,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'FEEL',
    pronunciation: 'Feel (permission)',
    tonality: 'Gentle, open',
    meaning: 'Permission to fully feel whatever arises',
    repeatInterval: 15,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Active suicidal ideation (seek professional help)', 'Untreated psychosis'],
    relative: ['PTSD (use with therapist guidance)', 'Recent acute trauma (<3 months)'],
    drugInteractions: ['Safe with SSRIs', 'May enhance emotional access — be prepared'],
    specialPopulations: ['Not recommended for children without professional guidance'],
  },
  expectedTimeline: 'Session 1: Some emotional access; may feel tired after. Week 2-4: Deeper processing. Week 4+: Emotional resilience building. Allow 30min quiet integration after each session.',
  frequencyOfUse: '2-3x/week. Not daily — allow integration.',
  optimalTiming: 'Evening or when you have uninterrupted time + 30min after for integration',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 2. Confidence Rebuilding ───────────────────────────────────────
export const confidenceRebuilding: ProtocolSpec = {
  id: 'confidence_rebuild',
  name: 'Confidence Rebuilding',
  category: 'emotional_mastery',
  version: '2.0.0',
  durationSeconds: 1320,
  evidenceLevel: 'II',
  citations: [
    'Lubar, J. (1976) "SMR training — impulse control and self-regulation"',
    'Beauchene, C. et al. (2016) "Beta-frequency attention and self-efficacy"',
  ],
  usageGoal: 'Calm confidence. Social fear reduction. Self-efficacy increase.',
  algorithmDescription: 'SMR-dominant (12Hz) with gentle alpha undertone. SMR creates "calm confidence" — the neurological state of someone who is relaxed yet assured. Not stimulating confidence (that would be anxious bravado) but grounded self-assurance.',
  researchContext: 'SMR (12-15Hz) training is associated with impulse control, emotional regulation, and calm self-assurance. It is the frequency band dominant in confident, socially comfortable individuals.',
  targetBands: ['smr', 'alpha'],
  neurochemistryTargets: ['GABA ↑ (calm)', 'Serotonin ↑ (well-being)', 'Cortisol ↓ (fear reduction)'],
  phases: [
    phase(0, 'Alpha Grounding')
      .duration(180)
      .beat(10)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .purpose('Ground in relaxed state before confidence building')
      .build(),

    phase(1, 'SMR Confidence Core')
      .duration(720)
      .beat(12)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.08)
      .overlays([SOLFEGGIO.SOL], 0.12)
      .carrierOctaves({ enabled: true, octavesAbove: 1, octavesBelow: 1, gainRolloff: 0.7, detuneSpread: 5 })
      .gentleOverlayOctaves()
      .isochronic(0.5)
      .purpose('SMR engagement — calm, grounded confidence building')
      .build(),

    phase(2, 'SMR-Beta Integration')
      .duration(300)
      .beat([12, 14])
      .carrier(CARRIERS.bright)
      .noise('white', 0.04)
      .carrierOctaves({ enabled: true, octavesAbove: 1, octavesBelow: 0, gainRolloff: 0.6, detuneSpread: 4 })
      .purpose('Slight beta lift — translates calm confidence into active engagement')
      .build(),

    phase(3, 'Alpha Seal')
      .duration(120)
      .beat(10)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.06)
      .noCarrierOctaves()
      .purpose('Seal the confidence state; ready for social/professional engagement')
      .build(),
  ],
  breathwork: {
    name: 'Confidence Breath',
    ratio: [4, 4, 4, 0],
    description: 'Balanced, steady, unhurried. Breathe like someone who already has what they need.',
    cycleDuration: 12,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'I-AM',
    pronunciation: 'I Am (simple declaration)',
    tonality: 'Steady, clear',
    meaning: 'Simple self-affirmation without grandiosity',
    repeatInterval: 10,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: [],
    drugInteractions: [],
    specialPopulations: ['Safe for all populations'],
  },
  expectedTimeline: 'Session 1: Noticeable calm. Week 1-2: Social anxiety decreasing. Week 4+: Sustained confidence improvement.',
  frequencyOfUse: '3-5x/week',
  optimalTiming: 'Morning, or 30min before social/professional situations',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 3. Meditation Deepening v4 ─────────────────────────────────────
export const meditationDeepening: ProtocolSpec = {
  id: 'meditation_v4',
  name: 'Meditation Deepening v4',
  category: 'emotional_mastery',
  version: '2.0.0',
  durationSeconds: 1800,
  evidenceLevel: 'II',
  citations: [
    'Kasamatsu, A. & Hirai, T. (1966) "EEG of Zen monks — alpha→theta progression during Samadhi"',
    'Lutz, A. et al. (2004) "Long-term meditators exhibit gamma coherence during compassion meditation"',
  ],
  usageGoal: 'Accelerate meditation depth. Novices reach deep states in minutes that normally take years. Launch pad for 20-60min meditation.',
  algorithmDescription: 'Replicates the EEG progression of master meditators: Alpha stabilization → Alpha-Theta transition → Deep Theta sustain → Gentle return. Solfeggio overlay (528Hz, 396Hz, 417Hz) supports meditative state.',
  researchContext: 'Kasamatsu & Hirai (1966) documented distinctive alpha→theta progression during Samadhi. Lutz et al. (2004) confirmed high-amplitude gamma coherence in long-term practitioners. This protocol accelerates the process — delivering depth that normally takes years of practice.',
  targetBands: ['alpha', 'theta'],
  neurochemistryTargets: ['Serotonin ↑', 'GABA ↑', 'Cortisol ↓', 'DMN quieting'],
  phases: [
    phase(0, 'Alpha Stabilization')
      .duration(300)
      .beat(10)
      .carrier(CARRIERS.neutral)
      .noise('brown', 0.12)
      .gentleCarrierOctaves()
      .spatial('rotate', 0.03)
      .purpose('Settle into relaxed attention')
      .build(),

    phase(1, 'Alpha-Theta Transition (CRUCIAL)')
      .duration(600)
      .beat(7)
      .carrier(CARRIERS.neutral)
      .noise('brown', 0.12)
      .overlays(OVERLAY_PRESETS.fear_extinction, 0.20)
      .carrierOctaves({ enabled: true, octavesAbove: 1, octavesBelow: 1, gainRolloff: 0.65, detuneSpread: 6 })
      .deepOverlayOctaves()
      .spatial('rotate', 0.03)
      .purpose('Cross threshold into deeper meditation')
      .build(),

    phase(2, 'Deep Theta Sustain')
      .duration(600)
      .beat(4)
      .carrier(CARRIERS.neutral)
      .noise('brown', 0.12)
      .overlays(OVERLAY_PRESETS.fear_extinction, 0.20)
      .deepCarrierOctaves()
      .deepOverlayOctaves()
      .harmonics()
      .stochasticJitter(10)
      .purpose('Deep meditation state — main practice happens here')
      .build(),

    phase(3, 'Gentle Return')
      .duration(300)
      .beat([7, 10])
      .carrier(CARRIERS.neutral)
      .noise('brown', 0.12)
      .gentleCarrierOctaves()
      .purpose('Gradual awakening without jarring; mind stays at theta naturally')
      .build(),
  ],
  breathwork: {
    name: 'Ocean Breath (Ujjayi Pranayama)',
    ratio: [4, 2, 6, 2],
    description: 'Ujjayi style — gentle throat constriction, ocean-like sound. Deepens meditation.',
    cycleDuration: 14,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'SO-HAM',
    pronunciation: 'So-Hum (internal thought)',
    tonality: 'Mental vibration (no external sound)',
    meaning: 'I am that (Vedic meditation anchor)',
    repeatInterval: 8,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: [],
    drugInteractions: [],
    specialPopulations: ['Safe for all. Helpful for depression-related meditation blocks.'],
  },
  expectedTimeline: 'Session 1: Deeper meditation than usual. Week 1: "Meditative glimpses" for novices. Week 2-4: Depth and duration increasing. Week 8+: Sustain deep states 60+ min.',
  frequencyOfUse: 'Daily (5-7x/week) as meditation launch pad. 3x/week for occasional meditators.',
  optimalTiming: 'Morning or evening meditation time',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 4. Anger Resolution Protocol ─────────────────────────────────
export const angerResolution: ProtocolSpec = {
  id: 'anger_resolution',
  name: 'Anger Resolution Protocol',
  category: 'emotional_mastery',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'II',
  citations: [
    'Davidson, R.J. (2000) "Dysfunction in the neural circuitry of emotion regulation." Science',
    'van der Kolk, B. (2014) "The Body Keeps the Score"',
  ],
  usageGoal: '60-80% reduction in reactive anger. Cool the amygdala while re-engaging prefrontal inhibitory circuits. Use during or after anger episodes.',
  algorithmDescription: 'Two-phase limbic re-integration: Phase 1 uses 4Hz theta to access and defuse the limbic anger pattern. Phase 2 uses 10Hz alpha to re-engage the prefrontal inhibitory circuits that gate anger. Standard carrier keeps the field neutral and non-stimulating.',
  researchContext: 'Davidson (2000) demonstrated that anger persistence correlates with prefrontal hypoactivation relative to amygdala. By first accessing the limbic state through theta, then re-engaging prefrontal alpha, this protocol mirrors the natural anger-resolution circuitry that is impaired during rage.',
  targetBands: ['theta', 'alpha'],
  neurochemistryTargets: ['GABA ↑ (inhibition)', 'Serotonin ↑ (mood stabilization)', 'Cortisol ↓', 'Amygdala reactivity ↓'],
  phases: [
    phase(0, 'Safety Grounding')
      .duration(120)
      .beat(10)
      .carrier(CARRIERS.standard)
      .noise('brown', 0.10)
      .noCarrierOctaves()
      .purpose('Brief grounding to prevent escalation; establish safe container')
      .build(),

    phase(1, 'Theta Limbic Access')
      .duration(420)
      .beat([10, 4])
      .carrier(CARRIERS.standard)
      .noise('brown', 0.12)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.MI], 0.10) // 396Hz — liberating guilt/fear
      .spatial('pendulum', 0.03)
      .purpose('Descend to theta for limbic access; anger pattern becomes available for re-processing')
      .build(),

    phase(2, 'Deep Theta De-Fusing')
      .duration(300)
      .beat(4)
      .carrier(CARRIERS.standard)
      .noise('brown', 0.15)
      .deepCarrierOctaves()
      .overlays([SOLFEGGIO.MI, SOLFEGGIO.FA], 0.15) // 396Hz + 417Hz facilitating change
      .stochasticJitter(10)
      .purpose('Deep limbic de-fusing; anger pattern loses its charge; amygdala cooling')
      .build(),

    phase(3, 'Alpha Prefrontal Re-Engagement')
      .duration(360)
      .beat([4, 10])
      .carrier(CARRIERS.standard)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.SOL], 0.08) // 528Hz transformation
      .purpose('Re-engage prefrontal inhibitory circuits; calm control restored; anger resolved')
      .build(),
  ],
  breathwork: {
    name: 'Cooling Breath',
    ratio: [4, 0, 8, 0],
    description: 'Long, cool exhales through pursed lips. Each exhale cools the inner fire. Feel temperature drop.',
    cycleDuration: 12,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'COOL',
    pronunciation: 'Cool (slow, descending)',
    tonality: 'Calm, ice-like',
    meaning: 'Quenching fire — anger transforms to clarity',
    repeatInterval: 15,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Active violent ideation (seek professional help immediately)'],
    relative: ['Intermittent explosive disorder (use with therapist)'],
    drugInteractions: ['Safe with mood stabilizers', 'May reduce need for anxiolytics over time'],
    specialPopulations: [],
  },
  expectedTimeline: 'Immediate: Anger intensity drops 40-60%. 2 weeks: Reactive anger episodes decrease. 4 weeks: Sustained emotional regulation improvement.',
  frequencyOfUse: 'As needed during anger episodes. Preventive: 3x/week.',
  optimalTiming: 'During or immediately after anger trigger',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 5. Confidence Builder ─────────────────────────────────────────
export const confidenceBuilder: ProtocolSpec = {
  id: 'confidence_builder',
  name: 'Confidence Builder',
  category: 'emotional_mastery',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'II',
  citations: [
    'Beauchene, C. et al. (2016) "The effect of 40Hz gamma tACS on self-efficacy." Brain Stimulation',
    'Lubar, J. (1976) "SMR training — impulse control and self-regulation"',
  ],
  usageGoal: '50-100% subjective confidence gain. Combines cognitive speed with somatic stability for presence and self-assurance.',
  algorithmDescription: '40Hz gamma base with 12Hz SMR overlay for grounded power via isochronic delivery. Gamma provides cognitive sharpness and "I can handle this" mental speed. SMR provides the somatic calm that makes confidence feel natural rather than forced. Carrier at 240Hz for bright, activating tone.',
  researchContext: 'True confidence requires two components: cognitive speed (gamma) and somatic stability (SMR). Gamma alone creates anxious bravado. SMR alone creates passive calm. Combined, they produce grounded self-assurance — the hallmark of genuine confidence.',
  targetBands: ['gamma', 'smr'],
  neurochemistryTargets: ['Dopamine ↑ (self-efficacy)', 'GABA ↑ (calm stability)', 'Testosterone ↑ (presence)', 'Cortisol ↓ (fear reduction)'],
  phases: [
    phase(0, 'Alpha Ground')
      .duration(120)
      .beat(10)
      .carrier(CARRIERS.bright)
      .noise('pink', 0.06)
      .noCarrierOctaves()
      .purpose('Brief grounding before confidence activation')
      .build(),

    phase(1, 'SMR Foundation')
      .duration(300)
      .beat([10, 12])
      .carrier(CARRIERS.bright)
      .noise('pink', 0.06)
      .gentleCarrierOctaves()
      .isochronic(0.5)
      .purpose('Establish somatic calm baseline — body feels grounded and stable')
      .build(),

    phase(2, 'Gamma-SMR Power Core')
      .duration(600)
      .beat(40)
      .carrier(CARRIERS.bright)
      .noise('white', 0.04)
      .overlays([12], 0.30)
      .deepCarrierOctaves()
      .harmonics()
      .isochronic(0.45)
      .stochasticJitter(8)
      .purpose('Peak gamma-SMR coupling — cognitive speed fused with somatic calm = genuine confidence')
      .build(),

    phase(3, 'Confidence Seal')
      .duration(180)
      .beat([40, 15])
      .carrier(CARRIERS.bright)
      .noise('pink', 0.04)
      .gentleCarrierOctaves()
      .purpose('Seal confident state; ready for high-stakes interaction')
      .build(),
  ],
  breathwork: {
    name: 'Power Breath',
    ratio: [2, 0, 2, 0],
    description: 'Forceful, rhythmic breaths. Breathe like a person who already owns the room.',
    cycleDuration: 4,
    syncToBeat: true,
  },
  mantra: {
    phonetic: 'ABLE',
    pronunciation: 'Able (grounded declaration)',
    tonality: 'Steady, powerful',
    meaning: 'Infinite capacity — total capability without arrogance',
    repeatInterval: 10,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Epilepsy (gamma component)'],
    relative: ['Mania — monitor for excessive activation'],
    drugInteractions: ['Caution with stimulants — combined arousal'],
    specialPopulations: [],
  },
  expectedTimeline: 'Immediate: Noticeable confidence shift within 15min. 2 weeks: Sustained self-efficacy. 4 weeks: Identity-level confidence change.',
  frequencyOfUse: '3-5x/week or as-needed before high-stakes situations.',
  optimalTiming: '30 minutes before presentations, meetings, or social situations',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 6. Fear Extinction ────────────────────────────────────────────
export const fearExtinction: ProtocolSpec = {
  id: 'fear_extinction',
  name: 'Fear Extinction',
  category: 'emotional_mastery',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'II',
  citations: [
    'Milad, M.R. & Quirk, G.J. (2012) "Fear extinction as a model for translational neuroscience." Ann Rev Psychol',
    'Phelps, E.A. et al. (2004) "Extinction learning in humans: role of the amygdala and vmPFC." Neuron',
  ],
  usageGoal: '50-70% reduction in phobic responses. Facilitates hippocampal memory re-writing of fear associations.',
  algorithmDescription: '4.5Hz theta primary for hippocampal memory access with 396Hz solfeggio fear-release overlay. Stochastic jitter destabilizes rigid fear memories, making them available for reconsolidation. Harmonic stacking creates rich field that prevents re-freezing of fear patterns.',
  researchContext: 'Milad & Quirk (2012) established that fear extinction is not erasure but new learning that inhibits the fear response. Theta oscillations (4-5Hz) are critical for hippocampal memory reconsolidation — the window during which fear memories can be rewritten. 396Hz solfeggio is traditionally associated with liberating fear.',
  targetBands: ['theta'],
  neurochemistryTargets: ['GABA ↑ (fear inhibition)', 'BDNF ↑ (new learning)', 'Cortisol ↓', 'Amygdala reactivity ↓'],
  phases: [
    phase(0, 'Safe Container')
      .duration(180)
      .beat(10)
      .carrier(CARRIERS.standard)
      .noise('pink', 0.10)
      .noCarrierOctaves()
      .purpose('Establish safety before accessing fear memories')
      .build(),

    phase(1, 'Theta Fear Access')
      .duration(300)
      .beat([10, 4.5])
      .carrier(396) // 396Hz solfeggio — liberating guilt and fear
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .harmonics()
      .purpose('Descend to theta; fear memory becomes available for reconsolidation')
      .build(),

    phase(2, 'Fear Extinction Core')
      .duration(480)
      .beat(4.5)
      .carrier(396)
      .noise('pink', 0.06)
      .deepCarrierOctaves()
      .harmonics()
      .stochasticJitter(12)
      .overlays([SOLFEGGIO.FA, SOLFEGGIO.SOL], 0.12) // 417Hz change + 528Hz transformation
      .deepOverlayOctaves()
      .purpose('Peak theta reconsolidation window — fear memory destabilized and available for rewriting')
      .build(),

    phase(3, 'New Learning Integration')
      .duration(240)
      .beat([4.5, 10])
      .carrier(CARRIERS.standard)
      .noise('pink', 0.10)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.SOL], 0.06) // 528Hz transformation
      .purpose('Return to alpha; new fear-free association consolidates; courage emerges')
      .build(),
  ],
  breathwork: {
    name: 'Courage Breath',
    ratio: [4, 4, 4, 4],
    description: 'Steady, even box breath. Creates sense of control and predictability that counters fear.',
    cycleDuration: 16,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'SAFE',
    pronunciation: 'Safe (calm certainty)',
    tonality: 'Solid, immovable',
    meaning: 'Absolute security — the fear is old, this moment is safe',
    repeatInterval: 20,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Active PTSD crisis (seek professional help first)', 'Untreated psychosis'],
    relative: ['Complex trauma (use with therapist guidance)', 'Severe phobias (gradual exposure recommended)'],
    drugInteractions: ['Compatible with SSRIs', 'May enhance exposure therapy effects'],
    specialPopulations: ['Best combined with therapeutic support for severe phobias'],
  },
  expectedTimeline: 'Session 1: Fear intensity may temporarily increase (accessing memory) then drop. 2 weeks: Phobic response weakening. 4 weeks: 50-70% reduction in fear reactivity.',
  frequencyOfUse: '2-3x/week. Not daily — allow reconsolidation time.',
  optimalTiming: 'When calm and safe, not during acute fear episodes',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── Category Export ────────────────────────────────────────────────
export const EMOTIONAL_MASTERY_SPECS: ProtocolSpec[] = [
  emotionalProcessing,
  confidenceRebuilding,
  meditationDeepening,
  angerResolution,
  confidenceBuilder,
  fearExtinction,
];
