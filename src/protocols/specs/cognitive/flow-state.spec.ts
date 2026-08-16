/**
 * SynSync Pro — Flow State Protocol Specs
 * =========================================
 * Category: flow_state
 * Protocols: Flow 1-5 (Ignition → Struggle → Release → Flow → Harvest)
 * Evidence: Level II-III
 * 
 * Based on Kotler/Csikszentmihalyi flow cycle research.
 * The 5-phase sequence is designed to be used sequentially.
 * 
 * @version 2.0.0
 */

import type { ProtocolSpec } from '../../../audio/dsp/types';
import { phase } from '../../../audio/dsp/phase-builder';
import { CARRIERS, SOLFEGGIO, DSP_DEFAULTS } from '../../../audio/dsp/constants';
import { wideOctaves, deepOctaves } from '../../../audio/dsp/octave-resolver';

// ─── 1. Flow Phase 1: Ignition (Beta Warm-Up) ──────────────────────
export const flowIgnition: ProtocolSpec = {
  id: 'flow_1_ignition',
  name: 'Flow 1: Ignition — Beta Warm-Up',
  category: 'flow_state',
  version: '2.0.0',
  durationSeconds: 600,
  evidenceLevel: 'III',
  citations: [
    'Dietrich, A. (2003) "Functional neuroanatomy of altered states." Consciousness & Cognition',
    'Kounios, J. et al. (2008) "Aha! moments and gamma bursts"',
    'Csikszentmihalyi, M. (1990) "Flow: The Psychology of Optimal Experience"',
  ],
  usageGoal: 'Activate cognitive engagement and arousal. Prime the brain for flow entry. 10 min warm-up phase.',
  algorithmDescription: 'Ascending beta ramp (15→22Hz) with white noise masking. Increases cortical arousal and dopamine to the threshold needed for flow entry. Like warming up muscles before exercise.',
  researchContext: 'Dietrich (2003) showed flow requires initial transient hypofrontality preceded by high prefrontal activation. You must first "load" the prefrontal cortex before it can "release" into flow.',
  targetBands: ['beta'],
  neurochemistryTargets: ['Dopamine ↑', 'Norepinephrine ↑', 'Cortical arousal ↑'],
  phases: [
    phase(0, 'Beta Ramp')
      .duration(600)
      .beat([15, 22])
      .carrier(CARRIERS.bright)
      .noise('white', 0.06)
      .carrierOctaves({ enabled: true, octavesAbove: 1, octavesBelow: 1, gainRolloff: 0.7, detuneSpread: 5 })
      .hybrid(0.6)
      .purpose('Ascending beta ramp; cortical arousal building; dopamine priming')
      .build(),
  ],
  breathwork: {
    name: 'Activating Breath',
    ratio: [3, 0, 3, 0],
    description: 'Quick, rhythmic breathing to match ascending energy.',
    cycleDuration: 6,
    syncToBeat: true,
  },
  mantra: {
    phonetic: 'GO',
    pronunciation: 'Go (short, decisive)',
    tonality: 'Sharp, activating',
    meaning: 'Initiation — commit to the work',
    repeatInterval: 8,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Uncontrolled bipolar mania'],
    relative: ['Severe anxiety (prime with anxiety relief first)'],
    drugInteractions: ['Caution with stimulants — combined effect may be too activating'],
    specialPopulations: [],
  },
  expectedTimeline: 'Immediate: Increased alertness and engagement within 5min.',
  frequencyOfUse: 'As part of flow sequence. 3-5x/week.',
  optimalTiming: 'Before creative/deep work sessions',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 2. Flow Phase 2: Struggle (Focused Load) ──────────────────────
export const flowStruggle: ProtocolSpec = {
  id: 'flow_2_struggle',
  name: 'Flow 2: Struggle — Focused Load',
  category: 'flow_state',
  version: '2.0.0',
  durationSeconds: 900,
  evidenceLevel: 'III',
  citations: [
    'Dietrich, A. (2003) "Transient hypofrontality during flow states"',
    'Kotler, S. (2014) "The Rise of Superman"',
  ],
  usageGoal: 'Sustain high cognitive load to trigger transient hypofrontality. The "productive struggle" before flow releases.',
  algorithmDescription: 'High beta (20-22Hz) sustained with gamma bursts (40Hz overlays). Maximum prefrontal loading. The brain must reach cognitive saturation before it can "let go" into flow.',
  researchContext: 'Flow research shows a mandatory struggle phase where the prefrontal cortex is maximally loaded. Only after this loading phase can the brain undergo transient hypofrontality (the neural signature of flow). Skipping struggle = no flow.',
  targetBands: ['beta', 'gamma'],
  neurochemistryTargets: ['Norepinephrine ↑↑', 'Dopamine ↑', 'Cortisol (moderate — productive stress)'],
  phases: [
    phase(0, 'High Beta Sustained Load')
      .duration(600)
      .beat(22)
      .carrier(CARRIERS.high)
      .noise('white', 0.08)
      .overlays([40], 0.12)
      .deepCarrierOctaves()
      .harmonics()
      .hybrid(0.6)
      .stochasticJitter(8)
      .purpose('Maximum prefrontal loading; cognitive saturation building')
      .build(),

    phase(1, 'Struggle Plateau')
      .duration(300)
      .beat(20)
      .carrier(CARRIERS.bright)
      .noise('white', 0.06)
      .overlays([40], 0.10)
      .carrierOctaves({ enabled: true, octavesAbove: 2, octavesBelow: 1, gainRolloff: 0.6, detuneSpread: 8 })
      .purpose('Sustained struggle; brain approaching release threshold')
      .build(),
  ],
  breathwork: {
    name: 'Effort Breath',
    ratio: [4, 2, 4, 0],
    description: 'Slightly held, effortful breath matching productive struggle.',
    cycleDuration: 10,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'PUSH',
    pronunciation: 'Push (determined)',
    tonality: 'Firm, resolute',
    meaning: 'Persist through resistance',
    repeatInterval: 10,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Uncontrolled bipolar mania', 'Epilepsy (gamma component)'],
    relative: ['Anxiety disorders — ensure alpha baseline first'],
    drugInteractions: ['Caution with stimulants'],
    specialPopulations: [],
  },
  expectedTimeline: 'By end of phase: Feeling of productive tension that prepares flow release.',
  frequencyOfUse: 'Part of flow sequence. 3-5x/week.',
  optimalTiming: 'Immediately after Flow 1: Ignition',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 3. Flow Phase 3: Release (Alpha-Theta Drop) ───────────────────
export const flowRelease: ProtocolSpec = {
  id: 'flow_3_release',
  name: 'Flow 3: Release — Alpha-Theta Drop',
  category: 'flow_state',
  version: '2.0.0',
  durationSeconds: 600,
  evidenceLevel: 'III',
  citations: [
    'Dietrich, A. (2003) "Transient hypofrontality"',
    'Kounios, J. et al. (2008) "Gamma bursts precede insight moments"',
  ],
  usageGoal: 'Trigger the "let go" moment. Transient hypofrontality onset. Inner critic goes silent.',
  algorithmDescription: 'Rapid descent from beta to alpha-theta border (10→7Hz). This sudden drop after sustained load triggers transient hypofrontality — the prefrontal cortex "lets go" and flow begins.',
  researchContext: 'The release phase is where flow begins. After sustained prefrontal loading, the sudden drop to alpha-theta triggers the neurological "release valve." Time distortion, ego dissolution, and effortless action begin.',
  targetBands: ['alpha', 'theta'],
  neurochemistryTargets: ['Endorphins ↑', 'Anandamide ↑', 'Serotonin ↑', 'Inner critic ↓'],
  phases: [
    phase(0, 'Rapid Descent')
      .duration(300)
      .beat([18, 8])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.10)
      .carrierOctaves({ enabled: true, octavesAbove: 1, octavesBelow: 1, gainRolloff: 0.65, detuneSpread: 8 })
      .spatial('rotate', 0.08)
      .purpose('Rapid descent triggers transient hypofrontality; inner critic silencing')
      .build(),

    phase(1, 'Alpha-Theta Border')
      .duration(300)
      .beat(7.5)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.12)
      .overlays([SOLFEGGIO.SOL], 0.15)
      .deepCarrierOctaves()
      .deepOverlayOctaves()
      .stochasticJitter(10)
      .purpose('Hold at alpha-theta border — the gateway to flow state')
      .build(),
  ],
  breathwork: {
    name: 'Release Breath',
    ratio: [4, 0, 8, 0],
    description: 'Long exhale = letting go. Matches the neurological release.',
    cycleDuration: 12,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'AH',
    pronunciation: 'Ahhh (releasing sigh)',
    tonality: 'Open, spacious',
    meaning: 'Surrender to the flow',
    repeatInterval: 12,
    delivery: 'whispered',
  },
  contraindications: {
    absolute: [],
    relative: [],
    drugInteractions: [],
    specialPopulations: [],
  },
  expectedTimeline: 'Within session: Inner critic silences. Time distortion may begin.',
  frequencyOfUse: 'Part of flow sequence.',
  optimalTiming: 'Immediately after Flow 2: Struggle',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 4. Flow Phase 4: Flow (Gamma Sustain) ──────────────────────────
export const flowState: ProtocolSpec = {
  id: 'flow_4_flow',
  name: 'Flow 4: Flow — Gamma Sustain',
  category: 'flow_state',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'III',
  citations: [
    'Kounios, J. et al. (2008) "Aha! moments preceded by gamma bursts"',
    'Lutz, A. et al. (2004) "Long-term meditators exhibit gamma synchrony"',
  ],
  usageGoal: 'Sustain peak flow state for 20min. Maximum creativity, productivity, insight. Time distortion, ego dissolution.',
  algorithmDescription: '40Hz gamma sustain with theta undertone. Gamma for binding/integration, theta for creative access. Wide octave spread creates immersive sonic environment that makes flow feel effortless.',
  researchContext: 'Gamma (40Hz) synchrony is the neural signature of flow and insight moments (Kounios 2008). Combined with theta undertone, it enables simultaneous creative access and focused execution — the hallmark of flow.',
  targetBands: ['gamma', 'theta'],
  neurochemistryTargets: ['Dopamine ↑↑', 'Endorphins ↑', 'Anandamide ↑', 'Norepinephrine (optimal)'],
  phases: [
    phase(0, 'Gamma Flow Sustain')
      .duration(1200)
      .beat(40)
      .carrier(CARRIERS.high)
      .noise('pink', 0.08)
      .overlays([SOLFEGGIO.SOL, SOLFEGGIO.TI], 0.15)
      .carrierOctaves({ enabled: true, octavesAbove: 2, octavesBelow: 1, gainRolloff: 0.6, detuneSpread: 12 })
      .deepOverlayOctaves()
      .harmonics()
      .hybrid(0.5)
      .stochasticJitter(15)
      .purpose('Sustained 40Hz gamma flow — maximum integration, creativity, insight')
      .build(),
  ],
  breathwork: {
    name: 'Flow Breath',
    ratio: [4, 0, 4, 0],
    description: 'Effortless, rhythmic. You won\'t think about breathing — it happens naturally.',
    cycleDuration: 8,
    syncToBeat: true,
  },
  mantra: {
    phonetic: 'SILENCE',
    pronunciation: '(No mantra — silence during flow)',
    tonality: 'Silent',
    meaning: 'Pure awareness without narration',
    repeatInterval: 0,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Epilepsy (sustained gamma)', 'Untreated psychosis'],
    relative: [],
    drugInteractions: [],
    specialPopulations: [],
  },
  expectedTimeline: 'Within session: Full flow state. Productivity 200-500% of baseline.',
  frequencyOfUse: 'Part of flow sequence. 3-5x/week.',
  optimalTiming: 'After Flow 3: Release',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 5. Flow Phase 5: Harvest (Integration) ─────────────────────────
export const flowHarvest: ProtocolSpec = {
  id: 'flow_5_harvest',
  name: 'Flow 5: Harvest — Integration',
  category: 'flow_state',
  version: '2.0.0',
  durationSeconds: 600,
  evidenceLevel: 'II',
  citations: [
    'Kotler, S. (2014) "The Rise of Superman — flow cycle recovery"',
  ],
  usageGoal: 'Capture insights. Prevent flow crash. Consolidate neural pathways formed during flow.',
  algorithmDescription: 'Theta-to-delta gentle descent. Locks in neuroplastic changes. Prevents the common "flow crash" that occurs when gamma drops too quickly.',
  researchContext: 'Flow research consistently shows a recovery phase is essential. Without integration, insights are lost and the post-flow crash causes irritability and fatigue. Theta descent allows consolidation.',
  targetBands: ['theta', 'delta'],
  neurochemistryTargets: ['Serotonin ↑ (satisfaction)', 'BDNF ↑ (neuroplasticity lock-in)', 'Cortisol ↓'],
  phases: [
    phase(0, 'Theta Capture')
      .duration(360)
      .beat(7)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.10)
      .gentleCarrierOctaves()
      .spatial('rotate', 0.03)
      .purpose('Insights consolidate; neural pathways from flow are strengthened')
      .build(),

    phase(1, 'Delta Recovery')
      .duration(240)
      .beat([7, 1.5])
      .carrier(CARRIERS.warm)
      .noise('brown', 0.12)
      .deepCarrierOctaves()
      .purpose('Deep recovery; prevents flow crash; neural path consolidation')
      .build(),
  ],
  breathwork: {
    name: 'Harvest Breath',
    ratio: [4, 2, 8, 0],
    description: 'Long exhale for deep recovery. Body releasing accumulated tension from flow.',
    cycleDuration: 14,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'THANK',
    pronunciation: 'Thank (gratitude)',
    tonality: 'Warm, soft',
    meaning: 'Gratitude for the flow experience — anchors positive association',
    repeatInterval: 12,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: [],
    drugInteractions: [],
    specialPopulations: [],
  },
  expectedTimeline: 'Within session: Smooth transition out of flow. Insights captured. No crash.',
  frequencyOfUse: 'Always after Flow 4.',
  optimalTiming: 'Immediately after Flow 4: Flow',
  masterGain: 0.80,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 6. Gamma v4: Flow State Insight ──────────────────────────────────
export const gammaV4FlowInsight: ProtocolSpec = {
  id: 'gamma_v4_flow_state_insight',
  name: 'Gamma v4: Flow State Insight',
  category: 'flow_state',
  version: '2.0.0',
  durationSeconds: 2400,
  evidenceLevel: 'II',
  citations: [
    'Lutz, A. et al. (2004) "Long-term meditators show gamma synchrony during mental practice." PNAS',
    'Canolty, R.T. et al. (2006) "High gamma power is phase-locked to theta oscillations in human neocortex." Science',
    'Fell, J. & Axmacher, N. (2011) "The role of phase synchronization in memory processes." Nature Rev Neurosci',
  ],
  usageGoal: 'Deep theta-gamma coupling for insight-driven flow. Theta opens associative access while gamma binds novel combinations into conscious insight. 40-minute deep session for creative breakthroughs.',
  algorithmDescription: '4Hz theta primary with progressive 40Hz gamma overlay via isochronic delivery. Theta-gamma phase-amplitude coupling (PAC) is the neural mechanism of memory encoding and creative insight (Canolty 2006). 528Hz and 852Hz solfeggio overlays enrich the harmonic environment. Multi-phase: theta descent → theta baseline → core coupling → gentle ramp-down.',
  researchContext: 'Theta-gamma coupling (TGC) is now established as the primary mechanism for working memory, insight, and creative recombination. Lutz (2004) showed experienced meditators achieve sustained gamma during focused practice. This protocol uses theta as the carrier rhythm that "opens the gates" for gamma-bound insight moments.',
  targetBands: ['theta', 'gamma'],
  neurochemistryTargets: ['dopamine', 'acetylcholine', 'serotonin', 'anandamide'],
  phases: [
    phase(0, 'Theta Ramp-In')
      .duration(600)
      .beat([8, 4])
      .carrier(CARRIERS.neutral) // 210Hz
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .spatial('rotate', 0.02)
      .purpose('Gradual descent from alpha to deep theta — opening associative networks for insight access')
      .build(),

    phase(1, 'Theta Baseline')
      .duration(300)
      .beat(4)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.06)
      .deepCarrierOctaves()
      .spatial('rotate', 0.03)
      .harmonics()
      .purpose('Stable 4Hz theta foundation — deep subconscious access, memory consolidation primed')
      .build(),

    phase(2, 'Theta-Gamma Coupling Core')
      .duration(1200)
      .beat(4)
      .carrier(CARRIERS.neutral)
      .isochronic(0.45)
      .noise('pink', 0.04)
      .deepCarrierOctaves()
      .overlays([40, SOLFEGGIO.SOL, SOLFEGGIO.SI], 0.15) // 40Hz gamma + 528Hz + 852Hz
      .deepOverlayOctaves()
      .spatial('rotate', 0.04)
      .stochasticJitter(12)
      .harmonics()
      .purpose('Peak theta-gamma phase-amplitude coupling — insight moments emerge as gamma binds theta-accessed associations')
      .build(),

    phase(3, 'Ramp-Down')
      .duration(300)
      .beat([40, 10])
      .carrier(CARRIERS.bright) // 250Hz
      .noise('pink', 0.10)
      .gentleCarrierOctaves()
      .spatial('rotate', 0.02)
      .purpose('Gradual gamma-to-alpha return — carrying insights into waking awareness without crash')
      .build(),
  ],
  breathwork: {
    name: 'Fire Breath (Kapalabhati)',
    ratio: [1, 0, 1, 0],
    description: 'Rapid rhythmic exhales through the nose, passive inhales. 30 cycles, then deep inhale and hold 30s. Repeat. Elevates CO2 tolerance and primes gamma synchrony.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'HUM',
    pronunciation: 'hummm (sustained nasal resonance)',
    tonality: 'deep, resonant, buzzing',
    meaning: 'The seed syllable of manifestation — vibration that bridges subconscious insight to conscious awareness',
    repeatInterval: 30,
    delivery: 'spoken',
  },
  contraindications: {
    absolute: ['Epilepsy — sustained gamma component', 'Active psychosis', 'Severe dissociative disorders'],
    relative: ['Anxiety — deep theta may surface material', 'First-time users — build up with Flow 1-5 sequence first', 'Insomnia — do not use within 4 hours of bedtime'],
    drugInteractions: ['Psychedelics — unpredictable amplification', 'Cannabis — may deepen theta excessively', 'Stimulants — may antagonize theta descent'],
    specialPopulations: ['Experienced meditators preferred', 'Have journal ready for insight capture'],
  },
  expectedTimeline: '1 session: Enhanced creative connections, moments of clarity. 2 weeks: Reliable insight access. 4 weeks: Deepened theta-gamma coupling efficiency.',
  frequencyOfUse: '3-5x/week. Ideal for creative/analytical work sessions.',
  masterGain: 0.80,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── Category Export ────────────────────────────────────────────────
export const FLOW_STATE_SPECS: ProtocolSpec[] = [
  flowIgnition,
  flowStruggle,
  flowRelease,
  flowState,
  flowHarvest,
  gammaV4FlowInsight,
];
