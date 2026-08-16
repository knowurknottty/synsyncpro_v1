/**
 * SynSync Pro — Advanced Coupling & Multimodal Gamma Specs
 * ==========================================================
 * Protocols:
 *   TG-CFC  — Theta-Gamma Cross-Frequency Coupling    (Grade B)
 *   TI-PBM  — Temporal Interference + PBM Hybrid      (Grade C)
 *   MGS-40  — Multimodal Gamma Synchrony 40 Hz        (Grade B-C)
 *
 * @version 2.0.0
 */

import type { ProtocolSpec } from '../../../audio/dsp/types';
import { phase } from '../../../audio/dsp/phase-builder';
import { CARRIERS, SOLFEGGIO, DSP_DEFAULTS } from '../../../audio/dsp/constants';
import { wideOctaves, deepOctaves } from '../../../audio/dsp/octave-resolver';

// ─── TG-CFC: Theta-Gamma Cross-Frequency Coupling ──────────────────

export const tgCfc: ProtocolSpec = {
  id: 'tg_cfc',
  name: 'TG-CFC — Theta-Gamma Cross-Frequency Coupling',
  category: 'advanced_research',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'II',
  citations: [
    'Lisman, J. & Jensen, O. (2013) "The theta-gamma neural code." Neuron 77(6):1002-1016.',
    'Canolty, R.T. & Knight, R.T. (2010) "The functional role of cross-frequency coupling." TICS 14(11):506-515.',
    'Tort, A.B.L. et al. (2009) "Theta-gamma coupling increases during REM sleep and mental imagery." J. Neurophysiol.',
    'Shirvalkar, P.R. et al. (2010) "Cognitive enhancement with central thalamic electrical stimulation." PNAS.',
  ],
  usageGoal: 'Enhance episodic memory encoding and recall via theta-nested gamma bursts. Targets hippocampal-prefrontal theta (6 Hz) modulated by 40 Hz gamma for memory indexing.',
  algorithmDescription: 'Three-phase protocol: alpha priming (10 Hz, 4 min) → pure theta induction (6 Hz, 8 min) → TG-CFC active stage (6 Hz carrier modulated by 40 Hz gamma overlay, 8 min). Binaural beats provide theta entrainment; gamma isochronic pulses nested inside each theta trough.',
  researchContext: 'Theta-gamma coupling is the brain\'s native working-memory clock. Gamma cycles (7–8 per theta cycle at 40 Hz/6 Hz ≈ 6.67:1) sequence distinct memory items within each theta frame. Lisman & Jensen (2013) established TG as the "neural code" for WM capacity (7±2 items = ∼7 gamma cycles/theta).',
  targetBands: ['theta', 'gamma'],
  neurochemistryTargets: ['Acetylcholine ↑ (hippocampal theta gate)', 'GABA interneuron synchrony (PV+)', 'NMDA-R plasticity ↑'],
  phases: [
    phase(0, 'Alpha Priming')
      .duration(240)
      .beat(10)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.05)
      .carrierOctaves({ enabled: true, octavesAbove: 1, octavesBelow: 1, gainRolloff: 0.7, detuneSpread: 4 })
      .purpose('Relax attentional filter; reduce default-mode noise; prime hippocampal theta generation')
      .build(),

    phase(1, 'Theta Induction')
      .duration(480)
      .beat(6)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.07)
      .deepCarrierOctaves()
      .purpose('Establish hippocampal theta 6 Hz; synchronise hippocampus → prefrontal theta phase-locking')
      .build(),

    phase(2, 'TG-CFC Active Training')
      .duration(480)
      .beat(6)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.06)
      .overlays([40], 0.12)
      .deepCarrierOctaves()
      .harmonics()
      .stochasticJitter(6)
      .purpose('Nested 40 Hz gamma bursts phase-locked to theta trough; maximal cross-frequency coupling for memory indexing')
      .build(),
  ],
  breathwork: {
    name: 'Hippocampal Rhythm Breath',
    ratio: [5, 2, 5, 2],
    description: 'Slow 5-count breath to co-entrain respiratory-hippocampal theta coherence.',
    cycleDuration: 14,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'AUM',
    pronunciation: 'Aah-ooh-mmm',
    tonality: 'Low resonant hum',
    meaning: 'Unification — all memory into one continuous stream',
    repeatInterval: 12,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Active seizure disorder', 'History of temporal lobe epilepsy'],
    relative: ['Psychiatric medication affecting GABA/glutamate (consult prescriber)', 'Recent traumatic brain injury'],
    drugInteractions: ['GABA modulators may blunt theta; benzodiazepines reduce TG coupling amplitude'],
    specialPopulations: ['Not for children under 16 without clinical oversight'],
  },
  expectedTimeline: 'Session benefit: improved working memory (1 session). Cumulative: measurable WM gains at 8–12 sessions.',
  frequencyOfUse: '3–4x per week; avoid consecutive days during initial 2 weeks.',
  optimalTiming: 'Before study/work sessions or 30 min after waking',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── TI-PBM: Temporal Interference + Photobiomodulation ────────────

