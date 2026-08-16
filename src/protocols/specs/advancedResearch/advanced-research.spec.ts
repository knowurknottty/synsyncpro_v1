/**
 * SynSync Pro — Advanced Research Protocol Specs
 * ================================================
 * Category: advanced_research
 * Experimental protocols for neuroscience research and advanced practitioners.
 * These require understanding of brainwave entrainment and careful self-monitoring.
 *
 * @version 2.0.0
 */

import type { ProtocolSpec } from '../../../audio/dsp/types';
import { phase } from '../../../audio/dsp/phase-builder';
import { CARRIERS, DSP_DEFAULTS, SOLFEGGIO, SCHUMANN } from '../../../audio/dsp/constants';

// ─── 1. Cross-Frequency Coupling Protocol ──────────────────────────
export const crossFrequencyCoupling: ProtocolSpec = {
  id: 'cross_frequency_coupling',
  name: 'Cross-Frequency Coupling',
  category: 'advanced_research',
  version: '2.0.0',
  durationSeconds: 2400,
  evidenceLevel: 'IV',
  citations: [
    'Canolty, R.T. & Knight, R.T. (2010) "The functional role of cross-frequency coupling." Trends in Cognitive Sciences',
    'Jensen, O. & Colgin, L.L. (2007) "Cross-frequency coupling between neuronal oscillations." Trends in Cognitive Sciences',
  ],
  usageGoal: 'Induce theta-gamma cross-frequency coupling — the neural signature of memory encoding and cognitive integration. For advanced practitioners and researchers.',
  algorithmDescription: 'Simultaneous theta (6Hz) carrier modulated with gamma (40Hz) overlay using hybrid AM-FM delivery. Stochastic jitter on gamma pulses mimics natural neural burst patterns. Deep octave layering on both carrier and overlay creates multi-frequency coupling across auditory cortex.',
  researchContext: 'Theta-gamma coupling is a fundamental mechanism of working memory and episodic memory encoding. Gamma oscillations are nested within theta cycles, creating phase-amplitude coupling. This protocol attempts to externally drive this coupling pattern for enhanced cognitive integration.',
  targetBands: ['theta', 'gamma'],
  neurochemistryTargets: ['acetylcholine', 'dopamine', 'glutamate'],
  phases: [
    phase(0, 'Theta Baseline')
      .duration(360)
      .beat(6)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.10)
      .gentleCarrierOctaves()
      .purpose('Establish theta baseline before introducing gamma coupling')
      .build(),

    phase(1, 'Coupling Onset')
      .duration(360)
      .beat(6)
      .carrier(CARRIERS.warm)
      .hybrid(0.4)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .overlays([40], 0.15)
      .gentleOverlayOctaves()
      .stochasticJitter(8)
      .purpose('Introduce gamma pulses nested within theta rhythm for initial coupling')
      .build(),

    phase(2, 'Full Coupling')
      .duration(900)
      .beat(6)
      .carrier(CARRIERS.warm)
      .hybrid(0.35)
      .noise('pink', 0.06)
      .deepCarrierOctaves()
      .overlays([40, 80], 0.18)
      .deepOverlayOctaves()
      .spatial('rotate', 0.02)
      .stochasticJitter(10)
      .harmonics()
      .purpose('Sustained theta-gamma cross-frequency coupling with harmonic enrichment')
      .build(),

    phase(3, 'Integration')
      .duration(420)
      .beat([6, 10])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .overlays([40], 0.08)
      .purpose('Reduce coupling intensity while maintaining theta-alpha transition')
      .build(),

    phase(4, 'Return')
      .duration(360)
      .beat(10)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.10)
      .noCarrierOctaves()
      .purpose('Return to alert alpha for grounded session completion')
      .build(),
  ],
  breathwork: {
    name: 'Theta Breath',
    ratio: [4, 2, 6, 2],
    description: 'Slow extended exhale to support theta dominance during coupling.',
    syncToBeat: true,
  },
  mantra: {
    phonetic: '',
    pronunciation: '',
    tonality: '',
    meaning: 'No mantra — pure observation of internal state',
    repeatInterval: 0,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Epilepsy or seizure disorders', 'Active psychosis'],
    relative: ['History of seizures — gamma component may trigger', 'First-time users — start with simpler protocols'],
    drugInteractions: ['Stimulants may amplify gamma response'],
    specialPopulations: ['Not recommended for children under 16'],
  },
  expectedTimeline: '1 session: Enhanced cognitive clarity. 4 weeks: Improved memory encoding.',
  frequencyOfUse: '2-3 times per week. Not daily — allow integration time.',
  optimalTiming: 'Morning or early afternoon for cognitive tasks.',
  masterGain: 0.78,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 2. Infraslow Oscillation Protocol ─────────────────────────────
