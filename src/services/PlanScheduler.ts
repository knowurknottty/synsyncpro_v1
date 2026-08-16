/**
 * Plan Scheduler Service
 *
 * Generates calendar events from protocol plan phases and sessions
 * Handles frequency types, time windows, and rest days
 */

import { addDays, addWeeks, setHours, setMinutes, startOfDay } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import type { ProtocolPlan, PlanSession, SessionRecord } from '../types/plan';
import { saveSession } from '../services/PlanDatabase';
import { generateSessionId } from '../utils/SecurityUtils';

interface ScheduleOptions {
  startDate?: Date;
  timezone?: string;
}

/**
 * Generate all session records for a protocol plan
 */
export async function generatePlanSchedule(
  plan: ProtocolPlan,
  options: ScheduleOptions = {}
): Promise<SessionRecord[]> {
  const startDate = options.startDate || new Date();
  const timezone = options.timezone || plan.schedule.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const sessionRecords: SessionRecord[] = [];

  // Process each phase
  for (const phase of plan.schedule.phases) {
    const phaseStartDate = addDays(startDate, phase.start_day - 1);

    // Generate sessions for this phase
    for (const session of phase.sessions) {
      const sessions = generateSessionsForPhase(
        plan,
        phase.phase_number,
        session,
        phaseStartDate,
        phase.duration_days,
        phase.rest_days || [],
        timezone
      );

      sessionRecords.push(...sessions);
    }
  }

  // Save all sessions to database
  if (plan._id) {
    for (const session of sessionRecords) {
      await saveSession(session);
    }
  }

  return sessionRecords;
}

/**
 * Generate session records for a single session within a phase
 */
function generateSessionsForPhase(
  plan: ProtocolPlan,
  phaseNumber: number,
  session: PlanSession,
  phaseStartDate: Date,
  phaseDurationDays: number,
  restDays: number[],
  timezone: string
): SessionRecord[] {
  const sessions: SessionRecord[] = [];

  switch (session.frequency) {
    case 'daily':
      // Every day for the phase duration
      for (let day = 0; day < phaseDurationDays; day++) {
        const sessionDate = addDays(phaseStartDate, day);

        // Skip rest days
        if (restDays.includes(sessionDate.getDay())) {
          continue;
        }

        sessions.push(
          createSessionRecord(plan, phaseNumber, session, sessionDate, timezone)
        );
      }
      break;

    case '2x_per_day':
      // Two sessions per day
      for (let day = 0; day < phaseDurationDays; day++) {
        const sessionDate = addDays(phaseStartDate, day);

        if (restDays.includes(sessionDate.getDay())) {
          continue;
        }

        // Morning session
        sessions.push(
          createSessionRecord(
            plan,
            phaseNumber,
            { ...session, time_of_day: 'morning' },
            sessionDate,
            timezone
          )
        );

        // Evening session
        sessions.push(
          createSessionRecord(
            plan,
            phaseNumber,
            { ...session, time_of_day: 'evening' },
            sessionDate,
            timezone
          )
        );
      }
      break;

    case '3x_per_week':
      // Three times per week (Mon/Wed/Fri)
      const targetDays = [1, 3, 5]; // Monday, Wednesday, Friday
      for (let day = 0; day < phaseDurationDays; day++) {
        const sessionDate = addDays(phaseStartDate, day);

        if (!targetDays.includes(sessionDate.getDay())) {
          continue;
        }

        if (restDays.includes(sessionDate.getDay())) {
          continue;
        }

        sessions.push(
          createSessionRecord(plan, phaseNumber, session, sessionDate, timezone)
        );
      }
      break;

    case 'weekly':
      // Once per week
      const weeksInPhase = Math.ceil(phaseDurationDays / 7);
      for (let week = 0; week < weeksInPhase; week++) {
        const sessionDate = addWeeks(phaseStartDate, week);

        if (restDays.includes(sessionDate.getDay())) {
          // Try next day
          const nextDay = addDays(sessionDate, 1);
          if (!restDays.includes(nextDay.getDay())) {
            sessions.push(
              createSessionRecord(plan, phaseNumber, session, nextDay, timezone)
            );
          }
        } else {
          sessions.push(
            createSessionRecord(plan, phaseNumber, session, sessionDate, timezone)
          );
        }
      }
      break;

    case 'as_needed':
      // Don't auto-schedule, user initiates
      break;
  }

  return sessions;
}

/**
 * Create a session record with scheduled time
 */