export const tiPbm: ProtocolSpec = {
  id: 'ti_pbm',
  name: 'TI-PBM — Temporal Interference + Photobiomodulation Hybrid',
  category: 'advanced_research',
  version: '2.0.0',
  durationSeconds: 480,
  evidenceLevel: 'IV',
  citations: [
    'Grossman, N. et al. (2017) "Noninvasive deep brain stimulation via TI." Cell 169(6):1029-1041.',
    'Cassano, P. et al. (2019) "Transcranial photobiomodulation for major depressive disorder." Neuropsychiatr. Dis. Treat.',
    'Zomorrodi, R. et al. (2019) "Pulsed near-infrared transcranial and intranasal PBM." Scientific Reports.',
    'Chao, L.L. (2019) "Effects of home photobiomodulation treatments on cognitive and behavioral function." Photobiomod. Photomed. Laser Surg.',
  ],
  usageGoal: 'Audio-side of TI-PBM hybrid session. Provides theta (6 Hz) temporal-interference beat to synchronise with simultaneous 40 Hz PBM (1064 nm, 10 mW/cm²) applied via external device. Use only with validated TI-PBM hardware.',
  algorithmDescription: '⚠️ AUDIO COMPONENT ONLY — PBM hardware required for full protocol. Audio: 2000 Hz ± 6 Hz binaural beat to create 6 Hz theta TI envelope, paired with isochronic pulses. PBM: 40 Hz pulsed 1064 nm NIR (hardware side). Session: 2 min ramp → 6 min active → brief integration.',
  researchContext: 'Temporal interference uses high-frequency carriers (≥1 kHz) whose beating frequency deposits low-frequency oscillations at depth without surface stimulation. Combined with 40 Hz NIR-PBM, which drives mitochondrial cytochrome c oxidase, this hybrid targets both neural oscillation and metabolic upregulation. Grade C because modalities are individually validated but combination is untested in RCT.',
  targetBands: ['theta'],
  neurochemistryTargets: ['BDNF ↑ (PBM-mediated)', 'ATP synthesis ↑ (cytochrome c oxidase)', 'Theta coherence ↑'],
  phases: [
    phase(0, 'TI Ramp-Up')
      .duration(120)
      .beat([10, 6])
      .carrier(CARRIERS.bright)
      .noise('none', 0)
      .carrierOctaves({ enabled: false, octavesAbove: 0, octavesBelow: 0, gainRolloff: 0.7, detuneSpread: 0 })
      .purpose('Gradual alpha→theta descent; match TI carrier onset; synchronise with PBM ramp')
      .build(),

    phase(1, 'Active TI-PBM Window')
      .duration(360)
      .beat(6)
      .carrier(CARRIERS.bright)
      .noise('pink', 0.04)
      .overlays([40], 0.08)
      .carrierOctaves({ enabled: true, octavesAbove: 1, octavesBelow: 0, gainRolloff: 0.8, detuneSpread: 2 })
      .purpose('6 Hz TI entrainment active; concurrent 40 Hz PBM pulses from hardware device; maintain theta phase coherence throughout')
      .build(),
  ],
  breathwork: {
    name: 'Coherence Breath',
    ratio: [5, 0, 5, 0],
    description: 'Box-lite breathing; 6 breaths/min to enhance HRV during photobiomodulation.',
    cycleDuration: 10,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'RA',
    pronunciation: 'Raah (sun/light)',
    tonality: 'Open, resonant',
    meaning: 'Light activating inner healing',
    repeatInterval: 12,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Photosensitivity disorders (Lupus, porphyria)', 'Seizure disorder', 'Active malignancy in head/neck'],
    relative: ['Thyroid medication (avoid neck exposure for PBM)', 'Pregnancy (PBM component)'],
    drugInteractions: ['Photosensitising drugs (tetracyclines, certain antipsychotics) — audio component safe but PBM contraindicated'],
    specialPopulations: ['Children: audio component safe; PBM component requires paediatric clinical guidance'],
  },
  expectedTimeline: 'Acute: mild cognitive clarity in session. Cumulative (8 weeks): depression + cognition improvements per PBM literature.',
  frequencyOfUse: 'Audio component: daily. Full TI-PBM: 3x/week per clinical protocol.',
  optimalTiming: 'Morning, with PBM device positioned per device instructions',
  masterGain: 0.7,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: false,
};

// ─── MGS-40: Multimodal Gamma Synchrony ────────────────────────────

