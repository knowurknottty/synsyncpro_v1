/**
 * Adherence Calculator Utility
 *
 * Calculates adherence rates, streaks, and compliance metrics
 */

import type { SessionRecord } from '../types/plan';

export interface AdherenceMetrics {
  overallRate: number; // 0-100
  weeklyRate: number; // Last 7 days
  monthlyRate: number; // Last 30 days
  currentStreak: number; // Consecutive days with sessions
  longestStreak: number;
  totalCompleted: number;
  totalScheduled: number;
  totalMissed: number;
  totalSkipped: number;
}

/**
 * Calculate comprehensive adherence metrics
 */
export function calculateAdherence(sessions: SessionRecord[]): AdherenceMetrics {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  // Filter out future sessions
  const pastSessions = sessions.filter((s) => s.scheduled_time <= now);

  // Overall stats
  const completed = pastSessions.filter((s) => s.status === 'completed');
  const missed = pastSessions.filter((s) => s.status === 'missed');
  const skipped = pastSessions.filter((s) => s.status === 'skipped');

  const overallRate =
    pastSessions.length > 0
      ? Math.round((completed.length / pastSessions.length) * 100)
      : 0;

  // Weekly rate (last 7 days)
  const weekAgo = now - 7 * oneDay;
  const weeklySessions = pastSessions.filter((s) => s.scheduled_time >= weekAgo);
  const weeklyCompleted = weeklySessions.filter(
    (s) => s.status === 'completed'
  ).length;
  const weeklyRate =
    weeklySessions.length > 0
      ? Math.round((weeklyCompleted / weeklySessions.length) * 100)
      : 0;

  // Monthly rate (last 30 days)
  const monthAgo = now - 30 * oneDay;
  const monthlySessions = pastSessions.filter((s) => s.scheduled_time >= monthAgo);
  const monthlyCompleted = monthlySessions.filter(
    (s) => s.status === 'completed'
  ).length;
  const monthlyRate =
    monthlySessions.length > 0
      ? Math.round((monthlyCompleted / monthlySessions.length) * 100)
      : 0;

  // Calculate streaks
  const { currentStreak, longestStreak } = calculateStreaks(pastSessions);

  return {
    overallRate,
    weeklyRate,
    monthlyRate,
    currentStreak,
    longestStreak,
    totalCompleted: completed.length,
    totalScheduled: pastSessions.length,
    totalMissed: missed.length,
    totalSkipped: skipped.length,
  };
}

/**
 * Calculate session streaks (consecutive days)
 */
