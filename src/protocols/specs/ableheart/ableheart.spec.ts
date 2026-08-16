/**
 * SynSync Pro — Able Heart Music Integration Specs
 * ==================================================
 * Protocols designed for subliminal embedding in Able Heart tracks:
 *   HCI-639  — Heart-Centered Coherence Isochronic   (Grade B-C)
 *   ATB-10   — Alpha-Theta Bridge Creative Flow       (Grade B)
 *   GMU-1.5  — Grounding & Manifestation Ultra-Low   (Grade B-C)
 *
 * All three are audio-only, <85 dBSPL, designed to ride beneath music.
 *
 * @version 2.0.0
 */

import type { ProtocolSpec } from '../../../audio/dsp/types';
import { phase } from '../../../audio/dsp/phase-builder';
import { CARRIERS, SOLFEGGIO, DSP_DEFAULTS } from '../../../audio/dsp/constants';

// ─── HCI-639: Heart-Centered Coherence Isochronic ──────────────────

export const hci639: ProtocolSpec = {
  id: 'hci_639',
  name: 'HCI-639 — Heart-Centered Coherence Isochronic',
  category: 'relationship_social',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'III',
  citations: [
    'McCraty, R. & Zayas, M.A. (2014) "Cardiac coherence, self-regulation, autonomic stability." Front. Psychol. 5:1090.',
    'Lehrer, P.M. et al. (2003) "Heart rate variability biofeedback increases baroreflex gain." Psychosom. Med. 65(5):796-805.',
    'Cysarz, D. & Büssing, A. (2005) "Cardiorespiratory synchronization during Zen meditation." Eur. J. Appl. Physiol. 95(1):88-95.',
    'Khalsa, D.S. (2015) "Stress, meditation, and Alzheimer\'s disease prevention." J. Alzheimers Dis. 48(1):1-12.',
  ],
  usageGoal: 'Embed in Able Heart tracks to promote cardiac coherence, empathy, and connection. The 0.1 Hz isochronic pulse under 639 Hz carrier encourages resonance breathing without listener awareness. Best for love songs, empathy tracks, relational content.',
  algorithmDescription: 'Ultra-subtle isochronic amplitude modulation (8% depth) at 0.1 Hz (6 pulses/min = HRV resonance frequency) on a 639 Hz carrier (heart-chakra solfeggio). Sits -15 dBFS below music mix. Fade in: 5 s, fade out: 5 s. Indistinguishable from music texture but physiologically active.',
  researchContext: 'Cardiac coherence at 0.1 Hz (6 breaths/min) is the resonance frequency of the baroreflex-cardiac loop, maximising HRV amplitude. McCraty (2014) demonstrated coherence improves social bonding and emotional regulation. 639 Hz corresponds to FA solfeggio (relationships/connection) — while direct carrier-frequency effects are Grade D evidence, the rhythmic pacing is Grade A. Combined: Grade B-C.',
  targetBands: ['delta'],
  neurochemistryTargets: ['Vagal tone ↑ (HRV coherence)', 'Oxytocin ↑ (social bonding)', 'Cortisol ↓'],
  phases: [
    phase(0, 'Heart Coherence — Active')
      .duration(1200)
      .beat(0.1)
      .carrier(SOLFEGGIO.LA)
      .noise('none', 0)
      .carrierOctaves({ enabled: false, octavesAbove: 0, octavesBelow: 0, gainRolloff: 0.7, detuneSpread: 0 })
      .purpose('0.1 Hz isochronic pacing at 639 Hz; subaudible HRV resonance entrainment embedded in music; 20-minute sustained cardiac coherence window')
      .build(),
  ],
  breathwork: {
    name: 'Heart Coherence Breath',
    ratio: [5, 0, 5, 0],
    description: 'If listener notices the pulse rhythm, breathe along at 6 breaths/min. Otherwise passive listening is fine.',
    cycleDuration: 10,
    syncToBeat: true,
  },
  mantra: {
    phonetic: 'YAAM',
    pronunciation: 'Yaahm (heart chakra seed)',
    tonality: 'Warm, open',
    meaning: 'Heart open; connection flows',
    repeatInterval: 10,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: ['Severe PTSD with hypervigilance (HRV entrainment may amplify body-awareness — use with care)'],
    drugInteractions: [],
    specialPopulations: [],
  },
  expectedTimeline: 'Session: subtle calm, sense of openness. Chronic (daily listening): improved social emotional regulation.',
  frequencyOfUse: 'Unlimited passive listening. As Able Heart music track.',
  optimalTiming: 'Relationship conversations, creative collaboration, meditation, pre-sleep wind-down',
  masterGain: 0.035,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: false,
};

