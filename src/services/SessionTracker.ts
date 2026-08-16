/**
 * Session Tracker Service
 *
 * Records session completion, stores metrics, and updates plan progress
 */

import type { SessionRecord, MetricRecord } from '../types/plan';
import { saveSession, saveMetric } from './PlanDatabase';

export interface SessionMetrics {
  [metricId: string]: any;
}

export interface SessionCompletionData {
  sessionRecord: SessionRecord;
  preMetrics?: SessionMetrics;
  postMetrics?: SessionMetrics;
  notes?: string;
  actualDurationSeconds: number;
}

/**
 * Record session completion with metrics
 */
export async function recordSessionCompletion(
  data: SessionCompletionData
): Promise<void> {
  const { sessionRecord, preMetrics, postMetrics, notes, actualDurationSeconds } =
    data;

  // Update session record
  sessionRecord.actual_end_time = Date.now();
  sessionRecord.duration_seconds = actualDurationSeconds;
  sessionRecord.status = 'completed';
  sessionRecord.pre_metrics = preMetrics;
  sessionRecord.post_metrics = postMetrics;
  sessionRecord.notes = notes;
  sessionRecord.updated_at = Date.now();

  await saveSession(sessionRecord);

  // Save individual metric records
  if (preMetrics) {
    await saveMetricsToDatabase(
      sessionRecord.plan_id,
      sessionRecord.id,
      preMetrics,
      'pre'
    );
  }

  if (postMetrics) {
    await saveMetricsToDatabase(
      sessionRecord.plan_id,
      sessionRecord.id,
      postMetrics,
      'post'
    );
  }
}

/**
 * Save metrics to database
 */
async function saveMetricsToDatabase(
  planId: string,
  sessionId: string,
  metrics: SessionMetrics,
  timing: 'pre' | 'post'
): Promise<void> {
  const timestamp = Date.now();

  for (const [metricId, value] of Object.entries(metrics)) {
    await saveMetric({
      plan_id: planId,
      metric_id: `${metricId}_${timing}`,
      value,
      timestamp,
      session_id: sessionId,
    });
  }
}

/**
 * Calculate session statistics
 */
export interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  missedSessions: number;
  skippedSessions: number;
  pendingSessions: number;
  totalMinutesCompleted: number;
  averageSessionDuration: number;
  longestStreak: number;
  currentStreak: number;
}

export async function calculateSessionStats(
  planId: string
): Promise<SessionStats> {
  const { getSessionsByPlan } = await import('./PlanDatabase');
  const sessions = await getSessionsByPlan(planId);

  const completed = sessions.filter((s) => s.status === 'completed');
  const missed = sessions.filter((s) => s.status === 'missed');
  const skipped = sessions.filter((s) => s.status === 'skipped');
  const pending = sessions.filter((s) => s.status === 'pending');

  // Calculate total minutes
  const totalSeconds = completed.reduce(
    (sum, s) => sum + (s.duration_seconds || 0),
    0
  );
  const totalMinutes = Math.round(totalSeconds / 60);

  // Calculate average duration
  const avgSeconds =
    completed.length > 0
      ? totalSeconds / completed.length
      : 0;
  const avgMinutes = Math.round(avgSeconds / 60);

  // Calculate streaks
  const { longestStreak, currentStreak } = calculateStreaks(sessions);

  return {
    totalSessions: sessions.length,
    completedSessions: completed.length,
    missedSessions: missed.length,
    skippedSessions: skipped.length,
    pendingSessions: pending.length,
    totalMinutesCompleted: totalMinutes,
    averageSessionDuration: avgMinutes,
    longestStreak,
    currentStreak,
  };
}

/**
 * Calculate session streaks
 */
function calculateStreaks(sessions: SessionRecord[]): {
  longestStreak: number;
  currentStreak: number;
} {
  // Sort by scheduled time
  const sorted = [...sessions].sort((a, b) => a.scheduled_time - b.scheduled_time);

  let longestStreak = 0;
  let currentStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  for (const session of sorted) {
    if (session.status !== 'completed') {
      if (session.scheduled_time < Date.now()) {
        // Missed or skipped session breaks streak
        tempStreak = 0;
      }
      continue;
    }

    const sessionDate = new Date(session.actual_start_time || session.scheduled_time);
    sessionDate.setHours(0, 0, 0, 0);

    if (lastDate) {
      const daysDiff = Math.floor(
        (sessionDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 0) {
        // Same day, continue streak
        tempStreak++;
      } else if (daysDiff === 1) {
        // Consecutive day
        tempStreak++;
      } else {
        // Gap, reset streak
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }

    lastDate = sessionDate;
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  // Current streak is only valid if last session was today or yesterday
  if (lastDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysSinceLast = Math.floor(
      (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLast <= 1) {
      currentStreak = tempStreak;
    } else {
      currentStreak = 0;
    }
  }

  return { longestStreak, currentStreak };
}

/**
 * Get session completion rate by time of day
 */
export async function getCompletionByTimeOfDay(
  planId: string
): Promise<{
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
}> {
  const { getSessionsByPlan } = await import('./PlanDatabase');
  const sessions = await getSessionsByPlan(planId);

  const counts = {
    morning: { completed: 0, total: 0 },
    afternoon: { completed: 0, total: 0 },
    evening: { completed: 0, total: 0 },
    night: { completed: 0, total: 0 },
  };

  for (const session of sessions) {
    const hour = new Date(session.scheduled_time).getHours();

    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    counts[timeOfDay].total++;
    if (session.status === 'completed') {
      counts[timeOfDay].completed++;
    }
  }

  return {
    morning:
      counts.morning.total > 0
        ? Math.round((counts.morning.completed / counts.morning.total) * 100)
        : 0,
    afternoon:
      counts.afternoon.total > 0
        ? Math.round((counts.afternoon.completed / counts.afternoon.total) * 100)
        : 0,
    evening:
      counts.evening.total > 0
        ? Math.round((counts.evening.completed / counts.evening.total) * 100)
        : 0,
    night:
      counts.night.total > 0
        ? Math.round((counts.night.completed / counts.night.total) * 100)
        : 0,
  };
}

/**
 * Get weekly adherence data
 */
export async function getWeeklyAdherence(
  planId: string,
  weeks: number = 4
): Promise<Array<{ week: number; adherence: number }>> {
  const { getSessionsByPlan } = await import('./PlanDatabase');
  const sessions = await getSessionsByPlan(planId);

  const weeklyData: Array<{ week: number; adherence: number }> = [];
  const now = Date.now();

  for (let week = 0; week < weeks; week++) {
    const weekStart = now - (week + 1) * 7 * 24 * 60 * 60 * 1000;
    const weekEnd = now - week * 7 * 24 * 60 * 60 * 1000;

    const weekSessions = sessions.filter(
      (s) => s.scheduled_time >= weekStart && s.scheduled_time < weekEnd
    );

    const completed = weekSessions.filter((s) => s.status === 'completed').length;
    const total = weekSessions.length;

    weeklyData.push({
      week: weeks - week,
      adherence: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  }

  return weeklyData.reverse();
}

/**
 * Get metric trends over time
 */
export async function getMetricTrend(
  planId: string,
  metricId: string,
  days: number = 30
): Promise<Array<{ date: Date; value: any }>> {
  const { getMetricHistory } = await import('./PlanDatabase');
  const metrics = await getMetricHistory(planId, metricId);

  const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
  const recentMetrics = metrics.filter((m) => m.timestamp >= cutoffTime);

  return recentMetrics
    .map((m) => ({
      date: new Date(m.timestamp),
      value: m.value,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}
