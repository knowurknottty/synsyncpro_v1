/**
 * Session Launcher Service
 *
 * Launches protocol sessions with plan-specific overrides
 * Records session start time and applies settings from plan
 */

import type { PlanSession, SessionRecord } from '../types/plan';
import { PROTOCOLS } from '../audio/constants';
import { saveSession } from './PlanDatabase';

export interface LaunchOptions {
  planId: string;
  sessionRecord: SessionRecord;
  planSession: PlanSession;
}

export interface SessionSettings {
  protocolId: string;
  volume?: number;
  complexity?: 'low' | 'medium' | 'high';
  durationMinutes?: number;
  customSettings?: Record<string, any>;
}

/**
 * Prepare session for launch
 * Extracts protocol and applies plan overrides
 */
export function prepareSessionLaunch(
  planSession: PlanSession
): SessionSettings | null {
  const protocol = PROTOCOLS[planSession.protocol_id];

  if (!protocol) {
    console.error(`Protocol not found: ${planSession.protocol_id}`);
    return null;
  }

  const settings: SessionSettings = {
    protocolId: planSession.protocol_id,
  };

  // Apply volume override
  if (planSession.settings?.volume !== undefined) {
    settings.volume = planSession.settings.volume;
  }

  // Apply complexity override
  if (planSession.settings?.complexity) {
    settings.complexity = planSession.settings.complexity;
  }

  // Apply duration override
  if (planSession.duration_override_minutes) {
    settings.durationMinutes = planSession.duration_override_minutes;
  } else {
    settings.durationMinutes = Math.round(protocol.duration / 60);
  }

  // Apply custom settings
  if (planSession.settings) {
    const { volume, complexity, ...customSettings } = planSession.settings;
    if (Object.keys(customSettings).length > 0) {
      settings.customSettings = customSettings;
    }
  }

  return settings;
}

/**
 * Launch a session and record start time
 */
export async function launchSession(
  sessionRecord: SessionRecord,
  planSession: PlanSession
): Promise<SessionSettings | null> {
  const settings = prepareSessionLaunch(planSession);

  if (!settings) {
    return null;
  }

  // Update session record with actual start time
  sessionRecord.actual_start_time = Date.now();
  sessionRecord.status = 'completed'; // Will be updated when session completes
  sessionRecord.updated_at = Date.now();

  await saveSession(sessionRecord);

  return settings;
}

/**
 * Complete a session and record end time
 */
export async function completeSession(
  sessionRecord: SessionRecord,
  actualDurationSeconds: number
): Promise<void> {
  sessionRecord.actual_end_time = Date.now();
  sessionRecord.duration_seconds = actualDurationSeconds;
  sessionRecord.status = 'completed';
  sessionRecord.updated_at = Date.now();

  await saveSession(sessionRecord);
}

/**
 * Skip a session with reason
 */
export async function skipSession(
  sessionRecord: SessionRecord,
  reason?: string
): Promise<void> {
  sessionRecord.status = 'skipped';
  sessionRecord.skip_reason = reason;
  sessionRecord.updated_at = Date.now();

  await saveSession(sessionRecord);
}

/**
 * Mark session as missed
 */
export async function markSessionMissed(
  sessionRecord: SessionRecord
): Promise<void> {
  sessionRecord.status = 'missed';
  sessionRecord.updated_at = Date.now();

  await saveSession(sessionRecord);
}

/**
 * Manually mark session as complete (for missed sessions)
 */
export async function manuallyCompleteSession(
  sessionRecord: SessionRecord,
  reason: string,
  actualTime?: Date
): Promise<void> {
  const completionTime = actualTime ? actualTime.getTime() : Date.now();

  sessionRecord.status = 'completed';
  sessionRecord.actual_start_time = completionTime;
  sessionRecord.actual_end_time = completionTime;
  sessionRecord.notes = sessionRecord.notes
    ? `${sessionRecord.notes}\n\nManually marked complete: ${reason}`
    : `Manually marked complete: ${reason}`;
  sessionRecord.updated_at = Date.now();

  await saveSession(sessionRecord);
}

/**
 * Calculate recommended break time before next session
 */
export function calculateBreakTime(
  currentSessionDuration: number,
  nextSessionTime?: number
): number {
  // Recommended break: 10% of session duration, minimum 5 minutes
  const recommendedBreak = Math.max(
    5 * 60 * 1000, // 5 minutes minimum
    currentSessionDuration * 0.1
  );

  // If next session scheduled soon, return time until next session
  if (nextSessionTime) {
    const timeUntilNext = nextSessionTime - Date.now();
    return Math.min(recommendedBreak, timeUntilNext);
  }

  return recommendedBreak;
}

/**
 * Get session launch instructions from plan
 */
export function getSessionInstructions(planSession: PlanSession): {
  before: string;
  during: string;
  after: string;
} {
  // These would come from the plan's instructions field
  // For now, return defaults
  return {
    before:
      'Find a quiet, comfortable place. Put on your headphones. Take a few deep breaths.',
    during:
      'Relax and let the audio guide you. You may close your eyes or keep them softly focused.',
    after:
      'Take your time returning to normal awareness. Drink water and note any observations.',
  };
}
