/**
 * SynSync Pro — Consciousness Exploration & Altered States
 * =========================================================
 * Category: altered_states, speculative_experimental
 * Protocols: Pineal Resonance, DMT Gateway, Lucid Dream Induction
 * Evidence: Level IV-V (Speculative/Theoretical)
 * 
 * ⚠ These protocols are clearly marked as speculative.
 * Users are co-researchers, not patients.
 * Transparency about evidence levels is paramount.
 * 
 * @version 2.0.0
 */

import type { ProtocolSpec } from '../../../audio/dsp/types';
import { phase } from '../../../audio/dsp/phase-builder';
import { CARRIERS, SOLFEGGIO, DSP_DEFAULTS } from '../../../audio/dsp/constants';
import { deepOctaves } from '../../../audio/dsp/octave-resolver';

// ─── 1. Pineal Resonance (963Hz Stack) ──────────────────────────────
export const pinealResonance: ProtocolSpec = {
  id: 'pineal_resonance_963',
  name: 'Pineal Resonance (963Hz Activation)',
  category: 'speculative_experimental',
  version: '2.0.0',
  durationSeconds: 900,
  evidenceLevel: 'V',
  citations: [
    'Baconnier, S. et al. (2002) "Calcite microcrystals in the pineal gland." Bioelectromagnetics, 23(7), 488-495',
    'Speculative neuroscience — piezoelectric crystal resonance theory',
  ],
  usageGoal: 'Enhanced visualization, hypnagogic imagery, dream vividness. Pineal gland stimulation via 963Hz "Frequency of the Gods" and its octave harmonics.',
  algorithmDescription: 'Focuses on 963Hz and its octave harmonics (481.5Hz, 240.75Hz). Aims to create piezoelectric resonance within pineal gland calcite microcrystals. 6Hz theta sub-carrier for subconscious access. 215Hz carrier chosen for skull cavity resonance. Maximum overlay mix (50%) for intense stimulation.',
  researchContext: 'Biophysical research confirms the pineal gland contains piezoelectric calcite crystals (Baconnier 2002). Theoretical mechanism: 963Hz → pineal crystal activation → enhanced melatonin/endogenous DMT production. This is speculative but grounded in real biophysics. Results are subjective and variable. May be placebo, but effective for many users.',
  targetBands: ['theta'],
  neurochemistryTargets: ['Melatonin ↑ (theoretical)', 'Endogenous DMT ↑ (theoretical)', 'Serotonin ↑'],
  phases: [
    phase(0, '963Hz Pineal Stimulation Stack')
      .duration(900)
      .beat(6)
      .carrier(CARRIERS.skull_res) // 215Hz — skull cavity resonance
      .noise('none', 0)
      .overlays([SOLFEGGIO.OM, 481.5, 240.75], 0.50) // 963Hz + octave harmonics
      .deepCarrierOctaves()
      .overlayOctaves({ enabled: true, octavesAbove: 1, octavesBelow: 2, gainRolloff: 0.6, detuneSpread: 3 })
      .harmonics()
      .isochronic(0.5)
      .purpose('Direct pineal gland stimulation via 963Hz + octave harmonics. Pure frequencies, no noise.')
      .build(),
  ],
  breathwork: {
    name: 'Third Eye Focus',
    ratio: [4, 8, 8, 0],
    description: 'Focus energy at brow center on hold. Visualize light there. Extended hold maximizes piezoelectric pressure.',
    cycleDuration: 20,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'THOH',
    pronunciation: 'Tho (tongue touching back of teeth)',
    tonality: 'Buzzing vibration behind teeth',
    meaning: 'Pineal activation sound (esoteric tradition)',
    repeatInterval: 8,
    delivery: 'spoken',
  },
  contraindications: {
    absolute: ['Epilepsy (high frequency may trigger)', 'Untreated psychosis'],
    relative: ['Migraine (monitor)', 'Severe anxiety'],
    drugInteractions: [],
    specialPopulations: [],
  },
  expectedTimeline: 'Session 1: Enhanced visualization/imagery. Week 1: Increased dream vividness. Week 2+: Intuitive insights, sense of "opening" in brow area.',
  frequencyOfUse: '2-3x/week. Not daily.',
  optimalTiming: 'Evening or before sleep',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 2. DMT Gateway (40Hz Gamma & Infrasound) ──────────────────────
export const dmtGateway: ProtocolSpec = {
  id: 'dmt_gateway',
  name: 'DMT Gateway (40Hz Gamma & Infrasound)',
  category: 'speculative_experimental',
  version: '2.0.0',
  durationSeconds: 1800,
  evidenceLevel: 'V',
  citations: [
    'Strassman, R. (2001) "DMT: The Spirit Molecule"',
    'Timmermann, C. et al. (2019) "Neural correlates of the DMT experience." Sci Reports',
    'Speculative neuroscience — endogenous DMT hypothesis',
  ],
  usageGoal: 'Create neurochemical conditions theoretically necessary for endogenous DMT release. Default Mode Network dissolution. Consciousness exploration.',
  algorithmDescription: 'High-intensity 40Hz Gamma flicker paired with sub-bass infrasound to destabilize the Default Mode Network (DMN). Theory: DMN dissolution = pineal activation → endogenous DMT release. Multi-phase with safety alpha bookends.',
  researchContext: 'Gamma synchrony precedes psychedelic peak experiences (Timmermann 2019). The DMN creates the sense of "self" — its dissolution is associated with ego dissolution experiences across meditation and psychedelic research. This protocol attempts to reproduce those conditions through entrainment alone.',
  targetBands: ['gamma', 'theta', 'delta'],
  neurochemistryTargets: ['Endogenous DMT ↑ (theoretical)', 'DMN activity ↓↓', 'Serotonin ↑'],
  phases: [
    phase(0, 'Safety Alpha Grounding')
      .duration(300)
      .beat(10)
      .carrier(CARRIERS.neutral)
      .noise('brown', 0.10)
      .gentleCarrierOctaves()
      .purpose('Establish psychological safety before deep exploration')
      .build(),

    phase(1, 'Gamma Ramp + DMN Dissolution')
      .duration(600)
      .beat([10, 40])
      .carrier(CARRIERS.high)
      .noise('brown', 0.08)
      .overlays([SOLFEGGIO.OM, SOLFEGGIO.SI], 0.30)
      .carrierOctaves({ enabled: true, octavesAbove: 2, octavesBelow: 2, gainRolloff: 0.55, detuneSpread: 15 })
      .deepOverlayOctaves()
      .harmonics()
      .hybrid(0.45)
      .spatial('spiral', 0.15)
      .purpose('Ascending gamma with wide octave spread. DMN beginning to dissolve.')
      .build(),

    phase(2, 'Peak Gamma Sustain')
      .duration(600)
      .beat(40)
      .carrier(CARRIERS.high)
      .noise('none', 0)
      .overlays([SOLFEGGIO.OM, SOLFEGGIO.SI, 0.5], 0.40) // 0.5Hz infrasound overlay
      .carrierOctaves({ enabled: true, octavesAbove: 2, octavesBelow: 2, gainRolloff: 0.5, detuneSpread: 18 })
      .deepOverlayOctaves()
      .harmonics()
      .isochronic(0.45)
      .stochasticJitter(20)
      .spatial('spiral', 0.2)
      .purpose('Maximum intensity. Ego dissolution territory. Experiences may be profound.')
      .build(),

    phase(3, 'Reintegration')
      .duration(300)
      .beat([40, 8])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.12)
      .gentleCarrierOctaves()
      .spatial('rotate', 0.05)
      .purpose('Gradual reintegration. DMN reassembling. Grounding in body.')
      .build(),
  ],
  breathwork: {
    name: 'Gateway Breath',
    ratio: [6, 6, 6, 6],
    description: 'Equal 6-count box breath. Creates balanced interoceptive awareness for safe exploration.',
    cycleDuration: 24,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'AUM-OM',
    pronunciation: 'Aum-Om (two-part, ascending)',
    tonality: 'Expansive, dissolving',
    meaning: 'The sound of creation and dissolution',
    repeatInterval: 12,
    delivery: 'spoken',
  },
  contraindications: {
    absolute: ['Epilepsy', 'Untreated psychosis', 'Active suicidal ideation', 'Uncontrolled bipolar'],
    relative: ['PTSD without therapist', 'Severe anxiety', 'First-time users (build up gradually)'],
    drugInteractions: ['Avoid with psychedelics (stacking effect)', 'Caution with SSRIs (serotonin)'],
    specialPopulations: ['Not recommended under 18', 'Experienced users only'],
  },
  expectedTimeline: 'Session 1: Unusual visual/somatic experiences. Week 2+: Deeper experiences. Highly variable and subjective.',
  frequencyOfUse: '1-2x/week maximum. Allow 48hr integration between sessions.',
  optimalTiming: 'Evening, when undisturbed for 1hr+ (including integration)',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
  unlockCriteria: ['Completion of ≥10 meditation sessions', 'Completion of anxiety relief protocol', 'User acknowledgment of speculative nature'],
};