export const infraslowOscillation: ProtocolSpec = {
  id: 'infraslow_oscillation_research',
  name: 'Infraslow Oscillation Training',
  category: 'advanced_research',
  version: '2.0.0',
  durationSeconds: 2400,
  evidenceLevel: 'IV',
  citations: [
    'Palva, J.M. & Palva, S. (2012) "Infra-slow fluctuations in electrophysiological recordings, blood-oxygenation-level-dependent signals, and psychophysical time series." NeuroImage',
    'Monto, S. et al. (2008) "Very slow EEG fluctuations predict the dynamics of stimulus detection and oscillation amplitudes in humans." J Neurosci',
  ],
  usageGoal: 'Research protocol exploring infraslow oscillation training for cortical excitability regulation. For neurofeedback researchers and advanced practitioners.',
  algorithmDescription: 'Ultra-slow modulation envelope (0.1Hz) applied to theta carrier (5Hz). The infraslow rhythm modulates attention and cortical excitability over 10-second cycles. Brown noise masking provides grounding substrate.',
  researchContext: 'Infraslow oscillations (0.01-0.1Hz) regulate cortical excitability and gate faster oscillations. They correlate with fMRI resting-state networks and predict perceptual performance. Training awareness of these ultra-slow rhythms may enhance self-regulation of cortical states.',
  targetBands: ['delta', 'theta'],
  neurochemistryTargets: ['GABA', 'serotonin'],
  phases: [
    phase(0, 'Settling')
      .duration(360)
      .beat(6)
      .carrier(CARRIERS.warm)
      .noise('brown', 0.15)
      .noCarrierOctaves()
      .purpose('Theta settling before infraslow modulation begins')
      .build(),

    phase(1, 'Infraslow Introduction')
      .duration(480)
      .beat(5)
      .carrier(CARRIERS.warm)
      .noise('brown', 0.18)
      .gentleCarrierOctaves()
      .spatial('pendulum', 0.05)
      .purpose('Introduce infraslow attention cycles via spatial pendulum modulation')
      .build(),

    phase(2, 'Deep Infraslow')
      .duration(900)
      .beat(4)
      .carrier(CARRIERS.warm)
      .noise('brown', 0.20)
      .gentleCarrierOctaves()
      .spatial('pendulum', 0.03)
      .stochasticJitter(15)
      .purpose('Sustained infraslow oscillation training at theta-delta border')
      .build(),

    phase(3, 'Return')
      .duration(660)
      .beat([4, 10])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.12)
      .noCarrierOctaves()
      .purpose('Gradual return to alert alpha. Monitor for disorientation.')
      .build(),
  ],
  breathwork: {
    name: 'Infraslow Breath',
    ratio: [10, 5, 10, 5],
    description: 'Ultra-slow breathing aligned with infraslow modulation. 2 breaths per minute.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: '',
    pronunciation: '',
    tonality: '',
    meaning: 'No mantra — attend to the slow rhythm of awareness itself',
    repeatInterval: 0,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Epilepsy', 'Narcolepsy'],
    relative: ['Dissociative tendencies — deep slow states may trigger', 'Sleep disorders — may induce unwanted drowsiness'],
    drugInteractions: ['Sedatives — additive effect'],
    specialPopulations: ['Not for children', 'Elderly — monitor for excessive sedation'],
  },
  expectedTimeline: '2-3 sessions: Improved awareness of cortical state shifts. 6 weeks: Enhanced self-regulation.',
  frequencyOfUse: '1-2 times per week. Allow 48 hours between sessions.',
  optimalTiming: 'Afternoon or evening. Not before driving or operating machinery.',
  masterGain: 0.72,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: false,
};

