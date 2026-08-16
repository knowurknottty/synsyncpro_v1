/**
 * Module 17: Photosensitivity Safety Screener
 * 
 * Pre-protocol questionnaire screens for photosensitive epilepsy, flicker sensitivity,
 * and seizure history. Gates access to visual entrainment (if implemented).
 * 
 * Evidence Grade: [✅Established]
 * Source: epilepsy.com/photosensitivity - Tier 1 evidence
 * 
 * @module PhotosensitivitySafetyScreener
 * @group Group 7: User Experience & Safety
 */

/**
 * Risk level classification based on screening responses
 */
export type RiskLevel = 'HIGH_RISK' | 'MODERATE_RISK' | 'LOW_RISK';

/**
 * User responses to photosensitivity screening questions
 */
export interface UserResponses {
  /** Q1: Have you ever had a seizure or been diagnosed with epilepsy? */
  q1_seizure_history: boolean;
  /** Q2: Does anyone in your immediate family have epilepsy or photosensitive epilepsy? */
  q2_family_epilepsy: boolean;
  /** Q3: Have you experienced discomfort from flashing lights? */
  q3_flicker_sensitivity: boolean;
  /** Q4: Are you currently taking anti-seizure medication? */
  q4_medication: boolean;
  /** Q5: Are you between ages 7-19? (peak photosensitivity age range) */
  q5_age: boolean;
}

/**
 * Complete photosensitivity screening result with risk assessment
 */
export interface PhotosensitivityScreening {
  /** User's responses to screening questions */
  userResponses: UserResponses;
  /** Calculated risk level */
  riskLevel: RiskLevel;
  /** Whether visual protocols are allowed */
  visualProtocolsAllowed: boolean;
  /** Whether user must use audio-only protocols */
  audioOnlyRequired: boolean;
  /** Whether medical clearance is required before visual protocol access */
  medicalClearanceRequired: boolean;
  /** Timestamp when screening was completed */
  timestamp: number;
  /** Schema version for future compatibility */
  version: number;
}

/**
 * Constants for screening logic
 */
const SCREENING_VERSION = 1;
const STORAGE_KEY = 'synsync_photosensitivity_screening';
const EXPIRATION_DAYS = 90;
const EXPIRATION_MS = EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

/**
 * Photosensitivity Safety Screener
 * 
 * Implements evidence-based risk assessment for photosensitive seizure risk.
 * Conservative gating approach: better to over-protect than under-protect.
 */
export class PhotosensitivitySafetyScreener {
  /**
   * Assess risk level based on user responses
   * 
   * Risk Logic:
   * - HIGH_RISK: Any 'Yes' to Q1 (seizure history) → BLOCK all visual entrainment
   * - MODERATE_RISK: 2+ 'Yes' to Q2-Q5 → WARNING + require medical clearance
   * - LOW_RISK: 0-1 'Yes' to Q2-Q5 → ALLOW with standard warnings
   * 
   * @param responses - User's answers to screening questions
   * @returns Complete screening result with risk assessment
   */
  static assessRisk(responses: UserResponses): PhotosensitivityScreening {
    // Q1: Seizure history = immediate HIGH_RISK
    if (responses.q1_seizure_history) {
      return {
        userResponses: responses,
        riskLevel: 'HIGH_RISK',
        visualProtocolsAllowed: false,
        audioOnlyRequired: true,
        medicalClearanceRequired: true,
        timestamp: Date.now(),
        version: SCREENING_VERSION,
      };
    }

    // Count MODERATE_RISK factors (Q2-Q5)
    const moderateRiskCount = [
      responses.q2_family_epilepsy,
      responses.q3_flicker_sensitivity,
      responses.q4_medication,
      responses.q5_age,
    ].filter(Boolean).length;

    if (moderateRiskCount >= 2) {
      return {
        userResponses: responses,
        riskLevel: 'MODERATE_RISK',
        visualProtocolsAllowed: false, // Require clearance first
        audioOnlyRequired: false,
        medicalClearanceRequired: true,
        timestamp: Date.now(),
        version: SCREENING_VERSION,
      };
    }

    // LOW_RISK: 0-1 moderate risk factors
    return {
      userResponses: responses,
      riskLevel: 'LOW_RISK',
      visualProtocolsAllowed: true,
      audioOnlyRequired: false,
      medicalClearanceRequired: false,
      timestamp: Date.now(),
      version: SCREENING_VERSION,
    };
  }