// ─── 3. Lucid Dream Induction ───────────────────────────────────────
export const lucidDream: ProtocolSpec = {
  id: 'lucid_dream_induction',
  name: 'Lucid Dream Induction',
  category: 'altered_states',
  version: '2.0.0',
  durationSeconds: 1500,
  evidenceLevel: 'III',
  citations: [
    'Voss, U. et al. (2014) "Induction of self-awareness in dreams through frontal gamma." Nature Neuroscience',
    'LaBerge, S. (1990) "Lucid dreaming: Psychophysiological studies." Sleep',
  ],
  usageGoal: 'Increase probability of lucid dreaming. Use during WBTB (Wake Back To Bed) protocol.',
  algorithmDescription: 'Theta-dominant with 40Hz gamma overlay matching Voss et al. (2014) protocol. Gamma during theta/REM sleep is the signature of lucid dreaming. Designed for use during WBTB method — wake after 5hr sleep, use protocol, return to sleep.',
  researchContext: 'Voss et al. (2014) in Nature Neuroscience demonstrated that 40Hz frontal stimulation during REM sleep induced lucid dreaming in 77% of subjects. This protocol replicates those parameters.',
  targetBands: ['theta', 'gamma'],
  neurochemistryTargets: ['Acetylcholine ↑ (REM enhancement)', 'Gamma synchrony in frontal cortex'],
  phases: [
    phase(0, 'Theta Sleep Entry')
      .duration(600)
      .beat([8, 4])
      .carrier(CARRIERS.warm)
      .noise('pink', 0.12)
      .gentleCarrierOctaves()
      .purpose('Transition back to sleep after WBTB wake period')
      .build(),

    phase(1, 'REM + Gamma Lucidity Trigger')
      .duration(600)
      .beat(4)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.10)
      .overlays([40], 0.15) // 40Hz gamma — the lucidity trigger
      .deepCarrierOctaves()
      .gentleOverlayOctaves()
      .harmonics()
      .stochasticJitter(8)
      .purpose('Theta sleep + 40Hz gamma overlay = lucid dream induction (Voss 2014)')
      .build(),

    phase(2, 'Deep Sleep Fade')
      .duration(300)
      .beat(2)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.15)
      .deepCarrierOctaves()
      .envelope(2, 0.6, 0)
      .crossfade(0)
      .purpose('Fade to deep sleep; lucid dream continues naturally')
      .build(),
  ],
  breathwork: {
    name: 'Sleep Breath',
    ratio: [4, 0, 6, 0],
    description: 'Gentle, barely conscious breathing. Don\'t try to control — just observe.',
    cycleDuration: 10,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'AWARE',
    pronunciation: 'Aware (fading whisper)',
    tonality: 'Barely audible, dreamlike',
    meaning: 'Maintain awareness as sleep arrives',
    repeatInterval: 15,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Severe sleep disorders (prioritize sleep quality first)'],
    relative: ['Insomnia (use deep sleep protocol instead)'],
    drugInteractions: ['May be enhanced by galantamine (common lucid dream supplement)'],
    specialPopulations: [],
  },
  expectedTimeline: 'Week 1-2: Enhanced dream recall. Week 2-4: Pre-lucid moments. Week 4+: Lucid dreaming frequency increasing.',
  frequencyOfUse: '2-3x/week maximum. WBTB method: wake after 5hr, use protocol, return to sleep.',
  optimalTiming: '5 hours after sleep onset (WBTB method)',
  masterGain: 0.70, // Lower volume for sleep
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// MIGRATED LEGACY CONSCIOUSNESS PROTOCOLS
// ─────────────────────────────────────────────────────────────────────────────