export function calculateStreaks(sessions: SessionRecord[]): {
  currentStreak: number;
  longestStreak: number;
} {
  // Group sessions by day
  const sessionsByDay = new Map<string, SessionRecord[]>();

  for (const session of sessions) {
    const date = new Date(session.actual_start_time || session.scheduled_time);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString();

    if (!sessionsByDay.has(dateKey)) {
      sessionsByDay.set(dateKey, []);
    }
    sessionsByDay.get(dateKey)!.push(session);
  }

  // Get sorted days
  const days = Array.from(sessionsByDay.keys()).sort();

  let longestStreak = 0;
  let currentStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  for (const dayKey of days) {
    const daySessions = sessionsByDay.get(dayKey)!;
    const hasCompletedSession = daySessions.some((s) => s.status === 'completed');

    if (!hasCompletedSession) {
      continue; // Skip days without completed sessions
    }

    const currentDate = new Date(dayKey);

    if (lastDate) {
      const daysDiff = Math.round(
        (currentDate.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000)
      );

      if (daysDiff === 1) {
        // Consecutive day
        tempStreak++;
      } else {
        // Gap in streak
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }

    lastDate = currentDate;
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  // Check if current streak is active (last session today or yesterday)
  if (lastDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysSinceLast = Math.round(
      (today.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (daysSinceLast === 0 || daysSinceLast === 1) {
      currentStreak = tempStreak;
    } else {
      currentStreak = 0; // Streak broken
    }
  }

  return { currentStreak, longestStreak };
}

/**
 * Calculate adherence by phase
 */
export function calculatePhaseAdherence(
  sessions: SessionRecord[],
  phaseNumber: number
): number {
  // This would require phase information from the plan
  // For now, return overall adherence
  const phaseSessions = sessions; // Filter by phase when implemented
  const completed = phaseSessions.filter((s) => s.status === 'completed').length;
  const total = phaseSessions.length;

  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

/**
 * Calculate adherence by protocol
 */
export function calculateProtocolAdherence(
  sessions: SessionRecord[],
  protocolId: string
): number {
  const protocolSessions = sessions.filter((s) => s.protocol_id === protocolId);
  const completed = protocolSessions.filter((s) => s.status === 'completed').length;
  const total = protocolSessions.length;

  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

/**
 * Get adherence trend over time
 */
export function calculateAdherenceTrend(
  sessions: SessionRecord[],
  intervalDays: number = 7,
  periods: number = 4
): Array<{ period: number; adherence: number }> {
  const now = Date.now();
  const intervalMs = intervalDays * 24 * 60 * 60 * 1000;
  const trend: Array<{ period: number; adherence: number }> = [];

  for (let i = 0; i < periods; i++) {
    const periodEnd = now - i * intervalMs;
    const periodStart = periodEnd - intervalMs;

    const periodSessions = sessions.filter(
      (s) => s.scheduled_time >= periodStart && s.scheduled_time < periodEnd
    );

    const completed = periodSessions.filter((s) => s.status === 'completed').length;
    const total = periodSessions.length;

    trend.push({
      period: periods - i,
      adherence: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  }

  return trend.reverse();
}

/**
 * Predict adherence risk
 */
export function predictAdherenceRisk(metrics: AdherenceMetrics): {
  risk: 'low' | 'medium' | 'high';
  factors: string[];
} {
  const factors: string[] = [];
  let riskScore = 0;

  // Check recent adherence
  if (metrics.weeklyRate < 50) {
    riskScore += 3;
    factors.push('Low weekly adherence');
  } else if (metrics.weeklyRate < 75) {
    riskScore += 1;
    factors.push('Declining weekly adherence');
  }

  // Check streak
  if (metrics.currentStreak === 0) {
    riskScore += 2;
    factors.push('No active streak');
  }

  // Check missed sessions
  const missedRate =
    metrics.totalScheduled > 0
      ? (metrics.totalMissed / metrics.totalScheduled) * 100
      : 0;

  if (missedRate > 30) {
    riskScore += 2;
    factors.push('High missed session rate');
  }

  // Check trend
  if (metrics.weeklyRate < metrics.monthlyRate - 10) {
    riskScore += 1;
    factors.push('Adherence declining');
  }

  // Determine risk level
  let risk: 'low' | 'medium' | 'high';
  if (riskScore >= 5) {
    risk = 'high';
  } else if (riskScore >= 2) {
    risk = 'medium';
  } else {
    risk = 'low';
  }

  return { risk, factors };
}

/**
 * Calculate consistency score (0-100)
 * Measures how consistently sessions are completed on schedule
 */
export function calculateConsistencyScore(sessions: SessionRecord[]): number {
  const completed = sessions.filter((s) => s.status === 'completed');

  if (completed.length === 0) return 0;

  let totalDeviation = 0;

  for (const session of completed) {
    if (!session.actual_start_time) continue;

    const deviation = Math.abs(
      session.actual_start_time - session.scheduled_time
    );
    const deviationMinutes = deviation / (1000 * 60);

    // Penalize deviations, with diminishing returns
    totalDeviation += Math.min(deviationMinutes, 60); // Cap at 60 min
  }

  const avgDeviation = totalDeviation / completed.length;

  // Convert to score (0 deviation = 100, 60+ min = 0)
  const score = Math.max(0, 100 - avgDeviation * (100 / 60));

  return Math.round(score);
}
