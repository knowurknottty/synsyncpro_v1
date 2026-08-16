/**
 * Plan Day View Component
 *
 * Displays all sessions for a selected day with status and actions
 */

import React from 'react';
import { Clock, Play, CheckCircle2, XCircle, Circle, SkipForward } from 'lucide-react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import type { SessionRecord } from '../types/plan';
import { PROTOCOLS } from '../audio/constants';

interface PlanDayViewProps {
  date: Date;
  sessions: SessionRecord[];
  timezone: string;
  onStartSession: (session: SessionRecord) => void;
  onMarkComplete?: (session: SessionRecord) => void;
  onSkipSession?: (session: SessionRecord) => void;
}

export const PlanDayView: React.FC<PlanDayViewProps> = ({
  date,
  sessions,
  timezone,
  onStartSession,
  onMarkComplete,
  onSkipSession,
}) => {
  /**
   * Get status icon and color
   */
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          color: 'text-green-400',
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          label: 'Completed',
        };
      case 'missed':
        return {
          icon: XCircle,
          color: 'text-red-400',
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          label: 'Missed',
        };
      case 'skipped':
        return {
          icon: SkipForward,
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          label: 'Skipped',
        };
      default:
        return {
          icon: Circle,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          label: 'Pending',
        };
    }
  };

  /**
   * Check if session is within time window
   */
  const isWithinWindow = (session: SessionRecord): boolean => {
    const now = Date.now();
    const scheduledTime = session.scheduled_time;
    const diffMinutes = Math.abs(now - scheduledTime) / (1000 * 60);
    return diffMinutes <= 30; // Within 30 minute window
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">
          {format(date, 'EEEE, MMMM d, yyyy')}
        </h3>
        <p className="text-sm text-gray-400">
          {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
        </p>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-800/30 rounded-xl">
          <Clock className="w-12 h-12 text-gray-600 mb-3" />
          <p className="text-sm text-gray-400">No sessions scheduled for this day</p>
        </div>
      )}

      {sessions.length > 0 && (
        <div className="space-y-3">
          {sessions.map((session) => {
            const statusDisplay = getStatusDisplay(session.status);
            const StatusIcon = statusDisplay.icon;
            const sessionTime = toZonedTime(
              new Date(session.scheduled_time),
              timezone
            );
            const protocol = PROTOCOLS[session.protocol_id];
            const canStart =
              session.status === 'pending' && isWithinWindow(session);

            return (
              <div
                key={session.id}
                className={`
                  p-4 rounded-xl border transition-all
                  ${statusDisplay.bg} ${statusDisplay.border}
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  {/* Session Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-white">
                        {format(sessionTime, 'h:mm a')}
                      </span>
                    </div>

                    <h4 className="text-base font-semibold text-white mb-1">
                      {protocol?.title || session.protocol_id}
                    </h4>

                    {protocol?.usageGoal && (
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {protocol.usageGoal}
                      </p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div
                    className={`
                    flex items-center space-x-1.5 px-2.5 py-1 rounded-full border
                    ${statusDisplay.bg} ${statusDisplay.border}
                  `}
                  >
                    <StatusIcon className={`w-3.5 h-3.5 ${statusDisplay.color}`} />
                    <span className={`text-xs font-medium ${statusDisplay.color}`}>
                      {statusDisplay.label}
                    </span>
                  </div>
                </div>

                {/* Duration and Protocol Info */}
                {protocol && (
                  <div className="flex items-center space-x-4 text-xs text-gray-400 mb-3">
                    <span>{Math.round(protocol.duration / 60)} min</span>
                    <span>•</span>
                    <span>{protocol.category.replace(/_/g, ' ')}</span>
                    {protocol.evidenceLevel && (
                      <>
                        <span>•</span>
                        <span>Evidence: {protocol.evidenceLevel}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {session.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onStartSession(session)}
                        disabled={!canStart}
                        className={`
                          flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                          ${
                            canStart
                              ? 'bg-neuro-500 hover:bg-neuro-600 text-white'
                              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          }
                        `}
                      >
                        <Play className="w-4 h-4" />
                        <span>
                          {canStart ? 'Start Session' : 'Outside Time Window'}
                        </span>
                      </button>

                      {onSkipSession && (
                        <button
                          onClick={() => onSkipSession(session)}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
                        >
                          Skip
                        </button>
                      )}
                    </>
                  )}

                  {session.status === 'missed' && onMarkComplete && (
                    <button
                      onClick={() => onMarkComplete(session)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark as Complete</span>
                    </button>
                  )}

                  {session.status === 'completed' && session.actual_end_time && (
                    <div className="flex-1 text-xs text-gray-400">
                      Completed at{' '}
                      {format(
                        toZonedTime(new Date(session.actual_end_time), timezone),
                        'h:mm a'
                      )}
                    </div>
                  )}
                </div>

                {/* Session Notes */}
                {session.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-400">{session.notes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