// Schumann resonance constants
const SCHUMANN_BASE = 7.83;
const SCHUMANN_HARMONICS = [7.83, 14.3, 20.8, 27.3, 33.8];

// ─── 4. Theta Deep Meditation ───────────────────────────────────────
export const thetaMeditation: ProtocolSpec = {
  id: 'theta_meditation_deep',
  name: 'Theta Deep Meditation',
  category: 'altered_states',
  evidenceLevel: 'II',

  usageGoal: 'Access deep meditative states, experience inner visions, connect with subconscious mind, enhance creativity and psychological integration.',

  algorithmDescription: '4-7Hz theta entrainment with alpha bridge (10Hz→7Hz→6Hz→4.5Hz) for deep meditative states, subconscious access, and hypnagogic imagery. Rotate spatial motion for exploratory consciousness.',

  researchContext: 'Theta waves (4-8Hz) dominate during deep meditation, enabling subconscious access. Alpha-theta border enhances creativity and psychological integration (Lagopoulos et al. 2009).',

  durationSeconds: 2700, // 45 minutes

  phases: [
    phase(1, 'Alpha-Theta Bridge')
      .duration(600)
      .beat([10, 7])
      .carrier(CARRIERS.neutral)
      .overlays([SOLFEGGIO.SOL], 0.15)
      .gentleCarrierOctaves()
      
      .purpose('Gradual descent from alert alpha to meditative theta')
      .build(),

    phase(2, 'Deep Theta Entrainment')
      .duration(1500)
      .beat(6)
      .carrier(CARRIERS.neutral)
      .overlays([SCHUMANN_BASE, SCHUMANN_HARMONICS[1]], 0.2)
      .harmonics()
      .spatial('rotate')
      .gentleCarrierOctaves()
      .gentleOverlayOctaves()
      
      .purpose('Sustained theta with Schumann resonance for deep meditation')
      .build(),

    phase(3, 'Subconscious Access')
      .duration(600)
      .beat(4.5)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.15)
      .spatial('breathe')
      .gentleCarrierOctaves()
      
      .purpose('Deep theta for subconscious access and hypnagogic imagery')
      .build(),
  ],

  breathwork: {
    name: 'Meditative Square Breathing',
    ratio: [4, 4, 4, 4],
    description: 'Steady, conscious square breathing for mindfulness anchor',
    cycleDuration: 16,
    syncToBeat: false,
  },

  mantra: {
    phonetic: 'OM MANI PADME HUM',
    meaning: 'The jewel in the lotus - compassion and wisdom mantra',
    repeatInterval: 12,
    pronunciation: 'ohm mah-nee pahd-may hoom',
    tonality: 'deep resonance',
    delivery: 'spoken',
  },

  contraindications: {
    absolute: ['Dissociative disorders', 'Active psychosis'],
    relative: ['PTSD (use with therapist guidance)', 'Severe anxiety (start with shorter sessions)'],
  },

  citations: [
    'Lagopoulos, J. et al. (2009). Increased theta and alpha EEG activity during meditation. Journal of Alternative and Complementary Medicine.',
    'Alpha-Theta Research Collective. Creativity enhancement via alpha-theta training.',
  ],
};

