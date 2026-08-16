/**
 * SynSync Pro — Cannabis Mimicry Protocol Specs
 * ===============================================
 * Category: cannabis_mimicry
 * Protocols targeting endocannabinoid system modulation via
 * theta-gamma coupling and thalamic gating modification.
 *
 * @version 2.0.0
 */

import type { ProtocolSpec } from '../../../audio/dsp/types';
import { phase } from '../../../audio/dsp/phase-builder';
import { CARRIERS, SOLFEGGIO, DSP_DEFAULTS } from '../../../audio/dsp/constants';

// ─── 1. Cannabis Mimic — Sensory Enhancement Deep ─────────────────
export const cannabisMimic: ProtocolSpec = {
  id: 'deep_relaxation_theta',
  name: 'Sensory Enhancement Deep',
  category: 'cannabis_mimicry',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'II',
  citations: [
    'Katona, I. & Freund, T.F. (2012) "Multiple functions of endocannabinoid signaling in the brain." Ann Rev Neurosci',
    'Colgin, L.L. et al. (2009) "Frequency of gamma oscillations routes flow of information in the hippocampus." Nature',
  ],
  usageGoal: 'Enhanced color perception, touch sensitivity, and mild euphoria. Mimics CB1 receptor agonism effects on thalamic gating without substance use.',
  algorithmDescription: '6Hz theta base with consistent 40Hz gamma bursts for thalamic filtering modification. Theta-gamma coupling mimics the CB1 receptor agonism effect on thalamic gating, allowing more sensory information to reach conscious awareness. Warm carrier (180Hz) with spatial rotation creates immersive sensory field.',
  researchContext: 'Cannabis primarily acts through CB1 receptors on thalamic relay neurons, reducing their filtering of sensory input. This makes colors brighter, touch more vivid, and music richer. Theta-gamma coupling (6Hz + 40Hz) naturally modulates the same thalamic gating circuits, producing similar perceptual enhancement without substance use.',
  targetBands: ['theta', 'gamma'],
  neurochemistryTargets: ['Anandamide ↑ (endocannabinoid)', 'Dopamine ↑ (reward)', 'Serotonin ↑ (mood)', 'Thalamic gating ↓ (sensory enhancement)'],
  phases: [
    phase(0, 'Alpha Settle')
      .duration(120)
      .beat(10)
      .carrier(CARRIERS.standard)
      .noise('pink', 0.08)
      .noCarrierOctaves()
      .purpose('Brief grounding before sensory enhancement')
      .build(),

    phase(1, 'Theta Descent')
      .duration(240)
      .beat([10, 6])
      .carrier(180) // warm, body-resonant
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .spatial('rotate', 0.03)
      .purpose('Descend to 6Hz theta; thalamic gating begins to loosen')
      .build(),

    phase(2, 'Sensory Enhancement Core')
      .duration(660)
      .beat(6)
      .carrier(180)
      .noise('pink', 0.06)
      .overlays([40], 0.30)
      .deepCarrierOctaves()
      .harmonics()
      .spatial('rotate', 0.05)
      .stochasticJitter(10)
      .purpose('Peak theta-gamma coupling — thalamic filtering reduced; colors brighten, touch heightens, music deepens')
      .build(),

    phase(3, 'Integration')
      .duration(180)
      .beat([6, 10])
      .carrier(CARRIERS.standard)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .purpose('Gentle return; sensory enhancement carries into waking perception')
      .build(),
  ],
  breathwork: {
    name: 'Sensory Breath',
    ratio: [4, 0, 4, 0],
    description: 'Relaxed nasal breathing. Notice sensory details with each exhale — colors, textures, sounds.',
    cycleDuration: 8,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'EXPAND',
    pronunciation: 'Ex-pand (opening outward)',
    tonality: 'Wide, spacious',
    meaning: 'Natural perception expanding — senses opening without filter',
    repeatInterval: 20,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Active psychosis', 'Derealization disorder'],
    relative: ['Anxiety — sensory flooding may overwhelm', 'Sensory processing disorder'],
    drugInteractions: ['Do NOT combine with cannabis — stacking effect', 'Caution with psychedelics'],
    specialPopulations: [],
  },
  expectedTimeline: 'Immediate: Subtle sensory enhancement within 10min. 2 weeks: Reliable perceptual shifts. 4 weeks: Sustained sensory acuity improvement.',
  frequencyOfUse: '3-5x/week. Ideal for creative work, music listening, nature immersion.',
  optimalTiming: 'Evening or during creative/relaxation activities',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 2. Social Ease Protocol ──────────────────────────────────────
export const socialEase: ProtocolSpec = {
  id: 'social_ease_delta_theta',
  name: 'Social Ease Protocol',
  category: 'cannabis_mimicry',
  version: '2.0.0',
  durationSeconds: 900,
  evidenceLevel: 'II',
  citations: [
    'Phan, K.L. et al. (2008) "Cannabinoid modulation of amygdala reactivity to social signals." Neuropsychopharmacology',
    'de Vries, M. et al. (2017) "Endocannabinoids mediate social reward and interaction." Progress Neurobiol',
  ],
  usageGoal: 'Reduced social anxiety and increased humor accessibility. Mimics cannabis social disinhibition through nested delta-theta-gamma amygdala modulation.',
  algorithmDescription: 'Nested delta-theta-gamma stack (2Hz/5Hz/40Hz) for oxytocin facilitation via isochronic delivery. Delta (2Hz overlay) reduces deep-layer amygdala reactivity. Theta (5Hz primary) loosens social filters. Gamma (40Hz overlay) maintains prefrontal social processing. The combination mirrors cannabis social ease without cognitive impairment.',
  researchContext: 'Cannabis social disinhibition occurs through amygdala CB1 receptor activation, reducing threat detection of social stimuli (Phan 2008). This protocol mimics that effect through delta-theta amygdala entrainment while maintaining gamma-mediated prefrontal social processing — social ease without the foggy cognition.',
  targetBands: ['theta', 'delta', 'gamma'],
  neurochemistryTargets: ['Oxytocin ↑ (social bonding)', 'GABA ↑ (amygdala inhibition)', 'Anandamide ↑ (endocannabinoid)', 'Cortisol ↓ (social fear)'],
  phases: [
    phase(0, 'Alpha Settle')
      .duration(120)
      .beat(10)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.08)
      .noCarrierOctaves()
      .purpose('Brief settling before social ease induction')
      .build(),

    phase(1, 'Theta-Delta Amygdala Modulation')
      .duration(300)
      .beat([10, 5])
      .carrier(CARRIERS.warm)
      .noise('pink', 0.08)
      .overlays([2], 0.15)
      .gentleCarrierOctaves()
      .purpose('Descend to theta with delta overlay; amygdala social threat detection softening')
      .build(),

    phase(2, 'Social Ease Core')
      .duration(360)
      .beat(5)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.06)
      .overlays([2, 40], 0.25)
      .deepCarrierOctaves()
      .isochronic(0.45)
      .harmonics()
      .stochasticJitter(8)
      .purpose('Peak nested stack — amygdala calm, social processing maintained, humor accessible')
      .build(),

    phase(3, 'Integration')
      .duration(120)
      .beat([5, 10])
      .carrier(CARRIERS.warm)
      .noise('pink', 0.08)
      .noCarrierOctaves()
      .purpose('Return to alpha carrying social ease into interaction')
      .build(),
  ],
  breathwork: {
    name: 'Ease Breath',
    ratio: [4, 4, 4, 4],
    description: 'Balanced box breath. Notice the social ease settling in. Allow natural laughter.',
    cycleDuration: 16,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'FLOW',
    pronunciation: 'Flow (easy, natural)',
    tonality: 'Casual, light',
    meaning: 'Natural laughter — social interaction flows without effort',
    repeatInterval: 15,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: ['Severe social phobia — may need professional support first'],
    drugInteractions: ['Do NOT combine with cannabis', 'Safe with SSRIs'],
    specialPopulations: [],
  },
  expectedTimeline: 'Immediate: Social ease within 10min. 2 weeks: Improved social comfort.',
  frequencyOfUse: 'As needed before social events. 3-5x/week.',
  optimalTiming: '20-30 minutes before social gatherings',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── 3. Introspection & Self-Discovery ─────────────────────────────