  /**
   * Generate user-facing warning message based on risk level
   * 
   * @param screening - Screening result
   * @returns Warning message with actionable guidance
   */
  static generateWarningMessage(screening: PhotosensitivityScreening): string {
    if (screening.riskLevel === 'HIGH_RISK') {
      return `⚠️ SEIZURE RISK DETECTED\n\nBased on your responses, you may be at risk for photosensitive seizures. Visual entrainment protocols are BLOCKED for your safety.\n\nYou can use audio-only binaural beat protocols.\n\nConsult a neurologist before using visual stimulation.\n\nSource: epilepsy.com/photosensitivity`;
    }

    if (screening.riskLevel === 'MODERATE_RISK') {
      return `⚠️ MODERATE PHOTOSENSITIVITY RISK\n\nBased on your responses, you may have increased sensitivity to flashing lights.\n\nVisual protocols are locked until you obtain medical clearance.\n\nYou can use audio-only protocols without restriction.\n\nConsult your doctor before proceeding with visual entrainment.\n\nSource: epilepsy.com/photosensitivity`;
    }

    // LOW_RISK
    return `✓ Low photosensitivity risk detected.\n\nYou may use visual protocols with standard precautions:\n• Stop immediately if you experience dizziness, discomfort, or visual disturbances\n• Avoid flicker rates 3-30 Hz (HIGH RISK range)\n• Use >30 Hz or <3 Hz flicker only\n\nSource: epilepsy.com/photosensitivity`;
  }

  /**
   * Check if re-screening is required
   * 
   * Re-screening triggers:
   * - No previous screening exists
   * - 90 days have elapsed since last screening
   * - Schema version mismatch (questions changed)
   * 
   * @param previous - Previous screening result (if exists)
   * @returns True if user needs to complete screening
   */
  static shouldReScreen(previous: PhotosensitivityScreening | null): boolean {
    if (!previous) return true;

    // Check expiration (90 days)
    const now = Date.now();
    const elapsed = now - previous.timestamp;
    if (elapsed > EXPIRATION_MS) return true;

    // Check version mismatch
    if (previous.version !== SCREENING_VERSION) return true;

    return false;
  }

  /**
   * Load screening result from localStorage
   * 
   * Privacy: Results stored locally only, never transmitted to server.
   * 
   * @returns Previous screening result or null if not found/expired
   */
  static loadScreeningFromStorage(): PhotosensitivityScreening | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const screening: PhotosensitivityScreening = JSON.parse(stored);

      // Validate structure
      if (!screening.userResponses || !screening.riskLevel || !screening.timestamp) {
        console.warn('[PhotosensitivityScreener] Invalid stored screening, will re-screen');
        return null;
      }

      return screening;
    } catch (error) {
      console.error('[PhotosensitivityScreener] Failed to load screening from storage:', error);
      return null;
    }
  }

  /**
   * Save screening result to localStorage
   * 
   * @param screening - Screening result to persist
   */
  static saveScreeningToStorage(screening: PhotosensitivityScreening): void {
    try {
      const serialized = JSON.stringify(screening);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      console.error('[PhotosensitivityScreener] Failed to save screening to storage:', error);
    }
  }

  /**
   * Clear screening result from localStorage
   * (e.g., for testing or user-initiated reset)
   */
  static clearScreening(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Get days until re-screening required
   * 
   * @param screening - Current screening result
   * @returns Days remaining, or 0 if expired
   */
  static getDaysUntilReScreen(screening: PhotosensitivityScreening): number {
    const now = Date.now();
    const elapsed = now - screening.timestamp;
    const remaining = EXPIRATION_MS - elapsed;

    if (remaining <= 0) return 0;

    return Math.ceil(remaining / (24 * 60 * 60 * 1000));
  }
}