function createSessionRecord(
  plan: ProtocolPlan,
  phaseNumber: number,
  session: PlanSession,
  date: Date,
  timezone: string
): SessionRecord {
  // Determine time of day
  let scheduledTime = startOfDay(date);

  if (session.preferred_time) {
    // Parse HH:MM format
    const [hours, minutes] = session.preferred_time.split(':').map(Number);
    scheduledTime = setHours(setMinutes(scheduledTime, minutes), hours);
  } else {
    // Use default times based on time_of_day
    const defaultTimes = {
      morning: [8, 0],
      afternoon: [14, 0],
      evening: [19, 0],
      night: [22, 0],
    };

    const [hours, minutes] = defaultTimes[session.time_of_day || 'morning'];
    scheduledTime = setHours(setMinutes(scheduledTime, minutes), hours);
  }

  // Convert to UTC for storage
  const scheduledTimeUTC = fromZonedTime(scheduledTime, timezone);

  return {
    id: generateSessionId(),
    plan_id: plan._id || '',
    session_id: session.session_id,
    protocol_id: session.protocol_id,
    scheduled_time: scheduledTimeUTC.getTime(),
    status: 'pending',
    created_at: Date.now(),
    updated_at: Date.now(),
  };
}

/**
 * Get upcoming sessions for a plan
 */
export async function getUpcomingSessions(
  planId: string,
  limit: number = 10
): Promise<SessionRecord[]> {
  const { getSessionsByPlan } = await import('./PlanDatabase');
  const sessions = await getSessionsByPlan(planId);

  const now = Date.now();
  const upcoming = sessions
    .filter((s) => s.status === 'pending' && s.scheduled_time >= now)
    .sort((a, b) => a.scheduled_time - b.scheduled_time)
    .slice(0, limit);

  return upcoming;
}

/**
 * Get sessions for a specific day
 */
export async function getSessionsForDay(
  planId: string,
  date: Date,
  timezone: string
): Promise<SessionRecord[]> {
  const { getSessionsByPlan } = await import('./PlanDatabase');
  const sessions = await getSessionsByPlan(planId);

  // Get start and end of day in the specified timezone
  const dayStart = startOfDay(fromZonedTime(startOfDay(date), timezone));
  const dayEnd = addDays(dayStart, 1);

  const daySessions = sessions.filter(
    (s) => s.scheduled_time >= dayStart.getTime() && s.scheduled_time < dayEnd.getTime()
  );

  return daySessions.sort((a, b) => a.scheduled_time - b.scheduled_time);
}

/**
 * Get all sessions for a date range
 */
export async function getSessionsInRange(
  planId: string,
  startDate: Date,
  endDate: Date,
  timezone: string
): Promise<SessionRecord[]> {
  const { getSessionsByPlan } = await import('./PlanDatabase');
  const sessions = await getSessionsByPlan(planId);

  const rangeStart = fromZonedTime(startOfDay(startDate), timezone);
  const rangeEnd = fromZonedTime(startOfDay(addDays(endDate, 1)), timezone);

  const rangeSessions = sessions.filter(
    (s) =>
      s.scheduled_time >= rangeStart.getTime() &&
      s.scheduled_time < rangeEnd.getTime()
  );

  return rangeSessions.sort((a, b) => a.scheduled_time - b.scheduled_time);
}

/**
 * Check if a session is within its time window
 */
export function isSessionWithinWindow(
  session: SessionRecord,
  currentTime: Date,
  windowMinutes: number = 30
): boolean {
  const scheduledTime = new Date(session.scheduled_time);
  const timeDiff = Math.abs(currentTime.getTime() - scheduledTime.getTime());
  const diffMinutes = timeDiff / (1000 * 60);

  return diffMinutes <= windowMinutes;
}

/**
 * Mark past pending sessions as missed
 */
export async function markMissedSessions(planId: string): Promise<number> {
  const { getSessionsByPlan, saveSession } = await import('./PlanDatabase');
  const sessions = await getSessionsByPlan(planId);

  const now = Date.now();
  let markedCount = 0;

  for (const session of sessions) {
    if (session.status === 'pending' && session.scheduled_time < now - 3600000) {
      // Missed if more than 1 hour past scheduled time
      session.status = 'missed';
      session.updated_at = Date.now();
      await saveSession(session);
      markedCount++;
    }
  }

  return markedCount;
}

/**
 * Reschedule a session
 */
export async function rescheduleSession(
  sessionId: string,
  newTime: Date,
  timezone: string
): Promise<void> {
  const { getSession, saveSession } = await import('./PlanDatabase');
  const session = await getSession(sessionId);

  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  const newTimeUTC = fromZonedTime(newTime, timezone);
  session.scheduled_time = newTimeUTC.getTime();
  session.updated_at = Date.now();

  await saveSession(session);
}

/**
 * Get session statistics for a plan
 */
export async function getSessionStats(planId: string): Promise<{
  total: number;
  completed: number;
  pending: number;
  missed: number;
  skipped: number;
  adherence: number;
}> {
  const { getSessionsByPlan } = await import('./PlanDatabase');
  const sessions = await getSessionsByPlan(planId);

  const total = sessions.length;
  const completed = sessions.filter((s) => s.status === 'completed').length;
  const pending = sessions.filter((s) => s.status === 'pending').length;
  const missed = sessions.filter((s) => s.status === 'missed').length;
  const skipped = sessions.filter((s) => s.status === 'skipped').length;

  const adherence =
    total > 0 ? Math.round((completed / (total - pending)) * 100) : 0;

  return { total, completed, pending, missed, skipped, adherence };
}
