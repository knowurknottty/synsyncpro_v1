/**
 * Measurement plans for protocols.
 *
 * Goal:
 * - Make "what we measure" explicit per protocol (subjective + objective).
 * - Tie app UI (check-ins, questionnaires, tasks) to a typed spec layer.
 *
 * This supports RVP by forcing:
 * - Pre/post definitions
 * - Time windows
 * - Explicit metric names and scales
 */

export type MetricType =
  | 'subjectiveScale'   // e.g., 0–10 pain, sleep quality
  | 'questionnaire'     // e.g., GAD-7, PHQ-9, ISI
  | 'objectiveTest'     // e.g., reaction time, N-back, Stroop
  | 'passiveSensor';    // e.g., wearable HRV, sleep staging (if ever added)

/**
 * When and how often a metric is collected.
 */
export type MeasurementFrequency =
  | 'perSession'
  | 'daily'
  | 'weekly'
  | 'baselineOnly'
  | 'followupOnly';

/**
 * Direction of improvement for this metric.
 */
export type ImprovementDirection = 'increase' | 'decrease' | 'towardMid' | 'none';

/**
 * Definition of a single trackable metric.
 *
 * Examples:
 * - "Sleep latency (minutes)"
 * - "GAD-7 score"
 * - "Self-rated focus 0–10"
 */
export interface ProtocolMetricSpec {
  /** Stable id, used as a key in storage and analytics. */
  id: string;
  /** Human-readable name shown in UI. */
  label: string;
  /** Short description or tooltip text. */
  description?: string;
  type: MetricType;
  /**
   * How often and at what phase we collect this metric.
   * e.g., "perSession" for VAS pain, "weekly" for questionnaires.
   */
  frequency: MeasurementFrequency;
  /**
   * Expected direction of improvement.
   * Example: pain VAS = 'decrease', focus 0–10 = 'increase'.
   */
  improvementDirection: ImprovementDirection;
  /**
   * Optional range metadata for UI sliders.
   * Example: 0–10, 0–21 for GAD-7, etc.
   */
  minValue?: number;
  maxValue?: number;
  /**
   * Optional reference to a standard instrument.
   * Example: "GAD-7", "ISI", "VAS-Pain".
   */
  instrument?: string;
}

/**
 * Time horizon expectations for a protocol's measurable outcomes.
 *
 * These are qualitative and should match curriculum timelines.
 */
export interface TimeHorizonSpec {
  /** When users might first notice subtle changes (days or weeks). */
  expectedFirstChangeDays?: number;
  /** When we expect robust, clearly noticeable change (weeks). */
  expectedRobustChangeWeeks?: number;
  /**
   * Minimal program length we ask users to commit to before judging.
   * Example: 12 weeks for suffering reduction protocols.
   */
  recommendedProgramWeeks?: number;
}

/**
 * Measurement plan for a single protocol.
 *
 * This bridges:
 * - Protocols in constants.ts
 * - Curriculum expectations in the docs
 * - Actual in-app questionnaires / metrics
 */
export interface ProtocolMeasurementPlan {
  /** Must match Protocol.id in constants.ts. */
  protocolId: string;

  /** Metrics we will track for this protocol. */
  metrics: ProtocolMetricSpec[];

  /** Qualitative time horizon expectations. */
  timeHorizon?: TimeHorizonSpec;

  /**
   * Recommended validated instruments tied to this protocol/category.
   * Example: ["ISI"] for sleep onset/maintenance, ["PCL-5"] for PTSD.
   */
  recommendedInstruments?: string[];

  /**
   * Optional notes for UI/UX:
   * - "Ask only weekly to avoid survey fatigue."
   * - "Use in-session slider at minute 0 and minute N."
   */
  uxNotes?: string;
}
