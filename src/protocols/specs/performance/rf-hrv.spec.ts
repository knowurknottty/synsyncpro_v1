/**
 * SynSync Pro — Resonance Frequency HRV Biofeedback Spec
 * ========================================================
 * Protocol: RF-HRV — Resonance Frequency HRV Biofeedback (Grade A)
 *
 * @version 2.0.0
 */

import type { ProtocolSpec } from '../../../audio/dsp/types';
import { phase } from '../../../audio/dsp/phase-builder';
import { CARRIERS, DSP_DEFAULTS } from '../../../audio/dsp/constants';

export const rfHrv: ProtocolSpec = {
  id: 'rf_hrv',
  name: 'RF-HRV — Resonance Frequency HRV Biofeedback',
  category: 'autonomic_mastery',
  version: '2.0.0',
  durationSeconds: 1200,
  evidenceLevel: 'I',
  citations: [
    'Lehrer, P.M. & Gevirtz, R. (2014) "Heart rate variability biofeedback." Front. Psychol. 5:756.',
    'Prinsloo, G.E. et al. (2013) "The effect of short duration HRV biofeedback on stress." Appl. Psychophysiol. Biofeedback 38(1):45-56.',
    'Wheat, A.L. & Larkin, K.T. (2010) "Biofeedback of heart rate variability and related physiology." Appl. Psychophysiol. Biofeedback 35(3):229-242.',
    'Steffen, P.R. et al. (2017) "The impact of resonance frequency breathing on measures of HRV." Front. Public Health 5:222.',
  ],
  usageGoal: 'Train the cardiovascular system to resonate at its natural low-frequency (~0.1 Hz, 6 breaths/min). Maximises HRV amplitude, baroreflex sensitivity, and vagal tone. Best-evidenced biofeedback intervention for anxiety, performance, and cardiovascular health.',
  algorithmDescription: 'Infraslow 0.1 Hz audio pacing guide: soft tone marks inhale (5 s on), silence marks exhale (5 s off). Phase 1: individual resonance frequency calibration (vary 0.08–0.12 Hz to find max HRV response, 5 min). Phase 2: sustained RF breathing (15 min). Optional: use with heart rate monitor to see real-time HRV amplification.',
  researchContext: 'Every individual has a resonance frequency (RF) where cardiac and respiratory oscillations constructively interfere, amplifying HRV amplitude 2–4×. RF is typically 4.5–7 breaths/min (0.075–0.117 Hz), with 5.5 breaths/min (0.0917 Hz) most common. Lehrer & Gevirtz (2014) meta-analysis: RF-HRV biofeedback significantly reduces anxiety, blood pressure, asthma, and depression.',
  targetBands: ['delta'],
  neurochemistryTargets: ['Vagal tone ↑ (HF-HRV)', 'Cortisol ↓', 'GABA ↑ (vagal-brainstem)', 'Baroreflex sensitivity ↑'],
  phases: [
    phase(0, 'RF Calibration Window')
      .duration(300)
      .beat([0.12, 0.08])
      .carrier(CARRIERS.warm)
      .noise('pink', 0.03)
      .carrierOctaves({ enabled: false, octavesAbove: 0, octavesBelow: 0, gainRolloff: 0.7, detuneSpread: 0 })
      .purpose('Gradually slow breathing from 0.12 Hz to 0.08 Hz; find individual resonance frequency where HRV amplitude peaks')
      .build(),

    phase(1, 'Resonance Frequency Sustained')
      .duration(900)
      .beat(0.1)
      .carrier(CARRIERS.warm)
      .noise('pink', 0.03)
      .carrierOctaves({ enabled: false, octavesAbove: 0, octavesBelow: 0, gainRolloff: 0.7, detuneSpread: 0 })
      .purpose('Lock to 0.1 Hz (6 breaths/min) resonance; maximise baroreceptor-cardiac oscillation amplitude; 15 min sustained vagal training')
      .build(),
  ],
  breathwork: {
    name: 'Resonance Breath',
    ratio: [5, 0, 5, 0],
    description: 'Equal inhale/exhale at 5 seconds each = 6 breaths/min. This IS the protocol. Follow the audio tone.',
    cycleDuration: 10,
    syncToBeat: true,
  },
  mantra: {
    phonetic: 'HAAA',
    pronunciation: 'Haah (exhale sigh)',
    tonality: 'Soft, releasing',
    meaning: 'Heart opens on every exhale',
    repeatInterval: 10,
    delivery: 'whispered',
  },
  contraindications: {
    absolute: ['Complete heart block (no HRV signal)', 'Cardiac pacemaker dependency'],
    relative: ['Severe COPD (may be difficult to pace breathing)', 'Panic disorder (start with 3-min sessions)'],
    drugInteractions: ['Beta-blockers reduce HRV amplitude but RF-HRV still beneficial; note reduced baseline'],
    specialPopulations: ['Pregnancy: safe and beneficial; reduce session to 10 min; Elderly: start with 5 min'],
  },
  expectedTimeline: 'Session: immediate HRV amplification, calm. Chronic (8 weeks 20 min/day): significant reduction in resting anxiety, BP normalisation.',
  frequencyOfUse: 'Daily 20 min. Can be split into 2×10 min.',
  optimalTiming: 'Any time; particularly effective before high-stress events or before sleep',
  masterGain: 0.75,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: false,
};

export const RF_HRV_SPECS: ProtocolSpec[] = [rfHrv];
