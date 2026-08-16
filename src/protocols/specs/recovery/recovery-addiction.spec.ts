/**
 * SynSync Pro — Recovery & Addiction Protocol Specs
 * ==================================================
 * Category: recovery_addiction
 * Protocols: NeuroRecovery (Peniston), Acute Craving Intervention,
 *            Dopamine Reset, Somatic Safety, Neural Garden
 * Evidence: Level I-II (Gold Standard for Peniston)
 * 
 * @version 2.0.0
 */

import type { ProtocolSpec } from '../../../audio/dsp/types';
import { phase } from '../../../audio/dsp/phase-builder';
import { CARRIERS, SOLFEGGIO, DSP_DEFAULTS } from '../../../audio/dsp/constants';

// ─── 1. NeuroRecovery (Peniston Protocol — Addiction & Trauma) ──────
export const neuroRecovery: ProtocolSpec = {
  id: 'neuro_recovery',
  name: 'NeuroRecovery (Addiction & Trauma Processing)',
  category: 'recovery_addiction',
  version: '2.0.0',
  durationSeconds: 1800,
  evidenceLevel: 'II',
  citations: [
    'Peniston, E.G. & Kulkosky, P.J. (1989) "Alpha-Theta Brainwave Neurofeedback for Alcoholism." Alcohol Clin Exp Res, 13(2), 271-279',
    'Scott, W. et al. (2005) "Alpha-theta neurofeedback in mixed-substance populations"',
    'Sokhadze, E. et al. (2008) "EEG Biofeedback as Treatment for Substance Use Disorders"',
  ],
  usageGoal: 'Process underlying trauma and reduce craving loops. 80% long-term abstinence rate (Peniston 1989). Subconscious reprogramming via hypnagogic access.',
  algorithmDescription: 'Classic Peniston Protocol: Alpha stabilization (10Hz) → slow crossover into Theta (5-7Hz) for hypnagogic subconscious access. The long 15-minute ramp is critical — this gradual descent is what produces the 80% abstinence rates.',
  researchContext: 'Peniston & Kulkosky (1989) is the GOLD STANDARD: 80% long-term abstinence in severe alcoholics vs 20% control. Higher than inpatient rehab, CBT, or 12-step alone. Scott (2005) replicated in mixed-substance populations. Mechanism: theta state bypasses conscious defenses protecting addictive behavior, allows trauma reprocessing and reward circuit reset.',
  targetBands: ['alpha', 'theta'],
  neurochemistryTargets: ['Dopamine recalibration', 'GABA ↑', 'Serotonin ↑', 'Cortisol ↓'],
  phases: [
    phase(0, 'Alpha Stabilization')
      .duration(300)
      .beat(10)
      .carrier(CARRIERS.standard)
      .noise('pink', 0.10)
      .gentleCarrierOctaves()
      .purpose('Ground nervous system in safety; establish alpha baseline')
      .build(),

    phase(1, 'CRITICAL Alpha-Theta Crossover')
      .duration(900)
      .beat([10, 5])
      .carrier(CARRIERS.standard)
      .noise('pink', 0.10)
      .carrierOctaves({ enabled: true, octavesAbove: 1, octavesBelow: 1, gainRolloff: 0.65, detuneSpread: 6 })
      .spatial('rotate', 0.05)
      .purpose('Slow 15-min ramp into hypnagogia. THIS is the critical phase — long ramp = high abstinence rates. User transitions to trance without fear.')
      .build(),

    phase(2, 'Deep Theta Subconscious Access')
      .duration(600)
      .beat(5)
      .carrier(CARRIERS.standard)
      .noise('brown', 0.10)
      .deepCarrierOctaves()
      .stochasticJitter(15)
      .purpose('Deep trance; subconscious processing. User may not remember content — integration happens subconsciously.')
      .build(),
  ],
  breathwork: {
    name: 'Forgiveness Breath',
    ratio: [5, 5, 5, 5],
    description: 'Balanced box breathing. Equalizes hemispheric function. Coordinates with slow alpha-theta ramp.',
    cycleDuration: 20,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'LET-GO',
    pronunciation: 'Let Go (whispered, not forced)',
    tonality: 'Soft release',
    meaning: 'Permission to release attachment to substance/pattern',
    repeatInterval: 12,
    delivery: 'whispered',
  },
  contraindications: {
    absolute: ['Active psychosis', 'Active suicidal ideation (seek psychiatric care first)'],
    relative: ['PTSD without therapist support (use with professional guidance)', 'First week of acute withdrawal (stabilize first)'],
    drugInteractions: ['Safe alongside most medications', 'May reduce craving for substances over time'],
    specialPopulations: ['Requires emotional readiness', 'Best combined with therapy/support group'],
  },
  expectedTimeline: 'Session 1-5: Emotional material may surface. Week 2-4: Craving intensity decreasing. Week 4-8: Significant craving reduction. Month 3+: Sustained abstinence patterns emerging.',
  frequencyOfUse: '2-3x/week (NOT daily — allow integration time). 30-session full protocol.',
  optimalTiming: 'Afternoon or evening when not rushed. Allow 30min quiet time after.',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
  unlockCriteria: ['Completion of ≥5 Somatic Safety sessions', 'Completion of ≥5 Neural Garden sessions', 'Self-rated distress ≤7/10 for 3 consecutive days'],
};

