import type { ProtocolMeasurementPlan } from './src/types/spec-measurement-plan';

export const PROTOCOL_MEASUREMENTS: Record<string, ProtocolMeasurementPlan> = {
  deep_sleep_delta: {
    protocolId: 'deep_sleep_delta',
    metrics: [
      {
        id: 'sleep_latency_minutes',
        label: 'Time to fall asleep (minutes)',
        description: 'Approximate number of minutes it takes you to fall asleep after lights out.',
        type: 'subjectiveScale',
        frequency: 'perSession',
        improvementDirection: 'decrease',
        minValue: 0,
        maxValue: 120,
        instrument: 'Custom',
      },
      {
        id: 'sleep_quality_0_10',
        label: 'Sleep quality (0–10)',
        description: 'How restorative your sleep felt overall.',
        type: 'subjectiveScale',
        frequency: 'daily',
        improvementDirection: 'increase',
        minValue: 0,
        maxValue: 10,
        instrument: 'Custom',
      },
      {
        id: 'isi_total_score',
        label: 'Insomnia Severity Index (ISI)',
        description: 'Validated questionnaire for insomnia severity.',
        type: 'questionnaire',
        frequency: 'weekly',
        improvementDirection: 'decrease',
        minValue: 0,
        maxValue: 28,
        instrument: 'ISI',
      },
    ],
    timeHorizon: {
      expectedFirstChangeDays: 3,
      expectedRobustChangeWeeks: 4,
      recommendedProgramWeeks: 6,
    },
    recommendedInstruments: ['ISI'],
    uxNotes:
      'Collect brief per-session metrics (latency, quality) and administer ISI weekly to avoid survey fatigue.',
  },
};