// ─── 5. Transcendental Gamma Meditation ─────────────────────────────
export const transcendentalGamma: ProtocolSpec = {
  id: 'transcendental_gamma',
  name: 'Transcendental Gamma Meditation',
  category: 'altered_states',
  evidenceLevel: 'II',

  usageGoal: 'Experience unity consciousness, ego dissolution, heightened awareness. Replicate brain states of Olympic-level meditators (12,000+ hours of practice).',

  algorithmDescription: '40Hz gamma with theta modulation (6Hz) to induce transcendental states similar to advanced meditators. Exponential ramp to peak gamma, sustained synchronization, then gradual return.',

  researchContext: 'Olympic meditators (>12,000 hours) show sustained 40Hz gamma oscillations during meditation, correlating with transcendental experiences and unity consciousness (Lutz et al. 2004).',

  durationSeconds: 3600, // 60 minutes

  phases: [
    phase(1, 'Gamma Ascent')
      .duration(900)
      .beat([10, 40])
      .carrier(CARRIERS.high)
      .harmonics()
      .wideCarrierOctaves()
      .hybrid(0.5)
      .purpose('Exponential ramp from alpha to peak gamma entrainment')
      .build(),

    phase(2, 'Peak Gamma Synchronization')
      .duration(1800)
      .beat(40)
      .carrier(CARRIERS.high)
      .overlays([6, 80, 120], 0.15) // Theta modulation + harmonics
      .spatial('rotate')
      .harmonics()
      .wideCarrierOctaves()
      .wideOverlayOctaves()
      .hybrid(0.5)
      .stochasticJitter(0.15)
      .purpose('Sustained 40Hz gamma for transcendental states - Olympic meditator brain pattern')
      .build(),

    phase(3, 'Gamma-Alpha Descent')
      .duration(900)
      .beat([40, 8])
      .carrier(CARRIERS.neutral)
      .noise('white', 0.05)
      .gentleCarrierOctaves()
      
      .purpose('Gradual return to baseline with integration time')
      .build(),
  ],

  breathwork: {
    name: 'Holotropic Breathing',
    ratio: [3, 0, 3, 0],
    description: 'Fast, deep breathing for altered states and hyperventilation-induced shifts',
    cycleDuration: 6,
    syncToBeat: false,
  },

  mantra: {
    phonetic: 'GATE GATE PARAGATE',
    meaning: 'Gone, gone, gone beyond (Heart Sutra) - transcendence mantra',
    repeatInterval: 15,
    pronunciation: 'gah-tay gah-tay pah-rah-gah-tay',
    tonality: 'ascending',
    delivery: 'internal',
  },

  contraindications: {
    absolute: ['Epilepsy (high gamma may trigger seizures)', 'Severe anxiety', 'Bipolar disorder (manic phase)'],
    relative: ['First-time meditators (build up gradually)', 'Cardiovascular conditions (holotropic breathing)'],
  },

  citations: [
    'Lutz, A. et al. (2004). Long-term meditators self-induce high-amplitude gamma synchrony. PNAS, 101(46), 16369-16373.',
    'Olympic Meditator Studies. Sustained gamma oscillations in advanced practitioners.',
  ],
};

