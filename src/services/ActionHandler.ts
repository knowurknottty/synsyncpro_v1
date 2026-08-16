/**
 * Action Handler Service
 *
 * Executes actions based on conditional rules
 */

import type { ConditionalRule } from '../types/plan';

export type ActionCallback = (message: string, data?: any) => void;

interface ActionHandlers {
  onShowReminder?: ActionCallback;
  onShowWarning?: ActionCallback;
  onSuggestSession?: ActionCallback;
  onExtendPhase?: ActionCallback;
}

/**
 * Execute action for a triggered rule
 */
export function executeAction(
  rule: ConditionalRule,
  handlers: ActionHandlers
): void {
  const { action } = rule;

  switch (action.type) {
    case 'show_reminder':
      if (handlers.onShowReminder && action.message) {
        handlers.onShowReminder(action.message);
      }
      break;

    case 'show_warning':
      if (handlers.onShowWarning && action.message) {
        handlers.onShowWarning(action.message);
      }
      break;

    case 'suggest_extra_session':
      if (handlers.onSuggestSession && action.protocol_id) {
        handlers.onSuggestSession(
          action.message || 'Consider an extra session',
          { protocolId: action.protocol_id }
        );
      }
      break;

    case 'extend_phase':
      if (handlers.onExtendPhase && action.days_to_add) {
        handlers.onExtendPhase(
          action.message || 'Phase extended',
          { daysToAdd: action.days_to_add }
        );
      }
      break;
  }
}

/**
 * Execute all triggered rules
 */
export function executeActions(
  rules: ConditionalRule[],
  handlers: ActionHandlers
): void {
  for (const rule of rules) {
    executeAction(rule, handlers);
  }
}