// ─── ATB-10: Alpha-Theta Bridge Creative Flow ───────────────────────

export const atb10: ProtocolSpec = {
  id: 'atb_10',
  name: 'ATB-10 — Alpha-Theta Bridge Creative Flow',
  category: 'creative_expression',
  version: '2.0.0',
  durationSeconds: 1800,
  evidenceLevel: 'II',
  citations: [
    'Gruzelier, J. (2009) "A theory of alpha/theta neurofeedback, creative performance and healing." Cogn. Process. 10(S1):101-109.',
    'Egner, T. & Gruzelier, J.H. (2003) "Ecological validity of neurofeedback: Modulation of slow wave EEG enhances musical performance." NeuroReport 14(9):1221-1224.',
    'Bhattacharya, J. & Petsche, H. (2005) "Drawing on mind\'s canvas: Differences in cortical integration patterns." Hum. Brain Mapp. 26(1):1-14.',
    'Fachner, J.C. (2011) "Music and altered states of consciousness." Music Consciousness, eds MacDonald et al.',
  ],
  usageGoal: 'Embed in Able Heart creative/introspective tracks to induce hypnagogic imagery, artistic inspiration, and deep creative flow. The 432 Hz base with descending 10→7 Hz isochronic sweep opens the alpha-theta borderland associated with creative insight and dream-like visualization.',
  algorithmDescription: 'Two-phase creative descent: Phase 1 (alpha anchor, 10 Hz, 10 min) establishes relaxed-aware creative state on 432 Hz natural tuning; Phase 2 (theta immersion, 7 Hz, 20 min) descends into hypnagogic creative zone — the alpha-theta border where artists report "receiving" ideas. 15% amplitude modulation depth, prominent but musical.',
  researchContext: 'Alpha-theta training (Gruzelier 2009) is the single most evidence-supported brainwave approach for creativity and artistic performance. The alpha-theta "crossover" point is associated with hypnagogia — the dreamlike state between waking and sleep where imagery is vivid and non-censored. Musicians trained on alpha-theta show improved musical expression and reduced performance anxiety.',
  targetBands: ['alpha', 'theta'],
  neurochemistryTargets: ['Default mode network ↑ (creative ideation)', 'Serotonin ↑ (alpha correlation)', 'Norepinephrine ↓ (release of effortful thinking)'],
  phases: [
    phase(0, 'Alpha Creative Anchor')
      .duration(600)
      .beat(10)
      .carrier(432)
      .noise('pink', 0.04)
      .carrierOctaves({ enabled: true, octavesAbove: 1, octavesBelow: 1, gainRolloff: 0.72, detuneSpread: 6 })
      .purpose('Establish alpha creative state on 432 Hz natural tuning; open right-hemisphere creative networks; reduce inner critic activity')
      .build(),

    phase(1, 'Theta Creative Immersion')
      .duration(1200)
      .beat([10, 7])
      .carrier(432)
      .noise('pink', 0.05)
      .overlays([SOLFEGGIO.SOL], 0.06)
      .deepCarrierOctaves()
      .harmonics()
      .purpose('Cross alpha-theta threshold into hypnagogic creative zone; vivid imagery, free-form ideation, artistic inspiration; the "receiving" state')
      .build(),
  ],
  breathwork: {
    name: 'Creative Surrender Breath',
    ratio: [4, 2, 6, 2],
    description: 'Long exhale releases creative tension; extended hold encourages hypnagogic imagery between breaths.',
    cycleDuration: 14,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'HRIM',
    pronunciation: 'Hreem (magnetic creative force)',
    tonality: 'Resonant, imaginative',
    meaning: 'Open the eye of creation',
    repeatInterval: 10,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Active psychosis or dissociative disorder (theta borderland may amplify)'],
    relative: ['Severe depression (theta may deepen rumination — use alpha-only version)'],
    drugInteractions: ['Cannabis: strong synergy with theta; exercise caution on dosage'],
    specialPopulations: [],
  },
  expectedTimeline: 'Session: hypnagogic imagery within 15 min. Chronic: enhanced creative output, reduced creative block.',
  frequencyOfUse: 'During creative work sessions. As Able Heart album track for extended listening.',
  optimalTiming: 'Before/during art, music composition, writing, brainstorming',
  masterGain: 0.15,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── GMU-1.5: Grounding & Manifestation Ultra-Low ──────────────────

export const gmu15: ProtocolSpec = {
  id: 'gmu_15',
  name: 'GMU-1.5 — Grounding & Manifestation Ultra-Low Frequency',
  category: 'spiritual_integration',
  version: '2.0.0',
  durationSeconds: 1800,
  evidenceLevel: 'III',
  citations: [
    'Vanhatalo, S. et al. (2004) "Infraslow oscillations modulate excitability and interictal epileptic activity." PNAS 101(14):5053-5057.',
    'Monto, S. et al. (2008) "Very slow EEG fluctuations predict the dynamics of stimulus detection." J. Neurosci. 28(33):8268-8272.',
    'Hiltunen, T. et al. (2014) "Infraslow EEG fluctuations are correlated with resting-state fMRI." J. Neurosci. 34(2):356-362.',
    'Köhler, M. et al. (2019) "Infraslow oscillations and states of arousal." Neurosci. Biobehav. Rev. 105:113-124.',
  ],
  usageGoal: 'Embed in Able Heart manifestation/affirmation tracks to promote deep grounding, subconscious processing, and autonomic settling. The 1.5 Hz infraslow isochronic on 528 Hz carrier creates a profound sub-bass presence without drowsiness.',
  algorithmDescription: 'Two-phase manifestation protocol: Phase 1 (infraslow grounding, 1.5 Hz, 15 min) — ultra-low delta modulation on 528 Hz (transformation solfeggio) promotes deep autonomic settling and subconscious receptivity; Phase 2 (theta integration, 4 Hz, 15 min) — theta ascent bridges subconscious content toward waking awareness. 20% modulation depth. Prominent sub-bass feel.',
  researchContext: 'Infraslow oscillations (<0.1 Hz) modulate the excitability of all faster brain rhythms — they are the "tidal rhythm" of consciousness (Monto et al. 2008). 1.5 Hz is in the delta range, promoting rest-state network synchrony. The "manifestation" label is psychologically mediated: deep autonomic relaxation + theta integration creates optimal state for intention-setting and affirmation encoding. 528 Hz "DNA repair" claims are Grade D; the rhythmic entrainment is Grade B.',
  targetBands: ['delta', 'theta'],
  neurochemistryTargets: ['Default mode network coherence ↑', 'Cortisol ↓ (autonomic settling)', 'Subconscious receptivity ↑ (theta bridge)'],
  phases: [
    phase(0, 'Infraslow Grounding')
      .duration(900)
      .beat(1.5)
      .carrier(SOLFEGGIO.SOL)
      .noise('brown', 0.08)
      .carrierOctaves({ enabled: true, octavesAbove: 1, octavesBelow: 1, gainRolloff: 0.65, detuneSpread: 3 })
      .purpose('Ultra-low 1.5 Hz delta modulation; deep autonomic settling; subconscious receptivity; grounding into present moment — optimal for affirmations/intentions')
      .build(),

    phase(1, 'Theta Integration Bridge')
      .duration(900)
      .beat([1.5, 4])
      .carrier(SOLFEGGIO.SOL)
      .noise('pink', 0.06)
      .overlays([SOLFEGGIO.OM], 0.07)
      .deepCarrierOctaves()
      .purpose('Ascend from infraslow into theta; bridge subconscious material toward conscious awareness; memory-of-intention consolidation')
      .build(),
  ],
  breathwork: {
    name: 'Earth Breath',
    ratio: [6, 2, 6, 2],
    description: 'Slow, deep earth breathing. Feel weight sink into the ground on each exhale. Aligned with 1.5 Hz grounding pulse.',
    cycleDuration: 16,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'LAM',
    pronunciation: 'Lahm (root chakra seed)',
    tonality: 'Deep, resonant, grounded',
    meaning: 'Rooted, stable, grounded in abundance',
    repeatInterval: 15,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: ['Narcolepsy (infraslow + delta may trigger sleep during day)', 'Severe dissociation (grounding work first)'],
    drugInteractions: [],
    specialPopulations: [],
  },
  expectedTimeline: 'Session: deep calm, heavy relaxation, subconscious clarity. Chronic: improved emotional regulation, reduced anxiety baseline.',
  frequencyOfUse: 'Daily during manifestation/meditation practice. As Able Heart album track.',
  optimalTiming: 'Evening wind-down, pre-sleep, manifestation/affirmation practice',
  masterGain: 0.20,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── Spec Array ─────────────────────────────────────────────────────
export const ABLEHEART_SPECS: ProtocolSpec[] = [hci639, atb10, gmu15];