export const mgs40: ProtocolSpec = {
  id: 'mgs_40',
  name: 'MGS-40 — Multimodal Gamma Synchrony (40 Hz)',
  category: 'advanced_research',
  version: '2.0.0',
  durationSeconds: 900,
  evidenceLevel: 'II',
  citations: [
    'Iaccarino, H.F. et al. (2016) "Gamma frequency entrainment attenuates amyloid load and modifies microglia." Nature 540:230-235.',
    'Martorell, A.J. et al. (2019) "Multi-sensory gamma stimulation ameliorates Alzheimer\'s-associated pathology." Cell 177(2):256-271.',
    'Kim, T. et al. (2021) "40 Hz flickering light for Alzheimer\'s disease." Ann. Clin. Transl. Neurol.',
    'Garcia-Argibay, M. et al. (2019) "Efficacy of binaural auditory beats in cognition, anxiety, and pain." Psych. Res. 270:244.',
  ],
  usageGoal: 'Drive whole-brain 40 Hz gamma synchrony via combined binaural beats + isochronic tones. Targets ASSR (Auditory Steady-State Response) for cognitive enhancement, neuroprotection, and Alzheimer\'s risk reduction.',
  algorithmDescription: '🔴 PHOTOSENSITIVITY SCREEN REQUIRED for visual component. Audio-only is safe. Three phases: 1-min gamma ramp (20→40 Hz), 13-min dual-delivery 40 Hz (binaural carrier + isochronic pulses), 1-min alpha return (10 Hz). Hybrid delivery maximises ASSR amplitude.',
  researchContext: '40 Hz gamma is the brain\'s "binding frequency" — synchronises distributed cortical networks. Iaccarino et al. (2016) showed 40 Hz light flicker reduced amyloid-β and phospho-tau in mice; Martorell (2019) combined audio+visual for stronger effect. Human ASSR studies confirm reliable 40 Hz entrainment via binaural and isochronic auditory stimulation.',
  targetBands: ['gamma'],
  neurochemistryTargets: ['Gamma-band ASSR ↑', 'Microglia activation (neuroprotective)', 'BDNF ↑', 'Acetylcholine ↑ (cortical binding)'],
  phases: [
    phase(0, 'Gamma Ramp')
      .duration(60)
      .beat([20, 40])
      .carrier(CARRIERS.high)
      .noise('pink', 0.05)
      .hybrid(0.5)
      .carrierOctaves({ enabled: true, octavesAbove: 1, octavesBelow: 1, gainRolloff: 0.65, detuneSpread: 3 })
      .purpose('Ascending entrainment from beta to gamma; cortical arousal priming; prevent abrupt onset startle')
      .build(),

    phase(1, 'MGS-40 Active Window')
      .duration(780)
      .beat(40)
      .carrier(CARRIERS.high)
      .noise('pink', 0.06)
      .overlays([SOLFEGGIO.TI], 0.08)
      .deepCarrierOctaves()
      .harmonics()
      .hybrid(0.5)
      .stochasticJitter(4)
      .purpose('Maximal 40 Hz ASSR drive; binaural + isochronic hybrid for broadest cortical coverage; neuroprotective gamma entrainment')
      .build(),

    phase(2, 'Alpha Return')
      .duration(60)
      .beat([40, 10])
      .carrier(CARRIERS.neutral)
      .noise('pink', 0.05)
      .carrierOctaves({ enabled: true, octavesAbove: 1, octavesBelow: 1, gainRolloff: 0.7, detuneSpread: 4 })
      .purpose('Graceful descent from gamma; prevent post-session over-stimulation; return to relaxed alertness')
      .build(),
  ],
  breathwork: {
    name: 'Gamma Breath',
    ratio: [3, 1, 3, 1],
    description: 'Crisp, rhythmic breathing to maintain cognitive alertness during gamma entrainment.',
    cycleDuration: 8,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'AIM',
    pronunciation: 'Aim (sharp, clear)',
    tonality: 'High, focused',
    meaning: 'Precision awareness; mind binds all into clarity',
    repeatInterval: 8,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Photosensitive epilepsy (if using visual component)', 'Uncontrolled seizure disorder'],
    relative: ['Severe anxiety or agitation (gamma may amplify)', 'Migraine with aura'],
    drugInteractions: ['Stimulants (caffeine, amphetamines) may over-amplify gamma arousal'],
    specialPopulations: ['Elderly with dementia risk: start at 5 min; protocol is likely beneficial but monitor for agitation'],
  },
  expectedTimeline: 'Acute: sharpened focus within 5 min. Chronic (8 weeks daily): may reduce Alzheimer\'s risk biomarkers per preclinical evidence.',
  frequencyOfUse: 'Daily 15-min sessions. Consistent use required for neuroprotective effects.',
  optimalTiming: 'Morning or early afternoon; avoid within 2 hours of sleep',
  masterGain: DSP_DEFAULTS.masterGain,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: true,
};

// ─── Spec Array ─────────────────────────────────────────────────────
export const MULTIMODAL_GAMMA_SPECS: ProtocolSpec[] = [
  tgCfc,
  tiPbm,
  mgs40,
];
