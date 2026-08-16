/**
 * Safety gate specification for protocols.
 *
 * Encodes:
 * - Contraindications and their severity
 * - Volume calibration / photosensitivity checks
 * - Session limits (per day / per week)
 * - Emergency escalation copy
 *
 * RVP:
 * - This is for *front-end gating*, not medical triage.
 * - Never let this replace physician judgement or emergency care.
 */

export type RiskSeverity = 'mild' | 'moderate' | 'severe';

/**
 * A single contraindication item that may hard-block or warn a protocol.
 */
export interface ContraindicationSpec {
  /** Stable id, e.g., "epilepsy", "bipolar-mania", "active-psychosis". */
  id: string;
  /** Human-readable description shown to the user. */
  description: string;
  /** Severity of risk if protocol is used despite this contraindication. */
  severity: RiskSeverity;
  /**
   * If true, user cannot proceed without explicitly overriding in dev/debug builds.
   * In production, hard-blocking protocols for severe conditions is recommended.
   */
  hardBlock: boolean;
  /**
   * Short rationale to show in advanced help / docs.
   * Example: "40 Hz gamma + flicker may increase seizure risk in photosensitive epilepsy."
   */
  rationale?: string;
}

/**
 * Volume calibration requirements prior to running protocol.
 */
export interface VolumeCalibrationSpec {
  /** Whether this protocol requires explicit pre-session volume calibration. */
  required: boolean;
  /** Reference tone frequency (Hz), usually 440 or 1000 Hz. */
  referenceToneHz: number;
  /**
   * Optional target SPL (dB) range this protocol is designed around.
   * UI should phrase this qualitatively ("comfortable, clearly audible, not loud").
   */
  targetSPLdBMin?: number;
  targetSPLdBMax?: number;
  /** Additional guidance (e.g., "You should still hear room sounds over the tone."). */
  instructions?: string;
}

/**
 * Photosensitivity / seizure screening prior to protocols with strong rhythmic content.
 */
export interface PhotosensitivityCheckSpec {
  /** Whether we must present a photosensitivity / seizure warning for this protocol. */
  required: boolean;
  /**
   * Question(s) we ask to screen for risk (e.g., "Have you ever had a seizure triggered by light or sound?").
   */
  questionText: string;
  /**
   * If true, an affirmative answer should hard-block the protocol in production builds.
   */
  blockOnPositive: boolean;
  /**
   * Whether to show epilepsy.org-style safety guidance and direct users to consult a physician.
   */
  showEpilepsyWarning: boolean;
}

/**
 * Session-level limits intended to avoid overuse and nervous system overload.
 */
export interface SessionLimits {
  /** Max minutes for a single session of this protocol. */
  maxMinutesPerSession?: number;
  /** Max minutes across all sessions of this protocol per day. */
  maxMinutesPerDay?: number;
  /** Max number of sessions per day. */
  maxSessionsPerDay?: number;
  /** Recommended minimum cool-down period in minutes before re-running. */
  minCoolDownMinutes?: number;
}

/**
 * Safety gating configuration for a single protocol id.
 */
export interface ProtocolSafetyGateSpec {
  /** Must match Protocol.id in constants.ts. */
  protocolId: string;

  /** Optional minimum age; useful for protocols with strong content or altered states. */
  minAgeYears?: number;

  /** Overall severity classification for this protocol (mirrors constants.ts field). */
  overallRiskSeverity?: RiskSeverity;

  /** Contraindications relevant to this specific protocol. */
  contraindications: ContraindicationSpec[];

  /** Volume calibration settings, if any. */
  volumeCalibration: VolumeCalibrationSpec;

  /** Photosensitivity / seizure screening requirements. */
  photosensitivity: PhotosensitivityCheckSpec;

  /** Session limits for safety and progressive loading. */
  sessionLimits?: SessionLimits;

  /**
   * Emergency / escalation copy to reuse across UI (bottom sheet, modal, etc.).
   * Example: "If you experience chest pain, confusion, or suicidal thoughts, stop immediately and contact emergency services."
   */
  emergencyCopy: string;
}
