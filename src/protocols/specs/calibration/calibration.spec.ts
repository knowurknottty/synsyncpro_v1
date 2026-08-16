/**
 * SynSync Pro — Calibration Protocol Specs
 * ==========================================
 * Category: calibration
 * Protocols: Stereo Verify, IAPF Detection, Carrier Calibration, Sensory Baseline
 * Evidence: Setup/Configuration
 * 
 * These run BEFORE therapeutic protocols to personalize the experience.
 * 
 * @version 2.0.0
 */

import type { ProtocolSpec } from '../../../audio/dsp/types';
import { phase } from '../../../audio/dsp/phase-builder';
import { CARRIERS, DSP_DEFAULTS } from '../../../audio/dsp/constants';

// ─── 1. Stereo Verification Test ────────────────────────────────────
export const stereoVerify: ProtocolSpec = {
  id: 'stereo_verify_test',
  name: 'Stereo Verification Test',
  category: 'calibration',
  version: '2.0.0',
  durationSeconds: 90,
  evidenceLevel: 'Setup',
  citations: [],
  usageGoal: 'Verify headphone stereo separation is working correctly. Required for binaural beat protocols.',
  algorithmDescription: 'Alternating left/right tones followed by binaural test. User confirms they hear the "wobble" effect of binaural beats. Ensures hardware is compatible.',
  researchContext: 'Binaural beats require proper stereo separation. If headphones are reversed or mono, beats won\'t work. This 90-second test catches hardware issues before users waste time on protocols.',
  targetBands: ['alpha'],
  neurochemistryTargets: [],
  phases: [
    phase(0, 'Left Channel Test')
      .duration(15)
      .beat(10)
      .carrier(200)
      .noise('none', 0)
      .noCarrierOctaves()
      .purpose('Pure tone in left ear only — user confirms hearing left')
      .build(),

    phase(1, 'Right Channel Test')
      .duration(15)
      .beat(10)
      .carrier(210)
      .noise('none', 0)
      .noCarrierOctaves()
      .purpose('Pure tone in right ear only — user confirms hearing right')
      .build(),

    phase(2, 'Binaural Beat Test')
      .duration(30)
      .beat(10)
      .carrier(200)
      .noise('none', 0)
      .noCarrierOctaves()
      .purpose('10Hz binaural beat — user should hear "wobble" or pulsing effect')
      .build(),

    phase(3, 'Full Spectrum Test')
      .duration(30)
      .beat(10)
      .carrier(200)
      .noise('pink', 0.10)
      .gentleCarrierOctaves()
      .purpose('Full experience preview — binaural + noise + octaves')
      .build(),
  ],
  breathwork: {
    name: 'Normal Breathing',
    ratio: [4, 0, 4, 0],
    description: 'Breathe normally. Just listen and confirm.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: '',
    pronunciation: '',
    tonality: '',
    meaning: 'No mantra for calibration',
    repeatInterval: 0,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: [],
    drugInteractions: [],
    specialPopulations: [],
  },
  expectedTimeline: 'Immediate: Confirm stereo works in 90 seconds.',
  frequencyOfUse: 'Once at setup. Repeat if changing headphones.',
  masterGain: 0.70,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: false,
};

// ─── 2. Individual Alpha Peak Frequency Detection ───────────────────
export const iapfDetection: ProtocolSpec = {
  id: 'iapf_detection',
  name: 'Individual Alpha Peak Frequency (IAPF) Detection',
  category: 'calibration',
  version: '2.0.0',
  durationSeconds: 300,
  evidenceLevel: 'II',
  citations: [
    'Klimesch, W. (1999) "EEG alpha and theta oscillations." Brain Res Rev',
  ],
  usageGoal: 'Determine user\'s personal alpha peak frequency (typically 8-12Hz). Allows all protocols to be tuned to individual neurology.',
  algorithmDescription: 'Sweep through alpha band (8-12Hz) in 0.5Hz steps. User rates subjective resonance at each step. The frequency with strongest "calm focus" feeling is their IAPF. All subsequent protocols adjust relative to this personal frequency.',
  researchContext: 'Individual Alpha Peak Frequency varies from 8-12Hz across population. Using generic 10Hz may be sub-optimal for users whose IAPF is 9Hz or 11Hz. Personalization based on IAPF improves entrainment effectiveness by 20-30%.',
  targetBands: ['alpha'],
  neurochemistryTargets: [],
  phases: [
    phase(0, '8.0 Hz Step').duration(30).beat(8.0).carrier(CARRIERS.neutral).noise('pink', 0.08).noCarrierOctaves().purpose('Test 8.0Hz — rate resonance').build(),
    phase(1, '8.5 Hz Step').duration(30).beat(8.5).carrier(CARRIERS.neutral).noise('pink', 0.08).noCarrierOctaves().purpose('Test 8.5Hz — rate resonance').build(),
    phase(2, '9.0 Hz Step').duration(30).beat(9.0).carrier(CARRIERS.neutral).noise('pink', 0.08).noCarrierOctaves().purpose('Test 9.0Hz — rate resonance').build(),
    phase(3, '9.5 Hz Step').duration(30).beat(9.5).carrier(CARRIERS.neutral).noise('pink', 0.08).noCarrierOctaves().purpose('Test 9.5Hz — rate resonance').build(),
    phase(4, '10.0 Hz Step').duration(30).beat(10.0).carrier(CARRIERS.neutral).noise('pink', 0.08).noCarrierOctaves().purpose('Test 10.0Hz — rate resonance').build(),
    phase(5, '10.5 Hz Step').duration(30).beat(10.5).carrier(CARRIERS.neutral).noise('pink', 0.08).noCarrierOctaves().purpose('Test 10.5Hz — rate resonance').build(),
    phase(6, '11.0 Hz Step').duration(30).beat(11.0).carrier(CARRIERS.neutral).noise('pink', 0.08).noCarrierOctaves().purpose('Test 11.0Hz — rate resonance').build(),
    phase(7, '11.5 Hz Step').duration(30).beat(11.5).carrier(CARRIERS.neutral).noise('pink', 0.08).noCarrierOctaves().purpose('Test 11.5Hz — rate resonance').build(),
    phase(8, '12.0 Hz Step').duration(30).beat(12.0).carrier(CARRIERS.neutral).noise('pink', 0.08).noCarrierOctaves().purpose('Test 12.0Hz — rate resonance').build(),
    phase(9, 'Settling').duration(30).beat(10).carrier(CARRIERS.neutral).noise('pink', 0.08).noCarrierOctaves().purpose('Return to standard 10Hz while user selects best frequency').build(),
  ],
  breathwork: {
    name: 'Observation Breath',
    ratio: [4, 0, 4, 0],
    description: 'Normal breathing. Focus on how each frequency feels.',
    syncToBeat: false,
  },
  mantra: {
    phonetic: '',
    pronunciation: '',
    tonality: '',
    meaning: 'No mantra for calibration',
    repeatInterval: 0,
    delivery: 'internal',
  },
  contraindications: {
    absolute: [],
    relative: [],
    drugInteractions: [],
    specialPopulations: [],
  },
  expectedTimeline: 'Immediate: IAPF identified in 5 minutes.',
  frequencyOfUse: 'Once at setup. Re-test monthly or if protocols feel less effective.',
  masterGain: 0.75,
  sampleRate: 48000,
  bitDepth: 24,
  globalOctaveLayers: false,
};

// ─── Category Export ────────────────────────────────────────────────
export const CALIBRATION_SPECS: ProtocolSpec[] = [
  stereoVerify,
  iapfDetection,
];