// ─── 3. Schumann Sync — Earth Resonance Grounding ──────────────────
export const schumannSync: ProtocolSpec = {
  id: 'schumann_sync',
  name: 'Schumann Sync',
  category: 'advanced_research',
  version: '2.0.0',
  durationSeconds: 900,
  evidenceLevel: 'III',
  citations: [
    'Cherry, N. (2002) "Schumann Resonances, a plausible biophysical mechanism for the human health effects of Solar/Geomagnetic Activity." Natural Hazards',
  ],
  usageGoal: 'Ground the brain to Earth\'s magnetic resonance frequency (7.83Hz). Counteract modern EMF exposure and restore bio-electromagnetic coherence.',
  algorithmDescription: 'Pure 7.83Hz Schumann entrainment over a 100Hz somatic carrier with harmonic stacking to engage Schumann harmonics (14.3, 20.8, 27.3Hz). Spatial rotation simulates the omnidirectional nature of Earth resonance. Deep octave layering creates rich harmonic field.',
  researchContext: 'The Schumann resonance at 7.83Hz coincides with the alpha-theta border — the same frequency range associated with meditation, creativity, and healing. Bio-electromagnetic grounding protocols aim to re-synchronize circadian and neural oscillations disrupted by artificial EMF environments.',
  targetBands: ['theta', 'alpha'],
  neurochemistryTargets: ['serotonin', 'melatonin'],
  phases: [
    phase(0, 'Alpha Settling')
      .duration(120)
      .beat(10)
      .carrier(CARRIERS.low)
      .noise('brown', 0.12)
      .noCarrierOctaves()
      .purpose('Brief alpha settling before Schumann entrainment begins')
      .build(),

    phase(1, 'Schumann Onset')
      .duration(180)
      .beat([10, SCHUMANN.fundamental])
      .carrier(CARRIERS.low)
      .noise('brown', 0.10)
      .gentleCarrierOctaves()
      .harmonics()
      .spatial('rotate', 0.02)
      .purpose('Ramp from alpha to Schumann resonance with harmonic stacking engaging')
      .build(),

    phase(2, 'Deep Schumann Resonance')
      .duration(420)
      .beat(SCHUMANN.fundamental)
      .carrier(CARRIERS.low)
      .noise('brown', 0.08)
      .deepCarrierOctaves()
      .overlays([SCHUMANN.harmonics[0], SCHUMANN.harmonics[1]], 0.10)
      .gentleOverlayOctaves()
      .spatial('rotate', 0.015)
      .stochasticJitter(8)
      .harmonics()
      .purpose('Sustained Schumann resonance with Earth harmonics for deep bio-electromagnetic grounding')
      .build(),

    phase(3, 'Grounding Integration')
      .duration(180)
      .beat([SCHUMANN.fundamental, 10])
      .carrier(CARRIERS.low)
      .noise('brown', 0.12)
      .gentleCarrierOctaves()
      .harmonics()
      .purpose('Gradual return to alpha carrying Schumann coherence into waking awareness')
      .build(),
  ],
  breathwork: {
    name: 'Earth Breath',
    ratio: [5, 5, 5, 5],
    description: 'Breathe with the planet. Equal 5-count box breathing for grounded coherence.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'LAM',
    pronunciation: 'lahm',
    tonality: 'deep, grounded',
    meaning: 'Root chakra seed syllable — grounding to Earth frequency',
    repeatInterval: 15,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: ['Pacemaker or implanted electrical devices — Schumann resonance protocols involve low-frequency electromagnetic concepts'],
    drugInteractions: [],
    specialPopulations: [],
  },
  expectedTimeline: 'Immediate: Calm grounded feeling. 2 weeks daily: Improved circadian rhythm.',
  frequencyOfUse: 'Daily. Ideal as morning grounding practice or EMF recovery.',
  masterGain: 0.80,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 4. Remote Viewing Activation ──────────────────────────────────
export const remoteViewing: ProtocolSpec = {
  id: 'remote_viewing',
  name: 'Remote Viewing Activation',
  category: 'advanced_research',
  version: '2.0.0',
  durationSeconds: 1800,
  evidenceLevel: 'IV',
  citations: [
    'Targ, R. & Puthoff, H. (1974) "Information transmission under conditions of sensory shielding." Nature',
    'May, E.C. et al. (1990) "Review of the psychoenergetic research conducted at SRI International." SRI International',
  ],
  usageGoal: 'Exploration of non-local sensing protocols. Induces the theta-gamma coupling state associated with anomalous cognition research.',
  algorithmDescription: '7Hz theta base coupled with 40Hz gamma and 100Hz hyper-gamma overlays for sensory gating bypass. Heavy stochastic jitter disrupts habitual perceptual patterns. Spatial rotation creates non-localized auditory field. Deep octave layering produces rich harmonic environment for internal signal amplification.',
  researchContext: 'Project Stargate base protocol for sensory gating and internal signal focus. Theta dominance suppresses analytical overlay while gamma bursts facilitate information integration. The 100Hz hyper-gamma overlay is experimental — targeting potential non-local information processing pathways.',
  targetBands: ['theta', 'gamma'],
  neurochemistryTargets: ['DMT', 'acetylcholine', 'serotonin'],
  phases: [
    phase(0, 'Cool Down Protocol')
      .duration(240)
      .beat(10)
      .carrier(CARRIERS.standard)
      .noise('pink', 0.12)
      .noCarrierOctaves()
      .purpose('Alpha settling to clear analytical mind before non-local sensing attempt')
      .build(),

    phase(1, 'Theta Descent')
      .duration(300)
      .beat([10, 7])
      .carrier(CARRIERS.standard)
      .noise('pink', 0.10)
      .gentleCarrierOctaves()
      .spatial('rotate', 0.03)
      .purpose('Descent from alpha to 7Hz theta for suppression of analytical overlay')
      .build(),

    phase(2, 'Sensory Gating')
      .duration(300)
      .beat(7)
      .carrier(CARRIERS.standard)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .overlays([40], 0.15)
      .gentleOverlayOctaves()
      .spatial('rotate', 0.04)
      .stochasticJitter(15)
      .purpose('Theta-gamma coupling onset with stochastic disruption of habitual perception')
      .build(),

    phase(3, 'Remote Viewing Window')
      .duration(660)
      .beat(7)
      .carrier(CARRIERS.standard)
      .noise('pink', 0.06)
      .deepCarrierOctaves()
      .overlays([40, 100], 0.30)
      .deepOverlayOctaves()
      .spatial('rotate', 0.05)
      .stochasticJitter(20)
      .harmonics()
      .purpose('Full theta + gamma + hyper-gamma stack for maximum internal signal focus and non-local access')
      .build(),

    phase(4, 'Signal Capture')
      .duration(180)
      .beat(7)
      .carrier(CARRIERS.standard)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .overlays([40], 0.12)
      .stochasticJitter(10)
      .purpose('Reduce intensity while maintaining theta for conscious capture of impressions')
      .build(),

    phase(5, 'Return')
      .duration(120)
      .beat([7, 10])
      .carrier(CARRIERS.standard)
      .noise('pink', 0.12)
      .noCarrierOctaves()
      .purpose('Alpha return for grounded session debrief and impression recording')
      .build(),
  ],
  breathwork: {
    name: 'Signal Breath',
    ratio: [4, 4, 4, 4],
    description: 'Box breathing to stabilize attention. Scan internal blackness on hold phases.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'HERE',
    pronunciation: 'heer (whispered internally)',
    tonality: 'neutral, observant',
    meaning: 'Non-local access — present awareness without spatial constraint',
    repeatInterval: 60,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Active psychosis', 'Severe dissociative identity disorder'],
    relative: ['Derealization/depersonalization — may intensify', 'Anxiety disorders — unusual states may trigger'],
    drugInteractions: ['Psychedelics — do not combine', 'Cannabis — unpredictable interaction'],
    specialPopulations: ['Not for minors'],
  },
  expectedTimeline: '1 session: Altered perceptual state. Multiple sessions: Improved internal signal clarity.',
  frequencyOfUse: '1-2 times per week. Allow integration days between sessions.',
  masterGain: 0.78,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 5. NeuroFocus 10 — Mind Awake / Body Asleep ───────────────────
export const neuroFocus10: ProtocolSpec = {
  id: 'neuro_focus_10',
  name: 'NeuroFocus 10',
  category: 'advanced_research',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'IV',
  citations: [
    'Monroe, R. (1971) "Journeys Out of the Body." Doubleday',
    'Mavromatis, A. (1987) "Hypnagogia: The Unique State of Consciousness Between Wakefulness and Sleep." Routledge',
  ],
  usageGoal: 'Induce the "mind awake / body asleep" state — subtle expanded awareness with total somatic suspension. Foundational state for consciousness exploration.',
  algorithmDescription: '10Hz alpha base with sensory-gating pink noise floor and harmonic stacking. Gentle spatial pendulum creates non-localized awareness. The alpha frequency maintains conscious awareness while noise masking and octave layering suppress body schema processing.',
  researchContext: 'Foundational Gateway state for bypassing physical sensory data. The 10Hz alpha frequency maintains cortical awareness while the body enters a sleep-like relaxation. This hypnagogic threshold state is the launchpad for deeper explorations in the NeuroFocus series.',
  targetBands: ['alpha'],
  neurochemistryTargets: ['serotonin', 'GABA', 'melatonin'],
  phases: [
    phase(0, 'Progressive Relaxation')
      .duration(180)
      .beat(10)
      .carrier(CARRIERS.standard)
      .noise('pink', 0.10)
      .noCarrierOctaves()
      .purpose('Body scan relaxation at alpha to begin somatic release')
      .build(),

    phase(1, 'Noise Floor Onset')
      .duration(180)
      .beat(10)
      .carrier(CARRIERS.standard)
      .noise('pink', 0.15)
      .gentleCarrierOctaves()
      .harmonics()
      .purpose('Increase pink noise masking to gate external sensory input')
      .build(),

    phase(2, 'Mind Awake / Body Asleep')
      .duration(540)
      .beat(10)
      .carrier(CARRIERS.standard)
      .noise('pink', 0.20)
      .deepCarrierOctaves()
      .spatial('pendulum', 0.02)
      .stochasticJitter(10)
      .harmonics()
      .purpose('Sustained alpha with full sensory gating — body suspended, mind alert')
      .build(),

    phase(3, 'Somatic Reintegration')
      .duration(300)
      .beat(10)
      .carrier(CARRIERS.standard)
      .noise('pink', 0.12)
      .gentleCarrierOctaves()
      .harmonics()
      .purpose('Reduce noise floor to gently reintegrate body awareness while maintaining alpha clarity')
      .build(),
  ],
  breathwork: {
    name: 'Suspend Breath',
    ratio: [4, 4, 8, 0],
    description: 'Extended exhale releases body weight. Hold phases suspend somatic awareness.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'BODY SLEEP',
    pronunciation: 'boh-dee sleep (whispered)',
    tonality: 'calm, detached',
    meaning: 'Somatic suspension — release identification with physical form',
    repeatInterval: 30,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Sleep paralysis history — may trigger episodes', 'Active psychosis'],
    relative: ['Anxiety disorders — somatic detachment may cause panic', 'First-time users — start with basic meditation'],
    drugInteractions: ['Sedatives — risk of unconsciousness rather than awareness'],
    specialPopulations: ['Not for children under 16'],
  },
  expectedTimeline: '1 session: Partial somatic suspension. 4 weeks: Reliable mind awake/body asleep state.',
  frequencyOfUse: '3-4 times per week. Best practiced before bed or in quiet environment.',
  masterGain: 0.80,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 6. NeuroFocus 12 — Spatial Awareness Expansion ────────────────
export const neuroFocus12: ProtocolSpec = {
  id: 'neuro_focus_12',
  name: 'NeuroFocus 12',
  category: 'advanced_research',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'IV',
  citations: [
    'Monroe, R. (1985) "Far Journeys." Doubleday',
    'Blanke, O. & Mohr, C. (2005) "Out-of-body experience, heautoscopy, and autoscopic hallucination." Brain Research Reviews',
  ],
  usageGoal: 'Expanded perception beyond the physical body shell. Requires mastery of NeuroFocus 10 as prerequisite.',
  algorithmDescription: '12Hz alpha baseline with 40Hz gamma spatial micro-bursts via rotating spatial field. The alpha-SMR border frequency enhances perceptual bandwidth while gamma bursts create "scanning" pulses across expanded spatial awareness. Stochastic jitter prevents spatial fixation.',
  researchContext: 'Project Gateway state for spatial non-locality training. The 12Hz frequency at the alpha-SMR border maximizes alert spatial awareness. Gamma overlay (40Hz) provides the binding frequency needed to integrate expanded perceptual information into coherent experience.',
  targetBands: ['alpha', 'smr', 'gamma'],
  neurochemistryTargets: ['acetylcholine', 'dopamine', 'norepinephrine'],
  phases: [
    phase(0, 'NeuroFocus 10 Recall')
      .duration(180)
      .beat(10)
      .carrier(CARRIERS.standard)
      .noise('pink', 0.15)
      .gentleCarrierOctaves()
      .harmonics()
      .purpose('Re-establish mind awake/body asleep state from NF10 as launch platform')
      .build(),

    phase(1, 'Alpha-SMR Bridge')
      .duration(180)
      .beat([10, 12])
      .carrier(CARRIERS.standard)
      .noise('pink', 0.12)
      .gentleCarrierOctaves()
      .spatial('rotate', 0.04)
      .harmonics()
      .purpose('Ramp to 12Hz alpha-SMR border to expand perceptual bandwidth')
      .build(),

    phase(2, 'Spatial Expansion')
      .duration(540)
      .beat(12)
      .carrier(CARRIERS.standard)
      .noise('pink', 0.10)
      .deepCarrierOctaves()
      .overlays([40], 0.25)
      .gentleOverlayOctaves()
      .spatial('rotate', 0.06)
      .stochasticJitter(12)
      .harmonics()
      .purpose('Sustained 12Hz with gamma scanning pulses and spatial rotation for expanded awareness')
      .build(),

    phase(3, 'Integration')
      .duration(300)
      .beat([12, 10])
      .carrier(CARRIERS.standard)
      .noise('pink', 0.12)
      .gentleCarrierOctaves()
      .overlays([40], 0.10)
      .spatial('rotate', 0.02)
      .purpose('Gentle return to alpha carrying expanded spatial awareness into grounded state')
      .build(),
  ],
  breathwork: {
    name: 'Expand Breath',
    ratio: [4, 0, 4, 0],
    description: 'Simple equal breathing. On each exhale, feel the room expand around you.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'WIDE',
    pronunciation: 'wyyd (expansive)',
    tonality: 'open, expansive',
    meaning: 'Expanded shell — perception beyond the physical body boundary',
    repeatInterval: 20,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Active psychosis', 'Severe depersonalization disorder'],
    relative: ['Anxiety — spatial expansion may trigger panic', 'Requires NF10 mastery first'],
    drugInteractions: ['Psychedelics — unpredictable amplification', 'Stimulants — may prevent relaxation'],
    specialPopulations: ['Not for children'],
  },
  expectedTimeline: '1 session: Subtle spatial expansion. 6 weeks: Reliable expanded awareness.',
  frequencyOfUse: '2-3 times per week after NF10 mastery.',
  masterGain: 0.78,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 7. NeuroFocus 15 — State of No-Time ───────────────────────────
export const neuroFocus15: ProtocolSpec = {
  id: 'neuro_focus_15',
  name: 'NeuroFocus 15',
  category: 'advanced_research',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'IV',
  citations: [
    'Monroe, R. (1994) "Ultimate Journey." Doubleday',
    'Wittmann, M. (2011) "Moments in time." Frontiers in Integrative Neuroscience',
  ],
  usageGoal: 'Subjective degradation of linear time perception. The most advanced NeuroFocus state — requires mastery of NF10 and NF12.',
  algorithmDescription: '15Hz beta base over a sub-bass 100Hz carrier creates a paradoxical alert-yet-suspended state. An infraslow 0.5Hz overlay modulates temporal processing rhythms. Heavy stochastic jitter disrupts the brain\'s internal clock mechanism. Deep octave layering across both carrier and overlay creates frequency-rich field.',
  researchContext: 'Theoretical threshold where linear temporal processing becomes asynchronous. The 15Hz beta frequency maintains cognitive presence while sub-bass carrier and infraslow overlay disrupt the temporal binding mechanisms that create subjective "flow of time." This is the most experimental protocol in the NeuroFocus series.',
  targetBands: ['smr', 'beta'],
  neurochemistryTargets: ['dopamine', 'glutamate', 'anandamide'],
  phases: [
    phase(0, 'NF10/12 Recall')
      .duration(180)
      .beat(10)
      .carrier(CARRIERS.low)
      .noise('pink', 0.15)
      .gentleCarrierOctaves()
      .harmonics()
      .purpose('Re-establish mind awake/body asleep baseline from NF10/12 training')
      .build(),

    phase(1, 'Beta Ramp')
      .duration(180)
      .beat([10, 15])
      .carrier(CARRIERS.low)
      .noise('pink', 0.12)
      .gentleCarrierOctaves()
      .stochasticJitter(10)
      .purpose('Ramp from alpha to 15Hz beta over sub-bass carrier for alert suspension')
      .build(),

    phase(2, 'Temporal Disruption')
      .duration(540)
      .beat(15)
      .carrier(CARRIERS.low)
      .noise('brown', 0.10)
      .deepCarrierOctaves()
      .overlays([0.5], 0.20)
      .deepOverlayOctaves()
      .spatial('rotate', 0.03)
      .stochasticJitter(20)
      .harmonics()
      .purpose('Full no-time state — 15Hz beta + infraslow overlay + stochastic clock disruption')
      .build(),

    phase(3, 'Temporal Reintegration')
      .duration(300)
      .beat([15, 10])
      .carrier(CARRIERS.low)
      .noise('pink', 0.12)
      .gentleCarrierOctaves()
      .purpose('Gradual return to linear time perception via alpha descent')
      .build(),
  ],
  breathwork: {
    name: 'Infinite Breath',
    ratio: [8, 0, 16, 0],
    description: 'Long exhales to dissolve temporal anchoring. Let breath become timeless.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'NONE',
    pronunciation: '(silence)',
    tonality: 'absent',
    meaning: 'No time — release the construct of sequential experience',
    repeatInterval: 60,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Active psychosis', 'Severe dissociative disorders', 'Temporal lobe epilepsy'],
    relative: ['Requires NF10 + NF12 mastery', 'Derealization history — temporal disruption may trigger', 'Not for beginners'],
    drugInteractions: ['Psychedelics — extreme amplification risk', 'Dissociatives — dangerous synergy'],
    specialPopulations: ['Advanced practitioners only', 'Not for minors'],
  },
  expectedTimeline: '1 session: Subtle time distortion. 8+ weeks: Reliable no-time access.',
  frequencyOfUse: 'Once per week maximum. Requires integration time.',
  masterGain: 0.75,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 8. Interbrain Synchronization ─────────────────────────────────
export const interbrainSync: ProtocolSpec = {
  id: 'interbrain_sync',
  name: 'Interbrain Synchronization',
  category: 'advanced_research',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'II',
  citations: [
    'Dumas, G. et al. (2010) "Inter-brain synchronization during social interaction." PLoS ONE',
    'Hasson, U. et al. (2012) "Brain-to-brain coupling: a mechanism for creating and sharing a social world." Trends in Cognitive Sciences',
  ],
  usageGoal: 'Couples and teams show increased neural coherence and rapport. Play simultaneously for two or more people to synchronize brainwave patterns.',
  algorithmDescription: '40Hz gamma primary beat with 7Hz theta overlay creates the phase-synchrony signature observed in interacting individuals. Harmonic stacking enriches the coupling field. Spatial rotation creates shared immersive auditory space. Stochastic jitter prevents lock-step rigidity, allowing natural dynamic coupling.',
  researchContext: 'Targets the phase-synchrony between interacting individuals. Dual-EEG studies show that gamma and theta coherence between brains increases during cooperative tasks, empathic connection, and shared attention. This protocol provides an external scaffolding for interpersonal neural coupling.',
  targetBands: ['gamma', 'theta'],
  neurochemistryTargets: ['oxytocin', 'dopamine', 'endorphins'],
  phases: [
    phase(0, 'Individual Settling')
      .duration(180)
      .beat(10)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.10)
      .noCarrierOctaves()
      .purpose('Individual alpha settling — both participants find their baseline')
      .build(),

    phase(1, 'Theta Foundation')
      .duration(180)
      .beat([10, 7])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .overlays([7], 0.15)
      .purpose('Descend to theta while introducing 7Hz overlay for shared emotional resonance')
      .build(),

    phase(2, 'Gamma Coupling Onset')
      .duration(180)
      .beat(40)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.06)
      .gentleCarrierOctaves()
      .overlays([7], 0.35)
      .gentleOverlayOctaves()
      .harmonics()
      .spatial('rotate', 0.03)
      .purpose('Switch to 40Hz gamma primary with theta overlay — interpersonal coupling onset')
      .build(),

    phase(3, 'Full Interbrain Sync')
      .duration(420)
      .beat(40)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.04)
      .deepCarrierOctaves()
      .overlays([7], 0.35)
      .deepOverlayOctaves()
      .spatial('rotate', 0.04)
      .stochasticJitter(12)
      .harmonics()
      .purpose('Sustained gamma-theta coupling for maximum interbrain phase-synchrony')
      .build(),

    phase(4, 'Shared Integration')
      .duration(240)
      .beat([40, 10])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .overlays([7], 0.15)
      .purpose('Gradual return to alpha carrying shared coherence into conscious interaction')
      .build(),
  ],
  breathwork: {
    name: 'Coupled Breath',
    ratio: [5, 5, 5, 5],
    description: 'Box breathing synchronized between participants. Match breath with your partner.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'WE',
    pronunciation: 'wee (shared intention)',
    tonality: 'warm, unified',
    meaning: 'Single mind — two brains resonating as one coherent system',
    repeatInterval: 30,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: ['Codependency patterns — monitor boundary dissolution', 'Social anxiety — gradual exposure recommended'],
    drugInteractions: [],
    specialPopulations: ['Both participants should be consenting adults'],
  },
  expectedTimeline: 'Immediate: Enhanced rapport and empathy. 4 weeks: Measurable EEG coherence improvement.',
  frequencyOfUse: '2-3 times per week with the same partner. Best before collaborative work.',
  masterGain: 0.80,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── Category Export ────────────────────────────────────────────────
export const ADVANCED_RESEARCH_SPECS: ProtocolSpec[] = [
  crossFrequencyCoupling,
  infraslowOscillation,
  schumannSync,
  remoteViewing,
  neuroFocus10,
  neuroFocus12,
  neuroFocus15,
  interbrainSync,
];
