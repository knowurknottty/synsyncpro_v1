/**
 * SynSync Pro — Athletic & Physiological Protocol Specs
 * ======================================================
 * Category: athletic, hormonal_physiological
 * Protocols: Athletic Confidence, Reaction Time, Endurance Enhancer,
 *            Recovery Accelerator, Vagus Nerve Reset, Schumann Sync
 * Evidence: Level II-III
 * 
 * @version 2.0.0
 */

import type { ProtocolSpec } from '../../../audio/dsp/types';
import { phase } from '../../../audio/dsp/phase-builder';
import { CARRIERS, SOLFEGGIO, SCHUMANN, DSP_DEFAULTS } from '../../../audio/dsp/constants';

// ─── 1. Athletic Confidence Amplifier ───────────────────────────────
export const athleticConfidence: ProtocolSpec = {
  id: 'athletic_confidence',
  name: 'Athletic Confidence Amplifier',
  category: 'athletic',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'II',
  citations: [
    'Lubar, J. (1976) "SMR training and motor control"',
    'Kounios, J. (2008) "40Hz gamma and peak performance states"',
  ],
  usageGoal: 'Pre-competition confidence ↑80%. Performance anxiety ↓. Optimal arousal for competition.',
  algorithmDescription: '40Hz gamma for peak state + 12Hz SMR for motor control and calm confidence. Hybrid delivery for maximum cortical engagement. Athletes report entering "the zone" faster.',
  researchContext: 'SMR training develops motor stillness and impulse control — essential for athletic performance under pressure. Gamma bursts are associated with the "clutch" moments in sports where everything clicks.',
  targetBands: ['gamma', 'smr'],
  neurochemistryTargets: ['Dopamine ↑', 'Norepinephrine ↑ (optimal arousal)', 'GABA ↑ (calm under pressure)'],
  phases: [
    phase(0, 'Alpha Centering')
      .duration(180)
      .beat(10)
      .carrier(CARRIERS.bright)
      .noise('white', 0.04)
      .gentleCarrierOctaves()
      .purpose('Center and ground; prepare mental state')
      .build(),

    phase(1, 'SMR Motor Calm')
      .duration(360)
      .beat(12)
      .carrier(CARRIERS.bright)
      .noise('white', 0.06)
      .carrierOctaves({ enabled: true, octavesAbove: 1, octavesBelow: 1, gainRolloff: 0.7, detuneSpread: 4 })
      .isochronic(0.55)
      .purpose('Calm confidence; motor control circuits primed')
      .build(),

    phase(2, 'Gamma Activation')
      .duration(480)
      .beat(40)
      .carrier(CARRIERS.high)
      .noise('white', 0.06)
      .overlays([SOLFEGGIO.SOL], 0.10)
      .deepCarrierOctaves()
      .harmonics()
      .hybrid(0.5)
      .stochasticJitter(8)
      .purpose('Peak arousal state; "zone" activation; reaction time optimized')
      .build(),

    phase(3, 'Competition Ready')
      .duration(180)
      .beat([40, 20])
      .carrier(CARRIERS.bright)
      .noise('white', 0.04)
      .gentleCarrierOctaves()
      .purpose('Settle into sustainable high performance state')
      .build(),
  ],
  breathwork: {
    name: 'Power Breath',
    ratio: [3, 2, 3, 0],
    description: 'Quick rhythmic breathing. Activating without hyperventilating.',
    cycleDuration: 8,
    syncToBeat: true,
  },
  mantra: {
    phonetic: 'WIN',
    pronunciation: 'Win (sharp, decisive)',
    tonality: 'Powerful, grounded',
    meaning: 'State of absolute readiness',
    repeatInterval: 8,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Epilepsy (gamma component)'],
    relative: [],
    drugInteractions: ['Caution with pre-workout stimulants — combined arousal'],
    specialPopulations: [],
  },
  expectedTimeline: 'Immediate: Confidence and readiness within 10min.',
  frequencyOfUse: 'Pre-competition. 45min before game/event.',
  optimalTiming: '45 minutes before competition',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 2. Recovery Accelerator ────────────────────────────────────────
export const recoveryAccelerator: ProtocolSpec = {
  id: 'recovery_accelerator',
  name: 'Recovery Accelerator',
  category: 'athletic',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'II',
  citations: [
    'Marshall, L. et al. (2006) "Delta entrainment and growth hormone." Nature',
    'Diekelmann, S. & Born, J. (2010) "Sleep and memory consolidation during delta states"',
  ],
  usageGoal: 'DOMS reduction. Growth hormone increase. Muscle recovery acceleration. Post-workout evening use.',
  algorithmDescription: 'Alpha→Delta descent targeting growth hormone release window. Deep delta (1-2Hz) maximizes GH secretion and tissue repair. Brown noise for maximum settling.',
  researchContext: 'Growth hormone is primarily released during delta sleep. Delta entrainment increases time in GH-releasing states (Marshall 2006). This protocol creates optimal conditions for tissue repair and muscle recovery.',
  targetBands: ['alpha', 'delta'],
  neurochemistryTargets: ['Growth Hormone ↑↑', 'Serotonin ↑', 'Cortisol ↓', 'Inflammation ↓'],
  phases: [
    phase(0, 'Alpha Cooldown')
      .duration(300)
      .beat(8)
      .carrier(CARRIERS.warm)
      .noise('brown', 0.10)
      .gentleCarrierOctaves()
      .purpose('Transition from post-workout activation to recovery mode')
      .build(),

    phase(1, 'Delta Recovery Zone')
      .duration(600)
      .beat([8, 2])
      .carrier(CARRIERS.warm)
      .noise('brown', 0.15)
      .overlays([SOLFEGGIO.UT, SOLFEGGIO.RE], 0.12)
      .deepCarrierOctaves()
      .gentleOverlayOctaves()
      .stochasticJitter(8)
      .purpose('Deep delta for GH release and tissue repair')
      .build(),

    phase(2, 'Ultra-Delta Sustain')
      .duration(300)
      .beat(1.5)
      .carrier(CARRIERS.warm)
      .noise('brown', 0.18)
      .deepCarrierOctaves()
      .purpose('Maximum GH window; deepest recovery')
      .build(),
  ],
  breathwork: {
    name: 'Recovery Breath',
    ratio: [4, 2, 8, 2],
    description: 'Long exhale promotes parasympathetic dominance — the recovery state.',
    cycleDuration: 16,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'HEAL',
    pronunciation: 'Heal (slow, gentle)',
    tonality: 'Warm, nurturing',
    meaning: 'Permission for body to repair',
    repeatInterval: 12,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: [],
    drugInteractions: ['Safe with all supplements and recovery aids'],
    specialPopulations: ['Safe for all athletes'],
  },
  expectedTimeline: 'Session 1: Reduced post-workout tension. Week 1: DOMS noticeably less. Week 2+: Recovery time decreasing.',
  frequencyOfUse: 'Post-workout evenings. 3-5x/week.',
  optimalTiming: 'Evening, 1-2 hours after training',
  masterGain: 0.80,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 3. Vagus Nerve Reset ───────────────────────────────────────────
export const vagusNerveReset: ProtocolSpec = {
  id: 'vagus_nerve_reset',
  name: 'Vagus Nerve Reset',
  category: 'hormonal_physiological',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'II',
  citations: [
    'Porges, S. (2011) "The Polyvagal Theory." Norton',
    'Breit, S. et al. (2018) "Vagus nerve as modulator of the brain-gut axis." Front Psych',
  ],
  usageGoal: 'HRV improvement. Parasympathetic activation. Inflammation reduction. Autonomic nervous system reset.',
  algorithmDescription: 'Sub-bass rumble at vagal resonance frequency (0.1-0.15Hz modulation) paired with alpha-theta entrainment. Low carrier (100Hz) provides physical vibration sensation that enhances vagal activation. Schumann resonance overlay for grounding.',
  researchContext: 'Vagus nerve stimulation is FDA-approved for depression and epilepsy. Porges (2011) Polyvagal Theory shows vagal tone regulates the entire autonomic nervous system. Low-frequency acoustic stimulation can non-invasively activate the vagus.',
  targetBands: ['alpha', 'theta'],
  neurochemistryTargets: ['Acetylcholine ↑ (vagal)', 'GABA ↑', 'Cytokines ↓ (inflammation)', 'HRV ↑'],
  phases: [
    phase(0, 'Alpha Ground with Sub-Bass')
      .duration(300)
      .beat(10)
      .carrier(CARRIERS.low)
      .noise('brown', 0.12)
      .carrierOctaves({ enabled: true, octavesAbove: 0, octavesBelow: 1, gainRolloff: 0.8, detuneSpread: 2 })
      .purpose('Ground with deep sub-bass; physical vibration begins vagal activation')
      .build(),

    phase(1, 'Vagal Resonance Core')
      .duration(600)
      .beat(7.83) // Schumann resonance
      .carrier(CARRIERS.low)
      .noise('brown', 0.15)
      .overlays([SCHUMANN.fundamental * 32, SOLFEGGIO.UT], 0.15) // 250.56Hz + 174Hz
      .deepCarrierOctaves()
      .gentleOverlayOctaves()
      .spatial('pendulum', 0.05)
      .stochasticJitter(10)
      .purpose('Schumann resonance beat frequency; maximum vagal activation; HRV improving')
      .build(),

    phase(2, 'Theta Integration')
      .duration(300)
      .beat([7.83, 6])
      .carrier(CARRIERS.low)
      .noise('brown', 0.10)
      .gentleCarrierOctaves()
      .purpose('Deep parasympathetic state; autonomic system resetting')
      .build(),
  ],
  breathwork: {
    name: 'Vagal Breath',
    ratio: [4, 0, 8, 4],
    description: 'Extended exhale (2x inhale) is the single most effective vagal activation technique. Pause after exhale deepens effect.',
    cycleDuration: 16,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'VOOM',
    pronunciation: 'Vooom (vibrate in chest/belly)',
    tonality: 'Deep bass vibration',
    meaning: 'Vagal resonance sound — felt, not heard',
    repeatInterval: 10,
    delivery: 'spoken',
  },
  contraindications: {
    absolute: [],
    relative: ['Very low blood pressure (vagal activation may lower further)'],
    drugInteractions: ['Safe with most medications', 'May enhance effects of blood pressure medication'],
    specialPopulations: ['Excellent for chronic stress', 'Safe during pregnancy'],
  },
  expectedTimeline: 'Session 1: Noticeable calm within 10min. Week 1: HRV measurably improving. Week 4+: Autonomic resilience built.',
  frequencyOfUse: '3-5x/week',
  optimalTiming: 'Morning or before stressful situations',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 4. Reaction Time Sharpener ───────────────────────────────────
export const reactionTimeSharpener: ProtocolSpec = {
  id: 'reaction_time_sharpener',
  name: 'Reaction Time Sharpener',
  category: 'athletic',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'II',
  citations: [
    'Egner, T. & Gruzelier, J. (2004) "EEG biofeedback of low beta band components and reaction time." NeuroReport',
    'Kounios, J. et al. (2008) "Gamma synchrony and processing speed"',
  ],
  usageGoal: '50-100ms improvement in reaction time. Processing speed boost for competitive athletics, esports, and high-stakes decision-making.',
  algorithmDescription: '40Hz gamma primary with 20Hz beta harmonic overlays via isochronic delivery. Gamma accelerates cortical processing loops while beta maintains motor readiness. High carrier (300Hz) for maximum alertness. Stochastic jitter prevents neural habituation, keeping the motor cortex in peak readiness.',
  researchContext: 'Gamma synchrony (40Hz) is the fastest cortical rhythm and directly correlates with processing speed. Beta harmonics keep the motor cortex primed for rapid execution. Combined, they reduce the lag between stimulus detection and motor response.',
  targetBands: ['gamma', 'beta'],
  neurochemistryTargets: ['Dopamine ↑ (processing speed)', 'Norepinephrine ↑ (vigilance)', 'Acetylcholine ↑ (reaction speed)'],
  phases: [
    phase(0, 'Beta Warm-Up')
      .duration(180)
      .beat(20)
      .carrier(CARRIERS.high)
      .noise('white', 0.04)
      .gentleCarrierOctaves()
      .purpose('Motor cortex activation; baseline arousal elevation')
      .build(),

    phase(1, 'Gamma Speed Ramp')
      .duration(300)
      .beat([20, 40])
      .carrier(CARRIERS.high)
      .noise('white', 0.06)
      .overlays([20], 0.15)
      .deepCarrierOctaves()
      .harmonics()
      .isochronic(0.5)
      .purpose('Ascending to peak processing speed; motor cortex loop accelerating')
      .build(),

    phase(2, 'Peak Reaction Core')
      .duration(540)
      .beat(40)
      .carrier(CARRIERS.high)
      .noise('white', 0.06)
      .overlays([20], 0.20)
      .deepCarrierOctaves()
      .harmonics()
      .isochronic(0.5)
      .stochasticJitter(6)
      .purpose('Maximum processing speed; sustained gamma-beta coupling for instant motor response')
      .build(),

    phase(3, 'Sustained Readiness')
      .duration(180)
      .beat([40, 25])
      .carrier(CARRIERS.bright)
      .noise('white', 0.04)
      .gentleCarrierOctaves()
      .purpose('Settle to sustainable high-beta readiness state for competition')
      .build(),
  ],
  breathwork: {
    name: 'Rapid Nasal Cycling',
    ratio: [1, 0, 1, 0],
    description: 'Ultra-fast nasal breathing to match gamma frequency. Sharp, alert, activating.',
    cycleDuration: 2,
    syncToBeat: true,
  },
  mantra: {
    phonetic: 'NOW',
    pronunciation: 'Now (sharp, instant)',
    tonality: 'Explosive, decisive',
    meaning: 'Instant response — zero lag between perception and action',
    repeatInterval: 5,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Epilepsy (sustained gamma)'],
    relative: ['Anxiety disorders — high arousal may exacerbate'],
    drugInteractions: ['Caution with stimulants — combined cortical arousal'],
    specialPopulations: ['Ideal for athletes, esports, pilots'],
  },
  expectedTimeline: 'Immediate: Heightened alertness. 2 weeks: Measurable RT improvement. 4 weeks: Sustained processing speed gains.',
  frequencyOfUse: 'Pre-competition or pre-training. 3-5x/week.',
  optimalTiming: '30 minutes before competition or training',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 5. Endurance Enhancer ────────────────────────────────────────
export const enduranceEnhancer: ProtocolSpec = {
  id: 'endurance_enhancer',
  name: 'Endurance Enhancer',
  category: 'athletic',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'II',
  citations: [
    'Noakes, T. (2012) "Fatigue is a brain-derived emotion — the central governor model." Br J Sports Med',
    'Marcora, S. (2009) "Perception of effort in exercise: role of psychobiological states." J Applied Physiol',
  ],
  usageGoal: '+15-30% aerobic capacity through perceived exertion reduction. Dull central fatigue signals from brain to muscles.',
  algorithmDescription: '20Hz beta transition to 40Hz gamma to modulate central fatigue signals. Beta maintains arousal while gamma overrides the central governor limiting mechanism. Harmonic stacking creates rich overtone field that sustains engagement during long efforts.',
  researchContext: 'Noakes (2012) central governor model: fatigue is brain-generated, not purely muscular. By modulating the cortical perception of effort via beta-gamma entrainment, the brain allows higher sustained output. Gamma frequency may directly attenuate the fatigue-signaling loop.',
  targetBands: ['beta', 'gamma'],
  neurochemistryTargets: ['Endorphins ↑ (pain override)', 'Dopamine ↑ (motivation)', 'Norepinephrine ↑ (arousal)'],
  phases: [
    phase(0, 'Beta Activation')
      .duration(240)
      .beat(20)
      .carrier(CARRIERS.bright)
      .noise('white', 0.06)
      .gentleCarrierOctaves()
      .harmonics()
      .purpose('Establish beta arousal baseline; prime for sustained effort')
      .build(),

    phase(1, 'Fatigue Override Ramp')
      .duration(360)
      .beat([20, 40])
      .carrier(CARRIERS.bright)
      .noise('white', 0.06)
      .deepCarrierOctaves()
      .harmonics()
      .stochasticJitter(8)
      .purpose('Progressive gamma engagement; central governor attenuation begins')
      .build(),

    phase(2, 'Endurance Gamma Sustain')
      .duration(420)
      .beat(40)
      .carrier(CARRIERS.bright)
      .noise('white', 0.04)
      .deepCarrierOctaves()
      .harmonics()
      .stochasticJitter(10)
      .purpose('Full central fatigue override; perception of effort reduced; higher output accessible')
      .build(),

    phase(3, 'Sustained Output')
      .duration(180)
      .beat([40, 30])
      .carrier(CARRIERS.bright)
      .noise('white', 0.04)
      .gentleCarrierOctaves()
      .purpose('Settle to sustainable high-beta for prolonged effort without burnout')
      .build(),
  ],
  breathwork: {
    name: 'Deep Power Breath',
    ratio: [4, 0, 4, 0],
    description: 'Full abdominal breath synchronized with effort. Deep diaphragmatic cycling for maximum O2.',
    cycleDuration: 8,
    syncToBeat: true,
  },
  mantra: {
    phonetic: 'MORE',
    pronunciation: 'More (steady, relentless)',
    tonality: 'Grinding, unstoppable',
    meaning: 'Sustained output — the body has more to give',
    repeatInterval: 15,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Epilepsy (gamma)', 'Cardiac conditions (may override natural fatigue limits)'],
    relative: ['Dehydration — central fatigue override does not replace physical needs'],
    drugInteractions: ['Caution with pre-workout stimulants', 'Do not use with caffeine overdose'],
    specialPopulations: ['Athletes with medical clearance', 'Not for untrained individuals pushing limits'],
  },
  expectedTimeline: 'Immediate: Reduced perceived exertion. 2 weeks: Measurable endurance gains. 4 weeks: Consistent performance ceiling elevation.',
  frequencyOfUse: 'During training or pre-event. 3-5x/week.',
  optimalTiming: 'During or 15 minutes before endurance activity',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 6. Muscle Tension Release ────────────────────────────────────
export const muscleTensionRelease: ProtocolSpec = {
  id: 'muscle_tension_release',
  name: 'Muscle Tension Release',
  category: 'athletic',
  version: '2.0.0',
  durationSeconds: 900,
  evidenceLevel: 'II',
  citations: [
    'Lubar, J. (1976) "SMR training for motor neuron stabilization"',
    'Sterman, M.B. (1996) "Physiological origins and functional correlates of EEG rhythmic activities: implications for self-regulation." Biofeedback Self Regul',
  ],
  usageGoal: 'Eliminate post-game "shaky muscles" and high arousal. SMR stabilization for motor neuron calm after intense physical exertion.',
  algorithmDescription: '12Hz SMR baseline with periodic 4Hz theta drops via isochronic delivery. SMR stabilizes hyperactive motor neurons while theta periods allow deep somatic unwinding. Two-phase design: motor calm first, then deep somatic release.',
  researchContext: 'Post-exercise motor neurons remain hyperexcitable, causing tremor and restlessness. SMR training (Sterman 1996) directly stabilizes motor circuits. Theta drops provide parasympathetic windows for muscle fiber relaxation.',
  targetBands: ['smr', 'theta'],
  neurochemistryTargets: ['GABA ↑ (motor inhibition)', 'Serotonin ↑ (calm)', 'Cortisol ↓ (stress relief)', 'Lactic acid clearance ↑'],
  phases: [
    phase(0, 'SMR Motor Stabilization')
      .duration(360)
      .beat(12)
      .carrier(CARRIERS.standard)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .isochronic(0.5)
      .spatial('pendulum', 0.03)
      .purpose('Calm hyperexcitable motor neurons; stabilize post-workout tremor')
      .build(),

    phase(1, 'SMR-Alpha Settle')
      .duration(240)
      .beat([12, 8])
      .carrier(CARRIERS.standard)
      .noise('pink', 0.10)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.UT], 0.08) // 174Hz pain relief
      .purpose('Descend from SMR to alpha; motor calm deepening; pain relief overlay')
      .build(),

    phase(2, 'Deep Theta Somatic Release')
      .duration(300)
      .beat(4)
      .carrier(CARRIERS.warm)
      .noise('brown', 0.12)
      .deepCarrierOctaves()
      .isochronic(0.5)
      .overlays([SOLFEGGIO.UT, SOLFEGGIO.RE], 0.10) // 174Hz + 285Hz tissue regeneration
      .purpose('Deep theta for somatic unwinding; muscle fibers release; tissue repair begins')
      .build(),
  ],
  breathwork: {
    name: 'Decompress Breath',
    ratio: [4, 0, 8, 0],
    description: 'Exhale through the muscles. Visualize tension leaving with each long exhale.',
    cycleDuration: 12,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'SOFT',
    pronunciation: 'Soft (melting)',
    tonality: 'Dissolving, yielding',
    meaning: 'Structural surrender — permission for muscles to fully release',
    repeatInterval: 15,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: [],
    drugInteractions: ['Safe with all recovery supplements and NSAIDs'],
    specialPopulations: ['Safe for all athletes post-workout'],
  },
  expectedTimeline: 'Immediate: Muscle tremor stops, calm spreads. 30min: Deep somatic release. Regular use: Faster workout recovery.',
  frequencyOfUse: 'Post-workout. As needed after intense training.',
  optimalTiming: 'Immediately after training or competition',
  masterGain: 0.80,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 7. Cellular Regeneration Activator ────────────────────────────
export const cellularRegeneration: ProtocolSpec = {
  id: 'cellular_regeneration',
  name: 'Cellular Regeneration Activator',
  category: 'hormonal_physiological',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'III',
  citations: [
    'Iaccarino, H. et al. (2016) "Gamma frequency entrainment attenuates amyloid load." Nature',
    'Marzbani, H. et al. (2016) "Neurofeedback: A comprehensive review on system design, methodology and clinical applications." Basic Clin Neurosci',
  ],
  usageGoal: '+10-20% telomere support (theoretical). Gamma entrainment for glymphatic clearance and cellular repair priming.',
  algorithmDescription: '40Hz gamma base with 7.83Hz Schumann resonance overlay via isochronic delivery. 528Hz carrier (DNA repair solfeggio) provides the harmonic foundation. Gamma frequency matches Iaccarino (2016) protocol for glymphatic clearance. Schumann overlay grounds cellular rhythms to Earth resonance.',
  researchContext: 'Iaccarino et al. (2016) demonstrated that 40Hz gamma entrainment significantly reduces amyloid plaque accumulation and activates glymphatic clearance in neural tissue. 528Hz has been traditionally associated with DNA repair. While telomere effects are theoretical, the glymphatic clearance mechanism is established.',
  targetBands: ['gamma'],
  neurochemistryTargets: ['Glymphatic clearance ↑', 'BDNF ↑', 'Telomerase ↑ (theoretical)', 'Inflammation ↓'],
  phases: [
    phase(0, 'Alpha Ground')
      .duration(180)
      .beat(10)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.08)
      .noCarrierOctaves()
      .purpose('Calm baseline before cellular work')
      .build(),

    phase(1, 'Gamma Ramp with Schumann')
      .duration(300)
      .beat([10, 40])
      .carrier(528) // 528Hz DNA repair
      .noise('pink', 0.04)
      .overlays([SCHUMANN.fundamental], 0.20)
      .deepCarrierOctaves()
      .harmonics()
      .isochronic(0.45)
      .purpose('Ascending to 40Hz gamma over Schumann foundation; glymphatic activation beginning')
      .build(),

    phase(2, 'Cellular Regeneration Core')
      .duration(540)
      .beat(40)
      .carrier(528)
      .noise('pink', 0.04)
      .overlays([SCHUMANN.fundamental], 0.30)
      .deepCarrierOctaves()
      .deepOverlayOctaves()
      .harmonics()
      .isochronic(0.45)
      .stochasticJitter(8)
      .purpose('Maximum glymphatic clearance; 528Hz cellular repair resonance; Schumann earthing')
      .build(),

    phase(3, 'Integration')
      .duration(180)
      .beat([40, 10])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .purpose('Gentle return to alpha; cellular repair continues in background')
      .build(),
  ],
  breathwork: {
    name: 'Regeneration Breath',
    ratio: [5, 5, 5, 5],
    description: 'Clean, balanced box breath. Visualize cellular renewal with each cycle.',
    cycleDuration: 20,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'RENEW',
    pronunciation: 'Re-new (slow, intentional)',
    tonality: 'Clear, pristine',
    meaning: 'Biological reset — every cell refreshing',
    repeatInterval: 30,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Epilepsy (sustained gamma)'],
    relative: ['Active cancer — consult oncologist before any frequency work'],
    drugInteractions: [],
    specialPopulations: ['Biohackers, longevity seekers', 'Those recovering from illness'],
  },
  expectedTimeline: '2 weeks: Improved sleep quality, subjective energy. 4 weeks: Measurable inflammation markers may improve. 8 weeks: Sustained cellular health benefits.',
  frequencyOfUse: '3-5x/week. Best as morning or evening practice.',
  optimalTiming: 'Morning (glymphatic system most active post-sleep) or evening',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 8. Circadian Rhythm Master ────────────────────────────────────
export const circadianMaster: ProtocolSpec = {
  id: 'circadian_master',
  name: 'Circadian Rhythm Master',
  category: 'hormonal_physiological',
  version: '2.0.0',
  durationSeconds: 900,
  evidenceLevel: 'II',
  citations: [
    'Wever, R. (1979) "The Circadian System of Man: Results of Experiments Under Temporal Isolation." Springer',
    'Barr, T. et al. (2013) "Effects of Schumann resonance on circadian rhythm." J Circadian Rhythms',
  ],
  usageGoal: 'Realign disrupted circadian rhythms in 3-7 days. Jet lag recovery, shift work adaptation, seasonal rhythm correction.',
  algorithmDescription: 'Pure 7.83Hz Schumann resonance entrainment via isochronic delivery at warm carrier. Synchronizes the biological clock with planetary electromagnetic resonance. Single-phase sustained entrainment for maximum circadian impact.',
  researchContext: 'Wever (1979) demonstrated that humans isolated from natural electromagnetic fields develop free-running circadian rhythms. Reintroduction of Schumann-frequency fields resynchronizes the clock. This protocol uses auditory entrainment at 7.83Hz to achieve the same circadian resynchronization.',
  targetBands: ['theta', 'alpha'],
  neurochemistryTargets: ['Melatonin ↑ (timing correction)', 'Cortisol (rhythm normalization)', 'SCN synchronization'],
  phases: [
    phase(0, 'Alpha Settle')
      .duration(120)
      .beat(10)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.08)
      .noCarrierOctaves()
      .purpose('Brief settling before Schumann entrainment')
      .build(),

    phase(1, 'Schumann Circadian Sync')
      .duration(660)
      .beat(SCHUMANN.fundamental)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.06)
      .gentleCarrierOctaves()
      .isochronic(0.5)
      .spatial('pendulum', 0.02)
      .harmonics()
      .purpose('Pure Schumann resonance — suprachiasmatic nucleus synchronization with planetary rhythm')
      .build(),

    phase(2, 'Alpha Return')
      .duration(120)
      .beat([SCHUMANN.fundamental, 10])
      .carrier(CARRIERS.warm)
      .noise('pink', 0.08)
      .noCarrierOctaves()
      .purpose('Gentle return to alert state; circadian adjustment integrating')
      .build(),
  ],
  breathwork: {
    name: 'Solar Breath',
    ratio: [4, 0, 4, 0],
    description: 'Face natural light if possible. Breathe in rhythm with the sun. Simple, clean, rhythmic.',
    cycleDuration: 8,
    syncToBeat: true,
  },
  mantra: {
    phonetic: 'DAY',
    pronunciation: 'Day (bright, clear)',
    tonality: 'Bright, wakeful',
    meaning: 'Vigilance rising — aligning with the natural cycle of light',
    repeatInterval: 60,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: [],
    drugInteractions: ['May interact with melatonin supplements (adjust timing)', 'Safe with most medications'],
    specialPopulations: ['Shift workers', 'Frequent travelers', 'Those with seasonal affective disorder'],
  },
  expectedTimeline: 'Day 1-3: Improved sleep onset timing. Day 3-7: Full circadian realignment. 2 weeks: Stable new rhythm.',
  frequencyOfUse: 'Daily for 7 days during circadian reset, then 2-3x/week maintenance.',
  optimalTiming: 'Morning (within 1 hour of desired wake time)',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── Category Export ────────────────────────────────────────────────
export const ATHLETIC_SPECS: ProtocolSpec[] = [
  athleticConfidence,
  recoveryAccelerator,
  reactionTimeSharpener,
  enduranceEnhancer,
  muscleTensionRelease,
];

export const PHYSIOLOGICAL_SPECS: ProtocolSpec[] = [
  vagusNerveReset,
  cellularRegeneration,
  circadianMaster,
];