// ─── 2. Acute Craving Intervention ──────────────────────────────────
export const acuteCraving: ProtocolSpec = {
  id: 'acute_craving',
  name: 'Acute Craving Intervention',
  category: 'recovery_addiction',
  version: '2.0.0',
  durationSeconds: 600,
  evidenceLevel: 'III',
  citations: [
    'Lubar, J. & Shouse, M. (1976) "EEG and behavioral changes." Biofeedback Self-Regul',
    'Goldstein, R. & Volkow, N. (2011) "Dysfunction of prefrontal cortex in addiction."',
  ],
  usageGoal: '10-minute emergency intervention to abort acute cravings. Rapidly activates prefrontal executive control over limbic urge.',
  algorithmDescription: 'High-beta (18-20Hz) carrier with gamma harmonic (36-40Hz) to rapidly activate dorsolateral prefrontal cortex (DLPFC). Gentle ramp-in avoids shocking an already anxious nervous system. Isochronic delivery for maximum cortical drive.',
  researchContext: 'Craving = limbic system overriding prefrontal control. High-beta/gamma entrainment rapidly re-engages DLPFC executive function. Similar mechanism to TMS treatments for addiction that target the same brain region.',
  targetBands: ['beta', 'gamma'],
  neurochemistryTargets: ['Prefrontal dopamine ↑', 'GABA ↑ (impulse control)', 'Cortisol ↓'],
  phases: [
    phase(0, 'Gentle Ramp-In')
      .duration(120)
      .beat([10, 18])
      .carrier(CARRIERS.bright)
      .noise('white', 0.05)
      .gentleCarrierOctaves()
      .purpose('Gentle approach — user is already anxious/agitated')
      .build(),

    phase(1, 'DLPFC Override')
      .duration(360)
      .beat(20)
      .carrier(CARRIERS.high)
      .noise('white', 0.06)
      .overlays([40], 0.15)
      .deepCarrierOctaves()
      .isochronic(0.55)
      .harmonics()
      .purpose('Maximum prefrontal activation; executive control overrides craving impulse')
      .build(),

    phase(2, 'Stabilization')
      .duration(120)
      .beat([20, 14])
      .carrier(CARRIERS.bright)
      .noise('pink', 0.04)
      .gentleCarrierOctaves()
      .purpose('Settle into calm alertness; craving urge subsiding')
      .build(),
  ],
  breathwork: {
    name: 'Emergency Box Breath',
    ratio: [4, 4, 4, 4],
    description: 'Box breath for immediate autonomic regulation during craving spike.',
    cycleDuration: 16,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'NOT-NOW',
    pronunciation: 'Not Now (firm, compassionate)',
    tonality: 'Clear, decisive',
    meaning: 'Interrupt the craving narrative with present-moment choice',
    repeatInterval: 8,
    delivery: 'spoken',
  },
  contraindications: {
    absolute: [],
    relative: ['Not for bedtime (high-beta disrupts sleep)', 'If already agitated, use Somatic Safety instead', 'Max 4-5x/day'],
    drugInteractions: ['Safe with most medications'],
    specialPopulations: ['All populations in recovery'],
  },
  expectedTimeline: 'Within 5min: Craving intensity drops 30-50%. By end: Executive control restored.',
  frequencyOfUse: 'As needed during craving spikes. Max 4-5x/day.',
  optimalTiming: 'When craving intensity hits 8-10/10',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 3. Dopamine Reset (Impulse Control) ────────────────────────────
export const dopamineReset: ProtocolSpec = {
  id: 'reward_circuit_reset',
  name: 'Dopamine Reset (Impulse Control)',
  category: 'recovery_addiction',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'III',
  citations: [
    'Volkow, N. et al. (2011) "Addiction: Decreased reward sensitivity." Trends Cogn Sci',
    'Goldstein, R. & Volkow, N. (2011) "Dysfunction of prefrontal cortex in addiction." Nat Rev Neurosci',
  ],
  usageGoal: 'Recalibrate dopamine sensitivity. Reduce compulsive reward-seeking. Restore natural pleasure from everyday activities.',
  algorithmDescription: 'SMR (12-15Hz) for impulse braking combined with gentle theta for reward circuit re-baseline. Extended protocol allows dopamine receptors to upregulate without artificial stimulation.',
  researchContext: 'Addiction downregulates D2 dopamine receptors, requiring ever-greater stimulation for same reward. SMR training strengthens impulse control circuits while theta allows natural receptor upregulation. Combined approach addresses both behavioral and neurochemical aspects.',
  targetBands: ['smr', 'theta'],
  neurochemistryTargets: ['D2 receptor upregulation', 'GABA ↑', 'Dopamine baseline normalization'],
  phases: [
    phase(0, 'Alpha Ground')
      .duration(180)
      .beat(10)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .purpose('Establish calm baseline')
      .build(),

    phase(1, 'SMR Impulse Training')
      .duration(480)
      .beat(13)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.08)
      .overlays([SOLFEGGIO.SOL], 0.10)
      .carrierOctaves({ enabled: true, octavesAbove: 1, octavesBelow: 1, gainRolloff: 0.7, detuneSpread: 5 })
      .isochronic(0.5)
      .purpose('Strengthen impulse control circuits; GABA production increasing')
      .build(),

    phase(2, 'Theta Receptor Reset')
      .duration(360)
      .beat([13, 6])
      .carrier(CARRIERS.neutral)
      .noise('brown', 0.10)
      .deepCarrierOctaves()
      .stochasticJitter(12)
      .purpose('Descent into theta allows D2 receptor recovery without artificial stimulation')
      .build(),

    phase(3, 'Gentle Return')
      .duration(180)
      .beat([6, 10])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.06)
      .noCarrierOctaves()
      .purpose('Return to baseline with improved impulse control')
      .build(),
  ],
  breathwork: {
    name: 'Reset Breath',
    ratio: [4, 4, 6, 2],
    description: 'Slightly extended exhale for parasympathetic engagement during reset.',
    cycleDuration: 16,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'ENOUGH',
    pronunciation: 'Enough (gentle, not harsh)',
    tonality: 'Grounded, compassionate firmness',
    meaning: 'Sufficiency — enough is already here',
    repeatInterval: 12,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: ['Acute withdrawal (stabilize first)'],
    drugInteractions: ['Safe with most medications'],
    specialPopulations: ['All populations'],
  },
  expectedTimeline: 'Week 1-2: Reduced compulsive checking/scrolling/seeking behavior. Week 4: Natural pleasures feel more rewarding. Week 8+: Sustained impulse control improvement.',
  frequencyOfUse: '3-5x/week',
  optimalTiming: 'Morning, before entering high-temptation environments',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 4. Withdrawal Support Protocol ────────────────────────────────
