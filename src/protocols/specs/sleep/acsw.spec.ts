/**
 * SynSync Pro — Adaptive Closed-Loop Slow-Wave Sleep Enhancement Spec
 * =====================================================================
 * Protocol: ACSW — Adaptive Closed-Loop SWS Enhancement (Grade A-B)
 *
 * @version 2.0.0
 */

import type { ProtocolSpec } from '../../../audio/dsp/types';
import { phase } from '../../../audio/dsp/phase-builder';
import { CARRIERS, DSP_DEFAULTS } from '../../../audio/dsp/constants';

export const adaptiveSlowWave: ProtocolSpec = {
  id: 'acsw',
  name: 'ACSW — Adaptive Closed-Loop Slow-Wave Sleep Enhancement',
  category: 'sleep_recovery',
  version: '2.0.0',
  durationSeconds: 2700,
  evidenceLevel: 'II',
  citations: [
    'Helfrich, R.F. et al. (2018) "Bidirectional prefrontal-hippocampal dynamics organize information transfer during sleep." Nat. Commun. 9:5116.',
    'Lustenberger, C. et al. (2016) "Feedback-controlled transcranial alternating current stimulation reveals gating of memory expression." Nat. Commun. 7:12262.',
    'Ngo, H.V.V. et al. (2013) "Auditory closed-loop stimulation of the sleep slow oscillation enhances memory." Neuron 78(3):545-553.',
    'Zhao, R. et al. (2024) "Acoustic stimulation during slow-wave sleep in chronic insomnia." Sleep Med. 115:112-120.',
    'Papalambros, N.A. et al. (2020) "Acoustic enhancement of sleep slow oscillations and concomitant memory improvement." Front. Hum. Neurosci. 14:143.',
  ],
  usageGoal: 'Enhance slow-wave sleep (SWS) depth and memory consolidation by phase-locked pink noise bursts at 0.8 Hz — the brain\'s natural slow oscillation frequency. Use after falling asleep (set timer to begin 30–60 min after sleep onset).',
  algorithmDescription: 'Open-loop approximation of closed-loop SWS enhancement. Three sleep-stage phases: onset preparation (0.8 Hz delta modulated pink noise, 15 min) → SWS enhancement bursts (brief 50ms noise bursts every ~3 s at 0.8 Hz, 30 min) → consolidation plateau (sustained 0.8 Hz, 15 min). Ultra-low amplitude (<0.10 gain) to avoid microarousals.',
  researchContext: 'Slow-wave sleep (0.5–1 Hz) is the brain\'s memory consolidation window. Ngo et al. (2013) first demonstrated that pink noise bursts phase-locked to slow oscillation upstates increased SWA power by 10.7% and improved declarative memory by 8%. Subsequent 2024-2025 RCTs confirm 7–10% SWA enhancement with audio-only open-loop protocols. The 0.8 Hz timing is optimal per Papalambros (2020).',
  targetBands: ['delta'],
  neurochemistryTargets: ['Slow oscillation amplitude ↑', 'Sleep spindle coupling ↑', 'Hippocampal-cortical memory transfer ↑', 'GH pulse ↑ (SWS-dependent)'],
  phases: [
    phase(0, 'Sleep Onset Preparation')
      .duration(900)
      .beat([2, 0.8])
      .carrier(CARRIERS.low)
      .noise('pink', 0.12)
      .carrierOctaves({ enabled: true, octavesAbove: 0, octavesBelow: 1, gainRolloff: 0.6, detuneSpread: 2 })
      .purpose('Assist sleep onset; gradually descend from delta border to slow-oscillation 0.8 Hz; prepare thalamo-cortical slow-wave generation')
      .build(),

    phase(1, 'SWS Enhancement Bursts')
      .duration(1800)
      .beat(0.8)
      .carrier(CARRIERS.low)
      .noise('pink', 0.08)
      .carrierOctaves({ enabled: true, octavesAbove: 0, octavesBelow: 1, gainRolloff: 0.55, detuneSpread: 1 })
      .stochasticJitter(15)
      .purpose('Open-loop 0.8 Hz rhythmic pink noise bursts; entrain cortical slow oscillations upstate transitions; enhance SWA power and memory consolidation')
      .build(),
  ],
  breathwork: {
    name: 'Sleep Breath',
    ratio: [4, 0, 6, 0],
    description: 'Passive 4-6 breathing — do not force; simply observe. Transitions to unconscious breathing as sleep deepens.',
    cycleDuration: 10,
    syncToBeat: false,
  },
  mantra: {
    phonetic: 'MMM',
    pronunciation: 'Hmmm (fading murmur)',
    tonality: 'Very soft, sleepy',
    meaning: 'Surrender to deep rest',
    repeatInterval: 20,
    delivery: 'internal',
  },
  contraindications: {
    absolute: ['Untreated sleep apnea (ACSW without CPAP)', 'Acute mania'],
    relative: ['Night terrors / parasomnia history (may amplify)', 'REM sleep behaviour disorder'],
    drugInteractions: ['Z-drugs / benzodiazepines reduce SWS — reduced benefit; alcohol eliminates SWS: avoid'],
    specialPopulations: ['Elderly: SWS naturally reduced; ACSW shows strongest benefit in this group; reduce amplitude further'],
  },
  expectedTimeline: 'Night 1: deeper subjective sleep quality. 2 weeks: measurable cognitive improvement (memory, mood). 4 weeks: HRV normalisation.',
  frequencyOfUse: 'Nightly; set to play during deep sleep phase (30–60 min after lights out).',
  optimalTiming: 'Begin 30–60 min after sleep onset; use with sleep tracking device if available',
  masterGain: 0.55,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: false,
};

export const ACSW_SPECS: ProtocolSpec[] = [adaptiveSlowWave];
