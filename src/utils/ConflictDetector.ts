/**
 * Conflict Detector Utility
 *
 * Detects overlapping session times across multiple protocol plans
 */

import type { SessionRecord } from '../types/plan';

export interface SessionConflict {
  session1: SessionRecord;
  session2: SessionRecord;
  severity: 'overlap' | 'close'; // overlap = same time, close = within 30 min
  timeDifferenceMinutes: number;
}

/**
 * Detect conflicts between sessions across multiple plans
 */
export function detectConflicts(
  allSessions: SessionRecord[],
  windowMinutes: number = 30
): SessionConflict[] {
  const conflicts: SessionConflict[] = [];

  // Sort sessions by scheduled time
  const sorted = [...allSessions].sort(
    (a, b) => a.scheduled_time - b.scheduled_time
  );

  // Check each pair of sessions
  for (let i = 0; i < sorted.length - 1; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const session1 = sorted[i];
      const session2 = sorted[j];

      // Skip if same plan (internal conflicts handled separately)
      if (session1.plan_id === session2.plan_id) {
        continue;
      }

      // Skip if not pending
      if (session1.status !== 'pending' || session2.status !== 'pending') {
        continue;
      }

      const timeDiff = Math.abs(
        session2.scheduled_time - session1.scheduled_time
      );
      const diffMinutes = timeDiff / (1000 * 60);

      // If sessions are far apart, no need to check further
      if (diffMinutes > windowMinutes) {
        break; // Since sorted, no more conflicts for session1
      }

      // Determine severity
      const severity: 'overlap' | 'close' =
        diffMinutes === 0 ? 'overlap' : 'close';

      conflicts.push({
        session1,
        session2,
        severity,
        timeDifferenceMinutes: diffMinutes,
      });
    }
  }

  return conflicts;
}

/**
 * Check if a new session would conflict with existing sessions
 */
export function checkSessionConflict(
  newSession: SessionRecord,
  existingSessions: SessionRecord[],
  windowMinutes: number = 30
): SessionConflict | null {
  for (const existing of existingSessions) {
    // Skip if same session
    if (existing.id === newSession.id) {
      continue;
    }

    // Skip if not pending
    if (existing.status !== 'pending') {
      continue;
    }

    const timeDiff = Math.abs(
      existing.scheduled_time - newSession.scheduled_time
    );
    const diffMinutes = timeDiff / (1000 * 60);

    if (diffMinutes <= windowMinutes) {
      const severity: 'overlap' | 'close' =
        diffMinutes === 0 ? 'overlap' : 'close';

      return {
        session1: newSession,
        session2: existing,
        severity,
        timeDifferenceMinutes: diffMinutes,
      };
    }
  }

  return null;
}

/**
 * Get conflicts for a specific plan
 */
export function getConflictsForPlan(
  planId: string,
  allSessions: SessionRecord[],
  windowMinutes: number = 30
): SessionConflict[] {
  const allConflicts = detectConflicts(allSessions, windowMinutes);

  return allConflicts.filter(
    (conflict) =>
      conflict.session1.plan_id === planId ||
      conflict.session2.plan_id === planId
  );
}

/**
 * Get conflicts for a specific day
 */
export function getConflictsForDay(
  date: Date,
  allSessions: SessionRecord[],
  windowMinutes: number = 30
): SessionConflict[] {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const daySessions = allSessions.filter(
    (s) =>
      s.scheduled_time >= dayStart.getTime() &&
      s.scheduled_time < dayEnd.getTime()
  );

  return detectConflicts(daySessions, windowMinutes);
}

/**
 * Format conflict message for display
 */
export function formatConflictMessage(conflict: SessionConflict): string {
  const time1 = new Date(conflict.session1.scheduled_time).toLocaleTimeString(
    undefined,
    {
      hour: 'numeric',
      minute: '2-digit',
    }
  );

  const time2 = new Date(conflict.session2.scheduled_time).toLocaleTimeString(
    undefined,
    {
      hour: 'numeric',
      minute: '2-digit',
    }
  );

  if (conflict.severity === 'overlap') {
    return `Two sessions scheduled at ${time1}: ${conflict.session1.protocol_id} and ${conflict.session2.protocol_id}`;
  } else {
    return `Sessions too close: ${conflict.session1.protocol_id} at ${time1} and ${conflict.session2.protocol_id} at ${time2} (${Math.round(conflict.timeDifferenceMinutes)} min apart)`;
  }
}

/**
 * Suggest alternative times to resolve conflict
 */
export function suggestAlternativeTimes(
  conflict: SessionConflict,
  allSessions: SessionRecord[]
): Date[] {
  const alternatives: Date[] = [];
  const baseTime = new Date(conflict.session1.scheduled_time);

  // Try times before and after
  const offsets = [-120, -90, -60, 60, 90, 120]; // Minutes

  for (const offset of offsets) {
    const altTime = new Date(baseTime.getTime() + offset * 60 * 1000);

    // Check if this time conflicts
    const testSession: SessionRecord = {
      ...conflict.session1,
      scheduled_time: altTime.getTime(),
    };

    const hasConflict = checkSessionConflict(testSession, allSessions, 30);

    if (!hasConflict) {
      alternatives.push(altTime);
    }

    // Stop after finding 3 alternatives
    if (alternatives.length >= 3) {
      break;
    }
  }

  return alternatives;
}

/**
 * Calculate conflict score for a plan (higher = more conflicts)
 */
export function calculateConflictScore(
  planId: string,
  allSessions: SessionRecord[]
): number {
  const conflicts = getConflictsForPlan(planId, allSessions);

  let score = 0;

  for (const conflict of conflicts) {
    if (conflict.severity === 'overlap') {
      score += 10; // Severe
    } else {
      score += Math.max(1, 5 - conflict.timeDifferenceMinutes / 10); // Less severe as time difference increases
    }
  }

  return Math.round(score);
}
