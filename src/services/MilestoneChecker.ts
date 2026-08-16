/**
 * Milestone Checker Service
 *
 * Checks if milestones are achieved after each session
 * Tracks milestone completion and triggers celebrations
 */

import type { ProtocolPlan, Milestone, SessionRecord } from '../types/plan';
import { logAudit } from './PlanDatabase';

export interface AchievedMilestone {
  milestone: Milestone;
  achievedAt: number;
  planId: string;
}

/**
 * Check all milestones for a plan
 */
export async function checkMilestones(
  plan: ProtocolPlan,
  sessions: SessionRecord[]
): Promise<AchievedMilestone[]> {
  const achieved: AchievedMilestone[] = [];

  if (!plan.tracking?.milestones) {
    return achieved;
  }

  const now = Date.now();
  const startDate = plan.schedule.start_date
    ? new Date(plan.schedule.start_date)
    : new Date(plan._imported_at || now);

  const daysSinceStart = Math.floor(
    (now - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  for (const milestone of plan.tracking.milestones) {
    const isAchieved = checkMilestone(milestone, sessions, daysSinceStart);

    if (isAchieved) {
      // Check if already recorded
      const alreadyRecorded = await isMilestoneRecorded(
        plan._id!,
        milestone.milestone_id
      );

      if (!alreadyRecorded) {
        achieved.push({
          milestone,
          achievedAt: now,
          planId: plan._id!,
        });

        // Record milestone achievement
        await recordMilestoneAchievement(plan._id!, milestone.milestone_id);
      }
    }
  }

  return achieved;
}

/**
 * Check if a single milestone is achieved
 */
function checkMilestone(
  milestone: Milestone,
  sessions: SessionRecord[],
  daysSinceStart: number
): boolean {
  // Check day-based milestones
  if (milestone.day !== undefined) {
    return daysSinceStart >= milestone.day;
  }

  // Check session-based milestones
  if (milestone.required_sessions !== undefined) {
    const completedCount = sessions.filter(
      (s) => s.status === 'completed'
    ).length;
    return completedCount >= milestone.required_sessions;
  }

  return false;
}

/**
 * Check if milestone already recorded
 */
async function isMilestoneRecorded(
  planId: string,
  milestoneId: string
): Promise<boolean> {
  // Check localStorage for recorded milestones
  const key = `synsync_milestones_${planId}`;
  const stored = localStorage.getItem(key);

  if (!stored) return false;

  try {
    const milestones: string[] = JSON.parse(stored);
    return milestones.includes(milestoneId);
  } catch {
    return false;
  }
}

/**
 * Record milestone achievement
 */
async function recordMilestoneAchievement(
  planId: string,
  milestoneId: string
): Promise<void> {
  const key = `synsync_milestones_${planId}`;
  const stored = localStorage.getItem(key);

  let milestones: string[] = [];

  if (stored) {
    try {
      milestones = JSON.parse(stored);
    } catch {
      milestones = [];
    }
  }

  if (!milestones.includes(milestoneId)) {
    milestones.push(milestoneId);
    localStorage.setItem(key, JSON.stringify(milestones));

    // Log to audit trail
    await logAudit('milestone_achieved', {
      plan_id: planId,
      milestone_id: milestoneId,
      timestamp: Date.now(),
    });
  }
}

/**
 * Get all achieved milestones for a plan
 */
export async function getAchievedMilestones(
  planId: string
): Promise<string[]> {
  const key = `synsync_milestones_${planId}`;
  const stored = localStorage.getItem(key);

  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Get next milestone for a plan
 */
export async function getNextMilestone(
  plan: ProtocolPlan,
  sessions: SessionRecord[]
): Promise<Milestone | null> {
  if (!plan.tracking?.milestones) {
    return null;
  }

  const achieved = await getAchievedMilestones(plan._id!);
  const now = Date.now();
  const startDate = plan.schedule.start_date
    ? new Date(plan.schedule.start_date)
    : new Date(plan._imported_at || now);

  const daysSinceStart = Math.floor(
    (now - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const completedCount = sessions.filter((s) => s.status === 'completed').length;

  // Find first unachieved milestone
  for (const milestone of plan.tracking.milestones) {
    if (achieved.includes(milestone.milestone_id)) {
      continue; // Already achieved
    }

    // Check if achievable
    if (milestone.day !== undefined && milestone.day <= daysSinceStart + 7) {
      return milestone; // Achievable in next 7 days
    }

    if (
      milestone.required_sessions !== undefined &&
      milestone.required_sessions <= completedCount + 10
    ) {
      return milestone; // Achievable in next 10 sessions
    }
  }

  return null;
}

/**
 * Calculate progress toward next milestone
 */
export async function getMilestoneProgress(
  plan: ProtocolPlan,
  sessions: SessionRecord[]
): Promise<{
  milestone: Milestone | null;
  progress: number; // 0-100
  remaining: string;
} | null> {
  const nextMilestone = await getNextMilestone(plan, sessions);

  if (!nextMilestone) {
    return null;
  }

  const now = Date.now();
  const startDate = plan.schedule.start_date
    ? new Date(plan.schedule.start_date)
    : new Date(plan._imported_at || now);

  const daysSinceStart = Math.floor(
    (now - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  let progress = 0;
  let remaining = '';

  if (nextMilestone.day !== undefined) {
    const daysRemaining = nextMilestone.day - daysSinceStart;
    progress = Math.round(
      ((nextMilestone.day - daysRemaining) / nextMilestone.day) * 100
    );
    remaining = `${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`;
  } else if (nextMilestone.required_sessions !== undefined) {
    const completedCount = sessions.filter(
      (s) => s.status === 'completed'
    ).length;
    const sessionsRemaining = nextMilestone.required_sessions - completedCount;
    progress = Math.round(
      (completedCount / nextMilestone.required_sessions) * 100
    );
    remaining = `${sessionsRemaining} session${
      sessionsRemaining === 1 ? '' : 's'
    }`;
  }

  return {
    milestone: nextMilestone,
    progress: Math.max(0, Math.min(100, progress)),
    remaining,
  };
}

/**
 * Clear milestone records (for testing or reset)
 */
export function clearMilestones(planId: string): void {
  const key = `synsync_milestones_${planId}`;
  localStorage.removeItem(key);
}