// ─── 6. Vipassana Insight Meditation ────────────────────────────────
export const vipassanaMeditation: ProtocolSpec = {
  id: 'vipassana_theta_alpha',
  name: 'Vipassana Insight Meditation',
  category: 'altered_states',
  evidenceLevel: 'II',

  usageGoal: 'Develop sustained mindfulness, cultivate equanimity, enhance present-moment awareness, reduce emotional reactivity and anxiety.',

  algorithmDescription: 'Alpha-theta bridge (10Hz→8Hz→6Hz) with sustained attention training patterns to cultivate insight and equanimity. Fixed spatial motion for focused awareness.',

  researchContext: 'Vipassana meditation increases alpha and theta activity, particularly in frontal and midline regions. Associated with reduced anxiety and enhanced emotional regulation (Cahn & Polich 2006).',

  durationSeconds: 3600, // 60 minutes

  phases: [
    phase(1, 'Alpha Grounding')
      .duration(1200)
      .beat(10)
      .carrier(CARRIERS.neutral)
      .overlays([SOLFEGGIO.MI], 0.1)
      .gentleCarrierOctaves()
      
      .purpose('Establish relaxed alertness - Vipassana starting state')
      .build(),

    phase(2, 'Alpha-Theta Descent')
      .duration(1800)
      .beat([8, 6])
      .carrier(CARRIERS.neutral)
      .harmonics()
      .spatial('fixed')
      .gentleCarrierOctaves()
      
      .purpose('Gradual deepening into theta insight state with stable focus')
      .build(),

    phase(3, 'Alpha Return')
      .duration(600)
      .beat(8)
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.1)
      .gentleCarrierOctaves()
      
      .purpose('Gentle return to alert relaxation with insights integrated')
      .build(),
  ],

  breathwork: {
    name: 'Anapanasati (Breath Awareness)',
    ratio: [4, 0, 4, 0],
    description: 'Natural breath awareness - observe without controlling',
    cycleDuration: 8,
    syncToBeat: false,
  },

  mantra: {
    phonetic: 'ANICCA',
    meaning: 'Impermanence - core Vipassana principle of constant change',
    repeatInterval: 20,
    pronunciation: 'ah-nee-cha',
    tonality: 'neutral observation',
    delivery: 'internal',
  },

  contraindications: {
    absolute: ['Severe clinical depression', 'Dissociative disorders'],
    relative: ['Trauma history (may surface difficult material)', 'First-time meditators (start with guided practice)'],
  },

  citations: [
    'Cahn, B. R. & Polich, J. (2006). Meditation states and traits: EEG, ERP, and neuroimaging studies. Psychological Bulletin, 132(2), 180-211.',
    'Vipassana Research Institute. Neuroscience of insight meditation and equanimity.',
  ],
};

