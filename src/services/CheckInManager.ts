/**
 * Check-In Manager Service
 *
 * Manages scheduled check-ins and notifications
 */

import type { ProtocolPlan, CheckIn, CheckInRecord } from '../types/plan';
import { saveCheckIn, getCheckInsByPlan } from './PlanDatabase';

/**
 * Check if a check-in is due
 */
export function isCheckInDue(
  plan: ProtocolPlan,
  checkIn: CheckIn
): boolean {
  if (!plan._imported_at && !plan.schedule.start_date) {
    return false;
  }

  const startDate = plan.schedule.start_date
    ? new Date(plan.schedule.start_date)
    : new Date(plan._imported_at!);

  const daysSinceStart = Math.floor(
    (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceStart >= checkIn.day;
}

/**
 * Get all due check-ins for a plan
 */
export async function getDueCheckIns(
  plan: ProtocolPlan
): Promise<CheckIn[]> {
  if (!plan.tracking?.check_ins) {
    return [];
  }

  const completed = await getCheckInsByPlan(plan._id!);
  const completedIds = new Set(completed.map((c) => c.check_in_id));

  return plan.tracking.check_ins.filter(
    (checkIn) =>
      !completedIds.has(checkIn.check_in_id) && isCheckInDue(plan, checkIn)
  );
}

/**
 * Get next check-in for a plan
 */
export async function getNextCheckIn(
  plan: ProtocolPlan
): Promise<CheckIn | null> {
  if (!plan.tracking?.check_ins) {
    return null;
  }

  const completed = await getCheckInsByPlan(plan._id!);
  const completedIds = new Set(completed.map((c) => c.check_in_id));

  const startDate = plan.schedule.start_date
    ? new Date(plan.schedule.start_date)
    : new Date(plan._imported_at!);

  const daysSinceStart = Math.floor(
    (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Find first uncompleted check-in
  for (const checkIn of plan.tracking.check_ins) {
    if (completedIds.has(checkIn.check_in_id)) {
      continue;
    }

    if (checkIn.day >= daysSinceStart) {
      return checkIn;
    }
  }

  return null;
}

/**
 * Submit check-in responses
 */
export async function submitCheckIn(
  planId: string,
  checkInId: string,
  responses: Record<string, any>
): Promise<void> {
  await saveCheckIn({
    plan_id: planId,
    check_in_id: checkInId,
    responses,
    completed_at: Date.now(),
  });
}

/**
 * Get check-in completion status
 */
export async function getCheckInStatus(
  plan: ProtocolPlan
): Promise<{
  total: number;
  completed: number;
  due: number;
  upcoming: number;
}> {
  if (!plan.tracking?.check_ins) {
    return { total: 0, completed: 0, due: 0, upcoming: 0 };
  }

  const completed = await getCheckInsByPlan(plan._id!);
  const completedIds = new Set(completed.map((c) => c.check_in_id));

  const startDate = plan.schedule.start_date
    ? new Date(plan.schedule.start_date)
    : new Date(plan._imported_at!);

  const daysSinceStart = Math.floor(
    (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  let due = 0;
  let upcoming = 0;

  for (const checkIn of plan.tracking.check_ins) {
    if (completedIds.has(checkIn.check_in_id)) {
      continue;
    }

    if (checkIn.day <= daysSinceStart) {
      due++;
    } else {
      upcoming++;
    }
  }

  return {
    total: plan.tracking.check_ins.length,
    completed: completed.length,
    due,
    upcoming,
  };
}
