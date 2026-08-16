/**
 * Condition Evaluator Service
 *
 * Evaluates conditional rules from protocol plans
 */

import type { ConditionalRule, MetricRecord } from '../types/plan';
import { getMetricHistory } from './PlanDatabase';

/**
 * Evaluate a conditional rule
 */
export async function evaluateCondition(
  rule: ConditionalRule,
  planId: string
): Promise<boolean> {
  const { condition } = rule;
  const metrics = await getMetricHistory(planId, condition.metric_id);

  if (metrics.length === 0) {
    return false;
  }

  // Get recent metrics based on duration requirement
  const durationDays = condition.duration_days || 1;
  const cutoffTime = Date.now() - durationDays * 24 * 60 * 60 * 1000;
  const recentMetrics = metrics.filter((m) => m.timestamp >= cutoffTime);

  if (recentMetrics.length === 0) {
    return false;
  }

  // Check if condition is met for all recent metrics
  return recentMetrics.every((metric) =>
    compareValues(metric.value, condition.operator, condition.value)
  );
}

/**
 * Compare two values using operator
 */
function compareValues(
  actual: any,
  operator: string,
  expected: any
): boolean {
  switch (operator) {
    case '>':
      return Number(actual) > Number(expected);
    case '<':
      return Number(actual) < Number(expected);
    case '>=':
      return Number(actual) >= Number(expected);
    case '<=':
      return Number(actual) <= Number(expected);
    case '==':
      return actual == expected;
    case '!=':
      return actual != expected;
    default:
      return false;
  }
}

/**
 * Evaluate all conditional rules for a plan
 */
export async function evaluateAllRules(
  rules: ConditionalRule[],
  planId: string
): Promise<ConditionalRule[]> {
  const triggered: ConditionalRule[] = [];

  for (const rule of rules) {
    const isMet = await evaluateCondition(rule, planId);
    if (isMet) {
      triggered.push(rule);
    }
  }

  // Sort by priority
  return triggered.sort((a, b) => {
    const priority = { high: 3, medium: 2, low: 1 };
    return priority[b.priority] - priority[a.priority];
  });
}