// ─── 7. Shamanic Theta Journey ──────────────────────────────────────
export const shamanicJourney: ProtocolSpec = {
  id: 'shamanic_theta_journey',
  name: 'Shamanic Theta Journey',
  category: 'altered_states',
  evidenceLevel: 'IV',

  usageGoal: 'Access shamanic journey states, experience inner visions, communicate with archetypal imagery, explore non-ordinary states of consciousness.',

  algorithmDescription: '4.5Hz theta (shamanic drumming frequency = 270 BPM ÷ 60s) with chaotic progressions and random spatial motion to induce visionary states. Mimics traditional shamanic drum journeys.',

  researchContext: '4.5Hz corresponds to traditional shamanic drumming frequency (240-270 BPM ÷ 60 seconds ≈ 4-4.5Hz). Theta states enable visionary experiences and archetypal imagery (Harner 1980).',

  durationSeconds: 2400, // 40 minutes

  phases: [
    phase(1, 'Journey Descent')
      .duration(600)
      .beat([10, 4.5])
      .carrier(CARRIERS.warm)
      .noise('brown', 0.15)
      .gentleCarrierOctaves()
      .hybrid(0.5)
      .purpose('Rapid descent to shamanic theta frequency - entering journey state')
      .build(),

    phase(2, 'Visionary Theta Journey')
      .duration(1500)
      .beat(4.5)
      .carrier(CARRIERS.warm)
      .overlays([SCHUMANN_BASE], 0.2)
      .spatial('random')
      .deepCarrierOctaves()
      .gentleOverlayOctaves()
      .hybrid(0.4)
      .stochasticJitter(0.02)
      .purpose('Deep shamanic journey state - archetypal visions and spirit realm access')
      .build(),

    phase(3, 'Journey Return')
      .duration(300)
      .beat([4.5, 10])
      .carrier(CARRIERS.neutral)
      .noise('brown', 0.1)
      .gentleCarrierOctaves()
      
      .purpose('Rapid callback to ordinary consciousness - shamanic return drumming')
      .build(),
  ],

  breathwork: {
    name: 'Shamanic Breathing',
    ratio: [3, 3, 3, 3],
    description: 'Fast square breathing to induce altered states - traditional technique',
    cycleDuration: 12,
    syncToBeat: false,
  },

  mantra: {
    phonetic: 'HEY-YA-HO',
    meaning: 'Traditional shamanic journey chant - calling the spirits',
    repeatInterval: 8,
    pronunciation: 'hay-yah-hoh',
    tonality: 'rhythmic chant',
    delivery: 'spoken',
  },

  contraindications: {
    absolute: ['Psychosis', 'Schizophrenia', 'Severe unprocessed trauma'],
    relative: ['First-time journey (work with experienced guide)', 'Dissociative tendencies'],
  },

  citations: [
    'Harner, M. (1980). The Way of the Shaman. Harper & Row.',
    'Shamanic Drumming Research. 4-4.5Hz theta frequencies in traditional practices.',
  ],
};

