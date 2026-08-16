import type { ProtocolEvidenceSpec } from './src/types/spec-protocol-evidence';

export const PROTOCOL_EVIDENCE: Record<string, ProtocolEvidenceSpec> = {
  deep_sleep_delta: {
    protocolId: 'deep_sleep_delta',
    primaryOutcome: 'Shorter sleep latency and increased deep sleep (N3) duration',
    secondaryOutcomes: ['Improved next-day alertness'],
    mechanismSummary:
      'Low-frequency delta entrainment plus slow oscillation modulation intended to support slow-wave sleep dynamics.',
    evidenceLevel: 'I',
    evidenceGrade: 'A',
    sources: [
      // Fill from real citations only, e.g. Marshall et al. slow-wave sleep work.
      // { id: 'marshall-2006-sws', type: 'RCT', citation: 'Marshall et al. 2006, Nature', doiOrUrl: 'https://doi.org/...' }
    ],
    claimGuardrails: [
      {
        id: 'deep-sleep',
        claim: 'Improves deep sleep',
        allowedWording: [
          'may increase time spent in deep sleep',
          'may help you fall asleep faster',
          'may support more restorative sleep'
        ],
        forbiddenWording: [
          'guarantees cure for insomnia',
          'replaces medical treatment for sleep apnea',
          'cures all sleep disorders'
        ],
        rationale: 'Avoid over-claiming beyond published delta/slow-wave sleep entrainment literature.',
      },
    ],
    flags: {
      mixedEvidence: false,
      speculativeMechanism: false,
      offLabel: false,
    },
    validatedPopulations: ['adults with insomnia symptoms', 'healthy adults with sleep difficulties'],
    excludedPopulations: ['untreated sleep apnea without medical care', 'children without clinician oversight'],
    // effectSizeEstimates and doseResponseNotes intentionally omitted until populated from real data.
  },

  // anxiety_relief_v4, focus_v5_professional, etc. to be added in later batches.
};