export const introspectionInsight: ProtocolSpec = {
  id: 'introspection_insight_alpha_theta',
  name: 'Introspection & Self-Discovery',
  category: 'cannabis_mimicry',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'II',
  citations: [
    'Peniston, E. & Kulkosky, P. (1991) "Alpha-theta brainwave training and personality." Medical Psychotherapy',
    'Gruzelier, J. (2009) "A theory of alpha/theta neurofeedback, creative performance enhancement, and long-distance functional connectivity." Cogn Process',
  ],
  usageGoal: 'Relaxed self-examination and emotional truth access. Deepens connection between amygdala and prefrontal cortex for honest introspection.',
  algorithmDescription: 'Alpha-theta blend (8Hz/5Hz) designed to lower cognitive defenses. Phase 1 at 8Hz alpha-theta border lowers mental guard. Phase 2 at 5Hz theta with stochastic jitter destabilizes defensive cognitive patterns, allowing genuine self-insight to emerge. Mirrors cannabis introspective effect without the paranoid distortion.',
  researchContext: 'Peniston & Kulkosky (1991) pioneered alpha-theta training for addiction recovery, finding that the alpha-theta crossover state enables honest self-confrontation and emotional truth access. Cannabis users report similar introspective states — this protocol targets the same neural substrate without substance use.',
  targetBands: ['alpha', 'theta'],
  neurochemistryTargets: ['Serotonin ↑ (introspection)', 'Anandamide ↑ (endocannabinoid)', 'DMN modulation (self-reflection)'],
  phases: [
    phase(0, 'Alpha Settle')
      .duration(120)
      .beat(10)
      .carrier(CARRIERS.standard)
      .noise('pink', 0.08)
      .noCarrierOctaves()
      .purpose('Brief settling into reflective state')
      .build(),

    phase(1, 'Alpha-Theta Border')
      .duration(360)
      .beat([10, 8])
      .carrier(CARRIERS.standard)
      .noise('pink', 0.10)
      .gentleCarrierOctaves()
      .overlays([SOLFEGGIO.SOL], 0.06) // 528Hz transformation
      .purpose('Alpha-theta border — cognitive defenses lowering; honest self-observation begins')
      .build(),

    phase(2, 'Deep Theta Introspection')
      .duration(480)
      .beat(5)
      .carrier(CARRIERS.standard)
      .noise('pink', 0.10)
      .deepCarrierOctaves()
      .stochasticJitter(12)
      .harmonics()
      .overlays([SOLFEGGIO.SOL, SOLFEGGIO.LA], 0.08) // 528Hz + 639Hz
      .purpose('Deep theta introspection — truth emerges without cognitive censorship; emotional honesty accessible')
      .build(),

    phase(3, 'Integration')
      .duration(240)
      .beat([5, 10])
      .carrier(CARRIERS.standard)
      .noise('pink', 0.08)
      .gentleCarrierOctaves()
      .purpose('Return to alpha; carry insights into conscious awareness for journaling')
      .build(),
  ],
  breathwork: {
    name: 'Truth Breath',
    ratio: [5, 5, 5, 5],
    description: 'Even box breath with intention: "What is true?" Allow answers to arise without judgment.',
    cycleDuration: 20,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'SEE',
    pronunciation: 'See (quiet knowing)',
    tonality: 'Clear, unflinching',
    meaning: 'Truth emerges — seeing clearly without defense or distortion',
    repeatInterval: 30,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Active psychosis', 'Acute trauma (<3 months)'],
    relative: ['Depression — introspection may deepen temporarily before resolving', 'Dissociation — monitor for detachment'],
    drugInteractions: ['Do NOT combine with cannabis', 'Compatible with SSRIs'],
    specialPopulations: ['Have journal ready', 'Allow 30min integration after session'],
  },
  expectedTimeline: 'Session 1: Moments of honest self-reflection. 2 weeks: Deeper self-knowledge. 4 weeks: Sustained introspective capacity without substance.',
  frequencyOfUse: '2-3x/week. Allow integration time between sessions.',
  optimalTiming: 'Evening, quiet environment with journal available',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── Category Export ────────────────────────────────────────────────
export const CANNABIS_MIMICRY_SPECS: ProtocolSpec[] = [
  cannabisMimic,
  socialEase,
  introspectionInsight,
];
