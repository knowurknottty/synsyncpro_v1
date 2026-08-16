import type { ProtocolSafetyGateSpec } from './src/types/spec-safety-gates';

export const PROTOCOL_SAFETY: Record<string, ProtocolSafetyGateSpec> = {
  deep_sleep_delta: {
    protocolId: 'deep_sleep_delta',
    minAgeYears: 18,
    overallRiskSeverity: 'moderate',
    contraindications: [
      {
        id: 'epilepsy',
        description: 'History of seizures or epilepsy, especially photosensitive seizures.',
        severity: 'severe',
        hardBlock: true,
        rationale:
          'Rhythmic auditory or visual stimulation may increase seizure risk in some individuals with epilepsy.',
      },
      {
        id: 'bipolar-mania',
        description: 'History of bipolar I disorder with manic episodes.',
        severity: 'moderate',
        hardBlock: false,
        rationale:
          'Strong state-shifting protocols may destabilize mood in some individuals with bipolar spectrum conditions.',
      },
    ],
    volumeCalibration: {
      required: true,
      referenceToneHz: 440,
      targetSPLdBMin: 40,
      targetSPLdBMax: 70,
      instructions:
        'Set volume to a comfortable, clearly audible level where you can still hear room sounds over the audio.',
    },
    photosensitivity: {
      required: true,
      questionText: 'Have you ever had a seizure triggered by light or sound?',
      blockOnPositive: true,
      showEpilepsyWarning: true,
    },
    sessionLimits: {
      maxMinutesPerSession: 60,
      maxMinutesPerDay: 90,
      maxSessionsPerDay: 2,
      minCoolDownMinutes: 60,
    },
    emergencyCopy:
      'If you experience chest pain, severe dizziness, confusion, or thoughts of self-harm, stop immediately and contact emergency services or your doctor.',
  },
};