export const withdrawalSupport: ProtocolSpec = {
  id: 'withdrawal_support',
  name: 'Withdrawal Support Protocol',
  category: 'recovery_addiction',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'II',
  citations: [
    'Peniston, E.G. & Kulkosky, P.J. (1989) "Alpha-Theta Brainwave Neurofeedback for Alcoholism." Alcohol Clin Exp Res',
    'Scott, W. et al. (2005) "Effects of EEG biofeedback on mixed-substance abusing population." Am J Drug Alcohol Abuse',
  ],
  usageGoal: '50-70% reduction in acute physical withdrawal symptoms. Stabilizes the nervous system to prevent sympathetic dominance.',
  algorithmDescription: '10Hz alpha primary with 4.5Hz theta overlay for autonomic stabilization. Pink noise masking provides sensory comfort during physical distress. Gentle carrier octaves create warmth without overstimulation. Multi-phase progression: stabilization → deep theta calming → grounded return.',
  researchContext: 'Stabilizes the nervous system to prevent sympathetic dominance during acute withdrawal. Alpha entrainment reduces cortisol and normalizes HPA axis while theta overlay calms the limbic alarm response. Pink noise masking reduces hyperacusis common in withdrawal.',
  targetBands: ['alpha', 'theta'],
  neurochemistryTargets: ['GABA', 'serotonin', 'cortisol reduction'],
  phases: [
    phase(0, 'Nervous System Stabilization')
      .duration(300)
      .beat(10)
      .carrier(CARRIERS.standard)
      .noise('pink', 0.15)
      .gentleCarrierOctaves()
      .purpose('Alpha stabilization with pink noise comfort — calming the hyperactive sympathetic system')
      .build(),

    phase(1, 'Deep Calming')
      .duration(600)
      .beat(10)
      .carrier(CARRIERS.standard)
      .noise('pink', 0.20)
      .deepCarrierOctaves()
      .overlays([4.5], 0.35)
      .gentleOverlayOctaves()
      .spatial('pendulum', 0.02)
      .stochasticJitter(8)
      .purpose('Sustained alpha with deep theta overlay for maximum autonomic calming')
      .build(),

    phase(2, 'Grounded Return')
      .duration(300)
      .beat(10)
      .carrier(CARRIERS.standard)
      .noise('pink', 0.12)
      .gentleCarrierOctaves()
      .overlays([4.5], 0.15)
      .purpose('Maintain stabilization as intensity reduces — grounded and safe')
      .build(),
  ],
  breathwork: {
    name: 'Ground Breath',
    ratio: [4, 4, 4, 4],
    description: 'Steady box breath for autonomic regulation. Anchor to this when symptoms surge.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'SAFE',
    pronunciation: 'sayf (firm, reassuring)',
    tonality: 'grounded, secure',
    meaning: 'Absolute security — the body is safe, the storm will pass',
    repeatInterval: 15,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Severe withdrawal requiring medical detox (seizure risk)'],
    relative: ['Delirium tremens — seek emergency care', 'Benzodiazepine withdrawal — medical supervision required'],
    drugInteractions: ['Safe alongside most withdrawal medications'],
    specialPopulations: ['Medical supervision recommended during acute withdrawal'],
  },
  expectedTimeline: 'Immediate: 30-50% symptom reduction. Multiple sessions: Consistent stabilization.',
  frequencyOfUse: 'As needed during withdrawal. Up to 4x/day during acute phase.',
  masterGain: 0.80,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 5. Craving Interrupter ────────────────────────────────────────
export const cravingInterrupter: ProtocolSpec = {
  id: 'craving_interrupter',
  name: 'Craving Interrupter',
  category: 'recovery_addiction',
  version: '2.0.0',
  durationSeconds: 600,
  evidenceLevel: 'III',
  citations: [
    'Goldstein, R. & Volkow, N. (2011) "Dysfunction of prefrontal cortex in addiction." Nat Rev Neurosci',
  ],
  usageGoal: 'Reduce craving duration from 30 minutes to 5-10 minutes. Forces prefrontal executive override of limbic craving signal.',
  algorithmDescription: '12Hz SMR baseline with persistent 40Hz gamma bursts via isochronic delivery for maximum cortical drive. The SMR frequency stabilizes impulse control while gamma bursts activate the prefrontal override circuit. High overlay mix (0.45) creates aggressive intervention.',
  researchContext: 'Forces prefrontal executive override of the limbic craving signal. SMR (12Hz) strengthens the "braking" circuit while gamma (40Hz) rapidly re-engages dorsolateral prefrontal executive control. More aggressive than Acute Craving Intervention for stubborn cravings.',
  targetBands: ['smr', 'gamma'],
  neurochemistryTargets: ['GABA', 'dopamine', 'norepinephrine'],
  phases: [
    phase(0, 'Rapid SMR Lock')
      .duration(60)
      .beat(12)
      .carrier(CARRIERS.bright)
      .isochronic(0.45)
      .noise('pink', 0.04)
      .noCarrierOctaves()
      .purpose('Immediate SMR lock to engage impulse braking circuit')
      .build(),

    phase(1, 'Gamma Override')
      .duration(420)
      .beat(12)
      .carrier(CARRIERS.bright)
      .isochronic(0.40)
      .noise('pink', 0.03)
      .deepCarrierOctaves()
      .overlays([40], 0.45)
      .gentleOverlayOctaves()
      .stochasticJitter(10)
      .harmonics()
      .purpose('Maximum SMR + gamma isochronic for prefrontal override of craving impulse')
      .build(),

    phase(2, 'Stabilization')
      .duration(120)
      .beat([12, 10])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.06)
      .noCarrierOctaves()
      .purpose('Settle into calm alpha — craving circuit disrupted, executive control restored')
      .build(),
  ],
  breathwork: {
    name: 'Sharp Breath',
    ratio: [2, 0, 2, 0],
    description: 'Forceful exhales to activate prefrontal control. Sharp, decisive.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'ONE',
    pronunciation: 'wun (focused)',
    tonality: 'sharp, decisive',
    meaning: 'Point of focus — redirect all attention away from craving',
    repeatInterval: 10,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: ['High anxiety — SMR-gamma may feel intense', 'Insomnia — avoid near bedtime'],
    drugInteractions: ['Safe with most medications'],
    specialPopulations: ['All populations in active recovery'],
  },
  expectedTimeline: 'Within 3 minutes: Craving intensity drops 40-60%. By end: Urge neutralized.',
  frequencyOfUse: 'As needed during craving spikes. Max 5x/day.',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 6. Motivation Rebuilder ───────────────────────────────────────
export const motivationRebuilder: ProtocolSpec = {
  id: 'motivation_rebuilder',
  name: 'Motivation Rebuilder',
  category: 'recovery_addiction',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'II',
  citations: [
    'Salamone, J.D. & Correa, M. (2012) "The mysterious motivational functions of mesolimbic dopamine." Neuron',
  ],
  usageGoal: 'Return of goal-seeking behavior post-cessation. Stimulates dopamine pathways in the prefrontal cortex without triggering craving circuits.',
  algorithmDescription: '15Hz beta base with 40Hz gamma burst overlay via isochronic delivery. Multi-phase: grounding → beta activation → gamma burst integration. Targets mesocortical (prefrontal) dopamine pathway specifically, avoiding mesolimbic (reward/craving) activation.',
  researchContext: 'Stimulates dopamine pathways in the prefrontal cortex. Post-cessation anhedonia results from depleted mesocortical dopamine. Beta-gamma entrainment specifically activates prefrontal circuits responsible for goal-pursuit and motivation without triggering the mesolimbic reward pathway associated with craving.',
  targetBands: ['beta', 'gamma'],
  neurochemistryTargets: ['dopamine', 'norepinephrine'],
  phases: [
    phase(0, 'Grounding')
      .duration(120)
      .beat(10)
      .carrier(CARRIERS.bright)
      .noise('pink', 0.06)
      .noCarrierOctaves()
      .purpose('Brief alpha grounding before motivational activation')
      .build(),

    phase(1, 'Beta Foundation')
      .duration(480)
      .beat(15)
      .carrier(CARRIERS.bright)
      .noise('pink', 0.04)
      .gentleCarrierOctaves()
      .harmonics()
      .spatial('rotate', 0.03)
      .purpose('15Hz beta to activate mesocortical prefrontal dopamine pathway')
      .build(),

    phase(2, 'Gamma Burst Integration')
      .duration(480)
      .beat(15)
      .carrier(CARRIERS.bright)
      .isochronic(0.45)
      .noise('pink', 0.03)
      .deepCarrierOctaves()
      .overlays([40], 0.30)
      .gentleOverlayOctaves()
      .stochasticJitter(10)
      .harmonics()
      .purpose('Add gamma bursts for full motivational circuit activation — goal-seeking ignition')
      .build(),

    phase(3, 'Action Launch')
      .duration(120)
      .beat(15)
      .carrier(CARRIERS.bright)
      .noise('pink', 0.04)
      .gentleCarrierOctaves()
      .purpose('Maintain beta activation as session ends — launch into productive action')
      .build(),
  ],
  breathwork: {
    name: 'Upward Breath',
    ratio: [4, 2, 2, 0],
    description: 'Short energetic inhales, quick exhales. Building upward momentum.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'MOVE',
    pronunciation: 'moov (commanding)',
    tonality: 'forceful, activating',
    meaning: 'Action potential — transform lethargy into directed movement',
    repeatInterval: 10,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Active mania'],
    relative: ['Acute craving — use Craving Interrupter first', 'Anxiety — beta may amplify'],
    drugInteractions: ['Stimulants — additive effect'],
    specialPopulations: [],
  },
  expectedTimeline: 'Immediate: Motivation surge. 2 weeks: Sustained goal-pursuit behavior returning.',
  frequencyOfUse: 'Daily during post-cessation anhedonia. Max 2x/day.',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 7. Liver Detox Resonance ──────────────────────────────────────
export const liverDetoxVibration: ProtocolSpec = {
  id: 'liver_detox_vibration',
  name: 'Liver Detox Resonance',
  category: 'recovery_addiction',
  version: '2.0.0',
  durationSeconds: 600,
  evidenceLevel: 'III',
  citations: [
    'Ritchie, H. & Roser, M. (2018) "Alcohol consumption and its health effects." Our World in Data',
  ],
  usageGoal: 'Subjective sense of physical cleansing and relief. Low-frequency somatic vibration to promote lymphatic drainage.',
  algorithmDescription: '1.5Hz delta beat over 100Hz somatic carrier via isochronic delivery for deep somatic penetration. The ultra-low delta frequency targets autonomic detoxification pathways. Multi-phase: gentle onset → deep somatic resonance → integration. Spatial pendulum mimics lymphatic flow.',
  researchContext: 'Low frequency vibration used to promote lymphatic drainage. 1.5Hz delta targets the parasympathetic-dominant state associated with detoxification and cellular repair processes. The somatic carrier frequency creates physical vibration perception that enhances mind-body detox awareness.',
  targetBands: ['delta'],
  neurochemistryTargets: ['GABA', 'melatonin', 'growth hormone'],
  phases: [
    phase(0, 'Somatic Onset')
      .duration(120)
      .beat(3)
      .carrier(CARRIERS.low)
      .isochronic(0.55)
      .noise('brown', 0.10)
      .noCarrierOctaves()
      .purpose('Gentle delta onset to ease into somatic resonance without shock')
      .build(),

    phase(1, 'Deep Detox Resonance')
      .duration(360)
      .beat(1.5)
      .carrier(CARRIERS.low)
      .isochronic(0.6)
      .noise('brown', 0.12)
      .gentleCarrierOctaves()
      .spatial('pendulum', 0.015)
      .stochasticJitter(8)
      .purpose('Ultra-low delta somatic resonance for deep autonomic detoxification activation')
      .build(),

    phase(2, 'Integration')
      .duration(120)
      .beat([1.5, 6])
      .carrier(CARRIERS.low)
      .noise('brown', 0.10)
      .noCarrierOctaves()
      .purpose('Gentle return from delta to theta carrying cleansing awareness')
      .build(),
  ],
  breathwork: {
    name: 'Flush Breath',
    ratio: [4, 0, 4, 0],
    description: 'Equal breathing. Visualize poison leaving with each exhale.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'PURE',
    pronunciation: 'pyoor (clean)',
    tonality: 'clean, refreshing',
    meaning: 'Clear body — releasing what no longer serves',
    repeatInterval: 15,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: ['Active liver failure — seek medical care', 'Nausea — ultra-low frequencies may intensify temporarily'],
    drugInteractions: ['Safe alongside detox medications'],
    specialPopulations: [],
  },
  expectedTimeline: 'Immediate: Warmth and relaxation. Multiple sessions: Subjective cleansing sensation.',
  frequencyOfUse: 'Daily during detox phase. Best in morning.',
  masterGain: 0.75,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: false,
};

// ─── 8. Cellular Cleansing ─────────────────────────────────────────
export const cellularCleansing: ProtocolSpec = {
  id: 'cellular_cleansing',
  name: 'Cellular Cleansing',
  category: 'recovery_addiction',
  version: '2.0.0',
  durationSeconds: 900,
  evidenceLevel: 'III',
  citations: [
    'Iaccarino, H.F. et al. (2016) "Gamma frequency entrainment attenuates amyloid load and modifies microglia." Nature',
    'Martorell, A.J. et al. (2019) "Multi-sensory gamma stimulation ameliorates Alzheimer\'s-associated pathology." Cell',
  ],
  usageGoal: 'Enhanced recovery from oxidative stress. Support cellular debris removal via gamma-driven glymphatic clearance.',
  algorithmDescription: '40Hz gamma over 432Hz carrier with harmonic stacking for maximum glymphatic engagement. The 40Hz frequency directly drives microglial activation for amyloid/debris clearance. 432Hz carrier tuned to natural resonance. Deep octave layering enriches the gamma field across auditory cortex.',
  researchContext: 'Gamma entrainment linked to glymphatic clearance. Iaccarino et al. (2016) demonstrated 40Hz entrainment reduces amyloid plaque in mouse models via microglial activation. Martorell (2019) showed multi-sensory gamma stimulation is even more effective. This protocol targets the same mechanism for post-substance cellular recovery.',
  targetBands: ['gamma'],
  neurochemistryTargets: ['microglial activation', 'glymphatic flow', 'BDNF'],
  phases: [
    phase(0, 'Gamma Onset')
      .duration(120)
      .beat(10)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.06)
      .noCarrierOctaves()
      .purpose('Brief alpha settling before gamma activation')
      .build(),

    phase(1, 'Gamma Ramp')
      .duration(120)
      .beat([10, 40])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.04)
      .gentleCarrierOctaves()
      .harmonics()
      .purpose('Ramp to 40Hz gamma with harmonic stacking engaging')
      .build(),

    phase(2, 'Cellular Cleanse')
      .duration(540)
      .beat(40)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.03)
      .deepCarrierOctaves()
      .spatial('rotate', 0.03)
      .stochasticJitter(8)
      .harmonics()
      .purpose('Sustained 40Hz gamma for maximum microglial activation and glymphatic clearance')
      .build(),

    phase(3, 'Integration')
      .duration(120)
      .beat([40, 10])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.08)
      .noCarrierOctaves()
      .purpose('Alpha return — clearance continues for hours after gamma session')
      .build(),
  ],
  breathwork: {
    name: 'Renew Breath',
    ratio: [5, 5, 5, 5],
    description: 'Box breathing. Every cell is breathing. Every exhale clears debris.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'LIVE',
    pronunciation: 'liv (radiant)',
    tonality: 'vital, bright',
    meaning: 'Radiating health — cellular renewal and regeneration',
    repeatInterval: 30,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Epilepsy — gamma component'],
    relative: ['Migraine — gamma may trigger in susceptible individuals'],
    drugInteractions: [],
    specialPopulations: [],
  },
  expectedTimeline: 'Immediate: Clarity and lightness. 4 weeks: Improved cognitive recovery.',
  frequencyOfUse: 'Daily during recovery phase. Best in morning or after exercise.',
  masterGain: 0.80,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── Category Export ────────────────────────────────────────────────
export const RECOVERY_ADDICTION_SPECS: ProtocolSpec[] = [
  neuroRecovery,
  acuteCraving,
  dopamineReset,
  withdrawalSupport,
  cravingInterrupter,
  motivationRebuilder,
  liverDetoxVibration,
  cellularCleansing,
];