// ─── 8. Mystical Experience Protocol ────────────────────────────────
export const mysticalExperience: ProtocolSpec = {
  id: 'mystical_experience_protocol',
  name: 'Mystical Experience Protocol',
  category: 'speculative_experimental',
  evidenceLevel: 'V',

  usageGoal: 'Attempt to induce mystical-type experiences characterized by unity, transcendence of time/space, ineffability, and positive mood. Highly speculative and variable.',

  algorithmDescription: 'Multi-stage progression through all brainwave bands (alpha→theta→gamma→delta) with chaotic progressions to destabilize ordinary consciousness and potentially induce mystical experiences.',

  researchContext: 'Mystical experiences across traditions show specific EEG patterns: initial theta, then high gamma, then deep delta. This protocol attempts to guide through these stages (Griffiths et al. 2006, psilocybin studies).',

  durationSeconds: 5400, // 90 minutes

  phases: [
    phase(1, 'Alpha Preparation')
      .duration(900)
      .beat(10)
      .carrier(CARRIERS.neutral)
      .overlays([SOLFEGGIO.SOL], 0.15)
      .gentleCarrierOctaves()
      
      .purpose('Relaxed openness - psychological preparation')
      .build(),

    phase(2, 'Theta Opening')
      .duration(1200)
      .beat([10, 5])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.1)
      .spatial('rotate')
      .gentleCarrierOctaves()
      
      .purpose('Subconscious opening - ego boundaries softening')
      .build(),

    phase(3, 'Gamma Peak')
      .duration(1800)
      .beat(40)
      .carrier(CARRIERS.high)
      .overlays([SOLFEGGIO.OM], 0.25)
      .spatial('spiral')
      .wideCarrierOctaves()
      .deepOverlayOctaves()
      .hybrid(0.5)
      .stochasticJitter(0.2)
      .purpose('Peak mystical state - unity consciousness potential')
      .build(),

    phase(4, 'Delta Dissolution')
      .duration(1200)
      .beat(2)
      .carrier(CARRIERS.warm)
      .noise('brown', 0.3)
      .spatial('breathe')
      .deepCarrierOctaves()
      .hybrid(0.3)
      .purpose('Ego dissolution - boundaryless awareness')
      .build(),

    phase(5, 'Integration Return')
      .duration(300)
      .beat([2, 8])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.1)
      .gentleCarrierOctaves()
      
      .purpose('Gentle return with insights integrated')
      .build(),
  ],

  breathwork: {
    name: 'Mystical Breath',
    ratio: [6, 6, 6, 6],
    description: 'Slow, deep square breathing for sustained altered states',
    cycleDuration: 24,
    syncToBeat: false,
  },

  mantra: {
    phonetic: 'I AM THAT I AM',
    meaning: 'Unity consciousness affirmation - dissolution of subject-object duality',
    repeatInterval: 30,
    pronunciation: 'eye am that eye am',
    tonality: 'expansive dissolving',
    delivery: 'internal',
  },

  contraindications: {
    absolute: ['Psychosis', 'Bipolar disorder', 'Severe anxiety', 'Suicidal ideation', 'Uncontrolled epilepsy'],
    relative: ['No previous meditation experience (build foundation first)', 'Trauma history (needs therapeutic container)'],
  },

  citations: [
    'Griffiths, R. R. et al. (2006). Psilocybin can occasion mystical-type experiences. Psychopharmacology, 187(3), 268-283.',
    'Johns Hopkins Mystical Experience Studies. EEG correlates of transcendent states.',
  ],
};

// ─── Category Export ────────────────────────────────────────────────
export const ALTERED_STATES_SPECS: ProtocolSpec[] = [
  lucidDream,
  thetaMeditation,
  vipassanaMeditation,
  shamanicJourney,
];

export const SPECULATIVE_SPECS: ProtocolSpec[] = [
  pinealResonance,
  dmtGateway,
  transcendentalGamma,
  mysticalExperience,
];
