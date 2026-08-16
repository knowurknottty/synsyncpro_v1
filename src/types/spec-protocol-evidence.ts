/**
 * Protocol evidence specification types.
 *
 * This file is the canonical place to describe:
 * - What outcomes a protocol claims
 * - What evidence level/grade supports those claims
 * - How strongly we are allowed to word those claims in UI/marketing
 *
 * RVP NOTE:
 * - Do not encode fabricated effect sizes or EEG outcomes here.
 * - If something is speculative, mark it explicitly via flags.
 */

export type EvidenceLevel =
  | 'I'        // Highest: multiple RCTs / meta-analyses
  | 'II'       // RCTs or strong controlled trials
  | 'III'      // Non-randomized / observational / pilot
  | 'III-IV'   // Blended / uncertain between III and IV
  | 'IV'       // Case series, expert consensus
  | 'V'        // Theoretical / traditional only
  | 'Custom';  // Internal or mixed scheme (e.g., "USAF", "Practice");

/**
 * Aggregate confidence in claims for this protocol.
 *
 * A = strong, multi-study backing.
 * B = moderate evidence with consistent signal.
 * C = limited / mixed evidence.
 * D = speculative / traditional / practice-based only.
 */
export type EvidenceGrade = 'A' | 'B' | 'C' | 'D';

/**
 * Source classification for a protocol's evidence.
 */
export type EvidenceSourceType =
  | 'RCT'
  | 'MetaAnalysis'
  | 'SystematicReview'
  | 'Cohort'
  | 'CaseSeries'
  | 'Mechanistic'
  | 'ExpertConsensus'
  | 'Practice'
  | 'Speculative';

/**
 * A single citation or body of work supporting a protocol.
 *
 * IMPORTANT:
 * - `citation` should be human-readable (e.g., "Marshall et al. 2006, Nature").
 * - `doiOrUrl` is optional but recommended when known.
 * - Do not invent DOIs or URLs; leave undefined if unknown.
 */
export interface EvidenceSource {
  /** Optional stable id, e.g., "marshall-2006-sws". */
  id?: string;
  type: EvidenceSourceType;
  /** Human-readable reference string. */
  citation: string;
  /** DOI or URL when available. */
  doiOrUrl?: string;
  /** Optional local strength evaluation for this source. */
  grade?: EvidenceGrade;
  /** Short note on what this source contributes (e.g., "sleep N3 ↑"). */
  note?: string;
}

/**
 * Guardrail for how we are allowed to phrase a specific claim.
 *
 * Example:
 * - claim: "Improves deep sleep"
 * - allowedWording: "may increase time spent in deep sleep"
 * - forbiddenWording: "cures insomnia forever"
 */
export interface ClaimGuardrail {
  /** Internal identifier, e.g., "sleep-n3-duration". */
  id: string;
  /** Short description of the claim being regulated. */
  claim: string;
  /** Wording patterns that are acceptable for UI/marketing copy. */
  allowedWording: string[];
  /** Wording patterns that must NOT be used. */
  forbiddenWording: string[];
  /** Rationale for this guardrail (link to evidence mapping doc if needed). */
  rationale?: string;
}

/**
 * Optional, *explicitly labelled* effect-size description.
 *
 * RVP:
 * - Only populate from actual published numbers.
 * - If not sure, leave undefined.
 */
export interface EffectSizeEstimate {
  /** e.g., "sleep latency (minutes)", "GAD-7 score". */
  outcomeMetric: string;
  /**
   * Rough numeric effect (e.g., -30 = 30% reduction or 30 minutes shorter).
   * Interpretation must be documented in `interpretation`.
   */
  value: number;
  /**
   * "percent", "minutes", "score-points", etc.
   * This prevents ambiguous numeric claims.
   */
  unit: string;
  /**
   * Short explanation of what this effect size means and from which study.
   * Example: "Approx. 30% reduction in pain vs baseline in Zampi 2016."
   */
  interpretation: string;
  /** Optional link to a concrete EvidenceSource by id. */
  sourceId?: string;
}

/**
 * Optional qualitative description of dose–response when known.
 *
 * Example: "Most benefit observed at 3–5 sessions/week for 4+ weeks."
 */
export interface DoseResponseNotes {
  summary: string;
}

/**
 * High-level evidence mapping for a single protocol.
 * This is referenced by protocol id (matching PROTOCOLS keys).
 */
export interface ProtocolEvidenceSpec {
  /** Id must match Protocol.id in constants.ts. */
  protocolId: string;

  /** Human-readable one-sentence summary of the main outcome. */
  primaryOutcome: string;

  /** Other outcomes we intend to track/claim, in plain language. */
  secondaryOutcomes?: string[];

  /**
   * Short explanation of the proposed mechanism of action,
   * using conservative language when evidence is indirect.
   */
  mechanismSummary: string;

  /** Hierarchical evidence level (I–V or Custom). */
  evidenceLevel: EvidenceLevel;

  /** Aggregate confidence grade (A–D). */
  evidenceGrade: EvidenceGrade;

  /** Underlying sources that support this protocol. */
  sources: EvidenceSource[];

  /**
   * Explicitly allowed vs forbidden phrasings for UI, sales pages, docs, etc.
   * This operationalizes "claim hygiene".
   */
  claimGuardrails: ClaimGuardrail[];

  /**
   * Optional known effect size estimates (when they are *actually* known).
   * If evidence is heterogeneous or unclear, keep this empty.
   */
  effectSizeEstimates?: EffectSizeEstimate[];

  /**
   * Flags for RVP transparency.
   * - mixedEvidence: conflicting or heterogeneous literature.
   * - speculativeMechanism: mechanism is plausible but not directly tested.
   * - offLabel: extrapolating from different population/endpoint.
   */
  flags?: {
    mixedEvidence?: boolean;
    speculativeMechanism?: boolean;
    offLabel?: boolean;
  };

  /**
   * Populations where this protocol has been studied or explicitly targeted.
   * Example: ["adults with primary insomnia", "ADHD adults"].
   */
  validatedPopulations?: string[];

  /**
   * Populations where use should be cautious or avoided unless supervised.
   * Example: ["children under 12", "pregnancy", "bipolar I mania"].
   */
  excludedPopulations?: string[];

  /**
   * Optional qualitative dose–response notes when literature supports it.
   */
  doseResponseNotes?: DoseResponseNotes;
}
